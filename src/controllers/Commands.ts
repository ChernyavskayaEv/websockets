import { games } from './Rooms_Ships.js';
import { players } from './Players.js';

export const turn = (gameId: number): string => {
  const { idFirstPlayer } = games.get(gameId);

  const turnPlayer = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({ currentPlayer: idFirstPlayer }),
    id: 0,
  });
  return turnPlayer;
};

export const turnAfterAttack = (idPlayer: number): string => {
  const turnPlayer = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({ currentPlayer: idPlayer }),
    id: 0,
  });
  return turnPlayer;
};

export const finishGame = (winPlayer: number): string => {
  [...players.values()].forEach((player) => {
    const { index } = player;
    if (index === winPlayer) player.wins++;
  });

  const dataWinPlayer = JSON.stringify({
    type: 'finish',
    data: JSON.stringify({ winPlayer }),
    id: 0,
  });
  return dataWinPlayer;
};
