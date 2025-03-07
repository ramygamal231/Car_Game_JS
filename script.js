const scoreText = document.querySelector(".score-text");
const startBtn = document.querySelector(".start");
const gameArea = document.querySelector(".gameArea");
const pauseScreen = document.querySelector("#pauseScreen");
const pauseScore = document.querySelector("#pauseScore");
const timerDisplay = document.querySelector(".timer");

// Initialize timer display with correct format
timerDisplay.textContent = "Time: 0:00";

let player = {
  speed: 5,
  score: 0,
  isGamePaused: false,
};

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowRight: false,
  ArrowLeft: false,
  Space: false,
};

let lines = [];
let enemies = [];
let car;
let timer = 0;
let timerInterval;

startBtn.addEventListener("click", () => start(1));
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

function pressOn(e) {
  e.preventDefault();
  keys[e.key] = true;
  if (e.code === "Space") {
    player.isGamePaused = !player.isGamePaused;
    if (player.isGamePaused) {
      pauseScreen.classList.remove("hide");
      pauseScore.textContent = `Score: ${player.score}`;
    } else {
      pauseScreen.classList.add("hide");
      if (player.start) {
        window.requestAnimationFrame(playGame);
      }
    }
  }
}

function pressOff(e) {
  e.preventDefault();
  keys[e.key] = false;
}

function moveLines() {
  lines.forEach(function (item) {
    if (item.y >= window.innerHeight) {
      item.y -= window.innerHeight;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function isCollide(a, b) {
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveEnemy() {
  enemies.forEach(function (item) {
    if (isCollide(car, item)) {
      console.log("HIT");
      endGame();
    }
    if (item.y >= window.innerHeight) {
      item.y = -600;
      const roadWidth = gameArea.offsetWidth - 50; // Minus car width
      item.style.left = Math.floor(Math.random() * roadWidth) + "px";
      item.style.backgroundColor = randomColor();
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function playGame() {
  if (player.isGamePaused) {
    return;
  }
  moveLines();
  moveEnemy();
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    if (keys.ArrowUp && player.y > road.top) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < road.bottom - 100) { // Account for car height
      player.y += player.speed;
    }
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < road.width - 50) { // Account for car width
      player.x += player.speed;
    }

    car.style.left = `${player.x}px`;
    car.style.top = `${player.y}px`;

    player.score++;
    scoreText.textContent = `Score: ${player.score}`;

    if (player.score % 1000 === 0) {
      player.speed += 1;
    }
  }

  window.requestAnimationFrame(playGame);
}

function endGame() {
  player.start = false;
  clearInterval(timerInterval);
  
  // Format final timer value for display
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  const formattedTime = `${minutes}:${formattedSeconds}`;
  
  const highScore = localStorage.getItem("highScore");
  if (player.score > highScore) {
    localStorage.setItem("highScore", player.score);
    scoreText.textContent = `New High Score! ${player.score}`;
    timerDisplay.textContent = `Time: ${formattedTime}`;
  } else {
    scoreText.textContent = `Game Over! Score: ${player.score}`;
    timerDisplay.textContent = `Time: ${formattedTime}`;
  }
  
  gameArea.classList.add("fadeOut");
  startBtn.classList.remove("hide");
}

function start(level) {
  gameArea.classList.remove("fadeOut");
  startBtn.classList.add("hide");
  gameArea.innerHTML = "";
  lines = [];
  enemies = [];

  player.start = true;
  player.speed = 5 + (level - 1) * 2;
  player.score = 0;

  // Reset and start timer
  timer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    // Format timer as minutes:seconds
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    // Add leading zero to seconds if needed
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    timerDisplay.textContent = `Time: ${minutes}:${formattedSeconds}`;
  }, 1000);

  // Initialize score display
  scoreText.textContent = `Score: ${player.score}`;

  // Calculate the number of lines needed based on screen height
  const linesNeeded = Math.ceil(window.innerHeight / 150) + 1;
  
  // Create multiple center lines - one at 25%, one at 50%, and one at 75% of screen width
  const linePlacements = [0.25, 0.5, 0.75];
  
  for (let placement of linePlacements) {
    for (let x = 0; x < linesNeeded; x++) {
      let div = document.createElement("div");
      div.classList.add("line");
      div.y = x * 150;
      div.style.top = `${div.y}px`;
      div.style.marginLeft = `calc(${placement * 100}% - 5px)`; // Center each line
      gameArea.appendChild(div);
      lines.push(div);
    }
  }

  car = document.createElement("div");
  car.setAttribute("class", "car");
  gameArea.appendChild(car);
  
  // Get the game area width and calculate the center position
  const gameAreaWidth = gameArea.offsetWidth;
  // Position the car in the middle of the road (center of game area minus half of car width)
  player.x = (gameAreaWidth / 2) - 25; // 25 is half of the car width (50px)
  
  // Set the car's vertical position to be near the bottom
  player.y = gameArea.offsetHeight - 120; // 120 gives some space from bottom
  
  // Apply the initial position
  car.style.left = `${player.x}px`;
  car.style.top = `${player.y}px`;

  const numEnemies = 3 + level;
  const roadWidth = gameArea.offsetWidth - 50; // Minus car width
  
  for (let x = 0; x < numEnemies; x++) {
    let enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.innerHTML = `<br>${x + 1}`;
    enemy.y = (x + 1) * 600 * -1;
    enemy.style.top = `${enemy.y}px`;
    enemy.style.left = `${Math.floor(Math.random() * roadWidth)}px`;
    enemy.style.backgroundColor = randomColor();
    gameArea.appendChild(enemy);
    enemies.push(enemy);
  }

  window.requestAnimationFrame(playGame);
}

function randomColor() {
  let hex = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + ("000000" + hex).slice(-6);
}