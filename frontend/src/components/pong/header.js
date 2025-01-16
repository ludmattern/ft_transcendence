import { createComponent } from "/src/utils/component.js";

export const header = createComponent({
  tag: "header",

  // Générer le HTML
  render: () => `
    <div class="col-2 text-center">
        <h1 class="bi bi-rocket fs-5 m-0">TRANSCENDENCE</h1>
    </div>
    <span class="separator"></span>
    <!-- Bloc droit -->
    <div class="col-8 d-flex justify-content-around border p-1" 
         style="background-color: #084b4e; text-transform: uppercase;">
        <span id="shipctrl-path" class="m-0">shipctrl:///appData/useless/home.shp</span>
        <span class="m-0 text-secondary">Powered by ubuntu <i class="bi bi-ubuntu"></i></span>
    </div>
  `,

  attachEvents: (el) => {
    function updatePath() {
      const pathElement = el.querySelector("#shipctrl-path");
      const currentPath = window.location.pathname;

      if (currentPath.startsWith("/pong")) {
        pathElement.textContent = `shipctrl:///appData/useless${currentPath}.shp`;
      } 
    }

    // Mettre à jour le chemin au chargement
    updatePath();

    // Surveiller les changements d'URL (ex: navigation arrière/avant)
    window.addEventListener("popstate", updatePath);
  }
});
