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

function dfs_find_my_connected_planets(player, planet, visited, star_system) {
  const M = star_system.connections_matrix;
  let planetIdx = star_system.get_planet_idx_by_obj(planet);
  visited[planet.id] = true;
  for (let i = 0; i < M[planetIdx].length; i++) {
    if (
      i != planetIdx &&
      M[planetIdx][i] &&
      !visited[i] &&
      star_system.planets[i].owner == player
    ) {
      dfs_find_my_connected_planets(
        player,
        star_system.planets[i],
        visited,
        star_system,
      );
    }
  }
}

function boolByProbability(probability) {
  return Math.random() < probability;
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
