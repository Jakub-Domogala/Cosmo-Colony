import * as PIXI from "pixi.js";
// planet.js

export default class Planet {
  constructor(name, x, y, r, color, status, app, cirTex) {
    this.attack_speed = 1; // constant integer attack speed of the planet
    this.breed_rate = 1; // constant integer breed rate of the planet

    this.name = name; // string name of the planet
    this._r = r; // constant integer radius of the planet
    this.x = x; // constant integer coordinate x
    this.y = y; // constant integer coordinate y
    this._app = app; // reference to the PIXI application
    this.color = color; // color of the planet
    this.status = status; // string status of the planet
    this.sprite = null; // PIXI sprite object for the planet
    this._cirTex = cirTex;
    this.make_sprite(); // create the sprite object
    // dict of structure {planet_name: connection_object}
    this.connections_dict = {};
  }

  // Getter methods for constants x, y, and r
  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get r() {
    return this._r;
  }

  get cirTex() {
    return this._cirTex;
  }

  // Getter methods for color and status
  get color() {
    return this._color;
  }

  get status() {
    return this._status;
  }

  // Getter method for the PIXI application
  get app() {
    return this._app;
  }

  // Setter methods for color and status
  set x(newX) {
    this._x = newX;
    if (this.sprite) {
      this.sprite.x = newX;
    }
  }

  set y(newY) {
    this._y = newY;
    if (this.sprite) {
      this.sprite.y = newY;
    }
  }

  set color(newColor) {
    this._color = newColor;
  }

  set status(newStatus) {
    this._status = newStatus;
  }

  // Create a PIXI sprite object for the planet
  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.updateColor();
  }

  updateColor() {
    // Clear the previous graphics
    const circle_texture = new PIXI.Graphics();
    circle_texture.circle(0, 0, this.r);
    circle_texture.fill(this.color);
    // add planet name abouve texture circle
    this.display_name(circle_texture);
    const texture = this.app.renderer.generateTexture(circle_texture);
    this.sprite.texture = texture;
    // this.sprite.texture = this.cirTex;
  }

  planetTakeover(newColor, newStatus) {
    this.color = newColor;
    this.status = newStatus;
    this.updateColor();
  }

  addConnection(connection) {
    let second_planet = connection.planetA;
    if (connection.planet1 == this) second_planet = connection.planetB;
    this.connections_dict[second_planet.name] = connection;
  }

  display_name(circle_texture) {
    // const style = new PIXI.TextStyle({
    //   fontFamily: "Arial",
    //   fontSize: 12,
    //   fill: "white",
    // });
    // const name = new PIXI.Text(this.name, style);
    // name.anchor.set(0.5);
    // name.x = 0;
    // // name.y = -this.r - 10;
    // circle_texture.addChild(name);
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 12,
      fill: "white",
    });
    const name = new PIXI.Text({ text: this.name, style });
    name.anchor.set(0.5);
    name.x = 0;
    // name.y = -this.r - 10;
    circle_texture.addChild(name);
  }

  start_sending_ships(destination_planet) {
    // check for connection
    if (this.connections_dict[destination_planet.name] == undefined) {
      console.log("No connection between planets");
      return;
    }

    this.connections_dict[destination_planet.name].start_sending_ships(this);
  }

  update() {
    // Update the planet
    // i guess we re only updating the color and health of the planet
  }
}
