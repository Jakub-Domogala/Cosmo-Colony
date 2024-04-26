import { Application, Assets } from "pixi.js";
import StarSystem from "./src/star_system.js";
import Player from "./src/player.js";
import sys1 from "./resource/solar_systems/sys1.json";

(async () => {
  const app = new Application();
  await app.init({ background: "#061536", resizeTo: window });
  document.body.appendChild(app.canvas);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const players = [];
  players.push(new Player("player1", 0x990099, app));
  players.push(new Player("player1", 0x009900, app));
  console.log(players[0]);

  const starSystem = new StarSystem(sys1, app, players);
  let elapsed = 0.0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;
    starSystem.update(ticker.deltaMS / 1000);
  });
})();
