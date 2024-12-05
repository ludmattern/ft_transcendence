// index.js
import { Header } from "./components/header.js";
import { LeftSideWindow } from "./components/leftSideWindow.js";
import { RightSideWindow } from "./components/rightSideWindow.js";
import { loadComponent } from "./utils/dom_utils.js";
import { PongMenu } from "./components/pongMenu.js";
import { midScreen } from "./components/midScreen.js";
import { HelmetSVG } from "./components/HelmetSVG.js";
import { HUDSVG } from "./components/HUDSVG.js";


document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-placeholder", Header, "hud", () => {});

  loadComponent("left-window-placeholder", LeftSideWindow, "leftsidewindow", () => {});

  loadComponent("right-window-placeholder", RightSideWindow, "rightsidewindow", () => {});

  loadComponent("mid-placeholder", midScreen, "pongmenu", () => {  });

  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {  });

  loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {});

  loadComponent("hud-svg-placeholder", HUDSVG, "", () => {});
});
