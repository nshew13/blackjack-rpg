import {describe, it, expect, beforeEach} from 'vitest';
import {Blackjack} from '@/utilities/Blackjack';
import type {TSoftTotal} from '@/utilities/Blackjack';

describe('Blackjack', () => {
    let blackjack: Blackjack;

    beforeEach(() => {
        blackjack = new Blackjack();
    })

    it('generates a deck of 52 cards', () => {
        const deck = blackjack.generateDeck();
        expect(deck.length).toBe(52);
    });

    it('generates two deck of 104 cards', () => {
        const deck = blackjack.generateDeck({numDecks: 2});
        expect(deck.length).toBe(104);
    });

    it('correctly totals two aces', () => {
        const deck = blackjack.generateDeck();
        const aces = deck.filter(card => card.value === 'A');
        const hand = aces.slice(0, 2);

        const totals = blackjack.totalHand(hand) as TSoftTotal;
        expect(totals[0]).toBe(12);
        expect(totals[1]).toBe(2);
    });

    it('correctly totals three aces', () => {
        const deck = blackjack.generateDeck();
        const aces = deck.filter(card => card.value === 'A');
        const hand = aces.slice(0, 3);

        const totals = blackjack.totalHand(hand) as TSoftTotal;
        expect(totals[0]).toBe(13);
        expect(totals[1]).toBe(3);
    });

    // TODO
    it.skip('evenly shuffles deck', () => {
        const deck = blackjack.generateDeck();

        // for(i=0; i < 100_000; i++) {
        //     const shuffledDeck = blackjack.shuffleDeck(deck);
        // }

        expect(deck.length).toBe(52);
    });
});
