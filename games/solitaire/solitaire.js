const createTableaus = require("./solitaire_state.js");
const createDeck = require('../cards.js');
const gamemaster = require('./solitaire_gamemaster.js');
const dealer = require('./solitaire_dealer.js');

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
    gamemaster.verify(state, action, (err) => {
        if (err) {
            console.log(err);
            callback(state, err);
            return;
        }
        const newState = dealer.act(state, action);
        callback(newState);
    });
}
