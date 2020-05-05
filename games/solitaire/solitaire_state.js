const createDeck = require('../cards');

/**
 * Moves cards from the {deck} to an array of tableau piles
 * which the function returns. These piles are based on the structure
 * of a game of solitaire.
 * @param {object} deck   The deck to alter
 */
function createTableaus(deck) {

  let tableaus = [];

  for (let i = 0; i < deck.length; i++) {
    deck[i].hidden = false;
  }


  for (let i = 0; i < 7; i++) {
    tableaus[i] = tableau(deck, i + 1);
  }

  return tableaus;
}

/**
 * Helper function of createTableaus.
 * Creates a single tableau pile with the number of
 * cards in the pile being determined by {number_of_cards}.
 * @param {object}  deck              The deck to alter
 * @param {Integer} number_of_cards   The number of cards in the pile
 */
function tableau(deck, number_of_cards) {

  let tableau = [];

  for (let i = 0; i < number_of_cards; i++) {

    if (i != 0) deck[0].hidden = true;

    tableau.push(deck[0]);
    deck.splice(0, 1);
  }

  return tableau;
}

/**
 * Creates an initial random solitaire state, and returns it through
 * an callback function.
 * @param {Function} callback A callback
 */
function init(callback) {

  const s_pile = createDeck(1);

  for (let card of s_pile) {
    card.hidden = false;
  }

  const t_pile = createTableaus(s_pile);
  const f_pile = [
    [],
    [],
    [],
    []
  ];
  const state = {
    s_pile,
    t_pile,
    f_pile
  };

  callback(state);
}

// ==== The export module ====
module.exports = init;
