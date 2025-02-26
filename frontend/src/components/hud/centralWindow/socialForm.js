import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export const socialForm = createComponent({
  tag: 'socialForm',

  // Générer le HTML du composant
  render:  () => {
    // On récupère l'ID utilisateur depuis le sessionStorage

    // Le contenu HTML initial. La liste d'amis sera mise à jour après rendu.
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
              <input type="text" id="search-bar" name="search-bar" class="form-control w-50 me-2" placeholder="Search for a pilot" required />
              <button class="btn btn-sm bi bi-search" id="search-link">Search</button>
            </div>
            <div class="pilot-list-container d-flex flex-column" style="max-height: 18vh; overflow-y: auto;">

            </div>
          </div>
        </span>
      </div>
    `;
  },

  // Ajouter les événements après le chargement du composant dans le DOM
  attachEvents: async (el) => {
	getFriends(await getUserIdFromCookieAPI());
    el.addEventListener('click', (e) => {
      if (e.target.matches('#other-profile-link')) {
        e.preventDefault();
        const item = e.target.closest('.friend-item') || e.target.closest('.pilot-item');
        if (item) {
          const pseudoEl = item.querySelector('.profile-pseudo');
          if (pseudoEl) {
            const friendUsername = pseudoEl.textContent.trim();
            handleRoute(`/social/pilot=${friendUsername}`);
          }
        }
      }
    });
    

    // Gestion du clic sur "Ajouter" dans la liste des pilotes
    el.addEventListener('click', (e) => {
      if (e.target.matches('#add-link')) {
        e.preventDefault();
        console.log('Add friend clicked.');
        // Ajoutez ici la logique pour ajouter un ami
      }
    });

    const searchLink = el.querySelector('#search-link');
    const searchBar = el.querySelector('#search-bar');

    if (searchLink) {
      searchLink.addEventListener('click', (e) => {
        e.preventDefault();
        const query = searchBar.value.trim();
        console.log(`Search for: ${query}`);
        const pilotListContainer = el.querySelector('.pilot-list-container');
        fetchPilot(query, pilotListContainer);
      });
    }
    
    if (searchBar) {
      searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = searchBar.value.trim();
          console.log(`Search for: ${query}`);
          const pilotListContainer = el.querySelector('.pilot-list-container');
          fetchPilot(query, pilotListContainer);
        }
      });
    }
  },
});

/**
 * Génère un élément d'ami dans la liste
 *
 * @param {string} status - Statut de l'ami (par exemple, 'Online' ou 'Offline')
 * @param {string} pseudo - Pseudo de l'ami
 * @param {string} statusClass - Classe CSS pour le style du statut
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
 * @param {string} statusClass - Classe CSS pour le style du statut
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
        <button class="btn btn-sm bi bi-person me-2" id="other-profile-link">Profile</button>
        <button class="btn btn-sm bi bi-person-add" id="add-link">Add</button>
      </div>
    </div>
  `;
}

/**
 * Récupère la liste d'amis depuis l'API et construit dynamiquement la liste dans le DOM
 * Ne met à jour le DOM que s'il y a au moins un ami.
 *
 * @param {string} userId
 */
async function getFriends(userId) {
  try {
    const response = await fetch(`/api/user-service/get_friends/?userId=${encodeURIComponent(userId)}`);
    console.log('response:', response);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log('Friend list:', data.friends);

    const friendListContainer = document.querySelector('.friend-list-container');
    if (friendListContainer && data.friends && data.friends.length > 0) {
      friendListContainer.innerHTML = data.friends
        .map(friend => createFriendItem('Online', friend.username, 'text-success'))
        .join('');
    }
	else {
	  friendListContainer.innerHTML = `<p style="opacity: 0.7;">It's a lonely world...</p>`;
	}
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste d'amis:", error);
  }
}




async function fetchPilot(query, container) {
  try {
    const response = await fetch(`/api/user-service/search_pilots/?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("Search results:", data.pilots);
    if (container) {
      if (data.pilots.length === 0) {
        container.innerHTML = `<p>Maybe this pilot crashed or went far far far away...</p>`;
      } else {
        container.innerHTML = data.pilots.map(pilot => createPilotItem(
          'Online',
          pilot.username,
          'text-success'
        )).join('');
      }
    }
  } catch (error) {
    console.error("Error searching pilots:", error);
  }
}
