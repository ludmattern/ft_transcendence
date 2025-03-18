// src/components/hud/leftSideWindow.js
import { createComponent } from '/src/utils/component.js';
import { loadTabContent } from '/src/components/hud/sideWindow/left/tabContent.js';
import { createNotificationMessage, removePrivateNotifications } from '/src/components/hud/sideWindow/left/notifications.js';
import { createNavItem } from '/src/components/hud/sideWindow/left/navigation.js';
import { subscribe } from '/src/services/eventEmitter.js';
import { getInfo } from '/src/services/infoStorage.js';
import { startAnimation } from '/src/components/hud/utils/utils.js';
import { infoPanelItem } from '/src/components/hud/sideWindow/left/infoPanelItem.js';

export const leftSideWindow = createComponent({
	tag: 'leftSideWindow',

	render: () => `
	<div class="d-flex flex-column">
		<div class="l-side-window left-side-window" id="l-tab-content-container">
			<ul class="nav nav-tabs">
				${createNavItem('INFO', true)}
				${createNavItem('COMM', false)}
				<li class="nav-item">
					<div class="container">
						<div class="left-side-window-expander active" id="l-sw-expander">
							<span class="l-line"></span>
							<span class="l-line"></span>
							<span class="l-line"></span>
						</div>
					</div>
				</li>
			</ul>
			<div class="l-tab-content" id="l-tab-content"></div>
		</div>
	</div>
	<div class="d-flex flex-column">
		<div id="bottom-notification-container">
		</div>
	</div>
`,

	attachEvents: async (el) => {
		const tabContentContainer = el.querySelector('#l-tab-content');
		const tabs = el.querySelectorAll('.nav-link');
		const expanders = el.querySelectorAll('.left-side-window-expander');
		const leftSideWindow = el.querySelector('.l-tab-content');

		if (!expanders.length || !leftSideWindow) {
			return;
		}

		expanders.forEach((expander) => {
			expander.addEventListener('click', () => {
				expander.classList.toggle('active');
				leftSideWindow.classList.toggle('well-hidden');
			});
		});

		tabs.forEach((tab) =>
			tab.addEventListener('click', (e) => {
				e.preventDefault();
				const tabName = tab.dataset.tab;

				if (tabName === 'comm') {
					removePrivateNotifications();
				}

				tabs.forEach((t) => t.classList.remove('active'));
				tab.classList.add('active');

				loadTabContent(tabName, tabContentContainer);
			})
		);

		const activeTab = el.querySelector('.nav-link.active');
		if (activeTab) {
			loadTabContent(activeTab.dataset.tab, tabContentContainer);
		}

		const parentContainer = el.parentElement;
		startAnimation(parentContainer, 'light-animation', 1000);

		const usernameData = await getInfo('username');
		createNotificationMessage(`Welcome to your spaceship ${usernameData.success ? usernameData.value : 'Guest'} !`, 15000);

		subscribe('updatenotifications', (data) => {
			const activeTab = el.querySelector('.nav-link.active');
			if (activeTab && activeTab.dataset.tab === 'info') {
				updateNotifications(data.toAdd, data.toRemove, tabContentContainer);
			}
		});
	},
});

function updateNotifications(messagesToAdd, messagesToRemove, container) {
	messagesToRemove.forEach((msg) => {
		const notificationId = `${msg.type}-${msg.inviter_id}`;
		const existingNotification = container.querySelector(`[data-notification-id="${notificationId}"]`);
		if (existingNotification) {
			existingNotification.remove();
		}
	});

	messagesToAdd.forEach((msg) => {
		const notificationId = `${msg.type}-${msg.inviter_id}`;
		const notificationWrapper = document.createElement('div');

		notificationWrapper.innerHTML = infoPanelItem.render(msg);

		const renderedElement = notificationWrapper.firstElementChild;
		renderedElement.setAttribute('data-notification-id', notificationId);

		infoPanelItem.attachEvents(renderedElement, msg);

		container.appendChild(renderedElement);
	});
}
