import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const socialForm = createComponent({
  tag: 'socialForm',

  // Générer le HTML
  render: () => `
    <div id="social-form" class="form-container">
      <h5 class="text-center">Social</h5>
      <span class="background-central-span d-flex flex-column align-items-center flex-grow-1 p-4">
        <!-- Friend List -->
        <div class="social-friend-list w-100 d-flex flex-column p-4 mb-4">
          <h6 class="friend-list-title d-flex justify-content-center mb-4">
            <span class="bi bi-people me-2"></span>Friend List
          </h6>
          <div class="friend-list-container d-flex flex-column" style="max-height: 18vh; overflow-y: auto;">
            ${createFriendItem('Online', 'Pseudo', 'text-success')}
            ${createFriendItem('Offline', 'AnotherPseudo', 'text-danger')}
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
            <input type="text" id="search-bar" name="search-bar" class="form-control w-50 me-2" placeholder="Search for a pilot" required />
            <button class="btn btn-sm bi bi-search" id="search-link">Search</button>
          </div>
          <div class="pilot-list-container d-flex flex-column" style="max-height: 18vh; overflow-y: auto;">
            ${createPilotItem('Online', 'Pilot1', 'text-success')}
            ${createPilotItem('Offline', 'Pilot2', 'text-danger')}
          </div>
        </div>
      </span>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Gestion des clics sur "Voir Profil" dans la liste d'amis
    el.addEventListener('click', (e) => {
      if (e.target.matches('#other-profile-link')) {
        e.preventDefault();
        handleRoute("/social?pilot=pseudo");
        console.info('OtherProfileForm loaded on click.');
      }
    });

    // Gestion des clics sur "Ajouter" dans la liste des pilotes
    el.addEventListener('click', (e) => {
      if (e.target.matches('#add-link')) {
        e.preventDefault();
        console.log('Add friend clicked.');
        // Ajoute la logique pour ajouter un ami
      }
    });

    // Gestion de la barre de recherche
    el.querySelector('#search-link').addEventListener('click', (e) => {
      e.preventDefault();
      const query = el.querySelector('#search-bar').value;
      console.log(`Search for: ${query}`);
      // Ajouter la logique de recherche ici
    });
  },
});

/**
 * Génère un élément d'ami dans la liste
 *
 * @param {string} status - Statut de l'ami (Online/Offline)
 * @param {string} pseudo - Pseudo de l'ami
 * @param {string} statusClass - Classe pour le statut
 * @returns {string} - HTML du composant ami
 */
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

/**
 * Génère un élément de pilote dans la liste
 *
 * @param {string} status - Statut du pilote
 * @param {string} pseudo - Pseudo du pilote
 * @param {string} statusClass - Classe pour le statut
 * @returns {string} - HTML du composant pilote
 */
function createPilotItem(status, pseudo, statusClass) {
  return `
    <div class="pilot-item d-flex justify-content-between align-items-center px-3">
      <div class="d-flex align-items-center">
        <span class="status-indicator bi bi-circle-fill ${statusClass} me-2"></span>
        <span class="profile-pseudo fw-bold">${pseudo}</span>
      </div>
      <div class="d-flex">
        <button class="btn btn-sm bi bi-person me-2" id="profile-link">Profile</button>
        <button class="btn btn-sm bi bi-person-add" id="add-link">Add</button>
      </div>
    </div>
  `;
}
