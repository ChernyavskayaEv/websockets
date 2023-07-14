import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { regPlayer, updateWinners, players } from '../controllers/Players.js';
import {
  rooms,
  games,
  updateRooms,
  createRoom,
  createGame,
  addUserToRoom,
} from '../controllers/Rooms_Ships.js';
import {
  stateGames,
  addShips,
  attack,
  checkAllShips,
} from '../controllers/Games.js';
import { turn, turnAfterAttack, finishGame } from '../controllers/Commands.js';
import { StateGame } from '../constants.js';

const WSS_PORT = 3000;

const wss = new WebSocketServer({ port: WSS_PORT });
console.log(`Websocket was created at port ${WSS_PORT}`);

export const clients = new Map();

wss.on('connection', (ws, req) => {
  const key = randomUUID();
  clients.set(key, ws);

  ws.on('error', console.error);

  ws.on('message', (messageAsString) => {
    const msg = JSON.parse(messageAsString.toString());
    const sendType = msg.type;
    switch (sendType) {
      case 'reg':
        const dataRegRes = regPlayer(JSON.parse(msg.data), key);
        ws.send(dataRegRes);
        ws.send(updateWinners());
        if (rooms.size > 0) ws.send(updateRooms());
        break;
      case 'create_room':
        ws.send(createGame(key));
        ws.send(createRoom(key));
        break;
      case 'add_user_to_room':
        ws.send(addUserToRoom(key, JSON.parse(msg.data).indexRoom));
        ws.send(updateRooms());
        break;
      case 'add_ships':
        const gameId = addShips(key, JSON.parse(msg.data));
        const stateGame: StateGame | undefined = stateGames.get(gameId);
        if (stateGame) {
          Object.entries(stateGame).forEach(([key, { game, player }]) => {
            let startGameRes = JSON.stringify({
              type: 'start_game',
              data: JSON.stringify({
                ships: game.ships,
                currentPlayerIndex: player,
              }),
              id: 0,
            });
            clients.get(key).ws.send(startGameRes);
            clients.get(key).ws.send(turn(gameId!));
          });
        }
        break;
      case 'attack':
        const data = JSON.parse(msg.data);

        Object.entries(stateGames.get(data.gameId)).forEach((player) => {
          const key = player[0];
          const { data: dataAttack, nextPlayer } = attack(data);
          // console.log('dataAttack', dataAttack);

          if (!checkAllShips(data)) {
            for (let attackRes of dataAttack) {
              const dataAttackRes = {
                type: 'attack',
                data: JSON.stringify(attackRes),
                id: 0,
              };
              clients.get(key).ws.send(JSON.stringify(dataAttackRes));
            }
            clients.get(key).ws.send(turnAfterAttack(nextPlayer));
          } else {
            const finish = finishGame(nextPlayer);

            clients.get(key).ws.send(finish);
            clients.get(key).ws.send(updateRooms());
            clients.get(key).ws.send(updateWinners());
          }
        });
        // console.log(attack(JSON.parse(msg.data)));

        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    console.log('players', players);
    console.log('rooms', rooms);
    console.log('stateGames', stateGames);
    console.log('games', games);
    const idClosedPlayer = clients.get(key).idPlayer;

    if (rooms) {
      [...rooms.values()].forEach((room) => {
        if (room.roomUsers[0].index === idClosedPlayer) {
          rooms.delete(room.roomId);
        }
      });
    }

    if (games.size > 0) {
      [...games.values()].forEach((game) => {
        if (Object.keys(game).length === 2) {
          const { idGame, idFirstPlayer } = game;
          if (idFirstPlayer === idClosedPlayer) {
            games.delete(idGame);

            if (stateGames.has(idGame)) {
              stateGames.delete(idGame);
            }
          }
        } else {
          const { idGame, idFirstPlayer, idSecondPlayer } = game;
          Object.entries(stateGames.get(idGame)).forEach((connection) => {
            if (connection[0] !== key) {
              const keyWinPlayer = connection[0];
              idFirstPlayer === idClosedPlayer
                ? clients.get(keyWinPlayer).ws.send(finishGame(idSecondPlayer))
                : clients.get(keyWinPlayer).ws.send(finishGame(idFirstPlayer));
              clients.get(keyWinPlayer).ws.send(updateRooms());
              clients.get(keyWinPlayer).ws.send(updateWinners());
            }
          });
          stateGames.delete(idGame);
          games.delete(idGame);
        }
      });
    }

    clients.delete(key);

    console.log('players', players);
    console.log('rooms', rooms);
    console.log('stateGames', stateGames);
    console.log('games', games);
  });
});
