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
        
        <!-- Boutons de sélection du nombre de joueurs (données d'exemple) -->
        <div id="tournament-controls" class="mb-4">
          <button class="btn btn-outline-light sample-size-btn" data-size="4">4 Players</button>
          <button class="btn btn-outline-light sample-size-btn" data-size="8">8 Players</button>
          <button class="btn btn-outline-light sample-size-btn" data-size="16">16 Players</button>
        </div>
        
        <div id="tournament-state" class="mb-4">
          <p class="text-secondary">The tournament is in progress.</p>
        </div>
        
        <!-- Bracket : affichage des matchs sous forme d'arbre -->
        <div id="bracket-container" 
             style="display: flex; flex-direction: row; gap: 20px; overflow-x: auto; width: 100%; justify-content: center;">
          <!-- Le contenu est généré dynamiquement -->
        </div>
		<button id="abandon-tournament" class="btn btn-danger mt-3">Abandon Tournament</button>
		</section>
		`;
	},
	attachEvents: (el) => {
		const username = sessionStorage.getItem("username");
		let sampleSize = 16;
		
    // Données d'exemple pour le bracket
    function getBracketData(size) {
		console.log("getBracketData");
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
      if (roundIndex === 0) return true; // Premier round, aucune condition préalable
      const previousRound = bracketData[roundIndex - 1];
      return previousRound.matches.some(match =>
        (match.player1 === username || match.player2 === username) &&
        match.status === "completed"
      );
    }

    // Fonction de rendu du bracket en arbre
    function renderBracket() {
		console.log("renderBracket");
      const bracketData = getBracketData(sampleSize);
      let html = "";
      bracketData.forEach((round, roundIndex) => {
        html += `<div class="round-column" style="min-width: 150px;">
          <h3 class="text-white mb-3">${round.round}</h3>
          ${round.matches.map(match => {
            if (match.status === "completed") {
              const winner = match.winner;
              const loser = (match.player1 === winner) ? match.player2 : match.player1;
              return `<div class="match p-2 mb-2 bg-dark rounded" data-match-id="${match.id}">
                        <span class="text-white">
                          <span class="fw-bold">${winner}</span> vs 
                          <span>${loser}</span>
                        </span>
                        <span class="badge bg-info ms-2">${match.score}</span>
                      </div>`;
            } else {
              // Pour un match pending impliquant l'utilisateur, vérifier si les matchs précédents sont terminés
              let joinButton = "";
              if (match.status === "pending" && (match.player1 === username || match.player2 === username)) {
                if (hasUserCompletedInPreviousRound(bracketData, roundIndex)) {
                  joinButton = `<button class="btn btn-success btn-sm join-match ms-2">Join Game</button>`;
                } else {
                  joinButton = `<span class="text-warning ms-2">Waiting for previous match</span>`;
                }
              }
              return `<div class="match p-2 mb-2 bg-dark rounded" data-match-id="${match.id}">
                        <span class="text-white">${match.player1} vs ${match.player2}</span>
                        <span class="text-secondary ms-2">${match.status}</span>
                        ${joinButton}
                      </div>`;
            }
          }).join('')}
        </div>`;
      });
      const bracketContainer = el.querySelector("#bracket-container");
      if (bracketContainer) {
        bracketContainer.innerHTML = html;
      }
      // Ajout des écouteurs sur les boutons "Join Game"
      const joinButtons = el.querySelectorAll(".join-match");
      joinButtons.forEach(button => {
        button.addEventListener("click", () => {
          const matchDiv = button.closest(".match");
          const matchId = matchDiv.getAttribute("data-match-id");
          alert(`Joining match ${matchId}`);
          handleRoute(`/pong/play/match/${matchId}`);
        });
      });
    }

    renderBracket();

    // Écouteurs pour changer le nombre de joueurs via les boutons
    const sampleSizeButtons = el.querySelectorAll(".sample-size-btn");
    sampleSizeButtons.forEach(button => {
      button.addEventListener("click", () => {
        sampleSize = parseInt(button.getAttribute("data-size"));
        renderBracket();
      });
    });

    // const leaveTournamentButton = el.querySelector("#abandon-tournament");
    // leaveTournamentButton.addEventListener("click", () => {
    //   alert("Leaving tournament...");
    //   handleRoute("/pong/play/tournament");
    // });
  }
});
