import Planet from "./planet";
import Connection from "./connection";

export default class StarSystem {
  constructor(data, app, circleTexture) {
    this._data = data;
    this._app = app;
    this._planets_dict = {};
    this._circleTexture = circleTexture;
    this.connections = [];
    this.createMap();
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
      );
      this._planets_dict[new_planet.name] = new_planet;
    }
  }

  drawPlanets() {
    for (let planet in this._planets_dict) {
      this.app.stage.addChild(this._planets_dict[planet].sprite);
    }
  }
}
