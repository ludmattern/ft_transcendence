import { navigateToLogin } from "/src/services/navigation.js";

export async function isClientAuthenticated() {
  try {
    const response = await fetch("/src/context/authenticated.json");
    if (!response.ok) {
      console.error("Failed to load authenticated.json");
      return false;
    }
    const data = await response.json();

    return data.token === true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

export async function ensureAuthenticated(callback, allowUnauthenticated = false) {
	const isAuthenticated = await isClientAuthenticated();
  
	// Si l'accès non authentifié est autorisé, exécuter directement le callback
	if (allowUnauthenticated || isAuthenticated) {
	  callback();
	  return true;
	}
  
	// Sinon, rediriger vers la page de connexion
	navigateToLogin();
	history.pushState(null, "", route);
	return false;
  }