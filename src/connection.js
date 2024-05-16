// connection.js

import * as PIXI from "pixi.js";
import Sending from "./connection/sending.js";
import { distance } from "./common/common_utils.js";
import { COLOR_CONNECTION, COLOR_CONNECTION_HIGHLIGHT, COLOR_CONNECTION_HIGHLIGHT_MY } from "./settings.js";
import { calc_gradiental_change_float, calc_gradiental_change_color } from "./common/common_utils.js";
import { get_line_shape, get_hit_area, get_hover_line_shape } from "./connection/connection_utils.js";

export default class Connection {
  constructor(planetA, planetB, app, starSystem) {
    this.starSystem = starSystem;
    this.app = app;

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

    this.target = { scale: 1, alpha: 0.5, tint: COLOR_CONNECTION };

    this.sendingA2B = new Sending(planetA, planetB, app);
    this.sendingB2A = new Sending(planetB, planetA, app);

    // add sprite on click to cancel sending ships

    this.make_sprite();
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = (this.cordinates[0][0] + this.cordinates[1][0]) / 2;
    this.sprite.y = (this.cordinates[0][1] + this.cordinates[1][1]) / 2;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.texture = this.app.renderer.generateTexture(get_line_shape(this));

    const x1 = this.planetA.x;
    const y1 = this.planetA.y;
    const x2 = this.planetB.x;
    const y2 = this.planetB.y;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.sprite.rotation = angle + Math.PI / 2;
    this.sprite.hitArea = get_hit_area(this);
    this.sprite.interactive = true;
    this.sprite.on("click", this.click.bind(this));
    this.sprite.on("pointerover", this.pointerOver.bind(this));
    this.sprite.on("pointerout", this.pointerOut.bind(this));
  }

  start_sending_ships(origin_planet) {
    if (origin_planet != this.planetA && origin_planet != this.planetB) return null;
    if (origin_planet == this.planetA) {
      if (this.sendingB2A.owner == origin_planet.owner) this.sendingB2A.stop_sending_ships();
      this.sendingA2B.start_sending_ships();
    }
    if (origin_planet == this.planetB) {
      if (this.sendingA2B.owner == origin_planet.owner) this.sendingA2B.stop_sending_ships();
      this.sendingB2A.start_sending_ships();
    }
  }

  stop_sending_ships(origin_planet) {
    if (origin_planet != this.planetA && origin_planet != this.planetB) return null;
    if (origin_planet == this.planetA) {
      this.sendingA2B.stop_sending_ships();
    }
    if (origin_planet == this.planetB) {
      this.sendingB2A.stop_sending_ships();
    }
  }

  update(delta) {
    this.check_2_ship_collision();
    this.sendingA2B.update(delta);
    this.sendingB2A.update(delta);
    this.sprite.scale.x = calc_gradiental_change_float(this.sprite.scale.x, this.target.scale, delta, 10);
    this.sprite.alpha = calc_gradiental_change_float(this.sprite.alpha, this.target.alpha, delta, 10);
    this.sprite.tint = calc_gradiental_change_color(this.sprite.tint, this.target.tint, delta, 2);
  }

  check_2_ship_collision() {
    let q1 = this.sendingA2B.ships_queue;
    let q2 = this.sendingB2A.ships_queue;
    if (q1.length == 0 || q2.length == 0 || q1[0].owner == q2[0].owner) return;
    if (q1[0].travel_percentage + q2[0].travel_percentage > 1) {
      this.sendingA2B.delete_last_ship();
      this.sendingB2A.delete_last_ship();
      // TODO make explosion
    }
  }

  isAMyPlanetThatIsSending() {
    return this.planetA.owner && !this.planetA.owner.isBot && this.sendingA2B.isSending();
  }

  isBMyPlanetThatIsSending() {
    return this.planetB.owner && !this.planetB.owner.isBot && this.sendingB2A.isSending();
  }

  pointerOver() {
    if (this.starSystem.draggedPlanet == null && (this.isAMyPlanetThatIsSending() || this.isBMyPlanetThatIsSending())) {
      this.sprite.texture = this.app.renderer.generateTexture(get_hover_line_shape(this));
      this.target.tint = COLOR_CONNECTION_HIGHLIGHT_MY;
    } else {
      // this.sprite.scale.y = 1.5;
      this.target.scale = 2;
      this.target.tint = COLOR_CONNECTION_HIGHLIGHT;
    }
    this.target.alpha = 1;
  }

  pointerOut() {
    this.sprite.texture = this.app.renderer.generateTexture(get_line_shape(this));
    this.target.alpha = 0.5;
    this.target.scale = 1;
    this.target.tint = COLOR_CONNECTION;
  }

  click() {
    if (this.isAMyPlanetThatIsSending) this.sendingA2B.stop_sending_ships();
    if (this.isBMyPlanetThatIsSending) this.sendingB2A.stop_sending_ships();
  }
}
