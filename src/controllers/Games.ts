import { games } from '../controllers/Rooms_Ships.js';
import { players } from '../controllers/Players.js';

// const { index, _ } = activeConnections.get(key);

export const stateGames = new Map();

export const turn = (gameId: number) => {
  const { _, idFirstPlayer, idSecondPlayer } = games.get(gameId);

  const turnPlayer = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({ currentPlayer: idFirstPlayer }),
    id: 0,
  });
  return turnPlayer;
};

export const finishGame = (winPlayer: number) => {
  [...players.values()].forEach((player) => {
    const { index, name, password, wins } = player;
    if (index === winPlayer) player.wins++;
  });

  const dataWinPlayer = JSON.stringify({
    type: 'finish',
    data: JSON.stringify({ winPlayer }),
    id: 0,
  });
  return dataWinPlayer;
};
