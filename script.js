
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE V2
// Textured voxel world, water, clouds, trees and movement

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c9ff);
scene.fog = new THREE.Fog(0x86c9ff, 38, 100);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.1, 180
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// SUNLIGHT
scene.add(new THREE.HemisphereLight(0xc8e7ff, 0x6a825a, 2.3));

const sun = new THREE.DirectionalLight(0xfff1ca, 2.4);
sun.position.set(35, 65, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -35;
sun.shadow.camera.right = 35;
sun.shadow.camera.top = 35;
sun.shadow.camera.bottom = -35;
sun.shadow.normalBias = 0.035;
scene.add(sun);

// PIXEL ART TEXTURE GENERATOR
function makeTexture(base, variation, seed) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d");

  let s = seed;
  function random() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  }

  const c = new THREE.Color(base);

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const shade = (random() - 0.5) * variation;
      const color = c.clone();
      color.r = THREE.MathUtils.clamp(color.r + shade, 0, 1);
      color.g = THREE.MathUtils.clamp(color.g + shade, 0, 1);
      color.b = THREE.MathUtils.clamp(color.b + shade, 0, 1);

      ctx.fillStyle = "#" + color.getHexString();
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function material(color, variation, seed) {
  return new THREE.MeshLambertMaterial({
    map: makeTexture(color, variation, seed)
  });
}

const dirt = material(0x835333, 0.16, 11);
const grass = material(0x4caa38, 0.12, 21);
const stone = material(0x81858b, 0.17, 31);
const bark = material(0x79502d, 0.15, 41);
const leaves = material(0x277e30, 0.18, 51);
const sand = material(0xe4ca83, 0.10, 61);

// Grass top and dirt sides
const grassSide = material(0x668348, 0.18, 71);
const woodTop = material(0xa17b4b, 0.15, 81);

const blockTypes = {
  1: {name: "Grass", mats: [
    grassSide, grassSide, grass, dirt, grassSide, grassSide
  ]},
  2: {name: "Dirt", mats: dirt},
  3: {name: "Stone", mats: stone},
  4: {name: "Wood", mats: [
    bark, bark, woodTop, woodTop, bark, bark
  ]},
  5: {name: "Leaves", mats: leaves},
  6: {name: "Sand", mats: sand}
};

const cube = new THREE.BoxGeometry(1, 1, 1);
const blocks = new Map();
const meshes = [];

function blockKey(x, y, z) {
  return `${x},${y},${z}`;
}

function addBlock(x, y, z, type = 1) {
  if (!blockTypes[type]) return;
  const k = blockKey(x, y, z);
  if (blocks.has(k)) return;

  const mesh = new THREE.Mesh(cube, blockTypes[type].mats);
  mesh.position.set(x, y, z);
  mesh.userData.type = type;
  mesh.receiveShadow = true;
  mesh.castShadow = type === 4 || type === 5;

  scene.add(mesh);
  blocks.set(k, mesh);
  meshes.push(mesh);
}

function removeBlock(mesh) {
  if (!mesh) return;
  const p = mesh.position;
  blocks.delete(blockKey(p.x, p.y, p.z));
  scene.remove(mesh);
  const i = meshes.indexOf(mesh);
  if (i >= 0) meshes.splice(i, 1);
}

// WORLD GENERATION
const SIZE = 29;
const heights = new Map();

function terrainHeight(x, z) {
  const hills =
    Math.sin(x * 0.105) * 2.8 +
    Math.cos(z * 0.12) * 2.5 +
    Math.sin((x + z) * 0.075) * 2.5 +
    Math.sin(x * 0.32) * Math.cos(z * 0.28) * 0.7;

  const riverCenter = Math.sin(z * 0.075) * 8 + 13;
  const riverDistance = Math.abs(x - riverCenter);

  if (riverDistance < 4) {
    return Math.min(
      Math.floor(hills + 1),
      riverDistance < 2.5 ? -2 : -1
    );
  }

  return Math.floor(hills + 1);
}

// Terrain columns
for (let x = -SIZE; x <= SIZE; x++) {
  for (let z = -SIZE; z <= SIZE; z++) {
    const h = terrainHeight(x, z);
    heights.set(blockKey(x, 0, z), h);

    const topType = h <= -1 ? 6 : h >= 6 ? 3 : 1;
    addBlock(x, h, z, topType);

    // Enough depth for mining and exposed cliffs
    for (let y = h - 1; y >= Math.max(-5, h - 4); y--) {
      addBlock(x, y, z, y >= h - 2 ? 2 : 3);
    }
  }
}

// FOREST
function createTree(x, z) {
  const y = terrainHeight(x, z);
  if (y < 0 || y > 5) return;

  const trunkHeight = 3 + Math.floor(
    (Math.sin(x * 13.2 + z * 7.1) + 1) * 1.2
  );

  for (let i = 1; i <= trunkHeight; i++) {
    addBlock(x, y + i, z, 4);
  }

  for (let dy = -1; dy <= 2; dy++) {
    const radius = dy === 2 ? 1 : 2;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > radius * 1.7) {
          continue;
        }
        if (dx === 0 && dz === 0 && dy <= 0) continue;

        addBlock(x + dx, y + trunkHeight + dy, z + dz, 5);
      }
    }
  }
}

function rand01(n) {
  const v = Math.sin(n * 127.1 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

for (let x = -SIZE + 3; x < SIZE - 3; x += 5) {
  for (let z = -SIZE + 3; z < SIZE - 3; z += 5) {
    if (rand01(x * 113 + z * 79) > 0.40) {
      const tx = x + Math.floor(rand01(x + z * 19) * 3);
      const tz = z + Math.floor(rand01(z + x * 23) * 3);

      if (Math.hypot(tx, tz - 6) > 9) {
        createTree(tx, tz);
      }
    }
  }
}

// WATER
const waterMat = new THREE.MeshPhongMaterial({
  color: 0x248bc8,
  transparent: true,
  opacity: 0.66,
  shininess: 85,
  depthWrite: false,
  side: THREE.DoubleSide
});

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(SIZE * 2 + 1, SIZE * 2 + 1),
  waterMat
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.27;
water.renderOrder = 1;
scene.add(water);

// CLOUDS
const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.88
});
const clouds = [];

for (let i = 0; i < 15; i++) {
  const group = new THREE.Group();
  const x = (rand01(i * 7) - 0.5) * 100;
  const z = (rand01(i * 11) - 0.5) * 100;

  for (let p = 0; p < 4; p++) {
    const part = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1.3, 3),
      cloudMaterial
    );
    part.position.x = p * 3;
    part.position.y = Math.sin(p) * 0.4;
    group.add(part);
  }

  group.position.set(x, 20 + rand01(i * 31) * 7, z);
  scene.add(group);
  clouds.push(group);
}

// PLAYER AND CAMERA
const player = {
  height: 1.7,
  radius: 0.28,
  speed: 5,
  sprint: 8,
  velocityY: 0,
  grounded: false,
  flying: false
};

camera.position.set(
  0,
  terrainHeight(0, 6) + 0.5 + player.height,
  6
);

const keys = {};
let yaw = 0;
let pitch = 0;
let playing = false;
let selectedBlock = 1;

const menu = document.getElementById("menu");
const ui = document.getElementById("gameUI");

document.getElementById("playBtn").onclick = () => {
  renderer.domElement.requestPointerLock();
};

document.addEventListener("pointerlockchange", () => {
  playing = document.pointerLockElement === renderer.domElement;
  menu.style.display = playing ? "none" : "flex";
  ui.hidden = !playing;

  if (!playing) {
    for (const key in keys) keys[key] = false;
  }
});

document.addEventListener("mousemove", e => {
  if (!playing) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = THREE.MathUtils.clamp(pitch, -1.48, 1.48);

  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

function chooseBlock(n) {
  if (!blockTypes[n]) return;

  selectedBlock = n;

  document.querySelectorAll(".slot").forEach(slot => {
    slot.classList.toggle(
      "selected",
      Number(slot.dataset.block) === n
    );
  });
}

document.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) {
    e.preventDefault();
  }

  if (playing && e.code === "KeyF" && !e.repeat) {
    player.flying = !player.flying;
    player.velocityY = 0;
  }

  if (playing && e.code.startsWith("Digit")) {
    chooseBlock(Number(e.code.slice(5)));
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// MINING AND BUILDING
const raycaster = new THREE.Raycaster();
raycaster.far = 6;
const screenCenter = new THREE.Vector2(0, 0);

document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("mousedown", e => {
  if (!playing) return;

  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return;

  const hit = hits[0];

  if (e.button === 0) {
    removeBlock(hit.object);
  }

  if (e.button === 2) {
    const pos = hit.object.position.clone()
      .add(hit.face.normal).round();

    if (
      Math.abs(pos.x - camera.position.x) < 0.8 &&
      Math.abs(pos.z - camera.position.z) < 0.8 &&
      Math.abs(pos.y - (camera.position.y - 1)) < 1.5
    ) return;

    addBlock(pos.x, pos.y, pos.z, selectedBlock);
  }
});

// SIMPLE VOXEL COLLISION
function isSolid(x, y, z) {
  return blocks.has(blockKey(
    Math.round(x),
    Math.round(y),
    Math.round(z)
  ));
}

function collides(pos) {
  for (const dx of [-player.radius, player.radius]) {
    for (const dz of [-player.radius, player.radius]) {
      for (const dy of [-player.height + 0.15, -0.85, -0.15]) {
        if (isSolid(pos.x + dx, pos.y + dy, pos.z + dz)) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveAxis(axis, amount) {
  const next = camera.position.clone();
  next[axis] += amount;

  if (!collides(next)) {
    camera.position[axis] = next[axis];
    return true;
  }
  return false;
}

// GAME LOOP
const clock = new THREE.Clock();
const direction = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.035);
  const time = clock.elapsedTime;

  // Clouds and water
  for (const cloud of clouds) {
    cloud.position.x += dt * 0.55;
    if (cloud.position.x > 65) cloud.position.x = -65;
  }
  water.position.y = -0.27 + Math.sin(time * 1.3) * 0.025;

  if (playing) {
    const speed = keys.ShiftLeft ? player.sprint : player.speed;
    direction.set(0, 0, 0);

    const forward = new THREE.Vector3(
      -Math.sin(yaw), 0, -Math.cos(yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(yaw), 0, -Math.sin(yaw)
    );

    if (keys.KeyW) direction.add(forward);
    if (keys.KeyS) direction.sub(forward);
    if (keys.KeyD) direction.add(right);
    if (keys.KeyA) direction.sub(right);

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(speed * dt);
      moveAxis("x", direction.x);
      moveAxis("z", direction.z);
    }

    if (player.flying) {
      let vertical = 0;
      if (keys.Space) vertical += speed * dt;
      if (keys.ControlLeft) vertical -= speed * dt;
      moveAxis("y", vertical);
      player.velocityY = 0;
      player.grounded = false;
    } else {
      if (keys.Space && player.grounded) {
        player.velocityY = 7.5;
        player.grounded = false;
      }

      player.velocityY -= 20 * dt;
      const movement = player.velocityY * dt;

      const moved = moveAxis("y", movement);

      if (!moved) {
        player.grounded = player.velocityY <= 0;
        player.velocityY = 0;
      } else {
        // Probe for ground below the player's feet.
        const test = camera.position.clone();
        test.y -= 0.07;
        player.grounded = collides(test);
      }
    }

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x, -SIZE + 1, SIZE - 1
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z, -SIZE + 1, SIZE - 1
    );

    if (camera.position.y < -12) {
      camera.position.set(
        0,
        terrainHeight(0, 6) + 4,
        6
      );
      player.velocityY = 0;
    }

    document.getElementById("coordinates").textContent =
      `XYZ: ${camera.position.x.toFixed(0)}, ` +
      `${camera.position.y.toFixed(0)}, ` +
      `${camera.position.z.toFixed(0)}`;
  }

  renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
