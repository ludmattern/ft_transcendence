import { createComponent } from '/src/utils/component.js';

export const loadingScreen = createComponent({
	tag: 'loadingScreen',

	render: () => `
	<div id="loading-screen" class="d-flex justify-content-center align-items-center">
		<span class="loader"></span>
	</div>
  `,
});
