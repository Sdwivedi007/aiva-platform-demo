console.log("GIS App Loaded");

let map = null; 

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  setupEventListeners();
  initializeToolbar();
});

function initMap() {
  map = L.map('map').setView([28.6139, 77.2090], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    if (layer instanceof L.Polygon) {
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      layer.bindPopup(`Area: ${(area / 1_000_000).toFixed(2)} km²`).openPopup();
    }
  });

  console.log('Map initialized');
}

function setupEventListeners() {
  document.getElementById('fileUpload')?.addEventListener('change', handleFileUpload);
  document.getElementById('volumeAnalysis')?.addEventListener('click', () => {
    alert('Volume analysis feature coming soon!');
  });
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // If viewer is not defined globally, create and initialize it.
  if (!window.viewer) {
    // Assume that the Viewer class is declared in viewer.js and is globally accessible.
    window.viewer = new Viewer();
    window.viewer.initialize().then(() => {
      loadPointCloud(file);
      toggleTo3DView();
    });
  } else {
    loadPointCloud(file);
    toggleTo3DView();
  }
}

function loadPointCloud(file) {
  const fileUrl = URL.createObjectURL(file);
  Potree.loadPointCloud(fileUrl, file.name, e => {
    // Use the global viewer instance to add the point cloud.
    window.viewer.potreeViewer.scene.addPointCloud(e.pointcloud);
    window.viewer.potreeViewer.fitToScreen();
    console.log('Point cloud loaded:', file.name);
  });
}

function toggleMap() {
  const mapDiv = document.getElementById('map');
  const potreeDiv = document.getElementById('potree_render_area');
  const button = document.querySelector('.view-toggle');

  if (mapDiv.style.display !== 'none') {
    toggleTo3DView();
  } else {
    potreeDiv.style.display = 'none';
    mapDiv.style.display = 'block';
    button.textContent = 'Switch to 3D';
  }
}

function toggleTo3DView() {
  document.getElementById('map').style.display = 'none';
  document.getElementById('potree_render_area').style.display = 'block';
  document.querySelector('.view-toggle').textContent = 'Switch to 2D';
}

function initializeToolbar() {
  const buttons = document.querySelectorAll('.toolbar .tool-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}
