import { createComponent } from "/src/utils/component.js";

export const hudScreenEffect = createComponent({
  tag: "hudScreenEffect",

  render: () => `
	<div class="hud_screen-effect">
		<div class="hud_screen-effect"></div>
	</div>
  `,

  attachEvents: (el) => {
    // Fonction pour démarrer l'animation
    function startLightEffect() {
      el.querySelector('.hud_screen-effect').classList.add('light-animation');
    }

    // Lancer automatiquement l'effet au chargement
    startLightEffect();

    // Exposer la fonction pour pouvoir relancer l'effet dynamiquement
    el.startLightEffect = startLightEffect;
  }
});
