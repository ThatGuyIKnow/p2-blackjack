class VerificationError extends Error {}

const dealer = require('./solitaire_dealer.js');

/*
 * - Export module
 * - Ruleset
 * - Action functions
 * - Verify function
 * - Helper Verify functions
 * - General helper functions
 */

// ========== Export Module ==========

/**
 * Export module (GameMaster).
 * Has two main functions, filterState and act.
 * filterState creates a state which filters
 * the state for cards which have hidden set to True.
 *
 * act takes an action and trigger a corresponding
 * action function, which verifies and acts on the state.
 */
module.exports = {

  /**
   * Returns a copy of a solitaire state where all hidden cards values have
   * been set to 0/""
   * @param {object} state The solitaire state to filter
   */
  filterState: function (state) {

    let filteredState = deepCopy(state);

    let tableau = filteredState.tableau;

    for (let pile of tableau) {

      for (let card of pile) {

        if (card.hidden) {
          card.isJoker = false;
          card.rank = 0;
          card.suit = "";
          card.id = 0;
        }
      }
    }

    return filteredState;
  },

  /**
   * Searches the ruleset const, for the key passed in action. If found,
   * calls the corresponding function with (state, action, callback) args.
   * @param {object}   state     The solitaire state
   * @param {object}   action    The action to preform on the state
   * @param {function} callback  A callback fn in the form om (state, err) =>
   */
  act: function (state, action, callback) {

    console.log(action);

    if (Object.keys(ruleset).includes(action.action)) {
      const newState = deepCopy(state);
      ruleset[action.action](newState, action, callback);
    } else {
      let err = new VerificationError('Action not found');
      callback(state, err);
    }
  }
};

// ========== RULESET ==========

/**
 * The ruleset for the GameMaster.
 * ruleset is a preset map, which uses key/function pairs
 * to interpret the action passed to the GameMaster
 */
const ruleset = {

  'MovePile': movePile,
};

// ========== ACTION FUNCTION(S) ==========

/**
 * Verifies whenever an action is valid on a certain state, and if yes,
 * it copies the state and calls a function from the dealer to alter
 * the copied state. This state is then passed in the callback function.
 * If the verification fails, the original passed state, and an error
 * is passed in the callback instead.
 * @param {object}   state     The solitaire state
 * @param {object}   action    The action to preform on the state
 * @param {function} callback  A callback
 */
function movePile(state, action, callback) {

  let error;

  verifyMovePile(state, action, (err) => {

    if (err) {
      console.log(err);
      error = err;
      callback(state, err);
    }
  });

  if (error) return;
  
  const newState = deepCopy(state);

  dealer.movePile(newState, action);

  if (verifyEndState(newState)) {
    callback({});
  } else {
    callback(newState);
  }
}

// ========== VERIFY FUNCTION(S) ==========

/**
 * Verifies if the movePile action is valid on a given state.
 * Separates the validation based on what pile the card(s) are being moved from
 * (verifyFromFoundation, verifyFromStockpile, verifyFromTableau) and
 * where they are being moved to (verifyToFoundation, verifyToTableau).
 * Calls callback if an error is found.
 * @param {object}   state     The solitaire state
 * @param {object}   action    The action to preform on the state
 * @param {function} callback  A callback fn in the form om (state, err) =>
 */
function verifyMovePile(state, action, callback) {

  const from = action.sequence.from;
  const to = action.sequence.to;
  let from_cards;

  switch (from.pile) {
    case ('foundation'):
      from_cards = verifyFromFoundation(state, from, to, callback);
      break;

    case ('tableau'):
      from_cards = verifyFromTableau(state, from, to, callback);
      break;

    case ('stockpile'):
      from_cards = verifyFromStockpile(state, from, to, callback);
      break;

    default:
      from_cards = new VerificationError("(from) Pile does not exist");
      callback(from_cards);
      return;
  }


  let allowedMove = false;

  switch (to.pile) {
    case ('foundation'):
      if (from_cards[1] == undefined) {
        allowedMove = verifyToFoundation(state, from_cards[0], to);
      }
      break;

    case ('tableau'):
      allowedMove = verifyToTableau(state, from_cards[0], to);
      break;

    default:
      callback(new VerificationError("(to) Pile does not exist"));
      return;
  }

  if (allowedMove == false) callback(new VerificationError("Illegal move"));
  else callback();
}

/**
 * Verifies if a game of solitaire has reached its end-state, i.e.
 * if the foundation piles are full.
 * @param {object} state  The solitaire state
 */
function verifyEndState(state) {

  const foundations = state.foundation;

  for (let pile of foundations) {

    if (pile.length != 13) return false;
  }
  return true;
}

// ========== VERIFY HELPER FUNCTION(S) ==========

/**
 * Verifies if the given cards can be picked up from the foundation pile.
 * If yes, returns an array of one card else returns
 * an error.
 * Returns either an array of cards or an VerificationError
 * @param {object} state  The solitaire state
 * @param {object} from   The action.sequence.from
 */
function verifyFromFoundation(state, from) {

  if (state.foundation[from.pile_number] == undefined) {
    return new VerificationError("Illegal move");
  }

  let from_pile = state.foundation[from.pile_number];
  let from_card = from_pile[from_pile.length - 1];
  return [from_card];
}

/**
 * Verifies if the given cards can be picked up from the stockpile pile.
 * If yes, returns an array of one card else returns
 * an error.
 * Returns either an array of cards or an VerificationError
 * @param {object} state  The solitaire state
 * @param {object} from   The action.sequence.from
 */
function verifyFromStockpile(state, from) {

  console.log(state.stockpile[from.card_number-1]);
  if (!state.stockpile[from.card_number]) {
    return new VerificationError("Illegal move");
  }

  let from_card = state.stockpile[from.card_number];

  return [from_card];
}

/**
 * Verifies if the given cards can be picked up from the tableau pile.
 * If yes, returns an array of the corresponding cards else returns
 * an error. Returns either an array of cards or an VerificationError
 * @param {object} state  The solitaire state
 * @param {object} from   The action.sequence.from
 */
function verifyFromTableau(state, from) {

  if (!state.tableau[from.pile_number][from.card_number]) {
    return new VerificationError("Illegal move");
  }

  let from_card1 = state.tableau[from.pile_number][from.card_number];
  let from_card2 = state.tableau[from.pile_number][from.card_number + 1];

  if (canMoveTableau(from_card1, from_card2) == false) {
    return new VerificationError("Illegal move");
  }

  return [from_card1, from_card2];
}

/**
 * Verifies if a card is valid to be placed on a tableau pile, where that pile
 * is defined from the {to} parameter. Returns a boolean value
 * @param {object} state     The solitaire state
 * @param {array}  from_card An array of up to card(s)
 * @param {object} to        The to sub-object of the action
 */
function verifyToTableau(state, from_card, to) {

  if (state.tableau[to.pile_number] == undefined) return false;

  let to_pile = state.tableau[to.pile_number];
  let to_card = to_pile[to_pile.length - 1];

  return isCorrectPlacementTableau(from_card, to_card);

}

/**
 * Verifies if a card is valid to be placed on a foundation pile, where that
 * pile is defined from the {to} parameter. Returns a boolean value
 * @param {object} state     The solitaire state
 * @param {array}  from_card An array of up to card(s)
 * @param {object} to        The to sub-object of the action
 */
function verifyToFoundation(state, from_card, to) {

  if (state.foundation[to.pile_number] == undefined) return false;

  let to_pile = state.foundation[to.pile_number];
  let to_card = to_pile[to_pile.length - 1];

  return isCorrectPlacementFoundation(from_card, to_card, to.pile_number);
}

/**
 * Checks if the tableau card package can be moved, based on the card to move
 * and the card below it. Here card1 is the card to move.
 * Here a the order of cards are so that card1 is above card2 on the solitaire
 * table e.g. card1 = 10 of Spades, card2 = 9 of Hearts would be valid.
 * Returns True if the configuration is valid and False otherwise.
 * @param{card Object} card1 The first card object
 * @param{card Object} card2 The second card object
 */
function canMoveTableau(card1, card2) {

  if (card1 == undefined || card1.hidden == true) return false;

  if (card2 == undefined) return true;

  if (card1.rank - 1 != card2.rank) return false;

  let card1_red = ["hearts", "diamonds"].includes(card1.suit);
  let card2_red = ["hearts", "diamonds"].includes(card2.suit);

  return card1_red != card2_red;
}


/**
 * Checks if a given card is valid to place onto another card
 * in the tableau pile. Here card1 is the card which is being
 * moved, and card2 is the card which it is being moved onto.
 * Returns True if the configuration is valid and False otherwise.
 * @param{card Object} card1 The first card object
 * @param{card Object} card2 The second card object
 */
function isCorrectPlacementTableau(card1, card2) {

  if (card1 == undefined || card1.hidden == true) return false;

  if (card2 == undefined) return card1.rank == 13;

  if (card2.hidden) return false;

  if (card1.rank + 1 != card2.rank) return false;

  let card1_red = ["hearts", "diamonds"].includes(card1.suit);
  let card2_red = ["hearts", "diamonds"].includes(card2.suit);

  return card1_red != card2_red;
}

/**
 * Checks if a given card is valid to place onto another card
 * in the foundation pile. Here card1 is the card which is being
 * moved, and card2 is the card which it is being moved onto.
 * If card2 is undefined (which means the corresponding pile is empty)
 * the pile_number is instead referred to check if the placement is correct.
 * Returns True if the configuration is valid and False otherwise.
 * @param{Object}    card1         The first card object
 * @param{Object}    card2         The second card object
 * @param{Integer}   pile_number   The pile to move onto
 */
function isCorrectPlacementFoundation(card1, card2, pile_number) {

  if (card1 == undefined) return false;

  if (card2 == undefined) {

    if (card1.rank != 1) return false;

    switch (pile_number) {
      case (0):
        return card1.suit == "spades";

      case (1):
        return card1.suit == "hearts";

      case (2):
        return card1.suit == "clubs";

      case (3):
        return card1.suit == "diamonds";

      default:
        return false;
    }
  }

  if (card1.rank - 1 != card2.rank) return false;

  if (card1.hidden || card2.hidden) return false;

  return card1.suit == card2.suit;
}

/**
 * Helper Function. Copies an object by converting it to and from a JSON string.
 * @param {Object} Object The object to copy
 */
function deepCopy(object) {

  return JSON.parse(JSON.stringify(object));
}
