const express = require('express');
const router = express.Router();
const config = require('./config');
const bodyParser = require('body-parser');
const async = require('async');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '35.170.90.76',
    user: 'root',
    password: '',
    database: 'db_project',
    charset: 'utf8mb4',
    multipleStatements: true
});

connection.connect();



router.use(bodyParser.json());



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

    var return_json = {
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
            connection.query(sql, req.params.uid, function (error, result) {
                //console.log(result);
                return_json.title = result[0].title;
                return_json.category = result[0].category;
                return_json.showUnit = result[0].showUnit;
                return_json.descriptionFilterHtml = result[0].descriptionFilterHtml;
                return_json.onSales = result[0].onSales;
                return_json.masterUnit = result[0].masterUnit;
                return_json.imageUrl = result[0].imageUrl;
                return_json.webSales = result[0].webSales;
                return_json.comment = result[0].comment;
                return_json.sourceWebName = result[0].sourceWebName;
                return_json.startDate = result[0].startDate;
                return_json.endDate = result[0].endDate;

                finish(error);

            })
        },
        function (finish) {

            var sql_showInfo = "select * from showInfo where `artshowUID` like ?;";
            connection.query(sql_showInfo, req.params.uid, function (error, result) {


                for (var i = 0; i < result.length; i++) {
                    return_json.showInfo.push({
                        time: result[i].time,
                        location: result[i].location,
                        locationName: result[i].locationName,
                        onSales: result[i].onSales,
                        latitude: result[i].latitude,
                        longtitude: result[i].longtitude,
                        endTime: result[i].endTime
                    })
                }
                finish(error);
            })

        },
    ], function (errs, results) {
        if (errs) throw errs;

        //res.status(200).json(return_json);
        res.render('../../views/info.ejc',{
            result: return_json
        })
    })

})

/*
info page

title 
location
locationName
category
showUnit
descriptionFilter
discountinfo
price
onSales
imageUrl
masterUnit :[]
webSales
comment
sourceWebName
startDate
endDate
starttime : ["2020/09/26 19:30:00","2020/09/26 19:30:00","2020/05/17 09:30:00"]
endtime : ["2020/09/26 21:30:00","2020/09/26 21:30:00","2020/09/26 21:30:00"]

*/




/*rows.forEach( (row) => {
  console.log(`${row.name} lives in ${row.city}`);
});*/

module.exports = router;

/*
select *
    from artshow, showInfo
where locat
*/

/*
大綱
title
category
折扣
price
Starttime
endtime
descriptionHTML
location
locationName
*/



