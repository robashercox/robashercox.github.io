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
// properties = R.keys(sydneySa1.features[0].properties)

// colors = chroma.scale('Set1').mode('lab').colors(properties.length);

// colorDict = R.zipObj(properties,colors)


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
var smallsydsa2source = new mapboxgl.GeoJSONSource({
   data: smallsydsa2
});

desto = {"type":"FeatureCollection", "Features":[]}
var dests = new mapboxgl.GeoJSONSource({
	data: desto
})
// var votesSource = new mapboxgl.GeoJSONSource({
//    data: newvotes
// });
//render GeoJSON source to map
map.on('load', function () {
	map.addSource('syd', smallsydsa2source);
	map.addSource('dests', dests);
	map.addLayer({
		'id': 'syd1',
		'type': 'fill',
		'source': 'syd',
		'layout': {},
		'paint': {
			'fill-color': '#088',
			'fill-opacity': 0.1,
		}
	});	
	map.addLayer({
		'id': 'syd2',
		'type': 'fill',
		'source': 'dests',
		'layout': {},
		'paint': {
			'fill-color': '#088',
			'fill-opacity': 0.8,
		}
	});	
	map.addLayer({
		'id': 'hover',
		'type': 'fill',
		'source': 'syd',
		'layout': {},
		'paint': {
			'fill-color': '#088',
			'fill-opacity': 0.5,
		},
		"filter": ["==", "name", ""]
	});
});

sa2filter = R.curry(sa2filt)

sfeatures = desto.features
map.on("click", function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["syd1"] });
        if (features.length) {
        	map.setFilter("hover", ["==", "sa2_main11", features[0].properties.sa2_main11]);
            id = parseInt(features[0].properties.sa2_main11);
            ids = jtwIds(id);
            // console.log(ids);
            tObjs = R.map(R.pipe(sa2filter, R.filter(R.__, smallsydsa2.features), ), ids)
            // console.log(tObjs)
            desto.features = R.reduce(R.concat, [], tObjs)
            // console.log(desto.features);
            dests.setData(desto)
        } else {
            // console.log('nah')
            // map.setFilter("route-hover", ["==", "name", ""]);
        }
    });
//function to take sa2_main11 and return a list of dest sa2_m's plus a number for each of those 
//
// id -> [ids] -> [features]

//id -> [ids]


function jtwIds(x){
	return R.pluck('dest',R.filter(R.propEq('origin',x),jtworigins.destination))
}

//id -> {feature}

function filteredSa2(ids){
	return R.map(R.filter(sa2filter, smallsydsa2.features), ids)
}
// R.map(R.pipe(sa2filter, R.filter(R.__, smallsydsa2.features)), ids)


function sa2filt(id, obj){
	objId = parseInt(R.path(['properties','sa2_main11'], obj))
	id = parseInt(id)
	return R.equals(id, objId)
	}


R.map(R.path(['features', 'properties']),smallsydsa2.features)

 // Reset the route-hover layer's filter when the mouse leaves the map
map.on("mouseout", function() {
    map.setFilter("route-hover", ["==", "name", ""]);
});
map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['syd1'] });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});