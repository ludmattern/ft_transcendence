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
  navigateToSettings2FA,
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

  ensureAuthenticated(() => {
    if (routeMappings[route]) {
      routeMappings[route](); // Appelle la fonction de navigation correspondante
    } else if (route.startsWith("/social/pilot=")) {
      const pilot = route.split("=")[1];
      navigateToOtherProfile(pilot);
    } else if (route.startsWith("/pong")) {
      if (route === "/pong") {
        navigateToPong();
      } else {
        const subroute = route.substring(6);
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
  return previousRoute || "/";
}
