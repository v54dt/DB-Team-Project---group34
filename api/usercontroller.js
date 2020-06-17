const express = require('express');
const router = express.Router();
const config = require('./config');
const bodyParser = require('body-parser');
const async = require('async');

const domain = require('domain');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: 'utf8mb4',
    multipleStatements: true
});

connection.connect();


//router.use(bodyParser.json());
router.use(bodyParser.json(), function (err, res, next) {

    var reqDomain = domain.create();
    reqDomain.on('error', function () {
        try {
            var killTimer = setTimeout(function () {
                process.exit(1);
            }, 30000);
            killTimer.unref();
            res.sendStatus(500);
        } catch (e) {
            console.log('error when exit', e.stack);
        }
    });
    reqDomain.run(next);
});

process.on('uncaughtException', function (err) {
    console.log(err);
    try {
        var killTimer = setTimeout(function () {
            process.exit(1);
        }, 30000);
        killTimer.unref();
    } catch (e) {
        console.log('error when exit', e.stack);
    }
});

router.get('/search', function (req, res) {

    var temp_artshow = "create temporary table temp_artshow( t_UID char(24));";
    var temp_showInfo = "create temporary table temp_showInfo(t_UID char(24));";

    connection.query(temp_artshow + temp_showInfo, function (err, res, fields) {
        if (err) throw err;

    })

    const title = req.query.title;
    const district = req.query.district;



    if (title !== undefined) {
        var sql = "insert into temp_artshow(`t_UID`) select `UID` from artshow where category like?";

        for (var i = 1; i < title.length; i++) {
            sql = sql + " or category like?";
        }

        var sql = mysql.format(sql, title);
        connection.query(sql, function (err, res, fields) {
            if (err) throw err;
        })
    }

    //district
    if (district !== undefined) {
        var sql2 = "insert into temp_showInfo(`t_UID`) select `artshowUID` from showInfo where location like?";

        for (var i = 1; i < district.length; i++) {
            sql2 = sql2 + " or location like?";
        }

        var district_copy = [];
        for (var i = 0; i < district.length; i++) {
            district_copy.push(district[i] + "%");
        }

        var sql2 = mysql.format(sql2, district_copy);
        connection.query(sql2, function (err, res, fields) {
            if (err) throw err;
        })
    }
    var sql = ""
    var sql_final = "select aa.UID,aa.title,aa.startDate,aa.endDate,aa.descriptionFilterHtml from(select a.t_UID from temp_artshow a,temp_showInfo t where a.t_UID = t.t_UID) as tmp,artshow aa where aa.UID = tmp.t_UID limit 50;";
    connection.query(sql_final, function (err, result, fields) {
        if (err) throw err;
        //res.status(200).json(result);
        res.render('../../views/search.ejs', {
            result: result
        })
    })
    connection.query("drop table temp_artshow;drop table temp_showInfo", function (err, res, fields) {
        if (err) throw err;
    })
    /*
    connection.query(`${sql} limit 2;`, function (err, result, fields) {
    })
    */
})
router.get('/info/:uid', function (req, res) {

    var result = {
        title: "",
        location: "",
        locationName: "",
        category: "",
        showInfo: [],
        showUnit: "",
        descriptionFilterHtml: "",
        discountInfo: "",
        price: "",
        onSales: "",
        masterUnit: [],
        imageUrl: "",
        webSales: "",
        comment: "",
        sourceWebName: "",
        startDate: "",
        endDate: "",
    };

    async.parallel([
        function (finish) {

            var sql = "select * from artshow where `UID` like ?;";
            connection.query(sql, req.params.uid, function (error, res_p1) {
                //console.log(res_p1);
                result.title = res_p1[0].title;
                result.category = res_p1[0].category;
                result.showUnit = res_p1[0].showUnit;
                result.descriptionFilterHtml = res_p1[0].descriptionFilterHtml;
                result.onSales = res_p1[0].onSales;
                result.masterUnit = res_p1[0].masterUnit;
                result.imageUrl = res_p1[0].imageUrl;
                result.webSales = res_p1[0].webSales;
                result.comment = res_p1[0].comment;
                result.sourceWebName = res_p1[0].sourceWebName;
                result.startDate = res_p1[0].startDate;
                result.endDate = res_p1[0].endDate;

                finish(error);

            })
        },
        function (finish) {

            var sql_showInfo = "select * from showInfo where `artshowUID` like ?;";
            connection.query(sql_showInfo, req.params.uid, function (error, res_p2) {


                for (var i = 0; i < res_p2.length; i++) {
                    result.showInfo.push({
                        time: res_p2[i].time,
                        location: res_p2[i].location,
                        locationName: res_p2[i].locationName,
                        onSales: res_p2[i].onSales,
                        latitude: res_p2[i].latitude,
                        longtitude: res_p2[i].longtitude,
                        endTime: res_p2[i].endTime
                    })
                }
                finish(error);
            })

        },
    ], function (errs, res_ps) {
        if (errs) throw errs;

        //res.status(200).json(result);
        res.render('../../views/info.ejs', {
            result: result
        })
    })

})
router.get('/recommend', function (req, res) {

    var result = {
        title: "",
        category: "",
        imageUrl: "",
        location: "",
        locationName: "",
        price: "",
        onSales: "",
        masterUnit: "",
        discriptionFilter: "",
        sourceWebName: "",
        comment: ""
    };

    var total_uids, random_number;

    async.waterfall([
        function (next) {
            var sql = "select count(*) as cnt from showInfo";
            connection.query(sql, function (error, res1) {
                total_uids = parseInt(res1[0].cnt, 10);
                random_number = Math.floor(Math.random() * total_uids);

                next(error, random_number);
            })
        },
        function (random_number, next) {
            var sql2 = "select a.UID,a.title,a.imageUrl,tmp.location,tmp.locationName,tmp.price,tmp.onSales,a.masterUnit,a.descriptionFilterHtml,a.sourceWebName,a.comment from artshow a, (select artshowUID,location,locationName,price,onSales from showInfo limit 1 offset " + random_number.toString(10) + ") as tmp  where tmp.artshowUID = a.UID;"
            connection.query(sql2, function (error, res2) {

                result.title = res2[0].title;
                result.category = res2[0].category;
                result.imageUrl = res2[0].imageUrl;
                result.location = res2[0].location;
                result.locationName = res2[0].locationName;
                result.price = res2[0].price;
                result.onSales = res2[0].onSales;
                result.masterUnit = res2[0].masterUnit;
                result.discriptionFilter = res2[0].discriptionFilter;
                result.sourceWebName = res2[0].sourceWebName;
                result.comment = res2[0].comment;
                next(error, res2);

            })

        },
    ], function (errs, res_ps) {
        if (errs) throw errs;

        //res.status(200).json(result);
        res.render('../../views/recommend.ejs', {
            result: result
        })
    })

})
router.get('/summary', function (req, res) {

    var result = {
        sum: 0,
        location:
        {
            taipei: 0,
            new_taipei: 0,
            taoyuan: 0,
            hsinchu: 0,
            keelung: 0,
            yilan: 0,
            taichung: 0,
            changhua: 0,
            miaoli: 0,
            yunlin: 0,
            nantou: 0,
            kaohsiung: 0,
            tainan: 0,
            chiayi: 0,
            pingtung: 0,
            hualien: 0,
            taitung: 0,
            kinmen: 0,
            penghu: 0,
            lienchiang: 0
        },
        category: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "11": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "17": 0
        },
        "OnSale_Y": 0,   //1987
        "OnSale_N": 0,   //6089  // OnSales : UNKOWN does not included !!
        "postponed": 0,    //44
        "cancelled": 0,   //59
    }
    /*
        1 : 音樂表演資訊
        2 : 戲劇表演資訊
        3 : 舞導表演資訊
        4 : 親子活動
        5 : 獨立音樂
        6 : 展覽資訊
        7 : 講座資訊
        8 : 電影
        11 : 綜藝活動
        13 : 競賽活動
        14 : 徵選活動
        15 : 其他藝文資訊
        17 : 演唱會
    */
    async.parallel([
        function (finish) {
            var sql = "select count(*) as cnt from showInfo";
            connection.query(sql, function (err1, res1) {
                result.sum = parseInt(res1[0].cnt, 10);

                finish(err1, res1);
            })
        },
        function (finish) {
            var sql2 = "select * from summary";
            connection.query(sql2, function (err2, res2) {
                result.location = res2[0];
                finish(err2, res2);
            })
        },
        function (finish) {
            var sql3 = "select * from category_count";
            connection.query(sql3, function (err3, res3) {
                result.category["1"] = res3[0]['音樂表演'];
                result.category["2"] = res3[0]["戲劇表演"];
                result.category["3"] = res3[0]["舞導表演"];
                result.category["4"] = res3[0]["親子活動"];
                result.category["5"] = res3[0]["獨立音樂"];
                result.category["6"] = res3[0]["展覽資訊"];
                result.category["7"] = res3[0]["講座資訊"];
                result.category["8"] = res3[0]["電影"];
                result.category["11"] = res3[0]["綜藝活動"];
                result.category["13"] = res3[0]["競賽活動"];
                result.category["14"] = res3[0]["徵選活動"];
                result.category["15"] = res3[0]["其他藝文資訊"];
                result.category["17"] = res3[0]["演唱會"];
                finish(err3, res3);
            })
        },
        function (finish) {
            var sql4 = "select * from OnSale_info";
            connection.query(sql4, function (err4, res4) {
                //console.log(res4);
                result.OnSale_Y = res4[0].OnSale_Y;
                result.OnSale_N = res4[0].OnSale_N;

                finish(err4, res4);
            })
        },
        function (finish) {
            var sql5 = "select * from postponed_cancelled_info";
            connection.query(sql5, function (err5, res5) {

                result.postponed = res5[0].postponed;
                result.cancelled = res5[0].cancelled;
                finish(err5, res5);
            })
        }

    ], function (errs, results) {
        //res.status(200).json(result);
        res.render('../../views/summary.ejs', {
            result: result
        })
    });

    /**/
})




module.exports = router;
