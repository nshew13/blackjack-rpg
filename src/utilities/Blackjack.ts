import {PlayingCards} from '@/utilities/PlayingCards';
import type {ICard, TDeck} from '@/utilities/PlayingCards';

export type THardTotal = number;
export type TSoftTotal = [number, number];
export type THandTotal = TSoftTotal | THardTotal;


export class Blackjack extends PlayingCards {
    static readonly HAND_TOTAL_BLACKJACK = 21;

    static isHardTotal(handTotal: THandTotal): handTotal is THardTotal {
        return !Array.isArray(handTotal);
    }

    static isSoftTotal(handTotal: THandTotal): handTotal is TSoftTotal {
        return Array.isArray(handTotal);
    }

    getCardValue(card: ICard/* , params: IParamsCardValue */): number {
        switch (card.value) {
            case 'A':
                // aces' dual scoring is handled by totalHand
                return 1;

            case 'K':
            case 'Q':
            case 'J':
                return 10;

            default:
                return parseInt(card.value, 10);
        }
    }

    handHasBlackjack(hand: TDeck): boolean {
        const handTotal = this.totalHand(hand);

        if (Blackjack.isSoftTotal(handTotal)) {
            // totalHand would return only one total if blackjack
            return false;
        }

        // Blackjack if only two cards
        return hand.length === 2 && handTotal === Blackjack.HAND_TOTAL_BLACKJACK;
    }

    handIsBust(hand: TDeck): boolean {
        const total = this.totalHand(hand);
        if (Blackjack.isHardTotal(total)) {
            return total > Blackjack.HAND_TOTAL_BLACKJACK;
        }
        return total.every(total => total > Blackjack.HAND_TOTAL_BLACKJACK);
    }

    /**
     * totals hand according to Blackjack scoring
     *
     * If two soft totals are returned, it is safe to assume that the first
     * will be the greater of the two.
     *
     * To guarantee a single-total, you can specify bestOnly=true.
     *
     * @param hand
     */
    totalHand(hand: TDeck, bestOnly = false): THandTotal {
        if (!Array.isArray(hand)) {
            throw new Error('totalHand received unexpected value');
        }

        // divide hand into aces and everything else
        const aces: TDeck = [];
        const nonAces: TDeck = [];
        hand.forEach((card: ICard) => {
            if (card.value === 'A') {
                aces.push(card);
            } else {
                nonAces.push(card);
            }
        });

        // total non-aces
        const hardTotal = nonAces.reduce(
            (total, card) => {
                return total + (this.getCardValue(card/* , { hand } */) as number);
            },
            0,
        );

        // if there are no aces, return the hard total
        if (aces.length === 0) {
            return hardTotal;
        }

        /*
         * Only the first ace can be an 11. Additional would cause a bust.
         * It remains the player's choice whether it is an 11 or 1.
         */
        const softTotals: TSoftTotal = [hardTotal + 11, hardTotal + 1];

        for (let i = 1; i < aces.length; i++) {
            softTotals[0]++;
            softTotals[1]++;
        }

        // If an Ace-as-11 busts, we're down to one total.
        if (softTotals[0] > Blackjack.HAND_TOTAL_BLACKJACK) {
            return softTotals[1];
        }

        // Likewise, if we have a blackjack, there's no reason for a soft total.
        else if (hand.length === 2 && softTotals[0] === Blackjack.HAND_TOTAL_BLACKJACK) {
            return softTotals[0];
        }

        if (bestOnly) {
            return softTotals[0];
        }

        return softTotals;
    }
}
