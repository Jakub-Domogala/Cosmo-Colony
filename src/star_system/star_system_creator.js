// star_system_creator.js
import Planet from "./../planet";
import Connection from "./../connection";
import { CONNECT_ALL_PLANETS } from "../settings";
import { v8_0_0 } from "pixi.js";

export function createMap(starSystem) {
  let data = starSystem.data;
  findMinMaxR(starSystem, data.planets);
  createPlanets(starSystem, data.planets);
  createConnections(starSystem, data.connections);
  addPlanetsAndConnectionsToStage(starSystem);
}

export function findMinMaxR(starSystem, planets) {
  starSystem.r = 1000;
  starSystem.R = 10;
  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];

    starSystem.r = Math.min(starSystem.r, planet.radius);
    starSystem.R = Math.max(starSystem.R, planet.radius);
  }
}

function createConnections(starSystem, connections) {
  if (CONNECT_ALL_PLANETS) {
    // if CONNECT_ALL_PLANETS is true, connect all planets to each other

    // iterate over all planets values

    for (let planetAName in starSystem.planets_name2obj) {
      for (let planetBName in starSystem.planets_name2obj) {
        let planetA = starSystem.planets_name2obj[planetAName];
        let planetB = starSystem.planets_name2obj[planetBName];
        if (planetA != planetB) {
          let new_connection = new Connection(
            planetA,
            planetB,
            starSystem.app,
            starSystem,
          );

          planetA.addConnection(new_connection);
          planetB.addConnection(new_connection);
          starSystem.connections.push(new_connection);
        }
      }
    }
  } else {
    for (let i = 0; i < connections.length; i++) {
      let planetA = starSystem.planets_name2obj[connections[i].A];
      let planetB = starSystem.planets_name2obj[connections[i].B];
      const new_connection = new Connection(
        planetA,
        planetB,
        starSystem.app,
        starSystem,
      );
      planetA.addConnection(new_connection);
      planetB.addConnection(new_connection);
      starSystem.connections.push(new_connection);
    }
  }
}

function createPlanets(starSystem, planets) {
  let player_idx = 0;
  let occupied_count = 0;
  for (let i = 0; i < planets.length; i++) {
    if (planets[i].occupied) occupied_count++;
  }
  occupied_count =
    Math.floor(occupied_count / starSystem.players.length) *
    starSystem.players.length;
  for (let i = 0; i < planets.length; i++) {
    if (planets[i].occupied) {
      occupied_count--;
      if (occupied_count < 0) {
        planets[i].occupied = false;
      }
    }
    let player_assign = null;
    if (starSystem.players.length > 0 && planets[i].occupied) {
      player_assign = starSystem.players[player_idx];
      player_idx = (player_idx + 1) % starSystem.players.length;
    }

    let new_planet = new Planet(
      planets[i].name,
      planets[i].x,
      planets[i].y,
      planets[i].radius,
      player_assign ? player_assign.color : null,
      player_assign,
      starSystem,
    );
    starSystem.planets_name2obj[new_planet.name] = new_planet;
  }
}

function addPlanetsAndConnectionsToStage(starSystem) {
  const planets_list = [];
  for (let planet_name in starSystem.planets_name2obj) {
    let planet = starSystem.planets_name2obj[planet_name];
    planets_list.push(planet);
  }
  starSystem.planets_list = planets_list;
  console.log(planets_list);
  // declare matrix
  for (let i = 0; i < planets_list.length; i++) {
    starSystem.connections_matrix.push([]);
    starSystem.planets_name2idx[planets_list[i].name] = i;
    for (let j = 0; j < planets_list.length; j++) {
      starSystem.connections_matrix[i].push(false);
    }
  }
  // fill matrix
  for (let i = 0; i < starSystem.connections.length; i++) {
    let planetA = starSystem.connections[i].planetA;
    let planetB = starSystem.connections[i].planetB;
    let idxA = starSystem.planets_name2idx[planetA.name];
    let idxB = starSystem.planets_name2idx[planetB.name];
    starSystem.connections_matrix[idxA][idxB] = true;
    starSystem.connections_matrix[idxB][idxA] = true;
  }
  // TODO: fill matrix
  // console.log("matrix", starSystem.connections_matrix);
  // console.log("list", starSystem.planets_list);
  // console.log("name2idx", starSystem.planets_name2idx);
  // console.log("name2obj", starSystem.planets_name2obj);
  // print size of matrix
  // console.log(Object.keys(starSystem.connections_matrix).length);
  starSystem.players.forEach((player) => {
    player.planets = planets_list;
  });

  starSystem.connections.forEach((connection) =>
    starSystem.app.stage.addChild(connection.sprite),
  );
  Object.values(starSystem.planets_name2obj).forEach((planet) => {
    starSystem.app.stage.addChild(planet.sprite);
    starSystem.app.stage.addChild(planet.label);
  });
}
