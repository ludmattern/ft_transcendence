import { createComponent } from "/src/utils/component.js";
import { playGame } from "/src/components/pong/play/utils.js";
import { showContextMenu } from "/src/components/hud/sideWindow/left/contextMenu.js";

export const infoPanelItem = createComponent({
  tag: "infoPanelItem",

  render: (item) => {
    const content = titleType(item.type);

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

    switch (item) {
      case (item.type === "friend_request"):
        behaviorFriendRequest(el, item);
      case (item.type === "tournament_invite"):
        behaviorTournament(el, item);
      case (item.type === "tournament_next_game"):
        behaviorTournamentGame();
      case (item.type === "private_game_invite"):
        behaviorPrivateGame();
      case (item.type === "miscellaneous"):
        behaviorMiscellaneous();
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

function titleType(type) {
  switch (type) {
    case ("friend_request"):
      return `Friend request from: `;
    case ("tournament_invite"):
      return `Tournament invite from: `;
    case ("private_game_invite"):
      return `Private game invite from: `;
    case ("tournament_next_game"):
      return `Next game in tournament: `;
    case ("miscellaneous"):
      return `Miscellaneous: `;
  }
}

function bodyData(item) {
  return {
    inviter: item.inviter,
  };
}

function behaviorTournament(el, item) {
  // const acceptButton = el.querySelector("#accept-action");
  // const refuseButton = el.querySelector("#refuse-action");

  // if (acceptButton) {
  //   acceptButton.addEventListener("click", () => {
  //     console.log(`Accepted ${item.inviter}'s request.`);
  //     const config = {
  //       gameMode: "private",
  //       action: "join",
  //       matchkey: "4",
  //       type: "fullScreen",
  //     };
  //     playGame(config);
  //     // Logique pour accepter la demande
  //   });
  // }

  // if (refuseButton) {
  //   refuseButton.addEventListener("click", () => {
  //     console.log(`Refused ${item.inviter}'s request.`);
  //     // Logique pour refuser la demande
  //   });
  // }
}

function behaviorTournamentGame(el, item) {
  // const acceptButton = el.querySelector("#accept-action");
  // const refuseButton = el.querySelector("#refuse-action");

  // if (acceptButton) {
  //   acceptButton.addEventListener("click", () => {
  //     console.log(`Accepted ${item.inviter}'s request.`);
  //     // Logique pour accepter la demande
  //   });
  // }

  // if (refuseButton) {
  //   refuseButton.addEventListener("click", () => {
  //     console.log(`Refused ${item.inviter}'s request.`);
  //     // Logique pour refuser la demande
  //   });
  // }
}

function behaviorPrivateGame(el, item) {
  // const acceptButton = el.querySelector("#accept-action");
  // const refuseButton = el.querySelector("#refuse-action");

  // if (acceptButton) {
  //   acceptButton.addEventListener("click", () => {
  //     console.log(`Accepted ${item.inviter}'s request.`);
  //     // Logique pour accepter la demande
  //   });
  // }

  // if (refuseButton) {
  //   refuseButton.addEventListener("click", () => {
  //     console.log(`Refused ${item.inviter}'s request.`);
  //     // Logique pour refuser la demande
  //   });
  // }
}

function behaviorMiscellaneous(el, item) {
  // const discardButton = el.querySelector("#discard-action");

  // if (discardButton) {
  //   discardButton.addEventListener("click", () => {
  //     console.log(`Discarding ${item}.`);
  //   });
  // }
}

function behaviorFriendRequest(el, item) {
  const acceptButton = el.querySelector("#accept-action");
  const refuseButton = el.querySelector("#refuse-action");

  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      console.log(`Accepted ${item.inviter}'s request.`);
      acceptFriendRequestQuery(el, item);
    });
  };
  if (refuseButton) {
    refuseButton.addEventListener("click", () => {
      console.log(`Refused ${item.inviter}'s request.`);
      rejectFriendRequestQuery(el, item);
    });
  }
}

async function acceptFriendRequestQuery(el, item) {

  const reponse = await fetch("/api/friends/accept-friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData(el, item)),
  });
  const data = await reponse.json();
  if (data.success) {
    console.log("Friend request accepted");
  }
  else {
    console.log("Error accepting friend request");
  }
}

async function rejectFriendRequestQuery(el, item) {

  const reponse = await fetch("/api/friends/reject-friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData(el, item)),
  });
  const data = await reponse.json();
  if (data.success) {
    console.log("Friend request rejected");
  }
  else {
    console.log("Error rejecting friend request");
  }
}