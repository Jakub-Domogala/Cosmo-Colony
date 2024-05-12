// strategy_functions_enum.js
import STRATEGY_NAMES from "./strategy_names_enum.js";
import {
  makeMoveHuman,
  makeMovePrimitive,
  makeMoveAllIn,
} from "./strategy_functions_impl.js";
const STRATEGY_FUNCTIONS = {
  [STRATEGY_NAMES.HUMAN]: makeMoveHuman,
  [STRATEGY_NAMES.PRIMITIVE]: makeMovePrimitive,
  [STRATEGY_NAMES.ALLIN]: makeMoveAllIn,
};

export default STRATEGY_FUNCTIONS;
