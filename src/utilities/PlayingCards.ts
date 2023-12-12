const Values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
const Suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;

export type TCardValue = typeof Values[number];
export type TCardSize = 'large' | 'small';
export type TCardSuit = typeof Suits[number];
export type TCardFacing = 'down' | 'up';
export type TCardColor = 'black' | 'red';

export interface ICard {
    facing: TCardFacing;
    id: string;
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
            numDecks = 1,
        } = params;


        const deck: TDeck = [];
        Suits.forEach(suit => {
            Values.forEach(value => {
                deck.push({
                    facing,
                    id: 'INCOMPLETE',
                    suit,
                    value,
                });
            });
        });

        // https://stackoverflow.com/q/50672126/356016
        // const decks = Array.from({ length: numDecks }, () => deck).flat();
        // const decks = Array(numDecks).fill(deck).flat();

        let decks: TDeck = [];
        for (let i = 1; i <= numDecks; i++) {
            const clonedDeck: TDeck = structuredClone(deck).map((card: ICard) => {
                card.id = PlayingCards.generateCardID(card, i);
                return card;
            });

            decks = decks.concat(...clonedDeck);
        }

        return structuredClone(decks);
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

                    // TODO: Aces are player's choice, not automatically 1 or 11, unless forced into a 1 to avoid bust (hard hand)

                    // TODO: this won't work with multiple decks (e.g., both cards could be Ace of Spades)
                    //       cards will likely need IDs (or include deck IDs)
                    if (card.suit === aces[0].suit) {
                        console.log('ace counts as 11');
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
     * removes and returns "top" card from deck
     *
     * If the deck is face down, the "top" card is at the first index;
     * if face up, the last.
     *
     * @param deck
     * @param facing
     */
    static getTopCard(deck: TDeck, facing: TCardFacing = 'down'): ICard | false {
        if (deck.length > 0) {
            if (facing === 'up') {
                return deck.pop() as ICard;
            }

            return deck.shift() as ICard;
        }

        return false;
    }

    static hasBlackjack(hand: TDeck): boolean {
        return hand.length === 2 && PlayingCards.totalHand(hand) === 21;
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
        const copiedDeck = structuredClone(deck);
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
        if (!Array.isArray(hand)) {
            throw new Error('totalHand received unexpected value');
        }
        return hand.reduce(
            (total, card) => {
                return total + this.getCardValue(card, { hand });
            },
            0,
        );
    }

    private static generateCardID(card: ICard, deckNumber = 1): string {
        /*
         * JavaScript (or Vue?) sees the cards as identical (same pointer)
         * when their IDs are the same, so we must include the deck number
         * when suit-value pairs will appear more than once.
         */
        return `d${deckNumber}-${card.suit}-${card.value}`;
    }
}
