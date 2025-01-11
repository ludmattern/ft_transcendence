import { handleRoute } from "/src/services/router.js";

export async function isClientAuthenticated() 
{
  const token = localStorage.getItem("authToken");
  if (token)
    return true;
  else
    return false;
}

export async function ensureAuthenticated(
  callback,
  allowUnauthenticated = false
) {
  const isAuthenticated = await isClientAuthenticated();

  if (allowUnauthenticated || isAuthenticated) {
    callback();
    return true;
  }
  handleRoute("/login");
  return false;
}

export async function logoutUser() {
  // Simule une requête API pour déconnecter l'utilisateur
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true; // Simule un succès (ou remplace par une logique réelle)
      if (success) {
        localStorage.removeItem("authToken"); // Suppression du jeton local
        resolve();
      } else {
        reject(new Error("Logout failed!"));
      }
    }, 500); // Délai simulé
  });
}

export async function loginUser(username, password) {

    try {
      const response = await fetch("/api/auth-service/logindb/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("authToken", "1234567890");
        console.log("Login successful!");
        handleRoute("/");

      } else {
        console.log("Login failed:", data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }  
  };

  export async function registerUser(id, password, email) {

    try {
      const response = await fetch("/api/auth-service/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: id,
          email: email,
          password: password,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        console.log("User registered successfully:", data);
        alert("Registration successful!");
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again later.");
    }
  }


// export async function loginUser(username, password) {
//   // Simule une requête API pour connecter l'utilisateur
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       const success = true; // Simule un succès (ou remplace par une logique réelle)
//       if (success) {
//         localStorage.setItem("authToken", "1234567890"); // Stockage du jeton local
//         resolve();
//       } else {
//         reject(new Error("Login failed!"));
//       }
//     }, 500); // Délai simulé
//   });
// }
