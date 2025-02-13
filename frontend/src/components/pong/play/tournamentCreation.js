import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";

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
    // Récupération des paramètres depuis le sessionStorage
    const tournamentMode = sessionStorage.getItem("tournamentMode") || "local";
    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";

    if (tournamentMode === "local") {
      // Interface pour le tournoi en local
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
          <button id="cancel-tournament" class="btn btn-danger mt-3">Cancel</button>
        </section>
      `;
    } else {
      // Interface pour le tournoi en online
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
          
          <!-- Liste des joueurs en ligne -->
          <div class="w-50 mb-4">
            <h2 class="text-white">
              Players (<span id="online-players-count">0</span>/<span id="max-players-online">${tournamentSize}</span>)
            </h2>
            <ul id="online-players-list" class="list-group"></ul>
          </div>
          
          <!-- Zone d'envoi d'invitations -->
          <div class="w-50 mb-4">
            <div class="input-group">
              <input id="invite-input" type="text" class="form-control" placeholder="Enter invitation message" aria-label="Invitation">
              <button id="send-invite" class="btn btn-primary" type="button">Send Invitation</button>
            </div>
          </div>
          
          <!-- Bouton de création du tournoi -->
          <button id="create-tournament" class="btn btn-success" disabled>Create Tournament</button>
          <button id="cancel-tournament" class="btn btn-danger mt-3">Cancel</button>
          
          <!-- Bouton de simulation d'arrivée de joueur (pour la démo) -->
          <button id="simulate-join" class="btn btn-info mt-3">Simulate Player Join</button>
        </section>
      `;
    }
  },
  attachEvents: (el) => {
    const tournamentMode = sessionStorage.getItem("tournamentMode") || "local";
    const tournamentSize = parseInt(sessionStorage.getItem("tournamentSize")) || 16;
    const username = sessionStorage.getItem("username") || "You";

    const cancelTournamentButton = el.querySelector("#cancel-tournament");
    if (cancelTournamentButton) {
      cancelTournamentButton.addEventListener("click", () => {
        handleRoute("/pong/play/tournament");
      });
    }

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
      const roomCodeElement = el.querySelector("#room-code");
      const roomCode = roomCodeElement.textContent;
      const copyRoomCodeButton = el.querySelector("#copy-room-code");
      const inviteInput = el.querySelector("#invite-input");
      const sendInviteButton = el.querySelector("#send-invite");
      const createTournamentButton = el.querySelector("#create-tournament");

      // Gestion de la liste des joueurs en ligne.
      // Chaque entrée est un objet { name, pending }.
      const onlinePlayersList = el.querySelector("#online-players-list");
      const onlinePlayersCountSpan = el.querySelector("#online-players-count");

      // L'hôte est ajouté par défaut et n'est pas en attente.
      let onlinePlayers = [{ name: username, pending: false }];

      function updateOnlinePlayersUI() {
        onlinePlayersCountSpan.textContent = onlinePlayers.length;
        onlinePlayersList.innerHTML = "";
      
        // Trier les joueurs pour que les "pending" soient en premier
        const sortedPlayers = onlinePlayers.sort((a, b) => b.pending - a.pending);
      
        sortedPlayers.forEach((player, index) => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between align-items-center";
          li.textContent = player.name;
      
          if (player.name === username) {
            // L'hôte ne peut pas être retiré
            const badge = document.createElement("span");
            badge.className = "badge bg-secondary ms-2";
            badge.textContent = "You";
            li.appendChild(badge);
          } else if (player.pending) {
            // Invitation en attente : on affiche un badge "Pending" et un bouton d'annulation
            const badge = document.createElement("span");
            badge.className = "badge bg-warning ms-2";
            badge.textContent = "Pending";
            li.appendChild(badge);
      
            const cancelButton = document.createElement("button");
            cancelButton.className = "btn btn-danger btn-sm ms-2";
            cancelButton.textContent = "Cancel";
            cancelButton.addEventListener("click", () => {
              onlinePlayers.splice(index, 1);
              updateOnlinePlayersUI();
            });
            li.appendChild(cancelButton);
          } else {
            // Joueur confirmé : ajoute un bouton "Kick"
            const kickButton = document.createElement("button");
            kickButton.className = "btn btn-danger btn-sm ms-2";
            kickButton.textContent = "Kick";
            kickButton.addEventListener("click", () => {
              onlinePlayers.splice(index, 1);
              updateOnlinePlayersUI();
            });
            li.appendChild(kickButton);
          }  
          // Pour les joueurs confirmés (simulés), on n'affiche pas de bouton de suppression.
          onlinePlayersList.appendChild(li);
        });
      
        createTournamentButton.disabled = onlinePlayers.length !== tournamentSize;
      }

      updateOnlinePlayersUI();

      createTournamentButton.addEventListener("click", () => {
        console.log("Online tournament created with room code:", roomCode);
        console.log("Players:", onlinePlayers);
        alert("Tournament created with room code: " + roomCode);
      });

      copyRoomCodeButton.addEventListener("click", () => {
        navigator.clipboard.writeText(roomCode).then(() => {
          alert("Room code copied to clipboard!");
        }, () => {
          alert("Failed to copy room code.");
        });
      });

      // Lorsqu'une invitation est envoyée, on ajoute une entrée pending dans la liste.
      sendInviteButton.addEventListener("click", () => {
        const inviteMessage = inviteInput.value.trim();
        if (!inviteMessage) {
          alert("Please enter an invitation message.");
          return;
        }
        if (onlinePlayers.length >= tournamentSize) {
          alert(`You can only have up to ${tournamentSize} players.`);
          return;
        }
        // On ajoute l'invitation comme un joueur pending.
        onlinePlayers.push({ name: inviteMessage, pending: true });
        updateOnlinePlayersUI();
        console.log(`Invitation sent: "${inviteMessage}" with Room Code: ${roomCode}`);
        inviteInput.value = "";
      });
      
      // Permettre l'envoi d'une invitation en appuyant sur "Enter"
      inviteInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendInviteButton.click();
        }
      });

      // Bouton de simulation d'arrivée d'un nouveau joueur (pour la démo)
      const simulateJoinButton = el.querySelector("#simulate-join");
      let simulatedPlayerIndex = 1;
      simulateJoinButton.addEventListener("click", () => {
        if (onlinePlayers.length >= tournamentSize) {
          alert("Player limit reached!");
          return;
        }
        // Simulation d'un joueur qui rejoint (non pending)
        const newPlayerName = "Player " + simulatedPlayerIndex++;
        onlinePlayers.push({ name: newPlayerName, pending: false });
        updateOnlinePlayersUI();
      });
    }
  }
});
