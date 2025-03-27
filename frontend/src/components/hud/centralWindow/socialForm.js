import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { fetchUserId } from '/src/components/hud/centralWindow/otherProfileForm.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { ws } from '/src/services/websocket.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

export const socialForm = createComponent({
	tag: 'socialForm',

	render: () => {
		return `
      <div id="social-form" class="form-container">
        <h5 class="text-center">Social</h5>
        <span class="background-central-span d-flex flex-column align-items-center flex-grow-1 p-4">
          <!-- Friend List -->
          <div class="social-friend-list w-100 d-flex flex-column p-4 mb-4">
            <h6 class="friend-list-title d-flex justify-content-center mb-4">
              <span class="bi bi-people me-2"></span>Friend List
            </h6>
            <div class="friend-list-container d-flex flex-column" style="max-height: 18vh; overflow-y: auto;">
            </div>
          </div>
          <span class="panel-mid"></span>
          <!-- Pilot List -->
          <div class="social-pilot-list w-100 d-flex flex-column p-4 mt-4">
            <h6 class="pilot-list-title d-flex justify-content-center mb-4">
              <span class="bi bi-card-list me-2"></span>Pilot List
            </h6>
            <!-- Search Bar -->
            <div class="d-flex justify-content-center mb-4" style="flex-wrap: wrap;">
              <input type="text" id="search-bar" name="search-bar" maxlength="20" class="form-control w-50 me-2" placeholder="Search for a pilot" required />
              <button class="btn btn-sm bi bi-search" id="search-link">Search</button>
            </div>
            <div class="pilot-list-container d-flex flex-column" style="max-height: 18vh; overflow-y: auto;">

            </div>
          </div>
        </span>
      </div>
    `;
	},

	attachEvents: async (el) => {
		subscribe('updateFriendsList', updateFriendsListRoutine);

		getFriends();

		el.addEventListener('click', async (e) => {
			e.preventDefault();

			if (e.target.matches('#other-profile-link')) {
				const item = e.target.closest('.friend-item') || e.target.closest('.pilot-item');
				if (item) {
					const pseudoEl = item.querySelector('.profile-pseudo');
					if (pseudoEl) {
						const friendUsername = pseudoEl.textContent.trim();
						handleRoute(`/social/pilot=${friendUsername}`);
					}
				}
				return;
			}

			if (e.target.matches('#add-link')) {
				const pilotItem = e.target.closest('.pilot-item');
				const authorElement = pilotItem?.querySelector('.profile-pseudo');

				if (!authorElement) {
					return;
				}

				const author = authorElement.textContent.trim();
				const payload = {
					type: 'info_message',
					action: 'send_friend_request',
					recipient: await fetchUserId(author),
					timestamp: new Date().toISOString(),
				};

				ws.send(JSON.stringify(payload));
				return;
			}

			if (e.target.matches('#remove-link')) {
				const item = e.target.closest('.friend-item');
				if (item) {
					const pseudoEl = item.querySelector('.profile-pseudo');
					if (pseudoEl) {
						const friendUsername = pseudoEl.textContent.trim();
						const payload = {
							type: 'info_message',
							action: 'remove_friend',
							recipient: await fetchUserId(friendUsername),
							timestamp: new Date().toISOString(),
						};

						ws.send(JSON.stringify(payload));
					}
				}
				return;
			}

			if (e.target.matches('#search-link')) {
				const searchBar = el.querySelector('#search-bar');
				if (searchBar) {
					const query = searchBar.value.trim();
					if (!query) {
						return;
					} else if (query.length > 20) {
						createNotificationMessage('Pilot username must be at most 20 characters long', 2500, true);
						return;
					}
					console.log('Searching for pilot:', query);
					const pilotListContainer = el.querySelector('.pilot-list-container');
					fetchPilot(query, pilotListContainer);
				}
				return;
			}
		});

		const searchBar = el.querySelector('#search-bar');
		if (searchBar) {
			searchBar.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					const searchButton = el.querySelector('#search-link');
					if (searchButton) {
						searchButton.click();
					}
				}
			});
		}
	},
});

function createFriendItem(status, pseudo, statusClass) {
	return `
    <div class="friend-item d-flex justify-content-between align-items-center px-3">
      <div class="d-flex align-items-center">
        <span class="status-indicator bi bi-circle-fill ${statusClass} me-2"></span>
        <span class="profile-pseudo fw-bold">${pseudo}</span>
      </div>
      <div class="d-flex">
        <button class="btn btn-sm bi bi-person me-2" id="other-profile-link">Profile</button>
        <button class="btn btn-sm bi bi-person-dash danger" id="remove-link">Remove</button>
      </div>
    </div>
  `;
}

function createPilotItem(status, pseudo, statusClass) {
	return `
    <div class="pilot-item d-flex justify-content-between align-items-center px-3">
      <div class="d-flex align-items-center">
        <span class="status-indicator bi bi-circle-fill ${statusClass} me-2"></span>
        <span class="profile-pseudo fw-bold">${pseudo}</span>
      </div>
      <div class="d-flex">
        <button class="btn btn-sm bi bi-person me-2" id="other-profile-link">Profile</button>
        <button class="btn btn-sm bi bi-person-add" id="add-link">Add</button>
      </div>
    </div>
  `;
}

async function getFriends() {
	try {
		const response = await fetch('/api/user-service/get_friends/', {
			method: 'GET',
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();

		const friendListContainer = document.querySelector('.friend-list-container');
		if (friendListContainer && data.friends && data.friends.length > 0) {
			friendListContainer.innerHTML = data.friends.map((friend) => createFriendItem('Online', friend.username, friend.is_connected ? 'text-success' : 'text-danger')).join('');
		} else if (friendListContainer && data.friends && data.friends.length === 0) {
			friendListContainer.innerHTML = '<p style="opacity: 0.7;">It\'s a lonely world...</p>';
		}
	} catch (error) {
		console.error('Error while fetching friend list: ', error);
	}
}

async function updateFriendsListRoutine() {
	await getFriends();
}

async function fetchPilot(query, container) {
	try {
		const response = await fetch(`/api/user-service/search_pilots/?query=${encodeURIComponent(query)}`, {
			method: 'GET',
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();

		if (container) {
			if (data.pilots.length === 0) {
				container.innerHTML = '<p>Maybe this pilot crashed or went far far far away...</p>';
			} else {
				container.innerHTML = data.pilots
					.map((pilot) => createPilotItem(pilot.is_connected ? 'Online' : 'Offline', pilot.username, pilot.is_connected ? 'text-success' : 'text-danger'))
					.join('');
			}
		}
	} catch (error) {
		console.error('Error searching pilots: ', error);
	}
}
