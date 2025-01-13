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
  if (data.success) {
    console.log("Login successful (cookie set)!");
  } else {
    console.log("Login failed:", data.message);
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
