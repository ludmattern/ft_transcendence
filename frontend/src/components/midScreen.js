
import { createElement } from "../utils/mini_react.js";


export function midScreen() {
  return createElement(
    "div",
    { className: `menu2`, id: "gameScreen" },
    createElement(
      "div",
      {className :"row mt-3"},

    ),
    createElement(
      "div",
      {className : "wait2"},
      createElement(
        "img",
        {className: "mid-screensaver", src : "../src/assets/img/image-removebg-preview (1).png"},
      )
    )
  );
}
