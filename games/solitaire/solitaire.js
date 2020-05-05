const stateInit = require("./solitaire_state");
const gameMaster = require('./solitaire_gamemaster');

/*
 * The export module for an solitaire game. Can be viewed as an interface for
 * the solitaire game.
 */
module.exports = {

  init: stateInit,
  action: gameMaster.act,
  filterState: gameMaster.filterState,
};
