import { testloadComponent, cleanupComponents } from "/src/utils/virtualDOM.js";
import { loginForm } from "/src/components/loginForm.js";
import { profileForm } from "/src/components/profileForm.js";
import { socialForm } from "/src/components/socialForm.js";
import { otherProfileForm } from "/src/components/otherProfileForm.js";
import { deleteAccountForm } from "/src/components/deleteAccountForm.js";
import { subscribeForm } from "/src/components/subscribeForm.js";
import { settingsForm } from "/src/components/settingsForm.js";
import { header } from "/src/components/header.js";
import { footer } from "/src/components/footer.js";
import { logoutForm } from "/src/components/logoutForm.js";
import { leftSideWindow } from "/src/components/leftSideWindow.js";
import { rightSideWindow } from "/src/components/rightSideWindow.js";

/**
 * Composants globaux par défaut
 */
const globalComponents = {
  header: { selector: "#header-container", component: header },
  leftSideWindow: {
    selector: "#left-window-container",
    component: leftSideWindow,
  },
  rightSideWindow: {
    selector: "#right-window-container",
    component: rightSideWindow,
  },
  footer: { selector: "#footer-container", component: footer },
};

/**
 * Définition des pages
 */
const pages = {
  login: { useGlobals: false, mainComponent: loginForm },
  profile: { useGlobals: true, mainComponent: profileForm },
  deleteAccount: { useGlobals: true, mainComponent: deleteAccountForm },
  subscribe: { useGlobals: false, mainComponent: subscribeForm },
  social: { useGlobals: true, mainComponent: socialForm },
  otherprofile: { useGlobals: true, mainComponent: otherProfileForm },
  settings: { useGlobals: true, mainComponent: settingsForm },
  logout: { useGlobals: true, mainComponent: logoutForm },
  home: { useGlobals: true },
  race: { useGlobals: true },
  pong: { useGlobals: true },
};

/**
 * Sélecteur par défaut pour le composant principal
 */
const defaultSelector = "#central-window";

/**
 * Génère une liste complète de composants à rendre pour une page donnée.
 * @param {string} pageKey - Clé de la page
 * @returns {Array} - Liste des composants à rendre
 */
function getComponentsForPage(pageKey) {
  const page = pages[pageKey];
  if (!page) {
    console.warn(`Page "${pageKey}" introuvable.`);
    return [];
  }

  const global = page.useGlobals ? Object.values(globalComponents) : [];
  const specific = page.mainComponent
    ? [{ selector: defaultSelector, component: page.mainComponent }]
    : [];

  return [...global, ...specific];
}

/**
 * Rendu des pages
 * @param {string} pageKey - Nom de la page à rendre
 */
export function renderPage(pageKey) {
  console.debug(`Rendering ${pageKey} Page...`);

  const componentsToRender = getComponentsForPage(pageKey);

  // Liste des noms des composants pour le nettoyage
  const componentKeys = componentsToRender.map(
    ({ component }) => component.tag
  );

  // Nettoie les composants existants
  cleanupComponents(componentKeys);

  // Charge les nouveaux composants
  componentsToRender.forEach(({ selector, component }) => {
    testloadComponent(selector, component);
  });

  console.debug(`${pageKey} Page rendered.`);
}
