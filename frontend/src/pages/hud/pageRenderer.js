import { testloadComponent, cleanupComponents } from "/src/utils/virtualDOM.js";
// import { loginForm } from "/src/components/hud/centralWindow/loginForm.js";
// import { profileForm } from "/src/components/hud/centralWindow/profileForm.js";
// import { socialForm } from "/src/components/hud/centralWindow/socialForm.js";
// import { otherProfileForm } from "/src/components/hud/centralWindow/otherProfileForm.js";
// import { deleteAccountForm } from "/src/components/hud/centralWindow/deleteAccountForm.js";
// import { subscribeForm } from "/src/components/hud/centralWindow/subscribeForm.js";
// import { settingsForm } from "/src/components/hud/centralWindow/settingsForm.js";
// import { header } from "/src/components/hud/general/header.js";
// import { footer } from "/src/components/hud/general/footer.js";
// import { logoutForm } from "/src/components/hud/centralWindow/logoutForm.js";
// import { leftSideWindow } from "/src/components/hud/sideWindow/left/leftSideWindow.js";
// import { rightSideWindow } from "/src/components/hud/sideWindow/right/rightSideWindow.js";
import {
  loginForm,
  profileForm,
  header,
  footer,
  leftSideWindow,
  rightSideWindow,
  logoutForm,
  socialForm,
  otherProfileForm,
  deleteAccountForm,
  subscribeForm,
  settingsForm,
} from "/src/components/hud/index.js";

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
