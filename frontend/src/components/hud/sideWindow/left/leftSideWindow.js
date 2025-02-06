import { createComponent } from "/src/utils/component.js";
import { commMessage, infoPanelItem } from "/src/components/hud/index.js";
import { startAnimation } from "/src/components/hud/index.js";
import { ws } from "/src/services/socketManager.js";

let notificationbuffer = [];

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
	<div class="d-flex flex-column">
		<div id="bottom-notification-container">
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

	createNotificationMessage("5Bienvenue sur le serveur5Bienvenue sur le");
	createNotificationMessage("Bienvenue sur le serveur !");
	createNotificationMessage("1Bienvenue sur le serveur !");
	createNotificationMessage("2Bienvenue sur le serveur !");
	createNotificationMessage("3Bienvenue sur le serveur !");
	createNotificationMessage("4Bienvenue sur le serveur !");
	createNotificationMessage("6Bienvenue sur le serveur !");
	createNotificationMessage("7Bienvenue sur le serveur !");
	createNotificationMessage("8Bienvenue sur le serveur !");
	createNotificationMessage("9Bienvenue sur le serveur !");
	createNotificationMessage("10Bienvenue sur le serveur !");
	createNotificationMessage("11Bienvenue sur le serveur !");
	createNotificationMessage("12Bienvenue sur le serveur !");
	createNotificationMessage("13Bienvenue sur le serveur !");
	createNotificationMessage("14Bienvenue sur le serveur !");
	createNotificationMessage("15Bienvenue sur le serveur !");
	createNotificationMessage("16Bienvenue sur le serveur !");

  },
});

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 * puis s'effondre en douceur avant d'être retirée du DOM.
 *
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=5000] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
 */
function collapseNotification(notification) {
	notification.classList.add('collapsing');
  
	notification.addEventListener('transitionend', function handler(e) {
	  if (e.propertyName === 'height') {
		notification.removeEventListener('transitionend', handler);
		notification.remove();

		processNotificationBuffer();
	  }
	});
  }

/**
 * Traite les notifications en attente dans la file d'attente.
 */
function processNotificationBuffer() {
	const container = document.getElementById("bottom-notification-container");
	while (container.childElementCount < 3 && notificationbuffer.length > 0) {
	  const { message, duration } = notificationbuffer.shift();
	  createNotificationMessage(message, duration);
	}
}
  

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 * 
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=5000] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
 * @returns {void}
 */
  function createNotificationMessage(message, duration = 5000) {
	const container = document.getElementById("bottom-notification-container");
	if (!container) {
	  console.error("Le container de notification n'a pas été trouvé.");
	  return;
	}
	
	if (container.childElementCount >= 3) {
	  notificationbuffer.push({ message, duration });
	  return;
	}
  
	const notification = document.createElement("div");
	notification.classList.add("notification-message");
	notification.innerHTML = message;
	container.appendChild(notification);
  
	notification.offsetWidth;
	notification.classList.add("visible");
	
	setTimeout(() => {
	  notification.classList.remove("visible");
	  setTimeout(() => { 
		collapseNotification(notification); 
	  }, 300);
	}, duration);
 }

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
	<span class="nav-link ${active ? "active" : ""}" data-tab="${label.toLowerCase()}">
		<a href="#" data-tab="${label.toLowerCase()}">${label}</a>
	</span>
	</li>`;
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
    let tabItems = [];
    const storedHistory = sessionStorage.getItem("chatHistory");
    if (storedHistory) {
      try {
        tabItems = JSON.parse(storedHistory);
      } catch (err) {
        console.warn("Failed to parse chatHistory from sessionStorage:", err);
      }
    }

    const userId = sessionStorage.getItem("userId").toString();
    const username = sessionStorage.getItem("username").toString();
    console.log(username);
    tabItems.forEach((item) => {
      renderCommMessage(item, container, userId, username);
    });

    setupChatInput(container);
  }
}

/**
 * Affiche un message dans le conteneur "COMM" en utilisant `commMessage.render(...)`,
 * tout en gérant le regroupement si c'est le même auteur + même channel.
 */
function renderCommMessage(item, container, currentUserId, username) {
  // Forcer l'auteur au format string pour éviter tout souci de comparaison
  const authorAsString = item.author ? item.author.toString() : "";

  let isUser = authorAsString === currentUserId;
  const displayAuthor = isUser ? "USER" : authorAsString;

  let displayChannel = "General";
  if (item.channel && item.channel.toLowerCase() === "private") {
    displayChannel = "Private";
  }

  const extendedItem = {
    ...item,
    isUser, // true si c'est notre message
    author: displayAuthor, // "USER" ou "User 123..."
    channel: displayChannel, // "General" ou "Private"
    timestamp: item.timestamp,
    username: username,
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
		<button id="chat-send-button" class="btn btn-sm">Send</button>
		</div>
	`;
    container.insertAdjacentHTML("beforeend", inputContainer);
  }

  const inputField = container.querySelector("#message-input");
  const sendButton = container.querySelector("#chat-send-button");

  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    console.error("No userId. Cannot send message.");
    return;
  }

  function sendMessage(message, channel = "general") {
    const payload = {
      type: "chat_message",
      message,
      author: userId,
      channel,
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(payload));
  }

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


export function handleIncomingMessage(data) {
  const { message, author, channel, timestamp, username } = data;

  const newItem = {
    message,
    author: author,
    channel,
    timestamp: timestamp,
    username: username,
  };

  const userId = sessionStorage.getItem("userId");
  const container = document.getElementById("l-tab-content");

  const activeTab = document.querySelector(".nav-link.active");
  if (activeTab && activeTab.dataset.tab === "comm") {
    renderCommMessage(newItem, container, userId.toString(), username);
  }

  storeMessageInSessionStorage(newItem);
}
