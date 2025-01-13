import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { registerUser } from "/src/services/auth.js";

export const subscribeForm = createComponent({
  tag: "subscribeForm",

  // Générer le HTML
  render: () => `
    <div id="subscribe-form" class="form-container">
      <h5>PILOT IDENTIFICATION - REGISTER</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="new-pilot-id">ID</label>
            <input type="text" id="new-pilot-id" name="new-pilot-id" class="form-control" required />
            <div id="error-message-id" class="text-danger mt-2" style="display: none;">Id already taken</div>
            <div id="bad-id" class="text-danger mt-2" style="display: none;">Id must contain between 6 and 20 char</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="new-password">Password</label>
            <input type="password" id="new-password" name="new-password" class="form-control" required />
            <div id="bad-pass-size" class="text-danger mt-2" style="display: none;">Password must contain between 6 and 20 char</div>
            <div id="bad-pass-upper" class="text-danger mt-2" style="display: none;">Password must have at least one uppercase char</div>
            <div id="bad-pass-lower" class="text-danger mt-2" style="display: none;">Password must have at least one lowercase char</div>
            <div id="bad-pass-special" class="text-danger mt-2" style="display: none;">Password must have at least one special char</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" class="form-control" required />
            <div id="error-message-pass" class="text-danger mt-2" style="display: none;">Password does not match</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control" required />
            <div id="error-message-mail" class="text-danger mt-2" style="display: none;">E-mail already taken</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-email">Confirm Email</label>
            <input type="email" id="confirm-email" name="confirm-email" class="form-control" required />
            <div id="error-message-mail2" class="text-danger mt-2" style="display: none;">E-mail does not match</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="language">Language</label>
            <select id="language" name="language" class="form-control p-3" required>
              <option value="french">French</option>
              <option value="english">English</option>
              <option value="german">German</option>
            </select>
          </div>
          <button type="submit" class="btn btn-block bi bi-check2-square">Register</button>
        </form>
        <div>
          <span>
            <p>Already flown? <a href="#" id="login-link" class="text-info">Log In</a></p>
          </span>
        </div>
      </span>
    </div>
  `,

  attachEvents: async (el) => {
    // Gestion du clic sur "Log In"
    el.querySelector("#login-link").addEventListener("click", (e) => {
      e.preventDefault();
      handleRoute("/login");
      console.debug("LoginForm loaded on click.");
    });
  
    // Gestion de la soumission du formulaire
    el.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Subscription form submitted!");
  
      // 1. Récupérer les valeurs du formulaire
      const { id, password, confirmPassword, mail, confirmMail } = getFormValues(el);
  
      // 2. Réinitialiser les messages d'erreur
      resetErrorMessages();
  
      // 3. Effectuer les validations dans l'ordre
      let canRegister = true;
  
      // Validation de l'ID
      if (!validateId(id)) {
        canRegister = false;
      }
  
      // Validation du password
      if (canRegister && !validatePassword(password)) {
        canRegister = false;
      }
  
      // Confirmation de password
      if (canRegister && !checkPasswordConfirmation(password, confirmPassword)) {
        canRegister = false;
      }
  
      // Confirmation d'email
      if (canRegister && !checkEmailConfirmation(mail, confirmMail)) {
        canRegister = false;
      }
  
      // 4. Si tout est valide, on tente l'inscription
      if (canRegister) {
        try {
          const check_register = await registerUser(id, password, mail);
          if (check_register) {
            handleRoute("/login");
            console.log("register successful!");
          }
        } catch (err) {
          console.error("register failed:", err.message);
          alert("register failed! Please try again.");
        }
      }
    });
  },
})
  

  /**
 * Récupère les valeurs du formulaire
 */
function getFormValues(el) {
  return {
    id: el.querySelector("#new-pilot-id").value,
    password: el.querySelector("#new-password").value,
    confirmPassword: el.querySelector("#confirm-password").value,
    mail: el.querySelector("#email").value,
    confirmMail: el.querySelector("#confirm-email").value,
  };
}

/**
 * Cache tous les messages d'erreur liés au formulaire
 */
function resetErrorMessages() {
  const errorIds = [
    "bad-id",
    "bad-pass-size",
    "bad-pass-upper",
    "bad-pass-lower",
    "bad-pass-special",
    "error-message-mail",
    "error-message-mail2",
    "error-message-pass",
  ];

  errorIds.forEach((errId) => {
    const el = document.getElementById(errId);
    if (el) el.style.display = "none";
  });
}

/**
 * Vérifie la validité de l'ID
 * @returns {boolean} true si valide, false sinon
 */
function validateId(id) {
  if (id.length < 6 || id.length > 20) {
    document.getElementById("bad-id").style.display = "block";
    return false;
  }
  return true;
}

/**
 * Vérifie la validité du mot de passe et affiche les erreurs correspondantes
 * @returns {boolean} true si valide, false sinon
 */
function validatePassword(password) {
  let isValid = true;

  // Taille
  if (password.length < 6 || password.length > 20) {
    document.getElementById("bad-pass-size").style.display = "block";
    isValid = false;
  }

  // Au moins une lettre minuscule
  const regexLower = /[a-z]/;
  if (!regexLower.test(password)) {
    document.getElementById("bad-pass-lower").style.display = "block";
    isValid = false;
  }

  // Au moins une lettre majuscule
  const regexUpper = /[A-Z]/;
  if (!regexUpper.test(password)) {
    document.getElementById("bad-pass-upper").style.display = "block";
    isValid = false;
  }

  // Au moins un caractère spécial
  const regexSpecial = /[@$!%*?&#^]/;
  if (!regexSpecial.test(password)) {
    document.getElementById("bad-pass-special").style.display = "block";
    isValid = false;
  }

  return isValid;
}

/**
 * Vérifie la concordance entre password et confirmPassword
 */
function checkPasswordConfirmation(password, confirmPassword) {
  if (password !== confirmPassword) {
    document.getElementById("error-message-pass").style.display = "block";
    return false;
  }
  return true;
}

/**
 * Vérifie la concordance entre mail et confirmMail
 */
function checkEmailConfirmation(mail, confirmMail) {
  if (mail !== confirmMail) {
    document.getElementById("error-message-mail2").style.display = "block";
    // On masque éventuellement l'autre message, si besoin
    document.getElementById("error-message-mail").style.display = "none";
    return false;
  }
  return true;
}
