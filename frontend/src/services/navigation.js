import { switchwindow } from "/src/3d/animation.js";
import { renderPage } from "/src/pages/hud/pageRenderer.js";
import { renderPongPage } from "/src/pages/pong/pongRenderer.js";

export function navigateToSocial() {
  renderPage("social");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToLogin() {
  renderPage("login");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToSubscribe() {
  renderPage("subscribe");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToDeleteAccount() {
  renderPage("deleteAccount");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToHome() {
  renderPage("home");
  document.getElementById("blur-screen-effect").classList.add("d-none");
  switchwindow("home");
}

export function navigateBackToPong() {
	switchwindow("pong");
	renderPage("pong");
	document.getElementById("blur-screen-effect").classList.add("d-none");
}

export function navigateToProfile() {
  renderPage("profile");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToPong(subroute = null) {
  if (!subroute) {
    renderPage("pong");
	renderPongPage("home");
  } else {
    renderPongPage(subroute);
  }
  switchwindow("pong");
  document.getElementById("blur-screen-effect").classList.add("d-none");
}

export function navigateToRace() {
  renderPage("race");
  document.getElementById("blur-screen-effect").classList.add("d-none");
  switchwindow("race");
}

export function navigateToOtherProfile(argument) {
  if (argument) {
    renderPage("otherprofile");
    document.getElementById("blur-screen-effect").classList.remove("d-none");
  }
}

export function navigateToSettings() {
  renderPage("settings");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToLogout() {
  renderPage("logout");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToLost() {
  renderPage("lostForm");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateTo2FA() {
  renderPage("twoFAForm");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}

export function navigateToSettings2FA() {
  renderPage("qrcode");
  document.getElementById("blur-screen-effect").classList.remove("d-none");
}