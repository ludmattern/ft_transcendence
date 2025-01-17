import { createComponent } from "/src/utils/component.js";
import { showContextMenu } from "/src/components/hud/sideWindow/left/contextMenu.js";

export const commMessage = createComponent({
  tag: "commMessage",

  render: (item) => {
    const isUser = item.author === "USER";
    const isPrivate = item.channel === "Private";

    return `
      <div class="message ${isUser ? "user-message" : "other-message"}" 
           style="display: flex; padding: 1rem; ${isPrivate ? "color: #ffff59;" : "color: var(--content-color);"}">
        ${
          !isUser
            ? `<img class="profile-picture" 
                   src="${item.profilePicture || "/src/assets/img/default-profile-40.png"}" 
                   alt="${item.author}'s profile picture" />`
            : ""
        }
        <div class="message-content-wrapper">
          <div class="message-header">
            <span class="channel">${isPrivate ? "[Private]" : "[General]"}</span>
            ${
              !isUser
                ? `<span class="author">${item.author}</span>`
                : ""
            }
            <span class="timestamp">${item.timestamp || "Just now"}</span>
          </div>
          <div class="message-text" style="margin-top: 0.5rem;">
            ${item.message}
          </div>
        </div>
      </div>
    `;
  },

  attachEvents: (el, item) => {
    el.addEventListener("click", () => showContextMenu(item, el));
  },
});
