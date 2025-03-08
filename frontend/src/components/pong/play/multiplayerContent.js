import { createComponent } from '/src/utils/component.js';
import { notAuthenticatedThenRedirect } from '/src/services/router.js';
import { ws } from '/src/services/websocket.js';
import { playGame } from '/src/components/pong/play/utils.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export const multiplayerContent = createComponent({
	tag: 'multiplayerContent',

	render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
      <h2 class="text-white text-center">Ready to Embrace Multiplayer Mayhem?</h2>
      <p class="text-secondary text-center">
        So you really want to test your skills against real opponents? Pick your method of inevitable humiliation!
      </p>

      <!-- Local Multiplayer -->
      <div class="mb-4">
        <legend class="h4 text-white">Local Showdown</legend>
        <p class="text-secondary">
          Gather your pals for a head-to-head battle where defeat is guaranteed.
        </p>
        <label for="localDifficulty" class="form-label">How Fast Will You Crash?</label>
        <button class="btn btn-pong mx-3" id="launchLocal">
          Challenge Your Friends to a Losing Streak
        </button>
      </div>

      <hr class="text-secondary my-4">

      <!-- Online Matchmaking -->
      <div class="mb-4">
        <legend class="h4 text-white">Online Matchmaking</legend>
        <p class="text-secondary">
          Step into the arena and get queued up for instant regret.
        </p>
        <label for="matchmakingDifficulty" class="form-label">Select Your Level of Despair</label>
        <button class="btn btn-pong mx-3" id="launchMatch">
          Join the Queue for Instant Humiliation
        </button>
        <button class="btn btn-pong d-none" id="leaveMatch">
          Cancel the Queue
        </button>
      </div>

      <hr class="text-secondary my-4">

      <!-- Private Match -->
      <div class="mb-4">
        <legend class="h4 text-white">Private Battle</legend>
        <p class="text-secondary">
          Enter a room with a chosen foe or ally and share the misery.
        </p>
        <label for="privateGameInput" class="form-label">Opponent username</label>
        <div class="input-group mt-2">
          <input type="text" class="form-control" id="privateGameInput" placeholder="Enter player username" aria-label="Room Code">
          <button class="btn btn-pong-blue mx-3" id="createPrivate" type="button">Invite Player</button>
        </div>
      </div>
    </section>
  `,

	attachEvents: async (el) => {
		const localButton = el.querySelector('#launchLocal');
		localButton.addEventListener('click', () => {
			const config = {
				gameMode: 'local',
				type: 'splitScreen',
			};
			playGame(config);
		});

		// Online Matchmaking
		const matchButton = el.querySelector('#launchMatch');
		const leaveMatchButton = el.querySelector('#leaveMatch');
		matchButton.addEventListener('click', () => {
			const config = {
				gameMode: 'matchmaking',
				type: 'fullScreen',
			};
			playGame(config);
		});

		leaveMatchButton.addEventListener('click', async () => {
			leaveMatchButton.classList.add('d-none');
			matchButton.classList.remove('d-none');
		});

		// Private Match
		const createPrivateButton = el.querySelector('#createPrivate');
		const privateGameInput = el.querySelector('#privateGameInput');

		createPrivateButton.addEventListener('click', async () => {
			const opponentUsername = privateGameInput.value.trim();
			if (!opponentUsername) {
				console.log('Please enter a username code.');
				return;
			}
			if (notAuthenticatedThenRedirect()) return;
			const userId = await getUserIdFromCookieAPI();
			const config = {
				gameMode: 'private',
				action: 'create',
				matchkey: userId,
				type: 'fullScreen',
			};
			console.log(config);
			playGame(config);
		});

		privateGameInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				createPrivateButton.click();
			}
		});
	},
});

export async function leaveMatchmaking() {
	const userId = await getUserIdFromCookieAPI();
	payload = {
		type: 'matchmaking',
		action: 'leave',
		user_id: userId,
	};

	ws.send(JSON.stringify(payload));
	console.log('Sent \'leave matchmaking\' via WebSocket');
}
