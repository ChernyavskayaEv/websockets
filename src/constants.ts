export enum SEND_TYPE {
  Reg = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
}

export interface Player {
  playerId: number;
  name: string;
  password: string;
  wins: number;
}

export interface Room {
  roomId: number;
  roomUsers: Player;
}

export interface Game {
  gameId: number;
  playerId: number;
}
