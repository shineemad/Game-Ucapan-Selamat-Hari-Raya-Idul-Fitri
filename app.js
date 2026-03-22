const sfxClick = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
const sfxHit = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
const victoryMusic = new Audio("https://assets.mixkit.co/music/preview/mixkit-victory-is-close-514.mp3");
victoryMusic.volume = 0.98;
victoryMusic.preload = "auto";

const bgMusic = new Audio("./Original-Eid-Takbir-In-Masjid-Al-Haram-Beautiful.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.28;

let bgMusicStarted = false;
let victoryMusicPrimed = false;
let isMusicEnabled = true;
let victoryAudioCtx = null;

const stages = [
  {
    title: "STAGE 1: KALAHKAN HAWA NAFSU",
    icon: "👹",
    description: "Pukul mundur hawa nafsu dan ego untuk membuka gerbang kemenangan!",
    hitsNeeded: 6,
    timeLimit: 20,
  },
  {
    title: "STAGE 2: TEMBUS GODAAN MALAS",
    icon: "😴",
    description: "Jaga konsistensi ibadah. Jangan biarkan rasa malas menang.",
    hitsNeeded: 9,
    timeLimit: 22,
  },
  {
    title: "STAGE 3: TUNDUKKAN AMARAH",
    icon: "🔥",
    description: "Ujian terakhir: redam amarah, jaga hati, raih fitri yang sejati.",
    hitsNeeded: 12,
    timeLimit: 24,
  },
];

const screenStart = document.getElementById("screen-start");
const screenBoss = document.getElementById("screen-boss");
const screenVictory = document.getElementById("screen-victory");

const btnStart = document.getElementById("btn-start");
const btnModeNormal = document.getElementById("btn-mode-normal");
const btnModeHard = document.getElementById("btn-mode-hard");
const btnMusicToggle = document.getElementById("btn-music-toggle");
const btnAttack = document.getElementById("btn-attack");
const btnPower = document.getElementById("btn-power");
const btnDodge = document.getElementById("btn-dodge");
const modeBanner = document.getElementById("mode-banner");
const modeLabel = document.getElementById("mode-label");

const stageTitle = document.getElementById("stage-title");
const bossHpBar = document.getElementById("boss-hp");
const bossIcon = document.getElementById("boss-icon");
const stageDescription = document.getElementById("stage-description");
const stageIndicator = document.getElementById("stage-indicator");
const stageTimer = document.getElementById("stage-timer");
const stageCombo = document.getElementById("stage-combo");
const stageStatus = document.getElementById("stage-status");
const stageProgress = document.getElementById("stage-progress");
const finalStats = document.getElementById("final-stats");

let stageIndex = 0;
let stageHits = 0;
let timeLeft = 0;
let timerRef = null;
let combo = 0;
let powerCharge = 0;
let totalHits = 0;
let totalPowerUsed = 0;
let lastHitAt = 0;
let isHardMode = false;
let bossCharging = false;
let bossCounterRef = null;
let dodgeWindowRef = null;
let idlePenaltyRef = null;
let lastAttackAt = 0;

gsap.set([screenBoss, screenVictory], { autoAlpha: 0, scale: 0.8 });

gsap.to(btnStart, {
  alpha: 0.4,
  duration: 0.6,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
});

function isVictoryScreenVisible() {
  return screenVictory.style.display === "flex";
}

function stopAllMusic() {
  bgMusic.pause();
  victoryMusic.pause();
}

function updateMusicToggleUi() {
  btnMusicToggle.textContent = isMusicEnabled ? "MUSIC: ON" : "MUSIC: OFF";
  btnMusicToggle.classList.toggle("muted", !isMusicEnabled);
}

function getVictoryAudioContext() {
  if (victoryAudioCtx) return victoryAudioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  victoryAudioCtx = new Ctx();
  return victoryAudioCtx;
}

function playVictorySynth() {
  const ctx = getVictoryAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    const start = now + idx * 0.13;
    const end = start + 0.18;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.01);
  });
}

function playVictoryAudio() {
  if (!isMusicEnabled) return;

  victoryMusic.pause();
  victoryMusic.currentTime = 0;
  victoryMusic.volume = 0.45;

  victoryMusic.play().catch(() => {
    playVictorySynth();
  });
}

function startBackgroundMusic() {
  if (!isMusicEnabled || isVictoryScreenVisible()) return;

  bgMusic.play().then(() => {
    bgMusicStarted = true;
  }).catch(() => {});
}

function primeVictoryMusic() {
  if (victoryMusicPrimed || !isMusicEnabled) return;

  const wasMuted = victoryMusic.muted;
  victoryMusic.muted = true;

  victoryMusic.play().then(() => {
    victoryMusic.pause();
    victoryMusic.currentTime = 0;
    victoryMusic.muted = wasMuted;
    victoryMusicPrimed = true;
  }).catch(() => {
    victoryMusic.muted = wasMuted;
  });
}

startBackgroundMusic();

const unlockBgMusic = () => {
  startBackgroundMusic();
  primeVictoryMusic();
  const ctx = getVictoryAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  if (!bgMusicStarted) return;

  window.removeEventListener("pointerdown", unlockBgMusic);
  window.removeEventListener("keydown", unlockBgMusic);
  window.removeEventListener("touchstart", unlockBgMusic);
};

window.addEventListener("pointerdown", unlockBgMusic);
window.addEventListener("keydown", unlockBgMusic);
window.addEventListener("touchstart", unlockBgMusic, { passive: true });
updateMusicToggleUi();

let isDraggingMusic = false;
let musicDragStartX = 0;
let musicDragStartY = 0;
let musicDragOffsetX = 0;
let musicDragOffsetY = 0;

btnMusicToggle.addEventListener("mousedown", (e) => {
  isDraggingMusic = true;
  musicDragOffsetX = e.clientX - btnMusicToggle.getBoundingClientRect().left;
  musicDragOffsetY = e.clientY - btnMusicToggle.getBoundingClientRect().top;
  btnMusicToggle.style.cursor = "grabbing";
});

btnMusicToggle.addEventListener("touchstart", (e) => {
    isDraggingMusic = true;
    const touch = e.touches[0];
    const rect = btnMusicToggle.getBoundingClientRect();
    musicDragOffsetX = touch.clientX - rect.left;
    musicDragOffsetY = touch.clientY - rect.top;
  }, { passive: true }
);

document.addEventListener("mousemove", (e) => {
  if (!isDraggingMusic) return;
  const newX = e.clientX - musicDragOffsetX;
  const newY = e.clientY - musicDragOffsetY;
  btnMusicToggle.style.left = Math.max(0, Math.min(newX, window.innerWidth - btnMusicToggle.offsetWidth)) + "px";
  btnMusicToggle.style.right = "auto";
  btnMusicToggle.style.top = Math.max(0, Math.min(newY, window.innerHeight - btnMusicToggle.offsetHeight)) + "px";
});

document.addEventListener("touchmove", (e) => {
    if (!isDraggingMusic) return;
    const touch = e.touches[0];
    const newX = touch.clientX - musicDragOffsetX;
    const newY = touch.clientY - musicDragOffsetY;
    btnMusicToggle.style.left = Math.max(0, Math.min(newX, window.innerWidth - btnMusicToggle.offsetWidth)) + "px";
    btnMusicToggle.style.right = "auto";
    btnMusicToggle.style.top = Math.max(0, Math.min(newY, window.innerHeight - btnMusicToggle.offsetHeight)) + "px";
  }, { passive: true }
);

document.addEventListener("mouseup", () => {
  isDraggingMusic = false;
  btnMusicToggle.style.cursor = "grab";
});

document.addEventListener("touchend", () => {
  isDraggingMusic = false;
});

function renderProgressDots() {
  stageProgress.innerHTML = "";
  stages.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.className = "stage-dot";
    if (idx < stageIndex) dot.classList.add("done");
    if (idx === stageIndex) dot.classList.add("active");
    stageProgress.appendChild(dot);
  });
}

function updateHud() {
  stageIndicator.textContent = `${stageIndex + 1}/${stages.length}`;
  stageTimer.textContent = `${timeLeft}s`;
  stageCombo.textContent = `x${combo}`;
  btnPower.disabled = powerCharge < 100;
  btnPower.textContent = powerCharge >= 100 ? "POWER STRIKE READY!" : `POWER STRIKE ${powerCharge}%`;
  modeLabel.textContent = isHardMode ? "MODE: SULIT" : "MODE: NORMAL";
  modeLabel.classList.toggle("hard", isHardMode);
}

function haptic(pattern) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}

function clearHardModeTimers() {
  clearTimeout(bossCounterRef);
  clearTimeout(dodgeWindowRef);
  bossCharging = false;
  btnDodge.disabled = true;
}

function clearIdlePenaltyTimer() {
  clearInterval(idlePenaltyRef);
  idlePenaltyRef = null;
}

function getCurrentHp() {
  return Math.max(0, 100 - (stageHits / stages[stageIndex].hitsNeeded) * 100);
}

function healBoss(amount) {
  const hpBefore = getCurrentHp();
  const hpAfter = Math.min(100, hpBefore + amount);
  const progressPercent = 100 - hpAfter;
  stageHits = (progressPercent / 100) * stages[stageIndex].hitsNeeded;
  bossHpBar.style.width = `${hpAfter}%`;
}

function applyMissPenalty(message) {
  combo = 0;
  powerCharge = Math.max(0, powerCharge - 30);
  timeLeft = Math.max(1, timeLeft - 3);
  healBoss(8);
  stageStatus.textContent = message;
  haptic([70, 50, 70]);

  gsap.fromTo("#game-container", { backgroundColor: "#7f1d1d" }, { backgroundColor: "", duration: 0.28 });
  updateHud();
}

function getIdleRecoverAmount() {
  const baseRecoverByLevel = [5, 7, 9];
  const base = baseRecoverByLevel[stageIndex] ?? 5;
  return isHardMode ? base + 2 : base;
}

function getIdleIntervalByLevel() {
  const intervalByLevel = isHardMode ? [600, 200, 100] : [1000, 600, 300];
  return intervalByLevel[stageIndex] ?? 1000;
}

function startIdlePenaltyTimer() {
  clearIdlePenaltyTimer();
  lastAttackAt = Date.now();

  idlePenaltyRef = setInterval(() => {
    const elapsed = Date.now() - lastAttackAt;
    const intervalMs = getIdleIntervalByLevel();
    if (elapsed < intervalMs || screenBoss.style.display === "none") return;

    healBoss(getIdleRecoverAmount());
    combo = 0;
    powerCharge = Math.max(0, powerCharge - 12);
    stageStatus.textContent = `Kamu berhenti klik ${Math.round((intervalMs / 1000) * 10) / 10} detik. Boss pulih otomatis!`;
    haptic(25);

    gsap.fromTo("#game-container", { backgroundColor: "#3f3f46" }, { backgroundColor: "", duration: 0.2 });
    updateHud();
    lastAttackAt = Date.now();
  }, 50);
}

function scheduleBossCounter() {
  if (!isHardMode || screenBoss.style.display === "none") return;
  clearTimeout(bossCounterRef);

  const delay = 3300 + Math.floor(Math.random() * 2200);
  bossCounterRef = setTimeout(() => {
    bossCharging = true;
    btnDodge.disabled = false;
    stageStatus.textContent = "Boss bersiap menyerang balik! Tekan DODGE sekarang!";
    haptic([40, 60, 40]);

    gsap.fromTo(bossIcon, { scale: 1 }, { scale: 1.2, duration: 0.12, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "scale" });

    dodgeWindowRef = setTimeout(() => {
      if (bossCharging) {
        bossCharging = false;
        btnDodge.disabled = true;
        applyMissPenalty("Kena serangan balik! Penalti waktu -3s dan HP boss pulih.");
      }
      scheduleBossCounter();
    }, 1200);
  }, delay);
}

function applyDamage(rawDamage) {
  const hpBefore = Math.max(0, 100 - (stageHits / stages[stageIndex].hitsNeeded) * 100);
  const hpAfter = Math.max(0, hpBefore - rawDamage);
  const progressPercent = 100 - hpAfter;
  stageHits = (progressPercent / 100) * stages[stageIndex].hitsNeeded;
  bossHpBar.style.width = `${hpAfter}%`;
  return hpAfter;
}

function startStage(index) {
  stageIndex = index;
  stageHits = 0;
  combo = 0;
  powerCharge = 0;
  timeLeft = stages[index].timeLimit;
  clearHardModeTimers();

  stageTitle.textContent = stages[index].title;
  stageDescription.textContent = stages[index].description;
  bossIcon.textContent = stages[index].icon;
  bossHpBar.style.width = "100%";
  btnAttack.textContent = "SERANG!";
  btnAttack.disabled = false;
  btnDodge.style.display = isHardMode ? "inline-block" : "none";
  stageStatus.textContent = `Bangun combo. Idle ${getIdleIntervalByLevel()}ms akan membuat boss pulih otomatis.`;

  renderProgressDots();
  updateHud();

  clearInterval(timerRef);
  clearIdlePenaltyTimer();
  timerRef = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerRef);
      timeLeft = 0;
      combo = 0;
      powerCharge = 0;
      stageStatus.textContent = "Waktu habis! Stage diulang, fokus lagi!";
      updateHud();

      gsap.fromTo("#game-container", { backgroundColor: "#450a0a" }, { backgroundColor: "", duration: 0.5 });
      setTimeout(() => startStage(stageIndex), 900);
    }
    updateHud();
  }, 1000);

  startIdlePenaltyTimer();

  gsap.fromTo(bossIcon, { autoAlpha: 0, scale: 0.5, rotation: -25 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" });
  gsap.to(bossIcon, { y: -10, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });

  if (isHardMode) {
    stageStatus.textContent = "Mode sulit aktif: waspadai counter attack boss!";
    scheduleBossCounter();
  }
}

function finishStage() {
  clearInterval(timerRef);
  clearIdlePenaltyTimer();
  clearHardModeTimers();
  btnAttack.disabled = true;
  btnPower.disabled = true;

  gsap.to(bossIcon, {
    scale: 0,
    rotation: 360,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power3.in",
    onComplete: () => {
      if (stageIndex < stages.length - 1) {
        stageStatus.textContent = `Stage ${stageIndex + 1} selesai! Bersiap ke stage berikutnya...`;
        stageIndex++;
        setTimeout(() => startStage(stageIndex), 900);
      } else {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        showVictoryScreen();
      }
    },
  });
}

function attack(isPower = false) {
  lastAttackAt = Date.now();

  if (isHardMode && bossCharging) {
    bossCharging = false;
    btnDodge.disabled = true;
    applyMissPenalty("Timing meleset! Saat counter attack kamu harus DODGE.");
    scheduleBossCounter();
    return;
  }

  if (isHardMode && !isPower && Math.random() < 0.15) {
    applyMissPenalty("Serangan meleset! Fokuskan ritme klikmu.");
    scheduleBossCounter();
    return;
  }

  totalHits++;
  const now = Date.now();
  combo = now - lastHitAt <= 900 ? combo + 1 : 1;
  lastHitAt = now;

  if (isPower) {
    powerCharge = 0;
    totalPowerUsed++;
  } else {
    powerCharge = Math.min(100, powerCharge + 22);
  }

  const baseDamage = 100 / stages[stageIndex].hitsNeeded;
  const comboBonus = Math.min(combo, 8) * 1.8;
  const powerBonus = isPower ? 18 : 0;
  const hpLeft = applyDamage(baseDamage + comboBonus + powerBonus);

  sfxHit.cloneNode(true).play();
  haptic(isPower ? [15, 25, 65] : 18);

  gsap.fromTo(bossIcon, { x: -15, rotation: -15, scale: 0.92 }, { x: 15, rotation: 15, scale: 1.1, duration: 0.09, yoyo: true, repeat: 3, ease: "power1.inOut", clearProps: "transform" });
  gsap.fromTo("#game-container", { backgroundColor: isPower ? "#082f49" : "#450a0a" }, { backgroundColor: "", duration: 0.22 });

  btnAttack.textContent = `SERANG! DMG ${Math.round(baseDamage + comboBonus)}`;
  stageStatus.textContent = isPower ? "Power Strike meledak! Boss terpukul keras!" : combo >= 3 ? `Combo x${combo} aktif, pertahankan ritme!` : "Serang terus untuk memperbesar combo.";

  updateHud();

  if (hpLeft <= 0) {
    finishStage();
  } else if (isHardMode) {
    scheduleBossCounter();
  }
}

function setDifficulty(hardMode) {
  isHardMode = hardMode;
  btnModeNormal.classList.toggle("active", !hardMode);
  btnModeHard.classList.toggle("active", hardMode);
  modeBanner.textContent = hardMode ? "Mode Sulit: boss serang balik, miss kena penalti, dan haptic aktif." : "Mode Normal: santai untuk pemanasan.";
}

btnModeNormal.addEventListener("click", () => setDifficulty(false));
btnModeHard.addEventListener("click", () => setDifficulty(true));

btnMusicToggle.addEventListener("click", (e) => {
  if (isDraggingMusic) { e.preventDefault(); return; }
  sfxClick.play();
  isMusicEnabled = !isMusicEnabled;
  updateMusicToggleUi();

  if (!isMusicEnabled) {
    stopAllMusic();
    return;
  }

  if (isVictoryScreenVisible()) {
    victoryMusic.currentTime = 0;
    victoryMusic.play().catch(() => console.log("Audio kemenangan dicegah browser"));
  } else {
    startBackgroundMusic();
  }
});

btnStart.addEventListener("click", () => {
  sfxClick.play();
  startBackgroundMusic();

  const tl = gsap.timeline();
  tl.to(screenStart, { autoAlpha: 0, scale: 1.2, duration: 0.5, ease: "power2.in" })
    .set(screenStart, { display: "none" })
    .set(screenBoss, { display: "flex" })
    .to(screenBoss, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" });

  startStage(0);
});

btnAttack.addEventListener("click", () => attack(false));

btnPower.addEventListener("click", () => {
  if (powerCharge >= 100) attack(true);
});

btnDodge.addEventListener("click", () => {
  if (!bossCharging) return;

  lastAttackAt = Date.now();
  bossCharging = false;
  clearTimeout(dodgeWindowRef);
  btnDodge.disabled = true;
  combo = Math.min(combo + 1, 12);
  powerCharge = Math.min(100, powerCharge + 15);
  stageStatus.textContent = "DODGE sukses! Combo naik dan Power bertambah.";
  haptic([25, 35, 25]);
  updateHud();
  scheduleBossCounter();
});

function showVictoryScreen() {
  clearIdlePenaltyTimer();
  clearHardModeTimers();
  playVictoryAudio();
  finalStats.textContent = `Stat: ${totalHits} serangan | ${totalPowerUsed} Power Strike | Mode ${isHardMode ? "Sulit" : "Normal"} | 3 stage ditaklukkan`;

  const tl = gsap.timeline({ delay: 0.5 });

  tl.to(screenBoss, { autoAlpha: 0, y: -50, duration: 0.5, ease: "power2.in" })
    .set(screenBoss, { display: "none" })
    .set(screenVictory, { display: "flex" })
    .to("#game-container", { backgroundColor: "#ffffff", duration: 0.2, yoyo: true, repeat: 1 })
    .fromTo(screenVictory, { autoAlpha: 0, scale: 0.5, y: 50 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" })
    .from("#screen-victory h1", { autoAlpha: 0, y: -20, duration: 0.5 }, "-=0.2")
    .from(".victory-icon", { autoAlpha: 0, scale: 0, rotation: -180, duration: 0.8, ease: "elastic.out(1, 0.4)" }, "-=0.3")
    .from("#screen-victory h2", { autoAlpha: 0, x: -30, duration: 0.5 }, "-=0.4")
    .from("#final-stats", { autoAlpha: 0, y: 15, duration: 0.5 }, "-=0.2")
    .from(".message", { autoAlpha: 0, y: 20, duration: 0.8 }, "-=0.2")
    .from(".signature", { autoAlpha: 0, scale: 2, filter: "blur(10px)", duration: 0.6, ease: "power2.out" }, "-=0.3");
}