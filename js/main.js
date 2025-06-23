console.log("GIS App Loaded");

// Initialize map
let map, potreeViewer;

function initMap() {
    map = L.map('map').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// In your main <script> tag
function getMarkerIcon(category) {
    // ... (Your logic to find the category)
    const config = iconMapping[normalizedCategory] || iconMapping["default"];
    return L.divIcon({
        className: 'marker-icon',
        html: `<i class="${config.icon}" style="color: ${config.color};"></i>`,
        iconSize: [24, 24],     // The clickable area
        iconAnchor: [12, 12]    // Center the icon on the coordinate
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    // Move your DOM manipulation code here
});