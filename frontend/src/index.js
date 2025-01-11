import { buildScene } from "/src/3d/main.js";
import { handleRoute } from "/src/services/router.js";
import ComponentManager from "/src/utils/component.js";

// Initialisation des gestionnaires
const componentManagers = {
  HUD: new ComponentManager("HUD"),
  Pong: new ComponentManager("Pong"),
};

export default componentManagers;


async function initializeApp() {
  console.log("App initialized");
  buildScene();
  handleRoute(window.location.pathname);
  document.getElementById("waiting-screen-effect").classList.add("d-none");
}


initializeApp();
