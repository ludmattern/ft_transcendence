import { createComponent } from "/src/utils/component.js";

export const tournamentContent = createComponent({
  tag: "tournamentContent",

  // Générer le HTML
  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">Oh, You Want to Join a Tournament?</h2>
        <p class="text-secondary text-center">That’s adorable. Let’s see how long you last.</p>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" id="tab-create" data-bs-toggle="tab" href="#createTournament">
                    Create Your Own Disaster
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-join" data-bs-toggle="tab" href="#joinTournament">
                    Join an Ongoing Bloodbath
                </a>
            </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-4">
            <!-- Create Tournament -->
            <div class="tab-pane fade show active" id="createTournament">
                <h3 class="text-white">Create Your Own Tournament</h3>
                <p class="text-secondary">How cute, you actually think you’ll make it to the finals?</p>

                ${generateModeSelector()}
                ${generateMapSelector()}
                ${generateTournamentSizeSelector()}

                <div class="text-center">
                    <button class="btn btn-danger btn-lg mt-3">Create This Mess</button>
                </div>
            </div>

            <!-- Join Tournament -->
            <div class="tab-pane fade" id="joinTournament">
                <h3 class="text-white">Join an Existing Tournament</h3>
                <p class="text-secondary">You want to join? Great, another victim enters the arena.</p>

                <div class="mb-3">
                    <label for="tournamentList" class="form-label text-white">Select a Tournament to Crash</label>
                    <select class="form-select" id="tournamentList">
                        <option value="tournament1">The Arena of Despair (8 Players)</option>
                        <option value="tournament2">The Noob Gauntlet (16 Players)</option>
                        <option value="tournament3">The Brutal Slaughterhouse (4 Players)</option>
                    </select>
                    <small class="text-muted">Not that it matters, you'll be out in round one.</small>
                </div>

                <div class="text-center">
                    <button class="btn btn-primary mt-3">Join and Get Wrecked</button>
                </div>
            </div>
        </div>
    </section>
  `,

  attachEvents: (el) => {
    // Gestion des onglets
    const tabs = el.querySelectorAll(".nav-link");
    const tabPanes = el.querySelectorAll(".tab-pane");
  
    // Restaurer l'onglet actif depuis sessionStorage
    const savedTabId = sessionStorage.getItem("activeTournamentTab");
    if (savedTabId) {
      tabs.forEach(tab => tab.classList.remove("active"));
      tabPanes.forEach(pane => pane.classList.remove("show", "active"));
  
      const activeTab = el.querySelector(`[href="#${savedTabId}"]`);
      const activePane = el.querySelector(`#${savedTabId}`);
      if (activeTab && activePane) {
        activeTab.classList.add("active");
        activePane.classList.add("show", "active");
      }
    }
  
    // Ajouter les événements pour sauvegarder l'onglet actif
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const target = tab.getAttribute("href").substring(1);
  
        // Désactiver tous les onglets et les cacher
        tabs.forEach(t => t.classList.remove("active"));
        tabPanes.forEach(pane => pane.classList.remove("show", "active"));
  
        // Activer l'onglet sélectionné
        tab.classList.add("active");
        el.querySelector(`#${target}`).classList.add("show", "active");
  
        // Sauvegarder l'onglet actif dans sessionStorage
        sessionStorage.setItem("activeTournamentTab", target);
      });
    });
  
    // Gestion des sélections pour les champs
    const selectors = el.querySelectorAll("select");
    selectors.forEach(select => {
      const key = select.id;
  
      // Restaurer les valeurs sauvegardées
      const savedValue = sessionStorage.getItem(key);
      if (savedValue) {
        select.value = savedValue;
      }
  
      select.addEventListener("change", () => {
        sessionStorage.setItem(key, select.value);
      });
    });
  }  
});

/**
 * Sélecteur du type de tournoi (Local ou Online)
 */
function generateModeSelector() {
  return `
    <div class="mb-3">
        <label for="tournamentMode" class="form-label text-white">Select Your Method of Humiliation</label>
        <select class="form-select" id="tournamentMode">
            <option value="local">Local - Get Mocked in Person</option>
            <option value="online">Online - Get Destroyed by Strangers</option>
        </select>
        <small class="text-muted">Either way, you're getting eliminated first.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur de map
 */
function generateMapSelector() {
  return `
    <div class="mb-3">
        <label for="mapSelect" class="form-label text-white">Select Your Battlefield</label>
        <select class="form-select" id="mapSelect">
            <option value="map1">The Pit of Futility</option>
            <option value="map2">Asteroid Wasteland of Despair</option>
            <option value="map3">Nebula of Certain Defeat</option>
            <option value="map4">The Black Hole of No Return</option>
        </select>
        <small class="text-muted">Not that it matters. You're getting eliminated anyway.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur du format du tournoi (4, 8 ou 16 joueurs)
 */
function generateTournamentSizeSelector() {
  return `
    <div class="mb-3">
        <label for="tournamentSize" class="form-label text-white">Select the Size of Your Demise</label>
        <select class="form-select" id="tournamentSize">
            <option value="4">4 Players - A Small-Scale Humiliation</option>
            <option value="8">8 Players - Double the Disappointment</option>
            <option value="16">16 Players - A Public Execution</option>
        </select>
        <small class="text-muted">The more players, the more people watching you fail.</small>
    </div>
  `;
}
