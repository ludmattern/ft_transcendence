import { loadComponent } from '/src/utils/dom_utils.js';
import { OtherProfileForm } from '/src/components/otherProfileForm.js';

document.querySelector('#central-window').addEventListener('click', (e) => {
    if (e.target.matches('#other-profile-link')) {
        e.preventDefault();
        loadComponent('#central-window', OtherProfileForm, '', () => {
            console.info('OtherProfileForm loaded on click.');
        });
    }
});