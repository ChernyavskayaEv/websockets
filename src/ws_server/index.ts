import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import {
  regPlayer,
  updateWinners,
  activeConnections,
  players,
} from '../controllers/Players.js';
import {
  rooms,
  games,
  updateRooms,
  createRoom,
  createGame,
  addUserToRoom,
  addShips,
} from '../controllers/Rooms_Ships.js';
import { stateGames, turn, finishGame } from '../controllers/Games.js';

const WSS_PORT = 3000;

const wss = new WebSocketServer({ port: WSS_PORT });
console.log(`Websocket was created at port ${WSS_PORT}`);

const clients = new Map();

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
        // console.log('data', JSON.parse(msg.data));
        ws.send(addUserToRoom(key, JSON.parse(msg.data).indexRoom));
        ws.send(updateRooms());
        break;
      case 'add_ships':
        const gameId = addShips(key, JSON.parse(msg.data));
        const stateGame = stateGames.get(gameId);

        if (stateGame) {
          Object.entries(stateGame).forEach(([key, value]) => {
            let startGame = JSON.stringify({
              type: 'start_game',
              data: JSON.stringify(value),
              id: 0,
            });
            clients.get(key).send(startGame);
            clients.get(key).send(turn(gameId!));
          });
        }
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    if (activeConnections.size > 0) {
      const idClosedPlayer = activeConnections.get(key).index;

      if (rooms) {
        [...rooms.values()].forEach((room) => {
          if (room.roomUsers[0].index === idClosedPlayer) {
            rooms.delete(room.roomId);
          }
        });
      }

      if (games) {
        [...games.values()].forEach((game) => {
          if (Object.keys(game).length === 2) {
            const { idGame, _ } = game;
            stateGames.delete(idGame);
            games.delete(idGame);
          } else {
            const { idGame, idFirstPlayer, idSecondPlayer } = game;
            Object.entries(stateGames.get(idGame)).forEach((connection) => {
              if (connection[0] !== key) {
                const keyWinPlayer = connection[0];
                idFirstPlayer === idClosedPlayer
                  ? clients.get(keyWinPlayer).send(finishGame(idSecondPlayer))
                  : clients.get(keyWinPlayer).send(finishGame(idFirstPlayer));
                clients.get(keyWinPlayer).send(updateWinners());
              }
            });
            stateGames.delete(idGame);
            games.delete(idGame);
          }
        });
      }
      activeConnections.delete(key);
    }
    clients.delete(key);

    // console.log('activeConnections', activeConnections);
    // console.log('players', players);
    // console.log('rooms', rooms);
    // console.log('stateGames', stateGames);
    // console.log('games', games);
  });
});
