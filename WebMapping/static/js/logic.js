// Store our API endpoint inside queryUrl
var data_path = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Perform a GET request to the query URL
d3.json(
    data_path,
    function(data)
    {
        // Once we get a response, send the data.features object to the createFeatures function
        createFeatures(data.features);
    }
);

function createFeatures(earthquakeData)
{

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            "<h3>" + feature.properties.place + "</h3>" +
                "<hr>" +
                "<p> Datatime: " + new Date(feature.properties.time) + "</p>" +
                "<p> Magnitude: " + feature.properties.mag + "</p>" 
                
        );
    }

    function pointToLayer(feature, latlng) {
        return L.circle(
            latlng,
            { // display attributes
                color: "green", 
                fillColor: "blue",
                fillOpacity: feature.properties.mag/6,
                radius: Math.pow(feature.properties.mag, 2)*1500
            }
        );
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(
        earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer
        });

    // Sending our earthquakes layer to the createMap function
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

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control
        .layers(baseMaps, overlayMaps, {collapsed: false})
        .addTo(myMap);
}
