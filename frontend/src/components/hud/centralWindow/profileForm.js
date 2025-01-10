import { createComponent } from '/src/utils/component.js';

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
            <a href="#">
              <img src="/src/assets/img/default-profile-150.png" alt="Profile Picture" class="profile-pic rounded-circle" />
            </a>
          </div>
          <!-- Profile Details -->
          <div class="profile-details modifiable-pilot text-start">
            <!-- Profile Status -->
            <div class="profile-status mb-2">
              <span class="status-indicator bi bi-circle-fill text-success"></span>
              <form action="#" method="post" class="d-inline-block">
                <input type="text" class="profile-pseudo-input form-control form-control-sm d-inline-block w-auto fw-bold"
                  name="profile-pseudo" value="Pseudo" required />
              </form>
            </div>
            <!-- Profile Statistics -->
            <div class="profile-stats">
              <div class="stat-item d-flex align-items-center mb-1">
                <span class="bi bi-trophy me-2"></span>
                <span class="stat-title">Winrate:</span>
                <span class="stat-value ms-1">50%</span>
              </div>
              <div class="stat-item d-flex align-items-center">
                <span class="bi bi-award me-2"></span>
                <span class="stat-title">Rank:</span>
                <span class="stat-value ms-1">1</span>
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
          <div class="match-history-container d-flex flex-column" style="max-height: 40vh; overflow-y: auto;">
            <!-- Match History Header -->
            <div class="match-history-header d-flex fw-bold">
              <span class="col-2">Outcome</span>
              <span class="col-2">Game Mode</span>
              <span class="col-2">Duration</span>
              <span class="col-2">Date</span>
              <span class="col-4">Opponents</span>
            </div>
            <!-- Match Items -->
            ${createMatchItem('Win', '1v1', '10min', '01/01/2022', 'Opponent', 'text-success')}
            ${createMatchItem('Loss', '2v2', '20min', '01/01/2022', 'Opponent 1, Opponent 2', 'text-danger')}
            ${createMatchItem('Loss', '2v2', '20min', '01/01/2022', 'Opponent 1, Opponent 2', 'text-danger')}
          </div>
        </div>
      </span>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Gestion du clic sur un lien vers un autre profil
    el.addEventListener('click', (e) => {
      if (e.target.matches('#other-profile-link')) {
        e.preventDefault();
        // testloadComponent('#central-window', otherProfileForm); // Charger OtherProfileForm
        console.info('OtherProfileForm loaded on click.');
      }
    });

    // Exemple d'événement supplémentaire pour les statistiques
    el.querySelector('.profile-pseudo-input').addEventListener('change', (e) => {
      console.log(`Pseudo changé en : ${e.target.value}`);
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
function createMatchItem(outcome, mode, duration, date, opponents, outcomeClass) {
  return `
    <div class="match-item d-flex">
      <span class="col-2 ${outcomeClass} fw-bold">${outcome}</span>
      <span class="col-2">${mode}</span>
      <span class="col-2">${duration}</span>
      <span class="col-2">${date}</span>
      <span class="col-4">${opponents}</span>
    </div>
  `;
}
