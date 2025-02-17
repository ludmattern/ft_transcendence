import { createComponent } from "/src/utils/component.js";
import { playGame } from "/src/components/pong/play/utils.js";
import { showContextMenu } from "/src/components/hud/sideWindow/left/contextMenu.js";

export const infoPanelItem = createComponent({
  tag: "infoPanelItem",

  render: (item) => {
    const content =
      item.type === "friend_request"
        ? `Friend request from: `
        : `Tournament invite from: `;

    return `
      <div class="panel-item">
        <span>${content}<b class="author" style="cursor: pointer;">${item.inviter}</b></span>
        ${item.actions
          ? `<div class="actions">
               <button class="btn bi bi-check" id="accept-action">Accept</button>
               <button class="btn bi bi-x" id="refuse-action">Refuse</button>
             </div>`
          : ""}
      </div>`;
  },

  attachEvents: (el, item) => {
    const acceptButton = el.querySelector("#accept-action");
    const refuseButton = el.querySelector("#refuse-action");

    if (acceptButton) {
      acceptButton.addEventListener("click", () => {
        console.log(`Accepted ${item.inviter}'s request.`);
        const config = {
          gameMode: "private",
          action: "join",
          matchkey: "4",
          type: "fullScreen",
        };
        playGame(config);
        // Logique pour accepter la demande
      });
    }

    if (refuseButton) {
      refuseButton.addEventListener("click", () => {
        console.log(`Refused ${item.inviter}'s request.`);
        // Logique pour refuser la demande
      });
    }

	const authorElem = el.querySelector(".author");
	if (authorElem) {
	  authorElem.addEventListener("click", (e) => {
		e.preventDefault();
		showContextMenu(item, e);
	  });
	}
  },
});
