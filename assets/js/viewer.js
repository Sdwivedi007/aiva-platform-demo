class Viewer {
  constructor() {
    this.potreeViewer = null;
    this.animate = this.animate.bind(this);
  }

  async initialize() {
    try {
      this.potreeViewer = new Potree.Viewer(document.getElementById("potree_render_area"));
      this.potreeViewer.setPointBudget(1000000);
      this.potreeViewer.setBackground('skybox');
      this.potreeViewer.loadSettingsFromURL();
      this.potreeViewer.loadGUI();

      this.animate(); // Start custom loop

      console.log("Potree viewer initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing viewer:", error);
      return false;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (typeof TWEEN !== 'undefined') {
      TWEEN.update(); // Animate camera transitions
    }

    if (this.potreeViewer) {
      this.potreeViewer.update();
      this.potreeViewer.render();
    }
  }
}

window.viewer = new Viewer();

//# sourceURL=Potree_1.8.2/libs/other/BinaryHeap.js
