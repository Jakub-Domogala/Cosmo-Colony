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
  constructor(name, x, y, r, color, owner, system) {
    this.attack_speed = 1;
    this.breed_rate = 1;

    this.name = name;
    this.label = null;
    this.r = r;
    this.x = x;
    this.y = y;
    this.app = system.app;
    this.color = color;
    this.status = owner !== null ? STATUS.NEUTRAL : STATUS.OCCUPIED;
    this.owner = owner == null ? null : owner;
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
    const second_planet =
      connection.planetA == this ? connection.planetB : connection.planetA;
    this.connections_dict[second_planet.name] = connection;
  }

  display_name(circle_texture) {
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 12,
      fill: "white",
    });
    this.label = new PIXI.Text({ text: this.name, style });
    console.log(name);
    this.label.anchor.set(0.5);
    this.label.x = 0;
    circle_texture.addChild(this.label);
  }

  start_sending_ships(destination_planet) {
    if (this.connections_dict[destination_planet.name] == undefined) return;
    this.connections_dict[destination_planet.name].start_sending_ships(this);
  }

  update() {
    // Update the planet
    // i guess we re only updating the color and health of the planet
  }

  onMouseDown(event) {
    console.log(this.connections_dict);
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
}
