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

const pages = {
  login: {
    components: ["loginForm"],
    render: () => testloadComponent("#central-window", loginForm),
  },
  profile: {
    components: ["profileForm", "header", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", profileForm);
      testloadComponent("#footer-container", footer);
    },
  },
  deleteAccount: {
    components: ["deleteAccountForm", "header", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", deleteAccountForm);
      testloadComponent("#footer-container", footer);
    },
  },
  subscribe: {
    components: ["subscribeForm"],
    render: () => testloadComponent("#central-window", subscribeForm),
  },
  home: {
    components: ["header", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#footer-container", footer);
    },
  },
  social: {
    components: ["socialForm", "header", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", socialForm);
      testloadComponent("#footer-container", footer);
    },
  },
  otherprofile: {
    components: ["otherProfileForm", "header", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", otherProfileForm);
      testloadComponent("#footer-container", footer);
    },
  },
  settings: {
    components: ["header", "settingsForm", "footer"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", settingsForm);
      testloadComponent("#footer-container", footer);
    },
  },
  logout: {
    components: ["header", "footer", "logoutForm"],
    render: () => {
      testloadComponent("#central-window", logoutForm);
      testloadComponent("#header-container", header);
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
