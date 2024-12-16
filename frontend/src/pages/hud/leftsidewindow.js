import { loadTabContent } from '/src/components/leftSideWindow.js';

console.debug('Initializing the HUD and tab navigation for the side window');

// 1. Expander logic for the side window
const expanders = document.querySelectorAll('.left-side-window-expander');
const leftSideWindow = document.querySelector('.l-tab-content');

expanders.forEach((expander) => {
  expander.addEventListener('click', function () {
    this.classList.toggle('active');
    // Toggle the visibility of the left-side window content
    leftSideWindow.classList.toggle('well-hidden');
  });
});

// 4. Tab navigation logic
const tabLinks = document.querySelectorAll('.l-side-window .nav-link a');
const tabContentContainer = document.getElementById('l-tab-content');
const window = document.getElementById('l-tab-content-container');

tabLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    const tabName = link.getAttribute('data-tab');

    // Set the clicked tab as active
    tabLinks.forEach((tabLink) => {
      tabLink.parentElement.classList.remove('active');
    });
    link.parentElement.classList.add('active');

    // Load the corresponding tab content
    loadTabContent(tabName, tabContentContainer, window);
  });
});

// Load the initial tab (INFO) on page load
loadTabContent('info', tabContentContainer, window);
