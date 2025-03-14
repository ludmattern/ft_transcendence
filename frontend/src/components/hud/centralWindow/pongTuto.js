import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { gameModeSelector, cancelMode } from '/src/services/gameModeHandler.js';
import { getInfo } from '/src/services/infoStorage.js';

export const pongTuto = (config) =>
	createComponent({
		tag: 'pongTuto',

		// Générer le HTML
		render: () => `
    <div id="logout-form" class="form-container">
      <h5>Get Ready for the Match!</h5>
      <div class="background-central-span p-3">
        <p class="mb-3">${config.type !== 'fullScreen' ? 'Here are the controls for each player:' : 'Here are your controls:'}</p>

        <div class="mb-3">
          <h6>Player 1: <strong id="username-placeholder">Loading...</strong></h6>
          <p><strong class="border p-2">W</strong> up</p>
          <p><strong class="border p-2">A</strong> left <strong class="border p-2">S</strong> down <strong class="border p-2">D</strong> right</p>
        </div>

        ${
			config.type !== 'fullScreen'
				? `
        <div class="mb-3">
          <h6>Player 2: <strong>Guest</strong></h6>
          <p><strong class="border p-2">↑</strong> up</p>
          <p><strong class="border p-2">←</strong> left <strong class="border p-2">↓</strong> down <strong class="border p-2">→</strong> right</p>
        </div>`
				: ''
		}
        
        <label class="form-label">
          <p class="ready-question">Click "Ready" when you're set to play!</p>
          <p class="d-none waiting-msg">Waiting for your opponent...</p>
        </label>

        <div class="pong-loader d-none"></div>

        <div class="d-flex justify-content-center">
          <button class="btn success bi bi-check" id="ready"> Ready </button>
          <button class="btn danger bi bi-x" id="close"> Cancel </button>
        </div>
      </div>
    </div>
  `,

		attachEvents: async (el) => {
			const usernameData = await getInfo('username');
			const username = usernameData.success ? usernameData.value : 'Guest';
			const usernamePlaceholder = el.querySelector('#username-placeholder');
			if (usernamePlaceholder) {
				usernamePlaceholder.textContent = username;
			}

			const readyButton = el.querySelector('#ready');
			readyButton.focus();

			el.querySelector('#close').addEventListener('click', (e) => {
				e.preventDefault();
				cancelMode(config);
				handleRoute('/topong');
			});

			readyButton.addEventListener('click', () => {
				gameModeSelector(config);
				readyButton.remove();
				el.querySelector('.ready-question').remove();
				el.querySelector('.pong-loader').classList.remove('d-none');
				el.querySelector('.waiting-msg').classList.remove('d-none');
			});
		},
	});
