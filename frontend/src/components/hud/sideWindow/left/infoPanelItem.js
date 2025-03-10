import { createComponent } from '/src/utils/component.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { showContextMenu } from '/src/components/hud/sideWindow/left/contextMenu.js';
import { handleFriendAction } from '/src/components/hud/sideWindow/left/contextMenu.js';
import { ws } from '/src/services/websocket.js';

export const infoPanelItem = createComponent({
	tag: 'infoPanelItem',

	render: (item) => {
		const content = titleType(item);
		console.log('item inside panel ITEM', item);

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
		console.log('item', item);
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
				behaviorMiscellaneous();
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

	console.log('Friend request from:', item.inviter);

	if (acceptButton) {
		acceptButton.addEventListener('click', () => {
			console.log(`Accepted ${item.inviter}'s request.`);
			handleFriendAction(false, item.inviter_id);
		});
	}
	if (refuseButton) {
		refuseButton.addEventListener('click', () => {
			console.log(`Refused ${item.inviter}'s request.`);
			handleFriendAction(true, item.inviter_id);
		});
	}
}

function titleType(item) {
	console.log('************************** item **************************', item);
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

	console.log('tournament request from:', item.inviter);

	if (acceptButton) {
		acceptButton.addEventListener('click', () => {
			console.log(`Accepted ${item.inviter}'s request.`);
			handleTournamentAction(true, item);
		});
	}
	if (refuseButton) {
		refuseButton.addEventListener('click', () => {
			console.log(`Refused ${item.inviter}'s request.`);
			handleTournamentAction(false, item);
		});
	}
}

export async function handleTournamentAction(action, item) {
	if (action) {
		try {
			console.log('Vérification de l\'existence d\'un lobby...');

			let url = "/api/tournament-service/getParticipantStatusInTournament/";
			console.log('Appel de l\'API pour récupérer la clé de tournoi :', url);

			let response = await fetch(url, { credentials: "include" });
			if (!response.ok) {
				throw new Error(`Erreur HTTP lors de la vérification du lobby (code ${response.status})`);
			}
			let data = await response.json();
			console.log('status de tournoi récupérée :', data.status);

			if (data.status === 'accepted') {
				createNotificationMessage('You are already in a tournament', 2500, true);
				return;
			}
		} catch (error) {
			console.error('Erreur dans checkOrCreateLobby :', error);
		}
		action = 'join_tournament';
		console.log('joining tournament...');
	} else {
		action = 'reject_tournament';
		console.log('rejecting tournament...');
	}
	const payload = {
		type: 'tournament_message',
		action,
		tournamentId: item.tournament_id,
	};

	ws.send(JSON.stringify(payload));
}

function behaviorPrivateGame(el, item) {
	const acceptButton = el.querySelector("#accept-action");
	const refuseButton = el.querySelector("#refuse-action");
	if (acceptButton) {
	  acceptButton.addEventListener("click", () => {
	    console.log(`Accepted ${item.inviter}'s request.`);
		const payload = {	
			type: 'info_message',
			action: 'accept_private_game_invite',
			recipient: item.inviter_id,
			timestamp: new Date().toISOString(),
		};
	    ws.send(JSON.stringify(payload));
	  });
	  
	}
	if (refuseButton) {
	  refuseButton.addEventListener("click", () => {
	    console.log(`Refused ${item.inviter}'s request.`);
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

// Will be deleted imo
function behaviorMiscellaneous(el, item) {
	// const discardButton = el.querySelector("#discard-action");
	// if (discardButton) {
	//   discardButton.addEventListener("click", () => {
	//     console.log(`Discarding ${item}.`);
	//   });
	// }
}
