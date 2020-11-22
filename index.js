var express = require('express');
var Promise = require("bluebird");
// var sqlite = require('sqlite');
// import { open } from 'sqlite'
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./total_1G.db');



const app = express();
const port = 4000;
// const dbPromise = sqlite.open('/total_1G.db', { Promise });
// async function openDB () {
//   return sqlite.open({
//     filename: '/total_1G.db',
//     driver: sqlite.Database
//   })
// }

// const db = openDB();


app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);


app.get('/', (req, res, next) => {
  res.render('index.html');
});

app.listen(port, () => {
  console.log("listening on port " + port);
});

// let sql = 'SELECT progName, startTime FROM More1GApp where progName == "progcorhbov.e" group by jobID';
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   rows.forEach((row) => {
//     console.log(row.name);
//   });
// });

// app.get('/getData', async (req, res, next) => {
//   console.log("get data backend");
//   try {
//     const db = await openDB();
//     const appinfo = await db.all('SELECT progName, startTime FROM More1GApp where progName == "progcorhbov.e" group by jobID');
//     console.log(JSON.stringify(appinfo))
//     res.json(appinfo)
//   } catch (err) {
//     next(err);
//   }
// });

app.get('/getData', async (req, res, next) => {
  let sql = 'SELECT progName, numOST, writeRateTotal, writeBytesTotal FROM More1GApp where progName == "pw.x" AND numOST < 20 group by jobID';
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