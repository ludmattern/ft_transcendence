// index.js
import { Header } from "./components/header.js";
import { LeftSideWindow } from "./components/leftSideWindow.js";
import { RightSideWindow } from "./components/rightSideWindow.js";
import { loadComponent } from "./utils/dom_utils.js";
import { PongMenu } from "./components/pongMenu.js";
import { initializeMenuElements } from "./App.js";
import { HelmetSVG } from "./components/HelmetSVG.js";
import { HUDSVG } from "./components/HUDSVG.js";

document.addEventListener("DOMContentLoaded", () => {
  console.debug("Injecting header component and loading associated script");

  loadComponent("header-placeholder", Header, "hud", () => {
    console.log("HUD and Header components are fully loaded and initialized");
  });

  loadComponent("left-window-placeholder", LeftSideWindow, "leftsidewindow", () => {
    console.log("left window are fully loaded and initialized");
  });

  loadComponent("right-window-placeholder", RightSideWindow, "rightsidewindow", () => {
    console.log("right window are fully loaded and initialized");
  });

  loadComponent("pongmenu-placeholder", PongMenu, "pongmenu", () => {
    console.log("Pong Menu is fully loaded and initialized");
    initializeMenuElements();
  });

  loadComponent("helmet-svg-placeholder", HelmetSVG, "", () => {
    console.log("left window are fully loaded and initialized");
  });

  loadComponent("hud-svg-placeholder", HUDSVG, "", () => {
    console.log("helmet svg components are fully loaded and initialized");
  });
});
