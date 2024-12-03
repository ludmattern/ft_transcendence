import { createElement } from "../utils/mini_react.js";
import { switchwindow } from "../App.js";

const menuStructure = {
  "main-menu": null,
  "play-menu": "main-menu",
  "solo-menu": "play-menu",
  "multiplayer-menu": "play-menu",
  "tournament-menu": "play-menu",
  "local-menu": "multiplayer-menu",
  "private-menu": "multiplayer-menu",
  "matchmaking-menu": "multiplayer-menu",
  "invite-section": "private-menu",
  "create-tournament": "tournament-menu",
  "join-tournament": "tournament-menu",
  "menu-new-tournament": "tournament-menu",
};

let currentMenu = "main-menu";

function showMenu(menuId) {
  document
    .querySelectorAll(".menu-section, #invite-section")
    .forEach((menu) => {
      menu.classList.add("hidden");
    });

  const targetMenu = document.getElementById(menuId);
  if (targetMenu) {
    targetMenu.classList.remove("hidden");
    currentMenu = menuId;
  }

  const backButton = document.getElementById("back-button");
  if (menuId !== "main-menu") {
    backButton.classList.remove("hidden");
  } else {
    backButton.classList.add("hidden");
  }

  if (menuId === "invite-section") {
    document.getElementById("private-menu").classList.remove("hidden");
  }
}

function goBack() {
  const parentMenu = menuStructure[currentMenu];
  if (parentMenu) {
    showMenu(parentMenu);
  }
}

// Back Button Component
function BackButton() {
  return createElement(
    "button",
    {
      className: "back-btn w-100 back",
      onClick: () => {
        goBack();
        const event = new CustomEvent("backButtonClicked");
        document.dispatchEvent(event);
      },
    },
    createElement("i", { className: "bi bi-arrow-left" }),
    " Back"
  );
}

// Menu Title Component
function MenuTitle(title) {
  return createElement("h1", { className: "menu-title" }, title);
}

// Button Component
function MenuButton({ iconClass, text, onClick }) {
  return createElement(
    "button",
    { className: "space-btn w-100", onClick },
    createElement("i", { className: iconClass }),
    ` ${text}`
  );
}

function OptionSelect({ id, labelText, options }) {
  return createElement(
    "div",
    { className: "mb-4" },
    createElement(
      "label",
      { className: "form-label text-cyan", htmlFor: id },
      labelText
    ),
    createElement(
      "select",
      { className: "space-select form-select", id: id },
      ...options.map((option) =>
        createElement("option", { value: option }, option)
      )
    )
  );
}

// Main Menu Component
function MainMenu() {
  return createElement(
    "div",
    { id: "main-menu", className: "menu-section" },
    createElement(
      "div",
      { className: "row g-4" },
      createElement(
        "div",
        { className: "col-6" },
        MenuButton({
          iconClass: "bi bi-controller",
          text: "Play",
          onClick: () => showMenu("play-menu"),
        })
      ),
      createElement(
        "div",
        { className: "col-6" },
        MenuButton({
          iconClass: "bi bi-trophy",
          text: "Leaderboard",
          onClick: () => showMenu("leaderboard-menu"),
        })
      )
    ),
    createElement(
      "div",
      { className: "row mt-3" },
      createElement("div", { className: "col-12" }, BackButton())
    )
  );
}

// Play Menu Component
function PlayMenu() {
  return createElement(
    "div",
    { id: "play-menu", className: "menu-section hidden" },
    createElement(
      "div",
      { className: "row g-4" },
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-person",
          text: "Solo",
          onClick: () => showMenu("solo-menu"),
        })
      ),
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-people",
          text: "Multiplayer",
          onClick: () => showMenu("multiplayer-menu"),
        })
      ),
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-award",
          text: "Tournament",
          onClick: () => showMenu("tournament-menu"),
        })
      )
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

async function fetchTournaments() {
  try {
    const response = await fetch("../src/context/tournaments.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tournaments = await response.json();
    return tournaments;
  } catch (error) {
    console.error("Failed to fetch tournaments:", error);
    return [];
  }
}

function renderTournamentList(tournaments) {
  return tournaments.map((tournament) =>
    createElement(
      "div",
      { className: "tournament-item" },
      createElement("span", { className: "tournament-name" }, tournament.name),
      createElement("span", { className: "player-count" }, tournament.players)
    )
  );
}

function TournamentMenu() {
  const tournamentListContainer = createElement(
    "div",
    { className: "tournament-list mb-4" },
    createElement("h3", { className: "text-cyan mb-4" }, "Current Tournament")
  );

  // Charger les tournois et les ajouter dynamiquement
  fetchTournaments().then((tournaments) => {
    const tournamentItems = renderTournamentList(tournaments);
    tournamentItems.forEach((item) => {
      tournamentListContainer.appendChild(item);
    });
  });

  return createElement(
    "div",
    { id: "tournament-menu", className: "menu-section hidden" },
    tournamentListContainer,
    createElement(
      "div",
      { className: "row g-4" },
      createElement(
        "div",
        { className: "col-6" },
        MenuButton({
          iconClass: "bi bi-plus-lg",
          text: "Créer",
          onClick: () => showMenu("create-tournament"),
        })
      ),
      createElement(
        "div",
        { className: "col-6" },
        MenuButton({
          iconClass: "bi bi-person-plus",
          text: "Rejoindre",
          onClick: () => showMenu("join-tournament"),
        })
      )
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

function handleCreateTournament() {
  const nameInput = document.getElementById("tournament-name-input");
  const playerCountSelect = document.getElementById("tournament-player-count");

  if (nameInput && playerCountSelect) {
    const tournamentName = nameInput.value;
    const playerCount = playerCountSelect.value;
    console.log("Creating tournament with settings:");
    console.log("Tournament Name:", tournamentName);
    console.log("Player Count:", playerCount);
  } else {
    console.error("Input or select not found for Create Tournament Menu");
  }
}

function CreateTournamentMenu() {
  return createElement(
    "div",
    { id: "create-tournament", className: "menu-section hidden" },
    createElement(
      "div",
      { className: "mb-4" },
      createElement(
        "label",
        { className: "form-label text-cyan", htmlFor: "tournament-name-input" },
        "Tournament Name"
      ),
      createElement("input", {
        type: "text",
        id: "tournament-name-input",
        className: "space-input form-control",
        placeholder: "Enter tournament name",
      })
    ),
    OptionSelect({
      id: "tournament-player-count",
      labelText: "Player Count",
      options: ["4", "8", "16"],
    }),
    createElement(
      "button",
      {
        className: "space-btn w-100",
        onClick: () => handleCreateTournament(),
      },
      "Create Tournament"
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Join Tournament Menu Component
function JoinTournamentMenu() {
  return createElement(
    "div",
    { id: "join-tournament", className: "menu-section hidden" },
    createElement(
      "div",
      { className: "tournament-list" },
      createElement(
        "div",
        { className: "tournament-item" },
        createElement(
          "div",
          {},
          createElement(
            "span",
            { className: "tournament-name" },
            "Interstellar"
          ),
          createElement(
            "span",
            { className: "tournament-details" },
            "16 Players"
          )
        ),
        createElement("button", { className: "space-btn-small" }, "Join")
      ),
      createElement(
        "div",
        { className: "tournament-item" },
        createElement(
          "div",
          {},
          createElement("span", { className: "tournament-name" }, "StarsCraft"),
          createElement(
            "span",
            { className: "tournament-details" },
            "8 players"
          )
        ),
        createElement("button", { className: "space-btn-small" }, "Join")
      )
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

function handleSoloLaunch() {
  const mapSelect = document.getElementById("solo-map-select");
  const difficultySelect = document.getElementById("solo-difficulty-select");

  if (mapSelect && difficultySelect) {
    const selectedMap = mapSelect.value;
    const selectedDifficulty = difficultySelect.value;
    console.log("Launching solo game with settings:");
    console.log("Map:", selectedMap);
    console.log("Difficulty:", selectedDifficulty);
    switchwindow("game");
  } else {
    console.error("Select elements not found");
  }
}

// Solo Menu Component
function SoloMenu() {
  return createElement(
    "div",
    { id: "solo-menu", className: "menu-section hidden" },
    OptionSelect({
      id: "solo-map-select",
      labelText: "Select a map",
      options: ["Mars", "Pluton", "Orgasme"],
    }),
    OptionSelect({
      id: "solo-difficulty-select",
      labelText: "Difficulty",
      options: ["Easy", "Medium", "Hard"],
    }),
    createElement(
      "button",
      { className: "space-btn w-100", onClick: () => handleSoloLaunch() },

      createElement("i", { className: "bi bi-rocket" }),
      " Launch"
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Multiplayer Menu Component
function MultiplayerMenu() {
  return createElement(
    "div",
    { id: "multiplayer-menu", className: "menu-section hidden" },
    createElement(
      "div",
      { className: "row g-4 mb-4" },
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-people",
          text: "Local",
          onClick: () => showMenu("local-menu"),
        })
      ),
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-shield",
          text: "Private",
          onClick: () => showMenu("private-menu"),
        })
      ),
      createElement(
        "div",
        { className: "col-4" },
        MenuButton({
          iconClass: "bi bi-broadcast",
          text: "Matchmaking",
          onClick: () => showMenu("matchmaking-menu"),
        })
      )
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Local Menu Component
function handleLocalLaunch() {
  const gamemodeSelect = document.getElementById("local-gamemode-select");
  const mapSelect = document.getElementById("local-map-select");

  if (gamemodeSelect && mapSelect) {
    const selectedGamemode = gamemodeSelect.value;
    const selectedMap = mapSelect.value;
    console.log("Launching local game with settings:");
    console.log("Gamemode:", selectedGamemode);
    console.log("Map:", selectedMap);
    switchwindow("game");
  } else {
    console.error("Select elements not found for Local Menu");
  }
}

// Local Menu Component
function LocalMenu() {
  return createElement(
    "div",
    { id: "local-menu", className: "menu-section hidden" },
    OptionSelect({
      id: "local-gamemode-select",
      labelText: "Gamemode",
      options: ["1 vs 1", "2 vs 2"],
    }),
    OptionSelect({
      id: "local-map-select",
      labelText: "Map",
      options: ["Mars", "Pluton", "Orgasme"],
    }),
    createElement(
      "button",
      {
        className: "space-btn w-100",
        onClick: () => handleLocalLaunch(),
      },
      "Launch"
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Private Menu Component
function PrivateMenu() {
  return createElement(
    "div",
    { id: "private-menu", className: "menu-section hidden" },
    OptionSelect({ labelText: "Gamemode", options: ["1 vs 1", "2 vs 2"] }),
    OptionSelect({ labelText: "Map", options: ["Mars", "Pluton", "Orgasme"] }),
    createElement(
      "button",
      {
        className: "space-btn mb-4",
        onClick: () => showMenu("invite-section"),
      },
      createElement("i", { className: "bi bi-person-plus" }),
      " Invite players"
    ),
    createElement(
      "div",
      { id: "invite-section", className: "hidden" },
      createElement(
        "div",
        { className: "space-input-group mb-4" },
        createElement(
          "label",
          { className: "form-label text-cyan" },
          "Find a players"
        ),
        createElement("input", {
          type: "text",
          className: "space-input form-control",
          placeholder: "Player name",
        })
      ),
      createElement("button", { className: "space-btn w-100" }, "Send invite")
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Matchmaking Menu Component
function handleMatchmakingLaunch() {
  const gamemodeSelect = document.getElementById("matchmaking-gamemode-select");

  if (gamemodeSelect) {
    const selectedGamemode = gamemodeSelect.value;
    console.log("Searching for a game with settings:");
    console.log("Gamemode:", selectedGamemode);
    switchwindow("game");
  } else {
    console.error("Select element not found for Matchmaking Menu");
  }
}

function MatchmakingMenu() {
  return createElement(
    "div",
    { id: "matchmaking-menu", className: "menu-section hidden" },
    OptionSelect({
      id: "matchmaking-gamemode-select",
      labelText: "Gamemode",
      options: ["1 vs 1", "2 vs 2"],
    }),
    createElement(
      "button",
      {
        className: "space-btn w-100",
        onClick: () => handleMatchmakingLaunch(),
      },
      "Find a game"
    ),
    createElement(
      "div",
      { id: "back-button", className: "mt-4" },
      createElement(
        "button",
        { className: "back-btn", onClick: () => goBack() },
        createElement("i", { className: "bi bi-arrow-left" }),
        " Back"
      )
    )
  );
}

// Pong Menu Component (Main Component)
export function PongMenu() {
  return createElement(
    "div",
    { className: "menu-container", id: "menu2" },
    createElement(
      "div",
      { className: "menu-panel" },
      MenuTitle("Space Pong"),
      MainMenu(),
      PlayMenu(),
      TournamentMenu(),
      CreateTournamentMenu(),
      JoinTournamentMenu(),
      SoloMenu(),
      MultiplayerMenu(),
      LocalMenu(),
      PrivateMenu(),
      MatchmakingMenu()
    )
  );
}
