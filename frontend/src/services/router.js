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
  navigateTo2FA
} from "/src/services/navigation.js";

let previousRoute = null;

window.addEventListener("popstate", () => {
	const route = window.location.pathname; // Récupère l'URL actuelle
	handleRoute(route); // Appelle la gestion des routes avec la nouvelle URL
});

const routeMappings = {
	"/": navigateToHome,
	"/profile": navigateToProfile,
	"/pong": navigateToPong,
	"/race": navigateToRace,
	"/social": navigateToSocial,
	"/settings": navigateToSettings,
	"/settings/delete-account": navigateToDeleteAccount,
	"/logout": navigateToLogout,
	"/login/2fa": navigateTo2FA,
	"/login": navigateToLogin,
	"/subscribe": navigateToSubscribe,
  };
  
  export async function handleRoute(route, shouldPushState = true) {
	console.debug(`Handling route: ${route}`);
  
	// if (window.location.pathname === route) {
	//   console.debug("Route unchanged, navigation skipped.");
	//   return;
	// }
  
	previousRoute = window.location.pathname;
  
	const unauthenticatedRoutes = ["/login", "/subscribe"];
	const isUnauthenticatedRoute = unauthenticatedRoutes.includes(route);
  
	ensureAuthenticated(() => {
	  if (routeMappings[route]) {
		routeMappings[route](); // Appelle la fonction de navigation correspondante
	  } else if (route.startsWith("/social?pilot=")) {
		const pilot = route.split("=")[1];
		console.debug(`Pilot: ${pilot}`);
		navigateToOtherProfile(pilot);
	  } else {
		navigateToLost();
		console.warn(`Unknown route: ${route}`);
	  }
	}, isUnauthenticatedRoute);
  
	if (shouldPushState) {
	  history.pushState(null, "", route);
	}
  }

export function getPreviousRoute() {
  return previousRoute || "/"; // Retourne la précédente route ou "/" par défaut
}
