import { createElement } from './utils/mini_react.js';
import { render } from './utils/mini_react.js';
import { Header } from './components/header.js';
import { replacePlaceholder } from './utils/dom_utils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.debug('replacing header-placeholder with Header component');
  replacePlaceholder('header-placeholder', Header, () => {
    console.debug('Header component has been rendered');
    import('../src/pages/hud/hud.js').then((module) => {
      console.log('hud.js loaded');
    }).catch((error) => {
      console.error('Error loading hud.js:', error);
    });
  });
});
