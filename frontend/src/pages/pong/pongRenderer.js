import componentManagers from "/src/index.js";
import { header } from "/src/components/pong/header.js";
import { navBar } from "/src/components/pong/navBar.js";
import { homeContent } from "/src/components/pong/homeContent.js";
import { pongPageSkeleton } from "/src/components/pong/pongPageSkeleton.js";
import { soloContent } from "/src/components/pong/soloContent.js";
import { multiplayerContent } from "/src/components/pong/multiplayerContent.js";
import { tournamentContent } from "/src/components/pong/tournamentContent.js";
import { lost } from "/src/components/pong/lost.js";
import { leaderboard } from "/src/components/pong/leaderboard.js";

// Définition des pages avec la liste des composants à charger
const pages = {
  home: [
  ],
  play: [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: navBar },
    { selector: "#content-window-container", component: homeContent }, // Contenu spécifique à "play"
  ],
  "play/solo": [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: navBar },
    { selector: "#content-window-container", component: soloContent }, // Contenu spécifique à "play"
  ],
  "play/multiplayer": [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: navBar },
    { selector: "#content-window-container", component: multiplayerContent }, // Contenu spécifique à "play"
  ],
  "play/tournament": [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: navBar },
    { selector: "#content-window-container", component: tournamentContent }, // Contenu spécifique à "play"
  ],
  leaderboard: [
    { selector: "#pong-skeleton-container", component: pongPageSkeleton },
    { selector: "#pong-header-container", component: header },
    { selector: "#content-window-container", component: leaderboard }, // Ajouter si besoin
  ],
  lost: [
	{ selector: "#pong-skeleton-container", component: pongPageSkeleton },
	{ selector: "#pong-header-container", component: header },
	{ selector: "#content-window-container", component: lost }, // Page d'accueil par défaut
  ],
  // Définissez d'autres pages avec les composants correspondants
};

// Fonction de rendu de page
export function renderPongPage(pageKey) {
  console.debug(`Rendering ${pageKey} Page...`);

  const componentsToRender = pages[pageKey];

  if (!componentsToRender) {
    console.warn(`Page "${pageKey}" introuvable.`);
	renderPongPage("lost");
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
