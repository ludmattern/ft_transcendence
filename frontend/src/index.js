// index.js
import { Header } from "./components/header.js";
import { SideWindow } from "./components/sidewindow.js";
import { loadComponent } from "./utils/dom_utils.js";
import { PongMenu } from './components/pongMenu.js';
import { initializeMenuElements } from './App.js';


document.addEventListener("DOMContentLoaded", () => {
  console.debug("Injecting header component and loading associated script");

  loadComponent("header-placeholder", Header, "hud", () => {
    console.log("HUD and Header components are fully loaded and initialized");
  });
  loadComponent("left-window-placeholder", SideWindow, "sidewindow", () => {
    console.log("left window are fully loaded and initialized");
  });
  loadComponent('pongmenu-placeholder', PongMenu, "pongmenu", () => {
    console.log('Pong Menu is fully loaded and initialized');
    initializeMenuElements();

  });


});
