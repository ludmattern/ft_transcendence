import { createComponent } from '/src/utils/component.js';
import { loadUserProfile, loadMatchHistory } from '/src/components/hud/centralWindow/profileForm.js';
import { ws } from '/src/services/websocket.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { playGame } from '/src/components/pong/play/utils.js';
import { getRelationshipStatus } from '/src/components/hud/sideWindow/left/contextMenu.js';
import { handleRoute } from '/src/services/router.js';

export function sendWsInfoMessage(action, recipient) {
	const payload = {
		type: 'info_message',
		action,
		recipient,
		timestamp: new Date().toISOString(),
	};
	ws.send(JSON.stringify(payload));
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUsernameFromUrl() {
	const path = window.location.pathname;
	const prefix = '/social/pilot=';
	return path.startsWith(prefix) ? decodeURIComponent(path.substring(prefix.length)) : null;
}

async function updateSocialActions(profile_id, container) {
	const relationshipStatus = await getRelationshipStatus(profile_id);
	if (!relationshipStatus || !relationshipStatus.success) {
		return;
	}
	if (relationshipStatus.is_me) {
		handleRoute('/profile');
		return;
	}
	let newHtml = `<button class="btn bi bi-envelope me-2" id="invite-link">Invite</button>`;
	newHtml += relationshipStatus.is_friend ? `<button class="btn bi bi-person-dash me-2" id="remove-link">Remove</button>` : `<button class="btn bi bi-person-add me-2" id="add-link">Add</button>`;
	newHtml +=
		relationshipStatus.is_blocked && relationshipStatus.can_unblock
			? `<button class="btn bi bi-person-check" id="unblock-link">Unblock</button>`
			: `<button class="btn bi bi-person-slash me-2" id="block-link">Block</button>`;
	container.innerHTML = newHtml;
}

export const otherProfileForm = createComponent({
	tag: 'otherProfileForm',
	render: () => `
    <div id="profile-form" class="form-container">
      <h5 class="text-center">Pilot Profile</h5>
      <span class="background-central-span d-flex flex-column align-items-center flex-grow-1 p-4">
        <div class="profile-info d-flex justify-content-evenly align-items-center w-100 m-3 pb-3">
          <div class="profile-pic-container">
            <img id="profile-pic-link" class="profile-pic d-none rounded-circle"/>
          </div>
          <div class="profile-details modifiable-pilot text-start">
            <div class="profile-status mb-2">
              <span class="status-indicator bi bi-circle-fill text-success"></span>
              <div class="d-inline-block">
                <div class="d-inline-block" id="pseudo" style="color:var(--content-color); font-weight: bold;"></div>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item d-flex align-items-center mb-1">
                <span class="bi bi-trophy me-2"></span>
                <span class="stat-title">Winrate:</span>
                <span id="winrate" class="stat-value ms-1"></span>
              </div>
              <div class="stat-item d-flex align-items-center">
                <span class="bi bi-award me-2"></span>
                <span id="elo" class="stat-title">Elo:</span>
                <span class="stat-value ms-1"></span>
              </div>
            </div>
          </div>
        </div>
        <span class="panel-mid"></span>
        <div class="profile-match-history mt-2 w-100 d-flex flex-column">
          <h6 class="match-history-title d-flex justify-content-center m-3">
            <span class="bi bi-journal me-2"></span>Match History
          </h6>
          <div class="match-history-header d-flex fw-bold">
            <span class="col-3">Outcome</span>
            <span class="col-3">Date</span>
            <span class="col-3">Opponents</span>
            <span class="col-3">Score</span>
          </div>
          <div class="match-history-container d-flex flex-column" style="max-height: 40vh; overflow-y: auto;">
            <div id="match-items-container" class="match-history-items d-flex flex-column" style="max-height: 40vh; overflow-y: auto;"></div>
          </div>
          <div class="d-flex justify-content-center mt-3" id="social-actions"></div>
        </div>
      </span>
    </div>
  `,
	attachEvents: async (el) => {
		const profileUsername = getUsernameFromUrl();
		if (!profileUsername) {
			return;
		}
		const profile_id = await fetchUserId(profileUsername);
		if (!profile_id) {
			handleRoute('/lost');
			return;
		}
		loadUserProfile(profile_id);
		loadMatchHistory(profile_id);
		const socialActionsContainer = el.querySelector('#social-actions');
		await updateSocialActions(profile_id, socialActionsContainer);
		const actions = {
			'#invite-link': async () => {
				sendWsInfoMessage('private_game_invite', profile_id);
				const config = {
					gameMode: 'private',
					action: 'create',
					matchkey: await getUserIdFromCookieAPI(),
					type: 'fullScreen',
				};
				playGame(config);
			},
			'#remove-link': async () => {
				sendWsInfoMessage('remove_friend', profile_id);
				await delay(100);
				await updateSocialActions(profile_id, socialActionsContainer);
			},
			'#add-link': async () => {
				sendWsInfoMessage('send_friend_request', profile_id);
				await delay(100);
				await updateSocialActions(profile_id, socialActionsContainer);
			},
			'#block-link': async () => {
				sendWsInfoMessage('block_user', profile_id);
				await delay(100);
				await updateSocialActions(profile_id, socialActionsContainer);
			},
			'#unblock-link': async () => {
				sendWsInfoMessage('unblock_user', profile_id);
				await delay(100);
				await updateSocialActions(profile_id, socialActionsContainer);
			},
		};
		el.addEventListener('click', async (e) => {
			for (const [selector, actionFn] of Object.entries(actions)) {
				if (e.target.matches(selector)) {
					e.preventDefault();
					await actionFn();
					break;
				}
			}
		});
	},
});

export async function fetchUserId(username) {
	if (!username) {
		console.error('Invalid username');
		return null;
	}

	if (username.length < 6 || username.length > 20) {
		console.error('Invalid username length');
		return;
	}

	try {
		const response = await fetch(`/api/user-service/get_user_id/${username}/`, {
			credentials: 'include',
		});
		if (!response.ok) {
			return null;
		}
		const data = await response.json();
		return data.user_id;
	} catch (error) {
		console.error('Error fetching user id', error);
		return null;
	}
}
