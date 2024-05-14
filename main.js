import { calc_gradiental_change_float } from "./src/common/common_utils.js";
import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";
import {
  GAME_STATUS_GOING,
  GAME_STATUS_LAST_BOT_STANDING,
  GAME_STATUS_LOST,
  GAME_STATUS_WON,
  GAME_TEMPO,
} from "./src/settings.js";

function showGameOverScreen() {
  document.getElementById("gameContainer").style.display = "none";
  // document.getElementsByClassName("game-canvas")[0].style.display = "none";
  document.getElementById("gameOverScreen").style.display = "flex";
}
// Function to hide the entry screen and start the game
function startGame() {
  const gameCanvas = document.getElementsByClassName("game-canvas")[0];
  if (gameCanvas) {
    gameCanvas.remove();
  }
  const overScreen = document.getElementById("gameOverScreen");
  if (overScreen) {
    // console.log("remove end screen");
    overScreen.style.display = "none";
  }
  const playerName = document.getElementById("playerName").value;
  const gameDifficulty = parseInt(
    document.getElementById("gameDifficulty").value,
  );
  // console.log(playerName, gameDifficulty);

  document.getElementById("entryScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "flex";

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
    let epsilon = 0.001;
    let endGame = false;
    // app.ticker.maxFPS = 1;
    app.ticker.add((ticker) => {
      elapsed += ticker.deltaTime;
      const dt = ticker.deltaMS / 1000;
      speedup = calc_gradiental_change_float(speedup, targetSpeedup, dt, 1);
      const gameStatus = starSystem.update(dt * GAME_TEMPO * speedup);
      if (gameStatus === GAME_STATUS_GOING) {
        return;
      } else if (gameStatus === GAME_STATUS_WON) {
        targetSpeedup = 0;
        console.log("You won!");
      } else if (gameStatus === GAME_STATUS_LOST) {
        targetSpeedup = 2;
        console.log("You lost!");
      } else if (gameStatus === GAME_STATUS_LAST_BOT_STANDING) {
        targetSpeedup = 0;
        console.log("Last bot standing!");
      }
      if (speedup < 0.8 && !endGame) {
        showGameOverScreen();
        endGame = true;
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
document.getElementById("restartButton").addEventListener("click", startGame);
// startGame();
