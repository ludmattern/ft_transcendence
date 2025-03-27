import { createComponent } from '/src/utils/component.js';
import { addCameraRotationListener } from '/src/3d/freeViewHandler.js';
import { startAnimation } from '/src/components/hud/utils/utils.js';

let lastOffset = 198;

export const footer = createComponent({
	tag: 'footer',

	render: () => `
	<div class="row">
	<div class="col-12">
		<!-- Compass -->
		<div class="body">
		<div class="compass">
			<div class="points" id="points">${generateCompassHTML()}</div>
		</div>
		</div>
	</div>
	</div>
`,

	attachEvents: (el) => {
		initializeCompass(el);

		const points = el.querySelectorAll('.points');

		startAnimation(points, 'light-animation', 1000);
	},
});

function generateCompassHTML() {
	const points = [
		'N', '', '15', '', '30', '', 'NE', '', '60', '', '75',
		'', 'E', '', '105', '', '120', '', 'SE', '', '150', '',
		'165', '', 'S', '', '195', '', '210', '', 'SW', '', '240',
		'', '255', '', 'W', '', '285', '', '300', '', 'NW', '',
		'330', '', '345', '', 'N',
	];

	return points.map((text) => `<div class="point${isBold(text) ? ' fw-bold' : ''}">${text}</div>`).join('');
}

/**

 * @param {string} text 
 * @returns {boolean}
 */
function isBold(text) {
	return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].includes(text);
}

/**
 * @param {HTMLElement} el
 */
function initializeCompass(el) {
	const points = el.querySelectorAll('.point');
	const compass = el.querySelector('.compass');
	const radius = 800;
	const baseHeight = 5;
	const rotationRatio = 0.1;

	positionPoints(points, compass, radius, baseHeight, 198);

	window.addEventListener('resize', () => positionPoints(points, compass, radius, baseHeight, lastOffset));

	addCameraRotationListener((cameraRotation) => {
		const percent = (cameraRotation + 1) / 2;
		const offset = percent * 360 * rotationRatio + 180;
		lastOffset = offset;
		positionPoints(points, compass, radius, baseHeight, offset);
	});
}

/**
 * @param {NodeList} points
 * @param {HTMLElement} compass
 * @param {number} radius
 * @param {number} baseHeight
 * @param {number} [offset=180]
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
