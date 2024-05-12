// strategy_functions_impl.js

export function makeMoveHuman(player, delta) {
  return;
}

export function makeMovePrimitive(player, delta) {
  player.timeSinceLastMove += delta;
  if (boolByProbability(player.timeSinceLastMove * 2) || true) {
    player.timeSinceLastMove = 0;
    primitiveAttackWeakestPlanet(player);
  }
  function primitiveAttackWeakestPlanet(player) {
    for (let planet of player.planets) {
      if (planet.owner == player) {
        let weakestPlanet = null;
        let weakestPopulation = Infinity;
        for (let neighbor of planet.connected_planets) {
          if (neighbor.owner == player) {
            primitiveRegroup(planet, neighbor);
            continue;
          }
          if (neighbor.population < weakestPopulation) {
            weakestPopulation = neighbor.population;
            weakestPlanet = neighbor;
          }
        }
        if (
          weakestPlanet &&
          weakestPlanet.population < planet.population - 3 &&
          boolByProbability(0.5)
        ) {
          planet.start_sending_ships(weakestPlanet);
        }
      }
    }
    function primitiveRegroup(planetA, planetB) {
      if (
        boolByProbability(
          (planetA.population / (planetA.population + planetB.population)) *
            0.1,
        )
      ) {
        planetA.start_sending_ships(planetB);
      }
    }
  }
}

export function makeMoveAllIn(player, delta) {}

function boolByProbability(probability) {
  return Math.random() < probability;
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
