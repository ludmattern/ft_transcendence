import { createComponent } from "/src/utils/component.js";
import { startAnimation } from "/src/components/hud/index.js";
import { setupLiveChatEvents } from "/src/components/hud/sideWindow/left/liveChat.js";

export const leftSideWindow = createComponent({
  tag: "leftSideWindow",

  // Generate the HTML
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
              </div>
            </div>
          </li>
        </ul>
        <!-- Separate divs for INFO and COMM -->
        <div id="l-tab-content-info" class="l-tab-content-info" style="display: block; overflow-y: auto; height: 100%; max-height: 300px;">
          <div class="info-message">
            <p>Welcome to the INFO tab! Add your informational content here.</p>
          </div>
        </div>
        <div id="l-tab-content-comm" class="l-tab-content-comm d-flex flex-column" style="display: none; overflow: hidden; height: 100%; max-height: 300px;">
          <!-- Messages container -->
          <div class="messages-container" id="messages-container" style="flex-grow: 1; overflow-y: auto; padding: 10px;">
            <!-- Chat messages will be dynamically added here -->
          </div>
          <!-- Message input container -->
          <div class="message-input-container" id="message-input-container" style="display: flex; padding: 10px; background: #ffffff07;">
            <input type="text" id="message-input" placeholder="Enter your message..." 
                   class="form-control w-75 me-2 p-2" style="flex: 1; color: var(--content-color);" />
            <button id="send-button" class="btn btn-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  `,

  // Attach events after rendering
  attachEvents: (el) => {
    const tabs = el.querySelectorAll(".nav-link");
    const infoTabContent = el.querySelector("#l-tab-content-info");
    const commTabContent = el.querySelector("#l-tab-content-comm");

    if (!infoTabContent || !commTabContent) {
      console.error("INFO or COMM content containers not found.");
      return;
    }

    // Handle tab switching
    tabs.forEach((tab) =>
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;

        // Update active state
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Toggle visibility of tab content
        if (tabName === "info") {
          infoTabContent.style.display = "block";
          commTabContent.style.display = "none"; // Fully hide COMM content
          clearCommMessages(); // Clear COMM messages when switching to INFO
          removeChatInput(); // Remove input field when switching to INFO
        } else if (tabName === "comm") {
          infoTabContent.style.display = "none";
          commTabContent.style.display = "flex"; // Show COMM content
          setupChatInput(); // Add input field when switching to COMM
          setupLiveChatEvents();
        }
      })
    );

    // Load the default active tab
    const activeTab = el.querySelector(".nav-link.active");
    if (activeTab) {
      const tabName = activeTab.dataset.tab;
      if (tabName === "info") {
        infoTabContent.style.display = "block";
        commTabContent.style.display = "none";
        clearCommMessages();
        removeChatInput();
      } else if (tabName === "comm") {
        infoTabContent.style.display = "none";
        commTabContent.style.display = "flex";
        setupChatInput();
        setupLiveChatEvents();
      }
    }

    const parentContainer = el.parentElement;
    startAnimation(parentContainer, "light-animation", 1000);
  },
});

/**
 * Generates a navigation tab item.
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
 * Dynamically adds the input field and send button for the COMM tab.
 */
function setupChatInput() {
  const commTabContent = document.querySelector("#l-tab-content-comm");

  if (!commTabContent) {
    console.error("COMM content container not found.");
    return;
  }

  if (!document.querySelector("#message-input-container")) {
    const inputContainer = `
      <div class="message-input-container" id="message-input-container" style="display: flex; padding: 10px; background: #ffffff07; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <input type="text" id="message-input" placeholder="Enter your message..." 
               class="form-control w-75 me-2 p-2" style="flex: 1; color: var(--content-color);" />
        <button id="send-button" class="btn btn-primary">Send</button>
      </div>
    `;
    commTabContent.insertAdjacentHTML("beforeend", inputContainer);
  }
}

/**
 * Removes the input field and send button when switching away from the COMM tab.
 */
function removeChatInput() {
  const inputContainer = document.querySelector("#message-input-container");
  if (inputContainer) {
    inputContainer.remove();
  }
}

/**
 * Clears all messages from the COMM tab when switching to another tab.
 */
function clearCommMessages() {
  const messagesContainer = document.querySelector("#messages-container");
  if (messagesContainer) {
    messagesContainer.innerHTML = ""; // Clear all messages
  }
}
