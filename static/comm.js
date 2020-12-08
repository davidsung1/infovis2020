
$(function() { //functions to be called on load of html
  appendOptions();

  d3.select('#select1').on('change', function (event, k) { // ...
    // console.log("call select update")
    let progName = $("#select1 option:checked").val();
    // console.log(progName);
    makeScatter(progName);
    getAppInfo(progName);

  });

});


function appendOptions() {
  console.log("going to append option to select1");
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
    console.log("going to be db data")
    let progName = {progName: "pw.x"}
  $.getJSON("/getData", progName, function (json) {
      // console.log("hi");
      // console.log(json);
  });
}


function getMDSData(jid) {
  console.log("going to be MDS data")
  let jobID = {jobID: jid}
  $.getJSON("/getMDS", jobID, function (data) {
      // console.log(data);
      MDSsvg.select('rect').remove();

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
        .attr('transform', `translate(1120, 0)`)
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

      legendEnter = MDSsvg.append("g")
                        .attr("class", "legend")
                        .attr("id", "MDSLegend")
                        .attr("transform", `translate(970, 10)`);

      legendEnter.append("rect")
              .attr("width", 100)
              .attr("height", 50)
              .attr("fill", "#eeeeee")
              .attr("opacity", 0.5);

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

// function infoTableClick() {
//   $("tr.appInfoContent").click(function () {
//     let jid = $(this).attr('id');

//     console.log("app info clicked "+$(this).attr('id'));

//     d3.selectAll('tr.appInfoContent').classed('tableClicked', false);
//     d3.select(this).node().classList.add("tableClicked");

//     let TDs = $(this).children();
//     appInfo = {progName: TDs[0].id, optionName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent};
//     // appInfoArr.push({progName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent});
//     console.log(appInfo);
//     //put info into history modal
//     appendHistory(appInfo);
//     //show mds graph for the app instance
//     getMDSData(jid);
//     //show ost graph for the app instance
//     getIntervalJobs(jid);

//     //try
//     makeHeatmap(jid);

//     //trytry
//   });
// }

function getAppInfo(progName) {
  let pn = {progName: progName}
  $.getJSON("/getAppInfo", pn, function (json) {
    let data = json;

    appTable = d3.select("#appInfoTable");
        // appTableTR = appTable.selectAll('tr.appInfoContent').data(data, d => d.jobID);
    appTable.selectAll('tr.appInfoContent').data(data, d => d.jobID)
          .join('tr')
            .classed("appInfoContent", true)
            .attr('id', d => d.jobID)
            .each(function(d, i) { 
              d3.select(this).append("td").attr('id', d.progName).text(d => d.optionName);
              d3.select(this).append("td").text(d => d.jobID);
              d3.select(this).append("td").text(d => d.startTime);
              d3.select(this).append("td").text(d => d.endTime);
              d3.select(this).append("td").text(d => d.runTime);
              d3.select(this).append("td").text(d => d.numOST+1);
              d3.select(this).append("td").text(d => d.numProc);
              d3.select(this).append("td").text(d => d.totalFile);
              d3.select(this).append("td").text(d => d.totalWriteReq);
            });
    
    console.log("app info appending for "+progName+" is done");

    for(let i = 0; i < data.length; i++) {
      $('#appInfoTable tr#'+data[i].jobID)
        .click(() => { 
          console.log("id "+data[i].jobID+" clicked")
          // d3.select("circle#"+data[i].jobID).classed('circleClicked', true);
          d3.selectAll('circle.scatterdot').classed('circleClicked', false);

          $("circle#"+data[i].jobID).addClass('circleClicked');
          // d3.select("tr#"+data[i].jobID).classed('tableClicked', true);
          // $("#appInfoTable tr#"+data[i].jobID).addClass('tableClicked');
        });

      $('#scatterSvg circle#'+data[i].jobID)
        .click(() => { 
          console.log("id "+data[i].jobID+" clicked")
          // d3.select("circle#"+data[i].jobID).classed('circleClicked', true);
          // $("circle#"+data[i].jobID).addClass('circleClicked');
          // d3.select("tr#"+data[i].jobID).classed('tableClicked', true);
          $("#appInfoTable tr#"+data[i].jobID).addClass('tableClicked');
        });
    }


    $("tr.appInfoContent").click(function () {
      let jid = $(this).attr('id');

      console.log("app info clicked "+$(this).attr('id'));

      d3.selectAll('tr.appInfoContent').classed('tableClicked', false);
      d3.select(this).node().classList.add("tableClicked");

      // d3.selectAll('circle.scatterdot').classed('circleClicked', false);

      let TDs = $(this).children();
      appInfo = {progName: TDs[0].id, optionName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent};
      // appInfoArr.push({progName: TDs[0].textContent, jobID: TDs[1].textContent, startTime: TDs[2].textContent, endTime: TDs[3].textContent});
      // console.log(appInfo);
      //put info into history modal
      // appendHistory(appInfo);
      //show mds graph for the app instance
      getMDSData(jid);
      //show ost graph for the app instance
      getIntervalJobs(jid);

      //try
      makeHeatmap(jid);

      //trytry
      getJobUsage(jid);

    });
    // infoTableClick();
   
  });
}

function appendHistory(data) {
  // console.log("entering append history");

  historyTable = d3.select("#historyTable");
  historyTable = historyTable.append('tr').attr("class", "historyContent").attr('id', data.jobID);

  historyTable.append("td").html('<button type="button" class="close" id="closeButton'+data.jobID+'" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
  historyTable.append("td").text(data.optionName);
  historyTable.append("td").text(data.jobID);
  historyTable.append("td").text(data.startTime);
  historyTable.append("td").text(data.endTime);
  historyTable.append('p').text(data.progName).style('display', 'none');

  // d3.selectAll("p").style("display", "none") 

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
    // console.log(lists);
    intervalJobs = intervalJobs.filter(item => item['numOST'] > 1);
    intervalJobs.map(row => {var lists = row['ostlist'].split(" ");  lists.map(ost => { if (ost in totalOST) totalOST[ost][row['jobID']] = [row['writeBytesTotal']/row['numOST'], -1]; })  });
    //barChart.totalOST = Object.getOwnPropertyNames(totalOST).map(function(e) { totalOST[e]['sum'] = Object.values(totalOST[e]).reduce((a, b) => a + b, 0); totalOST[e]['ostID']=e; return totalOST[e]});
    // TODO : sort and select head (50);
    barChart.totalOST = Object.getOwnPropertyNames(totalOST).map(function(e) { totalOST[e]['sum'] = Object.keys(totalOST[e]).reduce( (sum,key) => { var curr_sum = sum+totalOST[e][key][0]; totalOST[e][key][1]=curr_sum; return curr_sum},0); totalOST[e]['ostID']=e;  return totalOST[e]});
    // console.log(barChart.totalOST);

    var displayOST = 10;
    // barChart.totalOST = barChart.totalOST.sort(function(a, b) { return b['sum'] - a['sum'];}).slice(0, displayOST);
    barChart.totalOST = barChart.totalOST.sort(function(a, b) { return b['sum'] - a['sum'];});

    // barChart.totalOSTOrig = totalOST;
    // console.log(totalOST);
    // console.log(barChart.totalOST);

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


  barChart.xAxisTitle = barChart.svg.select('#barXaxisTitle')
                                .append('text')
                                .attr('text-anchor', "end")
                                .attr('transform', 'rotate(-90)')
                                .attr('font-size', '10px')
                                .attr('y', 10)
                                .attr('x', -110)
                                .text('Total Written Bytes on OST (MB)')

  barChart.yAxisTitle = barChart.svg.select('#barYaxisTitle')
                                .append('text')
                                .attr('text-anchor', "end")
                                // .attr('transform', 'rotate(-90)')
                                .attr('font-size', '12px')
                                .attr('y', 315)
                                .attr('x', 120)
                                .text('OST ID (0 - 247)')
}

function makeHeatmap(jobID) {
  let jid = {jobID : jobID}
  $.getJSON("/getHT", jid, function (json) { 
    // console.log(json);
    var intervalJobs = json;
    //progName, jobID, startTime, endTime, writeBytesTotal, numOST, ostlist
    let totalOST = new Array();
    let ostList = {};

    intervalJobs.map(row => { 
      var lists = row['ostlist'].split(" "); 
      lists.map(ost => {
        if(ost in ostList) {
          if(row['jobID'] == jid.jobID) {
            totalOST.map(totalrow => {
              if (totalrow.ostID == parseInt(ost)) totalrow.valid = 1;
            })
          } 
        } else {
          if(row['jobID'] == jid.jobID) totalOST.push({ostID: parseInt(ost), valid: 1});
          else totalOST.push({ostID: parseInt(ost), valid: 0});
          ostList[ost] = ost;
        }
      });      
    });

    // console.log(totalOST);

    // intervalJobs = intervalJobs.filter(item => item['numOST'] > 1);
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
    // console.log(totalOST);

    myGroups = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    myVars = [0, 15, 30, 45, 60, 75, 90 ,105, 120, 135, 150, 165, 180, 195, 210, 225, 240];
    let data = new Array();

    for (let x = 0; x < myGroups.length; x++) {
      for (let y = 0; y < myVars.length; y++) {
        if ((myGroups[x] + myVars[y]) <= 247) {
          data.push({ostID: myGroups[x]+myVars[y], xIndex: myGroups[x], yIndex: myVars[y], size: 0, valid: 0});
        }
      }
    }

    // console.log(data);

    totalOST.map(row => {
      let xIndex = row.ostID % 15;
      let yIndex = Math.floor((row.ostID / 15)) * 15;

      data.map(dataRow => {
        if (dataRow.xIndex == xIndex && dataRow.yIndex == yIndex) {
          dataRow.size = row.size;
          if (row.valid == 1) dataRow.valid = 1;
        }
      });
    });

    // console.log(data);

    HTxAxis = d3.scaleBand()
      .range([ 30, heatMap.width + 30])
      .domain(myGroups)
      .padding(0.01);

    HTyAxis = d3.scaleBand()
      // .range([ 0, heatMap.height ])
      .range([ heatMap.height, 0 ])
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
            // .domain([0,100]);
            .domain([0,d3.max(data, d => d.size)]);

    colorHold=["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"];
    colorData=[1,2,3,4,5,6,7,8,9]
    colorScale = d3.scaleOrdinal()
        .domain([1,2,3,4,5,6,7,8,9])
        .range(colorHold);
    
    
   

    // heatMap.svg.selectAll('circle')
    //       .data(colorData)
    //       .join('circle')
    //         .attr('class', 'colorss')
    //         // .attr("width", 100)
    //         // .attr("height", 50)
    //         .attr("cx", (d, i) =>  200 + i * 50 )
    //         .attr("cy", (d, i) =>  100 )
    //         .attr("r", 5)
    //         .style("fill", function(d) { return colorScale(d)} );

    // heatMap.colorscale.append('rect')
    // .attr('width', 400)
    // .attr('height', 100)
    // .attr('fill', 'black');




    heatMap.svg.selectAll('rect')
      .data(data, d => d.ostID)
      // .data(HTdata, d => d.group+":"+d.variable)
      .join('rect')
          .attr("x", function(d) { return HTxAxis(d.xIndex) })
          // .attr("x", function(d) { return HTxAxis(d.group) })
          .attr("y", function(d) { return HTyAxis(d.yIndex) })
          // .attr("y", function(d) { return HTyAxis(d.variable) })
          .attr('stroke', d => {
            if(d.valid == 0) return 'black';
            else if (d.valid == 1) {
              return 'orange';
            }
          })
          .attr('stroke-width', d => {
            if(d.valid == 0) return 0.1;
            else if (d.valid == 1) {
              return 3;
            }
          })
          .attr("width", HTxAxis.bandwidth() )
          .attr("height", HTyAxis.bandwidth() )
          .style("fill", function(d) { return myColor(d.size)} )
          // .style("fill", function(d) { return myColor(d.value)} )

    heatMap.svg.selectAll('rect.colorss')
                .data(colorData)
                .join('rect')
                  .attr('class', 'colorss')
                  .attr("width", 10)
                  .attr("height", 30)
                  .attr("x", (d, i) => 400 )
                  .attr("y", (d, i) =>  260 - i * 30 )
                  // .attr('stroke', 'black')
                  .style("fill", function(d) { return colorScale(d)} );

    d3.select('#colorTop').remove();
    d3.select('#colorBottom').remove();

    let colorBottom = heatMap.svg.append('g').attr('id', 'colorBottom');
    let colorTop = heatMap.svg.append('g').attr('id', 'colorTop');


    colorBottom = heatMap.svg.select('#colorBottom')
                  .append('text')
                  // .attr('text-anchor', "end")
                  // .attr('transform', 'rotate(-90)')
                  .attr('font-size', '12px')
                  .attr('x', 370)
                  .attr('y', 310)
                  .text('Min '+ Math.floor(d3.min(data, d => d.size)) + ' (MB)');

    colorTop = heatMap.svg.select('#colorTop')
                  .append('text')
                  // .attr('text-anchor', "end")
                  // .attr('transform', 'rotate(-90)')
                  .attr('font-size', '12px')
                  .attr('x', 370)
                  .attr('y', 10)
                  .text('Max '+Math.floor(d3.max(data, d => d.size)) + ' (MB)');

  });
}

function makeScatter(progName) {
  //  seokwon Scatter plot
  function translate(x, y) {
    return 'translate(' + x + ', ' + y + ')';
  }

  let req = {progName: progName};
  $.getJSON("/getScatter", req, function (json) {
    let data_rate_byte = json;

    scatter.xAxis = d3.scaleLinear()
            .domain([
              d3.min(data_rate_byte, d => d.writeBytesTotal),
              d3.max(data_rate_byte, d => d.writeBytesTotal)
            ])
            .range([50, scatter.width + 50]);

    scatter.yAxis = d3.scaleLinear()
            .domain([
              d3.min(data_rate_byte, d => d.writeRateTotal),
              d3.max(data_rate_byte, d => d.writeRateTotal)
            ])
            .range([scatter.height + 5 , 5]);

    scatter.xAxisVar
      .attr("transform", "translate(0," + (scatter.height + 5) + ")")
      .call(d3.axisBottom(scatter.xAxis));

    scatter.yAxisVar
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(scatter.yAxis));
    //circle 그리기
    scatter.svg
          .selectAll('circle')
          .data(data_rate_byte, d => d.jobID)
          .join("circle")
            .attr('cx', d => scatter.xAxis(d.writeBytesTotal))
            .attr('cy', d => scatter.yAxis(d.writeRateTotal))
            .attr("r", 3.5)
            .attr('class', 'scatterdot')
            .attr('id', d => d.jobID)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .attr("fill",  'skyblue');


    scatter.svg
            .selectAll('circle')
            .on('mouseenter', function () {
              d3.select(this)
                // .attr('r', d => d.radius * 2)
                  .style("opacity", 0.3)
          })
            .on('mouseleave', function() {
              d3.select(this)
                // .attr('r', d => d.radius)
                  .style("opacity", 1.0)   
          });


    //scatter.xAxisTitle
    //scatter.yAxisTitle
    // scatter.xAxisTitle = scatter.svg
    //                         .append('g')
    //                         .attr('id', 'scatterXaxisTitle');

    //   scatter.yAxisTitle = scatter.svg
    //                         .append('g')
    //                         .attr('id', 'scatterYaxisTitle');
    scatter.xAxisTitle = scatter.svg.select('#scatterXaxisTitle')
                                  .append('text')
                                  .attr('text-anchor', "end")
                                  .attr('transform', 'rotate(-90)')
                                  .attr('font-size', '10px')
                                  .attr('y', 10)
                                  .attr('x', -110)
                                  .text('Throughput (MB/s)')

    scatter.yAxisTitle = scatter.svg.select('#scatterYaxisTitle')
                                  .append('text')
                                  .attr('text-anchor', "end")
                                  // .attr('transform', 'rotate(-90)')
                                  .attr('font-size', '10px')
                                  .attr('y', 340)
                                  .attr('x', 300)
                                  .text('Total Bytes Written (MB)')

    // MDSYaxisLTitle = MDSsvg.select("#MDSYaxisLTitle")
    //                     .append('text')
    //                     .attr("text-anchor", "end")
    //                     .attr("transform", "rotate(-90)")
    //                     .attr("font-size", '10px')
    //                     .attr("y", 10)
    //                     .attr("x", -50)
    //                     .text("# of MDS Operations (Per Second)");

    //   MDSYaxisRTitle = MDSsvg.select("#MDSYaxisLTitle")
    //                     .append('text')
    //                     .attr("text-anchor", "end")
    //                     .attr("transform", "rotate(-90)")
    //                     .attr("font-size", '10px')
    //                     .attr("y", 1160)
    //                     .attr("x", -100)
    //                     .text("CPU Usage (%)");

    $("circle.scatterdot").click(function () { 
      let jid = $(this).attr('id');

      d3.selectAll('circle.scatterdot').classed('circleClicked', false);
      d3.select(this).node().classList.add("circleClicked");

      d3.selectAll('tr.appInfoContent').classed('tableClicked', false);
      // d3.select('tr.appInfoContent#'+jid).node().classList.add("tableClicked");
      $('tr#'+jid).addClass("tableClicked");
      // $('appInfoTable tr#'+String(jid)).addClass("tableClicked"); //???

      getMDSData(jid);
      getIntervalJobs(jid);
      makeHeatmap(jid); 
      getJobUsage(jid);
   
      
    });

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
   radar.usage=['write bytes #', 'write rate #', 'write time #']
   radarInit(data);
  }); // <- json
}

function radarInit(data) {
  //initialize 
    ticks=[];
    data.map(item=>Object.values(item).map(t=> ticks.push(t)));
    //TICK_MAX = Math.min(Math.ceil(Math.max(...ticks)), 100);
    TICK_MAX = 100 
    EDGE = 110; /// 110
    radar.ticks = [];
    for(i=0; i<=TICK_MAX; i+=20) radar.ticks.push(i);
    radar.ticks.push(TICK_MAX);
    //  radar.colors = ["darkorange", "gray", "navy"];
    radar.colors = ["red", "green", "navy"];
    radar.features = Object.keys(data[1]);
    radar.radius = 110; ///// 
    radar.radicalScale = d3.scaleLinear().domain([0, TICK_MAX]).range([0, radar.radius]);
    radar.middle = 50; //50
    radar.line = d3.line().x(d => d.x + radar.middle).y(d => d.y + radar.middle);
  
    radar.svg.selectAll('*').remove();
    radar.ticks.forEach(t =>
      radar.svg.append("circle")
      .attr("cx", radar.radius + radar.middle)
      .attr("cy", radar.radius + radar.middle)
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("r", radar.radicalScale(t))
      );
  
    radar.ticks.forEach(t =>
      radar.svg.append("text")
        .attr("x", radar.radius  + radar.middle +10) // +10
        .attr("y", radar.radius  + radar.middle - radar.radicalScale(t))
        .style("font-size","10px")
        .text(t.toString())
    );
  // initailize path
    function angleToCoordinate(angle, value){
      let x = Math.cos(angle) * radar.radicalScale(value);
      let y = Math.sin(angle) * radar.radicalScale(value);
      return {"x": radar.radius + x, "y": radar.radius - y};
    }
  
    for (var i = 0; i < radar.features.length; i++) {
      let ft_name = radar.features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / radar.features.length);
      let line_coordinate = angleToCoordinate(angle, EDGE);
      let label_coordinate = angleToCoordinate(angle, EDGE + 5); // EDGE + 5
  
      //draw axis line
      radar.svg.append("line")
      .attr("x1", radar.radius+ radar.middle)
      .attr("y1", radar.radius+ radar.middle)
      .attr("x2", line_coordinate.x+ radar.middle)
      .attr("y2", line_coordinate.y+ radar.middle)
      .attr("stroke", "lightgray");
  
      //draw axis label
      radar.svg.append("text")
      .attr("x", label_coordinate.x + radar.middle - 10)
      .attr("y", label_coordinate.y+ radar.middle)
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
  
    data.forEach((datum, index) => {
      radar.svg
      .datum(getPathCoordinates(datum))
      .append("path")
      .attr("class", "radar")
      .attr("d",radar.line)
      .attr("stroke-width", 2)
      .attr("stroke", radar.colors[index])
      .attr("fill", radar.colors[index])
      .attr("stroke-opacity", 1)
      .attr("opacity", 0.5);
    });
  
    radar.legend = radar.svg.append("g").attr("id", "radar.legend");
    radar.legend.x = 300;
    radar.legend.y = 20;
    radar.legend.append("rect")
                            .attr("width", 100)
                            .attr("height", 80)
                            .attr("x", radar.legend.x)
                            .attr("y", radar.legend.y)
                            .attr("fill", "#eeeeee")
                            .attr('opacity', 0.5);
  
    
    radar.legend 
          .selectAll("text")
          .data(radar.usage)
          .join("text")
            .attr("y", function(d, i) { return ((i+1)*20) + radar.legend.y; })
            .attr("x", radar.legend.x + 30)
            .attr("font-size", '9px')
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .text(d => d);
  
    radar.legend 
          .selectAll("circle")
          .data(radar.usage)
          .join("circle")
            .attr("cx", radar.legend.x + 10)
            .attr("cy", function(d, i) { return ((i+1)*20) + radar.legend.y; })
            .attr("r", 3)
            .style("fill",(d, i) => radar.colors[i]);
            
    //move chart to center
    radar.legend.selectAll('*').attr('transform', "translate(-50, 0)")
  }