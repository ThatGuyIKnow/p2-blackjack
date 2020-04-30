const createTableaus = require("./solitaire_state");
const createDeck = require('../cards');
const gameMaster = require('./solitaire_gamemaster');

module.exports =  {
    init : function (callback) {
        const s_pile = createDeck(1);

        for (let card of s_pile) {
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
    },

    action : gameMaster.act,
    filterState : (state) => gameMaster.filterState(state),
}