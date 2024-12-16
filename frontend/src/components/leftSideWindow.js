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
        const panelItems = tabItems.map((item) =>
          createPanelItem(item.inviter, item.actions)
        );

        // Clear the existing content
        container.innerHTML = "";

        // Append new elements to the container
        panelItems.forEach((panelItem) => {
          container.appendChild(panelItem);
        });
        console.log("Tabname:", tabName);
        // Check if the current tab is 'COMM'
        if (tabName === "comm") {
          console.log("Tab COMM loaded");
          // Check if the input container is already present
          if (!document.getElementById("message-input")) {
            // Create and append the input container
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
                className: "form-control w-50 me-2",
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
          // Remove the input container if it exists
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

// Generates a panel item
function createPanelItem(inviter, hasActions = false) {
  return createElement(
    "div",
    { className: "panel-item" },
    createElement(
      "span",
      {},
      `New tournament invite from : `,
      createElement("b", {}, inviter)
    ),
    hasActions
      ? createElement(
          "div",
          { className: "actions" },
          createElement("button", { className: "btn bi bi-check" }, "accept"),
          createElement("button", { className: "btn bi bi-x" }, "refuse")
        )
      : null
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
