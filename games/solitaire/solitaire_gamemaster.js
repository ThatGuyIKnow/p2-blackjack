
class VerificationError extends Error{}
class StateChangeError  extends Error{}

const dealer = require('./solitaire_dealer.js');


function deepCopy(object) 
{
  return JSON.parse(JSON.stringify(object));
}
const ruleset = {
  'MovePile' : this.MovePile,
}
module.exports = {

  // Den skal kunne interpret
  // Den skal kunne bekrn af en aktion
  // Den skal kunne interagere med Dealeren
  // Den skal have en

  

  this.filterState = function (state) {
    let filteredState = deepCopy(state);
    for(let pile of filteredState.f_pile) {
      for(let card of pile) {
        if(card.hidden) {
          card.isJoker = false;
          card.rank = 0;
          card.suit = "";
        }
      }
    }
  },

  this.act = function (state, action, callback) {
    if(Object.keys(ruleset).includes(action.action)) {
      ruleset[action.action](state, action, callback);
    }
  }


this.MovePile = function (state, action, callback)
{
  let error;

  const tempState = deepCopy(state);

  this.verifyMovePile(tempState, action, (err) => {
    if (err) {
      error = err;
      callback(state, err);
    }
  });
  if (error)
    return;


  const newState = dealer.MovePile(tempState, action, (err) => {
    if (err) {
      error = err;
      callback(state, err);
    }
  });
  if (error)
    return;

  callback(newState);
  
}

/*
 *
 * Takes the state, and action, and a callback event in form callback(err)
 */
this.verifyMovePile(state, action, callback) 
{
  const from = action.sequence.from;
  const to   = action.sequence.to;

  if (from.pile == 'f_pile') 
  {
    this.verifyFromFoundation(state, from, to, callback);
  }
  else if (from.pile == 's_pile')
  {
    this.verifyFromStockpile(state, from, to, callback);
  }
  else if (from.pile == 't_pile')
  {

  }
  else
  {
    callback(state, new VerificationError("Action does not exist."))
  }
}

/*
 * Verifies a move from the Foundation pile to another pile.
 * Takes the state, the from and to component of an action and the callback(err)
 */
this.verifyFromFoundation = function (state, from, to, callback)
{
    if(!state.f_pile[from.pile_number])
    {
      callback(new VerificationError("Illegal move"));
      return;
    }

    if(to.pile == 't_pile' && state.t_pile[to.pile_number] != undefined)
    {
      let from_card = state.f_pile[from.pile_number][0];
      let to_card = state.t_pile[to.pile_number][0];
      if(!this.isCorrectPlacementTableau(from_card, to_card))
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
  this.verifyFromStockpile = function(state, from, to, callback) 
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
      to_card = state.t_pile[to.pile_number][0];
      if(this.isCorrectPlacementTableau(from_card, to_card))
        return;
      else
        callback(new VerificationError("Illegal move"));
    }
    
    else if (to.pile == 'f_pile' && state.f_pile[to.pile_number])
    {
      to_card = state.f_pile[to.pile_number][length - 1];
      if(!this.isCorrectPlacementFoundation(from_card, to_card))
        callback(new VerificationError("Illegal move"));
    }
  }

  /*
 * Verifies a move from the Foundation pile to another pile.
 * Takes the state, the from and to component of an action and the callback(err)
 */
this.verifyFromTableau = function (state, from, to, callback)
{
    if(!state.t_pile[from.pile_number][from.card_number]
       || state.t_pile[from.pile_number][from.card_number].hidden)
    {
      callback(new VerificationError("Illegal move"));
      return;
    }

    let from_card1 = state.f_pile[from.pile_number][from.card_number];
    let from_card2 = state.f_pile[from.pile_number][from.card_number - 1];
    let to_card;

    if(from.card_number != 0 
       && !this.isCorrectPlacementTableau(from_card1, from_card2))
    {
      callback(new VerificationError("Illegal move"));
    }

    if(to.pile == 't_pile' && state.t_pile[to.pile_number] != undefined)
    {
      to_card = state.t_pile[to.pile_number][0];
      if(!this.isCorrectPlacementTableau(from_card, to_card))
      {
        callback(new VerificationError("Illegal move"));
      }
    }
    else if (to.pile == 'f_pile' && state.f_pile[to.pile_number] != undefined) 
    {
      console.log("not done here");
    }
    else
      callback(new VerificationError("Illegal move"));
  }


this.isCorrectPlacementTableau = function(card1, card2) 
{
  if(card1.rank + 1 != card2.rank)
    return false;

  if(card1.hidden || card2.hidden)
    return false;

  let card1_red = ["hearts", "diamonds"].includes(card1.suit);
  let card2_red = ["hearts", "diamonds"].includes(card2.suit);

  return card1_red != card2_red;
}

this.isCorrectPlacementFoundation = function (card1, card2) 
{  
  if(card1.rank - 1 != card2.rank)
    return false;

  if(card1.hidden || card2.hidden)
    return false;
  
  
  return card1.suit == card2.suit;
}

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

