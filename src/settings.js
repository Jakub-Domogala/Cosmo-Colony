// settings.js contains all the settings for the game.

import STRATEGY_NAMES from "./player/strategy_names_enum";

// GAME TEMPO
const GAME_TEMPO = 1;

// COLORS
const COLOR_INDICATOR_SUCCESS = 0x00ff00;
const COLOR_INDICATOR_FAIL = 0xff0000;
const COLOR_INDICATOR_NEUTRAL = 0x999999;

const COLOR_PLANET_NEUTRAL = 0x999999;

const COLOR_CONNECTION = 0x090909;
const COLOR_CONNECTION_HIGHLIGHT = 0x666666;
const COLOR_CONNECTION_HIGHLIGHT_MY = 0xffffff;

const COLORS_PLAYERS = [0xe65100, 0xdfdf00, 0x00e626, 0xe002ca, 0x02cde0, 0xfecca2, 0x416637, 0x3e1d47, 0x8000ff, 0x0033ff];
// SYSTEM CREATION
const CONNECT_ALL_PLANETS = false;
const INPUT_SYSTEM_JSON = "gen_sys0004.json";

const PLAYERS_AMOUNT = 7;
const BOTS_ONLY = true;
// const BOTS_STRATEGIES_POOL = [STRATEGY_NAMES.ALLIN];
const BOTS_STRATEGIES_POOL = [STRATEGY_NAMES.PRIMITIVE, STRATEGY_NAMES.ALLIN, STRATEGY_NAMES.RANDOM, STRATEGY_NAMES.HUMAN];
// const BOTS_STRATEGIES_POOL = [STRATEGY_NAMES.RANDOM];

// GAME MECHANICS
const PLANET_RANDOM_BREEDING_INFLUENCE = 0.5;
const PLANET_OCCUPIED_BREEDRATE = 1.5;
const PLANET_NEUTRAL_BREEDRATE = 0.2;

const PLANET_INIT_POPULATION = 50;
const PLANET_NEUTRAL_INIT_POPULATION_MULTIPLIER = 0.3;

const PLANET_ATTACK_SPEED = 7;
const PLANET_ATTACK_SPEED_BY_RADIUS_INFLUENCE = 0.1;

const SHIP_INIT_SPEED = 140;
const SHIP_ACC = 100;

// GAME STATUS
const GAME_STATUS_WON = 1;
const GAME_STATUS_LOST = -1;
const GAME_STATUS_GOING = 0;
const GAME_STATUS_LAST_BOT_STANDING = 2;

// MESSAGES
const GAME_MSG_WON = "You won!";
const GAME_MSG_LOST = "You lost!";
const GAME_MSG_GOING = "Game is going on...";

export {
  GAME_TEMPO,
  COLOR_INDICATOR_SUCCESS,
  COLOR_INDICATOR_FAIL,
  COLOR_INDICATOR_NEUTRAL,
  COLOR_PLANET_NEUTRAL,
  COLOR_CONNECTION,
  COLOR_CONNECTION_HIGHLIGHT,
  COLOR_CONNECTION_HIGHLIGHT_MY,
  COLORS_PLAYERS,
  CONNECT_ALL_PLANETS,
  INPUT_SYSTEM_JSON,
  PLAYERS_AMOUNT,
  BOTS_ONLY,
  BOTS_STRATEGIES_POOL,
  PLANET_RANDOM_BREEDING_INFLUENCE,
  PLANET_OCCUPIED_BREEDRATE,
  PLANET_NEUTRAL_BREEDRATE,
  PLANET_INIT_POPULATION,
  PLANET_NEUTRAL_INIT_POPULATION_MULTIPLIER,
  PLANET_ATTACK_SPEED,
  PLANET_ATTACK_SPEED_BY_RADIUS_INFLUENCE,
  SHIP_INIT_SPEED,
  SHIP_ACC,
  GAME_STATUS_WON,
  GAME_STATUS_LOST,
  GAME_STATUS_GOING,
  GAME_STATUS_LAST_BOT_STANDING,
  GAME_MSG_WON,
  GAME_MSG_LOST,
  GAME_MSG_GOING,
};
