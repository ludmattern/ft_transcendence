import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { playGame } from '/src/components/pong/play/utils.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { ws } from '/src/services/websocket.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { handleTournamentRedirection } from '/src/services/router.js';
import { pushInfo,getInfo, deleteInfo} from '/src/services/infoStorage.js';

export const currentTournament = createComponent({
	tag: 'currentTournament',
	render: () => {
		return `
	<section class="col-12 d-flex flex-column align-items-center text-center p-5" 
			style="color: white; background-color: #111111; max-height: 700px; overflow: auto;">
		<h1 class="mb-4">Current Tournament</h1>

		<style>
		/* Conteneur global : on se contente de la largeur ici */
		#bracket-container {
			width: 100%;
		}
		/* Bloc des titres des size */
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
		/* Bloc des colonnes de size */
		.size-content {
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
		<div id="bracket-container"></div>

		<button id="abandon-tournament" class="btn btn-pong-danger mt-5">Leave Tournament</button>
	</section>
	`;
	},
	attachEvents: async (el) => {
		console.log('currentTournament attachEvents');
		currentTournament.el = el;
			const data = await getInfo('TournamentCreationNeeded');
		if (data.success && data.value === 'True') {
			try {
				await deleteInfo('TournamentCreationNeeded');
				const payload = {
					type: 'tournament_message',
					action: 'create_online_tournament',
				};
				ws.send(JSON.stringify(payload));
				console.log('Online tournament created:', payload);
			} catch (error) {
				console.error('Error creating online tournament:', error);
			}
		} else {
			if (await handleTournamentRedirection('/pong/play/current-tournament')) {
				console.log('Tournament redirection has occurred.');
				return;
			}
			renderBracket();
		}
	
		subscribe('updateBracket', renderBracket);
	},
});

export async function renderBracket() {
	const el = currentTournament.el;
	const username = (await getInfo('username')).success ? (await getInfo('username')).value : null;
	const data = await getBracketData();
	if (!data || !data.size) {
		console.warn('No bracket data available.');
		return;
	}

	console.log('Bracket data:', data);

	const mode = data.mode;
	const bracketData = data.size;
	const tournament_id = data.tournament_id;

	let titlesHtml = '';
	let sizeHtml = '';

	if (mode === 'online') {
		bracketData.forEach((round, roundIndex) => {
			titlesHtml += `<div class="h4 round-title">${round.round}</div>`;
			const matchesHtml = round.matches
				.map((match) => {
					let joinButton = '';
					const matchKey = match.match_key;

					if (match.status === 'completed') {
						let displayHtml = getCompletedMatchHtml(match);
						return createCompletedMatchHtml(match, displayHtml);
					}

					if ((match.status === 'pending' || match.status === 'ready') && match.player1 !== 'TBD' && match.player2 !== 'TBD') {
						if ((match.player1 === username || match.player2 === username) && hasUserCompletedInPreviousRound(bracketData, roundIndex, username)) {
							joinButton = `<button class="btn btn-pong-blue btn-sm join-match ms-2"data-match-key="${matchKey}">
											Join Game
										</button>`;
						}
					}

					return `<div class="match p-2 bg-dark rounded"
							data-match-id="${match.id}"
							data-player1="${match.player1}"
							data-player2="${match.player2}"
							data-match-key="${matchKey}">
							<span class="text-white">${match.player1} vs ${match.player2}</span>
							${joinButton === '' ? `<span class="text-secondary ms-2">${match.status}</span>` : joinButton}
						</div>`;
				})
				.join('');
			sizeHtml += `<div class="round-column">
							<div class="matches-container">${matchesHtml}</div>
						</div>`;

			if (roundIndex < bracketData.length - 1) {
				const bracketCount = Math.pow(2, bracketData.length - 1 - roundIndex) / 2;
				let bracketLines = '';
				for (let i = 0; i < bracketCount; i++) {
					bracketLines += `<div class="bracket-line" style="height: calc(3rem * ${roundIndex + 1.3});"></div>`;
				}
				sizeHtml += `<div class="round-column">${bracketLines}</div>`;
			}
		});
	} else {
		bracketData.forEach((round, roundIndex) => {
			titlesHtml += `<div class="h4 round-title">${round.round}</div>`;

			const matchesHtml = round.matches
				.map((match) => {
					let joinButton = '';

					if (match.status === 'completed') {
						let displayHtml = getCompletedMatchHtml(match);
						return createCompletedMatchHtml(match, displayHtml);
					}

					if (match.status === 'pending' && match.player1 !== 'TBD' && match.player2 !== 'TBD') {
						joinButton = '<button class="btn btn-pong-blue btn-sm join-match ms-2">Join Game</button>';
					}

					return `<div class="match p-2 bg-dark rounded" data-match-id="${match.id}" 
						data-player1="${match.player1}" data-player2="${match.player2}">
							<span class="text-white">${match.player1} vs ${match.player2}</span>
							${joinButton === '' ? `<span class="text-secondary ms-2">${match.status}</span>` : joinButton}
						</div>`;
				})
				.join('');

			console.log('roundIndex', roundIndex);

			sizeHtml += `<div class="round-column">
							<div class="matches-container">${matchesHtml}</div>
						</div>`;

			if (roundIndex < bracketData.length - 1) {
				const bracketCount = Math.pow(2, bracketData.length - 1 - roundIndex) / 2;
				let bracketLines = '';
				for (let i = 0; i < bracketCount; i++) {
					bracketLines += `<div class="bracket-line" style="height: calc(3rem * ${roundIndex + 1.3});"></div>`;
				}
				sizeHtml += `<div class="round-column">${bracketLines}</div>`;
			}
		});
	}

	const bracketContainer = el.querySelector('#bracket-container');
	if (bracketContainer) {
		bracketContainer.innerHTML = `<div class="h4 round-titles">${titlesHtml}</div>
									<div class="size-content">${sizeHtml}</div>`;
	}

	const abandonTournamentButton = document.getElementById('abandon-tournament');
	if (abandonTournamentButton) {
		abandonTournamentButton.addEventListener("click", async () => {
			try {	
				const response = await fetch("/api/tournament-service/abandon_local_tournament/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ tournament_id: tournament_id }),
					credentials: "include",
				});
	
				const result = await response.json();
				console.log("Tournament abandoned:", result);
	
				if (result.success) {
					handleRoute("/pong/play");
				} 
				else if (mode === 'online') {
					const payload = {
						type: 'tournament_message',
						action: 'leave_online_tournament',
					};
					
					ws.send(JSON.stringify(payload));
					console.log('Online tournament abandoned:', payload);
					handleRoute('/pong/play');
				}
			} catch (error) {
				console.error('Error abandoning tournament:', error);
			}
		});
	}

	const joinButtons = el.querySelectorAll('.join-match');
	joinButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const matchDiv = button.closest('.match');
			const matchId = matchDiv.getAttribute('data-match-id');
			const player1 = matchDiv.getAttribute('data-player1');
			const player2 = matchDiv.getAttribute('data-player2');
			const matchKey = button.getAttribute('data-match-key');

			if (mode === 'online') {
				console.log('Join Online Match:', { matchId, player1, player2 });
				const config = {
					gameMode: 'private',
					action: 'create',
					matchkey: matchKey,
					type: 'fullScreen',
				};
				console.log(config);
				playGame(config);
			} else {
				const config = {
					gameMode: 'local-tournament',
					player1: player1,
					player2: player2,
					type: 'splitScreen',
					matchId: matchId,
					tournament_id: tournament_id,
				};
				console.log('Join Local Match with config:', config);
				playGame(config);
			}
		});
	});
}

async function getBracketData() {
	try {
		const response = await fetch(`/api/tournament-service/get_current_tournament/`, {
			method: 'GET',
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`Erreur HTTP ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Erreur lors de la récupération du bracket :', error);
		return {};
	}
}

function hasUserCompletedInPreviousRound(bracketData, roundIndex, username) {
	if (roundIndex === 0) return true;
	const previousRound = bracketData[roundIndex - 1];
	return previousRound.matches.some((match) => (match.player1 === username || match.player2 === username) && match.status === 'completed');
}

function createCompletedMatchHtml(match, displayHtml) {
	console.log('score', match.score);
	return `<div class="match p-2 bg-dark rounded" data-match-id="${match.id}" 
			data-player1="${match.player1}" data-player2="${match.player2}">
				<span class="text-white">${displayHtml}</span>
				<span class="badge ms-2">${match.score}</span>
			</div>`;
}

function getCompletedMatchHtml(match) {
	if (!match.score) 
	{
		return `${match.player1} vs ${match.player2}`;
	}

	if (match.score === 'Forfeit' && (match.player1 === 'TBD' || match.player2 === 'TBD')) {
		return `<span class="text-white">${match.player1}</span> vs <span class="text-white">${match.player2}</span>`;
	}

	if (match.score === 'Forfeit') 
	{
		const winner = match.winner;
		console.log('winner:', winner);
		if (winner === match.player1) {
			return `<span class="text-success fw-bold">${match.player1}</span> vs <span class="text-danger">${match.player2}</span>`;
		} else {
			return `<span class="text-danger">${match.player1}</span> vs <span class="text-success fw-bold">${match.player2}</span>`;
		}
	}

	const [score1, score2] = match.score.split('-').map(Number);
	if (score1 > score2) {
		return `<span class="text-success fw-bold">${match.player1}</span> vs <span class="text-danger">${match.player2}</span>`;
	} else {
		return `<span class="text-danger">${match.player1}</span> vs <span class="text-success fw-bold">${match.player2}</span>`;
	}
}

