/**
 * The export module for an solitaire dealer. The only function
 * the solitaire dealer has available is the take cards from a pile
 * and move it onto another pile.
 * @param {Object} state   The solitaire state
 * @param {Object} action  The action to preform on the state
 */
module.exports = {
  movePile: function (state, action) {

    const cardPackage = removeCards(state, action);
    pushCards(state, action, cardPackage);
  }
};

/**
 * Removes the top card from the foundation pile and returns it.
 * @param {Object} state   The solitaire state
 * @param {Object} action  The action to preform on the state
 */
function removeCardFoundation(state, action) {

  const pile = state.f_pile[action.sequence.from.pile_number];

  return [pile.pop()];
}

/**
 * Removes a card from the stockpile pile and returns it.
 * @param {Object} state   The solitaire state
 * @param {Object} action  The action to preform on the state
 */
function removeCardStockpile(state, action) {

  const index = action.sequence.from.card_number;

  return state.s_pile.splice(index, 1);
}

/**
 * Removes the top card(s) from the tableau pile and returns it.
 * @param {Object} state   The solitaire state
 * @param {Object} action The action to preform on the state
 */
function removeCardsTableau(state, action) {

  const pile = state.t_pile[action.sequence.from.pile_number];
  const card_index = action.sequence.from.card_number;

  if (pile[card_index - 1] != undefined && pile[card_index - 1].hidden == true) {
    pile[card_index - 1].hidden = false;
  }


  return pile.splice(card_index);
}

/**
 * A function which calls the correct "removeCard" function,
 * based on the action.
 * @param {Object} state   The solitaire state
 * @param {Object} action  The action to preform on the state
 */
function removeCards(state, action) {

  switch (action.sequence.from.pile) {
    case ('f_pile'):
      return removeCardFoundation(state, action);

    case ('s_pile'):
      return removeCardStockpile(state, action);

    case ('t_pile'):
      return removeCardsTableau(state, action);
  }
}

/**
 * Pushes the {cardPackage} onto another pile based on the action.
 * @param {Object} state        The solitaire state
 * @param {Object} action       The action to preform on the state
 * @param {Array}  cardPackage  A package of cards to push
 */
function pushCards(state, action, cardPackage) {

  const pile_number = action.sequence.to.pile_number;
  let pile;

  switch (action.sequence.to.pile) {
    case ('f_pile'):
      pile = state.f_pile[pile_number];
      state.f_pile[pile_number] = pile.concat(cardPackage);
      break;

    case ('t_pile'):
      pile = state.t_pile[pile_number];
      console.log(pile);
      state.t_pile[pile_number] = pile.concat(cardPackage);
      break;
  }
}
