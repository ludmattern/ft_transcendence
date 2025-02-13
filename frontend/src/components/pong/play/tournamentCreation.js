import { createComponent } from "/src/utils/component.js";

// Fonction utilitaire pour générer un room code alphanumérique à 6 caractères
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const tournamentCreation = createComponent({
  tag: "tournamentCreation",
  render: () => {
    // Récupérer les paramètres (mode, taille, username)
    const tournamentMode = sessionStorage.getItem("tournamentMode") || "local";
    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";
    
    if (tournamentMode === "local") {
      // Retourne l'interface pour un tournoi local
      return `
        <section class="col-12 d-flex flex-column align-items-center text-center p-5"
                 style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
          <h1 class="mb-4">Local Tournament Creation</h1>
          
          <!-- Zone d'ajout d'un joueur -->
          <div class="w-50 mb-4">
            <div class="input-group">
              <input id="player-name" type="text" class="form-control" placeholder="Enter player name" aria-label="Player name">
              <button id="add-player" class="btn btn-primary" type="button">Add Player</button>
            </div>
          </div>
          
          <!-- Liste des joueurs -->
          <div class="w-50 mb-4">
            <h2>
              Players (<span id="players-count">0</span>/<span id="max-players">${tournamentSize}</span>)
            </h2>
            <ul id="players-list" class="list-group"></ul>
          </div>
          
          <!-- Bouton de création du tournoi -->
          <button id="create-tournament" class="btn btn-success" disabled>Create Tournament</button>
        </section>
      `;
    } else {
      // Mode online : on génère le room code
      const roomCode = generateRoomCode();
      return `
        <section class="col-12 d-flex flex-column align-items-center text-center p-5"
                 style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
          <h1 class="mb-4">Online Tournament Creation</h1>
          
          <!-- Affichage du Room Code -->
          <div class="mb-4">
            <h3 class="text-white">Room Code:</h3>
            <h2 id="room-code" class="text-warning">${roomCode}</h2>
            <button id="copy-room-code" class="btn btn-secondary btn-sm">Copy Room Code</button>
          </div>
          
          <!-- Zone d'envoi d'invitations -->
          <div class="w-50 mb-4">
            <div class="input-group">
              <input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
              <button id="send-invite" class="btn btn-primary" type="button">Send Invitation</button>
            </div>
          </div>
          
          <!-- Bouton de création du tournoi -->
          <button id="create-tournament" class="btn btn-success">Create Tournament</button>
        </section>
      `;
    }
  },
  attachEvents: (el) => {
    // Récupérer les paramètres
    const tournamentMode = sessionStorage.getItem("tournamentMode") || "local";
    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";
    
    if (tournamentMode === "local") {
      // --- Gestion du mode local ---
      const playerNameInput = el.querySelector("#player-name");
      const addPlayerButton = el.querySelector("#add-player");
      const playersList = el.querySelector("#players-list");
      const playersCountSpan = el.querySelector("#players-count");
      const createTournamentButton = el.querySelector("#create-tournament");
      
      let players = [username];
      
      function updateLocalUI() {
        playersCountSpan.textContent = players.length;
        playersList.innerHTML = "";
        players.forEach((name, index) => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between align-items-center";
          li.textContent = name;
          
          if (name !== username) {
            const removeButton = document.createElement("button");
            removeButton.className = "btn btn-danger btn-sm";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
              players.splice(index, 1);
              updateLocalUI();
            });
            li.appendChild(removeButton);
          } else {
            const badge = document.createElement("span");
            badge.className = "badge bg-secondary ms-2";
            badge.textContent = "You";
            li.appendChild(badge);
          }
          
          playersList.appendChild(li);
        });
        createTournamentButton.disabled = players.length !== tournamentSize;
      }
      
      updateLocalUI();
      
      addPlayerButton.addEventListener("click", () => {
        const name = playerNameInput.value.trim();
        if (!name) return;
        if (players.length >= tournamentSize) {
          alert(`You can only add up to ${tournamentSize} players.`);
          return;
        }
        players.push(name);
        playerNameInput.value = "";
        updateLocalUI();
      });
      
      playerNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          addPlayerButton.click();
        }
      });
      
      createTournamentButton.addEventListener("click", () => {
        console.log("Local tournament created with players:", players);
        alert("Tournament created with players: " + players.join(", "));
        // Optionnel : réinitialiser la liste en conservant l'utilisateur
        players = [username];
        updateLocalUI();
      });
      
    } else {
      // --- Gestion du mode online ---
      // Le room code a été généré dans le rendu et affiché dans l'élément #room-code
      const roomCodeElement = el.querySelector("#room-code");
      const roomCode = roomCodeElement.textContent;
      const copyRoomCodeButton = el.querySelector("#copy-room-code");
      const inviteInput = el.querySelector("#invite-input");
      const sendInviteButton = el.querySelector("#send-invite");
      const createTournamentButton = el.querySelector("#create-tournament");
      
      createTournamentButton.addEventListener("click", () => {
        console.log("Online tournament created with room code:", roomCode);
        alert("Tournament created with room code: " + roomCode);
      });
      
      copyRoomCodeButton.addEventListener("click", () => {
        navigator.clipboard.writeText(roomCode).then(() => {
          alert("Room code copied to clipboard!");
        }, () => {
          alert("Failed to copy room code.");
        });
      });
      
      sendInviteButton.addEventListener("click", () => {
        const inviteMessage = inviteInput.value.trim();
        if (!inviteMessage) {
          alert("Please enter an invitation message.");
          return;
        }
        console.log(`Sending invitation: "${inviteMessage}" with Room Code: ${roomCode}`);
        alert("Invitation sent: " + inviteMessage);
        inviteInput.value = "";
      });
    }
  }
});
