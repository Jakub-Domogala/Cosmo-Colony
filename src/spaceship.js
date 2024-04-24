import * as PIXI from "pixi.js";
// spaceship.js

export default class Spaceship {
  constructor(id, origin_planet, destination_planet, app) {
    this.ship_size = 10;
    this.speed = 1;

    this._id = id; // integer id of the spaceship
    this._origin_planet = origin_planet; // list of integers representing the start coordinates of the spaceship
    this._destination_planet = destination_planet; // list of integers representing the end coordinates of the spaceship
    this._app = app; // reference to the PIXI application
    this.sprite = null; // PIXI sprite object for the spaceship
    this.current_cordinates = null;
    this.rotation = null;

    let [x, y, r] = this.calculate_start_cordinates_and_rotation();
    this.current_cordinates = [x, y];
    this.rotation = r;
    this.make_sprite(); // create the sprite object
  }

  // getters

  get app() {
    return this._app;
  }

  get id() {
    return this._id;
  }

  get origin_planet() {
    return this._origin_planet;
  }

  get destination_planet() {
    return this._destination_planet;
  }

  calculate_start_cordinates_and_rotation() {
    const A = this.origin_planet;
    const B = this.destination_planet;
    const distance = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    // offset the spaceship from home planet by its radius
    const offset = 2;
    const x = A.x + ((A.r + offset) * (B.x - A.x)) / distance;
    const y = A.y + ((A.r + offset) * (B.y - A.y)) / distance;

    // calculate the rotation angle of the spaceship
    const angle = Math.atan2(B.y - A.y, B.x - A.x);
    const rotation = angle - Math.PI / 2;
    console.log(rotation);
    console.log(x, y);
    return [x, y, rotation];
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    console.log(this.current_cordinates);
    this.sprite.x = this.current_cordinates[0];
    this.sprite.y = this.current_cordinates[1];
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
    const A = this.origin_planet;
    const B = this.destination_planet;
    const distance = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const speed = this.speed;
    const x =
      this.current_cordinates[0] +
      ((speed * (B.x - A.x)) / distance) * delta_time;
    const y =
      this.current_cordinates[1] +
      ((speed * (B.y - A.y)) / distance) * delta_time;
    this.current_cordinates = [x, y];
    this.sprite.x = x;
    this.sprite.y = y;
  }
}
