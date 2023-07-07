import { RoomRes } from '../constants.js';
import { activeConnections } from './Players.js';

const rooms = new Map();
const games = new Map();

export const createRoom = (key: string): RoomRes => {
  let roomId = rooms.size > 0 ? Math.max(...rooms.keys()) + 1 : 1;
  const { index, name, password, wins } = activeConnections.get(key);
  rooms.set(roomId, { roomId, roomUsers: { name, index } });
  console.log('rooms', rooms);

  return rooms.get(roomId);
};

export const createGame = (key: string) => {
  let idGame = games.size > 0 ? Math.max(...games.keys()) + 1 : 1;

  const { index, name, password, wins } = activeConnections.get(key);
  games.set(idGame, { idGame, idPlayer: index });
  console.log('games', games);

  return games.get(idGame);
};
