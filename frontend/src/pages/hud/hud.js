import { switchwindow } from "../../App.js";
import { loadComponent } from "../../utils/dom_utils.js";
import { LoginForm } from "../../components/loginForm.js";
import { ProfileForm } from "../../components/profileForm.js";
import { SocialForm } from "../../components/socialForm.js";
import { SettingsForm } from "../../components/settingsForm.js";
import { LogoutForm } from "../../components/logoutForm.js";
import { isClientAuthenticated } from "../../services/auth.js";

// Fonction principale pour initialiser le comportement
async function initializeApp() {
    // Vérifie si l'utilisateur est authentifié
    const isAuthenticated = await isClientAuthenticated();

    // Si non authentifié, charge le formulaire de connexion
    if (!isAuthenticated) {
        loadComponent("#central-window", LoginForm, "loginForm", () => {
            console.debug("LoginForm loaded as user is not authenticated.");
        });
    }

    // Ajouter les gestionnaires d'événements si l'utilisateur est authentifié
    setupEventListeners();
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
