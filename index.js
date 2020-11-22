var express = require('express');
var Promise = require("bluebird");
const { OPEN_READWRITE } = require('sqlite3');


const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./total_1G.db');



const app = express();
const port = 4000;


app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);


app.get('/', (req, res, next) => {
  res.render('index.html');
});

app.listen(port, () => {
  console.log("listening on port " + port);
});

app.get('/getData', async (req, res, next) => {
  let sql = 'SELECT progName, numOST, writeRateTotal, writeBytesTotal FROM More1GApp where progName == "'+req.query.progName+'" AND numOST < 20 group by jobID';
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row.progName);
    });
    console.log(rows.length)
    console.log(req.query)
    res.json(rows);
  });
});

app.get('/appendOptions', async (req, res, next) => {
  let sql = "SELECT progName, COUNT(*) AS 'num' FROM More1GApp GROUP BY progName HAVING COUNT(*) > 80 ORDER BY COUNT(*) DESC;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row.progName);
    });
    console.log(rows.length)
    res.json(rows);
  });
});

// hrchung 
app.get('/getIntervalJobs', async (req, res, next) => {
  //let sql = 'SELECT startTime, endTime FROM More1GApp where progName == "' + req.query.progName+'" AND jobID=='+req.query.jobID;
  let sql = 'SELECT progName, jobID, startTime, endTime, ossWriteMean, numOST, ostlist FROM More1GApp where startTime <= \
  (SELECT startTime FROM More1GApp where  progName == "' + req.query.progName+'" AND jobID=='+req.query.jobID +') \
  AND endTime >= (SELECT startTime FROM More1GApp where  progName == "' + req.query.progName+'" AND jobID=='+req.query.jobID+')';

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    /*
    rows.forEach((row) => {
      console.log(row);
    });
    */
    console.log("[getIntervalJobs] "+rows.length)
    res.json(rows);
  });
});

