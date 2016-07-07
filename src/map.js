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

// function colorEntry(name){
// 	colorDict[name] = String(chroma.random())
// }

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
//render GeoJSON source to map
map.on('load', function () {
	map.addSource('syd', sydneySa1Source);
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

//function that adds a button to el with ID elID, and calls that button text
function dataPropertyButton(elID, text){
	el = $('#'+elID)
	el.append($('<div>%s</div>'.replace('%s', text)).toggleClass('pure_button block ab').css("background-color",colorDict[text]));
	
	// change background colour and set opacity = 0.2
}


// R.map(colorEntry,properties)

addCtrlButtons = R.curry(dataPropertyButton)("controls")
R.map(addCtrlButtons, properties)


//add listener to button container div with id elID
function containerListener(elID){
	el = $('#'+elID);
	el.click(function(event){
		console.log(event.target.textContent);
		dataPropertyColor(event.target.textContent);
		createPlot(event.target.textContent);
		}) 
    }

containerListener("controls",dataPropertyColor)

//picks text from properties and sets map style to choropleth of that property
function dataPropertyColor(text){
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
//picks text from properties and creates plotly scatter plot of that property
function createPlot(text){
	stationDist = R.map(R.path(['properties','station_dist'],R.__),sydneySa1.features)
	otherVar = R.map(R.path(['properties',text],R.__),sydneySa1.features)
	var plot = {
		x: stationDist,
		y: otherVar,
		mode: 'markers',
		type: 'scatter',
		marker:{color: colorDict[text]}
	}
	data = [plot]
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
		    pad: 4
  		}

		}
	plot = document.getElementById('plot');
	Plotly.newPlot(plot, data, layout)
	plot.on('plotly_selected', function(e){
		pointNumbers = R.pluck("pointNumber",e.points);
		// console.log(pointNumbers);
		pickSa1 = pick(sa17_digits);
		// console.log(sa17_digits);
		selectedSa1s = R.map(pickSa1,pointNumbers);
		// console.log(selectedSa1s);
		// overRideStyling(selectedSa1s);
		filter = ["in","sa1_7digit"]
		strFilter = R.union(filter,selectedSa1s)
		// console.log(strFilter)
		map.setFilter('highlight', strFilter)
	})
}

//convert point IDs to sa17digit
sa17_digits = R.map(R.path(['properties','sa1_7digit'],R.__),sydneySa1.features)


function pick(array,i){
	return array[i];
}
pick = R.curry(pick)
