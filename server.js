const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const ROWS = 50;
const COLS = 80;
let grid = [];
let undoStack = [];

// Create grid
for (let i = 0; i < ROWS; i++) {
  let row = [];
  for (let j = 0; j < COLS; j++) {
    row.push('green');
  }
  grid.push(row);
}

// Serve static files
app.use(express.static(__dirname + '/public'));

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Send initial grid data to new user
  socket.emit('init', { grid, undoStack });

  // Handle grid updates
  socket.on('update', (data) => {
    // Update grid with new data
    grid[data.row][data.col] = data.color;
    // Broadcast updated grid to all clients
    socket.broadcast.emit('update', data);
    undoStack = data.undoStack;
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
