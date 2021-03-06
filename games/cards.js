// The different ranks and suits a card can have.
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const suits = ["spades", "hearts", "clubs", "diamonds"];

/**
 * Creates a deck, which is an array of card objects. This deck contains
 * {number_of_decks} amount of single decks, and {number_of_jokers} amount
 * of jokers.
 * @param {Integer} number_of_decks  The amounts of single decks in the deck
 * @param {Integer} number_of_jokers The amount of jokers in the deck
 */
function buildDeck(number_of_decks, number_of_jokers) {

  let deck = [];
  let ID = 1;
  let card;

  for (let i = 0; i < suits.length * number_of_decks; i++) {

    for (let j = 0; j < ranks.length; j++) {

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
  let last_id = deck[deck.length - 1].id + 1;

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

/**
 * A function which shuffles a deck using the Fisher-Yates algorithm.
 * @param {Array} deck The deck to be shuffled
 */
function shuffleDeck(deck) {

  let deck_size = deck.length;
  let temp;

  // While there remain elements to shuffle
  while (deck_size) {

    // Pick a remaining elements
    let random_card = randomNumber(deck_size--);

    // And swap it with the current element
    temp = deck[deck_size];
    deck[deck_size] = deck[random_card];
    deck[random_card] = temp;
  }

  return deck;
}

/**
 * Helper function which generates a random positive integer up to {size}.
 * Returns said integer.
 * @param {Integer} size The maximum size of the number
 */
function randomNumber(size) {
  return Math.floor(Math.random() * size);
}

/**
 * Returns a shuffled deck of {number_of_decks} size, with
 * {number_of_jokers} jokers.
 * @param {Integer} number_of_decks The amounts of single decks in the deck
 * @param {Integer} number_of_jokers The amount of jokers in the deck
 */
module.exports = function createDeck(number_of_decks, number_of_jokers) {

  let deck = buildDeck(number_of_decks, number_of_jokers);
  shuffleDeck(deck);

  return deck;
};
