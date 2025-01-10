import { ensureAuthenticated } from "/src/services/auth.js";
import {
  navigateToSubscribe,
  navigateToLogin,
  navigateToHome,
  navigateToProfile,
  navigateToPong,
  navigateToRace,
  navigateToSocial,
  navigateToSettings,
  navigateToLogout,
  navigateToOtherProfile,
  navigateToDeleteAccount,
  navigateToLost,
} from "/src/services/navigation.js";

let previousRoute = null;

window.addEventListener("popstate", () => {
  const route = window.location.pathname; // Récupère l'URL actuelle
  handleRoute(route); // Appelle la gestion des routes avec la nouvelle URL
});

export async function handleRoute(route) {
  console.debug(`Handling route: ${route}`);

  if (window.location.pathname !== route) {
    previousRoute = window.location.pathname; // Met à jour la previousRoute
  }

  const unauthenticatedRoutes = ["/login", "/subscribe"];

  const isUnauthenticatedRoute = unauthenticatedRoutes.includes(route);

  ensureAuthenticated(() => {
    // Gestion des routes
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
      case route === "/settings/delete-account":
        navigateToDeleteAccount();
        break;
      case route === "/logout":
        navigateToLogout();
        break;
      case route.startsWith("/social?pilot="):
        console.error(`Route: ${route}`);
        const pilot = route.split("=")[1];
        console.debug(`Pilot: ${pilot}`);
        navigateToOtherProfile(pilot);
        break;
      case route === "/login": // Route non protégée
        navigateToLogin();
        break;
      case route === "/subscribe": // Route non protégée
        navigateToSubscribe();
        break;
      default:
        navigateToLost();
        console.warn(`Unknown route: ${route}`);
        break;
    }
  }, isUnauthenticatedRoute); // Passe le flag pour permettre l'accès libre

  if (window.location.pathname !== route) {
    history.pushState(null, "", route);
  }
}

export function getPreviousRoute() {
  return previousRoute || "/"; // Retourne la précédente route ou "/" par défaut
}
