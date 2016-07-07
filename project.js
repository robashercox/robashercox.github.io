var timeline = (function(){

var exports = {};


var padding = 20;

//Create the SVG Viewport
var selector = '.resourceTimeline';

var el = d3.select(selector);

el.selectAll('svg').remove();

// var sidebar_width = Math.round(0.2*el.node().clientWidth);

var margin = {
        top: 2,
        right: 40,
        bottom: 2,
        left: 40
    };

console.log(el.node().clientWidth);
width = el.node().clientWidth - margin.left - margin.right;
height = el.node().clientHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
	.domain([0,400])
    .range([0, width]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

//create and attach svg axis - really cool
var svg = el.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height / 2) + ")")
    .call(xAxis);

})();