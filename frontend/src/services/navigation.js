import { testloadComponent } from "/src/utils/virtualDOM.js";
import { loadComponent } from "/src/utils/dom_utils.js";
import { setActiveLink } from "/src/index.js"
import { switchwindow } from "/src/3d/animation.js";
import { ProfileForm } from "/src/components/profileForm.js";
import { OtherProfileForm } from "/src/components/otherProfileForm.js";
import { SettingsForm } from "/src/components/settingsForm.js";
import { LogoutForm } from "/src/components/logoutForm.js";
import { SocialForm } from "/src/components/socialForm.js";
import { renderLoginPage } from "/src/pages/hud/loginPage.js";
import { renderSubscribePage } from "/src/pages/hud/subscribePage.js";

export function navigateToSocial() {
	loadComponent("#central-window", SocialForm, "socialForm", () => {});
	document.getElementById("blur-screen-effect").classList.remove("d-none");
	setActiveLink("social-link");
  }
  
export function navigateToLogin() {
	renderLoginPage();
	console.debug("LoginForm loaded as user is not authenticated.");
  }

export function navigateToSubscribe() {
	renderSubscribePage();
	console.debug("SubscribeForm loaded as user is not authenticated.");
  }
  
export function navigateToHome() {
	switchwindow(null);
	loadComponent("#central-window", null, "", () => {});
	document.getElementById("blur-screen-effect").classList.add("d-none");
	setActiveLink(null);
  }
  
export function navigateToProfile() {
	loadComponent("#central-window", ProfileForm, "", () => {});
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
	  loadComponent("#central-window", OtherProfileForm, "", () => {});
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