// planet.js

import * as PIXI from "pixi.js";
import STATUS from "./planet/planet_status_enum";
import {
  COLOR_PLANET_NEUTRAL,
  PLANET_ATTACK_SPEED,
  PLANET_ATTACK_SPEED_BY_RADIUS_INFLUENCE,
  PLANET_INIT_POPULATION,
  PLANET_NEUTRAL_BREEDRATE,
  PLANET_NEUTRAL_INIT_POPULATION_MULTIPLIER,
  PLANET_OCCUPIED_BREEDRATE,
  PLANET_RANDOM_BREEDING_INFLUENCE,
} from "./settings";
import {
  darkenColor,
  calc_gradiental_change_float,
  calc_gradiental_change_color,
} from "./common/common_utils";

export default class Planet {
  constructor(name, x, y, r, color, player, system) {
    // this.attack_speed = 6;
    this.attack_speed =
      PLANET_ATTACK_SPEED *
      (1 + (r / system.r - 1) * PLANET_ATTACK_SPEED_BY_RADIUS_INFLUENCE);
    this.breed_rate = player
      ? PLANET_OCCUPIED_BREEDRATE
      : PLANET_NEUTRAL_BREEDRATE;
    this.population = Math.ceil(
      player
        ? PLANET_INIT_POPULATION
        : PLANET_INIT_POPULATION *
            (r / system.r) *
            PLANET_NEUTRAL_INIT_POPULATION_MULTIPLIER,
    );

    this.breeding_time = 0.0;
    this.name = name;
    this.label = null;
    this.r = r;
    this.x = x;
    this.y = y;
    this.app = system.app;
    this.color = color ? color : COLOR_PLANET_NEUTRAL;
    this.status = player == null ? STATUS.NEUTRAL : STATUS.OCCUPIED;
    this.owner = player;
    this.sprite = null;

    this.target_alpha = 1.0;
    this.target_scale = 1.0;
    this.target = { color: this.color, alpha: 1.0, scale: 1.0 };

    this.make_sprite();
    // dict of structure {planet_name: connection_object}
    this.connections_dict = {};
    this.connected_planets = [];

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
    this.sprite.hitArea = new PIXI.Circle(0, 0, 1.1 * this.r);
    this.createPopulationLabel();

    const borderwidth = this.r / 4;
    this.sprite.texture = this.app.renderer.generateTexture(
      new PIXI.Graphics()
        .circle(0, 0, this.r - borderwidth)
        .fill(0xffffff)
        .stroke({
          width: borderwidth,
          color: 0x555555,
        }),
    );
  }

  highlightOn() {
    this.target.alpha = 0.5;
    this.target.scale = 1.2;
  }

  highlightOff() {
    this.target.alpha = 1;
    this.target.scale = 1;
  }

  planetTakeover(newColor, newStatus) {
    this.color = newColor;
    this.target.color = newColor;
    this.status = newStatus;
    this.breed_rate = 1;
  }

  addConnection(connection) {
    const second_planet =
      connection.planetA == this ? connection.planetB : connection.planetA;
    this.connections_dict[second_planet.name] = connection;
    this.connected_planets.push(second_planet);
  }

  createPopulationLabel() {
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: this.r * 0.8,
      fill: 0xffffff,
    });
    this.label = new PIXI.Text({ text: this.population, style });
    this.label.anchor.set(0.5);
    this.label.x = this.x;
    this.label.y = this.y;
    this.label.hitArea = new PIXI.Circle(0, 0, 0);
    this.label.eventMode = "dynamic";
  }

  start_sending_ships(destination_planet) {
    if (this.connections_dict[destination_planet.name] == undefined) return;
    this.connections_dict[destination_planet.name].start_sending_ships(this);
  }

  updatePopulationLabel() {
    this.label.text = Math.round(this.population, 0).toString();
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
    } else if (this.owner == ship.owner) {
      this.population += 1;
    }
    this.updatePopulationLabel();
  }

  shipSent() {
    this.population -= 1;
    this.updatePopulationLabel();
  }

  calculateBreedindDelta(delta) {
    return (
      delta *
      this.breed_rate *
      Math.sqrt(this.r / this.this_system.r) *
      0.05 *
      (Math.log2(this.population + 1) + 1) *
      (1 + (Math.random() - 0.5) * PLANET_RANDOM_BREEDING_INFLUENCE)
    );
  }

  update(delta) {
    this.breeding_time += this.calculateBreedindDelta(delta);
    // if (this.name == "Mars") console.log("Mars time: ", this.breeding_time);
    while (this.breeding_time >= 1) {
      this.breeding_time -= 1;
      this.population += 1;
      this.updatePopulationLabel();
    }
    // Update the planet
    // i guess we re only updating the color and health of the planet
    this.sprite.alpha = calc_gradiental_change_float(
      this.sprite.alpha,
      this.target.alpha,
      delta,
    );
    this.sprite.scale.set(
      calc_gradiental_change_float(
        this.sprite.scale.x,
        this.target.scale,
        delta,
      ),
    );
    this.sprite.tint = calc_gradiental_change_color(
      this.sprite.tint,
      this.target.color,
      delta,
    );
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
