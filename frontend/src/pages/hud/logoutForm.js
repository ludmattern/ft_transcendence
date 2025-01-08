import { loadComponent } from '/src/utils/dom_utils.js';

document.querySelector('#central-window').addEventListener('click', (e) => {
    if (e.target.matches('#enlist-link')) {
        e.preventDefault();
        loadComponent('#central-window', SubscribeForm, 'subscribeForm', () => {
            console.info('SubscribeForm loaded on click.');
        });
    }
});
