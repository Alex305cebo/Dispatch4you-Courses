export type PlayerId = string | number | 'neutral';

export enum BuildingType {
    Village = 'village',
    Tower = 'tower',
    Forge = 'forge'
}

export interface Position {
    x: number;
    y: number;
}

export interface PlayerStats {
    attackModifier: number;
    defenseModifier: number;
}

export interface Building {
    id: string;
    type: BuildingType;
    pos: Position;
    owner: PlayerId;
    units: number;
    level: number;
    radius: number;
    maxUnits: number;
    growthRate: number; 
    attackRadius?: number;
    attackDamage?: number;
    upgradeCost: (level: number) => number;
}

export interface Swarm {
    id: string;
    owner: PlayerId;
    count: number;
    startPos: Position;
    targetPos: Position;
    fromId: string;
    toId: string;
    progress: number; // 0..1
}