
class VerificationError extends Error{}
class StateChangeError  extends Error{}

const dealer = require('./solitaire_dealer.js');


function deepCopy(object) 
{
  return JSON.parse(JSON.stringify(object));
}

const ruleset = {
  'MovePile' : MovePile,
}


function MovePile (state, action, callback)
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


  // dealer.MovePile(state, action, (err) => {
  //   if (err) {
  //     error = err;
  //     callback(state, err);
  //   }
  // });
  // if (error)
  //   return;

  callback(state);
  
}


/*
 *
 * Takes the state, and action, and a callback event in form callback(err)
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

  if(!canGrabCard(from_card1, from_card2))
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

function canGrabCard(card1, card2)
{
  if(card1 == undefined)
    return false;
  
  if(card2 == undefined)
    return true;

  if(card1.rank - 1 != card2.rank)
    return false;
  
  let card1_red = ["hearts", "diamonds"].includes(card1.suit);
  let card2_red = ["hearts", "diamonds"].includes(card2.suit);

  return card1_red != card2_red;
}

function isCorrectPlacementTableau(card1, card2) 
{

if(card1 == undefined)
  return false;

if(card2 == undefined) {
  console.log(card2 + " " + card1.rank);
  return card1.rank == 13;
}

if(card1.rank + 1 != card2.rank)
  return false;

if(card1.hidden || card2.hidden)
  return false;

let card1_red = ["hearts", "diamonds"].includes(card1.suit);
let card2_red = ["hearts", "diamonds"].includes(card2.suit);

return card1_red != card2_red;
}

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



module.exports = {

  // Den skal kunne interpret
  // Den skal kunne bekrn af en aktion
  // Den skal kunne interagere med Dealeren
  // Den skal have en

  

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

  act : function (state, action, callback) {
    console.log(action);
    if(Object.keys(ruleset).includes(action.action)) {
      const newState = deepCopy(state);
      ruleset[action.action](newState, action, callback);
    }
    else {
      callback(state);
    }
  },



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

