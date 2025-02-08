import type {TCardColor, TCardSuit} from '@/utilities/PlayingCards';

export class PlayingCardUtils {
    static getColor(suit: TCardSuit): TCardColor {
        return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
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
}
