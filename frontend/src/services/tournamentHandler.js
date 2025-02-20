import { ws } from "/src/services/socketManager.js";


export function createTournament(players)
{
    const organizerId = sessionStorage.getItem("userId");
    const payload = {
        type: "tournament",
        action: "create_local_tournament",
        organizer_id: organizerId,
        players: players
      };
    
      ws.send(JSON.stringify(payload));
}

