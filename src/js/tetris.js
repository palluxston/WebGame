const grid = document.getElementById('tetris-grid');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const width = 10;
let score = 0;
let timerId;
let currentPosition = 4;
let currentRotation = 0;
let isGameOver = false;

// Create grid cells
const cells = [];
for (let i = 0; i < width * 20; i++) {
    const cell = document.createElement('div');
    cell.classList.add('tetris-cell');
    grid.appendChild(cell);
    cells.push(cell);
}

// Add bottom boundary for collision detection
for (let i = 0; i < width; i++) {
    const cell = document.createElement('div');
    cell.classList.add('occupied');
    grid.appendChild(cell);
    cells.push(cell);
}

// Tetrominoes
const tetrominoes = [
    [1, width + 1, width * 2 + 1, 2], // L-shape
    [0, width, width + 1, width * 2 + 1], // Z-shape
    [1, width, width + 1, width + 2], // T-shape
    [0, 1, width, width + 1], // Square
    [1, width + 1, width * 2 + 1, width * 3 + 1], // I-shape
];

let currentTetromino = [];
let nextTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];

// Draw and undraw tetromino
function draw() {
    currentTetromino.forEach((index) => {
        if (cells[currentPosition + index]) {
            cells[currentPosition + index].classList.add('active');
        }
    });
}

function undraw() {
    currentTetromino.forEach((index) => {
        if (cells[currentPosition + index]) {
            cells[currentPosition + index].classList.remove('active');
        }
    });
}

// Spawn a new Tetromino
function spawnTetromino() {
    currentTetromino = nextTetromino;
    nextTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    currentPosition = Math.floor(width / 2) - 1;
    currentRotation = 0;

    if (currentTetromino.some((index) => cells[currentPosition + index]?.classList.contains('occupied'))) {
        gameOver();
    } else {
        draw();
    }
}

// Move Tetromino down
function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    checkCollision();
}

// Collision Detection
function isCollision() {
    return currentTetromino.some(
        (index) =>
            !cells[currentPosition + index + width] || // Out of bounds
            cells[currentPosition + index + width].classList.contains('occupied')
    );
}

function checkCollision() {
    if (isCollision()) {
        currentPosition -= width; // Revert last move
        lockTetromino();
        spawnTetromino();
    }
}

// Lock Tetromino
function lockTetromino() {
    currentTetromino.forEach((index) => {
        cells[currentPosition + index].classList.add('occupied');
    });
    clearLines();
}

// Clear Lines
function clearLines() {
    for (let row = 0; row < cells.length - width; row += width) {
        const isFullRow = cells.slice(row, row + width).every((cell) => cell.classList.contains('occupied'));

        if (isFullRow) {
            cells.slice(row, row + width).forEach((cell) => cell.classList.remove('occupied', 'active'));

            const removedCells = cells.splice(row, width);
            removedCells.forEach(() => {
                const cell = document.createElement('div');
                cell.classList.add('tetris-cell');
                grid.prepend(cell);
                cells.unshift(cell);
            });

            score += 10;
            scoreDisplay.innerText = score;
        }
    }
}

// Game Over
function gameOver() {
    clearInterval(timerId);
    document.removeEventListener('keydown', control);
    gameOverDisplay.classList.remove('hidden');
    isGameOver = true;
}

// Move Tetromino
function moveLeft() {
    undraw();
    const isAtLeftEdge = currentTetromino.some((index) => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (isCollision()) currentPosition += 1;
    draw();
}

function moveRight() {
    undraw();
    const isAtRightEdge = currentTetromino.some((index) => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (isCollision()) currentPosition -= 1;
    draw();
}

function rotate() {
    undraw();
    currentRotation = (currentRotation + 1) % 4; // Rotate within bounds
    if (isCollision()) currentRotation = (currentRotation - 1 + 4) % 4; // Revert if collision occurs
    draw();
}

// Player Controls
function control(event) {
    if (isGameOver) return;
    if (event.key === 'ArrowLeft') moveLeft();
    if (event.key === 'ArrowRight') moveRight();
    if (event.key === 'ArrowDown') moveDown();
    if (event.key === 'ArrowUp') rotate();
}

document.addEventListener('keydown', control);

// Start Game
function startGame() {
    clearInterval(timerId);
    isGameOver = false;
    gameOverDisplay.classList.add('hidden');
    score = 0;
    scoreDisplay.innerText = score;
    cells.forEach((cell) => cell.classList.remove('active', 'occupied'));
    spawnTetromino();
    timerId = setInterval(moveDown, 1000);
}

startGame();
