// ===== STATE =====
let candlesBlown = 0;
let musicPlaying = false;
let currentSection = 'loading';

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const bgMusic = $('#bgMusic');
const musicToggle = $('#musicToggle');
const enterBtn = $('#enterBtn');
const candleGrid = $('#candleGrid');
const candleCount = $('#candleCount');
const wishPopup = $('#wishPopup');
const finalWishMsg = $('#finalWishMsg');
const wishModalOverlay = $('#wishModalOverlay');
const memoryModalOverlay = $('#memoryModalOverlay');
const confettiContainer = $('#confettiContainer');

// ===== WISH MESSAGES =====
const wishes = [
  // First 5 (Cute)
  "You're really special to me 💖",
  "I love seeing you smile 😊",
  "You make my days better ✨",
  "I'm lucky to know you 💕",
  "You're adorable in your own way 🐰",
  // Next 10 (Short)
  "You matter ❤️",
  "You're enough ✨",
  "Stay the same 💖",
  "You're amazing 🌸",
  "Always keep smiling 😊",
  "You light things up ✨",
  "You're my favorite notification 📱",
  "You feel like home 🏡",
  "You're different… in a good way 💕",
  "I appreciate you 🌷",
  // Last 5 (Emotional)
  "I don't say this enough...",
  "You really mean a lot to me ❤️",
  "I'm grateful you're in my life",
  "I want to see you happy always",
  "I'm glad it's you ✨"
];

// ===== MEMORY DATA =====
const memoryData = [
  { title: "A Special Day 💖", date: "08 May 2025", desc: "Write your memory here..." },
  { title: "That One Evening 🌸", date: "14 Feb 2025", desc: "Write your memory here..." },
  { title: "Us Being Us 😄", date: "01 Jan 2025", desc: "Write your memory here..." },
  { title: "Golden Hour ✨", date: "25 Dec 2024", desc: "Write your memory here..." },
  { title: "First Laugh 💖", date: "15 Nov 2024", desc: "Write your memory here..." },
  { title: "Unexpected 🌷", date: "10 Oct 2024", desc: "Write your memory here..." },
  { title: "Best Day Ever 🌸", date: "08 Aug 2024", desc: "Write your memory here..." },
  { title: "Just You 💖", date: "01 May 2024", desc: "Write your memory here..." }
];

// ===== SECTION TRANSITION =====
function goToSection(targetId) {
  const current = $(`.section.active`);
  const target = $(`#${targetId}`);
  if (!target || current === target) return;

  current?.classList.remove('active');
  target.classList.add('active');
  currentSection = targetId;
}

// ===== LOADING SCREEN =====
function initLoading() {
  setTimeout(() => {
    goToSection('landing');
  }, 2800);
}

// ===== MUSIC SYSTEM =====
function startMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicToggle.classList.add('visible');
    musicToggle.textContent = '🔊';
    // Fade in
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol += 0.02;
      if (vol >= 0.25) {
        vol = 0.25;
        clearInterval(fadeIn);
      }
      bgMusic.volume = vol;
    }, 50);
  }).catch(() => {
    // Autoplay blocked - show toggle
    musicToggle.classList.add('visible');
    musicToggle.textContent = '🔇';
  });
}

musicToggle?.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicToggle.textContent = '🔇';
  } else {
    bgMusic.volume = 0.25;
    bgMusic.play();
    musicPlaying = true;
    musicToggle.textContent = '🔊';
  }
});

// ===== ENTER BUTTON =====
enterBtn?.addEventListener('click', () => {
  setTimeout(() => startMusic(), 500);
  goToSection('cake');
  spawnFloatingHearts();
});

// ===== CANDLE SYSTEM =====
function initCandles() {
  candleGrid.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.dataset.index = i;
    candle.innerHTML = `
      <div class="candle-flame"></div>
      <div class="candle-smoke"></div>
      <div class="candle-body"></div>
    `;
    candle.addEventListener('click', () => blowCandle(candle, i));
    candleGrid.appendChild(candle);
  }
}

function blowCandle(candle, index) {
  if (candle.classList.contains('blown')) return;

  candle.classList.add('blown');
  candlesBlown++;
  candleCount.textContent = candlesBlown;

  // Play blow sound (synthesized)
  playBlowSound();

  // Show wish message
  showWishMessage(wishes[index]);

  // Check if all blown
  if (candlesBlown === 20) {
    setTimeout(() => {
      // Show confetti
      spawnConfetti();

      // Show final message
      finalWishMsg.style.display = 'block';

      // Auto transition after 3 seconds
      setTimeout(() => {
        goToSection('wishes');
      }, 3000);
    }, 1500);
  }
}

function showWishMessage(msg) {
  wishPopup.innerHTML = `<p>${msg}</p>`;
}

// ===== BLOW SOUND (Web Audio API) =====
function playBlowSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // White noise-ish blow sound
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // Silent fail
  }
}

// ===== WISH CARDS (Tap to enlarge) =====
$$('.wish-card').forEach(card => {
  card.addEventListener('click', () => {
    const emoji = card.querySelector('.wish-emoji').textContent;
    const text = card.querySelector('.wish-text').textContent;
    const label = card.querySelector('.wish-label').textContent;
    
    $('#modalEmoji').textContent = emoji;
    $('#modalText').textContent = text;
    $('#modalLabel').textContent = label;
    wishModalOverlay.classList.add('active');
  });
});

$('#wishModalClose')?.addEventListener('click', () => {
  wishModalOverlay.classList.remove('active');
});

wishModalOverlay?.addEventListener('click', (e) => {
  if (e.target === wishModalOverlay) {
    wishModalOverlay.classList.remove('active');
  }
});

$('#wishesNext')?.addEventListener('click', () => {
  goToSection('memories');
});

// ===== MEMORY CARDS (Tap to zoom) =====
$$('.polaroid').forEach(card => {
  card.addEventListener('click', () => {
    const idx = parseInt(card.dataset.mem);
    const data = memoryData[idx];
    const img = card.querySelector('img').src;
    
    $('#memModalImg').src = img;
    $('#memModalImg').alt = data.title;
    $('#memModalTitle').textContent = data.title;
    $('#memModalDate').textContent = data.date;
    $('#memModalDesc').textContent = data.desc;
    memoryModalOverlay.classList.add('active');
  });
});

$('#memModalClose')?.addEventListener('click', () => {
  memoryModalOverlay.classList.remove('active');
});

memoryModalOverlay?.addEventListener('click', (e) => {
  if (e.target === memoryModalOverlay) {
    memoryModalOverlay.classList.remove('active');
  }
});

$('#memoriesNext')?.addEventListener('click', () => {
  goToSection('secret');
});

// ===== SECRET SECTION =====
$('#secretBtn')?.addEventListener('click', function() {
  this.style.display = 'none';
  const reveal = $('#secretReveal');
  reveal.classList.add('show');

  setTimeout(() => {
    $('#secretNext').style.display = 'inline-flex';
  }, 2500);
});

$('#secretNext')?.addEventListener('click', () => {
  goToSection('final');
  spawnFloatingStars();
});

// ===== FINAL SECTION =====
$('#finalBtn')?.addEventListener('click', function() {
  this.style.display = 'none';
  const msg = $('#finalLastMsg');
  msg.classList.add('show');
  spawnConfetti();
});

// ===== FLOATING HEARTS =====
function spawnFloatingHearts() {
  const container = $('#floatingHearts');
  const hearts = ['💖', '💕', '💗', '🩷', '💜', '🤍'];
  
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (0.8 + Math.random() * 1) + 'rem';
    heart.style.animationDuration = (6 + Math.random() * 8) + 's';
    heart.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(heart);
  }
}

// ===== FLOATING STARS =====
function spawnFloatingStars() {
  const container = $('#floatingStars');
  container.innerHTML = '';
  
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '✨';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.fontSize = (0.6 + Math.random() * 0.8) + 'rem';
    star.style.animationDuration = (2 + Math.random() * 4) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(star);
  }
}

// ===== CONFETTI =====
function spawnConfetti() {
  const colors = ['#ff6b9d', '#cdb4db', '#ffd700', '#ff85a2', '#b8a9c9', '#ffc2d1'];
  
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.8) + 's';
    piece.style.width = (5 + Math.random() * 8) + 'px';
    piece.style.height = (8 + Math.random() * 8) + 'px';
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 4000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initCandles();
  initLoading();
});
