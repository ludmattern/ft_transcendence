export async function isClientAuthenticated() {
  try {
    const response = await fetch("/src/context/authenticated.json");
    if (!response.ok) {
      console.error("Failed to load authenticated.json");
      return false;
    }

    // Lire et analyser le fichier JSON
    const data = await response.json();

    // Vérifier si le token est à true
    return data.token === true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false; // En cas d'erreur, retourner false
  }
}
