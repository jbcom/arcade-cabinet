/* eslint-disable */
// @ts-nocheck
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // === AUDIO ENGINE ===
    let audioCtx, engineOsc, engineFilter, engineGain;
    let isEngineRunning = false;

    function initAudio() {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      engineOsc = audioCtx.createOscillator();
      engineOsc.type = 'sawtooth';
      engineFilter = audioCtx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 150;
      engineGain = audioCtx.createGain();
      engineGain.gain.value = 0.5;
      engineOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(audioCtx.destination);
      engineOsc.frequency.value = 30;
      engineOsc.start();
      isEngineRunning = true;
    }

    function updateEngineAudio(speedRatio) {
      if (!isEngineRunning || !audioCtx) return;
      const targetFreq = 30 + (speedRatio * 150);
      engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
      engineFilter.frequency.setTargetAtTime(150 + (speedRatio * 400), audioCtx.currentTime, 0.1);
    }

    function playHonkSound() {
      if (!audioCtx) return;
      [350, 460].forEach(freq => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
      });
    }

    // === SHADERS ===
    const curveStrengthVal = 0.0015;
    const applyCurve = (shader) => {
      shader.uniforms.curveStrength = { value: curveStrengthVal };
      shader.vertexShader = `uniform float curveStrength;\n${shader.vertexShader}`.replace(
        `#include <project_vertex>`,
        `vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        float zDist = max(0.0, -mvPosition.z);
        mvPosition.y -= curveStrength * zDist * zDist;
        gl_Position = projectionMatrix * mvPosition;`
      );
    };

    // --- TEXTURES ---
    function createHotWheelsTrackTexture() {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ff6600'; ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#0044ff'; ctx.fillRect(0, 0, 64, 1024); ctx.fillRect(1024 - 64, 0, 64, 1024);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(64, 0, 15, 1024); ctx.fillRect(1024 - 79, 0, 15, 1024);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const laneW = (1024 - 128) / 3;
      for (let y = 0; y < 1024; y += 128) { ctx.fillRect(64 + laneW - 8, y, 16, 64); ctx.fillRect(64 + (laneW*2) - 8, y, 16, 64); }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function createGaugeTexture(text) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(128, 128, 128, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = '900 45px Courier New'; ctx.textAlign = 'center'; ctx.fillText(text, 128, 90);
      ctx.translate(128, 128);
      for (let i = 0; i < 8; i++) { ctx.fillRect(-4, -110, 8, 25); ctx.rotate(Math.PI/4); }
      return new THREE.CanvasTexture(c);
    }

    function createShadowTexture() {
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,0,0,0.6)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }

    // === GAME STATE ===
    let isPlaying = false, speed = 0;
    const maxSpeed = 4.0;
    let distance = 0;
    const goalDistance = 10000;
    let currentLane = 0;
    const laneWidth = 25;
    let carTargetX = 0;
    const obstacles = [];
    let spawnTimer = 0;
    let shakeIntensity = 0;

    // === SCENE ===
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.001);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight), 0.1, 2000);

    // === LIGHTING ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    sunLight.position.set(50, 150, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024; sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.top = 100; sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.left = -100; sunLight.shadow.camera.right = 100;
    scene.add(sunLight);

    // === MATERIALS ===
    const trackTex = createHotWheelsTrackTexture();
    trackTex.repeat.set(1, 20);
    const trackMat = new THREE.MeshStandardMaterial({ map: trackTex, roughness: 0.3, metalness: 0.1 });
    trackMat.onBeforeCompile = applyCurve;

    const carPaintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    carPaintMat.onBeforeCompile = (shader) => {
      shader.vertexShader = `varying vec2 vPaintUv;\n${shader.vertexShader}`.replace(`#include <uv_vertex>`, `#include <uv_vertex> \n vPaintUv = uv;`);
      shader.fragmentShader = `varying vec2 vPaintUv;\n${shader.fragmentShader}`.replace(`vec4 diffuseColor = vec4( diffuse, opacity );`, `
        vec2 st = vPaintUv * 12.0; vec2 id = floor(st); vec2 grid = fract(st) - 0.5; float dist = length(grid);
        vec3 cRed = vec3(0.95, 0.1, 0.2); vec3 cYellow = vec3(1.0, 0.9, 0.0); vec3 cBlue = vec3(0.0, 0.6, 1.0);
        vec3 dotColor = mix(cYellow, cBlue, step(0.5, fract((id.x + id.y) * 0.5)));
        float fw = fwidth(dist); float mask = smoothstep(0.35 + fw, 0.35 - fw, dist);
        vec4 diffuseColor = vec4( mix(cRed, dotColor, mask), opacity );
      `);
    };

    const obstacleMatRed = new THREE.MeshStandardMaterial({ color: 0xff3e3e, roughness: 0.2 }); obstacleMatRed.onBeforeCompile = applyCurve;
    const obstacleMatBlue = new THREE.MeshStandardMaterial({ color: 0x00a8ff, roughness: 0.2 }); obstacleMatBlue.onBeforeCompile = applyCurve;
    const shadowMat = new THREE.MeshBasicMaterial({ map: createShadowTexture(), transparent: true, opacity: 0.8, depthWrite: false }); shadowMat.onBeforeCompile = applyCurve;
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.95 });

    // === WORLD ===
    const skyShader = {
      vertexShader: `varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vWorldPosition; void main() { float h = normalize(vWorldPosition + vec3(0, 300.0, 0)).y; vec3 top = vec3(0.0, 0.4, 1.0); vec3 bot = vec3(0.6, 0.9, 1.0); gl_FragColor = vec4(mix(bot, top, max(pow(max(h, 0.0), 0.8), 0.0)), 1.0); }`
    };
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({ vertexShader: skyShader.vertexShader, fragmentShader: skyShader.fragmentShader, side: THREE.BackSide })));

    const trackWidth = laneWidth * 3 + 20;
    const track = new THREE.Mesh(new THREE.PlaneGeometry(trackWidth, 2500, 32, 120), trackMat);
    track.rotation.x = -Math.PI / 2; track.position.set(0, 0, -500); track.receiveShadow = true;
    scene.add(track);

    const bannerGroup = new THREE.Group();
    bannerGroup.position.set(0, 0, -1000); bannerGroup.visible = false;
    const postGeo = new THREE.CylinderGeometry(1.5, 1.5, 50);
    const post1 = new THREE.Mesh(postGeo, chromeMat); post1.position.set(-45, 25, 0); bannerGroup.add(post1);
    const post2 = new THREE.Mesh(postGeo, chromeMat); post2.position.set(45, 25, 0); bannerGroup.add(post2);
    const bCanvas = document.createElement('canvas'); bCanvas.width = 1024; bCanvas.height = 256;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#111'; bCtx.fillRect(0, 0, 1024, 256); bCtx.fillStyle = '#ffd700'; bCtx.font = '900 120px Courier New'; bCtx.textAlign = 'center'; bCtx.fillText("FINISH LINE!", 512, 170);
    const bannerMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bCanvas) }); bannerMat.onBeforeCompile = applyCurve;
    const bannerPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 18), bannerMat); bannerPlane.position.set(0, 42, 0); bannerGroup.add(bannerPlane);
    scene.add(bannerGroup);

    // === THE COCKPIT RIG ===
    const carRig = new THREE.Group(); scene.add(carRig);
    camera.position.set(0, 10, 20); camera.rotation.x = -0.15; carRig.add(camera);
    const cockpitGroup = new THREE.Group(); camera.add(cockpitGroup);
    cockpitGroup.add(new THREE.PointLight(0xffffff, 0.5, 20)).position.set(0, 2, 2);
    cockpitGroup.scale.setScalar(0.25);
    cockpitGroup.position.set(0, -2.2, -6);

    const arch = new THREE.Mesh(new THREE.TorusGeometry(18, 1.2, 16, 64, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 }));
    arch.position.set(0, 0, -4); cockpitGroup.add(arch);
    const dashPanel = new THREE.Mesh(new THREE.BoxGeometry(45, 12, 4), new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 }));
    dashPanel.rotation.x = -0.4; dashPanel.position.set(0, -4.5, -2); cockpitGroup.add(dashPanel);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 32, 0, Math.PI*2, 0, Math.PI/2), carPaintMat);
    hood.scale.set(1.2, 0.35, 1.5); hood.position.set(0, -1, -12); cockpitGroup.add(hood);

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0, -0.5, 0); wheelGroup.rotation.x = -0.3; cockpitGroup.add(wheelGroup);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x222222 })); column.rotation.x = Math.PI/2; column.position.z = -2; wheelGroup.add(column);
    wheelGroup.add(new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.6, 16, 32), new THREE.MeshStandardMaterial({ color: 0x9c27b0, roughness: 0.2 })));
    wheelGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6.8), chromeMat));
    const spoke2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6.8), chromeMat); spoke2.rotation.z = Math.PI/2; wheelGroup.add(spoke2);
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 32), new THREE.MeshStandardMaterial({ color: 0xff3e3e, roughness: 0.2 }));
    horn.rotation.x = Math.PI / 2; horn.position.z = 0.3; wheelGroup.add(horn);

    const createGauge = (text, xPos) => {
      const gGroup = new THREE.Group(); gGroup.position.set(xPos, -2.0, -0.5); gGroup.rotation.x = -0.4;
      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 32), chromeMat); bezel.rotation.x = Math.PI/2; gGroup.add(bezel);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.0), new THREE.MeshBasicMaterial({ map: createGaugeTexture(text) })); face.position.z = 0.21; gGroup.add(face);
      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.08), new THREE.MeshBasicMaterial({ color: 0xff0000 })); needle.position.set(0, 0, 0.25); needle.geometry.translate(0, 0.8, 0); gGroup.add(needle);
      cockpitGroup.add(gGroup); return needle;
    };
    const needleRPM = createGauge("RPM", -8); const needleSpeed = createGauge("MPH", 8);

    const mirrorGroup = new THREE.Group(); mirrorGroup.position.set(0, 16, -2); cockpitGroup.add(mirrorGroup);
    mirrorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(6, 2.0, 0.4), new THREE.MeshStandardMaterial({ color: 0x444444 })));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.0 })); glass.position.z = 0.21; mirrorGroup.add(glass);
    const diceGroup = new THREE.Group(); diceGroup.position.set(1.5, -1, 0); mirrorGroup.add(diceGroup);
    diceGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.0), new THREE.MeshBasicMaterial({ color: 0xffffff })).translateY(-1.5));
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x00a8ff, roughness: 0.8 })); d1.position.set(-0.3, -3.0, 0); d1.rotation.set(1, 2, 3); diceGroup.add(d1);
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff3e3e, roughness: 0.8 })); d2.position.set(0.5, -2.4, 0.5); d2.rotation.set(3, 2, 1); diceGroup.add(d2);

    // === UI OVERLAYS ===
    const hud = document.createElement('div');
    hud.style.cssText = 'display:none;position:absolute;top:20px;left:20px;color:white;font-size:clamp(18px,5vw,28px);font-weight:900;text-shadow:2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000;pointer-events:none;z-index:10;font-family:Courier New,monospace;';
    hud.innerHTML = 'DIST: <span id="mt-dist" style="color:#ffd700;">0</span>m<br>SPEED: <span id="mt-speed" style="color:#ffd700;">0</span> mph';
    container.appendChild(hud);

    function mkOverlay(id, html, display='flex') {
      const d = document.createElement('div');
      d.id = id;
      d.style.cssText = `display:${display};position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);flex-direction:column;justify-content:center;align-items:center;color:white;z-index:100;font-family:Courier New,monospace;`;
      d.innerHTML = html;
      container.appendChild(d);
      return d;
    }
    const btnStyle = 'padding:20px 60px;font-size:28px;font-weight:900;background:#ff3e3e;color:white;border:4px solid white;border-radius:15px;cursor:pointer;text-transform:uppercase;font-family:Courier New,monospace;';
    const startScreen = mkOverlay('mt-start', `<h1 style="font-size:clamp(50px,12vw,80px);color:#ff3e3e;text-shadow:4px 4px 0 #fff;margin-bottom:10px;text-align:center;">MEGA TRACK</h1><p style="font-size:clamp(20px,6vw,28px);color:#ffd700;margin-bottom:40px;text-align:center;">Avoid obstacles. Reach the end.</p><button id="mt-start-btn" style="${btnStyle}">Start Engine</button>`);
    const gameOverScreen = mkOverlay('mt-gameover', `<h1 id="mt-title" style="font-size:clamp(50px,12vw,80px);color:#ff3e3e;text-shadow:4px 4px 0 #fff;margin-bottom:10px;text-align:center;">WIPEOUT!</h1><p id="mt-desc" style="font-size:clamp(20px,6vw,28px);color:#ffd700;margin-bottom:40px;text-align:center;">You hit an obstacle.</p><button id="mt-restart-btn" style="${btnStyle.replace('background:#ff3e3e','background:#00a8ff').replace('#cc0000','#0055ff')}">Drive Again</button>`, 'none');

    function getElementById(id) { return container.querySelector('#' + id); }

    function handleResize() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      if (w / h < 1) { camera.fov = 90; cockpitGroup.position.set(0, -2.8, -6); cockpitGroup.scale.setScalar(0.22); }
      else { camera.fov = 75; cockpitGroup.position.set(0, -2.2, -6); cockpitGroup.scale.setScalar(0.25); }
      camera.updateProjectionMatrix(); renderer.setSize(w, h);
    }

    function spawnObstacle() {
      const isRed = Math.random() > 0.5;
      const mat = isRed ? obstacleMatRed : obstacleMatBlue;
      const isBox = Math.random() > 0.5;
      const obsGeo = isBox ? new THREE.BoxGeometry(8, 8, 8) : new THREE.SphereGeometry(5, 32, 32);
      const obs = new THREE.Mesh(obsGeo, mat); obs.castShadow = true;
      const lane = Math.floor(Math.random() * 3) - 1;
      obs.position.set(lane * laneWidth, isBox ? 4 : 5, -1200);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), shadowMat);
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = (isBox ? -3.9 : -4.9); obs.add(shadow);
      obs.userData = { active: true };
      scene.add(obs); obstacles.push(obs);
    }

    function gameOver(won) {
      isPlaying = false;
      shakeIntensity = 3.0;
      if (engineGain) engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
      setTimeout(() => {
        gameOverScreen.style.display = 'flex';
        const title = getElementById('mt-title'); const desc = getElementById('mt-desc'); const btn = getElementById('mt-restart-btn');
        if (title) { title.innerText = won ? "YOU WIN!" : "WIPEOUT!"; title.style.color = won ? "#ffd700" : "#ff3e3e"; }
        if (desc) desc.innerText = won ? 'Crossed the finish line!' : `Crashed at ${Math.floor(distance)}m.`;
        if (btn) btn.innerText = won ? "PLAY AGAIN" : "DRIVE AGAIN";
      }, 800);
    }

    function startGame() {
      startScreen.style.display = 'none';
      gameOverScreen.style.display = 'none';
      hud.style.display = 'block';
      if (!audioCtx) initAudio();
      if (engineGain) engineGain.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.1);
      obstacles.forEach(obs => scene.remove(obs)); obstacles.length = 0;
      distance = 0; speed = 0; currentLane = 0; carTargetX = 0; shakeIntensity = 0;
      carRig.position.set(0, 0, 0); carRig.rotation.set(0, 0, 0);
      bannerGroup.visible = false; bannerGroup.position.z = -1000;
      isPlaying = true;
    }

    function createHonkEffect(x, y) {
      const honk = document.createElement('div');
      honk.style.cssText = `position:absolute;color:#ff3e3e;font-size:clamp(40px,10vw,60px);font-weight:900;text-shadow:3px 3px 0 #fff,-2px -2px 0 #fff;pointer-events:none;z-index:50;left:${x}px;top:${y}px;font-family:Courier New,monospace;animation:floatUp 0.6s ease-out forwards;`;
      honk.textContent = 'HONK!';
      container.appendChild(honk);
      setTimeout(() => { if (honk.parentNode) honk.parentNode.removeChild(honk); }, 600);
    }

    // Add float-up animation style
    const styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes floatUp { 0%{opacity:1;transform:translate(-50%,0) scale(0.5) rotate(-10deg)} 50%{transform:translate(-50%,-50px) scale(1.2) rotate(10deg)} 100%{opacity:0;transform:translate(-50%,-100px) scale(1) rotate(0deg)} }';
    container.appendChild(styleEl);

    // === INPUT ===
    container.addEventListener('click', (e) => {
      if (e.target.id === 'mt-start-btn') startGame();
      if (e.target.id === 'mt-restart-btn') startGame();
    });

    let isDragging = false, startX = 0;
    const swipeThreshold = window.innerWidth * 0.08;
    const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();

    function handleStart(x, y) {
      if (!isPlaying) return;
      isDragging = true; startX = x;
      mouse.x = (x / (container.clientWidth || window.innerWidth)) * 2 - 1;
      mouse.y = -((y / (container.clientHeight || window.innerHeight)) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cockpitGroup.children, true);
      if (intersects.find(i => i.object === horn)) {
        horn.scale.set(0.9, 0.8, 0.9);
        createHonkEffect(x, y); playHonkSound();
        setTimeout(() => horn.scale.set(1, 1, 1), 150);
      }
    }

    function handleMove(x) {
      if (!isDragging || !isPlaying) return;
      const deltaX = x - startX;
      if (deltaX > swipeThreshold) { if (currentLane < 1) currentLane++; carTargetX = currentLane * laneWidth; startX = x; }
      else if (deltaX < -swipeThreshold) { if (currentLane > -1) currentLane--; carTargetX = currentLane * laneWidth; startX = x; }
    }

    const onMousedown = (e) => handleStart(e.clientX, e.clientY);
    const onMousemove = (e) => handleMove(e.clientX);
    const onMouseup = () => isDragging = false;
    const onTouchstart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchmove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    const onTouchend = () => isDragging = false;
    const onKeydown = (e) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { if (currentLane > -1) currentLane--; }
      else if (e.key === 'ArrowRight' || e.key === 'd') { if (currentLane < 1) currentLane++; }
      carTargetX = currentLane * laneWidth;
    };
    const onResize = () => handleResize();

    window.addEventListener('mousedown', onMousedown);
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('mouseup', onMouseup);
    window.addEventListener('touchstart', onTouchstart, { passive: false });
    window.addEventListener('touchmove', onTouchmove, { passive: false });
    window.addEventListener('touchend', onTouchend);
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', onResize);

    handleResize();

    // === MAIN LOOP ===
    const clock = new THREE.Clock();
    let baseRigPos = new THREE.Vector3(0, 0, 0);
    let animFrameId;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const rawDelta = clock.getDelta();
      const delta = Math.min(rawDelta, 0.1);
      const timeScale = delta * 60.0;

      if (isPlaying) {
        if (speed < maxSpeed) speed += (delta * 1.5);
        const moveStep = speed * timeScale;
        distance += moveStep;
        const speedRatio = speed / maxSpeed;

        const distEl = getElementById('mt-dist'); const speedEl = getElementById('mt-speed');
        if (distEl) distEl.innerText = Math.floor(distance);
        if (speedEl) speedEl.innerText = Math.floor(speedRatio * 120);

        updateEngineAudio(speedRatio);
        trackTex.offset.y -= moveStep * 0.015;

        const steerDiff = carTargetX - carRig.position.x;
        carRig.position.x += steerDiff * 0.25 * timeScale;
        carRig.rotation.z = steerDiff * -0.015;
        carRig.rotation.y = steerDiff * -0.01;
        wheelGroup.rotation.z = steerDiff * -0.15;
        carRig.position.y = Math.cos(time * 60 * speedRatio) * 0.05 * speedRatio;
        baseRigPos.copy(carRig.position);

        spawnTimer -= moveStep;
        if (spawnTimer <= 0) { spawnObstacle(); spawnTimer = 100 + Math.random() * 60; }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.position.z += moveStep;
          if (obs.geometry.type === "BoxGeometry") { obs.rotation.x -= moveStep * 0.03; obs.rotation.y += moveStep * 0.02; }
          else { obs.rotation.x -= moveStep * 0.05; }
          if (obs.userData.active && obs.position.z > 0 && obs.position.z < 15) {
            if (Math.abs(obs.position.x - carRig.position.x) < 8.5) { obs.userData.active = false; gameOver(false); }
          }
          if (obs.position.z > 40) { scene.remove(obs); obstacles.splice(i, 1); }
        }

        if (distance > goalDistance) {
          if (!bannerGroup.visible) { bannerGroup.visible = true; bannerGroup.position.z = -1000; }
          bannerGroup.position.z += moveStep;
          if (bannerGroup.position.z > -10) gameOver(true);
        }

        needleSpeed.rotation.z = -Math.PI/4 + (speedRatio) * (Math.PI/2 * 1.5);
        needleRPM.rotation.z = -Math.PI/4 + (Math.sin(time*20) * 0.1 * speedRatio);
        diceGroup.rotation.z = (steerDiff * 0.05) + Math.sin(time * 5) * 0.1 * speedRatio;
        diceGroup.rotation.x = Math.cos(time * 4) * 0.1 * speedRatio;
      }

      if (shakeIntensity > 0) {
        carRig.position.x = baseRigPos.x + (Math.random() - 0.5) * shakeIntensity;
        carRig.position.y = baseRigPos.y + (Math.random() - 0.5) * shakeIntensity;
        carRig.rotation.z += (Math.random() - 0.5) * shakeIntensity * 0.1;
        shakeIntensity *= 0.85;
        if (shakeIntensity < 0.01) { shakeIntensity = 0; carRig.position.copy(baseRigPos); }
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousedown', onMousedown);
      window.removeEventListener('mousemove', onMousemove);
      window.removeEventListener('mouseup', onMouseup);
      window.removeEventListener('touchstart', onTouchstart);
      window.removeEventListener('touchmove', onTouchmove);
      window.removeEventListener('touchend', onTouchend);
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#87ceeb' }} />;
}
