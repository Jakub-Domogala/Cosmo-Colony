// sending.js

export default class Sending {
  constructor(planetA, planetB, app) {
    this.ships_id = null; // integer id of the ships
    this.origin_planet = planetA; // reference to the origin planet
    this.destination_planet = planetB; // reference to the destination planet
    this.time_elapsed = 0; // integer time elapsed since the start of the sending
    this.sending_speed = 1; // integer speed of the sending
    this.ships_queue = []; // list of ships in the sending
    this._app = app; // reference to the PIXI application
  }

  start_sending_ships(ships_id, sending_speed = 1) {
    this.ships_id = ships_id;
    this.sending_speed = sending_speed;
    this.time_elapsed = 0;
  }

  stop_sending_ships() {
    this.ships_id = null;
  }

  update(delta) {
    this.time_elapsed += delta;
    move_ships(delta);
    if (this.time_elapsed > 1 / this.sending_speed && this.ships_id !== null) {
      this.time_elapsed -= 1 / this.sending_speed;
      add_ship();
    }
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
  }
}
