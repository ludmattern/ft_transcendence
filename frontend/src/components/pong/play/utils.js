import { switchwindow } from "/src/3d/animation.js";
import componentManagers from "/src/index.js";
import { pongTuto } from "/src/components/hud/index.js";
import { headerIngame } from "/src/components/hud/index.js";

export function playGame(options) {
  switchwindow("game");
  componentManagers['HUD'].unloadComponent('header');
  componentManagers['HUD'].loadComponent('#header-container', headerIngame);
  setTimeout(() => {
    componentManagers['HUD'].loadComponent('#central-window', pongTuto(options));
  }, 2000);
}