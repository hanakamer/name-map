require('d3');
// require('jquery-ui/slider');
require('jquery-ui/ui/widgets/button');
require('jquery-ui/ui/widgets/slider');
require('jquery-ui/themes/base/all.css');
require('jquery-ui/themes/base/theme.css');
require('./jquery-ui-slider-pips.css');
require('./main.less');
require('./jquery-ui-slider-pips.js');

const $ = require('jquery');
const ColorHash = require('color-hash');
const femaleJSON = require('./topNAME_F.json');
const maleJSON = require('./topNAME_M.json');
const topojson = require('topojson');
const Datamap = require('datamaps/dist/datamaps.tur.js');
const turJSON = require("./tur.topo.json");

let curGender = maleJSON ;
let curYear = 1920;
let topNames;
let curMapPerc;

const width = 1030;
const height = 480;
const Colors = [
  '#ffb4b9','#ffd3cb','#fff1d9','#ecfbd2',
'#c9f1bb','#aee5ac','#95d6a1','#7fc998',
'#6bba91','#56ab8b','#429d87','#2a8e83','#008080',
'#8b0000','#a80e28','#c02845','#d54261']

const arrangeDataset = function(curGender){
  topNames = {};
  curMapPerc = {};
  for (var year in curGender) {
    let aYear = curGender[year][0]
    for (var city in aYear) {
      if (curMapPerc.hasOwnProperty(aYear[city])){
        let result = curMapPerc[aYear[city]] + 1;
        curMapPerc[aYear[city]] = result;
      } else {
        curMapPerc[aYear[city]] = 1;
      }
      curMapPerc[year]
    }
  }
  topNames = Object.keys(curMapPerc);
  topNames = topNames.sort((a, b) => {
    return curMapPerc[b] -  curMapPerc[a];
  });
}

$('#year').val(curYear);

window.increment = function(e,year) {
    var keynum
    if(window.event) {// IE
        keynum = e.keyCode
    } else if(e.which) {// Netscape/Firefox/Opera
        keynum = e.which
    }
    if (keynum == 38) {
        year.value = parseInt(year.value)+ 1;

    } else if (keynum == 40) {
        year.value = parseInt(year.value) - 1;
    }
    d3.selectAll("svg").remove();
    Draw(year.value)
    return false;
};

window.onload = function(){
  arrangeDataset(curGender);
  Draw(curYear);
}
let svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", 'map-container');
let subunits = topojson.feature(turJSON, turJSON.objects.tur);
let projection = d3.geo.mercator()
                  .center([35, 34.5])
                  .scale(3000)
                  .translate([width/2, height + 50]);

let path = d3.geo.path()
  .projection(projection);

const Draw = function(year){
  $('#year').value = year;
  curYear = year;
  svg.append("path")
    .datum(subunits)
    .attr("d", path);

  svg.selectAll(".subunit")
      .data(topojson.feature(turJSON, turJSON.objects.tur).features)
      .enter().append("path")
      .attr("class", function(d) {
        let cityName = d.properties.name;
        if (cityName){
        }
        return "subunit " + d.id; })
      .attr("d", path)
      .style("fill", function(d){
        let cityName = d.properties.name;
        if (cityName){
          let name = curGender[curYear][0][cityName.toUpperCase()]
          if (name){
            console.log(name)
            return Colors[topNames.indexOf(name)%17]
          }else {
            return 'yellow'
          }
        }
      });

  svg.selectAll(".path")
      .data(topojson.feature(turJSON, turJSON.objects.tur).features)
      .enter()
      .append("text")
      .text(function(d){
        let cityName = d.properties.name;
        if (cityName){
          let result = curGender[curYear][0][cityName.toUpperCase()]
         return result;
        }
      })
      .attr("x", function(d){
          return path.centroid(d)[0];
      })
      .attr("y", function(d){
          return  path.centroid(d)[1];
      })
      .attr("text-anchor","middle")
      .attr('font-size','6pt')
      .style("fill", 'black')
}

const changeColor = function(year) {
    d3.selectAll("text").remove();
  curYear = year;
  svg.selectAll(".subunit")
      .data(topojson.feature(turJSON, turJSON.objects.tur).features)
      .transition()
      .style("fill", function(d){
        let cityName = d.properties.name;
        if (cityName){
          let name = curGender[curYear][0][cityName.toUpperCase()]
          if (name){
            return Colors[topNames.indexOf(name)%17];
          }else {
            return 'yellow'
          }
        }
      });

      svg.selectAll(".path")
          .data(topojson.feature(turJSON, turJSON.objects.tur).features)
          .enter()
          .append("text")
          .text(function(d){
            let cityName = d.properties.name;
            if (cityName){
              let result = curGender[curYear][0][cityName.toUpperCase()]
             return result;
            }
          })
          .transition(1000)
          .attr("x", function(d){
              return path.centroid(d)[0];
          })
          .attr("y", function(d){
              return  path.centroid(d)[1];
          })
          .attr("text-anchor","middle")
          .attr('font-size','6pt')
          .style("fill", 'black')
    }

let values = [];
let currentYear=curYear;
let playInterval;
const slideDuration = 1000; // in milliseconds
let autoRewind = true;

const slider = $('#slider').slider({
  value: 0,
       min: 1920,
       max: 1991,
       step: 1,
       slide: function( event, ui ) {
           currentYear = ui.value;
           changeColor(currentYear);
           $('#showyear').val(currentYear)
       },
       change: function( event, ui ){
         currentYear = ui.value;
         changeColor(currentYear);
         $('#showyear').val(currentYear)
       }

}).slider("pips", {
  rest: 'label'
})

const button = $( "#play" ).button({
     icons: {
       primary: "ui-icon-play"
     },
     text: false
   }).click(function () {
       if (playInterval != undefined) {
           clearInterval(playInterval);
           playInterval = undefined;
           $(this).button({
               icons: {
                   primary: "ui-icon-play"
               }
           });
           return;
       }
       $(this).button({
           icons: {
               primary: "ui-icon-pause"
           }
       });
       playInterval = setInterval(function () {
           currentYear++;
           if (currentYear > 1991) {
               if (autoRewind) {
                   currentYear = 1914;
               }
               else {
                   clearIntveral(playInterval);
                   return;
               }
           }
           $('#showyear').val(currentYear)
           changeColor(currentYear);
           $( "#slider" ).slider( "value", currentYear );
       }, slideDuration);
   });

 $.handle = slider.find('.ui-slider-handle')
 $(document).on('keyup keydown', function(e) {
   if ( $.handle.hasClass('ui-state-focus') ) return;
   if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40) {
     e.target = $.handle.get(0);
     $.handle.triggerHandler(e);
   }
 });

$('.onoffswitch-checkbox').change(function(){

  if(this.checked){
    curGender = femaleJSON;
    arrangeDataset(curGender);
    changeColor(currentYear);
    $('.woman').css('visibility','visible');
    $('.man').css('visibility','hidden');
  } else {
    curGender = maleJSON;
    arrangeDataset(curGender);
    changeColor(currentYear);
    $('.man').css('visibility','visible');
    $('.woman').css('visibility','hidden');
  }
})
