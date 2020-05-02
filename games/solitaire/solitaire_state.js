const createDeck = require('../cards');

/*TODO Add back in later module.exports = */
function createTableaus(deck) {
    let tableaus = [];

    for (let i = 0; i < deck.length; i++)
        deck[i].hidden = false;

    for (let i = 0; i < 7; i++)
        tableaus[i] = Tableau(deck, i + 1);

    return tableaus;
}

// Create tableau with @param cards
function Tableau(deck, number_of_cards) {
    let tableau = [];

    for (let i = 0; i < number_of_cards; i++) {
        if (i != 0)
            deck[0].hidden = true;

        tableau.push(deck[0]);
        deck.splice(0, 1);
    }

    return tableau;
}


module.exports = createTableaus;