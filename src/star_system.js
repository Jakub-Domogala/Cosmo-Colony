// star_system.js

import { createMap, initPointer } from "./star_system/star_system_creator.js";
import { distance } from "./utils.js";
import { COLOR_SUCCESS, COLOR_FAIL, COLOR_NEUTRAL } from "./settings.js";

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
    this.draggedPlanet = planet;
    this.targetPlanet = null;
    this.showPointerHighlightOn(planet);
    this.app.stage.on("pointermove", this.onDragMove.bind(this));
    this.app.stage.on("pointerup", this.onDragEnd.bind(this));
  }

  onDragMove(event) {
    if (!this.draggedPlanet) return;
    const collision = this.findIfPlanetCollision(event.data.global);
    if (!collision || collision == this.draggedPlanet) {
      this.drawPointer(this.draggedPlanet.sprite.position, event.data.global);
    } else {
      this.targetPlanet = collision;
      this.drawPointer(
        this.draggedPlanet.sprite.position,
        this.targetPlanet.sprite.position,
        this.findIfPlanetsConnection(this.draggedPlanet, this.targetPlanet)
          ? COLOR_SUCCESS
          : COLOR_FAIL,
      );
    }
  }

  findIfPlanetCollision(position) {
    for (let planet in this.planets_dict) {
      const p_obj = this.planets_dict[planet];
      if (distance(p_obj.sprite.position, position) < p_obj.r) return p_obj;
    }
    return null;
  }

  findIfPlanetsConnection(planetA, planetB) {
    let result = planetA.connections_dict[planetB.name];
    return result != undefined ? result : null;
  }

  send_ships_if_connection(planetA, planetB) {
    const connection = this.findIfPlanetsConnection(planetA, planetB);
    if (!connection) return;
    planetA.start_sending_ships(planetB);
  }

  onDragEnd() {
    if (!this.draggedPlanet) return;
    if (this.draggedPlanet == this.targetPlanet) this.targetPlanet = null;
    this.pointer.clear();
    this.showPointerHighlightOff(this.draggedPlanet);
    this.app.stage.off("pointermove", this.onDragMove);
    this.app.stage.off("pointerup", this.onDragEnd);
    if (!this.targetPlanet) return;
    this.showPointerHighlightOff(this.targetPlanet);
    // TODO SEND SHIPS
    this.send_ships_if_connection(this.draggedPlanet, this.targetPlanet);
    this.draggedPlanet = null;
    this.targetPlanet = null;
  }

  onDragOver(planet) {
    if (planet == this.draggedPlanet) return;
    this.targetPlanet = planet;
    this.showPointerHighlightOn(this.targetPlanet);
  }

  onDragOut(planet) {
    if (planet != this.draggedPlanet) {
      this.showPointerHighlightOff(planet);
      this.targetPlanet = null;
    }
  }

  drawPointer(positionA, positionB, color = COLOR_NEUTRAL) {
    this.pointer.clear();
    this.pointer.moveTo(positionA.x, positionA.y);
    this.pointer.lineTo(positionB.x, positionB.y);
    this.pointer.fill();
    this.pointer.stroke({ width: 2, color: color });
  }

  showPointerHighlightOn(planet) {
    // TODO might add some more gradient changes here
    planet.sprite.alpha = 0.5;
    planet.sprite.scale.set(1.2);
    // planet.sprite.tint = 0x999999;
  }

  showPointerHighlightOff(planet) {
    // TODO might add some more gradient changes here
    planet.sprite.alpha = 1;
    planet.sprite.scale.set(1);
    // planet.sprite.tint = 0xffffff;
  }

  update(delta) {
    // update connections
    for (let connection of this.connections) {
      connection.update(delta);
    }
  }
}
