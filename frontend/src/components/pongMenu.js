import { createElement } from '/src/utils/mini_react.js';
import { handleRoute } from '/src/index.js';

function joinTournament() {
  document.getElementById('tournamentList').classList.add('d-none');
  document.getElementById('waitingRoom').classList.remove('d-none');
}

function leaveTournament() {
  document.getElementById('waitingRoom').classList.add('d-none');
  document.getElementById('tournamentList').classList.remove('d-none');
}

function startMatchmaking() {
const selection = document.getElementById('matchmakingSelection');
const waitingRoom = document.getElementById('waitingRoomMatchmaking');
if (selection) selection.classList.add('d-none');
if (waitingRoom) waitingRoom.classList.remove('d-none');
}

function cancelMatchmaking() 
{
const selection = document.getElementById('matchmakingSelection');
const waitingRoom = document.getElementById('waitingRoomMatchmaking');
if (waitingRoom) waitingRoom.classList.add('d-none');
if (selection) selection.classList.remove('d-none');
}



function HeaderNav() {
  return createElement(
    'div',
    { className: 'row align-items-center py-3 top-row p-0' },
    createElement('div', { className: 'col text-start' }),
    createElement(
      'div',
      { className: 'col text-center' },
      createElement(
        'ul',
        { className: 'nav nav-pills justify-content-center', id: 'mainTabs', role: 'tablist' },
        createElement(
          'li',
          { className: 'nav-item', role: 'presentation' },
          createElement(
            'button',
            {
              className: 'nav-link active top menu',
              id: 'play-tab',
              'data-bs-toggle': 'pill',
              'data-bs-target': '#playContent',
              type: 'button',
              role: 'tab',
              'aria-controls': 'playContent',
              'aria-selected': 'true'
            },
            'Play'
          )
        ),
        createElement(
          'li',
          { className: 'nav-item', role: 'presentation' },
          createElement(
            'button',
            {
              className: 'nav-link  top',
              id: 'leaderboard-tab',
              'data-bs-toggle': 'pill',
              'data-bs-target': '#leaderboardContent',
              type: 'button',
              role: 'tab',
              'aria-controls': 'leaderboardContent',
              'aria-selected': 'false'
            },
            'Leaderboard'
          )
        )
      )
    ),
    createElement(
      'div',
      { className: 'col text-end' },
      createElement('button', { className: 'btn btn-back mt-0 pt-2 pb-2 ps-3 pe-3', 
        onClick: () => {
		  handleRoute('/');
		  history.pushState(null, "", '/');
        },
       }, 'Back')
    )
  );
}



function SoloContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade show active',
      id: 'soloContent',
      role: 'tabpanel',
      'aria-labelledby': 'solo-tab',
    },
    createElement('h3', {className: 'mt-5'}, 'Select a map'),
    createElement(
      'select',
      { className: 'form-select mb-3', 'aria-label': 'Map selector solo' },
      createElement('option', { value: 'map1' }, 'Map 1'),
      createElement('option', { value: 'map2' }, 'Map 2'),
      createElement('option', { value: 'map3' }, 'Map 3')
    ),
    createElement('h3', {className: 'mt-5'}, 'Difficulty'),
    createElement(
      'select',
      { className: 'form-select mb-3', 'aria-label': 'Difficulty selector' },
      createElement('option', { value: 'easy' }, 'Easy'),
      createElement('option', { value: 'medium' }, 'Medium'),
      createElement('option', { value: 'hard' }, 'Hard')
    ),
    createElement('div', { className: 'd-flex justify-content-center mt-5' },
      createElement('button', { className: 'btn btn-primary mt-3', id: 'launch' }, 'Launch')
    )
  );
}

function LocalContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade',
      id: 'localContent',
      role: 'tabpanel',
      'aria-labelledby': 'local-tab',
    },
    createElement('h3', {className: 'mt-5'}, 'Select a map'),
    createElement(
      'select',
      { className: 'form-select mb-3', 'aria-label': 'Map selector local' },
      createElement('option', { value: 'map1' }, 'Map 1'),
      createElement('option', { value: 'map2' }, 'Map 2'),
      createElement('option', { value: 'map3' }, 'Map 3')
    ),
    createElement('div', { className: 'd-flex justify-content-center mt-5' },
      createElement('button', { className: 'btn btn-primary mt-3' }, 'Launch')
    )
  );
}

function LocalSoloTabs() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade show active',
      id: 'play1',
      role: 'tabpanel',
      'aria-labelledby': 'play1-tab',
    },
    createElement(
      'ul',
      { className: 'nav nav-pills mb-4 mt-5 topcontent', id: 'soloLocalTabs', role: 'tablist' },
      createElement('li', { className: 'nav-item', role: 'presentation' },
        createElement('button', {
          className: 'nav-link active right',
          id: 'solo-tab',
          'data-bs-toggle': 'pill',
          'data-bs-target': '#soloContent',
          type: 'button',
          role: 'tab',
          'aria-controls': 'soloContent',
          'aria-selected': 'true'
        }, 'Solo')
      ),
      createElement('li', { className: 'nav-item', role: 'presentation' },
        createElement('button', {
          className: 'nav-link right pt-2 pb-2 ps-3 pe-3',
          id: 'local-tab',
          'data-bs-toggle': 'pill',
          'data-bs-target': '#localContent',
          type: 'button',
          role: 'tab',
          'aria-controls': 'localContent',
          'aria-selected': 'false'
        }, 'Local')
      )
    ),
    createElement(
      'div',
      { className: ' tab-content mt-0' },
      SoloContent(),
      LocalContent()
    )
  );
}


function MatchmakingContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade show active',
      id: 'matchmakingContent',
      role: 'tabpanel',
      'aria-labelledby': 'matchmaking-tab',
    },
    createElement(
      'div',
      { id: 'matchmakingSelection' },
      createElement('h3', {className: 'mt-5'}, 'Select a map'),
      createElement(
        'select',
        {
          className: 'form-select mb-3',
          'aria-label': 'Map selector solo',
        },
        createElement('option', { value: 'map1' }, 'Map 1'),
        createElement('option', { value: 'map2' }, 'Map 2'),
        createElement('option', { value: 'map3' }, 'Map 3')
      ),
      createElement(
        'div',
        { className: 'd-flex justify-content-center mt-5' },
        createElement(
          'button',
          {
            className: 'btn btn-primary mt-3',
            onClick: () => startMatchmaking(),
          },
          'Launch'
        )
      )
    ),
    createElement(
      'div',
      { id: 'waitingRoomMatchmaking', className: 'd-none matchm' },
      createElement('h4', {className: 'mt-5'}, 'Waiting Room'),
      createElement('p', {}, 'Searching for players...'),
      createElement(
        'button',
        {
          className: 'btn btn-secondary btn-sm',
          onClick: () => cancelMatchmaking(),
        },
        'Cancel'
      )
    )
  );
}

function MpPrivateContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade',
      id: 'mpPrivateContent',
      role: 'tabpanel',
      'aria-labelledby': 'mp-private-tab',
    },
    createElement('h3', {className: 'mt-5'}, 'Select a map'),
    createElement(
      'select',
      { className: 'form-select mb-3', 'aria-label': 'Map selector multiplayer private' },
      createElement('option', { value: 'map1' }, 'Map 1'),
      createElement('option', { value: 'map2' }, 'Map 2'),
      createElement('option', { value: 'map3' }, 'Map 3')
    ),
    createElement('h3', {className: 'mt-5'}, 'Invite Player'),
    createElement('input', { type: 'text', className: 'form-control mb-3', placeholder: 'Player Name or ID' }),
    createElement('div', { className: 'd-flex justify-content-center mt-5' },
      createElement('button', { className: 'btn btn-primary mt-3' }, 'Launch')
    )
  );
}

function MultiplayerTabs() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade',
      id: 'play2',
      role: 'tabpanel',
      'aria-labelledby': 'play2-tab',
    },
    createElement(
      'ul',
      { className: 'nav nav-pills mb-4 mt-5 topcontent', id: 'multiplayerTabs', role: 'tablist' },
      createElement(
        'li',
        { className: 'nav-item', role: 'presentation' },
        createElement(
          'button',
          {
            className: 'nav-link active right',
            id: 'matchmaking-tab',
            'data-bs-toggle': 'pill',
            'data-bs-target': '#matchmakingContent',
            type: 'button',
            role: 'tab',
            'aria-controls': 'matchmakingContent',
            'aria-selected': 'true'
          },
          'Matchmaking'
        )
      ),
      createElement(
        'li',
        { className: 'nav-item', role: 'presentation' },
        createElement(
          'button',
          {
            className: 'nav-link right pt-2 pb-2 ps-3 pe-3',
            id: 'mp-private-tab',
            'data-bs-toggle': 'pill',
            'data-bs-target': '#mpPrivateContent',
            type: 'button',
            role: 'tab',
            'aria-controls': 'mpPrivateContent',
            'aria-selected': 'false'
          },
          'Private'
        )
      )
    ),
    createElement(
      'div',
      { className: ' tab-content m-0' },
      MatchmakingContent(),
      MpPrivateContent()
    )
  );
}


function TournamentJoinContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade show active',
      id: 'tournamentJoinContent',
      role: 'tabpanel',
      'aria-labelledby': 'tournament-join-tab',
    },
    createElement(
      'div',
      { className: 'mt-5', id: 'tournamentList' },
      createElement('h4', {className: 'mt-5'}, 'Available Tournaments'),
      createElement(
        'div',
        { className: 'table-container t' },
        createElement(
          'table',
          { className: 'table' },
          createElement(
            'thead',
            {},
            createElement(
              'tr',
              {},
              createElement('th', { style: 'background: transparent; color: white;' }, 'Name'),
              createElement('th', { style: 'background: transparent; color: white;' }, 'Players'),
              createElement('th', { style: 'background:transparent; color: white;' })
            )
          ),
          createElement(
            'tbody',
            { className: 'tbody' },
            [1,2,3,4,5].map(() =>
              createElement(
                'tr',
                {},
                createElement('td', { style: 'background: transparent; color: white;' }, 'Tournoi A'),
                createElement('td', { style: 'background: transparent; color: white;' }, '5/8'),
                createElement(
                  'td',
                  { style: 'background: transparent; color: white;' },
                  createElement(
                    'button',
                    { className: 'btn btn-primary btn-sm tab', onClick: () => joinTournament() },
                    'Join'
                  )
                )
              )
            )
          )
        )
      ),
    ),
    createElement(
      'div',
      { id: 'waitingRoom', className: 'd-none matchm' },
      createElement('h4', {className: 'mt-5'}, 'Waiting Room'),
      createElement('p', {}, 'Waiting for players to join...'),
      createElement(
        'button',
        { className: 'btn btn-secondary btn-sm', onClick: () => leaveTournament() },
        'Leave'
      )
    )
  );
}

function TournamentCreateContent() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade ctourn',
      id: 'tournamentCreateContent',
      role: 'tabpanel',
      'aria-labelledby': 'tournament-create-tab',
    },
    createElement('h4', {className: 'mt-5'}, 'Create a Tournament'),
    createElement(
      'div',
      { className: 'mb-3 tourn' },
      createElement(
        'label',
        { htmlFor: 'tournamentName', className: 'form-label' },
        'Tournament Name'
      ),
      createElement('input', {
        type: 'text',
        className: 'form-control',
        id: 'tournamentName',
        placeholder: 'Enter tournament name',
      })
    ),
    createElement(
      'div',
      { className: 'mb-3 tourn' },
      createElement(
        'label',
        { htmlFor: 'playerCount', className: 'form-label' },
        'Number of Players'
      ),
      createElement(
        'select',
        { className: 'form-select', id: 'playerCount' },
        createElement('option', { value: '4' }, '4'),
        createElement('option', { value: '8' }, '8'),
        createElement('option', { value: '16' }, '16')
      )
    ),
    createElement('button', { className: 'btn btn-primary' }, 'Create')
  );
}

function TournamentTabs() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade',
      id: 'play3',
      role: 'tabpanel',
      'aria-labelledby': 'play3-tab',
    },
    createElement(
      'ul',
      { className: 'nav nav-pills mb-4 mt-5 topcontent', id: 'tournamentTabs', role: 'tablist' },
      createElement(
        'li',
        { className: 'nav-item', role: 'presentation' },
        createElement(
          'button',
          {
            className: 'nav-link active right',
            id: 'tournament-join-tab',
            'data-bs-toggle': 'pill',
            'data-bs-target': '#tournamentJoinContent',
            type: 'button',
            role: 'tab',
            'aria-controls': 'tournamentJoinContent',
            'aria-selected': 'true'
          },
          'Join'
        )
      ),
      createElement(
        'li',
        { className: 'nav-item', role: 'presentation' },
        createElement(
          'button',
          {
            className: 'nav-link right pt-2 pb-2 ps-3 pe-3',
            id: 'tournament-create-tab',
            'data-bs-toggle': 'pill',
            'data-bs-target': '#tournamentCreateContent',
            type: 'button',
            role: 'tab',
            'aria-controls': 'tournamentCreateContent',
            'aria-selected': 'false'
          },
          'Create'
        )
      )
    ),
    createElement(
      'div',
      { className: ' tab-content tab2 tab3 mt-0' },
      TournamentJoinContent(),
      TournamentCreateContent()
    )
  );
}


function PlayTabs() {
  return createElement(
    'div',
    { className: ' tab-content mt-0' },
    LocalSoloTabs(),
    MultiplayerTabs(),
    TournamentTabs(),
    // Onglet Private (play4) si nécessaire
    createElement(
      'div',
      {
        className: 'tab-pane fade',
        id: 'play4',
        role: 'tabpanel',
        'aria-labelledby': 'play4-tab',
      },
      createElement('h3', {className: 'mt-5'}, 'Private')
    )
  );
}

function PlaySection() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade show active',
      id: 'playContent',
      role: 'tabpanel',
      'aria-labelledby': 'play-tab',
    },
    createElement(
      'div',
      { className: 'row' },
      createElement(
        'div',
        { className: 'col-3 p-0 m-0 ' },
        createElement(
          'div',
          {
            className: 'nav flex-column nav-pills menu',
            id: 'play-vertical-tabs',
            role: 'tablist',
            'aria-orientation': 'vertical'
          },
          createElement(
            'button',
            {
              className: 'nav-link active left',
              id: 'play1-tab',
              'data-bs-toggle': 'pill',
              'data-bs-target': '#play1',
              type: 'button',
              role: 'tab',
              'aria-controls': 'play1',
              'aria-selected': 'true'
            },
            'Local / Solo'
          ),
          createElement(
            'button',
            {
              className: 'nav-link left',
              id: 'play2-tab',
              'data-bs-toggle': 'pill',
              'data-bs-target': '#play2',
              type: 'button',
              role: 'tab',
              'aria-controls': 'play2',
              'aria-selected': 'false'
            },
            'Multiplayer'
          ),
          createElement(
            'button',
            {
              className: 'nav-link left',
              id: 'play3-tab',
              'data-bs-toggle': 'pill',
              'data-bs-target': '#play3',
              type: 'button',
              role: 'tab',
              'aria-controls': 'play3',
              'aria-selected': 'false'
            },
            'Tournament'
          )
        )
      ),
      createElement(
        'div',
        { className: 'col' },
        PlayTabs()
      )
    )
  );
}


function LeaderboardSection() {
  return createElement(
    'div',
    {
      className: 'tab-pane fade',
      id: 'leaderboardContent',
      role: 'tabpanel',
      'aria-labelledby': 'leaderboard-tab'
    },
    createElement(
      'div',
      { className: 'row' },
      createElement('div', { className: 'col-3 p-0 m-0 ' }),
      createElement(
        'div',
        { className: 'col' },
        createElement(
          'div',
          { className: 'leader m-5' },
          createElement('h3', {className: 'mt-5'}, 'Leaderboard'),
          createElement('button', { className: 'btn btn-primary mb-5 leadbtn mt-5' }, 'Find me'),
          createElement(
            'div',
            { className: 'table-container' },
            createElement(
              'table',
              { className: 'table table-striped' },
              createElement(
                'thead',
                {},
                createElement(
                  'tr',
                  {},
                  createElement('th', { style: 'background: transparent; color: white;' }, 'Rank'),
                  createElement('th', { style: 'background: transparent; color: white;' }, 'Player'),
                  createElement('th', { style: 'background: transparent; color: white;' }, 'Score')
                )
              ),
              createElement(
                'tbody',
                {},
                Array.from({length:20}, () =>
                  createElement(
                    'tr',
                    {},
                    createElement('td', { style:'background: transparent; color: white;'}, '1'),
                    createElement('td', { style:'background: transparent; color: white;'}, 'PlayerOne'),
                    createElement('td', { style:'background:transparent; color: white;'}, '2500')
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}


export function PongMenu() {
  return createElement(
    'div',
    { className: 'container-fluid menu1', id : 'menu2' },
    HeaderNav(),
    createElement(
      'div',
      { className: 'row  tab-content', id: 'mainTabsContent' },
      PlaySection(),
      LeaderboardSection()
    )
  );
}
