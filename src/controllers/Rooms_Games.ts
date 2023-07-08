import { activeConnections } from './Players.js';
import { DataAddShips } from '../constants.js';

export const rooms = new Map();
const games = new Map();
const stateGames = new Map();

export const createRoom = (key: string): string => {
  let roomId = rooms.size > 0 ? Math.max(...rooms.keys()) + 1 : 1;
  const { index, name, password, wins } = activeConnections.get(key);
  rooms.set(roomId, { roomId, roomUsers: [{ name, index }] });
  // console.log('rooms', rooms);

  return updateRooms();
};

export const updateRooms = (): string =>
  JSON.stringify({
    type: 'update_room',
    data: JSON.stringify([...rooms.values()]),
    id: 0,
  });

export const createGame = (key: string): string => {
  let idGame = games.size > 0 ? Math.max(...games.keys()) + 1 : 1;

  const { index, name, password, wins } = activeConnections.get(key);
  games.set(idGame, { idGame, idPlayer: index });
  const activeGame = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify(games.get(idGame)),
    id: 0,
  });
  return activeGame;
};

export const addUserToRoom = (key: string, roomId: number) => {
  const { index, name, password, wins } = activeConnections.get(key);
  const idFirstPlayer = rooms.get(roomId).roomUsers[0].index;
  const idGame = [...games.values()].filter(
    ({ idGame, idPlayer }) => idPlayer === idFirstPlayer
  )[0].idGame;

  games.set(idGame.toString(), { idGame, idPlayer: index });

  rooms.delete(roomId);
  const GameForAdd = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify(games.get(idGame.toString())),
    id: 0,
  });
  // console.log('games', games);
  return GameForAdd;
};

export const addShips = (key: string, dataAddShips: DataAddShips) => {
  const { gameId, ships, indexPlayer } = dataAddShips;
  if (!stateGames.has(gameId)) {
    stateGames.set(gameId, {
      [key]: { ships, currentPlayerIndex: indexPlayer },
    });
  } else {
    stateGames.set(gameId, {
      ...stateGames.get(gameId),
      [key]: { ships, currentPlayerIndex: indexPlayer },
    });
    return stateGames.get(gameId);
  }
};
