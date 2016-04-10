require('d3');
require('jquery-ui/slider');
require('jquery-ui/button');
require('jquery-ui/themes/base/jquery-ui.css');
require('jquery-ui/themes/base/jquery.ui.theme.css');
require('./jquery-ui-slider-pips.css')
require('./main.less');
require('./jquery-ui-slider-pips.js');

const $ = require('jquery');
const ColorHash = require('color-hash');
const femaleJSON = require('./topNAME_F.json');
const maleJSON = require('./topNAME_M.json');
const topojson = require('topojson');
const Datamap = require('datamaps/dist/datamaps.tur.js');
const turJSON = require("./tur.topo.json");

let curGender = maleJSON;
let curYear = 1914;

const width = 1100;
const height = 460;
let curMapPerc = {};
for (var city in femaleJSON[curYear][0]) {
  console.log(femaleJSON[curYear][0][city])
  let name = femaleJSON[curYear][city]
  console.log(curMapPerc[name])
  if (curMapPerc[name] === 'undefined'){
    let obj = {
      name : name,
      count: 1
    }
    curMapPerc[name] = obj;
  }else {
    console.log(curMapPerc[name])
  }
}
console.log(curMapPerc)


const sha1 = function (str1){
    for (
      var blockstart = 0,
        i = 0,
        W = [],
        A, B, C, D, F, G,
        H = [A=0x67452301, B=0xEFCDAB89, ~A, ~B, 0xC3D2E1F0],
        word_array = [],
        temp2,
        s = unescape(encodeURI(str1)),
        str_len = s.length;

      i <= str_len;
    ){
      word_array[i >> 2] |= (s.charCodeAt(i)||128) << (8 * (3 - i++ % 4));
    }
    word_array[temp2 = ((str_len + 8) >> 2) | 15] = str_len << 3;

    for (; blockstart <= temp2; blockstart += 16) {
      A = H; i = 0;

      for (; i < 80;
        A = [[
          (G = ((s = A[0]) << 5 | s >>> 27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G << 1 | G >>> 31) + 1518500249) + ((B = A[1]) & (C = A[2]) | ~B & (D = A[3])),
          F = G + (B ^ C ^ D) + 341275144,
          G + (B & C | B & D | C & D) + 882459459,
          F + 1535694389
        ][0|((i++) / 20)] | 0, s, B << 30 | B >>> 2, C, D]
      ) {
        G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
      }

      for(i = 5; i; ) H[--i] = H[i] + A[i] | 0;
    }

    for(str1 = ''; i < 40; )str1 += (H[i >> 3] >> (7 - i++ % 8) * 4 & 15).toString(16);
    return str1;
  };

const colorHash = new ColorHash();

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
    updateYear(year.value)
    return false;
};

window.onload = function(){updateYear(curYear);}

const updateYear = function(year){
  $('#year').value = year;
  curYear = year;
  let svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height);

  let subunits = topojson.feature(turJSON, turJSON.objects.tur);
  let projection = d3.geo.mercator()
                    .center([35, 34.5])
                    .scale(3000)
                    .translate([width/2-50, height+50]);

  let path = d3.geo.path()
    .projection(projection);

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
          if (curGender[curYear][0][cityName.toUpperCase()]){
            return colorHash.hex(curGender[curYear][0][cityName.toUpperCase()]);
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
let values = [];
let currentYear=curYear;
let playInterval;
const slideDuration = 3000; // in milliseconds
let autoRewind = true;

const slider = $('#slider').slider({
  value: 0,
       min: 1914,
       max: 1990,
       step: 1,
       slide: function( event, ui ) {
           d3.selectAll("svg").remove();
           currentYear = ui.value;
           updateYear(currentYear);
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
           if (currentYear > 1990) {
               if (autoRewind) {
                   currentYear = 1914;
               }
               else {
                   clearIntveral(playInterval);
                   return;
               }
           }
           d3.selectAll("svg").remove();
           updateYear(currentYear);
           $( "#slider" ).slider( "value", currentYear );
       }, slideDuration);
   });
