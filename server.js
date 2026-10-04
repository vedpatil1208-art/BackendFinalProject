require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { SECRET, logger } = require('./middleware');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gigconnect')
  .then(() => console.log('MongoDB connected'))
  .catch(e => { console.log(e.message); process.exit(1); });

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/api', require('./routes'));
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).json({ message: err.message });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.use((socket, next) => {
  try {
    socket.userId = jwt.verify(socket.handshake.auth.token, SECRET).id;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinConversation', (id) => {
    if (id.split('_').includes(socket.userId)) {
      socket.join(id);
      console.log('Joined conversation:', id);
    }
  });
});

server.listen(process.env.PORT || 4000, () => console.log('Server running'));