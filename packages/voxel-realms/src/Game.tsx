/* eslint-disable */
// @ts-nocheck
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // CSS injection
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; touch-action: none; font-family: 'Georgia', serif; user-select: none; }
      #game-canvas { display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; cursor: crosshair; }
      #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; pointer-events: none; }
      #health-bar { position: absolute; top: 20px; left: 20px; font-size: 24px; text-shadow: 2px 2px 4px #000; letter-spacing: 2px; }
      #score-display { position: absolute; top: 20px; right: 20px; font-size: 20px; color: #ffd700; font-weight: bold; text-shadow: 2px 2px 4px #000; text-align: right; }
      #day-display { color: #fff; font-size: 16px; margin-top: 4px; }
      #damage-vignette {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle, transparent 50%, rgba(255, 0, 0, 0.6) 100%);
        opacity: 0; transition: opacity 0.2s ease-out; z-index: 15; pointer-events: none;
      }
      #death-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(40, 0, 0, 0.85); display: flex; flex-direction: column;
        justify-content: center; align-items: center; z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.5s;
      }
      #death-screen.active { opacity: 1; pointer-events: auto; }
      #death-title { font-size: 64px; color: #ff3333; font-weight: bold; text-shadow: 4px 4px 10px #000; margin-bottom: 20px; letter-spacing: 5px; }
      #death-score { font-size: 24px; color: #ffd700; margin-bottom: 40px; text-shadow: 2px 2px 4px #000; }
      .respawn-btn {
        background: #5d4037; border: 3px solid #d4b886; color: #d4b886; padding: 15px 40px; font-size: 20px;
        border-radius: 8px; cursor: pointer; text-transform: uppercase; font-weight: bold; transition: 0.2s;
      }
      .respawn-btn:hover { background: #4e342e; transform: scale(1.05); }
      #hotbar {
        position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 25; pointer-events: auto;
        display: flex; gap: 6px; background: rgba(33, 33, 33, 0.8); padding: 8px;
        border-radius: 12px; border: 2px solid #212121; box-shadow: 0 8px 16px rgba(0,0,0,0.6); flex-wrap: wrap; justify-content: center;
      }
      .hotbar-slot { width: 44px; height: 44px; border-radius: 6px; border: 3px solid #424242; cursor: pointer; position: relative; transition: transform 0.1s, filter 0.2s; }
      .hotbar-slot:active { transform: scale(0.9); }
      .hotbar-slot.active { border-color: #ffd700; box-shadow: 0 0 10px #ffd700; transform: scale(1.1); z-index: 2; }
      .hotbar-slot.empty { filter: brightness(0.3) grayscale(0.5); }
      .hotbar-label { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); color: white; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 2px black; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
      .hotbar-slot.active .hotbar-label { opacity: 1; }
      .hotbar-count { position: absolute; top: 2px; right: 4px; color: white; font-size: 13px; font-family: monospace; font-weight: bold; text-shadow: 1px 1px 2px black; pointer-events: none; }
      #touch-zone-left, #touch-zone-right { position: absolute; top: 0; width: 50vw; height: 100vh; z-index: 5; }
      #touch-zone-left { left: 0; } #touch-zone-right { right: 0; }
      #dynamic-joy-base { position: absolute; width: 120px; height: 120px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); transform: translate(-50%, -50%); pointer-events: none; display: none; z-index: 10; }
      #dynamic-joy-stick { position: absolute; width: 50px; height: 50px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
      #action-buttons { position: absolute; bottom: 80px; right: 20px; z-index: 20; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .action-btn { width: 60px; height: 60px; border-radius: 50%; background: rgba(62, 39, 35, 0.8); border: 2px solid rgba(212, 184, 134, 0.8); color: #d4b886; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); pointer-events: auto; cursor: pointer; transition: transform 0.1s, background-color 0.2s; }
      .action-btn:active { transform: scale(0.9); filter: brightness(0.8); }
      .action-btn svg { width: 28px; height: 28px; pointer-events: none; }
      @media (hover: hover) and (pointer: fine) { #action-buttons, #touch-zone-left, #touch-zone-right { display: none; } }
      #interaction-log { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(33, 33, 33, 0.85); color: #d4b886; padding: 8px 24px; border-radius: 8px; font-weight: bold; z-index: 20; opacity: 0; transition: opacity 0.3s; pointer-events: none; border: 2px solid #5d4037; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px #000; }
      #crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px; pointer-events: none; z-index: 5; background: radial-gradient(circle, rgba(255,255,255,0.8) 15%, transparent 25%); border: 2px solid rgba(212, 184, 134, 0.6); border-radius: 50%; transition: transform 0.1s; }
      #crosshair.active { transform: translate(-50%, -50%) scale(1.3); border-color: #ffd700; }
      #crosshair.enemy { border-color: #ff3333; background: radial-gradient(circle, rgba(255,50,50,0.8) 15%, transparent 25%); }
      #desktop-hint { position: absolute; top: 80px; left: 20px; color: rgba(255,255,255,0.7); font-size: 12px; pointer-events: none; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px; }
      @media (hover: none) and (pointer: coarse) { #desktop-hint { display: none; } }
    `;
    document.head.appendChild(styleEl);

    // HTML structure
    container.innerHTML = `
      <canvas id="game-canvas"></canvas>
      <div id="damage-vignette"></div>
      <div id="ui-layer">
        <div id="health-bar">❤️❤️❤️❤️❤️</div>
        <div id="score-display">
          <div>Score: <span id="score-val">0</span></div>
          <div id="day-display">Day 1 - Morning</div>
        </div>
        <div id="desktop-hint">Click Canvas to Lock Mouse<br>WASD: Move<br>L Click: Mine<br>R Click: Place Block</div>
        <div id="interaction-log">Action Triggered</div>
        <div id="crosshair"></div>
      </div>
      <div id="death-screen">
        <div id="death-title">YOU DIED</div>
        <div id="death-score">Final Score: 0</div>
        <button class="respawn-btn" id="respawn-btn">Respawn</button>
      </div>
      <div id="hotbar">
        <div class="hotbar-slot active" data-type="stone" style="background: #9E9E9E;">
          <div class="hotbar-count" id="count-stone">0</div><div class="hotbar-label">1</div>
        </div>
        <div class="hotbar-slot" data-type="wood" style="background: #5D4037;">
          <div class="hotbar-count" id="count-wood">0</div><div class="hotbar-label">2</div>
        </div>
        <div class="hotbar-slot" data-type="leaves" style="background: #2E7D32;">
          <div class="hotbar-count" id="count-leaves">0</div><div class="hotbar-label">3</div>
        </div>
        <div class="hotbar-slot" data-type="dirt" style="background: #795548;">
          <div class="hotbar-count" id="count-dirt">0</div><div class="hotbar-label">4</div>
        </div>
        <div class="hotbar-slot" data-type="sand" style="background: #E6C27A;">
          <div class="hotbar-count" id="count-sand">0</div><div class="hotbar-label">5</div>
        </div>
        <div class="hotbar-slot" data-type="torch" style="background: radial-gradient(circle, #ffeb3b 20%, #f57c00 90%);">
          <div class="hotbar-count" id="count-torch">10</div><div class="hotbar-label">6</div>
        </div>
      </div>
      <div id="touch-zone-left"></div>
      <div id="touch-zone-right"></div>
      <div id="dynamic-joy-base"><div id="dynamic-joy-stick"></div></div>
      <div id="action-buttons">
        <div class="action-btn" id="btn-jump" title="Jump"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg></div>
        <div class="action-btn" id="btn-mine" title="Mine/Attack"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.53 4.53l-3.9 3.9a2 2 0 0 0-.5.8l-.8 2.5c-.2.7.5 1.4 1.2 1.2l2.5-.8a2 2 0 0 0 .8-.5l3.9-3.9a2.12 2.12 0 0 0-2.94-2.94z"></path><path d="M12 12l-9 9"></path></svg></div>
        <div class="action-btn" id="btn-crouch" title="Crouch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"></path><path d="M19 12l-7 7-7-7"></path></svg></div>
        <div class="action-btn" id="btn-place" title="Place Selected Block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
      </div>
    `;

    // --- 1. CORE GAME STATE & INVENTORY ---
    const STARTER_KIT = { stone: 0, wood: 0, leaves: 0, dirt: 0, sand: 0, torch: 10 };

    let gameState = {
      health: 5, maxHealth: 5, score: 0, dayCount: 1, isDead: false, dayTime: Math.PI / 4,
      inventory: { ...STARTER_KIT }
    };

    const uiHealth = container.querySelector('#health-bar');
    const uiScore = container.querySelector('#score-val');
    const uiDay = container.querySelector('#day-display');
    const uiVignette = container.querySelector('#damage-vignette');
    const uiDeathScreen = container.querySelector('#death-screen');

    function updateHUD() {
      uiHealth.innerHTML = '❤️'.repeat(gameState.health) + '🖤'.repeat(gameState.maxHealth - gameState.health);
      uiScore.innerText = gameState.score;

      for (let type in gameState.inventory) {
        const countEl = container.querySelector(`#count-${type}`);
        if (countEl) {
          const count = gameState.inventory[type];
          countEl.innerText = count;
          const slot = container.querySelector(`.hotbar-slot[data-type="${type}"]`);
          if (count <= 0) slot.classList.add('empty');
          else slot.classList.remove('empty');
        }
      }
    }

    function takeDamage(amt) {
      if (gameState.isDead) return;
      gameState.health -= amt;
      updateHUD();

      uiVignette.style.opacity = 1;
      setTimeout(() => { if (!gameState.isDead) uiVignette.style.opacity = 0; }, 300);

      if (gameState.health <= 0) {
        gameState.isDead = true;
        uiDeathScreen.classList.add('active');
        container.querySelector('#death-score').innerText = `Final Score: ${gameState.score}`;
        if (document.pointerLockElement === canvas) document.exitPointerLock();
      }
    }

    function addScore(amt) { gameState.score += amt; updateHUD(); }

    function respawn() {
      gameState.health = gameState.maxHealth; gameState.score = 0; gameState.isDead = false;
      gameState.inventory = { ...STARTER_KIT };

      uiDeathScreen.classList.remove('active'); uiVignette.style.opacity = 0;
      creatures.forEach(c => { scene.remove(c); }); creatures.length = 0;
      setPlayerStartLocation(); updateHUD();
    }

    container.querySelector('#respawn-btn').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      respawn();
    });

    // --- 2. BASE THREE.JS SETUP ---
    const canvas = container.querySelector('#game-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const colorDay = new THREE.Color(0x87CEEB);
    const colorNight = new THREE.Color(0x050510);
    const colorUnderwater = new THREE.Color(0x002244);
    scene.background = colorDay.clone();
    scene.fog = new THREE.Fog(colorDay.clone(), 8, 30);

    const camera = new THREE.PerspectiveCamera(
      95,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1, 1000
    );
    const player = new THREE.Group();
    scene.add(player); player.add(camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xfff5b6, 1.2);
    dirLight.position.set(20, 40, 20); dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024; dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -30; dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30; dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);

    const terrainGroup = new THREE.Group(); scene.add(terrainGroup);

    const activeTorches = new Set();
    const torchLights = [];
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(0xffaa00, 1.5, 15);
      light.visible = false; scene.add(light); torchLights.push(light);
    }

    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 4500; i++) starsPos[i] = (Math.random() - 0.5) * 400;
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // --- 3. CHUNKING & BIOMES ---
    const CHUNK_SIZE = 8;
    const RENDER_DIST = 3;

    const materials = {
      grass: new THREE.MeshLambertMaterial({ color: 0x4CAF50 }),
      dirt: new THREE.MeshLambertMaterial({ color: 0x795548 }),
      stone: new THREE.MeshLambertMaterial({ color: 0x9E9E9E }),
      wood: new THREE.MeshLambertMaterial({ color: 0x5D4037 }),
      leaves: new THREE.MeshLambertMaterial({ color: 0x2E7D32 }),
      sand: new THREE.MeshLambertMaterial({ color: 0xE6C27A }),
      snow: new THREE.MeshLambertMaterial({ color: 0xFFFAFA }),
      water: new THREE.MeshLambertMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.65, depthWrite: false, side: THREE.DoubleSide }),
      slime: new THREE.MeshPhongMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85, shininess: 100 }),
      slimeAggro: new THREE.MeshPhongMaterial({ color: 0xff3333, transparent: true, opacity: 0.9, shininess: 100 }),
      torch: new THREE.MeshLambertMaterial({ color: 0xffeb3b, emissive: 0xff8800, emissiveIntensity: 0.8 })
    };
    const blockGeo = new THREE.BoxGeometry(1, 1, 1);

    const activeChunks = new Map();
    const deltaMemory = new Map();
    const creatures = [];

    function getProceduralHeight(wx, wz) {
      let h = Math.sin(wx * 0.08) * 3 + Math.cos(wz * 0.08) * 3; h += Math.sin(wx * 0.2) * 1.5; return Math.floor(h);
    }

    function setPlayerStartLocation() {
      let sx = 0, sz = 0, sy = getProceduralHeight(0, 0); let radius = 1;
      while (sy <= 0 && radius < 50) {
        for (let i = -radius; i <= radius; i++) {
          for (let j = -radius; j <= radius; j++) {
            let tempY = getProceduralHeight(i, j);
            if (tempY > 0) { sx = i; sz = j; sy = tempY; break; }
          }
          if (sy > 0) break;
        }
        radius++;
      }
      player.position.set(sx, sy + 1.9, sz);
    }
    setPlayerStartLocation();

    function generateChunk(cx, cz) {
      const chunkKey = `${cx},${cz}`;
      const chunkGroup = new THREE.Group();
      chunkGroup.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
      const chunkBlueprint = new Map();

      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const wx = cx * CHUNK_SIZE + lx; const wz = cz * CHUNK_SIZE + lz; const wy = getProceduralHeight(wx, wz);
          if (wy < -1) { chunkBlueprint.set(`${lx},${-1},${lz}`, 'water'); chunkBlueprint.set(`${lx},${wy},${lz}`, 'sand'); }
          else if (wy === -1 || wy === 0) { chunkBlueprint.set(`${lx},${wy},${lz}`, 'sand'); chunkBlueprint.set(`${lx},${wy - 1},${lz}`, 'stone'); }
          else if (wy > 4) { chunkBlueprint.set(`${lx},${wy},${lz}`, 'snow'); chunkBlueprint.set(`${lx},${wy - 1},${lz}`, 'stone'); }
          else {
            chunkBlueprint.set(`${lx},${wy},${lz}`, 'grass'); chunkBlueprint.set(`${lx},${wy - 1},${lz}`, 'dirt'); chunkBlueprint.set(`${lx},${wy - 2},${lz}`, 'stone');
            const treeSeed = Math.sin(wx * 12.9898 + wz * 78.233);
            if (treeSeed > 0.97 && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
              chunkBlueprint.set(`${lx},${wy + 1},${lz}`, 'wood'); chunkBlueprint.set(`${lx},${wy + 2},${lz}`, 'wood');
              chunkBlueprint.set(`${lx},${wy + 3},${lz}`, 'leaves'); chunkBlueprint.set(`${lx + 1},${wy + 3},${lz}`, 'leaves');
              chunkBlueprint.set(`${lx - 1},${wy + 3},${lz}`, 'leaves'); chunkBlueprint.set(`${lx},${wy + 3},${lz + 1}`, 'leaves');
              chunkBlueprint.set(`${lx},${wy + 3},${lz - 1}`, 'leaves'); chunkBlueprint.set(`${lx},${wy + 4},${lz}`, 'leaves');
            }
          }
        }
      }

      if (deltaMemory.has(chunkKey)) {
        for (const [blockKey, type] of deltaMemory.get(chunkKey).entries()) {
          if (type === 'air') chunkBlueprint.delete(blockKey); else chunkBlueprint.set(blockKey, type);
        }
      }

      for (const [key, type] of chunkBlueprint.entries()) {
        const [lx, wy, lz] = key.split(',').map(Number);
        const mesh = new THREE.Mesh(blockGeo, materials[type]); mesh.position.set(lx, wy, lz);
        if (type !== 'water') { mesh.castShadow = true; mesh.receiveShadow = true; }
        mesh.userData = { wx: cx * CHUNK_SIZE + lx, wy: wy, wz: cz * CHUNK_SIZE + lz, cx: cx, cz: cz, localKey: key, type: type };
        if (type === 'torch') activeTorches.add(mesh);
        chunkGroup.add(mesh);
      }
      terrainGroup.add(chunkGroup); activeChunks.set(chunkKey, chunkGroup);
    }

    let lastPlayerCX = null; let lastPlayerCZ = null;

    function updateChunks() {
      const playerCX = Math.floor(player.position.x / CHUNK_SIZE);
      const playerCZ = Math.floor(player.position.z / CHUNK_SIZE);
      if (playerCX === lastPlayerCX && playerCZ === lastPlayerCZ) return;
      lastPlayerCX = playerCX; lastPlayerCZ = playerCZ;

      const requiredChunks = new Set();
      for (let dx = -RENDER_DIST; dx <= RENDER_DIST; dx++) {
        for (let dz = -RENDER_DIST; dz <= RENDER_DIST; dz++) requiredChunks.add(`${playerCX + dx},${playerCZ + dz}`);
      }

      for (const [chunkKey, chunkGroup] of activeChunks.entries()) {
        if (!requiredChunks.has(chunkKey)) {
          terrainGroup.remove(chunkGroup);
          chunkGroup.children.forEach(mesh => { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.userData.type === 'torch') activeTorches.delete(mesh); });
          activeChunks.delete(chunkKey);
        }
      }
      for (const chunkKey of requiredChunks) { if (!activeChunks.has(chunkKey)) generateChunk(...chunkKey.split(',').map(Number)); }
    }

    function spawnSlime(wx, wz) {
      const wy = getProceduralHeight(wx, wz) + 1;
      if (wy < 0 || creatures.length > 25) return;
      const slime = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), materials.slime);
      slime.position.set(wx, wy, wz); slime.castShadow = true; scene.add(slime);
      slime.userData = { isCreature: true, isAggro: false, velocityY: 0, moveDir: new THREE.Vector3(0, 0, 0), jumpTimer: Math.random() * 60, dmgCooldown: 0 };
      creatures.push(slime);
    }
    updateChunks();

    // --- 4. INDEPENDENT AXIS CAMERA LOGIC & CONTROLS ---
    let lookYaw = 0; let lookPitch = 0; let recoilActive = 0;

    const inputState = { touchMoveX: 0, touchMoveY: 0, isCrouching: false };
    const keys = { w: false, a: false, s: false, d: false };

    const onKeyDown = (e) => {
      if (gameState.isDead) return;
      if (e.code === 'KeyW') keys.w = true; if (e.code === 'KeyA') keys.a = true;
      if (e.code === 'KeyS') keys.s = true; if (e.code === 'KeyD') keys.d = true;
      if (e.code === 'Space') attemptJump();
      if (e.code === 'ShiftLeft') { inputState.isCrouching = true; }
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) selectHotbarSlot(parseInt(e.key) - 1);
    };
    const onKeyUp = (e) => {
      if (e.code === 'KeyW') keys.w = false; if (e.code === 'KeyA') keys.a = false;
      if (e.code === 'KeyS') keys.s = false; if (e.code === 'KeyD') keys.d = false;
      if (e.code === 'ShiftLeft') inputState.isCrouching = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    canvas.addEventListener('mousedown', (e) => {
      if (gameState.isDead) return;
      if (e.pointerType === 'mouse' && document.pointerLockElement !== canvas) canvas.requestPointerLock();
    });

    const onDocMouseMove = (e) => {
      if (document.pointerLockElement === canvas && !gameState.isDead) {
        lookYaw -= e.movementX * 0.002;
        lookPitch -= e.movementY * 0.002;
        lookPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lookPitch));
      }
    };
    document.addEventListener('mousemove', onDocMouseMove);

    // Touch Control
    const leftZone = container.querySelector('#touch-zone-left');
    const joyBase = container.querySelector('#dynamic-joy-base');
    const joyStick = container.querySelector('#dynamic-joy-stick');
    let leftTouchId = null; let leftStartX = 0, leftStartY = 0; const joyMaxRadius = 60;

    leftZone.addEventListener('pointerdown', (e) => {
      if (gameState.isDead || e.pointerType === 'mouse' || leftTouchId !== null) return;
      leftTouchId = e.pointerId; leftStartX = e.clientX; leftStartY = e.clientY;
      joyBase.style.left = leftStartX + 'px'; joyBase.style.top = leftStartY + 'px';
      joyBase.style.display = 'block'; joyStick.style.transform = `translate(-50%, -50%)`;
      inputState.touchMoveX = 0; inputState.touchMoveY = 0;
    });

    const onPointerMoveLeft = (e) => {
      if (e.pointerId === leftTouchId) {
        let dx = e.clientX - leftStartX; let dy = e.clientY - leftStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > joyMaxRadius) { dx = (dx / dist) * joyMaxRadius; dy = (dy / dist) * joyMaxRadius; }
        joyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        inputState.touchMoveX = dx / joyMaxRadius; inputState.touchMoveY = dy / joyMaxRadius;
      }
    };
    window.addEventListener('pointermove', onPointerMoveLeft);

    const endLeftTouch = (e) => { if (e.pointerId === leftTouchId) { leftTouchId = null; joyBase.style.display = 'none'; inputState.touchMoveX = 0; inputState.touchMoveY = 0; } };
    window.addEventListener('pointerup', endLeftTouch); window.addEventListener('pointercancel', endLeftTouch);

    const rightZone = container.querySelector('#touch-zone-right');
    let rightTouchId = null; let lastLookX = 0, lastLookY = 0;

    rightZone.addEventListener('pointerdown', (e) => {
      if (gameState.isDead || e.pointerType === 'mouse' || rightTouchId !== null) return;
      rightTouchId = e.pointerId; lastLookX = e.clientX; lastLookY = e.clientY;
    });

    const onPointerMoveRight = (e) => {
      if (e.pointerId === rightTouchId && !gameState.isDead) {
        let dx = e.clientX - lastLookX; let dy = e.clientY - lastLookY;
        lastLookX = e.clientX; lastLookY = e.clientY;
        lookYaw -= dx * 0.005;
        lookPitch -= dy * 0.005;
        lookPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lookPitch));
      }
    };
    window.addEventListener('pointermove', onPointerMoveRight);

    const endRightTouch = (e) => { if (e.pointerId === rightTouchId) rightTouchId = null; };
    window.addEventListener('pointerup', endRightTouch); window.addEventListener('pointercancel', endRightTouch);

    // --- 5. INVENTORY & ACTION DYNAMIC UI ---
    let activeBlockType = 'stone';
    const slots = container.querySelectorAll('.hotbar-slot');
    const placeBtn = container.querySelector('#btn-place');

    function selectHotbarSlot(index) {
      if (index < 0 || index >= slots.length) return;
      slots.forEach(s => s.classList.remove('active'));
      slots[index].classList.add('active');
      activeBlockType = slots[index].dataset.type;
      placeBtn.style.background = slots[index].style.background;
    }
    selectHotbarSlot(0);

    slots.forEach((slot, idx) => { slot.addEventListener('pointerdown', (e) => { e.stopPropagation(); selectHotbarSlot(idx); }); });

    const highlightMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.6 }));
    highlightMesh.visible = false; scene.add(highlightMesh);
    const raycaster = new THREE.Raycaster(); const screenCenter = new THREE.Vector2(0, 0);
    let targetBlock = null; let targetFaceNormal = null;
    const crosshairUI = container.querySelector('#crosshair');

    const logUI = container.querySelector('#interaction-log');
    let logTimeout = null;
    function showLog(text) {
      logUI.textContent = text; logUI.style.opacity = 1;
      clearTimeout(logTimeout);
      logTimeout = setTimeout(() => { logUI.style.opacity = 0; }, 1500);
    }

    const particles = [];
    function createDebris(position, material, count = 8) {
      const debrisGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      for (let i = 0; i < count; i++) {
        const particle = new THREE.Mesh(debrisGeo, material);
        particle.position.set(position.x + (Math.random() - 0.5) * 0.8, position.y + (Math.random() - 0.5) * 0.8, position.z + (Math.random() - 0.5) * 0.8);
        particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.15, Math.random() * 0.2 + 0.1, (Math.random() - 0.5) * 0.15);
        particle.userData.spin = new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
        scene.add(particle); particles.push(particle);
      }
    }

    function saveDelta(cx, cz, localKey, type) {
      const chunkKey = `${cx},${cz}`;
      if (!deltaMemory.has(chunkKey)) deltaMemory.set(chunkKey, new Map());
      deltaMemory.get(chunkKey).set(localKey, type);
    }

    function attemptMine() {
      if (gameState.isDead) return;
      recoilActive = 0.1;
      if (targetBlock) {
        if (targetBlock.userData.type === 'water') { return; }
        if (targetBlock.userData.isCreature) {
          createDebris(targetBlock.position, targetBlock.material, 20); scene.remove(targetBlock); creatures.splice(creatures.indexOf(targetBlock), 1);
          addScore(10); showLog('+10 Mana Gem!');
        } else {
          let dropType = targetBlock.userData.type;
          if (dropType === 'grass' || dropType === 'snow') dropType = 'dirt';

          if (gameState.inventory[dropType] !== undefined) {
            gameState.inventory[dropType]++;
            showLog(`+1 ${dropType.toUpperCase()}`);
            updateHUD();
          }

          createDebris(targetBlock.getWorldPosition(new THREE.Vector3()), targetBlock.material, 12);
          saveDelta(targetBlock.userData.cx, targetBlock.userData.cz, targetBlock.userData.localKey, 'air');
          if (targetBlock.userData.type === 'torch') activeTorches.delete(targetBlock);
          targetBlock.parent.remove(targetBlock);
        }
        highlightMesh.visible = false; crosshairUI.classList.remove('enemy'); targetBlock = null;
      }
    }

    function attemptBuild() {
      if (gameState.isDead) return;

      if (gameState.inventory[activeBlockType] <= 0) {
        showLog(`❌ NO ${activeBlockType.toUpperCase()}`);
        return;
      }

      recoilActive = -0.1;
      if (targetBlock && targetFaceNormal && !targetBlock.userData.isCreature) {
        const wPos = targetBlock.getWorldPosition(new THREE.Vector3()).add(targetFaceNormal);
        if (wPos.distanceTo(player.position) < 1.2) return;

        const ncx = Math.floor(wPos.x / CHUNK_SIZE); const ncz = Math.floor(wPos.z / CHUNK_SIZE);
        const lx = wPos.x - (ncx * CHUNK_SIZE); const lz = wPos.z - (ncz * CHUNK_SIZE);
        const localKey = `${lx},${wPos.y},${lz}`;

        saveDelta(ncx, ncz, localKey, activeBlockType);

        gameState.inventory[activeBlockType]--;
        updateHUD();

        const chunkKey = `${ncx},${ncz}`;
        if (activeChunks.has(chunkKey)) {
          const chunkGroup = activeChunks.get(chunkKey);
          const mesh = new THREE.Mesh(blockGeo, materials[activeBlockType]);
          mesh.position.set(lx, wPos.y, lz);
          if (activeBlockType !== 'water') { mesh.castShadow = true; mesh.receiveShadow = true; }
          mesh.userData = { wx: wPos.x, wy: wPos.y, wz: wPos.z, cx: ncx, cz: ncz, localKey: localKey, type: activeBlockType };

          if (activeBlockType === 'torch') activeTorches.add(mesh);
          chunkGroup.add(mesh);
        }
        createDebris(wPos, materials[activeBlockType], 4);
      }
    }

    let velocityY = 0; const defaultGravity = -0.012; let currentGravity = defaultGravity; let knockbackVel = new THREE.Vector3();
    function attemptJump() {
      if (gameState.isDead) return;
      const downRay = new THREE.Raycaster(player.position, new THREE.Vector3(0, -1, 0), 0, 2.5);
      if (downRay.intersectObject(terrainGroup, true).length > 0 || isUnderwater) { velocityY = isUnderwater ? 0.1 : 0.22; }
    }

    container.querySelector('#action-buttons').addEventListener('pointerdown', e => e.stopPropagation());
    container.querySelector('#hotbar').addEventListener('pointerdown', e => e.stopPropagation());

    container.querySelector('#btn-mine').addEventListener('pointerdown', (e) => { e.stopPropagation(); attemptMine(); });
    container.querySelector('#btn-place').addEventListener('pointerdown', (e) => { e.stopPropagation(); attemptBuild(); });
    container.querySelector('#btn-jump').addEventListener('pointerdown', (e) => { e.stopPropagation(); attemptJump(); });
    container.querySelector('#btn-crouch').addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!gameState.isDead) inputState.isCrouching = true; });
    container.querySelector('#btn-crouch').addEventListener('pointerup', () => inputState.isCrouching = false);

    const onDocMouseDown = (e) => {
      if (document.pointerLockElement === canvas) {
        if (e.button === 0) attemptMine();
        if (e.button === 2) attemptBuild();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);

    // --- 6. RENDER & GAME LOOP ---
    const defaultMoveSpeed = 0.15; let currentMoveSpeed = defaultMoveSpeed;
    let bobTimer = 0; let isUnderwater = false;
    let animFrameId;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      updateChunks();

      gameState.dayTime += 0.001;
      if (gameState.dayTime > Math.PI * 2.25) {
        gameState.dayTime = Math.PI / 4; gameState.dayCount++; addScore(50);
        if (gameState.health < gameState.maxHealth) { gameState.health++; updateHUD(); showLog(`☀️ Day ${gameState.dayCount} Begins! (+1 Heart)`); }
        else { showLog(`☀️ Day ${gameState.dayCount} Begins!`); }
      }

      const sunDistance = 50; dirLight.position.set(Math.cos(gameState.dayTime) * sunDistance, Math.sin(gameState.dayTime) * sunDistance, 20);
      const sunHeight = Math.sin(gameState.dayTime); const mixRatio = Math.max(0, Math.min(1, (sunHeight + 0.2) / 0.4));

      const headHeight = camera.getWorldPosition(new THREE.Vector3()).y;
      isUnderwater = headHeight < -0.2;

      if (isUnderwater) {
        scene.background.lerp(colorUnderwater, 0.1); scene.fog.color.copy(scene.background);
        scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, 1, 0.1); scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 10, 0.1);
        currentGravity = defaultGravity * 0.2; currentMoveSpeed = defaultMoveSpeed * 0.5;
      } else {
        scene.background.copy(colorNight).lerp(colorDay, mixRatio); scene.fog.color.copy(scene.background);
        scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, 8, 0.1); scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 30, 0.1);
        currentGravity = defaultGravity; currentMoveSpeed = defaultMoveSpeed;
      }

      ambientLight.intensity = 0.1 + (mixRatio * 0.4); dirLight.intensity = Math.max(0, sunHeight) * 1.5;
      starsMat.opacity = 1.0 - mixRatio; starField.rotation.y += 0.0005;

      let timeText = 'Night';
      if (sunHeight > 0.2) timeText = 'Day';
      else if (sunHeight > -0.2) timeText = 'Dusk/Dawn';
      uiDay.textContent = `Day ${gameState.dayCount} - ${timeText}`;

      if (timeText === 'Night' && Math.random() < 0.02 && creatures.length < 15 && !gameState.isDead) {
        const angle = Math.random() * Math.PI * 2; const dist = 15 + Math.random() * 10;
        spawnSlime(player.position.x + Math.cos(angle) * dist, player.position.z + Math.sin(angle) * dist);
      }

      const sortedTorches = Array.from(activeTorches).sort((a, b) => a.getWorldPosition(new THREE.Vector3()).distanceToSquared(player.position) - b.getWorldPosition(new THREE.Vector3()).distanceToSquared(player.position));
      for (let i = 0; i < 4; i++) {
        if (i < sortedTorches.length) { torchLights[i].position.copy(sortedTorches[i].getWorldPosition(new THREE.Vector3())); torchLights[i].visible = true; }
        else { torchLights[i].visible = false; }
      }

      if (recoilActive !== 0) { recoilActive = THREE.MathUtils.lerp(recoilActive, 0, 0.2); if (Math.abs(recoilActive) < 0.001) recoilActive = 0; }
      player.rotation.y = lookYaw; camera.rotation.x = lookPitch + recoilActive;

      if (!gameState.isDead) {
        let netMoveX = inputState.touchMoveX + (keys.d ? 1 : 0) - (keys.a ? 1 : 0); let netMoveY = inputState.touchMoveY + (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
        const netMag = Math.sqrt(netMoveX * netMoveX + netMoveY * netMoveY); if (netMag > 1) { netMoveX /= netMag; netMoveY /= netMag; }
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), lookYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), lookYaw);
        player.position.addScaledVector(forward, -netMoveY * currentMoveSpeed); player.position.addScaledVector(right, netMoveX * currentMoveSpeed);
      }

      player.position.add(knockbackVel); knockbackVel.lerp(new THREE.Vector3(0, 0, 0), 0.1);

      velocityY += currentGravity; player.position.y += velocityY;
      const targetHeightOffset = inputState.isCrouching ? 1.0 : 1.9;

      const groundRay = new THREE.Raycaster(player.position.clone().add(new THREE.Vector3(0, 0.5, 0)), new THREE.Vector3(0, -1, 0));
      const solidMeshes = [];
      terrainGroup.children.forEach(chunk => chunk.children.forEach(mesh => { if (mesh.userData.type !== 'water') solidMeshes.push(mesh); }));
      const groundHits = groundRay.intersectObjects(solidMeshes, false);

      if (groundHits.length > 0 && groundHits[0].distance < (targetHeightOffset + 0.5)) {
        player.position.y = groundHits[0].point.y + targetHeightOffset; velocityY = 0;
        if (!gameState.isDead && (inputState.touchMoveX || inputState.touchMoveY || keys.w || keys.a || keys.s || keys.d)) { bobTimer += isUnderwater ? 0.15 : 0.25; camera.position.y = Math.sin(bobTimer) * 0.06; }
        else { bobTimer = 0; camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1); }
      } else { camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1); }

      for (let i = 0; i < creatures.length; i++) {
        let c = creatures[i]; c.userData.velocityY += currentGravity * 0.8; c.position.y += c.userData.velocityY;
        const slimeRay = new THREE.Raycaster(c.position.clone().add(new THREE.Vector3(0, 0.5, 0)), new THREE.Vector3(0, -1, 0));
        const sHits = slimeRay.intersectObjects(solidMeshes, false);
        const distToPlayer = c.position.distanceTo(player.position);

        if (distToPlayer < 20 && !gameState.isDead) { c.userData.isAggro = true; c.material = materials.slimeAggro; }
        else { c.userData.isAggro = false; c.material = materials.slime; }

        if (c.userData.dmgCooldown > 0) c.userData.dmgCooldown--;
        if (c.userData.isAggro && distToPlayer < 1.5 && c.userData.dmgCooldown <= 0 && !gameState.isDead) {
          takeDamage(1); c.userData.dmgCooldown = 60;
          const kbDir = player.position.clone().sub(c.position).normalize(); knockbackVel.set(kbDir.x * 0.4, 0.2, kbDir.z * 0.4);
        }

        if (sHits.length > 0 && sHits[0].distance < 0.9) {
          c.position.y = sHits[0].point.y + 0.4; c.userData.velocityY = 0; c.userData.moveDir.set(0, 0, 0);
          c.scale.set(THREE.MathUtils.lerp(c.scale.x, 1, 0.2), THREE.MathUtils.lerp(c.scale.y, 1, 0.2), THREE.MathUtils.lerp(c.scale.z, 1, 0.2));

          c.userData.jumpTimer--;
          if (c.userData.jumpTimer <= 0) {
            c.userData.velocityY = 0.15 + Math.random() * 0.05; let speed = 0.04 + Math.random() * 0.04;
            if (c.userData.isAggro) {
              const dir = player.position.clone().sub(c.position).normalize(); c.userData.moveDir.set(dir.x * speed * 1.5, 0, dir.z * speed * 1.5);
              c.userData.jumpTimer = 20 + Math.random() * 40;
            } else {
              const angle = Math.random() * Math.PI * 2; c.userData.moveDir.set(Math.cos(angle) * speed, 0, Math.sin(angle) * speed);
              c.userData.jumpTimer = 40 + Math.random() * 80;
            }
          }
        } else {
          c.position.add(c.userData.moveDir); let stretch = 1 + Math.abs(c.userData.velocityY) * 3; let squash = 1 - Math.abs(c.userData.velocityY) * 1.5; c.scale.set(squash, stretch, squash);
        }
      }

      if (!gameState.isDead) {
        raycaster.setFromCamera(screenCenter, camera);
        const targetables = [terrainGroup, ...creatures];
        const intersects = raycaster.intersectObjects(targetables, true).filter(hit => hit.distance < 6);

        if (intersects.length > 0) {
          targetBlock = intersects[0].object; targetFaceNormal = intersects[0].face.normal;
          if (targetBlock.userData.isCreature) { highlightMesh.scale.set(0.8, targetBlock.scale.y * 0.8, 0.8); highlightMesh.material.color.setHex(0xff3333); crosshairUI.classList.add('enemy'); }
          else { highlightMesh.scale.set(1, 1, 1); highlightMesh.material.color.setHex(0xffd700); crosshairUI.classList.remove('enemy'); }
          highlightMesh.position.copy(targetBlock.getWorldPosition(new THREE.Vector3())); highlightMesh.visible = true; crosshairUI.classList.add('active');
        } else { targetBlock = null; targetFaceNormal = null; highlightMesh.visible = false; crosshairUI.classList.remove('active', 'enemy'); }
      } else { highlightMesh.visible = false; crosshairUI.classList.remove('active', 'enemy'); }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.position.add(p.userData.velocity); p.rotation.x += p.userData.spin.x; p.rotation.y += p.userData.spin.y; p.rotation.z += p.userData.spin.z;
        p.userData.velocity.y += currentGravity * 0.8; p.scale.multiplyScalar(isUnderwater ? 0.96 : 0.92); if (p.scale.x < 0.05) { scene.remove(p); particles.splice(i, 1); }
      }

      renderer.render(scene, camera);
    }

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    updateHUD();
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(logTimeout);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointermove', onPointerMoveLeft);
      window.removeEventListener('pointermove', onPointerMoveRight);
      window.removeEventListener('pointerup', endLeftTouch);
      window.removeEventListener('pointercancel', endLeftTouch);
      window.removeEventListener('pointerup', endRightTouch);
      window.removeEventListener('pointercancel', endRightTouch);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', onDocMouseMove);
      document.removeEventListener('mousedown', onDocMouseDown);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}
    />
  );
}
