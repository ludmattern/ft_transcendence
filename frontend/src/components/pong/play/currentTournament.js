import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { playGame } from '/src/components/pong/play/utils.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { ws } from '/src/services/socketManager.js';

export const currentTournament = createComponent({
	tag: 'currentTournament',
	render: () => {
		const username = sessionStorage.getItem('username');
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

        <button id="abandon-tournament" class="btn btn-pong-danger mt-5">Leave Tournament</button>
      </section>
    `;
	},
	attachEvents: async (el) => {

    const tournamentCreationNeeded = sessionStorage.getItem('tournamentCreationNeeded') === 'true';
    if (tournamentCreationNeeded) {
      try {
        sessionStorage.removeItem('tournamentCreationNeeded');
        const userId = await getUserIdFromCookieAPI();
        const payload = {
          type: "tournament_message",
          action: "create_online_tournament",
          organizer_id: userId,
        };
      
        ws.send(JSON.stringify(payload));      
        console.log("Online tournament created:", payload);
      }
      catch (error) {
        console.error("Error creating online tournament:", error);
      }
    }

   



		const username = sessionStorage.getItem('username');
		const userId =await  getUserIdFromCookieAPI();

		async function renderBracket() {
			const data = await getBracketData();

			let bracketData = data.rounds;
			let titlesHtml = '';
			let roundsHtml = '';
			let mode = bracketData.mode;
			let tournament_id = data.tournament_id;
			bracketData.forEach((round, roundIndex) => {
				titlesHtml += `<div class="h4 round-title">${round.round}</div>`;

				const matchesHtml = round.matches
					.map((match) => {
						let joinButton = '';
						if (match.status === 'completed') {
							let displayHtml = '';
							if (match.winner) {
								if (match.winner === match.player1) {
									displayHtml = `<span class="text-success fw-bold">${match.player1}</span> vs <span class="text-danger">${match.player2}</span>`;
								} else {
									displayHtml = `<span class="text-danger">${match.player1}</span> vs <span class="text-success fw-bold">${match.player2}</span>`;
								}
							} else {
								displayHtml = `${match.player1} vs ${match.player2}`;
							}
							return `
              <div class="match p-2 bg-dark rounded" data-match-id="${match.id}" data-player1="${match.player1}" data-player2="${match.player2}">
                <span class="text-white">${displayHtml}</span>
                <span class="badge ms-2">${match.score}</span>
              </div>
            `;
						} else if (match.status === 'pending' && match.player1 !== 'TBD' && match.player2 !== 'TBD') {
							if (mode === 'online') {
								if ((match.player1 === username || match.player2 === username) && hasUserCompletedInPreviousRound(bracketData, roundIndex)) {
									joinButton = `<button class="btn btn-pong-blue btn-sm join-match ms-2">Join Game</button>`;
								}
							} else {
								joinButton = `<button class="btn btn-pong-blue btn-sm join-match ms-2">Join Game</button>`;
							}
						}

						return `
            <div class="match p-2 bg-dark rounded" data-match-id="${match.id}" data-player1="${match.player1}" data-player2="${match.player2}">
              <span class="text-white">${match.player1} vs ${match.player2}</span>
              ${joinButton === '' ? `<span class="text-secondary ms-2">${match.status}</span>` : joinButton}
            </div>
          `;
					})
					.join('');

				roundsHtml += `
          <div class="round-column">
            <div class="matches-container">
              ${matchesHtml}
            </div>
          </div>
        `;

				if (roundIndex < bracketData.length - 1) {
					const bracketCount = Math.pow(2, bracketData.length - 1 - roundIndex) / 2;
					let bracketLines = '';
					for (let i = 0; i < bracketCount; i++) {
						bracketLines += `<div class="bracket-line" style="height: calc(3rem * ${roundIndex + 1.3});"></div>`;
					}
					roundsHtml += `<div class="round-column">${bracketLines}</div>`;
				}
			});

			const bracketContainer = el.querySelector('#bracket-container');
			if (bracketContainer) {
				bracketContainer.innerHTML = `
          <div class="h4 round-titles">${titlesHtml}</div>
          <div class="rounds-content">${roundsHtml}</div>
        `;
			}
        // ici faudrait app une autre vue dans le cas du online

      const abandonTournamentButton = document.getElementById("abandon-tournament");
      abandonTournamentButton.addEventListener("click", async () => {
        try {
          const response = await fetch("/api/tournament-service/abandon_local_tournament/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ tournament_id: tournament_id })
          });
          const result = await response.json();
          console.log("Tournament abandoned:", result);
          
          handleRoute("/pong/play/tournament");
        } catch (error) {
          console.error("Error abandoning tournament:", error);
        }
      });

      // ici faudrait app private matchmaking dans le cas du online pour creer la partit
			const joinButtons = el.querySelectorAll('.join-match');
			joinButtons.forEach((button) => {
				button.addEventListener('click', () => {
					const matchDiv = button.closest('.match');
					const matchId = matchDiv.getAttribute('data-match-id');
					const player1 = matchDiv.getAttribute('data-player1');
					const player2 = matchDiv.getAttribute('data-player2');

					const config = {
						gameMode: 'local-tournament',
						player1: player1,
						player2: player2,
						type: 'splitScreen',
						matchId: matchId,
						tournament_id: tournament_id,
					};
					console.log(config);
					playGame(config);
				});
			});
		}
    
		renderBracket();
	},
});

async function getBracketData() {
  try {
    const userId = await getUserIdFromCookieAPI();

    console.log('User ID récupéré depuis sessionStorage:', userId);
    const response = await fetch(`/api/tournament-service/get_current_tournament/?user_id=${userId}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du bracket :', error);
    return [];
  }
} 

function hasUserCompletedInPreviousRound(bracketData, roundIndex) {
  if (roundIndex === 0) return true;
  const previousRound = bracketData[roundIndex - 1];
  return previousRound.matches.some((match) => (match.player1 === username || match.player2 === username) && match.status === 'completed');
}



/*
Cote front:
----> Si TournamentCreationNeeded est set a true dans session storage on creer le payload pour creer le tournoi en back avec ws
  -----> on mes a jour le tournoi ongoin du client actif
----> Si TournamentCreationNeeded est set a false dans session storage on recupere les donnees du tournoi en cours

cote back:
----> on bacule le tournoie en ongoing et on creer le premier round dans la db
----> on broadcast a tout les joueurs du tournoi que le tournoi commence 

*/