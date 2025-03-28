import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { createTournament } from '/src/services/tournamentHandler.js';
import { getInfo } from '/src/services/infoStorage.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

export const localTournamentCreation = createComponent({
	tag: 'localTournamentCreation',

	render: () => {
		return `
      <section class="col-12 d-flex flex-column align-items-center text-center p-5"
               style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
        <h1 class="mb-4">Local Tournament Creation</h1>
        
        <!-- Liste des joueurs -->
        <div class="w-50 mb-4">
          <h2>Players (<span id="players-count">0</span>/<span id="max-players">16</span>)</h2>
          <ul id="players-list" class="list-group"></ul>
        </div>

        <!-- Conteneur pour la zone d'ajout de joueur -->
        <div id="player-input-container" class="w-50 mb-4"></div>
        
        <!-- Conteneur pour le bouton de création du tournoi -->
        <div id="tournament-button-container" class="w-50"></div>
        
        <button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
      </section>
    `;
	},

	attachEvents: (el) => {
		Promise.all([getInfo('tournamentSize'), getInfo('username')])
			.then(([tournamentSizeData, usernameData]) => {
				const tournamentSize = parseInt(tournamentSizeData.success ? tournamentSizeData.value : 16, 10);
				const username = usernameData.success ? usernameData.value : 'You';

				const maxPlayersElement = el.querySelector('#max-players');
				maxPlayersElement.textContent = tournamentSize;

				const playerInputContainer = el.querySelector('#player-input-container');
				const tournamentButtonContainer = el.querySelector('#tournament-button-container');
				const playersCountSpan = el.querySelector('#players-count');
				const playersList = el.querySelector('#players-list');
				const cancelTournamentButton = el.querySelector('#cancel-tournament');

				playerInputContainer.innerHTML = `
          <div class="input-group" id="player-input-group">
            <input id="player-name" type="text" class="form-control" maxlength="20" placeholder="Enter player name" aria-label="Player name">
            <button id="add-player" class="btn btn-pong-blue" type="button">Add Player</button>
          </div>
        `;

				const createTournamentButton = document.createElement('button');
				createTournamentButton.id = 'create-tournament';
				createTournamentButton.className = 'btn btn-pong';
				createTournamentButton.textContent = 'Create Tournament';
				tournamentButtonContainer.innerHTML = '';
				tournamentButtonContainer.appendChild(createTournamentButton);

				cancelTournamentButton.addEventListener('click', () => {
					handleRoute('/pong/play/tournament');
				});

				const playerNameInput = el.querySelector('#player-name');
				const addPlayerButton = el.querySelector('#add-player');

				let players = [username];

				function updateLocalUI() {
					playersCountSpan.textContent = players.length;
					playersList.innerHTML = '';

					players.forEach((name, index) => {
						const li = document.createElement('li');
						li.className = 'list-group-item d-flex justify-content-between align-items-center';
						li.textContent = name;

						if (name !== username) {
							const removeButton = document.createElement('button');
							removeButton.className = 'btn btn-pong-danger btn-sm';
							removeButton.textContent = 'Remove';
							removeButton.addEventListener('click', () => {
								players.splice(index, 1);
								updateLocalUI();
							});
							li.appendChild(removeButton);
						} else {
							const badge = document.createElement('span');
							badge.className = 'badge bg-secondary ms-2';
							badge.textContent = 'You';
							li.appendChild(badge);
						}
						playersList.appendChild(li);
					});

					if (players.length < tournamentSize) {
						playerInputContainer.style.display = 'block';
						tournamentButtonContainer.innerHTML = '';
					} else {
						playerInputContainer.style.display = 'none';
						if (!tournamentButtonContainer.contains(createTournamentButton)) {
							tournamentButtonContainer.innerHTML = '';
							tournamentButtonContainer.appendChild(createTournamentButton);
						}
					}
				}

				updateLocalUI();

				function validateUsername(name) {
					if (name.length < 6 || name.length > 20) {
						return { success: false, message: 'Username must be between 6 and 20 characters.' };
					}
					if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
						return { success: false, message: 'Username can only contain letters, numbers, underscores and hyphens.' };
					}
					return { success: true };
				}

				function addPlayerHandler() {
					const name = playerNameInput.value.trim();
					if (!name) return;
					const validation = validateUsername(name);
					if (!validation.success) {
						createNotificationMessage(validation.message, 2500, true);
						playerNameInput.value = '';
						return;
					}
					if (players.includes(name)) {
						createNotificationMessage('This player is already in tournament', 2500, true);
						playerNameInput.value = '';
						return;
					}
					if (players.length >= tournamentSize) {
						createNotificationMessage(`You can only add up to ${tournamentSize} players`, 2500, true);
						playerNameInput.value = '';
						return;
					}
					players.push(name);
					playerNameInput.value = '';
					updateLocalUI();
				}

				addPlayerButton.addEventListener('click', addPlayerHandler);
				playerNameInput.addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						addPlayerHandler();
					}
				});

				function shuffleArray(array) {
					for (let i = array.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[array[i], array[j]] = [array[j], array[i]];
					}
					return array;
				}

				createTournamentButton.addEventListener('click', () => {
					if (players.length === tournamentSize) {
						const shuffledPlayers = shuffleArray([...players]);
						createTournament(shuffledPlayers);
						players = [username];
						updateLocalUI();
					}
				});
			})
			.catch((error) => {
				console.error('Error when fetching infos: ', error);
			});
	},
});
