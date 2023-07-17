import { Game } from './controllers/GameModel.js';

export type RegPlayer = Pick<Player, 'name' | 'password'>;

export interface Player {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface DataAddShips {
  gameId: number;
  ships: ShipData[];
  indexPlayer: number;
}

export interface ShipData {
  position: Point;
  direction: boolean;
  type: string;
  length: number;
  killed?: boolean;
}

export type Point = {
  x: number;
  y: number;
};

export interface StateGame {
  game: Game;
  player: number;
}

export interface Attack extends Point, Omit<DataAddShips, 'ships'> {}

export interface AttackRes {
  position: Point;
  currentPlayer: number;
  status: string;
}
