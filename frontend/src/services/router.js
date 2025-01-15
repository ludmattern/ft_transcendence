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
  navigateTo2FA,
  navigateBackToPong,
} from "/src/services/navigation.js";

let previousRoute = null;
let previousPongSubRoute = null;

window.addEventListener("popstate", () => {
  const route = window.location.pathname; // Récupère l'URL actuelle
  handleRoute(route); // Appelle la gestion des routes avec la nouvelle URL
});

const routeMappings = {
  "/": navigateToHome,
  "/profile": navigateToProfile,
  "/race": navigateToRace,
  "/social": navigateToSocial,
  "/settings": navigateToSettings,
  "/settings/delete-account": navigateToDeleteAccount,
  "/logout": navigateToLogout,
  "/login/2fa": navigateTo2FA,
  "/login": navigateToLogin,
  "/subscribe": navigateToSubscribe,
  "/topong": navigateBackToPong,
};

export async function handleRoute(route, shouldPushState = true) {
  console.debug(`Handling route: "${route}"`);

  // if (window.location.pathname === route) {
  //   console.debug("Route unchanged, navigation skipped.");
  //   return;
  // }

  previousRoute = window.location.pathname;

  const unauthenticatedRoutes = ["/login", "/login/2fa", "/subscribe"];
  const isUnauthenticatedRoute = unauthenticatedRoutes.includes(route);

  ensureAuthenticated(() => {
    if (routeMappings[route]) {
      console.error(`router file Route: ${route}`);
      routeMappings[route](); // Appelle la fonction de navigation correspondante
    } else if (route.startsWith("/social?pilot=")) {
      const pilot = route.split("=")[1];
      console.debug(`Pilot: ${pilot}`);
      navigateToOtherProfile(pilot);
    } else if (route.startsWith("/pong")) {
      if (route === "/pong") {
        navigateToPong();
      } else {
        const subroute = route.split("/")[2];
        console.debug(`Subroute: ${subroute}`);
		if (subroute === "home") {
			previousPongSubRoute = null;
		}
		else {
			previousPongSubRoute = subroute;
		}
        navigateToPong();
        navigateToPong(subroute);
      }
    } else {
      navigateToLost();
      console.warn(`Unknown route: ${route}`);
    }
  }, isUnauthenticatedRoute);

  if (shouldPushState) {
    if (route === "/topong") {
      if (previousPongSubRoute) {
        history.pushState(null, "", `/pong/${previousPongSubRoute}`);
      } else {
        history.pushState(null, "", "/pong");
      }
    } else if (route === "/pong/home") {
      history.pushState(null, "", "/pong");
    } else {
      history.pushState(null, "", route);
    }
  }
}

export function getPreviousRoute() {
  return previousRoute || "/"; // Retourne la précédente route ou "/" par défaut
}

export function getPreviousPongSubRoute() {
  return previousPongSubRoute || null; // Retourne la précédente sous-route Pong ou null par défaut
}
