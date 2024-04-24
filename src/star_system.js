// star_system.js

import * as PIXI from "pixi.js";
import Planet from "./planet";
import Connection from "./connection";

export default class StarSystem {
  constructor(data, app, circleTexture) {
    this._data = data;
    this._app = app;
    this._planets_dict = {};
    this._circleTexture = circleTexture;
    this.connections = [];
    this.draggedPlanet = null;
    this.targetPlanet = null;
    this.createMap();

    // pointer line when dragging
    this.pointer = new PIXI.Graphics();
    this.app.stage.addChild(this.pointer);
  }

  get data() {
    return this._data;
  }

  get app() {
    return this._app;
  }

  get circleTexture() {
    return this._circleTexture;
  }

  get planets_dict() {
    return this._planets_dict;
  }

  createMap() {
    let planetData = this.data;
    this.createPlanets(planetData.planets);
    this.createConnections(planetData.connections);

    // this needs to be in order for correct layering
    this.drawConnections();
    this.drawPlanets();
  }

  createConnections(connections) {
    for (let i = 0; i < connections.length; i++) {
      let planetA = this._planets_dict[connections[i].A];
      let planetB = this._planets_dict[connections[i].B];
      const new_connection = new Connection(planetA, planetB, this.app);
      planetA.addConnection(new_connection);
      planetB.addConnection(new_connection);
      this.connections.push(new_connection);
    }
  }

  drawConnections() {
    for (let i = 0; i < this.connections.length; i++) {
      this.app.stage.addChild(this.connections[i].sprite);
    }
  }

  createPlanets(planets) {
    // console.log("star system createPlanets", this.onPlanetDrag);
    for (let i = 0; i < planets.length; i++) {
      let new_planet = new Planet(
        planets[i].name,
        planets[i].x,
        planets[i].y,
        planets[i].radius,
        0x556655,
        "alive",
        this.app,
        this.circleTexture,
        this,
      );
      this._planets_dict[new_planet.name] = new_planet;
    }
  }

  drawPlanets() {
    for (let planet in this._planets_dict) {
      this.app.stage.addChild(this._planets_dict[planet].sprite);
    }
  }

  onPlanetDrag(planet) {
    console.log("star system onPlanetDrag");
    // Store a reference to the dragged planet
    this.draggedPlanet = planet;
    // Reduce transparency while dragging
    planet.sprite.alpha = 0.5;
    // Listen for mouse move events to update the position of the dragged planet
    // console.log("SHOULD BE STAR SYSTEM", this);
    // console.log("SHOULD BE STAR SYSTEM onDragMove", this.onDragMove);
    // console.log("SHOULD BE STAR SYSTEM onDragEnd", this.onDragEnd);
    console.log(this.app);
    this.app.stage.on("pointermove", this.onDragMove.bind(this));
    this.app.stage.on("pointerup", this.onDragEnd.bind(this));
  }

  onDragMove(event) {
    // console.log("star system onDragMove", event, this.draggedPlanet);
    if (this.draggedPlanet) {
      // Move the dragged planet to the mouse position
      // console.log("star system onDragMove INSIDE", this.draggedPlanet);
      // this.draggedPlanet.sprite.position.copyFrom(event.data.global);

      this.drawPointer(this.draggedPlanet.sprite.position, event.data.global);
    }
  }

  onDragEnd() {
    // console.log("star system onDragEnd", this);
    console.log(
      "star system END DRAG",
      this.draggedPlanet.name,
      this.targetPlanet.name,
    );
    this.pointer.clear();
    if (this.draggedPlanet) {
      // Restore transparency
      this.draggedPlanet.sprite.alpha = 1;
      if (this.targetPlanet) {
        this.targetPlanet.sprite.alpha = 1;
      }
      // Remove event listener for mouse move
      this.app.stage.off("pointermove", this.onDragMove);
      this.app.stage.off("pointerup", this.onDragEnd);
      // Clear dragged planet reference
      this.draggedPlanet = null;
    }
  }

  onDragOver(planet) {
    console.log("star system onDragOver", planet.name);
    this.targetPlanet = planet;
    this.targetPlanet.sprite.alpha = 0.5;
  }

  onDragOut(planet) {
    console.log("star system onDragOut", planet.name);
    if (planet != this.draggedPlanet) {
      // this.draggedPlanet = null;
      this.targetPlanet.sprite.alpha = 1;
      this.targetPlanet = null;
    }
  }

  drawPointer(positionA, positionB) {
    this.pointer.clear();
    this.pointer.moveTo(positionA.x, positionA.y);
    this.pointer.lineTo(positionB.x, positionB.y);
    this.pointer.fill();
    this.pointer.stroke({ width: 2, color: 0x990000 });
  }
}
