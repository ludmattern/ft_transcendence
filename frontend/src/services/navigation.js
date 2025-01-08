import { loadComponent } from "/src/utils/dom_utils.js";
import { setActiveLink } from "/src/index.js"
import { switchwindow } from "/src/3d/animation.js";
import { otherProfileForm } from "/src/components/otherProfileForm.js";
import { SettingsForm } from "/src/components/settingsForm.js";
import { LogoutForm } from "/src/components/logoutForm.js";
import { renderPage } from "/src/pages/hud/pageRenderer.js";

export function navigateToSocial() {
	renderPage("social");
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("social-link");
  }
  
export function navigateToLogin() {
	renderPage("login");
	document.getElementById("blur-screen-effect").classList.remove("d-none");
  }

export function navigateToSubscribe() {
	renderPage("subscribe");
	document.getElementById("blur-screen-effect").classList.remove("d-none");
  }
  
export function navigateToDeleteAccount()
{
	renderPage("deleteAccount");
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("settings-link");
}

export function navigateToHome() {
	switchwindow(null);
	renderPage("home");
	document.getElementById("blur-screen-effect").classList.add("d-none");
	setActiveLink(null);
  }
  
export function navigateToProfile() {
	renderPage("profile");
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("profile-link");
  }
  
export function navigateToPong() {
	switchwindow("pong");
	loadComponent("#central-window", null, "", () => {});
	document.getElementById("blur-screen-effect").classList.add("d-none");
	setActiveLink("pong-link");
  }
  
export function navigateToRace() {
	switchwindow("race");
	loadComponent("#central-window", null, "", () => {});
	document.getElementById("blur-screen-effect").classList.add("d-none");
	setActiveLink("race-link");
  }
  
export function navigateToOtherProfile(argument) {
	if (argument) {
	  renderPage("otherprofile");
	  document.getElementById("blur-screen-effect").classList.remove("d-none");
	  setActiveLink(null);
	}
  }
  
export function navigateToSettings() {
	loadComponent("#central-window", SettingsForm, "settingsForm", () => {});
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("settings-link");
  }
  
export function navigateToLogout() {
	loadComponent("#central-window", LogoutForm, "", () => {});
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("logout-link");
  }