import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { subscribe } from '/src/services/eventEmitter.js';

const navigationLinks = {
	'pong-solo-link': '/pong/play/solo',
	'pong-multiplayer-link': '/pong/play/multiplayer',
	'pong-tournament-link': '/pong/play/tournament',
};

export const navBar = createComponent({
	tag: 'navBar',

	render: () => `
	<!-- Sous-menu à gauche -->
	<aside class="col-md-3 p-3">
		<ul class="list-unstyled p-2">
			<li id="pong-solo-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-person-fill"> SOLO</a>
			</li>
			<li id="pong-multiplayer-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-people-fill"> MULTIPLAYER</a>
			</li>
			<li id="pong-tournament-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-trophy-fill"> TOURNAMENT</a>
			</li>
		</ul>
	</aside>
  `,

	attachEvents: (el) => {
		Object.entries(navigationLinks).forEach(([linkId, route]) => {
			const linkElement = el.querySelector(`#${linkId}`);
			if (linkElement) {
				linkElement.addEventListener('click', (e) => {
					e.preventDefault();
					handleRoute(route);
				});
			}
		});

		updateActiveLink(el, window.location.pathname);

		function handleRouteChanged(route) {
			updateActiveLink(el, route);
		}
		subscribe('routeChanged', handleRouteChanged);
	},
});

/**
 * @param {HTMLElement} el
 * @param {string} futurePath
 */
function updateActiveLink(el, futurePath) {
	const activeLinkId = Object.keys(navigationLinks).find((key) => {
		const path = navigationLinks[key];
		return futurePath === path || futurePath.startsWith(`${path}/`);
	});

	if (futurePath.startsWith('/pong')) {
		el.querySelectorAll('li').forEach((item) => item.classList.remove('active'));
	}

	if (activeLinkId) {
		const activeItem = el.querySelector(`#${activeLinkId}`);
		if (activeItem) {
			activeItem.classList.add('active');
		}
	}
}
