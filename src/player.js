// player.js

import STRATEGY_NAMES from "./player/strategy_names_enum";
import STRATEGY_FUNCTIONS from "./player/strategy_functions_enum";

export default class Player {
  constructor(name, color, app, botStrategy) {
    this.name = name;
    this.color = color;
    this.planets = [];
    this.planets_connections_matrix = [];
    this._app = app;
    this.isBot = botStrategy != STRATEGY_NAMES.HUMAN;
    this.botStrategy = botStrategy;
    this.timeSinceLastMove = 0;
  }

  makeMove(delta, starSystem) {
    STRATEGY_FUNCTIONS[this.botStrategy](this, delta, starSystem);
  }
}
