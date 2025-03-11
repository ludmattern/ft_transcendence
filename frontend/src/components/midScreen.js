import { createComponent } from '/src/utils/component.js';
import { CSS3DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';
import Store from '/src/3d/store.js';
import { subscribe } from '/src/services/eventEmitter.js';

function removeGiveUpButtons() {
	const wait2 = document.querySelector('.wait2');
	if (!wait2) return;

	const btnContainer = wait2.querySelector('.giveup-buttons');
	if (btnContainer) {
		btnContainer.remove();
	}
}

export const GiveUpButtons = createComponent({
	tag: 'giveUpButtons',

	render: ({ gameMode = 'local' } = {}) => {
		const configs = {
			local: [
				{ id: 'btn-giveup-player-left', text: 'give up', wrapperClass: 'col-1' },
				{ id: 'btn-giveup-player-right', text: 'give up', wrapperClass: 'col-1' },
			],
			online: [{ id: 'btn-giveup', text: 'give up', wrapperClass: 'col-12 text-center' }],
		};

		const config = configs[gameMode] || [];
		const buttonsHtml = config
			.map(
				({ id, text, wrapperClass }) => `
			<div class="${wrapperClass}">
			  <button class="btn bi bi-x danger w-100" id="${id}">${text}</button>
			</div>
		  `
			)
			.join('');

		return `<div class="giveup-buttons d-flex justify-content-around flex-row m-3">${buttonsHtml}</div>`;
	},

	attachEvents: (el, { gameMode = 'local' } = {}) => {
		const eventHandlers = {
			local: {
				'btn-giveup-player-left': () => {
					alert('Abandon local déclenché');
				},
				'btn-giveup-player-right': () => {
					alert('Quitter local déclenché');
				},
			},
			online: {
				'btn-giveup': () => {
					alert('Abandon online déclenché');
					const payload = {
						type: 'game_event'
					};
					ws.send(JSON.stringify(payload));
				},
			},
		};

		const handlers = eventHandlers[gameMode] || {};
		Object.keys(handlers).forEach((id) => {
			const btn = el.querySelector(`#${id}`);
			if (btn) {
				btn.addEventListener('click', handlers[id]);
			}
		});
	},
});

export function showGiveUpButtons(data = { gameMode: 'local' }) {
	const gameMode = typeof data === 'string' ? data : data.gameMode || 'local';
	const wait2 = document.querySelector('.wait2');
	if (!wait2) return;

	wait2.insertAdjacentHTML('beforeend', GiveUpButtons.render({ gameMode }));

	const btnContainer = wait2.querySelector('.giveup-buttons');
	if (btnContainer) {
		GiveUpButtons.attachEvents(btnContainer, { gameMode });
	}
}

export const midScreen = createComponent({
	tag: 'midScreen',

	render: () => `
	  <div class="menu2" id="gameScreen">
		<div class="row mt-3"></div>
		<div class="wait2" style="display: block;">
		  <img class="mid-screensaver" src="/src/assets/img/42.png">
		  <div id="scoreContainer" style="display: none;">
			<h2 class="scoring" id="scoreText">Player Right 0 - 1 Player Left</h2>
		  </div>
		</div>
	  </div>
	`,

	attachEvents: () => {
		subscribe('gameStarted', (data) => {
			if (data === 'local' || (data && data.gameMode === 'local')) showGiveUpButtons('local');
			else showGiveUpButtons('online');
		});
		subscribe('gameOver', removeGiveUpButtons);
		initM2();
	},
});

function initM2() {
	Store.menuElement = document.getElementById('gameScreen');
	if (!Store.menuElement) {
		return;
	}
	Store.menuObject = new CSS3DObject(Store.menuElement);
	Store.menuElement.style.pointerEvents = 'auto';
	Store.menuObject.position.set(-0.2, 6.6, -1.75);
	Store.menuObject.rotation.set(-5.2, 0, 0);
	Store.menuObject.scale.set(0.002, 0.002, 0.002);
	Store.menuElement.style.display = 'none';
	Store.menuElement.classList.add('active');
	if (Store.menuObject) Store.scene.add(Store.menuObject);
}
export function showCountdown() {
	if (!Store.menuElement) {
		return;
	}

	Store.menuElement.style.display = 'block';
	Store.menuElement.classList.add('active');

	const screensaverImg = Store.menuElement.querySelector('.mid-screensaver');
	const scoreContainer = Store.menuElement.querySelector('#scoreContainer');
	const wrapper = Store.menuElement.querySelector('.wait2');

	if (screensaverImg) {
		screensaverImg.style.display = 'none';
	}
	if (scoreContainer) {
		scoreContainer.style.display = 'block';
	}
	if (wrapper) {
		wrapper.style.display = 'flex';
	}

	let countdownEl = Store.menuElement.querySelector('#myCountdown');
	if (!countdownEl) {
		countdownEl = document.createElement('h1');
		countdownEl.classList.add('countdown-text');
		countdownEl.id = 'myCountdown';
		const wait2 = Store.menuElement.querySelector('.wait2');
		if (wait2) {
			wait2.appendChild(countdownEl);
		}
	}

	let count = 3;
	countdownEl.textContent = count;

	const intervalId = setInterval(() => {
		count--;
		if (count > 0) {
			countdownEl.textContent = count;
		} else {
			countdownEl.textContent = 'GO!';
			clearInterval(intervalId);

			setTimeout(() => {
				countdownEl.style.display = 'none';

				if (scoreContainer) {
					scoreContainer.style.display = 'block';
				}
			}, 800);
		}
	}, 1000);
}

export function endGameScreen() {
	if (!Store.menuElement) return;

	const screensaverImg = Store.menuElement.querySelector('.mid-screensaver');
	const scoreContainer = Store.menuElement.querySelector('#scoreContainer');
	const wrapper = Store.menuElement.querySelector('.wait2');

	if (scoreContainer) {
		scoreContainer.style.display = 'none';
	}
	if (screensaverImg) {
		screensaverImg.style.display = 'block';
	}
	if (wrapper) {
		wrapper.style.display = 'block';
	}
}
