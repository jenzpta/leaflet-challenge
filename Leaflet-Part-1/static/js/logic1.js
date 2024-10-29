// Store our API endpoint as quakeUrl.
let quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the quakeUrl.
d3.json(quakeUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // A function to determine the marker size based on the magnitude of the earthquake.
  function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 5;
  }

  // A function to determine marker color based on depth.
  function markerColor(depth) {
    return depth > 90 ? '#ff5e6e' :
           depth > 70 ? '#fca35d' :
           depth > 50 ? '#fdb72a' :
           depth > 30 ? '#f7db11' :
           depth > 10 ? '#dcf400' :
                        '#a3f600';
  }
  // A function to define the circle markers for each earthquake
  // Create a circle marker with size proportional to magnitude and color based on depth.
  function pointToLayer(feature, latlng) {    
    return L.circleMarker(latlng, {
      radius: markerSize(feature.properties.mag),
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: '#000',
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    });
  }
  // Bind a popup to each marker to display earthquake details.
  function onEachFeature(feature, layer){
    layer.bindPopup(`
      <h3>${feature.properties.place}</h3>
      <hr>
      <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
      <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
      <p>${new Date(feature.properties.time)}</p>
    `);
  }

  // Create a GeoJSON layer 
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  // Send the earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
   // Create the base layers.
   let grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

  // Create a baseMaps object.
  let baseMaps = {
    "Grayscale": grayscale
  };

  // Create an overlay object to hold our overlay layer.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map with default layers.
  let myMap = L.map("map", {
    center: [37.09, -95.71], // Centered on the USA
    zoom: 4.5,
    layers: [grayscale, earthquakes]
  });




// Define a legend and its position on the map
let legend = L.control({ position: 'bottomright' });

// A function to add legend
function addLegend() {
  // Create a new div element with the class 'legend'
  let div = L.DomUtil.create('div', 'legend');

  // Add inner HTML content (colored boxes and text) to the legend div
  div.innerHTML = '<b>Depth (km)</b><br>';
  div.innerHTML += '<i style="background: #a3f600"></i> -10-10<br>';
  div.innerHTML += '<i style="background: #dcf400"></i> 10-30<br>';
  div.innerHTML += '<i style="background: #f7db11"></i> 30-50<br>';
  div.innerHTML += '<i style="background: #fdb72a"></i> 50-70<br>';
  div.innerHTML += '<i style="background: #fca35d"></i> 70-90<br>';
  div.innerHTML += '<i style="background: #ff5e6e"></i> 90+<br>';

  // Return the div to display it on the map
  return div;
}

// Assign the addLegend function to the legend's onAdd property
legend.onAdd = addLegend;

// Add legend to the map
legend.addTo(myMap);
 
}
