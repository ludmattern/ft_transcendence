// contextMenu.js
import { createComponent } from "/src/utils/component.js";

export const contextMenu = createComponent({
  tag: "contextMenu",

  // Génère le HTML du menu contextuel en fonction de l'item et d'un objet userStatus
  render: (item, userStatus) => `
    <div id="context-menu" class="context-menu">
      <ul>
        <li id="action-friend">${userStatus.isFriend ? "Remove Friend" : "Add Friend"}</li>
        <li id="action-block">${userStatus.isBlocked ? "Unblock" : "Block"}</li>
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
      handleMessageAction(item.author);
      hideContextMenu();
    });
  },
});

/**
 * Gestion des actions du menu contextuel.
 */
function handleFriendAction(isFriend, author) {
  if (isFriend) {
    console.log(`Removing ${author} from friends...`);
    // Logique pour supprimer un ami
  } else {
    console.log(`Adding ${author} as a friend...`);
    // Logique pour ajouter un ami
  }
}

function handleBlockAction(isBlocked, author) {
  if (isBlocked) {
    console.log(`Unblocking ${author}...`);
    // Logique pour débloquer un utilisateur
  } else {
    console.log(`Blocking ${author}...`);
    // Logique pour bloquer un utilisateur
  }
}

function handleInviteAction(author) {
  console.log(`Inviting ${author} to a game...`);
  // Logique pour envoyer une invitation
}

function handleProfileAction(author) {
  console.log(`Viewing profile of ${author}...`);
  // Logique pour afficher le profil de l'utilisateur
}

function handleMessageAction(author) {
  console.log(`Messaging ${author}...`);
  // Logique pour envoyer un message
}

/**
 * Affiche le menu contextuel à la position du clic droit.
 * @param {Object} item - L'objet associé au message.
 * @param {MouseEvent} event - L'événement contextmenu.
 */
export function showContextMenu(item, event) {
	console.log("showContextMenu");
  event.preventDefault();

  // Supprime un menu déjà existant s'il existe
  hideContextMenu();

  // Exemple d'objet userStatus (à adapter selon votre logique)
  const userStatus = {
    isFriend: false,
    isBlocked: false,
  };

  // Générer le HTML du menu et l'insérer dans le body
  const menuHTML = contextMenu.render(item, userStatus);
  document.body.insertAdjacentHTML("beforeend", menuHTML);
  const menuElement = document.getElementById("context-menu");

  // Positionner le menu à la position du clic
  menuElement.style.left = event.pageX + "px";
  menuElement.style.top = event.pageY + "px";
  menuElement.style.display = "block";

  // Attacher les événements aux boutons
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

// Cacher le menu lorsqu'on clique ailleurs
document.addEventListener("click", (e) => {
  if (!e.target.closest(".context-menu")) {
    hideContextMenu();
  }
});
