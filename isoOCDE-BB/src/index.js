// Add token
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZ2VwYXRpbm8iLCJhIjoiY2x2eGx5Z3MxMG9ndDJxb2duOThhMzhpeiJ9.PV5UT8ZSCZtr7_x4_oxwgQ';

// Create variables for starting map and destination point for isochrones
const lon = 2.22414363312703;
const lat = 48.83802001493957;

const map = new mapboxgl.Map({
container: 'map', // container id
style: 'mapbox://styles/mapbox/streets-v12', // stylesheet
center: [lon, lat], // starting position [lng, lat] OCDE BB 
zoom: 11.5 // starting zoom
});

// Target the params form in the HTML
const params = document.getElementById('params');

// Create variables to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
// const lon = 2.22414363312703;
// const lat = 48.83802001493957;
let profile = 'cycling';
let minutes = 10;

// Set up a marker that you can use to show the query's coordinates
const marker = new mapboxgl.Marker({
'color': '#8B0000'
});

// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
const lngLat = {
lon: lon,
lat: lat
};

// Create a function that sets up the Isochrone API query then makes a fetch call
async function getIso() {
const query = await fetch(
    `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
);
const data = await query.json();
// Set the 'iso' source's data to what's returned by the API query
map.getSource('iso').setData(data);
}

// When a user changes the value of profile or duration by clicking a button, change the parameter's value and make the API query again
params.addEventListener('change', (event) => {
if (event.target.name === 'profile') {
    profile = event.target.value;
} else if (event.target.name === 'duration') {
    minutes = event.target.value;
}
getIso();
});

map.on('load', () => {
// When the map loads, add the source and layer
map.addSource('iso', {
    type: 'geojson',
    data: {
    'type': 'FeatureCollection',
    'features': []
    }
});

map.addLayer(
    {
    'id': 'isoLayer',
    'type': 'fill',
    'source': 'iso',
    'layout': {},
    'paint': {
        'fill-color': '#5a3fc0',
        'fill-opacity': 0.3
    }
    },
    'poi-label'
);

// Initialize the marker at the query coordinates
marker.setLngLat(lngLat).addTo(map);

// Make the API call
getIso();
});

// Add a geocoder
const geocoder = new MapboxGeocoder({
// Initialize the geocoder
accessToken: mapboxgl.accessToken, // Set the access token
placeholder: 'Busca una dirección',
mapboxgl: mapboxgl, // Set the mapbox-gl instance
marker: true // Use the default marker style
});

// Add the geocoder to the map
map.addControl(geocoder, 'bottom-left');

// After the map style has loaded on the page,
// add a source layer and default styling for a single point
map.on('load', () => {
    map.addSource('single-point', {
        type: 'geojson',
        data: {
        type: 'FeatureCollection',
        features: []
        }
    });

// Listen for the `result` event from the Geocoder
// `result` event is triggered when a user makes a selection
//  Add a marker at the result's coordinates
geocoder.on('result', (event) => {
    map.getSource('single-point').setData(event.result.geometry);
});

});    
// Add a scale bar in metric units
const scalebar = new mapboxgl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
});

map.addControl(scalebar);

// Add zoom control ( + / -, reset orientation to North)
map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'bottom-left');