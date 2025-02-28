// localTournamentCreation.js
import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { createTournament } from '/src/services/tournamentHandler.js';

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

    const url = `/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(userId)}/`;
    console.log("Appel de l'API pour récupérer la clé de tournoi :", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP lors de la vérification du lobby (code ${response.status})`);
    }
    const data = await response.json();
    const tournamentSerialKey = data.serial_key;
    console.log("Clé de tournoi récupérée :", tournamentSerialKey);

    if (tournamentSerialKey) {
      console.log("Un lobby existe déjà. Rechargement des données du lobby...");
	
      await reloadLobbyData(tournamentSerialKey);
    } else {
      console.log("Aucun lobby existant. Création d'un nouveau lobby...");
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
async function reloadLobbyData(tournamentSerialKey) {
	try {
	  console.log("Rechargement des données pour le lobby avec clé :", tournamentSerialKey);
	  const tournamentDetails = await getTournamentIdFromSerialKey(tournamentSerialKey);
	  // Utilisez tournamentDetails.tournament_id au lieu de tournamentDetails.id
	  const tournamentId = tournamentDetails.tournament_id;
	  console.log("Tournament ID extrait :", tournamentId);
	  
	  // Appel de la fonction pour récupérer les participants en utilisant l'id du tournoi
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
        
        <!-- Zone d'envoi d'invitations -->
        <div class="w-50 mb-4">
          <div class="input-group">
            <input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
            <button id="send-invite" class="btn btn-pong-blue" type="button">Send Invitation</button>
          </div>
        </div>
        
        <!-- Boutons de contrôle -->
        <button id="create-tournament" class="btn btn-pong" disabled>Create Tournament</button>
        <button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
      </section>
    `;
  },
  attachEvents: async (el) => {
    const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize')) || 16;
    const username = sessionStorage.getItem('username') || 'You';

    // Vérifier ou créer le lobby à l'arrivée sur la page
    await checkOrCreateLobby(tournamentSize);

	// attendre un peu que le lobby soit créé
	await new Promise((resolve) => setTimeout(resolve, 2000));

    // Récupération des éléments de l'interface
    const roomCodeElement = el.querySelector('#room-code');
    const copyRoomCodeButton = el.querySelector('#copy-room-code');
    const inviteInput = el.querySelector('#invite-input');
    const sendInviteButton = el.querySelector('#send-invite');
    const createTournamentButton = el.querySelector('#create-tournament');
    const cancelTournamentButton = el.querySelector('#cancel-tournament');

    // Bouton d'annulation
    cancelTournamentButton.addEventListener('click', () => {
      handleRoute('/pong/play/tournament');
    });

    // Copier le room code dans le presse-papier
    copyRoomCodeButton.addEventListener('click', () => {
      const roomCode = roomCodeElement.textContent;
      navigator.clipboard.writeText(roomCode)
        .then(() => alert('Room code copied to clipboard!'))
        .catch(() => alert('Failed to copy room code.'));
    });

    // Envoi d'invitations
    sendInviteButton.addEventListener('click', async () => {
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
      const recipientId = await fetchUserId(inviteMessage);

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

    // Création du tournoi
    createTournamentButton.addEventListener('click', () => {
      const roomCode = roomCodeElement.textContent;
      console.log("Tournoi en ligne créé avec le room code :", roomCode);
      console.log("Liste des joueurs :", onlinePlayers);
      alert('Tournament created with room code: ' + roomCode);
    });
  },
});

/**
 * Met à jour l'interface affichant la liste des joueurs en ligne.
 */
export function updateOnlinePlayersUI(players, tournamentSize, currentUserId) {
	const onlinePlayersList = document.querySelector('#online-players-list');
	const onlinePlayersCountSpan = document.querySelector('#online-players-count');
	const createTournamentButton = document.querySelector('#create-tournament');
  
	if (!onlinePlayersList || !onlinePlayersCountSpan || !createTournamentButton) {
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
  
	sortedPlayers.forEach((player, index) => {
	  const li = document.createElement('li');
	  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  
	  // Si l'API ne renvoie pas le username, on affiche le user_id
	  const displayName = player.username || `User ${player.user_id}`;
	  li.textContent = displayName;
  
	  if (player.user_id == currentUserId) {
		const badge = document.createElement('span');
		badge.className = 'badge bg-secondary ms-2';
		badge.textContent = 'You';
		li.appendChild(badge);
	  } else if (player.status === 'pending') {
		const badge = document.createElement('span');
		badge.className = 'badge bg-warning ms-2';
		badge.textContent = 'Pending';
		li.appendChild(badge);
  
		const cancelButton = document.createElement('button');
		cancelButton.className = 'btn btn-pong-danger btn-sm ms-2';
		cancelButton.textContent = 'Cancel';
		cancelButton.addEventListener('click', () => {
		  players.splice(index, 1);
		  updateOnlinePlayersUI(players, tournamentSize, currentUserId);
		});
		li.appendChild(cancelButton);
	  } else {
		const kickButton = document.createElement('button');
		kickButton.className = 'btn btn-pong-danger btn-sm ms-2';
		kickButton.textContent = 'Kick';
		kickButton.addEventListener('click', () => {
		  players.splice(index, 1);
		  updateOnlinePlayersUI(players, tournamentSize, currentUserId);
		});
		li.appendChild(kickButton);
	  }
	  onlinePlayersList.appendChild(li);
	});
  
	createTournamentButton.disabled = players.length !== tournamentSize;
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
	  const currentUserId = sessionStorage.getItem('userId'); // ou await getUserIdFromCookieAPI()
  
	  updateOnlinePlayersUI(onlinePlayers, tournamentSize, currentUserId);
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
