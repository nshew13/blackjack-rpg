export interface IPlayer {
    enabled: boolean;
    inGroup?: IPlayerGroup['uuid'];
    name: string;
    uuid: string;
}

export interface IPlayerGroup {
    name: string;
    uuid: string;
}
