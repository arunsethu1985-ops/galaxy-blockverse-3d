
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE V3
// Improved 3D graphics, movement, collision and mining

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91cfff);
scene.fog = new THREE.Fog(0x91cfff, 45, 105);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.05, 170
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
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(
  0xc5e5ff, 0x788657, 2.1
));

const sun = new THREE.DirectionalLight(0xffe9bb, 2.8);
sun.position.set(22, 45, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -35;
sun.shadow.camera.right = 35;
sun.shadow.camera.top = 35;
sun.shadow.camera.bottom = -35;
sun.shadow.normalBias = 0.035;
scene.add(sun);

// PIXEL TEXTURES
function texture(base, seed, kind = "normal") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d");

  let n = seed;
  function random() {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  }

  const color = new THREE.Color(base);

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      let shade = (random() - 0.5) * 0.24;

      if (kind === "bark" && x % 5 === 0) {
        shade -= 0.13;
      }

      if (kind === "grassSide") {
        if (y < 5 + Math.floor(random() * 3)) {
          const grass = new THREE.Color(0x5aaa3c);
          const c = grass.clone().multiplyScalar(
            0.8 + random() * 0.35
          );
          ctx.fillStyle = "#" + c.getHexString();
          ctx.fillRect(x, y, 1, 1);
          continue;
        }
      }

      if (kind === "stone" && random() < 0.09) {
        shade -= 0.2;
      }

      const c = color.clone();
      c.r = THREE.MathUtils.clamp(c.r + shade, 0, 1);
      c.g = THREE.MathUtils.clamp(c.g + shade, 0, 1);
      c.b = THREE.MathUtils.clamp(c.b + shade, 0, 1);

      ctx.fillStyle = "#" + c.getHexString();
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function mat(color, seed, kind) {
  return new THREE.MeshLambertMaterial({
    map: texture(color, seed, kind)
  });
}

const grassTop = mat(0x54ae36, 11);
const grassSide = mat(0x886040, 12, "grassSide");
const dirt = mat(0x805436, 13);
const stone = mat(0x858991, 14, "stone");
const bark = mat(0x886039, 15, "bark");
const woodTop = mat(0xb58c58, 16);
const leaves = mat(0x3b963d, 17);
const sand = mat(0xdec88b, 18);

const types = {
  1: [grassSide, grassSide, grassTop, dirt,
      grassSide, grassSide],
  2: dirt,
  3: stone,
  4: [bark, bark, woodTop, woodTop, bark, bark],
  5: leaves,
  6: sand
};

const world = new Map();
const visible = new Map();
const cube = new THREE.BoxGeometry(1, 1, 1);
const SIZE = 28;

const k = (x, y, z) => `${x},${y},${z}`;

function setData(x, y, z, type) {
  world.set(k(x, y, z), type);
}

function isBlock(x, y, z) {
  return world.has(k(x, y, z));
}

// WORLD GENERATION
function heightAt(x, z) {
  const dist = Math.hypot(x + 13, z + 12);

  if (dist < 7) return -2;

  let h =
    Math.sin(x * 0.12) * 3 +
    Math.cos(z * 0.11) * 2.7 +
    Math.sin((x + z) * 0.065) * 3.2 +
    Math.sin(x * 0.3) * Math.cos(z * 0.2);

  // Clear a safe starting area.
  const spawnDist = Math.hypot(x, z - 6);
  if (spawnDist < 6) h *= spawnDist / 6;

  return Math.floor(h);
}

for (let x = -SIZE; x <= SIZE; x++) {
  for (let z = -SIZE; z <= SIZE; z++) {
    const h = heightAt(x, z);

    setData(x, h, z, h < 0 ? 6 : h >= 6 ? 3 : 1);

    for (let y = h - 1; y >= -9; y--) {
      setData(x, y, z, y > h - 3 ? 2 : 3);
    }
  }
}

// DETERMINISTIC RANDOM
function rand(n) {
  const v = Math.sin(n * 127.1 + 78.23) * 43758.5453;
  return v - Math.floor(v);
}

// TREES
function addTree(x, z) {
  const h = heightAt(x, z);
  if (h < 0 || h > 5) return;

  const trunk = 4 + Math.floor(rand(x * 8 + z) * 3);

  for (let y = 1; y <= trunk; y++) {
    setData(x, h + y, z, 4);
  }

  for (let dy = -1; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > 3) continue;
        if (dx === 0 && dz === 0 && dy <= 0) continue;

        setData(
          x + dx,
          h + trunk + dy,
          z + dz,
          5
        );
      }
    }
  }
}

for (let x = -24; x <= 24; x += 5) {
  for (let z = -24; z <= 24; z += 5) {
    if (rand(x * 113 + z * 79) > 0.42) {
      const tx = x + Math.floor(rand(x + z * 7) * 3);
      const tz = z + Math.floor(rand(z + x * 11) * 3);

      if (
        Math.hypot(tx, tz - 6) > 9 &&
        Math.hypot(tx + 13, tz + 12) > 10
      ) {
        addTree(tx, tz);
      }
    }
  }
}

// RENDER ONLY EXPOSED BLOCKS
const neighbors = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1]
];

function refreshBlock(x, y, z) {
  const id = k(x, y, z);
  const old = visible.get(id);

  if (old) {
    scene.remove(old);
    visible.delete(id);
  }

  const type = world.get(id);
  if (!type) return;

  const exposed = neighbors.some(([dx, dy, dz]) =>
    !isBlock(x + dx, y + dy, z + dz)
  );

  if (!exposed) return;

  const mesh = new THREE.Mesh(cube, types[type]);
  mesh.position.set(x, y, z);
  mesh.userData.block = true;
  mesh.receiveShadow = true;
  mesh.castShadow = type === 4 || type === 5;

  scene.add(mesh);
  visible.set(id, mesh);
}

for (const id of world.keys()) {
  const [x, y, z] = id.split(",").map(Number);
  refreshBlock(x, y, z);
}

function modifyBlock(x, y, z, type) {
  if (type) {
    setData(x, y, z, type);
  } else {
    world.delete(k(x, y, z));
  }

  refreshBlock(x, y, z);
  for (const [dx, dy, dz] of neighbors) {
    refreshBlock(x + dx, y + dy, z + dz);
  }
}

// LAKE
const water = new THREE.Mesh(
  new THREE.CircleGeometry(7, 64),
  new THREE.MeshPhongMaterial({
    color: 0x2a9bd0,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    shininess: 90,
    side: THREE.DoubleSide
  })
);
water.rotation.x = -Math.PI / 2;
water.position.set(-13, -0.35, -12);
scene.add(water);

// CLOUDS
const clouds = [];
const cloudMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.85
});

for (let i = 0; i < 12; i++) {
  const group = new THREE.Group();

  for (let p = 0; p < 4; p++) {
    const part = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1.4, 3),
      cloudMat
    );
    part.position.x = p * 3;
    group.add(part);
  }

  group.position.set(
    rand(i + 10) * 100 - 50,
    23 + rand(i + 31) * 9,
    rand(i + 50) * 100 - 50
  );

  scene.add(group);
  clouds.push(group);
}

// PLAYER PHYSICS
const player = {
  radius: 0.28,
  eyeHeight: 1.62,
  walkSpeed: 4.6,
  sprintSpeed: 7.5,
  velocityY: 0,
  grounded: false,
  flying: false
};

camera.position.set(
  0,
  heightAt(0, 6) + 0.5 + player.eyeHeight,
  6
);

const keys = {};
let yaw = 0;
let pitch = 0;
let playing = false;
let selectedBlock = 1;

const menu = document.getElementById("menu");
const ui = document.getElementById("gameUI");
const playBtn = document.getElementById("playBtn");

playBtn.onclick = () => {
  renderer.domElement.requestPointerLock();
};

document.addEventListener("pointerlockchange", () => {
  playing = document.pointerLockElement === renderer.domElement;
  menu.style.display = playing ? "none" : "flex";
  ui.hidden = !playing;

  if (!playing) {
    Object.keys(keys).forEach(key => keys[key] = false);
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

// KEYBOARD
document.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) {
    e.preventDefault();
  }

  if (playing && e.code === "KeyF" && !e.repeat) {
    player.flying = !player.flying;
    player.velocityY = 0;
    player.grounded = false;
  }

  if (playing && e.code.startsWith("Digit")) {
    const n = Number(e.code.slice(5));

    if (types[n]) {
      selectedBlock = n;

      document.querySelectorAll(".slot").forEach(slot => {
        slot.classList.toggle(
          "selected",
          Number(slot.dataset.block) === n
        );
      });
    }
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// SOLID BLOCK COLLISION
function collides(pos) {
  const r = player.radius;
  const h = player.eyeHeight;

  for (const dx of [-r, r]) {
    for (const dz of [-r, r]) {
      for (const dy of [-h + 0.12, -0.85, -0.12]) {
        if (isBlock(
          Math.round(pos.x + dx),
          Math.round(pos.y + dy),
          Math.round(pos.z + dz)
        )) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveAxis(axis, distance) {
  const next = camera.position.clone();
  next[axis] += distance;

  if (!collides(next)) {
    camera.position[axis] = next[axis];
    return true;
  }

  return false;
}

// MINING AND BUILDING
const raycaster = new THREE.Raycaster();
raycaster.far = 6;
const center = new THREE.Vector2(0, 0);

document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

document.addEventListener("mousedown", e => {
  if (!playing) return;
  if (e.button !== 0 && e.button !== 2) return;

  raycaster.setFromCamera(center, camera);

  const hits = raycaster.intersectObjects(
    Array.from(visible.values()), false
  );

  if (!hits.length) return;

  const hit = hits[0];
  const p = hit.object.position;

  if (e.button === 0) {
    modifyBlock(p.x, p.y, p.z, 0);
  }

  if (e.button === 2) {
    const target = p.clone().add(hit.face.normal).round();

    // Prevent placing a block inside your character.
    const meshPos = camera.position;
    const overlaps =
      Math.abs(target.x - meshPos.x) < 0.8 &&
      Math.abs(target.z - meshPos.z) < 0.8 &&
      target.y + 0.5 > meshPos.y - player.eyeHeight &&
      target.y - 0.5 < meshPos.y + 0.2;

    if (!overlaps) {
      modifyBlock(
        target.x, target.y, target.z, selectedBlock
      );
    }
  }
});

// GAME LOOP
const clock = new THREE.Clock();
const move = new THREE.Vector3();
let walkAnimation = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.032);
  const t = clock.elapsedTime;

  for (const cloud of clouds) {
    cloud.position.x += dt * 0.45;
    if (cloud.position.x > 65) cloud.position.x = -65;
  }

  water.position.y = -0.35 + Math.sin(t * 1.4) * 0.035;

  if (playing) {
    const speed = keys.ShiftLeft
      ? player.sprintSpeed
      : player.walkSpeed;

    const forward = new THREE.Vector3(
      -Math.sin(yaw), 0, -Math.cos(yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(yaw), 0, -Math.sin(yaw)
    );

    move.set(0, 0, 0);

    if (keys.KeyW) move.add(forward);
    if (keys.KeyS) move.sub(forward);
    if (keys.KeyD) move.add(right);
    if (keys.KeyA) move.sub(right);

    const moving = move.lengthSq() > 0;

    if (moving) {
      move.normalize().multiplyScalar(speed * dt);
      moveAxis("x", move.x);
      moveAxis("z", move.z);
    }

    if (player.flying) {
      if (keys.Space) moveAxis("y", speed * dt);
      if (keys.ControlLeft) moveAxis("y", -speed * dt);
      player.velocityY = 0;
    } else {
      if (keys.Space && player.grounded) {
        player.velocityY = 7.5;
        player.grounded = false;
      }

      player.velocityY -= 21 * dt;
      player.velocityY = Math.max(player.velocityY, -16);

      const moved = moveAxis(
        "y", player.velocityY * dt
      );

      if (!moved) {
        player.grounded = player.velocityY <= 0;
        player.velocityY = 0;
      } else {
        const probe = camera.position.clone();
        probe.y -= 0.08;
        player.grounded = collides(probe);
      }
    }

    // A subtle walking motion.
    if (moving && player.grounded && !player.flying) {
      walkAnimation += dt * 11;
      camera.rotation.z = Math.sin(walkAnimation) * 0.006;
    } else {
      camera.rotation.z *= 0.85;
    }

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x, -SIZE + 1, SIZE - 1
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z, -SIZE + 1, SIZE - 1
    );

    if (camera.position.y < -15) {
      camera.position.set(
        0,
        heightAt(0, 6) + 0.5 + player.eyeHeight,
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

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
