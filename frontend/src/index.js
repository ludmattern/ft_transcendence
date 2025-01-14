import { buildScene } from "/src/3d/main.js";
import { handleRoute } from "/src/services/router.js";
import ComponentManager from "/src/utils/component.js";

// Initialisation des gestionnaires
const componentManagers = {
  HUD: new ComponentManager("HUD"),
  Pong: new ComponentManager("Pong"),
};

const menu2 = document.getElementById('menu2');
if (menu2) {
  const parent = menu2.parentNode;

  Object.defineProperty(parent, 'innerHTML', {
    set(value) {
      console.log('innerHTML modification detected on parent of menu2');
      console.log('New value:', value);
      console.log('Call stack:', new Error().stack);
    },
  });
}

export default componentManagers;

async function initializeApp() {
  console.log("App initialized");
  buildScene();
  handleRoute(window.location.pathname);
  document.getElementById("waiting-screen-effect").classList.add("d-none");
}

initializeApp();
