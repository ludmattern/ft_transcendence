import { ensureAuthenticated } from "/src/services/auth.js";
import {
  navigateToSubscribe, navigateToLogin, navigateToHome, navigateToProfile, navigateToPong, 
  navigateToRace, navigateToSocial, navigateToSettings, navigateToLogout, navigateToOtherProfile, 
  navigateToDeleteAccount, navigateToLost, navigateTo2FA, navigateBackToPong, navigateToSettings2FA,
} from "/src/services/navigation.js";
import { emit } from "/src/services/eventEmitter.js";

let previousRoute = null;
let previousPongSubRoute = null;
let previousPongPlaySubRoute = null;

window.addEventListener("popstate", () => {
  const route = window.location.pathname;
  handleRoute(route, false); // Gère la route sans pushState
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
  "/register/qr": navigateToSettings2FA,
  "/login": navigateToLogin,
  "/subscribe": navigateToSubscribe,
  "/topong": navigateBackToPong,
};

export async function handleRoute(route, shouldPushState = true) {
  console.debug(`Handling route: "${route}"`);
  previousRoute = window.location.pathname;

  const unauthenticatedRoutes = ["/login", "/login/2fa", "/subscribe", "/register/qr"];
  const isUnauthenticatedRoute = unauthenticatedRoutes.includes(route);

  let finalRoute = route;

  if (route.startsWith("/pong/play")) {
    previousPongPlaySubRoute = route;
  }

  if (route === "/topong") {
    finalRoute = previousPongSubRoute ? `/pong/${previousPongSubRoute}` : "/pong";
  }

  if (shouldPushState) {
    history.pushState(null, "", finalRoute);
  }

  emit("routeChanged", finalRoute);
  console.log("route changed :", finalRoute);

  // Gestion de la route
  if (routeMappings[finalRoute]) {
    routeMappings[finalRoute]();
  } else if (finalRoute.startsWith("/social/pilot=")) {
    const pilot = finalRoute.split("=")[1];
    navigateToOtherProfile(pilot);
  } else if (finalRoute.startsWith("/pong")) {
    if (finalRoute === "/pong") {
      navigateToPong();
    } else {
      const subroute = finalRoute.substring(6);
      previousPongSubRoute = subroute === "home" ? null : subroute;
      navigateToPong(subroute);
    }
  } else {
    navigateToLost();
  }
}

export function getPreviousRoute() {
  return previousRoute || "/";
}

export function getPreviousPongPlaySubRoute() {
	return previousPongPlaySubRoute || "/pong/play";
  }