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

export async function ensureAuthenticated(callback) {
	const isAuthenticated = await isClientAuthenticated();
	if (!isAuthenticated) {
	  navigateToLogin();
	  return false;
	}
	callback();
	return true;
  }
