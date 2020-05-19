const express = require('express');
const router = express.Router();
const config = require('./config');
const bodyParser = require('body-parser');
const async = require('async');

const domain = require('domain');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_project',
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
            res.send(500);
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

    var sql_final = "select aa.title,aa.startDate,aa.endDate,aa.descriptionFilterHtml from(select a.t_UID from temp_artshow a,temp_showInfo t where a.t_UID = t.t_UID) as tmp,artshow aa where aa.UID = tmp.t_UID limit 50;";
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


module.exports = router;
