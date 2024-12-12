// index.js
import { Header } from "./components/header.js";
import { LeftSideWindow } from "./components/leftSideWindow.js";
import { RightSideWindow } from "./components/rightSideWindow.js";
import { loadComponent } from "./utils/dom_utils.js";
import { PongMenu } from "./components/pongMenu.js";
import { midScreen } from "./components/midScreen.js";
import { HelmetSVG } from "./components/HelmetSVG.js";
import { HUDSVG } from "./components/HUDSVG.js";
import { game2 } from "./components/game2.js";
import { LoginForm } from "./components/loginForm.js";
import { SubscribeForm } from "./components/subscribeForm.js";
import { SettingsForm } from "./components/settingsForm.js";
import { ProfileForm } from "./components/profileForm.js";
import { OtherProfileForm } from "./components/otherProfileForm.js";
import { SocialForm } from "./components/socialForm.js";
import { LogoutForm } from "./components/logoutForm.js";
import { DeleteAccountForm } from "./components/deleteAccountForm.js";


document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-placeholder", Header, "hud", () => {});

  loadComponent("left-window-placeholder", LeftSideWindow, "leftsidewindow", () => {});

  loadComponent("right-window-placeholder", RightSideWindow, "rightsidewindow", () => {});

  loadComponent("race-placeholder", game2, "", () => {  });

  loadComponent("mid-placeholder", midScreen, "", () => {  });

  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {  });

  loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});

  loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});

  loadComponent("login-form-placeholder", LoginForm, "", () => {});

  loadComponent("subscribe-form-placeholder", SubscribeForm, "", () => {});

  loadComponent("settings-form-placeholder", SettingsForm, "", () => {});

  loadComponent("profile-form-placeholder", ProfileForm, "", () => {});

  loadComponent("other-profile-form-placeholder", OtherProfileForm, "", () => {});

  loadComponent("social-form-placeholder", SocialForm, "", () => {});

  loadComponent("logout-form-placeholder", LogoutForm, "", () => {});

  loadComponent("delete-account-form-placeholder", DeleteAccountForm, "", () => {});
});
