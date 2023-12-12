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


export abstract class PlayingCards {
    abstract getCardValue(card: ICard): number;
    abstract totalHand(hand: TDeck): unknown;

    // TODO: add optional Joker(s)
    generateDeck(params: IParamsGenerateDeck = {}): TDeck {
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
                card.id = this.generateCardID(card, i);
                return card;
            });

            decks = decks.concat(...clonedDeck);
        }

        return structuredClone(decks);
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
    getTopCard(deck: TDeck, facing: TCardFacing = 'down'): ICard | false {
        if (deck.length > 0) {
            if (facing === 'up') {
                return deck.pop() as ICard;
            }

            return deck.shift() as ICard;
        }

        return false;
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
     * @param facing of all cards in shuffled deck
     */
    shuffleDeck(deck: TDeck, facing: TCardFacing = 'down'): TDeck {
        const copiedDeck = structuredClone(deck).map((card: ICard) => {
            card.facing = facing;
            return card;
        });
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


    protected generateCardID(card: ICard, deckNumber = 1): string {
        /*
         * JavaScript (or Vue?) sees the cards as identical (same pointer)
         * when their IDs are the same, so we must include the deck number
         * when suit-value pairs will appear more than once.
         */
        return `d${deckNumber}-${card.suit}-${card.value}`;
    }
}
