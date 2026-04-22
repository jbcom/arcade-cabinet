/* eslint-disable */
// @ts-nocheck

import * as CANNON from "cannon-es";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Inject CSS styles
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .tm-body {
        margin: 0; padding: 0; width: 100%; height: 100%;
        overflow: hidden; background-color: #000;
        font-family: 'Courier New', Courier, monospace;
        touch-action: none; user-select: none; -webkit-user-select: none;
      }
      #tm-game-canvas { display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
      #tm-start-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: #020406; z-index: 100;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: #00ffcc; text-shadow: 0 0 10px #00ffcc; transition: opacity 0.5s;
        font-family: 'Courier New', Courier, monospace;
      }
      .tm-hidden { opacity: 0 !important; pointer-events: none !important; }
      .tm-os-box {
        border: 2px solid #00ffcc; padding: 40px; background: rgba(0, 20, 30, 0.6);
        box-shadow: 0 0 30px rgba(0,255,204,0.2), inset 0 0 20px rgba(0,255,204,0.1); text-align: center;
      }
      .tm-btn-os {
        padding: 15px 30px; font-size: 18px; font-weight: bold; font-family: 'Courier New', Courier, monospace;
        background: rgba(0,0,0,0.5); border: 2px solid #00ffcc; color: #00ffcc;
        cursor: pointer; border-radius: 5px; margin-top: 20px;
        box-shadow: 0 0 10px rgba(0,255,204,0.3); transition: all 0.1s;
      }
      .tm-btn-os:active { background: #00ffcc; color: #000; transform: scale(0.95); }
      .tm-upgrade-row {
        display: flex; justify-content: space-between; align-items: center;
        margin: 20px 0; padding: 15px; border-bottom: 1px dashed rgba(0,255,204,0.3); text-align: left;
      }
      .tm-upgrade-info { flex-grow: 1; }
      .tm-upgrade-title { font-size: 20px; font-weight: bold; color: #ffaa00; text-shadow: 0 0 5px #ffaa00; }
      .tm-upgrade-desc { font-size: 14px; opacity: 0.8; margin-top: 5px; }
      #tm-interaction-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; pointer-events: auto; }
      #tm-controls-layer {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 10; pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end;
        font-family: 'Courier New', Courier, monospace;
      }
      #tm-joystick-container {
        display: flex; justify-content: space-between; align-items: flex-end;
        padding: 30px 40px; pointer-events: none; position: relative; z-index: 20;
      }
      .tm-joystick-zone {
        width: 140px; height: 140px; border-radius: 50%; border: 2px solid rgba(0, 255, 204, 0.15);
        background: radial-gradient(circle, rgba(0,255,204,0.05), rgba(0,20,30,0.5));
        position: relative; pointer-events: auto; backdrop-filter: blur(2px);
      }
      .tm-joystick-knob {
        width: 60px; height: 60px; border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(0, 255, 204, 0.8)); border: 2px solid #00ffcc;
        position: absolute; top: 40px; left: 40px; box-shadow: 0 0 15px rgba(0, 255, 204, 0.6); pointer-events: none;
      }
      .tm-action-cluster { display: flex; gap: 15px; pointer-events: auto; }
      .tm-action-btn {
        width: 70px; height: 70px; border-radius: 50%; background: rgba(0, 15, 20, 0.8); border: 2px solid #ffaa00;
        color: #ffaa00; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 14px;
        display: flex; justify-content: center; align-items: center; box-shadow: 0 0 15px rgba(255,170,0,0.3); transition: all 0.1s;
        cursor: pointer;
      }
      .tm-action-btn:active { background: rgba(255,170,0,0.4); transform: scale(0.9); }
      #tm-btn-upgrades { border-color: #00ffcc; color: #00ffcc; box-shadow: 0 0 15px rgba(0,255,204,0.3); }
      #tm-btn-upgrades:active { background: rgba(0,255,204,0.4); }
      .tm-hint { position: absolute; bottom: 10px; width: 100%; text-align: center; font-size: 13px; color: rgba(0, 255, 204, 0.6); text-shadow: 0 0 5px #000; pointer-events: none; }
      #tm-crosshair {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 4px; height: 4px; background: rgba(255, 255, 255, 0.4); border-radius: 50%; z-index: 10; pointer-events: none;
        transition: all 0.1s;
      }
      #tm-crosshair.active { background: #ffaa00; transform: translate(-50%, -50%) scale(3); box-shadow: 0 0 15px #ffaa00; }
      .tm-float-text {
        position: absolute; font-weight: bold; font-size: 26px; pointer-events: none; z-index: 20; text-shadow: 0 0 10px rgba(0,0,0,0.8);
        animation: tmFloatUp 1.5s ease-out forwards; opacity: 0;
        font-family: 'Courier New', Courier, monospace;
      }
      @keyframes tmFloatUp { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-100px) scale(1.5); opacity: 0; } }
      #tm-screen-fx {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;
        box-shadow: inset 0 0 150px rgba(255,0,0,0); transition: box-shadow 0.2s;
      }
      #tm-screen-fx.overheat { box-shadow: inset 0 0 200px rgba(255,0,0,0.8); animation: tmStrobe 0.5s infinite; }
      @keyframes tmStrobe { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
      #tm-upgrades-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: #020406; z-index: 100;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: #00ffcc; text-shadow: 0 0 10px #00ffcc;
        font-family: 'Courier New', Courier, monospace;
      }
    `;
    document.head.appendChild(styleEl);

    // Set up container HTML
    container.innerHTML = `
      <div id="tm-start-screen">
        <div class="tm-os-box">
          <h1 style="margin-top:0;">TITAN MECH OS v5</h1>
          <div style="text-align: left; font-size: 16px; line-height: 1.6; color:#aaccff;">
            > ENGAGE: Drive directly into Ore to grind.<br>
            > HEAT: Watch dashboard. Do not overheat saw.<br>
            > TRACTOR: Drag screen to grab. Flick to throw.<br>
            > SILO: Throw cubes into beam for Credits.<br>
          </div><br>
          <button id="tm-start-btn" class="tm-btn-os">BOOT SEQUENCE</button>
        </div>
      </div>

      <div id="tm-upgrades-screen" class="tm-hidden">
        <div class="tm-os-box" style="width: 500px;">
          <h1 style="margin-top:0;">MECH UPGRADES</h1>
          <h3 style="color:#ffaa00;">CREDITS: $<span id="tm-menu-credits">0</span></h3>
          <div class="tm-upgrade-row"><div class="tm-upgrade-info"><div class="tm-upgrade-title">HOPPER CAPACITY (<span id="tm-lvl-cap">1</span>)</div><div class="tm-upgrade-desc">Store more raw ore before ejecting.</div></div><button class="tm-btn-os" id="tm-buy-cap">$1000</button></div>
          <div class="tm-upgrade-row"><div class="tm-upgrade-info"><div class="tm-upgrade-title">GRIND POWER (<span id="tm-lvl-pow">1</span>)</div><div class="tm-upgrade-desc">Shred ore veins at higher velocity.</div></div><button class="tm-btn-os" id="tm-buy-pow">$1500</button></div>
          <div class="tm-upgrade-row"><div class="tm-upgrade-info"><div class="tm-upgrade-title">COOLING SYSTEM (<span id="tm-lvl-cool">1</span>)</div><div class="tm-upgrade-desc">Reduces heat generation and speeds cooling.</div></div><button class="tm-btn-os" id="tm-buy-cool">$2000</button></div>
          <button id="tm-close-upgrades-btn" class="tm-btn-os" style="margin-top: 20px; background: rgba(255,0,0,0.2); border-color: #ff3300; color: #ff3300;">CLOSE TERMINAL</button>
        </div>
      </div>

      <div id="tm-screen-fx"></div>
      <canvas id="tm-game-canvas"></canvas>

      <div id="tm-interaction-layer"></div>
      <div id="tm-crosshair"></div>

      <div id="tm-controls-layer">
        <div class="tm-hint">DRIVE INTO ORE TO GRIND | DRAG &amp; THROW CUBES TO SILO</div>
        <div id="tm-joystick-container">
          <div class="tm-action-cluster">
            <div id="tm-left-joystick" class="tm-joystick-zone"><div id="tm-left-knob" class="tm-joystick-knob"></div></div>
            <button id="tm-btn-upgrades" class="tm-action-btn">SYS<br>UPGRD</button>
          </div>
          <div class="tm-action-cluster">
            <button id="tm-btn-dash" class="tm-action-btn">THRUST<br>DASH</button>
            <div id="tm-right-joystick" class="tm-joystick-zone"><div id="tm-right-knob" class="tm-joystick-knob"></div></div>
          </div>
        </div>
      </div>
    `;

    // Silence Cannon.js normal spam
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("looks like it points into the shape"))
        return;
      originalError.apply(console, args);
    };

    // --- AUDIO ENGINE ---
    const SFX = {
      ctx: null,
      init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      },
      playOsc(type, freq, decay, vol, slide = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator(),
          gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slide) osc.frequency.exponentialRampToValueAtTime(slide, this.ctx.currentTime + decay);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + decay);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + decay);
      },
      playNoise(decay, vol, type = "lowpass", freq = 1000) {
        if (!this.ctx) return;
        const bs = this.ctx.createBufferSource(),
          buf = this.ctx.createBuffer(1, this.ctx.sampleRate * decay, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        bs.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + decay);
        bs.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        bs.start();
      },
      grind(rare = false) {
        this.playOsc(
          rare ? "square" : "sawtooth",
          rare ? 80 + Math.random() * 40 : 40 + Math.random() * 20,
          0.1,
          0.05
        );
      },
      eject() {
        this.playOsc("square", 100, 0.5, 0.3, 20);
      },
      step() {
        this.playOsc("sine", 50, 0.2, 0.1, 10);
      },
      latch() {
        this.playOsc("sine", 1200, 0.1, 0.1, 2000);
      },
      throw() {
        this.playOsc("sine", 400, 0.3, 0.2, 50);
        this.playNoise(0.3, 0.2, "highpass", 500);
      },
      thrust() {
        this.playNoise(0.5, 0.4);
        this.playOsc("sawtooth", 100, 0.5, 0.1, 40);
      },
      sell(rare = false) {
        this.playOsc("sine", rare ? 1000 : 800, 0.1, 0.1);
        setTimeout(() => this.playOsc("sine", rare ? 2000 : 1600, 0.4, 0.1), 100);
      },
      buy() {
        this.playOsc("square", 400, 0.1, 0.05);
        setTimeout(() => this.playOsc("square", 600, 0.1, 0.05), 100);
        setTimeout(() => this.playOsc("square", 800, 0.3, 0.05), 200);
      },
      error() {
        this.playOsc("sawtooth", 150, 0.3, 0.1, 100);
      },
      alarm() {
        this.playOsc("square", 600, 0.2, 0.1);
        this.playOsc("square", 800, 0.2, 0.1, 0);
      },
      hiss() {
        this.playNoise(1.5, 0.3);
      },
    };

    // --- STATE & UPGRADES ---
    const State = {
      rawStandard: 0,
      rawRare: 0,
      credits: 0,
      heat: 0,
      overheated: false,
      camShake: 0,
      dashTimer: 0,
      physObjs: [],
      dragConstraint: null,
      dragBody: null,
      dragDepth: 0,
      dragLastPos: null,
      dragVel: null,
      lookSpeed: 1.5,
      upgrades: { cap: 1, pow: 1, cool: 1, spd: 1 },
      get maxOre() {
        return 100 * this.upgrades.cap;
      },
      get totalOre() {
        return this.rawStandard + this.rawRare;
      },
      get grindDps() {
        return 50 * (1 + (this.upgrades.pow - 1) * 0.5);
      },
      get coolingRate() {
        return 20 * (1 + (this.upgrades.cool - 1) * 0.5);
      },
      get heatGen() {
        return 15 / (1 + (this.upgrades.cool - 1) * 0.2);
      },
      getCost(type) {
        return this.upgrades[type] * (type === "cap" ? 1000 : type === "pow" ? 1500 : 2000);
      },
    };

    // --- INIT THREE.JS ---
    const canvas = container.querySelector("#tm-game-canvas");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const W = () => container.clientWidth || window.innerWidth;
    const H = () => container.clientHeight || window.innerHeight;
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020406);
    scene.fog = new THREE.FogExp2(0x020406, 0.012);

    const camera = new THREE.PerspectiveCamera(85, W() / H(), 0.1, 500);

    // --- INIT CANNON-ES ---
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -25, 0) });
    world.broadphase = new CANNON.NaiveBroadphase();
    const matGround = new CANNON.Material("ground"),
      matObj = new CANNON.Material("obj");
    world.addContactMaterial(
      new CANNON.ContactMaterial(matGround, matObj, { friction: 0.8, restitution: 0.1 })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(matObj, matObj, { friction: 0.5, restitution: 0.3 })
    );

    // --- LIGHTING ---
    scene.add(new THREE.AmbientLight(0x223344, 0.6));
    const sun = new THREE.DirectionalLight(0xffaa55, 1.2);
    sun.position.set(100, 150, -50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    scene.add(sun);

    const headLamp = new THREE.SpotLight(0xccffff, 1.5, 120, Math.PI / 5, 0.6, 1);
    headLamp.position.set(0, 0, 0);
    headLamp.target.position.set(0, 0, -10);
    camera.add(headLamp);
    camera.add(headLamp.target);

    // --- ENVIRONMENT ---
    const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: matGround });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

    const tGeo = new THREE.PlaneGeometry(600, 600, 64, 64);
    tGeo.rotateX(-Math.PI / 2);
    const tPos = tGeo.attributes.position.array;
    for (let i = 0; i < tPos.length; i += 3)
      tPos[i + 1] = Math.sin(tPos[i] * 0.05) * 1.5 + Math.cos(tPos[i + 2] * 0.05) * 1.5;
    tGeo.computeVertexNormals();
    const tMesh = new THREE.Mesh(
      tGeo,
      new THREE.MeshStandardMaterial({ color: 0x1c252a, roughness: 0.9, flatShading: true })
    );
    tMesh.receiveShadow = true;
    scene.add(tMesh);

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x003322,
      transparent: true,
      opacity: 0.2,
    });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(tGeo), wireMat);
    wireframe.position.y = 0.1;
    scene.add(wireframe);

    const mGeo = new THREE.ConeGeometry(20, 40, 5);
    const mMat = new THREE.MeshStandardMaterial({ color: 0x111518, flatShading: true });
    for (let i = 0; i < 15; i++) {
      const m = new THREE.Mesh(mGeo, mMat);
      const x = (Math.random() - 0.5) * 500,
        z = (Math.random() - 0.5) * 500;
      if (Math.sqrt(x * x + z * z) < 60) continue;
      m.position.set(x, 15, z);
      m.rotation.y = Math.random() * Math.PI;
      scene.add(m);
    }

    // --- CENTRAL SILO ---
    const siloGroup = new THREE.Group();
    scene.add(siloGroup);
    const sBase = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 10, 4, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
    );
    sBase.position.y = 2;
    sBase.castShadow = sBase.receiveShadow = true;
    siloGroup.add(sBase);
    const sBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 200, 16),
      new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    sBeam.position.y = 100;
    siloGroup.add(sBeam);

    const sBody = new CANNON.Body({ mass: 0, material: matGround });
    sBody.addShape(new CANNON.Box(new CANNON.Vec3(8, 2, 8)));
    sBody.position.set(0, 2, 0);
    world.addBody(sBody);
    const siloLight = new THREE.PointLight(0x00ffcc, 2.0, 80);
    siloLight.position.set(0, 10, 0);
    siloGroup.add(siloLight);

    // --- ORE GENERATION ---
    const oreGeo = new THREE.DodecahedronGeometry(1, 0);
    const oMatStd = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x004433,
      flatShading: true,
    });
    const oMatRare = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0x660066,
      flatShading: true,
    });

    function spawnOre(x, y, z, size, type = "ore", isRare = false) {
      const mesh = new THREE.Mesh(oreGeo, isRare ? oMatRare : oMatStd);
      mesh.scale.setScalar(size);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(mesh);
      if (isRare && type === "ore") mesh.add(new THREE.PointLight(0xff00ff, 1.5, 20));

      const body = new CANNON.Body({
        mass: type === "debris" ? size * 15 : 0,
        material: matObj,
        position: new CANNON.Vec3(x, y, z),
        linearDamping: 0.5,
        angularDamping: 0.5,
      });
      body.addShape(new CANNON.Sphere(size));
      world.addBody(body);

      const hp = isRare ? 300 : 100;
      State.physObjs.push({ mesh, body, type, hp, maxHp: hp, size, isRare });
    }
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 300,
        z = (Math.random() - 0.5) * 300;
      if (Math.sqrt(x * x + z * z) < 30) continue;
      const s = 1.5 + Math.random() * 2.0;
      const rare = Math.random() < 0.15;
      spawnOre(x, s * 0.8, z, s, "ore", rare);
    }

    // --- TRUE DIEGETIC COCKPIT ---
    const player = new THREE.Group();
    scene.add(player);
    player.position.y = 4.0;
    const pitchNode = new THREE.Group();
    player.add(pitchNode);
    const shakeNode = new THREE.Group();
    pitchNode.add(shakeNode);
    shakeNode.add(camera);

    const cockpit = new THREE.Group();
    camera.add(cockpit);
    const matFrame = new THREE.MeshStandardMaterial({
      color: 0x0f1418,
      roughness: 0.9,
      metalness: 0.6,
    });
    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });

    const dashCanvas = document.createElement("canvas");
    dashCanvas.width = 1024;
    dashCanvas.height = 256;
    const dashCtx = dashCanvas.getContext("2d");
    const dashTex = new THREE.CanvasTexture(dashCanvas);

    const dashGeo = new THREE.BoxGeometry(12, 1.5, 2.5);
    const dashMats = [
      matFrame,
      matFrame,
      new THREE.MeshBasicMaterial({ map: dashTex }),
      matFrame,
      matFrame,
      matFrame,
    ];
    const dashboard = new THREE.Mesh(dashGeo, dashMats);
    dashboard.position.set(0, -1.3, -1.8);
    dashboard.rotation.x = -0.25;
    cockpit.add(dashboard);

    const pL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.2), matFrame);
    pL.position.set(-3.5, 0, -2.5);
    pL.rotation.z = -0.1;
    pL.rotation.x = 0.2;
    cockpit.add(pL);
    const pR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.2), matFrame);
    pR.position.set(3.5, 0, -2.5);
    pR.rotation.z = 0.1;
    pR.rotation.x = 0.2;
    cockpit.add(pR);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), matGlass);
    glass.position.set(0, 0.5, -2.8);
    glass.rotation.x = 0.1;
    cockpit.add(glass);

    const matSaw = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 1.0,
      roughness: 0.3,
      emissive: 0x000000,
    });
    const saw = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.05, 32).rotateX(Math.PI / 2),
      matSaw
    );
    saw.add(new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.05, 5, 24), matSaw));
    saw.position.set(0, -1.4, -2.5);
    cockpit.add(saw);

    // sawGroup wraps saw for world-space transform calculations
    const sawGroup = new THREE.Group();
    sawGroup.position.copy(saw.position);
    cockpit.add(sawGroup);

    const magnetBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1, 8).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );
    magnetBeam.visible = false;
    scene.add(magnetBeam);

    // Update Diegetic Dashboard Screen
    function updateDashboard() {
      const ctx = dashCtx;
      ctx.fillStyle = "#050a0f";
      ctx.fillRect(0, 0, 1024, 256);
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 4;
      ctx.strokeRect(5, 5, 1014, 246);
      ctx.strokeStyle = "#003344";
      ctx.lineWidth = 1;
      for (let i = 0; i < 1024; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
      }

      const pct = Math.min(100, Math.floor((State.totalOre / State.maxOre) * 100));
      ctx.fillStyle = pct >= 100 ? "#ffaa00" : "#00ffcc";
      ctx.font = "bold 36px Courier New";
      ctx.fillText(`HOPPER [${pct}%]`, 40, 60);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#00ffcc";
      ctx.strokeRect(40, 80, 350, 30);
      const wStd = 342 * (State.rawStandard / State.maxOre);
      const wRare = 342 * (State.rawRare / State.maxOre);
      ctx.fillStyle = "#00ffcc";
      ctx.fillRect(44, 84, wStd, 22);
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(44 + wStd, 84, wRare, 22);

      ctx.fillStyle = State.overheated ? "#ff0000" : "#ff4400";
      ctx.fillText(`HEAT [${Math.floor(State.heat)}C]`, 40, 160);
      ctx.strokeStyle = State.overheated ? "#ff0000" : "#ff4400";
      ctx.strokeRect(40, 180, 350, 30);
      ctx.fillRect(44, 184, 342 * (State.heat / 100), 22);

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffaa00";
      ctx.font = "bold 50px Courier New";
      ctx.fillText(`CREDITS: $${State.credits}`, 980, 80);
      ctx.font = "bold 36px Courier New";
      ctx.fillStyle = State.overheated ? "#ff0000" : "#00ffcc";
      ctx.fillText(State.overheated ? `ERR: OVERHEAT DETECTED` : `SYS: NOMINAL`, 980, 150);
      if (State.dashTimer > 0) {
        ctx.fillStyle = "#00ffff";
        ctx.fillText(`THRUSTER ENGAGED`, 980, 200);
      }

      dashTex.needsUpdate = true;
    }

    // --- CUBES & PARTICLES ---
    function getCubeMat(cHex, gHex) {
      const s = 256,
        c = document.createElement("canvas"),
        x = c.getContext("2d"),
        b = document.createElement("canvas"),
        bx = b.getContext("2d");
      c.width = c.height = b.width = b.height = s;
      x.fillStyle = "#111";
      x.fillRect(0, 0, s, s);
      x.fillStyle = cHex;
      x.fillRect(5, 5, 246, 246);
      x.fillStyle = "#051010";
      x.fillRect(15, 15, 226, 226);
      x.fillStyle = gHex;
      x.fillRect(100, 100, 56, 56);
      bx.fillStyle = "#fff";
      bx.fillRect(0, 0, s, s);
      bx.fillStyle = "#888";
      bx.fillRect(10, 10, 236, 236);
      bx.fillStyle = "#000";
      bx.fillRect(15, 15, 226, 226);
      bx.fillStyle = "#fff";
      bx.fillRect(100, 100, 56, 56);
      return new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(c),
        bumpMap: new THREE.CanvasTexture(b),
        bumpScale: 0.08,
        roughness: 0.4,
        metalness: 0.8,
        emissive: gHex,
        emissiveIntensity: 0.5,
      });
    }
    const matCubeStd = getCubeMat("#ffaa00", "#00ffcc");
    const matCubeRare = getCubeMat("#ff00ff", "#ff00ff");

    const sparks = [];
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const pMatStd = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      blending: THREE.AdditiveBlending,
    });
    const pMatRare = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      blending: THREE.AdditiveBlending,
    });

    function spawnSpark(pos, _type = "spark", rare = false) {
      if (sparks.length > 150) return;
      const mesh = new THREE.Mesh(pGeo, rare ? pMatRare : pMatStd);
      mesh.position.copy(pos);
      mesh.position.add(
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      );
      scene.add(mesh);
      sparks.push({
        mesh,
        life: 1.0,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          Math.random() * 20,
          (Math.random() - 0.5) * 20
        ),
      });
    }

    function spawnText(msg, x, y, color = "#ffaa00") {
      const el = document.createElement("div");
      el.className = "tm-float-text";
      el.textContent = msg;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.color = color;
      if (color === "#ff00ff") el.style.textShadow = "0 0 15px #ff00ff";
      container.appendChild(el);
      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 1500);
    }

    function ejectCube() {
      const isRare = State.rawRare > State.rawStandard;
      State.rawStandard = State.rawRare = 0;
      updateDashboard();
      SFX.eject();
      State.camShake = 0.6;

      const size = 0.9;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size * 2, size * 2, size * 2),
        isRare ? matCubeRare : matCubeStd
      );
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      const body = new CANNON.Body({
        mass: 60,
        material: matObj,
        linearDamping: 0.1,
        angularDamping: 0.1,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(size, size, size)));

      const spawnPos = new THREE.Vector3(0, -1.0, -1.5).applyMatrix4(camera.matrixWorld);
      body.position.copy(spawnPos);
      const fwd = new THREE.Vector3(0, 0.4, -1).applyQuaternion(camera.quaternion).normalize();
      body.velocity.set(fwd.x * 30, fwd.y * 30, fwd.z * 30);
      body.angularVelocity.set(Math.random() * 5, Math.random() * 5, Math.random() * 5);

      world.addBody(body);
      State.physObjs.push({ mesh, body, type: "cube", hp: Infinity, isRare });
    }

    // --- UPGRADES MENU LOGIC ---
    const uiUpgrades = container.querySelector("#tm-upgrades-screen");
    function toggleUpgrades(show) {
      if (show) {
        uiUpgrades.classList.remove("tm-hidden");
        container.querySelector("#tm-menu-credits").textContent = State.credits;
        refreshUpgradeBtns();
      } else {
        uiUpgrades.classList.add("tm-hidden");
        updateDashboard();
      }
    }
    function refreshUpgradeBtns() {
      ["cap", "pow", "cool"].forEach((t) => {
        container.querySelector(`#tm-lvl-${t}`).textContent = State.upgrades[t];
        const btn = container.querySelector(`#tm-buy-${t}`);
        btn.textContent = `$${State.getCost(t)}`;
        btn.disabled = State.credits < State.getCost(t);
      });
    }
    function buyUpgrade(t) {
      if (State.credits >= State.getCost(t)) {
        State.credits -= State.getCost(t);
        State.upgrades[t]++;
        SFX.buy();
        container.querySelector("#tm-menu-credits").textContent = State.credits;
        refreshUpgradeBtns();
      } else SFX.error();
    }

    container.querySelector("#tm-btn-upgrades").addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      toggleUpgrades(true);
    });
    container
      .querySelector("#tm-close-upgrades-btn")
      .addEventListener("click", () => toggleUpgrades(false));
    ["cap", "pow", "cool"].forEach((t) =>
      container.querySelector(`#tm-buy-${t}`).addEventListener("click", () => buyUpgrade(t))
    );

    // --- INPUT & TRACTOR BEAM ---
    const input = { move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, yaw: 0, pitch: 0 };
    const pointers = {};
    function bindJoy(zId, kId, key) {
      const z = container.querySelector(`#${zId}`),
        k = container.querySelector(`#${kId}`),
        c = 70,
        mR = 45;
      z.addEventListener("pointerdown", (e) => {
        z.setPointerCapture(e.pointerId);
        pointers[e.pointerId] = key;
        update(e);
      });
      z.addEventListener("pointermove", (e) => {
        if (pointers[e.pointerId] === key) update(e);
      });
      const reset = (e) => {
        if (pointers[e.pointerId] === key) {
          delete pointers[e.pointerId];
          input[key] = { x: 0, y: 0 };
          k.style.transform = "translate(0,0)";
        }
      };
      z.addEventListener("pointerup", reset);
      z.addEventListener("pointercancel", reset);
      function update(e) {
        const r = z.getBoundingClientRect();
        let dx = e.clientX - r.left - c,
          dy = e.clientY - r.top - c;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > mR) {
          dx = (dx / d) * mR;
          dy = (dy / d) * mR;
        }
        k.style.transform = `translate(${dx}px, ${dy}px)`;
        input[key].x = dx / mR;
        input[key].y = -dy / mR;
      }
    }
    bindJoy("tm-left-joystick", "tm-left-knob", "move");
    bindJoy("tm-right-joystick", "tm-right-knob", "look");

    const keys = {};
    const onKeyDown = (e) => {
      keys[e.key.toLowerCase()] = 1;
      if (e.key.toLowerCase() === "u") toggleUpgrades(!uiUpgrades.classList.contains("tm-hidden"));
      if (e.key === "Shift") triggerDash();
    };
    const onKeyUp = (e) => {
      keys[e.key.toLowerCase()] = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const btnDash = container.querySelector("#tm-btn-dash");
    function triggerDash() {
      if (State.dashTimer <= -1.0) {
        State.dashTimer = 0.5;
        SFX.thrust();
        State.camShake = 0.2;
        updateDashboard();
      }
    }
    btnDash.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      triggerDash();
    });

    const intLayer = container.querySelector("#tm-interaction-layer");
    const raycaster = new THREE.Raycaster();
    State.dragBody = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC });
    world.addBody(State.dragBody);

    intLayer.addEventListener("pointerdown", (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObjects(State.physObjs.map((o) => o.mesh));
      if (hits.length > 0) {
        const obj = State.physObjs.find((o) => o.mesh === hits[0].object);
        if (obj && obj.type !== "ore") {
          SFX.latch();
          State.dragBody.position.copy(hits[0].point);
          State.dragLastPos = hits[0].point.clone();
          State.dragConstraint = new CANNON.PointToPointConstraint(
            State.dragBody,
            new CANNON.Vec3(0, 0, 0),
            obj.body,
            obj.body.pointToLocalFrame(
              new CANNON.Vec3(hits[0].point.x, hits[0].point.y, hits[0].point.z)
            )
          );
          world.addConstraint(State.dragConstraint);
          State.dragDepth = hits[0].distance;
          container.querySelector("#tm-crosshair").classList.add("active");
        }
      }
    });
    intLayer.addEventListener("pointermove", (e) => {
      if (State.dragConstraint) {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1,
          ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
        const newPos = raycaster.camera.position
          .clone()
          .add(raycaster.ray.direction.multiplyScalar(State.dragDepth));
        if (State.dragLastPos)
          State.dragVel = newPos.clone().sub(State.dragLastPos).multiplyScalar(60);
        State.dragLastPos = newPos.clone();
        State.dragBody.position.copy(newPos);
        State.dragConstraint.bodyB.wakeUp();
      }
    });
    const endDrag = () => {
      if (State.dragConstraint) {
        const b = State.dragConstraint.bodyB;
        world.removeConstraint(State.dragConstraint);
        State.dragConstraint = null;
        container.querySelector("#tm-crosshair").classList.remove("active");
        if (State.dragVel && State.dragVel.length() > 5) {
          SFX.throw();
          const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
          b.velocity.set(
            State.dragVel.x + fwd.x * 15,
            State.dragVel.y + fwd.y * 15,
            State.dragVel.z + fwd.z * 15
          );
        }
        State.dragVel = null;
        State.dragLastPos = null;
      }
    };
    intLayer.addEventListener("pointerup", endDrag);
    intLayer.addEventListener("pointercancel", endDrag);

    // --- RESIZE ---
    const onResize = () => {
      const w = W(),
        h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- START ---
    updateDashboard();
    renderer.render(scene, camera);

    // --- MAIN LOOP ---
    const clock = new THREE.Clock();
    let bob = 0,
      stepTimer = 0;
    let animFrameId = null;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      if (!uiUpgrades.classList.contains("tm-hidden")) {
        renderer.render(scene, camera);
        return;
      }

      const dt = Math.min(clock.getDelta(), 0.1);
      world.step(1 / 60, dt, 3);

      // Sync Physics & Silo
      for (let i = State.physObjs.length - 1; i >= 0; i--) {
        const obj = State.physObjs[i];
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);

        if (
          obj.type === "cube" &&
          obj.body.position.distanceTo(siloGroup.position) < 14 &&
          obj.body.position.y < 20
        ) {
          const val = obj.isRare ? 2500 : 500;
          SFX.sell(obj.isRare);
          State.credits += val;
          updateDashboard();
          const cw = W(),
            ch = H();
          spawnText(`+$${val}`, cw / 2, ch / 2, obj.isRare ? "#ff00ff" : "#00ffcc");

          if (State.dragConstraint && State.dragConstraint.bodyB === obj.body) endDrag();
          scene.remove(obj.mesh);
          world.removeBody(obj.body);
          State.physObjs.splice(i, 1);
          for (let p = 0; p < 20; p++)
            spawnSpark(siloGroup.position.clone().setY(5), "spark", obj.isRare);
          continue;
        }
        if (obj.body.position.y < -10) {
          scene.remove(obj.mesh);
          world.removeBody(obj.body);
          State.physObjs.splice(i, 1);
        }
      }

      // Move & Look
      let spd = 0.25 * (1 + (State.upgrades.spd - 1) * 0.3);
      let fov = 85;
      State.dashTimer -= dt;
      if (State.dashTimer > 0) {
        spd *= 3.5;
        fov = 105;
      }
      camera.fov = THREE.MathUtils.lerp(camera.fov, fov, 0.1);
      camera.updateProjectionMatrix();

      let mx = input.move.x + (keys.d || 0) - (keys.a || 0);
      let my = input.move.y + (keys.w || 0) - (keys.s || 0);
      if (mx || my) {
        const l = Math.sqrt(mx * mx + my * my);
        mx /= l;
        my /= l;
      }
      const lx = input.look.x + (keys.arrowright || 0) - (keys.arrowleft || 0);
      const ly = input.look.y + (keys.arrowup || 0) - (keys.arrowdown || 0);

      input.yaw -= lx * State.lookSpeed * dt;
      input.pitch += ly * State.lookSpeed * dt;
      input.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 4, input.pitch));
      player.rotation.y = input.yaw;
      pitchNode.rotation.x = input.pitch;

      if (mx || my) {
        const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          input.yaw
        );
        const rgt = new THREE.Vector3(1, 0, 0).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          input.yaw
        );
        player.position.add(fwd.multiplyScalar(my * spd));
        player.position.add(rgt.multiplyScalar(mx * spd));
        bob += dt * 14;
        shakeNode.position.y = Math.sin(bob) * 0.15;
        stepTimer += dt * (State.dashTimer > 0 ? 2 : 1);
        if (stepTimer > 0.4) {
          SFX.step();
          stepTimer = 0;
        }
      } else {
        shakeNode.position.y = THREE.MathUtils.lerp(shakeNode.position.y, 0, 0.1);
      }

      // Camera Shake
      if (State.camShake > 0) {
        shakeNode.position.x = (Math.random() - 0.5) * State.camShake;
        shakeNode.position.z = (Math.random() - 0.5) * State.camShake;
        State.camShake -= dt;
      } else {
        shakeNode.position.x = shakeNode.position.z = 0;
      }

      // Tractor Beam Visuals
      if (State.dragConstraint) {
        magnetBeam.visible = true;
        const sw = new THREE.Vector3();
        player.getWorldPosition(sw);
        sw.y += 1;
        const ew = State.dragConstraint.bodyB.position;
        magnetBeam.position.copy(sw).lerp(ew, 0.5);
        magnetBeam.lookAt(ew);
        magnetBeam.scale.set(1, 1, sw.distanceTo(ew));
        State.dragDepth = Math.max(8.0, State.dragDepth - dt * 15);
      } else {
        magnetBeam.visible = false;
      }

      // Grind Logic (Check from front of saw)
      saw.updateMatrixWorld(true);
      const sawTip = new THREE.Vector3(0, 0, -1.8).applyMatrix4(saw.matrixWorld);
      let closest = null,
        minDist = 4.0;

      if (!State.overheated) {
        State.physObjs.forEach((o) => {
          if (o.type === "ore" || o.type === "debris") {
            const d = sawTip.distanceTo(o.body.position) - o.size;
            if (d < minDist) {
              minDist = d;
              closest = o;
            }
          }
        });
      }

      if (closest && State.totalOre < State.maxOre && !State.dragConstraint) {
        State.camShake = 0.05;
        saw.rotation.z -= 30 * dt;
        SFX.grind(closest.isRare);

        closest.hp -= State.grindDps * dt;
        if (closest.type === "ore") {
          closest.mesh.scale.setScalar(Math.max(0.1, closest.hp / closest.maxHp) * closest.size);
        } else {
          const pull = new THREE.Vector3().copy(sawTip).sub(closest.body.position).normalize();
          closest.body.applyForce(
            new CANNON.Vec3(pull.x * 500, pull.y * 500, pull.z * 500),
            closest.body.position
          );
        }

        const yld = 40 * dt;
        if (closest.isRare) State.rawRare += yld;
        else State.rawStandard += yld;
        State.heat += State.heatGen * dt * (closest.isRare ? 2 : 1);

        if (State.heat >= 100) {
          State.heat = 100;
          State.overheated = true;
          SFX.alarm();
          SFX.hiss();
          container.querySelector("#tm-screen-fx").classList.add("overheat");
          for (let i = 0; i < 30; i++) spawnSpark(sawTip);
        }

        spawnSpark(sawTip, "spark", closest.isRare);
        updateDashboard();

        if (closest.hp <= 0) {
          scene.remove(closest.mesh);
          world.removeBody(closest.body);
          State.physObjs.splice(State.physObjs.indexOf(closest), 1);
          const cw = W(),
            ch = H();
          spawnText(
            closest.isRare ? "+ISOTOPE" : "+ORE",
            cw / 2 + 50,
            ch / 2,
            closest.isRare ? "#ff00ff" : "#00ffcc"
          );

          if (closest.type === "ore" && closest.size > 1.0) {
            for (let d = 0; d < 4; d++)
              spawnOre(
                closest.body.position.x + (Math.random() - 0.5) * 2,
                closest.body.position.y + Math.random() * 2,
                closest.body.position.z + (Math.random() - 0.5) * 2,
                closest.size * 0.4,
                "debris",
                closest.isRare
              );
          }
        }
      } else {
        saw.rotation.z -= 2.0 * dt;
        if (State.heat > 0) {
          State.heat = Math.max(0, State.heat - State.coolingRate * dt);
          if (State.heat < 20 && State.overheated) {
            State.overheated = false;
            container.querySelector("#tm-screen-fx").classList.remove("overheat");
          }
          updateDashboard();
        }
      }

      matSaw.emissive.setHex(0x000000).lerp(new THREE.Color(0xff4400), State.heat / 100);
      if (State.totalOre >= State.maxOre && !State.overheated) ejectCube();

      // Particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.vel.y -= 40 * dt;
        p.mesh.position.add(p.vel.clone().multiplyScalar(dt));
        if (p.mesh.position.y < 0) {
          p.mesh.position.y = 0;
          p.vel.y *= -0.5;
          p.vel.x *= 0.8;
          p.vel.z *= 0.8;
        }
        p.life -= dt * 1.5;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          sparks.splice(i, 1);
        }
      }

      sBeam.rotation.y += 1 * dt;
      sBeam.material.opacity = 0.2 + Math.sin(clock.elapsedTime * 5) * 0.05;
      renderer.render(scene, camera);
    }

    container.querySelector("#tm-start-btn").addEventListener("click", () => {
      SFX.init();
      SFX.playOsc("sine", 800, 0.5, 0.1);
      container.querySelector("#tm-start-screen").classList.add("tm-hidden");
      clock.start();
      animate();
    });

    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      console.error = originalError;
      renderer.dispose();
      if (SFX.ctx) SFX.ctx.close();
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#020406",
      }}
    />
  );
}
