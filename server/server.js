require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PB_URL = process.env.PB_URL || 'http://localhost:8090';

const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

const chatRooms = new Map();
const userSockets = new Map();

const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(socketId) {
  const now = Date.now();
  const userLimit = rateLimits.get(socketId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  userLimit.count++;
  rateLimits.set(socketId, userLimit);
  
  return userLimit.count <= RATE_LIMIT_MAX;
}

function sanitizeString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').slice(0, maxLength).trim();
}

function isValidRequestId(requestId) {
  return typeof requestId === 'string' && requestId.length > 0 && requestId.length <= 100;
}

function isValidMessage(message) {
  return typeof message === 'string' && message.length > 0 && message.length <= 1000;
}

async function getMessagesFromPB(requestId) {
  try {
    const response = await axios.get(
      `${PB_URL}/api/collections/messages/records`,
      {
        params: {
          filter: `request_id="${requestId}"`,
          sort: 'timestamp',
          perPage: 200
        }
      }
    );
    return response.data.items || [];
  } catch (error) {
    console.error('[PB] Failed to get messages:', error.message);
    return [];
  }
}

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join_chat', async (data) => {
    if (!data || !isValidRequestId(data.requestId)) {
      console.log(`[Socket] Invalid requestId from ${socket.id}`);
      return;
    }

    const requestId = sanitizeString(data.requestId);
    
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    socket.join(requestId);

    socket.userId = sanitizeString(data.userId || 'unknown', 100);
    socket.userName = sanitizeString(data.userName || 'Anonymous', 50);
    socket.userEmail = sanitizeString(data.userEmail || '', 100);
    userSockets.set(socket.userId, socket.id);

    if (!chatRooms.has(requestId)) {
      chatRooms.set(requestId, new Set());
    }
    chatRooms.get(requestId).add(socket.id);

    console.log(`[Socket] ${socket.userName} (${socket.userId}) joined room ${requestId}`);
    console.log(`[Socket] Room ${requestId} now has ${chatRooms.get(requestId).size} members`);

    socket.to(requestId).emit('user_joined', {
      userId: socket.userId,
      userName: socket.userName,
      userEmail: socket.userEmail,
      message: `${socket.userName} joined the chat`
    });

    const previousMessages = await getMessagesFromPB(requestId);
    console.log(`[Socket] Sending ${previousMessages.length} previous messages to ${socket.userName}`);
    socket.emit('previous_messages', { requestId, messages: previousMessages });
    socket.emit('joined', { requestId, success: true });
  });

  socket.on('send_message', async (data) => {
    if (!checkRateLimit(socket.id)) {
      console.log(`[Socket] Rate limit exceeded for ${socket.id}`);
      return;
    }

    if (!data || !isValidRequestId(data.requestId) || !isValidMessage(data.message)) {
      console.log(`[Socket] Invalid message data from ${socket.id}`);
      console.log(`[Socket] Data received:`, JSON.stringify(data));
      return;
    }

    const requestId = sanitizeString(data.requestId);
    const message = sanitizeString(data.message, 1000);

    console.log(`[Socket] Broadcasting message in room ${requestId} from ${socket.userName}`);
    console.log(`[Socket] Room members: ${chatRooms.get(requestId)?.size || 0}`);

    const messageData = {
      id: data.clientMessageId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientMessageId: data.clientMessageId,
      requestId,
      senderId: socket.userId || 'unknown',
      senderName: socket.userName || 'Anonymous',
      senderEmail: socket.userEmail || '',
      message,
      text: message,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    console.log(`[Socket] Message: "${message.substring(0, 50)}"`);
    io.to(requestId).emit('receive_message', messageData);
  });

  socket.on('typing_start', (data) => {
    if (!isValidRequestId(data?.requestId)) return;
    const requestId = sanitizeString(data.requestId);
    socket.to(requestId).emit('user_typing', { userName: socket.userName || 'Someone', isTyping: true });
  });

  socket.on('typing_stop', (data) => {
    if (!isValidRequestId(data?.requestId)) return;
    const requestId = sanitizeString(data.requestId);
    socket.to(requestId).emit('user_typing', { userName: socket.userName || 'Someone', isTyping: false });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);

    if (socket.userId) {
      userSockets.delete(socket.userId);
    }

    chatRooms.forEach((sockets, roomId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        socket.to(roomId).emit('user_left', {
          userId: socket.userId,
          userName: socket.userName,
          message: `${socket.userName || 'Someone'} left the chat`
        });
        if (sockets.size === 0) {
          chatRooms.delete(roomId);
        }
      }
    });

    rateLimits.delete(socket.id);
  });

  socket.on('leave_chat', (data) => {
    if (!isValidRequestId(data?.requestId)) return;
    const requestId = sanitizeString(data.requestId);

    socket.leave(requestId);

    if (chatRooms.has(requestId)) {
      chatRooms.get(requestId).delete(socket.id);
      socket.to(requestId).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName,
        message: `${socket.userName || 'Someone'} left the chat`
      });
      if (chatRooms.get(requestId).size === 0) {
        chatRooms.delete(requestId);
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: chatRooms.size,
    connectedUsers: userSockets.size
  });
});

app.get('/pocketbase/health', async (req, res) => {
  try {
    await axios.get(`${PB_URL}/api/health`);
    res.json({ status: 'ok', pocketbase: 'connected' });
  } catch {
    res.json({ status: 'error', pocketbase: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`CORS enabled for: ${CLIENT_URL}`);
  console.log(`PocketBase URL: ${PB_URL}`);
  console.log(`=================================\n`);
});
