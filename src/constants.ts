export type RegPlayer = Pick<Player, 'name' | 'password'>;

export interface Player {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface regRes {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface RoomRes {
  roomId: number;
  roomUsers: Omit<Player, 'playerId' | 'name'>;
}

export interface GameRes {
  idGame: number;
  idPlayer: number;
}
