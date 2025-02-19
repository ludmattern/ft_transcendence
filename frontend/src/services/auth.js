import { initializeWebSocket, closeWebSocket } from "/src/services/socketManager.js";


export async function isClientAuthenticated() {

  try {
		const response = await fetch("/api/auth-service/check-auth/", {
		method: "GET",
		credentials: "include"
		});
		const data = await response.json();
    console.log(data);

		if (response.status === 401) 
		{
			return false;
		}

		//const data = await response.json();
    //console.log(data);
		if (!data.success) {
		return false;
		}

		sessionStorage.setItem("userId", data.id);
		sessionStorage.setItem("username", data.username);
		
		initializeWebSocket(); 
    console.log("User is authenticated!");
		return true;
	} catch (error) {
		return false;
	}
}

export async function logoutUser() {
  try {
    const response = await fetch("/api/auth-service/logout/", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      closeWebSocket();

      console.log("Logout successful!");
    } else {
      console.log("Logout failed:", await response.text());
    }
  } catch (err) {
    console.log("Error during logout:", err);
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
    return data;
  }
  else
  {
	return (data.message);
  }
}

export async function registerUser(id, password, email, is2FAEnabled, twoFAMethod, phoneNumber) {
  try {
    const response = await fetch("/api/user-service/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: id,
        email: email,
        password: password,
        is_2fa_enabled: is2FAEnabled,
        twofa_method: is2FAEnabled ? twoFAMethod : null,
        phone_number: is2FAEnabled && twoFAMethod === "sms" ? phoneNumber : null
      }),
    });
    console.log(response);
    const data = await response.json();
    if (data.success) {
      return true;
    } else {
      if (data.message.includes("Username already taken")) {
        document.getElementById("error-message-id").style.display = "block";
      } else {
        document.getElementById("error-message-id").style.display = "none";
      }

      if (data.message.includes("Email already in use")) {
        document.getElementById("error-message-mail").style.display = "block";
        document.getElementById("error-message-mail2").style.display = "none";
      } else {
        document.getElementById("error-message-mail").style.display = "none";
      }
      return false;
    }
  } catch (error) {
    console.log("Error during registration:", error);
    alert("An error occurred. Please try again later.");
    return false;
  }
}

export async function verifyTwoFACode(username, twofaCode) {
  const response = await fetch("/api/auth-service/verify-2fa/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, twofa_code: twofaCode }),
    credentials: "include"
  });

  const data = await response.json();
  console.log(data);
  return data;
}
