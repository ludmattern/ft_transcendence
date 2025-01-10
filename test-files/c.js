function joinTournament() {
    document.getElementById('tournamentList').classList.add('d-none');
    document.getElementById('waitingRoom').classList.remove('d-none');
  }

  function leaveTournament() {
    document.getElementById('waitingRoom').classList.add('d-none');
    document.getElementById('tournamentList').classList.remove('d-none');
  }