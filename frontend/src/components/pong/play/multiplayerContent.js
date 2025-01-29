import { createComponent } from "/src/utils/component.js";
import { gameManager } from "/src/pongGame/gameManager.js";

import { joinRoom  , launchMatchmaking, leaveMatchmaking ,leavePrivate} from "/src/services/multiplayerPong.js";
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
                <button class="btn btn-secondary mt-3" id="leaveMatch" style="display: none;">Leave Matchmaking</button>
            </div>

            <!-- Private Match -->
            <div class="tab-pane fade" id="private">
                <h3 class="text-white">Private Match</h3>
                <p class="text-secondary">Want to set up a match? Good luck convincing anyone to join.</p>

                ${generateMapSelector("private")}
                ${generatePlayerCountSelector("private")}

                <div class="input-group mb-3 mt-3">
                    <input type="text" class="form-control" id="privateRoomCode" placeholder="Enter Room Code" aria-label="Room Code">
                </div>
                <button class="btn btn-primary" id="createPrivate">Create or Join Room (So You Can Lose in Private)</button>
                <button class="btn btn-secondary mt-3" id="leavePrivate" style="display: none;">Leave Room</button>
            </div>
        </div>
    </section>
  `,

  attachEvents: (el) => {


    const tabs = el.querySelectorAll(".nav-link");
    const tabPanes = el.querySelectorAll(".tab-pane");
  
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
      leaveMatchButton.style.display = "block";
      matchButton.style.display = "none";

      launchMatchmaking();

    });

    const leaveMatchButton = document.getElementById("leaveMatch");
    leaveMatchButton.addEventListener("click", async () => {
      leaveMatchmaking();
      leaveMatchButton.style.display = "none";
      matchButton.style.display = "block";
    });

    const createPrivateButton = document.getElementById("createPrivate");
    createPrivateButton.addEventListener("click", () => {
      const roomCode = document.getElementById("privateRoomCode").value;
      if (!roomCode) {
        console.log("Enter a room code");
        return;
      }
      createPrivateButton.style.display = "none"; 
      leavePrivateButton.style.display = "block"; 
      joinRoom(roomCode);             
    });

const leavePrivateButton = document.getElementById("leavePrivate");
leavePrivateButton.addEventListener("click", async () => {
  leavePrivateButton.style.display = "none";
  createPrivateButton.style.display = "block"; 
  leavePrivate();
});

},
});

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
