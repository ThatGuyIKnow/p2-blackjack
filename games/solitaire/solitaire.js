const createDeck = require('../cards.js');

let deck = createDeck(1);

function createTableaus(deck) {
    let tableau = [],
        i;

    for (i = 0; i < deck.length; i++)
        deck[i].hidden = false;

    for (i = 0; i < 7; i++)
        tableau[i + 1] = createTableau(deck, i);

    console.log(tableau);
    console.log(deck);

    return tableau;
}

// Create tableau with @param cards
function createTableau(deck, number_of_cards) {
    let tableau = [],
        i;

    console.log(deck);
    console.log("removing " + number_of_cards);

    for (i = 0; i < number_of_cards; i++) {
        if (i != 0)
            deck[0].hidden = true;

        tableau.push(deck[0]);
        deck.splice(0, 1);
    }

    return tableau;
}

createTableaus(deck);

function init(callback) {
    const s_pile = createDeck(1);
    for (let card in s_pile) {
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

function action(state, action, callback) {
    const newState = {};

}
