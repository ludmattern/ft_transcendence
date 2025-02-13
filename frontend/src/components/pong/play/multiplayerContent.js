import { createComponent } from "/src/utils/component.js";
import { ws } from "/src/services/socketManager.js";
import { playGame } from "/src/components/pong/play/utils.js";
import componentManagers from "/src/index.js";
import { pongTuto } from "/src/components/hud/index.js";

export const multiplayerContent = createComponent({
  tag: "multiplayerContent",

  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
      <h2 class="text-white text-center">Ready to Embrace Multiplayer Mayhem?</h2>
      <p class="text-secondary text-center">
        So you really want to test your skills against real opponents? Pick your method of inevitable humiliation!
      </p>

      <!-- Local Multiplayer -->
      <div class="mb-4">
        <legend class="h4 text-white">Local Showdown</legend>
        <p class="text-secondary">
          Gather your pals for a head-to-head battle where defeat is guaranteed.
        </p>
        <label for="localDifficulty" class="form-label">How Fast Will You Crash?</label>
        <button class="btn btn-warning mx-3" id="launchLocal">
          Challenge Your Friends to a Losing Streak
        </button>
      </div>

      <hr class="text-secondary my-4">

      <!-- Online Matchmaking -->
      <div class="mb-4">
        <legend class="h4 text-white">Online Matchmaking</legend>
        <p class="text-secondary">
          Step into the arena and get queued up for instant regret.
        </p>
        <label for="matchmakingDifficulty" class="form-label">Select Your Level of Despair</label>
        <button class="btn btn-danger mx-3" id="launchMatch">
          Join the Queue for Instant Humiliation
        </button>
        <button class="btn btn-secondary d-none" id="leaveMatch">
          Cancel the Queue
        </button>
      </div>

      <hr class="text-secondary my-4">

      <!-- Private Match -->
      <div class="mb-4">
        <legend class="h4 text-white">Private Battle</legend>
        <p class="text-secondary">
          Enter a room with a chosen foe or ally and share the misery.
        </p>
        <label for="privateRoomCode" class="form-label">Room Code</label>
        <div class="input-group mt-2">
          <input type="text" class="form-control" id="privateRoomCode" placeholder="Enter Room Code" aria-label="Room Code">
          <button class="btn btn-primary mx-3" id="createPrivate" type="button">Create Room</button>
          <button class="btn btn-success" id="joinPrivate" type="button">Join Room</button>
        </div>
        <button class="btn btn-secondary d-none" id="leavePrivate">Leave Room</button>
      </div>
    </section>
  `,

  attachEvents: (el) => {
    // Local Multiplayer
    const localButton = el.querySelector("#launchLocal");
    localButton.addEventListener("click", () => {
      playGame("duo");
    });

    // Online Matchmaking
    const matchButton = el.querySelector("#launchMatch");
    const leaveMatchButton = el.querySelector("#leaveMatch");
    matchButton.addEventListener("click", () => {
      joinMatchmaking(); // Fonction à définir ailleurs dans votre code
      playGame("uno");
    });

    leaveMatchButton.addEventListener("click", async () => {
      leaveMatchmaking();
      leaveMatchButton.classList.add("d-none");
      matchButton.classList.remove("d-none");
    });

    // Private Match
    const createPrivateButton = el.querySelector("#createPrivate");
    const joinPrivateButton = el.querySelector("#joinPrivate");
    const leavePrivateButton = el.querySelector("#leavePrivate");
    const privateRoomCodeInput = el.querySelector("#privateRoomCode");

    createPrivateButton.addEventListener("click", () => {
      const roomCode = privateRoomCodeInput.value.trim();
      if (!roomCode) {
        console.log("Please enter a room code.");
        return;
      }
      privateRoomCodeInput.disabled = true;
      createPrivateButton.classList.add("d-none");
      leavePrivateButton.classList.remove("d-none");
      joinRoom(roomCode);
    });

    joinPrivateButton.addEventListener("click", () => {
      const roomCode = privateRoomCodeInput.value.trim();
      if (!roomCode) {
        console.log("Please enter a room code.");
        return;
      }
      privateRoomCodeInput.disabled = true;
      joinRoom(roomCode);
    });

    leavePrivateButton.addEventListener("click", async () => {
      leavePrivateButton.classList.add("d-none");
      createPrivateButton.classList.remove("d-none");
      privateRoomCodeInput.disabled = false;
      leaveRoom(privateRoomCodeInput.value.trim());
    });
  },
});


function joinMatchmaking() {
  const userId = sessionStorage.getItem("userId");
  ws.send(JSON.stringify({
      type: "matchmaking",
      action: "join",
      user_id: userId
  }));
  console.log("Sent 'join matchmaking' via WebSocket");
}

export function leaveMatchmaking() {
  const userId = sessionStorage.getItem("userId");
  ws.send(JSON.stringify({
    type: "matchmaking",
    action: "leave",
    user_id: userId
  }));
  console.log("Sent 'leave matchmaking' via WebSocket");
}

function joinRoom(roomCode) {
  const userId = sessionStorage.getItem("userId");
  ws.send(JSON.stringify({
    type: "private_event",
    action: "join",
    room_code: roomCode,
    user_id: userId
  }));
  console.log("Sent join room event for room:", roomCode, "user:", userId);
}

export function leaveRoom(roomCode) {
  const userId = sessionStorage.getItem("userId");
  ws.send(JSON.stringify({
    type: "private_event",
    action: "leave",
    room_code: roomCode,
    user_id: userId
  }));
  console.log("Sent leave room event for room:", roomCode);
}
