// star_system_creator.js

import Planet from "./../planet";
import Connection from "./../connection";
import { CONNECT_ALL_PLANETS } from "../settings";

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

    console.log(planet.radius);
    starSystem.r = Math.min(starSystem.r, planet.radius);
    starSystem.R = Math.max(starSystem.R, planet.radius);
  }
  console.log(starSystem.r, starSystem.R);
}

function createConnections(starSystem, connections) {
  if (CONNECT_ALL_PLANETS) {
    // if CONNECT_ALL_PLANETS is true, connect all planets to each other

    // iterate over all planets values

    for (let planetAName in starSystem.planets_dict) {
      for (let planetBName in starSystem.planets_dict) {
        let planetA = starSystem.planets_dict[planetAName];
        let planetB = starSystem.planets_dict[planetBName];
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
      let planetA = starSystem.planets_dict[connections[i].A];
      let planetB = starSystem.planets_dict[connections[i].B];
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
    starSystem.planets_dict[new_planet.name] = new_planet;
  }
}

function addPlanetsAndConnectionsToStage(starSystem) {
  const planets_list = [];
  for (let planet_name in starSystem.planets_dict) {
    let planet = starSystem.planets_dict[planet_name];
    planets_list.push(planet);
  }
  starSystem.players.forEach((player) => {
    player.planets = planets_list;
  });

  starSystem.connections.forEach((connection) =>
    starSystem.app.stage.addChild(connection.sprite),
  );
  Object.values(starSystem.planets_dict).forEach((planet) => {
    starSystem.app.stage.addChild(planet.sprite);
    starSystem.app.stage.addChild(planet.label);
  });
}
