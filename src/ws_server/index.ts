import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { regPlayer, updateWinners, players } from '../controllers/Players.js';
import {
  rooms,
  games,
  createRoom,
  createGame,
  addUserToRoom,
} from '../controllers/Rooms_Ships.js';
import {
  stateGames,
  addShips,
  attack,
  randomAttack,
  checkAllShips,
} from '../controllers/Games.js';
import {
  updateRooms,
  turn,
  turnAfterAttack,
  finishGame,
} from '../controllers/Commands.js';
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
        const addUserToRoomRes = addUserToRoom(
          key,
          JSON.parse(msg.data).indexRoom
        );
        if (!addUserToRoomRes) {
          ws.send(updateRooms());
          ws.send(updateWinners());
        } else {
          ws.send(addUserToRoomRes!);
          ws.send(updateRooms());
        }

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
      case 'randomAttack':
      case 'attack':
        let data = JSON.parse(msg.data);

        if (msg.type === 'randomAttack') {
          const { x, y } = randomAttack(data);
          data = { ...data, x, y };
        }

        const activePlayer = games.get(data.gameId).activePlayer;
        if (activePlayer !== data.indexPlayer) return;

        const { data: dataAttack, nextPlayer } = attack(data);
        const winPlayer = checkAllShips(data);
        let finish = '';
        if (winPlayer) {
          finish = finishGame(winPlayer);
        }
        Object.entries(stateGames.get(data.gameId)).forEach((player) => {
          const key = player[0];

          if (!winPlayer) {
            for (let attackRes of dataAttack) {
              const dataAttackRes = {
                type: 'attack',
                data: JSON.stringify(attackRes),
                id: 0,
              };
              clients.get(key).ws.send(JSON.stringify(dataAttackRes));
            }
            clients.get(key).ws.send(turnAfterAttack(data.gameId, nextPlayer));
          } else {
            clients.get(key).ws.send(finish);
            clients.get(key).ws.send(updateRooms());
            clients.get(key).ws.send(updateWinners());
            stateGames.delete(data.gameId);
            games.delete(data.gameId);
          }
        });
        break;
      default:
        const errorMsg = JSON.stringify({
          type: 'error',
          data: 'unknown command',
          id: 0,
        });
        ws.send(errorMsg);
        break;
    }
  });

  ws.on('close', () => {
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
          if (game.idFirstPlayer !== idClosedPlayer) return;
          games.delete(game.idGame);

          if (stateGames.has(game.idGame)) {
            stateGames.delete(game.idGame);
          }
        } else {
          if (
            game.idFirstPlayer !== idClosedPlayer &&
            game.idSecondPlayer !== idClosedPlayer
          )
            return;
          const { idGame, idFirstPlayer, idSecondPlayer } = game;
          let idRemainingPlayer = 0;
          idFirstPlayer !== idClosedPlayer
            ? (idRemainingPlayer = idFirstPlayer)
            : (idRemainingPlayer = idSecondPlayer);
          if (stateGames.has(game.idGame)) {
            Object.entries(stateGames.get(idGame)).forEach((connection) => {
              if (connection[0] !== key) {
                const keyWinPlayer = connection[0];
                clients.get(keyWinPlayer).ws.send(updateRooms());

                idFirstPlayer === idClosedPlayer
                  ? clients
                      .get(keyWinPlayer)
                      .ws.send(finishGame(idSecondPlayer))
                  : clients
                      .get(keyWinPlayer)
                      .ws.send(finishGame(idFirstPlayer));
                clients.get(keyWinPlayer).ws.send(updateWinners());
              }
            });
            stateGames.delete(idGame);
          }
          games.delete(idGame);
          const wsRemainingPlayer = [...clients.values()].filter(
            ({ idPlayer }) => idPlayer === idRemainingPlayer
          )[0].ws;
          wsRemainingPlayer.send(updateRooms());
          wsRemainingPlayer.send(finishGame(idRemainingPlayer));
          wsRemainingPlayer.send(updateWinners());
        }
      });
    }
    clients.delete(key);
  });
});
