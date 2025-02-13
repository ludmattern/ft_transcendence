import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";

export const currentTournament = createComponent({
  tag: "currentTournament",
  render: () => {
    const username = sessionStorage.getItem("username");
    return `
      <section class="col-12 d-flex flex-column align-items-center text-center p-5" 
               style="color: white; background-color: #111111; max-height: 700px; overflow: auto;">
        <h1 class="mb-4">Current Tournament</h1>
        
        <!-- Styles pour le bracket -->
        <style>
          /* Conteneur global : on se contente de la largeur ici */
          #bracket-container {
            width: 100%;
          }
          /* Bloc des titres des rounds */
          .round-titles {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8rem;
            width: 100%;
            margin-bottom: 20px;
          }
          .round-title {
            min-width: 150px;
            text-align: center;
            font-weight: bold;
            color: white;
          }
          /* Bloc des colonnes de rounds */
          .rounds-content {
            display: flex;
            align-items: stretch;
            gap: 20px;
            width: 100%;
            justify-content: center;
          }
          /* Colonne de round : contient la liste des matchs */
          .round-column {
            display: flex;
            flex-direction: column;
          }
          /* Conteneur des matchs, répartis verticalement */
          .matches-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
          /* Style pour chaque match */
          .match {
            margin-bottom: 8px;
          }
          /* Ligne de bracket entre colonnes */
          .bracket-line {
            position: relative;
            width: 50px;
            height: 120px;
            margin: auto 0;
          }
          .bracket-line::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: white;
          }
          .bracket-line::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 50%;
            height: 2px;
            background: white;
            transform: translateY(-50%);
          }
        </style>
        
        <!-- Boutons de sélection du nombre de joueurs -->
        <div id="tournament-controls" class="mb-4">
          <button class="btn btn-outline-light sample-size-btn" data-size="4">4 Players</button>
          <button class="btn btn-outline-light sample-size-btn" data-size="8">8 Players</button>
          <button class="btn btn-outline-light sample-size-btn" data-size="16">16 Players</button>
        </div>
        
        <div id="tournament-state" class="mb-4">
          <p class="text-secondary">The tournament is in progress.</p>
        </div>
        
        <!-- Conteneur du bracket -->
        <div id="bracket-container">
          <!-- Les titres et les colonnes seront insérés dynamiquement -->
        </div>

        <button id="abandon-tournament" class="btn btn-danger mt-5">Abandon Tournament</button>
      </section>
    `;
  },
  attachEvents: (el) => {
    const username = sessionStorage.getItem("username");
    let sampleSize = 16;
    
    // Données d'exemple
    function getBracketData(size) {
      if (size === 4) {
        return [
          {
            round: "Semi-finals",
            matches: [
              { id: 1, player1: "Hitler", player2: "Qordoux", status: "completed", winner: "Hitler", score: "2-0" },
              { id: 2, player1: username, player2: "Franco", status: "pending", winner: null, score: null }
            ]
          },
          {
            round: "Final",
            matches: [
              { id: 3, player1: "Hitler", player2: "TBD", status: "pending", winner: null, score: null }
            ]
          }
        ];
      } else if (size === 8) {
        return [
          {
            round: "Quarter-finals",
            matches: [
              { id: 1, player1: "Qordoux", player2: "Hitler", status: "completed", winner: "Hitler", score: "2-1" },
              { id: 2, player1: "Charlie", player2: "Franco", status: "completed", winner: "Charlie", score: "2-0" },
              { id: 3, player1: username, player2: "Nkermani", status: "pending", winner: null, score: null },
              { id: 4, player1: "Jgavairo", player2: "Poutine", status: "pending", winner: null, score: null }
            ]
          },
          {
            round: "Semi-finals",
            matches: [
              { id: 5, player1: "Hitler", player2: "Charlie", status: "pending", winner: null, score: null },
              { id: 6, player1: "Winner 3", player2: "Winner 4", status: "pending", winner: null, score: null }
            ]
          },
          {
            round: "Final",
            matches: [
              { id: 7, player1: "TBD", player2: "TBD", status: "pending", winner: null, score: null }
            ]
          }
        ];
      } else {
        // 16 players
        return [
          {
            round: "Round of 16",
            matches: [
              { id: 1, player1: "Hitler", player2: "Qordoux", status: "completed", winner: "Hitler", score: "2-0" },
              { id: 2, player1: username, player2: "Franco", status: "completed", winner: username, score: "2-0" },
              { id: 3, player1: "Lossalos", player2: "Nkermani", status: "completed", winner: "Lossalos", score: "2-0" },
              { id: 4, player1: "Poutine", player2: "Jgavairo", status: "completed", winner: "Jgavairo", score: "2-1" },
              { id: 5, player1: "Poutine", player2: "Jgavairo", status: "completed", winner: "Jgavairo", score: "2-1" },
              { id: 6, player1: "Poutine", player2: "Jgavairo", status: "completed", winner: "Jgavairo", score: "2-1" },
              { id: 7, player1: "Poutine", player2: "Jgavairo", status: "completed", winner: "Jgavairo", score: "2-1" },
              { id: 8, player1: "Poutine", player2: "Jgavairo", status: "completed", winner: "Jgavairo", score: "2-1" }
            ]
          },
          {
            round: "Quarter-finals",
            matches: [
              { id: 9, player1: "Hitler", player2: "Franco", status: "completed", winner: "Hitler", score: "2-1" },
              { id: 10, player1: username, player2: "Jgavairo", status: "pending", winner: null, score: null },
              { id: 11, player1: username, player2: "Jgavairo", status: "pending", winner: null, score: null },
              { id: 12, player1: username, player2: "Jgavairo", status: "pending", winner: null, score: null }
            ]
          },
          {
            round: "Semi-finals",
            matches: [
              { id: 13, player1: username, player2: "TBD", status: "pending", winner: null, score: null },
              { id: 14, player1: username, player2: "TBD", status: "pending", winner: null, score: null }
            ]
          },
          {
            round: "Final",
            matches: [
              { id: 15, player1: "TBD", player2: "TBD", status: "pending", winner: null, score: null }
            ]
          }
        ];
      }
    }

    // Vérifie si l'utilisateur a terminé son match dans le round précédent
    function hasUserCompletedInPreviousRound(bracketData, roundIndex) {
      if (roundIndex === 0) return true;
      const previousRound = bracketData[roundIndex - 1];
      return previousRound.matches.some(
        match =>
          (match.player1 === username || match.player2 === username) &&
          match.status === "completed"
      );
    }

    function renderBracket() {
      const bracketData = getBracketData(sampleSize);
      let titlesHtml = "";
      let roundsHtml = "";

      bracketData.forEach((round, roundIndex) => {
        // Création du titre pour le round
        titlesHtml += `<div class="h4 round-title">${round.round}</div>`;

        // Création de la colonne avec la liste des matchs
        const matchesHtml = round.matches
          .map(match => {
            if (match.status === "completed") {
              const winner = match.winner;
              const loser = match.player1 === winner ? match.player2 : match.player1;
              return `
                <div class="match p-2 bg-dark rounded" data-match-id="${match.id}">
                  <span class="text-white">
                    <span class="fw-bold">${winner}</span> vs 
                    <span>${loser}</span>
                  </span>
                  <span class="badge bg-info ms-2">${match.score}</span>
                </div>
              `;
            } else {
              let joinButton = "";
              if (match.status === "pending" && (match.player1 === username || match.player2 === username)) {
                if (hasUserCompletedInPreviousRound(bracketData, roundIndex)) {
                  joinButton = `<button class="btn btn-success btn-sm join-match ms-2">Join Game</button>`;
                }
              }
              return `
                <div class="match p-2 bg-dark rounded" data-match-id="${match.id}">
                  <span class="text-white">${match.player1} vs ${match.player2}</span>
                  ${joinButton === "" ? `<span class="text-secondary ms-2">${match.status}</span>` : joinButton}
                </div>
              `;
            }
          })
          .join("");

        roundsHtml += `
          <div class="round-column">
            <div class="matches-container">
              ${matchesHtml}
            </div>
          </div>
        `;

        // On ajoute une ligne de bracket entre les rounds (sauf après le dernier)
		if (roundIndex < bracketData.length - 1) {
			const bracketCount = Math.pow(2, (bracketData.length - 1 - roundIndex)) / 2;
			let bracketLines = "";
			for (let i = 0; i < bracketCount; i++) {
			  bracketLines += `<div class="bracket-line" style="height: calc(3rem * ${roundIndex + 1.3});"></div>`;
			}
			roundsHtml += `<div class="round-column">${bracketLines}</div>`;
		  }		  
      });

      const bracketContainer = el.querySelector("#bracket-container");
      if (bracketContainer) {
        bracketContainer.innerHTML = `
          <div class="h4 round-titles">${titlesHtml}</div>
          <div class="rounds-content">${roundsHtml}</div>
        `;
      }

      // Écouteurs pour les boutons "Join Game"
      const joinButtons = el.querySelectorAll(".join-match");
      joinButtons.forEach(button => {
        button.addEventListener("click", () => {
          const matchDiv = button.closest(".match");
          const matchId = matchDiv.getAttribute("data-match-id");
          handleRoute(`/pong/play/match/${matchId}`);
        });
      });
    }

    renderBracket();

    const sampleSizeButtons = el.querySelectorAll(".sample-size-btn");
    sampleSizeButtons.forEach(button => {
      button.addEventListener("click", () => {
        sampleSize = parseInt(button.getAttribute("data-size"));
        renderBracket();
      });
    });
  }
});
