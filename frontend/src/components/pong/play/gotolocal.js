import { createComponent } from "/src/utils/component.js";
import { switchwindow } from "/src/3d/animation.js";
import { handleRoute } from "/src/services/router.js";
import { gameManager } from "/src/pongGame/gameManager.js";	

/**
 * Composant pour configurer la partie locale avec choix des côtés et touches associées.
 */
export const gotolocal = createComponent({
  tag: "gotolocal",

  render: () => {
    const username = sessionStorage.getItem("username") || "Host";

    return `
      <section class="p-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">Enter Your Pseudonyms</h2>
        <p class="text-secondary text-center">Choose your names and sides. Controls will update accordingly.</p>

        <div class="row w-100 justify-content-center">
          <!-- Hôte -->
          <div class="col-md-5 m-2 p-3 text-center border rounded bg-dark">
            <label class="form-label text-white">Host</label>
            <div id="player1Display" class="form-control text-center fw-bold bg-secondary text-white">${username}</div>
            <label class="form-label text-white mt-2">Select Side</label>
            <select class="form-select text-center" id="player1Side">
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <div class="mt-2 text-white">Controls: <span id="player1Controls" class="text-warning">W / S</span></div>
          </div>

          <!-- Invité -->
          <div class="col-md-5 m-2 p-3 text-center border rounded bg-dark">
            <label for="player2" class="form-label text-white">Guest</label>
            <input type="text" id="player2" class="form-control text-center" placeholder="Enter your name" />
            <label class="form-label text-white mt-2">Select Side</label>
            <select class="form-select text-center" id="player2Side">
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <div class="mt-2 text-white">Controls: <span id="player2Controls" class="text-warning">↑ / ↓</span></div>
          </div>
        </div>

        <!-- Zone d'affichage des erreurs -->
        <div id="errorMessage" class="text-danger mt-3 text-center"></div>

        <div class="mt-4 d-flex justify-content-center gap-4">
          <button class="btn btn-secondary btn-lg" id="cancel">Cancel</button>
          <button class="btn btn-success btn-lg" id="startGame">Start Game</button>
        </div>
      </section>
    `;
  },

  attachEvents: () => {
    const player2Input = document.getElementById("player2");
    const player1Side = document.getElementById("player1Side");
    const player2Side = document.getElementById("player2Side");
    const player1Controls = document.getElementById("player1Controls");
    const player2Controls = document.getElementById("player2Controls");
    const startGameButton = document.getElementById("startGame");
    const errorMessage = document.getElementById("errorMessage");

    // Charger les valeurs sauvegardées
    const savedPlayer2 = sessionStorage.getItem("player2");
    const savedPlayer1Side = sessionStorage.getItem("player1Side") || "left";
    const savedPlayer2Side = sessionStorage.getItem("player2Side") || "right";

    if (savedPlayer2) player2Input.value = savedPlayer2;
    player1Side.value = savedPlayer1Side;
    player2Side.value = savedPlayer2Side;

    // Mise à jour des contrôles en fonction du choix du côté
    function updateControls() {
      player1Controls.textContent = player1Side.value === "left" ? "W / S" : "↑ / ↓";
      player2Controls.textContent = player2Side.value === "left" ? "W / S" : "↑ / ↓";
    }

    // Sauvegarde des changements dans sessionStorage
    player2Input.addEventListener("input", () => {
      sessionStorage.setItem("player2", player2Input.value);
      validateForm();
    });

    player1Side.addEventListener("change", () => {
      sessionStorage.setItem("player1Side", player1Side.value);
      updateControls();
      validateForm();
    });

    player2Side.addEventListener("change", () => {
      sessionStorage.setItem("player2Side", player2Side.value);
      updateControls();
      validateForm();
    });

    // Gestion des boutons
    document.getElementById("cancel").addEventListener("click", () => {
      handleRoute("/pong/play/multiplayer");
    });

    document.getElementById("startGame").addEventListener("click", () => {
      if (validateForm()) {
        startLocalGame();
      }
    });

    // Vérification stricte et affichage d'erreurs
    function validateForm() {
      const guestHasName = player2Input.value.trim() !== "";
      const differentSides = player1Side.value !== player2Side.value;
      let errors = [];

      if (!guestHasName) {
        errors.push("Guest must enter a name.");
      }

      if (!differentSides) {
        errors.push("Both players cannot be on the same side.");
      }

      if (errors.length > 0) {
        errorMessage.innerHTML = errors.join("<br>");
        return false;
      } else {
        errorMessage.innerHTML = "";
        return true;
      }
    }

    // Fonction pour démarrer la partie
    function startLocalGame() {
      const player1 = sessionStorage.getItem("username");
      const player2 = player2Input.value.trim();
      const side1 = player1Side.value;
      const side2 = player2Side.value;

      console.log(`Starting game: ${player1} (${side1}) vs ${player2} (${side2})`);
      
      // Redirige vers la fenêtre de jeu avec les données nécessaires
	  const gameConfig = {
        mode: "local", 
        map: "test", 
        playerCount: 2,
      };
	  gameManager.startGame(gameConfig);
      switchwindow("game");
    }

    // Validation initiale
    validateForm();
    updateControls();
  }
});
