import {
  Attack,
  DataAddShips,
  StateGame,
  AttackRes,
  Point,
} from '../constants.js';
import { Game } from './GameModel.js';

export const stateGames = new Map();

export const addShips = (
  key: string,
  dataAddShips: DataAddShips
): number | undefined => {
  const { gameId, ships, indexPlayer } = dataAddShips;
  if (!stateGames.has(gameId)) {
    const game = new Game(ships);
    stateGames.set(gameId, {
      [key]: { game, player: indexPlayer },
    });
  } else {
    const game = new Game(ships);
    stateGames.set(gameId, {
      ...stateGames.get(gameId),
      [key]: { game, player: indexPlayer },
    });
    // console.log('stateGames', stateGames);

    return gameId;
  }
};

export const attack = ({ x, y, gameId, indexPlayer }: Attack) => {
  const stateGame: StateGame = stateGames.get(gameId);
  const shot = { x, y };
  let playerSetAttack = indexPlayer;
  let playerGetAttack;
  let attackRes: { nextPlayer: number; data: AttackRes[] } = {
    nextPlayer: 0,
    data: [],
  };

  Object.entries(stateGame).forEach(([key, { game, player }]) => {
    if (player !== indexPlayer) {
      playerGetAttack = player;
      const shotResult = game.checkShot(shot);
      game.fillField(shot);
      if (shotResult === 'miss') {
        attackRes.nextPlayer = playerGetAttack;
        attackRes.data.push({
          position: shot,
          currentPlayer: indexPlayer,
          status: shotResult,
        });
      }
      if (shotResult === 'hit') {
        attackRes.nextPlayer = playerSetAttack;
        const result = game.handleAttack(shot);
        if (result) {
          // console.log('killed', game.handleAttack(shot));
          const [killed, miss] = game.handleAttack(shot);
          killed.forEach((k: Point) => {
            attackRes.data.push({
              position: k,
              currentPlayer: indexPlayer,
              status: 'killed',
            });
          });
          miss.forEach((k: Point) => {
            attackRes.data.push({
              position: k,
              currentPlayer: indexPlayer,
              status: 'miss',
            });
          });
        } else {
          attackRes.data.push({
            position: shot,
            currentPlayer: indexPlayer,
            status: shotResult,
          });
        }
      }
    }
  });

  return attackRes;
};

export const checkAllShips = ({
  gameId,
  indexPlayer,
}: Attack): number | undefined => {
  const stateGame: StateGame = stateGames.get(gameId);
  let finishGame = Object.values(stateGame).filter(
    ({ game, player }) => player !== indexPlayer && game.checkAllShips()
  );

  if (finishGame.length > 0) return indexPlayer;
  return;
};
