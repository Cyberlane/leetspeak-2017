const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function heartbeat() {
  this.isAlive = true;
}

let lastMessage = 1;

const broadcast = (message) => {
  wss.clients
    .forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      if (client.url === '/') return;
      client.send(message);
    });
};

wss.on('connection', (ws, req) => {
  console.log(`new connection from '${req.url}'`);
  ws.isAlive = true;
  ws.url = req.url;
  ws.on('pong', heartbeat);
  ws.on('message', (message) => {
    console.log(`received '${message} from ${req.url}'`);
    lastMessage = message;
    broadcast(message);
  });
  broadcast(lastMessage);
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);

app.use('/', express.static(path.join(__dirname, '../compiled/')));
app.use('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '../compiled/notes.html'));
});

server.listen(1337);

