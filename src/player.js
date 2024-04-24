// player.js

export default class Player {
  constructor(name, color, app, planets) {
    this.name = name; // string name of the player
    this.color = color; // color of the player
    this.planets = planets;
    this._app = app;
  }
}
