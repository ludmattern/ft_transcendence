import { switchwindow } from '/src/App.js';
import { loadComponent } from '/src/utils/dom_utils.js';
import { LoginForm } from '/src/components/loginForm.js';
import { ProfileForm } from '/src/components/profileForm.js';
import { SocialForm } from '/src/components/socialForm.js';
import { SettingsForm } from '/src/components/settingsForm.js';
import { LogoutForm } from '/src/components/logoutForm.js';
import { isClientAuthenticated } from '/src/services/auth.js';
import { Header } from '/src/components/header.js';
import { LeftSideWindow } from '/src/components/leftSideWindow.js';
import { RightSideWindow } from '/src/components/rightSideWindow.js';
import { PongMenu } from '/src/components/pongMenu.js';
import { midScreen } from '/src/components/midScreen.js';
import { HelmetSVG } from '/src/components/HelmetSVG.js';
import { HUDSVG } from '/src/components/HUDSVG.js';
import { game2 } from '/src/components/game2.js';

async function initializeApp() {
    loadSVGComponents();

    const isAuthenticated = await isClientAuthenticated();

    if (!isAuthenticated) {
        loadComponent('#central-window', LoginForm, 'loginForm', () => {
            console.debug('LoginForm loaded as user is not authenticated.');
        });
        return;
    }
	
	document.getElementById('waiting-screen-effect').classList.add('d-none');
	document.getElementById('blur-screen-effect').classList.add('d-none');
    loadAuthenticatedComponents();

    setupEventListeners();
}

function loadSVGComponents() {
    document.addEventListener('DOMContentLoaded', () => {
        loadComponent('helmet-svg-placeholder', HelmetSVG, '', () => {});
        loadComponent('hud-svg-placeholder', HUDSVG, '', () => {});
    });
}

function loadAuthenticatedComponents() {
    loadComponent('header-placeholder', Header, '', () => {});
    loadComponent('left-window-placeholder', LeftSideWindow, 'leftsidewindow', () => {});
    loadComponent('right-window-placeholder', RightSideWindow, 'rightsidewindow', () => {});
    loadComponent('race-placeholder', game2, '', () => {});
    loadComponent('mid-placeholder', midScreen, '', () => {});
    loadComponent('pongmenu-placeholder', PongMenu, 'pongmenu', () => {});
}

function setActiveLink(linkId) {
    document.querySelectorAll('header a').forEach(link => {
        link.classList.remove('active');
    });

	if (!linkId) {
		return;
	}

    const activeLink = document.getElementById(linkId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function setupEventListeners() {
    document.getElementById('profile-link').addEventListener('click', function (e) {
        e.preventDefault();
        loadComponent('#central-window', ProfileForm, '', () => {
            console.debug('ProfileForm loaded on click.');
        });
		document.getElementById('blur-screen-effect').classList.remove('d-none');
		setActiveLink('profile-link');
		history.pushState(null, '', '/profile');
    });

    document.getElementById('pong-link').addEventListener('click', function (e) {
        e.preventDefault();
        switchwindow('pong');
        loadComponent('#central-window', null, '', () => {});
		document.getElementById('blur-screen-effect').classList.add('d-none');
		setActiveLink('pong-link');
		history.pushState(null, '', '/pong');
    });

    document.getElementById('race-link').addEventListener('click', function (e) {
        e.preventDefault();
        switchwindow('race');
        loadComponent('#central-window', null, '', () => {});
		document.getElementById('blur-screen-effect').classList.add('d-none');
		setActiveLink('race-link');
		history.pushState(null, '', '/race');
    });

    document.getElementById('social-link').addEventListener('click', function (e) {
        e.preventDefault();
        loadComponent('#central-window', SocialForm, 'socialForm', () => {
            console.debug('SocialForm loaded on click.');
        });
		document.getElementById('blur-screen-effect').classList.remove('d-none');
		setActiveLink('social-link');
		history.pushState(null, '', '/social');
    });

    document
        .getElementById('settings-link').addEventListener('click', function (e) {
            e.preventDefault();
            loadComponent('#central-window', SettingsForm, 'settingsForm', () => {
                console.debug('SettingsForm loaded on click.');
            });
			document.getElementById('blur-screen-effect').classList.remove('d-none');
			setActiveLink('settings-link');
			history.pushState(null, '', '/settings');
        });

    document.getElementById('logout-link').addEventListener('click', function (e) {
        e.preventDefault();
        loadComponent('#central-window', LogoutForm, '', () => {
            console.debug('LogoutForm loaded on click.');
        });
		document.getElementById('blur-screen-effect').classList.remove('d-none');
		setActiveLink('logout-link');
		history.pushState(null, '', '/logout');
    });

	document.getElementById('home-link').addEventListener('click', function (e) {
		e.preventDefault();
		switchwindow(null);
		loadComponent('#central-window', null, '', () => {});
		document.getElementById('blur-screen-effect').classList.add('d-none');
		setActiveLink(null);
		history.pushState(null, '', '/');
	});
}


window.addEventListener('popstate', (event) => {
	const path = window.location.pathname; // Obtenir la route actuelle
    console.debug(`popstate triggered, route: ${path}`);
	
    // Gérer les différentes routes
    switch (path) {
        case '/':
            switchwindow(null);
            loadComponent('#central-window', null, '', () => {});
            document.getElementById('blur-screen-effect').classList.add('d-none');
            setActiveLink(null);
            break;
			case '/profile':
				loadComponent('#central-window', ProfileForm, '', () => {
					console.debug('ProfileForm loaded via popstate.');
				});
				document.getElementById('blur-screen-effect').classList.remove('d-none');
				setActiveLink('profile-link');
				break;
				case '/pong':
					switchwindow('pong');
					loadComponent('#central-window', null, '', () => {});
            document.getElementById('blur-screen-effect').classList.add('d-none');
            setActiveLink('pong-link');
            break;
			case '/race':
				switchwindow('race');
				loadComponent('#central-window', null, '', () => {});
				document.getElementById('blur-screen-effect').classList.add('d-none');
				setActiveLink('race-link');
				break;
				case '/social':
					loadComponent('#central-window', SocialForm, 'socialForm', () => {
						console.debug('SocialForm loaded via popstate.');
					});
					document.getElementById('blur-screen-effect').classList.remove('d-none');
					setActiveLink('social-link');
					break;
					case '/settings':
						loadComponent('#central-window', SettingsForm, 'settingsForm', () => {
							console.debug('SettingsForm loaded via popstate.');
						});
            document.getElementById('blur-screen-effect').classList.remove('d-none');
            setActiveLink('settings-link');
            break;
			case '/logout':
				loadComponent('#central-window', LogoutForm, '', () => {
					console.debug('LogoutForm loaded via popstate.');
				});
				document.getElementById('blur-screen-effect').classList.remove('d-none');
            setActiveLink('logout-link');
            break;
			default:
            console.warn(`Unknown route: ${path}`);
            break;
		}
	});

	initializeApp();