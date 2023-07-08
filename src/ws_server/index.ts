import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { regPlayer, updateWinners } from '../controllers/Players.js';
import {
  rooms,
  updateRooms,
  createRoom,
  createGame,
  addUserToRoom,
  addShips,
} from '../controllers/Rooms_Games.js';

const WSS_PORT = 3000;

const wss = new WebSocketServer({ port: WSS_PORT });
console.log(`Websocket was created at port ${WSS_PORT}`);

const clients = new Map();

wss.on('connection', (ws, req) => {
  const key = randomUUID();
  clients.set(key, ws);

  ws.on('error', console.error);

  ws.on('message', (messageAsString) => {
    // console.log('received: %s', messageAsString);
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
        // console.log('data', JSON.parse(msg.data));
        const stateGame = addShips(key, JSON.parse(msg.data));
        if (stateGame) {
          console.log();

          Object.entries(stateGame).forEach(([key, value]) => {
            let startGame = JSON.stringify({
              type: 'start_game',
              data: JSON.stringify(value),
              id: 0,
            });
            clients.get(key).send(startGame);
          });
        }
        break;
      default:
        break;
    }
  });
});
