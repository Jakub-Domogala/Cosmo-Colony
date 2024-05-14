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

export function makeMoveAllIn(player, delta, star_system) {
  get_possible_allIns_with_power(player, star_system);
}

function get_possible_allIns_with_power(player, star_system) {
  const islands = get_my_islands(player, star_system);
  console.log("islands", islands);
  const islands_powers = get_islands_powers(islands);
  console.log("islands_powers", islands_powers);
  const possible_attacks = get_all_possible_attacks(player, star_system);
  console.log("possible_attacks", possible_attacks);
  const attacks_power = get_powers_of_attacks(
    player,
    possible_attacks,
    islands,
    islands_powers,
    star_system,
  );
  console.log("attacks_power", attacks_power);
  const attacks_distances = get_distances_to_closest_enemy(
    player,
    possible_attacks,
    star_system,
  );
  console.log("attacks_distances", attacks_distances);
  const attacks_ranking = get_attacks_ranking(attacks_power, attacks_distances);
  const best_attack = get_best_attack(possible_attacks, attacks_ranking);
  const islands_ids_involved = get_islands_ids_involved(
    player,
    best_attack,
    islands,
    star_system,
  );

  for (let i = 0; i < possible_attacks.length; i++) {
    const info = `power: ${attacks_power[i]}\ndistance: ${attacks_distances[i]}\nranking: ${attacks_ranking[i]}\nislands_ids_involved: ${get_islands_ids_involved(player, possible_attacks[i], islands, star_system).join(", ")}\nplanets_involved: ${get_islands_ids_involved(
      player,
      possible_attacks[i],
      islands,
      star_system,
    )
      .map((island_id) => islands[island_id].length)
      .reduce((a, b) => a + b)}`;
    possible_attacks[i].updateDebugLabel(info);
  }
}

function get_best_attack(possible_attacks, attacks_ranking) {
  return possible_attacks[
    attacks_ranking.indexOf(Math.max(...attacks_ranking))
  ];
}

function get_islands_ids_involved(player, planet, islands, star_system) {
  let my_planets = get_all_my_planets_next2planet(player, planet, star_system);
  let islands_ids = [
    ...new Set(
      my_planets.map((my_p) => get_island_idx_by_planet(islands, my_p)),
    ),
  ];
  return islands_ids;
  // return islands_ids.map((island_id) => islands[island_id]);
}

function get_attacks_ranking(attacks_power, attacks_distances) {
  const ranking = [];
  const value_of_attacking_enemy = 3;
  for (let i = 0; i < attacks_power.length; i++) {
    ranking.push(
      attacks_power[i] *
        (attacks_distances[i] == 0
          ? value_of_attacking_enemy
          : attacks_distances[i]),
    );
  }
  return ranking;
}

function get_islands_powers(islands) {
  const powers = [];
  let power = 0;
  for (let island of islands) {
    power = 0;
    for (let planet of island) {
      power += planet.population;
    }
    power -= island.length * 2;
    powers.push(power);
  }
  return powers;
}

function get_all_my_planets_next2planet(player, planet, star_system) {
  const M = star_system.connections_matrix;
  let planets = [];
  for (let i = 0; i < M.length; i++) {
    if (M[star_system.get_planet_idx_by_obj(planet)][i] == true) {
      let other_planet = star_system.planets_list[i];
      if (other_planet.owner == player) {
        planets.push(other_planet);
      }
    }
  }
  return planets;
}

function get_powers_of_attacks(
  player,
  attacks,
  islands,
  islands_powers,
  star_system,
) {
  let attacks_powers = [];
  for (let attack of attacks) {
    let power = 0;
    if (is_neighbour(player, attack, star_system)) {
      const islands_ids = get_islands_ids_involved(
        player,
        attack,
        islands,
        star_system,
      );
      for (let island_id of islands_ids) {
        power += islands_powers[island_id];
      }
    }
    attacks_powers.push(power);
  }
  return attacks_powers;
}

function get_island_idx_by_planet(islands, planet) {
  for (let i = 0; i < islands.length; i++) {
    if (islands[i].includes(planet)) {
      return i;
    }
  }
  return null;
}

function is_neighbour(player, planet, star_system) {
  const M = star_system.connections_matrix;
  let planetIdx = star_system.get_planet_idx_by_obj(planet);
  for (let i = 0; i < M[planetIdx].length; i++) {
    if (
      M[planetIdx][i] == true &&
      star_system.planets_list[i].owner == player
    ) {
      return true;
    }
  }
  return false;
}

function get_all_possible_attacks(player, star_system) {
  const M = star_system.connections_matrix;
  let neighbours = [];
  for (let i = 0; i < M.length; i++) {
    let planet = star_system.planets_list[i];
    if (planet.owner !== player && is_neighbour(player, planet, star_system)) {
      neighbours.push(planet);
    }
  }
  return neighbours;
}

function get_my_islands(player, star_system) {
  let visited = new Array(star_system.planets_list.length).fill(false);
  let islands = [];
  for (let i = 0; i < star_system.planets_list.length; i++) {
    if (!visited[i] && star_system.planets_list[i].owner == player) {
      islands.push(
        dfs_find_my_connected_planets(
          player,
          star_system.planets_list[i],
          visited,
          star_system,
        ),
      );
    }
  }
  return islands;
}

function get_distances_to_closest_enemy(player, planets, star_system) {
  return planets.map((planet) =>
    bfs_distance_to_closest_enemy(player, planet, star_system),
  );
}

function bfs_distance_to_closest_enemy(player, planet, star_system) {
  const M = star_system.connections_matrix;
  let planetIdx = star_system.get_planet_idx_by_obj(planet);
  let visited = new Array(M.length).fill(false);
  let queue = [];
  let distance = 0;
  queue.push(planetIdx);
  visited[planetIdx] = true;
  while (queue.length > 0) {
    let size = queue.length;
    for (let i = 0; i < size; i++) {
      let current = queue.shift();
      if (
        star_system.planets_list[current].owner != player &&
        star_system.planets_list[current].owner != null
      ) {
        return distance;
      }
      for (let j = 0; j < M[current].length; j++) {
        if (M[current][j] && !visited[j]) {
          visited[j] = true;
          queue.push(j);
        }
      }
    }
    distance++;
  }
}

function dfs_find_my_connected_planets(
  player,
  planet,
  visited,
  star_system,
  group = [],
) {
  const M = star_system.connections_matrix;
  let planetIdx = star_system.get_planet_idx_by_obj(planet);
  visited[planetIdx] = true;
  group.push(planet);
  let partial;
  for (let i = 0; i < M[planetIdx].length; i++) {
    if (
      i != planetIdx &&
      M[planetIdx][i] &&
      !visited[i] &&
      star_system.planets_list[i].owner == player
    ) {
      partial = dfs_find_my_connected_planets(
        player,
        star_system.planets_list[i],
        visited,
        star_system,
      );
      group = group.concat(partial);
    }
  }
  return group;
}

function boolByProbability(probability) {
  return Math.random() < probability;
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
