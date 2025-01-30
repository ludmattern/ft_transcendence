import { createComponent } from "/src/utils/component.js";
import { commMessage, infoPanelItem } from "/src/components/hud/index.js";
import { startAnimation } from "/src/components/hud/index.js";
import { getSocket } from "/src/services/socketManager.js";

// -------------------------------------
// MAIN COMPONENT
// -------------------------------------
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
        loadTabContent(tabName, tabContentContainer);
      })
    );

    // Par défaut, charger le premier onglet actif
    const activeTab = el.querySelector(".nav-link.active");
    if (activeTab) {
      loadTabContent(activeTab.dataset.tab, tabContentContainer);
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
 */
function loadTabContent(tabName, container) {
  // Vider le container existant
  container.innerHTML = "";

  if (tabName === "info") {
    // Pour l'onglet "INFO"
    fetch("/src/context/tabsContent.json")
      .then((response) => response.json())
      .then((data) => {
        const tabItems = data[tabName] || [];
        tabItems.forEach((item) => {
          const panelItem = infoPanelItem.render(item);
          container.insertAdjacentHTML("beforeend", panelItem);
          infoPanelItem.attachEvents(container.lastElementChild, item);
        });
        removeChatInput();
      })
      .catch((error) => {
        console.error(`Error loading tab content for ${tabName}:`, error);
      });
  } else if (tabName === "comm") {
    // 1) On charge l'historique depuis localStorage
    let tabItems = [];
    const storedHistory = localStorage.getItem("chatHistory");
    if (storedHistory) {
      try {
        tabItems = JSON.parse(storedHistory);
      } catch (err) {
        console.warn("Failed to parse chatHistory from localStorage:", err);
      }
    }

    // 2) Afficher l'historique
    // Convertir ici en string pour être sûr d'avoir le même type
    const userId = sessionStorage.getItem("userId").toString();

    tabItems.forEach((item) => {
      renderCommMessage(item, container, userId);
    });

    // 3) On installe l'input de chat
    setupChatInput(container);

    // 4) On initialise la WebSocket
    initializeWebSocketComm(container);
  }
}

/**
 * Affiche un message dans le conteneur "COMM" en utilisant `commMessage.render(...)`,
 * tout en gérant le regroupement si c'est le même auteur + même channel.
 */
function renderCommMessage(item, container, currentUserId) {
  // Forcer l'auteur au format string pour éviter tout souci de comparaison
  const authorAsString = item.author ? item.author.toString() : "";

  // On détermine si c'est nous (sortant) ou pas
  let isUser = (authorAsString === currentUserId);
  console.log("item.author", authorAsString);
  console.log("currentUserId", currentUserId);
  console.log("isUser ?", isUser);

  // Pour que commMessage sache si c'est un message user ou autre,
  // on force item.author = "USER" si isUser est vrai, sinon on laisse l'ID/pseudo initial.
  const displayAuthor = isUser ? "USER" : authorAsString;

  // Contrôler le channel pour que commMessage sache si c'est "Private" ou "General"
  let displayChannel = "General";
  if (item.channel && item.channel.toLowerCase() === "private") {
    displayChannel = "Private";
  }

  // On crée un "extendedItem" adapté à `commMessage` :
  const extendedItem = {
    ...item,
    isUser,                       // true si c'est notre message
    author: displayAuthor,        // "USER" ou "User 123..."
    channel: displayChannel,      // "General" ou "Private"
    timestamp: item.timestamp
  };

  // Vérifier si on peut "regrouper" (même author + channel) avec le dernier message
  const lastChild = container.lastElementChild;
  const isSameAuthorAndChannel =
    lastChild &&
    lastChild.dataset &&
    lastChild.dataset.author === displayAuthor &&
    lastChild.dataset.channel === displayChannel;

  if (isSameAuthorAndChannel) {
    // On ajoute juste un bloc de texte en dessous du précédent
    const msgText = `
      <div class="message-text" style="margin-top: 0.5rem;">
        ${extendedItem.message}
      </div>
    `;
    lastChild
      .querySelector(".message-content-wrapper")
      .insertAdjacentHTML("beforeend", msgText);
  } else {
    // On insère un nouveau bloc de message
    const panelItem = commMessage.render(extendedItem);
    container.insertAdjacentHTML("beforeend", panelItem);

    // Marquer l'élément pour le regroupement futur
    const appendedItem = container.lastElementChild;
    appendedItem.dataset.author = displayAuthor;
    appendedItem.dataset.channel = displayChannel;

    commMessage.attachEvents(appendedItem, extendedItem);
  }

  // Scroll en bas
  container.scrollTop = container.scrollHeight;
}

function setupChatInput() {
  const container = document.querySelector("#l-tab-content-container");

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
    container.insertAdjacentHTML("beforeend", inputContainer);
  }
}

/**
 * Supprime la zone de saisie pour les onglets autres que "COMM".
 */
function removeChatInput() {
  const inputContainer = document.getElementById("message-input-container");
  if (inputContainer) {
    inputContainer.remove();
  }
}

/**
 * Initialise la logique WebSocket (écoute et envoi de messages),
 * et gère l'historique dans le localStorage si on souhaite.
 */
function initializeWebSocketComm(container) {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    console.warn("No userId in sessionStorage. Cannot open chat socket.");
    return;
  }

  // Récupère ou crée la socket
  const chatSocket = getSocket("chat/" + userId);
  if (!chatSocket) {
    console.warn("Chat socket not initialized or user not authenticated.");
    return;
  }

  // Méthode pour envoyer un message
  function sendMessage(message, channel = "general") {
    if (!userId) {
      console.error("No userId. Cannot send message.");
      return;
    }
    const payload = {
      message,
      author: userId,
      channel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatSocket.send(JSON.stringify(payload));
    console.log("Sending message:", payload);
  }

  // -- Gère l'envoi via "Enter" --
  const mainContainer = document.querySelector("#l-tab-content-container");
  const inputField = mainContainer.querySelector("#message-input");
  const sendButton = mainContainer.querySelector("#send-button");

  if (inputField) {
    inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (inputField.value.trim() !== "") {
          sendMessage(inputField.value.trim());
          inputField.value = "";
        }
      }
    });
  }

  if (sendButton) {
    sendButton.addEventListener("click", () => {
      if (inputField && inputField.value.trim() !== "") {
        sendMessage(inputField.value.trim());
        inputField.value = "";
      }
    });
  }

  // -- Réception des messages du serveur --
  chatSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleIncomingMessage(data);
    } catch (error) {
      console.error("Error parsing incoming message:", error);
    }
  };

  function handleIncomingMessage(data) {
    // Exemple : { message, sender_id, channel, timestamp... }
    const { message, sender_id, channel, timestamp } = data;
    if (!message || !sender_id || !channel) {
      console.error("Invalid message format:", data);
      return;
    }

    const newItem = {
      message,
      author: sender_id,
      channel,
      timestamp: timestamp
    };

    // userId est toujours dans la portée, on l'utilise pour comparer
    renderCommMessage(newItem, container, userId.toString());
    storeMessageInLocalStorage(newItem);
  }

  /**
   * Enregistre un message dans le localStorage pour l'historique.
   */
  function storeMessageInLocalStorage(msg) {
    try {
      const historyString = localStorage.getItem("chatHistory");
      let history = [];
      if (historyString) {
        history = JSON.parse(historyString);
      }
      history.push(msg);
      localStorage.setItem("chatHistory", JSON.stringify(history));
    } catch (err) {
      console.error("Failed to store message in localStorage:", err);
    }
  }
}
