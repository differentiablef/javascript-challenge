// Store our API endpoint inside data_path
var data_path = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// color map used on magnitude
var color_map = new Rainbow();
var data = undefined; // debuging
// request data from data_path
d3.json(
    data_path,
    (objs) => {data = objs;  createFeatures(objs.features);}
);
var max_mag = 7.0,
    min_mag = 1.0;

function createFeatures(earthquakeData)
{

    
    // function runs once for each feature in the features array
    // gives each feature a popup describing the place and time
    //     of the earthquake
    function onEachFeature(feature, layer)
    {
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3><hr>` +
                `<p> Datatime: ${new Date(feature.properties.time)}</p>` +
                `<p> Magnitude: ${feature.properties.mag} </p>` 
        );        
    }

    // function runs once for each feature, passes in lat/lon and returns 
    // layer which will be drawn indicating the feature on the map
    function pointToLayer(feature, latlng)
    {
        let sval = (feature.properties.mag - min_mag)/(max_mag - min_mag);
        return L.circle(
            latlng,
            { // display attributes
                fillColor: `#${color_map.colorAt(100-Math.ceil(sval*50+50))}`, 
                fillOpacity: 0.6*sval + 0.4,
                radius: Math.pow( feature.properties.mag, 1 )* 10000,
                stroke: false
            }
        );
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(
        earthquakeData,
        {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer
        }
    );

    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
        {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
        }
    );

    var darkmap = L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
        {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
        }
    );

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map(
        "map", {
            center: [ 37.167718, -119.448543 ],
            zoom: 5,
            layers: [ darkmap,
                      earthquakes ]
        }
    );

    // Add the layer control to the map
    L.control
        .layers(baseMaps, overlayMaps, {collapsed: false})
        .addTo(myMap);

    // create color legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

	    var ldiv = L.DomUtil.create('div', 'info legend'),
            div = d3.select(ldiv),
		    grades = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
		    labels = [];

        div.append('div').text('Magnitude');

        grades.forEach(
            function (val)
            {
                div.append('i')
                    .attr('style', `background:#${color_map.colorAt(val-50)};`);
                div.append('div')
                    .text(`${parseFloat((1-((val)-50)/50) * (max_mag - min_mag) + min_mag).toFixed(2)}`);
                //div.append('br');
            }
        );
        
	    return ldiv;
    };

    legend.addTo(myMap);
}

