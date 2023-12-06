import {describe, it, expect} from 'vitest';

import {PlayingCards} from './PlayingCards';

describe('PlayingCards', () => {
    it('generates a deck of 52 cards', () => {
        const deck = PlayingCards.generateDeck();
        expect(deck.length).toBe(52);
    });

    it('correctly totals two aces', () => {
        const deck = PlayingCards.generateDeck();
        const aces = deck.filter(card => card.value === 'A');
        const hand = aces.slice(0, 2);

        expect(PlayingCards.totalHand(hand)).toBe(12);
    });

    it('correctly totals three aces', () => {
        const deck = PlayingCards.generateDeck();
        const aces = deck.filter(card => card.value === 'A');
        const hand = aces.slice(0, 3);

        expect(PlayingCards.totalHand(hand)).toBe(3);
    });

    // TODO
    it.skip('evenly shuffles deck', () => {
        const deck = PlayingCards.generateDeck();

        // for(i=0; i < 100_000; i++) {
        //     const shuffledDeck = PlayingCards.shuffleDeck(deck);
        // }

        expect(deck.length).toBe(52);
    });
});
