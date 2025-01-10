import { loadComponent } from "/src/utils/dom_utils.js";
import { testloadComponent } from "/src/utils/virtualDOM.js";
import { PongMenu } from "/src/components/pongMenu.js";
import { midScreen } from "/src/components/midScreen.js";
import { HelmetSVG, HUDSVG } from "/src/components/hud/index.js";
import { buildScene } from "/src/3d/main.js";
import { isClientAuthenticated } from "/src/services/auth.js";
import { handleRoute } from "/src/services/router.js";

async function initializeApp() {
	console.log("App initialized");
	buildScene();
  loadSVGComponents();

  handleRoute(window.location.pathname);
    document.getElementById("waiting-screen-effect").classList.add("d-none");

  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
}

function loadSVGComponents() {
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});
    loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});
  });
}

export function setActiveLink(linkId) {
  document.querySelectorAll("header a").forEach((link) => {
    link.classList.remove("active");
  });

  if (!linkId) return;

  const activeLink = document.getElementById(linkId);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

initializeApp();
