import { loadComponent } from "/src/utils/dom_utils.js";
import { Header } from "/src/components/header.js";
import { LeftSideWindow } from "/src/components/leftSideWindow.js";
import { RightSideWindow } from "/src/components/rightSideWindow.js";
import { PongMenu } from "/src/components/pongMenu.js";
import { game2 } from "/src/components/game2.js";
import { midScreen } from "/src/components/midScreen.js";
import { HelmetSVG } from "/src/components/HelmetSVG.js";
import { HUDSVG } from "/src/components/HUDSVG.js";
import { Footer } from "/src/components/footer.js";
import { buildScene } from "/src/3d/main.js";
import { isClientAuthenticated } from "/src/services/auth.js";
import { handleRoute } from "/src/services/router.js";
import { navigateToLogin } from "/src/services/navigation.js";

async function initializeApp() {

	console.log("App initialized");
  loadSVGComponents();

  const isAuthenticated = await isClientAuthenticated();

  if (!isAuthenticated) {
    navigateToLogin();
    return;
  }

  buildScene();

  document.getElementById("waiting-screen-effect").classList.add("d-none");
  document.getElementById("blur-screen-effect").classList.add("d-none");

  loadAuthenticatedComponents();
  handleRoute(window.location.pathname); 
  setupEventListeners();
}

function loadSVGComponents() {
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});
    loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});
  });
}

function loadAuthenticatedComponents() {
  loadComponent("header-placeholder", Header, "", () => {});
  loadComponent("footer-placeholder", Footer, "footer", () => {});
  loadComponent("left-window-placeholder", LeftSideWindow, "leftsidewindow", () => {});
  loadComponent("right-window-placeholder", RightSideWindow, "rightsidewindow", () => {});
  loadComponent("race-placeholder", game2, "", () => {});
  loadComponent("mid-placeholder", midScreen, "", () => {});
  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
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

function setupEventListeners() {
  const navigationLinks = {
    "home-link": "/",
    "profile-link": "/profile",
    "pong-link": "/pong",
    "race-link": "/race",
    "social-link": "/social",
    "settings-link": "/settings",
    "logout-link": "/logout",
  };

  Object.entries(navigationLinks).forEach(([linkId, route]) => {
    const linkElement = document.getElementById(linkId);
    if (linkElement) {
      linkElement.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState(null, "", route);
        handleRoute(route);
      });
    }
  });
}

window.addEventListener("popstate", (event) => {
  const path = window.location.pathname;
  handleRoute(path);
});

initializeApp();
