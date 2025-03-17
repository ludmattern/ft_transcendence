import { createComponent } from '/src/utils/component.js';
import { startAnimation } from '/src/components/hud/utils/utils.js';

export const hudScreenEffect = createComponent({
	tag: 'hudScreenEffect',

	render: () => `
	<div class="hud_screen-effect">
		<div class="hud_screen-effect"></div>
	</div>
`,

	attachEvents: (el) => {
		const elements = el.querySelectorAll('.hud_screen-effect');

		if (elements.length > 0) {
			startAnimation(elements, 'light-animation');
		}
	},
});
