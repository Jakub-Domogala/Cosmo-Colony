// player.js

export default class Player {
  constructor(name, color, app, isBot) {
    this.name = name;
    this.color = color;
    this.planets = [];
    this._app = app;
    this.isBot = isBot;
    this.timeSinceLastMove = 0;
  }

  makeMove(delta) {
    if (!this.isBot) return;
    this.timeSinceLastMove += delta;
    if (this.isMoving(this.timeSinceLastMove)) {
      this.timeSinceLastMove = 0;
      this.attackWeakestPlanet();
    }
  }

  attackWeakestPlanet() {
    for (let planet of this.planets) {
      if (planet.owner == this) {
        let weakestPlanet = null;
        let weakestPopulation = Infinity;
        for (let neighbor of planet.connected_planets) {
          if (neighbor.owner == this) {
            this.regroup(planet, neighbor);
            continue;
          }
          if (neighbor.population < weakestPopulation) {
            weakestPopulation = neighbor.population;
            weakestPlanet = neighbor;
          }
        }
        if (
          weakestPlanet &&
          weakestPlanet.population < planet.population - 5 &&
          this.isMoving(0.8)
        ) {
          planet.start_sending_ships(weakestPlanet);
        }
      }
    }
  }

  regroup(planetA, planetB) {
    if (
      this.isMoving(
        (planetA.population / (planetA.population + planetB.population)) * 0.1,
      )
    ) {
      planetA.start_sending_ships(planetB);
    }
  }

  isMoving(probability) {
    return Math.random() < probability;
  }
}
