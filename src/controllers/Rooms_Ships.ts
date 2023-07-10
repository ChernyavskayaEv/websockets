import { activeConnections } from './Players.js';
import { DataAddShips } from '../constants.js';
import { stateGames } from '../controllers/Games.js';

export const rooms = new Map();
export const games = new Map();

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

  const { index, _ } = activeConnections.get(key);
  games.set(idGame, { idGame, idFirstPlayer: index });
  const activeGame = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({ idGame, idPlayer: index }),
    id: 0,
  });
  // console.log('game', games);

  return activeGame;
};

export const addUserToRoom = (key: string, roomId: number) => {
  const { index, _ } = activeConnections.get(key);
  const idCurrentPlayer = rooms.get(roomId).roomUsers[0].index;
  const idGame = [...games.values()].filter(
    ({ _, idFirstPlayer }) => idFirstPlayer === idCurrentPlayer
  )[0].idGame;

  games.set(idGame, { ...games.get(idGame), idSecondPlayer: index });
  // console.log('game', games);

  rooms.delete(roomId);
  const GameForAdd = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({ idGame, idPlayer: index }),
    id: 0,
  });
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
    // console.log('stateGames', stateGames);
    // console.log('rooms', rooms);
    // console.log('game', games);

    return gameId;
  }
};
