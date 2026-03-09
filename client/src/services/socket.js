/**
 * services/socket.js
 * Socket.io client singleton.
 * Connect once on login, disconnect on logout.
 */

import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'https://reelestate-beta.vercel.app';

let socket = null;

const socketService = {
  // Connect and register the user
  connect(userId) {
    if (socket?.connected) return;

    socket = io(SOCKET_URL, { autoConnect: true, transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket.emit('user:online', userId);
    });

    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Subscribe to incoming messages for a conversation
  onMessage(callback) {
    if (!socket) return;
    socket.on('message:receive', callback);
    return () => socket?.off('message:receive', callback); // Return cleanup
  },

  // Send a message via socket (real-time)
  sendMessage(data) {
    if (socket?.connected) {
      socket.emit('message:send', data);
    }
  },

  // Subscribe to online users list
  onUsersOnline(callback) {
    if (!socket) return;
    socket.on('users:online', callback);
    return () => socket?.off('users:online', callback);
  },

  getSocket() {
    return socket;
  },
};

export default socketService;
