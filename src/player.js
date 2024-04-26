// player.js

export default class Player {
  constructor(name, color, app) {
    this.name = name;
    this.color = color;
    this.planets = [];
    this._app = app;
  }
}
