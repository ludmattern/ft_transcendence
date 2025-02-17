// src/components/hud/notifications.js

let notificationBuffer = [];

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 * puis s'effondre en douceur avant d'être retirée du DOM.
 *
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=5000] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
 */
function collapseNotification(notification) {
  notification.classList.add("collapsing");

  notification.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "height") {
      notification.removeEventListener("transitionend", handler);
      notification.remove();

      processNotificationBuffer();
    }
  });
}

/**
 * Traite les notifications en attente dans la file d'attente.
 */
function processNotificationBuffer() {
  const container = document.getElementById("bottom-notification-container");
  while (container.childElementCount < 3 && notificationBuffer.length > 0) {
    const { message, duration } = notificationBuffer.shift();
    createNotificationMessage(message, duration);
  }
}

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 *
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=2500] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
 */
export function createNotificationMessage(message, duration = 2500) {
  const container = document.getElementById("bottom-notification-container");
  if (!container) {
    console.error("Le container de notification n'a pas été trouvé.");
    return;
  }

  if (container.childElementCount >= 3) {
    notificationBuffer.push({ message, duration });
    return;
  }

  const notification = document.createElement("div");
  notification.classList.add("notification-message");
  notification.innerHTML = message;
  container.appendChild(notification);

  notification.offsetWidth;
  notification.classList.add("visible");

  setTimeout(() => {
    notification.classList.remove("visible");
    setTimeout(() => {
      collapseNotification(notification);
    }, 300);
  }, duration);
}

export function removePrivateNotifications() {
  notificationBuffer = notificationBuffer.filter(({ message }) => {
    return !(message && message.includes("private message"));
  });
  console.log(
    "Buffer après suppression des private messages:",
    notificationBuffer
  );
}
