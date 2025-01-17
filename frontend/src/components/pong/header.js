import { createComponent } from "/src/utils/component.js";
import { subscribe } from "/src/services/eventEmitter.js";

export const header = createComponent({
  tag: "header",

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
    function updatePath(route) {
      console.log("updatePath called with route:", route);
      const pathElement = el.querySelector("#shipctrl-path");

      if (!route) {
        route = window.location.pathname;
      }

      if (route.startsWith("/pong")) {
        pathElement.textContent = `shipctrl:///appData/useless${route}.shp`;
      } else {
        pathElement.textContent = `shipctrl:///appData${route}.shp`;
      }
    }

    updatePath(window.location.pathname);

    subscribe("routeChanged", updatePath);

    // window.addEventListener("popstate", () => updatePath(window.location.pathname));
  }
});
