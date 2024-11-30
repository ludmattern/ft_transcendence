
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

document.addEventListener('DOMContentLoaded', () => {
    showMenu('main-menu');
});
