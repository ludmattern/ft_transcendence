import { createElement } from "/src/utils/mini_react.js";

// Generates a nav item with a link
function createNavItem(label, active = false) {
  return createElement(
    "li",
    { className: "nav-item" },
    createElement(
      "span",
      { className: `nav-link ${active ? "active" : ""}` },
      createElement("a", { href: "#", "data-tab": label.toLowerCase() }, label)
    )
  );
}

// Function to dynamically load content into tabs
export function loadTabContent(tabName, container, window) {
  fetch("/src/context/tabsContent.json")
    .then((response) => response.json())
    .then((data) => {
      const tabItems = data[tabName];
      if (tabItems) {
        // Clear the existing content
        container.innerHTML = "";

        tabItems.forEach((item) => {
          if (tabName === "comm") {
            // Vérifier si le dernier message appartient au même utilisateur et au même canal
            const lastChild = container.lastElementChild;
            const isSameAuthorAndChannel =
              lastChild &&
              lastChild.dataset &&
              lastChild.dataset.author === item.author &&
              lastChild.dataset.channel === (item.channel || "General");

            if (isSameAuthorAndChannel) {
              // Ajouter seulement le corps du message dans le dernier bloc
              const messageText = createElement(
                "div",
                {
                  className: "message-text",
                  style: `
					  margin-top: 0.5rem; 
					  font-size: 1rem; 
					`,
                },
                item.message
              );
              lastChild
                .querySelector(".message-content-wrapper")
                .appendChild(messageText);
            } else {
              // Créer un nouveau bloc si ce n'est pas le même auteur ou canal
              const panelItem = createCommPanelItem(item);
              panelItem.dataset.author = item.author; // Ajouter une donnée pour l'auteur
              panelItem.dataset.channel = item.channel || "General"; // Ajouter une donnée pour le canal
              container.appendChild(panelItem);

              // Ajouter un gestionnaire de clic pour afficher les boutons
              panelItem.addEventListener("click", () =>
                showContextMenu(item, panelItem)
              );
            }
          } else if (tabName === "info") {
            const panelItem = createInfoPanelItem(item);
            container.appendChild(panelItem);
          }
        });

        if (tabName === "comm") {
          // Chat-specific logic (input box)
          if (!document.getElementById("message-input")) {
            const inputContainer = createElement(
              "div",
              {
                className: "d-flex",
                style:
                  "flex-wrap: wrap; background: #ffffff07; position: absolute; width: 100%;",
                id: "message-input-container",
              },
              createElement("input", {
                type: "text",
                id: "message-input",
                placeholder: "Enter your message...",
                className: "form-control w-50 me-2 p-3",
                style: "flex: auto; color: var(--content-color);",
              }),
              createElement(
                "button",
                {
                  className: "btn btn-sm bi bi-send",
                },
                " Send"
              )
            );
            window.appendChild(inputContainer);
          }
        } else {
          // Remove input container if not in COMM
          const inputContainer = document.getElementById(
            "message-input-container"
          );
          if (inputContainer) {
            inputContainer.remove();
          }
        }
      }
    })
    .catch((error) => {
      console.error(`Error loading tab content for ${tabName}:`, error);
    });
}

function showContextMenu(item, messageElement) {
	const existingMenu = document.querySelector(".context-menu");

	if (existingMenu) {
	  // Identifier le message associé au menu existant
	  const associatedMessage = existingMenu.nextElementSibling;
  
	  // Supprimer le menu existant
	  existingMenu.remove();
  
	  // Si le clic est sur le même message, ne pas recréer de menu
	  if (associatedMessage === messageElement) {
		return;
	  }
	}
  
	// Exemple de JSON avec les statuts de l'auteur
	const userStatus = {
	  isFriend: true, // Exemple: mettre à jour selon votre logique
	  isBlocked: false, // Exemple: mettre à jour selon votre logique
	};
  
	// Créer le menu contextuel
	const contextMenu = createElement(
	  "div",
	  {
		className: "context-menu",
		style: `
		  display: flex; 
		  flex-direction: column; 
		  justify-content: space-between; 
		  align-items: center; 
		  padding: 0.5rem; 
		  background: rgba(255, 255, 255, 0.1);
		  color: var(--content-color); 
		  margin-bottom: 0.5rem; 
		  z-index: 10;
		`,
	  },
	  createElement(
		"div",
		{
		  className: "context-menu-buttons",
		  style: `
			display: flex; 
			justify-content: center; 
			align-items: center; 
			gap: 0.5rem; 
		  `,
		},
		createElement(
		  "button",
		  {
			className: "btn",
			onclick: () => handleFriendAction(userStatus.isFriend),
		  },
		  userStatus.isFriend ? "Remove" : "Add"
		),
		createElement(
		  "button",
		  {
			className: "btn",
			onclick: () => handleBlockAction(userStatus.isBlocked),
		  },
		  userStatus.isBlocked ? "Unblock" : "Block"
		),
		createElement(
		  "button",
		  {
			className: "btn",
			onclick: () => handleInviteAction(item.author),
		  },
		  "Invite"
		),
		createElement(
		  "button",
		  {
			className: "btn",
			onclick: () => handleProfileAction(item.author),
		  },
		  "Profile"
		),
		createElement(
		  "button",
		  {
			className: "btn",
			onclick: () => handleMessageAction(item.author),
		  },
		  "Message"
		)
	  )
	);
  
	// Insérer le menu contextuel au même niveau que le message (dans le container)
	const container = messageElement.parentNode;
	container.insertBefore(contextMenu, messageElement);
  
	const parentContainer = document.querySelector("#l-tab-content"); // Le conteneur parent spécifique
	parentContainer.scrollTo({
	  top: contextMenu.offsetTop - parentContainer.offsetTop, // Position relative au conteneur
	  behavior: "smooth", // Défilement fluide
	});
	

	// Cacher le menu lorsque l'utilisateur clique en dehors
	document.addEventListener(
	  "click",
	  (e) => {
		if (!container.contains(e.target)) {
		  contextMenu.remove();
		}
	  },
	  { once: true }
	);
  }
  

// Fonctions pour gérer les actions
function handleFriendAction(isFriend) {
  console.log(isFriend ? "Removing Friend" : "Adding Friend");
}

function handleBlockAction(isBlocked) {
  console.log(isBlocked ? "Unblocking User" : "Blocking User");
}

function handleInviteAction(author) {
  console.log(`Inviting ${author}`);
}

function handleProfileAction(author) {
  console.log(`Viewing profile of ${author}`);
}

function handleMessageAction(author) {
  console.log(`Messaging ${author}`);
}

function createInfoPanelItem(item) {
  const content =
    item.type === "friend_request"
      ? `Friend request from: `
      : `Tournament invite from: `;
  return createElement(
    "div",
    { className: "panel-item" },
    createElement("span", {}, content, createElement("b", {}, item.inviter)),
    item.actions
      ? createElement(
          "div",
          { className: "actions" },
          createElement("button", { className: "btn bi bi-check" }, "Accept"),
          createElement("button", { className: "btn bi bi-x" }, "Refuse")
        )
      : null
  );
}

function createCommPanelItem(item) {
  const isUser = item.author === "USER";
  const isPrivate = item.channel === "Private"; // Déterminer si le message est privé

  return createElement(
    "div",
    {
      className: `message ${isUser ? "user-message" : "other-message"}`,
      style: `
		  display: flex; 
		  padding: 1rem; 
		  ${
        isPrivate ? "color: #ffff59;" : "color: var(--content-color);"
      } /* Tout le texte en jaune pour les messages privés */
		`,
    },
    // Image de profil à gauche (seulement si ce n'est pas "USER")
    !isUser &&
      createElement("img", {
        className: "profile-picture",
        src: item.profilePicture || "https://via.placeholder.com/40",
        alt: `${item.author}'s profile picture`,
        style: `
			  width: 40px; 
			  height: 40px; 
			  object-fit: cover;
			`,
      }),
    // Contenu du message à droite
    createElement(
      "div",
      {
        className: "message-content-wrapper",
      },
      // En haut : Canal, Pseudo et Heure (Pseudo seulement si ce n'est pas "USER")
      createElement(
        "div",
        {
          className: "message-header",
        },
        createElement(
          "span",
          { className: "channel", style: "font-weight: light;" },
          isPrivate ? "[Private]" : "[General]" // "Private" si le message est privé
        ),
        !isUser &&
          createElement(
            "span",
            { className: "author", style: "font-weight: bold;" },
            item.author
          ),
        createElement(
          "span",
          { className: "timestamp", style: "font-size: 0.8rem;" },
          item.timestamp || "Just now"
        )
      ),
      // En bas : Message
      createElement(
        "div",
        {
          className: "message-text",
          style: `
			  margin-top: 0.5rem; 
			  font-size: 1rem;
			`,
        },
        item.message
      )
    )
  );
}

export function LeftSideWindow() {
  return createElement(
    "div",
    { className: "col-md-2-5 d-flex flex-column" },
    createElement(
      "div",
      {
        className: "l-side-window left-side-window",
        id: "l-tab-content-container",
      },
      createElement(
        "ul",
        { className: "nav nav-tabs" },
        createNavItem("INFO", true),
        createNavItem("COMM", false),
        createElement(
          "li",
          { className: "nav-item" },
          createElement(
            "div",
            { className: "container" },
            createElement(
              "div",
              {
                className: "left-side-window-expander active",
                id: "l-sw-expander",
              },
              createElement("span", { className: "l-line" }),
              createElement("span", { className: "l-line" }),
              createElement("span", { className: "l-line" })
            )
          )
        )
      ),
      createElement("div", { className: "l-tab-content", id: "l-tab-content" })
    )
  );
}

export function addPanelItem(container, inviter, actions = true) {
  // Create the new panel item using the inviter and actions values
  const newPanelItem = createPanelItem(inviter, actions);

  // Insert the new panel item before the delimiter
  const delimiter = container.firstChild;
  if (delimiter) {
    container.insertBefore(newPanelItem, delimiter);
  } else {
    // If there is no delimiter, just append the new panel item to the container
    container.appendChild(newPanelItem);
  }
}
