import { RegPlayer, regRes } from '../constants.js';

const players = new Map();

export const activeConnections = new Map();

export const regPlayer = (data: RegPlayer, key: string): regRes => {
  let index = players.size + 1;
  let wins = 0;
  let errorText = '';
  if (players.has(data.name)) {
    const oldPlayer = players.get(data.name);
    if (oldPlayer.password !== data.password) {
      errorText = 'Invalid player password';
    }
  } else {
    players.set(data.name, { index, ...data, wins });
  }
  const player = players.get(data.name);
  activeConnections.set(key, { ...player });

  const dataRegRes = errorText
    ? {
        name: player.name,
        index: player.playerId,
        error: true,
        errorText: errorText,
      }
    : {
        name: player.name,
        index: player.playerId,
        error: false,
        errorText: '',
      };
  return dataRegRes;
};
