
$(function() { //functions to be called on load of html
  appendOptions();

  d3.select('#select1').on('change', function (event, k) { // ...
    // console.log("call select update")
    let progName = $("#select1 option:checked").val();
    // console.log(progName);
    getAppInfo(progName);

  });

});


function appendOptions() {
  //console.log("going to append option to select1");
  $.getJSON("/appendOptions", function(json) {
    json.forEach((row) => {
      d3.select("#select1")
        .append("option")
        .property('value', row.progName)
        .attr('class', 'appOption')
        .attr('id', row.progName)
        .text(row.optionName);
    });
  });
}

function getData() {
    //console.log("going to be db data")
    let progName = {progName: "pw.x"}
  $.getJSON("/getData", progName, function (json) {
      //console.log("hi");
      //console.log(json);
  });
}


function getMDSData(jid) {
  //console.log("going to be MDS data")
  let jobID = {jobID: jid}
  $.getJSON("/getMDS", jobID, function (data) {
      // console.log(data);
      let mdsLines = ["OPS", "CPU"];
      let mdsInfo = ["MDS # of Operations", "MDS CPU Usage"];

      MDSxAxis = d3.scaleTime().domain([d3.min(data, d => d.time), d3.max(data, d => d.time)])
          .range([70, 1120]); //1050 width
      //ops
      MDSyAxisL = d3.scaleLinear().domain([d3.min(data, d => d.ops), d3.max(data, d => d.ops)])
          .range([250, 10]);
      //cpu
      MDSyAxisR = d3.scaleLinear().domain([0, 100])
          .range([250, 10]);

      //line function
      lineOPS = d3.line().x(d => MDSxAxis(d.time)).y(d => MDSyAxisL(d.ops));
      lineCPU = d3.line().x(d => MDSxAxis(d.time)).y(d => MDSyAxisR(d.cpu));

      //append x axis to svg
      MDSxAxisVar
        .attr('transform', `translate(0, 250)`)
        .call(d3.axisBottom(MDSxAxis));

      MDSyAxisLVar
        .attr('transform', `translate(70, 0)`)
        .call(d3.axisLeft(MDSyAxisL));

      MDSyAxisRVar
        .attr('transform', `translate(1110, 0)`)
        .call(d3.axisRight(MDSyAxisR));

      MDSlines = MDSsvg
                  .selectAll('path.line')
                  .data(mdsLines, d => d)
                  .join('path')
                    .attr('class', d => d)
                    .classed('line', true)
                    .attr('d', function (d, i) { 
                      if (d === "OPS") return lineOPS(data);
                      else if (d === "CPU") return lineCPU(data);
                    })
                    .attr('fill', 'none')
                    .attr('stroke', function(d) {
                      if (d === "OPS") return 'green';
                      else if (d === "CPU") return 'blue';
                    })
                    .attr('stroke-width', 1);

      // MDSsvg.append("line")
      //   .attr("x1", MDSxAxis(data[0].origST))  //<<== change your code here
      //   .attr("y1", 10)
      //   .attr("x2", MDSxAxis(data[0].origST))  //<<== and here
      //   .attr("y2", 250)
      //   .style("stroke-width", 1)
      //   .style("stroke-dasharray", 4)
      //   .style("stroke", "red")
      //   .style("fill", "none");

      // MDSsvg.append("line")
      //   .attr("x1", MDSxAxis(data[0].origET))  //<<== change your code here
      //   .attr("y1", 10)
      //   .attr("x2", MDSxAxis(data[0].origET))  //<<== and here
      //   .attr("y2", 250)
      //   .style("stroke-width", 1)
      //   .style("stroke", "red")
      //   .style("fill", "none");

      legendEnter = MDSsvg.select("#MDSLegend")
        .selectAll("text")
        .data(mdsInfo)
        .join("text")
          .attr("y", function(d, i) { return (i*20) + 15; })
          .attr("x", 13)
          .attr("font-size", '9px')
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .text(d => d);

      legendEnter = MDSsvg.select("#MDSLegend")
        .selectAll("circle")
        .data(mdsInfo)
        .join("circle")
          .attr("cx", 8)
          .attr("cy", function(d,i){ return (i*20) + 15; })
          .attr("r", 3)
          .style("fill", function(d, i){ 
            if(i == 0) return 'green';
            else if (i == 1) return 'blue';
          });

      MDSYaxisLTitle = MDSsvg.select("#MDSYaxisLTitle")
                        .append('text')
                        .attr("text-anchor", "end")
                        .attr("transform", "rotate(-90)")
                        .attr("font-size", '10px')
                        .attr("y", 10)
                        .attr("x", -50)
                        .text("# of MDS Operations (Per Second)");

      MDSYaxisRTitle = MDSsvg.select("#MDSYaxisLTitle")
                        .append('text')
                        .attr("text-anchor", "end")
                        .attr("transform", "rotate(-90)")
                        .attr("font-size", '10px')
                        .attr("y", 1160)
                        .attr("x", -100)
                        .text("CPU Usage (%)");

  }); //end of getJSON
}

function getAppInfo(progName) {
  let pn = {progName: progName}
  $.getJSON("/getAppInfo", pn, function (json) {
    let data = json;

    appTable = d3.select("#appInfoTable");
    appTable.selectAll('tr.appInfoContent')
          .data(data, d => d.jobID)
          .join('tr')
            .classed("appInfoContent", true)
            .attr('id', d => d.jobID)
            .each(function(d, i) { 
              d3.select(this).append("td").text(d => d.optionName);
              d3.select(this).append("td").text(d => d.jobID);
              d3.select(this).append("td").text(d => d.startTime);
              d3.select(this).append("td").text(d => d.endTime);
              d3.select(this).append("td").text(d => d.runTime);
              d3.select(this).append("td").text(d => d.numOST+1);
              d3.select(this).append("td").text(d => d.numProc);
              d3.select(this).append("td").text(d => d.totalFile);
              d3.select(this).append("td").text(d => d.totalWriteReq);
            });
    
    //console.log("app info appending for "+progName+" is done");

    $("tr.appInfoContent").click(function () {
      let jid = $(this).attr('id');

     // console.log("app info clicked "+$(this).attr('id'));

      d3.selectAll('tr.appInfoContent').classed('tableClicked', false);
      d3.select(this).node().classList.add("tableClicked")

      let TDs = $(this).children();
      appInfo = {progName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent};
      // appInfoArr.push({progName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent});
      
      //put info into history modal
      appendHistory(appInfo);
      //show mds graph for the app instance
      getMDSData(jid);
      //show ost graph for the app instance
      getIntervalJobs(jid);

      getJobUsage(jid);

      //try
      // makeHeatmap();
    });
   
  });
}

function appendHistory(data) {
  //console.log("entering append history");

  historyTable = d3.select("#historyTable");
  historyTable = historyTable.append('tr').attr("class", "historyContent");

  historyTable.append("td").html('<button type="button" class="close" id="closeButton'+data.jobID+'" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
  historyTable.append("td").text(data.progName);
  historyTable.append("td").text(data.jobID);
  historyTable.append("td").text(data.startTime);
  historyTable.append("td").text(data.endTime);

  $("#clearHistory").click(function () {
    d3.selectAll('tr.historyContent').remove();
  });

  $("#closeButton"+data.jobID).click(function () {
    d3.select(this.parentNode.parentNode).remove();
  });

}

function getIntervalJobs(jobID) {
  let q_input = {jobID : jobID}
  $.getJSON("/getOST", q_input, function (json) {
    var intervalJobs = json;
    //progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist
    var totalOST = {};
    var lists;
    intervalJobs.map(row => {if(row['jobID']==q_input.jobID) { lists = row['ostlist'].split(" "); lists.map(ost => totalOST[ost] = {})} });
    //console.log(lists);
    intervalJobs = intervalJobs.filter(item => item['numOST'] > 1);
    intervalJobs.map(row => {var lists = row['ostlist'].split(" ");  lists.map(ost => { if (ost in totalOST) totalOST[ost][row['jobID']] = [row['writeBytesTotal']/row['numOST'], -1]; })  });
    //barChart.totalOST = Object.getOwnPropertyNames(totalOST).map(function(e) { totalOST[e]['sum'] = Object.values(totalOST[e]).reduce((a, b) => a + b, 0); totalOST[e]['ostID']=e; return totalOST[e]});
    // TODO : sort and select head (50);
    barChart.totalOST = Object.getOwnPropertyNames(totalOST).map(function(e) { totalOST[e]['sum'] = Object.keys(totalOST[e]).reduce( (sum,key) => { var curr_sum = sum+totalOST[e][key][0]; totalOST[e][key][1]=curr_sum; return curr_sum},0); totalOST[e]['ostID']=e;  return totalOST[e]});
    //console.log(barChart.totalOST);

    var displayOST = 10;
    // barChart.totalOST = barChart.totalOST.sort(function(a, b) { return b['sum'] - a['sum'];}).slice(0, displayOST);
    barChart.totalOST = barChart.totalOST.sort(function(a, b) { return b['sum'] - a['sum'];});

    // barChart.initialize();
    barCreate(jobID, lists.length);
 });
};

function barCreate(origJobID, lenOSTList) {
  // console.log()
  barChart.width = lenOSTList * 95;
  barChart.svg.attr('width', barChart.width + 100);

  barChart.ostList = Object.values(barChart.totalOST).map(d=>d['ostID']);
  // console.log(barChart.ostlist);
  barChart.xScale = d3.scaleBand().domain(barChart.ostList).range([50, barChart.width+50]).padding(0.05);
  barChart.yMAX = d3.max(barChart.totalOST.map(d => {return d.sum}));
  barChart.yScale = d3.scaleLinear().domain([0, barChart.yMAX]).range([barChart.height,10]);    

  barChart.xaxis.attr('transform', "translate(0, "+ barChart.height +")").call(d3.axisBottom(barChart.xScale));
  barChart.yaxis.attr('transform', "translate(50, 0)").call(d3.axisLeft(barChart.yScale));
  barChart.rects = barChart.plot.selectAll('g').data(barChart.totalOST, d=>d['ostID']).join('g')
        .attr("class", d=>d['team'])
        .each(function(d, i) { 
            d3.select(this).selectAll('rect').data(k => { var keys = Object.keys(k); return keys.map(eachKey => [eachKey, k[eachKey]])} , tuple => tuple[1])
            .join('rect')
              .attr('fill', (sub_d, sub_i) => "rgb("+Math.floor(Math.random()*256)+"," +Math.floor(Math.random()*256)+","+ Math.floor(Math.random()*256)+")")
              .attr("width", barChart.xScale.bandwidth()-40)
              .attr("height", (sub_d, sub_i) =>{ if(sub_d[0]!='ostID' && sub_d[0] !='sum') { return barChart.height - barChart.yScale(sub_d[1][0]);} else 0;})
              .attr("x", margin.left+barChart.xScale(d.ostID))
              .attr("y", (sub_d, sub_i) => {if(sub_d[0]!='ostID' && sub_d[0] !='sum') return barChart.yScale(sub_d[1][1])})
              .attr("class", sub_d=>d.ostID)
              //.attr("text", sub_d => {if(sub_d[0]!='ostID' && sub_d[0] !='sum') return sub_d[0]+"/"+sub_d[1]})
              //.on('mouseover', (event, sub_d) => highlight(d.ostID))
              //.on('mouseout', (event, sub_d) => unhighlight(d.ostID))
        });  
}

//hrchung

function radarInit(data) {
//initialize 
  radar.radicalScale = d3.scaleLinear().domain([0, 100]).range([0, 180]);
  ticks=[];
  data.map(item=>Object.values(item).map(t=> ticks.push(t)));
  TICK_MAX = Math.ceil(Math.max(...ticks));
  EDGE = TICK_MAX +20;
  radar.ticks = [];
  for(i=0; i<EDGE; i+=20) radar.ticks.push(i);
  radar.ticks.push(EDGE);
  radar.line = d3.line().x(d => d.x).y(d => d.y);
  //  radar.colors = ["darkorange", "gray", "navy"];
  radar.colors = ["red", "green", "navy"];
  radar.features = Object.keys(data[1]);

  radar.svg.selectAll('*').remove();
  radar.ticks.forEach(t =>
    radar.svg.append("circle")
    .attr("cx", 180)
    .attr("cy", 180)
    .attr("fill", "none")
    .attr("stroke", "lightgray")
    .attr("r", radar.radicalScale(t))
    );

  radar.ticks.forEach(t =>
    radar.svg.append("text")
      .attr("x", 200)
      .attr("y", 180 - radar.radicalScale(t))
      .style("font-size","10px")
      .text(t.toString())
  );
// initailize path
  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radar.radicalScale(value);
    let y = Math.sin(angle) * radar.radicalScale(value);
    return {"x": 180 + x, "y": 180 - y};
  }

  for (var i = 0; i < radar.features.length; i++) {
    let ft_name = radar.features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / radar.features.length);
    let line_coordinate = angleToCoordinate(angle, EDGE);
    let label_coordinate = angleToCoordinate(angle, EDGE);

    //draw axis line
    radar.svg.append("line")
    .attr("x1", 180)
    .attr("y1", 180)
    .attr("x2", line_coordinate.x)
    .attr("y2", line_coordinate.y)
    .attr("stroke","black");

    //draw axis label
    radar.svg.append("text")
    .attr("x", label_coordinate.x)
    .attr("y", label_coordinate.y)
    .text(ft_name);
  } 
  
 
  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < radar.features.length; i++){
        let ft_name = radar.features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / radar.features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }
  /*
  for (var i = 0; i < data.length; i ++){
    let d = data[i];
    let color = radar.colors[i];
    let coordinates = getPathCoordinates(d);
    radar.svg
    .datum(coordinates)
    .enter()
    .append("path")
    .attr("d",radar.line)
    .attr("stroke-width", 3)
    .attr("stroke", color)
    .attr("fill", color)
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);
  } 
  data.forEach((datum, index) => {
    //console.log(datum, index)
    radar.svg
    .datum(getPathCoordinates(datum))
    .append("path")
    .attr("d",radar.line)
    .attr("stroke-width", 3)
    .attr("stroke", radar.colors[index])
    //.attr("fill", color)
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);
  });
*/
  
 

  data.forEach((datum, index) => {
    //console.log(datum, index)
    radar.svg
    .datum(getPathCoordinates(datum))
    .append("path")
    .attr("class", "radar_unit")
    .attr("d",radar.line)
    .attr("stroke-width", 2)
    .attr("stroke", radar.colors[index])
    .attr("fill", radar.colors[index])
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);
  });
  
  
}



function getJobUsage(jobID) {
  let q_input = {jobID : jobID}
  $.getJSON("/getJobInfo", q_input, function (json) {
    Object.keys(json[0]).map(key => {if(json[0][key] < 0) json[0][key]=0;});
    var json = json[0];
    
   var totalWriteBytes = json['writeBytesMPIIO'] + json['writeBytesPOSIX'] + json['writeBytesSTDIO'];
   var totalWriteRate = json['writeRateMPIIO'] + json['writeRatePOSIX'] + json['writeRateSTDIO'];
   var totalWriteTime = json['writeTimeMPIIO'] + json['writeTimePOSIX'] + json['writeTimeSTDIO'];
   var bytes = {};
   bytes['MPIIO']  = json['writeBytesMPIIO']*100/totalWriteBytes; 
   bytes['POSIX'] =  json['writeBytesPOSIX']*100/totalWriteBytes;
   bytes['STDIO'] = json['writeBytesSTDIO']*100/totalWriteBytes;
   var rates = {};
   rates['MPIIO'] = json['writeRateMPIIO'] *100/totalWriteRate;
   rates['POSIX'] = json['writeRatePOSIX']*100/totalWriteRate;
   rates['STDIO'] = json['writeRateSTDIO']*100/totalWriteRate;
   var times = {};
   times['MPIIO'] = json['writeTimeMPIIO']*100/totalWriteTime;
   times['POSIX'] = json['writeTimePOSIX']*100/totalWriteTime;
   times['STDIO'] = json['writeTimeSTDIO']*100/totalWriteTime;
   var data = [bytes, rates, times];
   //console.log(data);
   radarInit(data);
  }); // <- json
}


function makeHeatmap(jobID) {
  let jid = {jobID : jobID}
  $.getJSON("/getHT", jid, function (json) { 
    var intervalJobs = json;
    //progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist
    let totalOST = new Array();
    let ostList = {};
    let onlyOST = {};
    // var lists;
    intervalJobs.map(row => { 
      var lists = row['ostlist'].split(" "); 
      if (row['jobID']==jid.jobID) {
        lists.map(ost => {
          if(ost in ostList) {

          } else {
            totalOST.push({ostID: parseInt(ost)});
            ostList[ost] = ost;
          }
        });
        // lists.map(ost => onlyOST.push({ostID: ost}));
      }
      // lists.map(ost => totalOST.push({ostID: ost}));
      
    });
    //console.log(ostList);
    //console.log(totalOST);

    intervalJobs = intervalJobs.filter(item => item['numOST'] > 1);
    totalOST.map(row => { row.size = 0; });
    intervalJobs.map(row => {
      var lists = row['ostlist'].split(" ");  
      lists.map(ost => { 
        totalOST.map(d => {
          if(ost in ostList) {
            if(d.ostID == parseInt(ost)) {
              d.size = d.size + (row.writeBytesTotal / (row.numOST + 1));
            }
          }   
        });
      });
    });

    //console.log(totalOST);

    let data = new Array();

    totalOST.map(row => {
      let xIndex = Math.floor((row.ostID / 15) * 15);
      let yIndex = row.ostID % 15;
      data.push({ostID: row.ostID, xIndex: xIndex, yIndex: yIndex, size: row.size});
    });
    
    //console.log(data);


    // myGroups = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    myGroups = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
    // myVars = [0, 15, 30, 45, 60, 75, 90 ,105, 120, 135, 150, 165, 180, 195, 210, 225, 240];
    myVars = ["0", "15", "30", "45", "60", "75", "90" ,"105", "120", "135", "150", "165", "180", "195", "210", '225', "240"];

    HTxAxis = d3.scaleBand()
      .range([ 30, heatMap.width + 30])
      .domain(myGroups)
      .padding(0.01);

    HTyAxis = d3.scaleBand()
      .range([ 0, heatMap.height ])
      .domain(myVars)
      .padding(0.01);

    HTxAxisVar
      .attr("transform", "translate(0," + heatMap.height + ")")
      .call(d3.axisBottom(HTxAxis));

    HTyAxisVar
      // .attr("transform", "translate(0," + heatMap.height + ")")
      .attr("transform", "translate(30,0)")
      .call(d3.axisLeft(HTyAxis));


    let myColor = d3.scaleLinear()
            // .range(["white", "#69b3a2"])
            .range(["#fff5f0", "#67000d"])
            .domain([0,d3.max(data, d => d.size)]);

    // data = [
    //   {group: "A", variable: "v1", value: 30},
    //   {group: "A", variable: "v2", value: 95},
    //   {group: "A", variable: "v3", value: 22},
    //   {group: "A", variable: "v4", value: 14},
    //   {group: "A", variable: "v5", value: 52},
    //   {group: "A", variable: "v6", value: 30},
    //   {group: "A", variable: "v7", value: 20},
    //   {group: "A", variable: "v8", value: 99},
    //   {group: "A", variable: "v9", value: 52},
    //   {group: "A", variable: "v10", value: 30},
    //   {group: "B", variable: "v1", value: 30},
    //   {group: "B", variable: "v2", value: 95},
    //   {group: "B", variable: "v3", value: 22},
    //   {group: "B", variable: "v4", value: 14},
    //   {group: "B", variable: "v5", value: 52},
    //   {group: "B", variable: "v6", value: 30},
    //   {group: "B", variable: "v7", value: 20},
    //   {group: "B", variable: "v8", value: 99},
    //   {group: "B", variable: "v9", value: 52},
    //   {group: "B", variable: "v10", value: 30},
    //   {group: "C", variable: "v1", value: 30},
    //   {group: "C", variable: "v2", value: 95},
    //   {group: "C", variable: "v3", value: 22},
    //   {group: "C", variable: "v4", value: 14},
    //   {group: "C", variable: "v5", value: 52},
    //   {group: "C", variable: "v6", value: 30},
    //   {group: "C", variable: "v7", value: 20},
    //   {group: "C", variable: "v8", value: 99},
    //   {group: "C", variable: "v9", value: 52},
    //   {group: "C", variable: "v10", value: 30},
    // ];

    heatMap.svg.selectAll('rect')
        .data(data, d => d.ostID)
        .join('rect')
        // .append("rect")
          .attr("x", function(d) { return HTxAxis(String(d.xIndex)) })
          .attr("y", function(d) { return HTyAxis(String(d.yIndex)) })
          .attr("width", HTxAxis.bandwidth() )
          .attr("height", HTyAxis.bandwidth() )
          .style("fill", function(d) { return myColor(d.size)} )

  });
}