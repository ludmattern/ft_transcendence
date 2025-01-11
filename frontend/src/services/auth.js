import { handleRoute } from "/src/services/router.js";

function parseJwt(token)
{
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
}



export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("No refresh token found");
    return false;
  }

  try {
    const response = await fetch("/api/auth-service/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("authToken", data.access_token);
      console.log("Access token refreshed");
      return true;
    } else {
      console.error("Failed to refresh token");
      return false;
    }
  } catch (error) {
    console.error("Error during token refresh:", error);
    return false;
  }
}

export async function isClientAuthenticated() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No token found");
    return false;
  }

  const decoded = parseJwt(token);
  const currentTime = Math.floor(Date.now() / 1000);

  if (decoded.exp - currentTime < 0) {
    localStorage.removeItem("authToken");
    return false;
  }
  else if (decoded.exp - currentTime < 60) {
    console.log("Token near expiration. Attempting to refresh...");
    const refreshed = await refreshAccessToken();
    return refreshed;
  }
  return true;
}


export async function ensureAuthenticated(callback, allowUnauthenticated = false) {
  const isAuthenticated = await isClientAuthenticated();
  getProtectedData();
  if (allowUnauthenticated || isAuthenticated) 
  {
    callback();
    return true;
  }

  console.warn("User not authenticated or token expired. Redirecting to login.");
  handleRoute("/login");
  return false;
}



export async function logoutUser() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        localStorage.removeItem("authToken");
        resolve();
      } else {
        reject(new Error("Logout failed!"));
      }
    }, 500);
  });
}

async function getProtectedData() {
  const token = localStorage.getItem("authToken");
  const response = await fetch("/api/auth-service/protected/", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data);
}

// function startTokenRefreshInterval() {
//   setInterval(async () => {
//     const isAuthenticated = await isClientAuthenticated();
//     if (!isAuthenticated) {
//       console.warn("User is no longer authenticated. Redirecting to login...");
//       handleRoute("/login");
//     }
//   }, 60000); // Vérifie toutes les 60 secondes
// }


export async function loginUser(username, password) {
  try {
    const response = await fetch("/api/auth-service/logindb/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
      // Récupérer le token
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      console.log("Login successful!");
      //startTokenRefreshInterval(); // Lancer le rafraîchissement automatique
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