document.addEventListener("DOMContentLoaded", function () {
  const stage = document.getElementById("stage");
  const ghostWrapper = document.getElementById("ghost-wrapper");
  const ghost = document.getElementById("ghost");
  const skull = document.getElementById("skull");
  const scoreElement = document.getElementById("score");
  const oou = document.getElementById("oou");
  const scream = document.getElementById("scream");
  const scaryFace = document.getElementById("scary-face");
  const theme = document.getElementById("theme");
  const darkness = document.getElementById("darkness");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const main = document.getElementById("main");

  let screamDelay = generateScreamDelay();
  let lastGhostPosition = { x: 0, y: 0 };
  let score = 0;
  let musicStarted = false;

  let moveIntervalId = null;

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    theme.play().catch(() => {
      musicStarted = false;
    });
  }

  function startGame() {
    startScreen.style.display = "none";
    main.style.display = "flex";
    startMusic();
    applyDifficulty();
    moveghostRandomly();
  }

  startBtn.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    startGame();
  });

  function generateScreamDelay() {
    return Math.floor(Math.random() * 15) + 6;
  }

  function getDifficulty(s) {
    const t = Math.min(s / 50, 1);
    const baseSize = Math.min(50, Math.max(30, window.innerWidth * 0.07));
    const minSize = Math.max(16, baseSize * 0.4);
    return {
      interval: Math.round(900 - t * 640),
      fontSize: Math.round(baseSize - t * (baseSize - minSize)),
      blur: +(1 + t * 4).toFixed(1),
    };
  }

  function applyDifficulty() {
    const { interval, fontSize, blur } = getDifficulty(score);
    ghost.style.fontSize = fontSize + "px";
    ghostWrapper.style.filter = `blur(${blur}px)`;
    // max darkness capped at 0.72 so the game stays playable
    const t = Math.min(score / 50, 1);
    darkness.style.opacity = (t * 0.72).toFixed(3);
    clearInterval(moveIntervalId);
    moveIntervalId = setInterval(moveghostRandomly, interval);
  }

  function moveghostRandomly() {
    const maxX = stage.clientWidth - ghostWrapper.offsetWidth;
    const maxY = stage.clientHeight - ghostWrapper.offsetHeight;

    const randomX = Math.floor(Math.random() * Math.max(0, maxX));
    const randomY = Math.floor(Math.random() * Math.max(0, maxY));

    ghostWrapper.style.left = randomX + "px";
    ghostWrapper.style.top = randomY + "px";
    lastGhostPosition = { x: randomX, y: randomY };
  }

  function returnToStartScreen() {
    clearInterval(moveIntervalId);
    moveIntervalId = null;
    ghostWrapper.style.display = "none";
    skull.style.display = "none";
    main.style.display = "none";
    darkness.style.opacity = "0";
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    musicStarted = false;
    theme.pause();
    theme.currentTime = 0;
    screamDelay = generateScreamDelay();
    startScreen.style.display = "flex";
  }

  function handleScreamEvent() {
    theme.pause();
    theme.currentTime = 0;
    scream.play();
    scaryFace.style.display = "block";
    setTimeout(() => {
      scaryFace.style.display = "none";
      returnToStartScreen();
    }, 800);
    screamDelay = generateScreamDelay();
  }

  function disappearOnClick() {
    ghostWrapper.style.display = "none";
    skull.style.display = "block";
    skull.style.left = lastGhostPosition.x + "px";
    skull.style.top = lastGhostPosition.y + "px";

    if (score < 50) {
      score++;
      scoreElement.textContent = `Score: ${score}`;
      applyDifficulty();
    }
    console.log(screamDelay);
    if (score === screamDelay && score > 5) {
      handleScreamEvent();
    } else {
      oou.play();
    }

    setTimeout(() => {
      ghostWrapper.style.display = "block";
      skull.style.display = "none";
      moveghostRandomly();
    }, 1000);
  }
  // Single pointer-based handler covers mouse and touch without double-firing
  ghost.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    disappearOnClick();
  });
});
