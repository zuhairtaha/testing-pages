
// Initialize Lucide icons
lucide.createIcons();

// --- State Variables ---
let map;
let userMarker;
let watchId = null;
let isTracking = false;
let isDemoMode = false;
let demoInterval = null;
let demoStep = 0;

let currentPlaceName = "";
let lastGeocodedPos = null;
let ttsUtterance = null; 
let currentPolygonLayer = null; 
let surroundingMarkers = []; // Array to hold markers for nearby places

// Copenhagen Simulation Path (Lat, Lng)
// Starts near Vesterbro, goes through Frederiksberg, Nørrebro, to Nørreport
const demoPath = [
    { lat: 55.6669, lng: 12.5539 }, // Vesterbro
    { lat: 55.6720, lng: 12.5480 }, // Moving...
    { lat: 55.6780, lng: 12.5330 }, // Frederiksberg
    { lat: 55.6850, lng: 12.5450 }, // Moving...
    { lat: 55.6920, lng: 12.5490 }, // Nørrebro
    { lat: 55.6890, lng: 12.5600 }, // Moving...
    { lat: 55.6833, lng: 12.5714 }, // Nørreport
    { lat: 55.6761, lng: 12.5683 }, // Indre By (City Center)
];

// --- Initialization ---
function initMap() {
    // Default center: Copenhagen area
    map = L.map('map', {
        zoomControl: false // Hide default zoom for cleaner UI
    }).setView([55.6761, 12.5683], 12);

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19
    }).addTo(map);

    // Custom car/location icon
    const carIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative">
                    <div class="absolute inset-0 rounded-full bg-blue-500 live-indicator opacity-0" id="pulse-ring"></div>
                </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    userMarker = L.marker([55.6761, 12.5683], {icon: carIcon}).addTo(map);
    userMarker.setOpacity(0); // Hide until we have a location
}

// --- Speech Synthesis ---
function speakPlace(placeName) {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const textToSpeak = placeName;
    ttsUtterance = new SpeechSynthesisUtterance(textToSpeak);
    ttsUtterance.lang = 'da-DK'; // Force Danish pronunciation
    
    // Try to find a specific Danish voice
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(v => v.lang.includes('da-') || v.lang === 'da');
    if(preferredVoice) ttsUtterance.voice = preferredVoice;

    ttsUtterance.rate = 0.9; // Slightly slower, easier to understand while driving
    ttsUtterance.pitch = 1.0;

    window.speechSynthesis.speak(ttsUtterance);
}

// --- Fetch Surrounding Places (Visual Labels Only) ---
async function fetchSurroundingPlaces(lat, lng) {
    try {
        // Query OpenStreetMap (Overpass API) for places within a 4km radius
        const query = `[out:json][timeout:5];
        (
          node["place"~"city|town|suburb|neighbourhood|quarter"](around:4000, ${lat}, ${lng});
        );
        out body;`;
        
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) return;
        const data = await response.json();
        
        // Clear old markers
        surroundingMarkers.forEach(m => map.removeLayer(m));
        surroundingMarkers = [];
        
        if (data && data.elements) {
            // Use a Set to avoid duplicating names and to filter out the current place
            const seenNames = new Set([currentPlaceName]); 
            
            data.elements.forEach(el => {
                const name = el.tags && el.tags.name;
                if (name && !seenNames.has(name)) {
                    seenNames.add(name);
                    
                    // Create custom floating label
                    const icon = L.divIcon({
                        className: 'surrounding-label-container',
                        html: `<div class="surrounding-label-content">${name}</div>`,
                        iconSize: [0, 0] // Let CSS handle the positioning
                    });
                    
                    const marker = L.marker([el.lat, el.lon], {icon, interactive: false}).addTo(map);
                    surroundingMarkers.push(marker);
                }
            });
        }
    } catch (error) {
        console.error("Failed to fetch surrounding places:", error);
    }
}

// --- Geocoding (Lat/Lon to Address) ---
async function fetchPlaceName(lat, lng) {
    try {
        // Nominatim OpenStreetMap API (Free, no key required. Using Accept-Language to prefer local names)
        // Added polygon_geojson=1 to get the actual boundaries of the area
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&polygon_geojson=1`;
        
        const response = await fetch(url, {
            headers: { 'Accept-Language': 'da,en-US,en;q=0.9' } // Prefer Danish/English names
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        
        if (data && data.address) {
            const addr = data.address;
            // Hierarchy of preferred area names for driving
            const place = addr.neighbourhood || addr.suburb || addr.city_district || addr.quarter || addr.village || addr.town || addr.city || addr.municipality;
            const region = addr.city || addr.state || addr.country;
            
            return { place, region, geojson: data.geojson };
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    return null;
}

// --- Location Update Logic ---
async function handleLocationUpdate(lat, lng) {
    // 1. Update Map Marker
    userMarker.setLatLng([lat, lng]);
    userMarker.setOpacity(1);
    map.panTo([lat, lng], { animate: true, duration: 1 });
    
    document.getElementById('pulse-ring').classList.remove('opacity-0');

    // 2. Check if we moved enough to warrant an API call (e.g., > 200 meters)
    // This prevents spamming the API when sitting at a red light.
    if (lastGeocodedPos) {
        const distance = map.distance([lat, lng], [lastGeocodedPos.lat, lastGeocodedPos.lng]);
        if (distance < 200) {
            return; // Haven't moved far enough
        }
    }

    // 3. Fetch Place Name
    const locationData = await fetchPlaceName(lat, lng);
    
    if (locationData && locationData.place) {
        lastGeocodedPos = { lat, lng };
        const newPlace = locationData.place;

        // 4. Announce if place changed
        if (newPlace !== currentPlaceName) {
            currentPlaceName = newPlace;
            updateUIPlace(currentPlaceName, locationData.region);
            speakPlace(currentPlaceName);
            
            // Fetch surrounding areas to display on map as text labels
            fetchSurroundingPlaces(lat, lng);
            
            // 5. Draw the boundaries of the new area
            if (currentPolygonLayer) {
                map.removeLayer(currentPolygonLayer);
            }
            
            if (locationData.geojson) {
                currentPolygonLayer = L.geoJSON(locationData.geojson, {
                    style: {
                        color: '#3b82f6', // Blue border
                        weight: 3,
                        opacity: 0.8,
                        fillColor: '#3b82f6', // Light blue fill
                        fillOpacity: 0.15
                    }
                }).addTo(map);
            }
        }
    }
}

function updateUIPlace(place, region) {
    const placeEl = document.getElementById('current-place');
    const regionEl = document.getElementById('current-region');
    
    // Animation effect
    placeEl.style.transform = 'scale(0.95)';
    placeEl.style.opacity = '0.5';
    
    setTimeout(() => {
        placeEl.innerText = place;
        regionEl.innerText = region ? region : '';
        placeEl.style.transform = 'scale(1)';
        placeEl.style.opacity = '1';
    }, 150);
}

// --- Real GPS Tracking ---
function toggleTracking() {
    if (isDemoMode) stopDemo();

    if (isTracking) {
        stopTracking();
    } else {
        startTracking();
    }
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    // Init audio context securely on user click
    const initUtterance = new SpeechSynthesisUtterance("GPS initialized.");
    initUtterance.volume = 0; // Silent init
    window.speechSynthesis.speak(initUtterance);

    isTracking = true;
    updateStatus("Acquiring GPS signal...", "bg-yellow-500");
    
    document.getElementById('btn-start').classList.replace('bg-blue-600', 'bg-red-600');
    document.getElementById('btn-start').classList.replace('hover:bg-blue-500', 'hover:bg-red-500');
    document.getElementById('btn-start-text').innerText = "Stop Driving Mode";
    document.querySelector('#btn-start i').setAttribute('data-lucide', 'square');
    lucide.createIcons();

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            updateStatus("Live GPS Tracking", "bg-green-500");
            handleLocationUpdate(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            console.error("GPS Error:", error);
            updateStatus("GPS Signal Lost", "bg-red-500");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
}

function stopTracking() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    isTracking = false;
    lastGeocodedPos = null;
    currentPlaceName = "";
    document.getElementById('pulse-ring').classList.add('opacity-0');
    
    if (currentPolygonLayer) {
        map.removeLayer(currentPolygonLayer);
        currentPolygonLayer = null;
    }
    
    // Clear surrounding labels
    surroundingMarkers.forEach(m => map.removeLayer(m));
    surroundingMarkers = [];
    
    updateStatus("Tracking Stopped", "bg-slate-500");
    document.getElementById('btn-start').classList.replace('bg-red-600', 'bg-blue-600');
    document.getElementById('btn-start').classList.replace('hover:bg-red-500', 'hover:bg-blue-500');
    document.getElementById('btn-start-text').innerText = "Start Driving Mode";
    document.querySelector('#btn-start i').setAttribute('data-lucide', 'navigation');
    lucide.createIcons();
    
    document.getElementById('current-place').innerText = "Unknown Location";
    document.getElementById('current-region').innerText = "Press Start to locate";
}

// --- Demo Mode ---
function toggleDemo() {
    if (isTracking) stopTracking();

    if (isDemoMode) {
        stopDemo();
    } else {
        startDemo();
    }
}

function startDemo() {
    // Init audio context securely on user click
    const initUtterance = new SpeechSynthesisUtterance("");
    initUtterance.volume = 0;
    window.speechSynthesis.speak(initUtterance);

    isDemoMode = true;
    demoStep = 0;
    lastGeocodedPos = null;
    currentPlaceName = "";
    
    updateStatus("Simulation Active", "bg-purple-500");
    document.getElementById('btn-demo').classList.replace('bg-slate-700', 'bg-purple-600');
    document.getElementById('btn-demo').classList.replace('hover:bg-slate-600', 'hover:bg-purple-500');
    document.getElementById('btn-demo-text').innerText = "Stop Simulation";
    
    // Zoom in a bit for demo
    map.setZoom(14);

    // Run simulation steps
    runDemoStep();
    demoInterval = setInterval(runDemoStep, 4000); // Move every 4 seconds
}

function runDemoStep() {
    if (demoStep >= demoPath.length) {
        demoStep = 0; // Loop back
    }
    const pos = demoPath[demoStep];
    handleLocationUpdate(pos.lat, pos.lng);
    demoStep++;
}

function stopDemo() {
    clearInterval(demoInterval);
    isDemoMode = false;
    document.getElementById('pulse-ring').classList.add('opacity-0');
    
    if (currentPolygonLayer) {
        map.removeLayer(currentPolygonLayer);
        currentPolygonLayer = null;
    }
    
    // Clear surrounding labels
    surroundingMarkers.forEach(m => map.removeLayer(m));
    surroundingMarkers = [];
    
    updateStatus("Ready to start", "bg-slate-500");
    document.getElementById('btn-demo').classList.replace('bg-purple-600', 'bg-slate-700');
    document.getElementById('btn-demo').classList.replace('hover:bg-purple-500', 'hover:bg-slate-600');
    document.getElementById('btn-demo-text').innerText = "Simulate Drive";
    
    document.getElementById('current-place').innerText = "Unknown Location";
    document.getElementById('current-region').innerText = "Press Start to locate";
}

// --- Utilities ---
function updateStatus(text, colorClass) {
    document.getElementById('status-text').innerText = text;
    const dot = document.getElementById('status-dot');
    dot.className = `w-2 h-2 rounded-full ${colorClass}`;
    if(colorClass.includes('green') || colorClass.includes('purple')) {
        dot.classList.add('animate-pulse');
    } else {
        dot.classList.remove('animate-pulse');
    }
}

// Initialize Map on Load
window.onload = () => {
    initMap();
    // Try to load voices proactively
    if(window.speechSynthesis) window.speechSynthesis.getVoices();
};

