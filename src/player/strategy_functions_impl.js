// strategy_functions_impl.js

import {
  attackWeakestPlanetLocallyAndRegroupLocally,
  boolByProbability,
  randomInRange,
  primitive_regroup_all,
  stop_all_player_sendings,
  send_ships_by_plan,
  get_all_owned_planets_next2planet,
  allIn_define_base_props_if_not_defined,
  allIn_is_move_time,
  get_all_owned_planets,
  get_all_planets_next2planet,
} from "./strategy_functions_utils.js";
import { get_random_elem_from_list_or_dict } from "./../init_utils.js";
export function makeMoveHuman(player, delta) {
  return;
}

export function makeMovePrimitive(player, delta) {
  player.timeSinceLastMove += delta;
  if (boolByProbability(player.timeSinceLastMove * 2) || true) {
    player.timeSinceLastMove = 0;
    attackWeakestPlanetLocallyAndRegroupLocally(player);
  }
}

export function makeMoveAllIn(player, delta, star_system) {
  allIn_define_base_props_if_not_defined(player);
  if (!allIn_is_move_time(player, delta, player.strat_props.move_period)) return;
  stop_all_player_sendings(player, star_system);
  const choice = get_chosen_allIn_with_involved_islands(player, star_system);
  if (choice) {
    const [best_attack, islands] = choice;
    const all_plans = [];
    for (let island of islands) {
      const plan = get_attack_plan_for_island(island, best_attack, star_system);
      for (let move of plan) {
        all_plans.push(move);
      }
    }
    send_ships_by_plan(all_plans);
    player.strat_props.current_chill_level = Math.min(player.strat_props.current_chill_level * 1.09, player.strat_props.target_chill_level);
    player.strat_props.current_chill_level = parseFloat(player.strat_props.current_chill_level.toFixed(2));
  } else {
    primitive_regroup_all(player, star_system);
    player.strat_props.current_chill_level *= 0.97;
    player.strat_props.current_chill_level = parseFloat(player.strat_props.current_chill_level.toFixed(2));
  }
}

export function makeMoveRandom(player, delta, starSystem) {
  const planets = player.planets;
  if (!allIn_is_move_time(player, delta, 0.5)) return;
  const my_planets = get_all_owned_planets(player, starSystem);
  if (my_planets.length < 1) return;
  const id = Math.floor(randomInRange(0.001, my_planets.length - 0.1));
  // console.log(id);
  const planet = get_random_from_list(my_planets);
  // console.log("Random move from planet", planet, my_planets);
  const neighbors = get_all_planets_next2planet(planet, starSystem);
  if (neighbors.length < 1) return;
  const target = get_random_from_list(neighbors);
  planet.stop_all_sending_ships();
  planet.start_sending_ships(target);
}

function get_random_from_list(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function get_chosen_allIn_with_involved_islands(player, star_system) {
  const islands = get_my_islands(player, star_system);
  if (islands.length < 1) return null;
  // update_debug_label_for_my_planets(star_system.planets_list, star_system);
  const islands_powers = get_islands_powers(islands);
  const possible_attacks = get_all_possible_attacks(player, star_system);
  if (possible_attacks.length < 1) return null;
  const attacks_power = get_powers_of_attacks(player, possible_attacks, islands, islands_powers, star_system);
  const defenses_power = get_powers_of_defenses(possible_attacks, star_system);
  const attacks_distances = get_distances_to_closest_enemy(player, possible_attacks, star_system);
  const attacks_ranking = get_attacks_rankings(player, possible_attacks, attacks_power, defenses_power, attacks_distances);
  const [best_attack, best_ranking] = get_best_attack_and_ranking(possible_attacks, attacks_ranking);
  const islands_ids_involved = get_islands_ids_involved(player, best_attack, islands, star_system);
  // update_debug_label_for_possible_attacks(
  //   possible_attacks,
  //   attacks_power,
  //   defenses_power,
  //   attacks_distances,
  //   attacks_ranking,
  //   player,
  //   islands,
  //   star_system,
  // );
  return is_good_to_attack(best_ranking, player.strat_props.current_chill_level)
    ? [best_attack, islands_ids_involved.map((island_id) => islands[island_id])]
    : null;
}

function is_good_to_attack(ranking, target_chill_level = 5) {
  return ranking > target_chill_level;
}

function get_attack_plan_for_island(island, target, star_system) {
  const previous = dijksta_attack_plan_from_planet_to_planets_from_island(target, island, star_system);
  const attack_plan = []; // element [attacker, [target1, target2, ...]]
  for (let i = 0; i < previous.length; i++) {
    if (previous[i] !== null) {
      attack_plan.push([star_system.planets_list[i], [star_system.planets_list[previous[i]]]]);
    }
  }
  return attack_plan;
}

export function move_all_here(player, planet, star_system) {
  const visited = Array(star_system.planets_list.length).fill(false);
  const island = dfs_find_my_connected_planets(player, planet, visited, star_system);
  if (island.length < 2) return;
  const plan = get_attack_plan_for_island(island, planet, star_system);
  send_ships_by_plan(plan);
}

function dijksta_attack_plan_from_planet_to_planets_from_island(target_planet, island, star_system) {
  const M = star_system.connections_matrix;
  const island_ids = island.map((planet) => star_system.get_planet_idx_by_obj(planet));
  const visited = Array(star_system.planets_list.length).fill(false);
  const distances = Array(star_system.planets_list.length).fill(Infinity);
  const previous = Array(star_system.planets_list.length).fill(null);
  const queue = [star_system.get_planet_idx_by_obj(target_planet)];
  distances[star_system.get_planet_idx_by_obj(target_planet)] = 0;
  while (queue.length) {
    const current = queue.shift();
    visited[current] = true;
    for (let i in island_ids) {
      const idx = island_ids[i];
      if (M[current][idx] && !visited[idx] && distances[idx] > distances[current] + 1) {
        distances[idx] = distances[current] + 1;
        previous[idx] = current;
        queue.push(idx);
      }
    }
  }
  return previous;
}

function update_debug_label_for_my_planets(planets, star_system) {
  for (let planet of planets) {
    planet.updateDebugLabel(
      `${star_system.get_planet_idx_by_obj(planet)}, ${planet?.owner?.botStrategy}, ${planet?.owner?.strat_props.current_chill_level}, ${planet?.owner?.strat_props.hunter_level}`,
    );
  }
}

function update_debug_label_for_possible_attacks(
  possible_attacks,
  attacks_power,
  defenses_power,
  attacks_distances,
  attacks_ranking,
  player,
  islands,
  star_system,
) {
  for (let i = 0; i < possible_attacks.length; i++) {
    const info = `a_power: ${attacks_power[i]}\nd_power${defenses_power[i]}\ndistance: ${attacks_distances[i]}\nranking: ${attacks_ranking[i]}\nislands_ids_involved: ${get_islands_ids_involved(player, possible_attacks[i], islands, star_system).join(", ")}\nplanets_involved: ${get_islands_ids_involved(
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

function get_best_attack_and_ranking(possible_attacks, attacks_ranking) {
  let best_attack = null;
  let best_ranking = -Infinity;
  attacks_ranking.forEach((ranking, i) => {
    if (
      (!isNaN(ranking) && ranking > best_ranking) ||
      (ranking == best_ranking && possible_attacks[i].population < best_attack.population)
    ) {
      best_ranking = ranking;
      best_attack = possible_attacks[i];
    }
  });
  return [best_attack, best_ranking];
}

function get_islands_ids_involved(player, planet, islands, star_system) {
  if (planet == null) return [];
  let my_planets = get_all_owned_planets_next2planet(player, planet, star_system);
  let islands_ids = [...new Set(my_planets.map((my_p) => get_island_idx_by_planet(islands, my_p)))];
  return islands_ids;
}

function get_attacks_rankings(player, attacks, attacks_power, defense_power, attacks_distances) {
  const rankings = [];
  const value_of_attacking_enemy = player.strat_props.hunter_level;
  for (let i = 0; i < attacks_power.length; i++) {
    let ranking =
      (attacks_power[i] / (defense_power[i] + 1)) * (attacks_distances[i] == 0 ? value_of_attacking_enemy : attacks_distances[i]);
    ranking = parseFloat(ranking.toFixed(2));
    rankings.push(ranking);
  }
  return rankings;
}

function get_islands_powers(islands) {
  return islands.map((island) => island.reduce((acc, planet) => acc + planet.population, 0) - 2 * island.length);
}

function get_powers_of_defenses(planets_to_attack, star_system) {
  const powers_of_def = [];
  for (let i = 0; i < planets_to_attack.length; i++) {
    const curr_planet = planets_to_attack[i];
    if (curr_planet.owner === null) {
      powers_of_def.push(curr_planet.population);
    } else {
      const visited = Array(star_system.planets_list.length).fill(false);
      const def_island = dfs_find_my_connected_planets(curr_planet.owner, curr_planet, visited, star_system);
      const power = def_island.reduce((a, b) => a + b.population, 0) - (def_island.length - 1) * 2;
      powers_of_def.push(power);
    }
  }
  return powers_of_def;
}

function get_powers_of_attacks(player, attacks, islands, islands_powers, star_system) {
  let attacks_powers = [];
  for (let attack of attacks) {
    let power = 0;
    if (is_neighbour(player, attack, star_system)) {
      const islands_ids = get_islands_ids_involved(player, attack, islands, star_system);
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
    if (M[planetIdx][i] == true && star_system.planets_list[i].owner == player) {
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
      islands.push(dfs_find_my_connected_planets(player, star_system.planets_list[i], visited, star_system));
    }
  }
  return islands;
}

function get_distances_to_closest_enemy(player, planets, star_system) {
  return planets.map((planet) => bfs_distance_to_closest_enemy(player, planet, star_system));
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
      if (star_system.planets_list[current].owner != player && star_system.planets_list[current].owner != null) {
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

function dfs_find_my_connected_planets(player, planet, visited, star_system, group = []) {
  const M = star_system.connections_matrix;
  let planetIdx = star_system.get_planet_idx_by_obj(planet);
  visited[planetIdx] = true;
  group.push(planet);
  let partial;
  for (let i = 0; i < M[planetIdx].length; i++) {
    if (i != planetIdx && M[planetIdx][i] && !visited[i] && star_system.planets_list[i].owner == player) {
      partial = dfs_find_my_connected_planets(player, star_system.planets_list[i], visited, star_system);
      group = group.concat(partial);
    }
  }
  return group;
}
