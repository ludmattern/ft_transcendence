

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

  });
});
