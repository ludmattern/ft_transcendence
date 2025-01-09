import { testloadComponent, cleanupComponents } from "/src/utils/virtualDOM.js";

import { loginForm } from "/src/components/loginForm.js";
import { profileForm } from "/src/components/profileForm.js";
import { socialForm } from "/src/components/socialForm.js";
import { otherProfileForm } from "/src/components/otherProfileForm.js";
import { deleteAccountForm } from "/src/components/deleteAccountForm.js";
import { subscribeForm } from "/src/components/subscribeForm.js";
import { settingsForm } from "/src/components/settingsForm.js";
import { header } from "/src/components/header.js";
import { footer } from "/src/components/footer.js";
import { logoutForm } from "/src/components/logoutForm.js";
import { leftSideWindow } from "/src/components/leftSideWindow.js";
import { rightSideWindow } from "/src/components/rightSideWindow.js";

const pages = {
  login: {
    components: ["loginForm"],
    render: () => testloadComponent("#central-window", loginForm),
  },
  profile: {
    components: ["header", "leftSideWindow", "rightSideWindow", "profileForm", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#central-window", profileForm);
      testloadComponent("#footer-container", footer);
    },
  },
  deleteAccount: {
    components: ["deleteAccountForm", "header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#central-window", deleteAccountForm);
      testloadComponent("#footer-container", footer);
    },
  },
  subscribe: {
    components: ["subscribeForm"],
    render: () => testloadComponent("#central-window", subscribeForm),
  },
  home: {
    components: ["header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#footer-container", footer);
    },
  },
  social: {
    components: ["socialForm", "header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#central-window", socialForm);
      testloadComponent("#footer-container", footer);
    },
  },
  otherprofile: {
    components: ["otherProfileForm", "header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#central-window", otherProfileForm);
      testloadComponent("#footer-container", footer);
    },
  },
  settings: {
    components: ["header", "leftSideWindow", "rightSideWindow", "settingsForm", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#central-window", settingsForm);
      testloadComponent("#footer-container", footer);
    },
  },
  logout: {
    components: ["header", "leftSideWindow", "rightSideWindow", "footer", "logoutForm"],
    render: () => {
		testloadComponent("#header-container", header);
		testloadComponent("#left-window-container", leftSideWindow);
		testloadComponent("#right-window-container", rightSideWindow);
		testloadComponent("#central-window", logoutForm);
      testloadComponent("#footer-container", footer);
    },
  },
  race: {
    components: ["header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#footer-container", footer);
    },
  },
  pong: {
    components: ["header", "leftSideWindow", "rightSideWindow", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
	  testloadComponent("#left-window-container", leftSideWindow);
	  testloadComponent("#right-window-container", rightSideWindow);
      testloadComponent("#footer-container", footer);
    },
  },
};

export function renderPage(pageKey) {
  const page = pages[pageKey];

  if (!page) {
    console.warn(`Page "${pageKey}" introuvable.`);
    return;
  }

  console.debug(`Rendering ${pageKey} Page...`);

  cleanupComponents(page.components);

  page.render();

  console.debug(`${pageKey} Page rendered.`);
}
