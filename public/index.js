const ROWS = 50;
const COLS = 80;

let grid = [];
let undoStack = [];

// Create grid
let container = document.getElementById('grid-container');
for (let i = 0; i < ROWS; i++) {
  let row = [];
  for (let j = 0; j < COLS; j++) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.row = i;
    cell.dataset.col = j;
    cell.style.backgroundColor = 'green';
    cell.addEventListener('click', () => {
      let color = cell.style.backgroundColor === 'green' ? 'red' : 'green';
      cell.style.backgroundColor = color;
      undoStack.push({
        row: i,
        col: j,
        color: color === 'green' ? '1' : '0',
      });
      socket.emit('update', {
        row: i,
        col: j,
        color: color === 'green' ? '1' : '0',
        undoStack,
      });
    });
    row.push(cell);
    container.appendChild(cell);
  }
  grid.push(row);
  container.appendChild(document.createElement('br'));
}

// Connect to server
const socket = io();

// Handle initial grid data
socket.on('init', (data) => {
  grid = data.grid;
  undoStack = data.undoStack || [];
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let cell = container.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      cell.style.backgroundColor = grid[i][j] === '1' ? 'green' : 'red';
    }
  }
});

// Handle grid updates
socket.on('update', (data) => {
  grid[data.row][data.col] = data.color;
  const color = grid[data.row][data.col] === '1' ? 'green' : 'red';
  let cell = container.querySelector(
    `[data-row="${data.row}"][data-col="${data.col}"]`
  );
  undoStack = data.undoStack;
  cell.style.backgroundColor = color;
});

// Handle undo button
let undoButton = document.getElementById('undo-button');
undoButton.addEventListener('click', () => {
  if (undoStack.length > 0) {
    let lastUpdate = undoStack.pop();
    let color = lastUpdate.color === '1' ? 'red' : 'green';
    let cell = container.querySelector(
      `[data-row="${lastUpdate.row}"][data-col="${lastUpdate.col}"]`
    );
    cell.style.backgroundColor = color;
    grid[lastUpdate.row][lastUpdate.col] = color;
    socket.emit('update', {
      row: lastUpdate.row,
      col: lastUpdate.col,
      color: lastUpdate.color,
      undoStack,
    });
  }
});
