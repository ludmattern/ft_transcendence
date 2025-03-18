import { createComponent } from '/src/utils/component.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { ws } from '/src/services/websocket.js';
import { fetchUserId } from '/src/components/hud/centralWindow/otherProfileForm.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { handleRoute } from '/src/services/router.js';
import { getCurrentTournamentInformation } from '/src/services/router.js';
import { pushInfo,getInfo } from '/src/services/infoStorage.js';

export const onlineTournamentCreation = createComponent({
	tag: 'onlineTournamentCreation',
	render: () => {
		return `
		<section class="col-12 d-flex flex-column align-items-center text-center p-5"
			style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
			<h1 class="mb-4">Online Tournament Creation</h1>
			
			<!-- Affichage du Room Code -->
			<div class="mb-4">
				<h3 class="text-white">Room Code:</h3>
				<h2 id="room-code" class="text-warning">Loading...</h2>
				<button id="copy-room-code" class="btn btn-pong btn-sm">Copy Room Code</button>
			</div>
			
			<!-- Liste des joueurs en ligne -->
			<div class="w-50 mb-4">
				<h2 class="text-white">
					Players (<span id="online-players-count">0</span>/<span id="max-players-online">...</span>)
				</h2>
				<ul id="online-players-list" class="list-group"></ul>
			</div>
			
			<!-- Conteneur des boutons de contrôle -->
			<div id="control-buttons-container" style="display: flex; flex-direction: column;"></div>
		</section>
		`;
	},
	attachEvents: async (el) => {
		const maxPlayersOnlineSpan = el.querySelector('#max-players-online');
		const roomCodeElement = el.querySelector('#room-code');
		const controlButtonsContainer = el.querySelector('#control-buttons-container');

		try {
			const tournamentData = await getInfo('tournamentSize');
			const tournamentSize = parseInt(tournamentData.success ? tournamentData.value : 16, 10);
			maxPlayersOnlineSpan.textContent = tournamentSize;
		} catch (error) {
			console.error('Erreur lors de la récupération du tournoi :', error);
		}

		subscribe('leavingLobby', () => {
			handleRoute('/pong/play/tournament');
		});
		subscribe('updatePlayerList', (data) => {
			updateOnlinePlayersUI(data);
		});

		await checkOrCreateLobby();

		const data = await getCurrentTournamentInformation();

		const copyRoomCodeButton = el.querySelector('#copy-room-code');
		copyRoomCodeButton.addEventListener('click', () => {
			const roomCode = roomCodeElement.textContent;
			navigator.clipboard
				.writeText(roomCode)
				.then(() => alert('Room code copied to clipboard!'))
				.catch(() => alert('Failed to copy room code.'));
		});

		// Si le tournoi n'existe pas, on ne fait rien d'autre
		if (data.tournament === null) {
			return;
		}

		const isOrganizer = data.user_id === data.organizer_id;

		// Si l'organisateur et qu'il y a encore de la place pour inviter, on insère le formulaire d'invitation
		if (isOrganizer && data.participants_count < data.size) {
			// On vérifie si le formulaire n'existe pas déjà
			if (!document.getElementById('invite-container')) {
				const inviteContainerHTML = `
				<div id="invite-container" class="w-50 mb-4">
					<div class="input-group">
						<input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
						<button id="send-invite" class="btn btn-pong-blue" type="button">Send Invitation</button>
					</div>
				</div>
				`;
				controlButtonsContainer.insertAdjacentHTML('beforebegin', inviteContainerHTML);

				const inviteInput = el.querySelector('#invite-input');
				const sendInviteButton = el.querySelector('#send-invite');

				sendInviteButton.addEventListener('click', async () => {
					const invitedUsernamePilot = inviteInput.value.trim();
					if (!invitedUsernamePilot) return;
					if (data.participants_count >= data.size) return;

					const recipientId = await fetchUserId(invitedUsernamePilot);
					if (!recipientId) {
						createNotificationMessage(`${invitedUsernamePilot} has not enlisted in Space Force yet`, 5000, true);
						inviteInput.value = '';
						return;
					} else if (recipientId.toString() === data.user_id) {
						createNotificationMessage('You cannot invite yourself', 5000, true);
						inviteInput.value = '';
						return;
					}
					const payload = {
						type: 'tournament_message',
						action: 'tournament_invite',
						author: data.user_id,
						recipient: recipientId,
					};
					ws.send(JSON.stringify(payload));
					inviteInput.value = '';
				});

				inviteInput.addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						el.querySelector('#send-invite').click();
					}
				});
			}
		}

		// Boutons statiques selon le rôle de l'utilisateur
		if (isOrganizer) {
			let cancelTournamentButton = controlButtonsContainer.querySelector('#cancel-tournament');
			if (!cancelTournamentButton) {
				cancelTournamentButton = document.createElement('button');
				cancelTournamentButton.id = 'cancel-tournament';
				cancelTournamentButton.className = 'btn btn-pong-danger mt-3';
				cancelTournamentButton.textContent = 'Cancel';
				cancelTournamentButton.addEventListener('click', () => {
					const payload = {
						type: 'tournament_message',
						action: 'cancel_tournament',
						userId: data.user_id,
					};
					ws.send(JSON.stringify(payload));
				});
				controlButtonsContainer.appendChild(cancelTournamentButton);
			}
		} else {
			let leaveLobbyButton = controlButtonsContainer.querySelector('#leave-lobby');
			if (!leaveLobbyButton) {
				leaveLobbyButton = document.createElement('button');
				leaveLobbyButton.id = 'leave-lobby';
				leaveLobbyButton.className = 'btn btn-pong-danger mt-3';
				leaveLobbyButton.textContent = 'Leave Lobby';
				leaveLobbyButton.addEventListener('click', () => {
					const payload = {
						type: 'tournament_message',
						action: 'leave_tournament',
						userId: data.user_id,
					};
					ws.send(JSON.stringify(payload));
				});
				controlButtonsContainer.appendChild(leaveLobbyButton);
			}
		}
	},
});

async function checkOrCreateLobby() {
	try {
		const tournamentSizeResult = await getInfo('tournamentSize');
		const tournamentSize = parseInt(tournamentSizeResult.success ? tournamentSizeResult.value : NaN, 10);
		const data = await getCurrentTournamentInformation();

		if (data.tournament !== null && data.status === 'upcoming') {
			updateOnlinePlayersUI(data);
		} else {
			await createNewLobby(data.user_id, tournamentSize);
		}
	} catch (error) {
		console.error('Erreur dans checkOrCreateLobby :', error);
	}
}

async function createNewLobby(userId, tournamentSize) {
	try {
		const payload = {
			type: 'tournament_message',
			action: 'create_tournament_lobby',
			userId: userId,
			tournamentSize: tournamentSize,
			timestamp: new Date().toISOString(),
		};
		ws.send(JSON.stringify(payload));
	} catch (error) {
		console.error('Erreur lors de la création du nouveau lobby :', error);
	}
}

export function updateOnlinePlayersUI(data) {
	const participants = document.querySelector('#online-players-list');
	const participantsCountSpan = document.querySelector('#online-players-count');
	const maxPlayersOnlineSpan = document.querySelector('#max-players-online');
	const roomCodeElement = document.querySelector('#room-code');
	const controlButtonsContainer = document.querySelector('#control-buttons-container');

	if (!participants || !participantsCountSpan || !maxPlayersOnlineSpan || !roomCodeElement) return;

	participantsCountSpan.textContent = data.participants_count;
	roomCodeElement.textContent = data.serial_key;
	maxPlayersOnlineSpan.textContent = data.size;

	// Mise à jour pour l'organisateur
	if (data.user_id === data.organizer_id) {
		// Gestion du bouton "Create Tournament"
		let createTournamentButton = controlButtonsContainer.querySelector('#create-tournament');
		if (data.participants_accepted === data.size) {
			if (!createTournamentButton) {
				createTournamentButton = document.createElement('button');
				createTournamentButton.id = 'create-tournament';
				createTournamentButton.className = 'btn btn-pong';
				createTournamentButton.textContent = 'Create Tournament';
				createTournamentButton.addEventListener('click', async () => {
					await pushInfo('TournamentCreationNeeded', true);
					handleRoute('/pong/play/current-tournament');
				});
				// Insertion avant le bouton statique déjà présent (Cancel)
				controlButtonsContainer.insertBefore(createTournamentButton, controlButtonsContainer.firstChild);
			}
			createTournamentButton.disabled = false;
		} else {
			if (createTournamentButton) createTournamentButton.remove();
		}

		// Gestion du formulaire d'invitation
		let inviteContainer = document.getElementById('invite-container');
		if (data.participants_count < data.size) {
			// S'il n'existe pas, on le crée et l'insère
			if (!inviteContainer) {
				inviteContainer = document.createElement('div');
				inviteContainer.id = 'invite-container';
				inviteContainer.className = 'w-50 mb-4';
				inviteContainer.innerHTML = `
					<div class="input-group">
						<input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
						<button id="send-invite" class="btn btn-pong-blue" type="button">Send Invitation</button>
					</div>
				`;
				controlButtonsContainer.insertAdjacentElement('beforebegin', inviteContainer);

				const inviteInput = inviteContainer.querySelector('#invite-input');
				const sendInviteButton = inviteContainer.querySelector('#send-invite');

				sendInviteButton.addEventListener('click', async () => {
					const invitedUsernamePilot = inviteInput.value.trim();
					if (!invitedUsernamePilot) return;
					if (data.participants_count >= data.size) return;

					const recipientId = await fetchUserId(invitedUsernamePilot);
					if (!recipientId) {
						createNotificationMessage(`${invitedUsernamePilot} has not enlisted in Space Force yet`, 5000, true);
						inviteInput.value = '';
						return;
					} else if (recipientId.toString() === data.user_id) {
						createNotificationMessage('You cannot invite yourself', 5000, true);
						inviteInput.value = '';
						return;
					}
					const payload = {
						type: 'tournament_message',
						action: 'tournament_invite',
						author: data.user_id,
						recipient: recipientId,
					};
					ws.send(JSON.stringify(payload));
					inviteInput.value = '';
				});

				inviteInput.addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						inviteContainer.querySelector('#send-invite').click();
					}
				});
			} else {
				// Mise à jour de l'état (désactivation si nécessaire)
				const sendInviteButton = inviteContainer.querySelector('#send-invite');
				sendInviteButton.disabled = data.participants_count >= data.size;
			}
		} else {
			// S'il n'y a plus de place, on retire le formulaire d'invitation
			if (inviteContainer) inviteContainer.remove();
		}
	}

	// Mise à jour de la liste des participants
	participants.innerHTML = '';
	const sortedParticipants = data.participants.sort((a, b) => {
		const aPending = a.status === 'pending' ? 1 : 0;
		const bPending = b.status === 'pending' ? 1 : 0;
		return aPending - bPending;
	});

	sortedParticipants.forEach((participant) => {
		const li = document.createElement('li');
		li.className = 'list-group-item d-flex justify-content-between align-items-center';
		li.textContent = participant.username;

		if (participant.id == data.user_id) {
			const badge = document.createElement('span');
			badge.className = 'badge bg-secondary ms-2';
			badge.textContent = 'You';
			li.appendChild(badge);
		} else if (data.user_id === data.organizer_id) {
			if (participant.status === 'pending') {
				const badge = document.createElement('span');
				badge.className = 'badge bg-warning ms-2';
				badge.textContent = 'Pending';
				li.appendChild(badge);

				const cancelButton = document.createElement('button');
				cancelButton.className = 'btn btn-pong-danger btn-sm ms-2';
				cancelButton.textContent = 'Cancel';
				cancelButton.addEventListener('click', () => {
					const payload = {
						type: 'tournament_message',
						action: 'cancel_tournament_invite',
						userId: participant.id,
						tournamentId: data.tournament_id,
					};
					ws.send(JSON.stringify(payload));
				});
				li.appendChild(cancelButton);
			} else {
				const kickButton = document.createElement('button');
				kickButton.className = 'btn btn-pong-danger btn-sm ms-2';
				kickButton.textContent = 'Kick';
				kickButton.addEventListener('click', () => {
					const payload = {
						type: 'tournament_message',
						action: 'kick_tournament',
						author: data.user_id,
						recipient: participant.id,
						tournamentId: data.tournament_id,
					};
					ws.send(JSON.stringify(payload));
				});
				li.appendChild(kickButton);
			}
		} else {
			if (participant.status === 'pending') {
				const badge = document.createElement('span');
				badge.className = 'badge bg-warning ms-2';
				badge.textContent = 'Pending';
				li.appendChild(badge);
			}
		}
		participants.appendChild(li);
	});
}
