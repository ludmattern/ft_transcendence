// src/components/hud/leftSideWindow.js

import { createComponent } from "/src/utils/component.js";
import { startAnimation } from "/src/components/hud/index.js";
import { loadTabContent } from "/src/components/hud/sideWindow/left/tabContent.js";
import { createNotificationMessage, removePrivateNotifications } from "/src/components/hud/sideWindow/left/notifications.js";
import { createNavItem } from "/src/components/hud/sideWindow/left/navigation.js";

export const leftSideWindow = createComponent({
  tag: "leftSideWindow",

  render: () => `
	<div class="d-flex flex-column">
		<div class="l-side-window left-side-window" id="l-tab-content-container">
			<ul class="nav nav-tabs">
				${createNavItem("INFO", true)}
				${createNavItem("COMM", false)}
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

  attachEvents: (el) => {
    const tabContentContainer = el.querySelector("#l-tab-content");
    const tabs = el.querySelectorAll(".nav-link");
    const expanders = el.querySelectorAll(".left-side-window-expander");
    const leftSideWindow = el.querySelector(".l-tab-content");

    if (!expanders.length || !leftSideWindow) {
      console.warn("Expanders or left-side window not found in component.");
      return;
    }

    expanders.forEach((expander) => {
      expander.addEventListener("click", () => {
        expander.classList.toggle("active");
        leftSideWindow.classList.toggle("well-hidden");
      });
    });

    tabs.forEach((tab) =>
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;

        if (tabName === "comm") {
          removePrivateNotifications();
        }

        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        loadTabContent(tabName, tabContentContainer);
      })
    );

    const activeTab = el.querySelector(".nav-link.active");
    if (activeTab) {
      loadTabContent(activeTab.dataset.tab, tabContentContainer);
    }

    const parentContainer = el.parentElement;
    startAnimation(parentContainer, "light-animation", 1000);

    createNotificationMessage(
      `Welcome to your spaceship ${sessionStorage.getItem("username")} !`,
      15000
    );
  },
});
