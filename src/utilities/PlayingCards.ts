
const Values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
const Suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;

export type TCardValue = typeof Values[number];
export type TCardSuit = typeof Suits[number];
export type TCardFacing = 'down' | 'up';
export type TCardColor = 'black' | 'red';
export interface ICard {
    facing: TCardFacing;
    suit: TCardSuit;
    value: TCardValue;
}
export type TDeck = ICard[];

interface IParamsGenerateDeck {
    facing?: TCardFacing;
    numDecks?: number;
    numJokers?: number;
}

interface IParamsCardValue {
    hand?: TDeck;
}

// TODO: add optional Joker(s)

export class PlayingCards {
    static generateDeck(params: IParamsGenerateDeck = {}): TDeck {
        const {
            facing = 'down',
            // numJokers = 0,
            // numDecks = 1,
        } = params;


        const deck: TDeck = [];
        Suits.forEach(suit => {
            Values.forEach(value => {
                deck.push({ facing, suit, value });
            })
        });

        return JSON.parse(JSON.stringify(deck));
    }

    static getCardID(card: ICard): string {
        return `${card.suit}-${card.value}`;
    }

    // TODO: allow config for rules (e.g., facecard = 10, A = 1 or 11)
    static getCardValue(card: ICard, params: IParamsCardValue): number {
        switch (card.value) {
            case 'A':
                if (params?.hand) {
                    if (params.hand.length > 2) {
                        return 1;
                    }

                    // Find all the aces in the hand. Only the first one counts as 11.
                    const aces = params.hand.filter(card => card.value === 'A');

                    if (card === aces[0]) {
                        return 11;
                    }
                }
                return 1; // TODO: improve

            case 'K':
            case 'Q':
            case 'J':
                return 10;

            default:
                return parseInt(card.value, 10);
        }
    }

   static getColor(suit: TCardSuit): TCardColor {
        return suit === ('hearts' || 'diamonds') ? 'red' : 'black';
    }

    static getHtmlEntity(suit: TCardSuit): string {
        switch (suit) {
            case 'clubs':
                return '&clubs;';
            case 'diamonds':
                return '&#9830;';
            case 'hearts':
                return '&hearts;';
            case 'spades':
                return '&spades;';
        }
    }

    /**
     * shuffles deck using Knuth-Fisher-Yates
     *
     * Code from https://bost.ocks.org/mike/shuffle/, via
     * https://stackoverflow.com/a/2450976/356016.
     *
     * See also, https://blog.codinghorror.com/the-danger-of-naivete/.
     *
     * @param deck
     */
    static shuffleDeck(deck: TDeck): TDeck {
        const copiedDeck = JSON.parse(JSON.stringify(deck));
        let countUnshuffled = copiedDeck.length;

        while (countUnshuffled) {
            // Pick a remaining element…
            const randomUnshuffledCard = Math.floor(Math.random() * countUnshuffled--);

            // And swap it with the current element.
            const swapCard: ICard = copiedDeck[countUnshuffled];
            copiedDeck[countUnshuffled] = copiedDeck[randomUnshuffledCard];
            copiedDeck[randomUnshuffledCard] = swapCard;
        }

        return copiedDeck;
    }

    static totalHand(hand: TDeck): number {
        return hand.reduce(
            (total, card) => {
                return total + this.getCardValue(card, { hand });
            },
            0
        );
    }
}