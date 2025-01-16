import componentManagers from "/src/index.js";
import { header } from "/src/components/pong/header.js";
import { navBar } from "/src/components/pong/navBar.js";
import { playContent } from "/src/components/pong/playContent.js";
import { pongPageSkeleton } from "/src/components/pong/pongPageSkeleton.js";

// Définition des pages avec la liste des composants à charger
const pages = {
  home: [
  ],
  play: [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: navBar },
    { selector: "#content-window-container", component: playContent }, // Contenu spécifique à "play"
  ],
  leaderboard: [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    // { selector: "#content-window-container", component: leaderboardContent }, // Ajouter si besoin
  ],
  // Définissez d'autres pages avec les composants correspondants
};

// Fonction de rendu de page
export function renderPongPage(pageKey) {
  console.debug(`Rendering ${pageKey} Page...`);

  const componentsToRender = pages[pageKey];

  if (!componentsToRender) {
    console.warn(`Page "${pageKey}" introuvable.`);
    return;
  }

  const componentKeys = componentsToRender.map(({ component }) => component.tag);
  const pongManager = componentManagers.Pong;

  // Nettoyer les composants qui ne sont plus nécessaires
  pongManager.cleanupComponents(componentKeys);

  // Charger les nouveaux composants
  componentsToRender.forEach(({ selector, component }) => {
    pongManager.loadComponent(selector, component);
  });

  console.debug(`${pageKey} Page rendered.`);
}
