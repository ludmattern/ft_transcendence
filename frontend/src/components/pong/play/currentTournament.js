import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { playGame } from "/src/components/pong/play/utils.js";

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
        
        
        <div id="tournament-state" class="mb-4">
          <p class="text-secondary">The tournament is in progress.</p>
        </div>
        
        <!-- Conteneur du bracket -->
        <div id="bracket-container">
          <!-- Les titres et les colonnes seront insérés dynamiquement -->
        </div>

        <button id="abandon-tournament" class="btn btn-pong-danger mt-5">Abandon Tournament</button>
      </section>
    `;
  },
  attachEvents: (el) => {
    const username = sessionStorage.getItem("username");
    
    async function getBracketData() {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await fetch(`/api/tournament-service/get_current_tournament/?user_id=${userId}`);        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        const data = await response.json();
        return data.rounds;
      } catch (error) {
        console.error("Erreur lors de la récupération du bracket :", error);
        return [];
      }
    }

    function hasUserCompletedInPreviousRound(bracketData, roundIndex) {
      if (roundIndex === 0) return true;
      const previousRound = bracketData[roundIndex - 1];
      return previousRound.matches.some(
        match =>
          (match.player1 === username || match.player2 === username) &&
          match.status === "completed"
      );
    }

    async function renderBracket() {
      const bracketData =  await getBracketData();
      let titlesHtml = "";
      let roundsHtml = "";
      let mode = bracketData.mode;

      bracketData.forEach((round, roundIndex) => {
        titlesHtml += `<div class="h4 round-title">${round.round}</div>`;

        const matchesHtml = round.matches.map(match => {
          let joinButton = "";
          if (match.status === "pending" &&  match.player1 !== "TBD" &&match.player2 !== "TBD") 
          {
            if (mode === "online") 
            {
              if ((match.player1 === username || match.player2 === username) &&
                  hasUserCompletedInPreviousRound(bracketData, roundIndex)) 
              {
              joinButton = `<button class="btn btn-pong-blue btn-sm join-match ms-2">Join Game</button>`;
              }
            } else { 
              joinButton = `<button class="btn btn-pong-blue btn-sm join-match ms-2">Join Game</button>`;
            }
          }
          
          return `
            <div class="match p-2 bg-dark rounded" data-match-id="${match.id}">
              <span class="text-white">${match.player1} vs ${match.player2}</span>
              ${joinButton === "" ? `<span class="text-secondary ms-2">${match.status}</span>` : joinButton}
            </div>
          `;
        }).join("");

        roundsHtml += `
          <div class="round-column">
            <div class="matches-container">
              ${matchesHtml}
            </div>
          </div>
        `;

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
          const config = {
            gameMode : "local-tournament",
            player1: "abou",
            player2:"bakar",
            type: "splitScreen",
            };
              playGame(config);        
            });
      });
    }

    renderBracket();
  ;}
});
