import { createElement } from "../utils/mini_react.js";

function BackButton() {
  return createElement(
    "button",
    {
      className: "back-btn w-100 back",
      onClick: () => {
        const event = new CustomEvent("backButtonClicked");
        document.dispatchEvent(event);
      },
    },
    createElement("i", { className: "bi bi-arrow-left" }),
    " Back"
  );
}

export function game2() {
  return createElement(
    "div",
    { className: `menu-container`, id: "menu3" },
    createElement(
      "div",
      { className: `menu-panel` },
      createElement(
        "div",
        { className: "row mt-3" },
        createElement("div", { className: "col-12" }, BackButton())
      )
    )
  );
}

