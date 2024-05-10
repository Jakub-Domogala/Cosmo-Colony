// star_system.js

import { findMinMaxR, createMap } from "./star_system/star_system_creator.js";
import { distance } from "./common/common_utils.js";
import { COLOR_INDICATOR_SUCCESS, COLOR_INDICATOR_FAIL } from "./settings.js";
import Pointer from "./pointer.js";
import STATUS from "./planet/planet_status_enum.js";

export default class StarSystem {
  constructor(data, app, players) {
    this.data = data;
    this.app = app;
    this.planets_dict = {};
    this.players = players;
    this.connections = [];
    this.draggedPlanet = null;
    this.targetPlanet = null;
    this.newptr = null;
    this.R = null;
    this.r = null;
    this.lastDT = 0;

    findMinMaxR(this);
    createMap(this);
    this.newptr = new Pointer(this.app);
    this.app.stage.addChild(this.newptr.sprite);
  }

  onPlanetDrag(planet) {
    console.log(planet.status);
    if (planet.status == STATUS.NEUTRAL || planet.owner.isBot) {
      console.log("You can only drag your planets!");
      return;
    }
    this.draggedPlanet = planet;
    this.targetPlanet = null;
    planet.highlightOn();
    this.app.stage.on("pointermove", this.onDragMove.bind(this));
    this.app.stage.on("pointerup", this.onDragEnd.bind(this));
  }

  onDragMove(event) {
    if (!this.draggedPlanet) return;
    const collision = this.findIfPlanetCollision(event.data.global);
    if (!collision || collision == this.draggedPlanet) {
      this.newptr.setPointerPosition(
        this.draggedPlanet.sprite.position,
        event.data.global,
        this.lastDT,
      );
    } else {
      this.targetPlanet = collision;
      this.newptr.setPointerPosition(
        this.draggedPlanet.sprite.position,
        this.targetPlanet.sprite.position,
        this.lastDT,
        this.findIfPlanetsConnection(this.draggedPlanet, this.targetPlanet)
          ? COLOR_INDICATOR_SUCCESS
          : COLOR_INDICATOR_FAIL,
      );
    }
  }

  findIfPlanetCollision(position) {
    for (let planet in this.planets_dict) {
      const p_obj = this.planets_dict[planet];
      if (distance(p_obj.sprite.position, position) < p_obj.r + 2) return p_obj;
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
    this.newptr.isActive = false;
    if (this.draggedPlanet == this.targetPlanet) this.targetPlanet = null;
    this.draggedPlanet.highlightOff();
    this.app.stage.off("pointermove", this.onDragMove);
    this.app.stage.off("pointerup", this.onDragEnd);
    if (this.targetPlanet) {
      this.targetPlanet.highlightOff();
      this.send_ships_if_connection(this.draggedPlanet, this.targetPlanet);
    }
    this.draggedPlanet = null;
    this.targetPlanet = null;
  }

  onDragOver(planet) {
    if (planet == this.draggedPlanet) return;
    this.targetPlanet = planet;
    planet.highlightOn();
  }

  onDragOut(planet) {
    if (planet != this.draggedPlanet) {
      planet.highlightOff();
      this.targetPlanet = null;
    }
  }

  // planetHighlightOn(planet) {
  //   // TODO might add some more gradient changes here
  //   planet.sprite.alpha = 0.5;
  //   planet.sprite.scale.set(1.2);
  // }

  // planetHighlightOff(planet) {
  //   // TODO might add some more gradient changes here
  //   planet.sprite.alpha = 1;
  //   planet.sprite.scale.set(1);
  // }

  update(delta) {
    this.lastDT = delta;
    for (let connection of this.connections) connection.update(delta);
    Object.values(this.planets_dict).forEach((planet) => {
      planet.update(delta);
    });
    for (let i = 0; i < this.players.length; i++)
      this.players[i].makeMove(delta);
    this.newptr.update(delta);
  }
}
