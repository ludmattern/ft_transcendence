import { createElement } from '../utils/mini_react.js';

export function Header() {
  console.debug('creating Header component');
  return createElement(
    'header',
    { className: 'hud-header' },
    createElement(
      'div',
      { className: 'row' },
      createElement(
        'div',
        { className: 'col-12 text-center' },
        createElement(
          'h1',
          { className: 'hud-title interactive' },
          createElement('a', { id: 'home-link', href: '#' }, 'ft_transcendence')
        )
      )
    ),
    createElement(
      'div',
      { className: 'row' },
      createElement(
        'nav',
        { className: 'col-12 d-flex justify-content-center' },
        createElement(
          'ul',
          { className: 'nav' },
          // Menu gauche
          createElement(
            'span',
            { className: 'left-menu' },
            createNavItem('profile'),
            createNavItem('social')
          ),
          // Jeux (Menu central)
          createElement(
            'li',
            { className: 'nav-item first-game' },
            createElement(
              'span',
              { className: 'nav-link text-white' },
              createElement('a', { href: '#' }, 'pong')
            )
          ),
          createElement(
            'li',
            { className: 'nav-item second-game' },
            createElement(
              'span',
              { className: 'nav-link text-white' },
              createElement('a', { href: '#' }, 'race')
            )
          ),
          // Menu droit
          createElement(
            'span',
            { className: 'right-menu' },
            createNavItem('settings', 'settings-link'),
            createNavItem('logout', 'logout-link')
          )
        )
      )
    )
  );
}

/**
 * Crée un élément de navigation (<li>) avec un lien (<a>)
 *
 * @param {string} text - Le texte du lien
 * @param {string} [id] - L'ID à attribuer à l'élément <a> (facultatif)
 * @returns {HTMLElement} - L'élément <li> créé
 */
function createNavItem(text, id = '') {
  return createElement(
    'li',
    { className: 'nav-item' },
    createElement(
      'span',
      { className: 'nav-link text-white' },
      createElement('a', { href: '#', id }, text)
    )
  );
}

/**
 * Crée un lien de navigation (<span> contenant un <a>)
 *
 * @param {string} text - Le texte du lien
 * @returns {HTMLElement} - L'élément <span> créé
 */
function createNavLink(text) {
  return createElement(
    'span',
    { className: 'nav-link text-white' },
    createElement('a', { href: '#' }, text)
  );
}
