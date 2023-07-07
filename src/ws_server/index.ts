import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { regPlayer } from '../controllers/Players.js';

const WSS_PORT = 3000;

const wss = new WebSocketServer({ port: WSS_PORT });
console.log(`Websocket was created at port ${WSS_PORT}`);

wss.on('connection', (ws, req) => {
  const key = randomUUID();
  console.log('connection', key);

  ws.on('error', console.error);

  ws.on('message', (messageAsString) => {
    console.log('received: %s', messageAsString);
    const msg = JSON.parse(messageAsString.toString());
    // console.log('data', JSON.parse(msg.data));

    const sendType = msg.type;
    switch (sendType) {
      case 'reg':
        const dataRegRes = regPlayer(JSON.parse(msg.data), key);
        const allRegRes = JSON.stringify({
          type: 'reg',
          data: JSON.stringify(dataRegRes),
          id: 0,
        });
        ws.send(allRegRes);
        break;

      default:
        break;
    }
  });
});
