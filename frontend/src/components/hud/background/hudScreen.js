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
		const element = el.querySelectorAll('.hud_screen-effect');

		startAnimation(element, 'light-animation');
	},
});
