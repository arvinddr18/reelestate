import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:10000';

const socketService = {
  socket: null,

  connect(userId) {
    if (!userId) return;

    // If already connected, just announce online
    if (this.socket?.connected) {
      this.socket.emit('iam_online', String(userId));
      return;
    }

    // Create real socket connection
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // As soon as connected, announce online
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.socket.emit('iam_online', String(userId));
    });

    // On reconnect, announce online again
    this.socket.on('reconnect', () => {
      this.socket.emit('iam_online', String(userId));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
};

export default socketService;