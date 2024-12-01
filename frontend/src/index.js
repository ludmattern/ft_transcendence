// index.js
import { Header } from './components/header.js';
import { loadComponent } from './utils/dom_utils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.debug('Injecting header component and loading associated script');
  
  loadComponent('header-placeholder', Header, 'hud', () => {
    console.log('HUD and Header components are fully loaded and initialized');
  });
});
