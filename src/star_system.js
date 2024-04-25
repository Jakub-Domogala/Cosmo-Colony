// star_system.js

import { createMap, initPointer } from "./star_system/star_system_creator.js";

export default class StarSystem {
  constructor(data, app, circleTexture) {
    this.data = data;
    this.app = app;
    this.planets_dict = {};
    this.circleTexture = circleTexture;
    this.connections = [];
    this.draggedPlanet = null;
    this.targetPlanet = null;
    this.pointer = null;

    createMap(this);
    initPointer(this);
  }

  onPlanetDrag(planet) {
    console.log("star system onPlanetDrag XXXX");
    this.draggedPlanet = planet;
    this.targetPlanet = null;
    planet.sprite.alpha = 0.5;
    this.app.stage.on("pointermove", this.onDragMove.bind(this));
    this.app.stage.on("pointerup", this.onDragEnd.bind(this));
  }

  onDragMove(event) {
    if (!this.draggedPlanet) return;
    this.drawPointer(this.draggedPlanet.sprite.position, event.data.global);
  }

  onDragEnd() {
    if (!this.draggedPlanet) return;
    console.log(
      "star system END DRAG",
      this.draggedPlanet != null ? this.draggedPlanet.name : "undefined",
      this.targetPlanet != null ? this.targetPlanet.name : "undefined",
    );
    this.pointer.clear();
    this.draggedPlanet.sprite.alpha = 1;
    if (this.targetPlanet) this.targetPlanet.sprite.alpha = 1;
    this.app.stage.off("pointermove", this.onDragMove);
    this.app.stage.off("pointerup", this.onDragEnd);
    // TODO SEND SHIPS
    this.draggedPlanet = null;
    this.targetPlanet = null;
  }

  onDragOver(planet) {
    console.log("star system onDragOver", planet.name, "------");
    if (planet == this.draggedPlanet) return;
    console.log("star system onDragOver", planet.name);
    this.targetPlanet = planet;
    this.targetPlanet.sprite.alpha = 0.5;
  }

  onDragOut(planet) {
    console.log(planet.name);
    console.log("star system onDragOut", planet.name);
    if (planet != this.draggedPlanet) {
      planet.sprite.alpha = 1;
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
