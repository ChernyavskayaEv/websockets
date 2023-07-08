export type RegPlayer = Pick<Player, 'name' | 'password'>;

export interface Player {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface DataAddShips {
  gameId: number;
  ships: Ships[];
  indexPlayer: number;
}

interface Ships {
  position: { x: number; y: number };
  direction: boolean;
  type: string;
  length: number;
}
