import { testloadComponent, cleanupComponents } from '/src/utils/virtualDOM.js';
import { subscribeForm } from '/src/components/subscribeForm.js';

// Liste des composants nécessaires pour la page Subscribe
const requiredComponents = ['subscribeForm'];

export function renderSubscribePage() {
  console.debug('Rendering Subscribe Page...');

  // Détruire les composants non nécessaires
  cleanupComponents(requiredComponents);

  // Charger les composants nécessaires
  testloadComponent('#central-window', subscribeForm);

  console.debug('Subscribe Page rendered.');
}
