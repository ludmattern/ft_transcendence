import { testloadComponent, cleanupComponents } from "/src/utils/virtualDOM.js";

import { loginForm } from "/src/components/loginForm.js";
import { profileForm } from "/src/components/profileForm.js";
import { socialForm } from "/src/components/socialForm.js";
import { otherProfileForm } from "/src/components/otherProfileForm.js";
import { deleteAccountForm } from "/src/components/deleteAccountForm.js";
import { subscribeForm } from "/src/components/subscribeForm.js";
import { header } from "/src/components/header.js";

const pages = {
  login: {
    components: ["loginForm"],
    render: () => testloadComponent("#central-window", loginForm),
  },
  profile: {
    components: ["profileForm", "header"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", profileForm);
    },
  },
  deleteAccount: {
    components: ["deleteAccountForm", "header"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", deleteAccountForm);
    },
  },
  subscribe: {
    components: ["subscribeForm"],
    render: () => testloadComponent("#central-window", subscribeForm),
  },
  home: {
    components: ["header"],
    render: () => testloadComponent("#header-container", header),
  },
  social: {
    components: ["socialForm", "header"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", socialForm);
    },
  },
  otherprofile: {
    components: ["otherProfileForm", "header"],
    render: () => {
      testloadComponent("#header-container", header);
      testloadComponent("#central-window", otherProfileForm);
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
