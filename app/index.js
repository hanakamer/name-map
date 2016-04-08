require('d3');
const topojson = require('topojson');
const Datamap = require('datamaps/dist/datamaps.tur.js');
const turJSON = require("file!../node_modules/datamaps/src/js/data/tur.topo.json")
const width = 1100,
    height = 1160;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

let myarray =[];
d3.json(turJSON, function(error, tur) {
  if (error) return console.error(error);
  let subunits = topojson.feature(tur, tur.objects.tur);
  let projection =  d3.geo.mercator()
    .center([35, 34.5])
    // .rotate([0, 0])
    // .parallels([36, 42])
    .scale(3000)
    .translate([width / 2, height / 2]);

  let path = d3.geo.path()
    .projection(projection);

  svg.append("path")
    .datum(subunits)
    .attr("d", path);

  svg.selectAll(".subunit")
    .data(topojson.feature(tur, tur.objects.tur).features)
    .enter().append("path")
    .attr("class", function(d) {
      myarray.push(d.properties.name)
      return "subunit " + d.id; })
    .attr("d", path)
    .style("fill", 'yellow');;
console.log(myarray, myarray.length)
});
