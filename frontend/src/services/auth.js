import { handleRoute } from "/src/services/router.js";


export async function isClientAuthenticated() {

  try {
    const response = await fetch("/api/auth-service/check-auth/", {
      method: "GET",
      credentials: "include"
    });

    if (response.status === 401) 
    {
      const errData = await response.json().catch(() => ({}));
      console.warn(errData.message || "Unauthorized");
      return false;
    }

    const data = await response.json();
    if (!data.success) {
      console.warn(data.message);
      return false;
    }
    if (data.new_access_token) {
      console.log("Got new token from backend");
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
  try {
    const response = await fetch("/api/auth-service/logout/", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {

      console.log("Logout successful!");
    } else {
      console.error("Logout failed:", await response.text());
    }
  } catch (err) {
    console.error("Error during logout:", err);
  }
}

export async function loginUser(username, password) {
  const response = await fetch("/api/auth-service/logindb/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });
  const data = await response.json();
  if (data.success) 
  {
    console.log("Login successful (cookie set)!");
  } else {
    console.log("Login failed:", data.message);
    const err = document.getElementById("error-message");
    err.style.display = "block";
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
    if (data.success) 
    {
      console.log("User registered successfully:", data);
      return true;
    } 
    else
    {
      if (data.message.includes("Username already taken")) 
      {
        document.getElementById("error-message-id").style.display = "block";
        return false;
      }
      else
      {
        document.getElementById("error-message-id").style.display = "none";
      }
      if (data.message.includes("Email already in use")) 
      {
        document.getElementById("error-message-mail").style.display = "block";
        document.getElementById("error-message-mail2").style.display = "none";
        return false;
      }
      else
      {
        document.getElementById("error-message-mail").style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again later.");
    return false;
  }
}
