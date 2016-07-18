mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FydGhkYmVldGxlIiwiYSI6ImNpcHl5emhrdjB5YmxoY25yczF6MHhhc2IifQ.2Ld30uLqcffVv-RUAWk_qQ';

//instantiate map
map = new mapboxgl.Map({
				    container: 'map',
				    style: 'mapbox://styles/mapbox/light-v9',
				    center: [151.102, -33.82],
				    zoom: 9
				});

// get data and convert to GeoJSON source
var sydneySa1Source = new mapboxgl.GeoJSONSource({
   data: sydneySa1
});
test = {}
test['features'] = R.difference(votes.features,R.filter(R.propEq("geometry", null), votes.features));
newvotes = R.mergeAll([{type:votes.type},{crs:votes.crs},test])

var votesSource = new mapboxgl.GeoJSONSource({
   data: votes
});

//render GeoJSON source to map
map.on('load', function () {

	map.addSource('votes1', votesSource);
	// map.addLayer({
	// 	'id': 'syd1',
	// 	'type': 'fill',
	// 	'source': 'syd',
	// 	'layout': {},
	// 	'paint': {
	// 		'fill-color': '#088',
	// 		'fill-opacity': 0.8
	// 	}
	// });

	map.addLayer({
	    "id": "votesL",
	    "type": "circle",
	    "source": 'votes1',
	    "layout": {},
	    "paint": {
    		// "circle-radius":1.75,
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