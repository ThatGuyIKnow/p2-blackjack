module.exports = function createTableaus(deck) {
    let tableau = [],
        i;

    for (i = 0; i < deck.length; i++)
        deck[i].hidden = false;

    for (i = 0; i < 7; i++)
        tableau[i + 1] = Tableau(deck, i);

    console.log(tableau);
    console.log(deck);

    return tableau;
}

// Create tableau with @param cards
function Tableau(deck, number_of_cards) {
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
