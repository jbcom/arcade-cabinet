/* eslint-disable */
// @ts-nocheck
import { useRef, useEffect } from 'react';

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'oc-canvas';
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resizeCanvas() { canvas.width = container.clientWidth || window.innerWidth; canvas.height = container.clientHeight || window.innerHeight; }
    resizeCanvas();

    // Create joystick elements
    const joystickZone = document.createElement('div');
    joystickZone.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:auto;z-index:10;display:none;';
    container.appendChild(joystickZone);

    const joyBase = document.createElement('div');
    joyBase.style.cssText = 'position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:20;';
    const joyKnob = document.createElement('div');
    joyKnob.style.cssText = 'position:absolute;width:50px;height:50px;border-radius:50%;background:rgba(59,130,246,0.8);box-shadow:0 0 10px rgba(0,0,0,0.5);transform:translate(-50%,-50%);pointer-events:none;left:50%;top:50%;';
    joyBase.appendChild(joyKnob);
    container.appendChild(joyBase);

    // Create fade screen
    const fadeScreen = document.createElement('div');
    fadeScreen.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#1a202c;z-index:40;opacity:0;pointer-events:none;transition:opacity 0.5s ease;';
    container.appendChild(fadeScreen);

    // Create HUD
    const hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;top:0;left:0;width:100%;display:none;flex-direction:column;padding:1rem;z-index:30;pointer-events:none;font-family:Segoe UI,sans-serif;';
    hud.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem;">
          <h2 style="color:white;font-weight:bold;font-size:1.1rem;letter-spacing:0.05em;text-transform:uppercase;background:linear-gradient(to right,#60a5fa,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">The Salad Sprint</h2>
          <div id="oc-objective" style="color:#d1d5db;font-size:0.875rem;font-weight:500;">Objective: Find the Kudzu Ball</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;">
          <button id="oc-skip-tut" style="display:none;pointer-events:auto;background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);color:#d1d5db;font-size:0.75rem;font-weight:bold;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;">Skip Tutorial ⏭</button>
          <div id="oc-chrono-container" style="background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.5rem 1rem;display:flex;align-items:center;gap:0.5rem;">
            <span id="oc-chronometer" style="color:white;font-family:monospace;font-size:1.5rem;font-weight:bold;">00:00.00</span>
          </div>
        </div>
      </div>`;
    container.appendChild(hud);

    // Floating UI (ball health)
    const floatingUI = document.createElement('div');
    floatingUI.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:none;z-index:25;';
    const ballHealthContainer = document.createElement('div');
    ballHealthContainer.id = 'oc-ball-health';
    ballHealthContainer.style.cssText = 'position:absolute;transform:translate(-50%,-100%);padding-bottom:1rem;display:none;';
    ballHealthContainer.innerHTML = '<div style="font-size:0.75rem;color:white;text-align:center;font-weight:bold;margin-bottom:0.25rem;text-shadow:0 1px 2px black;">Kudzu Mass</div><div style="background:#ef4444;width:100px;height:8px;border-radius:4px;overflow:hidden;border:1px solid #374151;"><div id="oc-health-fill" style="background:#22c55e;height:100%;width:100%;transition:width 0.1s;"></div></div>';
    floatingUI.appendChild(ballHealthContainer);
    container.appendChild(floatingUI);

    // Bark button
    const barkBtn = document.createElement('button');
    barkBtn.id = 'oc-bark-btn';
    barkBtn.style.cssText = 'display:none;position:absolute;bottom:1.5rem;right:1.5rem;width:5rem;height:5rem;background:rgba(59,130,246,0.8);border-radius:50%;border:4px solid #93c5fd;box-shadow:0 0 20px rgba(59,130,246,0.5);color:white;font-weight:bold;cursor:pointer;pointer-events:auto;z-index:30;flex-direction:column;align-items:center;justify-content:center;font-size:1.5rem;';
    barkBtn.innerHTML = '<span style="font-size:1.5rem;">🔊</span><span style="font-size:0.625rem;text-transform:uppercase;letter-spacing:0.05em;margin-top:0.125rem;">Bark</span>';
    container.appendChild(barkBtn);

    // Start Screen
    const startScreen = document.createElement('div');
    startScreen.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(17,24,39,0.9);z-index:50;display:flex;align-items:center;justify-content:center;pointer-events:auto;transition:opacity 0.5s;font-family:Segoe UI,sans-serif;';
    startScreen.innerHTML = `
      <div style="background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:1.25rem;padding:2.5rem;max-width:28rem;width:90%;text-align:center;">
        <h1 style="font-size:3.5rem;font-weight:900;background:linear-gradient(135deg,#60a5fa,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem;">Otterly</h1>
        <h1 style="font-size:3.5rem;font-weight:900;color:white;margin-bottom:2rem;">Chaotic</h1>
        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem;">
          <button id="oc-btn-tutorial" style="padding:1rem;background:linear-gradient(to right,#3b82f6,#10b981);color:white;font-weight:bold;border-radius:0.75rem;font-size:1.25rem;border:none;cursor:pointer;width:100%;">Play Tutorial</button>
          <button id="oc-btn-skip" style="padding:0.75rem;background:#374151;border:1px solid #6b7280;color:#e5e7eb;font-weight:bold;border-radius:0.75rem;font-size:1.125rem;cursor:pointer;width:100%;">Skip to Main Game</button>
        </div>
      </div>`;
    container.appendChild(startScreen);

    // Game Over Screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(127,29,29,0.9);z-index:50;display:none;align-items:center;justify-content:center;pointer-events:auto;font-family:Segoe UI,sans-serif;';
    gameOverScreen.innerHTML = `
      <div style="background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:1.25rem;padding:2.5rem;max-width:28rem;width:90%;text-align:center;">
        <h1 style="font-size:2.5rem;font-weight:900;color:#f87171;margin-bottom:1rem;">MUNCHED!</h1>
        <p style="color:#e5e7eb;margin-bottom:2rem;">The goats ate the entire Kudzu ball.</p>
        <button id="oc-retry-btn" style="padding:0.75rem 2rem;background:#ef4444;color:white;font-weight:bold;border-radius:0.75rem;border:none;cursor:pointer;font-size:1.125rem;">Try Again</button>
      </div>`;
    container.appendChild(gameOverScreen);

    // Win Screen
    const winScreen = document.createElement('div');
    winScreen.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(30,58,138,0.9);z-index:50;display:none;align-items:center;justify-content:center;pointer-events:auto;font-family:Segoe UI,sans-serif;';
    winScreen.innerHTML = `
      <div style="background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:1.25rem;padding:2.5rem;max-width:28rem;width:90%;text-align:center;">
        <h1 style="font-size:2.5rem;font-weight:900;color:#34d399;margin-bottom:0.5rem;">TRIBUTE PAID</h1>
        <p style="color:#e5e7eb;margin-bottom:1.5rem;">You delivered the salad!</p>
        <div style="background:rgba(0,0,0,0.5);border-radius:0.5rem;padding:1rem;margin-bottom:2rem;">
          <div style="font-size:0.875rem;color:#9ca3af;">Final Time</div>
          <div id="oc-final-time" style="font-size:1.875rem;font-family:monospace;font-weight:bold;color:white;">00:00.00</div>
          <div style="font-size:0.875rem;color:#9ca3af;margin-top:0.5rem;">Salad Remaining</div>
          <div id="oc-final-health" style="font-size:1.25rem;font-weight:bold;color:#34d399;">100%</div>
        </div>
        <button id="oc-play-again-btn" style="padding:0.75rem 2rem;background:#10b981;color:white;font-weight:bold;border-radius:0.75rem;border:none;cursor:pointer;font-size:1.125rem;">Play Again</button>
      </div>`;
    container.appendChild(winScreen);

    // Helper
    function $id(id) { return container.querySelector('#' + id); }

    // === GAME STATE ===
    let gameState = 'START';
    let currentMode = 'MAIN';
    let tutPhase = 'MOVE';
    let tutTimer = 0;
    let lastTime = 0;
    let timeElapsed = 0;
    let camera = { x: 0, y: 0, zoom: 1 };
    let cameraShake = 0;
    let winDelayTimer = 0;
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, " ": false };
    let barkTriggered = false;
    let joy = { active: false, originX: 0, originY: 0, currX: 0, currY: 0, dx: 0, dy: 0, maxR: 60 };

    let WORLD_WIDTH = 2500, WORLD_HEIGHT = 1800;
    let otter, ball, goats, waterZones, targetZone, particles, rocks, decorations;

    function initEntities(mode) {
      currentMode = mode;
      otter = { vx: 0, vy: 0, radius: 30, baseAccel: 1.8, friction: 0.75, maxSpeed: 9.5, barkCooldown: 0, barkMaxCooldown: 1500, barkRadius: 350, isBarking: false, barkTimer: 0, trail: [] };
      ball = { vx: 0, vy: 0, baseRadius: 65, radius: 65, friction: 0.92, maxHealth: 100, health: 100, mass: 1 };
      waterZones = []; rocks = []; decorations = []; particles = []; goats = [];

      if (mode === 'TUTORIAL') {
        WORLD_WIDTH = 1200; WORLD_HEIGHT = 1000;
        otter.x = 200; otter.y = 800;
        targetZone = { x: 800, y: 300, radius: 150 };
        ball.radius = 0; ball.x = 500; ball.y = 600;
        goats.push({ id: 'elder', x: 800, y: 100, vx: 0, vy: 0, radius: 45, speed: 2.5, state: 'WAITING', faintTimer: 0, color: '#cbd5e1', hornSize: 25, beard: true, dialogue: "Use WASD or drag the screen to walk over here." });
        rocks.push({ x: 650, y: 400, radius: 60, offsets: Array(8).fill(1).map(() => Math.random()*0.2+0.9) });
        rocks.push({ x: 780, y: 480, radius: 60, offsets: Array(8).fill(1).map(() => Math.random()*0.2+0.9) });
        for (let i = 0; i < 50; i++) decorations.push({ x: Math.random()*WORLD_WIDTH, y: Math.random()*WORLD_HEIGHT, type: 'grass', size: 1 });
      } else {
        WORLD_WIDTH = 2500; WORLD_HEIGHT = 1800;
        otter.x = 300; otter.y = WORLD_HEIGHT - 300;
        ball.x = 600; ball.y = WORLD_HEIGHT - 600;
        targetZone = { x: WORLD_WIDTH - 400, y: 400, radius: 250 };
        goats = [
          { id: 'billy', x: 1000, y: WORLD_HEIGHT-700, vx:0, vy:0, radius:35, speed:3.5, state:'CHASING', faintTimer:0, color:'#e2e8f0', hornSize:15, dialogue:null },
          { id: 'elder', x: WORLD_WIDTH-400, y:400, vx:0, vy:0, radius:45, speed:2.5, state:'WAITING', faintTimer:0, color:'#cbd5e1', hornSize:25, beard:true, dialogue:null }
        ];
        rocks.push({ x: targetZone.x-250, y: targetZone.y+100, radius:90, offsets: Array(8).fill(1).map(()=>Math.random()*0.2+0.9) });
        rocks.push({ x: targetZone.x-50, y: targetZone.y+250, radius:90, offsets: Array(8).fill(1).map(()=>Math.random()*0.2+0.9) });
        for (let i = 0; i < 20; i++) waterZones.push({ x:300+Math.random()*(WORLD_WIDTH-600), y:300+Math.random()*(WORLD_HEIGHT-600), r:80+Math.random()*140 });
        for (let i = 0; i < 40; i++) {
          let rx = Math.random()*WORLD_WIDTH, ry = Math.random()*WORLD_HEIGHT;
          if (Math.hypot(rx-otter.x,ry-otter.y)>250 && Math.hypot(rx-ball.x,ry-ball.y)>250 && Math.hypot(rx-targetZone.x,ry-targetZone.y)>350) {
            rocks.push({ x:rx, y:ry, radius:30+Math.random()*50, offsets:Array(8).fill(1).map(()=>Math.random()*0.4+0.8) });
          }
        }
        for (let i = 0; i < 200; i++) decorations.push({ x:Math.random()*WORLD_WIDTH, y:Math.random()*WORLD_HEIGHT, type:Math.random()>0.8?'flower':'grass', size:0.5+Math.random()*1.5 });
      }
    }

    function update(deltaTime) {
      if (gameState === 'WIN_ANIMATION') {
        updateParticles(deltaTime);
        if (cameraShake > 0) cameraShake *= 0.9;
        winDelayTimer -= deltaTime;
        if (winDelayTimer <= 0) endGame('WIN');
        return;
      }
      if (gameState !== 'PLAYING' && gameState !== 'TUTORIAL') return;
      if (gameState === 'PLAYING') timeElapsed += deltaTime;

      let elder = goats.find(g => g.id === 'elder');
      if (gameState === 'TUTORIAL') {
        tutTimer += deltaTime;
        let distToElder = Math.hypot(otter.x - elder.x, otter.y - elder.y);
        if (tutPhase === 'MOVE' && distToElder < 400) {
          tutPhase = 'PUSH'; elder.dialogue = "Good! Now push this practice Salad Ball into my gravity crater.";
          ball.radius = ball.baseRadius; createParticles(ball.x, ball.y, '#22c55e', 20); cameraShake = 5;
          ballHealthContainer.style.display = 'block';
        } else if (tutPhase === 'PUSH' && Math.hypot(ball.x-targetZone.x,ball.y-targetZone.y) < targetZone.radius*0.5) {
          tutPhase = 'STUN'; elder.dialogue = "Uh oh! My hungry nephew Billy is here! Tap BARK or RAM him to stun him!";
          goats.push({ id:'billy', x:200, y:200, vx:0, vy:0, radius:35, speed:3.0, state:'CHASING', faintTimer:0, color:'#e2e8f0', hornSize:15 });
          createParticles(200, 200, '#e2e8f0', 20);
        } else if (tutPhase === 'STUN') {
          let billy = goats.find(g => g.id === 'billy');
          if (billy && billy.state === 'FAINTED') { tutPhase = 'DONE'; tutTimer = 0; elder.dialogue = "Excellent! Now, prepare for the real Chaos Sprint!"; }
        } else if (tutPhase === 'DONE' && tutTimer > 3000) { startMainGame(); }
      }

      let inWater = false;
      for (let w of waterZones) { if (Math.hypot(otter.x-w.x, otter.y-w.y) < w.r) { inWater = true; break; } }
      let moveX = 0, moveY = 0;
      if (keys.w || keys.ArrowUp) moveY -= 1;
      if (keys.s || keys.ArrowDown) moveY += 1;
      if (keys.a || keys.ArrowLeft) moveX -= 1;
      if (keys.d || keys.ArrowRight) moveX += 1;
      if (moveX !== 0 || moveY !== 0) { let len = Math.hypot(moveX,moveY); moveX/=len; moveY/=len; }
      if (joy.active) { moveX = joy.dx; moveY = joy.dy; }
      let currentAccel = inWater ? 2.5 : otter.baseAccel;
      let currentFriction = inWater ? 0.90 : otter.friction;
      let maxS = inWater ? 13 : otter.maxSpeed;
      otter.vx += moveX*currentAccel; otter.vy += moveY*currentAccel;
      otter.vx *= currentFriction; otter.vy *= currentFriction;
      let spd = Math.hypot(otter.vx, otter.vy);
      if (spd > maxS) { otter.vx = (otter.vx/spd)*maxS; otter.vy = (otter.vy/spd)*maxS; }
      otter.x += otter.vx; otter.y += otter.vy;
      otter.x = Math.max(otter.radius, Math.min(WORLD_WIDTH-otter.radius, otter.x));
      otter.y = Math.max(otter.radius, Math.min(WORLD_HEIGHT-otter.radius, otter.y));
      if (spd > 1.5) { otter.trail.unshift({x:otter.x,y:otter.y,life:1.0,water:inWater}); if (otter.trail.length>20) otter.trail.pop(); }
      for (let i = 0; i < otter.trail.length; i++) otter.trail[i].life -= deltaTime*0.004;
      otter.trail = otter.trail.filter(t => t.life > 0);

      if (otter.barkCooldown > 0) otter.barkCooldown -= deltaTime;
      if (barkTriggered && otter.barkCooldown <= 0) {
        otter.barkCooldown = otter.barkMaxCooldown; otter.isBarking = true; otter.barkTimer = 300; cameraShake = 5;
        createParticles(otter.x, otter.y, '#3b82f6', 15);
        goats.forEach(g => { if (Math.hypot(g.x-otter.x, g.y-otter.y) < otter.barkRadius) { g.state='FAINTED'; g.faintTimer=4000; g.vx=(g.x-otter.x)*0.15; g.vy=(g.y-otter.y)*0.15; createParticles(g.x,g.y,'#fbbf24',10); } });
      }
      barkTriggered = false; if (otter.barkTimer > 0) otter.barkTimer -= deltaTime;

      if (ball.radius > 0) {
        ball.mass = 0.3 + (0.7*(ball.health/ball.maxHealth));
        ball.radius = Math.max(25, ball.baseRadius*(ball.health/ball.maxHealth));
        ball.vx *= ball.friction; ball.vy *= ball.friction;
        let distToGoal = Math.hypot(ball.x-targetZone.x, ball.y-targetZone.y);
        if (distToGoal < targetZone.radius) { let pull = 1-(distToGoal/targetZone.radius); ball.vx += ((targetZone.x-ball.x)/distToGoal)*(0.6+pull*0.8); ball.vy += ((targetZone.y-ball.y)/distToGoal)*(0.6+pull*0.8); }
        ball.x += ball.vx; ball.y += ball.vy;
        if (ball.x-ball.radius<0){ball.x=ball.radius;ball.vx*=-0.8;} if (ball.x+ball.radius>WORLD_WIDTH){ball.x=WORLD_WIDTH-ball.radius;ball.vx*=-0.8;}
        if (ball.y-ball.radius<0){ball.y=ball.radius;ball.vy*=-0.8;} if (ball.y+ball.radius>WORLD_HEIGHT){ball.y=WORLD_HEIGHT-ball.radius;ball.vy*=-0.8;}
        let distOB = Math.hypot(ball.x-otter.x, ball.y-otter.y);
        if (distOB < otter.radius+ball.radius) {
          let nx=(ball.x-otter.x)/distOB, ny=(ball.y-otter.y)/distOB;
          ball.x+=nx*((otter.radius+ball.radius)-distOB); ball.y+=ny*((otter.radius+ball.radius)-distOB);
          let pushForce=(spd*0.8)/ball.mass; ball.vx+=nx*pushForce; ball.vy+=ny*pushForce; otter.vx*=0.95; otter.vy*=0.95;
        }
      }

      rocks.forEach(rock => {
        let distOR = Math.hypot(otter.x-rock.x, otter.y-rock.y);
        if (distOR < otter.radius+rock.radius*0.8) { otter.x+=(otter.x-rock.x)/distOR*((otter.radius+rock.radius*0.8)-distOR); otter.y+=(otter.y-rock.y)/distOR*((otter.radius+rock.radius*0.8)-distOR); otter.vx*=0.5; otter.vy*=0.5; }
        if (ball.radius>0) {
          let distBR = Math.hypot(ball.x-rock.x, ball.y-rock.y);
          if (distBR < ball.radius+rock.radius*0.9) { let nx=(ball.x-rock.x)/distBR,ny=(ball.y-rock.y)/distBR; ball.x+=nx*((ball.radius+rock.radius*0.9)-distBR); ball.y+=ny*((ball.radius+rock.radius*0.9)-distBR); let dot=ball.vx*nx+ball.vy*ny; ball.vx-=2*dot*nx*0.8; ball.vy-=2*dot*ny*0.8; if(Math.random()<0.2)createParticles(ball.x,ball.y,'#94a3b8',3); }
        }
      });

      const objEl = $id('oc-objective');
      if (objEl) {
        if (gameState === 'TUTORIAL') objEl.innerText = "Tutorial: Follow Elder Bleat's instructions.";
        else if (Math.hypot(ball.x-otter.x,ball.y-otter.y) > 400) objEl.innerText = "Objective: Follow Green Arrow to Kudzu Ball";
        else objEl.innerText = "Objective: Push Ball to Yellow Goal!";
      }

      let anyoneEating = false;
      goats.forEach(goat => {
        if (goat.state === 'FAINTED') { goat.faintTimer-=deltaTime; goat.vx*=0.9; goat.vy*=0.9; goat.x+=goat.vx; goat.y+=goat.vy; if(goat.faintTimer<=0){goat.state=goat.id==='elder'&&Math.hypot(ball.x-targetZone.x,ball.y-targetZone.y)>500?'WAITING':'CHASING';} return; }
        if (goat.id==='elder'&&goat.state==='WAITING'&&Math.hypot(ball.x-targetZone.x,ball.y-targetZone.y)<600&&gameState==='PLAYING') { goat.state='CHASING'; goat.dialogue="I CAN'T WAIT! GIMME SALAD!"; }
        if ((goat.state==='CHASING'||goat.state==='EATING')&&ball.radius>0) {
          let distToBall=Math.hypot(ball.x-goat.x,ball.y-goat.y);
          if (distToBall<goat.radius+ball.radius+10) { goat.state='EATING'; goat.vx=0; goat.vy=0; ball.health-=(goat.id==='elder'?15:10)*(deltaTime/1000); anyoneEating=true; if(Math.random()<0.1)createParticles(ball.x,ball.y,'#22c55e',2); }
          else { goat.state='CHASING'; let nx=(ball.x-goat.x)/distToBall,ny=(ball.y-goat.y)/distToBall; nx+=(Math.random()-0.5)*0.5; ny+=(Math.random()-0.5)*0.5; let len=Math.hypot(nx,ny); nx/=len; ny/=len; goat.vx=nx*goat.speed; goat.vy=ny*goat.speed; goat.x+=goat.vx; goat.y+=goat.vy; }
        }
        goat.x=Math.max(goat.radius,Math.min(WORLD_WIDTH-goat.radius,goat.x)); goat.y=Math.max(goat.radius,Math.min(WORLD_HEIGHT-goat.radius,goat.y));
        rocks.forEach(rock => { let d=Math.hypot(goat.x-rock.x,goat.y-rock.y); if(d<goat.radius+rock.radius*0.8){goat.x+=(goat.x-rock.x)/d*((goat.radius+rock.radius*0.8)-d);goat.y+=(goat.y-rock.y)/d*((goat.radius+rock.radius*0.8)-d);}});
        let distOG=Math.hypot(goat.x-otter.x,goat.y-otter.y);
        if (distOG<otter.radius+goat.radius) { let nx=(otter.x-goat.x)/distOG,ny=(otter.y-goat.y)/distOG; if(spd>5){goat.state='FAINTED';goat.faintTimer=2500;goat.vx=-nx*spd*0.8;goat.vy=-ny*spd*0.8;createParticles(goat.x,goat.y,'#ef4444',10);cameraShake=8;otter.vx*=0.5;otter.vy*=0.5;}else{otter.vx+=nx*3;otter.vy+=ny*3;} }
      });

      updateParticles(deltaTime);

      if (gameState === 'PLAYING') {
        if (ball.health <= 0) endGame('GAMEOVER');
        else if (Math.hypot(ball.x-targetZone.x,ball.y-targetZone.y) < targetZone.radius*0.2) triggerWinAnimation();
      }

      camera.x += (otter.x - canvas.width/2 - camera.x)*0.15; camera.y += (otter.y - canvas.height/2 - camera.y)*0.15;
      camera.x = Math.max(0,Math.min(WORLD_WIDTH-canvas.width, camera.x)); camera.y = Math.max(0,Math.min(WORLD_HEIGHT-canvas.height, camera.y));
      if (cameraShake>0) { camera.x+=(Math.random()-0.5)*cameraShake; camera.y+=(Math.random()-0.5)*cameraShake; cameraShake*=0.9; if(cameraShake<0.5)cameraShake=0; }

      updateUI(anyoneEating);
    }

    function updateParticles(dt) {
      for (let i=particles.length-1;i>=0;i--) { let p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.life-=dt; if(p.life<=0)particles.splice(i,1); }
    }

    function triggerWinAnimation() {
      gameState='WIN_ANIMATION'; winDelayTimer=2000; cameraShake=25;
      hud.style.display='none'; floatingUI.style.display='none'; barkBtn.style.display='none'; joystickZone.style.display='none';
      for(let i=0;i<150;i++){let isLeaf=Math.random()>0.5;particles.push({x:ball.x,y:ball.y,vx:(Math.random()-0.5)*30,vy:(Math.random()-0.5)*30,life:1000+Math.random()*1500,size:isLeaf?6+Math.random()*8:4+Math.random()*6,color:isLeaf?'#22c55e':'#fbbf24'});}
      ball.radius=0;
    }

    function createParticles(x,y,color,count) {
      for(let i=0;i<count;i++) particles.push({x,y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,life:500+Math.random()*500,size:2+Math.random()*4,color});
    }

    function updateUI(isEating) {
      if (gameState==='PLAYING') { let ms=Math.floor((timeElapsed%1000)/10),s=Math.floor((timeElapsed/1000)%60),m=Math.floor(timeElapsed/60000); const chEl=$id('oc-chronometer'); if(chEl)chEl.innerText=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }
      if (ball&&ball.radius>0&&(gameState==='PLAYING'||tutPhase!=='MOVE')) {
        ballHealthContainer.style.display='block';
        ballHealthContainer.style.left=`${ball.x-camera.x}px`; ballHealthContainer.style.top=`${ball.y-camera.y-ball.radius-15}px`;
        let pct=(ball.health/ball.maxHealth)*100; const hfEl=$id('oc-health-fill'); if(hfEl){hfEl.style.width=`${Math.max(0,pct)}%`; hfEl.style.background=isEating?((Math.floor(timeElapsed/100)%2===0)?'#fff':'#ef4444'):(pct>50?'#22c55e':pct>25?'#eab308':'#ef4444');}
        if(isEating)cameraShake=Math.max(cameraShake,2);
      } else { ballHealthContainer.style.display='none'; }
    }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if (gameState==='START') return;
      ctx.save(); ctx.translate(-camera.x,-camera.y);
      ctx.fillStyle=currentMode==='TUTORIAL'?'#0f172a':'#1e293b'; ctx.fillRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
      ctx.lineWidth=2; ctx.strokeStyle=currentMode==='TUTORIAL'?'#1e293b':'#334155';
      for(let i=0;i<=WORLD_WIDTH;i+=100){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,WORLD_HEIGHT);ctx.stroke();}
      for(let i=0;i<=WORLD_HEIGHT;i+=100){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(WORLD_WIDTH,i);ctx.stroke();}
      decorations.forEach(d=>{ctx.save();ctx.translate(d.x,d.y);ctx.scale(d.size,d.size);if(d.type==='grass'){ctx.strokeStyle='#166534';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(-5,-5);ctx.stroke();ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-8);ctx.stroke();ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(5,-4);ctx.stroke();}else{ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';[0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{ctx.beginPath();ctx.arc(Math.cos(a)*4,Math.sin(a)*4,2,0,Math.PI*2);ctx.fill();});}ctx.restore();});
      ctx.fillStyle='rgba(56,189,248,0.2)';ctx.strokeStyle='rgba(56,189,248,0.4)';ctx.lineWidth=4;
      waterZones.forEach(w=>{ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,Math.PI*2);ctx.fill();ctx.stroke();if(w.r>100){ctx.fillStyle='rgba(56,189,248,0.3)';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FAST WATER',w.x,w.y);}});
      for(let i=5;i>0;i--){ctx.beginPath();ctx.arc(targetZone.x,targetZone.y,targetZone.radius*(i/5),0,Math.PI*2);ctx.fillStyle=`rgba(251,191,36,${0.03+(5-i)*0.03})`;ctx.fill();}
      ctx.beginPath();ctx.arc(targetZone.x,targetZone.y,targetZone.radius,0,Math.PI*2);ctx.strokeStyle='#fbbf24';ctx.lineWidth=6;ctx.setLineDash([15,15]);ctx.lineDashOffset=-timeElapsed*0.05;ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#fbbf24';ctx.font='bold 24px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('DELIVER SALAD',targetZone.x,targetZone.y-15);ctx.fillText('HERE',targetZone.x,targetZone.y+15);
      rocks.forEach(rock=>{ctx.save();ctx.translate(rock.x,rock.y);ctx.beginPath();for(let i=0;i<8;i++){let a=(i/8)*Math.PI*2,r=rock.radius*rock.offsets[i];if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fillStyle='#475569';ctx.fill();ctx.strokeStyle='#334155';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#64748b';ctx.beginPath();ctx.arc(-rock.radius*0.3,-rock.radius*0.3,rock.radius*0.2,0,Math.PI*2);ctx.fill();ctx.restore();});
      drawPointers();
      if(ball.radius>0){ctx.save();ctx.translate(ball.x,ball.y);ctx.rotate(timeElapsed*0.002*(ball.vx+ball.vy));ctx.beginPath();for(let i=0;i<12;i++){let a=(i/12)*Math.PI*2,r=ball.radius+(i%2===0?5:-5);if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fillStyle='#22c55e';ctx.fill();ctx.strokeStyle='#166534';ctx.lineWidth=4;ctx.stroke();ctx.restore();}
      goats.forEach(goat=>{ctx.save();ctx.translate(goat.x,goat.y);ctx.rotate(goat.state==='FAINTED'?-Math.PI/2:(goat.vx!==0||goat.vy!==0?Math.atan2(goat.vy,goat.vx):0));ctx.beginPath();ctx.arc(0,0,goat.radius,0,Math.PI*2);ctx.fillStyle=goat.color;ctx.fill();ctx.strokeStyle='#94a3b8';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#cbd5e1';ctx.beginPath();ctx.moveTo(goat.radius*0.4,-goat.radius*0.2);ctx.lineTo(goat.radius*0.4+goat.hornSize,-goat.radius*0.6);ctx.lineTo(goat.radius*0.2,-goat.radius*0.6);ctx.fill();ctx.beginPath();ctx.moveTo(goat.radius*0.4,goat.radius*0.2);ctx.lineTo(goat.radius*0.4+goat.hornSize,goat.radius*0.6);ctx.lineTo(goat.radius*0.2,goat.radius*0.6);ctx.fill();
      if(goat.state==='FAINTED'){ctx.fillStyle='#000';ctx.font=`${Math.floor(goat.radius*0.6)}px Arial`;ctx.fillText('X',goat.radius*0.2,-goat.radius*0.2);ctx.fillText('X',goat.radius*0.2,goat.radius*0.4);}else{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(goat.radius*0.4,-goat.radius*0.3,goat.radius*0.25,0,Math.PI*2);ctx.arc(goat.radius*0.4,goat.radius*0.3,goat.radius*0.25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(goat.radius*0.4,-goat.radius*0.4,goat.radius*0.1,goat.radius*0.2);ctx.fillRect(goat.radius*0.4,goat.radius*0.2,goat.radius*0.1,goat.radius*0.2);}
      if(goat.beard){ctx.fillStyle='#94a3b8';ctx.beginPath();ctx.moveTo(goat.radius,-goat.radius*0.2);ctx.lineTo(goat.radius+goat.radius*0.6,0);ctx.lineTo(goat.radius,goat.radius*0.2);ctx.fill();}
      ctx.rotate(goat.state==='FAINTED'?Math.PI/2:(goat.vx!==0||goat.vy!==0?-Math.atan2(goat.vy,goat.vx):0));
      if(goat.dialogue){ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.textBaseline='middle';let tw=ctx.measureText(goat.dialogue).width,bw=Math.min(350,tw+30),bh=40,by=-goat.radius-40+Math.sin(timeElapsed*0.005)*5;ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(-bw/2,by-bh/2,bw,bh,10);ctx.fill();ctx.beginPath();ctx.moveTo(0,by+bh/2);ctx.lineTo(-10,by+bh/2+10);ctx.lineTo(10,by+bh/2);ctx.fill();ctx.fillStyle='#0f172a';ctx.fillText(goat.dialogue,0,by);}
      else if(goat.state==='CHASING'&&gameState==='PLAYING'){ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.arc(0,-goat.radius-20,14,0,Math.PI*2);ctx.fill();ctx.font='16px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌿',0,-goat.radius-20);}
      if(goat.state==='EATING'){ctx.fillStyle='#ef4444';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('CHOMP!',0,-goat.radius-15+Math.sin(timeElapsed*0.01)*5);}
      ctx.restore();});
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
      if(otter.trail.length>1){ctx.beginPath();for(let i=0;i<otter.trail.length;i++){let t=otter.trail[i];ctx.lineWidth=otter.radius*1.5*t.life;ctx.strokeStyle=t.water?`rgba(14,165,233,${t.life*0.5})`:`rgba(120,113,108,${t.life*0.3})`;if(i===0)ctx.moveTo(t.x,t.y);else ctx.lineTo(t.x,t.y);}ctx.stroke();}
      ctx.translate(otter.x,otter.y);let ospd=Math.hypot(otter.vx,otter.vy);if(ospd>0.1)ctx.rotate(Math.atan2(otter.vy,otter.vx));
      ctx.fillStyle='#57534e';ctx.beginPath();ctx.ellipse(-otter.radius*0.75-(ospd*0.5),0,otter.radius*0.75,otter.radius*0.3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#78716c';ctx.beginPath();ctx.ellipse(0,0,otter.radius+(ospd*0.2),otter.radius-(ospd*0.1),0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#a8a29e';ctx.beginPath();ctx.arc(otter.radius*0.6,0,otter.radius*0.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(otter.radius*0.75,-otter.radius*0.2,otter.radius*0.1,0,Math.PI*2);ctx.arc(otter.radius*0.75,otter.radius*0.2,otter.radius*0.1,0,Math.PI*2);ctx.fill();ctx.restore();
      if(otter.isBarking){let r=otter.barkRadius*(1-(otter.barkTimer/300));ctx.beginPath();ctx.arc(otter.x,otter.y,r,0,Math.PI*2);ctx.strokeStyle=`rgba(59,130,246,${otter.barkTimer/300})`;ctx.lineWidth=10;ctx.stroke();}
      if(otter.barkCooldown>0){ctx.beginPath();ctx.arc(otter.x,otter.y,otter.radius+15,-Math.PI/2,-Math.PI/2+(Math.PI*2*(1-otter.barkCooldown/otter.barkMaxCooldown)));ctx.strokeStyle='#ef4444';ctx.lineWidth=4;ctx.stroke();}
      else{let pulse=1+Math.sin(timeElapsed*0.01)*0.1;ctx.beginPath();ctx.arc(otter.x,otter.y,(otter.radius+15)*pulse,0,Math.PI*2);ctx.strokeStyle='rgba(34,197,94,0.6)';ctx.lineWidth=3;ctx.stroke();}
      particles.forEach(p=>{ctx.fillStyle=p.color;ctx.globalAlpha=p.life/1500;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1.0;});
      ctx.restore();
    }

    function drawPointers() {
      let targetX,targetY,color,label;
      let distToBall=Math.hypot(ball.x-otter.x,ball.y-otter.y);
      if(distToBall>400&&ball.radius>0){targetX=ball.x;targetY=ball.y;color='#22c55e';label='BALL';}
      else if(ball.radius>0){targetX=targetZone.x;targetY=targetZone.y;color='#fbbf24';label='GOAL';}
      else{return;}
      let angle=Math.atan2(targetY-otter.y,targetX-otter.x);
      ctx.save();ctx.translate(otter.x,otter.y);ctx.rotate(angle);ctx.translate(otter.radius+50,0);
      ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-10,-12);ctx.lineTo(-5,0);ctx.lineTo(-10,12);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#000';ctx.stroke();
      ctx.rotate(-angle);ctx.fillStyle='rgba(0,0,0,0.5)';ctx.beginPath();ctx.roundRect(-20,-25,40,16,4);ctx.fill();ctx.fillStyle=color;ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,0,-17);ctx.restore();
    }

    function endGame(result) {
      hud.style.display='none'; floatingUI.style.display='none'; barkBtn.style.display='none'; joystickZone.style.display='none';
      if(result==='GAMEOVER'){gameState='GAMEOVER';gameOverScreen.style.display='flex';}
      else if(result==='WIN'){gameState='WIN';const chEl=$id('oc-chronometer');const ft=$id('oc-final-time');if(ft&&chEl)ft.innerText=chEl.innerText;const fh=$id('oc-final-health');if(fh)fh.innerText=`${Math.round((ball.health/ball.maxHealth)*100)}%`;winScreen.style.display='flex';}
    }

    function startTutorial() {
      startScreen.style.display='none';
      fadeScreen.style.opacity='1';
      setTimeout(()=>{
        initEntities('TUTORIAL'); gameState='TUTORIAL'; tutPhase='MOVE'; tutTimer=0; camera={x:0,y:0,zoom:1}; joy.active=false;
        hud.style.display='flex'; floatingUI.style.display='block'; barkBtn.style.display='flex'; joystickZone.style.display='block';
        const skipTut=$id('oc-skip-tut'); if(skipTut)skipTut.style.display='block';
        const chronoC=$id('oc-chrono-container'); if(chronoC)chronoC.style.display='none';
        fadeScreen.style.opacity='0'; fadeScreen.style.pointerEvents='none';
        lastTime=performance.now();
      },500);
    }

    function startMainGame() {
      startScreen.style.display='none'; winScreen.style.display='none'; gameOverScreen.style.display='none';
      fadeScreen.style.opacity='1'; fadeScreen.style.pointerEvents='auto';
      setTimeout(()=>{
        initEntities('MAIN'); gameState='PLAYING'; timeElapsed=0; cameraShake=0; camera={x:0,y:0,zoom:1}; joy.active=false; barkTriggered=false;
        hud.style.display='flex'; floatingUI.style.display='block'; barkBtn.style.display='flex'; joystickZone.style.display='block';
        const skipTut=$id('oc-skip-tut'); if(skipTut)skipTut.style.display='none';
        const chronoC=$id('oc-chrono-container'); if(chronoC)chronoC.style.display='flex';
        const chEl=$id('oc-chronometer'); if(chEl)chEl.innerText='00:00.00';
        fadeScreen.style.opacity='0'; fadeScreen.style.pointerEvents='none';
        lastTime=performance.now();
      },500);
    }

    // Joystick handlers
    function handleJoyStart(x,y){if(gameState!=='PLAYING'&&gameState!=='TUTORIAL')return;joy.active=true;joy.originX=x;joy.originY=y;joy.currX=x;joy.currY=y;joy.dx=0;joy.dy=0;joyBase.style.display='block';joyBase.style.left=`${x}px`;joyBase.style.top=`${y}px`;joyKnob.style.transform='translate(-50%,-50%)';}
    function handleJoyMove(x,y){if(!joy.active)return;let dx=x-joy.originX,dy=y-joy.originY,dist=Math.hypot(dx,dy);if(dist>joy.maxR){dx=(dx/dist)*joy.maxR;dy=(dy/dist)*joy.maxR;}joyKnob.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;joy.dx=dx/joy.maxR;joy.dy=dy/joy.maxR;}
    function handleJoyEnd(){joy.active=false;joy.dx=0;joy.dy=0;joyBase.style.display='none';}

    // Event listeners
    const onKeydown = (e) => { if(keys.hasOwnProperty(e.key))keys[e.key]=true; if(e.key===' '&&(gameState==='PLAYING'||gameState==='TUTORIAL')){barkTriggered=true;e.preventDefault();} };
    const onKeyup = (e) => { if(keys.hasOwnProperty(e.key))keys[e.key]=false; };
    const onMousedown = (e) => { if(e.target===joystickZone||joystickZone.contains(e.target))handleJoyStart(e.clientX,e.clientY); };
    const onMousemove = (e) => handleJoyMove(e.clientX,e.clientY);
    const onMouseup = () => handleJoyEnd();
    const onTouchstart = (e) => { if(e.target===joystickZone||joystickZone.contains(e.target)){e.preventDefault();if(e.touches.length>0)handleJoyStart(e.touches[0].clientX,e.touches[0].clientY);}};
    const onTouchmove = (e) => { if(joy.active&&e.touches.length>0){e.preventDefault();handleJoyMove(e.touches[0].clientX,e.touches[0].clientY);}};
    const onTouchend = () => handleJoyEnd();
    const onResize = () => resizeCanvas();

    window.addEventListener('keydown',onKeydown); window.addEventListener('keyup',onKeyup);
    window.addEventListener('mousemove',onMousemove); window.addEventListener('mouseup',onMouseup);
    window.addEventListener('touchmove',onTouchmove,{passive:false}); window.addEventListener('touchend',onTouchend); window.addEventListener('touchcancel',onTouchend);
    window.addEventListener('resize',onResize);

    container.addEventListener('mousedown',onMousedown);
    container.addEventListener('touchstart',onTouchstart,{passive:false});
    container.addEventListener('click',(e)=>{
      const id=e.target.id;
      if(id==='oc-btn-tutorial')startTutorial();
      if(id==='oc-btn-skip')startMainGame();
      if(id==='oc-skip-tut')startMainGame();
      if(id==='oc-retry-btn')startMainGame();
      if(id==='oc-play-again-btn')startMainGame();
      if(id==='oc-bark-btn'||(id===''&&e.target.parentElement&&e.target.parentElement.id==='oc-bark-btn')){if(gameState==='PLAYING'||gameState==='TUTORIAL')barkTriggered=true;e.stopPropagation();}
    });

    barkBtn.addEventListener('mousedown',(e)=>{if(gameState==='PLAYING'||gameState==='TUTORIAL')barkTriggered=true;e.stopPropagation();});
    barkBtn.addEventListener('touchstart',(e)=>{e.preventDefault();if(gameState==='PLAYING'||gameState==='TUTORIAL')barkTriggered=true;e.stopPropagation();},{passive:false});

    let rafId;
    function loop(timestamp) {
      let dt=timestamp-lastTime; lastTime=timestamp;
      if(dt>100)dt=16;
      update(dt); draw(); rafId=requestAnimationFrame(loop);
    }
    rafId=requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown',onKeydown); window.removeEventListener('keyup',onKeyup);
      window.removeEventListener('mousemove',onMousemove); window.removeEventListener('mouseup',onMouseup);
      window.removeEventListener('touchmove',onTouchmove); window.removeEventListener('touchend',onTouchend); window.removeEventListener('touchcancel',onTouchend);
      window.removeEventListener('resize',onResize);
      while(container.firstChild)container.removeChild(container.firstChild);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', background: '#1a202c', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }} />;
}
