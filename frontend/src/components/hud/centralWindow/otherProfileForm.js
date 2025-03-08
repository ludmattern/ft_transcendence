import { createComponent } from '/src/utils/component.js';
import { loadUserProfile, loadMatchHistory } from '/src/components/hud/centralWindow/profileForm.js';
import { ws } from '/src/services/websocket.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { playGame } from '/src/components/pong/play/utils.js';

export const otherProfileForm = createComponent({
  tag: 'otherProfileForm',

  // Générer le HTML
  render: () => `
    <div id="profile-form" class="form-container">
      <h5 class="text-center">Pilot Profile</h5>
      <span class="background-central-span d-flex flex-column align-items-center flex-grow-1 p-4">
        <!-- Profile Information -->
        <div class="profile-info d-flex justify-content-evenly align-items-center w-100 m-3 pb-3">
          <!-- Profile Picture -->
          <div class="profile-pic-container">
              <img id="profile-pic-link" class="profile-pic d-none rounded-circle"/>
          </div>
          <!-- Profile Details -->
          <div class="profile-details modifiable-pilot text-start">
            <!-- Profile Status -->
            <div class="profile-status mb-2">
              <span class="status-indicator bi bi-circle-fill text-success"></span>
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

          <!-- Conteneur pour les éléments d'historique -->
          <div id="match-items-container" class="match-history-items d-flex flex-column" style="max-height: 40vh; overflow-y: auto;">
            <!-- Les éléments de match seront ajoutés ici -->
          </div>
          <!-- Boutons en bas, en dehors du conteneur des match items -->
          
        </div>
        <div class="d-flex justify-content-center mt-3">
            <button class="btn bi bi-envelope me-2" id="invite-link">Invite</button>
            <button class="btn bi bi-person-dash me-2" id="remove-link">Remove</button>
            <button class="btn bi bi-person-add me-2" id="add-link">Add</button>
            <button class="btn bi bi-person-slash me-2" id="block-link">Block</button>
            <button class="btn bi bi-person-check" id="unblock-link">Unblock</button>
          </div>

      </span>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: async (el) => {
    function getUsernameFromUrl() {
      const path = window.location.pathname;
      const prefix = '/social/pilot=';
      if (path.startsWith(prefix)) {
        return decodeURIComponent(path.substring(prefix.length));
      }
      return null;
    }

    const profileUsername = getUsernameFromUrl();
    if (!profileUsername) {
      console.error("Username not found in URL");
      return;
    }

    const profile_id = await fetchUserId(profileUsername);
    console.log(`Profile ID: ${profile_id}`);

    // Load profile details
    loadUserProfile(profile_id);
    loadMatchHistory(profile_id);

    el.addEventListener('click', async (e) => {
      e.preventDefault();

      let action = null;
      if (e.target.matches('#invite-link')) {
        console.debug('Invite sent.');
        const payload = {
          type: 'info_message',
          action: "private_game_invite",
          author: await getUserIdFromCookieAPI(),
          recipient: profile_id,
          initiator: await getUserIdFromCookieAPI(),
          timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(payload));
        clearPageContent();
				const config = {
          gameMode: 'private',
					action: 'create',
					matchkey: await getUserIdFromCookieAPI(), // ID of current User
					type: 'fullScreen',
				};
        playGame(config);
      }
      if (e.target.matches('#remove-link')) {
        action = "remove_friend";
        console.debug('Friend removed.');
      }
      else if (e.target.matches('#add-link')) {
        action = "send_friend_request";
        console.debug('Friend added.');
      }
      else if (e.target.matches('#block-link')) {
        action = "block_user";
        console.debug('User blocked.');
      }
      else if (e.target.matches('#unblock-link')) {
        action = "unblock_user";
        console.debug('User unblocked.');
      }

      if (!action) return; // If no action matched, exit
      
      const payload = {
        type: 'info_message',
        action: action,
        author: await getUserIdFromCookieAPI(),
        recipient: profile_id,
        initiator: await getUserIdFromCookieAPI(),
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(payload));
    });
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

export async function fetchUserId(username) {
  try {
    const response = await fetch(`/api/user-service/get_user_id/${username}/`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.user_id;
  } catch (error) {
    console.error('Error fetching user ID:', error);
  }
}

function clearPageContent() {
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.style.display = "none"; // Hide the entire form
  }
  const blurScreenEffect = document.getElementById('blur-screen-effect');
  if (blurScreenEffect) {
    blurScreenEffect.classList.add('hidden'); // Hide the blur effect
  }
}

/*
SI LE USER EXISTE PAS FAIRE UNE PAGE SPECIALE 

*/
