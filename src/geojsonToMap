//for every property add a button with the properties name
properties = R.keys(sydneySa1.features[0].properties)
colors = chroma.scale('Set1').mode('lab').colors(properties.length);
colorDict = R.zipObj(properties,colors)


properties = ['car','public', 'stayed', 'ratio', 'other']
// sydneySa1
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
var smallsydsa2source = new mapboxgl.GeoJSONSource({
   data: smallsydsa2
});

desto = {"type":"FeatureCollection"}
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
		'id': 'destso',
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
jtwfilter = R.curry(jtwFilt)

function logs(x){
	return console.log(x);
	return x;
}

log = R.curry(logs)

sfeatures = desto.features
map.on("click", function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["syd1"] });
        if (features.length) {
        	map.setFilter("hover", ["==", "sa2_main11", features[0].properties.sa2_main11]);
            id = parseInt(features[0].properties.sa2_main11);
            //dest ids
            console.log(id)
            ids = jtwIds(id);
            objs = destObjs(id);
            // group dest id's
            Uids = R.uniq(ids)
            // filter objs by unique id's and merge
            grouped = R.map(R.pipe(jtwfilter,R.filter(R.__, objs)), Uids)
            merged = R.map(R.pipe(R.map(moder,R.__),R.mergeAll), grouped)
            // console.log(tObjs)
            desto.features = R.map(toFeature, merged).filter(Boolean)
            console.log(desto.features);
            // console.log(sa)
            dests.setData(desto)
            // log(desto.features)
        } else {
            // console.log('nah')
            // map.setFilter("route-hover", ["==", "name", ""]);
        }
    });
//function to take sa2_main11 and return a list of dest sa2_m's plus a number for each of those 
//
// id -> [ids] -> [features]

//id -> [ids]

//function picks text from properties and sets map style to choropleth of that property
function dataPropertyColor(text){
	console.log(text)
	props = R.map(R.path(['properties',text],R.__),desto.features)
	props = R.filter(function(x){return !(x==0);},props);
	// console.log(props);
	max = R.reduce(R.max,-Infinity,props);
	min = R.reduce(R.min,+Infinity,props)||0;
	console.log(colorDict[text]);
	colors5 = chroma.scale(['lightyellow',colorDict[text]]).mode('lch').colors(3);
	divs = [min,(min+max)/2,max];
	// console.log(R.zip(divs,colors5));
	newStyle = {
			property: text,
			stops: R.zip(divs,colors5)
            };
    map.setPaintProperty('destso','fill-color',newStyle)
}


function moder(obj){
	newObj = {}
	newObj['origin'] = obj.origin||0
	newObj['dest'] = obj.dest||0
	newObj['car'] = obj.car||0
	newObj['stayed'] = obj.stayed||0
	newObj['public'] = obj.public||0
	newObj['ratio'] = newObj.public/newObj.car||0
	if(newObj.dest == 117031337){console.log(.public)}
	keyT = obj.mode
	newObj[String(keyT)] = parseInt(obj.sum)
	return newObj
}
function toFeature(obj){
	tObj={};
	// tFeatre = {};
	// sa2feature = {}
	tObj['properties'] = obj;
	tFeatre = R.filter(sa2filter(obj.dest),smallsydsa2.features);
	// console.log(sa2feature[0])
	if (tFeatre.length >=1 ){
	tObj['geometry'] = tFeatre[0].geometry
	tObj['type'] = tFeatre[0].type
	return tObj;
	}else{}
}


function modeAgg(arr){
	tempObj = {}
	tempObj.append
}
function jtwIds(x){
	return R.pluck('dest',R.filter(R.propEq('origin',x),jtworigins.destination))
}

// group objs by destination
function destObjs(x){
	return R.filter(R.propEq('origin',x), jtworigins.destination)
}



//id -> {feature}

function sa2filt(id, obj){
	objId = parseInt(R.path(['properties','sa2_main11'], obj))
	id = parseInt(id)
	return R.equals(id, objId)
	}

function jtwFilt(id, obj){
	objId = parseInt(R.path(['dest'], obj))
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