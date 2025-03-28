import { createComponent } from '/src/utils/component.js';
import { handleRoute, handleTournamentRedirection } from '/src/services/router.js';
import { ws } from '/src/services/websocket.js';
import { pushInfo, getInfo } from '/src/services/infoStorage.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

export const tournamentContent = createComponent({
	tag: 'tournamentContent',

	render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">Oh, You Want to Join a Tournament?</h2>
        <p class="text-secondary text-center">That’s adorable. Let’s see how long you last.</p>

        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" id="tab-create" data-bs-toggle="tab" href="#createTournament">
                    Create Your Own Disaster
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-join" data-bs-toggle="tab" href="#joinTournament">
                    Join an Ongoing Bloodbath
                </a>
            </li>
        </ul>

        <div class="tab-content mt-4">
            <div class="tab-pane fade show active" id="createTournament">
                <legend class="h4 text-white">Create Your Own Tournament</legend>
                <p class="text-secondary">How cute, you actually think you’ll make it to the finals?</p>

                ${generateModeSelector()}
                ${generateTournamentSizeSelector()}

                <div class="text-center">
                    <button class="btn btn-pong mt-3" id="createbutton">Create This Mess</button>
                </div>
            </div>

            <div class="tab-pane fade" id="joinTournament">
                <legend class="h4 text-white">Join a specific tournament</legend>
                <p class="text-secondary">You want to join? Great, another victim enters the arena.</p>

                <div class="mb-3">
                    <input type="text" class="form-control" maxlength="8" id="tournamentRoomCode" placeholder="Enter Room Code">
                </div>
                <div class="text-center">
                    <button class="btn btn-pong mt-3" id="joinWithCode">Join via Room Code</button>
                </div>
                
                <hr class="text-secondary my-4">
                
                <h4 class="h4 text-white">Or Join a random tournament</h4>
                ${generateTournamentSizeSelector('random')}
                <div class="text-center">
                    <button class="btn btn-pong" id="joinRandom">Find a tournament</button>
                </div>
            </div>
        </div>
    </section>
  `,

	attachEvents: async (el) => {
		if (await handleTournamentRedirection('/pong/play/tournament')) {
			return;
		}
		const tabs = el.querySelectorAll('.nav-link');
		const tabPanes = el.querySelectorAll('.tab-pane');

		const savedTabId = (await getInfo('activeTournamentTab')).success ? (await getInfo('activeTournamentTab')).value : null;
		if (savedTabId) {
			tabs.forEach((tab) => tab.classList.remove('active'));
			tabPanes.forEach((pane) => pane.classList.remove('show', 'active'));

			const activeTab = el.querySelector(`[href="#${savedTabId}"]`);
			const activePane = el.querySelector(`#${savedTabId}`);
			if (activeTab && activePane) {
				activeTab.classList.add('active');
				activePane.classList.add('show', 'active');
			}
		}

		tabs.forEach((tab) => {
			tab.addEventListener('click', async (e) => {
				e.preventDefault();
				const target = tab.getAttribute('href').substring(1);

				tabs.forEach((t) => t.classList.remove('active'));
				tabPanes.forEach((pane) => pane.classList.remove('show', 'active'));

				tab.classList.add('active');
				el.querySelector(`#${target}`).classList.add('show', 'active');

				await pushInfo('activeTournamentTab', target);
			});
		});

		const joinWithCodeButton = el.querySelector('#joinWithCode');
		const tournamentRoomCodeInput = el.querySelector('#tournamentRoomCode');
		joinWithCodeButton.addEventListener('click', async () => {
			const roomCode = document.getElementById('tournamentRoomCode').value;
			if (!roomCode) {
				return;
			}

			if (roomCode.length !== 8) {
				createNotificationMessage('Invalid room code', 2500, true);
				return;
			}

			try {
				const response = await fetch('/api/tournament-service/try_join_tournament_with_room_code/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ roomCode: roomCode }),
					credentials: 'include',
				});
				const data = await response.json();
				if (data.success) {
					const payload = {
						type: 'tournament_message',
						action: 'join_tournament',
						userId: data.payload.userId,
						tournamentId: data.payload.tournament_id,
					};
					ws.send(JSON.stringify(payload));
					await new Promise((resolve) => setTimeout(resolve, 500));
					handleRoute('/pong/play/tournament-creation');
				} else {
					createNotificationMessage(data.message, 2500, true);
				}
			} catch (error) {
				console.error('Error joining tournament: ', error);
			}
		});

		tournamentRoomCodeInput.addEventListener('keyup', (event) => {
			if (event.key === 'Enter') {
				joinWithCodeButton.click();
			}
		});

		const joinRandomButton = el.querySelector('#joinRandom');
		joinRandomButton.addEventListener('click', async () => {
			let tournamentSize = document.getElementById('tournamentSize-random').value;
			tournamentSize = parseInt(tournamentSize, 10);
			if (isNaN(tournamentSize) || tournamentSize <= 0) {
				console.error('Invalid tournament size: ', tournamentSize);
				createNotificationMessage('Please enter a valid tournament size', 2500, false);
				return;
			} else if (tournamentSize !== 4 && tournamentSize !== 8 && tournamentSize !== 16) {
				createNotificationMessage('Invalid tournament size', 2500, true);
				return;
			}

			try {
				const response = await fetch('/api/tournament-service/try_join_random_tournament/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ tournamentSize: tournamentSize }),
					credentials: 'include',
				});
				const data = await response.json();
				if (data.success) {
					const payload = {
						type: 'tournament_message',
						action: 'join_tournament',
						userId: data.payload.userId,
						tournamentId: data.payload.tournament_id,
					};
					ws.send(JSON.stringify(payload));
					await new Promise((resolve) => setTimeout(resolve, 500));
					handleRoute('/pong/play/tournament-creation');
				} else {
					createNotificationMessage(data.message, 2500, true);
				}
			} catch (error) {
				console.error('Error joining tournament: ', error);
			}
		});

		const createButton = el.querySelector('#createbutton');
		createButton.addEventListener('click', async () => {
			const mode = document.getElementById('tournamentMode').value;
			const size = document.getElementById('tournamentSize').value;

			if (mode && mode !== 'online' && mode !== 'local') {
				createNotificationMessage('Invalid tournament mode', 2500, true);
				return;
			}

			if (size && size !== '4' && size !== '8' && size !== '16') {
				createNotificationMessage('Invalid tournament size', 2500, true);
				return;
			}

			await pushInfo('tournamentMode', mode);
			await pushInfo('tournamentSize', size);

			handleRoute('/pong/play/tournament-creation');
		});
	},
});

function generateModeSelector() {
	return `
    <div class="mb-3">
        <label for="tournamentMode" class="form-label text-white">Select Your Method of Humiliation</label>
        <select class="form-select" id="tournamentMode">
            <option value="local">Local - Get Mocked in Person</option>
            <option value="online">Online - Get Destroyed by Strangers</option>
        </select>
        <small class="text-muted">Either way, you're getting eliminated first.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur du format du tournoi (4, 8 ou 16 joueurs)
 * @param {string} variant - Optionnel. Si fourni, le select aura un id spécifique (ex: "random" donnera "tournamentSize-random")
 */
function generateTournamentSizeSelector(variant) {
	const selectId = variant ? `tournamentSize-${variant}` : 'tournamentSize';
	return `
    <div class="mb-3">
        <label for="${selectId}" class="form-label text-white">Select the Size of Your Demise</label>
        <select class="form-select" id="${selectId}">
            <option value="4">4 Players - A Small-Scale Humiliation</option>
            <option value="8">8 Players - Double the Disappointment</option>
            <option value="16">16 Players - A Public Execution</option>
        </select>
        <small class="text-muted">The more players, the more people watching you fail.</small>
    </div>
  `;
}
