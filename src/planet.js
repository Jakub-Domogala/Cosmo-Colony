// planet.js

import * as PIXI from "pixi.js";
import STATUS from "./planet/planet_status_enum";
import { COLOR_PLANET_NEUTRAL } from "./settings";

export default class Planet {
  constructor(name, x, y, r, color, player, system) {
    this.attack_speed = 6;
    this.breed_rate = player ? 1 : 0.5;
    this.population = player ? 100 : r;

    this.breeding_time = 0.0;
    this.name = name;
    this.label = null;
    this.r = r;
    this.x = x;
    this.y = y;
    this.app = system.app;
    this.color = color ? color : COLOR_PLANET_NEUTRAL;
    this.status = player !== null ? STATUS.NEUTRAL : STATUS.OCCUPIED;
    this.owner = player;
    this.sprite = null;
    this.make_sprite();
    // dict of structure {planet_name: connection_object}
    this.connections_dict = {};

    this.this_system = system;

    this.onMouseDown = this.onMouseDown.bind(this);

    this.sprite.interactive = true;
    this.sprite.eventMode = "dynamic";
    this.sprite.cursor = "pointer";
    this.sprite.addEventListener("pointerdown", this.onMouseDown, this);
    this.sprite.addEventListener("pointerover", this.onMouseOver.bind(this)); // here i use bind(this) cause i want to use the planet object not the sprite
    this.sprite.addEventListener("pointerout", this.onMouseOut.bind(this));
  }

  make_sprite() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.RED); // placeholder texture
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1);
    // this.sprite.hitArea = new PIXI.Circle(0, 0, 1 * this.r); didnt help
    this.updateColor();
    this.display_name();
  }

  updateColor() {
    const circle_texture = new PIXI.Graphics();
    circle_texture.circle(0, 0, this.r);
    circle_texture.fill(this.color);
    const texture = this.app.renderer.generateTexture(circle_texture);
    this.sprite.texture = texture;
    this.sprite.didChange = true;
  }

  planetTakeover(newColor, newStatus) {
    this.color = newColor;
    this.status = newStatus;
    this.breed_rate = 1;
    this.updateColor();
  }

  addConnection(connection) {
    const second_planet =
      connection.planetA == this ? connection.planetB : connection.planetA;
    this.connections_dict[second_planet.name] = connection;
  }

  display_name() {
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 22,
      fill: "white",
    });
    this.label = new PIXI.Text({ text: this.population, style });
    this.label.anchor.set(0.5);
    this.label.x = this.x;
    this.label.y = this.y;
    this.label.hitArea = new PIXI.Circle(0, 0, 0);
    this.label.eventMode = "dynamic";
    console.log(this.label);
  }

  start_sending_ships(destination_planet) {
    if (this.connections_dict[destination_planet.name] == undefined) return;
    this.connections_dict[destination_planet.name].start_sending_ships(this);
  }

  updateLabel() {
    this.label.text = Math.round(this.population, 0).toString();
    // this.label.didChange = true;
    this.label._didTextUpdate = true;
  }

  shipArrival(ship) {
    if (!this.owner || this.owner != ship.owner) {
      this.population -= 1;
      if (this.population <= 0) {
        this.owner = ship.owner;
        this.population = Math.abs(this.population);
        this.planetTakeover(this.owner.color, STATUS.OCCUPIED);
      }
      this.updateLabel();
    } else if (this.owner == ship.owner) {
      this.population += 1;
      this.updateLabel();
    }
  }

  shipSent() {
    this.population -= 1;
    this.updateLabel();
  }

  update(delta) {
    this.breeding_time += delta * this.breed_rate;
    // if (this.name == "Mars") console.log("Mars time: ", this.breeding_time);
    if (this.breeding_time >= 1) {
      this.breeding_time -= 1;
      // this.population += Math.log2(this.population * 2) * 0.1 * this.r * 0.02;
      this.population += 1;
      this.updateLabel();
    }
    // Update the planet
    // i guess we re only updating the color and health of the planet
  }

  onMouseDown(event) {
    if (this.this_system) {
      this.this_system.onPlanetDrag(this);
    }
  }

  onMouseOver(event) {
    if (this.this_system) {
      this.this_system.onDragOver(this);
    }
  }

  onMouseOut(event) {
    if (this.this_system) {
      this.this_system.onDragOut(this);
    }
  }

  onClick(event) {
    return;
  }
}
