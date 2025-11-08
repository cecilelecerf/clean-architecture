import { io } from 'socket.io-client';

export const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('🔗 Connecté :', socket.id);
});

socket.emit('send_message', { text: 'Hello depuis le client 👋' });
