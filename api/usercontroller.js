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
/*router.use(bodyParser.json(), function (err, res, next) {

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
});*/

router.get('/search', function (req, res) {

    var inputStartDate;
    var inputEndDate;
    var inputCityID = "";
    var inputCategoryID = "";
    var district = req.query.district;
    var title = req.query.title;

    inputCityID = cat_cityid(district);
    inputCategoryID = cat_categoryid(title);

    if (req.query.start_month !== undefined || req.query.start_day !== undefined || req.query.end_month !==undefined || req.query.end_day) {
        inputStartDate = cat_start(req.query.start_month, req.query.start_day);
        inputEndDate = cat_end(req.query.end_month, req.query.end_day)


        connection.query("set @inputStartDate = \042" + inputStartDate + "\042\073set @inputEndDate = \042" + inputEndDate + "\042\073set @inputCityID = \042" + inputCityID + "\042;set @inputCategoryID = \042" + inputCategoryID + "\042\073set @inputIsFree = \042Y\042\073call main()\073selet @query\073", function (err, result) {
            //console.log(result[5]);
            //res.status(200).json(result[5]);
            res.render('../../views/search.ejs', {
                result: result[5]
            })
        })

    } else {
       
        connection.query("set @inputStartDate = NULL\073set @inputEndDate = NULL\073set @inputCityID = \042" + inputCityID + "\042;set @inputCategoryID = \042" + inputCategoryID + "\042\073set @inputIsFree = \042Y\042\073call main()\073selet @query\073", function (err, result) {
            console.log(result);
            //res.status(200).json(result[5]);
            res.render('../../views/search.ejs', {
                result: result[5]
            })
        })
    }

   

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




router.get('/info/search', function (req, res) {

    var inputStartDate;
    var inputEndDate;
    var inputCityID = "";
    var inputCategoryID = "";
    var district = req.query.district;
    var title = req.query.title;

    inputCityID = cat_cityid(district);
    inputCategoryID = cat_categoryid(title);

    if (req.query.start_month !== undefined || req.query.start_day !== undefined || req.query.end_month !==undefined || req.query.end_day) {
        inputStartDate = cat_start(req.query.start_month, req.query.start_day);
        inputEndDate = cat_end(req.query.end_month, req.query.end_day)


        connection.query("set @inputStartDate = \042" + inputStartDate + "\042\073set @inputEndDate = \042" + inputEndDate + "\042\073set @inputCityID = \042" + inputCityID + "\042;set @inputCategoryID = \042" + inputCategoryID + "\042\073set @inputIsFree = \042Y\042\073call main()\073selet @query\073", function (err, result) {
            //console.log(result[5]);
            //res.status(200).json(result[5]);
            res.render('../../views/search.ejs', {
                result: result[5]
            })
        })

    } else {
       
        connection.query("set @inputStartDate = NULL\073set @inputEndDate = NULLs\073set @inputCityID = \042" + inputCityID + "\042;set @inputCategoryID = \042" + inputCategoryID + "\042\073set @inputIsFree = \042Y\042\073call main()\073selet @query\073", function (err, result) {
            //console.log(result[5]);
            //res.status(200).json(result[5]);
            res.render('../../views/search.ejs', {
                result: result[5]
            })
        })
    }

   

})








function cat_cityid(district) {
    var inputCityID = "";
    if (district.includes("台北")) {
        inputCityID += "0,";
    }
    if (district.includes("新北")) {
        inputCityID += "1,";
    }
    if (district.includes("桃園")) {
        inputCityID += "2,";
    }
    if (district.includes("新竹")) {
        inputCityID += "3,";
    }
    if (district.includes("基隆")) {
        inputCityID += "4,";
    }
    if (district.includes("宜蘭")) {
        inputCityID += "5,";
    }
    if (district.includes("台中")) {
        inputCityID += "6,";
    }
    if (district.includes("彰化")) {
        inputCityID += "7,";
    }
    if (district.includes("苗栗")) {
        inputCityID += "8,";
    }
    if (district.includes("雲林")) {
        inputCityID += "9,";
    }
    if (district.includes("南投")) {
        inputCityID += "10,";
    }
    if (district.includes("嘉義")) {
        inputCityID += "11,";
    }
    if (district.includes("台南")) {
        inputCityID += "12,";
    }
    if (district.includes("高雄")) {
        inputCityID += "13,";
    }
    if (district.includes("屏東")) {
        inputCityID += "14,";
    }
    if (district.includes("花蓮")) {
        inputCityID += "15,";
    }
    if (district.includes("台東")) {
        inputCityID += "16,";
    }
    if (district.includes("澎湖")) {
        inputCityID += "17,";
    }
    if (district.includes("金門")) {
        inputCityID += "18,";
    }
    if (district.includes("馬祖")) {
        inputCityID += "19,";
    }
    if (district.includes("連江")) {
        inputCityID += "20,";
    }
    inputCityID = inputCityID.substr(0, inputCityID.length - 1);
    return inputCityID;
}

function cat_categoryid(title) {
    var inputCategoryID = "";
    for (var i = 0; i < title.length; i++) {
        inputCategoryID += parseInt(title[i], 10) + ",";
    }
    inputCategoryID = inputCategoryID.substr(0, inputCategoryID.length - 1);
    return inputCategoryID;
}

function cat_start(start_month, start_day) {
    var start_time = "2020-" + start_month.toString() + "-" + start_day.toString();
    return start_time;
}
function cat_end(end_month, end_day) {
    var end_time = "2020-" + end_month.toString() + "-" + end_day.toString();
    return end_time;
}

module.exports = router;
