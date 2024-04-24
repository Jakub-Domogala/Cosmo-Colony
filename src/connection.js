import * as PIXI from "pixi.js";
import Sending from "./sending.js";
// connection.js

export default class Connection {
  constructor(planetA, planetB, app) {
    this.sprite = null; // PIXI sprite object for the connection
    this.width = 2; // constant integer width of the connection
    this.color = 0x000000; // constant integer color of the connection
    this.cordinates = [
      [planetA.x, planetA.y],
      [planetB.x, planetB.y],
    ]; // list of integers representing the coordinates of the connection
    this.sendingA2B = null;
    this.sendingB2A = null;
    this._planetA = planetA;
    this._planetB = planetB;

    this.sendingA2B = new Sending(planetA, planetB, app);
    this.sendingB2A = new Sending(planetB, planetA, app);

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

  make_sprite() {
    const width = 6;
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    let line = new PIXI.Graphics();
    line.moveTo(this.planetA.x, this.planetA.y);
    line.lineTo(this.planetB.x, this.planetB.y);
    line.lineTo(this.planetA.x, this.planetA.y);
    line.lineTo(this.planetB.x, this.planetB.y);
    line.fill();
    line.stroke({ width: width, color: 0x000000, alpha: 1, join: "round" });
    const texture = this.app.renderer.generateTexture(line);
    this.sprite.x = (this.cordinates[0][0] + this.cordinates[1][0]) / 2;
    this.sprite.y = (this.cordinates[0][1] + this.cordinates[1][1]) / 2;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.texture = texture;
  }

  start_sending_ships(origin_planet) {
    destination_planet =
      origin_planet === this.planetA ? this.planetB : this.planetA;
  }
}
