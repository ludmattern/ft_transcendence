import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";

const navigationLinks = {
	"home-link": "/",
	"profile-link": "/profile",
	"pong-link": "/pong",
	"race-link": "/race",
	"social-link": "/social",
	"settings-link": "/settings",
	"logout-link": "/logout",
};

export const header = createComponent({
  tag: "header",

  render: () => `
      <div class="row">
        <div class="col-12 text-center">
          <h1 class="hud-title interactive">
            <a id="home-link" href="/">ft_transcendence</a>
          </h1>
        </div>
      </div>
      <div class="row">
        <nav class="col-12 d-flex justify-content-center">
          <ul class="nav">
            <!-- Menu gauche -->
            <span class="left-menu">
              ${createNavItem("profile", "profile-link")}
              ${createNavItem("social", "social-link")}
            </span>
            <!-- Jeux (Menu central) -->
            <li class="nav-item first-game">
              <span class="nav-link text-white">
                <a href="/pong" id="pong-link">pong</a>
              </span>
            </li>
            <li class="nav-item second-game">
              <span class="nav-link text-white">
                <a href="/race" id="race-link">race</a>
              </span>
            </li>
            <!-- Menu droit -->
            <span class="right-menu">
              ${createNavItem("settings", "settings-link")}
              ${createNavItem("logout", "logout-link")}
            </span>
          </ul>
        </nav>
      </div>
  `,

  attachEvents: (el) => {
    // Attacher les gestionnaires pour chaque lien
    Object.entries(navigationLinks).forEach(([linkId, route]) => {
      const linkElement = el.querySelector(`#${linkId}`);
      if (linkElement) {
        linkElement.addEventListener("click", (e) => {
          e.preventDefault();
          history.pushState(null, "", route); // Mettre à jour l'URL
          handleRoute(route); // Gérer la route
		  updateActiveLink(el); // Mettre à jour le lien actif
        });
      }
    });

    // Activer le lien correspondant à l'URL actuelle
    updateActiveLink(el);

    // Surveiller les changements d'URL (navigations arrière/avant)
    window.addEventListener("popstate", () => updateActiveLink(el));
  },
});

/**
 * Crée un élément de navigation (<li>) avec un lien (<a>)
 *
 * @param {string} text - Le texte du lien
 * @param {string} id - L'ID de l'élément <a>
 * @returns {string} - HTML du menu de navigation
 */
function createNavItem(text, id = "") {
  return `
    <li class="nav-item">
      <span class="nav-link text-white">
        <a href="/${text}" id="${id}">${text}</a>
      </span>
    </li>
  `;
}

/**
 * Met à jour le lien actif en fonction de l'URL actuelle.
 *
 * @param {HTMLElement} el - L'élément racine du header
 */
function updateActiveLink(el) {
  const currentPath = window.location.pathname;

  // Trouver l'ID du lien correspondant à l'URL actuelle
  const activeLinkId = Object.keys(navigationLinks).find(
    (key) => navigationLinks[key] === currentPath
  );

  // Réinitialiser l'état de tous les liens
  el.querySelectorAll("a").forEach((link) => link.classList.remove("active"));

  // Activer le lien correspondant
  if (activeLinkId) {
    const activeLink = el.querySelector(`#${activeLinkId}`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
}
