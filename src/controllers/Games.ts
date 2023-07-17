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
            game.fillField(k);
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

export const randomAttack = ({ gameId, indexPlayer }: Attack): Point => {
  const stateGame: StateGame = stateGames.get(gameId);
  const { game } = Object.entries(stateGame).filter(
    ([key, { game, player }]) => player !== indexPlayer
  )[0][1];

  const freePoint = game.getFreePoint();
  const min = 0;
  const max = freePoint.length - 1;
  const randomIndexPoint = Math.floor(Math.random() * (max - min + 1)) + min;
  return freePoint[randomIndexPoint];
};
