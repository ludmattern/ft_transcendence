import { createComponent } from '/src/utils/component.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export const profileForm = createComponent({
	tag: 'profileForm',

	// Générer le HTML
	render: () => `
    <div id="profile-form" class="form-container">
      <h5 class="text-center">Pilot Profile</h5>
      <span class="background-central-span d-flex flex-column align-items-center flex-grow-1 p-4">
        <!-- Profile Information -->
        <div class="profile-info d-flex justify-content-evenly align-items-center w-100 m-3 pb-3">
          <!-- Profile Picture -->
          <div class="profile-pic-container">
              <img id="profile-pic-link" class="profile-pic d-none rounded-circle" style="cursor: pointer;" />
              <input type="file" id="profile-image-input" alt="profile picture" accept="image/*" style="display:none;" />
          </div>
          <!-- Profile Details -->
          <div class="profile-details modifiable-pilot text-start">
            <!-- Profile Status -->
            <div class="profile-status mb-2">
              <span class="own-status-indicator bi bi-circle-fill text-success"></span>
              <div class="d-inline-block">
                <div class="d-inline-block" id="pseudo" style="color:var(--content-color); font-weight: bold;"></div>
              </div>
            </div>
            <!-- Profile Statistics -->
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
        <!-- Match History -->
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
            <!-- Match History Header -->
          </div>
        </div>
      </span>
    </div>
  `,

	attachEvents: async (el) => {
		const userId = await getUserIdFromCookieAPI();
		loadMatchHistory(userId);
		loadUserProfile(userId);
		attachProfilePicUpload();
	},
});

/**
 * Génère un élément d'historique de match.
 *
 * @param {string} outcome - Résultat du match (Win/Loss)
 * @param {string} mode - Mode de jeu
 * @param {string} duration - Durée du match
 * @param {string} date - Date du match
 * @param {string} opponents - Opposants
 * @param {string} outcomeClass - Classe CSS pour le résultat
 * @returns {string} - HTML du match
 */

function attachProfilePicUpload() {
	const profilePicLink = document.getElementById('profile-pic-link');
	const fileInput = document.getElementById('profile-image-input');

	if (profilePicLink && fileInput) {
		profilePicLink.addEventListener('click', (e) => {
			e.preventDefault();
			fileInput.click();
		});

		fileInput.addEventListener('change', async (e) => {
			const file = e.target.files[0];
			if (!file) return;

			const formData = new FormData();
			formData.append('profile_picture', file);

			try {
				const response = await fetch('/api/user-service/upload_profile_picture/', {
					method: 'POST',
					body: formData,
					credentials: 'include',
				});
				if (!response.ok) {
					throw new Error(`HTTP error ${response.status}`);
				}
				const data = await response.json();

				if (data.success && data.profile_picture) {
					const profilePicImg = document.querySelector('.profile-pic');
					if (profilePicImg) {
						profilePicImg.src = data.profile_picture;
					}
				}
			} catch (error) {
				console.error("Erreur lors de l'upload de l'image:", error);
			}
		});
	}
}

export async function loadMatchHistory(userId) {
	try {
		const response = await fetch(`/api/user-service/get_game_history/?user_id=${userId}`);
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();
		if (data.success) {
			const winrateElement = document.getElementById('winrate');
			if (winrateElement) {
				winrateElement.textContent = `${data.winrate.toFixed(0)}%`;
			}
			const historyContainer = document.querySelector('.match-history-container');
			if (!historyContainer) return;

			historyContainer.innerHTML = '';

			data.history.forEach((match) => {
				let scoreText;
				if (match.winner_score === -1 || match.loser_score === -1) {
					scoreText = 'Forfeit';
				} else {
					scoreText = `${match.winner_score} - ${match.loser_score}`;
				}

				const outcome = String(match.winner_id) === userId ? 'Win' : 'Loss';

				let opponentUsername = '';
				if (String(match.winner_id) === userId) {
					opponentUsername = match.loser_username;
				} else if (String(match.loser_id) === userId) {
					opponentUsername = match.winner_username;
				} else {
					opponentUsername = `${match.winner_username} vs ${match.loser_username}`;
				}

				const outcomeClass = String(match.winner_id) === userId ? 'text-success' : 'text-danger';
				const date = match.created_at;

				const matchHtml = createMatchItem(outcome, date, opponentUsername, outcomeClass, scoreText);
				historyContainer.innerHTML += matchHtml;
			});
		}
	} catch (error) {
		console.error('Error loading match history:', error);
	}
}

function createMatchItem(outcome, date, opponents, outcomeClass, score) {
	return `
    <div class="match-item d-flex">
      <span class="col-3 ${outcomeClass} fw-bold">${outcome}</span>
      <span class="col-3">${date}</span>
      <span class="col-3">${opponents}</span>
      <span class="col-3">${score}</span>
    </div>
  `;
}

export async function loadUserProfile(userId) {
	try {
		const response = await fetch(`/api/user-service/get_profile/?user_id=${userId}`);
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();

		if (data.success && data.profile) {
			const profilePicImg = document.querySelector('.profile-pic');
			if (profilePicImg) {
				profilePicImg.src = data.profile.profile_picture;
				profilePicImg.alt = data.profile.username + "'s profile picture";
				profilePicImg.style.width = '150px';
				profilePicImg.style.height = '150px';
			}
			profilePicImg.classList.remove('d-none');

			const pseudoElement = document.getElementById('pseudo');
			if (pseudoElement && data.profile.username) {
				pseudoElement.textContent = data.profile.username;
			}
			const eloElement = document.getElementById('elo');
			if (eloElement) {
				eloElement.textContent = `Elo: ${data.profile.elo}`;
			}
			const statusIndicator = document.querySelector('.status-indicator');
			if (statusIndicator) {
				if (data.profile.is_connected) {
					statusIndicator.classList.remove('text-danger');
					statusIndicator.classList.add('text-success');
				} else {
					statusIndicator.classList.remove('text-success');
					statusIndicator.classList.add('text-danger');
				}
			}
		}
	} catch (error) {
		console.error('Error loading user profile:', error);
	}
}
