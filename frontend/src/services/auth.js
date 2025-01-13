import { handleRoute } from "/src/services/router.js";


export async function isClientAuthenticated() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No token found");
    return false;
  }

  try {
    const response = await fetch("/api/auth-service/check-auth/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 401) 
    {
      const errData = await response.json().catch(() => ({}));
      console.warn(errData.message || "Unauthorized");
      localStorage.removeItem("authToken");
      return false;
    }

    const data = await response.json();
    if (!data.success) {
      console.warn(data.message);
      localStorage.removeItem("authToken");
      return false;
    }

 
    if (data.new_access_token) {
      console.log("Got new token from backend");
      localStorage.setItem("authToken", data.new_access_token);
    }

    return true;
  } catch (error) {
    console.error("Error checking auth on backend:", error);
    return false;
  }
}


export async function ensureAuthenticated(callback, allowUnauthenticated = false) {
  const isAuthenticated = await isClientAuthenticated();
  if (!isAuthenticated) {
    if (allowUnauthenticated) {
      console.warn("User not authenticated but allowed to access route.");
      callback();
      return true;
    } else {
      console.warn(
        "User not authenticated or token expired. Redirecting to login."
      );
      handleRoute("/login");
      return false;
    }
  } else {
    if (allowUnauthenticated) {
      console.warn("User authenticated but not allowed to access this route.");
      handleRoute("/");
      return false;
    } else {
		console.log("User authenticated. Proceeding...");
		callback();
		return true;
	}
  }
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

// async function getProtectedData() {
//   const token = localStorage.getItem("authToken");
//   const response = await fetch("/api/auth-service/protected/", {
//     method: "GET",
//     headers: {
//       "Authorization": `Bearer ${token}`
//     }
//   });
//   const data = await response.json();
//   console.log(data);
// }

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
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) 
    {
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      console.log("Login successful!");
    } else {
      console.log("Login failed:", data.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

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



/*

12s -> pas de refresh -> 30s

22s -> refresh -> 52s

35s -> pas de refresh -> 52s

45s-> refresh ->1m15s

*/