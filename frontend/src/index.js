import { switchwindow } from "/src/App.js";
import { loadComponent } from "/src/utils/dom_utils.js";
import { LoginForm } from "/src/components/loginForm.js";
import { ProfileForm } from "/src/components/profileForm.js";
import { SocialForm } from "/src/components/socialForm.js";
import { SettingsForm } from "/src/components/settingsForm.js";
import { LogoutForm } from "/src/components/logoutForm.js";
import { isClientAuthenticated } from "/src/services/auth.js";
import { Header } from "/src/components/header.js";
import { LeftSideWindow } from "/src/components/leftSideWindow.js";
import { RightSideWindow } from "/src/components/rightSideWindow.js";
import { PongMenu } from "/src/components/pongMenu.js";
import { midScreen } from "/src/components/midScreen.js";
import { HelmetSVG } from "/src/components/HelmetSVG.js";
import { HUDSVG } from "/src/components/HUDSVG.js";
import { game2 } from "/src/components/game2.js";

async function initializeApp() {
  loadSVGComponents();

  const isAuthenticated = await isClientAuthenticated();

  if (!isAuthenticated) {
    navigateToLogin();
    return;
  }

  document.getElementById("waiting-screen-effect").classList.add("d-none");
  document.getElementById("blur-screen-effect").classList.add("d-none");

  loadAuthenticatedComponents();
  handleRoute(window.location.pathname); // Gestion de la route actuelle
  setupEventListeners();
}

// Gestion des SVG
function loadSVGComponents() {
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});
    loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});
  });
}

// Composants à charger après authentification
function loadAuthenticatedComponents() {
  loadComponent("header-placeholder", Header, "", () => {});
  loadComponent(
    "left-window-placeholder",
    LeftSideWindow,
    "leftsidewindow",
    () => {}
  );
  loadComponent(
    "right-window-placeholder",
    RightSideWindow,
    "rightsidewindow",
    () => {}
  );
  loadComponent("race-placeholder", game2, "", () => {});
  loadComponent("mid-placeholder", midScreen, "", () => {});
  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
}

// Gérer les routes
function handleRoute(route) {
  console.debug(`Handling route: ${route}`);
  switch (route) {
    case "/":
      navigateToHome();
      break;
    case "/profile":
      navigateToProfile();
      break;
    case "/pong":
      navigateToPong();
      break;
    case "/race":
      navigateToRace();
      break;
    case "/social":
      navigateToSocial();
      break;
    case "/settings":
      navigateToSettings();
      break;
    case "/logout":
      navigateToLogout();
      break;
    default:
      console.warn(`Unknown route: ${route}`);
      break;
  }
}

// Navigation spécifique pour chaque route
function navigateToLogin() {
  loadComponent("#central-window", LoginForm, "loginForm", () => {});
  console.debug("LoginForm loaded as user is not authenticated.");
}

function navigateToHome() {
  switchwindow(null);
  loadComponent("#central-window", null, "", () => {});
  document.getElementById("blur-screen-effect").classList.add("d-none");
  setActiveLink(null);
}

function navigateToProfile() {
  loadComponent("#central-window", ProfileForm, "", () => {});
  document.getElementById("blur-screen-effect").classList.remove("d-none");
  setActiveLink("profile-link");
}

function navigateToPong() {
  switchwindow("pong");
  loadComponent("#central-window", null, "", () => {});
  document.getElementById("blur-screen-effect").classList.add("d-none");
  setActiveLink("pong-link");
}

function navigateToRace() {
  switchwindow("race");
  loadComponent("#central-window", null, "", () => {});
  document.getElementById("blur-screen-effect").classList.add("d-none");
  setActiveLink("race-link");
}

function navigateToSocial() {
  loadComponent("#central-window", SocialForm, "socialForm", () => {});
  document.getElementById("blur-screen-effect").classList.remove("d-none");
  setActiveLink("social-link");
}

function navigateToSettings() {
  loadComponent("#central-window", SettingsForm, "settingsForm", () => {});
  document.getElementById("blur-screen-effect").classList.remove("d-none");
  setActiveLink("settings-link");
}

function navigateToLogout() {
  loadComponent("#central-window", LogoutForm, "", () => {});
  document.getElementById("blur-screen-effect").classList.remove("d-none");
  setActiveLink("logout-link");
}

// Gestion des liens actifs
function setActiveLink(linkId) {
  document.querySelectorAll("header a").forEach((link) => {
    link.classList.remove("active");
  });

  if (!linkId) return;

  const activeLink = document.getElementById(linkId);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

// Ajout des écouteurs pour les clics de navigation
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

// Gérer l'événement popstate
window.addEventListener("popstate", (event) => {
  const path = window.location.pathname;
  handleRoute(path);
});

initializeApp();
