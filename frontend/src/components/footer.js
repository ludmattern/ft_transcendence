import { createComponent } from '/src/utils/component.js';
import { addCameraRotationListener, toggleFreeView } from '/src/3d/freeViewHandler.js';

export const footer = createComponent({
  tag: 'footer',

  // Générer le HTML
  render: () => `
	<div class="row">
	<div class="col-12">
		<!-- Free View Button -->
		<div class="d-flex justify-content-center">
		<button class="btn bi mb-4 pb-4 pe-auto" id="free-view">free view</button>
		</div>
		<!-- Compass -->
		<div class="body">
		<div class="compass">
			<div class="points" id="points">${generateCompassHTML()}</div>
		</div>
		</div>
	</div>
	</div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Événement pour le bouton "free view"
    el.querySelector('#free-view').addEventListener('click', toggleFreeView);

    // Gestion de la boussole
    initializeCompass(el);
  },
});

/**
 * Générer dynamiquement les points de la boussole.
 *
 * @returns {string} - HTML des points de la boussole
 */
function generateCompassHTML() {
  const points = [
    'N', '', '15', '', '30', '', 'NE', '', '60', '', '75', '', 'E', '', '105', '', '120', '',
    'SE', '', '150', '', '165', '', 'S', '', '195', '', '210', '', 'SW', '', '240', '', '255', '',
    'W', '', '285', '', '300', '', 'NW', '', '330', '', '345', '', 'N',
  ];

  return points
    .map(
      (text) =>
        `<div class="point${isBold(text) ? ' fw-bold' : ''}">${text}</div>`
    )
    .join('');
}

/**
 * Vérifie si un point doit être en gras.
 *
 * @param {string} text - Texte du point
 * @returns {boolean} - Retourne true si en gras
 */
function isBold(text) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].includes(text);
}

/**
 * Initialise la boussole et ses événements.
 *
 * @param {HTMLElement} el - Élément racine du composant
 */
function initializeCompass(el) {
  const points = el.querySelectorAll('.point');
  const compass = el.querySelector('.compass');
  const radius = 800;
  const baseHeight = 5;
  const rotationRatio = 0.1;

  // Positionnement initial
  positionPoints(points, compass, radius, baseHeight, 180);

  // Gestion de la taille de la fenêtre
  window.addEventListener('resize', () =>
    positionPoints(points, compass, radius, baseHeight)
  );

  // Mise à jour avec la rotation de la caméra
  addCameraRotationListener((cameraRotation) => {
    const percent = (cameraRotation + 1) / 2;
    const offset = percent * 360 * rotationRatio + 180;
    positionPoints(points, compass, radius, baseHeight, offset);
  });
}

/**
 * Positionne les points de la boussole.
 *
 * @param {NodeList} points - Liste des points
 * @param {HTMLElement} compass - Élément parent de la boussole
 * @param {number} radius - Rayon de la boussole
 * @param {number} baseHeight - Hauteur de base
 * @param {number} [offset=180] - Décalage d'angle
 */
function positionPoints(points, compass, radius, baseHeight, offset = 180) {
  const curve = 110 * (1.2 / (window.innerWidth / 3840));
  const totalPoints = points.length;

  points.forEach((point, index) => {
    const angle = (index / totalPoints) * Math.PI + offset * (Math.PI / 180);
    const x = radius * Math.cos(angle) + compass.offsetWidth / 2;
    const y = ((curve * Math.sin(angle)) % curve) + curve;
    point.style.left = `${x}px`;
    point.style.top = `${Math.abs(y + baseHeight)}px`;
  });
}
