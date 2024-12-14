import { switchwindow } from "./App.js";
import { loadComponent } from "./utils/dom_utils.js";
import { LoginForm } from "./components/loginForm.js";
import { ProfileForm } from "./components/profileForm.js";
import { SocialForm } from "./components/socialForm.js";
import { SettingsForm } from "./components/settingsForm.js";
import { LogoutForm } from "./components/logoutForm.js";
import { isClientAuthenticated } from "./services/auth.js";
import { Header } from "./components/header.js";
import { LeftSideWindow } from "./components/leftSideWindow.js";
import { RightSideWindow } from "./components/rightSideWindow.js";
import { PongMenu } from "./components/pongMenu.js";
import { midScreen } from "./components/midScreen.js";
import { HelmetSVG } from "./components/HelmetSVG.js";
import { HUDSVG } from "./components/HUDSVG.js";
import { game2 } from "./components/game2.js";

async function initializeApp() {

    loadAuthenticatedComponents();

}


function loadAuthenticatedComponents() {

    loadComponent("race-placeholder", game2, "", () => {});
    loadComponent("mid-placeholder", midScreen, "", () => {});
    loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {});
}


	initializeApp();