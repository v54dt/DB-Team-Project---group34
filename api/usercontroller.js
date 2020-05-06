const express = require('express');
const router = express.Router();
const config = require('./config');
const bodyParser = require('body-parser');

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

    var sql_final = "select * from(select a.t_UID from temp_artshow a,temp_showInfo t where a.t_UID = t.t_UID) as tmp,artshow aa where aa.UID = tmp.t_UID limit 10;";
    connection.query(sql_final,function(err,result,fields){
        if(err)throw err;
        res.status(200).json(result);
    })




    /*
    var sql_final = "select * from temp_showInfo limit 10;";
    connection.query(sql_final, function (err, result, fields) {
        if (err) throw err;
        console.log(result);

        res.status(200).json(result);

    })*/

    connection.query("drop table temp_artshow;drop table temp_showInfo", function (err, res, fields) {
        if (err) throw err;
    })


    /*connection.query(`${sql} limit 2;`, function (err, result, fields) {
       
        
        res.status(200).json(result);
    })

    /*var sql = "select * from showInfo where location like  ? limit 2";
    connection.query(sql, [t + '%'], function (error, result) {
        console.log(result);
        res.status(200).json(result);
    })
*/
    //console.log(req);
    //console.log(req.query.category)


})


/*rows.forEach( (row) => {
  console.log(`${row.name} lives in ${row.city}`);
});*/

module.exports = router;

/*
select *
    from artshow, showInfo
where locat
*/