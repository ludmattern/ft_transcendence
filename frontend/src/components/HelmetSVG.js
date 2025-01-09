import { createElement } from "/src/utils/mini_react.js";

// Generates the helmet SVG component
export function HelmetSVG() {
  return createElement(
    "span",
    { className: "helmet-svg" },
    createTopLeftSVG(),
    createTopRightSVG(),
    createBottomLeftSVG(),
    createBottomRightSVG(),
    createBottomCenterSVG()
  );
}

// Helper function to create a linear gradient
function createLinearGradient(
  id,
  x1,
  y1,
  x2,
  y2,
  stops,
  gradientTransform = null
) {
  const props = { id, x1, y1, x2, y2, gradientUnits: "userSpaceOnUse" };

  // Add gradientTransform if it is provided
  if (gradientTransform) {
    props.gradientTransform = gradientTransform;
  }

  return createElement(
    "linearGradient",
    props,
    ...stops.map((stop) =>
      createElement("stop", {
        offset: stop.offset,
        "stop-color": stop.stopColor,
      })
    )
  );
}

// Helper function to create an SVG element
function createSVGElement(tag, props, ...children) {
  return createElement(tag, props, ...children);
}

// Generates the top left SVG
function createTopLeftSVG() {
  return createSVGElement(
    "svg",
    {
      className: "svg-element svg-top-left",
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      viewBox: "0 0 100.82 255.17",
    },
    createElement(
      "defs",
      {},
      createLinearGradient(
        "tlg1",
        "45.6",
        "2.45",
        "45.6",
        "275.34",
        [
          { offset: "0", stopColor: "#07111b" },
          { offset: "0.27", stopColor: "#2a4e66" },
          { offset: "0.37", stopColor: "#6d8c9d" },
          { offset: "0.45", stopColor: "#a4c0cb" },
          { offset: "0.49", stopColor: "#b9d4dd" },
          { offset: "0.82", stopColor: "#bad6df" },
          { offset: "0.94", stopColor: "#bedce6" },
          { offset: "1", stopColor: "#c2e4ee" },
        ],
        null
      ),
      createLinearGradient(
        "tlg2",
        "47.44",
        "0",
        "47.44",
        "246.62",
        [
          { offset: "0", stopColor: "#0f1d28" },
          { offset: "0.06", stopColor: "#1c2c38" },
          { offset: "0.19", stopColor: "#314552" },
          { offset: "0.33", stopColor: "#425966" },
          { offset: "0.49", stopColor: "#4e6675" },
          { offset: "0.69", stopColor: "#556f7d" },
          { offset: "1", stopColor: "#577180" },
        ],
        null
      ),
      createLinearGradient(
        "tlg3",
        "50.47",
        "2.67",
        "50.47",
        "254.44",
        [
          { offset: "0", stopColor: "#25414f" },
          { offset: "0.3", stopColor: "#8b9da3" },
          { offset: "0.54", stopColor: "#dce6e7" },
        ],
        null
      )
    ),
    createElement(
      "g",
      { id: "Calque_2", "data-name": "Calque 2" },
      createElement(
        "g",
        { id: "Calque_1-2", "data-name": "Calque 1" },
        createElement("path", {
          className: "tl-1",
          d: "M85.4,0C76.53,21.35,62.49,56.15,56.93,75.47c0,0-32.26,37.36-56.93,120.68V0Z",
        }),
        createElement("path", {
          className: "tl-2",
          d: "M91.19,0C82.42,21,67.39,58,61.6,78.14c0,0-37.06,43.36-61.6,141.69V196.15C24.67,112.83,56.93,75.47,56.93,75.47,62.49,56.15,76.53,21.35,85.4,0Z",
        }),
        createElement("path", {
          className: "tl-3",
          d: "M94.89,0C86.27,20.61,70.5,59.25,64.53,80c0,0-41.46,50.7-64.53,166.62l0-31.25C24.57,117,61.6,78.14,61.6,78.14,67.39,58,82.42,21,91.19,0Z",
        }),
        createElement("path", {
          className: "tl-4",
          d: "M100.82,0C92.51,19.77,75.57,61,69.33,82.67c0,0-47.85,37.48-69.2,172.5v-22C23.2,117.25,64.53,80,64.53,80c6-20.75,21.74-59.39,30.36-80Z",
        })
      )
    )
  );
}

// Generates the top right SVG
function createTopRightSVG() {
  return createSVGElement(
    "svg",
    {
      className: "svg-element svg-top-right",
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      viewBox: "0 0 100.82 255.17",
    },
    createElement(
      "defs",
      {},
      createLinearGradient(
        "trg1",
        "-2685.6",
        "2.45",
        "-2685.6",
        "275.34",
        [
          { offset: "0", stopColor: "#07111b" },
          { offset: "0.27", stopColor: "#2a4e66" },
          { offset: "0.37", stopColor: "#6d8c9d" },
          { offset: "0.45", stopColor: "#a4c0cb" },
          { offset: "0.49", stopColor: "#b9d4dd" },
          { offset: "0.82", stopColor: "#bad6df" },
          { offset: "0.94", stopColor: "#bedce6" },
          { offset: "1", stopColor: "#c2e4ee" },
        ],
        "matrix(-1, 0, 0, 1, -2630.38, 0)"
      ),
      createLinearGradient(
        "trg2",
        "-2683.76",
        "0",
        "-2683.76",
        "246.62",
        [
          { offset: "0", stopColor: "#0f1d28" },
          { offset: "0.06", stopColor: "#1c2c38" },
          { offset: "0.19", stopColor: "#314552" },
          { offset: "0.33", stopColor: "#425966" },
          { offset: "0.49", stopColor: "#4e6675" },
          { offset: "0.69", stopColor: "#556f7d" },
          { offset: "1", stopColor: "#577180" },
        ],
        "matrix(-1, 0, 0, 1, -2630.38, 0)"
      ),
      createLinearGradient(
        "trg3",
        "-2680.73",
        "2.67",
        "-2680.73",
        "254.44",
        [
          { offset: "0", stopColor: "#25414f" },
          { offset: "0.3", stopColor: "#8b9da3" },
          { offset: "0.54", stopColor: "#dce6e7" },
        ],
        "matrix(-1, 0, 0, 1, -2630.38, 0)"
      )
    ),
    createElement(
      "g",
      { id: "Calque_2", "data-name": "Calque 2" },
      createElement(
        "g",
        { id: "Calque_1-2", "data-name": "Calque 1" },
        createElement("path", {
          className: "tr-1",
          d: "M15.42,0c8.87,21.35,22.91,56.15,28.47,75.47,0,0,32.26,37.36,56.93,120.68V0Z",
        }),
        createElement("path", {
          className: "tr-2",
          d: "M9.63,0c8.77,21,23.8,58,29.59,78.14,0,0,37.06,43.36,61.6,141.69V196.15C76.15,112.83,43.89,75.47,43.89,75.47,38.33,56.15,24.29,21.35,15.42,0Z",
        }),
        createElement("path", {
          className: "tr-3",
          d: "M5.93,0c8.62,20.61,24.39,59.25,30.36,80,0,0,41.46,50.7,64.53,166.62l0-31.25C76.25,117,39.22,78.14,39.22,78.14,33.43,58,18.4,21,9.63,0Z",
        }),
        createElement("path", {
          className: "tr-4",
          d: "M0,0C8.31,19.77,25.25,61,31.49,82.67c0,0,47.85,37.48,69.2,172.5v-22C77.62,117.25,36.29,80,36.29,80c-6-20.75-21.74-59.39-30.36-80Z",
        })
      )
    )
  );
}

// Similarly, create functions for createBottomLeftSVG(), createBottomRightSVG(), and createBottomCenterSVG() that follow the same structure
// Use the provided details for paths, gradients, and other SVG components to complete those functions.

// Generates the bottom left SVG
function createBottomLeftSVG() {
  return createSVGElement(
    "svg",
    {
      className: "svg-element svg-bottom-left",
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      viewBox: "0 0 194.84 163.91",
    },
    createElement(
      "defs",
      {},
      createLinearGradient(
        "blg1",
        "7.92",
        "46.32",
        "187.27",
        "122.45",
        [
          { offset: "0", stopColor: "#c2d6df" },
          { offset: "0.08", stopColor: "#bacfd8" },
          { offset: "0.19", stopColor: "#a5bbc6" },
          { offset: "0.33", stopColor: "#829ba8" },
          { offset: "0.49", stopColor: "#536e7f" },
          { offset: "0.56", stopColor: "#3d5a6c" },
          { offset: "0.56", stopColor: "#4b6777" },
          { offset: "0.57", stopColor: "#6f8895" },
          { offset: "0.58", stopColor: "#8fa5af" },
          { offset: "0.6", stopColor: "#abbec5" },
          { offset: "0.61", stopColor: "#c1d2d7" },
          { offset: "0.63", stopColor: "#d2e1e4" },
          { offset: "0.65", stopColor: "#ddecee" },
          { offset: "0.68", stopColor: "#e4f2f3" },
          { offset: "0.77", stopColor: "#e6f4f5" },
          { offset: "0.84", stopColor: "#e4f2f4" },
          { offset: "0.87", stopColor: "#ddecee" },
          { offset: "0.89", stopColor: "#d2e2e5" },
          { offset: "0.9", stopColor: "#c1d3d8" },
          { offset: "0.91", stopColor: "#abbfc6" },
          { offset: "0.92", stopColor: "#8fa7b1" },
          { offset: "0.93", stopColor: "#708b98" },
          { offset: "0.94", stopColor: "#698593" },
          { offset: "0.98", stopColor: "#678493" },
          { offset: "0.99", stopColor: "#608092" },
          { offset: "1", stopColor: "#5a7d91" },
        ],
        null
      ),
      createLinearGradient(
        "blg2",
        "0",
        "84.94",
        "183.71",
        "84.94",
        [
          { offset: "0", stopColor: "#476172" },
          { offset: "0.54", stopColor: "#213c4d" },
          { offset: "0.77", stopColor: "#465c69" },
          { offset: "1", stopColor: "#355a6d" },
        ],
        null
      ),
      createLinearGradient(
        "blg3",
        "16.02",
        "41.81",
        "159.92",
        "142.57",
        [
          { offset: "0", stopColor: "#b4cfda" },
          { offset: "0.04", stopColor: "#a6bfcb" },
          { offset: "0.25", stopColor: "#556775" },
          { offset: "0.39", stopColor: "#233040" },
          { offset: "0.46", stopColor: "#0f1b2b" },
          { offset: "0.52", stopColor: "#111d2d" },
          { offset: "0.54", stopColor: "#172433" },
          { offset: "0.56", stopColor: "#222f3f" },
          { offset: "0.57", stopColor: "#31404f" },
          { offset: "0.58", stopColor: "#465664" },
          { offset: "0.59", stopColor: "#5f727e" },
          { offset: "0.59", stopColor: "#7c929e" },
          { offset: "0.6", stopColor: "#9eb6c0" },
          { offset: "0.61", stopColor: "#b9d4dd" },
          { offset: "0.76", stopColor: "#b7d2db" },
          { offset: "0.82", stopColor: "#b1cbd5" },
          { offset: "0.86", stopColor: "#a6c0c9" },
          { offset: "0.89", stopColor: "#96afb9" },
          { offset: "0.92", stopColor: "#8299a4" },
          { offset: "0.95", stopColor: "#697d8a" },
          { offset: "0.97", stopColor: "#4b5d6b" },
          { offset: "0.99", stopColor: "#2a3948" },
          { offset: "1", stopColor: "#111e2e" },
        ],
        null
      )
    ),
    createElement(
      "g",
      { id: "Calque_2", "data-name": "Calque 2" },
      createElement(
        "g",
        { id: "Calque_1-2", "data-name": "Calque 1" },
        createElement("path", {
          className: "bl-1",
          d: "M194.84,163.91H183.71c-9-4.44-14.69-7.61-14.69-7.61l-2.15-22.79-57.2-44.73-30.1,6C40.16,55.64,14.52,24.83,0,6V0C15.43,19.76,41.34,50.47,80.06,88.94l31.23-6.25,59.34,46.4,2.23,23.65S181.77,157.67,194.84,163.91Z",
        }),
        createElement("path", {
          className: "bl-2",
          d: "M183.71,163.91h-8c-6-3-9.62-5.06-9.62-5.06L164,136.78,108.6,93.48,79.45,99.31C39,59.12,13.54,28,0,10.14V6C14.52,24.83,40.16,55.64,79.57,94.8l30.1-6,57.2,44.73L169,156.3S174.74,159.47,183.71,163.91Z",
        }),
        createElement("path", {
          className: "bl-3",
          d: "M175.67,163.91H163.25l-2.45-1.33-2-21.2-53.2-41.6-28,5.6C37.43,65.47,12.65,34.88,0,18V10.14C13.54,28,39,59.12,79.45,99.31l29.15-5.83L164,136.78l2.08,22.07S169.68,160.86,175.67,163.91Z",
        }),
        createElement("path", {
          className: "bl-4",
          d: "M163.25,163.91H0V18c12.65,16.86,37.43,47.45,77.6,87.36l28-5.6,53.2,41.6,2,21.2Z",
        })
      )
    )
  );
}

// Generates the bottom right SVG
function createBottomRightSVG() {
  return createSVGElement(
    "svg",
    {
      className: "svg-element svg-bottom-right",
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      viewBox: "0 0 194.84 163.91",
    },
    createElement(
      "defs",
      {},
      createLinearGradient(
        "brg1",
        "186.92",
        "46.32",
        "7.57",
        "122.45",
        [
          { offset: "0", stopColor: "#c2d6df" },
          { offset: "0.08", stopColor: "#bacfd8" },
          { offset: "0.19", stopColor: "#a5bbc6" },
          { offset: "0.33", stopColor: "#829ba8" },
          { offset: "0.49", stopColor: "#536e7f" },
          { offset: "0.56", stopColor: "#3d5a6c" },
          { offset: "0.56", stopColor: "#4b6777" },
          { offset: "0.57", stopColor: "#6f8895" },
          { offset: "0.58", stopColor: "#8fa5af" },
          { offset: "0.6", stopColor: "#abbec5" },
          { offset: "0.61", stopColor: "#c1d2d7" },
          { offset: "0.63", stopColor: "#d2e1e4" },
          { offset: "0.65", stopColor: "#ddecee" },
          { offset: "0.68", stopColor: "#e4f2f3" },
          { offset: "0.77", stopColor: "#e6f4f5" },
          { offset: "0.84", stopColor: "#e4f2f4" },
          { offset: "0.87", stopColor: "#ddecee" },
          { offset: "0.89", stopColor: "#d2e2e5" },
          { offset: "0.9", stopColor: "#c1d3d8" },
          { offset: "0.91", stopColor: "#abbfc6" },
          { offset: "0.92", stopColor: "#8fa7b1" },
          { offset: "0.93", stopColor: "#708b98" },
          { offset: "0.94", stopColor: "#698593" },
          { offset: "0.98", stopColor: "#678493" },
          { offset: "0.99", stopColor: "#608092" },
          { offset: "1", stopColor: "#5a7d91" },
        ],
        null
      ),
      createLinearGradient(
        "brg2",
        "178.82",
        "41.81",
        "34.92",
        "142.57",
        [
          { offset: "0", stopColor: "#b4cfda" },
          { offset: "0.04", stopColor: "#a6bfcb" },
          { offset: "0.25", stopColor: "#556775" },
          { offset: "0.39", stopColor: "#233040" },
          { offset: "0.46", stopColor: "#0f1b2b" },
          { offset: "0.52", stopColor: "#111d2d" },
          { offset: "0.54", stopColor: "#172433" },
          { offset: "0.56", stopColor: "#222f3f" },
          { offset: "0.57", stopColor: "#31404f" },
          { offset: "0.58", stopColor: "#465664" },
          { offset: "0.59", stopColor: "#5f727e" },
          { offset: "0.59", stopColor: "#7c929e" },
          { offset: "0.6", stopColor: "#9eb6c0" },
          { offset: "0.61", stopColor: "#b9d4dd" },
          { offset: "0.76", stopColor: "#b7d2db" },
          { offset: "0.82", stopColor: "#b1cbd5" },
          { offset: "0.86", stopColor: "#a6c0c9" },
          { offset: "0.89", stopColor: "#96afb9" },
          { offset: "0.92", stopColor: "#8299a4" },
          { offset: "0.95", stopColor: "#697d8a" },
          { offset: "0.97", stopColor: "#4b5d6b" },
          { offset: "0.99", stopColor: "#2a3948" },
          { offset: "1", stopColor: "#111e2e" },
        ],
        null
      ),
      createLinearGradient(
        "brg3",
        "194.84",
        "84.94",
        "11.13",
        "84.94",
        [
          { offset: "0", stopColor: "#476172" },
          { offset: "0.54", stopColor: "#213c4d" },
          { offset: "0.77", stopColor: "#465c69" },
          { offset: "1", stopColor: "#355a6d" },
        ],
        null
      )
    ),
    createElement(
      "g",
      { id: "Calque_2", "data-name": "Calque 2" },
      createElement(
        "g",
        { id: "Calque_1-2", "data-name": "Calque 1" },
        createElement("path", {
          className: "br-1",
          d: "M0,163.91H11.13c9-4.44,14.69-7.61,14.69-7.61L28,133.51l57.2-44.73,30.1,6c39.41-39.16,65.05-70,79.57-88.83V0c-15.43,19.76-41.34,50.47-80.06,88.94L83.55,82.69l-59.34,46.4L22,152.74S13.07,157.67,0,163.91Z",
        }),
        createElement("path", {
          className: "br-2",
          d: "M19.17,163.91H31.59L34,162.58l2-21.2,53.2-41.6,28,5.6c40.17-39.91,65-70.5,77.6-87.36V10.14c-13.54,17.88-39,49-79.45,89.17L86.24,93.48l-55.37,43.3-2.08,22.07S25.16,160.86,19.17,163.91Z",
        }),
        createElement("path", {
          className: "br-3",
          d: "M34,162.58l-2.45,1.33H194.84V18c-12.65,16.86-37.43,47.45-77.6,87.36l-28-5.6L36,141.38Z",
        }),
        createElement("path", {
          className: "br-4",
          d: "M25.82,156.3s-5.72,3.17-14.69,7.61h8c6-3,9.62-5.06,9.62-5.06l2.08-22.07,55.37-43.3,29.15,5.83C155.83,59.12,181.3,28,194.84,10.14V6c-14.52,18.86-40.16,49.67-79.57,88.83l-30.1-6L28,133.51Z",
        })
      )
    )
  );
}

// Generates the bottom center SVG
function createBottomCenterSVG() {
  return createSVGElement(
    "svg",
    {
      className: "svg-element svg-bottom-center",
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      viewBox: "0 0 572.84 36.06",
    },
    createElement(
      "defs",
      {},
      createLinearGradient(
        "bcg1",
        "1.07",
        "22.94",
        "570.45",
        "22.94",
        [
          { offset: "0", stopColor: "#0f1b2b" },
          { offset: "0.16", stopColor: "#111d2d" },
          { offset: "0.24", stopColor: "#192534" },
          { offset: "0.31", stopColor: "#273140" },
          { offset: "0.36", stopColor: "#3a4351" },
          { offset: "0.41", stopColor: "#525b66" },
          { offset: "0.46", stopColor: "#717881" },
          { offset: "0.5", stopColor: "#959aa1" },
          { offset: "0.54", stopColor: "#bfc2c6" },
          { offset: "0.58", stopColor: "#edeeef" },
          { offset: "0.58", stopColor: "#f9f9f9" },
        ],
        null
      ),
      createLinearGradient(
        "bcg2",
        "2.03",
        "20.78",
        "571.66",
        "20.78",
        [
          { offset: "0", stopColor: "#1c3846" },
          { offset: "0.34", stopColor: "#1d3948" },
          { offset: "0.47", stopColor: "#203f4f" },
          { offset: "0.55", stopColor: "#26485a" },
          { offset: "0.57", stopColor: "#284b5e" },
          { offset: "0.6", stopColor: "#2c4e61" },
          { offset: "0.86", stopColor: "#496776" },
          { offset: "1", stopColor: "#54707e" },
        ],
        null
      ),
      createLinearGradient(
        "bcg3",
        "0",
        "18.03",
        "572.84",
        "18.03",
        [
          { offset: "0", stopColor: "#3d5a6c" },
          { offset: "0.2", stopColor: "#3f5c6d" },
          { offset: "0.28", stopColor: "#466173" },
          { offset: "0.33", stopColor: "#516b7c" },
          { offset: "0.37", stopColor: "#627a88" },
          { offset: "0.41", stopColor: "#788c99" },
          { offset: "0.44", stopColor: "#94a3ae" },
          { offset: "0.47", stopColor: "#b4bfc6" },
          { offset: "0.49", stopColor: "#d8dee2" },
          { offset: "0.51", stopColor: "#f4f5f7" },
        ],
        null
      )
    ),
    createElement(
      "g",
      { id: "Calque_2", "data-name": "Calque 2" },
      createElement(
        "g",
        { id: "Calque_1-2", "data-name": "Calque 1" },
        createElement("polygon", {
          className: "bc-1",
          points:
            "568.79 36.06 1.31 36.06 1.49 35.79 285.01 14.08 568.61 35.8 568.79 36.06",
        }),
        createElement("polygon", {
          className: "bc-2",
          points:
            "570.45 36.06 568.79 36.06 568.61 35.8 285.01 14.08 1.49 35.79 1.31 36.06 1.07 36.06 2.03 34.22 285.4 9.81 569.38 34.28 570.45 36.06",
        }),
        createElement("polygon", {
          className: "bc-3",
          points:
            "571.66 36.06 570.45 36.06 569.38 34.28 285.4 9.81 2.03 34.22 2.43 33.47 286.33 5.5 570.31 33.48 571.66 36.06",
        }),
        createElement("polygon", {
          className: "bc-4",
          points:
            "572.84 36.06 571.66 36.06 570.31 33.48 286.33 5.5 2.43 33.47 2.03 34.22 1.5 34.27 0.43 36.06 0 36.06 2.49 30.82 286.47 0 286.39 0.02 570.36 30.84 572.84 36.06",
        })
      )
    )
  );
}
