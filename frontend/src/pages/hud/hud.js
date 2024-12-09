import { switchwindow } from "../../App.js";

// Function to handle transitions between forms with animations
export function switchForm(showFormId) {
  const forms = [
    "profile-form",
    "pong-form",
    "race-form",
    "social-form",
    "login-form",
    "subscribe-form",
    "settings-form",
    "delete-account-form",
    "logout-form",
	"other-profile-form",
  ];

  const navLinks = [
    "profile-link",
    "pong-link",
    "race-link",
    "social-link",
    "enlist-link",
    "login-link",
    "settings-link",
    "logout-link",
    "home-link",
	"other-profile-link",
  ];

  const centralWindow = document.getElementById("central-window");

  // Hide all forms with animation
  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.classList.remove("active"); // Remove active class for animation
      setTimeout(() => {
        form.style.display = "none"; // Hide form after animation
      }, 100); // Match the CSS transition duration
    }
  });

  // Remove active class from all nav links
  navLinks.forEach((linkId) => {
    const link = document.getElementById(linkId);
    if (link) {
      link.classList.remove("active");
    }
  });

  // Show the target form with animation
  const showForm = document.getElementById(showFormId);
  if (showForm) {
    setTimeout(() => {
      showForm.style.display = "block"; // Ensure the form is visible
      setTimeout(() => showForm.classList.add("active"), 10); // Add active class for animation
    }, 100);

    if (centralWindow) {
      centralWindow.classList.remove("d-none");
    }
  } else {
    if (centralWindow) {
      centralWindow.classList.add("d-none");
    }
  }

  const correspondingLinkId = getLinkIdByForm(showFormId);
  if (correspondingLinkId) {
    const activeLink = document.getElementById(correspondingLinkId);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
}

// Map form IDs to their corresponding nav link IDs
function getLinkIdByForm(formId) {
  const mapping = {
    "profile-form": "profile-link",
    "pong-form": "pong-link",
    "race-form": "race-link",
    "social-form": "social-link",
    "login-form": "login-link",
    "subscribe-form": "enlist-link",
    "settings-form": "settings-link",
    "delete-account-form": "settings-link", // Delete is part of settings
    "logout-form": "logout-link",
	"other-profile-form": "social-link",
  };
  return mapping[formId] || null; // Return null if no match
}

// Event listeners for navigation links
document.getElementById("other-profile-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("other-profile-form");
});

document.getElementById("enlist-link").addEventListener("click", function (e) {
	e.preventDefault();
	switchForm("subscribe-form");
  });

document.getElementById("login-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("login-form");
});

document.getElementById("profile-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("profile-form");
});

document.getElementById("pong-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("pong-form");
  switchwindow("pong");
});

document.getElementById("race-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("race-form");
  switchwindow("race");
});

document.getElementById("social-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("social-form");
});

document
  .getElementById("settings-link")
  .addEventListener("click", function (e) {
    e.preventDefault();
    switchForm("settings-form");
  });

document
  .getElementById("delete-account-link")
  .addEventListener("click", function (e) {
    e.preventDefault();
    switchForm("delete-account-form");
  });

document.getElementById("logout-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm("logout-form");
});

document.getElementById("home-link").addEventListener("click", function (e) {
  e.preventDefault();
  switchForm(null);
  switchwindow(null);
});
