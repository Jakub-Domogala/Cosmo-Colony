import * as PIXI from "pixi.js";
// connection.js

export default class Connection {
  constructor(planet1, planet2, app) {
    this.sprite = null; // PIXI sprite object for the connection
    this.width = 2; // constant integer width of the connection
    this.color = 0x000000; // constant integer color of the connection
    this.cordinates = [
      [planet1.x, planet1.y],
      [planet2.x, planet2.y],
    ]; // list of integers representing the coordinates of the connection
    this._planet1 = planet1;
    this._planet2 = planet2;
    this._app = app;
    this.make_sprite();
  }

  get planet1() {
    return this._planet1;
  }

  get planet2() {
    return this._planet2;
  }

  get app() {
    return this._app;
  }

  make_sprite() {
    const width = 6;
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    let line = new PIXI.Graphics();
    line.moveTo(this.planet1.x, this.planet1.y);
    line.lineTo(this.planet2.x, this.planet2.y);
    line.lineTo(this.planet1.x, this.planet1.y);
    line.lineTo(this.planet2.x, this.planet2.y);
    line.fill();
    line.stroke({ width: width, color: 0x000000, alpha: 1, join: "round" });
    const texture = this.app.renderer.generateTexture(line);
    this.sprite.x = (this.cordinates[0][0] + this.cordinates[1][0]) / 2;
    this.sprite.y = (this.cordinates[0][1] + this.cordinates[1][1]) / 2;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.sprite.texture = texture;
  }
}
