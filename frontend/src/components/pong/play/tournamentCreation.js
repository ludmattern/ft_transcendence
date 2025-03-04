// localTournamentCreation.js
import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { createTournament } from '/src/services/tournamentHandler.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

// tournamentCreation.js
export const tournamentCreation = createComponent({
	tag: 'tournamentCreation',
	render: () => {
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		return tournamentMode === 'local'
			? localTournamentCreation.render()
			: onlineTournamentCreation.render();
	},
	attachEvents: async (el) => {
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		if (tournamentMode === 'local') {
			localTournamentCreation.attachEvents(el);
		} else {
			onlineTournamentCreation.attachEvents(el);
		}
	},
});


// localTournamentCreation.js
export const localTournamentCreation = createComponent({
	tag: 'localTournamentCreation',
	render: () => {
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		const username = sessionStorage.getItem('username') || 'You';

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
	},
	attachEvents: (el) => {
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		const username = sessionStorage.getItem('username') || 'You';

		const cancelTournamentButton = el.querySelector('#cancel-tournament');
		cancelTournamentButton.addEventListener('click', () => {
			handleRoute('/pong/play/tournament');
		});

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
			console.log('Local tournament created with players:', players);
			const shuffledPlayers = shuffleArray([...players]);
			createTournament(shuffledPlayers);
			// Reset players list après création
			players = [username];
			updateLocalUI();
		});
	},
});

// onlineTournamentCreation.js
// ONLINE TOURNAMENT CREATION **************************************************************************************************************************************************
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { ws } from '/src/services/socketManager.js';
import { fetchUserId } from '/src/components/hud/centralWindow/otherProfileForm.js';

let onlinePlayers = [];
let isOrganizer = false; // Variable globale pour stocker le statut d'organisateur

/**
 * Vérifie l'existence d'un lobby pour l'utilisateur.
 * Si un lobby existe, recharge ses données.
 * Sinon, envoie la demande de création d'un nouveau lobby.
 */
async function checkOrCreateLobby(tournamentSize) {
	try {
		console.log("Vérification de l'existence d'un lobby...");
		const userId = await getUserIdFromCookieAPI();
		console.log("User ID récupéré :", userId);

		let url = `/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(userId)}/`;
		console.log("Appel de l'API pour récupérer la clé de tournoi :", url);

		let response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Erreur HTTP lors de la vérification du lobby (code ${response.status})`);
		}
		let data = await response.json();
		const tournamentSerialKey = data.serial_key;
		console.log("Clé de tournoi récupérée :", tournamentSerialKey);

		if (tournamentSerialKey) {
			console.log("Un lobby existe déjà. Rechargement des données du lobby...");
			url = `/api/tournament-service/isUserTournamentOrganizer/${encodeURIComponent(userId)}/${encodeURIComponent(tournamentSerialKey)}/`;
			console.log("Appel de l'API pour vérifier si l'utilisateur est l'organisateur du tournoi :", url);
			response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Erreur HTTP lors de la vérification de l'organisateur du tournoi (code ${response.status})`);
			}
			data = await response.json();
			isOrganizer = data.is_organizer;
			console.log("Statut d'organisateur récupéré :", isOrganizer);
			await reloadLobbyData(tournamentSerialKey, isOrganizer);
		} else {
			console.log("Aucun lobby existant. Création d'un nouveau lobby...");
			isOrganizer = true; // Si aucun lobby existe, on est l'organisateur par défaut
			await createNewLobby(userId, tournamentSize);
		}
	} catch (error) {
		console.error("Erreur dans checkOrCreateLobby :", error);
	}
}

/**
 * Crée un nouveau lobby en envoyant la demande via WebSocket.
 */
async function createNewLobby(userId, tournamentSize) {
	try {
		const payload = {
			type: 'tournament_message',
			action: 'create_tournament_lobby',
			userId: userId,
			tournamentSize: tournamentSize,
			timestamp: new Date().toISOString(),
		};
		console.log("Envoi du payload pour créer le lobby :", payload);
		ws.send(JSON.stringify(payload));
		console.log("Payload envoyé avec succès.");
	} catch (error) {
		console.error("Erreur lors de la création du nouveau lobby :", error);
	}
}

/**
 * Recharge les données d'un lobby existant.
 * Par exemple, on peut récupérer la liste des participants et mettre à jour l'interface.
 */
async function reloadLobbyData(tournamentSerialKey, isOrganizer) {
	try {
		console.log("Rechargement des données pour le lobby avec clé :", tournamentSerialKey);
		const tournamentDetails = await getTournamentIdFromSerialKey(tournamentSerialKey);
		// Utilisez tournamentDetails.tournament_id au lieu de tournamentDetails.id
		const tournamentId = tournamentDetails.tournament_id;
		console.log("Tournament ID extrait :", tournamentId);

		// Appel de la fonction pour récupérer les participants en utilisant l'id du tournoi
		console.log('1 -> tournoi id :', tournamentId);
		await fetchTournamentParticipants(tournamentId);
		console.log("Données du lobby rechargées avec succès.");
	} catch (error) {
		console.error("Erreur lors du rechargement des données du lobby :", error);
	}
}

/**
 * Composant de création de tournoi en ligne.
 * Il gère l'affichage du lobby, l'envoi d'invitations et les contrôles associés.
 */
export const onlineTournamentCreation = createComponent({
	tag: 'onlineTournamentCreation',
	render: () => {
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		return `
      <section class="col-12 d-flex flex-column align-items-center text-center p-5"
          style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
        <h1 class="mb-4">Online Tournament Creation</h1>
        
        <!-- Affichage du Room Code -->
        <div class="mb-4">
          <h3 class="text-white">Room Code:</h3>
          <h2 id="room-code" class="text-warning"></h2>
          <button id="copy-room-code" class="btn btn-pong btn-sm">Copy Room Code</button>
        </div>
        
        <!-- Liste des joueurs en ligne -->
        <div class="w-50 mb-4">
          <h2 class="text-white">
            Players (<span id="online-players-count">0</span>/<span id="max-players-online">${tournamentSize}</span>)
          </h2>
          <ul id="online-players-list" class="list-group"></ul>
        </div>
        
        <!-- Les boutons de contrôle seront affichés ici -->
        <div id="control-buttons-container" style="display: flex; flex-direction: column;"></div>
      </section>
    `;
	},
	attachEvents: async (el) => {
		subscribe('leavingLobby', () => {
			handleRoute('/pong/play/tournament');
		});
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		const userId = await getUserIdFromCookieAPI();
		const username = sessionStorage.getItem('username') || 'You';

		// Vérifier ou créer le lobby ; cette fonction met à jour la variable globale isOrganizer
		await checkOrCreateLobby(tournamentSize);

		// Attendre un peu que le lobby soit mis en place
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Récupération des éléments de l'interface
		const roomCodeElement = el.querySelector('#room-code');
		const copyRoomCodeButton = el.querySelector('#copy-room-code');
		const controlButtonsContainer = el.querySelector('#control-buttons-container');

		// Bouton pour copier le room code
		copyRoomCodeButton.addEventListener('click', () => {
			const roomCode = roomCodeElement.textContent;
			navigator.clipboard.writeText(roomCode)
				.then(() => alert('Room code copied to clipboard!'))
				.catch(() => alert('Failed to copy room code.'));
		});

		// Si l'utilisateur est organisateur, ajouter la zone d'invitation
		if (isOrganizer) {
			const inviteContainerHTML = `
        <div id="invite-container" class="w-50 mb-4">
          <div class="input-group">
            <input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
            <button id="send-invite" class="btn btn-pong-blue" type="button">Send Invitation</button>
          </div>
        </div>
      `;
			// On insère la zone d'invitation avant le conteneur des boutons de contrôle
			controlButtonsContainer.insertAdjacentHTML('beforebegin', inviteContainerHTML);

			const inviteInput = el.querySelector('#invite-input');
			const sendInviteButton = el.querySelector('#send-invite');

			// Envoi d'invitations (uniquement pour l'organisateur)
			sendInviteButton.addEventListener('click', async () => {
				const invitedUsernamePilot = inviteInput.value.trim();
				if (!invitedUsernamePilot) {
					alert('Please enter an invitation message.');
					return;
				}
				if (onlinePlayers.length >= tournamentSize) {
					alert(`You can only have up to ${tournamentSize} players.`);
					return;
				}

				const userId = await getUserIdFromCookieAPI();
				const recipientId = await fetchUserId(invitedUsernamePilot);
				if (!recipientId) {
					createNotificationMessage(`${invitedUsernamePilot} has not enlisted in Space Force yet`, 5000, true);
					inviteInput.value = '';
					return;
				} else if (recipientId.toString() === userId) {
					createNotificationMessage(`You cannot invite yourself`, 5000, true);
					inviteInput.value = '';
					return;
				}

				const payload = {
					type: 'tournament_message',
					action: 'tournament_invite',
					author: userId,
					recipient: recipientId,
				};
				console.log("Envoi de l'invitation :", payload);
				ws.send(JSON.stringify(payload));

				inviteInput.value = '';
			});

			inviteInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					sendInviteButton.click();
				}
			});
		}

		// Affichage des boutons de contrôle en fonction du statut d'organisateur
		if (isOrganizer) {
			controlButtonsContainer.innerHTML = `
				<button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
			`;
			const cancelTournamentButton = controlButtonsContainer.querySelector('#cancel-tournament');
			cancelTournamentButton.addEventListener('click', async () => {
				const userId = await getUserIdFromCookieAPI();
				const payload = {
					type: 'tournament_message',
					action: 'cancel_tournament',
					userId: userId,
				};
				ws.send(JSON.stringify(payload));
			});
		} else {
			// Pour les non-organisateurs, afficher uniquement un bouton "Leave Lobby"
			controlButtonsContainer.innerHTML = `
				<button id="leave-lobby" class="btn btn-pong-danger mt-3">Leave Lobby</button>
			`;
			const leaveLobbyButton = controlButtonsContainer.querySelector('#leave-lobby');
			leaveLobbyButton.addEventListener('click', async () => {
				const userId = await getUserIdFromCookieAPI();
				const payload = {
					type: 'tournament_message',
					action: 'leave_tournament',
					userId: userId,
				};
				ws.send(JSON.stringify(payload));
			});
		}

		// Abonnement aux mises à jour de la liste des joueurs
		subscribe('updatePlayerList', (data) => {
			console.log('2 -> tournoi id :', data, data.tournament_id);
			fetchTournamentParticipants(data.tournament_id);
		});
	},
});

/**
 * Met à jour l'interface affichant la liste des joueurs en ligne.
 */
export function updateOnlinePlayersUI(players, tournamentSize, currentUserId, currentUserIsOrganizer) {
	const onlinePlayersList = document.querySelector('#online-players-list');
	const onlinePlayersCountSpan = document.querySelector('#online-players-count');
	const createTournamentButton = document.querySelector('#create-tournament');

	if (!onlinePlayersList || !onlinePlayersCountSpan) {
		console.warn('updateOnlinePlayersUI: Certains éléments DOM sont manquants.');
		return;
	}

	onlinePlayersCountSpan.textContent = players.length;
	onlinePlayersList.innerHTML = '';

	// Tri : afficher en premier les joueurs confirmés (status !== 'pending')
	const sortedPlayers = players.sort((a, b) => {
		const aPending = a.status === 'pending' ? 1 : 0;
		const bPending = b.status === 'pending' ? 1 : 0;
		return aPending - bPending;
	});

	sortedPlayers.forEach((player) => {
		const li = document.createElement('li');
		li.className = 'list-group-item d-flex justify-content-between align-items-center';
		const displayName = player.username || `User ${player.id}`;
		li.textContent = displayName;

		if (player.id == currentUserId) {
			const badge = document.createElement('span');
			badge.className = 'badge bg-secondary ms-2';
			badge.textContent = 'You';
			li.appendChild(badge);
		} else if (currentUserIsOrganizer) {
			const controlButtonsContainer = document.querySelector('#control-buttons-container');
			let createTournamentButton = document.querySelector('#create-tournament');
			if (players.length === tournamentSize) {
				if (!createTournamentButton) {
					createTournamentButton = document.createElement('button');
					createTournamentButton.id = 'create-tournament';
					createTournamentButton.className = 'btn btn-pong';
					createTournamentButton.textContent = 'Create Tournament';
					createTournamentButton.addEventListener('click', () => {
						const roomCode = document.querySelector('#room-code').textContent;
						console.log("Tournoi en ligne créé avec le room code :", roomCode);
						console.log("Liste des joueurs :", onlinePlayers);
						sessionStorage.setItem('tournamentCreationNeeded', true);
						handleRoute('/pong/play/current-tournament');
					});
					controlButtonsContainer.insertAdjacentElement('afterbegin', createTournamentButton);
				}
			} else {
				if (createTournamentButton) {
					createTournamentButton.remove();
				}
			}		
			// Seulement l'organisateur peut voir les boutons Kick/Cancel
			if (player.status === 'pending') {
				const badge = document.createElement('span');
				badge.className = 'badge bg-warning ms-2';
				badge.textContent = 'Pending';
				li.appendChild(badge);

				const cancelButton = document.createElement('button');
				cancelButton.className = 'btn btn-pong-danger btn-sm ms-2';
				cancelButton.textContent = 'Cancel';
				cancelButton.addEventListener('click', async () => {
					const url = `/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(currentUserId)}/`;
					console.log("Appel de l'API pour récupérer la clé de tournoi :", url);
					const response = await fetch(url);
					const data = await response.json();
					const tournamentSerialKey = data.serial_key;
					const tournamentId = await getTournamentIdFromSerialKey(tournamentSerialKey);
					const payload = {
						type: 'tournament_message',
						action: 'cancel_tournament_invite',
						userId: player.id,
						tournamentId: tournamentId.tournament_id,
					};
					ws.send(JSON.stringify(payload));
				});
				li.appendChild(cancelButton);
			} else {
				const kickButton = document.createElement('button');
				kickButton.className = 'btn btn-pong-danger btn-sm ms-2';
				kickButton.textContent = 'Kick';
				kickButton.addEventListener('click', async () => {
					const url = `/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(currentUserId)}/`;
					console.log("Appel de l'API pour récupérer la clé de tournoi :", url);
					const response = await fetch(url);
					const data = await response.json();
					const tournamentSerialKey = data.serial_key;
					const tournamentId = await getTournamentIdFromSerialKey(tournamentSerialKey);
					const payload = {
						type: 'tournament_message',
						action: 'kick_tournament',
						author: currentUserId,
						recipient: player.id,
						tournamentId: tournamentId.tournament_id,
					};
					ws.send(JSON.stringify(payload));
				});
				li.appendChild(kickButton);
			}
		}
		onlinePlayersList.appendChild(li);
	});

	if (createTournamentButton) {
		createTournamentButton.disabled = players.length !== tournamentSize;
	}
}

/**
 * Récupère les participants du tournoi.
 * La clé du tournoi (tournamentSerialKey) sert ici d'identifiant.
 */
export async function fetchTournamentParticipants(tournamentId) {
	try {
		const apiUrl = `/api/tournament-service/getTournamentParticipants/${encodeURIComponent(tournamentId)}/`;
		console.log(`🔍 Récupération des participants du tournoi via : ${apiUrl}`);

		const response = await fetch(apiUrl, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			credentials: "include"
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`⚠️ Erreur HTTP ${response.status} :`, errorText);
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		console.log("✅ Données récupérées :", data);

		// On suppose que l'objet retourné contient une propriété 'participants'
		onlinePlayers = data.participants || [];
		console.log("✅ Participants mis à jour :", onlinePlayers);

		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
		const currentUserId = await getUserIdFromCookieAPI();

		updateOnlinePlayersUI(onlinePlayers, tournamentSize, currentUserId, isOrganizer);
	} catch (error) {
		console.error("❌ Échec de la récupération des participants :", error);
	}
}

export async function getTournamentIdFromSerialKey(serialKey) {
	try {
		const apiUrl = `/api/tournament-service/getTournamentIdFromSerialKey/${encodeURIComponent(serialKey)}/`;
		console.log("Récupération du tournoi via serial key depuis :", apiUrl);
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			credentials: "include"
		});
		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Erreur HTTP ${response.status} lors de la récupération du tournoi :`, errorText);
			throw new Error(`Erreur HTTP ${response.status}`);
		}
		const tournament = await response.json();
		console.log("Détails du tournoi récupérés :", tournament);
		return tournament;
	} catch (error) {
		console.error("Erreur dans getTournamentBySerialKey :", error);
		throw error;
	}
}

export { onlinePlayers, checkOrCreateLobby, reloadLobbyData };
