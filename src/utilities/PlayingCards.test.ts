import { describe, it, expect } from 'vitest'

import PlayingCards from './PlayingCards'

describe('PlayingCards', () => {
    it('generates a deck of 52 cards', () => {
        const deck = PlayingCards.generateDeck();
        expect(deck.length).toBe(52);
    })

    // TODO
    it.skip('evenly shuffles deck', () => {
        const deck = PlayingCards.generateDeck();

        for(i=0; i < 100_000; i++) {
            const shuffledDeck = PlayingCards.shuffleDeck(deck);
        }

        expect(deck.length).toBe(52);
    })
})
