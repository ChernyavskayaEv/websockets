import { RegPlayer } from '../constants.js';
import { clients } from '../ws_server/index.js';

export const players = new Map();

export const regPlayer = (data: RegPlayer, key: string): string => {
  let index = players.size + 1;
  let wins = 0;
  let errorText = '';
  if (players.has(data.name)) {
    const oldPlayer = players.get(data.name);
    if (oldPlayer.password !== data.password) {
      errorText = 'Invalid password';
    }
  } else {
    players.set(data.name, { index, ...data, wins });
  }
  const player = players.get(data.name);
  clients.set(key, {
    ws: clients.get(key),
    idPlayer: player.index,
    name: player.name,
  });
  // console.log('players', players);
  // console.log('clients', clients);

  const dataRegRes = errorText
    ? {
        name: player.name,
        index: player.index,
        error: true,
        errorText: errorText,
      }
    : {
        name: player.name,
        index: player.index,
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
  const winners = [...players.values()].map(({ name, wins }) => ({
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
