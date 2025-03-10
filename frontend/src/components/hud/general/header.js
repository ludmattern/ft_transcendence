import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { startAnimation } from '/src/components/hud/utils/utils.js';

const navigationLinks = {
	'home-link': '/',
	'profile-link': '/profile',
	'pong-link': '/pong',
	'race-link': '/race',
	'social-link': '/social',
	'settings-link': '/settings',
	'logout-link': '/logout',
};

export const header = createComponent({
	tag: 'header',

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

	attachEvents: (el) => {
		Object.entries(navigationLinks).forEach(([linkId, route]) => {
			const linkElement = el.querySelector(`#${linkId}`);
			if (linkElement) {
				linkElement.addEventListener('click', (e) => {
					e.preventDefault();
					if (route !== '/pong') {
						handleRoute(route);
					} else {
						handleRoute('/topong');
					}
				});
			}
		});

		updateActiveLink(el, window.location.pathname);

		subscribe('routeChanged', (route) => updateActiveLink(el, route));

		const navItems = el.querySelectorAll('.nav-item');
		const homeLink = el.querySelectorAll('#home-link');

		startAnimation(homeLink, 'light-animation');
		startAnimation(navItems, 'light-animation', 1000);
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

/**
 * Met à jour le lien actif en fonction de l'URL actuelle ou de la route reçue.
 *
 * @param {HTMLElement} el - L'élément racine du header
 * @param {string} route - La route actuelle
 */
export function updateActiveLink(el, route) {
	let currentPath = route || window.location.pathname; // Fallback si pas de route

	// Extraire uniquement la première section après le "/"
	const firstSegment = currentPath.split('/')[1] || ''; // Évite les erreurs si vide

	// Trouver l'ID du lien correspondant
	const activeLinkId = Object.keys(navigationLinks).find((key) => {
		const path = navigationLinks[key].replace('/', ''); // Supprime le premier "/"
		return firstSegment === path;
	});

	// Réinitialiser l'état de tous les liens
	el.querySelectorAll('a').forEach((link) => link.classList.remove('active'));

	// Activer le lien correspondant
	if (activeLinkId && activeLinkId !== 'home-link') {
		const activeLink = el.querySelector(`#${activeLinkId}`);
		if (activeLink) {
			activeLink.classList.add('active');
		}
	}
}
