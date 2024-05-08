import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";
import { GAME_TEMPO } from "./src/settings.js";

(async () => {
  // INIT APP
  const app = await getApp();
  const players = getPlayers(app);
  const starSystem = await getStarSystem(app, players);

  // RUN GAME LOOP
  let elapsed = 0.0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;
    starSystem.update((ticker.deltaMS / 1000) * GAME_TEMPO);
  });
})();
