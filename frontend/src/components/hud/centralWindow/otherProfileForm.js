import { createComponent } from '/src/utils/component.js';
import { loadUserProfile, loadMatchHistory } from '/src/components/hud/centralWindow/profileForm.js';

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
      const prefix = "/social/pilot=";
      if (path.startsWith(prefix)) {
        return decodeURIComponent(path.substring(prefix.length));
      }
      return null;
    }
    
    const profile_id = await fetchUserId(getUsernameFromUrl());
    console.log(profile_id);
    loadUserProfile(profile_id);
    loadMatchHistory(profile_id);

		el.addEventListener('click', (e) => {
			if (e.target.matches('#invite-link')) {
				console.debug('Invite sent.');
			}
			if (e.target.matches('#remove-link')) {
				console.debug('Friend removed.');
			}
			if (e.target.matches('#add-link')) {
				console.debug('Friend added.');
			}
			if (e.target.matches('#block-link')) {
				console.debug('User blocked.');
			}
			if (e.target.matches('#unblock-link')) {
				console.debug('User unblocked.');
			}
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
    console.error("Error fetching user ID:", error);
  }
}


/*
SI LE USER EXISTE PAS FAIRE UNE PAGE SPECIALE 

*/