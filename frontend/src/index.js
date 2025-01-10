import { loadComponent } from "/src/utils/dom_utils.js";
import { PongMenu } from "/src/components/pongMenu.js";
import { game2 } from "/src/components/game2.js";
import { midScreen } from "/src/components/midScreen.js";
import { HelmetSVG, HUDSVG } from "/src/components/hud/index.js";
import { buildScene } from "/src/3d/main.js";
import { isClientAuthenticated } from "/src/services/auth.js";
import { handleRoute } from "/src/services/router.js";

async function initializeApp() {
  console.log("App initialized");
  loadSVGComponents();

  const isAuthenticated = await isClientAuthenticated();

  if (!isAuthenticated) {
    handleRoute("/login");
  } else {
    document.getElementById("waiting-screen-effect").classList.add("d-none");
    handleRoute(window.location.pathname);
  }

  loadComponent("race-placeholder", game2, "", () => {});
  loadComponent("mid-placeholder", midScreen, "", () => {});
  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
  buildScene();
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
