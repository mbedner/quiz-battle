import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { networkInterfaces } from 'os';
import path from 'path';
import { GameEngine } from './gameEngine';

const app = express();
app.use(cors({ origin: '*' }));

// In production the client is on Vercel (separate origin), so we don't
// serve static files from the server. In local dev we still serve them
// so the old single-process workflow keeps working.
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const CLIENT_DIST = path.join(__dirname, '../../client/dist');
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const PORT = Number(process.env.PORT) || 3001;

// PUBLIC_URL is set by Railway (or manually) so the server knows its own address.
// Falls back to local IP for dev.
const serverUrl = process.env.PUBLIC_URL ?? `http://${getLocalIP()}:${PORT}`;

const engine = new GameEngine(io, serverUrl);

io.on('connection', socket => {
  engine.handleConnection(socket);
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮 Kids Battle Quiz\n`);
  console.log(`  Server:  ${serverUrl}`);
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
