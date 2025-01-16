import { createComponent } from "/src/utils/component.js";

export const soloContent = createComponent({
  tag: "soloContent",

  // Générer le HTML
  render: () => `
	<section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
		<h2>Solo</h2>
		<p>You're only authorised to play this game in supraliminal navigation mode.</p>
		<p>Stay focused on the instruments during the game.</p>
		<p>A little reminder, you're not payed to play, you're payed to work Pilot.</p>
	</section>
  `,
});
