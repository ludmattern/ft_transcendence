import { createComponent } from "/src/utils/component.js";

export const contextMenu = createComponent({
  tag: "contextMenu",

  // Générer le HTML du menu contextuel
  render: (item, userStatus) => `
    <div class="context-menu" 
         style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); color: var(--content-color); margin-bottom: 0.5rem; z-index: 10;">
      <div class="context-menu-buttons" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
        <button class="btn" id="friend-action">${userStatus.isFriend ? "Remove" : "Add"}</button>
        <button class="btn" id="block-action">${userStatus.isBlocked ? "Unblock" : "Block"}</button>
        <button class="btn" id="invite-action">Invite</button>
        <button class="btn" id="profile-action">Profile</button>
        <button class="btn" id="message-action">Message</button>
      </div>
    </div>
  `,

  // Attacher les événements aux boutons
  attachEvents: (el, item, userStatus) => {
    el.querySelector("#friend-action").addEventListener("click", () =>
      handleFriendAction(userStatus.isFriend, item.author)
    );
    el.querySelector("#block-action").addEventListener("click", () =>
      handleBlockAction(userStatus.isBlocked, item.author)
    );
    el.querySelector("#invite-action").addEventListener("click", () =>
      handleInviteAction(item.author)
    );
    el.querySelector("#profile-action").addEventListener("click", () =>
      handleProfileAction(item.author)
    );
    el.querySelector("#message-action").addEventListener("click", () =>
      handleMessageAction(item.author)
    );
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

export function showContextMenu(item, messageElement) {
	const existingMenu = document.querySelector(".context-menu");
  
	// Vérifie si le message appartient à l'utilisateur
	const isUserMessage = item.author === "USER"; // Ajuster cette logique selon vos données
	if (isUserMessage) {
	  return;
	}
  
	if (existingMenu) {
	  const associatedMessage = existingMenu.nextElementSibling;
  
	  // Supprime le menu existant
	  existingMenu.remove();
  
	  // Si le clic est sur le même message, ne recrée pas de menu
	  if (associatedMessage === messageElement) {
		return;
	  }
	}
  
	// Exemple des statuts utilisateur
	const userStatus = {
	  isFriend: true, // Exemple : mettre à jour selon votre logique
	  isBlocked: false, // Exemple : mettre à jour selon votre logique
	};
  
	// Générer et attacher le menu contextuel
	const menuHTML = contextMenu.render(item, userStatus);
	messageElement.insertAdjacentHTML("beforebegin", menuHTML);
  
	const menuElement = messageElement.previousElementSibling;
	contextMenu.attachEvents(menuElement, item, userStatus);
  
	// Ajoute un défilement fluide pour positionner le menu visible dans le conteneur parent
	const parentContainer = document.querySelector("#l-tab-content"); // Conteneur parent
	if (parentContainer) {
	  parentContainer.scrollTo({
		top: menuElement.offsetTop - parentContainer.offsetTop, // Position relative au conteneur
		behavior: "smooth", // Défilement fluide
	  });
	}
  }
  