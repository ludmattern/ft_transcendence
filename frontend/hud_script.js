// Function to handle transitions between forms with animations
function switchForm(showFormId) {
  const forms = [
    "login-form",
    "subscribe-form",
    "settings-form",
    "delete-account-form",
    "logout-form",
  ];

  const navLinks = [
    "enlist-link",
    "login-link",
    "settings-link",
    "logout-link",
    "home-link",
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

    // Remove d-none class from #central-window if it's hidden
    if (centralWindow) {
      centralWindow.classList.remove("d-none");
    }
  } else {
    // Add d-none class to #central-window for home-link
    if (centralWindow) {
      centralWindow.classList.add("d-none");
    }
  }

  // Add active class to the corresponding nav link
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
      "login-form": "login-link",
      "subscribe-form": "enlist-link",
      "settings-form": "settings-link",
      "delete-account-form": "settings-link", // Delete is part of settings
      "logout-form": "logout-link",
    };
    return mapping[formId] || null; // Return null if no match
  }
  
  // Event listeners for navigation links
  document.getElementById("enlist-link").addEventListener("click", function (e) {
    e.preventDefault();
    switchForm("subscribe-form");
  });
  
  document.getElementById("login-link").addEventListener("click", function (e) {
    e.preventDefault();
    switchForm("login-form");
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
    switchForm(null); // No form is shown
  });

  document.addEventListener("DOMContentLoaded", function () {
    const expanders = document.querySelectorAll(".side-window-expander");
    const leftSideWindow = document.querySelector('.tab-content');

    expanders.forEach(function (expander) {
        expander.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    });

    function checkOverflow() {
        if (leftSideWindow.scrollHeight > leftSideWindow.clientHeight) {
            leftSideWindow.classList.add('overflow');
        } else {
            leftSideWindow.classList.remove('overflow');
        }
    }

    checkOverflow();

    const observer = new MutationObserver(() => {
        checkOverflow(); // Vérifier l'overflow à chaque changement
    });

    observer.observe(leftSideWindow, {
        childList: true, // Observe les ajouts/suppressions d'enfants
        subtree: true, // Observe les changements dans les sous-arbres
        characterData: true, // Observe les changements dans le texte
    });
});
