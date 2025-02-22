import { createComponent } from '/src/utils/component.js';
import { toggleFreeView } from '/src/3d/freeViewHandler.js';
import { startAnimation } from '/src/components/hud/index.js';

export const freeViewButton = createComponent({
	tag: 'freeViewButton',

	render: () => `
	<button class="btn bi mb-4 pb-4 pe-auto" id="free-view">free view</button>
  `,

	attachEvents: (el) => {
		el.querySelector('#free-view').addEventListener('click', toggleFreeView);

		const freeViewParent = el.parentElement;

		if (!freeViewParent.dataset.animated) {
			startAnimation(freeViewParent, 'light-animation', 1000);
			freeViewParent.dataset.animated = 'true';
		}
	},
});
