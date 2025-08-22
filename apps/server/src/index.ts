import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game/GameManager';
import { ClientToServerEvents, ServerToClientEvents } from '@least-count/shared';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://least-count.netlify.app'] // Your actual Netlify domain
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Socket.io server with CORS
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://least-count.netlify.app'] // Your actual Netlify domain
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }
});

const gameManager = new GameManager(io);

// Basic health check endpoint
app.get('/health',( _req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Room management
  socket.on('room:create', (data) => {
    gameManager.createRoom(socket, data);
  });

  socket.on('room:join', (data) => {
    gameManager.joinRoom(socket, data);
  });

  socket.on('game:start', (data) => {
    gameManager.startGame(socket, data);
  });

  socket.on('room:end', (data) => {
    gameManager.endRoom(socket, data);
  });

  socket.on('room:updateRules', (data) => {
    gameManager.updateRules(socket, data);
  });

  // Turn actions
  socket.on('turn:discard', (data) => {
    gameManager.handleDiscard(socket, data);
  });

  socket.on('turn:drawStock', (data) => {
    gameManager.handleDrawStock(socket, data);
  });

  socket.on('turn:drawDiscard', (data) => {
    gameManager.handleDrawDiscard(socket, data);
  });

  socket.on('turn:move', (data) => {
    gameManager.handleMove(socket, data);
  });

  socket.on('turn:show', (data) => {
    gameManager.handleShow(socket, data);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Least Count server running on port ${PORT}`);
  console.log(`📱 Client should connect to: http://localhost:${PORT}`);
});
