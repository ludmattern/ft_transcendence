import { createElement } from "../utils/mini_react.js";

const menuStructure = {
    'main-menu': null,
    'play-menu': 'main-menu',
    'solo-menu': 'play-menu',
    'multiplayer-menu': 'play-menu',
    'tournament-menu': 'play-menu',
    'local-menu': 'multiplayer-menu',
    'private-menu': 'multiplayer-menu',
    'matchmaking-menu': 'multiplayer-menu',
    'invite-section': 'private-menu',
    'create-tournament': 'tournament-menu',
    'join-tournament': 'tournament-menu',
    'menu-new-tournament': 'tournament-menu'
};

let currentMenu = 'main-menu';

 function showMenu(menuId) {
    document.querySelectorAll('.menu-section, #invite-section').forEach(menu => {
        menu.classList.add('hidden');
    });

    const targetMenu = document.getElementById(menuId);
    if (targetMenu) {
        targetMenu.classList.remove('hidden');
        currentMenu = menuId;
    }

    const backButton = document.getElementById('back-button');
    if (menuId !== 'main-menu') {
        backButton.classList.remove('hidden');
    } else {
        backButton.classList.add('hidden');
    }

    if (menuId === 'invite-section') {
        document.getElementById('private-menu').classList.remove('hidden');
    }
}

 function goBack() {
    const parentMenu = menuStructure[currentMenu];
    if (parentMenu) {
        showMenu(parentMenu);
    }
}




// Back Button Component
function BackButton() {
    return createElement(
      'button',
      {
        className: 'back-btn w-100 back',
        onClick: () => {
          goBack();
          const event = new CustomEvent('backButtonClicked');
          document.dispatchEvent(event);
        },
      },
      createElement('i', { className: 'bi bi-arrow-left' }),
      ' Back'
    );
  }

// Menu Title Component
function MenuTitle(title) {
  return createElement('h1', { className: 'menu-title' }, title);
}

// Button Component
function MenuButton({ iconClass, text, onClick }) {
  return createElement(
    'button',
    { className: 'space-btn w-100', onClick },
    createElement('i', { className: iconClass }),
    ` ${text}`
  );
}

// Option Select Component
function OptionSelect({ labelText, options }) {
  return createElement(
    'div',
    { className: 'mb-4' },
    createElement('label', { className: 'form-label text-cyan' }, labelText),
    createElement(
      'select',
      { className: 'space-select form-select' },
      ...options.map((option) => createElement('option', {}, option))
    )
  );
}

// Main Menu Component
function MainMenu() {
  return createElement(
    'div',
    { id: 'main-menu', className: 'menu-section' },
    createElement(
      'div',
      { className: 'row g-4' },
      createElement(
        'div',
        { className: 'col-6' },
        MenuButton({
          iconClass: 'bi bi-controller',
          text: 'Play',
          onClick: () => showMenu('play-menu'),
        })
      ),
      createElement(
        'div',
        { className: 'col-6' },
        MenuButton({
          iconClass: 'bi bi-trophy',
          text: 'Leaderboard',
          onClick: () => showMenu('leaderboard-menu'),
        })
      )
    ),
    createElement(
      'div',
      { className: 'row mt-3' },
      createElement('div', { className: 'col-12' }, BackButton())
    )
  );
}

// Play Menu Component
function PlayMenu() {
  return createElement(
    'div',
    { id: 'play-menu', className: 'menu-section hidden' },
    createElement(
      'div',
      { className: 'row g-4' },
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-person',
          text: 'Solo',
          onClick: () => showMenu('solo-menu'),
        })
      ),
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-people',
          text: 'Multiplayer',
          onClick: () => showMenu('multiplayer-menu'),
        })
      ),
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-award',
          text: 'Tournament',
          onClick: () => showMenu('tournament-menu'),
        })
      )
    ),
    createElement(
      'div',
      { id: 'back-button', className: 'mt-4' },
      createElement(
        'button',
        { className: 'back-btn', onClick: () => goBack() },
        createElement('i', { className: 'bi bi-arrow-left' }),
        ' Back'
      )
    )
  );
}

// Tournament Menu Component
function TournamentMenu() {
  return createElement(
    'div',
    { id: 'tournament-menu', className: 'menu-section hidden' },
    createElement(
      'div',
      { className: 'tournament-list mb-4' },
      createElement('h3', { className: 'text-cyan mb-4' }, 'Current Tournament'),
      createElement(
        'div',
        { className: 'tournament-item' },
        createElement('span', {}, 'Galactique Championship'),
        createElement('span', { className: 'player-count' }, '8/16 Players')
      ),
      createElement(
        'div',
        { className: 'tournament-item' },
        createElement('span', {}, 'Ligue Spatiale S1'),
        createElement('span', { className: 'player-count' }, '4/8 Players')
      )
    ),
    createElement(
      'div',
      { className: 'row g-4' },
      createElement(
        'div',
        { className: 'col-6' },
        MenuButton({
          iconClass: 'bi bi-plus-lg',
          text: 'Créer',
          onClick: () => showMenu('create-tournament'),
        })
      ),
      createElement(
        'div',
        { className: 'col-6' },
        MenuButton({
          iconClass: 'bi bi-person-plus',
          text: 'Rejoindre',
          onClick: () => showMenu('join-tournament'),
        })
      )
    ),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Create Tournament Menu Component
function CreateTournamentMenu() {
  return createElement(
    'div',
    { id: 'create-tournament', className: 'menu-section hidden' },
    createElement(
      'div',
      { className: 'mb-4' },
      createElement('label', { className: 'form-label text-cyan' }, 'Tournament name'),
      createElement('input', {
        type: 'text',
        className: 'space-input form-control',
        placeholder: 'Enter tournament name',
      })
    ),
    createElement(
      'div',
      { className: 'mb-4' },
      createElement('label', { className: 'form-label text-cyan' }, 'Player count'),
      createElement(
        'select',
        { className: 'space-select form-select' },
        createElement('option', {}, '4'),
        createElement('option', {}, '8'),
        createElement('option', {}, '16')
      )
    ),
    createElement('button', { className: 'space-btn w-100' }, 'Create Tournament'),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Join Tournament Menu Component
function JoinTournamentMenu() {
  return createElement(
    'div',
    { id: 'join-tournament', className: 'menu-section hidden' },
    createElement(
      'div',
      { className: 'tournament-list' },
      createElement(
        'div',
        { className: 'tournament-item' },
        createElement(
          'div',
          {},
          createElement('span', { className: 'tournament-name' }, 'Interstellar'),
          createElement('span', { className: 'tournament-details' }, '16 Players')
        ),
        createElement('button', { className: 'space-btn-small' }, 'Join')
      ),
      createElement(
        'div',
        { className: 'tournament-item' },
        createElement(
          'div',
          {},
          createElement('span', { className: 'tournament-name' }, 'StarsCraft'),
          createElement('span', { className: 'tournament-details' }, '8 players')
        ),
        createElement('button', { className: 'space-btn-small' }, 'Join')
      )
    ),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Solo Menu Component
function SoloMenu() {
  return createElement(
    'div',
    { id: 'solo-menu', className: 'menu-section hidden' },
    OptionSelect({ labelText: 'Select a map', options: ['Mars', 'Pluton', 'Orgasme'] }),
    OptionSelect({ labelText: 'Difficulty', options: ['Easy', 'Medium', 'Hard'] }),
    createElement(
      'button',
      { className: 'space-btn w-100' },
      createElement('i', { className: 'bi bi-rocket' }),
      ' Launch'
    ),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Multiplayer Menu Component
function MultiplayerMenu() {
  return createElement(
    'div',
    { id: 'multiplayer-menu', className: 'menu-section hidden' },
    createElement(
      'div',
      { className: 'row g-4 mb-4' },
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-people',
          text: 'Local',
          onClick: () => showMenu('local-menu'),
        })
      ),
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-shield',
          text: 'Private',
          onClick: () => showMenu('private-menu'),
        })
      ),
      createElement(
        'div',
        { className: 'col-4' },
        MenuButton({
          iconClass: 'bi bi-broadcast',
          text: 'Matchmaking',
          onClick: () => showMenu('matchmaking-menu'),
        })
      )
    ),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Local Menu Component
function LocalMenu() {
  return createElement(
    'div',
    { id: 'local-menu', className: 'menu-section hidden' },
    OptionSelect({ labelText: 'Gamemode', options: ['1 vs 1', '2 vs 2'] }),
    OptionSelect({ labelText: 'Map', options: ['Mars', 'Pluton', 'Orgasme'] }),
    createElement('button', { className: 'space-btn w-100' }, 'Launch'),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Private Menu Component
function PrivateMenu() {
  return createElement(
    'div',
    { id: 'private-menu', className: 'menu-section hidden' },
    OptionSelect({ labelText: 'Gamemode', options: ['1 vs 1', '2 vs 2'] }),
    OptionSelect({ labelText: 'Map', options: ['Mars', 'Pluton', 'Orgasme'] }),
    createElement(
      'button',
      {
        className: 'space-btn mb-4',
        onClick: () => showMenu('invite-section'),
      },
      createElement('i', { className: 'bi bi-person-plus' }),
      ' Invite players'
    ),
    createElement(
      'div',
      { id: 'invite-section', className: 'hidden' },
      createElement(
        'div',
        { className: 'space-input-group mb-4' },
        createElement('label', { className: 'form-label text-cyan' }, 'Find a players'),
        createElement('input', {
          type: 'text',
          className: 'space-input form-control',
          placeholder: 'Player name',
        })
      ),
      createElement('button', { className: 'space-btn w-100' }, 'Send invite')
    ),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Matchmaking Menu Component
function MatchmakingMenu() {
  return createElement(
    'div',
    { id: 'matchmaking-menu', className: 'menu-section hidden' },
    OptionSelect({ labelText: 'Gamemode', options: ['1 vs 1', '2 vs 2'] }),
    createElement('button', { className: 'space-btn w-100' }, 'Find a game'),
    createElement(
        'div',
        { id: 'back-button', className: 'mt-4' },
        createElement(
          'button',
          { className: 'back-btn', onClick: () => goBack() },
          createElement('i', { className: 'bi bi-arrow-left' }),
          ' Back'
        )
      )
  );
}

// Pong Menu Component (Main Component)
export function PongMenu() {
  return createElement(
    'div',
    { className: 'menu-container', id: 'menu2' },
    createElement(
      'div',
      { className: 'menu-panel' },
      MenuTitle('Space Pong'),
      MainMenu(),
      PlayMenu(),
      TournamentMenu(),
      CreateTournamentMenu(),
      JoinTournamentMenu(),
      SoloMenu(),
      MultiplayerMenu(),
      LocalMenu(),
      PrivateMenu(),
      MatchmakingMenu()
    )
  );
}
