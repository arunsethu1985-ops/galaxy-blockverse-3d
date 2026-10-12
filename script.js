
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE — PIXEL SURVIVAL
// Original procedural block textures and single-player gameplay.

const $ = id => document.getElementById(id);
const SAVE_KEY = "galaxy-blockverse-ocean-v2";
const CHUNK = 12;
const VIEW = 1;
const BEDROCK = -96;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91cfff);
scene.fog = new THREE.Fog(0x91cfff, 24, 76);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.05, 120
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const skyLight = new THREE.HemisphereLight(
  0xe3efff, 0x57683c, 1.85
);
scene.add(skyLight);

const sun = new THREE.DirectionalLight(0xffedca, 1.6);
sun.position.set(30, 50, 20);
scene.add(sun);

// --------------------------------------------------
// BLOCKS, ITEMS, AND CRAFTING
// --------------------------------------------------

const ITEMS = {
  grass: {
    name: "Grass Block", icon: "🟩", block: true
  },
  dirt: {
    name: "Dirt", icon: "🟫", block: true
  },
  stone: {
    name: "Stone", icon: "🪨", block: true
  },
  wood: {
    name: "Wood Log", icon: "🪵", block: true
  },
  leaves: {
    name: "Leaves", icon: "🍃", block: true
  },
  sand: {
    name: "Sand", icon: "🏖️", block: true
  },
  fence: {
    name: "Fence", icon: "🚧", block: true
  },
  planks: {
    name: "Wood Planks", icon: "🪵", block: true
  },
  glass: {
    name: "Glass", icon: "🪟", block: true
  },
  chest: {
    name: "Chest", icon: "📦", block: true
  },
  furnace: {
    name: "Furnace", icon: "🔥", block: true
  },
  farmland: {
    name: "Farmland", icon: "🟤", block: true
  },
  crops: {
    name: "Wheat Crops", icon: "🌾", block: true
  },
  bed: {
    name: "Bed", icon: "🛏️", block: true
  },
  coal: {
    name: "Coal", icon: "⚫", block: true
  },
  iron: {
    name: "Iron Ore", icon: "🔩", block: true
  },
  gold: {
    name: "Gold Ore", icon: "🟨", block: true
  },
  copper: {
    name: "Copper Ore", icon: "🟠", block: true
  },
  diamond: {
    name: "Diamond Ore", icon: "💎", block: true
  },
  emerald: {
    name: "Emerald Ore", icon: "💚", block: true
  },
  lava: {
    name: "Lava", icon: "🌋", block: true
  },
  bedrock: {
    name: "Bedrock", icon: "⬛", block: true
  },
  wheat: {
    name: "Wheat", icon: "🌾"
  },
  seeds: {
    name: "Seeds", icon: "🌱"
  },
  carrot: {
    name: "Carrot", icon: "🥕"
  },
  potato: {
    name: "Potato", icon: "🥔"
  },
  raw_meat: {
    name: "Raw Meat", icon: "🥩"
  },
  cooked_meat: {
    name: "Cooked Meat", icon: "🍖"
  },
  arrows: {
    name: "Arrows", icon: "🏹"
  },
  lead: {
    name: "Lead", icon: "🪢"
  },
  saddle: {
    name: "Saddle", icon: "🏇"
  },
  wood_sword: {
    name: "Wood Sword", icon: "🗡️", damage: 5
  },
  stone_sword: {
    name: "Stone Sword", icon: "⚔️", damage: 7
  },
  iron_sword: {
    name: "Iron Sword", icon: "⚔️", damage: 9
  },
  diamond_sword: {
    name: "Diamond Sword", icon: "💎", damage: 12
  },
  bow: {
    name: "Bow", icon: "🏹", damage: 7
  },
  pickaxe: {
    name: "Pickaxe", icon: "⛏️", damage: 4
  },
  axe: {
    name: "Axe", icon: "🪓", damage: 7
  },
  shield: {
    name: "Shield", icon: "🛡️"
  }
};

const HOTBAR = [
  "grass", "dirt", "stone",
  "wood", "leaves", "sand",
  "fence", "planks", "glass"
];

const RECIPES = [
  ["planks", 4, {wood: 1}],
  ["fence", 4, {planks: 4}],
  ["chest", 1, {planks: 8}],
  ["furnace", 1, {stone: 8}],
  ["glass", 4, {sand: 4, coal: 1}],
  ["wood_sword", 1, {planks: 2, wood: 1}],
  ["stone_sword", 1, {stone: 2, wood: 1}],
  ["iron_sword", 1, {iron: 2, wood: 1}],
  ["diamond_sword", 1, {diamond: 2, wood: 1}],
  ["pickaxe", 1, {stone: 3, wood: 2}],
  ["axe", 1, {stone: 3, wood: 2}],
  ["bow", 1, {wood: 3, leaves: 2}],
  ["arrows", 8, {stone: 1, wood: 1}],
  ["farmland", 4, {dirt: 4}],
  ["crops", 4, {seeds: 4}],
  ["bed", 1, {planks: 3, leaves: 3}],
  ["lead", 2, {leaves: 4, wood: 1}],
  ["saddle", 1, {planks: 4, iron: 2}],
  ["shield", 1, {planks: 6, iron: 1}]
];

// --------------------------------------------------
// PROCEDURAL 16 × 16 PIXEL TEXTURES
// --------------------------------------------------

const TEX_NAMES = [
  "grassTop", "grassSide", "dirt", "stone",
  "woodSide", "woodTop", "leaves", "sand",
  "planks", "glass", "fence", "chest",
  "furnace", "coal", "iron", "diamond",
  "gold", "copper", "emerald", "lava",
  "bedrock", "farmland", "crops", "bed"
];

const PALETTE = {
  grassTop: 0x64b638,
  grassSide: 0x89603a,
  dirt: 0x825437,
  stone: 0x898b8e,
  woodSide: 0x906039,
  woodTop: 0xb68c58,
  leaves: 0x338b49,
  sand: 0xe2cd8e,
  planks: 0xc08c53,
  glass: 0x9bd9e8,
  fence: 0x9a663e,
  chest: 0xaa7740,
  furnace: 0x66696c,
  coal: 0x898b8e,
  iron: 0x8b8b8c,
  diamond: 0x85888b,
  gold: 0x8b8b8c,
  copper: 0x888a8b,
  emerald: 0x888d89,
  lava: 0xf35e11,
  bedrock: 0x35373d,
  farmland: 0x68422d,
  crops: 0x75aa35,
  bed: 0xc74a52
};

const TILE_SIZE = 16;
const ATLAS_COLS = 8;
const ATLAS_ROWS = Math.ceil(
  TEX_NAMES.length / ATLAS_COLS
);

const atlas = document.createElement("canvas");
atlas.width = TILE_SIZE * ATLAS_COLS;
atlas.height = TILE_SIZE * ATLAS_ROWS;

const ctx = atlas.getContext("2d");

function noise(x, y, seed = 0) {
  const n = Math.sin(
    x * 127.1 + y * 311.7 + seed * 91.7
  ) * 43758.5453;
  return n - Math.floor(n);
}

function rgb(hex) {
  return [
    (hex >> 16) & 255,
    (hex >> 8) & 255,
    hex & 255
  ];
}

function pixel(name, x, y) {
  let base = PALETTE[name];
  const seed = TEX_NAMES.indexOf(name);

  let shift = Math.floor(
    (noise(x, y, seed) - 0.5) * 52
  );

  if (name === "grassTop") {
    shift += (x + y) % 5 === 0 ? 16 : 0;
  }

  if (name === "grassSide") {
    const grassDepth = 2 +
      (noise(x, 0, 4) > 0.6 ? 1 : 0);

    if (y < grassDepth) {
      base = 0x65b63b;
    }
  }

  if (name === "woodSide" || name === "fence") {
    if (x % 4 === 0) shift -= 35;
    if (x % 4 === 2) shift += 13;
  }

  if (name === "woodTop") {
    const radius = Math.max(
      Math.abs(x - 7.5),
      Math.abs(y - 7.5)
    );
    shift += Math.floor(radius) % 3 === 0
      ? -43 : 12;
  }

  if (name === "planks") {
    if (y % 5 === 0) shift -= 38;
    if (x === 7 && y > 4 && y < 10) {
      shift -= 24;
    }
  }

  if (name === "farmland") {
    shift += x % 4 === 0 ? -34 : 10;
  }

  if (name === "glass") {
    shift += (
      x === 0 || x === 15 ||
      y === 0 || y === 15
    ) ? 65 : -25;
  }

  if (name === "chest") {
    if (
      y === 3 || y === 12 ||
      x === 1 || x === 14
    ) shift -= 54;
  }

  if (name === "furnace") {
    if (x >= 4 && x <= 11 &&
        y >= 6 && y <= 12) shift -= 75;
  }

  if (name === "crops") {
    shift += x % 5 === 2 ? 40 : -30;
  }

  if (name === "bed") {
    if (y < 4) shift -= 40;
  }

  if (name === "lava") {
    const molten = noise(
      Math.floor(x / 3),
      Math.floor(y / 3), 3
    );
    shift += molten > 0.55 ? 50 : -35;
  }

  const oreColors = {
    coal: 0x202329,
    iron: 0xd99b75,
    gold: 0xf6d13e,
    copper: 0xcd7650,
    diamond: 0x3ce8e4,
    emerald: 0x23e883
  };

  if (oreColors[name]) {
    const cluster = noise(
      Math.floor(x / 3),
      Math.floor(y / 3), seed
    );

    if (
      cluster > 0.68 &&
      noise(x, y, 6) > 0.22
    ) {
      base = oreColors[name];
      shift = Math.floor(
        (noise(x, y, 12) - 0.5) * 40
      );
    }
  }

  return rgb(base).map(v =>
    Math.max(0, Math.min(255, v + shift))
  );
}

for (let t = 0; t < TEX_NAMES.length; t++) {
  const name = TEX_NAMES[t];
  const image = ctx.createImageData(
    TILE_SIZE, TILE_SIZE
  );

  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const [r, g, b] = pixel(name, x, y);
      const i = (y * TILE_SIZE + x) * 4;

      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(
    image,
    (t % ATLAS_COLS) * TILE_SIZE,
    Math.floor(t / ATLAS_COLS) * TILE_SIZE
  );
}

const atlasTexture = new THREE.CanvasTexture(atlas);
atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;
atlasTexture.generateMipmaps = false;
atlasTexture.colorSpace = THREE.SRGBColorSpace;

const blockMaterial = new THREE.MeshLambertMaterial({
  map: atlasTexture,
  vertexColors: true
});

function textureName(id, face) {
  if (id === "grass") {
    if (face === 2) return "grassTop";
    if (face === 3) return "dirt";
    return "grassSide";
  }

  if (id === "wood") {
    return face === 2 || face === 3
      ? "woodTop" : "woodSide";
  }

  return TEX_NAMES.includes(id) ? id : "stone";
}

function textureUV(id, face) {
  const name = textureName(id, face);
  const index = TEX_NAMES.indexOf(name);
  const col = index % ATLAS_COLS;
  const row = Math.floor(index / ATLAS_COLS);

  // Inset the UVs slightly to prevent texture bleeding.
  const u0 = (col * TILE_SIZE + 0.3) / atlas.width;
  const u1 = ((col + 1) * TILE_SIZE - 0.3) / atlas.width;
  const v0 = 1 - ((row + 1) * TILE_SIZE - 0.3) / atlas.height;
  const v1 = 1 - (row * TILE_SIZE + 0.3) / atlas.height;

  return [
    [u0, v0], [u0, v1],
    [u1, v1], [u1, v0]
  ];
}

// --------------------------------------------------
// SAVE DATA AND INVENTORY
// --------------------------------------------------

let saved = {};

try {
  saved = JSON.parse(
    localStorage.getItem(SAVE_KEY) || "{}"
  );
} catch {
  saved = {};
}

const changes = new Map(
  Array.isArray(saved.edits) ? saved.edits : []
);

const chests = saved.chests &&
  typeof saved.chests === "object"
  ? saved.chests : {};

const inventory = {
  grass: 20,
  dirt: 20,
  stone: 12,
  wood: 12,
  leaves: 8,
  sand: 12,
  fence: 8,
  planks: 8,
  glass: 4,
  cooked_meat: 3,
  raw_meat: 0,
  arrows: 12,
  seeds: 6,
  carrot: 4,
  potato: 3,
  farmland: 6,
  crops: 6,
  bed: 1,
  lead: 1,
  saddle: 1
};

for (const [id, amount] of Object.entries(
  saved.inv || {}
)) {
  if (
    ITEMS[id] &&
    Number.isInteger(amount) &&
    amount >= 0 &&
    amount < 100000
  ) {
    inventory[id] = amount;
  }
}

let selected = 0;
let equipped = "fists";
let health = saved.stats?.health ?? 100;
let hunger = saved.stats?.hunger ?? 100;
let level = saved.stats?.level ?? 1;
let xp = saved.stats?.xp ?? 0;

if (
  ITEMS[saved.equipped] &&
  inventory[saved.equipped] > 0
) {
  equipped = saved.equipped;
}

function add(id, amount = 1) {
  inventory[id] = (inventory[id] || 0) + amount;
}

function gainXP(amount) {
  xp += amount;

  while (xp >= level * 20) {
    xp -= level * 20;
    level++;
    message(`Reached level ${level}`);
  }
}

// --------------------------------------------------
// TERRAIN GENERATION
// --------------------------------------------------

const elevationCache = new Map();
const treeCache = new Map();

function terrainHeight(x, z) {
  const key = `${x},${z}`;

  if (elevationCache.has(key)) {
    return elevationCache.get(key);
  }

  const continent =
    Math.sin(x * 0.013) +
    Math.cos(z * 0.016) +
    Math.sin((x - z) * 0.009);

  let h = Math.floor(
    continent * 6 - 3 +
    Math.sin(x * 0.11) * 2 +
    Math.cos(z * 0.09) * 2
  );

  if (Math.hypot(x, z - 4) < 17) {
    h = Math.max(h, 3);
  }

  if (
    x >= 37 && x <= 60 &&
    z >= 14 && z <= 34
  ) {
    h = 4;
  }

  elevationCache.set(key, h);
  return h;
}

function treeAt(x, z) {
  const key = `${x},${z}`;
  if (treeCache.has(key)) return treeCache.get(key);

  const result =
    x % 7 === 0 &&
    z % 7 === 0 &&
    noise(x / 7, z / 7) > 0.45 &&
    terrainHeight(x, z) > 2 &&
    !(x >= 34 && x <= 64 && z >= 11 && z <= 37) &&
    Math.hypot(x, z - 4) > 9;

  treeCache.set(key, result);
  return result;
}

function caveAt(x, y, z) {
  if (y > -5 || y < BEDROCK + 2) return false;

  const v =
    Math.sin(x * 0.14 + y * 0.11) +
    Math.cos(z * 0.12 - y * 0.09) +
    Math.sin((x + z) * 0.075 + y * 0.15);

  return v > 2.34;
}

function villageBlock(x, y, z) {
  if (
    x < 37 || x > 60 ||
    z < 14 || z > 34
  ) return null;

  for (const [cx, cz] of [[42, 20], [55, 26]]) {
    if (
      x >= cx - 3 && x <= cx + 3 &&
      z >= cz - 3 && z <= cz + 3
    ) {
      const wall =
        x === cx - 3 || x === cx + 3 ||
        z === cz - 3 || z === cz + 3;

      if (
        y === 5 && x === cx &&
        z === cz - 3
      ) return null;

      if (wall && y >= 5 && y <= 7) {
        if (
          y === 6 &&
          ((x === cx && z === cz + 3) ||
           (x === cx + 3 && z === cz))
        ) return "glass";

        return "planks";
      }

      if (y === 8) return "wood";
    }
  }

  if (
    x >= 38 && x <= 45 &&
    z === 28 && y === 5
  ) return "farmland";

  if (
    x >= 38 && x <= 45 &&
    z === 28 && y === 6
  ) return "crops";

  if (
    x === 42 && z === 22 && y === 5
  ) return "chest";

  if (
    x === 54 && z === 27 && y === 5
  ) return "bed";

  return null;
}

function naturalBlock(x, y, z) {
  if (y <= BEDROCK) return "bedrock";

  const surface = terrainHeight(x, z);

  const building = villageBlock(x, y, z);
  if (building) return building;

  // Trees, including branches crossing chunk borders.
  for (
    let tx = Math.floor((x - 2) / 7) * 7;
    tx <= x + 2;
    tx += 7
  ) {
    for (
      let tz = Math.floor((z - 2) / 7) * 7;
      tz <= z + 2;
      tz += 7
    ) {
      if (!treeAt(tx, tz)) continue;

      const th = terrainHeight(tx, tz);
      const dx = Math.abs(x - tx);
      const dz = Math.abs(z - tz);

      if (
        dx === 0 && dz === 0 &&
        y > th && y <= th + 4
      ) return "wood";

      if (
        dx <= 2 && dz <= 2 &&
        dx + dz < 4 &&
        y >= th + 3 && y <= th + 6
      ) return "leaves";
    }
  }

  if (y > surface) return null;
  if (y === surface) {
    return surface <= 0 ? "sand" : "grass";
  }
  if (y >= surface - 3) return "dirt";

  if (caveAt(x, y, z)) {
    if (
      y < -48 &&
      Math.sin(x * 0.27 + z * 0.12) +
      Math.cos(z * 0.2 - y * 0.14) > 1.25
    ) return "lava";

    return null;
  }

  const ore = noise(
    x * 13 + y * 7,
    z * 17 + y * 11
  );

  if (y < -42 && ore > 0.987) return "diamond";
  if (y < -30 && ore > 0.977) return "gold";
  if (y < -20 && ore > 0.992) return "emerald";
  if (y < -10 && ore > 0.972) return "iron";
  if (y < -6 && ore > 0.968) return "copper";
  if (y < surface - 5 && ore > 0.947) return "coal";

  return "stone";
}

function getBlock(x, y, z) {
  const key = `${x},${y},${z}`;

  return changes.has(key)
    ? changes.get(key)
    : naturalBlock(x, y, z);
}

function setBlock(x, y, z, value) {
  if (y <= BEDROCK || y > 55) return false;

  changes.set(`${x},${y},${z}`, value);
  rebuildNear(x, z);
  return true;
}

// --------------------------------------------------
// CHUNK MESHES WITH TEXTURED FACES
// --------------------------------------------------

const chunks = new Map();
const waterChunks = new Map();

const directions = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1]
];

const faces = [
  {
    normal: [1, 0, 0],
    shade: 0.82,
    points: [
      [.5, -.5, -.5], [.5, .5, -.5],
      [.5, .5, .5], [.5, -.5, .5]
    ]
  },
  {
    normal: [-1, 0, 0],
    shade: 0.80,
    points: [
      [-.5, -.5, .5], [-.5, .5, .5],
      [-.5, .5, -.5], [-.5, -.5, -.5]
    ]
  },
  {
    normal: [0, 1, 0],
    shade: 1.0,
    points: [
      [-.5, .5, -.5], [-.5, .5, .5],
      [.5, .5, .5], [.5, .5, -.5]
    ]
  },
  {
    normal: [0, -1, 0],
    shade: 0.62,
    points: [
      [-.5, -.5, .5], [-.5, -.5, -.5],
      [.5, -.5, -.5], [.5, -.5, .5]
    ]
  },
  {
    normal: [0, 0, 1],
    shade: 0.93,
    points: [
      [.5, -.5, .5], [.5, .5, .5],
      [-.5, .5, .5], [-.5, -.5, .5]
    ]
  },
  {
    normal: [0, 0, -1],
    shade: 0.76,
    points: [
      [-.5, -.5, -.5], [-.5, .5, -.5],
      [.5, .5, -.5], [.5, -.5, -.5]
    ]
  }
];

function buildChunk(cx, cz) {
  const positions = [];
  const normals = [];
  const colors = [];
  const uvs = [];
  const indices = [];

  const minX = cx * CHUNK;
  const minZ = cz * CHUNK;

  for (let x = minX; x < minX + CHUNK; x++) {
    for (let z = minZ; z < minZ + CHUNK; z++) {
      for (
        let y = BEDROCK + 1;
        y <= terrainHeight(x, z) + 7;
        y++
      ) {
        const id = getBlock(x, y, z);
        if (!id) continue;

        for (let face = 0; face < 6; face++) {
          const [dx, dy, dz] = directions[face];

          if (getBlock(x + dx, y + dy, z + dz)) {
            continue;
          }

          const first = positions.length / 3;
          const uv = textureUV(id, face);
          const faceInfo = faces[face];
          const variation =
            0.95 + noise(x, z + y * 3) * 0.08;

          for (let j = 0; j < 4; j++) {
            const point = faceInfo.points[j];

            positions.push(
              x + point[0],
              y + point[1],
              z + point[2]
            );

            normals.push(...faceInfo.normal);
            uvs.push(...uv[j]);

            const shade = variation * faceInfo.shade;
            colors.push(shade, shade, shade);
          }

          indices.push(
            first, first + 1, first + 2,
            first, first + 2, first + 3
          );
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(normals, 3)
  );
  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(uvs, 2)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(geometry, blockMaterial);
  mesh.userData.terrain = true;
  scene.add(mesh);

  return mesh;
}

const waterMaterial = new THREE.MeshPhongMaterial({
  color: 0x258bce,
  transparent: true,
  opacity: 0.64,
  side: THREE.DoubleSide,
  depthWrite: false
});

function buildWater(cx, cz) {
  const positions = [];
  const indices = [];

  for (let x = cx * CHUNK; x < (cx + 1) * CHUNK; x++) {
    for (let z = cz * CHUNK; z < (cz + 1) * CHUNK; z++) {
      if (terrainHeight(x, z) > 0) continue;

      const first = positions.length / 3;

      positions.push(
        x - .5, .54, z - .5,
        x + .5, .54, z - .5,
        x + .5, .54, z + .5,
        x - .5, .54, z + .5
      );

      indices.push(
        first, first + 1, first + 2,
        first, first + 2, first + 3
      );
    }
  }

  if (!indices.length) return;

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const water = new THREE.Mesh(
    geometry, waterMaterial
  );

  scene.add(water);
  waterChunks.set(`${cx},${cz}`, water);
}

function removeChunk(key) {
  const mesh = chunks.get(key);

  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    chunks.delete(key);
  }

  const water = waterChunks.get(key);

  if (water) {
    scene.remove(water);
    water.geometry.dispose();
    waterChunks.delete(key);
  }
}

function rebuildNear(x, z) {
  const cx = Math.floor(x / CHUNK);
  const cz = Math.floor(z / CHUNK);

  for (let a = cx - 1; a <= cx + 1; a++) {
    for (let b = cz - 1; b <= cz + 1; b++) {
      const key = `${a},${b}`;

      if (chunks.has(key)) {
        removeChunk(key);
        chunks.set(key, buildChunk(a, b));
        buildWater(a, b);
      }
    }
  }
}

let lastChunk = "";

function streamWorld() {
  const cx = Math.floor(camera.position.x / CHUNK);
  const cz = Math.floor(camera.position.z / CHUNK);
  const center = `${cx},${cz}`;

  if (lastChunk === center) return;
  lastChunk = center;

  const needed = new Set();

  for (let x = cx - VIEW; x <= cx + VIEW; x++) {
    for (let z = cz - VIEW; z <= cz + VIEW; z++) {
      needed.add(`${x},${z}`);
    }
  }

  for (const key of [...chunks.keys()]) {
    if (!needed.has(key)) removeChunk(key);
  }

  for (const key of needed) {
    if (chunks.has(key)) continue;

    const [x, z] = key.split(",").map(Number);

    chunks.set(key, buildChunk(x, z));
    buildWater(x, z);
  }

  populate(cx, cz);
}

// --------------------------------------------------
// PLAYER AND COLLISION
// --------------------------------------------------

const player = {
  yaw: 0,
  pitch: 0,
  vy: 0,
  grounded: false,
  flying: false,
  creative: false
};

camera.position.set(
  0, terrainHeight(0, 4) + 2.3, 4
);

if (
  Array.isArray(saved.pos) &&
  saved.pos.length === 3 &&
  saved.pos.every(Number.isFinite) &&
  saved.pos[1] > BEDROCK + 2
) {
  camera.position.fromArray(saved.pos);
}

const keys = {};
const direction = new THREE.Vector3();

function solid(x, y, z) {
  const id = getBlock(
    Math.round(x),
    Math.round(y),
    Math.round(z)
  );

  return !!id && id !== "leaves" && id !== "lava";
}

function collides(position) {
  for (const dx of [-.27, .27]) {
    for (const dz of [-.27, .27]) {
      for (const dy of [-1.48, -.85, -.12]) {
        if (solid(
          position.x + dx,
          position.y + dy,
          position.z + dz
        )) return true;
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

// --------------------------------------------------
// MOBS AND ANIMALS
// --------------------------------------------------

const mobs = [];
const populated = new Set();

const MOB_COLORS = {
  cow: 0xe6e2dc,
  pig: 0xf2a0b0,
  sheep: 0xf5f2e5,
  chicken: 0xf4f1e5,
  horse: 0x875936,
  wolf: 0xaaa9a2,
  fish: 0xe49d31,
  squid: 0x355b80,
  villager: 0xb9a187,
  zombie: 0x5b9c62,
  skeleton: 0xdbd8c9,
  spider: 0x34333a,
  creeper: 0x449c42
};

function part(group, w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({color})
  );

  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function spawnMob(kind, x, z) {
  const group = new THREE.Group();
  const legs = [];
  const small = kind === "chicken" || kind === "fish";
  const hostile = [
    "zombie", "skeleton", "spider", "creeper"
  ].includes(kind);

  const color = MOB_COLORS[kind];
  const w = small ? .5 : .85;
  const d = small ? .65 : 1.2;
  const bodyY = small ? .5 : .82;

  part(group, w, .65, d, color, 0, bodyY, 0);

  part(
    group,
    small ? .4 : .53, .5, .48,
    color, 0, bodyY + .17, -d / 2 - .19
  );

  for (const xx of [-w * .3, w * .3]) {
    for (const zz of [-d * .3, d * .3]) {
      legs.push(part(
        group, .16, .4, .16,
        hostile ? 0x454049 : 0x7b726d,
        xx, .22, zz
      ));
    }
  }

  // Eyes
  for (const xx of [-.15, .15]) {
    part(
      group, .09, .09, .05,
      hostile ? 0xff3333 : 0x111111,
      xx, bodyY + .24, -d / 2 - .46
    );
  }

  // Animal faces
  if (kind === "cow" || kind === "pig") {
    part(
      group, .28, .18, .14,
      kind === "pig" ? 0xd98391 : 0xdca3a7,
      0, bodyY + .08, -d / 2 - .5
    );
  }

  if (kind === "chicken") {
    part(
      group, .2, .13, .2,
      0xffc12f, 0, bodyY + .08, -d / 2 - .47
    );
  }

  if (kind === "horse") {
    part(
      group, .18, .55, .18,
      0x30221b, 0, bodyY + .35, .1
    );
  }

  if (kind === "wolf" || kind === "horse") {
    for (const xx of [-.21, .21]) {
      part(
        group, .14, .25, .16,
        color, xx, bodyY + .55, -d / 2 - .2
      );
    }
  }

  const aquatic = kind === "fish" || kind === "squid";

  group.position.set(
    x,
    aquatic ? 0 : terrainHeight(
      Math.round(x), Math.round(z)
    ) + .5,
    z
  );

  scene.add(group);

  const mob = {
    group, legs, kind, hostile,
    hp: hostile ? 28 : 18,
    angle: noise(x, z) * Math.PI * 2,
    timer: 2,
    cooldown: 0,
    led: false,
    ridden: false,
    love: 0
  };

  group.userData.mob = mob;
  mobs.push(mob);
  return mob;
}

function populate(cx, cz) {
  for (let a = cx - 1; a <= cx + 1; a++) {
    for (let b = cz - 1; b <= cz + 1; b++) {
      const key = `${a},${b}`;
      if (populated.has(key)) continue;

      populated.add(key);

      for (let i = 0; i < 3; i++) {
        const x = a * CHUNK + Math.floor(
          noise(a * 47 + i, b * 13) * CHUNK
        );
        const z = b * CHUNK + Math.floor(
          noise(a * 31, b * 17 + i) * CHUNK
        );

        let kind;

        if (terrainHeight(x, z) <= 0) {
          const options = ["fish", "fish", "squid"];
          kind = options[
            Math.floor(noise(x * 3, z * 2) * options.length)
          ];
        } else {
          const options = [
            "cow", "pig", "sheep", "chicken",
            "horse", "wolf", "zombie",
            "skeleton", "spider", "creeper"
          ];

          kind = options[
            Math.floor(noise(x * 3, z * 2) * options.length)
          ];
        }

        spawnMob(kind, x, z);
      }
    }
  }

  if (
    cx >= 2 && cx <= 5 &&
    cz >= 0 && cz <= 3 &&
    !populated.has("village")
  ) {
    populated.add("village");
    spawnMob("villager", 43, 23);
    spawnMob("villager", 55, 23);
    spawnMob("horse", 48, 29);
  }

  for (let i = mobs.length - 1; i >= 0; i--) {
    if (
      mobs[i].group.position.distanceTo(
        camera.position
      ) > 85
    ) {
      scene.remove(mobs[i].group);
      mobs.splice(i, 1);
    }
  }
}

let ridden = null;
let noticeTime = 0;

function message(text) {
  $("notice").textContent = text;
  noticeTime = 2.5;
}

function killMob(mob) {
  scene.remove(mob.group);
  const index = mobs.indexOf(mob);
  if (index >= 0) mobs.splice(index, 1);

  if (
    ["cow", "pig", "sheep", "chicken", "fish"]
      .includes(mob.kind)
  ) {
    add("raw_meat", mob.kind === "chicken" ? 1 : 2);
  }

  if (mob.kind === "skeleton") add("arrows", 2);
  gainXP(mob.hostile ? 7 : 3);
  message(`Collected loot from ${mob.kind}`);
}

function updateMobs(dt, time, night) {
  for (const mob of mobs) {
    mob.group.visible = !mob.hostile || night;
    if (!mob.group.visible) continue;

    if (mob.ridden) {
      mob.group.position.set(
        camera.position.x,
        camera.position.y - 1.15,
        camera.position.z
      );
      continue;
    }

    mob.timer -= dt;
    mob.cooldown = Math.max(0, mob.cooldown - dt);
    mob.love = Math.max(0, mob.love - dt);

    if (mob.timer < 0) {
      mob.timer = 1 + Math.random() * 3;
      mob.angle += (Math.random() - .5) * 2.7;
    }

    const dx = camera.position.x - mob.group.position.x;
    const dz = camera.position.z - mob.group.position.z;
    const distance = Math.hypot(dx, dz);
    let speed = .7;

    if (mob.led && distance > 2) {
      mob.angle = Math.atan2(-dx, -dz);
      speed = 2.5;
    }

    if (mob.hostile && distance < 12) {
      mob.angle = Math.atan2(-dx, -dz);
      speed = 2;

      if (
        distance < 1.5 &&
        mob.cooldown === 0 &&
        !player.creative
      ) {
        health -= mob.kind === "creeper" ? 18 : 8;
        mob.cooldown = 1.5;
        message("Monster attack!");
      }
    }

    const nx = mob.group.position.x -
      Math.sin(mob.angle) * speed * dt;
    const nz = mob.group.position.z -
      Math.cos(mob.angle) * speed * dt;

    const nextHeight = terrainHeight(
      Math.round(nx), Math.round(nz)
    );

    if (mob.kind === "fish" || mob.kind === "squid") {
      if (nextHeight <= 0) {
        mob.group.position.set(
          nx,
          -.1 + Math.sin(time * 2) * .1,
          nz
        );
      } else {
        mob.angle += Math.PI;
      }
    } else {
      const oldHeight = terrainHeight(
        Math.round(mob.group.position.x),
        Math.round(mob.group.position.z)
      );

      const obstacle = getBlock(
        Math.round(nx),
        nextHeight + 1,
        Math.round(nz)
      );

      if (
        Math.abs(nextHeight - oldHeight) <= 1 &&
        nextHeight > 0 &&
        !["fence", "wood", "planks", "glass", "chest"]
          .includes(obstacle)
      ) {
        mob.group.position.set(
          nx, nextHeight + .5, nz
        );
      } else {
        mob.angle += Math.PI;
      }
    }

    mob.group.rotation.y = mob.angle;

    mob.legs.forEach((leg, i) => {
      leg.rotation.x = Math.sin(
        time * 6 + i * Math.PI
      ) * .3;
    });
  }
}

// --------------------------------------------------
// INVENTORY, CRAFTING, CHESTS, FURNACES
// --------------------------------------------------

let panel = null;
let currentChest = null;
let playing = false;

function entry(root, title, description, buttons) {
  const div = document.createElement("div");
  div.className = "entry";

  const info = document.createElement("div");
  info.className = "info";

  const strong = document.createElement("strong");
  strong.textContent = title;
  info.append(strong);

  const small = document.createElement("small");
  small.textContent = description;
  info.append(small);
  div.append(info);

  for (const [label, action, disabled] of buttons) {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = !!disabled;
    button.onclick = action;
    div.append(button);
  }

  root.append(div);
}

function openPanel(type, chest = null) {
  panel = type;
  currentChest = chest;

  $("panel").hidden = false;
  $("menu").hidden = true;

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  renderPanel();
}

function closePanel() {
  panel = null;
  currentChest = null;
  $("panel").hidden = true;
  $("menu").hidden = true;

  renderer.domElement.requestPointerLock();
}

$("closePanel").onclick = closePanel;

function renderPanel() {
  if (!panel) return;

  const root = $("panelContent");
  root.replaceChildren();

  const titles = {
    inventory: "🎒 INVENTORY",
    crafting: "🔨 CRAFTING",
    chest: "📦 CHEST",
    furnace: "🔥 FURNACE"
  };

  $("panelTitle").textContent = titles[panel];

  $("panelHelp").textContent =
    panel === "inventory"
      ? "Select building blocks or equip a weapon."
      : panel === "crafting"
      ? "Collect materials to unlock recipes."
      : panel === "chest"
      ? "Store or retrieve items."
      : "Cook raw meat with wood or coal.";

  if (panel === "inventory") {
    for (const [id, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      const buttons = [];

      if (ITEMS[id]?.block) {
        buttons.push([
          "SELECT",
          () => {
            if (HOTBAR.includes(id)) {
              selected = HOTBAR.indexOf(id);
            } else {
              HOTBAR[selected] = id;
            }
            closePanel();
          }
        ]);
      }

      if (ITEMS[id]?.damage) {
        buttons.push([
          "EQUIP",
          () => {
            equipped = id;
            closePanel();
          }
        ]);
      }

      entry(
        root,
        `${ITEMS[id].icon} ${ITEMS[id].name}`,
        `Available: ${count}`,
        buttons
      );
    }
  }

  if (panel === "crafting") {
    for (const [id, amount, recipe] of RECIPES) {
      const canCraft = Object.entries(recipe)
        .every(([item, n]) => (inventory[item] || 0) >= n);

      const cost = Object.entries(recipe)
        .map(([item, n]) => `${n} ${ITEMS[item].name}`)
        .join(" + ");

      entry(
        root,
        `${ITEMS[id].icon} ${amount} ${ITEMS[id].name}`,
        cost,
        [[
          "CRAFT",
          () => {
            if (!Object.entries(recipe).every(
              ([item, n]) => (inventory[item] || 0) >= n
            )) return;

            for (const [item, n] of Object.entries(recipe)) {
              inventory[item] -= n;
            }

            add(id, amount);
            renderPanel();
            message(`Crafted ${ITEMS[id].name}`);
          },
          !canCraft
        ]]
      );
    }
  }

  if (panel === "chest") {
    chests[currentChest] ||= {};
    const contents = chests[currentChest];

    for (const [id, amount] of Object.entries(inventory)) {
      if (amount <= 0) continue;

      entry(root, ITEMS[id].name,
        `Bag: ${amount}`, [[
          "STORE 1",
          () => {
            inventory[id]--;
            contents[id] = (contents[id] || 0) + 1;
            renderPanel();
          }
        ]]
      );
    }

    for (const [id, amount] of Object.entries(contents)) {
      if (amount <= 0 || !ITEMS[id]) continue;

      entry(root, ITEMS[id].name,
        `Chest: ${amount}`, [[
          "TAKE 1",
          () => {
            contents[id]--;
            add(id);
            renderPanel();
          }
        ]]
      );
    }
  }

  if (panel === "furnace") {
    const canCook =
      (inventory.raw_meat || 0) > 0 &&
      ((inventory.wood || 0) > 0 ||
       (inventory.coal || 0) > 0);

    entry(root, "🍖 Cook Raw Meat",
      "Needs 1 raw meat and 1 wood or coal", [[
        "COOK",
        () => {
          if (!canCook) return;

          const fuel = inventory.coal > 0
            ? "coal" : "wood";

          inventory[fuel]--;
          inventory.raw_meat--;
          add("cooked_meat");
          renderPanel();
        },
        !canCook
      ]]
    );
  }
}

function eatFood() {
  if (inventory.cooked_meat > 0) {
    inventory.cooked_meat--;
    hunger = Math.min(100, hunger + 28);
    health = Math.min(100, health + 4);
    message("Ate cooked meat");
  } else if (inventory.raw_meat > 0) {
    inventory.raw_meat--;
    hunger = Math.min(100, hunger + 8);
    message("Ate raw meat");
  } else {
    message("No food available");
  }
}

// --------------------------------------------------
// SAVE AND MAIN MENU
// --------------------------------------------------

let dayClock = saved.dayClock || 0;

function saveGame(silent = false) {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        edits: [...changes],
        chests,
        inv: inventory,
        equipped,
        pos: camera.position.toArray(),
        stats: {health, hunger, level, xp},
        dayClock
      })
    );

    if (!silent) message("World saved");
  } catch {
    message("Unable to save: browser storage is full");
  }
}

let resetting = false;

window.addEventListener("beforeunload", () => {
  if (!resetting) saveGame(true);
});

$("reset").onclick = () => {
  if (confirm("Delete this saved world?")) {
    resetting = true;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
};

$("play").onclick = () => {
  panel = null;
  $("panel").hidden = true;
  renderer.domElement.requestPointerLock();
};

document.addEventListener("pointerlockchange", () => {
  playing = document.pointerLockElement === renderer.domElement;
  $("menu").hidden = playing || panel !== null;
  $("hud").hidden = !playing;

  if (!playing) {
    for (const key of Object.keys(keys)) {
      keys[key] = false;
    }
  }
});

document.addEventListener("mousemove", e => {
  if (!playing) return;

  player.yaw -= e.movementX * .002;
  player.pitch = THREE.MathUtils.clamp(
    player.pitch - e.movementY * .002,
    -1.45, 1.45
  );
});

document.addEventListener("keydown", e => {
  if ([
    "Space", "ArrowUp", "ArrowDown",
    "ArrowLeft", "ArrowRight"
  ].includes(e.code)) e.preventDefault();

  keys[e.code] = true;
  if (!playing || e.repeat) return;

  if (/^Digit[1-9]$/.test(e.code)) {
    selected = Number(e.code.slice(-1)) - 1;
  }

  if (e.code === "KeyE") openPanel("inventory");
  if (e.code === "KeyC") openPanel("crafting");
  if (e.code === "KeyR") eatFood();
  if (e.code === "KeyP") saveGame();

  if (e.code === "KeyF") {
    player.flying = !player.flying;
    player.vy = 0;
    message(player.flying ? "Flying enabled" : "Flying disabled");
  }

  if (e.code === "KeyG") {
    player.creative = !player.creative;
    message(player.creative ? "Creative Mode" : "Survival Mode");
  }

  if (e.code === "KeyV") {
    camera.position.set(
      49, terrainHeight(49, 24) + 2.3, 24
    );
    streamWorld();
    message("Visited the village");
  }

  if (e.code === "KeyX" && ridden) {
    ridden.ridden = false;
    ridden = null;
    message("Dismounted horse");
  }

  if (e.code === "KeyQ") {
    const available = [
      "fists",
      ...Object.keys(inventory).filter(id =>
        ITEMS[id]?.damage && inventory[id] > 0
      )
    ];

    equipped = available[
      (available.indexOf(equipped) + 1) %
      available.length
    ];

    message(`Equipped ${ITEMS[equipped]?.name || "Fists"}`);
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

// --------------------------------------------------
// MINING, PLACING, ATTACKING AND INTERACTING
// --------------------------------------------------

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let attackCooldown = 0;

function raycast(maxDistance) {
  raycaster.setFromCamera(center, camera);
  raycaster.far = maxDistance;

  const targets = [
    ...chunks.values(),
    ...mobs.filter(m => m.group.visible)
      .map(m => m.group)
  ];

  const hits = raycaster.intersectObjects(
    targets, true
  );

  if (!hits.length) return null;

  const hit = hits[0];
  let object = hit.object;

  while (
    object.parent &&
    !object.userData.terrain &&
    !object.userData.mob
  ) {
    object = object.parent;
  }

  return {hit, object};
}

function targetedBlock(hit, inside) {
  const normal = hit.face.normal.clone()
    .transformDirection(hit.object.matrixWorld);

  const point = hit.point.clone().addScaledVector(
    normal, inside ? -.02 : .02
  );

  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
    z: Math.round(point.z)
  };
}

document.addEventListener("mousedown", e => {
  if (
    !playing ||
    (e.button !== 0 && e.button !== 2) ||
    attackCooldown > 0
  ) return;

  const ranged = equipped === "bow" && e.button === 0;
  const result = raycast(ranged ? 28 : 6);
  if (!result) return;

  const {hit, object} = result;

  if (e.button === 0) {
    // Attack animals and monsters.
    if (object.userData.mob) {
      const mob = object.userData.mob;

      if (ranged) {
        if (!inventory.arrows) {
          message("No arrows available");
          return;
        }
        inventory.arrows--;
      }

      mob.hp -= ITEMS[equipped]?.damage || 3;
      attackCooldown = .35;

      if (mob.hp <= 0) {
        killMob(mob);
      } else {
        message(`Hit ${mob.kind}`);
      }
      return;
    }

    // Mine a block.
    if (object.userData.terrain) {
      const p = targetedBlock(hit, true);
      const id = getBlock(p.x, p.y, p.z);

      if (!id || id === "bedrock") return;

      const key = `${p.x},${p.y},${p.z}`;

      if (
        id === "chest" &&
        chests[key] &&
        Object.values(chests[key]).some(v => v > 0)
      ) {
        message("Empty this chest before mining it");
        return;
      }

      if (setBlock(p.x, p.y, p.z, null)) {
        add(id);
        gainXP(1);

        if (id === "leaves" && Math.random() < .2) {
          add("seeds");
        }

        message(`Mined ${ITEMS[id].name}`);
      }
    }
    return;
  }

  // Animal interaction.
  if (object.userData.mob) {
    const mob = object.userData.mob;

    if (
      mob.kind === "horse" &&
      inventory.saddle > 0
    ) {
      if (ridden) ridden.ridden = false;
      ridden = mob;
      mob.ridden = true;
      message("Riding horse. Press X to dismount.");
      return;
    }

    if (!mob.hostile && inventory.lead > 0) {
      mob.led = !mob.led;
      message(mob.led ? "Animal following you" : "Lead released");
      return;
    }

    const food = mob.kind === "pig"
      ? "carrot" : "wheat";

    if (
      ["cow", "sheep", "pig", "horse"].includes(mob.kind) &&
      inventory[food] > 0
    ) {
      inventory[food]--;
      mob.love = 30;

      const partner = mobs.find(other =>
        other !== mob &&
        other.kind === mob.kind &&
        other.love > 0 &&
        other.group.position.distanceTo(
          mob.group.position
        ) < 6
      );

      if (partner) {
        partner.love = 0;
        mob.love = 0;

        spawnMob(
          mob.kind,
          Math.round(mob.group.position.x + 1),
          Math.round(mob.group.position.z)
        );

        message("Animals bred!");
      } else {
        message("Animal fed");
      }
      return;
    }

    if (mob.kind === "villager") {
      message("Villager: Welcome to our village!");
    }
    return;
  }

  if (!object.userData.terrain) return;

  const p = targetedBlock(hit, true);
  const id = getBlock(p.x, p.y, p.z);
  const key = `${p.x},${p.y},${p.z}`;

  if (id === "chest") {
    openPanel("chest", key);
    return;
  }

  if (id === "furnace") {
    openPanel("furnace");
    return;
  }

  if (id === "bed") {
    dayClock = 0;
    health = Math.min(100, health + 15);
    message("Slept until morning");
    return;
  }

  if (id === "crops") {
    setBlock(p.x, p.y, p.z, "farmland");
    add("wheat", 2);
    add("seeds", 2);
    message("Harvested wheat");
    return;
  }

  if (id === "farmland" && inventory.seeds > 0) {
    inventory.seeds--;
    setBlock(p.x, p.y, p.z, "crops");
    message("Planted wheat");
    return;
  }

  // Place selected block.
  const q = targetedBlock(hit, false);
  const item = HOTBAR[selected];

  if (!player.creative && (inventory[item] || 0) <= 0) {
    message(`No ${ITEMS[item].name} left`);
    return;
  }

  if (getBlock(q.x, q.y, q.z)) return;

  const overlapsPlayer =
    Math.abs(q.x - camera.position.x) < .8 &&
    Math.abs(q.z - camera.position.z) < .8 &&
    q.y + .5 > camera.position.y - 1.55 &&
    q.y - .5 < camera.position.y + .1;

  if (overlapsPlayer) return;

  if (setBlock(q.x, q.y, q.z, item)) {
    if (!player.creative) inventory[item]--;
    message(`Placed ${ITEMS[item].name}`);
  }
});

// --------------------------------------------------
// HUD AND ANIMATION
// --------------------------------------------------

const hotbar = $("hotbar");

for (let i = 0; i < 9; i++) {
  const slot = document.createElement("div");
  slot.className = "slot";

  const icon = document.createElement("span");
  icon.textContent = ITEMS[HOTBAR[i]].icon;

  const number = document.createElement("small");
  number.textContent = i + 1;

  slot.append(icon, number);
  hotbar.append(slot);
}

streamWorld();

const clock = new THREE.Clock();
let foodTimer = 0;
let saveTimer = 0;
let lavaTimer = 0;
let airTimer = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(.04, clock.getDelta());
  const time = clock.elapsedTime;

  if (playing) {
    dayClock += dt;

    const night =
      dayClock % 240 > 135 &&
      dayClock % 240 < 215;

    skyLight.intensity = night ? .55 : 1.85;
    sun.intensity = night ? .15 : 1.6;

    scene.background.setHex(
      night ? 0x122344 : 0x91cfff
    );
    scene.fog.color.copy(scene.background);

    if (keys.ArrowLeft) player.yaw += 2.4 * dt;
    if (keys.ArrowRight) player.yaw -= 2.4 * dt;

    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    const forward = new THREE.Vector3(
      -Math.sin(player.yaw),
      0,
      -Math.cos(player.yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(player.yaw),
      0,
      -Math.sin(player.yaw)
    );

    direction.set(0, 0, 0);

    if (keys.KeyW || keys.ArrowUp) {
      direction.add(forward);
    }
    if (keys.KeyS || keys.ArrowDown) {
      direction.sub(forward);
    }
    if (keys.KeyD) direction.add(right);
    if (keys.KeyA) direction.sub(right);

    const speed = ridden
      ? 9.5
      : keys.ShiftLeft ? 7.4 : 4.4;

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(
        speed * dt
      );

      moveAxis("x", direction.x);
      moveAxis("z", direction.z);
    }

    if (player.flying || player.creative) {
      if (keys.Space) {
        moveAxis("y", speed * dt);
      }
      if (keys.ControlLeft) {
        moveAxis("y", -speed * dt);
      }
      player.vy = 0;
    } else {
      if (keys.Space && player.grounded) {
        player.vy = 7.5;
        player.grounded = false;
      }

      player.vy = Math.max(
        -22, player.vy - 21 * dt
      );

      const moved = moveAxis(
        "y", player.vy * dt
      );

      if (!moved) {
        player.grounded = player.vy <= 0;
        player.vy = 0;
      } else {
        const test = camera.position.clone();
        test.y -= .07;
        player.grounded = collides(test);
      }
    }

    if (
      camera.position.y < BEDROCK - 8 ||
      health <= 0
    ) {
      camera.position.set(
        0, terrainHeight(0, 4) + 2.3, 4
      );
      player.vy = 0;
      health = 100;
      hunger = Math.max(50, hunger);
      message("Respawned");
    }

    const px = Math.round(camera.position.x);
    const py = Math.round(camera.position.y - 1.45);
    const pz = Math.round(camera.position.z);

    if (
      getBlock(px, py, pz) === "lava" &&
      !player.creative
    ) {
      lavaTimer += dt;
      if (lavaTimer >= 1) {
        health -= 12;
        lavaTimer = 0;
        message("Lava burns!");
      }
    } else {
      lavaTimer = 0;
    }

    const underwater =
      terrainHeight(px, pz) <= 0 &&
      camera.position.y < .54;

    if (underwater && !player.creative) {
      airTimer += dt;

      if (airTimer >= 7) {
        health -= 4;
        airTimer = 0;
        message("Swim up for air!");
      }
    } else {
      airTimer = 0;
    }

    streamWorld();
    updateMobs(dt, time, night);

    attackCooldown = Math.max(
      0, attackCooldown - dt
    );

    foodTimer += dt;

    if (foodTimer >= 6) {
      foodTimer = 0;

      if (!player.creative) {
        hunger = Math.max(0, hunger - 1);

        if (hunger === 0) {
          health = Math.max(0, health - 2);
        }
      }
    }

    saveTimer += dt;

    if (saveTimer >= 45) {
      saveTimer = 0;
      saveGame(true);
    }

    $("coords").textContent =
      `XYZ ${Math.floor(camera.position.x)} ` +
      `${Math.floor(camera.position.y)} ` +
      `${Math.floor(camera.position.z)}`;

    $("day").textContent = night
      ? "🌙 Night" : "☀ Day";

    $("health").textContent = Math.ceil(health);
    $("hunger").textContent = Math.ceil(hunger);
    $("level").textContent = level;

    $("weapon").textContent =
      "Weapon: " +
      (ITEMS[equipped]?.name || "Fists") +
      (player.creative ? " · Creative" : "");

    const selectedItem = HOTBAR[selected];

    $("selected").textContent =
      `${ITEMS[selectedItem].name} ` +
      `(${inventory[selectedItem] || 0})`;

    [...hotbar.children].forEach((slot, i) => {
      slot.classList.toggle(
        "active", i === selected
      );

      slot.querySelector("span").textContent =
        ITEMS[HOTBAR[i]].icon;
    });
  }

  if (noticeTime > 0) {
    noticeTime -= dt;

    if (noticeTime <= 0) {
      $("notice").textContent = "";
    }
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
