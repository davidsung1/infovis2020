var express = require('express');
var Promise = require("bluebird");


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