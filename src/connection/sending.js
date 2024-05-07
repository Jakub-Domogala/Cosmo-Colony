// sending.js

import Spaceship from "./../spaceship.js";

export default class Sending {
  constructor(planetA, planetB, app) {
    this.owner = null;
    this.origin_planet = planetA;
    this.destination_planet = planetB;
    this.sending_time = 0;
    this.sending_speed = null;
    this.ships_queue = [];
    this._app = app;
  }

  start_sending_ships() {
    if (this.owner == this.origin_planet.owner) return;
    this.owner = this.origin_planet.owner;
    this.ships_color = this.origin_planet.color;
    this.sending_speed = this.origin_planet.attack_speed;
    this.sending_time = 1;
  }

  stop_sending_ships() {
    this.owner = null;
  }

  update(delta) {
    // update ships position
    this.sending_time += delta * this.sending_speed;
    this.move_ships(delta);
    // add new ships
    if (this.sending_time >= 1 && this.owner !== null) {
      this.sending_time -= 1;
      if (this.origin_planet.population <= 2) {
        this.stop_sending_ships();
        return;
      }
      this.add_ship();
      this.origin_planet.shipSent();
    }
    // coliding with planets handled in spaceship.js
    // coliding with other ships handled in connection.js
  }

  move_ships(delta) {
    for (let ship of this.ships_queue) ship.update(delta);
    while (this.ships_queue.length > 0 && this.ships_queue[0].did_arrive()) {
      this.destination_planet.shipArrival(this.ships_queue[0]);
      this.delete_last_ship();
    }
  }

  delete_last_ship() {
    if (this.ships_queue.length === 0) return;
    const ship = this.ships_queue.shift();
    this._app.stage.removeChild(ship.sprite);
  }

  add_ship() {
    if (this.owner === null) return;
    let ship = new Spaceship(
      this.owner,
      this.origin_planet,
      this.destination_planet,
      this._app,
    );
    this.ships_queue.push(ship);
    this._app.stage.addChild(ship.sprite);
  }
}
