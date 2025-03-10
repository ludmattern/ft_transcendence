import { createComponent } from '/src/utils/component.js';
import { initWireframeScene } from '/src/3d/wireframeScene.js';
import { startAnimation } from '/src/components/hud/index.js';
import { toggleFreeView } from '/src/3d/freeViewHandler.js';
import { subscribe } from '/src/services/eventEmitter.js';

function createNavItem(label, value, active = false) {
	return `
    <li class="nav-item" data-tab="${value}">
      <span class="nav-link ${active ? 'active' : ''}">
        <a href="#" data-tab="${label.toLowerCase()}">${label}</a>
      </span>
    </li>
  `;
}

export const rightSideWindow = createComponent({
	tag: 'rightSideWindow',
	render: () => `
    <div class="d-flex flex-column">
      <div class="r-side-window right-side-window">
        <ul class="nav nav-tabs">
          ${createNavItem('OVERVIEW', 1, true)}
          <li class="nav-item">
            <span class="nav-link" id="free-view">
              <a href="#">freeview</a>
            </span>
          </li>
          <li class="nav-item">
            <div class="container">
              <div class="right-side-window-expander active" id="r-sw-expander">
                <span class="r-line"></span>
                <span class="r-line"></span>
                <span class="r-line"></span>
              </div>
            </div>
          </li>
        </ul>
        <div class="r-tab-content" id="r-tab-content">
          <div class="wireframe" id="wireframe"></div>
        </div>
      </div>
    </div>
  `,
	attachEvents: (el) => {
		el.querySelector('#free-view').addEventListener('click', toggleFreeView);
		const expanders = el.querySelectorAll('.right-side-window-expander');
		const rightSideWindow = el.querySelector('.r-tab-content');

		expanders.forEach((expander) => {
			expander.addEventListener('click', function () {
				this.classList.toggle('active');
				rightSideWindow.classList.toggle('well-hidden');
			});
		});

		const wireframeDiv = el.querySelector('#wireframe');
		if (wireframeDiv) {
			initWireframeScene();
		} else {
			console.warn('Wireframe container not found in DOM.');
		}

		const tabLinks = el.querySelectorAll('.r-side-window .nav-link a');
		tabLinks.forEach((link) => {
			link.addEventListener('click', (event) => {
				event.preventDefault();
				const tabName = link.getAttribute('data-tab');
				tabLinks.forEach((tabLink) => {
					tabLink.parentElement.classList.remove('active');
				});
				link.parentElement.classList.add('active');
				if (tabName === 'overview') {
					// Logique pour gérer le changement d'onglet overview
				}
			});
		});

		subscribe('freeViewDisabled', () => {
			const overviewLink = el.querySelector('a[data-tab="overview"]');
			if (overviewLink) {
				overviewLink.click();
			}
		});

		const parentContainer = el.parentElement;
		startAnimation(parentContainer, 'light-animation', 1000);
	},
});
