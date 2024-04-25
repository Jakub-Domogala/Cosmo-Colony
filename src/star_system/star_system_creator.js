import Planet from "./../planet";
import Connection from "./../connection";
import * as PIXI from "pixi.js";

export function initPointer(starSystem) {
  starSystem.pointer = new PIXI.Graphics();
  starSystem.app.stage.addChild(starSystem.pointer);
}

export function createMap(starSystem) {
  let planetData = starSystem.data;
  createPlanets(starSystem, planetData.planets);
  createConnections(starSystem, planetData.connections);

  // this needs to be in order for correct layering
  addPlanetsAndConnectionsToStage(starSystem);
}

function createConnections(starSystem, connections) {
  for (let i = 0; i < connections.length; i++) {
    let planetA = starSystem.planets_dict[connections[i].A];
    let planetB = starSystem.planets_dict[connections[i].B];
    const new_connection = new Connection(planetA, planetB, starSystem.app);
    planetA.addConnection(new_connection);
    planetB.addConnection(new_connection);
    starSystem.connections.push(new_connection);
  }
}

function createPlanets(starSystem, planets) {
  for (let i = 0; i < planets.length; i++) {
    let new_planet = new Planet(
      planets[i].name,
      planets[i].x,
      planets[i].y,
      planets[i].radius,
      0x556655,
      "alive",
      starSystem,
    );
    starSystem.planets_dict[new_planet.name] = new_planet;
  }
}

function addPlanetsAndConnectionsToStage(starSystem) {
  starSystem.connections.forEach((connection) =>
    starSystem.app.stage.addChild(connection.sprite),
  );
  Object.values(starSystem.planets_dict).forEach((planet) =>
    starSystem.app.stage.addChild(planet.sprite),
  );
}
