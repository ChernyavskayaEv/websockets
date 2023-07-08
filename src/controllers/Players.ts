import { RegPlayer } from '../constants.js';

const players = new Map();

export const activeConnections = new Map();

export const regPlayer = (data: RegPlayer, key: string): string => {
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
  // console.log('activeConnections', activeConnections);
  // console.log('players', players);

  const dataRegRes = errorText
    ? {
        name: player.name,
        index: index,
        error: true,
        errorText: errorText,
      }
    : {
        name: player.name,
        index: index,
        error: false,
        errorText: '',
      };

  const allRegRes = JSON.stringify({
    type: 'reg',
    data: JSON.stringify(dataRegRes),
    id: 0,
  });
  return allRegRes;
};

export const updateWinners = (): string => {
  const winners = [...players.values()].map(({ i, name, p, wins }) => ({
    name,
    wins,
  }));
  const winnersRes = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0,
  });
  return winnersRes;
};
