import { createElement } from "../utils/mini_react.js";
import { BackButton } from "./pongMenu.js";


export function game2() {
  return createElement(
    "div",
    { className: `menu3`, id: "menu3" },
    createElement(
      "div",
      {className : "row mt-3"},
      createElement("div", { className: "col-12" }, BackButton())
    ),
  );
}

