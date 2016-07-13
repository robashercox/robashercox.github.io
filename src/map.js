// require ("C:\\Users\\s-rasher\\AppData\\Roaming\\npm\\node_modules\\ramda")
// informationArray = [];
// $.ajax({
//   url: "http://da.ballina.nsw.gov.au/atdis/1.0/applications.json",
//   dataType: "json",
//   success: function(response) {
//     var application, i, len, ref;
//     ref = response.response;
//     for (i = 0, len = ref.length; i < len; i++) {
//       application = ref[i];
//       informationArray.push(application.application.info.estimated_cost);
//     }
//     informationArray.push("success");
//   }
// });

//for every property add a button with the properties name
properties = R.keys(sydneySa1.features[0].properties)

colors = chroma.scale('Set1').mode('lab').colors(properties.length);

colorDict = R.zipObj(properties,colors)


var activePlot = '';
// get mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FydGhkYmVldGxlIiwiYSI6ImNpcHl5emhrdjB5YmxoY25yczF6MHhhc2IifQ.2Ld30uLqcffVv-RUAWk_qQ';

//instantiate map
map = new mapboxgl.Map({
				    container: 'map',
				    style: 'mapbox://styles/mapbox/light-v9',
				    center: [151.102, -33.82],
				    zoom: 9
				});

//get data and convert to GeoJSON source
var sydneySa1Source = new mapboxgl.GeoJSONSource({
   data: sydneySa1
});
test = {}
test['features'] = R.difference(votes.features,R.filter(R.propEq("geometry", null), votes.features))
newvotes = R.mergeAll([{type:votes.type},{crs:votes.crs},test])

var votesSource = new mapboxgl.GeoJSONSource({
   data: newvotes
});

//render GeoJSON source to map
map.on('load', function () {
	map.addSource('syd', sydneySa1Source);
	map.addSource('votes1', votesSource);
	map.addLayer({
		'id': 'syd1',
		'type': 'fill',
		'source': 'syd',
		'layout': {},
		'paint': {
			'fill-color': '#088',
			'fill-opacity': 0.8
		}
	});
	map.addLayer({
	    "id": "highlight",
	    "type": "fill",
	    "source": 'syd',
	    "layout": {},
	    "paint": {
	        "fill-color": "Black",
	        "fill-opacity": 0.5
	    },
	    "filter": ['==',"sa1_7digit","wat"]
	});
	map.addLayer({
	    "id": "votesL",
	    "type": "circle",
	    "source": 'votes1',
	    "layout": {},
	    "paint": {
    		"circle-radius":2.5,
            "circle-color":{

				property: "winner",
				type: "categorical",
				stops: [
						["alp", "Red"], 
						["lnp", "Blue"]
				]
			}
	    }
	});
});

//funtion that removes outliers - needs to be worked on
function filterOutliers(someArray) {  

    // Copy the values, rather than operating on references to existing values
    var values = someArray.concat();

    // Then sort
    values.sort( function(a, b) {
            return a - b;
         });

    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */     
    var q1 = values[Math.floor((values.length / 4))];
    // Likewise for q3. 
    var q3 = values[Math.ceil((values.length * (3 / 4)))];
    var iqr = q3 - q1;

    // Then find min and max values
    var maxValue = q3 + iqr*1.5;
    var minValue = q1 - iqr*1.5;

    // Then filter anything beyond or beneath these values.
    var filteredValues = values.filter(function(x) {
        return (x < maxValue) && (x > minValue);
    });

    // Then return
    return filteredValues;
}

// /////////////////////////////////////////////////////
// Cross filter bit
// ////////////////////////////////////////////////////

data = R.pluck("properties", sydneySa1.features);
var facts = crossfilter(data);
plot = document.getElementById('plot');
otherVar = []


//get list of sa17_digits
sa17_digits = R.map(R.path(['properties','sa1_7digit'],R.__),sydneySa1.features)


//function that adds a div to el with ID elID, and calls that button text
function dataDiv(elID, text){
	el = $('#'+elID);
	container = $('<div></div>');
	container.toggleClass('block ab')
	el.append(container);
	chartBox = $('<div></div>');
	chartBox.attr('id', text);
	button = $('<div>%s</div>'.replace('%s', text));
	button.attr('id', text + " button")
	button.css('color', colorDict[text]);
	container.append(button);
	container.append(chartBox);
	// change background colour and set opacity = 0.2
}

// R.map(colorEntry,properties)
addCtrlButtons = R.curry(dataDiv)("controls")
R.map(addCtrlButtons, properties)
createPlot("median_age");
//function picks text from properties and sets map style to choropleth of that property
function dataPropertyColor(text){
	console.log(text)
	props = R.map(R.path(['properties',text],R.__),sydneySa1.features)
	props = R.filter(function(x){return !(x==0);},props);
	// console.log(props);
	max = R.reduce(R.max,-Infinity,filterOutliers(props));
	min = R.reduce(R.min,+Infinity,props)||0;
	console.log(colorDict[text]);
	colors5 = chroma.scale(['lightyellow',colorDict[text]]).mode('lch').colors(3);
	divs = [min,(min+max)/2,max];
	// console.log(R.zip(divs,colors5));
	newStyle = {
			property: text,
			stops: R.zip(divs,colors5)
            };
    map.setPaintProperty('syd1','fill-color',newStyle)
}

//function picks text from properties and creates plotly scatter plot of that property
// filteredsa1_7 = facts.dimension(function(d){return d["sa1_7digit"]?d["sa1_7digit"]:0}).top(Infinity);
function sa1Comparer(obj,oObj){
	return (obj["sa1_7digit"] === oObj["sa1_7digit"])
} 

function createPlot(text){
	activePlot = text;
	if (otherVar.length > 16){
		drop = otherVar.pop()
		drop.dispose()
	}
	otherVar.unshift(facts.dimension(function(d){return d[text]?d[text]:0}));
	filteredObj = otherVar[0].top(Infinity)
	unfilteredObj = R.differenceWith(sa1Comparer, R.pluck("properties",sydneySa1.features), otherVar[0].top(Infinity))
	filteredVar = R.pluck(text,filteredObj);
	filteredStationDist = R.pluck("station_dist", filteredObj);
	unfilteredVar = R.pluck(text,unfilteredObj);
	unfilteredStationDist = R.pluck("station_dist",unfilteredObj);
	var filtered = {
		x: filteredStationDist,
		y: filteredVar,
		mode: 'markers',
		type: 'scatter',
		marker:{color: colorDict[text],opacity:0.66}
	}
	var unfiltered = {
		x: unfilteredStationDist,
		y: unfilteredVar,
		mode: 'markers',
		type: 'scatter',
		marker:{color: 'Grey',opacity:0.2}
	}
	data = [unfiltered,filtered]
	layout = {title: text + " vs distance to nearest train station",
	titlefont: {
	      family: 'Courier New, monospace',
	      size: 18,
	      color: '#7f7f7f'
	    },
    hovermode:'closest',
    margin: {
		    l: 50,
		    r: 50,
		    b: 30,
		    t: 30,
		    pad: 4}

		}
	
	Plotly.newPlot(plot, data, layout)


}


//function to add listener to button container div with id elID
function containerListenerPlotColor(elID){
	el = $('#'+elID);
	el.click(function(event){
		console.log(event.target.textContent);
		dataPropertyColor(event.target.textContent);
		createPlot(event.target.textContent);
			}) 
    }

//add listener to button container div with id elID and call back dataProperty Color
containerListenerPlotColor("controls",dataPropertyColor)

//helper function R.prop for list
function pick(array,i){
	return array[i];
}
pick = R.curry(pick)

function updatePlot(chart){
	text = activePlot;
	console.log(text);
	filteredObj = chart.dimension().top(Infinity);
	selectedSa1s = R.pluck("sa1_7digit", filteredObj);
	unfilteredObj = R.differenceWith(sa1Comparer, R.pluck("properties",sydneySa1.features), filteredObj)
	filteredVar = R.pluck(text,filteredObj);
	filteredStationDist = R.pluck("station_dist", filteredObj);
	unfilteredVar = R.pluck(text,unfilteredObj);
	unfilteredStationDist = R.pluck("station_dist",unfilteredObj);
	var filtered = {
		x: filteredStationDist,
		y: filteredVar,
		mode: 'markers',
		type: 'scatter',
		marker:{color: colorDict[text],opacity:0.8}
	}
	var unfiltered = {
		x: unfilteredStationDist,
		y: unfilteredVar,
		mode: 'markers',
		type: 'scatter',
		marker:{color: 'Grey',opacity:0.1}
	}
		layout = {title: text + " vs distance to nearest train station",
	titlefont: {
	      family: 'Courier New, monospace',
	      size: 18,
	      color: '#7f7f7f'
	    },
    hovermode:'closest',
    margin: {
		    l: 50,
		    r: 50,
		    b: 30,
		    t: 30,
		    pad: 4  		}

		}
	data = [unfiltered,filtered];
	filter = ["in", "sa1_7digit"]
	strFilter = R.union(filter,selectedSa1s)
	console.log(strFilter)
	map.setFilter('highlight', strFilter)
	// Plotly.newPlot(plot, data, layout);
	
}

//a->b
function charter(id){
	chid = "#" + id;
	chart = dc.barChart("#"+id);
	chartDim = facts.dimension(function(d){return d[id]});
	tops = (chartDim.filterAll().top(1)[0][id]);
	scaler = d3.scale.quantize()
			.domain(rangeTwenty(tops))
			.range(rangeTwenty(tops))
	console.log(tops);
	chartGroupCount = chartDim.group(function(d){return scaler(d)}).reduceCount();
	return chart.width(240)
		.height(120)
		.title(id)
		.margins({top: 10, right: 10, bottom: 20, left: 30})
		.dimension(chartDim)
		.group(chartGroupCount)
		.transitionDuration(500)
		.on("filtered", updatePlot)
		.centerBar(false)
		.elasticY(true)
		.x(d3.scale.linear().domain([0,tops]))
		.xUnits(function(){return 30;})
			.xAxis().ticks(2)
} 
function convert(n) {
    var order = Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
    return Math.pow(10,order);
}

function rangeTwenty(tops){
	return R.map(R.product([(tops/30),R.__]),d3.range(0,30))
}


R.map(charter, properties)

dc.renderAll()

// properties

// var ageChart = dc.barChart("#median_age");
// var ageVal = facts.dimension(function(d){return d.median_age;});
// var ageValGroupCount = ageVal.group();

// ageChart.width(240)
// 	.height(120)
// 	.margins({top: 10, right: 10, bottom: 20, left: 30})
// 	.dimension(ageVal)
// 	.group(ageValGroupCount)
// 	.transitionDuration(500)
// 	.centerBar(true)
// 	.elasticY(true)
// 	.x(d3.scale.linear().domain([0,90]))
