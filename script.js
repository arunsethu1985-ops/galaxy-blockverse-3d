
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE
// Original single-player voxel game.
// This is NOT the complete Minecraft game.

const $ = id => document.getElementById(id);

const SAVE = "galaxy-blockverse-water-village-v1";
const CHUNK = 12;
const VIEW = 1;
const LOWEST_Y = -48;
const WATER_LEVEL = 0;

// ---------------------------------------
// THREE.JS SETUP
// ---------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91cfff);
scene.fog = new THREE.Fog(0x91cfff, 22, 70);

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.05,
  110
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(
  Math.min(devicePixelRatio, 1.25)
);
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

scene.add(
  new THREE.HemisphereLight(
    0xdfefff,
    0x657344,
    2
  )
);

const sunlight = new THREE.DirectionalLight(
  0xffeed0,
  1.3
);
sunlight.position.set(30, 50, 25);
scene.add(sunlight);

// ---------------------------------------
// ITEMS
// ---------------------------------------

const ITEMS = {
  grass: ["Grass Block", "🟩"],
  dirt: ["Dirt", "🟫"],
  stone: ["Stone", "🪨"],
  sand: ["Sand", "🏖️"],
  wood: ["Wood", "🪵"],
  leaves: ["Leaves", "🍃"],
  planks: ["Planks", "🪵"],
  cobble: ["Cobblestone", "🪨"],
  glass: ["Glass", "🪟"],
  fence: ["Fence", "🚧"],
  farmland: ["Farmland", "🟤"],
  wheat_crop: ["Wheat Crops", "🌾"],
  chest: ["Chest", "📦"],
  furnace: ["Furnace", "🔥"],
  bed: ["Bed", "🛏️"],
  coal: ["Coal", "⚫"],
  iron: ["Iron", "🔩"],
  gold: ["Gold", "🟨"],
  diamond: ["Diamond", "💎"],
  copper: ["Copper", "🟠"],
  lava: ["Lava", "🌋"],
  bedrock: ["Bedrock", "⬛"],
  water: ["Water", "💧"],
  bucket: ["Empty Bucket", "🪣"],
  water_bucket: ["Water Bucket", "🪣💧"],
  seeds: ["Wheat Seeds", "🌱"],
  wheat: ["Wheat", "🌾"],
  carrot: ["Carrot", "🥕"],
  potato: ["Potato", "🥔"],
  raw_meat: ["Raw Meat", "🥩"],
  cooked_meat: ["Cooked Meat", "🍖"],
  emerald: ["Emerald", "💚"],
  stick: ["Stick", "🪵"],
  wood_sword: ["Wood Sword", "🗡️"],
  stone_sword: ["Stone Sword", "⚔️"],
  iron_sword: ["Iron Sword", "⚔️"],
  diamond_sword: ["Diamond Sword", "💎"]
};

const PLACEABLE = new Set([
  "grass", "dirt", "stone", "sand",
  "wood", "leaves", "planks", "cobble",
  "glass", "fence", "farmland",
  "wheat_crop", "chest", "furnace", "bed"
]);

const RECIPES = [
  ["planks", 4, {wood: 1}],
  ["stick", 4, {planks: 2}],
  ["cobble", 1, {stone: 1}],
  ["fence", 3, {planks: 4, stick: 2}],
  ["chest", 1, {planks: 8}],
  ["furnace", 1, {cobble: 8}],
  ["bucket", 1, {iron: 3}],
  ["glass", 4, {sand: 4, coal: 1}],
  ["wood_sword", 1, {planks: 2, stick: 1}],
  ["stone_sword", 1, {stone: 2, stick: 1}],
  ["iron_sword", 1, {iron: 2, stick: 1}],
  ["diamond_sword", 1, {diamond: 2, stick: 1}],
  ["farmland", 4, {dirt: 4}],
  ["wheat_crop", 4, {seeds: 4}],
  ["bed", 1, {planks: 3, leaves: 3}]
];

// ---------------------------------------
// SAVE DATA
// ---------------------------------------

let saved = {};

try {
  saved = JSON.parse(
    localStorage.getItem(SAVE) || "{}"
  );
} catch {
  saved = {};
}

const edits = new Map(
  Array.isArray(saved.edits) ? saved.edits : []
);

const chestData = saved.chests || {};

const inventory = {
  grass: 20,
  dirt: 16,
  stone: 10,
  sand: 10,
  wood: 10,
  leaves: 10,
  planks: 8,
  cobble: 8,
  glass: 5,
  fence: 6,
  bucket: 1,
  water_bucket: 0,
  seeds: 8,
  cooked_meat: 5,
  raw_meat: 0,
  stick: 4
};

for (const [id, quantity] of Object.entries(
  saved.inventory || {}
)) {
  if (
    ITEMS[id] &&
    Number.isInteger(quantity) &&
    quantity >= 0
  ) {
    inventory[id] = quantity;
  }
}

const hotbar = [
  "grass",
  "dirt",
  "stone",
  "wood",
  "planks",
  "glass",
  "fence",
  "bucket",
  "water_bucket"
];

let selected = 0;
let health = saved.health ?? 100;
let hunger = saved.hunger ?? 100;
let level = saved.level ?? 1;
let creative = false;
let flying = false;

const itemKey = (x, y, z) => `${x},${y},${z}`;

function addItem(id, count = 1) {
  inventory[id] = (inventory[id] || 0) + count;
}

function removeItem(id, count = 1) {
  if ((inventory[id] || 0) < count) {
    return false;
  }

  inventory[id] -= count;
  return true;
}

// ---------------------------------------
// ORIGINAL PIXEL ART TEXTURES
// ---------------------------------------

const TEXTURE_NAMES = [
  "grass_top",
  "grass_side",
  "dirt",
  "stone",
  "sand",
  "wood_side",
  "wood_top",
  "leaves",
  "planks",
  "cobble",
  "glass",
  "fence",
  "farmland",
  "wheat_crop",
  "chest",
  "furnace",
  "bed",
  "coal",
  "iron",
  "gold",
  "diamond",
  "copper",
  "lava",
  "bedrock",
  "water"
];

const BASE = {
  grass_top: 0x65b545,
  grass_side: 0x8b6140,
  dirt: 0x855938,
  stone: 0x8a8e94,
  sand: 0xe2d295,
  wood_side: 0x896039,
  wood_top: 0xb79769,
  leaves: 0x348b4c,
  planks: 0xc6975c,
  cobble: 0x74777c,
  glass: 0x93dbe8,
  fence: 0x9e7046,
  farmland: 0x65452f,
  wheat_crop: 0x91b43d,
  chest: 0xa27842,
  furnace: 0x5c6269,
  bed: 0xbb414e,
  coal: 0x888b8f,
  iron: 0x898b8d,
  gold: 0x898b8d,
  diamond: 0x888c8d,
  copper: 0x8b898a,
  lava: 0xeb681c,
  bedrock: 0x30343a,
  water: 0x368dca
};

function random2(x, z, seed = 0) {
  const n = Math.sin(
    x * 127.1 +
    z * 311.7 +
    seed * 67.3
  ) * 43758.5453123;

  return n - Math.floor(n);
}

const atlas = document.createElement("canvas");
atlas.width = 128;
atlas.height =
  Math.ceil(TEXTURE_NAMES.length / 8) * 16;

const ctx = atlas.getContext("2d");

for (let t = 0; t < TEXTURE_NAMES.length; t++) {
  const name = TEXTURE_NAMES[t];
  const image = ctx.createImageData(16, 16);

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let base = BASE[name];

      let variation =
        (random2(x, y, t) - .5) * 50;

      if (name === "grass_side" && y < 3) {
        base = 0x61b345;
      }

      if (
        name === "wood_side" ||
        name === "fence"
      ) {
        if (x % 4 === 0) variation -= 35;
      }

      if (name === "wood_top") {
        const radius = Math.floor(
          Math.max(
            Math.abs(x - 7.5),
            Math.abs(y - 7.5)
          )
        );

        if (radius % 3 === 0) {
          variation -= 40;
        }
      }

      if (name === "planks" && y % 5 === 0) {
        variation -= 35;
      }

      if (
        name === "cobble" &&
        (x % 6 === 0 || y % 5 === 0)
      ) {
        variation -= 35;
      }

      if (
        name === "glass" &&
        (x === 0 || x === 15 ||
         y === 0 || y === 15)
      ) {
        variation += 60;
      }

      if (name === "farmland" && x % 4 === 0) {
        variation -= 38;
      }

      if (name === "wheat_crop" && x % 4 === 2) {
        variation += 48;
      }

      if (
        name === "chest" &&
        (x === 1 || x === 14 ||
         y === 3 || y === 12)
      ) {
        variation -= 55;
      }

      if (
        name === "furnace" &&
        x > 3 && x < 12 &&
        y > 6 && y < 13
      ) {
        variation -= 65;
      }

      const oreColors = {
        coal: 0x252525,
        iron: 0xcda486,
        gold: 0xffd33d,
        diamond: 0x43e0e4,
        copper: 0xca7957
      };

      if (
        oreColors[name] &&
        random2(
          Math.floor(x / 3),
          Math.floor(y / 3),
          t
        ) > .7
      ) {
        base = oreColors[name];
      }

      if (name === "lava") {
        variation += random2(
          Math.floor(x / 3),
          Math.floor(y / 3), t
        ) > .5 ? 50 : -30;
      }

      const index = (y * 16 + x) * 4;

      image.data[index] = Math.max(
        0,
        Math.min(
          255,
          ((base >> 16) & 255) + variation
        )
      );

      image.data[index + 1] = Math.max(
        0,
        Math.min(
          255,
          ((base >> 8) & 255) + variation
        )
      );

      image.data[index + 2] = Math.max(
        0,
        Math.min(
          255,
          (base & 255) + variation
        )
      );

      image.data[index + 3] = 255;
    }
  }

  ctx.putImageData(
    image,
    (t % 8) * 16,
    Math.floor(t / 8) * 16
  );
}

const texture = new THREE.CanvasTexture(atlas);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.generateMipmaps = false;
texture.colorSpace = THREE.SRGBColorSpace;

const blockMaterial = new THREE.MeshLambertMaterial({
  map: texture,
  side: THREE.DoubleSide,
  vertexColors: true
});

function textureFor(id, face) {
  if (id === "grass") {
    if (face === 2) return "grass_top";
    if (face === 3) return "dirt";
    return "grass_side";
  }

  if (id === "wood") {
    if (face === 2 || face === 3) {
      return "wood_top";
    }

    return "wood_side";
  }

  if (TEXTURE_NAMES.includes(id)) {
    return id;
  }

  return "stone";
}

function faceUV(id, face) {
  const name = textureFor(id, face);
  const i = TEXTURE_NAMES.indexOf(name);
  const column = i % 8;
  const row = Math.floor(i / 8);

  const left = (column * 16 + .3) / atlas.width;
  const right =
    (column * 16 + 15.7) / atlas.width;

  const top =
    1 - (row * 16 + .3) / atlas.height;

  const bottom =
    1 - (row * 16 + 15.7) / atlas.height;

  return [
    [left, bottom],
    [left, top],
    [right, top],
    [right, bottom]
  ];
}

// ---------------------------------------
// WORLD GENERATION
// ---------------------------------------

function terrainHeight(x, z) {
  let h = Math.floor(
    Math.sin(x * .015) * 6 +
    Math.cos(z * .014) * 6 +
    Math.sin((x - z) * .008) * 5 +
    Math.sin(x * .1) * 2
  );

  if (Math.hypot(x, z - 4) < 20) {
    h = Math.max(4, h);
  }

  // A level region for the village.
  if (
    x >= 44 && x <= 80 &&
    z >= 18 && z <= 54
  ) {
    h = 5;
  }

  return h;
}

function treeAt(x, z) {
  return (
    x % 9 === 0 &&
    z % 9 === 0 &&
    terrainHeight(x, z) > 2 &&
    random2(x / 9, z / 9) > .48 &&
    Math.hypot(x, z - 4) > 10 &&
    !(x >= 40 && x <= 85 &&
      z >= 14 && z <= 58)
  );
}

function villageBlock(x, y, z) {
  if (
    x < 44 || x > 80 ||
    z < 18 || z > 54
  ) return null;

  // Four simple houses.
  const houses = [
    [51, 27],
    [71, 27],
    [51, 45],
    [71, 45]
  ];

  for (const [cx, cz] of houses) {
    const inside =
      x >= cx - 3 && x <= cx + 3 &&
      z >= cz - 3 && z <= cz + 3;

    if (!inside) continue;

    const wall =
      x === cx - 3 ||
      x === cx + 3 ||
      z === cz - 3 ||
      z === cz + 3;

    if (
      x === cx &&
      z === cz - 3 &&
      (y === 6 || y === 7)
    ) return null;

    if (y === 6 && x === cx && z === cz) {
      return "bed";
    }

    if (
      y >= 6 && y <= 8 &&
      wall
    ) {
      if (
        y === 7 &&
        ((x === cx && z === cz + 3) ||
         (x === cx + 3 && z === cz))
      ) {
        return "glass";
      }

      return "planks";
    }

    if (y === 9) {
      return "wood";
    }
  }

  // Village farming area.
  if (
    x >= 58 && x <= 65 &&
    z >= 37 && z <= 43
  ) {
    if (y === 6) return "farmland";
    if (y === 7) return "wheat_crop";
  }

  if (
    x === 61 &&
    z === 30 &&
    y === 6
  ) {
    return "chest";
  }

  return null;
}

function cave(x, y, z) {
  if (y > -7 || y < LOWEST_Y + 2) {
    return false;
  }

  const n =
    Math.sin(x * .16 + y * .11) +
    Math.cos(z * .13 - y * .12) +
    Math.sin((x + z) * .09 + y * .16);

  return n > 2.4;
}

function naturalBlock(x, y, z) {
  if (y <= LOWEST_Y) {
    return "bedrock";
  }

  const village = villageBlock(x, y, z);

  if (village) return village;

  const surface = terrainHeight(x, z);

  // Tree trunks and leaves.
  if (y > surface) {
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

        const th = terrainHeight(tx, tz);
        const dx = Math.abs(x - tx);
        const dz = Math.abs(z - tz);

        if (
          dx === 0 &&
          dz === 0 &&
          y > th &&
          y <= th + 4
        ) {
          return "wood";
        }

        if (
          dx <= 2 &&
          dz <= 2 &&
          dx + dz <= 3 &&
          y >= th + 3 &&
          y <= th + 6
        ) {
          return "leaves";
        }
      }
    }

    return null;
  }

  if (y === surface) {
    return surface <= 0 ? "sand" : "grass";
  }

  if (y >= surface - 3) {
    return "dirt";
  }

  if (cave(x, y, z)) {
    if (
      y < -30 &&
      random2(x + y, z + y) > .65
    ) {
      return "lava";
    }

    return null;
  }

  const ore = random2(
    x * 7 + y * 11,
    z * 13 + y * 17
  );

  if (y < -30 && ore > .99) {
    return "diamond";
  }

  if (y < -23 && ore > .981) {
    return "gold";
  }

  if (y < -13 && ore > .975) {
    return "iron";
  }

  if (y < -8 && ore > .972) {
    return "copper";
  }

  if (y < -5 && ore > .95) {
    return "coal";
  }

  return "stone";
}

function getBlock(x, y, z) {
  const key = itemKey(x, y, z);

  return edits.has(key)
    ? edits.get(key)
    : naturalBlock(x, y, z);
}

// ---------------------------------------
// CHUNK GEOMETRY
// ---------------------------------------

const chunks = new Map();
const waterMeshes = new Map();

const FACES = [
  {
    dir: [1, 0, 0],
    points: [
      [.5,-.5,-.5], [.5,.5,-.5],
      [.5,.5,.5], [.5,-.5,.5]
    ],
    light: .82
  },
  {
    dir: [-1, 0, 0],
    points: [
      [-.5,-.5,.5], [-.5,.5,.5],
      [-.5,.5,-.5], [-.5,-.5,-.5]
    ],
    light: .8
  },
  {
    dir: [0, 1, 0],
    points: [
      [-.5,.5,-.5], [-.5,.5,.5],
      [.5,.5,.5], [.5,.5,-.5]
    ],
    light: 1
  },
  {
    dir: [0, -1, 0],
    points: [
      [-.5,-.5,.5], [-.5,-.5,-.5],
      [.5,-.5,-.5], [.5,-.5,.5]
    ],
    light: .65
  },
  {
    dir: [0, 0, 1],
    points: [
      [.5,-.5,.5], [.5,.5,.5],
      [-.5,.5,.5], [-.5,-.5,.5]
    ],
    light: .93
  },
  {
    dir: [0, 0, -1],
    points: [
      [-.5,-.5,-.5], [-.5,.5,-.5],
      [.5,.5,-.5], [.5,-.5,-.5]
    ],
    light: .78
  }
];

const waterMaterial = new THREE.MeshPhongMaterial({
  color: 0x278ec9,
  transparent: true,
  opacity: .72,
  side: THREE.DoubleSide,
  depthWrite: false
});

function makeChunk(cx, cz) {
  const positions = [];
  const normals = [];
  const colors = [];
  const uvs = [];
  const indices = [];

  for (
    let x = cx * CHUNK;
    x < (cx + 1) * CHUNK;
    x++
  ) {
    for (
      let z = cz * CHUNK;
      z < (cz + 1) * CHUNK;
      z++
    ) {
      for (
        let y = LOWEST_Y + 1;
        y <= terrainHeight(x, z) + 8;
        y++
      ) {
        const id = getBlock(x, y, z);

        if (!id) continue;

        for (let f = 0; f < 6; f++) {
          const face = FACES[f];
          const [dx, dy, dz] = face.dir;

          if (getBlock(
            x + dx,
            y + dy,
            z + dz
          )) continue;

          const first = positions.length / 3;
          const uv = faceUV(id, f);

          for (let j = 0; j < 4; j++) {
            const p = face.points[j];

            positions.push(
              x + p[0],
              y + p[1],
              z + p[2]
            );

            normals.push(...face.dir);
            uvs.push(...uv[j]);

            colors.push(
              face.light,
              face.light,
              face.light
            );
          }

          indices.push(
            first,
            first + 1,
            first + 2,
            first,
            first + 2,
            first + 3
          );
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions, 3
    )
  );

  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(
      normals, 3
    )
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      uvs, 2
    )
  );

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(
      colors, 3
    )
  );

  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(
    geometry,
    blockMaterial
  );

  mesh.userData.terrain = true;
  scene.add(mesh);

  return mesh;
}

function waterAt(x, y, z) {
  const edited = edits.get(itemKey(x, y, z));

  if (edited === "water") return true;

  if (edited !== undefined) return false;

  return (
    y === WATER_LEVEL &&
    terrainHeight(x, z) < WATER_LEVEL
  );
}

function makeWater(cx, cz) {
  const positions = [];
  const indices = [];

  for (
    let x = cx * CHUNK;
    x < (cx + 1) * CHUNK;
    x++
  ) {
    for (
      let z = cz * CHUNK;
      z < (cz + 1) * CHUNK;
      z++
    ) {
      // Natural ocean water and placed sources.
      for (let y = -1; y <= 12; y++) {
        if (!waterAt(x, y, z)) continue;

        const first = positions.length / 3;

        positions.push(
          x - .5, y + .4, z - .5,
          x + .5, y + .4, z - .5,
          x + .5, y + .4, z + .5,
          x - .5, y + .4, z + .5
        );

        indices.push(
          first,
          first + 1,
          first + 2,
          first,
          first + 2,
          first + 3
        );
      }
    }
  }

  if (!indices.length) return;

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions, 3
    )
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    waterMaterial
  );

  scene.add(mesh);
  waterMeshes.set(`${cx},${cz}`, mesh);
}

function removeChunk(cx, cz) {
  const key = `${cx},${cz}`;

  const terrain = chunks.get(key);

  if (terrain) {
    scene.remove(terrain);
    terrain.geometry.dispose();
    chunks.delete(key);
  }

  const water = waterMeshes.get(key);

  if (water) {
    scene.remove(water);
    water.geometry.dispose();
    waterMeshes.delete(key);
  }
}

function rebuild(cx, cz) {
  const key = `${cx},${cz}`;

  if (!chunks.has(key)) return;

  removeChunk(cx, cz);

  chunks.set(key, makeChunk(cx, cz));
  makeWater(cx, cz);
}

function setBlock(x, y, z, id) {
  if (y <= LOWEST_Y || y > 60) {
    return false;
  }

  edits.set(itemKey(x, y, z), id);

  const cx = Math.floor(x / CHUNK);
  const cz = Math.floor(z / CHUNK);

  rebuild(cx, cz);

  if (x % CHUNK === 0) {
    rebuild(cx - 1, cz);
  }

  if (x % CHUNK === CHUNK - 1) {
    rebuild(cx + 1, cz);
  }

  if (z % CHUNK === 0) {
    rebuild(cx, cz - 1);
  }

  if (z % CHUNK === CHUNK - 1) {
    rebuild(cx, cz + 1);
  }

  return true;
}

// ---------------------------------------
// PLAYER AND MOVEMENT
// ---------------------------------------

const player = {
  yaw: 0,
  pitch: 0,
  velocityY: 0,
  grounded: false
};

camera.position.set(
  0,
  terrainHeight(0, 4) + 2.3,
  4
);

if (
  Array.isArray(saved.position) &&
  saved.position.length === 3 &&
  saved.position.every(Number.isFinite) &&
  saved.position[1] > LOWEST_Y + 2
) {
  camera.position.fromArray(saved.position);
}

const keys = {};
const movement = new THREE.Vector3();

function solid(x, y, z) {
  const id = getBlock(
    Math.round(x),
    Math.round(y),
    Math.round(z)
  );

  return (
    !!id &&
    id !== "leaves" &&
    id !== "lava" &&
    id !== "water" &&
    id !== "wheat_crop"
  );
}

function collision(p) {
  for (const dx of [-.26, .26]) {
    for (const dz of [-.26, .26]) {
      for (const dy of [-1.45, -.8, -.1]) {
        if (solid(
          p.x + dx,
          p.y + dy,
          p.z + dz
        )) {
          return true;
        }
      }
    }
  }

  return false;
}

function moveAxis(axis, value) {
  const future = camera.position.clone();
  future[axis] += value;

  if (collision(future)) return false;

  camera.position[axis] = future[axis];
  return true;
}

// ---------------------------------------
// VILLAGERS
// ---------------------------------------

const villagers = [];
const villagerGroups = new Set();

function makeVillager(x, z) {
  const group = new THREE.Group();

  function part(w, h, d, color, px, py, pz) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({
        color
      })
    );

    mesh.position.set(px, py, pz);
    group.add(mesh);
  }

  // Body, head, nose, eyes and legs.
  part(.65, .85, .4, 0x794f3c, 0, .9, 0);
  part(.52, .52, .5, 0xc99b7b, 0, 1.62, 0);
  part(.15, .2, .18, 0xa97a60, 0, 1.53, -.33);

  part(.07, .07, .04, 0x224b38, -.13, 1.7, -.27);
  part(.07, .07, .04, 0x224b38, .13, 1.7, -.27);

  part(.2, .5, .2, 0x4b3330, -.18, .26, 0);
  part(.2, .5, .2, 0x4b3330, .18, .26, 0);

  group.position.set(
    x,
    terrainHeight(Math.round(x), Math.round(z)) + .5,
    z
  );

  group.userData.villager = true;
  group.userData.walkDirection = Math.random() * 6.28;
  group.userData.walkTimer = 0;

  scene.add(group);
  villagers.push(group);
}

function spawnVillagePeople() {
  if (villagerGroups.has("main-village")) return;

  villagerGroups.add("main-village");

  [
    [52, 32],
    [70, 33],
    [56, 48],
    [68, 47]
  ].forEach(([x, z]) => {
    makeVillager(x, z);
  });
}

function updateVillagers(dt) {
  for (const v of villagers) {
    v.userData.walkTimer -= dt;

    if (v.userData.walkTimer <= 0) {
      v.userData.walkTimer = 2 + Math.random() * 3;
      v.userData.walkDirection +=
        (Math.random() - .5) * 2;
    }

    const a = v.userData.walkDirection;
    const x = v.position.x + Math.sin(a) * dt * .6;
    const z = v.position.z + Math.cos(a) * dt * .6;

    if (
      x < 44 || x > 80 ||
      z < 18 || z > 54
    ) {
      v.userData.walkDirection += Math.PI;
      continue;
    }

    const ground = terrainHeight(
      Math.round(x),
      Math.round(z)
    );

    if (
      !solid(Math.round(x), ground + 1, Math.round(z))
    ) {
      v.position.set(x, ground + .5, z);
    } else {
      v.userData.walkDirection += Math.PI;
    }

    v.rotation.y = a;
  }
}

let lastChunk = "";

function streamWorld() {
  const cx = Math.floor(
    camera.position.x / CHUNK
  );

  const cz = Math.floor(
    camera.position.z / CHUNK
  );

  const center = `${cx},${cz}`;
  if (lastChunk === center) return;

  lastChunk = center;

  const required = new Set();

  for (let x = cx - VIEW; x <= cx + VIEW; x++) {
    for (let z = cz - VIEW; z <= cz + VIEW; z++) {
      required.add(`${x},${z}`);
    }
  }

  for (const key of [...chunks.keys()]) {
    if (!required.has(key)) {
      const [x, z] = key.split(",").map(Number);
      removeChunk(x, z);
    }
  }

  for (const key of required) {
    if (chunks.has(key)) continue;

    const [x, z] = key.split(",").map(Number);

    chunks.set(key, makeChunk(x, z));
    makeWater(x, z);
  }

  // Village residents appear near their village.
  if (
    cx >= 2 && cx <= 7 &&
    cz >= 0 && cz <= 6
  ) {
    spawnVillagePeople();
  }
}

// ---------------------------------------
// INVENTORY AND CRAFTING UI
// ---------------------------------------

let panelType = null;
let currentChest = null;
let playing = false;

function notify(text) {
  $("message").textContent = text;
}

function row(title, details, buttons) {
  const root = $("panelItems");

  const element = document.createElement("div");
  element.className = "item-row";

  const info = document.createElement("div");
  info.className = "item-info";

  const strong = document.createElement("strong");
  strong.textContent = title;

  const small = document.createElement("small");
  small.textContent = details;

  info.append(strong, small);
  element.append(info);

  for (const [label, callback, disabled] of buttons) {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = !!disabled;
    button.onclick = callback;

    element.append(button);
  }

  root.append(element);
}

function openPanel(type, chestKey = null) {
  panelType = type;
  currentChest = chestKey;

  $("panel").hidden = false;
  $("menu").hidden = true;

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  drawPanel();
}

function closePanel() {
  panelType = null;
  currentChest = null;

  $("panel").hidden = true;
  $("menu").hidden = true;

  renderer.domElement.requestPointerLock()
    .catch(() => {
      $("menu").hidden = false;
    });
}

$("closePanel").onclick = closePanel;

function drawPanel() {
  if (!panelType) return;

  $("panelItems").replaceChildren();

  $("panelTitle").textContent = {
    inventory: "INVENTORY",
    crafting: "CRAFTING",
    chest: "CHEST STORAGE",
    furnace: "FURNACE",
    trade: "VILLAGER TRADING"
  }[panelType];

  $("panelDescription").textContent = {
    inventory: "Select an item for your hotbar.",
    crafting: "Make items using available materials.",
    chest: "Store and retrieve items.",
    furnace: "Cook raw meat with wood or coal.",
    trade: "Exchange emeralds for goods."
  }[panelType];

  if (panelType === "inventory") {
    for (const [id, count] of Object.entries(inventory)) {
      if (count <= 0 || !ITEMS[id]) continue;

      row(
        `${ITEMS[id][1]} ${ITEMS[id][0]}`,
        `Quantity: ${count}`,
        [[
          "SELECT",
          () => {
            if (hotbar.includes(id)) {
              selected = hotbar.indexOf(id);
            } else {
              hotbar[selected] = id;
            }

            closePanel();
          }
        ]]
      );
    }
  }

  if (panelType === "crafting") {
    for (const [id, count, materials] of RECIPES) {
      const possible = Object.entries(materials)
        .every(([item, n]) => {
          return (inventory[item] || 0) >= n;
        });

      const requirement = Object.entries(materials)
        .map(([item, n]) => {
          return `${n} ${ITEMS[item][0]}`;
        })
        .join(" + ");

      row(
        `${ITEMS[id][1]} ${count} ${ITEMS[id][0]}`,
        requirement,
        [[
          "CRAFT",
          () => {
            if (!Object.entries(materials).every(
              ([item, n]) => {
                return (inventory[item] || 0) >= n;
              }
            )) return;

            for (const [item, n] of Object.entries(materials)) {
              inventory[item] -= n;
            }

            addItem(id, count);
            drawPanel();
            notify(`Crafted ${ITEMS[id][0]}`);
          },
          !possible
        ]]
      );
    }
  }

  if (panelType === "chest") {
    chestData[currentChest] ||= {};

    const contents = chestData[currentChest];

    for (const [id, count] of Object.entries(inventory)) {
      if (count <= 0 || !ITEMS[id]) continue;

      row(
        `${ITEMS[id][0]} — Inventory`,
        `Available: ${count}`,
        [[
          "STORE 1",
          () => {
            removeItem(id);
            contents[id] = (contents[id] || 0) + 1;
            drawPanel();
          }
        ]]
      );
    }

    for (const [id, count] of Object.entries(contents)) {
      if (count <= 0 || !ITEMS[id]) continue;

      row(
        `${ITEMS[id][0]} — Chest`,
        `Stored: ${count}`,
        [[
          "TAKE 1",
          () => {
            contents[id]--;
            addItem(id);
            drawPanel();
          }
        ]]
      );
    }
  }

  if (panelType === "furnace") {
    const possible =
      (inventory.raw_meat || 0) > 0 &&
      ((inventory.coal || 0) > 0 ||
       (inventory.wood || 0) > 0);

    row(
      "🍖 Cook Raw Meat",
      "Uses one raw meat and one fuel item",
      [[
        "COOK",
        () => {
          if (
            !(inventory.raw_meat > 0) ||
            !(
              inventory.coal > 0 ||
              inventory.wood > 0
            )
          ) return;

          const fuel = inventory.coal > 0
            ? "coal"
            : "wood";

          inventory[fuel]--;
          inventory.raw_meat--;
          addItem("cooked_meat");

          drawPanel();
        },
        !possible
      ]]
    );
  }

  if (panelType === "trade") {
    const trades = [
      ["wheat", 5, "emerald", 1],
      ["emerald", 1, "bread", 1],
      ["emerald", 2, "iron", 1]
    ];

    // Bread is represented as cooked food
    // in this simplified game.
    for (const [cost, count, reward, amount] of trades) {
      const actualReward = reward === "bread"
        ? "cooked_meat"
        : reward;

      row(
        `${ITEMS[actualReward][1]} ${ITEMS[actualReward][0]}`,
        `Cost: ${count} ${ITEMS[cost][0]}`,
        [[
          "TRADE",
          () => {
            if (!removeItem(cost, count)) return;

            addItem(actualReward, amount);
            drawPanel();
          },
          (inventory[cost] || 0) < count
        ]]
      );
    }
  }
}

// ---------------------------------------
// POINTER LOCK AND KEYS
// ---------------------------------------

$("play").onclick = () => {
  panelType = null;
  $("panel").hidden = true;

  renderer.domElement.requestPointerLock()
    .catch(() => {
      notify("Click PLAY to resume.");
    });
};

document.addEventListener(
  "pointerlockchange",
  () => {
    playing =
      document.pointerLockElement === renderer.domElement;

    $("menu").hidden = playing || !!panelType;
    $("hud").hidden = !playing;

    if (!playing) {
      for (const code of Object.keys(keys)) {
        keys[code] = false;
      }
    }
  }
);

document.addEventListener("mousemove", e => {
  if (!playing) return;

  player.yaw -= e.movementX * .002;
  player.pitch = THREE.MathUtils.clamp(
    player.pitch - e.movementY * .002,
    -1.45,
    1.45
  );
});

document.addEventListener("keydown", e => {
  if ([
    "Space",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
  ].includes(e.code)) {
    e.preventDefault();
  }

  if (panelType && e.code === "Escape") {
    closePanel();
    return;
  }

  keys[e.code] = true;

  if (!playing || e.repeat) return;

  if (/^Digit[1-9]$/.test(e.code)) {
    selected = Number(e.code.slice(-1)) - 1;
  }

  if (e.code === "KeyE") {
    openPanel("inventory");
  }

  if (e.code === "KeyC") {
    openPanel("crafting");
  }

  if (e.code === "KeyP") {
    saveGame();
  }

  if (e.code === "KeyF") {
    flying = !flying;
    player.velocityY = 0;
    notify(flying ? "Flying enabled" : "Flying disabled");
  }

  if (e.code === "KeyG") {
    creative = !creative;
    notify(creative ? "Creative mode" : "Survival mode");
  }

  if (e.code === "KeyV") {
    camera.position.set(
      62,
      terrainHeight(62, 34) + 2.3,
      34
    );

    streamWorld();
    notify("Welcome to the village!");
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

// ---------------------------------------
// BLOCK TARGETING
// ---------------------------------------

const raycaster = new THREE.Raycaster();
const crosshair = new THREE.Vector2();

function getTarget(distance = 6) {
  raycaster.setFromCamera(crosshair, camera);
  raycaster.far = distance;

  const targets = [
    ...chunks.values(),
    ...villagers
  ];

  const hits = raycaster.intersectObjects(
    targets,
    true
  );

  if (!hits.length) return null;

  let object = hits[0].object;

  while (
    object.parent &&
    !object.userData.terrain &&
    !object.userData.villager
  ) {
    object = object.parent;
  }

  return {
    hit: hits[0],
    object
  };
}

function targetPosition(hit, inside) {
  const normal = hit.face.normal.clone()
    .transformDirection(hit.object.matrixWorld);

  const p = hit.point.clone().addScaledVector(
    normal,
    inside ? -.02 : .02
  );

  return {
    x: Math.round(p.x),
    y: Math.round(p.y),
    z: Math.round(p.z)
  };
}

let mineCooldown = 0;

// ---------------------------------------
// WATER BUCKETS
// ---------------------------------------

function tryCollectWater() {
  if ((inventory.bucket || 0) <= 0) {
    notify("You need an empty bucket.");
    return false;
  }

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  // Check water along the player's line of sight.
  for (let d = .6; d <= 5; d += .2) {
    const x = Math.round(
      camera.position.x + direction.x * d
    );
    const y = Math.round(
      camera.position.y + direction.y * d
    );
    const z = Math.round(
      camera.position.z + direction.z * d
    );

    if (!waterAt(x, y, z)) continue;

    // Removing naturally generated water creates
    // an edited empty location at that position.
    edits.set(itemKey(x, y, z), null);

    inventory.bucket--;
    addItem("water_bucket");

    rebuild(
      Math.floor(x / CHUNK),
      Math.floor(z / CHUNK)
    );

    notify("Water collected!");
    return true;
  }

  notify("Point at water to fill the bucket.");
  return false;
}

function tryPlaceWater(position) {
  if ((inventory.water_bucket || 0) <= 0) {
    notify("You need a filled water bucket.");
    return false;
  }

  if (
    getBlock(
      position.x,
      position.y,
      position.z
    )
  ) {
    return false;
  }

  const successful = setBlock(
    position.x,
    position.y,
    position.z,
    "water"
  );

  if (!successful) return false;

  inventory.water_bucket--;
  addItem("bucket");

  notify("Water placed!");
  return true;
}

// ---------------------------------------
// CLICK ACTIONS
// ---------------------------------------

document.addEventListener("mousedown", e => {
  if (
    !playing ||
    mineCooldown > 0 ||
    ![0, 2].includes(e.button)
  ) {
    return;
  }

  const result = getTarget();

  // Right-click a water source with a bucket.
  if (
    e.button === 2 &&
    hotbar[selected] === "bucket" &&
    tryCollectWater()
  ) {
    mineCooldown = .12;
    return;
  }

  if (!result) return;

  const {hit, object} = result;

  if (object.userData.villager) {
    if (e.button === 2) {
      openPanel("trade");
    }
    return;
  }

  if (!object.userData.terrain) return;

  const p = targetPosition(hit, true);
  const id = getBlock(p.x, p.y, p.z);

  if (e.button === 0) {
    if (!id || id === "bedrock") return;

    const k = itemKey(p.x, p.y, p.z);

    if (
      id === "chest" &&
      chestData[k] &&
      Object.values(chestData[k]).some(
        amount => amount > 0
      )
    ) {
      notify("Empty the chest before mining it.");
      return;
    }

    if (setBlock(p.x, p.y, p.z, null)) {
      addItem(id);
      mineCooldown = .12;
      notify(`Mined ${ITEMS[id]?.[0] || id}`);
    }

    return;
  }

  if (id === "chest") {
    openPanel("chest", itemKey(p.x, p.y, p.z));
    return;
  }

  if (id === "furnace") {
    openPanel("furnace");
    return;
  }

  if (id === "bed") {
    health = Math.min(100, health + 20);
    notify("Rested in bed");
    return;
  }

  if (id === "wheat_crop") {
    setBlock(p.x, p.y, p.z, "farmland");

    addItem("wheat", 2);
    addItem("seeds", 2);

    notify("Wheat harvested");
    return;
  }

  if (
    id === "farmland" &&
    (inventory.seeds || 0) > 0
  ) {
    inventory.seeds--;

    setBlock(
      p.x,
      p.y,
      p.z,
      "wheat_crop"
    );

    notify("Seeds planted");
    return;
  }

  const q = targetPosition(hit, false);
  const item = hotbar[selected];

  if (item === "water_bucket") {
    tryPlaceWater(q);
    return;
  }

  if (!PLACEABLE.has(item)) {
    return;
  }

  if (
    !creative &&
    (inventory[item] || 0) <= 0
  ) {
    notify("Not enough items.");
    return;
  }

  if (getBlock(q.x, q.y, q.z)) return;

  const insidePlayer =
    Math.abs(q.x - camera.position.x) < .8 &&
    Math.abs(q.z - camera.position.z) < .8 &&
    q.y + .5 > camera.position.y - 1.5 &&
    q.y - .5 < camera.position.y + .1;

  if (insidePlayer) return;

  if (setBlock(q.x, q.y, q.z, item)) {
    if (!creative) inventory[item]--;
    mineCooldown = .1;
    notify(`${ITEMS[item][0]} placed`);
  }
});

// ---------------------------------------
// SAVE WORLD
// ---------------------------------------

function saveGame(silent = false) {
  try {
    localStorage.setItem(
      SAVE,
      JSON.stringify({
        edits: [...edits],
        chests: chestData,
        inventory,
        position: camera.position.toArray(),
        health,
        hunger,
        level
      })
    );

    if (!silent) notify("World saved");
  } catch {
    notify("Cannot save: storage limit reached");
  }
}

let resetting = false;

$("reset").onclick = () => {
  if (confirm("Delete this saved BLOCKVERSE world?")) {
    resetting = true;
    localStorage.removeItem(SAVE);
    location.reload();
  }
};

window.addEventListener("beforeunload", () => {
  if (!resetting) saveGame(true);
});

// ---------------------------------------
// HOTBAR
// ---------------------------------------

const bar = $("hotbar");

for (let i = 0; i < 9; i++) {
  const slot = document.createElement("div");
  slot.className = "slot";

  const icon = document.createElement("span");
  icon.textContent = ITEMS[hotbar[i]][1];

  const number = document.createElement("small");
  number.textContent = i + 1;

  slot.append(icon, number);
  bar.append(slot);
}

// ---------------------------------------
// MAIN LOOP
// ---------------------------------------

const clock = new THREE.Clock();

let saveTimer = 0;
let hungerTimer = 0;
let damageTimer = 0;

streamWorld();

function update() {
  requestAnimationFrame(update);

  const dt = Math.min(
    .04,
    clock.getDelta()
  );

  if (playing) {
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

    movement.set(0, 0, 0);

    if (keys.KeyW) movement.add(forward);
    if (keys.KeyS) movement.sub(forward);
    if (keys.KeyD) movement.add(right);
    if (keys.KeyA) movement.sub(right);

    const speed = keys.ShiftLeft ? 12 : 7.5;

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(speed * dt);

      moveAxis("x", movement.x);
      moveAxis("z", movement.z);
    }

    if (flying || creative) {
      if (keys.Space) {
        moveAxis("y", speed * dt);
      }

      if (keys.ControlLeft) {
        moveAxis("y", -speed * dt);
      }

      player.velocityY = 0;
    } else {
      if (keys.Space && player.grounded) {
        player.velocityY = 8.5;
        player.grounded = false;
      }

      player.velocityY = Math.max(
        -24,
        player.velocityY - 24 * dt
      );

      const moved = moveAxis(
        "y",
        player.velocityY * dt
      );

      if (!moved) {
        player.grounded = player.velocityY <= 0;
        player.velocityY = 0;
      } else {
        const below = camera.position.clone();
        below.y -= .07;

        player.grounded = collision(below);
      }
    }

    // Respawn.
    if (
      camera.position.y < LOWEST_Y - 8 ||
      health <= 0
    ) {
      camera.position.set(
        0,
        terrainHeight(0, 4) + 2.3,
        4
      );

      player.velocityY = 0;
      health = 100;
      hunger = Math.max(hunger, 50);

      notify("Respawned at spawn");
    }

    const px = Math.round(camera.position.x);
    const py = Math.round(camera.position.y - 1.2);
    const pz = Math.round(camera.position.z);

    if (
      getBlock(px, py, pz) === "lava" &&
      !creative
    ) {
      damageTimer += dt;

      if (damageTimer >= 1) {
        health = Math.max(0, health - 10);
        damageTimer = 0;
        notify("Lava damage!");
      }
    } else {
      damageTimer = 0;
    }

    streamWorld();

    // Update villagers at a reduced frequency.
    updateVillagers(dt);

    mineCooldown = Math.max(
      0,
      mineCooldown - dt
    );

    hungerTimer += dt;

    if (hungerTimer >= 6) {
      hungerTimer = 0;

      if (!creative) {
        hunger = Math.max(0, hunger - 1);

        if (hunger === 0) {
          health = Math.max(0, health - 1);
        }
      }
    }

    saveTimer += dt;

    if (saveTimer >= 45) {
      saveTimer = 0;
      saveGame(true);
    }

    $("coordinates").textContent =
      `XYZ ${Math.floor(camera.position.x)} ` +
      `${Math.floor(camera.position.y)} ` +
      `${Math.floor(camera.position.z)}`;

    $("health").textContent = Math.ceil(health);
    $("hunger").textContent = Math.ceil(hunger);
    $("level").textContent = level;

    $("gamemode").textContent =
      creative ? "CREATIVE" : "SURVIVAL";

    const item = hotbar[selected];

    $("itemName").textContent =
      `${ITEMS[item][0]} ` +
      `(${inventory[item] || 0})`;

    [...bar.children].forEach((slot, i) => {
      slot.classList.toggle(
        "selected",
        i === selected
      );

      slot.querySelector("span").textContent =
        ITEMS[hotbar[i]][1];
    });
  }

  renderer.render(scene, camera);
}

update();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
});
