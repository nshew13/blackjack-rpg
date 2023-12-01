export interface IPlayer {
    name: string;
    uuid: string;
    enabled: boolean;
}

export interface IPlayerGroup {
    name: string;
    // uuid: string;
    playerIDs: Array<IPlayer['uuid']>;
}
