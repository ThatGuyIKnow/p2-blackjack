
class VerificationError extends Error{}

const dealer = require('./solitaire_dealer.js');

/*
 * - Export module
 * - Ruleset
 * - Action functions
 * - Verify function
 * - Helper Verify functions
 * - General helper functions
 * 
 */

/*
 * ========== Export Module ==========
 */
 /*
  *
  * Export module (GameMaster).
  * Has two main functions, which is filterState and act.
  * filterState's function is to create a state which filters
  * the state for cards which have hidden set to True.
  * 
  * act's function is to take an action and trigger a corresponding 
  * action function, which verifies and acts on the state.
  */
 module.exports = {

  /*
   * Returns a copy of a solitaire state where all hidden cards values have
   * been set to 0/""
   * 
   * @param {object} state The solitaire state to filter
   */  

  filterState : function (state) {
    let filteredState = deepCopy(state);
  
    let t_pile = filteredState.t_pile;
    for(let pile of t_pile) {
      for(let card of pile) {
        if(card.hidden) {
          card.isJoker = false;
          card.rank = 0;
          card.suit = "";
          card.id = 0;
        }
      }
    }
    
    return filteredState;
  },

  /*
   * Searches the ruleset const, for the key passed in action. If found, 
   * calls the corresponding function with (state, action, callback) args.
   * 
   * @param {object} state     The solitaire state
   * @param {object} action    The action to preform on the state
   * @param {object} callback  A callback fn in the form om (state, err) =>
   */  
  act : function (state, action, callback) {
    console.log(action);
    
    if(Object.keys(ruleset).includes(action.action)) {
      const newState = deepCopy(state);
      ruleset[action.action](newState, action, callback);
    }
    else {
      let err = new VerificationError('Action not found');
      callback(state, err);
    }
  },
}

/*
 * ========== RULESET ==========
 */

/*
 * The ruleset for the GameMaster. 
 * ruleset is a preset map, which uses key/function pairs
 * to interpret the action passed to the GameMaster
 */

const ruleset = {
  'MovePile' : movePile,
}


/*
 * ========== ACTION FUNCTION(S) ==========
 */

 /*
  * The action function(s) are functions which verifies the
  * validity of an action, and then passes the information to the dealer
  * if it is valid.
  * The only action in solitaire is the MovePile action, which
  * moves one or more card(s) from one pile to another.
  * The action function firstly verifies whenever an action
  * is valid on a certain state, and if yes, it copies the state
  * and calls a function from the dealer to alter the copied state.
  * This state is then passed in the callback function.
  * If the verification fails, the original passed state, and an error
  * is passed in the callback instead
  * 
  * @param {object} state     The solitaire state
  * @param {object} action    The action to preform on the state
  * @param {object} callback  A callback fn in the form om (state, err) =>
  */

function movePile (state, action, callback)
{ 
  let error;

  verifyMovePile(state, action, (err) => {
    if (err) {
      console.log(err)
      error = err;
      callback(state, err);
    }
  });
  if (error)
    return;

  const newState = deepCopy(state);
  dealer.movePile(newState, action);
  callback(newState);
  
}


function deepCopy(object) 
{
  return JSON.parse(JSON.stringify(object));
}

/*
 * ========== VERIFY FUNCTION(S) ==========
 */

/*
 * Verify function are responsible for verifying if a specific function 
 * is valid to preform on a given state.
 */

 /*
  * verifyMovePile verifies if the movePile action is valid on a given state.
  * verifyMovePile separates the validation based on what pile the card(s) are
  * being moved from (verifyFromFoundation, verifyFromStockpile, 
  * verifyFromTableau).
  * Calls callback if error is found. The function does not return anything.
  * 
  * @param {object} state     The solitaire state
  * @param {object} action    The action to preform on the state
  * @param {object} callback  A callback fn in the form om (state, err) =>
  */
function verifyMovePile (state, action, callback) 
{
  const from = action.sequence.from;
  const to   = action.sequence.to;

  if (from.pile == 'f_pile') 
  {
    verifyFromFoundation(state, from, to, callback);
  }
  else if (from.pile == 's_pile')
  {
    verifyFromStockpile(state, from, to, callback);
  }
  else if (from.pile == 't_pile')
  {
    verifyFromTableau(state, from, to, callback);
  }
  else
  {
    callback(state, new VerificationError("Action does not exist."))
  }
}

/*
 * ========== VERIFY HELPER FUNCTION(S) ==========
 */

 /*
  * Helper functions for verifying state and actions
  */ 

/*
 * Verifies a move from the Foundation pile to another pile.
 * Takes the state, the from and to component of an action and the callback(err)
 */
function verifyFromFoundation(state, from, to, callback)
{
    if(state.f_pile[from.pile_number] == undefined ||
       state.t_pile[to.pile_number]   == undefined)
    {
      callback(new VerificationError("Illegal move"));
      return;
    }

    if(to.pile == 't_pile')
    {
      let from_pile = state.f_pile[from.pile_number];
      let from_card = from_pile[from_pile.length - 1];
      
      let to_pile = state.t_pile[to.pile_number];
      let to_card = to_pile[to_pile.length - 1];
      if(!isCorrectPlacementTableau(from_card, to_card))
      {
        callback(new VerificationError("Illegal move"));
      }
    }
    else
      callback(new VerificationError("Illegal move"));
  }

  
/*
 * Verifies a move from the Stockpile pile to another pile.
 * Takes the state, the from and to component of an action and the callback(err)
 */
function verifyFromStockpile(state, from, to, callback) 
{
  if (!state.s_pile[from.card_number])
  {
    callback(new VerificationError("Illegal move"));
    return;
  }

  let from_card = state.s_pile[from.card_number];
  let to_card;

  if (to.pile == 't_pile' && state.t_pile[to.pile_number] != undefined)
  {
    let to_pile = state.t_pile[to.pile_number];
    to_card = to_pile[to_pile.length - 1];
    
    if(isCorrectPlacementTableau(from_card, to_card))
      return;
    else
      callback(new VerificationError("Illegal move"));
  }
  
  else if (to.pile == 'f_pile' && state.f_pile[to.pile_number])
  {
    let to_pile = state.f_pile[to.pile_number];
    to_card = to_pile[to_pile.length - 1];
    
    if(!isCorrectPlacementFoundation(from_card, to_card, to.pile_number))
      callback(new VerificationError("Illegal move"));
  }

  else {
    callback(new VerificationError("Illegal move"));
  }
}

/*
 * Verifies a move from the Foundation pile to another pile.
 * Takes the state, the from and to component of an action and the callback(err)
 */
function verifyFromTableau(state, from, to, callback)
{
  if(!state.t_pile[from.pile_number][from.card_number]
     || state.t_pile[from.pile_number][from.card_number].hidden)
  {
    callback(new VerificationError("Illegal move"));
    return;
  }

  let from_card1 = state.t_pile[from.pile_number][from.card_number];
  let from_card2 = state.t_pile[from.pile_number][from.card_number + 1];
  let to_card;

  if(!canMoveTableau(from_card1, from_card2))
  {
    callback(new VerificationError("Illegal move here"));
    return;
  }

  if(to.pile == 't_pile' && state.t_pile[to.pile_number] != undefined)
  {
    let to_pile = state.t_pile[to.pile_number];
    to_card = to_pile[to_pile.length - 1];
    if(!isCorrectPlacementTableau(from_card1, to_card))
    {
      callback(new VerificationError("Illegal move"));
    }
  }
  else if (to.pile == 'f_pile' && state.f_pile[to.pile_number] != undefined) 
  {
    if(from_card2 != undefined) 
    {
      callback(new VerificationError("Illegal move"));
      return;
    }
    
    let to_pile = state.f_pile[to.pile_number];
    to_card = to_pile[to_pile.length - 1];
    if(!isCorrectPlacementFoundation(from_card1, to_card, to.pile_number))
    {
      callback(new VerificationError("Illegal move"));
    }
  }
  else {
    callback(new VerificationError("Illegal move"));
  }
}

/*
 * Check if the tableau card package can be moved, based on the card to move
 * and the card below it. Here card1 is the card to move.
 * Here a the order of cards are so that card1 is above card2 on the solitaire
 * table e.g. card1 = 10 of Spades, card2 = 9 of Hearts would be valid.
 * Returns True if the configuration is valid and False otherwise.
 * 
 * @param{card Object} card1 The first card object
 * @param{card Object} card2 The second card object
 */
function canMoveTableau(card1, card2)
{
  if(card1 == undefined || card1.hidden == true)
    return false;
  
  if(card2 == undefined)
    return true;

  if(card1.rank - 1 != card2.rank)
    return false;
  
  let card1_red = ["hearts", "diamonds"].includes(card1.suit);
  let card2_red = ["hearts", "diamonds"].includes(card2.suit);

  return card1_red != card2_red;
}


/*
 * Checks if a given card is valid to place onto another card
 * in the tableau pile. Here card1 is the card which is being
 * moved, and card2 is the card which it is being moved onto.
 * Returns True if the configuration is valid and False otherwise.
 * 
 * @param{card Object} card1 The first card object
 * @param{card Object} card2 The second card object
 */
function isCorrectPlacementTableau(card1, card2) 
{

if(card1 == undefined || card1.hidden == true)
  return false;

if(card2 == undefined) {
  console.log(card2 + " " + card1.rank);
  return card1.rank == 13;
}

if(card2.hidden)
  return false;

if(card1.rank + 1 != card2.rank)
  return false;

let card1_red = ["hearts", "diamonds"].includes(card1.suit);
let card2_red = ["hearts", "diamonds"].includes(card2.suit);

return card1_red != card2_red;
}

/*
 * Checks if a given card is valid to place onto another card
 * in the foundation pile. Here card1 is the card which is being
 * moved, and card2 is the card which it is being moved onto.
 * If card2 is undefined (which means the corresponding pile is empty) 
 * the pile_number is instead referred to check if the placement is correct.
 * Returns True if the configuration is valid and False otherwise.
 * 
 * @param{card Object} card1       The first card object
 * @param{card Object} card2       The second card object
 * @param{Integer}     pile_number The pile to move onto
 */
function isCorrectPlacementFoundation(card1, card2, pile_number) 
{  
  if(card2 == undefined)
  {
    if(card1.rank != 1)
      return false;
    
    switch(pile_number){
      case(0):
        return card1.suit == "spades";
      case(1):
        return card1.suit == "hearts";
      case(2):
        return card1.suit == "clubs";
      case(3):
        return card1.suit == "diamonds";
      default:
        return false;
    }
  }
  
if(card1.rank - 1  != card2.rank)
  return false;

if(card1.hidden || card2.hidden)
  return false;

return card1.suit == card2.suit;

}





// How should an action from the client look?
// {
//   action: 'MovePile',
//   sequence: {
//     from: {
//       pile: 'f_pile',
//       pile_number: 2,
//       card_number: 3
//     },
//     to: {
//       pile: 't_pile',
//       pile_number: 4
//     }
//   }
// }



// How should an action from the client look?
// {
//   action: 'MovePile',
//   sequence: {
//     from: {
//       pile: 'f_pile',
//       pile_number: 2,
//       card_number: 3
//     },
//     to: {
//       pile: 't_pile',
//       pile_number: 4
//     }
//   }
// }

//       pile: 'f_pile',
//       pile_number: 2,
//       card_number: 3
//     },
//     to: {
//       pile: 't_pile',
//       pile_number: 4
//     }
//   }
// }

//       pile: 'f_pile',
//       pile_number: 2,
//       card_number: 3
//     },
//     to: {
//       pile: 't_pile',
//       pile_number: 4
//     }
//   }
// }

