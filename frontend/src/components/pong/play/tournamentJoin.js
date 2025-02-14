import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";

export const tournamentJoin = createComponent({
  tag: "tournamentJoin",
  render: () => {
    const roomCode = sessionStorage.getItem("roomCode") || "UNKNOWN";
    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";
    
    return `
      <section class="col-12 d-flex flex-column align-items-center text-center p-5"
               style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
        <h1 class="mb-4">Tournament Lobby</h1>
        
        <!-- Affichage du Room Code -->
        <div class="mb-4">
          <h3 class="text-white">Room Code:</h3>
          <h2 id="room-code" class="text-warning">${roomCode}</h2>
          <button id="copy-room-code" class="btn btn-pong btn-sm">Copy Room Code</button>
        </div>
        
        <!-- Liste des joueurs en ligne -->
        <div class="w-50 mb-4">
          <h2 class="text-white">
            Players (<span id="online-players-count">0</span>/<span id="max-players-online">${tournamentSize}</span>)
          </h2>
          <ul id="online-players-list" class="list-group"></ul>
        </div>
        
        <!-- Bouton pour quitter le tournoi -->
        <button id="leave-tournament" class="btn btn-pong">Leave Tournament</button>
      </section>
    `;
  },
  attachEvents: (el) => {
    const roomCodeElement = el.querySelector("#room-code");
    const roomCode = roomCodeElement.textContent;
    const copyRoomCodeButton = el.querySelector("#copy-room-code");
    const leaveTournamentButton = el.querySelector("#leave-tournament");

    const onlinePlayersList = el.querySelector("#online-players-list");
    const onlinePlayersCountSpan = el.querySelector("#online-players-count");

    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";

    // Dans un vrai environnement, cette liste serait gérée en temps réel via Redis ou WebSocket.
    // Ici, on simule avec une liste locale qui inclut d'office l'utilisateur.
    let onlinePlayers = [{ name: username, joined: true }];

    function updateOnlinePlayersUI() {
      onlinePlayersCountSpan.textContent = onlinePlayers.length;
      onlinePlayersList.innerHTML = "";
      onlinePlayers.forEach((player) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = player.name;
        
        if (player.name === username) {
          const badge = document.createElement("span");
          badge.className = "badge bg-secondary ms-2";
          badge.textContent = "You";
          li.appendChild(badge);
        }
        // Pour les autres joueurs, on pourra afficher éventuellement un badge ou bouton "Kick" (selon le rôle de l'hôte)
        onlinePlayersList.appendChild(li);
      });
    }

    updateOnlinePlayersUI();

    copyRoomCodeButton.addEventListener("click", () => {
      navigator.clipboard.writeText(roomCode).then(() => {
        alert("Room code copied to clipboard!");
      }, () => {
        alert("Failed to copy room code.");
      });
    });

    // L'utilisateur peut quitter le tournoi en cliquant sur "Leave Tournament"
    leaveTournamentButton.addEventListener("click", () => {
      onlinePlayers = onlinePlayers.filter(p => p.name !== username);
      updateOnlinePlayersUI();
      handleRoute("/pong/play/tournament");
      // Ici, on pourrait rediriger l'utilisateur vers une autre page
      leaveTournamentButton.disabled = true;
    });
  }
});
