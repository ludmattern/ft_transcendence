import { ensureAuthenticated } from "/src/services/auth.js";
import { navigateToSubscribe, navigateToLogin, navigateToHome, navigateToProfile, navigateToPong, navigateToRace, navigateToSocial, navigateToSettings, navigateToLogout, navigateToOtherProfile } from "/src/services/navigation.js";

window.addEventListener('popstate', () => {
	const route = window.location.pathname; // Récupère l'URL actuelle
	handleRoute(route); // Appelle la gestion des routes avec la nouvelle URL
  });
  
  export async function handleRoute(route) {
	console.debug(`Handling route: ${route}`);
	
	// Routes accessibles sans authentification
	const unauthenticatedRoutes = ["/login", "/subscribe"];
	
	// Vérifie si la route est dans les routes non protégées
	const isUnauthenticatedRoute = unauthenticatedRoutes.includes(route);
	
	// Appelle la fonction de vérification avec un flag pour autoriser l'accès libre
	ensureAuthenticated(() => {
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
		case route === "/login": // Route non protégée
		  navigateToLogin();
		  break;
		case route === "/subscribe": // Route non protégée
		  navigateToSubscribe();
		  break;
		default:
		  console.warn(`Unknown route: ${route}`);
		  break;
	  }
	}, isUnauthenticatedRoute); // Passe le flag pour permettre l'accès libre
  
	// Ajoute l'état dans l'historique uniquement si l'utilisateur change de route
	if (window.location.pathname !== route) {
	  history.pushState(null, "", route);
	}
  }
  