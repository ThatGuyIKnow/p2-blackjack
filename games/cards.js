let ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    suits = ["spades", "hearts", "diamonds", "clubs"];

// Create @param number of decks
function buildDeck(number_of_decks, number_of_jokers) {

    let deck = [],
        ID = 1,
        last_id, card;

    for (let i = 0; i < suits.length; i++) {

        for (let j = 0; j < ranks.length * number_of_decks; j++) {

            // Random alpha-numeric string
            card = {
                suit: suits[i % 4],
                rank: ranks[j % 13],
                id: ID++,
                isJoker: false,
                hidden: true
            };
            deck.push(card);
        }
    }
    // Get the last id to start of the joker id count
    last_id = deck[deck.length - 1].id + 1;

    // Construct jokers
    for (let i = 0; i < number_of_jokers; i++) {

        card = {
            suit: 0,
            rank: 0,
            id: last_id++,
            isJoker: true,
            hidden: true
        };
        deck.push(card);
    }

    return deck;
}

// Shuffle deck using the Fisher-Yates shuffle algorithm
function shuffleDeck(deck) {
    let deck_size = deck.length,
        temp, random_card;

    // While there remain elements to shuffle
    while (deck_size) {

        // Pick a remaining elements
        random_card = randomNumber(deck_size--);

        // And swap it with the current element
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

// Get the uber-deck
module.exports = function createDeck(number_of_decks, number_of_jokers) {
    let deck = buildDeck(number_of_decks, number_of_jokers);
    shuffleDeck(deck);
    console.log(deck);

    return deck;
}
