import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.URL,  // Make sure this is set to the correct frontend URL
    methods: ['GET', 'POST'],
  }
});

const userSocketMap = {}; // this map stores socket id corresponding to the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Handle socket connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // If the userId is passed, store the mapping of userId -> socketId
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
  }

  // Emit online users
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Listen for disconnect events
  socket.on('disconnect', () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User disconnected: ${userId}`);
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, server, io };
