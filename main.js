import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";
import { GAME_TEMPO } from "./src/settings.js";

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
    let elapsed = 0.0;
    app.ticker.add((ticker) => {
      elapsed += ticker.deltaTime;
      starSystem.update((ticker.deltaMS / 1000) * GAME_TEMPO);
    });
  })();
}

// Event listener for the start button
document.getElementById("startButton").addEventListener("click", startGame);
// startGame();
