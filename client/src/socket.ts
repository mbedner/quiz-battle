import { io, Socket } from 'socket.io-client';

/// <reference types="vite/client" />

export const socket: Socket = io('/', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});
