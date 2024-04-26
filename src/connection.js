// connection.js

import * as PIXI from "pixi.js";
import Sending from "./connection/sending.js";
import { distance } from "./utils.js";
import { COLOR_CONNECTION } from "./settings.js";
import {
  get_line_shape,
  get_hit_area,
  get_hover_line_shape,
} from "./connection/connection_utils.js";

export default class Connection {
  constructor(planetA, planetB, app) {
    this.sprite = null;
    this.width = 4;
    this.color = COLOR_CONNECTION;
    this.cordinates = [
      [planetA.x, planetA.y],
      [planetB.x, planetB.y],
    ]; // list of integers representing the coordinates of the connection
    this.sendingA2B = null;
    this.sendingB2A = null;
    this.planetA = planetA;
    this.planetB = planetB;
    this.distance = distance(planetA, planetB);

    this.sendingA2B = new Sending(planetA, planetB, app);
    this.sendingB2A = new Sending(planetB, planetA, app);

    // add sprite on click to cancel sending ships

    this._app = app;
    this.make_sprite();
  }

  get app() {
    return this._app;
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = (this.cordinates[0][0] + this.cordinates[1][0]) / 2;
    this.sprite.y = (this.cordinates[0][1] + this.cordinates[1][1]) / 2;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.texture = this.app.renderer.generateTexture(
      get_line_shape(this),
    );

    const x1 = this.planetA.x;
    const y1 = this.planetA.y;
    const x2 = this.planetB.x;
    const y2 = this.planetB.y;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.sprite.rotation = angle + Math.PI / 2;
    this.sprite.hitArea = get_hit_area(this);
    this.sprite.interactive = true;
    this.sprite.on("click", () => {
      this.sendingA2B.stop_sending_ships();
      this.sendingB2A.stop_sending_ships();
    });

    this.sprite.on("pointerover", () => {
      this.sprite.texture = this.app.renderer.generateTexture(
        get_hover_line_shape(this),
      );
      this.sprite.alpha = 0.5;
    });

    this.sprite.on("pointerout", () => {
      this.sprite.texture = this.app.renderer.generateTexture(
        get_line_shape(this),
      );
      this.sprite.alpha = 1;
    });
  }

  start_sending_ships(origin_planet) {
    if (origin_planet != this.planetA && origin_planet != this.planetB)
      return null;
    if (origin_planet == this.planetA) {
      if (this.sendingB2A.owner == origin_planet.owner)
        this.sendingB2A.stop_sending_ships();
      this.sendingA2B.start_sending_ships();
    }
    if (origin_planet == this.planetB) {
      if (this.sendingA2B.owner == origin_planet.owner)
        this.sendingA2B.stop_sending_ships();
      this.sendingB2A.start_sending_ships();
    }
  }

  update(delta) {
    this.sendingA2B.update(delta);
    this.sendingB2A.update(delta);
  }
}
