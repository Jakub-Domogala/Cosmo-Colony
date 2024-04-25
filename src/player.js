// player.js

export default class Player {
  constructor(name, color, app, planets) {
    this.name = name;
    this.color = color;
    this.planets = planets;
    this._app = app;
  }
}
