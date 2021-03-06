/**
 * Global variables
 */
let currentState = {};
let cardList = [];
let stockCounter = 0;
const action = {
  action: 'MovePile',
  sequence: {
    from: {
      pile: '',
      pile_number: -1,
      card_number: -1
    },
    to: {
      pile: '',
      pile_number: -1
    }
  }
}
let socket = io();

/**
 * An socket IO event handler listening for messages.
 */
socket.on('message', (msg) => {
  console.log(msg);
});

/**
 * An socket IO event handler listening for a verification
 * on the player joining the room. Gets
 * initial state if verified.
 */
let ping;
socket.on('room control', () => {
  if (ping == undefined) {
    ping = setInterval(() => {
      socket.emit('session ping');
      console.log("Ping send");
    }, 2000);
  }
  playerAction({});
});
setupDropzones();

socket.on('room update', (state) => {
  currentState = state;
  render(state);
});

/**
 * Cast a custom socket IO event asking to join a room on the server
 *
 * @param {string} roomID The unique room identifier
 */
function accessRoom(roomID) {
  socket.emit('accessRoom', roomID);
}
accessRoom('room2');

/**
 * Sends the action object to the server and renders the responds
 * (which is in the form of a state). Prints error if received.
 *
 * @param {object} action The action object
 */
function playerAction(action) {
  socket.emit("player action", action, (state, err) => {
    if (err != undefined)
      console.log(err);
    currentState = state;
    render(state);
  });
}

function resetGame() {
  socket.emit("reset game", (state) => {
    currentState = state;
    stockCounter = 0;
    render(state);
  });
}

/**
 * Sets up the dropzones which can be interacted with
 * similarly to the DOM cards
 */
function setupDropzones() {
  addHandlers($('#foundation-0'), 'foundation', 0, -1);
  addHandlers($('#foundation-1'), 'foundation', 1, -1);
  addHandlers($('#foundation-2'), 'foundation', 2, -1);
  addHandlers($('#foundation-3'), 'foundation', 3, -1);

  addHandlers($('#tableau-0'), 'tableau', 0, -1);
  addHandlers($('#tableau-1'), 'tableau', 1, -1);
  addHandlers($('#tableau-2'), 'tableau', 2, -1);
  addHandlers($('#tableau-3'), 'tableau', 3, -1);
  addHandlers($('#tableau-4'), 'tableau', 4, -1);
  addHandlers($('#tableau-5'), 'tableau', 5, -1);
  addHandlers($('#tableau-6'), 'tableau', 6, -1);
  
  $('#down_pile').off('click').on('click', (event) => {
    event.stopPropagation();
    let last_child = $('#stockpile').children()[$('#stockpile').children().length - 1];
    $(last_child).prependTo('#stockpile');
    stockCounter = (stockCounter + 1) % currentState.stockpile.length;
    //Removes the highlighted from card
    let seq = action.sequence;
    seq.from.pile = '';
    seq.from.pile_number = -1;
    seq.from.card_number = -1;
    seq.to.pile = '';
    seq.to.pile_number = -1;
    $('.highlight').removeClass('highlight');
  })

}

// ======== RENDER FUNCTIONALITY ========

/**
 * A function which clears all card objects and renders new ones
 * based on the solitaire state
 * @param {object} state The solitaire state
 */
function render(state) {
  clearCards();
  renderTableau(state.tableau);
  renderFoundation(state.foundation);
  renderStockpile(state.stockpile);
}

/**
 * Clears and removes all cards from cardList
 */
function clearCards() {
  for (let card of cardList) {
    card.remove();
  }
  cardList = [];
}

/**
 * Renders, creates handlers, and registers the foundation cards.
 * @param {object} piles The foundation object from state
 */
function renderFoundation(piles) {
  for (let i = 0; i < piles.length; i++) {
    for (let j = 0; j < piles[i].length; j++) {
      let $card = createCard(piles[i][j]);
      addHandlers($card, 'foundation', i, j);
      cardList.push($card)
      $card.appendTo(`#foundation-${i}`);
    }
  }
}

/**
 * Renders, creates handlers, and registers the stock cards.
 * @param {object} pile The stockpile object from state
 */
function renderStockpile(pile) {
  for (let i = 0; i < pile.length; i++) {
    let $card = createCard(pile[i]);
    addHandlers($card, 'stockpile', 0, i);
    cardList.push($card)
    $card.appendTo(`#stockpile`);
  }
  for(let i = 0; i < stockCounter; i++) {
    let last_child = $('#stockpile').children()[$('#stockpile').children().length - 1];
    $(last_child).prependTo('#stockpile');
  }
}

/**
 * Renders, creates handlers, and registers the tableau cards.
 * @param {object} piles The tableau object from state
 */
function renderTableau(piles) {
  for (let i = 0; i < piles.length; i++) {
    for (let j = 0; j < piles[i].length; j++) {
      let $card = createCard(piles[i][j]);
      addHandlers($card, 'tableau', i, j);
      cardList.push($card);
      $card.appendTo(`#tableau-${i}`);
    }
  }
}

/**
 * Adds handlers to elem to register whenever a user clicks on it. This is used
 * to determine the action to send to the server.
 *
 * @param {JQuery Object} elem Element to add handlers to
 * @param {string} pile The name of the pile(s) ('foundation', 'tableau' or 'stockpile')
 * @param {int} pile_number The pile the Element belongs to
 * @param {int} card_number The order of the element in the pile
 */
function addHandlers(elem, pile, pile_number, card_number) {
  elem.click((event) => {
    event.stopPropagation();
    let seq = action.sequence;
    if (seq.from.pile == '') {
      if (card_number == -1)
        return;
      seq.from.pile = pile;
      seq.from.pile_number = pile_number;
      seq.from.card_number = card_number;
      elem.addClass('highlight');
    } else {
      if (seq.from.pile == pile &&
          seq.from.pile_number == pile_number &&
          seq.from.card_number == card_number) {
        seq.from.pile = '';
        seq.from.pile_number = -1;
        seq.from.card_number = -1;
        elem.removeClass('highlight');
      } else {
        seq.to.pile = pile;
        seq.to.pile_number = pile_number;
        playerAction(action);
        seq.from.pile = '';
        seq.from.pile_number = -1;
        seq.from.card_number = -1;
        seq.to.pile = '';
        seq.to.pile_number = -1;
        $('.highlight').removeClass('highlight');
      }
    }
  })
}

/**
 * Takes a card object and creates a JQuery representation
 * @param {object} card Card object
 */
function createCard(card) {

  let suit;
  let textValue;
  let rank;

  let div1 = $("<div>");
  let div2 = document.createElement("div");
  let div3 = document.createElement("div");
  let div4 = document.createElement("div");
  let div5 = document.createElement("div");
  let div6 = document.createElement("div");

  let mid1 = document.createElement("div");
  let mid2 = document.createElement("div");
  let mid3 = document.createElement("div");
  let mid4 = document.createElement("div");
  let mid5 = document.createElement("div");
  let mid6 = document.createElement("div");
  let mid7 = document.createElement("div");
  let mid8 = document.createElement("div");
  let mid9 = document.createElement("div");
  let mid10 = document.createElement("div");
  let mid11 = document.createElement("div");
  let mid12 = document.createElement("div");
  let mid13 = document.createElement("div");
  let mid14 = document.createElement("div");
  let mid15 = document.createElement("div");


  if (card.hidden) {
    suit = "card hidden-card";
    textValue = "";
  } else {
    let setup = "card card-"
    let setup2 = " V-"
    suit = setup.concat(card.suit);
    switch (card.rank) {
      case (1):
        rank = 'A';
        break;
      case (11):
        rank = 'J';
        break;
      case (12):
        rank = 'Q';
        break;
      case (13):
        rank = 'K';
        break;
      default:
        rank = card.rank;
        break;
    }
    textValue = setup2.concat(rank)
  }
  combined = suit.concat(textValue);

  div1.addClass(combined);
  div2.className = "top";
  div3.className = "top top--symbol";
  div4.className = "mid";
  div5.className = "bottom bottom--symbol";
  div6.className = "bottom";


  div2.innerHTML = rank;
  div6.innerHTML = rank;

  //document.body.appendChild(div1);
  div1.append(div2);
  div1.append(div3);
  div1.append(div4);
  div1.append(div5);
  div1.append(div6);

  mid1.className = "topleft";
  mid2.className = "topmid";
  mid3.className = "topright";

  mid4.className = "topmidleft";
  mid5.className = "topmidmid";
  mid6.className = "topmidright";

  mid7.className = "midleft";
  mid8.className = "midmid";
  mid9.className = "midright";

  mid10.className = "bottommidleft";
  mid11.className = "bottommidmid";
  mid12.className = "bottommidright";

  mid13.className = "bottomleft";
  mid14.className = "bottommid";
  mid15.className = "bottomright";

  div4.appendChild(mid1);
  div4.appendChild(mid2);
  div4.appendChild(mid3);
  div4.appendChild(mid4);
  div4.appendChild(mid5);
  div4.appendChild(mid6);
  div4.appendChild(mid7);
  div4.appendChild(mid8);
  div4.appendChild(mid9);
  div4.appendChild(mid10);
  div4.appendChild(mid11);
  div4.appendChild(mid12);
  div4.appendChild(mid13);
  div4.appendChild(mid14);
  div4.appendChild(mid15);

  return div1;
}
