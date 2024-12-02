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
function loadTabContent(tabName, container) {
  fetch("../data/tabsContent.json")
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

// Generates the entire side window with tabs
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
    createElement("div", { className: "tab-content", id: "tab-content" })
  );
}
