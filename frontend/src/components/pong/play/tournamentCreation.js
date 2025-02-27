import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { createTournament } from '/src/services/tournamentHandler.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { ws } from '/src/services/socketManager.js';
import { fetchUserId } from '/src/components/hud/centralWindow/otherProfileForm.js'
import { initializeWebSocket } from '/src/services/socketManager.js';


let onlinePlayers = [];

// Fonction utilitaire pour générer un room code alphanumérique à 6 caractères
function generateRoomCode() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

export const tournamentCreation = createComponent({
	tag: 'tournamentCreation',

	render: () => {
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;

		if (tournamentMode === 'local') {
			// Interface pour le tournoi en local
			return `
		<section class="col-12 d-flex flex-column align-items-center text-center p-5"
				style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
		<h1 class="mb-4">Local Tournament Creation</h1>
		
		<!-- Zone d'ajout d'un joueur -->
		<div class="w-50 mb-4">
			<div class="input-group">
			<input id="player-name" type="text" class="form-control" placeholder="Enter player name" aria-label="Player name">
			<button id="add-player" class="btn btn-pong-blue" type="button">Add Player</button>
			</div>
		</div>
		
		<!-- Liste des joueurs -->
		<div class="w-50 mb-4">
			<h2>
			Players (<span id="players-count">0</span>/<span id="max-players">${tournamentSize}</span>)
			</h2>
			<ul id="players-list" class="list-group"></ul>
		</div>
		
		<!-- Bouton de création du tournoi -->
		<button id="create-tournament" class="btn btn-pong" disabled>Create Tournament</button>
		<button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
		</section>
	`;
		} else {
			// Interface pour le tournoi en online
			const roomCode = generateRoomCode();
			return `
		<section class="col-12 d-flex flex-column align-items-center text-center p-5"
				style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
		<h1 class="mb-4">Online Tournament Creation</h1>
		
		<!-- Affichage du Room Code -->
		<div class="mb-4">
			<h3 class="text-white">Room Code:</h3>
			<h2 id="room-code" class="text-warning">${roomCode}</h2>
			<button id="copy-room-code" class="btn btn-pong btn-sm">Copy Room Code</button>
		</div>
		
		<!-- Liste des joueurs en ligne -->
		<div class="w-50 mb-4">
			<h2 class="text-white">
			Players (<span id="online-players-count">0</span>/<span id="max-players-online">${tournamentSize}</span>)
			</h2>
			<ul id="online-players-list" class="list-group"></ul>
		</div>
		
		<!-- Zone d'envoi d'invitations -->
		<div class="w-50 mb-4">
			<div class="input-group">
			<input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
			<button id="send-invite" class="btn btn-pong-blue" type="button">Send Invitation</button>
			</div>
		</div>
		
		<!-- Bouton de création du tournoi -->
		<button id="create-tournament" class="btn btn-pong" disabled>Create Tournament</button>
		<button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
		
		<!-- Bouton de simulation d'arrivée de joueur (pour la démo) -->
		<button id="simulate-join" class="btn btn-pong mt-3">Simulate Player Join</button>
		</section>
	`;
		}
	},
	attachEvents: async (el) => {
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		const username = sessionStorage.getItem('username') || 'You';

		const cancelTournamentButton = el.querySelector('#cancel-tournament');
		if (cancelTournamentButton) {
			cancelTournamentButton.addEventListener('click', () => {
				handleRoute('/pong/play/tournament');
			});
		}

		if (tournamentMode === 'local') {
			const playerNameInput = el.querySelector('#player-name');
			const addPlayerButton = el.querySelector('#add-player');
			const playersList = el.querySelector('#players-list');
			const playersCountSpan = el.querySelector('#players-count');
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
					alert('THis players is already insinde this tournament');
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
				console.log('Local tournament created with players:', players);
				const shuffledPlayers = shuffleArray([...players]);
				createTournament(shuffledPlayers);

				players = [username];
			});
		} else { //online
			const roomCodeElement = el.querySelector('#room-code');
			const roomCode = roomCodeElement.textContent;
			const copyRoomCodeButton = el.querySelector('#copy-room-code');
			const inviteInput = el.querySelector('#invite-input');
			const sendInviteButton = el.querySelector('#send-invite');
			const createTournamentButton = el.querySelector('#create-tournament');

			const userId = await getUserIdFromCookieAPI();

			const onlinePlayersList = el.querySelector('#online-players-list');
			const onlinePlayersCountSpan = el.querySelector('#online-players-count');

			createTournamentButton.addEventListener('click', () => { // Launch Tournament
				console.log('Online tournament created with room code:', roomCode);
				console.log('Players:', onlinePlayers);
				alert('Tournament created with room code: ' + roomCode);
			});

			copyRoomCodeButton.addEventListener('click', () => { // Copy Room Code, MIGHT NOT USE IT
				navigator.clipboard.writeText(roomCode).then(
					() => {
						alert('Room code copied to clipboard!');
					},
					() => {
						alert('Failed to copy room code.');
					}
				);
			});

			sendInviteButton.addEventListener('click', async () => { // Send Invitation (need to send a payload to the invited player)
				const inviteMessage = inviteInput.value.trim();
				if (!inviteMessage) {
					alert('Please enter an invitation message.');
					return;
				}
				if (onlinePlayers.length >= tournamentSize) {
					alert(`You can only have up to ${tournamentSize} players.`);
					return;
				}
				const userId = await getUserIdFromCookieAPI();
				const payload = {
					type: 'info_message',
					action: 'tournament_invite',
					author: userId,
					recipient: await fetchUserId(inviteMessage),	
				}
				console.log('Payload:', payload);
				ws.send(JSON.stringify(payload));
				onlinePlayers.push({ name: inviteMessage, pending: true });
				fetchTournamentParticipants(userId);
				console.log(`Invitation sent: "${inviteMessage}" with Room Code: ${roomCode}`);
				inviteInput.value = '';
			});

			inviteInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					sendInviteButton.click();
				}
			});

			const simulateJoinButton = el.querySelector('#simulate-join');
			let simulatedPlayerIndex = 1;
			simulateJoinButton.addEventListener('click', () => {
				if (onlinePlayers.length >= tournamentSize) {
					alert('Player limit reached!');
					return;
				}
				const newPlayerName = 'Player ' + simulatedPlayerIndex++;
				onlinePlayers.push({ name: newPlayerName, pending: false });
				fetchTournamentParticipants(userId);
			});
		}
	},
});

export function updateOnlinePlayersUI() {
	const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
	const username = sessionStorage.getItem('username') || 'You';

	const onlinePlayersList = document.querySelector('#online-players-list');
	const onlinePlayersCountSpan = document.querySelector('#online-players-count');
	const createTournamentButton = document.querySelector('#create-tournament');

	if (!onlinePlayersList || !onlinePlayersCountSpan || !createTournamentButton) {
		console.warn('updateOnlinePlayersUI: Missing DOM elements.');
		return;
	}

	onlinePlayersCountSpan.textContent = onlinePlayers.length;
	onlinePlayersList.innerHTML = '';

	const sortedPlayers = onlinePlayers.sort((a, b) => b.pending - a.pending);

	sortedPlayers.forEach((player, index) => {
		const li = document.createElement('li');
		li.className = 'list-group-item d-flex justify-content-between align-items-center';
		li.textContent = player.name;

		if (player.name === username) {
			const badge = document.createElement('span');
			badge.className = 'badge bg-secondary ms-2';
			badge.textContent = 'You';
			li.appendChild(badge);
		} else if (player.pending) {
			const badge = document.createElement('span');
			badge.className = 'badge bg-warning ms-2';
			badge.textContent = 'Pending';
			li.appendChild(badge);

			const cancelButton = document.createElement('button');
			cancelButton.className = 'btn btn-pong-danger btn-sm ms-2';
			cancelButton.textContent = 'Cancel';
			cancelButton.addEventListener('click', () => {
				onlinePlayers.splice(index, 1);
				fetchTournamentParticipants();
			});
			li.appendChild(cancelButton);
		} else {
			const kickButton = document.createElement('button');
			kickButton.className = 'btn btn-pong-danger btn-sm ms-2';
			kickButton.textContent = 'Kick';
			kickButton.addEventListener('click', () => {
				onlinePlayers.splice(index, 1);
				fetchTournamentParticipants();
			});
			li.appendChild(kickButton);
		}
		onlinePlayersList.appendChild(li);
	});

	createTournamentButton.disabled = onlinePlayers.length !== tournamentSize;
}

export { onlinePlayers };
export async function fetchTournamentParticipants(tournamentId) {
    try {
        const apiUrl = `/api/tournament-service/getTournamentParticipants/${encodeURIComponent(tournamentId)}/`;
        console.log(`🔍 Fetching tournament participants from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`⚠️ HTTP error! Status: ${response.status}, Response:`, await response.text());
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Updated online players:", data);
        updateOnlinePlayersUI();
    } catch (error) {
        console.error("❌ Failed to fetch tournament participants:", error);
    }
}
async function fetchCurrentTournament() {
	try {
	  const userId = await getUserIdFromCookieAPI();
  
	  console.log('User ID récupéré depuis sessionStorage:', userId);
	  const response = await fetch(`/api/tournament-service/get_current_tournament/?user_id=${userId}`);
	  if (!response.ok) {
		throw new Error(`Erreur HTTP ${response.status}`);
	  }
	  const data = await response.json();
	  return data;
	} catch (error) {
	  console.error('Erreur lors de la récupération du bracket :', error);
	  return [];
	}
  }