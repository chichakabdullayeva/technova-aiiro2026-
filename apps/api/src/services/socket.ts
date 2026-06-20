import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '..';

export let io: SocketIOServer;
const userSockets = new Map<string, Set<string>>();

export function setupSocketHandlers(socketIO: SocketIOServer) {
  io = socketIO;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token as string;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`WS connected: ${user.email}`);

    if (!userSockets.has(user.id)) userSockets.set(user.id, new Set());
    userSockets.get(user.id)!.add(socket.id);

    socket.on('disconnect', () => {
      const sockets = userSockets.get(user.id);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(user.id);
      }
    });
  });
}

export function emitEvent(type: string, data: Record<string, unknown>) {
  if (io) {
    io.emit(type, { type, data, timestamp: new Date().toISOString() });
  }
}

export function emitToUser(userId: string, type: string, data: Record<string, unknown>) {
  const sockets = userSockets.get(userId);
  if (sockets && io) {
    sockets.forEach(sid => io.to(sid).emit(type, { type, data, timestamp: new Date().toISOString() }));
  }
}
