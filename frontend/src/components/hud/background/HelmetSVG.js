import { createComponent } from "/src/utils/component.js";

export const HelmetSVG = createComponent({
  tag: "HelmetSVG",

  render: () => `
    <span class="helmet-svg">
      ${createTopLeftSVG()}
      ${createTopRightSVG()}
      ${createBottomLeftSVG()}
      ${createBottomRightSVG()}
      ${createBottomCenterSVG()}
    </span>
  `,
});

function createTopLeftSVG() {
  return `
  <svg class="svg-element svg-top-left" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100.82 255.17">
    <defs>
      <linearGradient id="tlg1" x1="45.6" y1="2.45" x2="45.6" y2="275.34" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#07111b"></stop>
        <stop offset="0.27" stop-color="#2a4e66"></stop>
        <stop offset="0.37" stop-color="#6d8c9d"></stop>
        <stop offset="0.45" stop-color="#a4c0cb"></stop>
        <stop offset="0.49" stop-color="#b9d4dd"></stop>
        <stop offset="0.82" stop-color="#bad6df"></stop>
        <stop offset="0.94" stop-color="#bedce6"></stop>
        <stop offset="1" stop-color="#c2e4ee"></stop>
      </linearGradient>
      <linearGradient id="tlg2" x1="47.44" y1="0" x2="47.44" y2="246.62" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0f1d28"></stop>
        <stop offset="0.06" stop-color="#1c2c38"></stop>
        <stop offset="0.19" stop-color="#314552"></stop>
        <stop offset="0.33" stop-color="#425966"></stop>
        <stop offset="0.49" stop-color="#4e6675"></stop>
        <stop offset="0.69" stop-color="#556f7d"></stop>
        <stop offset="1" stop-color="#577180"></stop>
      </linearGradient>
      <linearGradient id="tlg3" x1="50.47" y1="2.67" x2="50.47" y2="254.44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#25414f"></stop>
        <stop offset="0.3" stop-color="#8b9da3"></stop>
        <stop offset="0.54" stop-color="#dce6e7"></stop>
      </linearGradient>
    </defs>
    <g id="Calque_2" data-name="Calque 2">
      <g id="Calque_1-2" data-name="Calque 1">
        <path class="tl-1" d="M85.4,0C76.53,21.35,62.49,56.15,56.93,75.47c0,0-32.26,37.36-56.93,120.68V0Z"></path>
        <path class="tl-2" d="M91.19,0C82.42,21,67.39,58,61.6,78.14c0,0-37.06,43.36-61.6,141.69V196.15C24.67,112.83,56.93,75.47,56.93,75.47,62.49,56.15,76.53,21.35,85.4,0Z"></path>
        <path class="tl-3" d="M94.89,0C86.27,20.61,70.5,59.25,64.53,80c0,0-41.46,50.7-64.53,166.62l0-31.25C24.57,117,61.6,78.14,61.6,78.14,67.39,58,82.42,21,91.19,0Z"></path>
        <path class="tl-4" d="M100.82,0C92.51,19.77,75.57,61,69.33,82.67c0,0-47.85,37.48-69.2,172.5v-22C23.2,117.25,64.53,80,64.53,80c6-20.75,21.74-59.39,30.36-80Z"></path>
      </g>
    </g>
  </svg>`;
}

function createTopRightSVG() {
  return `
  <svg
    class="svg-element svg-top-right"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 100.82 255.17">
    <defs>
      <linearGradient id="trg1" x1="-2685.6" y1="2.45" x2="-2685.6" y2="275.34" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1, 0, 0, 1, -2630.38, 0)">
        <stop offset="0" stop-color="#07111b"></stop>
        <stop offset="0.27" stop-color="#2a4e66"></stop>
        <stop offset="0.37" stop-color="#6d8c9d"></stop>
        <stop offset="0.45" stop-color="#a4c0cb"></stop>
        <stop offset="0.49" stop-color="#b9d4dd"></stop>
        <stop offset="0.82" stop-color="#bad6df"></stop>
        <stop offset="0.94" stop-color="#bedce6"></stop>
        <stop offset="1" stop-color="#c2e4ee"></stop>
      </linearGradient>
      <linearGradient id="trg2" x1="-2683.76" y1="0" x2="-2683.76" y2="246.62" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1, 0, 0, 1, -2630.38, 0)">
        <stop offset="0" stop-color="#0f1d28"></stop>
        <stop offset="0.06" stop-color="#1c2c38"></stop>
        <stop offset="0.19" stop-color="#314552"></stop>
        <stop offset="0.33" stop-color="#425966"></stop>
        <stop offset="0.49" stop-color="#4e6675"></stop>
        <stop offset="0.69" stop-color="#556f7d"></stop>
        <stop offset="1" stop-color="#577180"></stop>
      </linearGradient>
      <linearGradient id="trg3" x1="-2680.73" y1="2.67" x2="-2680.73" y2="254.44" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1, 0, 0, 1, -2630.38, 0)">
        <stop offset="0" stop-color="#25414f"></stop>
        <stop offset="0.3" stop-color="#8b9da3"></stop>
        <stop offset="0.54" stop-color="#dce6e7"></stop>
      </linearGradient>
    </defs>
    <g id="Calque_2" data-name="Calque 2">
      <g id="Calque_1-2" data-name="Calque 1">
        <path class="tr-1" d="M15.42,0c8.87,21.35,22.91,56.15,28.47,75.47,0,0,32.26,37.36,56.93,120.68V0Z"></path>
        <path class="tr-2" d="M9.63,0c8.77,21,23.8,58,29.59,78.14,0,0,37.06,43.36,61.6,141.69V196.15C76.15,112.83,43.89,75.47,43.89,75.47,38.33,56.15,24.29,21.35,15.42,0Z"></path>
        <path class="tr-3" d="M5.93,0c8.62,20.61,24.39,59.25,30.36,80,0,0,41.46,50.7,64.53,166.62l0-31.25C76.25,117,39.22,78.14,39.22,78.14,33.43,58,18.4,21,9.63,0Z"></path>
        <path class="tr-4" d="M0,0C8.31,19.77,25.25,61,31.49,82.67c0,0,47.85,37.48,69.2,172.5v-22C77.62,117.25,36.29,80,36.29,80c-6-20.75-21.74-59.39-30.36-80Z"></path>
      </g>
    </g>
  </svg>`;
}

function createBottomLeftSVG() {
  return `
  <svg
    class="svg-element svg-bottom-left"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 194.84 163.91">
    <defs>
      <linearGradient id="blg1" x1="7.92" y1="46.32" x2="187.27" y2="122.45" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#c2d6df"></stop>
        <stop offset="0.08" stop-color="#bacfd8"></stop>
        <stop offset="0.19" stop-color="#a5bbc6"></stop>
        <stop offset="0.33" stop-color="#829ba8"></stop>
        <stop offset="0.49" stop-color="#536e7f"></stop>
        <stop offset="0.56" stop-color="#3d5a6c"></stop>
        <stop offset="0.56" stop-color="#4b6777"></stop>
        <stop offset="0.57" stop-color="#6f8895"></stop>
        <stop offset="0.58" stop-color="#8fa5af"></stop>
        <stop offset="0.6" stop-color="#abbec5"></stop>
        <stop offset="0.61" stop-color="#c1d2d7"></stop>
        <stop offset="0.63" stop-color="#d2e1e4"></stop>
        <stop offset="0.65" stop-color="#ddecee"></stop>
        <stop offset="0.68" stop-color="#e4f2f3"></stop>
        <stop offset="0.77" stop-color="#e6f4f5"></stop>
        <stop offset="0.84" stop-color="#e4f2f4"></stop>
        <stop offset="0.87" stop-color="#ddecee"></stop>
        <stop offset="0.89" stop-color="#d2e2e5"></stop>
        <stop offset="0.9" stop-color="#c1d3d8"></stop>
        <stop offset="0.91" stop-color="#abbfc6"></stop>
        <stop offset="0.92" stop-color="#8fa7b1"></stop>
        <stop offset="0.93" stop-color="#708b98"></stop>
        <stop offset="0.94" stop-color="#698593"></stop>
        <stop offset="0.98" stop-color="#678493"></stop>
        <stop offset="0.99" stop-color="#608092"></stop>
        <stop offset="1" stop-color="#5a7d91"></stop>
      </linearGradient>
      <linearGradient id="blg2" x1="0" y1="84.94" x2="183.71" y2="84.94" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#476172"></stop>
        <stop offset="0.54" stop-color="#213c4d"></stop>
        <stop offset="0.77" stop-color="#465c69"></stop>
        <stop offset="1" stop-color="#355a6d"></stop>
      </linearGradient>
      <linearGradient id="blg3" x1="16.02" y1="41.81" x2="159.92" y2="142.57" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#b4cfda"></stop>
        <stop offset="0.04" stop-color="#a6bfcb"></stop>
        <stop offset="0.25" stop-color="#556775"></stop>
        <stop offset="0.39" stop-color="#233040"></stop>
        <stop offset="0.46" stop-color="#0f1b2b"></stop>
        <stop offset="0.52" stop-color="#111d2d"></stop>
        <stop offset="0.54" stop-color="#172433"></stop>
        <stop offset="0.56" stop-color="#222f3f"></stop>
        <stop offset="0.57" stop-color="#31404f"></stop>
        <stop offset="0.58" stop-color="#465664"></stop>
        <stop offset="0.59" stop-color="#5f727e"></stop>
        <stop offset="0.59" stop-color="#7c929e"></stop>
        <stop offset="0.6" stop-color="#9eb6c0"></stop>
        <stop offset="0.61" stop-color="#b9d4dd"></stop>
        <stop offset="0.76" stop-color="#b7d2db"></stop>
        <stop offset="0.82" stop-color="#b1cbd5"></stop>
        <stop offset="0.86" stop-color="#a6c0c9"></stop>
        <stop offset="0.89" stop-color="#96afb9"></stop>
        <stop offset="0.92" stop-color="#8299a4"></stop>
        <stop offset="0.95" stop-color="#697d8a"></stop>
        <stop offset="0.97" stop-color="#4b5d6b"></stop>
        <stop offset="0.99" stop-color="#2a3948"></stop>
        <stop offset="1" stop-color="#111e2e"></stop>
      </linearGradient>
    </defs>
    <g id="Calque_2" data-name="Calque 2">
      <g id="Calque_1-2" data-name="Calque 1">
        <path class="bl-1" d="M194.84,163.91H183.71c-9-4.44-14.69-7.61-14.69-7.61l-2.15-22.79-57.2-44.73-30.1,6C40.16,55.64,14.52,24.83,0,6V0C15.43,19.76,41.34,50.47,80.06,88.94l31.23-6.25,59.34,46.4,2.23,23.65S181.77,157.67,194.84,163.91Z"></path>
        <path class="bl-2" d="M183.71,163.91h-8c-6-3-9.62-5.06-9.62-5.06L164,136.78,108.6,93.48,79.45,99.31C39,59.12,13.54,28,0,10.14V6C14.52,24.83,40.16,55.64,79.57,94.8l30.1-6,57.2,44.73L169,156.3S174.74,159.47,183.71,163.91Z"></path>
        <path class="bl-3" d="M175.67,163.91H163.25l-2.45-1.33-2-21.2-53.2-41.6-28,5.6C37.43,65.47,12.65,34.88,0,18V10.14C13.54,28,39,59.12,79.45,99.31l29.15-5.83L164,136.78l2.08,22.07S169.68,160.86,175.67,163.91Z"></path>
        <path class="bl-4" d="M163.25,163.91H0V18c12.65,16.86,37.43,47.45,77.6,87.36l28-5.6,53.2,41.6,2,21.2Z"></path>
      </g>
    </g>
  </svg>`;
}

function createBottomRightSVG() {
  return `
  <svg
    class="svg-element svg-bottom-right"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 194.84 163.91">
    <defs>
      <linearGradient id="brg1" x1="186.92" y1="46.32" x2="7.57" y2="122.45" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#c2d6df"></stop>
        <stop offset="0.08" stop-color="#bacfd8"></stop>
        <stop offset="0.19" stop-color="#a5bbc6"></stop>
        <stop offset="0.33" stop-color="#829ba8"></stop>
        <stop offset="0.49" stop-color="#536e7f"></stop>
        <stop offset="0.56" stop-color="#3d5a6c"></stop>
        <stop offset="0.56" stop-color="#4b6777"></stop>
        <stop offset="0.57" stop-color="#6f8895"></stop>
        <stop offset="0.58" stop-color="#8fa5af"></stop>
        <stop offset="0.6" stop-color="#abbec5"></stop>
        <stop offset="0.61" stop-color="#c1d2d7"></stop>
        <stop offset="0.63" stop-color="#d2e1e4"></stop>
        <stop offset="0.65" stop-color="#ddecee"></stop>
        <stop offset="0.68" stop-color="#e4f2f3"></stop>
        <stop offset="0.77" stop-color="#e6f4f5"></stop>
        <stop offset="0.84" stop-color="#e4f2f4"></stop>
        <stop offset="0.87" stop-color="#ddecee"></stop>
        <stop offset="0.89" stop-color="#d2e2e5"></stop>
        <stop offset="0.9" stop-color="#c1d3d8"></stop>
        <stop offset="0.91" stop-color="#abbfc6"></stop>
        <stop offset="0.92" stop-color="#8fa7b1"></stop>
        <stop offset="0.93" stop-color="#708b98"></stop>
        <stop offset="0.94" stop-color="#698593"></stop>
        <stop offset="0.98" stop-color="#678493"></stop>
        <stop offset="0.99" stop-color="#608092"></stop>
        <stop offset="1" stop-color="#5a7d91"></stop>
      </linearGradient>
      <linearGradient id="brg2" x1="178.82" y1="41.81" x2="34.92" y2="142.57" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#b4cfda"></stop>
        <stop offset="0.04" stop-color="#a6bfcb"></stop>
        <stop offset="0.25" stop-color="#556775"></stop>
        <stop offset="0.39" stop-color="#233040"></stop>
        <stop offset="0.46" stop-color="#0f1b2b"></stop>
        <stop offset="0.52" stop-color="#111d2d"></stop>
        <stop offset="0.54" stop-color="#172433"></stop>
        <stop offset="0.56" stop-color="#222f3f"></stop>
        <stop offset="0.57" stop-color="#31404f"></stop>
        <stop offset="0.58" stop-color="#465664"></stop>
        <stop offset="0.59" stop-color="#5f727e"></stop>
        <stop offset="0.59" stop-color="#7c929e"></stop>
        <stop offset="0.6" stop-color="#9eb6c0"></stop>
        <stop offset="0.61" stop-color="#b9d4dd"></stop>
        <stop offset="0.76" stop-color="#b7d2db"></stop>
        <stop offset="0.82" stop-color="#b1cbd5"></stop>
        <stop offset="0.86" stop-color="#a6c0c9"></stop>
        <stop offset="0.89" stop-color="#96afb9"></stop>
        <stop offset="0.92" stop-color="#8299a4"></stop>
        <stop offset="0.95" stop-color="#697d8a"></stop>
        <stop offset="0.97" stop-color="#4b5d6b"></stop>
        <stop offset="0.99" stop-color="#2a3948"></stop>
        <stop offset="1" stop-color="#111e2e"></stop>
      </linearGradient>
      <linearGradient id="brg3" x1="194.84" y1="84.94" x2="11.13" y2="84.94" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#476172"></stop>
        <stop offset="0.54" stop-color="#213c4d"></stop>
        <stop offset="0.77" stop-color="#465c69"></stop>
        <stop offset="1" stop-color="#355a6d"></stop>
      </linearGradient>
    </defs>
    <g id="Calque_2" data-name="Calque 2">
      <g id="Calque_1-2" data-name="Calque 1">
        <path class="br-1" d="M0,163.91H11.13c9-4.44,14.69-7.61,14.69-7.61L28,133.51l57.2-44.73,30.1,6c39.41-39.16,65.05-70,79.57-88.83V0c-15.43,19.76-41.34,50.47-80.06,88.94L83.55,82.69l-59.34,46.4L22,152.74S13.07,157.67,0,163.91Z"></path>
        <path class="br-2" d="M19.17,163.91H31.59L34,162.58l2-21.2,53.2-41.6,28,5.6c40.17-39.91,65-70.5,77.6-87.36V10.14c-13.54,17.88-39,49-79.45,89.17L86.24,93.48l-55.37,43.3-2.08,22.07S25.16,160.86,19.17,163.91Z"></path>
        <path class="br-3" d="M34,162.58l-2.45,1.33H194.84V18c-12.65,16.86-37.43,47.45-77.6,87.36l-28-5.6L36,141.38Z"></path>
        <path class="br-4" d="M25.82,156.3s-5.72,3.17-14.69,7.61h8c6-3,9.62-5.06,9.62-5.06l2.08-22.07,55.37-43.3,29.15,5.83C155.83,59.12,181.3,28,194.84,10.14V6c-14.52,18.86-40.16,49.67-79.57,88.83l-30.1-6L28,133.51Z"></path>
      </g>
    </g>
  </svg>`;
}

function createBottomCenterSVG() {
  return `
  <svg
    class="svg-element svg-bottom-center"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 572.84 36.06">
    <defs>
      <linearGradient id="bcg1" x1="1.07" y1="22.94" x2="570.45" y2="22.94" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0f1b2b"></stop>
        <stop offset="0.16" stop-color="#111d2d"></stop>
        <stop offset="0.24" stop-color="#192534"></stop>
        <stop offset="0.31" stop-color="#273140"></stop>
        <stop offset="0.36" stop-color="#3a4351"></stop>
        <stop offset="0.41" stop-color="#525b66"></stop>
        <stop offset="0.46" stop-color="#717881"></stop>
        <stop offset="0.5" stop-color="#959aa1"></stop>
        <stop offset="0.54" stop-color="#bfc2c6"></stop>
        <stop offset="0.58" stop-color="#edeeef"></stop>
        <stop offset="0.58" stop-color="#f9f9f9"></stop>
      </linearGradient>
      <linearGradient id="bcg2" x1="2.03" y1="20.78" x2="571.66" y2="20.78" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1c3846"></stop>
        <stop offset="0.34" stop-color="#1d3948"></stop>
        <stop offset="0.47" stop-color="#203f4f"></stop>
        <stop offset="0.55" stop-color="#26485a"></stop>
        <stop offset="0.57" stop-color="#284b5e"></stop>
        <stop offset="0.6" stop-color="#2c4e61"></stop>
        <stop offset="0.86" stop-color="#496776"></stop>
        <stop offset="1" stop-color="#54707e"></stop>
      </linearGradient>
      <linearGradient id="bcg3" x1="0" y1="18.03" x2="572.84" y2="18.03" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3d5a6c"></stop>
        <stop offset="0.2" stop-color="#3f5c6d"></stop>
        <stop offset="0.28" stop-color="#466173"></stop>
        <stop offset="0.33" stop-color="#516b7c"></stop>
        <stop offset="0.37" stop-color="#627a88"></stop>
        <stop offset="0.41" stop-color="#788c99"></stop>
        <stop offset="0.44" stop-color="#94a3ae"></stop>
        <stop offset="0.47" stop-color="#b4bfc6"></stop>
        <stop offset="0.49" stop-color="#d8dee2"></stop>
        <stop offset="0.51" stop-color="#f4f5f7"></stop>
      </linearGradient>
    </defs>
    <g id="Calque_2" data-name="Calque 2">
      <g id="Calque_1-2" data-name="Calque 1">
        <polygon class="bc-1" points="568.79 36.06 1.31 36.06 1.49 35.79 285.01 14.08 568.61 35.8 568.79 36.06"></polygon>
        <polygon class="bc-2" points="570.45 36.06 568.79 36.06 568.61 35.8 285.01 14.08 1.49 35.79 1.31 36.06 1.07 36.06 2.03 34.22 285.4 9.81 569.38 34.28 570.45 36.06"></polygon>
        <polygon class="bc-3" points="571.66 36.06 570.45 36.06 569.38 34.28 285.4 9.81 2.03 34.22 2.43 33.47 286.33 5.5 570.31 33.48 571.66 36.06"></polygon>
        <polygon class="bc-4" points="572.84 36.06 571.66 36.06 570.31 33.48 286.33 5.5 2.43 33.47 2.03 34.22 1.5 34.27 0.43 36.06 0 36.06 2.49 30.82 286.47 0 286.39 0.02 570.36 30.84 572.84 36.06"></polygon>
      </g>
    </g>
  </svg>
`;
}
