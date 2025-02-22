import { createComponent } from '/src/utils/component.js';
import { initWireframeScene } from '/src/3d/wireframeScene.js';
import { startAnimation } from '/src/components/hud/index.js';

/**
 * Génère un élément de navigation (onglet) avec un lien.
 *
 * @param {string} label - Le label de l'onglet
 * @param {number} value - La valeur ou l'identifiant de l'onglet
 * @param {boolean} active - Si l'onglet est actif
 * @returns {string} - HTML de l'onglet
 */
function createNavItem(label, value, active = false) {
	return `
    <li class="nav-item" data-tab="${value}">
      <span class="nav-link ${active ? 'active' : ''}">
        <a href="#" data-tab="${label.toLowerCase()}">${label}</a>
      </span>
    </li>
  `;
}

/**
 * Composant RightSideWindow
 */
export const rightSideWindow = createComponent({
	tag: 'rightSideWindow',

	render: () => `
    <div class="d-flex flex-column">
      <div class="r-side-window right-side-window">
        <ul class="nav nav-tabs">
          ${createNavItem('OVERVIEW', 1, true)}
          <li class="nav-item">
            <div class="container">
              <div class="right-side-window-expander active" id="r-sw-expander">
                <span class="r-line"></span>
                <span class="r-line"></span>
                <span class="r-line"></span>
              </div>
            </div>
          </li>
        </ul>
        <div class="r-tab-content" id="r-tab-content">
          <div class="wireframe" id="wireframe"></div>
        </div>
      </div>
    </div>
  `,

	attachEvents: (el) => {
		// Gestion de l'expansion et de la réduction
		const expanders = el.querySelectorAll('.right-side-window-expander');
		const rightSideWindow = el.querySelector('.r-tab-content');

		expanders.forEach((expander) => {
			expander.addEventListener('click', function () {
				this.classList.toggle('active');
				rightSideWindow.classList.toggle('well-hidden');
			});
		});

		// Initialisation de la scène THREE.js
		const wireframeDiv = el.querySelector('#wireframe');
		if (wireframeDiv) {
			initWireframeScene(); // Appelle la fonction pour créer la scène
		} else {
			console.warn('Wireframe container not found in DOM.');
		}

		// Gestion des clics sur les onglets (si nécessaire)
		const tabLinks = el.querySelectorAll('.r-side-window .nav-link a');
		const tabContentContainer = el.querySelector('#r-tab-content');

		tabLinks.forEach((link) => {
			link.addEventListener('click', (event) => {
				event.preventDefault();

				const tabName = link.getAttribute('data-tab');

				// Mise à jour des classes actives pour les onglets
				tabLinks.forEach((tabLink) => {
					tabLink.parentElement.classList.remove('active');
				});
				link.parentElement.classList.add('active');

				// Logique pour gérer le changement d'onglet
				if (tabName === 'overview') {
					// Charger ou mettre à jour le contenu de l'onglet
				}
			});
		});

		const parentContainer = el.parentElement;
		startAnimation(parentContainer, 'light-animation', 1000);
	},
});
