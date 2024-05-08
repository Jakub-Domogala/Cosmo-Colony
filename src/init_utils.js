import { Application } from "pixi.js";
import StarSystem from "./star_system.js";
import Player from "./player.js";
import {
  BOTS_ONLY,
  COLORS_PLAYERS,
  INPUT_SYSTEM_JSON,
  PLAYERS_AMOUNT,
} from "./settings.js";

export async function getApp() {
  const app = new Application();
  await app.init({ background: "#061536", resizeTo: window });
  document.body.appendChild(app.canvas);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  return app;
}

export function getPlayers(app) {
  const players = [];
  for (let i = 0; i < Math.min(PLAYERS_AMOUNT, COLORS_PLAYERS.length); i++)
    players.push(
      new Player(`player${i}`, COLORS_PLAYERS[i], app, i > 0 || BOTS_ONLY),
    );
  return players;
}

export async function getStarSystem(app, players) {
  try {
    const response = await fetch(
      `./resource/solar_systems/${INPUT_SYSTEM_JSON}`,
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const jsonData = await response.json();
    return new StarSystem(jsonData, app, players);
  } catch (error) {
    // Handle any errors that occur during the fetch
    console.error("Error fetching JSON:", error);
    throw error; // Re-throwing the error for error handling outside this function
  }
}
