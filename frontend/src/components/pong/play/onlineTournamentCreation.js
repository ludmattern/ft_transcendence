import { createComponent } from '/src/utils/component.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { ws } from '/src/services/websocket.js';
import { fetchUserId } from '/src/components/hud/centralWindow/otherProfileForm.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { handleRoute } from '/src/services/router.js';
import { getCurrentTournamentInformation } from '/src/services/router.js';

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
		subscribe('updatePlayerList', (data) => {
			updateOnlinePlayersUI(data);
		});

		await checkOrCreateLobby();

		const data = await getCurrentTournamentInformation();

		const roomCodeElement = el.querySelector('#room-code');
		const copyRoomCodeButton = el.querySelector('#copy-room-code');
		const controlButtonsContainer = el.querySelector('#control-buttons-container');

		copyRoomCodeButton.addEventListener('click', () => {
			const roomCode = roomCodeElement.textContent;
			navigator.clipboard
				.writeText(roomCode)
				.then(() => alert('Room code copied to clipboard!'))
				.catch(() => alert('Failed to copy room code.'));
		});

		if (data.tournament === null) {
			return;
		}

		const isOrganizer = data.user_id === data.organizer_id;
		if (isOrganizer && (data.participants_count < data.size)) {
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
				if (!invitedUsernamePilot) {
					console.log('Aucun nom d\'utilisateur spécifié');
					return;
				}
				if (data.participants_count >= data.size) {
					console.log('Le tournoi est complet');
					return;
				}

				const recipientId = await fetchUserId(invitedUsernamePilot);
				if (!recipientId) {
					createNotificationMessage(`${invitedUsernamePilot} has not enlisted in Space Force yet`, 5000, true);
					inviteInput.value = '';
					console.log('Aucun utilisateur trouvé avec le nom spécifié');
					return;
				} else if (recipientId.toString() === data.user_id) {
					createNotificationMessage(`You cannot invite yourself`, 5000, true);
					inviteInput.value = '';
					console.log('Vous ne pouvez pas vous inviter vous-même');
					return;
				}
				const payload = {
					type: 'tournament_message',
					action: 'tournament_invite',
					author: data.user_id,
					recipient: recipientId,
				};
				console.log('Envoi de l\'invitation au joueur :', payload);
				ws.send(JSON.stringify(payload));

				inviteInput.value = '';
			});

			inviteInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					sendInviteButton.click();
				}
			});
		}

		if (isOrganizer) {
			controlButtonsContainer.innerHTML = `
			<button id="cancel-tournament" class="btn btn-pong-danger mt-3">Cancel</button>
			`;
			const cancelTournamentButton = controlButtonsContainer.querySelector('#cancel-tournament');
			cancelTournamentButton.addEventListener('click', () => {
				const payload = {
					type: 'tournament_message',
					action: 'cancel_tournament',
					userId: data.user_id,
				};
				ws.send(JSON.stringify(payload));
			});
		} else {
			controlButtonsContainer.innerHTML = `
			<button id="leave-lobby" class="btn btn-pong-danger mt-3">Leave Lobby</button>
			`;
			const leaveLobbyButton = controlButtonsContainer.querySelector('#leave-lobby');
			leaveLobbyButton.addEventListener('click', () => {
				const payload = {
					type: 'tournament_message',
					action: 'leave_tournament',
					userId: data.user_id,
				};
				ws.send(JSON.stringify(payload));
			});
		}
	},
});

async function checkOrCreateLobby() {
	try {
		const tournamentSize = parseInt(sessionStorage.getItem('tournamentSize'));
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
	console.log('AAAAAAAAA ************** data a ce moment :', data);
	const participants = document.querySelector('#online-players-list');
	const participantsCountSpan = document.querySelector('#online-players-count');
	const createTournamentButton = document.querySelector('#create-tournament');

	if (!participants || !participantsCountSpan) {
		console.warn('updateOnlinePlayersUI: Certains éléments DOM sont manquants.');
		return;
	}

	participantsCountSpan.textContent = data.participants_count;
	participants.innerHTML = '';

	const sortedParticipants = data.participants.sort((a, b) => {
		console.log('a:', a);
		console.log('b:', b);
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
			const controlButtonsContainer = document.querySelector('#control-buttons-container');
			let createTournamentButton = document.querySelector('#create-tournament');
			if (data.participants_accepted === data.size) {
				if (!createTournamentButton) {
					createTournamentButton = document.createElement('button');
					createTournamentButton.id = 'create-tournament';
					createTournamentButton.className = 'btn btn-pong';
					createTournamentButton.textContent = 'Create Tournament';
					createTournamentButton.addEventListener('click', () => {
						const roomCode = document.querySelector('#room-code').textContent;
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
			let sendInviteButton = document.querySelector('#send-invite');
			if (data.participants_count < data.size) {
				if (sendInviteButton) {
					sendInviteButton.disabled = false;
				}
			}
			else {
				if (sendInviteButton) {
					sendInviteButton.disabled = true;
				}
			}
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
		}
		else {
			if (participant.status === 'pending') {
				const badge = document.createElement('span');
				badge.className = 'badge bg-warning ms-2';
				badge.textContent = 'Pending';
				li.appendChild(badge);
			}
		}
		participants.appendChild(li);
	});

	if (createTournamentButton) {
		createTournamentButton.disabled = data.participants_accepted !== data.size;
	}
}
