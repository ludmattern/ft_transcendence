import { createComponent } from "/src/utils/component.js";
import { commMessage, infoPanelItem } from "/src/components/hud/index.js";
import { startAnimation } from "/src/components/hud/index.js";
import { setupLiveChatEvents } from "/src/components/hud/sideWindow/left/liveChat.js";

export const leftSideWindow = createComponent({
  tag: "leftSideWindow",

  // Générer le HTML
  render: () => `
    <div class="d-flex flex-column">
      <div class="l-side-window left-side-window" id="l-tab-content-container">
        <ul class="nav nav-tabs">
          ${createNavItem("INFO", true)}
          ${createNavItem("COMM", false)}
          <li class="nav-item">
            <div class="container">
              <div class="left-side-window-expander active" id="l-sw-expander">
                <span class="l-line"></span>
                <span class="l-line"></span>
                <span class="l-line"></span>
              </div>
            </div>
          </li>
        </ul>
        <div class="l-tab-content" id="l-tab-content"></div>
      </div>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    const tabContentContainer = el.querySelector("#l-tab-content");
    const tabs = el.querySelectorAll(".nav-link");
    const expanders = el.querySelectorAll(".left-side-window-expander");
    const leftSideWindow = el.querySelector(".l-tab-content");

    if (!expanders.length || !leftSideWindow) {
      console.warn("Expanders or left-side window not found in component.");
      return;
    }

    expanders.forEach((expander) => {
      expander.addEventListener("click", () => {
        expander.classList.toggle("active");
        leftSideWindow.classList.toggle("well-hidden");
      });
    });

    // Gérer le clic sur les onglets
    tabs.forEach((tab) =>
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;

        // Mettre à jour l'état actif des onglets
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Charger le contenu correspondant
        loadTabContent(tabName, tabContentContainer, el);
      })
    );

    // Par défaut, charger le premier onglet actif
    const activeTab = el.querySelector(".nav-link.active");
    if (activeTab) {
      loadTabContent(activeTab.dataset.tab, tabContentContainer, el);
    }

	const parentContainer = el.parentElement;
    startAnimation(parentContainer, "light-animation", 1000);

  },
});

/**
 * Génère un élément de navigation (onglet) avec un lien.
 *
 * @param {string} label - Le label de l'onglet
 * @param {boolean} active - Si l'onglet est actif
 * @returns {string} - HTML de l'onglet
 */
function createNavItem(label, active = false) {
  return `
    <li class="nav-item">
      <span class="nav-link ${
        active ? "active" : ""
      }" data-tab="${label.toLowerCase()}">
	  	<a href="#" data-tab="${label.toLowerCase()}">${label}</a>
	  </span>
    </li>
  `;
}

/**
 * Charge dynamiquement le contenu de l'onglet spécifié.
 *
 * @param {string} tabName - Le nom de l'onglet
 * @param {HTMLElement} container - Conteneur pour le contenu de l'onglet
 * @param {HTMLElement} window - Fenêtre englobante
 */
function loadTabContent(tabName, container, window) {
  fetch("/src/context/tabsContent.json")
    .then((response) => response.json())
    .then((data) => {
      const tabItems = data[tabName];
      if (tabItems) {
        container.innerHTML = ""; // Nettoyer le contenu existant

        tabItems.forEach((item) => {
          if (tabName === "comm") {
            handleCommTab(item, container);
          } else if (tabName === "info") {
            const panelItem = infoPanelItem.render(item);
            container.insertAdjacentHTML("beforeend", panelItem);
            infoPanelItem.attachEvents(container.lastElementChild, item);
          }
        });

        if (tabName === "comm") {
          setupChatInput();
          setupLiveChatEvents();
        } else {
          removeChatInput();
        }
      }
    })
    .catch((error) => {
      console.error(`Error loading tab content for ${tabName}:`, error);
    });
}

/**
 * Gère le contenu spécifique à l'onglet "COMM".
 */
function handleCommTab(item, container) {
  const lastChild = container.lastElementChild;
  const isSameAuthorAndChannel =
    lastChild &&
    lastChild.dataset &&
    lastChild.dataset.author === item.author &&
    lastChild.dataset.channel === (item.channel || "General");

  if (isSameAuthorAndChannel) {
    const messageText = `
      <div class="message-text" style="margin-top: 0.5rem;">
        ${item.message}
      </div>
    `;
    lastChild
      .querySelector(".message-content-wrapper")
      .insertAdjacentHTML("beforeend", messageText);
  } else {
    const panelItem = commMessage.render(item);
    container.insertAdjacentHTML("beforeend", panelItem);

    const appendedItem = container.lastElementChild;
    appendedItem.dataset.author = item.author;
    appendedItem.dataset.channel = item.channel || "General";

    commMessage.attachEvents(appendedItem, item);
  }
}

/**
 * Configure la zone d'entrée pour l'onglet "COMM".
 */
function setupChatInput() {
  const container = document.querySelector("#l-tab-content-container"); // Sélectionne le conteneur approprié

  if (!container) {
    console.error("l-tab-content-container not found.");
    return;
  }

  if (!container.querySelector("#message-input-container")) {
    const inputContainer = `
		<div class="d-flex" 
			 style="flex-wrap: wrap; background: #ffffff07; position: absolute; width: 100%;" 
			 id="message-input-container">
		  <input type="text" id="message-input" placeholder="Enter your message..." 
				 class="form-control w-50 me-2 p-3" 
				 style="flex: auto; color: var(--content-color);" />
		  <button class="btn btn-sm bi bi-send">Send</button>
		</div>
	  `;
    container.insertAdjacentHTML("beforeend", inputContainer); // Ajoute dans le bon conteneur
  }
}

/**
 * Supprime la zone d'entrée pour les onglets autres que "COMM".
 */
function removeChatInput() {
  const inputContainer = document.getElementById("message-input-container");
  if (inputContainer) {
    inputContainer.remove();
  }
}
