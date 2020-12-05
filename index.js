var express = require('express');
var Promise = require("bluebird");
const { OPEN_READWRITE } = require('sqlite3');


const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./total_1G.db');
let dbOrig = new sqlite3.Database('./total_all.db')



const app = express();
const port = 4000;


app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);

app.use("/static", express.static('./static/'));


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
  //console.log("getting data for app names for options")
  let sql = "SELECT progName, COUNT(*) AS 'count' FROM More1GApp GROUP BY progName HAVING COUNT(*) > 80 ORDER BY COUNT(*) DESC;";
  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    rows.forEach((row) => {
      if (row.progName === 'cp.eba9534c022ba7e1e8e7c4bc0d60ea8eeab197b6_gnu_tg_libxc.x') row.optionName = 'cp.eba_libxc';
      else if (row.progName === 'cp.8d07d5422a2a994f120958502fbb3b771a6bf7b7_gnu.x') row.optionName = 'cp.8d07_gnu.x';
      else if (row.progName === 'cp.x_cpno_cpp_part-163-gbef2c14-constrained_dynamics-cbya.2017-11-14') row.optionName = 'cp.x_163';
      else if (row.progName === 'cp.x_no_cpp_part-153-g69a9a1c.flexible_ref_cell.2017-11-30') row.optionName = 'cp.x_153';
      else row.optionName = row.progName;
    });
    res.json(rows);
  });
});

app.get('/getMDS', async (req, res, next) => {
  //console.log("getting MDS information for selected jobID " + req.query.jobID)
  let sql = "SELECT startTime, endTime FROM More1GApp WHERE jobID == '"+req.query.jobID+"' GROUP BY jobID";

  db.all(sql, [], (err, rows) => {
    let st, et;
    // let stDate, etDate;
    if (err) { throw err; }
    rows.forEach((row) => {
      // console.log("startTime: "+row.startTime+" endTime: "+row.endTime);
      st = row.startTime;
      et = row.endTime;
      // stDate = new Date(st);
      // etDate = new Date(et);
    });

    // do another thing
    // sql = "SELECT mdsCPU95, mdsOPS95, startTime, endTime FROM More1GApp WHERE (startTime <= '" + st + "' AND endTime >= '" + et + "') OR (startTime >= '" + st + "' AND endTime <= '" + et + "') group by jobID;";
    sql = "SELECT mdsCPU95, mdsOPS95, startTime, endTime FROM total WHERE (startTime <= '" + st + "' AND endTime >= '" + et + "') OR (startTime >= '" + st + "' AND endTime <= '" + et + "') group by jobID;";
    // db.all(sql, [], (err, rows) => {
    dbOrig.all(sql, [], (err, rows) => {
        if (err) { throw err; }
      let result = [];
      rows.forEach((row) => {
        // console.log("mdsCPU: "+row.mdsCPU95+" mdsOPS: "+row.mdsOPS95);
        let newST = new Date(row.startTime);
        let newET = new Date(row.endTime);
        // console.log("start: "+ st + " Endtim: "+et)
        let md = new Date(newET - (newET-newST)/2);
        result.push({/*origST: stDate.getTime(), origET: etDate.getTime(),*/ time: md.getTime(), cpu: row.mdsCPU95, ops: row.mdsOPS95});
        //solve this time problem
        // console.log(result);
        result.sort(function(x, y){
          return x.time - y.time;
        });
      });
      res.json(result);
    });
  });
});

//hrchung
app.get('/getIntervalJobs', async (req, res, next) => {
  // TODO : change the range of filtering 
  let sql = 'SELECT progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist FROM More1GApp where startTime <= \
  (SELECT startTime FROM More1GApp where  progName == "' + req.query.progName+'" AND jobID=='+req.query.jobID +') \
  AND endTime >= (SELECT startTime FROM More1GApp where  progName == "' + req.query.progName+'" AND jobID=='+req.query.jobID+')';

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    //console.log("[getIntervalJobs] "+rows.length)
    res.json(rows);
  });
});

//hrchung 
app.get('/getJobInfo', async (req, res, next) => {
  // TODO : change the range of filtering 
  let sql = 'SELECT writeBytesPOSIX, writeBytesMPIIO, writeBytesSTDIO, writeTimePOSIX, writeTimeMPIIO, writeTimeSTDIO, writeRatePOSIX, writeRateMPIIO, writeRateSTDIO FROM More1GApp where jobID=='+req.query.jobID;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    //console.log("[getJobInfo] "+rows)
    res.json(rows);
  });
});

app.get('/getAppInfo', async (req, res, next) => {
  console.log("going to get app info of "+req.query.progName);
  let sql = 'SELECT progName, jobID, startTime, endTime, runTime, numOST, numProc, totalFile, totalWriteReq FROM More1GApp where progName == "'+req.query.progName+'" group by jobID';
  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    rows.forEach((row) => {
      row.startTime = changeYear(row.startTime);
      row.endTime = changeYear(row.endTime);

      if (row.progName === 'cp.eba9534c022ba7e1e8e7c4bc0d60ea8eeab197b6_gnu_tg_libxc.x') row.optionName = 'cp.eba_libxc';
      else if (row.progName === 'cp.8d07d5422a2a994f120958502fbb3b771a6bf7b7_gnu.x') row.optionName = 'cp.8d07_gnu.x';
      else if (row.progName === 'cp.x_cpno_cpp_part-163-gbef2c14-constrained_dynamics-cbya.2017-11-14') row.optionName = 'cp.x_163';
      else if (row.progName === 'cp.x_no_cpp_part-153-g69a9a1c.flexible_ref_cell.2017-11-30') row.optionName = 'cp.x_153';
      else row.optionName = row.progName;
    });
    res.json(rows);
  });
});

app.get('/getOST', async (req, res, next) => {
  // TODO : change the range of filtering 
  let sql = 'SELECT progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist FROM More1GApp where \
  (startTime <= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID +') \
  AND endTime >= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID+')) \
  OR (startTime >= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID +') \
  AND endTime <= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID+')) group by jobID';

  // let sql = 'SELECT progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist FROM More1GApp where startTime <= \
  // (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID +') \
  // AND endTime >= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID+')';


  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    res.json(rows);
  });
});

app.get('/getHT', async (req, res, next) => {
  // TODO : change the range of filtering 
  let sql = 'SELECT progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist FROM More1GApp where \
  (startTime <= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID +') \
  AND endTime >= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID+')) \
  OR (startTime >= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID +') \
  AND endTime <= (SELECT startTime FROM More1GApp where jobID=='+req.query.jobID+')) group by jobID';

  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    res.json(rows);
  });
});

function changeYear(st) {
  st = String(st);
  let st1, st2, newChar1, newChar2, newst;

  if (st.charCodeAt(3) <= 55) {
    newChar1 = String.fromCharCode(57);
    st1 = st.substring(0,3);
    st2 = st.substring(4);
    newst = st1 + newChar1 + st2;
  } else if (st.charCodeAt(3) >= 56) {
    newChar1 = String.fromCharCode(st.charCodeAt(2)+1);
    newChar2 = String.fromCharCode(48);
    st1 = st.substring(0,2);
    st2 = st.substring(4);
    newst = st1 + newChar1 + newChar2 + st2;
  }

  return newst;
}
