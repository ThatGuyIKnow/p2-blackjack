const stateInit = require("./solitaire_state");
const gameMaster = require('./solitaire_gamemaster');

/*
 * The export module for game of solitaire. Can be viewed as an interface for
 * the solitaire game.
 */
module.exports = {

  init: stateInit,
  action: gameMaster.act,
  filterState: gameMaster.filterState,
};
