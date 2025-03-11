import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { createTournament } from '/src/services/tournamentHandler.js';
import { pushInfo, getInfo, deleteInfo } from '/src/services/infoStorage.js';

export const localTournamentCreation = createComponent({
	tag: 'localTournamentCreation',
	render: () => {
		return `
		<section class="col-12 d-flex flex-column align-items-center text-center p-5"
				style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
			<h1 class="mb-4">Local Tournament Creation</h1>
			
			<!-- Liste des joueurs -->
			<div class="w-50 mb-4">
			<h2>
			Players (<span id="players-count">0</span>/<span id="max-players">...</span>)
			</h2>
			<ul id="players-list" class="list-group"></ul>
			</div>

			<!-- Zone d'ajout d'un joueur -->
			<div class="w-50 mb-4">
				<div class="input-group">
					<input id="player-name" type="text" class="form-control" placeholder="Enter player name" aria-label="Player name">
					<button id="add-player" class="btn btn-pong-blue" type="button">Add Player</button>
				</div>
			</div>
			
			<!-- Bouton de création du tournoi -->
			<button id="create-tournament" class="btn btn-pong" disabled>Create Tournament</button>
			<button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
		</section>
		`;
	},

	attachEvents: async (el) => {
		const tournamentSizeData = await getInfo('tournamentSize');
		const usernameData = await getInfo('username');

		const tournamentSize = parseInt(tournamentSizeData.success ? tournamentSizeData.value : 16, 10);
		const username = usernameData.success ? usernameData.value : 'You';

		const maxPlayersElement = el.querySelector('#max-players');
		const playersCountSpan = el.querySelector('#players-count');
		maxPlayersElement.textContent = tournamentSize;

		const cancelTournamentButton = el.querySelector('#cancel-tournament');
		cancelTournamentButton.addEventListener('click', () => {
			handleRoute('/pong/play/tournament');
		});

		const playerNameInput = el.querySelector('#player-name');
		const addPlayerButton = el.querySelector('#add-player');
		const playersList = el.querySelector('#players-list');
		const createTournamentButton = el.querySelector('#create-tournament');

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
			createTournamentButton.disabled = players.length !== tournamentSize;
		}

		updateLocalUI();

		addPlayerButton.addEventListener('click', () => {
			const name = playerNameInput.value.trim();
			if (!name) return;
			if (players.includes(name)) {
				alert('This player is already inside this tournament');
				return;
			}
			if (players.length >= tournamentSize) {
				alert(`You can only add up to ${tournamentSize} players.`);
				return;
			}
			players.push(name);
			playerNameInput.value = '';
			updateLocalUI();
		});

		playerNameInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				addPlayerButton.click();
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
			const shuffledPlayers = shuffleArray([...players]);
			createTournament(shuffledPlayers);
			players = [username];
			updateLocalUI();
		});
	},
});
