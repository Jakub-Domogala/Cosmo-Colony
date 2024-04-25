// sending.js

import Spaceship from "./spaceship.js";

export default class Sending {
  constructor(planetA, planetB, app) {
    this.ships_id = null;
    this.ships_color = null;
    this.origin_planet = planetA;
    this.destination_planet = planetB;
    this.time_elapsed = 0;
    this.sending_speed = null;
    this.ships_queue = [];
    this._app = app;
  }

  start_sending_ships() {
    this.ships_id = this.origin_planet.status;
    this.ships_color = this.origin_planet.color;
    this.sending_speed = this.origin_planet.attack_speed;
    this.time_elapsed = 1;
  }

  stop_sending_ships() {
    this.ships_id = null;
  }

  update(delta) {
    // update ships position
    this.time_elapsed += delta * this.sending_speed;
    this.move_ships(delta);
    // add new ships
    if (this.time_elapsed >= 1 && this.ships_id !== null) {
      this.time_elapsed -= 1;
      this.add_ship();
    }
    // coliding with planets handled in spaceship.js
    // coliding with other ships handled in connection.js
  }

  move_ships(delta) {
    for (let ship of this.ships_queue) {
      ship.update(delta);
    }
  }

  add_ship() {
    let ship = new Spaceship(
      this.ships_id,
      this.origin_planet,
      this.destination_planet,
      this._app,
    );
    this.ships_queue.push(ship);
    this._app.stage.addChild(ship.sprite);
  }
}
