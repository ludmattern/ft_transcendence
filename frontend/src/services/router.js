import { isClientAuthenticated } from "/src/services/auth.js";
import {
  navigateToSubscribe, navigateToLogin, navigateToHome, navigateToProfile, navigateToPong, 
  navigateToRace, navigateToSocial, navigateToSettings, navigateToLogout, navigateToOtherProfile, 
  navigateToDeleteAccount, navigateToLost, navigateTo2FA, navigateBackToPong, navigateToSettings2FA, navigateToLoading,
} from "/src/services/navigation.js";
import { emit } from "/src/services/eventEmitter.js";

let previousRoute = null;
let previousPongSubRoute = null;
let previousPongPlaySubRoute = null;

const routeMappings = {
  "/": navigateToHome,
  "/profile": navigateToProfile,
  "/race": navigateToRace,
  "/social": navigateToSocial,
  "/settings": navigateToSettings,
  "/settings/delete-account": navigateToDeleteAccount,
  "/logout": navigateToLogout,
  "/login/2fa": navigateTo2FA,
  "/register/qr": navigateToSettings2FA,
  "/login": navigateToLogin,
  "/subscribe": navigateToSubscribe,
  "/topong": navigateBackToPong,
  "/loading": navigateToLoading,
};

const publicRoutes = new Set(["/login", "/login/2fa", "/subscribe", "/register/qr"]);

/**
 * Vérifie si une route nécessite une authentification.
 * @param {string} route - La route à vérifier.
 * @returns {boolean} - `true` si une authentification est requise, sinon `false`.
 */
function isAuthenticatedRoute(route) {
  return publicRoutes.has(route)
}

/**
 * Met à jour la mémoire des routes précédentes.
 * @param {string} route - Nouvelle route visitée.
 */
function updatePreviousRoute(route) {
  previousRoute = window.location.pathname;

  if (route.startsWith("/pong/play")) {
    previousPongPlaySubRoute = route;
  }
  if (route.startsWith("/pong")) {
    const subroute = route.substring(6);
    previousPongSubRoute = subroute === "home" ? null : subroute;
  }
}

/**
 * Gère la navigation vers une route donnée.
 * @param {string} route - La route à gérer.
 * @param {boolean} shouldPushState - Si `true`, met à jour l'historique du navigateur.
 */
export async function handleRoute(route, shouldPushState = true) {
  console.debug(`Handling route: "${route}"`);

  if (route === "/loading") {
	processRoute(route, shouldPushState);
	return;
  }

  // const isAuthenticated = await isClientAuthenticated();
  const isRoutePublic = isAuthenticatedRoute(route);

  /**
   * DEBUG - Disabling authentication
  */
  const isAuthenticated = true;
 
  if (!isRoutePublic && isAuthenticated || isRoutePublic && !isAuthenticated) {
    processRoute(route, shouldPushState);
  } else if (isRoutePublic && isAuthenticated) {
    console.log("Already authenticated, redirecting to /");
	processRoute("/", shouldPushState);
  } else {
	console.log("Not authenticated, redirecting to /login");
	processRoute("/login", shouldPushState);
  }
}

/**
 * Exécute la navigation après vérification d'authentification.
 * @param {string} route - La route à naviguer.
 * @param {boolean} shouldPushState - Si `true`, met à jour l'historique.
 */
function processRoute(route, shouldPushState) {
  updatePreviousRoute(route);

  let finalRoute = route;

  if (route === "/topong") {
    finalRoute = previousPongSubRoute ? `/pong/${previousPongSubRoute}` : "/pong";
  }

  if (shouldPushState) {
    history.pushState(null, "", finalRoute);
  }

  emit("routeChanged", finalRoute);
  console.log("Route changed:", finalRoute);

  if (routeMappings[finalRoute]) {
    routeMappings[finalRoute]();
  } else if (finalRoute.startsWith("/social/pilot=")) {
    const pilot = finalRoute.split("=")[1];
    navigateToOtherProfile(pilot);
  } else if (finalRoute.startsWith("/pong")) {
    navigateToPong(finalRoute.substring(6));
  } else {
    navigateToLost();
  }
}

/**
 * Retourne la dernière route visitée.
 */
export function getPreviousRoute() {
  return previousRoute || "/";
}

/**
 * Retourne la dernière sous-route visitée dans /pong/play.
 */
export function getPreviousPongPlaySubRoute() {
  return previousPongPlaySubRoute || "/pong/play";
}

window.addEventListener("popstate", () => {
  handleRoute(window.location.pathname, false);
});
