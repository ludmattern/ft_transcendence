import { createComponent } from "/src/utils/component.js";

export const hudScreenEffect = createComponent({
  tag: "hudScreenEffect",

  render: () => `
	<div class="hud_screen-effect">
		<div class="hud_screen-effect"></div>
	</div>


	<style>

.light-animation {
  animation: fadeIn 2s ease-in-out 1 forwards;
}

@keyframes fadeIn {
  0%    { opacity: 0; }
  100%  { opacity: 1; }
}

	</style>
  `,

  attachEvents: (el) => {
    // Fonction pour démarrer l'animation
    function startLightEffect() {
      el.querySelector('.hud_screen-effect').classList.add('light-animation');
    }

    // Lancer automatiquement l'effet au chargement
    setTimeout(startLightEffect, 500);

    // Exposer la fonction pour pouvoir relancer l'effet dynamiquement
    el.startLightEffect = startLightEffect;
  }
});
