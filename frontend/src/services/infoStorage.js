import { getUserIdFromCookieAPI } from "/src/services/auth.js";

export async function pushInfo(key, value) {
  const userId = await getUserIdFromCookieAPI();

  const response = await fetch("/api/user-service/storage/push/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id: userId, key, value })
  });
  const data = await response.json();
  console.log("pushInfo result:", data);
}

export async function getInfo(key) {
  const userId = await getUserIdFromCookieAPI();

  const url = `/api/user-service/storage/get/?user_id=${encodeURIComponent(userId)}&key=${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: "GET"
  });
  const data = await response.json();
  console.log("getInfo result:", data);
  return data;
}

export async function deleteInfo(key) {
  const userId = await getUserIdFromCookieAPI();

  const url = `/api/user-service/storage/delete/?user_id=${encodeURIComponent(userId)}&key=${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: "DELETE"
  });
  const data = await response.json();
  console.log("deleteInfo result:", data);
  return data;
}