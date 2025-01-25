import { createComponent } from "/src/utils/component.js";
import { gameManager } from "/src/pongGame/gameManager.js";

export const multiplayerContent = createComponent({
  tag: "multiplayerContent",

  // Générer le HTML
  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">So, You Actually Want to Play Multiplayer?</h2>
        <p class="text-secondary text-center">Fine. Choose how you'd like to embarrass yourself.</p>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" id="tab-local" data-bs-toggle="tab" href="#local">Local</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-matchmaking" data-bs-toggle="tab" href="#matchmaking">Matchmaking</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-private" data-bs-toggle="tab" href="#private">Private</a>
            </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-4">
            <!-- Local Play -->
            <div class="tab-pane fade show active" id="local">
                <h3 class="text-white">Local Multiplayer</h3>
                <p class="text-secondary">Oh, you actually think you're better than your friend sitting next to you? Cute.</p>

                ${generateMapSelector("local")}
                ${generatePlayerCountSelector("local")}

                <button class="btn btn-warning mt-3" id="launchLocal">Challenge Your Friend and Lose Together</button>
            </div>

            <!-- Matchmaking -->
            <div class="tab-pane fade" id="matchmaking">
                <h3 class="text-white">Online Matchmaking</h3>
                <p class="text-secondary">Ah yes, let’s throw you into the fire against people who do nothing but play this game.</p>

                ${generateMapSelector("matchmaking")}
                ${generatePlayerCountSelector("matchmaking")}

                <button class="btn btn-danger mt-3" id="launchMatch">Queue Up for Instant Regret</button>
            </div>

            <!-- Private Match -->
            <div class="tab-pane fade" id="private">
                <h3 class="text-white">Private Match</h3>
                <p class="text-secondary">Want to set up a match? Good luck convincing anyone to join.</p>

                ${generateMapSelector("private")}
                ${generatePlayerCountSelector("private")}

                <div class="input-group mb-3 mt-3">
                    <input type="text" class="form-control" placeholder="Enter Room Code" aria-label="Room Code">
                    <button class="btn btn-secondary">Join Room and Get Wrecked</button>
                </div>
                <button class="btn btn-primary" id="launchPrivate">Create a Room (So You Can Lose in Private)</button>
            </div>
        </div>
    </section>
  `,

  attachEvents: (el) => {
    // Gestion des onglets
    const tabs = el.querySelectorAll(".nav-link");
    const tabPanes = el.querySelectorAll(".tab-pane");
  
    // Restaurer l'onglet actif depuis sessionStorage
    const savedTabId = sessionStorage.getItem("activeTab");
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
        sessionStorage.setItem("activeTab", target);
      });
    });
  
    // Sauvegarde et restauration des sélections
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


    const localButton = document.getElementById("launchLocal");


    localButton.addEventListener("click", () => {
      const gameConfig = {
        mode: "local", 
        map: document.getElementById("mapSelect-local").value, 
        playerCount: parseInt(document.getElementById("playerCount-local").value, 10),
      };
      gameManager.startGame(gameConfig);

    });

    const matchButton = document.getElementById("launchMatch");
    matchButton.addEventListener("click", () => {
      const gameConfig = {
        mode: "matchmaking", 
        map: document.getElementById("mapSelect-matchmaking").value, 
        playerCount: parseInt(document.getElementById("playerCount-matchmaking").value, 10),
      };
      launchMatchmaking(userId);

    });

    const privateButton = document.getElementById("launchPrivate");
    privateButton.addEventListener("click", () => {
      const gameConfig = {
        mode: "private", 
        map: document.getElementById("mapSelect-private").value, 
        playerCount: parseInt(document.getElementById("playerCount-private").value, 10),
      };
      gameManager.startGame(gameConfig);
      
    });
  },
});

async function launchMatchmaking(userId) {
  // Faire une requête fetch vers /join_matchmaking
  const response = await fetch(`/join_matchmaking?user_id=${userId}`);
  const data = await response.json();

  if (data.status === "matched") {
    // On a un game_id
    console.log("Matched! game_id=", data.game_id);
    startMatchmakingGame(data.game_id);
  } else {
    console.log("En attente d’un 2e joueur...");
    // Re-tenter dans 2 secondes
    setTimeout(() => launchMatchmaking(userId), 2000);
  }
}

function startMatchmakingGame(gameId) {
  // Ici, on construit le gameConfig
  const gameConfig = {
    mode: "matchmaking",
    map: document.getElementById("mapSelect-matchmaking").value,
    playerCount: 2,
    // On passe pas l’ID en param, ou on le stocke dedans
    gameId: gameId
  };
  gameManager.startGame(gameConfig);
}


/**
 * Génère le sélecteur de map (avec un identifiant spécifique)
 */
function generateMapSelector(context) {
  return `
    <div class="mb-3">
        <label for="mapSelect-${context}" class="form-label text-white">Select Your Battlefield</label>
        <select class="form-select" id="mapSelect-${context}" aria-describedby="mapHelp-${context}">
            <option value="map1">The Pit of Futility</option>
            <option value="map2">Asteroid Wasteland of Despair</option>
            <option value="map3">Nebula of Certain Defeat</option>
            <option value="map4">The Black Hole of No Return</option>
        </select>
        <small id="mapHelp-${context}" class="text-muted">Not that it will help. You're losing anyway.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur du nombre de joueurs (avec un identifiant spécifique)
 */
function generatePlayerCountSelector(context) {
  return `
    <div class="mb-3">
        <label for="playerCount-${context}" class="form-label text-white">Select the Number of Victims</label>
        <select class="form-select" id="playerCount-${context}" aria-describedby="playerHelp-${context}">
            <option value="2">2 Players - One-on-One Humiliation</option>
            <option value="4">4 Players - Double the Embarrassment</option>
        </select>
        <small id="playerHelp-${context}" class="text-muted">More players won’t help you win, just make your defeat more public.</small>
    </div>
  `;
}
