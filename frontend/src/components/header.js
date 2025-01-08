import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const header = createComponent({
  tag: 'header',

  // Générer le HTML
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
              ${createNavItem('profile', 'profile-link')}
              ${createNavItem('social', 'social-link')}
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
              ${createNavItem('settings', 'settings-link')}
              ${createNavItem('logout', 'logout-link')}
            </span>
          </ul>
        </nav>
      </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    const navigationLinks = {
      "home-link": "/",
      "profile-link": "/profile",
      "pong-link": "/pong",
      "race-link": "/race",
      "social-link": "/social",
      "settings-link": "/settings",
      "logout-link": "/logout",
    };

    Object.entries(navigationLinks).forEach(([linkId, route]) => {
      const linkElement = el.querySelector(`#${linkId}`);
      if (linkElement) {
        linkElement.addEventListener("click", (e) => {
          e.preventDefault();
          history.pushState(null, "", route);
          handleRoute(route); // Gestion dynamique des routes
        });
      }
    });
  },
});

/**
 * Crée un élément de navigation (<li>) avec un lien (<a>)
 *
 * @param {string} text - Le texte du lien
 * @param {string} id - L'ID de l'élément <a>
 * @returns {string} - HTML du menu de navigation
 */
function createNavItem(text, id = '') {
  return `
    <li class="nav-item">
      <span class="nav-link text-white">
        <a href="/${text}" id="${id}">${text}</a>
      </span>
    </li>
  `;
}
