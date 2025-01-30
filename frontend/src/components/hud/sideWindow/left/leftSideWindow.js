import { createComponent } from "/src/utils/component.js";
import { commMessage, infoPanelItem } from "/src/components/hud/index.js";
import { startAnimation } from "/src/components/hud/index.js";
import { getSocket } from "/src/services/socketManager.js";

export const leftSideWindow = createComponent({
  tag: "leftSideWindow",

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

    tabs.forEach((tab) =>
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;

        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        loadTabContent(tabName, tabContentContainer);
      })
    );

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
  container.innerHTML = "";

  if (tabName === "info") {
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
    // On charge l'historique depuis sessionStorage
    let tabItems = [];
    const storedHistory = sessionStorage.getItem("chatHistory");
    if (storedHistory) {
      try {
        tabItems = JSON.parse(storedHistory);
      } catch (err) {
        console.warn("Failed to parse chatHistory from sessionStorage:", err);
      }
    }

    // Convertir ici en string pour être sûr d'avoir le même type
    const userId = sessionStorage.getItem("userId").toString();

    tabItems.forEach((item) => {
      renderCommMessage(item, container, userId);
    });

    setupChatInput(container);

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

  let isUser = (authorAsString === currentUserId);
  console.log("item.author", authorAsString);
  console.log("currentUserId", currentUserId);
  console.log("isUser ?", isUser);

  const displayAuthor = isUser ? "USER" : authorAsString;

  let displayChannel = "General";
  if (item.channel && item.channel.toLowerCase() === "private") {
    displayChannel = "Private";
  }

  const extendedItem = {
    ...item,
    isUser,                       // true si c'est notre message
    author: displayAuthor,        // "USER" ou "User 123..."
    channel: displayChannel,      // "General" ou "Private"
    timestamp: item.timestamp
  };

  const lastChild = container.lastElementChild;
  let isSameAuthorAndChannel =
    lastChild &&
    lastChild.dataset &&
    lastChild.dataset.author === displayAuthor &&
    lastChild.dataset.channel === displayChannel;

  if (isSameAuthorAndChannel) {
	const lastTimeStr = lastChild.dataset.rawtimestamp;
	if (lastTimeStr) {
		const lastDate = new Date(lastTimeStr);
		const newDate = new Date(extendedItem.timestamp);
		if (!isNaN(lastDate) && !isNaN(newDate)) {
			const diffMs = newDate - lastDate;
			if (diffMs > 60_000) {
				isSameAuthorAndChannel = false;
			}
		}
	}
}
if (isSameAuthorAndChannel) {
    const msgText = `
      <div class="message-text" style="margin-top: 0.5rem;">
        ${extendedItem.message}
      </div>
    `;
    lastChild
      .querySelector(".message-content-wrapper")
      .insertAdjacentHTML("beforeend", msgText);

  } else {
    const panelItem = commMessage.render(extendedItem);
    container.insertAdjacentHTML("beforeend", panelItem);

    const appendedItem = container.lastElementChild;
    appendedItem.dataset.author = displayAuthor;
    appendedItem.dataset.channel = displayChannel;

	const newDate = new Date(extendedItem.timestamp);
	if (!isNaN(newDate)) {
		appendedItem.dataset.timestamp = newDate.toISOString();
	}

    commMessage.attachEvents(appendedItem, extendedItem);
  }

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
 * et gère l'historique dans le sessionStorage si on souhaite.
 */
function initializeWebSocketComm(container) {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    console.warn("No userId in sessionStorage. Cannot open chat socket.");
    return;
  }

  const chatSocket = getSocket("chat/" + userId);
  if (!chatSocket) {
    console.warn("Chat socket not initialized or user not authenticated.");
    return;
  }

  function sendMessage(message, channel = "general") {
    if (!userId) {
      console.error("No userId. Cannot send message.");
      return;
    }
    const payload = {
      message,
      author: userId,
      channel,
      timestamp: new Date().toISOString()
    };

    chatSocket.send(JSON.stringify(payload));
    console.log("Sending message:", payload);
  }

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

  chatSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleIncomingMessage(data);
    } catch (error) {
      console.error("Error parsing incoming message:", error);
    }
  };

  function handleIncomingMessage(data) {
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

    renderCommMessage(newItem, container, userId.toString());
    storeMessageInSessionStorage(newItem);
  }

  /**
   * Enregistre un message dans le sessionStorage pour l'historique.
   */
  function storeMessageInSessionStorage(msg) {
    try {
      const historyString = sessionStorage.getItem("chatHistory");
      let history = [];
      if (historyString) {
        history = JSON.parse(historyString);
      }
      history.push(msg);
      sessionStorage.setItem("chatHistory", JSON.stringify(history));
    } catch (err) {
      console.error("Failed to store message in sessionStorage:", err);
    }
  }
}
