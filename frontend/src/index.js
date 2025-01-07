import { switchwindow } from "/src/3d/animation.js";
import { loadComponent } from "/src/utils/dom_utils.js";
import { LoginForm } from "/src/components/loginForm.js";
import { ProfileForm } from "/src/components/profileForm.js";
import { SocialForm } from "/src/components/socialForm.js";
import { SettingsForm } from "/src/components/settingsForm.js";
import { OtherProfileForm } from "/src/components/otherProfileForm.js";
import { LogoutForm } from "/src/components/logoutForm.js";
import { isClientAuthenticated } from "/src/services/auth.js";
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

async function initializeApp() {
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

export async function handleRoute(route) {
  console.debug(`Handling route: ${route}`);

  const isAuthenticated = await isClientAuthenticated();

  if (!isAuthenticated) {
    navigateToLogin();
	//flag to signal the unload of the game
    return;
  }

  //if already unloaded then reaload
  //if not then continue to route

  switch (true) {
    case route === "/":
      navigateToHome();
      break;
    case route === "/profile":
      navigateToProfile();
      break;
    case route === "/pong":
      navigateToPong();
      break;
    case route === "/race":
      navigateToRace();
      break;
    case route === "/social":
      navigateToSocial();
      break;
    case route === "/settings":
      navigateToSettings();
      break;
    case route === "/logout":
      navigateToLogout();
      break;
    case route.startsWith("/social?pilot="):
      const pilot = route.split("=")[1];
      console.debug(`Pilot: ${pilot}`);
      navigateToOtherProfile(pilot);
      break;
    default:
      console.warn(`Unknown route: ${route}`);
      break;
  }
}

function navigateToSocial() {
  loadComponent("#central-window", SocialForm, "socialForm", () => {});
  document.getElementById("blur-screen-effect").classList.remove("d-none");
  setActiveLink("social-link");
}

function navigateToLogin() {
  loadComponent("#central-window", LoginForm, "loginForm", () => {});
  console.debug("LoginForm loaded as user is not authenticated.");
}

export function navigateToHome() {
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

function navigateToOtherProfile(argument) {
  if (argument) {
    loadComponent("#central-window", OtherProfileForm, "", () => {});
    document.getElementById("blur-screen-effect").classList.remove("d-none");
    setActiveLink(null);
  }
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
