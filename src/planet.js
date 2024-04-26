// planet.js
/*


POTENTIAL SOLUTION FOR DRAGGING NOT WORKING:
- The problem is that when i move mouse with pointerdown event, the pointerover and pointerout are triggered randomly when i keep hovering over the planet.
- The solution is to use pointermove event instead of pointerover and pointerout events.
- The pointermove event is triggered when the pointer is moved over the sprite.

could use click on A, click on B





*/
import * as PIXI from "pixi.js";
import STATUS from "./planet/planet_status_enum";

export default class Planet {
  constructor(name, x, y, r, color, playerName, system) {
    this.attack_speed = 5;
    this.breed_rate = 0.5;
    this.initial_population = 100;

    this.elapsed_time = 0.0;
    this.name = name;
    this.label = null;
    this.r = r;
    this.x = x;
    this.y = y;
    this.app = system.app;
    this.color = color;
    this.status = playerName !== null ? STATUS.NEUTRAL : STATUS.OCCUPIED;
    this.owner = playerName == null ? null : playerName;
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
  }

  updateColor() {
    const circle_texture = new PIXI.Graphics();
    circle_texture.circle(0, 0, this.r);
    circle_texture.fill(this.color);
    this.display_name();
    const texture = this.app.renderer.generateTexture(circle_texture);
    this.sprite.texture = texture;
  }

  planetTakeover(newColor, newStatus) {
    this.color = newColor;
    this.status = newStatus;
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
    this.label = new PIXI.Text({ text: this.initial_population, style });
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
    this.label.text = Math.round(this.initial_population, 0).toString();
    this.label.didChange = true;
    this.label._didTextUpdate = true;
    // console.log(this.initial_population);
    // this.labelSprite.texture = this.app.renderer.generateTexture(this.label);
    // this.app.stage.removeChild(this.labelSprite);
    // this.app.stage.addChild(this.labelSprite);
  }

  update(delta) {
    this.elapsed_time += delta * this.breed_rate;
    // if (this.name == "Mars") console.log("Mars time: ", this.elapsed_time);
    if (this.elapsed_time >= 1) {
      this.elapsed_time -= 1;
      this.initial_population +=
        Math.log2(this.initial_population * 2) * 0.1 * this.r * 0.02;
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
