// contextMenu.js
import { createComponent } from "/src/utils/component.js";
import { waitForElement } from "/src/components/hud/utils/utils.js";
import { ws } from "/src/services/socketManager.js";

export const contextMenu = createComponent({
  tag: "contextMenu",

  // Génère le HTML du menu contextuel en fonction de l'item et d'un objet userStatus
  render: (item, userStatus) => `
    <div id="context-menu" class="context-menu">
      <ul>
        <li id="action-friend">${userStatus.isFriend ? "Remove Friend" : "Add Friend"
    }</li>
        <li id="action-block">Block</li>
        <li id="action-invite">Invite</li>
        <li id="action-profile">Profile</li>
        <li id="action-message">Message</li>
      </ul>
    </div>
  `,

  // Attache les événements aux boutons du menu
  attachEvents: (el, item, userStatus) => {
    el.querySelector("#action-friend").addEventListener("click", () => {
      handleFriendAction(userStatus.isFriend, item.author);
      hideContextMenu();
    });
    el.querySelector("#action-block").addEventListener("click", () => {
      handleBlockAction(userStatus.isBlocked, item.author);
      hideContextMenu();
    });
    el.querySelector("#action-invite").addEventListener("click", () => {
      handleInviteAction(item.author);
      hideContextMenu();
    });
    el.querySelector("#action-profile").addEventListener("click", () => {
      handleProfileAction(item.author);
      hideContextMenu();
    });
    el.querySelector("#action-message").addEventListener("click", () => {
      handleMessageAction(item.username);
      hideContextMenu();
    });
  },
});

/**
 * @param {HTMLElement} el - Élément racine du formulaire
 * @returns {Object} - Données collectées du formulaire
 */
function bodyData(author) {
  return {
    userId: sessionStorage.getItem("userId"),
    selectedUserId: author,
  };
}

/**
 * Gestion des actions du menu contextuel.
 */

async function handleFriendAction(isFriend, author) {
	let action;
	if (isFriend) {
		action = "remove_friend";
		console.log(`Removing ${author} from friends...`);
	} else {
		action = "send_friend_request";
		console.log(`Adding ${author} to friends...`);
	}
	// Common payload structure
	const payload = {
	type: "info_message",
	action,
	author: sessionStorage.getItem("userId"),
	recipient: author,
	timestamp: new Date().toISOString(),
	};

	ws.send(JSON.stringify(payload));
}

async function handleBlockAction(isBlocked, author) {
  if (isBlocked) {
    console.log(`Unblocking ${author}...`);
    // Logique pour débloquer un utilisateur
    const response = await fetch("/api/user-service/unblock/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData(author)),
    });
    const data = await response.json();
    if (data.success) {
      console.log(`User: ${author} unblocked successfully by ${sessionStorage.getItem("username")}`
      );
    } else {
      console.log("Error updating information:");
    }
  } else {
    console.log(`Blocking ${author}...`);
    // Logique pour bloquer un utilisateur
    const response = await fetch("/api/user-service/block/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData(author)),
    });
    const data = await response.json();
    if (data.success) {
      console.log(`User: ${author} blocked  successfully by ${sessionStorage.getItem("username")}`
      );
    } else {
      console.log("Error updating information");
    }
  }
}

function handleInviteAction(author) {
  console.log(`Inviting ${author} to a game...`);
  // Logique pour envoyer une invitation pour une partie privee
}

function handleProfileAction(author) {
  console.log(`Viewing profile of ${author}...`);
  // Logique pour afficher le profil de l'utilisateur
}

function handleMessageAction(author) {
  console.log(`Messaging ${author}...`);

  // Vérifie si l'onglet actif n'est pas "comm"
  const activeTab = document.querySelector(".nav-link.active");
  if (activeTab && activeTab.dataset.tab !== "comm") {
    // Simule un clic sur l'onglet "comm"
    const commTab = document.querySelector('.nav-link[data-tab="comm"]');
    if (commTab) {
      commTab.click();
    }
    // Attend que le champ de saisie dans le conteneur "#l-tab-content-container" soit présent
    waitForElement("#l-tab-content-container #message-input")
      .then((inputField) => {
        inputField.value = "@" + author + " ";
        inputField.focus();
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // Si on est déjà dans l'onglet "comm"
    const inputField = document.querySelector("#l-tab-content-container #message-input");
    if (inputField) {
      inputField.value = "@" + author + " ";
      inputField.focus();
    }
  }
}

/**
 * Affiche le menu contextuel à la position du clic droit.
 * @param {Object} item - L'objet associé au message.
 * @param {MouseEvent} event - L'événement contextmenu.
 */
export async function showContextMenu(item, event) {
  console.log("showContextMenu");
  event.preventDefault();
  event.stopPropagation();

  hideContextMenu();

  const isFriend = await isUserFriend(sessionStorage.getItem("userId"), item.author);

  const userStatus = {
    isFriend: isFriend,
    isBlocked: false,
  };


  const menuHTML = contextMenu.render(item, userStatus);
  document.body.insertAdjacentHTML("beforeend", menuHTML);
  const menuElement = document.getElementById("context-menu");

  menuElement.style.left = event.pageX + "px";
  menuElement.style.top = event.pageY + "px";
  menuElement.style.display = "block";

  contextMenu.attachEvents(menuElement, item, userStatus);
}

/**
 * Cache et supprime le menu contextuel s'il existe.
 */
export function hideContextMenu() {
  const menuElement = document.getElementById("context-menu");
  if (menuElement) {
    menuElement.remove();
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".context-menu")) {
    hideContextMenu();
  }
});

export async function isUserFriend(userId, otherUserId) {
	console.log(`Checking if ${userId} is friends with ${otherUserId}...`);
	const response = await fetch("/api/user-service/is-friend/", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId: userId, otherUserId: otherUserId }),
	});
	const data = await response.json();
	if (data.success) {
		return data.is_friend;
	} else {
		console.log("Error getting friend status");
		return false;
	}
}