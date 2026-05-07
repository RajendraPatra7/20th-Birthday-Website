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
// REPLACE: Update title, date, desc for each memory
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

  // Initialize 3D cake when cake section becomes active
  if (targetId === 'cake' && !threeScene) {
    setTimeout(initCandles, 200);
  }
}

// ===== LOADING SCREEN =====
function initLoading() {
  // Show loading screen for 5s so both name + subtitle are fully readable
  setTimeout(() => {
    goToSection('landing');
  }, 5000);
}

// ===== MUSIC SYSTEM =====
function startMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicToggle.classList.add('visible');
    musicToggle.textContent = '🔊';
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

// ===== THREE.JS CAKE SYSTEM =====
let wishTimeout = null;
let currentWishEl = null;
let threeScene, threeCamera, threeRenderer, cakeGroup;
let candleObjects = [];
let raycaster, mouse;
let wishIndex = 0;

function initCandles() {
  if (typeof THREE === 'undefined') {
    setTimeout(initCandles, 100);
    return;
  }

  const container = $('#cakeCanvasContainer');
  if (!container) return;

  const cw = container.clientWidth;
  const ch = container.clientHeight;
  if (cw === 0 || ch === 0) {
    setTimeout(initCandles, 100);
    return;
  }

  threeScene = new THREE.Scene();

  threeCamera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 100);
  threeCamera.position.set(0, 4.5, 12);
  threeCamera.lookAt(0, 1.2, 0);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setPixelRatio(window.devicePixelRatio);
  threeRenderer.setSize(cw, ch);
  threeRenderer.setClearColor(0x000000, 0);
  container.appendChild(threeRenderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  threeScene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  dirLight.position.set(3, 8, 5);
  threeScene.add(dirLight);

  const pinkLight = new THREE.PointLight(0xff6b9d, 0.6, 15);
  pinkLight.position.set(0, 4, 3);
  threeScene.add(pinkLight);

  cakeGroup = new THREE.Group();
  threeScene.add(cakeGroup);

  buildCake();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  container.addEventListener('click', onCakeClick, false);
  container.addEventListener('touchstart', onCakeTouch, { passive: false });
  window.addEventListener('resize', onCakeResize);

  animateCake();
}

function buildCake() {
  const tiers = [
    { radius: 2.2, height: 1.0, y: 0.5,   color: 0xe87aaf, frosting: 0xffb6d3, candles: 10, candleRadius: 1.7 },
    { radius: 1.6, height: 0.9, y: 1.45,  color: 0xf08cc0, frosting: 0xffcce0, candles: 6,  candleRadius: 1.15 },
    { radius: 1.0, height: 0.8, y: 2.3,   color: 0xff8ec4, frosting: 0xffd6e8, candles: 4,  candleRadius: 0.6 }
  ];

  const plateGeo = new THREE.CylinderGeometry(2.6, 2.7, 0.12, 32);
  const plateMat = new THREE.MeshPhongMaterial({ color: 0xfafafa, shininess: 80 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.06;
  cakeGroup.add(plate);

  let globalCandleIndex = 0;

  tiers.forEach((tier, tierIdx) => {
    const bodyGeo = new THREE.CylinderGeometry(tier.radius, tier.radius + 0.05, tier.height, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: tier.color, shininess: 30 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = tier.y;
    cakeGroup.add(body);

    const frostGeo = new THREE.CylinderGeometry(tier.radius + 0.02, tier.radius + 0.02, 0.08, 32);
    const frostMat = new THREE.MeshPhongMaterial({ color: tier.frosting, shininess: 60 });
    const frost = new THREE.Mesh(frostGeo, frostMat);
    frost.position.y = tier.y + tier.height / 2 + 0.04;
    cakeGroup.add(frost);

    const dripCount = tierIdx === 0 ? 8 : tierIdx === 1 ? 6 : 4;
    for (let d = 0; d < dripCount; d++) {
      const angle = (d / dripCount) * Math.PI * 2 + Math.random() * 0.3;
      const dripH = 0.2 + Math.random() * 0.2;
      const dripGeo = new THREE.CylinderGeometry(0.06, 0.03, dripH, 8);
      const dripMesh = new THREE.Mesh(dripGeo, frostMat);
      dripMesh.position.set(
        Math.cos(angle) * (tier.radius - 0.02),
        tier.y + tier.height / 2 - dripH / 2 + 0.04,
        Math.sin(angle) * (tier.radius - 0.02)
      );
      cakeGroup.add(dripMesh);
    }

    const dotCount = tierIdx === 0 ? 16 : tierIdx === 1 ? 10 : 6;
    for (let d = 0; d < dotCount; d++) {
      const angle = (d / dotCount) * Math.PI * 2;
      const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const dotColor = d % 2 === 0 ? 0xffd700 : 0xffffff;
      const dotMat = new THREE.MeshPhongMaterial({ color: dotColor, emissive: dotColor, emissiveIntensity: 0.3 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(
        Math.cos(angle) * (tier.radius + 0.01),
        tier.y,
        Math.sin(angle) * (tier.radius + 0.01)
      );
      cakeGroup.add(dot);
    }

    const tierTopY = tier.y + tier.height / 2 + 0.08;

    for (let i = 0; i < tier.candles; i++) {
      const angle = (i / tier.candles) * Math.PI * 2 + (tierIdx * 0.3);
      const candleHeight = 0.5 + Math.random() * 0.15;
      const x = Math.cos(angle) * tier.candleRadius + (Math.random() - 0.5) * 0.08;
      const z = Math.sin(angle) * tier.candleRadius + (Math.random() - 0.5) * 0.08;

      const candleGeo = new THREE.CylinderGeometry(0.09, 0.10, candleHeight, 8);
      const candleMat = new THREE.MeshPhongMaterial({ color: 0xff6b9d, shininess: 40 });
      const candleMesh = new THREE.Mesh(candleGeo, candleMat);
      candleMesh.position.set(x, tierTopY + candleHeight / 2, z);
      candleMesh.rotation.z = (Math.random() - 0.5) * 0.06;
      candleMesh.rotation.x = (Math.random() - 0.5) * 0.06;
      cakeGroup.add(candleMesh);

      const wickGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 4);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(x, tierTopY + candleHeight + 0.04, z);
      cakeGroup.add(wick);

      const flameGeo = new THREE.SphereGeometry(0.10, 8, 8);
      flameGeo.scale(1, 1.6, 1);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 0.9
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, tierTopY + candleHeight + 0.16, z);
      cakeGroup.add(flame);

      const hitGeo = new THREE.SphereGeometry(0.5, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitGeo, hitMat);
      hitbox.position.set(x, tierTopY + candleHeight / 2 + 0.1, z);
      hitbox.userData.isHitbox = true;
      cakeGroup.add(hitbox);

      const flameLight = new THREE.PointLight(0xffaa33, 0.3, 1.5);
      flameLight.position.copy(flame.position);
      cakeGroup.add(flameLight);

      // Tag objects with index
      candleMesh.userData.candleIndex = globalCandleIndex;
      flame.userData.candleIndex = globalCandleIndex;
      hitbox.userData.candleIndex = globalCandleIndex;

      candleObjects.push({
        mesh: candleMesh,
        flame: flame,
        wick: wick,
        hitbox: hitbox,
        flameLight: flameLight,
        blown: false,
        index: globalCandleIndex,
        baseFlameY: flame.position.y
      });

      globalCandleIndex++;
    }
  });

  cakeGroup.position.set(0, -1.8, 0);
  cakeGroup.scale.set(0.95, 0.95, 0.95);
}

function onCakeClick(event) {
  const rect = threeRenderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  castAndBlow();
}

function onCakeTouch(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const rect = threeRenderer.domElement.getBoundingClientRect();
  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
  castAndBlow();
}

function castAndBlow() {
  raycaster.setFromCamera(mouse, threeCamera);
  raycaster.params.Mesh = raycaster.params.Mesh || {};
  raycaster.params.Mesh.threshold = 0.5;
  raycaster.params.Points = raycaster.params.Points || {};
  raycaster.params.Points.threshold = 0.25;

  const clickables = candleObjects
    .filter(c => !c.blown)
    .flatMap(c => [c.mesh, c.flame, c.hitbox]);

  const intersects = raycaster.intersectObjects(clickables, true);
  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    let candle = null;

    if (hitObj.userData && hitObj.userData.candleIndex !== undefined) {
      candle = candleObjects.find(c => c.index === hitObj.userData.candleIndex);
    }
    if (candle && !candle.blown) {
      blowCandle3D(candle);
    }
  }
}

function blowCandle3D(candle) {
  candle.blown = true;
  candlesBlown++;
  candleCount.textContent = candlesBlown;

  candle.flame.visible = false;
  candle.flameLight.intensity = 0;
  candle.mesh.material = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 10, opacity: 0.6, transparent: true });

  playBlowSound();

  showWishMessage(wishes[wishIndex % wishes.length]);
  wishIndex++;

  if (candlesBlown % 5 === 0 && candlesBlown < 20) {
    spawnConfetti(20);
  }

  if (candlesBlown === 20) {
    // Hide skip button once all candles are blown
    const skipBtn = $('#cakeSkipBtn');
    if (skipBtn) skipBtn.style.display = 'none';

    setTimeout(() => {
      spawnConfetti(80);
      clearWishPopup();
      finalWishMsg.style.display = 'block';

      setTimeout(() => {
        goToSection('wishes');
      }, 3000);
    }, 1500);
  }
}

function onCakeResize() {
  const container = $('#cakeCanvasContainer');
  if (!container || !threeCamera || !threeRenderer) return;
  const cw = container.clientWidth || window.innerWidth;
  const ch = container.clientHeight || window.innerHeight * 0.65;
  threeCamera.aspect = cw / ch;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(cw, ch);
}

function animateCake() {
  requestAnimationFrame(animateCake);

  if (!cakeGroup || !threeRenderer || !threeScene || !threeCamera) return;

  cakeGroup.rotation.y += 0.003;

  const time = Date.now() * 0.005;
  candleObjects.forEach((c, i) => {
    if (!c.blown && c.flame.visible) {
      c.flame.position.y = c.baseFlameY + Math.sin(time + i * 1.5) * 0.02;
      c.flame.scale.set(
        0.9 + Math.sin(time * 2 + i) * 0.15,
        0.9 + Math.cos(time * 1.5 + i) * 0.15,
        0.9 + Math.sin(time * 1.8 + i) * 0.15
      );
      c.flameLight.intensity = 0.25 + Math.sin(time * 3 + i) * 0.1;
    }
  });

  threeRenderer.render(threeScene, threeCamera);
}

// ===== WISH MESSAGE SYSTEM (Dream Burst) =====
function showWishMessage(msg) {
  if (currentWishEl) {
    currentWishEl.classList.remove('visible');
    currentWishEl.classList.add('fading');
    const oldEl = currentWishEl;
    setTimeout(() => oldEl.remove(), 400);
  }

  // Clear old sparkles
  wishPopup.querySelectorAll('.wish-sparkle').forEach(s => s.remove());

  if (wishTimeout) clearTimeout(wishTimeout);

  const el = document.createElement('p');
  el.className = 'wish-msg';
  el.textContent = msg;
  wishPopup.appendChild(el);

  // Spawn sparkle particles around the message
  spawnWishSparkles(wishPopup, 12);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('visible');
    });
  });

  currentWishEl = el;

  wishTimeout = setTimeout(() => {
    if (currentWishEl === el) {
      el.classList.remove('visible');
      el.classList.add('fading');
      setTimeout(() => el.remove(), 500);
      currentWishEl = null;
    }
  }, 2500);
}

function spawnWishSparkles(container, count) {
  const colors = ['#ff6b9d', '#ffd700', '#cdb4db', '#fff', '#ff85a2', '#ffc2d1'];
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'wish-sparkle';
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 60 + Math.random() * 80;
    sparkle.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    sparkle.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
    sparkle.style.left = '50%';
    sparkle.style.top = '50%';
    sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.width = (4 + Math.random() * 5) + 'px';
    sparkle.style.height = sparkle.style.width;
    sparkle.style.animationDelay = (Math.random() * 0.2) + 's';
    sparkle.style.boxShadow = `0 0 6px ${sparkle.style.backgroundColor}`;
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
}

function clearWishPopup() {
  if (wishTimeout) clearTimeout(wishTimeout);
  wishPopup.innerHTML = '';
  currentWishEl = null;
}

// ===== BLOW SOUND (Web Audio API) =====
function playBlowSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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

// ===== BUG FIX 1: Cake Skip Button =====
// Gives user a fallback if they can't blow all 20 candles
$('#cakeSkipBtn')?.addEventListener('click', () => {
  goToSection('wishes');
});

// ===== WISH CARDS (Tap to enlarge) =====
// BUG FIX 4: Guard against opening modal when section is not active
$$('.wish-card').forEach(card => {
  card.addEventListener('click', () => {
    if (currentSection !== 'wishes') return;
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
// BUG FIX 4: Guard against opening modal when section is not active
$$('.polaroid').forEach(card => {
  card.addEventListener('click', () => {
    if (currentSection !== 'memories') return;
    const idx = parseInt(card.dataset.mem);
    const data = memoryData[idx];

    // Get image src — if broken (onerror fired), img has no src
    const imgEl = card.querySelector('img');
    const imgSrc = imgEl.getAttribute('src') || '';

    $('#memModalImg').src = imgSrc;
    $('#memModalImg').alt = data.title;
    // Mirror the same gradient background if image is broken
    $('#memModalImg').style.background = imgEl.style.background || '';
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
    // BUG FIX 2: Use visibility instead of display to avoid Safari flex conflicts
    const nextBtn = $('#secretNext');
    nextBtn.style.visibility = 'visible';
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

  // BUG FIX 3: Wrap in requestAnimationFrame so the CSS transition fires
  // reliably on all mobile browsers (Safari, Chrome iOS, etc.)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      msg.classList.add('show');
    });
  });

  spawnConfetti(60);
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
function spawnConfetti(count = 60) {
  const colors = ['#ff6b9d', '#cdb4db', '#ffd700', '#ff85a2', '#b8a9c9', '#ffc2d1', '#fff'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.5 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * (count > 40 ? 1.2 : 0.5)) + 's';
    piece.style.width = (5 + Math.random() * 8) + 'px';
    piece.style.height = (8 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, count > 40 ? 5000 : 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
});
