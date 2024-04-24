// planet.js

import * as PIXI from "pixi.js";

export default class Planet {
  constructor(name, x, y, r, color, status, app, cirTex, system) {
    this.attack_speed = 1;
    this.breed_rate = 1;

    this.name = name;
    this._r = r;
    this.x = x;
    this.y = y;
    this._app = app;
    this.color = color;
    this.status = status;
    this.sprite = null;
    this._cirTex = cirTex;
    this.make_sprite();
    // dict of structure {planet_name: connection_object}
    this.connections_dict = {};

    this.this_system = system;

    this.onMouseDown = this.onMouseDown.bind(this);

    this.sprite.interactive = true;
    this.sprite.eventMode = "static";
    this.sprite.addEventListener("pointerdown", this.onMouseDown);
    this.sprite.addEventListener("pointerover", this.onMouseOver.bind(this));
    this.sprite.addEventListener("pointerout", this.onMouseOut.bind(this));
  }

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

  get color() {
    return this._color;
  }

  get status() {
    return this._status;
  }

  get app() {
    return this._app;
  }

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

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    this.updateColor();
  }

  updateColor() {
    const circle_texture = new PIXI.Graphics();
    circle_texture.circle(0, 0, this.r);
    circle_texture.fill(this.color);
    this.display_name(circle_texture);
    const texture = this.app.renderer.generateTexture(circle_texture);
    this.sprite.texture = texture;
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

  onMouseDown(event) {
    console.log("planet onMouseDown");
    // this.dragging = true;
    console.log(this.solar_system);
    if (this.this_system) {
      this.this_system.onPlanetDrag(this);
    }
  }

  onMouseOver(event) {
    console.log("planet onMouseOver dragging");
    if (this.this_system) {
      this.this_system.onDragOver(this);
    }
  }

  onMouseOut(event) {
    console.log("planet onMouseOut dragging");
    if (this.this_system) {
      this.this_system.onDragOut(this);
    }
  }
}
