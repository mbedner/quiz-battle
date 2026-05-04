import { io, Socket } from 'socket.io-client';

/// <reference types="vite/client" />

// In production (Vercel), VITE_SERVER_URL points to the Railway backend.
// In local dev it's not set, so we fall back to '/' which Vite proxies to localhost:3001.
const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? '/';

export const socket: Socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});
