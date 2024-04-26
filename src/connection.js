import * as PIXI from "pixi.js";
import Sending from "./sending.js";
import { distance } from "./utils.js";
// connection.js

export default class Connection {
  constructor(planetA, planetB, app) {
    this.sprite = null; // PIXI sprite object for the connection
    this.width = 8; // constant integer width of the connection
    this.color = 0x00ff00; // constant integer color of the connection
    this.cordinates = [
      [planetA.x, planetA.y],
      [planetB.x, planetB.y],
    ]; // list of integers representing the coordinates of the connection
    this.sendingA2B = null;
    this.sendingB2A = null;
    this._planetA = planetA;
    this._planetB = planetB;
    this.distance = distance(planetA, planetB);

    this.sendingA2B = new Sending(planetA, planetB, app);
    this.sendingB2A = new Sending(planetB, planetA, app);

    // add sprite on click to cancel sending ships

    this._app = app;
    this.make_sprite();
  }

  get planetA() {
    return this._planetA;
  }

  get planetB() {
    return this._planetB;
  }

  get app() {
    return this._app;
  }

  get_line_shape(color) {
    const line = new PIXI.Graphics();
    line.moveTo(this.width / 2, this.distance / 2);

    line.lineTo(-this.width / 2, this.distance / 2);
    line.lineTo(-this.width / 2, -this.distance / 2);
    line.lineTo(this.width / 2, -this.distance / 2);
    line.lineTo(this.width / 2, this.distance / 2);

    line.closePath();
    line.fill();
    line.stroke({
      width: 1,
      color: this.color,
      alpha: 1,
      join: "round",
    });
    return line;
  }

  get_hover_line_shape(color) {
    const line = new PIXI.Graphics();
    line.moveTo(this.width / 2, this.distance / 2);

    line.lineTo(-this.width / 2, this.distance / 2);
    line.lineTo(-this.width * 2, this.distance / 4);
    line.lineTo(-this.width * 2, -this.distance / 4);
    line.lineTo(-this.width / 2, -this.distance / 2);

    line.lineTo(this.width / 2, -this.distance / 2);
    line.lineTo(this.width * 2, -this.distance / 4);
    line.lineTo(this.width * 2, this.distance / 4);
    line.lineTo(this.width / 2, this.distance / 2);

    line.closePath();
    line.fill();
    line.stroke({
      width: 1,
      color: color,
      alpha: 1,
      join: "round",
    });

    const cross_width = 10;
    const cross_size = 40;
    line.moveTo(cross_width, 0);
    line.lineTo(cross_width + cross_size, cross_size);
    line.lineTo(cross_width + cross_size, cross_size + cross_width);
    line.lineTo(cross_size, cross_size + cross_width);
    line.lineTo(0, cross_width);
    line.lineTo(-cross_size, cross_width + cross_size);
    line.lineTo(-cross_width - cross_size, cross_size + cross_width);
    line.lineTo(-cross_size - cross_width, cross_size);
    line.lineTo(-cross_width, 0);
    line.lineTo(-cross_size - cross_width, -cross_size);
    line.lineTo(-cross_size - cross_width, -cross_size - cross_width);
    line.lineTo(-cross_size, -cross_size - cross_width);
    line.lineTo(0, -cross_width);
    line.lineTo(cross_size, -cross_width - cross_size);
    line.lineTo(cross_width + cross_size, -cross_size - cross_width);
    line.lineTo(cross_size + cross_width, -cross_size);
    line.lineTo(cross_width, 0);

    line.closePath();
    line.fill(0xff0000);
    return line;
  }

  get_hit_area() {
    return new PIXI.Polygon([
      this.width / 2,
      this.distance / 2,

      this.width * 5,
      this.distance / 4,

      this.width * 5,
      -this.distance / 4,

      this.width / 2,
      -this.distance / 2,

      -this.width / 2,
      -this.distance / 2,

      -this.width * 5,
      -this.distance / 4,

      -this.width * 5,
      this.distance / 4,

      -this.width / 2,
      this.distance / 2,
    ]);
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = (this.cordinates[0][0] + this.cordinates[1][0]) / 2;
    this.sprite.y = (this.cordinates[0][1] + this.cordinates[1][1]) / 2;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.texture = this.app.renderer.generateTexture(
      this.get_line_shape(this.color),
    );

    const x1 = this.planetA.x;
    const y1 = this.planetA.y;
    const x2 = this.planetB.x;
    const y2 = this.planetB.y;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.sprite.rotation = angle + Math.PI / 2;
    this.sprite.hitArea = this.get_hit_area();
    this.sprite.interactive = true;
    this.sprite.on("click", () => {
      this.sendingA2B.stop_sending_ships();
      this.sendingB2A.stop_sending_ships();
    });

    this.sprite.on("pointerover", () => {
      this.sprite.texture = this.app.renderer.generateTexture(
        this.get_hover_line_shape(0xff0000),
      );
      this.sprite.alpha = 0.5;
    });

    this.sprite.on("pointerout", () => {
      this.sprite.texture = this.app.renderer.generateTexture(
        this.get_line_shape(this.color),
      );
      this.sprite.alpha = 1;
    });
  }

  start_sending_ships(origin_planet) {
    if (origin_planet != this.planetA && origin_planet != this.planetB)
      return null;
    if (origin_planet == this.planetA) {
      if (this.sendingB2A.ships_id == origin_planet.status)
        this.sendingB2A.stop_sending_ships();
      this.sendingA2B.start_sending_ships();
    }
    if (origin_planet == this.planetB) {
      if (this.sendingA2B.ships_id == origin_planet.status)
        this.sendingA2B.stop_sending_ships();
      this.sendingB2A.start_sending_ships();
    }
  }

  update(delta) {
    this.sendingA2B.update(delta);
    this.sendingB2A.update(delta);
  }
}
