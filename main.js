import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";

(async () => {
  // INIT APP
  const app = await getApp();
  const players = getPlayers(app);

  // MAKE SYSTEM
  const starSystem = await getStarSystem(app, players);

  // RUN GAME LOOP
  let elapsed = 0.0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;
    starSystem.update(ticker.deltaMS / 1000);
  });
})();
