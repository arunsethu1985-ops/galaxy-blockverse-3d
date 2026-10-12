
import * as THREE from 'https://esm.sh/three@0.180.0';

// GALAXY BLOCKVERSE FAST
// Streamlined original voxel survival prototype.

const $ = id => document.getElementById(id);
const KEY = 'galaxy-blockverse-fast-v1';
const CS = 12, VIEW = 1, FLOOR = -48;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x89c8ef);
scene.fog = new THREE.Fog(0x89c8ef, 24, 68);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, .05, 110
);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance'
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(
  0xe3efff, 0x52673e, 2
));

const sun = new THREE.DirectionalLight(0xffedc5, 1.35);
sun.position.set(30, 50, 20);
scene.add(sun);

// ITEMS
const ITEMS = {
  grass: ['Grass', '🟩'],
  dirt: ['Dirt', '🟫'],
  stone: ['Stone', '🪨'],
  wood: ['Wood', '🪵'],
  leaves: ['Leaves', '🍃'],
  sand: ['Sand', '🏖️'],
  planks: ['Planks', '🪵'],
  fence: ['Fence', '🚧'],
  glass: ['Glass', '🪟'],
  chest: ['Chest', '📦'],
  furnace: ['Furnace', '🔥'],
  coal: ['Coal', '⚫'],
  iron: ['Iron', '🔩'],
  gold: ['Gold', '🟨'],
  diamond: ['Diamond', '💎'],
  copper: ['Copper', '🟠'],
  lava: ['Lava', '🌋'],
  bedrock: ['Bedrock', '⬛'],
  farmland: ['Farmland', '🟤'],
  crops: ['Crops', '🌾'],
  wheat: ['Wheat', '🌾'],
  seeds: ['Seeds', '🌱'],
  raw_meat: ['Raw Meat', '🥩'],
  cooked_meat: ['Cooked Meat', '🍖'],
  wood_sword: ['Wood Sword', '🗡️'],
  stone_sword: ['Stone Sword', '⚔️'],
  iron_sword: ['Iron Sword', '⚔️'],
  diamond_sword: ['Diamond Sword', '💎'],
  arrows: ['Arrows', '🏹'],
  bow: ['Bow', '🏹']
};

const BLOCKS = new Set([
  'grass', 'dirt', 'stone', 'wood', 'leaves',
  'sand', 'planks', 'fence', 'glass', 'chest',
  'furnace', 'coal', 'iron', 'gold', 'diamond',
  'copper', 'lava', 'bedrock', 'farmland', 'crops'
]);

const DAMAGES = {
  wood_sword: 5,
  stone_sword: 7,
  iron_sword: 9,
  diamond_sword: 12,
  bow: 7
};

const RECIPES = [
  ['planks', 4, {wood: 1}],
  ['fence', 4, {planks: 4}],
  ['chest', 1, {planks: 8}],
  ['furnace', 1, {stone: 8}],
  ['glass', 4, {sand: 4, coal: 1}],
  ['wood_sword', 1, {planks: 2, wood: 1}],
  ['stone_sword', 1, {stone: 2, wood: 1}],
  ['iron_sword', 1, {iron: 2, wood: 1}],
  ['diamond_sword', 1, {diamond: 2, wood: 1}],
  ['bow', 1, {wood: 3, leaves: 2}],
  ['arrows', 8, {wood: 1, stone: 1}],
  ['farmland', 2, {dirt: 2}],
  ['crops', 2, {seeds: 2}]
];

// SAVE AND INVENTORY
let saved = {};
try {
  saved = JSON.parse(localStorage.getItem(KEY) || '{}');
} catch {}

const edits = new Map(
  Array.isArray(saved.edits) ? saved.edits : []
);

const chests = saved.chests || {};

const inventory = {
  grass: 30,
  dirt: 20,
  stone: 15,
  wood: 15,
  leaves: 10,
  sand: 10,
  planks: 10,
  fence: 10,
  glass: 5,
  seeds: 6,
  cooked_meat: 4,
  raw_meat: 0
};

for (const [k, v] of Object.entries(saved.inventory || {})) {
  if (ITEMS[k] && Number.isInteger(v) && v >= 0) {
    inventory[k] = v;
  }
}

const hotItems = [
  'grass', 'dirt', 'stone', 'wood', 'leaves',
  'sand', 'planks', 'fence', 'glass'
];

let selected = 0;
let equipped = saved.equipped || 'fists';
let health = saved.health ?? 100;
let hunger = saved.hunger ?? 100;
let level = saved.level ?? 1;
let xp = saved.xp ?? 0;
let worldTime = saved.worldTime ?? 0;

// FAST TERRAIN
const hash = (x, z, s = 0) => {
  const v = Math.sin(
    x * 127.1 + z * 311.7 + s * 74.7
  ) * 43758.5453;
  return v - Math.floor(v);
};

function height(x, z) {
  const n =
    Math.sin(x * .018) +
    Math.cos(z * .016) +
    Math.sin((x - z) * .011);

  let h = Math.floor(
    n * 5 +
    Math.sin(x * .12) * 2 +
    Math.cos(z * .1) * 2
  );

  if (Math.hypot(x, z - 3) < 15) {
    h = Math.max(h, 3);
  }
  return h;
}

function treeAt(x, z) {
  return x % 8 === 0 &&
    z % 8 === 0 &&
    height(x, z) > 2 &&
    hash(x / 8, z / 8) > .55 &&
    Math.hypot(x, z - 3) > 8;
}

function natural(x, y, z) {
  if (y <= FLOOR) return 'bedrock';

  const h = height(x, z);

  if (y > h) {
    for (
      let tx = Math.floor((x - 2) / 8) * 8;
      tx <= x + 2;
      tx += 8
    ) {
      for (
        let tz = Math.floor((z - 2) / 8) * 8;
        tz <= z + 2;
        tz += 8
      ) {
        if (!treeAt(tx, tz)) continue;

        const th = height(tx, tz);
        const dx = Math.abs(x - tx);
        const dz = Math.abs(z - tz);

        if (!dx && !dz && y <= th + 4) {
          return 'wood';
        }

        if (
          dx <= 2 && dz <= 2 &&
          dx + dz <= 3 &&
          y >= th + 3 &&
          y <= th + 5
        ) return 'leaves';
      }
    }
    return null;
  }

  if (y === h) return h <= 0 ? 'sand' : 'grass';
  if (y >= h - 3) return 'dirt';

  const c =
    Math.sin(x * .17 + y * .14) +
    Math.cos(z * .13 - y * .15) +
    Math.sin((x + z + y) * .1);

  if (y < -8 && c > 2.43) {
    return y < -32 && hash(x + y, z) > .8
      ? 'lava' : null;
  }

  const ore = hash(x * 7 + y * 13, z * 11 + y * 17);

  if (y < -30 && ore > .989) return 'diamond';
  if (y < -21 && ore > .98) return 'gold';
  if (y < -12 && ore > .974) return 'iron';
  if (y < -6 && ore > .972) return 'copper';
  if (y < -5 && ore > .951) return 'coal';

  return 'stone';
}

const key = (x, y, z) => `${x},${y},${z}`;

function block(x, y, z) {
  const k = key(x, y, z);
  return edits.has(k) ? edits.get(k) : natural(x, y, z);
}

// PIXELATED TEXTURE ATLAS
const tileNames = [
  'grassTop', 'grassSide', 'dirt', 'stone',
  'wood', 'woodTop', 'leaves', 'sand',
  'planks', 'fence', 'glass', 'chest',
  'furnace', 'coal', 'iron', 'gold',
  'diamond', 'copper', 'lava', 'bedrock',
  'farmland', 'crops'
];

const colors = {
  grassTop: 0x5ab33d,
  grassSide: 0x855b39,
  dirt: 0x805638,
  stone: 0x8a8d91,
  wood: 0x88603d,
  woodTop: 0xb58d59,
  leaves: 0x348c41,
  sand: 0xe8d193,
  planks: 0xc39258,
  fence: 0x9e7048,
  glass: 0x95d9e9,
  chest: 0x9b703e,
  furnace: 0x66696b,
  coal: 0x888a8e,
  iron: 0x898b8d,
  gold: 0x898b8d,
  diamond: 0x898b8d,
  copper: 0x898b8d,
  lava: 0xeb671a,
  bedrock: 0x35363c,
  farmland: 0x6d4930,
  crops: 0x7ab740
};

const atlas = document.createElement('canvas');
atlas.width = 128;
atlas.height = Math.ceil(tileNames.length / 8) * 16;
const pen = atlas.getContext('2d');

for (let t = 0; t < tileNames.length; t++) {
  const name = tileNames[t];
  const im = pen.createImageData(16, 16);

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let base = colors[name];
      let n = (hash(x, y, t) - .5) * 55;

      if (name === 'grassSide' && y < 3) {
        base = 0x60b83b;
      }

      if (name === 'wood' && x % 4 === 0) n -= 32;

      if (
        name === 'woodTop' &&
        Math.floor(Math.max(
          Math.abs(x - 7.5), Math.abs(y - 7.5)
        )) % 3 === 0
      ) n -= 35;

      if (name === 'planks' && y % 5 === 0) n -= 38;
      if (name === 'farmland' && x % 4 === 0) n -= 36;

      if (
        name === 'glass' &&
        (x === 0 || x === 15 || y === 0 || y === 15)
      ) n += 65;

      if (
        name === 'chest' &&
        (y === 3 || y === 12 || x === 1 || x === 14)
      ) n -= 55;

      if (
        name === 'furnace' &&
        x > 3 && x < 12 && y > 5 && y < 13
      ) n -= 80;

      if (name === 'crops' && x % 4 === 2) n += 30;

      if (name === 'lava') {
        n += hash(
          Math.floor(x / 3),
          Math.floor(y / 3), t
        ) > .5 ? 50 : -40;
      }

      const ore = {
        coal: 0x222528,
        iron: 0xd5a07e,
        gold: 0xf2c63a,
        diamond: 0x36e3df,
        copper: 0xd07854
      };

      if (
        ore[name] &&
        hash(Math.floor(x / 3), Math.floor(y / 3), t) > .7
      ) {
        base = ore[name];
        n = (hash(x, y, 2) - .5) * 40;
      }

      const i = (y * 16 + x) * 4;
      im.data[i] = Math.max(
        0, Math.min(255, ((base >> 16) & 255) + n)
      );
      im.data[i + 1] = Math.max(
        0, Math.min(255, ((base >> 8) & 255) + n)
      );
      im.data[i + 2] = Math.max(
        0, Math.min(255, (base & 255) + n)
      );
      im.data[i + 3] = 255;
    }
  }

  pen.putImageData(
    im, (t % 8) * 16, Math.floor(t / 8) * 16
  );
}

const texture = new THREE.CanvasTexture(atlas);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.generateMipmaps = false;
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshLambertMaterial({
  map: texture,
  vertexColors: true,
  side: THREE.DoubleSide
});

const faces = [
  {
    d: [1, 0, 0], shade: .83,
    p: [
      [.5, -.5, -.5], [.5, .5, -.5],
      [.5, .5, .5], [.5, -.5, .5]
    ]
  },
  {
    d: [-1, 0, 0], shade: .79,
    p: [
      [-.5, -.5, .5], [-.5, .5, .5],
      [-.5, .5, -.5], [-.5, -.5, -.5]
    ]
  },
  {
    d: [0, 1, 0], shade: 1,
    p: [
      [-.5, .5, -.5], [-.5, .5, .5],
      [.5, .5, .5], [.5, .5, -.5]
    ]
  },
  {
    d: [0, -1, 0], shade: .65,
    p: [
      [-.5, -.5, .5], [-.5, -.5, -.5],
      [.5, -.5, -.5], [.5, -.5, .5]
    ]
  },
  {
    d: [0, 0, 1], shade: .92,
    p: [
      [.5, -.5, .5], [.5, .5, .5],
      [-.5, .5, .5], [-.5, -.5, .5]
    ]
  },
  {
    d: [0, 0, -1], shade: .78,
    p: [
      [-.5, -.5, -.5], [-.5, .5, -.5],
      [.5, .5, -.5], [.5, -.5, -.5]
    ]
  }
];

function tile(id, face) {
  const n = id === 'grass'
    ? face === 2 ? 'grassTop'
      : face === 3 ? 'dirt' : 'grassSide'
    : id === 'wood' && (face === 2 || face === 3)
      ? 'woodTop' : id;

  return Math.max(0, tileNames.indexOf(n));
}

function faceUV(id, face) {
  const t = tile(id, face);
  const x = (t % 8) * 16;
  const y = Math.floor(t / 8) * 16;
  const w = atlas.width, h = atlas.height;

  return [
    [(x + .35) / w, 1 - (y + 15.65) / h],
    [(x + .35) / w, 1 - (y + .35) / h],
    [(x + 15.65) / w, 1 - (y + .35) / h],
    [(x + 15.65) / w, 1 - (y + 15.65) / h]
  ];
}

// FAST CHUNK RENDERING
const chunks = new Map();
const waters = new Map();

const waterMaterial = new THREE.MeshPhongMaterial({
  color: 0x258ac5,
  transparent: true,
  opacity: .65,
  side: THREE.DoubleSide,
  depthWrite: false
});

function createChunk(cx, cz) {
  const pos = [], nor = [], uv = [], col = [], idx = [];

  for (let x = cx * CS; x < (cx + 1) * CS; x++) {
    for (let z = cz * CS; z < (cz + 1) * CS; z++) {
      const top = height(x, z) + 6;

      for (let y = FLOOR + 1; y <= top; y++) {
        const id = block(x, y, z);
        if (!id) continue;

        for (let f = 0; f < 6; f++) {
          const face = faces[f];
          const [dx, dy, dz] = face.d;

          // Skip hidden faces entirely.
          if (block(x + dx, y + dy, z + dz)) continue;

          const start = pos.length / 3;
          const tex = faceUV(id, f);
          const shade = face.shade *
            (.96 + hash(x, z, y) * .07);

          for (let i = 0; i < 4; i++) {
            const q = face.p[i];

            pos.push(x + q[0], y + q[1], z + q[2]);
            nor.push(...face.d);
            uv.push(...tex[i]);
            col.push(shade, shade, shade);
          }

          idx.push(
            start, start + 1, start + 2,
            start, start + 2, start + 3
          );
        }
      }
    }
  }

  const g = new THREE.BufferGeometry();

  g.setAttribute('position',
    new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal',
    new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv',
    new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color',
    new THREE.Float32BufferAttribute(col, 3));

  g.setIndex(idx);
  g.computeBoundingSphere();

  const mesh = new THREE.Mesh(g, material);
  mesh.userData.terrain = true;
  scene.add(mesh);
  return mesh;
}

function createWater(cx, cz) {
  const pos = [], idx = [];

  for (let x = cx * CS; x < (cx + 1) * CS; x++) {
    for (let z = cz * CS; z < (cz + 1) * CS; z++) {
      if (height(x, z) > 0) continue;

      const n = pos.length / 3;
      pos.push(
        x - .5, .55, z - .5,
        x + .5, .55, z - .5,
        x + .5, .55, z + .5,
        x - .5, .55, z + .5
      );
      idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
    }
  }

  if (!idx.length) return;

  const g = new THREE.BufferGeometry();
  g.setAttribute('position',
    new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();

  const mesh = new THREE.Mesh(g, waterMaterial);
  scene.add(mesh);
  waters.set(`${cx},${cz}`, mesh);
}

function removeChunk(k) {
  const m = chunks.get(k);

  if (m) {
    scene.remove(m);
    m.geometry.dispose();
    chunks.delete(k);
  }

  const w = waters.get(k);

  if (w) {
    scene.remove(w);
    w.geometry.dispose();
    waters.delete(k);
  }
}

function regenerate(cx, cz) {
  const k = `${cx},${cz}`;
  if (!chunks.has(k)) return;

  removeChunk(k);
  chunks.set(k, createChunk(cx, cz));
  createWater(cx, cz);
}

function change(x, y, z, id) {
  if (y <= FLOOR || y > 60) return false;

  edits.set(key(x, y, z), id);

  const cx = Math.floor(x / CS);
  const cz = Math.floor(z / CS);

  // Only update the changed chunk.
  regenerate(cx, cz);

  // Only rebuild neighbors if a chunk border changed.
  if (x % CS === 0) regenerate(cx - 1, cz);
  if (x % CS === CS - 1) regenerate(cx + 1, cz);
  if (z % CS === 0) regenerate(cx, cz - 1);
  if (z % CS === CS - 1) regenerate(cx, cz + 1);

  return true;
}

// PLAYER
const player = {
  yaw: 0, pitch: 0, vy: 0,
  ground: false, fly: false, creative: false
};

camera.position.set(0, height(0, 3) + 2.3, 3);

if (
  Array.isArray(saved.position) &&
  saved.position.length === 3 &&
  saved.position.every(Number.isFinite)
) camera.position.fromArray(saved.position);

const keys = {};
const move = new THREE.Vector3();
let currentChunk = '';

function stream() {
  const cx = Math.floor(camera.position.x / CS);
  const cz = Math.floor(camera.position.z / CS);
  const center = `${cx},${cz}`;

  if (center === currentChunk) return;
  currentChunk = center;

  const required = new Set();

  for (let x = cx - VIEW; x <= cx + VIEW; x++) {
    for (let z = cz - VIEW; z <= cz + VIEW; z++) {
      required.add(`${x},${z}`);
    }
  }

  for (const k of [...chunks.keys()]) {
    if (!required.has(k)) removeChunk(k);
  }

  for (const k of required) {
    if (chunks.has(k)) continue;

    const [x, z] = k.split(',').map(Number);
    chunks.set(k, createChunk(x, z));
    createWater(x, z);
  }

  spawnNearby(cx, cz);
}

function isSolid(x, y, z) {
  const b = block(
    Math.round(x),
    Math.round(y),
    Math.round(z)
  );

  return !!b && b !== 'leaves' && b !== 'lava';
}

function collision(p) {
  for (const x of [-.27, .27]) {
    for (const z of [-.27, .27]) {
      for (const y of [-1.45, -.85, -.1]) {
        if (isSolid(
          p.x + x, p.y + y, p.z + z
        )) return true;
      }
    }
  }
  return false;
}

function shift(axis, amount) {
  const p = camera.position.clone();
  p[axis] += amount;

  if (!collision(p)) {
    camera.position[axis] = p[axis];
    return true;
  }
  return false;
}

// LIGHTWEIGHT ANIMALS AND MONSTERS
const mobs = [];
const created = new Set();

const COLORS = {
  cow: 0xe8e4de,
  pig: 0xf4a6b6,
  sheep: 0xeeeeec,
  chicken: 0xf6f4d9,
  fish: 0xe9a133,
  zombie: 0x6ca46e,
  skeleton: 0xdfdcd4
};

function cube(group, w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({color})
  );
  m.position.set(x, y, z);
  group.add(m);
}

function spawn(kind, x, z) {
  if (mobs.length >= 24) return;

  const g = new THREE.Group();
  const color = COLORS[kind];
  const fish = kind === 'fish';
  const enemy = kind === 'zombie' || kind === 'skeleton';

  cube(g, .75, .55, fish ? .65 : 1.05,
    color, 0, .75, 0);

  cube(g, .45, .46, .43,
    color, 0, .92, -.62);

  // Eyes
  for (const a of [-.16, .16]) {
    cube(g, .08, .09, .06,
      enemy ? 0xff3333 : 0x111111,
      a, 1.05, -.86);
  }

  if (!fish) {
    for (const a of [-.25, .25]) {
      for (const b of [-.35, .35]) {
        cube(g, .15, .45, .15,
          color, a, .25, b);
      }
    }
  }

  if (kind === 'pig' || kind === 'cow') {
    cube(g, .24, .15, .12,
      0xd89090, 0, .84, -.9);
  }

  if (kind === 'chicken') {
    cube(g, .2, .11, .18,
      0xffbe3e, 0, .83, -.9);
  }

  g.position.set(
    x,
    fish ? 0 : height(Math.round(x), Math.round(z)) + .5,
    z
  );

  g.userData.mob = {
    kind, enemy,
    hp: enemy ? 22 : 15,
    dir: hash(x, z) * 6.28,
    t: 0, attack: 0
  };

  scene.add(g);
  mobs.push(g);
}

function spawnNearby(cx, cz) {
  for (let a = cx - 1; a <= cx + 1; a++) {
    for (let b = cz - 1; b <= cz + 1; b++) {
      const k = `${a},${b}`;
      if (created.has(k)) continue;

      created.add(k);

      for (let i = 0; i < 2; i++) {
        const x = a * CS +
          Math.floor(hash(a, b, i) * CS);
        const z = b * CS +
          Math.floor(hash(b, a, i + 9) * CS);

        const kinds = height(x, z) <= 0
          ? ['fish']
          : ['cow', 'pig', 'sheep', 'chicken',
             'zombie', 'skeleton'];

        const kind = kinds[
          Math.floor(hash(x, z, 8) * kinds.length)
        ];

        spawn(kind, x, z);
      }
    }
  }

  for (let i = mobs.length - 1; i >= 0; i--) {
    if (
      mobs[i].position.distanceTo(camera.position) > 65
    ) {
      scene.remove(mobs[i]);
      mobs.splice(i, 1);
    }
  }
}

function mobsTick(dt, t) {
  const night =
    worldTime % 240 > 135 &&
    worldTime % 240 < 220;

  for (const g of mobs) {
    const m = g.userData.mob;
    g.visible = !m.enemy || night;

    if (!g.visible) continue;

    m.t -= dt;
    m.attack -= dt;

    if (m.t <= 0) {
      m.t = 2 + hash(t, g.position.x) * 2;
      m.dir += (Math.random() - .5) * 2;
    }

    const dx = camera.position.x - g.position.x;
    const dz = camera.position.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    let speed = .45;

    if (m.enemy && dist < 9) {
      m.dir = Math.atan2(-dx, -dz);
      speed = 1.5;

      if (
        dist < 1.5 &&
        m.attack <= 0 &&
        !player.creative
      ) {
        health = Math.max(0, health - 6);
        m.attack = 1.5;
        notice('Monster attack!');
      }
    }

    const x = g.position.x -
      Math.sin(m.dir) * dt * speed;
    const z = g.position.z -
      Math.cos(m.dir) * dt * speed;
    const n = height(Math.round(x), Math.round(z));

    if (m.kind === 'fish') {
      if (n <= 0) g.position.set(x, 0, z);
      else m.dir += Math.PI;
    } else if (
      Math.abs(
        n - height(
          Math.round(g.position.x),
          Math.round(g.position.z)
        )
      ) <= 1 &&
      !['fence', 'wood', 'planks', 'glass', 'chest']
        .includes(block(Math.round(x), n + 1, Math.round(z)))
    ) {
      g.position.set(x, n + .5, z);
    } else {
      m.dir += Math.PI;
    }

    g.rotation.y = m.dir;
  }
}

// MENUS, INVENTORY AND SAVE
let playing = false;
let panel = null;
let currentChest = null;
let noticeLeft = 0;
let attackLeft = 0;

function notice(s) {
  $('notice').textContent = s;
  noticeLeft = 2;
}

function saveGame(silent = false) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      edits: [...edits],
      chests,
      inventory,
      position: camera.position.toArray(),
      equipped,
      health,
      hunger,
      level,
      xp,
      worldTime
    }));

    if (!silent) notice('World saved');
  } catch {
    notice('Save is full: browser storage limit');
  }
}

let resetting = false;

window.addEventListener('beforeunload', () => {
  if (!resetting) saveGame(true);
});

$('reset').onclick = () => {
  if (confirm('Erase the FAST version saved world?')) {
    resetting = true;
    localStorage.removeItem(KEY);
    location.reload();
  }
};

$('play').onclick = () => {
  panel = null;
  $('panel').hidden = true;
  renderer.domElement.requestPointerLock();
};

function showPanel(type, chest = null) {
  panel = type;
  currentChest = chest;
  $('panel').hidden = false;
  $('menu').hidden = true;
  document.exitPointerLock?.();
  drawPanel();
}

function closePanel() {
  panel = null;
  currentChest = null;
  $('panel').hidden = true;
  $('menu').hidden = true;

  renderer.domElement.requestPointerLock().catch(() => {
    $('menu').hidden = false;
  });
}

$('closePanel').onclick = closePanel;

document.addEventListener('pointerlockchange', () => {
  playing = document.pointerLockElement === renderer.domElement;
  $('menu').hidden = playing || !!panel;
  $('hud').hidden = !playing;

  if (!playing) {
    for (const k of Object.keys(keys)) {
      keys[k] = false;
    }
  }
});

function entry(root, name, desc, buttons) {
  const d = document.createElement('div');
  d.className = 'entry';

  const info = document.createElement('div');
  info.className = 'info';

  const title = document.createElement('strong');
  title.textContent = name;

  const sub = document.createElement('small');
  sub.textContent = desc;

  info.append(title, sub);
  d.append(info);

  for (const [label, fn, disabled] of buttons) {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = fn;
    b.disabled = !!disabled;
    d.append(b);
  }

  root.append(d);
}

function drawPanel() {
  if (!panel) return;

  const root = $('panelContent');
  root.replaceChildren();

  $('panelTitle').textContent = {
    inventory: '🎒 INVENTORY',
    craft: '🔨 CRAFTING',
    chest: '📦 CHEST',
    furnace: '🔥 FURNACE'
  }[panel];

  $('panelHelp').textContent =
    panel === 'inventory'
      ? 'Choose blocks for your hotbar or equip a weapon.'
      : panel === 'craft'
        ? 'Craft items from collected resources.'
        : panel === 'chest'
          ? 'Store items and take them back.'
          : 'Cook raw meat with wood or coal.';

  if (panel === 'inventory') {
    for (const [id, n] of Object.entries(inventory)) {
      if (!n || !ITEMS[id]) continue;

      const actions = [];

      if (BLOCKS.has(id) && id !== 'bedrock') {
        actions.push(['SELECT', () => {
          if (hotItems.includes(id)) {
            selected = hotItems.indexOf(id);
          } else {
            hotItems[selected] = id;
          }
          closePanel();
        }]);
      }

      if (DAMAGES[id]) {
        actions.push(['EQUIP', () => {
          equipped = id;
          closePanel();
        }]);
      }

      entry(
        root,
        `${ITEMS[id][1]} ${ITEMS[id][0]}`,
        `Quantity: ${n}`,
        actions
      );
    }
  }

  if (panel === 'craft') {
    for (const [id, count, cost] of RECIPES) {
      const ok = Object.entries(cost).every(
        ([k, n]) => (inventory[k] || 0) >= n
      );

      entry(
        root,
        `${ITEMS[id][1]} ${count} ${ITEMS[id][0]}`,
        Object.entries(cost)
          .map(([k, n]) => `${n} ${ITEMS[k][0]}`)
          .join(' + '),
        [[
          'CRAFT',
          () => {
            if (!Object.entries(cost).every(
              ([k, n]) => (inventory[k] || 0) >= n
            )) return;

            for (const [k, n] of Object.entries(cost)) {
              inventory[k] -= n;
            }

            inventory[id] = (inventory[id] || 0) + count;
            drawPanel();
            notice(`Crafted ${ITEMS[id][0]}`);
          },
          !ok
        ]]
      );
    }
  }

  if (panel === 'chest') {
    chests[currentChest] ||= {};
    const box = chests[currentChest];

    for (const [id, n] of Object.entries(inventory)) {
      if (n > 0 && ITEMS[id]) {
        entry(root, `${ITEMS[id][0]} (bag)`,
          `${n} available`, [[
            'STORE 1',
            () => {
              inventory[id]--;
              box[id] = (box[id] || 0) + 1;
              drawPanel();
            }
          ]]
        );
      }
    }

    for (const [id, n] of Object.entries(box)) {
      if (n > 0 && ITEMS[id]) {
        entry(root, `${ITEMS[id][0]} (chest)`,
          `${n} stored`, [[
            'TAKE 1',
            () => {
              box[id]--;
              inventory[id] = (inventory[id] || 0) + 1;
              drawPanel();
            }
          ]]
        );
      }
    }
  }

  if (panel === 'furnace') {
    const ok = inventory.raw_meat > 0 &&
      (inventory.wood > 0 || inventory.coal > 0);

    entry(
      root,
      '🍖 Cook meat',
      `Raw: ${inventory.raw_meat || 0}; ` +
      `Wood: ${inventory.wood || 0}; ` +
      `Coal: ${inventory.coal || 0}`,
      [[
        'COOK',
        () => {
          if (
            !inventory.raw_meat ||
            (inventory.wood || 0) +
            (inventory.coal || 0) === 0
          ) return;

          inventory.raw_meat--;
          inventory[inventory.coal > 0 ? 'coal' : 'wood']--;
          inventory.cooked_meat =
            (inventory.cooked_meat || 0) + 1;
          drawPanel();
        },
        !ok
      ]]
    );
  }
}

function eat() {
  if (inventory.cooked_meat > 0) {
    inventory.cooked_meat--;
    hunger = Math.min(100, hunger + 28);
    health = Math.min(100, health + 4);
    notice('Ate cooked meat');
  } else if (inventory.raw_meat > 0) {
    inventory.raw_meat--;
    hunger = Math.min(100, hunger + 8);
    notice('Ate raw meat');
  } else {
    notice('No food');
  }
}

// KEYBOARD AND MOUSE
document.addEventListener('mousemove', e => {
  if (!playing) return;

  player.yaw -= e.movementX * .0022;
  player.pitch = THREE.MathUtils.clamp(
    player.pitch - e.movementY * .0022,
    -1.48, 1.48
  );
});

document.addEventListener('keydown', e => {
  if ([
    'Space', 'ArrowUp', 'ArrowDown',
    'ArrowLeft', 'ArrowRight'
  ].includes(e.code)) e.preventDefault();

  if (panel && e.code === 'Escape') {
    closePanel();
    return;
  }

  keys[e.code] = true;
  if (!playing || e.repeat) return;

  if (/^Digit[1-9]$/.test(e.code)) {
    selected = +e.code.slice(-1) - 1;
  }

  if (e.code === 'KeyE') showPanel('inventory');
  if (e.code === 'KeyC') showPanel('craft');
  if (e.code === 'KeyR') eat();
  if (e.code === 'KeyP') saveGame();

  if (e.code === 'KeyF') {
    player.fly = !player.fly;
    player.vy = 0;
    notice(player.fly ? 'Flying ON' : 'Flying OFF');
  }

  if (e.code === 'KeyG') {
    player.creative = !player.creative;
    notice(player.creative
      ? 'Creative Mode' : 'Survival Mode');
  }

  if (e.code === 'KeyQ') {
    const list = [
      'fists',
      ...Object.keys(DAMAGES)
        .filter(k => inventory[k] > 0)
    ];

    equipped = list[
      (list.indexOf(equipped) + 1) % list.length
    ];

    notice(`Weapon: ${ITEMS[equipped]?.[0] || 'Fists'}`);
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

document.addEventListener('contextmenu', e => {
  e.preventDefault();
});

// FAST MINING
const ray = new THREE.Raycaster();
const cross = new THREE.Vector2();

function target(distance) {
  ray.setFromCamera(cross, camera);
  ray.far = distance;

  const hits = ray.intersectObjects([
    ...chunks.values(),
    ...mobs.filter(m => m.visible)
  ], true);

  if (!hits.length) return null;

  const hit = hits[0];
  let obj = hit.object;

  while (
    obj.parent &&
    !obj.userData.terrain &&
    !obj.userData.mob
  ) obj = obj.parent;

  return {hit, obj};
}

function hitBlock(hit, inside) {
  const n = hit.face.normal.clone()
    .transformDirection(hit.object.matrixWorld);

  const p = hit.point.clone().addScaledVector(
    n, inside ? -.02 : .02
  );

  return {
    x: Math.round(p.x),
    y: Math.round(p.y),
    z: Math.round(p.z)
  };
}

document.addEventListener('mousedown', e => {
  if (!playing || ![0, 2].includes(e.button) ||
      attackLeft > 0) return;

  const r = target(equipped === 'bow' ? 25 : 6);
  if (!r) return;

  const {hit, obj} = r;

  // LEFT CLICK: INSTANT MINE / ATTACK
  if (e.button === 0) {
    if (obj.userData.mob) {
      const mob = obj.userData.mob;

      if (equipped === 'bow') {
        if (!inventory.arrows) {
          notice('No arrows');
          return;
        }
        inventory.arrows--;
      }

      mob.hp -= DAMAGES[equipped] || 3;
      attackLeft = .15;

      if (mob.hp <= 0) {
        scene.remove(obj);
        mobs.splice(mobs.indexOf(obj), 1);

        if (!mob.enemy) {
          inventory.raw_meat =
            (inventory.raw_meat || 0) + 2;
        } else if (mob.kind === 'skeleton') {
          inventory.arrows =
            (inventory.arrows || 0) + 2;
        }

        xp += 3;
        notice(`Loot: ${mob.kind}`);
      }
      return;
    }

    if (obj.userData.terrain) {
      const p = hitBlock(hit, true);
      const id = block(p.x, p.y, p.z);

      if (!id || id === 'bedrock') return;

      const k = key(p.x, p.y, p.z);

      if (
        id === 'chest' &&
        chests[k] &&
        Object.values(chests[k]).some(n => n > 0)
      ) {
        notice('Empty chest before mining');
        return;
      }

      if (change(p.x, p.y, p.z, null)) {
        inventory[id] = (inventory[id] || 0) + 1;

        if (id === 'leaves' && Math.random() < .2) {
          inventory.seeds = (inventory.seeds || 0) + 1;
        }

        xp++;
        attackLeft = .12;
        notice(`Mined ${ITEMS[id][0]}`);
      }
    }
    return;
  }

  // RIGHT CLICK: PLACE / INTERACT
  if (obj.userData.mob) {
    notice('Animals can be hunted with left click');
    return;
  }

  if (!obj.userData.terrain) return;

  const p = hitBlock(hit, true);
  const id = block(p.x, p.y, p.z);
  const k = key(p.x, p.y, p.z);

  if (id === 'chest') {
    showPanel('chest', k);
    return;
  }

  if (id === 'furnace') {
    showPanel('furnace');
    return;
  }

  if (id === 'crops') {
    change(p.x, p.y, p.z, 'farmland');
    inventory.wheat = (inventory.wheat || 0) + 2;
    inventory.seeds = (inventory.seeds || 0) + 2;
    notice('Harvested crops');
    return;
  }

  if (id === 'farmland' && inventory.seeds > 0) {
    inventory.seeds--;
    change(p.x, p.y, p.z, 'crops');
    notice('Planted seeds');
    return;
  }

  const q = hitBlock(hit, false);
  const item = hotItems[selected];

  if (!player.creative && !inventory[item]) {
    notice(`No ${ITEMS[item][0]}`);
    return;
  }

  if (block(q.x, q.y, q.z)) return;

  const insidePlayer =
    Math.abs(q.x - camera.position.x) < .8 &&
    Math.abs(q.z - camera.position.z) < .8 &&
    q.y + .5 > camera.position.y - 1.5 &&
    q.y - .5 < camera.position.y + .1;

  if (insidePlayer) return;

  if (change(q.x, q.y, q.z, item)) {
    if (!player.creative) inventory[item]--;
    attackLeft = .1;
    notice(`Placed ${ITEMS[item][0]}`);
  }
});

// HOTBAR
const bar = $('hotbar');

for (let i = 0; i < 9; i++) {
  const el = document.createElement('div');
  el.className = 'slot';

  const sp = document.createElement('span');
  sp.textContent = ITEMS[hotItems[i]][1];

  const sm = document.createElement('small');
  sm.textContent = i + 1;

  el.append(sp, sm);
  bar.append(el);
}

// GAME LOOP
stream();

const clock = new THREE.Clock();

let foodTimer = 0;
let saveTimer = 0;
let hazardTimer = 0;

function frame() {
  requestAnimationFrame(frame);

  const dt = Math.min(.04, clock.getDelta());
  const t = clock.elapsedTime;

  if (playing) {
    worldTime += dt;

    const night =
      worldTime % 240 > 135 &&
      worldTime % 240 < 220;

    scene.background.setHex(
      night ? 0x162a43 : 0x89c8ef
    );
    scene.fog.color.copy(scene.background);

    if (keys.ArrowLeft) player.yaw += 2.6 * dt;
    if (keys.ArrowRight) player.yaw -= 2.6 * dt;

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

    move.set(0, 0, 0);

    if (keys.KeyW || keys.ArrowUp) move.add(forward);
    if (keys.KeyS || keys.ArrowDown) move.sub(forward);
    if (keys.KeyD) move.add(right);
    if (keys.KeyA) move.sub(right);

    // FASTER MOVEMENT
    const speed = keys.ShiftLeft ? 14 : 9;

    if (move.lengthSq()) {
      move.normalize().multiplyScalar(speed * dt);
      shift('x', move.x);
      shift('z', move.z);
    }

    if (player.fly || player.creative) {
      if (keys.Space) shift('y', speed * dt);
      if (keys.ControlLeft) shift('y', -speed * dt);
      player.vy = 0;
    } else {
      if (keys.Space && player.ground) {
        player.vy = 8.7;
        player.ground = false;
      }

      player.vy = Math.max(
        -24, player.vy - 24 * dt
      );

      const ok = shift('y', player.vy * dt);

      if (!ok) {
        player.ground = player.vy <= 0;
        player.vy = 0;
      } else {
        const p = camera.position.clone();
        p.y -= .08;
        player.ground = collision(p);
      }
    }

    if (camera.position.y < FLOOR - 6 || health <= 0) {
      camera.position.set(
        0, height(0, 3) + 2.3, 3
      );
      health = 100;
      hunger = Math.max(50, hunger);
      player.vy = 0;
      notice('Respawned');
    }

    const bx = Math.round(camera.position.x);
    const by = Math.round(camera.position.y - 1.3);
    const bz = Math.round(camera.position.z);

    if (
      block(bx, by, bz) === 'lava' &&
      !player.creative
    ) {
      hazardTimer += dt;

      if (hazardTimer > 1) {
        health -= 12;
        hazardTimer = 0;
        notice('Lava burns!');
      }
    } else {
      hazardTimer = 0;
    }

    stream();
    mobsTick(dt, t);

    attackLeft = Math.max(0, attackLeft - dt);

    foodTimer += dt;
    if (foodTimer > 6) {
      foodTimer = 0;

      if (!player.creative) {
        hunger = Math.max(0, hunger - 1);
        if (hunger === 0) {
          health = Math.max(0, health - 2);
        }
      }
    }

    saveTimer += dt;

    if (saveTimer > 45) {
      saveTimer = 0;
      saveGame(true);
    }

    $('coords').textContent =
      `XYZ ${Math.floor(camera.position.x)} ` +
      `${Math.floor(camera.position.y)} ` +
      `${Math.floor(camera.position.z)}`;

    $('day').textContent = night ? '🌙 Night' : '☀ Day';
    $('health').textContent = Math.ceil(health);
    $('hunger').textContent = Math.ceil(hunger);
    $('level').textContent = level;

    $('weapon').textContent =
      `${ITEMS[equipped]?.[0] || 'Fists'}` +
      `${player.creative ? ' · Creative' : ''}`;

    const item = hotItems[selected];
    $('selected').textContent =
      `${ITEMS[item][0]} (${inventory[item] || 0})`;

    [...bar.children].forEach((el, i) => {
      el.classList.toggle('active', i === selected);
      el.querySelector('span').textContent =
        ITEMS[hotItems[i]][1];
    });
  }

  if (noticeLeft > 0) {
    noticeLeft -= dt;
    if (noticeLeft <= 0) $('notice').textContent = '';
  }

  renderer.render(scene, camera);
}

frame();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
