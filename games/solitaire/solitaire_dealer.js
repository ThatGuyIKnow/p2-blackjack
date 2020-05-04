
function removeCardFoundation(state, action)
{
  const pile = state.f_pile[action.sequence.from.pile_number];
  return [pile.pop()];
}

function removeCardStockpile(state, action)
{
  const index = action.sequence.from.card_number;
  return state.s_pile.splice(index, 1);
}

function removeCardsTableau(state, action)
{
  const pile = state.t_pile[action.sequence.from.pile_number];
  const card_index = action.sequence.from.card_number;
  console.log(pile);
  return pile.splice(card_index);
}

function removeCards(state, action)
{
  switch(action.sequence.from.pile) {
    case('f_pile'):
      return removeCardFoundation(state, action);
    case('s_pile'):
      return removeCardStockpile (state, action);
    case('t_pile'):
      return removeCardsTableau  (state, action);
  }
}

function pushCards(state, action, cardPackage)
{
  const pile_number = action.sequence.to.pile_number;
  let pile;

  switch(action.sequence.to.pile){
    case('f_pile'):
      pile = state.f_pile[pile_number];
      state.f_pile[pile_number] = pile.concat(cardPackage);
      break;
    case('t_pile'):
      pile = state.t_pile[pile_number];
      console.log(pile);
      state.t_pile[pile_number] = pile.concat(cardPackage);
      break;
  }
  
}

module.exports = {
  movePile : function(state, action) {
    const cardPackage = removeCards(state, action);
    pushCards(state, action, cardPackage);
  }
}