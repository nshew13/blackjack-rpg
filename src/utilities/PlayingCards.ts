
const Values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
const Suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;

export type TCardValue = typeof Values[number];
export type TCardSuit = typeof Suits[number];
export type TCardColor = 'red' | 'black';
export interface ICard {
    value: TCardValue;
    suit: TCardSuit;
}
export type TDeck = ICard[];

// TODO: add optional Joker(s)

export class PlayingCards {
    static generateDeck(numJokers = 0, numDecks = 1): TDeck {
        const deck: TDeck = [];
        Suits.forEach(suit => {
            Values.forEach(value => {
                deck.push({ value, suit });
            })
        });

        console.log('deck', deck);
        return JSON.parse(JSON.stringify(deck));
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
        let countUnshuffled = deck.length;

        while (countUnshuffled) {
            // Pick a remaining element…
            const randomUnshuffledCard = Math.floor(Math.random() * countUnshuffled--);

            // And swap it with the current element.
            const swapCard: ICard = deck[countUnshuffled];
            deck[countUnshuffled] = deck[randomUnshuffledCard];
            deck[randomUnshuffledCard] = swapCard;
        }

        return deck;
    }
}