// spaceship.js

import * as PIXI from "pixi.js";
import { distance } from "./utils";

export default class Spaceship {
  constructor(id, origin_planet, destination_planet, app) {
    this.ship_size = 10;
    this.speed = 25;

    this.id = id;
    this.origin_planet = origin_planet;
    this.destination_planet = destination_planet;
    this.distance_to_travel = null;
    this.app = app;
    this.sprite = null;
    this.start_cordinates = null;
    this.end_cordinates = null;
    this.current_cordinates = null;
    this.rotation = null;
    this.travel_percentage = 0;
    this.travel_distance = 0;
    this.offset = 8;
    this._kill_distance;

    this.calculate_start_cordinates_distance_and_rotation();
    this.make_sprite();
  }

  calculate_start_cordinates_distance_and_rotation() {
    const [A, B] = [this.origin_planet, this.destination_planet];
    this.distance_to_travel = distance(A, B);
    const start_x =
      A.x + ((A.r + this.offset) * (B.x - A.x)) / this.distance_to_travel;
    const start_y =
      A.y + ((A.r + this.offset) * (B.y - A.y)) / this.distance_to_travel;

    const end_x =
      B.x - ((B.r + this.offset) * (B.x - A.x)) / this.distance_to_travel;
    const end_y =
      B.y - ((B.r + this.offset) * (B.y - A.y)) / this.distance_to_travel;

    this.distance_to_travel = distance(
      { x: start_x, y: start_y },
      { x: end_x, y: end_y },
    );

    this.current_cordinates = { x: start_x, y: start_y };
    this.start_cordinates = { x: start_x, y: start_y };
    this.end_cordinates = { x: end_x, y: end_y };

    const angle = Math.atan2(B.y - A.y, B.x - A.x);
    this.rotation = angle - Math.PI / 2;
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    // console.log(this.current_cordinates);
    this.sprite.x = this.current_cordinates.x;
    this.sprite.y = this.current_cordinates.y;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.rotation = this.rotation;
    this.sprite.texture = this.app.renderer.generateTexture(
      this.get_ship_shape(),
    );
  }

  get_ship_shape() {
    const shape = new PIXI.Graphics();
    shape.moveTo(0, 0);
    shape.lineTo(-0.7 * this.ship_size, -1 * this.ship_size);
    shape.lineTo(0, 2 * this.ship_size);
    shape.lineTo(0.7 * this.ship_size, -1 * this.ship_size);
    shape.lineTo(0, 0);
    shape.fill(0x00ff00);
    shape.stroke({ width: 2, color: 0x88aa88, alpha: 1, join: "round" });
    return shape;
  }

  update_position(delta_time) {
    const A = this.start_cordinates;
    const B = this.end_cordinates;
    const distance = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const speed = this.speed;
    const x =
      this.current_cordinates.x +
      ((speed * (B.x - A.x)) / distance) * delta_time;
    const y =
      this.current_cordinates.y +
      ((speed * (B.y - A.y)) / distance) * delta_time;
    this.current_cordinates = { x, y };
    this.sprite.x = x;
    this.sprite.y = y;
  }

  update(delta_time) {
    // update position
    this.update_position(delta_time);
    // update variables

    // update ship collisions, if true delete both ships

    // update planet arrival, if true delete ship and decrement planet health
  }
}
