import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws, request, client) => {
  console.log('connection');

  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log('received: %s', data);

    const msg = JSON.parse(data);
    console.log('msg', msg);

    const { name } = JSON.parse(msg.data);
    const res = JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name,
        error: false,
      }),
      id: 0,
    });
    console.log('res', res);

    ws.send(res);
  });
});
