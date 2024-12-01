document.addEventListener("DOMContentLoaded", function () {
  console.debug("Initializing the HUD");
  const expanders = document.querySelectorAll(".side-window-expander");
  const leftSideWindow = document.querySelector(".tab-content");

  expanders.forEach(function (expander) {
    expander.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  function checkOverflow() {
    if (leftSideWindow.scrollHeight > leftSideWindow.clientHeight) {
      leftSideWindow.classList.add("overflow");
    } else {
      leftSideWindow.classList.remove("overflow");
    }
  }

  checkOverflow();

  const observer = new MutationObserver(() => {
    checkOverflow(); // Vérifier l'overflow à chaque changement
  });

  observer.observe(leftSideWindow, {
    childList: true, // Observe les ajouts/suppressions d'enfants
    subtree: true, // Observe les changements dans les sous-arbres
    characterData: true, // Observe les changements dans le texte
  });
});
