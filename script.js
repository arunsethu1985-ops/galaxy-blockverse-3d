import * as THREE from "https://esm.sh/three@0.180.0";

/*
 GALAXY BLOCKVERSE
 Physics & Chemistry Edition

 Original procedural voxel game.
 No external AI API required.
*/

const $ = id => document.getElementById(id);
const SAVE = "galaxy-blockverse-three-files-v1";

const SIZE = 12;
const VIEW = 1;
const MIN_Y = -48;
const MAX_Y = 60;
const REACH = 6;

const B = Object.freeze({
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  WOOD: 5,
  LEAVES: 6,
  BEDROCK: 7,
  ICE: 8,
  WATER: 9,
  CACTUS: 10,
  PLANKS: 11,
  GLASS: 12,
  CHEST: 13,
  FURNACE: 14,
  FARMLAND: 15,
  CROPS: 16,
  COAL: 17,
  IRON: 18,
  GOLD: 19,
  DIAMOND: 20,
  LAVA: 21,

  GRAVEL: 22,
  COBBLE: 23,
  OBSIDIAN: 24,
  TNT: 25,
  FIRE: 26,
  BRICKS: 27,
  SNOW: 28,
  CLAY: 29,
  COPPER: 30,
  LAB: 31
});

const ITEMS = [
  ["Air", "▫️"],
  ["Grass", "🟩"],
  ["Dirt", "🟫"],
  ["Stone", "🪨"],
  ["Sand", "🏖️"],
  ["Oak Wood", "🪵"],
  ["Leaves", "🍃"],
  ["Bedrock", "⬛"],
  ["Ice", "🧊"],
  ["Water", "💧"],
  ["Cactus", "🌵"],
  ["Oak Planks", "🪵"],
  ["Glass", "🪟"],
  ["Chest", "📦"],
  ["Furnace", "🔥"],
  ["Farmland", "🟤"],
  ["Crops", "🌾"],
  ["Coal Ore", "⚫"],
  ["Iron Ore", "🔩"],
  ["Gold Ore", "🟨"],
  ["Diamond Ore", "💎"],
  ["Lava", "🌋"],
  ["Gravel", "🪨"],
  ["Cobblestone", "🪨"],
  ["Obsidian", "⬛"],
  ["TNT", "🧨"],
  ["Fire", "🔥"],
  ["Bricks", "🧱"],
  ["Snow", "❄️"],
  ["Clay", "🟫"],
  ["Copper Ore", "🟠"],
  ["Chemistry Lab", "⚗️"]
];

const OTHER = {
  bucket: ["Empty Bucket", "🪣"],
  water_bucket: ["Water Bucket", "💧"],
  lava_bucket: ["Lava Bucket", "🌋"],
  seeds: ["Seeds", "🌱"],
  wheat: ["Wheat", "🌾"],
  meat: ["Raw Meat", "🥩"],
  cooked: ["Cooked Meat", "🍖"],
  emerald: ["Emerald", "💚"],
  iron_ingot: ["Iron Ingot", "🔩"],
  gold_ingot: ["Gold Ingot", "🟨"],
  copper_ingot: ["Copper Ingot", "🟠"],
  hydrogen: ["Hydrogen", "H"],
  oxygen: ["Oxygen", "O"],
  carbon: ["Carbon", "C"],
  sodium: ["Sodium", "Na"],
  chlorine: ["Chlorine", "Cl"],
  nitrogen: ["Nitrogen", "N"],
  water_compound: ["H₂O Compound", "💧"],
  salt: ["Sodium Chloride", "🧂"],
  carbon_dioxide: ["Carbon Dioxide", "CO₂"],
  ammonia: ["Ammonia", "NH₃"]
};

const RECIPE = [
  [B.PLANKS, 4, {[B.WOOD]: 1}],
  [B.CHEST, 1, {[B.PLANKS]: 8}],
  [B.FURNACE, 1, {[B.COBBLE]: 8}],
  [B.FARMLAND, 4, {[B.DIRT]: 4}],
  [B.BRICKS, 4, {[B.CLAY]: 4}],
  [B.TNT, 1, {[B.SAND]: 4, [B.COAL]: 3}],
  [B.LAB, 1, {[B.GLASS]: 4, [B.IRON]: 2}],
  ["bucket", 1, {iron_ingot: 3}]
];

const CHEMISTRY = [
  ["water_compound", 1, {hydrogen: 2, oxygen: 1}],
  ["salt", 1, {sodium: 1, chlorine: 1}],
  ["carbon_dioxide", 1, {carbon: 1, oxygen: 2}],
  ["ammonia", 1, {nitrogen: 1, hydrogen: 3}]
];

const SMELTING = [
  ["iron_ingot", 1, {[B.IRON]: 1, [B.COAL]: 1}],
  ["gold_ingot", 1, {[B.GOLD]: 1, [B.COAL]: 1}],
  ["copper_ingot", 1, {[B.COPPER]: 1, [B.COAL]: 1}],
  [B.GLASS, 1, {[B.SAND]: 1, [B.COAL]: 1}],
  [B.STONE, 1, {[B.COBBLE]: 1, [B.COAL]: 1}],
  ["cooked", 1, {meat: 1, [B.COAL]: 1}]
];

const NAME = id =>
  typeof id === "number"
    ? ITEMS[id]?.[0] || "Unknown"
    : OTHER[id]?.[0] || id;

const ICON = id =>
  typeof id === "number"
    ? ITEMS[id]?.[1] || "▫️"
    : OTHER[id]?.[1] || "▫️";

function solid(id) {
  return ![
    B.AIR,
    B.WATER,
    B.LAVA,
    B.FIRE,
    B.LEAVES,
    B.CROPS
  ].includes(id);
}

function itemId(id) {
  return /^\d+$/.test(String(id))
    ? Number(id)
    : id;
}

/* =========================================
   SCENE
========================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90c9ee);
scene.fog = new THREE.Fog(0x90c9ee, 25, 68);

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  .05,
  120
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(
  0xeaf5ff,
  0x54644b,
  1.6
);
scene.add(ambient);

const sun = new THREE.DirectionalLight(
  0xffe7b5,
  1.5
);
sun.position.set(25, 55, 18);
scene.add(sun);

/* =========================================
   SAVING AND INVENTORY
========================================= */

let stored = {};

try {
  stored = JSON.parse(localStorage.getItem(SAVE) || "{}");
} catch {
  stored = {};
}

const edits = new Map(
  Array.isArray(stored.edits) ? stored.edits : []
);

const chestData = stored.chests || {};

const inventory = {
  1: 24,
  2: 16,
  3: 20,
  4: 16,
  5: 12,
  6: 8,
  8: 6,
  11: 8,
  13: 2,
  14: 1,
  22: 8,
  25: 4,
  31: 1,
  seeds: 8,
  bucket: 1,
  cooked: 4,
  hydrogen: 8,
  oxygen: 6,
  carbon: 4,
  sodium: 3,
  chlorine: 3,
  nitrogen: 3,
  ...stored.inventory
};

const slots =
  Array.isArray(stored.slots) &&
  stored.slots.length === 9
    ? stored.slots
    : [
        B.GRASS,
        B.DIRT,
        B.STONE,
        B.SAND,
        B.WOOD,
        B.GRAVEL,
        B.TNT,
        B.LAB,
        "bucket"
      ];

let selected = 0;
let health = stored.health ?? 20;
let food = stored.food ?? 20;
let creative = false;
let flying = false;
let playing = false;
let panel = "";
let chestKey = "";
let noticeTime = 0;

function add(id, n = 1) {
  inventory[id] = (inventory[id] || 0) + n;
}

function take(id, n = 1) {
  if ((inventory[id] || 0) < n) return false;
  inventory[id] -= n;
  return true;
}

function notify(message) {
  $("notice").textContent = message;
  noticeTime = 2.8;
}

/* =========================================
   TERRAIN NOISE
========================================= */

function hash(x, z, s = 0) {
  const n = Math.sin(
    x * 127.1 + z * 311.7 + s * 79.7
  ) * 43758.5453;
  return n - Math.floor(n);
}

function smooth(v) {
  return v * v * (3 - 2 * v);
}

function noise(x, z, s = 0) {
  const a = Math.floor(x);
  const b = Math.floor(z);
  const u = smooth(x - a);
  const v = smooth(z - b);

  const l = THREE.MathUtils.lerp;

  return l(
    l(hash(a, b, s), hash(a + 1, b, s), u),
    l(hash(a, b + 1, s), hash(a + 1, b + 1, s), u),
    v
  );
}

function fractal(x, z, s = 0) {
  let sum = 0;
  let total = 0;
  let amp = 1;
  let freq = .018;

  for (let i = 0; i < 4; i++) {
    sum += noise(x * freq, z * freq, s + 11 * i) * amp;
    total += amp;
    amp *= .5;
    freq *= 2;
  }

  return sum / total;
}

const columnCache = new Map();

function column(x, z) {
  const k = `${x},${z}`;
  if (columnCache.has(k)) return columnCache.get(k);

  const climate = fractal(x + 600, z - 400, 20);

  const type =
    climate < .35 ? "Desert" :
    climate > .67 ? "Mountains" : "Plains";

  let h = Math.floor(
    (fractal(x, z, 5) - .44) * 24 +
    (fractal(x, z, 33) - .5) * 5 + 6
  );

  if (type === "Mountains") {
    h += Math.floor(15 * fractal(x + 40, z - 40, 96));
  }

  if (type === "Desert") {
    h = Math.floor((fractal(x, z, 5) - .45) * 10 + 4);
  }

  if (Math.hypot(x, z) < 12) h = Math.max(h, 4);

  if (
    x >= 30 && x <= 55 &&
    z >= 16 && z <= 42
  ) h = 5;

  h = THREE.MathUtils.clamp(h, -40, 49);

  const value = {height: h, biome: type};

  if (columnCache.size > 18000) columnCache.clear();
  columnCache.set(k, value);

  return value;
}

const height = (x, z) => column(x, z).height;
const biome = (x, z) => column(x, z).biome;

function treeAt(x, z) {
  return (
    x % 9 === 0 &&
    z % 9 === 0 &&
    hash(x / 9, z / 9) > .57 &&
    biome(x, z) === "Plains" &&
    height(x, z) > 3 &&
    !(x >= 26 && x <= 59 && z >= 12 && z <= 46)
  );
}

const houses = [
  [35, 22],
  [49, 22],
  [35, 36],
  [49, 36]
];

function village(x, y, z) {
  for (const [cx, cz] of houses) {
    if (
      x < cx - 3 || x > cx + 3 ||
      z < cz - 3 || z > cz + 3
    ) continue;

    const wall =
      Math.abs(x - cx) === 3 ||
      Math.abs(z - cz) === 3;

    if (
      x === cx && z === cz - 3 &&
      (y === 6 || y === 7)
    ) return B.AIR;

    if (wall && y >= 6 && y <= 8) {
      if (
        y === 7 &&
        ((x === cx && z === cz + 3) ||
         (x === cx + 3 && z === cz))
      ) return B.GLASS;

      return B.PLANKS;
    }

    if (y === 9) return B.WOOD;

    if (
      x === cx + 1 &&
      z === cz + 1 &&
      y === 6
    ) return B.CHEST;
  }

  if (
    x >= 38 && x <= 45 &&
    z >= 29 && z <= 33
  ) {
    if (y === 6) return B.FARMLAND;
    if (y === 7) return B.CROPS;
  }

  return null;
}

function natural(x, y, z) {
  if (y <= MIN_Y) return B.BEDROCK;
  if (y > MAX_Y) return B.AIR;

  const building = village(x, y, z);
  if (building !== null) return building;

  const h = height(x, z);
  const type = biome(x, z);

  if (y > h) {
    for (
      let tx = Math.floor((x - 2) / 9) * 9;
      tx <= x + 2;
      tx += 9
    ) {
      for (
        let tz = Math.floor((z - 2) / 9) * 9;
        tz <= z + 2;
        tz += 9
      ) {
        if (!treeAt(tx, tz)) continue;

        const th = height(tx, tz);
        const dx = Math.abs(x - tx);
        const dz = Math.abs(z - tz);

        if (
          dx === 0 && dz === 0 &&
          y <= th + 4
        ) return B.WOOD;

        if (
          dx <= 2 && dz <= 2 &&
          dx + dz < 4 &&
          y >= th + 3 && y <= th + 6
        ) return B.LEAVES;
      }
    }

    if (
      type === "Desert" &&
      x % 11 === 0 &&
      z % 11 === 0 &&
      hash(x / 11, z / 11) > .67 &&
      y <= h + 3
    ) return B.CACTUS;

    return y <= 1 ? B.WATER : B.AIR;
  }

  if (y === h) {
    if (type === "Desert") return B.SAND;
    if (type === "Mountains" && h > 18) return B.STONE;
    return B.GRASS;
  }

  if (y >= h - 3) {
    return type === "Desert" ? B.SAND : B.DIRT;
  }

  const cave =
    Math.sin(x * .13 + y * .15) +
    Math.cos(z * .14 - y * .1) +
    Math.sin((x + z + y) * .09);

  if (y < -5 && cave > 2.46) {
    return y < -30 && hash(x + y, z, 8) > .85
      ? B.LAVA
      : B.AIR;
  }

  const ore = hash(x * 7 + y * 13, z * 9 + y * 17, 4);

  if (y < -25 && ore > .993) return B.DIAMOND;
  if (y < -14 && ore > .987) return B.GOLD;
  if (y < 8 && ore > .978) return B.IRON;
  if (y < 18 && ore > .962) return B.COAL;

  return B.STONE;
}

const key = (x, y, z) => `${x},${y},${z}`;

function block(x, y, z) {
  if (y <= MIN_Y) return B.BEDROCK;
  if (y > MAX_Y) return B.AIR;

  const k = key(x, y, z);

  return edits.has(k)
    ? edits.get(k)
    : natural(x, y, z);
}

/* =========================================
   TEXTURE GENERATION
========================================= */

const COLORS = [
  0x000000, 0x62af42, 0x8b603e, 0x888b90,
  0xe4ce91, 0x86603c, 0x3c9850, 0x303138,
  0xa9dcea, 0x2d85c1, 0x36884c, 0xb68a55,
  0xa3d8e5, 0xa27840, 0x55585e, 0x795337,
  0x8aba3b, 0x83878b, 0x9f8880, 0xddbc5a,
  0x3de0da, 0xe55f1d, 0x99978a, 0x777a7e,
  0x211a33, 0xe23a25, 0xff943a, 0xa55e4c,
  0xebf4f7, 0x9a8172, 0xb77046, 0xa5c4b3
];

const atlas = document.createElement("canvas");
atlas.width = 128;
atlas.height = Math.ceil(B.LAB / 8 + 1) * 16;

const ctx = atlas.getContext("2d");

for (let id = 0; id <= B.LAB; id++) {
  const image = ctx.createImageData(16, 16);
  const base = COLORS[id] || 0x888888;

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let shade = (hash(x, y, id) - .5) * 55;
      let color = base;

      if (id === B.GRASS && y < 3) color = 0x52b638;
      if (id === B.WOOD && x % 4 === 0) shade -= 34;
      if (id === B.PLANKS && y % 5 === 0) shade -= 38;
      if (id === B.FARMLAND && x % 4 === 0) shade -= 25;

      if (
        id === B.GLASS &&
        x > 1 && x < 14 &&
        y > 1 && y < 14
      ) shade += 35;

      if (
        [B.COAL, B.IRON, B.GOLD, B.DIAMOND, B.COPPER]
          .includes(id) &&
        hash(Math.floor(x / 3), Math.floor(y / 3), id) > .67
      ) {
        color =
          id === B.COAL ? 0x222329 :
          id === B.IRON ? 0xc8a48a :
          id === B.GOLD ? 0xffdc39 :
          id === B.COPPER ? 0xe58946 :
          0x46f9f3;
      }

      if (id === B.TNT && y > 5 && y < 10) {
        color = 0xf7eee0;
      }

      const i = (y * 16 + x) * 4;

      image.data[i] =
        THREE.MathUtils.clamp(((color >> 16) & 255) + shade, 0, 255);

      image.data[i + 1] =
        THREE.MathUtils.clamp(((color >> 8) & 255) + shade, 0, 255);

      image.data[i + 2] =
        THREE.MathUtils.clamp((color & 255) + shade, 0, 255);

      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(
    image,
    (id % 8) * 16,
    Math.floor(id / 8) * 16
  );
}

const atlasTexture = new THREE.CanvasTexture(atlas);
atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;
atlasTexture.generateMipmaps = false;
atlasTexture.colorSpace = THREE.SRGBColorSpace;

const terrainMaterial = new THREE.MeshLambertMaterial({
  map: atlasTexture,
  vertexColors: true,
  side: THREE.DoubleSide
});

const liquidMaterial = new THREE.MeshBasicMaterial({
  color: 0x4b9dca,
  transparent: true,
  opacity: .67,
  depthWrite: false,
  side: THREE.DoubleSide
});

function uvFor(id) {
  const x = (id % 8) * 16;
  const y = Math.floor(id / 8) * 16;

  const l = (x + .25) / atlas.width;
  const r = (x + 15.75) / atlas.width;
  const t = 1 - (y + .25) / atlas.height;
  const b = 1 - (y + 15.75) / atlas.height;

  return [[l, b], [l, t], [r, t], [r, b]];
}

const FACES = [
  [[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]],.82],
  [[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]],.80],
  [[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]],1],
  [[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]],.62],
  [[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]],.93],
  [[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]],.75]
];

/* =========================================
   CHUNK RENDERING
========================================= */

const chunks = new Map();
const queued = new Set();
const buildQueue = [];
const editedHeights = new Map();

function rememberEdit(x, y, z) {
  const k = `${x},${z}`;
  editedHeights.set(
    k,
    Math.max(editedHeights.get(k) ?? MIN_Y, y)
  );
}

for (const [k] of edits) {
  const [x, y, z] = k.split(",").map(Number);
  if ([x, y, z].every(Number.isFinite)) {
    rememberEdit(x, y, z);
  }
}

function meshFrom(data, material) {
  const [pos, normals, uv, color, indices] = data;
  if (!indices.length) return null;

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position", new THREE.Float32BufferAttribute(pos, 3)
  );
  geometry.setAttribute(
    "normal", new THREE.Float32BufferAttribute(normals, 3)
  );
  geometry.setAttribute(
    "uv", new THREE.Float32BufferAttribute(uv, 2)
  );
  geometry.setAttribute(
    "color", new THREE.Float32BufferAttribute(color, 3)
  );

  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

function buildChunk(cx, cz) {
  const solids = [[], [], [], [], []];
  const fluids = [[], [], [], [], []];
  const memo = new Map();

  function get(x, y, z) {
    const k = key(x, y, z);
    if (!memo.has(k)) memo.set(k, block(x, y, z));
    return memo.get(k);
  }

  for (let x = cx * SIZE; x < (cx + 1) * SIZE; x++) {
    for (let z = cz * SIZE; z < (cz + 1) * SIZE; z++) {
      const top = Math.min(
        MAX_Y,
        Math.max(
          height(x, z) + 9,
          editedHeights.get(`${x},${z}`) ?? MIN_Y
        )
      );

      for (let y = MIN_Y + 1; y <= top; y++) {
        const id = get(x, y, z);
        if (id === B.AIR) continue;

        const fluid = id === B.WATER ||
          id === B.LAVA || id === B.FIRE;

        const data = fluid ? fluids : solids;

        for (const [direction, vertices, shade] of FACES) {
          const [dx, dy, dz] = direction;
          const neighbor = get(x + dx, y + dy, z + dz);

          if (fluid) {
            if (
              neighbor === id ||
              (neighbor !== B.AIR &&
               neighbor !== B.WATER &&
               neighbor !== B.LAVA &&
               neighbor !== B.FIRE)
            ) continue;
          } else if (
            neighbor !== B.AIR &&
            neighbor !== B.WATER &&
            neighbor !== B.LAVA &&
            neighbor !== B.FIRE
          ) continue;

          const [p, n, u, c, indices] = data;
          const start = p.length / 3;
          const coords = uvFor(id);

          for (let i = 0; i < 4; i++) {
            const v = vertices[i];

            p.push(x + v[0], y + v[1], z + v[2]);
            n.push(...direction);
            u.push(...coords[i]);
            c.push(shade, shade, shade);
          }

          indices.push(
            start, start + 1, start + 2,
            start, start + 2, start + 3
          );
        }
      }
    }
  }

  return [
    meshFrom(solids, terrainMaterial),
    meshFrom(fluids, liquidMaterial)
  ];
}

const chunkKey = (x, z) => `${x},${z}`;

function discardChunk(k) {
  const meshes = chunks.get(k);
  if (!meshes) return;

  for (const mesh of meshes) {
    if (!mesh) continue;
    scene.remove(mesh);
    mesh.geometry.dispose();
  }

  chunks.delete(k);
}

function enqueue(cx, cz) {
  const k = chunkKey(cx, cz);
  if (queued.has(k)) return;

  queued.add(k);
  buildQueue.push([cx, cz]);
}

function rebuild(x, z) {
  const cx = Math.floor(x / SIZE);
  const cz = Math.floor(z / SIZE);

  enqueue(cx, cz);

  const mx = ((x % SIZE) + SIZE) % SIZE;
  const mz = ((z % SIZE) + SIZE) % SIZE;

  if (mx === 0) enqueue(cx - 1, cz);
  if (mx === SIZE - 1) enqueue(cx + 1, cz);
  if (mz === 0) enqueue(cx, cz - 1);
  if (mz === SIZE - 1) enqueue(cx, cz + 1);
}

let lastCenter = "";

function stream() {
  const cx = Math.floor(player.x / SIZE);
  const cz = Math.floor(player.z / SIZE);
  const center = chunkKey(cx, cz);

  if (center === lastCenter) return;
  lastCenter = center;

  const needed = new Set();

  for (let x = cx - VIEW; x <= cx + VIEW; x++) {
    for (let z = cz - VIEW; z <= cz + VIEW; z++) {
      const k = chunkKey(x, z);
      needed.add(k);
      if (!chunks.has(k)) enqueue(x, z);
    }
  }

  for (const k of [...chunks.keys()]) {
    if (!needed.has(k)) discardChunk(k);
  }
}

function processChunks() {
  if (!buildQueue.length) return;

  const [cx, cz] = buildQueue.shift();
  const k = chunkKey(cx, cz);
  queued.delete(k);

  if (
    Math.abs(cx - Math.floor(player.x / SIZE)) > VIEW ||
    Math.abs(cz - Math.floor(player.z / SIZE)) > VIEW
  ) return;

  discardChunk(k);
  chunks.set(k, buildChunk(cx, cz));
}

/* =========================================
   PHYSICS AND CHEMISTRY
========================================= */

const updates = [];
const pending = new Set();

function schedule(x, y, z, delay = 0) {
  const k = key(x, y, z);
  if (pending.has(k)) return;
  if (updates.length >= 1800) return;

  pending.add(k);
  updates.push({x, y, z, k, at: gameSeconds + delay});
}

let gameSeconds = 0;

function changeBlock(x, y, z, id, physics = true) {
  if (y <= MIN_Y || y > MAX_Y) return false;
  if (block(x, y, z) === id) return false;

  edits.set(key(x, y, z), id);
  rememberEdit(x, y, z);
  rebuild(x, z);

  if (physics) {
    schedule(x, y, z, .1);
    schedule(x, y + 1, z, .1);

    for (const [dx, dz] of [
      [1,0], [-1,0], [0,1], [0,-1]
    ]) {
      schedule(x + dx, y, z + dz, .1);
    }
  }

  return true;
}

function neighbors(x, y, z) {
  return [
    [x + 1, y, z],
    [x - 1, y, z],
    [x, y + 1, z],
    [x, y - 1, z],
    [x, y, z + 1],
    [x, y, z - 1]
  ];
}

function nextTo(x, y, z, id) {
  return neighbors(x, y, z).some(
    ([a, b, c]) => block(a, b, c) === id
  );
}

function react(x, y, z) {
  const id = block(x, y, z);

  // Gravity for sand and gravel.
  if (id === B.SAND || id === B.GRAVEL) {
    if (
      y > MIN_Y + 1 &&
      [B.AIR, B.WATER].includes(block(x, y - 1, z))
    ) {
      const below = block(x, y - 1, z);

      changeBlock(x, y, z, below, false);
      changeBlock(x, y - 1, z, id, false);

      schedule(x, y - 1, z, .09);
      schedule(x, y + 1, z, .09);
    }
    return;
  }

  // Water and lava form stone-like materials.
  if (id === B.LAVA && nextTo(x, y, z, B.WATER)) {
    changeBlock(x, y, z, B.OBSIDIAN);
    return;
  }

  if (id === B.WATER && nextTo(x, y, z, B.LAVA)) {
    const lava = neighbors(x, y, z).find(
      ([a, b, c]) => block(a, b, c) === B.LAVA
    );

    if (lava) {
      changeBlock(...lava, B.COBBLE);
    }
    return;
  }

  // Simplified flowing water.
  if (id === B.WATER || id === B.LAVA) {
    const spreadChance = id === B.WATER ? .8 : .28;

    if (block(x, y - 1, z) === B.AIR) {
      changeBlock(x, y - 1, z, id);
      return;
    }

    if (Math.random() < spreadChance) {
      const choices = [
        [1,0], [-1,0], [0,1], [0,-1]
      ];

      const [dx, dz] =
        choices[Math.floor(Math.random() * choices.length)];

      const nx = x + dx;
      const nz = z + dz;

      // Constrain simulation to prevent unbounded spread.
      if (
        Math.abs(nx - player.x) < 20 &&
        Math.abs(nz - player.z) < 20 &&
        block(nx, y, nz) === B.AIR
      ) {
        changeBlock(nx, y, nz, id);
      }
    }
    return;
  }

  // Ice melting near heat.
  if (id === B.ICE) {
    if (
      nextTo(x, y, z, B.LAVA) ||
      nextTo(x, y, z, B.FIRE)
    ) {
      changeBlock(x, y, z, B.WATER);
    }
    return;
  }

  // Fire spreads to flammable blocks.
  if (id === B.FIRE) {
    for (const [a, b, c] of neighbors(x, y, z)) {
      const other = block(a, b, c);

      if (
        [B.WOOD, B.LEAVES, B.PLANKS].includes(other) &&
        Math.random() < .25
      ) {
        changeBlock(a, b, c, B.FIRE);
      }
    }

    if (Math.random() < .3) {
      changeBlock(x, y, z, B.AIR);
    } else {
      schedule(x, y, z, 1);
    }
    return;
  }

  // TNT ignites when near fire or lava.
  if (id === B.TNT) {
    if (
      nextTo(x, y, z, B.FIRE) ||
      nextTo(x, y, z, B.LAVA)
    ) {
      explode(x, y, z, 3);
    }
    return;
  }

  // Crop growth is a simplified timed game rule.
  if (id === B.CROPS) {
    schedule(x, y, z, 8);
  }
}

function explode(x, y, z, radius = 3) {
  const r2 = radius * radius;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 > r2) continue;

        const a = x + dx;
        const b = y + dy;
        const c = z + dz;

        const id = block(a, b, c);

        if (
          id !== B.BEDROCK &&
          id !== B.AIR &&
          id !== B.OBSIDIAN
        ) {
          changeBlock(a, b, c, B.AIR, false);
        }
      }
    }
  }

  if (
    Math.hypot(
      player.x - x,
      player.y - y,
      player.z - z
    ) < radius + 1 &&
    !creative
  ) {
    health = Math.max(0, health - 8);
  }

  notify("BOOM! TNT exploded");
}

function updatePhysics() {
  let budget = 35;
  const count = updates.length;

  for (let i = 0; i < count && budget > 0; i++) {
    const job = updates.shift();
    if (!job) break;

    if (job.at > gameSeconds) {
      updates.push(job);
      continue;
    }

    pending.delete(job.k);
    react(job.x, job.y, job.z);
    budget--;
  }
}

/* =========================================
   PLAYER PHYSICS
========================================= */

const player = {
  x: 0,
  y: height(0, 0) + .51,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  yaw: 0,
  pitch: 0,
  grounded: false
};

if (
  Array.isArray(stored.position) &&
  stored.position.length === 3 &&
  stored.position.every(Number.isFinite)
) {
  [player.x, player.y, player.z] = stored.position;
}

const keys = {};

function collision(x, y, z) {
  for (
    let a = Math.floor(x - .3 + .5);
    a <= Math.floor(x + .3 + .5);
    a++
  ) {
    for (
      let b = Math.floor(y + .5);
      b <= Math.floor(y + 1.79 + .5);
      b++
    ) {
      for (
        let c = Math.floor(z - .3 + .5);
        c <= Math.floor(z + .3 + .5);
        c++
      ) {
        if (solid(block(a, b, c))) return true;
      }
    }
  }
  return false;
}

function moveAxis(axis, dist) {
  const steps = Math.ceil(Math.abs(dist) / .08);
  if (!steps) return true;

  const step = dist / steps;

  for (let i = 0; i < steps; i++) {
    const x = player.x + (axis === "x" ? step : 0);
    const y = player.y + (axis === "y" ? step : 0);
    const z = player.z + (axis === "z" ? step : 0);

    if (collision(x, y, z)) return false;
    player[axis] += step;
  }

  return true;
}

let lastFallSpeed = 0;
let hazardTimer = 0;

function updatePlayer(dt) {
  const fx = -Math.sin(player.yaw);
  const fz = -Math.cos(player.yaw);
  const rx = Math.cos(player.yaw);
  const rz = -Math.sin(player.yaw);

  let dx = 0;
  let dz = 0;

  if (keys.KeyW) { dx += fx; dz += fz; }
  if (keys.KeyS) { dx -= fx; dz -= fz; }
  if (keys.KeyA) { dx -= rx; dz -= rz; }
  if (keys.KeyD) { dx += rx; dz += rz; }

  const length = Math.hypot(dx, dz);
  if (length) { dx /= length; dz /= length; }

  const speed =
    keys.ShiftLeft ? 2.4 :
    keys.ControlLeft ? 9 : 6;

  const under = block(
    Math.round(player.x),
    Math.round(player.y - .52),
    Math.round(player.z)
  );

  const inWater = block(
    Math.round(player.x),
    Math.round(player.y + .7),
    Math.round(player.z)
  ) === B.WATER;

  const friction = under === B.ICE ? 2 : 12;

  player.vx += dx * 38 * dt;
  player.vz += dz * 38 * dt;

  player.vx *= Math.exp(-friction * dt);
  player.vz *= Math.exp(-friction * dt);

  const horizontal = Math.hypot(player.vx, player.vz);

  if (horizontal > speed) {
    player.vx *= speed / horizontal;
    player.vz *= speed / horizontal;
  }

  if (flying || creative) {
    player.vy =
      (keys.Space ? speed : 0) -
      (keys.KeyX ? speed : 0);
  } else {
    player.vy = Math.max(
      -25,
      player.vy - (inWater ? 7 : 24) * dt
    );

    if (inWater && keys.Space) {
      player.vy = 3.3;
    } else if (keys.Space && player.grounded) {
      player.vy = 8.5;
      player.grounded = false;
    }
  }

  if (!moveAxis("x", player.vx * dt)) player.vx = 0;
  if (!moveAxis("z", player.vz * dt)) player.vz = 0;

  lastFallSpeed = player.vy;

  if (!moveAxis("y", player.vy * dt)) {
    if (
      player.vy < -11 &&
      !creative &&
      !flying &&
      !inWater
    ) {
      health = Math.max(
        0,
        health - Math.ceil((-player.vy - 10) / 3)
      );
      notify("Fall damage!");
    }

    player.grounded = player.vy < 0;
    player.vy = 0;
  } else {
    player.grounded = false;
  }

  const feet = block(
    Math.round(player.x),
    Math.round(player.y + .5),
    Math.round(player.z)
  );

  if (
    [B.LAVA, B.FIRE].includes(feet) &&
    !creative
  ) {
    hazardTimer += dt;

    if (hazardTimer >= 1) {
      health = Math.max(0, health - 3);
      hazardTimer = 0;
      notify("Burning!");
    }
  } else {
    hazardTimer = 0;
  }

  if (health <= 0 || player.y < MIN_Y - 5) {
    player.x = 0;
    player.z = 0;
    player.y = height(0, 0) + .51;
    player.vx = player.vy = player.vz = 0;
    health = 20;
    food = Math.max(10, food);
    notify("Respawned");
  }

  camera.position.set(
    player.x,
    player.y + 1.62,
    player.z
  );

  camera.rotation.set(
    player.pitch,
    player.yaw,
    0,
    "YXZ"
  );
}

/* =========================================
   LOCAL PIXEL FACE GENERATOR
========================================= */

const npcMaterials = new Map();

function mat(hex) {
  if (!npcMaterials.has(hex)) {
    npcMaterials.set(
      hex,
      new THREE.MeshLambertMaterial({color: hex})
    );
  }
  return npcMaterials.get(hex);
}

function faceMaterial(job) {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;

  const c = canvas.getContext("2d");
  c.imageSmoothingEnabled = false;

  const rect = (color, x, y, w, h) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };

  const hats = {
    farmer: "#c3a252",
    librarian: "#e4d6b9",
    smith: "#64717b",
    villager: "#73513a"
  };

  rect("#cda181", 0, 0, 32, 32);
  rect("#aa765c", 0, 27, 32, 5);
  rect("#e0af88", 3, 7, 26, 19);

  rect(hats[job], 0, 0, 32, 6);

  rect("#604333", 3, 9, 11, 3);
  rect("#604333", 19, 9, 10, 3);

  rect("#eee8df", 5, 13, 8, 6);
  rect("#eee8df", 19, 13, 8, 6);

  rect("#4c7950", 8, 14, 3, 4);
  rect("#4c7950", 22, 14, 3, 4);

  rect("#202b21", 9, 15, 2, 3);
  rect("#202b21", 23, 15, 2, 3);

  rect("#aa785b", 13, 17, 7, 10);
  rect("#e5b28b", 14, 17, 6, 8);
  rect("#825b43", 11, 29, 11, 2);

  if (job === "librarian") {
    rect("#44413f", 3, 12, 11, 1);
    rect("#44413f", 18, 12, 11, 1);
    rect("#44413f", 14, 14, 4, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.MeshLambertMaterial({map: texture});
}

const FACE = {
  farmer: faceMaterial("farmer"),
  librarian: faceMaterial("librarian"),
  smith: faceMaterial("smith"),
  villager: faceMaterial("villager")
};

function part(group, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );

  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

/* =========================================
   VILLAGERS AND ANIMALS
========================================= */

const villagers = [];
const animals = [];

let villagersSpawned = false;
let animalsSpawned = false;

function makeVillager(x, z, job) {
  const group = new THREE.Group();

  const robe = mat({
    farmer: 0x877046,
    librarian: 0xc9c0b3,
    smith: 0x697984,
    villager: 0x855940
  }[job]);

  const skin = mat(0xcda181);

  part(group, .72, .9, .44, robe, 0, .95, 0);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(.6, .6, .6),
    [skin, skin, skin, skin, skin, FACE[job]]
  );

  head.position.set(0, 1.68, -.03);
  group.add(head);

  part(group, .16, .22, .17, mat(0xb58569), 0, 1.54, -.4);
  part(group, .82, .23, .3, robe, 0, 1.1, -.33);
  part(group, .2, .48, .22, mat(0x44362f), -.17, .26, 0);
  part(group, .2, .48, .22, mat(0x44362f), .17, .26, 0);

  group.position.set(x, 5.5, z);
  group.userData.type = "villager";

  scene.add(group);

  villagers.push({
    group,
    job,
    angle: Math.random() * 6.28,
    timer: 0
  });
}

function makeAnimal(x, z, type) {
  const group = new THREE.Group();

  const bodyColor =
    type === "sheep" ? 0xe7e1d7 :
    type === "pig" ? 0xe6a1a1 : 0x6b5142;

  part(group, .75, .65, 1.05, mat(bodyColor), 0, .83, 0);
  part(group, .55, .52, .48, mat(bodyColor), 0, .97, -.69);

  for (const lx of [-.25, .25]) {
    for (const lz of [-.35, .35]) {
      part(
        group, .17, .47, .17,
        mat(0x65554b),
        lx, .25, lz
      );
    }
  }

  part(group, .08, .08, .05, mat(0x222222), -.16, 1.05, -.96);
  part(group, .08, .08, .05, mat(0x222222), .16, 1.05, -.96);

  group.position.set(x, height(x, z) + .5, z);
  group.userData.type = "animal";

  scene.add(group);

  animals.push({
    group,
    type,
    hp: 3,
    originX: x,
    originZ: z,
    angle: Math.random() * 6.28,
    timer: 0
  });
}

function spawnMobs() {
  if (!animalsSpawned) {
    animalsSpawned = true;
    makeAnimal(8, 8, "sheep");
    makeAnimal(-9, 8, "cow");
    makeAnimal(8, -10, "pig");
  }

  if (
    !villagersSpawned &&
    Math.abs(player.x - 42) < 40 &&
    Math.abs(player.z - 29) < 40
  ) {
    villagersSpawned = true;
    makeVillager(37, 26, "farmer");
    makeVillager(47, 26, "librarian");
    makeVillager(37, 39, "smith");
    makeVillager(47, 39, "villager");
  }
}

function updateMobs(dt) {
  for (const mob of [...villagers, ...animals]) {
    mob.timer -= dt;

    if (mob.timer <= 0) {
      mob.timer = 2 + Math.random() * 3;
      mob.angle += (Math.random() - .5) * 2;
    }

    const x = mob.group.position.x +
      Math.sin(mob.angle) * .4 * dt;

    const z = mob.group.position.z +
      Math.cos(mob.angle) * .4 * dt;

    const ox = mob.originX ?? 42;
    const oz = mob.originZ ?? 29;
    const limit = mob.originX === undefined ? 14 : 8;

    if (
      Math.abs(x - ox) > limit ||
      Math.abs(z - oz) > limit
    ) {
      mob.angle += Math.PI;
      continue;
    }

    const h = height(Math.round(x), Math.round(z));

    if (Math.abs(h + .5 - mob.group.position.y) > 1) {
      mob.angle += Math.PI;
      continue;
    }

    mob.group.position.set(x, h + .5, z);
    mob.group.rotation.y = mob.angle;
  }
}

/* =========================================
   PANELS
========================================= */

function entry(title, detail, actions) {
  const div = document.createElement("div");
  div.className = "entry";

  const info = document.createElement("div");
  info.className = "info";

  const strong = document.createElement("strong");
  strong.textContent = title;

  const small = document.createElement("small");
  small.textContent = detail;

  info.append(strong, small);
  div.append(info);

  for (const [label, action, disabled] of actions) {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = !!disabled;
    button.onclick = action;
    div.append(button);
  }

  $("entries").append(div);
}

function openPanel(type, chest = "") {
  panel = type;
  chestKey = chest;

  $("panel").hidden = false;
  $("menu").hidden = true;

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  drawPanel();
}

function closePanel() {
  panel = "";
  $("panel").hidden = true;

  renderer.domElement.requestPointerLock().catch(() => {
    $("menu").hidden = false;
  });
}

$("close").onclick = closePanel;

function craft(output, count, ingredients) {
  if (
    !Object.entries(ingredients).every(
      ([id, amount]) => (inventory[id] || 0) >= amount
    )
  ) return;

  for (const [id, amount] of Object.entries(ingredients)) {
    take(id, amount);
  }

  add(output, count);
  drawPanel();
  notify(`Created ${NAME(output)}`);
}

function recipeRows(recipes) {
  for (const [output, count, ingredients] of recipes) {
    const possible = Object.entries(ingredients).every(
      ([id, amount]) => (inventory[id] || 0) >= amount
    );

    const detail = Object.entries(ingredients)
      .map(([id, amount]) => `${amount} ${NAME(itemId(id))}`)
      .join(" + ");

    entry(
      `${ICON(output)} ${NAME(output)} ×${count}`,
      detail,
      [[
        "CREATE",
        () => craft(output, count, ingredients),
        !possible
      ]]
    );
  }
}

function drawPanel() {
  if (!panel) return;

  $("entries").replaceChildren();

  const titles = {
    inventory: "🎒 INVENTORY",
    crafting: "🔨 CRAFTING",
    chemistry: "⚗️ CHEMISTRY LAB",
    furnace: "🔥 FURNACE",
    chest: "📦 CHEST",
    trading: "💚 VILLAGER TRADING"
  };

  $("panelTitle").textContent = titles[panel];
  $("help").textContent =
    "This is a simplified game system. Select an available action.";

  if (panel === "inventory") {
    for (const [raw, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      const id = itemId(raw);

      entry(
        `${ICON(id)} ${NAME(id)}`,
        `Quantity: ${count}`,
        [[
          "SELECT",
          () => {
            slots[selected] = id;
            closePanel();
          }
        ]]
      );
    }
  }

  if (panel === "crafting") recipeRows(RECIPE);
  if (panel === "chemistry") recipeRows(CHEMISTRY);
  if (panel === "furnace") recipeRows(SMELTING);

  if (panel === "chest") {
    chestData[chestKey] ||= {};
    const contents = chestData[chestKey];

    for (const [id, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      entry(
        `${NAME(itemId(id))} — Bag`,
        `${count} available`,
        [[
          "STORE 1",
          () => {
            if (take(id)) {
              contents[id] = (contents[id] || 0) + 1;
              drawPanel();
            }
          }
        ]]
      );
    }

    for (const [id, count] of Object.entries(contents)) {
      if (count <= 0) continue;

      entry(
        `${NAME(itemId(id))} — Chest`,
        `${count} stored`,
        [[
          "TAKE 1",
          () => {
            contents[id]--;
            add(id);
            drawPanel();
          }
        ]]
      );
    }
  }

  if (panel === "trading") {
    recipeRows([
      ["emerald", 1, {wheat: 5}],
      [B.PLANKS, 8, {emerald: 1}]
    ]);
  }
}

/* =========================================
   SAVE GAME
========================================= */

function saveGame(silent = false) {
  try {
    localStorage.setItem(SAVE, JSON.stringify({
      edits: [...edits],
      chests: chestData,
      inventory,
      slots,
      position: [player.x, player.y, player.z],
      health,
      food
    }));

    if (!silent) notify("World saved");
  } catch {
    notify("Browser storage is full");
  }
}

let resetting = false;

$("reset").onclick = () => {
  if (!confirm("Delete your saved world?")) return;

  resetting = true;
  localStorage.removeItem(SAVE);
  location.reload();
};

window.addEventListener("beforeunload", () => {
  if (!resetting) saveGame(true);
});

/* =========================================
   INPUT
========================================= */

$("play").onclick = () => {
  renderer.domElement.requestPointerLock();
};

renderer.domElement.addEventListener("click", () => {
  if (!playing && !panel) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", () => {
  playing =
    document.pointerLockElement === renderer.domElement;

  $("menu").hidden = playing || !!panel;
  $("hud").hidden = !playing;

  if (!playing) {
    for (const k of Object.keys(keys)) keys[k] = false;
  }
});

document.addEventListener("mousemove", e => {
  if (!playing) return;

  player.yaw -= e.movementX * .0022;

  player.pitch = THREE.MathUtils.clamp(
    player.pitch - e.movementY * .0022,
    -1.48,
    1.48
  );
});

document.addEventListener("keydown", e => {
  if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) {
    e.preventDefault();
  }

  if (panel && e.code === "Escape") {
    closePanel();
    return;
  }

  keys[e.code] = true;
  if (!playing || e.repeat) return;

  if (/^Digit[1-9]$/.test(e.code)) {
    selected = Number(e.code.at(-1)) - 1;
  }

  if (e.code === "KeyE") openPanel("inventory");
  if (e.code === "KeyC") openPanel("crafting");
  if (e.code === "KeyH") openPanel("chemistry");
  if (e.code === "KeyP") saveGame();

  if (e.code === "KeyF") {
    flying = !flying;
    player.vy = 0;
    notify(flying ? "Flying ON" : "Flying OFF");
  }

  if (e.code === "KeyG") {
    creative = !creative;
    notify(creative ? "CREATIVE" : "SURVIVAL");
  }

  if (e.code === "KeyV") {
    player.x = 40;
    player.y = 5.51;
    player.z = 28;
    player.vx = player.vy = player.vz = 0;
    lastCenter = "";
    notify("Welcome to village");
  }

  if (e.code === "KeyR") {
    if (take("cooked")) {
      food = Math.min(20, food + 6);
      notify("Ate cooked meat");
    } else if (take("meat")) {
      food = Math.min(20, food + 2);
      notify("Ate raw meat");
    } else {
      notify("No food available");
    }
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

/* =========================================
   MINING AND PLACING
========================================= */

const look = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

function trace() {
  camera.getWorldDirection(look);

  let previous = null;
  let previousKey = "";

  for (let d = .06; d <= REACH; d += .055) {
    const x = Math.floor(camera.position.x + look.x * d + .5);
    const y = Math.floor(camera.position.y + look.y * d + .5);
    const z = Math.floor(camera.position.z + look.z * d + .5);

    const k = key(x, y, z);
    if (k === previousKey) continue;
    previousKey = k;

    const id = block(x, y, z);

    if (id !== B.AIR) {
      return {x, y, z, id, place: previous, distance: d};
    }

    previous = {x, y, z};
  }

  return null;
}

function mobTarget() {
  const groups = [
    ...villagers.map(v => v.group),
    ...animals.map(a => a.group)
  ];

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  raycaster.far = REACH;

  const hits = raycaster.intersectObjects(groups, true);
  if (!hits.length) return null;

  let object = hits[0].object;

  while (
    object.parent &&
    !object.userData.type
  ) object = object.parent;

  const villager = villagers.find(v => v.group === object);
  const animal = animals.find(a => a.group === object);

  if (villager) {
    return {
      type: "villager",
      value: villager,
      distance: hits[0].distance
    };
  }

  if (animal) {
    return {
      type: "animal",
      value: animal,
      distance: hits[0].distance
    };
  }

  return null;
}

function mine(t) {
  if (!t || t.id === B.BEDROCK) return;

  if (t.id === B.TNT) {
    explode(t.x, t.y, t.z);
    return;
  }

  if (changeBlock(t.x, t.y, t.z, B.AIR)) {
    if (t.id === B.CROPS) {
      add("wheat", 2);
      add("seeds", 2);
    } else if (![B.WATER, B.LAVA, B.FIRE].includes(t.id)) {
      add(t.id);
    }

    notify(`Mined ${NAME(t.id)}`);
  }
}

function interact(t) {
  if (!t) return;

  const held = slots[selected];

  if (
    [B.WATER, B.LAVA].includes(t.id) &&
    held === "bucket" &&
    take("bucket")
  ) {
    add(t.id === B.WATER ? "water_bucket" : "lava_bucket");
    changeBlock(t.x, t.y, t.z, B.AIR);
    notify("Bucket filled");
    return;
  }

  if (t.id === B.CHEST) {
    openPanel("chest", key(t.x, t.y, t.z));
    return;
  }

  if (t.id === B.FURNACE) {
    openPanel("furnace");
    return;
  }

  if (t.id === B.LAB) {
    openPanel("chemistry");
    return;
  }

  if (t.id === B.TNT) {
    explode(t.x, t.y, t.z);
    return;
  }

  if (t.id === B.CROPS) {
    mine(t);
    return;
  }

  if (
    t.id === B.FARMLAND &&
    block(t.x, t.y + 1, t.z) === B.AIR &&
    take("seeds")
  ) {
    changeBlock(t.x, t.y + 1, t.z, B.CROPS);
    notify("Seeds planted");
    return;
  }

  if (!t.place) return;

  const {x, y, z} = t.place;

  if (block(x, y, z) !== B.AIR) return;

  if (held === "water_bucket" || held === "lava_bucket") {
    if (!take(held)) return;

    add("bucket");
    changeBlock(
      x, y, z,
      held === "water_bucket" ? B.WATER : B.LAVA
    );
    return;
  }

  if (
    typeof held !== "number" ||
    held === B.AIR ||
    held === B.BEDROCK ||
    held === B.WATER ||
    held === B.LAVA
  ) return;

  const overlaps =
    x + .5 > player.x - .3 &&
    x - .5 < player.x + .3 &&
    y + .5 > player.y &&
    y - .5 < player.y + 1.8 &&
    z + .5 > player.z - .3 &&
    z - .5 < player.z + .3;

  if (overlaps) return;

  if (!creative && !take(held)) {
    notify(`No ${NAME(held)} available`);
    return;
  }

  changeBlock(x, y, z, held);
  notify(`Placed ${NAME(held)}`);
}

let cooldown = 0;

document.addEventListener("mousedown", e => {
  if (!playing || cooldown > 0) return;

  const t = trace();
  const mob = mobTarget();

  if (
    mob &&
    (!t || mob.distance < t.distance)
  ) {
    if (e.button === 2 && mob.type === "villager") {
      openPanel("trading");
      return;
    }

    if (e.button === 0 && mob.type === "animal") {
      mob.value.hp--;

      if (mob.value.hp <= 0) {
        scene.remove(mob.value.group);

        const i = animals.indexOf(mob.value);
        if (i >= 0) animals.splice(i, 1);

        add("meat", 2);
        notify("Collected raw meat");
      }

      cooldown = .2;
      return;
    }
  }

  if (e.button === 0) mine(t);
  if (e.button === 2) interact(t);

  cooldown = .14;
});

/* =========================================
   HOTBAR
========================================= */

const bar = $("hotbar");

for (let i = 0; i < 9; i++) {
  const div = document.createElement("div");
  div.className = "slot";

  const icon = document.createElement("span");
  const count = document.createElement("small");

  div.append(icon, count);
  bar.append(div);
}

function updateHotbar() {
  [...bar.children].forEach((div, i) => {
    const id = slots[i];

    div.classList.toggle("active", selected === i);
    div.classList.toggle("empty", (inventory[id] || 0) <= 0);

    div.querySelector("span").textContent = ICON(id);
    div.querySelector("small").textContent = inventory[id] || 0;
  });

  const held = slots[selected];

  $("selection").textContent =
    `${NAME(held)} (${inventory[held] || 0})`;
}

/* =========================================
   MAIN LOOP
========================================= */

const clock = new THREE.Clock();

let fpsFrames = 0;
let fpsTime = 0;
let uiTime = 0;
let physicsTime = 0;
let hungerTime = 0;
let saveTime = 0;
let dayTime = 0;

stream();
updateHotbar();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(.04, clock.getDelta());

  fpsFrames++;
  fpsTime += dt;
  gameSeconds += dt;

  if (fpsTime >= 1) {
    $("fps").textContent =
      `FPS ${Math.round(fpsFrames / fpsTime)}`;

    fpsFrames = 0;
    fpsTime = 0;
  }

  if (playing) {
    updatePlayer(dt);
    stream();
    spawnMobs();
    updateMobs(dt);

    cooldown = Math.max(0, cooldown - dt);

    hungerTime += dt;
    saveTime += dt;
    uiTime += dt;

    if (hungerTime >= 6) {
      hungerTime = 0;

      if (!creative) {
        food = Math.max(0, food - 1);
        if (food === 0) health = Math.max(0, health - 1);
      }
    }

    if (saveTime >= 45) {
      saveTime = 0;
      saveGame(true);
    }

    if (uiTime >= .13) {
      uiTime = 0;

      $("coords").textContent =
        `XYZ ${Math.floor(player.x)} ` +
        `${Math.floor(player.y)} ` +
        `${Math.floor(player.z)}`;

      $("biome").textContent =
        biome(Math.floor(player.x), Math.floor(player.z));

      $("health").textContent = Math.ceil(health);
      $("food").textContent = Math.ceil(food);
      $("mode").textContent = creative ? "CREATIVE" : "SURVIVAL";
      $("chunks").textContent = `Chunks ${chunks.size}`;

      const mob = mobTarget();
      const t = trace();

      $("targetName").textContent =
        mob ? mob.value.job || mob.value.type :
        t ? NAME(t.id) : "";

      updateHotbar();
    }
  }

  physicsTime += dt;

  if (physicsTime >= .10) {
    physicsTime = 0;
    updatePhysics();
  }

  dayTime += dt * .013;

  const daylight = .5 + .5 * Math.cos(dayTime);
  ambient.intensity = .55 + daylight * 1.35;
  sun.intensity = .25 + daylight * 1.3;

  scene.background.setRGB(
    .07 + daylight * .47,
    .10 + daylight * .69,
    .20 + daylight * .73
  );

  if (fpsFrames % 15 === 0) {
    $("timeOfDay").textContent =
      daylight > .4 ? "Day" : "Night";
  }

  processChunks();

  if (noticeTime > 0) {
    noticeTime -= dt;

    if (noticeTime <= 0) {
      $("notice").textContent = "";
    }
  }

  renderer.render(scene, camera);
}

camera.position.set(
  player.x,
  player.y + 1.62,
  player.z
);

animate();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
