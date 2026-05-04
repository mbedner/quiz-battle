import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { networkInterfaces } from 'os';
import path from 'path';
import { GameEngine } from './gameEngine';

const app = express();
app.use(cors());

const CLIENT_DIST = path.join(__dirname, '../../client/dist');
app.use(express.static(CLIENT_DIST));
app.get('*', (_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const PORT = Number(process.env.PORT) || 3001;
const localIP = getLocalIP();
const serverUrl = `http://${localIP}:${PORT}`;

const engine = new GameEngine(io, serverUrl);

io.on('connection', socket => {
  engine.handleConnection(socket);
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮 Kids Battle Quiz\n`);
  console.log(`  Host screen:  http://localhost:${PORT}`);
  console.log(`  Player join:  ${serverUrl}/join`);
  console.log(`\n  Share the QR on the host screen for players to join!\n`);
});

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
