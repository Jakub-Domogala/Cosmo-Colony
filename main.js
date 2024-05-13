import { calc_gradiental_change_float } from "./src/common/common_utils.js";
import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";
import {
  GAME_STATUS_GOING,
  GAME_STATUS_LOST,
  GAME_STATUS_WON,
  GAME_TEMPO,
} from "./src/settings.js";

// Function to hide the entry screen and start the game
function startGame() {
  const playerName = document.getElementById("playerName").value;
  const gameDifficulty = parseInt(
    document.getElementById("gameDifficulty").value,
  );

  document.getElementById("entryScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";

  // INIT APP
  (async () => {
    const app = await getApp();
    const players = getPlayers(app);
    const starSystem = await getStarSystem(
      app,
      players,
      // playerName,
      // gameDifficulty,
    );

    // RUN GAME LOOP
    let speedup = 1;
    let targetSpeedup = 1;
    let elapsed = 0.0;
    let epsilon = 0.01;
    app.ticker.add((ticker) => {
      elapsed += ticker.deltaTime;
      const dt = ticker.deltaMS / 1000;
      speedup = calc_gradiental_change_float(speedup, targetSpeedup, dt, 2);
      const gameStatus = starSystem.update(dt * GAME_TEMPO * speedup);
      if (gameStatus === GAME_STATUS_WON) {
        targetSpeedup = 0;
        console.log("You won!");
      }
      if (gameStatus === GAME_STATUS_LOST) {
        // targetSpeedup = 0;
        targetSpeedup = 0;
        console.log("You lost!");
      }
      if (gameStatus === GAME_STATUS_GOING) {
        return;
      }
      if (speedup < epsilon) {
        console.log("Game over!");
        app.ticker.stop();
      }
    });
  })();
}

// Event listener for the start button
document.getElementById("startButton").addEventListener("click", startGame);
// startGame();
