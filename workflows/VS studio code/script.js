const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = 750;
canvas.height = 750;

let player = { x: 50, y: 50, size: 35 };
let berries = [];
let powerUps = [];
let chasers = [];
let obstacles = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameInterval;
let difficultyLevel = 1;
let isGameOver = false;

const backgroundMusic = new Audio('Pan Sever.mp3');
const gameOverSound = new Audio('gamover.mp3'); 
backgroundMusic.loop = true;  
backgroundMusic.volume = 0.5; 

const playerImg = new Image();
const berryImg = new Image();
const chaserImg = new Image();
const obstacleImg = new Image();
const powerUpImg = new Image();

playerImg.src = 'zlato.png';
berryImg.src = 'body.png';
chaserImg.src = 'severa.png';
obstacleImg.src = 'zed.png';
powerUpImg.src = 'slowtime.png';

const startButton = document.getElementById("start-button");
const gameOverScreen = document.getElementById("game-over");
const scoreDisplay = document.getElementById("score-display");
const restartButton = document.getElementById("restart-button");
const highScoreDisplay = document.getElementById("high-score");
const toggleMusicButton = document.getElementById("toggle-music");
const volumeControl = document.getElementById("volume-control");

highScoreDisplay.textContent = highScore;

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
toggleMusicButton.addEventListener("click", toggleMusic);
volumeControl.addEventListener("input", adjustVolume);

let slowEffectActive = false;
let slowEffectDuration = 5000; 

function startGame() {
  startButton.style.display = "none";
  canvas.style.display = "block";
  isGameOver = false;
  score = 0;
  difficultyLevel = 1;
  player = { x: 50, y: 50, size: 30 };
  berries = [];
  powerUps = [];
  chasers = [];
  obstacles = [];

  spawnBerry();
  spawnChaser();
  gameInterval = setInterval(updateGame, 1000 / 60);
  backgroundMusic.play();
}

function spawnChaser() {
  const edge = Math.floor(Math.random() * 4);
  let chaser = { x: 0, y: 0, speed: difficultyLevel };

  switch (edge) {
    case 0:
      chaser.x = Math.random() * canvas.width;
      chaser.y = 0;
      break;
    case 1:
      chaser.x = canvas.width - 20;
      chaser.y = Math.random() * canvas.height;
      break;
    case 2:
      chaser.x = Math.random() * canvas.width;
      chaser.y = canvas.height - 20;
      break;
    case 3:
      chaser.x = 0;
      chaser.y = Math.random() * canvas.height;
      break;
  }

  chasers.push(chaser);
}

function restartGame() {
  gameOverScreen.style.display = "none";
  startGame();
}

function spawnBerry() {
  berries.push({
    x: Math.random() * (canvas.width - 20),
    y: Math.random() * (canvas.height - 20),
    size: 30
  });
}

function spawnPowerUp() {
  powerUps.push({
    x: Math.random() * (canvas.width - 20),
    y: Math.random() * (canvas.height - 20),
    size: 30
  });
}

function spawnObstacle() {
  obstacles.push({
    x: Math.random() * (canvas.width - 30),
    y: Math.random() * (canvas.height - 30),
    size: 40
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGameOver) return;

  updateChasers();
  drawObstacles();
  checkCollisions();

  if (score > 0 && score % 50 === 0 && difficultyLevel === score / 50) {
    difficultyLevel++;
    spawnChaser();
    spawnObstacle();
  }

  drawPlayer();
  drawBerries();
  drawChasers();
  drawPowerUps(); 
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  player.x = event.clientX - rect.left - player.size / 2;
  player.y = event.clientY - rect.top - player.size / 2;
});

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

function drawBerries() {
  berries.forEach((berry) => {
    ctx.drawImage(berryImg, berry.x, berry.y, berry.size, berry.size);
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, powerUp.size, powerUp.size);
  });
}

function drawChasers() {
  chasers.forEach((chaser) => {
    ctx.drawImage(chaserImg, chaser.x, chaser.y, 30, 30);
  });
}

function updateChasers() {
  chasers.forEach((chaser) => {
    let effectiveSpeed = slowEffectActive ? chaser.speed * 0.5 : chaser.speed;
    if (chaser.x < player.x) chaser.x += effectiveSpeed;
    if (chaser.x > player.x) chaser.x -= effectiveSpeed;
    if (chaser.y < player.y) chaser.y += effectiveSpeed;
    if (chaser.y > player.y) chaser.y -= effectiveSpeed;
  });
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.size, obstacle.size);
  });
}

function checkCollisions() {
  berries.forEach((berry, index) => {
    if (
      player.x < berry.x + berry.size &&
      player.x + player.size > berry.x &&
      player.y < berry.y + berry.size &&
      player.y + player.size > berry.y
    ) {
      berries.splice(index, 1);
      score += 10;
      spawnBerry();

      if (Math.random() < 0.10) {
        spawnPowerUp();
      }
    }
  });

  powerUps.forEach((powerUp, index) => {
    if (
      player.x < powerUp.x + powerUp.size &&
      player.x + player.size > powerUp.x &&
      player.y < powerUp.y + powerUp.size &&
      player.y + player.size > powerUp.y
    ) {
      powerUps.splice(index, 1);
      activateSlowEffect();
    }
  });

  chasers.forEach((chaser) => {
    if (
      player.x < chaser.x + 20 &&
      player.x + player.size > chaser.x &&
      player.y < chaser.y + 20 &&
      player.y + player.size > chaser.y
    ) {
      endGame();
    }
  });

  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacle.size &&
      player.x + player.size > obstacle.x &&
      player.y < obstacle.y + obstacle.size &&
      player.y + player.size > obstacle.y
    ) {
      endGame();
    }
  });
}

function activateSlowEffect() {
  slowEffectActive = true;
  setTimeout(() => {
    slowEffectActive = false;
  }, slowEffectDuration);
}

function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  gameOverSound.play();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreDisplay.textContent = highScore;
  }

  gameOverScreen.style.display = "block";
  scoreDisplay.textContent = `Your Score: ${score}`;
}

function toggleMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    toggleMusicButton.textContent = "Pause Music";
  } else {
    backgroundMusic.pause();
    toggleMusicButton.textContent = "Play Music";
  }
}

function adjustVolume() {
  backgroundMusic.volume = volumeControl.value;
}
