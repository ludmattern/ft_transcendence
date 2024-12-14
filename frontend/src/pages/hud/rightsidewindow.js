import { loadTabContent } from '/src/components/rightSideWindow.js';
import { addPanelItem } from '/src/components/rightSideWindow.js';

console.debug('Initializing the HUD and tab navigation for the side window');

// 1. Expander logic for the side window
const expanders = document.querySelectorAll('.right-side-window-expander');
const rightSideWindow = document.querySelector('.r-tab-content');

expanders.forEach((expander) => {
  expander.addEventListener('click', function () {
    this.classList.toggle('active');
    rightSideWindow.classList.toggle('well-hidden');
  });
});

// 2. Function to check overflow in right side window
function checkOverflow() {
  if (rightSideWindow.scrollHeight > rightSideWindow.clientHeight) {
    rightSideWindow.classList.add('overflow');
  } else {
    rightSideWindow.classList.remove('overflow');
  }
}

checkOverflow();

// 3. Observe changes in the right side window for overflow updates
const observer = new MutationObserver(() => {
  checkOverflow();
});

observer.observe(rightSideWindow, {
  childList: true,
  subtree: true,
  characterData: true,
});

// 4. Tab navigation logic
const tabLinks = document.querySelectorAll('.r-side-window .nav-link a');
const tabContentContainer = document.getElementById('r-tab-content');

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
    loadTabContent(tabName, tabContentContainer);
  });
});

// Load the initial tab (INFO) on page load
loadTabContent('info', tabContentContainer);

document
  .getElementById('r-add-notification-button')
  .addEventListener('click', () => {
    const container = document.getElementById('r-tab-content');
    addPanelItem(container, 'NEW_INVITER_NAME', true);
  });
