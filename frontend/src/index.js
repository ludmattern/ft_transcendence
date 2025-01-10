import { loadComponent } from "/src/utils/dom_utils.js";
import { PongMenu } from "/src/components/pongMenu.js";
import { buildScene } from "/src/3d/main.js";
import { handleRoute } from "/src/services/router.js";

async function initializeApp() {
  console.log("App initialized");
  buildScene();
  handleRoute(window.location.pathname);
  document.getElementById("waiting-screen-effect").classList.add("d-none");
  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
}

initializeApp();
