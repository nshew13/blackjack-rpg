export interface IPlayer {
    enabled: boolean;
    name: string;
    uuid: string;
}

export interface IPlayerGroup {
    name: string;
    // uuid: string;
    playerIDs: Set<IPlayer['uuid']>;
    uuid: string;
}
