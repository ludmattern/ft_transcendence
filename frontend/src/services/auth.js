import { initializeWebSocket } from "/src/services/socketManager.js";


export async function isClientAuthenticated() {

  try {
    const response = await fetch("/api/auth-service/check-auth/", {
      method: "GET",
      credentials: "include"
    });

    if (response.status === 401) 
    {
      const errData = await response.json().catch(() => ({}));
      return false;
    }

    const data = await response.json();
    if (!data.success) {
      return false;
    }

    const ws = new WebSocket(`wss://` + window.location.host + `/ws/gateway/`);
	console.log("🔌 Tentative de connexion au WebSocket Gateway...")
	ws.onerror = (error) => {
		console.error("❌ Erreur de connexion au WebSocket Gateway :", error);
	};

	ws.onopen = () => {
		console.log("✅ Connecté au WebSocket Gateway !");
		ws.send(JSON.stringify({
			type: "chat_message",
			sender_id: "userA",
			message: "Salut tout le monde !",
			timestamp: new Date().toISOString()
		}));
		console.log("📤 Message envoyé !");
	};

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📩 Message reçu :", data);
	};

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

  if (data.success) {
    sessionStorage.setItem("userId", data.id);
    sessionStorage.setItem("username", data.username);
    return data;

  } else {
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
  return data;
}
