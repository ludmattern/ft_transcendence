import { ensureAuthenticated } from "/src/services/auth.js";
import { navigateToHome, navigateToProfile, navigateToPong, navigateToRace, navigateToSocial, navigateToSettings, navigateToLogout, navigateToOtherProfile } from "/src/services/navigation.js";

export async function handleRoute(route) {
  console.debug(`Handling route: ${route}`);

  ensureAuthenticated(() => {
	switch (true) {
		case route === "/":
		  navigateToHome();
		  break;
		case route === "/profile":
		  navigateToProfile();
		  break;
		case route === "/pong":
		  navigateToPong();
		  break;
		case route === "/race":
		  navigateToRace();
		  break;
		case route === "/social":
		  navigateToSocial();
		  break;
		case route === "/settings":
		  navigateToSettings();
		  break;
		case route === "/logout":
		  navigateToLogout();
		  break;
		case route.startsWith("/social?pilot="):
		  const pilot = route.split("=")[1];
		  console.debug(`Pilot: ${pilot}`);
		  navigateToOtherProfile(pilot);
		  break;
		default:
		  console.warn(`Unknown route: ${route}`);
		  break;
    }
  });
}

