import { createElement } from "../utils/mini_react.js";

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
export function loadTabContent(tabName, container) {
  fetch("../src/context/tabsContent.json")
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

        // Append the delimiter at the end of the content
        const delimiter = createElement("span", { className: "panel-end" });
        container.appendChild(delimiter);
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

export function SideWindow() {
  return createElement(
    "div",
    { className: "side-window left-side-window" },
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
            { className: "side-window-expander active", id: "l-sw-expander" },
            createElement("span", { className: "line" }),
            createElement("span", { className: "line" }),
            createElement("span", { className: "line" })
          )
        )
      )
    ),
    // Add a button to add notifications
    createElement(
      "div",
      { className: "add-notification-btn-container" },
      createElement(
        "button",
        {
          className: "btn btn-primary",
          id: "add-notification-button",
          onclick: () => {
            const container = document.getElementById("tab-content");
            addPanelItem(container, "NEW_INVITER_NAME", true);
          },
        },
        "Add Notification"
      )
    ),
    createElement("div", { className: "tab-content", id: "tab-content" })
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
