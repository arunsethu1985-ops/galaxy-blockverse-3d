
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE - 3D GAME

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 100);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.1, 200
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(0xffffff, 0x668855, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(30, 60, 20);
scene.add(sunlight);

// BLOCK TYPES
const blockTypes = {
  1: { name: "Grass", color: 0x55aa44 },
  2: { name: "Dirt", color: 0x805030 },
  3: { name: "Stone", color: 0x888888 },
  4: { name: "Wood", color: 0x885522 },
  5: { name: "Leaves", color: 0x228833 },
  6: { name: "Sand", color: 0xe6d28c }
};

const cube = new THREE.BoxGeometry(1, 1, 1);
const materials = {};

for (const id in blockTypes) {
  materials[id] = new THREE.MeshLambertMaterial({
    color: blockTypes[id].color
  });
}

const blocks = new Map();
const blockMeshes = [];

function blockKey(x, y, z) {
  return `${x},${y},${z}`;
}

function addBlock(x, y, z, type = 1) {
  const id = blockKey(x, y, z);
  if (blocks.has(id)) return;

  const mesh = new THREE.Mesh(cube, materials[type]);
  mesh.position.set(x, y, z);
  mesh.userData.type = type;

  scene.add(mesh);
  blocks.set(id, mesh);
  blockMeshes.push(mesh);
}

function removeBlock(mesh) {
  const p = mesh.position;
  blocks.delete(blockKey(p.x, p.y, p.z));
  scene.remove(mesh);

  const index = blockMeshes.indexOf(mesh);
  if (index !== -1) blockMeshes.splice(index, 1);
}

// GENERATE WORLD
function terrainHeight(x, z) {
  return Math.floor(
    Math.sin(x * 0.15) * 2 +
    Math.cos(z * 0.13) * 2
  );
}

const WORLD_SIZE = 28;

for (let x = -WORLD_SIZE; x <= WORLD_SIZE; x++) {
  for (let z = -WORLD_SIZE; z <= WORLD_SIZE; z++) {
    const y = terrainHeight(x, z);
    addBlock(x, y, z, 1);
    addBlock(x, y - 1, z, 2);
    addBlock(x, y - 2, z, 3);
  }
}

// TREES
function createTree(x, z) {
  const y = terrainHeight(x, z);

  for (let h = 1; h <= 4; h++) {
    addBlock(x, y + h, z, 4);
  }

  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (Math.abs(dx) + Math.abs(dz) < 4) {
        addBlock(x + dx, y + 4, z + dz, 5);
        addBlock(x + dx, y + 5, z + dz, 5);
      }
    }
  }
  addBlock(x, y + 6, z, 5);
}

for (let i = 0; i < 45; i++) {
  const x = Math.floor(Math.random() * 45) - 22;
  const z = Math.floor(Math.random() * 45) - 22;

  if (Math.hypot(x, z - 5) > 7) {
    createTree(x, z);
  }
}

// PLAYER
const player = {
  speed: 5,
  jumpPower: 8,
  verticalVelocity: 0,
  grounded: false,
  height: 1.7,
  flying: false
};

camera.position.set(
  0,
  terrainHeight(0, 5) + 2.5,
  5
);

const keys = {};
let yaw = 0;
let pitch = 0;
let selectedBlock = 1;
let playing = false;

const menu = document.getElementById("menu");
const gameUI = document.getElementById("gameUI");

document.getElementById("playBtn").onclick = () => {
  renderer.domElement.requestPointerLock();
};

document.addEventListener("pointerlockchange", () => {
  playing = document.pointerLockElement === renderer.domElement;

  menu.style.display = playing ? "none" : "flex";
  gameUI.hidden = !playing;

  if (!playing) {
    for (const key in keys) keys[key] = false;
  }
});

// MOUSE CAMERA
document.addEventListener("mousemove", e => {
  if (!playing) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = THREE.MathUtils.clamp(pitch, -1.5, 1.5);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

// KEYBOARD
document.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (e.code === "Space") e.preventDefault();

  if (e.code === "KeyF" && !e.repeat) {
    player.flying = !player.flying;
    player.verticalVelocity = 0;
  }

  if (e.code.startsWith("Digit")) {
    const number = Number(e.code.slice(5));
    if (blockTypes[number]) {
      selectedBlock = number;

      document.querySelectorAll(".slot").forEach(slot => {
        slot.classList.toggle(
          "selected",
          Number(slot.dataset.block) === number
        );
      });
    }
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// MINING AND BUILDING
const raycaster = new THREE.Raycaster();
raycaster.far = 7;

document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

document.addEventListener("mousedown", e => {
  if (!playing) return;

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(blockMeshes);

  if (!hits.length) return;

  const hit = hits[0];

  if (e.button === 0) {
    removeBlock(hit.object);
  }

  if (e.button === 2) {
    const position = hit.object.position.clone()
      .add(hit.face.normal).round();

    if (position.distanceTo(camera.position) > 1.5) {
      addBlock(
        position.x,
        position.y,
        position.z,
        selectedBlock
      );
    }
  }
});

// FIND GROUND
function findGround(x, z, feetY) {
  const bx = Math.round(x);
  const bz = Math.round(z);

  for (let y = Math.floor(feetY + 0.5); y >= feetY - 5; y--) {
    if (blocks.has(blockKey(bx, y, bz))) {
      return y + 0.5;
    }
  }

  return -100;
}

// GAME LOOP
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  if (playing) {
    const speed = keys.ShiftLeft ? 9 : player.speed;

    const forward = new THREE.Vector3(
      -Math.sin(yaw), 0, -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(yaw), 0, -Math.sin(yaw)
    );

    const direction = new THREE.Vector3();

    if (keys.KeyW) direction.add(forward);
    if (keys.KeyS) direction.sub(forward);
    if (keys.KeyD) direction.add(right);
    if (keys.KeyA) direction.sub(right);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      camera.position.addScaledVector(direction, speed * dt);
    }

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x, -WORLD_SIZE, WORLD_SIZE
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z, -WORLD_SIZE, WORLD_SIZE
    );

    if (player.flying) {
      if (keys.Space) camera.position.y += speed * dt;
      if (keys.ControlLeft) camera.position.y -= speed * dt;
    } else {
      player.verticalVelocity -= 22 * dt;

      if (keys.Space && player.grounded) {
        player.verticalVelocity = player.jumpPower;
        player.grounded = false;
      }

      camera.position.y += player.verticalVelocity * dt;

      const feet = camera.position.y - player.height;
      const ground = findGround(
        camera.position.x,
        camera.position.z,
        feet
      );

      if (feet <= ground) {
        camera.position.y = ground + player.height;
        player.verticalVelocity = 0;
        player.grounded = true;
      } else {
        player.grounded = false;
      }

      // Keep player from falling out of this starter world.
      if (camera.position.y < -15) {
        camera.position.set(
          0,
          terrainHeight(0, 5) + 3,
          5
        );
        player.verticalVelocity = 0;
      }
    }

    document.getElementById("coordinates").textContent =
      `XYZ: ${camera.position.x.toFixed(0)}, ` +
      `${camera.position.y.toFixed(0)}, ` +
      `${camera.position.z.toFixed(0)}`;
  }

  renderer.render(scene, camera);
}

animate();

// WINDOW RESIZE
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
