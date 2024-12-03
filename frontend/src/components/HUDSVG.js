import { createElement } from "../utils/mini_react.js";

// Function to create the HUD SVG structure
export function HUDSVG() {
  return createElement(
    "span",
    { className: "hud-svg" },
    // SVG Header
    createElement(
      "svg",
      {
        className: "svg-element hud-svg-header",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1316.96 93.79",
      },
      createElement(
        "g",
        { id: "hud_layer", "data-name": "Calque 2" },
        createElement(
          "g",
          { id: "Calque_1-2", "data-name": "Calque 1" },
          createElement("path", {
            className: "cls-1",
            d: "M643,93.42,617.25,70.16S454,66.69,404.78,60.49L379,80.89s-112.8-5.8-351.6-48.4L.38.49",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M674,93.42l25.74-23.26S863,66.69,912.18,60.49L938,80.89s112.8-5.8,351.6-48.4l27-32",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M427.32.36l47.73,47.2s130.4,6.4,181.87,5.6,176.53-3.74,185.6-5.34L890,.89",
          })
        )
      )
    ),
    // SVG Header Background
    createElement(
      "svg",
      {
        className: "svg-element hud-svg-header background-svg",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1316.96 93.79",
      },
      createElement(
        "g",
        { id: "hud_layer", "data-name": "Calque 2" },
        createElement(
          "g",
          { id: "Calque_1-2", "data-name": "Calque 1" },
          createElement("path", {
            className: "cls-1",
            d: "M643,93.42,617.25,70.16S454,66.69,404.78,60.49L379,80.89s-112.8-5.8-351.6-48.4L.38.49",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M674,93.42l25.74-23.26S863,66.69,912.18,60.49L938,80.89s112.8-5.8,351.6-48.4l27-32",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M427.32.36l47.73,47.2s130.4,6.4,181.87,5.6,176.53-3.74,185.6-5.34L890,.89",
          })
        )
      )
    ),
    // SVG Footer
    createElement(
      "svg",
      {
        className: "svg-element hud-svg-footer",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1072.2 90.52",
      },
      createElement(
        "g",
        { id: "hud_layer", "data-name": "Calque 2" },
        createElement(
          "g",
          { id: "Calque_1-2", "data-name": "Calque 1" },
          createElement("path", {
            className: "cls-1",
            d: "M.15,89.56S99.22,58,195.75,40.62c0,0-19.73,20.27-30.4,33.87,0,0-52,10.53-65.06,15.47",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M1072.05,89.66S973,58.06,876.45,40.72c0,0,19.74,20.27,30.4,33.87,0,0,52,10.53,65.07,15.47",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M165.62,89.82S220,28.76,222,28.36c0,0,305.5-62.5,628.4-.27,0,0,51.27,54.67,56.07,61.47",
          })
        )
      )
    ),
    // SVG Footer Background
    createElement(
      "svg",
      {
        className: "svg-element hud-svg-footer background-svg",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1072.2 90.52",
      },
      createElement(
        "g",
        { id: "hud_layer", "data-name": "Calque 2" },
        createElement(
          "g",
          { id: "Calque_1-2", "data-name": "Calque 1" },
          createElement("path", {
            className: "cls-1",
            d: "M.15,89.56S99.22,58,195.75,40.62c0,0-19.73,20.27-30.4,33.87,0,0-52,10.53-65.06,15.47",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M1072.05,89.66S973,58.06,876.45,40.72c0,0,19.74,20.27,30.4,33.87,0,0,52,10.53,65.07,15.47",
          }),
          createElement("path", {
            className: "cls-1",
            d: "M165.62,89.82S220,28.76,222,28.36c0,0,305.5-62.5,628.4-.27,0,0,51.27,54.67,56.07,61.47",
          })
        )
      )
    )
  );
}
