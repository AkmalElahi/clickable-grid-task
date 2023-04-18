const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const ROWS = 50;
const COLS = 80;
let grid = [];
let undoStack = [];

function loadGridfromMemory() {
  fs.readFile('data', { encoding: 'utf-8' }, (err, data) => {
    if (!err) {
      const dataArray = data.split(',');
      const twoDArray = new Array(ROWS)
        .fill()
        .map(() => new Array(COLS).fill());
      dataArray.forEach((value, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        twoDArray[row][col] = value;
      });

      grid = twoDArray;
    }
  });
}

loadGridfromMemory();

// Create grid
for (let i = 0; i < ROWS; i++) {
  let row = [];
  for (let j = 0; j < COLS; j++) {
    row.push("1");
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
    fs.writeFile('data', grid.toString(), () => {
      socket.broadcast.emit('update', data);
      undoStack = data.undoStack;
    });
    // Broadcast updated grid to all clients
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
