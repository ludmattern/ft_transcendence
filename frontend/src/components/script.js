

// Navigation entre les menus
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
    // Cacher tous les menus
    document.querySelectorAll('.menu-section, #invite-section').forEach(menu => {
        menu.classList.add('hidden');
    });

    // Afficher le menu sélectionné
    const targetMenu = document.getElementById(menuId);
    if (targetMenu) {
        targetMenu.classList.remove('hidden');
        currentMenu = menuId;
    }

    // Gérer le bouton retour
    const backButton = document.getElementById('back-button');
    if (menuId !== 'main-menu') {
        backButton.classList.remove('hidden');
    } else {
        backButton.classList.add('hidden');
    }

    // Si on ouvre un sous-menu, s'assurer que son parent est visible
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

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    showMenu('main-menu');
});

document.querySelectorAll('.space-select').forEach((select) => {
    select.style.fontSize = '0.3rem';
});
