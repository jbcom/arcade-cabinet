/* eslint-disable */
// @ts-nocheck
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const BLOCK_SIZE = 1;
    const SAFE_ZONE_RADIUS = 8;
    const COMBO_WINDOW = 0.8;

    const state = {
      phase: "MENU",
      level: 1,
      anchorsSecuredThisLevel: 0,
      anchorsRequired: 3,
      time: 20.0,
      score: 0,
      totalAnchors: 0,
      grid: new Map(),
      fallingBlocks: [],
      shockwaves: [],
      cameraShake: 0,
      resonance: 0,
      lastPlacementTime: 0,
      isResonanceMax: false,
      swoopProgress: 0,
    };

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.id = "ee-game-canvas";
    canvas.style.cssText = "display:block;width:100%;height:100%;position:absolute;top:0;left:0;";
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6eaf0);
    scene.fog = new THREE.FogExp2(0xe6eaf0, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    const isometricOffset = new THREE.Vector3(15, 14, 15);
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const gridShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(0x00b3cc) },
        pulseSpeed: { value: 2.0 },
      },
      vertexShader: `varying vec3 vWorldPosition; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorldPosition = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float time; uniform vec3 glowColor; uniform float pulseSpeed; varying vec3 vWorldPosition; void main() { vec2 coord = vWorldPosition.xz; vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord); float line = min(grid.x, grid.y); float lineWeight = 1.0 - min(line, 1.0); float dist = length(coord); float pulse = (sin(dist * 0.4 - time * pulseSpeed) + 1.0) * 0.5; float fade = 1.0 - smoothstep(15.0, 60.0, dist); gl_FragColor = vec4(glowColor, lineWeight * pulse * fade * 0.7); }`,
      transparent: true,
      depthWrite: false,
      extensions: { derivatives: true },
    });
    const gridFloor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), gridShaderMat);
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.y = -0.51;
    scene.add(gridFloor);

    const blockGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const blockMat = new THREE.MeshPhysicalMaterial({
      color: 0x111822,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
      flatShading: true,
    });
    const edgeGeo = new THREE.EdgesGeometry(blockGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.8,
    });
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.5,
    });
    const nodeGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 1.5,
      wireframe: true,
    });

    const hologram = new THREE.Mesh(blockGeo, holoMat);
    scene.add(hologram);
    const cursorLight = new THREE.PointLight(0x00e5ff, 2.5, 10);
    hologram.add(cursorLight);

    let targetNode = null,
      targetPillar = null;
    const targetLight = new THREE.PointLight(0xff0055, 4.0, 20);
    scene.add(targetLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Create UI overlay elements
    const uiLayer = document.createElement("div");
    uiLayer.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;padding:20px;box-sizing:border-box;z-index:20;font-family:Rajdhani,sans-serif;color:white;";
    container.appendChild(uiLayer);

    const panelBg = "rgba(10,15,25,0.9)";
    const hudTop = document.createElement("div");
    hudTop.style.cssText = "display:flex;justify-content:space-between;align-items:flex-start;";
    uiLayer.appendChild(hudTop);

    function mkPanel(id, extra = "") {
      const d = document.createElement("div");
      d.id = id;
      d.style.cssText = `background:${panelBg};border:2px solid rgba(255,255,255,0.2);border-radius:4px;padding:12px 24px;color:white;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,0.2);backdrop-filter:blur(10px);min-width:160px;transform:translateY(-50px);opacity:0;transition:transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.6s ease,border-color 0.2s ease;${extra}`;
      return d;
    }

    const scorePanel = mkPanel("score-panel");
    scorePanel.innerHTML =
      '<div style="font-size:14px;color:#a0b4c8;letter-spacing:2px;margin-bottom:2px;font-weight:700;">TOTAL SCORE</div><div id="score-display" style="font-size:32px;font-weight:700;color:#00e5ff;">0 PTS</div>';
    hudTop.appendChild(scorePanel);

    const goalPanel = mkPanel(
      "goal-panel",
      `position:absolute;top:20px;left:50%;transform:translateX(-50%) translateY(-50px);background:${panelBg};border:2px solid #ffcc00;padding:10px 30px;border-radius:4px;box-shadow:0 10px 30px rgba(255,204,0,0.2);backdrop-filter:blur(10px);text-align:center;opacity:0;transition:transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.6s ease;`
    );
    goalPanel.innerHTML =
      '<div id="sector-title" style="font-size:14px;color:#ffcc00;letter-spacing:3px;font-weight:700;text-transform:uppercase;">Sector 1</div><div id="anchor-tracker" style="font-size:32px;color:white;font-weight:700;margin-top:4px;">ANCHORS: 0 / 3</div>';
    container.appendChild(goalPanel);

    const timerContainer = document.createElement("div");
    timerContainer.id = "timer-container";
    timerContainer.style.cssText = `text-align:center;background:${panelBg};padding:15px 40px;border-radius:8px;border:3px solid white;box-shadow:0 15px 40px rgba(0,0,0,0.3);position:relative;overflow:hidden;transform:scale(0.8);opacity:0;transition:transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.6s ease;`;
    timerContainer.innerHTML =
      '<div style="font-size:16px;color:white;text-transform:uppercase;letter-spacing:3px;">STABILITY</div><div id="timer-display" style="font-size:64px;font-weight:700;color:white;line-height:1;">20.0s</div><div id="resonance-bar-container" style="position:absolute;bottom:0;left:0;width:100%;height:6px;background:rgba(255,255,255,0.1);"><div id="resonance-fill" style="height:100%;width:0%;background:#00e5ff;transition:width 0.1s linear,background 0.3s ease;box-shadow:0 0 10px #00e5ff;"></div></div>';
    hudTop.appendChild(timerContainer);

    const distPanel = mkPanel(
      "distance-panel",
      "text-align:right;border-color:rgba(255,0,85,0.4);"
    );
    distPanel.innerHTML =
      '<div style="font-size:14px;color:#a0b4c8;letter-spacing:2px;margin-bottom:2px;font-weight:700;">ANCHOR DISTANCE</div><div id="distance-display" style="font-size:32px;color:white;font-weight:700;">0.0m</div>';
    hudTop.appendChild(distPanel);

    const dangerVignette = document.createElement("div");
    dangerVignette.id = "danger-vignette";
    dangerVignette.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;transition:box-shadow 0.2s ease;z-index:10;";
    container.appendChild(dangerVignette);

    const successFlash = document.createElement("div");
    successFlash.id = "success-flash";
    successFlash.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;background:white;opacity:0;pointer-events:none;transition:opacity 0.5s ease;z-index:15;";
    container.appendChild(successFlash);

    const crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    crosshair.style.cssText =
      "position:absolute;top:50%;left:50%;width:10px;height:10px;border:2px solid #00e5ff;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:15;opacity:0;transition:opacity 0.5s ease;";
    container.appendChild(crosshair);

    const comboPopup = document.createElement("div");
    comboPopup.id = "combo-popup";
    comboPopup.style.cssText =
      "position:absolute;top:50%;left:50%;transform:translate(-50%,-150%);color:#ffcc00;font-size:40px;font-weight:700;text-transform:uppercase;pointer-events:none;opacity:0;transition:all 0.3s ease;z-index:25;font-family:Rajdhani,sans-serif;";
    comboPopup.textContent = "Resonance Max";
    container.appendChild(comboPopup);

    const tutorialOverlay = document.createElement("div");
    tutorialOverlay.id = "tutorial-overlay";
    tutorialOverlay.style.cssText =
      "position:absolute;top:75%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:20;opacity:0;transition:opacity 0.5s ease;font-family:Rajdhani,sans-serif;";
    tutorialOverlay.innerHTML = `<div id="tutorial-title" style="font-size:24px;font-weight:700;color:#00e5ff;text-transform:uppercase;letter-spacing:4px;margin-bottom:8px;background:${panelBg};display:inline-block;padding:4px 12px;border-radius:4px;"></div><div id="tutorial-instruction" style="font-size:18px;color:white;background:${panelBg};padding:10px 20px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 10px 20px rgba(0,0,0,0.3);"></div>`;
    container.appendChild(tutorialOverlay);

    function mkMenu(id, html, bgOverride = "") {
      const m = document.createElement("div");
      m.id = id;
      m.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;background:${bgOverride || "linear-gradient(180deg,rgba(10,15,25,0.95) 0%,rgba(10,15,25,0.5) 100%)"};backdrop-filter:blur(8px);display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:all;z-index:100;color:white;text-align:center;transition:opacity 0.5s ease;font-family:Rajdhani,sans-serif;`;
      m.innerHTML = html;
      return m;
    }

    const btnStyle =
      "background:#00e5ff;color:rgba(10,15,25,0.9);font-family:Rajdhani,sans-serif;font-size:30px;font-weight:700;text-transform:uppercase;padding:20px 60px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 10px 40px rgba(0,229,255,0.4);letter-spacing:4px;margin-top:20px;";

    const startMenu = mkMenu(
      "start-menu",
      `
      <h1 style="font-size:80px;color:white;text-shadow:0 0 30px #00e5ff;margin-bottom:20px;text-transform:uppercase;letter-spacing:10px;">Entropy's Edge</h1>
      <div style="background:rgba(0,0,0,0.5);padding:25px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);max-width:600px;margin-bottom:20px;">
        <p style="font-size:22px;color:#dce1e8;margin-bottom:15px;font-weight:700;">Reality is fracturing. You must stabilize the Sectors.</p>
        <p style="font-size:20px;color:#a0b4c8;">Construct paths to reach the <span style="color:#ff0055;font-weight:700;">Reality Anchors</span> before Sector Stability reaches zero.</p>
      </div>
      <button id="start-btn" style="${btnStyle}">Initialize Link</button>`
    );
    container.appendChild(startMenu);

    const levelCompleteMenu = mkMenu(
      "level-complete-menu",
      `
      <h1 style="font-size:80px;color:#00ff88;text-shadow:0 0 30px #00ff88;margin-bottom:20px;text-transform:uppercase;letter-spacing:10px;">SECTOR STABILIZED</h1>
      <p id="level-stats" style="font-size:28px;color:white;margin-bottom:10px;">Anchors Secured: 3</p>
      <p style="font-size:20px;color:#a0b4c8;margin-bottom:30px;">The void retreats... Next Sector requires more anchors.</p>
      <button id="next-level-btn" style="${btnStyle.replace("#00e5ff", "#00ff88").replace("rgba(0,229,255,0.4)", "rgba(0,255,136,0.4)")}">Proceed to Next Sector</button>`
    );
    levelCompleteMenu.style.opacity = "0";
    levelCompleteMenu.style.pointerEvents = "none";
    container.appendChild(levelCompleteMenu);

    const gameOverMenu = mkMenu(
      "game-over-menu",
      `
      <h1 style="font-size:80px;color:#ff1111;text-shadow:0 0 30px #ff1111;margin-bottom:20px;text-transform:uppercase;letter-spacing:10px;">SECTOR COLLAPSED</h1>
      <p id="final-score" style="font-size:32px;color:white;margin-bottom:30px;">Total Score: 0</p>
      <button id="restart-btn" style="${btnStyle.replace("#00e5ff", "#ff1111").replace("rgba(0,229,255,0.4)", "rgba(255,17,17,0.4)")}; color:white;">Restart Simulation</button>`,
      "rgba(15,5,5,0.95)"
    );
    gameOverMenu.style.opacity = "0";
    gameOverMenu.style.pointerEvents = "none";
    container.appendChild(gameOverMenu);

    function getElementById(id) {
      return container.querySelector(`#${id}`);
    }

    function updateGoalUI() {
      const titleEl = getElementById("sector-title");
      const trackerEl = getElementById("anchor-tracker");
      if (titleEl) titleEl.innerText = `SECTOR ${state.level}`;
      if (trackerEl)
        trackerEl.innerText = `ANCHORS: ${state.anchorsSecuredThisLevel} / ${state.anchorsRequired}`;
    }

    function createBlock(x, y, z) {
      const mesh = new THREE.Mesh(blockGeo, blockMat.clone());
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.add(new THREE.LineSegments(edgeGeo, edgeMat.clone()));
      mesh.scale.set(0.1, 0.1, 0.1);
      scene.add(mesh);
      state.grid.set(`${Math.round(x)},${Math.round(y)},${Math.round(z)}`, mesh);
      return mesh;
    }

    function generateNextNode(baseX, baseZ) {
      if (targetNode) {
        scene.remove(targetNode);
        scene.remove(targetPillar);
      }
      const dist = 10 + state.level * 2 + state.anchorsSecuredThisLevel * 2;
      const angle = Math.random() * Math.PI * 2;
      const nx = Math.round(baseX + Math.cos(angle) * dist);
      const nz = Math.round(baseZ + Math.sin(angle) * dist);
      const ny = Math.round((Math.random() - 0.5) * 4);
      targetNode = new THREE.Mesh(nodeGeo, nodeMat);
      targetNode.position.set(nx, ny, nz);
      scene.add(targetNode);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0xff0055,
        transparent: true,
        opacity: 0.4,
      });
      targetPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 150), pillarMat);
      targetPillar.position.set(nx, ny + 75, nz);
      scene.add(targetPillar);
      targetLight.position.set(nx, ny + 2, nz);
    }

    function initiateBootSequence() {
      state.phase = "SWOOPING";
      state.swoopProgress = 0;
      updateGoalUI();
      const sm = getElementById("start-menu");
      if (sm) {
        sm.style.opacity = "0";
        sm.style.pointerEvents = "none";
      }
      setTimeout(() => {
        const p = getElementById("score-panel");
        if (p) {
          p.style.transform = "translateY(0)";
          p.style.opacity = "1";
        }
      }, 800);
      setTimeout(() => {
        const p = getElementById("goal-panel");
        if (p) {
          p.style.transform = "translateX(-50%) translateY(0)";
          p.style.opacity = "1";
        }
      }, 1000);
      setTimeout(() => {
        const p = getElementById("distance-panel");
        if (p) {
          p.style.transform = "translateY(0)";
          p.style.opacity = "1";
        }
      }, 1200);
      setTimeout(() => {
        const t = getElementById("timer-container");
        if (t) {
          t.style.transform = "scale(1)";
          t.style.opacity = "1";
        }
        const c = getElementById("crosshair");
        if (c) c.style.opacity = "1";
        const tutOverlay = getElementById("tutorial-overlay");
        if (tutOverlay) {
          tutOverlay.style.opacity = "1";
          const tutTitle = getElementById("tutorial-title");
          if (tutTitle) tutTitle.innerText = "SYSTEM CALIBRATION";
          const tutInst = getElementById("tutorial-instruction");
          if (tutInst)
            tutInst.innerText = `Goal: Secure ${state.anchorsRequired} Anchors. Click core block to start.`;
        }
        state.phase = "CALIBRATING";
      }, 1600);
    }

    function triggerLevelComplete() {
      state.phase = "LEVEL_COMPLETE";
      const flash = getElementById("success-flash");
      if (flash) {
        flash.style.opacity = "1";
        setTimeout(() => (flash.style.opacity = "0"), 800);
      }
      const menu = getElementById("level-complete-menu");
      if (menu) {
        menu.style.opacity = "1";
        menu.style.pointerEvents = "all";
      }
      const stats = getElementById("level-stats");
      if (stats)
        stats.innerText = `Anchors Secured: ${state.anchorsRequired}\nSector Score: ${state.score} PTS`;
    }

    function triggerNodeReached() {
      state.totalAnchors++;
      state.anchorsSecuredThisLevel++;
      const multiplier = state.isResonanceMax ? 2 : 1;
      state.time += 15.0 * multiplier;
      state.score += 1000 * state.anchorsSecuredThisLevel * multiplier;
      state.cameraShake = 0.5;
      updateGoalUI();
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.2, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true })
      );
      wave.position.copy(targetNode.position);
      wave.rotation.x = Math.PI / 2;
      scene.add(wave);
      state.shockwaves.push({ mesh: wave, life: 1.0 });
      for (const [key, mesh] of state.grid.entries()) {
        if (mesh.position.distanceTo(targetNode.position) > SAFE_ZONE_RADIUS) {
          state.grid.delete(key);
          state.fallingBlocks.push({ mesh, velocity: Math.random() * 2 });
        }
      }
      if (state.anchorsSecuredThisLevel >= state.anchorsRequired) {
        triggerLevelComplete();
      } else {
        generateNextNode(targetNode.position.x, targetNode.position.z);
      }
    }

    function onPointerDown() {
      if (["MENU", "SWOOPING", "GAMEOVER", "LEVEL_COMPLETE"].includes(state.phase)) return;
      if (!hologram.visible) return;
      if (state.phase === "CALIBRATING") {
        state.phase = "PLAYING";
        const tutTitle = getElementById("tutorial-title");
        if (tutTitle) tutTitle.innerText = "LINK ESTABLISHED";
        setTimeout(() => {
          const tutOverlay = getElementById("tutorial-overlay");
          if (tutOverlay) tutOverlay.style.opacity = "0";
        }, 3000);
      }
      const pos = hologram.position.clone();
      createBlock(pos.x, pos.y, pos.z);
      const now = performance.now() / 1000;
      if (now - state.lastPlacementTime < COMBO_WINDOW) {
        state.resonance = Math.min(1.0, state.resonance + 0.15);
      } else {
        state.resonance = 0.15;
      }
      state.lastPlacementTime = now;
      const multiplier = state.isResonanceMax ? 2.5 : 1.0;
      state.score += 10 * multiplier;
      state.time += 0.2 * multiplier;
      state.cameraShake = 0.05;
      cameraTarget.copy(pos);
      if (targetNode && pos.distanceTo(targetNode.position) < 1.6) triggerNodeReached();
    }

    const clock = new THREE.Clock();
    let animFrameId;
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      gridShaderMat.uniforms.time.value = elapsed;

      if (state.phase === "MENU") {
        camera.position.x = Math.sin(elapsed * 0.2) * 12;
        camera.position.y = 2 + Math.sin(elapsed * 0.5);
        camera.position.z = Math.cos(elapsed * 0.2) * 12;
        camera.lookAt(0, 1, 0);
        const starterBlock = state.grid.get("0,0,0");
        if (starterBlock) {
          const pulse = 1 + (Math.sin(elapsed * 4) + 1) * 0.1;
          starterBlock.scale.set(pulse, pulse, pulse);
          starterBlock.children[0].material.color.setHex(0xffffff);
        }
      }

      if (state.phase === "SWOOPING") {
        state.swoopProgress += dt * 0.8;
        const easeOutCub = 1 - (1 - state.swoopProgress) ** 3;
        const currentOrbitPos = new THREE.Vector3(
          Math.sin(elapsed * 0.2) * 12,
          2 + Math.sin(elapsed * 0.5),
          Math.cos(elapsed * 0.2) * 12
        );
        const targetPos = new THREE.Vector3().copy(cameraTarget).add(isometricOffset);
        camera.position.lerpVectors(currentOrbitPos, targetPos, Math.min(easeOutCub, 1.0));
        camera.lookAt(cameraTarget);
        const starterBlock = state.grid.get("0,0,0");
        if (starterBlock) {
          starterBlock.scale.set(1, 1, 1);
          starterBlock.children[0].material.color.setHex(0x00e5ff);
        }
      }

      if (state.phase === "PLAYING" || state.phase === "CALIBRATING") {
        camera.position.lerp(new THREE.Vector3().copy(cameraTarget).add(isometricOffset), 0.08);
        camera.lookAt(cameraTarget);

        if (state.phase === "PLAYING") {
          state.time -= dt;
          const timerEl = getElementById("timer-display");
          if (timerEl) timerEl.innerText = `${Math.max(0, state.time).toFixed(1)}s`;
          const dv = getElementById("danger-vignette");
          if (state.time <= 5.0) {
            gridShaderMat.uniforms.glowColor.value.set(0xff1111);
            gridShaderMat.uniforms.pulseSpeed.value = 12.0;
            if (dv) dv.style.boxShadow = "inset 0 0 150px rgba(255,17,17,0.6)";
            if (timerEl) timerEl.style.color = "#ff1111";
          } else if (state.time <= 15.0) {
            gridShaderMat.uniforms.glowColor.value.set(0xffcc00);
            gridShaderMat.uniforms.pulseSpeed.value = 6.0;
            if (dv) dv.style.boxShadow = "none";
            if (timerEl) timerEl.style.color = "white";
          } else {
            if (!state.isResonanceMax) gridShaderMat.uniforms.glowColor.value.set(0x00b3cc);
            gridShaderMat.uniforms.pulseSpeed.value = 2.0;
            if (timerEl) timerEl.style.color = "white";
          }
          if (state.time <= 0) {
            state.phase = "GAMEOVER";
            const menu = getElementById("game-over-menu");
            if (menu) {
              menu.style.opacity = "1";
              menu.style.pointerEvents = "all";
            }
            const fs = getElementById("final-score");
            if (fs) fs.innerText = `Total Score: ${state.score}`;
          }
          const now = performance.now() / 1000;
          if (now - state.lastPlacementTime > COMBO_WINDOW)
            state.resonance = Math.max(0, state.resonance - dt * 0.5);
        }

        const fill = getElementById("resonance-fill");
        if (fill) fill.style.width = `${state.resonance * 100}%`;
        const cp = getElementById("combo-popup");
        if (state.resonance >= 1.0 && !state.isResonanceMax) {
          state.isResonanceMax = true;
          if (cp) cp.style.opacity = "1";
          if (fill) fill.style.background = "#ffcc00";
          gridShaderMat.uniforms.glowColor.value.set(0xffcc00);
        } else if (state.resonance < 1.0 && state.isResonanceMax) {
          state.isResonanceMax = false;
          if (cp) cp.style.opacity = "0";
          if (fill) fill.style.background = "#00e5ff";
        }

        const sd = getElementById("score-display");
        if (sd) sd.innerText = `${state.score} PTS`;
        const dd = getElementById("distance-display");
        if (targetNode && dd)
          dd.innerText = `${cameraTarget.distanceTo(targetNode.position).toFixed(1)}m`;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(state.grid.values()));
        if (intersects.length > 0) {
          const pos = intersects[0].object.position.clone().add(intersects[0].face.normal).round();
          if (!state.grid.has(`${pos.x},${pos.y},${pos.z}`)) {
            hologram.position.copy(pos);
            hologram.visible = true;
          } else hologram.visible = false;
        } else hologram.visible = false;
      }

      gridFloor.position.x = cameraTarget.x;
      gridFloor.position.z = cameraTarget.z;
      state.grid.forEach((b) => {
        if (b.scale.x < 1.0) b.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      });
      if (targetNode) {
        targetNode.rotation.y += dt * 2;
        targetNode.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.1);
      }
      if (state.cameraShake > 0 && state.phase !== "SWOOPING") {
        state.cameraShake -= dt;
        camera.position.x += (Math.random() - 0.5) * state.cameraShake;
      }
      state.shockwaves.forEach((sw, i) => {
        sw.life -= dt * 1.5;
        sw.mesh.scale.addScalar(dt * 30);
        sw.mesh.material.opacity = sw.life;
        if (sw.life <= 0) {
          scene.remove(sw.mesh);
          state.shockwaves.splice(i, 1);
        }
      });
      state.fallingBlocks.forEach((fb, i) => {
        fb.velocity -= dt * 15;
        fb.mesh.position.y += fb.velocity * dt;
        if (fb.mesh.position.y < -20) {
          scene.remove(fb.mesh);
          state.fallingBlocks.splice(i, 1);
        }
      });

      renderer.render(scene, camera);
    }

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onResize);

    // Button event listeners
    container.addEventListener("click", (e) => {
      const tgt = e.target;
      if (tgt.id === "start-btn") initiateBootSequence();
      if (tgt.id === "next-level-btn") {
        state.level++;
        state.anchorsRequired += 1;
        state.anchorsSecuredThisLevel = 0;
        state.time = Math.max(10.0, 20.0 - state.level * 1.5);
        state.resonance = 0;
        const menu = getElementById("level-complete-menu");
        if (menu) {
          menu.style.opacity = "0";
          menu.style.pointerEvents = "none";
        }
        resetForNextLevel();
      }
      if (tgt.id === "restart-btn") {
        state.level = 1;
        state.anchorsRequired = 3;
        state.anchorsSecuredThisLevel = 0;
        state.time = 20.0;
        state.score = 0;
        state.totalAnchors = 0;
        state.resonance = 0;
        const goMenu = getElementById("game-over-menu");
        if (goMenu) {
          goMenu.style.opacity = "0";
          goMenu.style.pointerEvents = "none";
        }
        resetForNextLevel();
      }
    });

    function resetForNextLevel() {
      state.grid.forEach((m) => scene.remove(m));
      state.grid.clear();
      state.fallingBlocks.forEach((fb) => scene.remove(fb.mesh));
      state.fallingBlocks = [];
      cameraTarget.set(0, 0, 0);
      createBlock(0, 0, 0);
      generateNextNode(0, 0);
      updateGoalUI();
      camera.position.copy(cameraTarget).add(isometricOffset);
      camera.lookAt(cameraTarget);
      state.phase = "CALIBRATING";
      const tutOverlay = getElementById("tutorial-overlay");
      if (tutOverlay) {
        tutOverlay.style.opacity = "1";
        const tutTitle = getElementById("tutorial-title");
        if (tutTitle) tutTitle.innerText = "SYSTEM RE-CALIBRATION";
        const tutInst = getElementById("tutorial-instruction");
        if (tutInst) tutInst.innerText = `Goal: Secure ${state.anchorsRequired} Anchors.`;
      }
    }

    createBlock(0, 0, 0);
    generateNextNode(0, 0);
    clock.start();
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#e6eaf0",
      }}
    />
  );
}
