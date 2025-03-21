import { createComponent } from '/src/utils/component.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { showContextMenu } from '/src/components/hud/sideWindow/left/contextMenu.js';
import { handleFriendAction } from '/src/components/hud/sideWindow/left/contextMenu.js';
import { getCurrentWindow } from '/src/3d/animation.js';

import { ws } from '/src/services/websocket.js';

export const infoPanelItem = createComponent({
	tag: 'infoPanelItem',

	render: (item) => {
		const content = titleType(item);

		return `
	<div class="panel-item" data-notification-id="${item.type}-${item.inviter_id}">
		<span>${content}<b class="author" style="cursor: pointer;">${item.inviter}</b></span>
		${
			item.actions === 'choice'
				? `<div class="actions">
						<button class="btn bi bi-check" id="accept-action">Accept</button>
						<button class="btn bi bi-x" id="refuse-action">Refuse</button>
					</div>`
				: ``
		}
	</div>`;
	},

	attachEvents: (el, item) => {
		switch (item.type) {
			case 'friend_request':
				behaviorFriendRequest(el, item);
				break;
			case 'tournament_invite':
				behaviorTournament(el, item);
				break;
			case 'tournament_next_game':
				break;
			case 'private_game_invite':
				behaviorPrivateGame(el, item);
				break;
			case 'miscellaneous':
				break;
			default:
				break;
		}
		const authorElem = el.querySelector('.author');
		if (authorElem) {
			authorElem.addEventListener('click', (e) => {
				e.preventDefault();
				showContextMenu(item, e);
			});
		}
	},
});

function behaviorFriendRequest(el, item) {
	const acceptButton = el.querySelector('#accept-action');
	const refuseButton = el.querySelector('#refuse-action');

	if (acceptButton) {
		acceptButton.addEventListener('click', () => {
			handleFriendAction(false, item.inviter_id);
		});
	}
	if (refuseButton) {
		refuseButton.addEventListener('click', () => {
			handleFriendAction(true, item.inviter_id);
		});
	}
}

function titleType(item) {
	switch (item.type) {
		case 'friend_request':
			return 'Friend request from: ';
		case 'tournament_invite':
			return 'Tournament invite from: ';
		case 'private_game_invite':
			return 'Private game invite from: ';
		case 'tournament_next_game':
			return 'Ready up to fight against: ';
		case 'miscellaneous':
			return 'Miscellaneous: ';
	}
}

function behaviorTournament(el, item) {
	const acceptButton = el.querySelector('#accept-action');
	const refuseButton = el.querySelector('#refuse-action');

	if (acceptButton) {
		acceptButton.addEventListener('click', () => {
			const currentWindow = getCurrentWindow();
			if (currentWindow === 'game') {
				createNotificationMessage('stay focus on the game pilot !', 2500, true);
				return;
			} else {
				handleTournamentAction(true, item);
			}
		});
	}
	if (refuseButton) {
		refuseButton.addEventListener('click', () => {
			handleTournamentAction(false, item);
		});
	}
}

export async function handleTournamentAction(action, item) {
	if (action) {
		try {
			let url = '/api/tournament-service/getCurrentTournamentInformation/';

			let response = await fetch(url, { credentials: 'include' });
			if (!response.ok) {
				throw new Error(`Erreur HTTP lors de la vérification du lobby (code ${response.status})`);
			}
			let data = await response.json();

			if (data.tournament_id) {
				createNotificationMessage('You are already in a tournament', 2500, true);
				return;
			}
		} catch (error) {
			console.error('Error in checkOrCreateLobby function: ', error);
		}
		action = 'join_tournament';
	} else {
		action = 'reject_tournament';
	}
	const payload = {
		type: 'tournament_message',
		action,
		tournamentId: item.tournament_id,
	};
	ws.send(JSON.stringify(payload));
}

function behaviorPrivateGame(el, item) {
	const acceptButton = el.querySelector('#accept-action');
	const refuseButton = el.querySelector('#refuse-action');
	if (acceptButton) {
		acceptButton.addEventListener('click', () => {
			const currentWindow = getCurrentWindow();
			if (currentWindow === 'game') {
				createNotificationMessage('stay focus on the game pilot !', 2500, true);
			} else {
				const payload = {
					type: 'info_message',
					action: 'accept_private_game_invite',
					recipient: item.inviter_id,
					timestamp: new Date().toISOString(),
				};
				ws.send(JSON.stringify(payload));
			}
		});
	}
	if (refuseButton) {
		refuseButton.addEventListener('click', () => {
			const payload = {
				type: 'info_message',
				action: 'refuse_private_game_invite',
				recipient: item.inviter_id,
				timestamp: new Date().toISOString(),
			};
			ws.send(JSON.stringify(payload));
		});
	}
}
