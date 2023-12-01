import type {TDeck} from '@/utilities/PlayingCards';
import type {IPlayer} from '@/types/IPlayer';

export interface SessionStore {
    drawDeck?: TDeck;
    players?: IPlayer[];
}

export class Session {
    private static readonly STORAGE_NAME = 'blackjack-rpg';
    private static state: SessionStore = {};

    public static loadGameSession(): SessionStore {
        const store = localStorage.getItem(Session.STORAGE_NAME);
        if (store) {
            Session.state = JSON.parse(store);
        } else {
            Session.state = {};
        }

        return Session.state;
    }

    public static saveGameSession(kvPairs: SessionStore): SessionStore {
        Session.state = {
            ...Session.state,
            ...kvPairs,
        }
        localStorage.setItem(Session.STORAGE_NAME, JSON.stringify(Session.state));
        return Session.state;
    }
}
