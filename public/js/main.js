let ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    suits = ["spades", "hearts", "diamonds", "clubs"];

function createDeck(number_of_decks) {

    let deck = new Array,
        ID, i, j, card;

    for (i = 0; i < suits.length; i++) {

        for (j = 0; j < ranks.length * number_of_decks; j++) {

            // Random alpha-numeric string
            ID = randomNumber(1000000).toString(36);

            card = {
                Suit: suits[i % 4],
                Rank: ranks[j % 13],
                ID: ID
            };
            deck.push(card);
        }
    }

    return deck;
}

// Shuffle deck using the Fisher–Yates shuffle algorithm
function shuffleDeck(deck) {
    let deck_size = deck.length,
        temp, random_card;

    // While there remain elements to shuffle…
    while (deck_size) {

        // Pick a remaining element…
        random_card = randomNumber(deck_size--);

        // And swap it with the current element.
        temp = deck[deck_size];
        deck[deck_size] = deck[random_card];
        deck[random_card] = temp;
    }

    return deck;
}

// Generate random number of certain size
function randomNumber(size) {
    return Math.floor(Math.random() * size);
}

// Get the deck
module.exports = function getDeck(number_of_decks) {
    deck = createDeck(number_of_decks);
    shuffleDeck(deck);
    console.log(deck);
}
