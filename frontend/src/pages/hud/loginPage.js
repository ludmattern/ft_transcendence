import { testloadComponent, cleanupComponents } from '/src/utils/virtualDOM.js';
import { loginForm } from '/src/components/loginForm.js';

// Liste des composants nécessaires pour la page de connexion
const requiredComponents = ['loginForm']; // Liste des composants devant être sur la page

export function renderLoginPage() {
  console.debug('Rendering Login Page...');

  // Détruire les composants non nécessaires
  cleanupComponents(requiredComponents);

  // Charger les composants nécessaires
  testloadComponent('#central-window', loginForm);

  console.debug('Login Page rendered.');
}