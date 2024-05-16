// star_system.js

import { createMap } from "./star_system/star_system_creator.js";
import { distance } from "./common/common_utils.js";
import {
  COLOR_INDICATOR_SUCCESS,
  COLOR_INDICATOR_FAIL,
  GAME_STATUS_GOING,
  GAME_STATUS_WON,
  GAME_STATUS_LOST,
  GAME_STATUS_LAST_BOT_STANDING,
} from "./settings.js";
import Pointer from "./pointer.js";
import STATUS from "./planet/planet_status_enum.js";

export default class StarSystem {
  constructor(data, app, players) {
    this.data = data;
    this.app = app;
    this.planets_name2obj = {};
    this.planets_name2idx = {};
    this.planets_list = [];
    this.connections_matrix = [];
    this.players = players;
    this.players_is_alive = new Array(this.players.length).fill(true);
    this.isAllBots = players.every((player) => player.isBot);
    this.connections = [];
    this.draggedPlanet = null;
    this.targetPlanet = null;
    this.newptr = null;
    this.R = null;
    this.r = null;
    this.lastDT = 0;
    this.elapsedTime = 0;

    createMap(this);
    this.newptr = new Pointer(this.app);
    this.app.stage.addChild(this.newptr.sprite);
  }

  onPlanetDrag(planet) {
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
      this.newptr.setPointerPosition(this.draggedPlanet.sprite.position, event.data.global, this.lastDT);
    } else {
      this.targetPlanet = collision;
      this.newptr.setPointerPosition(
        this.draggedPlanet.sprite.position,
        this.targetPlanet.sprite.position,
        this.lastDT,
        this.findIfPlanetsConnection(this.draggedPlanet, this.targetPlanet) ? COLOR_INDICATOR_SUCCESS : COLOR_INDICATOR_FAIL,
      );
    }
  }

  findIfPlanetCollision(position) {
    for (let planet in this.planets_name2obj) {
      const p_obj = this.planets_name2obj[planet];
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

  update(delta) {
    this.mark_killed_players();
    this.lastDT = delta;
    this.elapsedTime += delta;
    for (let connection of this.connections) connection.update(delta);
    Object.values(this.planets_name2obj).forEach((planet) => {
      planet.update(delta);
    });
    // if (this.elapsedTime > 1) {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players_is_alive[i]) continue;
      this.players[i].makeMove(delta, this);
    }
    // }
    this.newptr.update(delta);

    return this.check_game_status();
  }

  mark_killed_players() {
    const tmpAlive = new Array(this.players.length).fill(false);
    this.planets_list.forEach((planet) => {
      if (planet.owner) tmpAlive[this.players.indexOf(planet.owner)] = true;
    });
    tmpAlive.forEach((alive, idx) => {
      if (!alive) this.players_is_alive[idx] = false;
    });
  }

  check_game_status() {
    let inGamePlayers = [];
    for (let planet in this.planets_name2obj) {
      const p = this.planets_name2obj[planet];
      if (p.owner !== null) inGamePlayers.push(p.owner);
    }
    inGamePlayers = [...new Set(inGamePlayers)];
    if (this.isAllBots) {
      if (inGamePlayers.length == 1) return GAME_STATUS_LAST_BOT_STANDING;
      return GAME_STATUS_GOING;
    } else {
      if (inGamePlayers.length == 1) {
        if (!inGamePlayers[0].isBot) return GAME_STATUS_WON;
        return GAME_STATUS_LAST_BOT_STANDING;
      }
      if (inGamePlayers.every((player) => player.isBot) && !this.isAllBots) {
        return GAME_STATUS_LOST;
      }
      return GAME_STATUS_GOING;
    }
  }

  get_planet_by_name(name) {
    return this.planets_name2obj[name];
  }

  get_planet_idx_by_name(name) {
    return this.planets_name2idx[name];
  }

  get_planet_idx_by_obj(planet) {
    return this.planets_name2idx[planet.name];
  }

  get_planet_obj_by_idx(idx) {
    return this.planets_list[idx];
  }

  get_planets_length() {
    return this.planets_list.length;
  }
}
