import { switchwindow } from "./App.js";
import { loadComponent } from "./utils/dom_utils.js";
import { LoginForm } from "./components/loginForm.js";
import { ProfileForm } from "./components/profileForm.js";
import { SocialForm } from "./components/socialForm.js";
import { SettingsForm } from "./components/settingsForm.js";
import { LogoutForm } from "./components/logoutForm.js";
import { isClientAuthenticated } from "./services/auth.js";
import { Header } from "./components/header.js";
import { LeftSideWindow } from "./components/leftSideWindow.js";
import { RightSideWindow } from "./components/rightSideWindow.js";
import { PongMenu } from "./components/pongMenu.js";
import { midScreen } from "./components/midScreen.js";
import { HelmetSVG } from "./components/HelmetSVG.js";
import { HUDSVG } from "./components/HUDSVG.js";
import { game2 } from "./components/game2.js";

// Fonction principale pour initialiser le comportement
async function initializeApp() {
    // Charger les SVG de base (toujours affichés)
    loadSVGComponents();

    // Vérifie si l'utilisateur est authentifié
    const isAuthenticated = await isClientAuthenticated();

    if (!isAuthenticated) {
        // Si non authentifié, afficher uniquement la page de connexion
        loadComponent("#central-window", LoginForm, "loginForm", () => {
            console.debug("LoginForm loaded as user is not authenticated.");
        });
        return; // Ne pas charger le reste des composants
    }
	
    // Si authentifié, charger les autres composants
	document.getElementById("waiting-screen-effect").classList.add("d-none");
	document.getElementById("blur-screen-effect").classList.add("d-none");
    loadAuthenticatedComponents();

    // Ajouter les gestionnaires d'événements
    setupEventListeners();
}

// Charger les SVG de base
function loadSVGComponents() {
    document.addEventListener("DOMContentLoaded", () => {
        loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});
        loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});
    });
}

// Charger les composants pour les utilisateurs authentifiés
function loadAuthenticatedComponents() {
    loadComponent("header-placeholder", Header, "", () => {});
    loadComponent("left-window-placeholder", LeftSideWindow, "leftsidewindow", () => {});
    loadComponent("right-window-placeholder", RightSideWindow, "rightsidewindow", () => {});
    loadComponent("race-placeholder", game2, "", () => {});
    loadComponent("mid-placeholder", midScreen, "", () => {});
    loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
}

// Ajoute les gestionnaires d'événements
function setupEventListeners() {
    document.getElementById("profile-link").addEventListener("click", function (e) {
        e.preventDefault();
        loadComponent("#central-window", ProfileForm, "", () => {
            console.debug("ProfileForm loaded on click.");
        });
    });

    document.getElementById("pong-link").addEventListener("click", function (e) {
        e.preventDefault();
        switchwindow("pong");
    });

    document.getElementById("race-link").addEventListener("click", function (e) {
        e.preventDefault();
        switchwindow("race");
    });

    document.getElementById("social-link").addEventListener("click", function (e) {
        e.preventDefault();
        loadComponent("#central-window", SocialForm, "socialForm", () => {
            console.debug("SocialForm loaded on click.");
        });
    });

    document
        .getElementById("settings-link")
        .addEventListener("click", function (e) {
            e.preventDefault();
            loadComponent("#central-window", SettingsForm, "settingsForm", () => {
                console.debug("SettingsForm loaded on click.");
            });
        });

    document.getElementById("logout-link").addEventListener("click", function (e) {
        e.preventDefault();
        loadComponent("#central-window", LogoutForm, "", () => {
            console.debug("LogoutForm loaded on click.");
        });
    });

    document.getElementById("home-link").addEventListener("click", function (e) {
        e.preventDefault();
        switchwindow(null);
        loadComponent("#central-window", null, "", () => {});
    });
}

// Appeler la fonction d'initialisation
initializeApp();
