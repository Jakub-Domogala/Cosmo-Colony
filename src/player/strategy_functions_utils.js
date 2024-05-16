/**
 * @param {Player} player - player to attack
 * Performs primitive version of attack, rules:
 * 1. for each planet we look for weakest neighbor planet
 * 2. if neighbor is our planet we regroup randomly with more probability to equalize forces
 * 3. attack weakest neighbor planet if is weaker than current planet
 *
 * local algorithm, only take into account direct neighbors
 */
export function attackWeakestPlanetLocallyAndRegroupLocally(player) {
  for (let planet of player.planets) {
    if (planet.owner == player) {
      let weakestPlanet = null;
      let weakestPopulation = Infinity;
      for (let neighbor of planet.connected_planets) {
        if (neighbor.owner == player) {
          primitiveRegroupA2B(planet, neighbor, 10);
          continue;
        }
        if (neighbor.population < weakestPopulation) {
          weakestPopulation = neighbor.population;
          weakestPlanet = neighbor;
        }
      }
      if (weakestPlanet && weakestPlanet.population < planet.population - 3 && boolByProbability(0.5)) {
        planet.start_sending_ships(weakestPlanet);
      }
    }
  }
}

/**
 * @param {all_plans} all_plans - a set of instructions to send ships from one planet to another
 * of structure [[attacker_planet1, [target_planet1, target_planet2, ...]], ...]
 */
export function send_ships_by_plan(all_plans) {
  for (let [attacker, targets] of all_plans) {
    for (let target of targets) {
      if (attacker && target) attacker.start_sending_ships(target);
      else console.error(`attacker is ${attacker}, target is ${target}`);
    }
  }
}

/**
 * Stops all sending ships from player's planets in starSystem
 * returns -1 if player or starSystem or any planet is null
 */
export function stop_all_player_sendings(player, starSystem) {
  if (!player || !starSystem) {
    console.error(`player is ${player}, starSystem is ${starSystem}`);
    return -1;
  }
  for (let planet of starSystem.planets_list) {
    if (!planet) {
      console.error(`planet is ${planet}`);
      return -1;
    }
    if (planet.owner == player) planet.stop_all_sending_ships();
  }
}

/** Performs primitive local regrouping on all player's planets */
export function primitive_regroup_all(player, star_system) {
  if (!player || !star_system) {
    console.error(`player is ${player}, starSystem is ${star_system}`);
    return -1;
  }
  for (let planet of player.planets) {
    if (planet.owner == player) {
      planet.stop_all_sending_ships();
      let prob_mulitplier = 1;
      for (let neighbor of planet.connected_planets) {
        if (neighbor.owner == player) {
          primitiveRegroupA2B(planet, neighbor, prob_mulitplier);
        }
      }
    }
  }
}

/**
 * Decides whether to regroup from planetA to planetB with probability
 * based on their populations and prob_mulitplier
 * returns 1 if regrouping happened, 0 otherwise
 */
export function primitiveRegroupA2B(planetA, planetB, prob_mulitplier = 1) {
  if (
    planetA?.owner &&
    planetB?.owner &&
    planetA.owner === planetB.owner &&
    boolByProbability((planetA.population / (planetA.population + planetB.population)) * prob_mulitplier)
  ) {
    planetA.start_sending_ships(planetB);
    return 1;
  }
  return 0;
}

export function allIn_define_base_props_if_not_defined(player) {
  if (player.strat_props.target_chill_level === undefined) {
    player.strat_props.target_chill_level = randomInRange(3, 8);
    player.strat_props.current_chill_level = player.strat_props.target_chill_level;
  }
  if (player.strat_props.move_period) player.strat_props.move_period = randomInRange(0.2, 3);
  if (player.strat_props.hunter_level === undefined) player.strat_props.hunter_level = randomInRange(1, 5);
  if (player.strat_props.sinve_last_move === undefined) player.strat_props.sinve_last_move = 0;
}

export function random_define_base_props_if_not_defined(player) {
  if (player.strat_props.sinve_last_move === undefined) player.strat_props.sinve_last_move = 0;
}

export function allIn_is_move_time(player, delta, move_period = 1) {
  player.strat_props.sinve_last_move += delta;
  if (player.strat_props.sinve_last_move < move_period) return false;
  player.strat_props.sinve_last_move = 0;
  return true;
}

/**
 * @param {Player} player - owner
 * @param {Planet} planet - planet to get all owned planets next to
 * returns list of all owned planets next to planet
 */
export function get_all_owned_planets_next2planet(player, planet, star_system) {
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

export function get_all_owned_planets(player, starSystem) {
  const planets = starSystem.planets_list;
  const ownedPlanets = [];
  for (let planet of planets) {
    if (planet.owner == player) ownedPlanets.push(planet);
  }
  return ownedPlanets;
}

export function get_all_planets_next2planet(planet, starSystem) {
  const M = starSystem.connections_matrix;
  let planets = [];
  for (let i = 0; i < M.length; i++) {
    if (M[starSystem.get_planet_idx_by_obj(planet)][i] == true) {
      let other_planet = starSystem.planets_list[i];
      planets.push(other_planet);
    }
  }
  return planets;
}

/**
 * get true/false by probability
 */
export function boolByProbability(probability) {
  return Math.random() < probability;
}

/**
 * get random value in range [min, max]
 */
export function randomInRange(min, max) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(1));
}
