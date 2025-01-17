import { 
	loginForm, profileForm, header, footer, leftSideWindow, rightSideWindow, 
	logoutForm, twoFAForm, freeViewButton, socialForm, qrcode, otherProfileForm, 
	deleteAccountForm, subscribeForm, settingsForm, lostForm, hudSVG, HelmetSVG
  } from "/src/components/hud/index.js";
  
  import { 
	header as pongHeader, navBar, homeContent, pongPageSkeleton, soloContent, 
	multiplayerContent, tournamentContent, lost, leaderboard 
  } from "/src/components/pong/index.js";
  
  import { midScreen } from "/src/components/midScreen.js";
  import { menu3 } from "/src/components/menu3.js";
  import { pongMenu } from "/src/components/pong/index.js";
  
  /**
   * Composants persistants (toujours chargés)
   */
  export const persistentComponents = [
	{ selector: "#pong-screen-container", component: pongMenu },
	{ selector: "#hud-svg-container", component: hudSVG },
	{ selector: "#helmet-svg-container", component: HelmetSVG },
	{ selector: "#mid-screen-container", component: midScreen },
	{ selector: "#menu3-container", component: menu3 },
  ];
  
  /**
   * Composants globaux (communs à toutes les pages HUD)
   */
  export const globalComponents = [
	{ selector: "#header-container", component: header },
	{ selector: "#left-window-container", component: leftSideWindow },
	{ selector: "#right-window-container", component: rightSideWindow },
	{ selector: "#footer-container", component: footer },
  ];
  
  /**
   * Définition des pages HUD
   */
  export const hudPages = {
	login: { components: [...persistentComponents, { selector: "#central-window", component: loginForm }] },
	twoFAForm: { components: [...persistentComponents, { selector: "#central-window", component: twoFAForm }] },
	qrcode: { components: [...persistentComponents, { selector: "#central-window", component: qrcode }] },
	subscribe: { components: [...persistentComponents, { selector: "#central-window", component: subscribeForm }] },
	lostForm: { components: [...persistentComponents, { selector: "#central-window", component: lostForm }] },
  
	profile: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: profileForm }] },
	social: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: socialForm }] },
	otherprofile: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: otherProfileForm }] },
	settings: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: settingsForm }] },
	deleteAccount: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: deleteAccountForm }] },
	logout: { components: [...persistentComponents, ...globalComponents, { selector: "#central-window", component: logoutForm }] },
  
	home: { components: [...persistentComponents, ...globalComponents, { selector: "#freeView-container", component: freeViewButton }] },
	race: { components: [...persistentComponents, ...globalComponents] },
	pong: { components: [...persistentComponents, ...globalComponents] },
  };
  
  /**
   * Définition des pages Pong
   */
  export const pongPages = {
  home: {},
  play: {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: navBar },
      { selector: "#content-window-container", component: homeContent },
    ],
  },
  "play/solo": {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: navBar },
      { selector: "#content-window-container", component: soloContent },
    ],
  },
  "play/multiplayer": {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: navBar },
      { selector: "#content-window-container", component: multiplayerContent },
    ],
  },
  "play/tournament": {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: navBar },
      { selector: "#content-window-container", component: tournamentContent },
    ],
  },
  leaderboard: {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: leaderboard },
    ],
  },
  lost: {
    components: [
      { selector: "#pong-skeleton-container", component: pongPageSkeleton },
      { selector: "#pong-header-container", component: pongHeader },
      { selector: "#content-window-container", component: lost },
    ],
  },
};
