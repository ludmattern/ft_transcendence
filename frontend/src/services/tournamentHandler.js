import { ws } from '/src/services/socketManager.js';



function parseGameId(gameId) {
	const regex = /^tournLocal_(.+)_vs_tournLocal_(.+)_id_(.+)$/;
	const match = gameId.match(regex);
	if (match) {
		const player1 = match[1];
		const player2 = match[2];
		const tournamentId = match[3];
		return { player1, player2, tournamentId };
	} else {
		throw new Error('Invalid gameId format');
	}
}

export function handleLocalTournamentGameEnding(data) {
	try {
		const { player1, player2, tournamentId } = parseGameId(data.game_id);
		const payload = {
			game_id: data.game_id,
			tournament_id: tournamentId,
			winner_id: data.winner_id,
			loser_id: data.loser_id,
			final_scores: data.final_scores,
			type: 'game_over',
			player1: player1,
			player2: player2,
		};

		fetch('/api/tournament-service/update_match_result/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((result) => {
				console.log('Match result updated:', result);
			})
			.catch((err) => {
				console.error('Error updating match result:', err);
			});
	} catch (error) {
		console.error('Error parsing gameId:', error);
	}
}


export function createTournament(players) {
	const organizerId = sessionStorage.getItem('userId');
	const payload = {
		type: 'tournament',
		action: 'create_local_tournament',
		organizer_id: organizerId,
		players: players,
	};

	ws.send(JSON.stringify(payload));
}
