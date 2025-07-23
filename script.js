const gridSize = 4;
let board = [];
let score = 0;
let moves = 0;
let combo = 0;
let timer = 0;
let timerInterval;
let gameOver = false;

const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const comboDisplay = document.getElementById("combo");
const restartBtn = document.getElementById("restart-btn");
const gameOverText = document.getElementById("game-over");

function createBoard() {
  board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  addRandomTile();
  addRandomTile();
}

function drawBoard() {
  grid.innerHTML = "";
  board.flat().forEach((val, idx) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = val > 0 ? val : "";
    tile.style.background = getTileColor(val);
    grid.appendChild(tile);
  });
}

function getTileColor(val) {
  const colors = {
    0: "#333", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
    16: "#f59563", 32: "#f67c5f", 64: "#f65e3b",
    128: "#edcf72", 256: "#edcc61", 512: "#edc850",
    1024: "#edc53f", 2048: "#edc22e"
  };
  return colors[val] || `hsl(${Math.random() * 360}, 70%, 60%)`; // evolve color
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  let arr = row.filter(val => val);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      combo += 1;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(val => val);
  while (arr.length < gridSize) arr.push(0);
  return arr;
}

function rotateBoard() {
  const newBoard = board[0].map((_, i) => board.map(row => row[i]));
  board = newBoard;
}

function move(dir) {
  if (gameOver) return;
  let oldBoard = JSON.stringify(board);
  if (dir === "left") {
    for (let r = 0; r < gridSize; r++) board[r] = slide(board[r]);
  } else if (dir === "right") {
    for (let r = 0; r < gridSize; r++) board[r] = slide(board[r].reverse()).reverse();
  } else if (dir === "up") {
    rotateBoard();
    for (let r = 0; r < gridSize; r++) board[r] = slide(board[r]);
    rotateBoard();
    rotateBoard();
    rotateBoard();
  } else if (dir === "down") {
    rotateBoard();
    for (let r = 0; r < gridSize; r++) board[r] = slide(board[r].reverse()).reverse();
    rotateBoard();
    rotateBoard();
    rotateBoard();
  }

  if (oldBoard !== JSON.stringify(board)) {
    addRandomTile();
    moves++;
    updateUI();
  }

  if (!hasMoves()) {
    clearInterval(timerInterval);
    gameOver = true;
    gameOverText.classList.remove("hidden");
  }
}

function hasMoves() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) return true;
      if (c < gridSize - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < gridSize - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function updateUI() {
  drawBoard();
  scoreDisplay.textContent = score;
  movesDisplay.textContent = moves;
  comboDisplay.textContent = combo > 1 ? `🔥 Combo x${combo}` : "";
  if (combo > 1) {
    anime({
      targets: "#combo",
      scale: [1, 1.5, 1],
      duration: 500,
      easing: "easeInOutQuad"
    });
  }
  combo = 0;
}

function restartGame() {
  score = 0;
  moves = 0;
  timer = 0;
  gameOver = false;
  gameOverText.classList.add("hidden");
  clearInterval(timerInterval);
  startTimer();
  createBoard();
  updateUI();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
  }, 1000);
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      move("left");
      break;
    case "ArrowRight":
    case "d":
      move("right");
      break;
    case "ArrowUp":
    case "w":
      move("up");
      break;
    case "ArrowDown":
    case "s":
      move("down");
      break;
  }
});

restartBtn.onclick = restartGame;

restartGame();
