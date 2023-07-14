import { clients } from '../ws_server/index.js';

export const rooms = new Map();
export const games = new Map();

export const createRoom = (key: string): string => {
  let roomId = rooms.size > 0 ? Math.max(...rooms.keys()) + 1 : 1;
  const { idPlayer, name } = clients.get(key);
  rooms.set(roomId, { roomId, roomUsers: [{ name, index: idPlayer }] });
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
  const { idPlayer } = clients.get(key);

  games.set(idGame, { idGame, idFirstPlayer: idPlayer });
  const activeGame = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({ idGame, idPlayer: idPlayer }),
    id: 0,
  });
  // console.log('game', games);

  return activeGame;
};

export const addUserToRoom = (key: string, roomId: number) => {
  const { idPlayer } = clients.get(key);
  const idCurrentPlayer = rooms.get(roomId).roomUsers[0].index;
  const idGame = [...games.values()].filter(
    ({ idFirstPlayer }) => idFirstPlayer === idCurrentPlayer
  )[0].idGame;
  // console.log('idGame', idGame);

  games.set(idGame, { ...games.get(idGame), idSecondPlayer: idPlayer });
  // console.log('game', games);

  rooms.delete(roomId);
  const GameForAdd = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({ idGame, idPlayer }),
    id: 0,
  });

  return GameForAdd;
};
