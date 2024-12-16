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
        const panelItems =
          tabName === "info"
            ? tabItems.map((item) => createInfoPanelItem(item))
            : tabItems.map((item) => createCommPanelItem(item));

        // Clear the existing content
        container.innerHTML = "";

        // Append new elements to the container
        panelItems.forEach((panelItem) => {
          container.appendChild(panelItem);
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
                "Send"
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
	return createElement(
	  "div",
	  {
		className: `message ${isUser ? "user-message" : "other-message"}`,
		style: `
		  display: flex; 
		  align-items: center; 
		  padding: 1rem; 
		  color: var(--content-color);
		`,
	  },
	  // Image de profil à gauche
	  createElement(
		"img",
		{
		  className: "profile-picture",
		  src: item.profilePicture || "https://via.placeholder.com/40",
		  alt: `${item.author}'s profile picture`,
		  style: `
			width: 40px; 
			height: 40px; 
			object-fit: cover;
		  `,
		}
	  ),
	  // Contenu du message à droite
	  createElement(
		"div",
		{
		  className: "message-content-wrapper",
		},
		// En haut : Canal, Pseudo et Heure
		createElement(
		  "div",
		  {
			className: "message-header",
		  },
		  createElement(
			"span",
			{ className: "channel", style: "font-weight: bold;" },
			item.channel || "General"
		  ),
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
			  color: var(--content-color);
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
