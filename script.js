 import * as THREE from "https://esm.sh/three@0.180.0";

/* =====================================================
   GALAXY BLOCKVERSE — LIVING WORLD EDITION
   Original voxel sandbox
   ===================================================== */

const $ = id => document.getElementById(id);
const SAVE = "galaxy-blockverse-three-files-v1";

const SIZE = 12;
const VIEW = 1;
const MIN_Y = -48;
const MAX_Y = 65;
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
  LAB: 31,
  FENCE: 32,
  BIRCH_LOG: 33,
  BIRCH_LEAVES: 34,
  CHERRY_LOG: 35,
  CHERRY_LEAVES: 36
});

const ITEMS = [
  ["Air", "▫️"],
  ["Grass", "🟩"],
  ["Dirt", "🟫"],
  ["Stone", "🪨"],
  ["Sand", "🏖️"],
  ["Oak Wood", "🪵"],
  ["Oak Leaves", "🍃"],
  ["Bedrock", "⬛"],
  ["Ice", "🧊"],
  ["Water", "💧"],
  ["Cactus", "🌵"],
  ["Oak Planks", "🪵"],
  ["Glass", "🪟"],
  ["Chest", "📦"],
  ["Furnace", "🔥"],
  ["Farmland", "🟤"],
  ["Wheat Crops", "🌾"],
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
  ["Chemistry Lab", "⚗️"],
  ["Oak Fence", "🪵"],
  ["Birch Log", "🌳"],
  ["Birch Leaves", "🍃"],
  ["Cherry Log", "🌸"],
  ["Cherry Leaves", "🌸"]
];

const OTHER = {
  bucket: ["Empty Bucket", "🪣"],
  water_bucket: ["Water Bucket", "💧"],
  lava_bucket: ["Lava Bucket", "🌋"],
  seeds: ["Wheat Seeds", "🌱"],
  wheat: ["Wheat", "🌾"],
  bread: ["Bread", "🍞"],
  apple: ["Apple", "🍎"],
  meat: ["Raw Meat", "🥩"],
  cooked: ["Cooked Meat", "🍖"],
  emerald: ["Emerald", "💚"],
  iron_ingot: ["Iron Ingot", "🔩"],
  gold_ingot: ["Gold Ingot", "🟨"],
  hydrogen: ["Hydrogen", "H"],
  oxygen: ["Oxygen", "O"],
  carbon: ["Carbon", "C"],
  sodium: ["Sodium", "Na"],
  chlorine: ["Chlorine", "Cl"],
  water_compound: ["H₂O", "💧"],
  salt: ["Salt", "🧂"],
  carbon_dioxide: ["Carbon Dioxide", "CO₂"]
};

const RECIPES = [
  [B.PLANKS, 4, {[B.WOOD]: 1}],
  [B.PLANKS, 4, {[B.BIRCH_LOG]: 1}],
  [B.PLANKS, 4, {[B.CHERRY_LOG]: 1}],
  [B.FENCE, 4, {[B.PLANKS]: 6}],
  [B.CHEST, 1, {[B.PLANKS]: 8}],
  [B.FURNACE, 1, {[B.COBBLE]: 8}],
  [B.FARMLAND, 4, {[B.DIRT]: 4}],
  ["bread", 1, {wheat: 3}],
  [B.TNT, 1, {[B.SAND]: 4, [B.COAL]: 3}],
  [B.LAB, 1, {[B.GLASS]: 4, [B.IRON]: 2}],
  ["bucket", 1, {iron_ingot: 3}]
];

const CHEMISTRY = [
  ["water_compound", 1, {hydrogen: 2, oxygen: 1}],
  ["salt", 1, {sodium: 1, chlorine: 1}],
  ["carbon_dioxide", 1, {carbon: 1, oxygen: 2}]
];

const SMELTING = [
  ["iron_ingot", 1, {[B.IRON]: 1, [B.COAL]: 1}],
  ["gold_ingot", 1, {[B.GOLD]: 1, [B.COAL]: 1}],
  [B.GLASS, 1, {[B.SAND]: 1, [B.COAL]: 1}],
  ["cooked", 1, {meat: 1, [B.COAL]: 1}]
];

const itemName = id =>
  typeof id === "number"
    ? ITEMS[id]?.[0] || "Unknown"
    : OTHER[id]?.[0] || String(id);

const itemIcon = id =>
  typeof id === "number"
    ? ITEMS[id]?.[1] || "▫️"
    : OTHER[id]?.[1] || "▫️";

const normalizeId = id =>
  /^\d+$/.test(String(id)) ? Number(id) : id;

function solid(id) {
  return ![
    B.AIR, B.WATER, B.LAVA, B.FIRE,
    B.LEAVES, B.BIRCH_LEAVES,
    B.CHERRY_LEAVES, B.CROPS
  ].includes(id);
}

/* =====================================================
   THREE.JS SCENE
   ===================================================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c9ef);
scene.fog = new THREE.Fog(0x91c9ef, 25, 68);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, .05, 130
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
  0xeaf5ff, 0x536c4c, 1.8
);
scene.add(ambient);

const sun = new THREE.DirectionalLight(
  0xffe8c4, 1.4
);
sun.position.set(25, 55, 18);
scene.add(sun);

/* =====================================================
   SAVED WORLD
   ===================================================== */

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
const cropAges = new Map(
  Array.isArray(stored.cropAges) ? stored.cropAges : []
);

const inventory = {
  1: 24,
  2: 16,
  3: 20,
  4: 12,
  5: 12,
  6: 8,
  11: 16,
  13: 2,
  14: 1,
  22: 8,
  25: 3,
  31: 1,
  32: 24,
  seeds: 12,
  bucket: 1,
  bread: 4,
  cooked: 3,
  hydrogen: 6,
  oxygen: 5,
  carbon: 4,
  sodium: 2,
  chlorine: 2,
  ...stored.inventory
};

const slots =
  Array.isArray(stored.slots) &&
  stored.slots.length === 9
    ? stored.slots
    : [
      B.GRASS, B.DIRT, B.STONE,
      B.WOOD, B.PLANKS, B.FENCE,
      B.FARMLAND, B.CHEST, "seeds"
    ];

let selected = 0;
let health = stored.health ?? 20;
let food = stored.food ?? 20;

let creative = false;
let flying = false;
let playing = false;

let panel = "";
let chestKey = "";
let noticeTimer = 0;

function add(id, count = 1) {
  inventory[id] = (inventory[id] || 0) + count;
}

function take(id, count = 1) {
  if ((inventory[id] || 0) < count) return false;
  inventory[id] -= count;
  return true;
}

function notify(message) {
  $("notice").textContent = message;
  noticeTimer = 2.5;
}

/* =====================================================
   TERRAIN GENERATION
   ===================================================== */

function hash(x, z, seed = 0) {
  const n = Math.sin(
    x * 127.1 + z * 311.7 + seed * 79.7
  ) * 43758.5453;
  return n - Math.floor(n);
}

function smooth(v) {
  return v * v * (3 - 2 * v);
}

function noise(x, z, seed = 0) {
  const a = Math.floor(x);
  const b = Math.floor(z);
  const u = smooth(x - a);
  const v = smooth(z - b);
  const l = THREE.MathUtils.lerp;

  return l(
    l(hash(a,b,seed), hash(a+1,b,seed), u),
    l(hash(a,b+1,seed), hash(a+1,b+1,seed), u),
    v
  );
}

function fractal(x, z, seed = 0) {
  let sum = 0, total = 0;
  let amp = 1, freq = .018;

  for (let i = 0; i < 4; i++) {
    sum += noise(x*freq, z*freq, seed+i*11)*amp;
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

  const climate = fractal(x+600,z-400,20);
  const type =
    climate < .35 ? "Desert" :
    climate > .67 ? "Mountains" : "Plains";

  let h = Math.floor(
    (fractal(x,z,5)-.44)*24 +
    (fractal(x,z,33)-.5)*5 + 6
  );

  if (type === "Mountains") {
    h += Math.floor(15*fractal(x+40,z-40,96));
  }

  if (type === "Desert") {
    h = Math.floor((fractal(x,z,5)-.45)*10+4);
  }

  if (Math.hypot(x,z)<12) h=Math.max(h,4);

  if (x>=30&&x<=55&&z>=16&&z<=42) h=5;

  h=THREE.MathUtils.clamp(h,-40,49);

  const value={h,type};
  if (columnCache.size>16000) columnCache.clear();
  columnCache.set(k,value);
  return value;
}

const height=(x,z)=>column(x,z).h;
const biome=(x,z)=>column(x,z).type;

/* =====================================================
   MODERN-STYLE TREE VARIATIONS
   Oak, Birch, Cherry
   ===================================================== */

function treeInfo(x,z) {
  if (x%9!==0||z%9!==0) return null;

  if (x>=26&&x<=59&&z>=12&&z<=46) return null;
  if (biome(x,z)==="Desert") return null;
  if (height(x,z)<3) return null;

  const chance=hash(x/9,z/9,22);
  if (chance<.56) return null;

  const species=hash(x/9,z/9,41);
  const type=
    species<.48 ? "oak" :
    species<.78 ? "birch" : "cherry";

  const trunkHeight=type==="cherry"
    ? 6+Math.floor(hash(x,z,7)*3)
    : 5+Math.floor(hash(x,z,8)*3);

  return {
    x,z,
    base:height(x,z),
    trunkHeight,
    type,
    log:
      type==="birch" ? B.BIRCH_LOG :
      type==="cherry" ? B.CHERRY_LOG : B.WOOD,
    leaf:
      type==="birch" ? B.BIRCH_LEAVES :
      type==="cherry" ? B.CHERRY_LEAVES : B.LEAVES
  };
}

function treeBlock(x,y,z) {
  // Every coordinate checks nearby tree anchors.
  for (
    let tx=Math.floor((x-4)/9)*9;
    tx<=x+4;
    tx+=9
  ) {
    for (
      let tz=Math.floor((z-4)/9)*9;
      tz<=z+4;
      tz+=9
    ) {
      const tree=treeInfo(tx,tz);
      if (!tree) continue;

      const dx=Math.abs(x-tx);
      const dz=Math.abs(z-tz);
      const top=tree.base+tree.trunkHeight;

      if (
        dx===0&&dz===0 &&
        y>tree.base && y<=top
      ) return tree.log;

      const dy=y-top;

      if (tree.type==="cherry") {
        // Broad flowering canopy.
        if (
          dy>=-2&&dy<=2 &&
          dx<=3&&dz<=3 &&
          dx+dz+Math.abs(dy)<=6 &&
          hash(x,z,y)>.10
        ) return tree.leaf;
      } else {
        // Rounded layered canopy.
        const radius=
          dy===2 ? 1 :
          dy===1 ? 2 :
          dy===0 ? 3 :
          dy===-1 ? 2 :
          dy===-2 ? 1 : 0;

        if (
          radius>0 &&
          dx<=radius&&dz<=radius &&
          dx+dz<=radius*2 &&
          hash(x+y,z,18)>.08
        ) return tree.leaf;
      }
    }
  }

  return B.AIR;
}

/* =====================================================
   VILLAGE HOUSES AND FARMS
   ===================================================== */

const houses=[[35,22],[49,22],[35,36],[49,36]];

function structure(x,y,z) {
  for (const [cx,cz] of houses) {
    if (
      x<cx-3||x>cx+3||
      z<cz-3||z>cz+3
    ) continue;

    const wall=
      Math.abs(x-cx)===3||
      Math.abs(z-cz)===3;

    if (x===cx&&z===cz-3&&(y===6||y===7)) {
      return B.AIR;
    }

    if (wall&&y>=6&&y<=8) {
      if (
        y===7&&
        ((x===cx&&z===cz+3)||
         (x===cx+3&&z===cz))
      ) return B.GLASS;

      return B.PLANKS;
    }

    if (y===9) return B.WOOD;

    if (x===cx+1&&z===cz+1&&y===6) {
      return B.CHEST;
    }
  }

  // Village wheat field.
  if (x>=38&&x<=45&&z>=29&&z<=33) {
    if (y===6) return B.FARMLAND;
    if (y===7) return B.CROPS;
  }

  // Village animal enclosure.
  if (
    x>=27&&x<=34&&z>=42&&z<=50 &&
    y===height(x,z)+1
  ) {
    if (
      x===27||x===34||z===42||z===50
    ) {
      if (!(x===30&&z===42)) return B.FENCE;
    }
  }

  return null;
}

/* =====================================================
   NATURAL BLOCKS
   ===================================================== */

function natural(x,y,z) {
  if (y<=MIN_Y) return B.BEDROCK;
  if (y>MAX_Y) return B.AIR;

  const building=structure(x,y,z);
  if (building!==null) return building;

  const h=height(x,z);
  const type=biome(x,z);

  if (y>h) {
    const tree=treeBlock(x,y,z);
    if (tree!==B.AIR) return tree;

    if (
      type==="Desert" &&
      x%11===0&&z%11===0 &&
      hash(x/11,z/11)>.67 &&
      y<=h+3
    ) return B.CACTUS;

    return y<=1 ? B.WATER : B.AIR;
  }

  if (y===h) {
    if (type==="Desert") return B.SAND;
    if (type==="Mountains"&&h>18) return B.STONE;
    return B.GRASS;
  }

  if (y>=h-3) {
    return type==="Desert" ? B.SAND : B.DIRT;
  }

  const cave=
    Math.sin(x*.13+y*.15)+
    Math.cos(z*.14-y*.1)+
    Math.sin((x+z+y)*.09);

  if (y<-5&&cave>2.46) {
    return y<-30&&hash(x+y,z,8)>.85
      ? B.LAVA : B.AIR;
  }

  const ore=hash(x*7+y*13,z*9+y*17,4);

  if (y<-25&&ore>.993) return B.DIAMOND;
  if (y<-14&&ore>.987) return B.GOLD;
  if (y<8&&ore>.978) return B.IRON;
  if (y<18&&ore>.962) return B.COAL;

  return B.STONE;
}

const key=(x,y,z)=>`${x},${y},${z}`;

function block(x,y,z) {
  if (y<=MIN_Y) return B.BEDROCK;
  if (y>MAX_Y) return B.AIR;

  const k=key(x,y,z);

  return edits.has(k)
    ? edits.get(k)
    : natural(x,y,z);
}

/* =====================================================
   BLOCK TEXTURES
   ===================================================== */

const COLORS=[
  0x000000,0x65b843,0x8b6040,0x858a8e,
  0xe1cd91,0x89603a,0x409752,0x33333b,
  0xb3def2,0x307cbd,0x30864d,0xbb8a53,
  0xa6ddec,0xa47940,0x55595b,0x795538,
  0x86ae3f,0x87898e,0x917f75,0xddbd59,
  0x38dcde,0xee691b,0xaaa498,0x77797b,
  0x272333,0xe7472e,0xfa9429,0xa55d4b,
  0xf2f8fa,0x967f70,0xba7e48,0x9eafa9,
  0xa67743,0xe4dcc6,0x79b665,0x9b6b58,
  0xe79dc0
];

const atlas=document.createElement("canvas");
atlas.width=128;
atlas.height=Math.ceil(COLORS.length/8)*16;

const ctx=atlas.getContext("2d");

for(let id=0;id<COLORS.length;id++){
  const img=ctx.createImageData(16,16);

  for(let y=0;y<16;y++){
    for(let x=0;x<16;x++){
      let color=COLORS[id];
      let shade=(hash(x,y,id)-.5)*48;

      if(id===B.GRASS&&y<3) color=0x53b440;
      if(id===B.WOOD&&x%4===0) shade-=35;
      if(id===B.PLANKS&&y%5===0) shade-=30;
      if(id===B.BIRCH_LOG&&x%4===0) color=0x403a32;
      if(id===B.CHERRY_LOG&&x%5===0) shade-=30;
      if(id===B.FARMLAND&&x%4===0) shade-=26;
      if(id===B.TNT&&y>5&&y<10) color=0xf6eee0;

      const i=(y*16+x)*4;

      img.data[i]=THREE.MathUtils.clamp(
        ((color>>16)&255)+shade,0,255
      );
      img.data[i+1]=THREE.MathUtils.clamp(
        ((color>>8)&255)+shade,0,255
      );
      img.data[i+2]=THREE.MathUtils.clamp(
        (color&255)+shade,0,255
      );
      img.data[i+3]=255;
    }
  }

  ctx.putImageData(
    img,
    (id%8)*16,
    Math.floor(id/8)*16
  );
}

const atlasTexture=new THREE.CanvasTexture(atlas);
atlasTexture.magFilter=THREE.NearestFilter;
atlasTexture.minFilter=THREE.NearestFilter;
atlasTexture.generateMipmaps=false;
atlasTexture.colorSpace=THREE.SRGBColorSpace;

const blockMaterial=new THREE.MeshLambertMaterial({
  map:atlasTexture,
  vertexColors:true,
  side:THREE.DoubleSide
});

const waterMaterial=new THREE.MeshBasicMaterial({
  color:0x348dc9,
  transparent:true,
  opacity:.65,
  depthWrite:false,
  side:THREE.DoubleSide
});

function uvFor(id) {
  const x=(id%8)*16;
  const y=Math.floor(id/8)*16;

  const l=(x+.25)/atlas.width;
  const r=(x+15.75)/atlas.width;
  const t=1-(y+.25)/atlas.height;
  const b=1-(y+15.75)/atlas.height;

  return [[l,b],[l,t],[r,t],[r,b]];
}

const FACES=[
  [[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]],.8],
  [[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]],.8],
  [[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]],1],
  [[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]],.65],
  [[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]],.9],
  [[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]],.75]
];

/* =====================================================
   WORLD MESHING
   ===================================================== */

const chunks=new Map();
const queue=[];
const queued=new Set();
const editedTop=new Map();

function rememberTop(x,y,z) {
  const k=`${x},${z}`;
  editedTop.set(k,Math.max(editedTop.get(k)??MIN_Y,y));
}

for(const [k] of edits){
  const [x,y,z]=k.split(",").map(Number);
  if([x,y,z].every(Number.isFinite)) rememberTop(x,y,z);
}

function meshData(){
  return [[],[],[],[],[]];
}

function addBox(data,id,x,y,z,w=1,h=1,d=1,shadeScale=1){
  const [p,n,u,c,indices]=data;
  const tex=uvFor(id);

  for(const [dir,vertices,shade] of FACES){
    const start=p.length/3;

    for(let i=0;i<4;i++){
      const v=vertices[i];
      p.push(
        x+v[0]*w,
        y+v[1]*h,
        z+v[2]*d
      );
      n.push(...dir);
      u.push(...tex[i]);
      c.push(
        shade*shadeScale,
        shade*shadeScale,
        shade*shadeScale
      );
    }

    indices.push(
      start,start+1,start+2,
      start,start+2,start+3
    );
  }
}

function addFace(data,id,x,y,z,faceIndex){
  const [dir,vertices,shade]=FACES[faceIndex];
  const [p,n,u,c,indices]=data;
  const tex=uvFor(id);
  const start=p.length/3;

  for(let i=0;i<4;i++){
    const v=vertices[i];
    p.push(x+v[0],y+v[1],z+v[2]);
    n.push(...dir);
    u.push(...tex[i]);
    c.push(shade,shade,shade);
  }

  indices.push(
    start,start+1,start+2,
    start,start+2,start+3
  );
}

function makeMesh(data,material){
  const [p,n,u,c,indices]=data;

  if(!indices.length) return null;

  const geo=new THREE.BufferGeometry();

  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(p,3)
  );
  geo.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(n,3)
  );
  geo.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(u,2)
  );
  geo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(c,3)
  );

  geo.setIndex(indices);
  geo.computeBoundingSphere();

  const mesh=new THREE.Mesh(geo,material);
  scene.add(mesh);
  return mesh;
}

/* =====================================================
   FENCE SHAPES AND CONNECTIONS
   ===================================================== */

function fenceConnects(id){
  return id===B.FENCE||
    id===B.WOOD||
    id===B.BIRCH_LOG||
    id===B.CHERRY_LOG||
    id===B.PLANKS||
    id===B.STONE||
    id===B.BRICKS;
}

function buildFence(data,x,y,z){
  // Narrow central post.
  addBox(data,B.FENCE,x,y,z,.26,1.18,.26);

  // Rails connect to neighboring fences and walls.
  const directions=[
    [1,0],
    [-1,0],
    [0,1],
    [0,-1]
  ];

  for(const [dx,dz] of directions){
    if(!fenceConnects(block(x+dx,y,z+dz))) continue;

    const cx=x+dx*.25;
    const cz=z+dz*.25;

    if(dx!==0){
      addBox(data,B.FENCE,cx,y+.20,cz,.50,.13,.13);
      addBox(data,B.FENCE,cx,y-.20,cz,.50,.13,.13);
    }else{
      addBox(data,B.FENCE,cx,y+.20,cz,.13,.13,.50);
      addBox(data,B.FENCE,cx,y-.20,cz,.13,.13,.50);
    }
  }
}

/* =====================================================
   CROP GROWTH STAGES
   ===================================================== */

function cropAge(x,y,z){
  const k=key(x,y,z);

  // Existing naturally generated village crops
  // begin mature; newly planted crops begin at zero.
  return cropAges.get(k) ??
    (edits.has(k)?0:3);
}

function renderCrop(data,x,y,z){
  const age=cropAge(x,y,z);

  const growth=[.19,.38,.65,.92][age]??.19;
  const colorScale=[.65,.78,.90,1][age]??.65;

  addBox(
    data,B.CROPS,
    x-.17,y-.5+growth/2,z,
    .11,growth,.11,colorScale
  );

  addBox(
    data,B.CROPS,
    x+.17,y-.5+growth/2,z,
    .11,growth,.11,colorScale
  );

  addBox(
    data,B.CROPS,
    x,y-.5+growth/2,z-.17,
    .11,growth,.11,colorScale
  );

  addBox(
    data,B.CROPS,
    x,y-.5+growth/2,z+.17,
    .11,growth,.11,colorScale
  );
}

function buildChunk(cx,cz){
  const solids=meshData();
  const fluids=meshData();
  const memo=new Map();

  function get(x,y,z){
    const k=key(x,y,z);

    if(!memo.has(k)){
      memo.set(k,block(x,y,z));
    }

    return memo.get(k);
  }

  for(let x=cx*SIZE;x<(cx+1)*SIZE;x++){
    for(let z=cz*SIZE;z<(cz+1)*SIZE;z++){
      const top=Math.min(
        MAX_Y,
        Math.max(
          height(x,z)+12,
          editedTop.get(`${x},${z}`)??MIN_Y,
          2
        )
      );

      for(let y=MIN_Y+1;y<=top;y++){
        const id=get(x,y,z);
        if(id===B.AIR) continue;

        if(id===B.FENCE){
          buildFence(solids,x,y,z);
          continue;
        }

        if(id===B.CROPS){
          renderCrop(solids,x,y,z);
          continue;
        }

        const liquid=id===B.WATER||id===B.LAVA;
        const data=liquid?fluids:solids;

        for(let f=0;f<6;f++){
          const [dx,dy,dz]=FACES[f][0];
          const neighbor=get(x+dx,y+dy,z+dz);

          if(liquid){
            if(neighbor===id) continue;
            if(
              neighbor!==B.AIR &&
              neighbor!==B.WATER &&
              neighbor!==B.LAVA
            ) continue;
          }else if(
            neighbor!==B.AIR &&
            neighbor!==B.WATER &&
            neighbor!==B.LAVA
          ) continue;

          addFace(data,id,x,y,z,f);
        }
      }
    }
  }

  return [
    makeMesh(solids,blockMaterial),
    makeMesh(fluids,waterMaterial)
  ];
}

const chunkKey=(cx,cz)=>`${cx},${cz}`;

function discardChunk(k){
  const meshes=chunks.get(k);
  if(!meshes) return;

  for(const mesh of meshes){
    if(!mesh) continue;
    scene.remove(mesh);
    mesh.geometry.dispose();
  }

  chunks.delete(k);
}

function enqueue(cx,cz){
  const k=chunkKey(cx,cz);
  if(queued.has(k)) return;
  queued.add(k);
  queue.push([cx,cz]);
}

function rebuild(x,z){
  const cx=Math.floor(x/SIZE);
  const cz=Math.floor(z/SIZE);

  enqueue(cx,cz);

  const mx=((x%SIZE)+SIZE)%SIZE;
  const mz=((z%SIZE)+SIZE)%SIZE;

  if(mx===0) enqueue(cx-1,cz);
  if(mx===SIZE-1) enqueue(cx+1,cz);
  if(mz===0) enqueue(cx,cz-1);
  if(mz===SIZE-1) enqueue(cx,cz+1);

  // Neighbor connections can span chunk borders.
}

let lastCenter="";

function stream(){
  const cx=Math.floor(player.x/SIZE);
  const cz=Math.floor(player.z/SIZE);
  const center=chunkKey(cx,cz);

  if(center===lastCenter) return;
  lastCenter=center;

  const needed=new Set();

  for(let x=cx-VIEW;x<=cx+VIEW;x++){
    for(let z=cz-VIEW;z<=cz+VIEW;z++){
      const k=chunkKey(x,z);
      needed.add(k);

      if(!chunks.has(k)) enqueue(x,z);
    }
  }

  for(const k of [...chunks.keys()]){
    if(!needed.has(k)) discardChunk(k);
  }
}

function processChunks(){
  if(!queue.length) return;

  const [cx,cz]=queue.shift();
  const k=chunkKey(cx,cz);

  queued.delete(k);

  if(
    Math.abs(cx-Math.floor(player.x/SIZE))>VIEW ||
    Math.abs(cz-Math.floor(player.z/SIZE))>VIEW
  ) return;

  discardChunk(k);
  chunks.set(k,buildChunk(cx,cz));
}

/* =====================================================
   BLOCK EDITING AND PHYSICS
   ===================================================== */

let gameSeconds=0;
const physicsQueue=[];
const pending=new Set();

function schedule(x,y,z,delay=.1){
  if(y<=MIN_Y||y>MAX_Y) return;

  const k=key(x,y,z);
  if(pending.has(k)||physicsQueue.length>1200) return;

  pending.add(k);
  physicsQueue.push({
    x,y,z,k,
    at:gameSeconds+delay
  });
}

function changeBlock(x,y,z,id,physics=true){
  if(y<=MIN_Y||y>MAX_Y) return false;
  if(block(x,y,z)===id) return false;

  edits.set(key(x,y,z),id);
  rememberTop(x,y,z);
  rebuild(x,z);

  if(id!==B.CROPS){
    cropAges.delete(key(x,y,z));
  }

  if(physics){
    schedule(x,y,z);
    schedule(x,y+1,z);

    for(const [dx,dz] of [
      [1,0],[-1,0],[0,1],[0,-1]
    ]){
      schedule(x+dx,y,z+dz);
    }
  }

  return true;
}

function neighbors(x,y,z){
  return [
    [x+1,y,z],[x-1,y,z],
    [x,y+1,z],[x,y-1,z],
    [x,y,z+1],[x,y,z-1]
  ];
}

function nextTo(x,y,z,id){
  return neighbors(x,y,z).some(
    ([a,b,c])=>block(a,b,c)===id
  );
}

function explode(x,y,z,radius=3){
  for(let dx=-radius;dx<=radius;dx++){
    for(let dy=-radius;dy<=radius;dy++){
      for(let dz=-radius;dz<=radius;dz++){
        if(dx*dx+dy*dy+dz*dz>radius*radius) continue;

        const a=x+dx,b=y+dy,c=z+dz;
        const id=block(a,b,c);

        if(![
          B.AIR,B.BEDROCK,B.OBSIDIAN
        ].includes(id)){
          changeBlock(a,b,c,B.AIR,false);
        }
      }
    }
  }

  if(
    !creative &&
    Math.hypot(
      player.x-x,
      player.y-y,
      player.z-z
    )<radius+1
  ){
    health=Math.max(0,health-8);
  }

  notify("TNT exploded!");
}

function react(x,y,z){
  const id=block(x,y,z);

  if(id===B.SAND||id===B.GRAVEL){
    if(
      y>MIN_Y+1 &&
      [B.AIR,B.WATER].includes(block(x,y-1,z))
    ){
      const displaced=block(x,y-1,z);

      changeBlock(x,y,z,displaced,false);
      changeBlock(x,y-1,z,id,false);

      schedule(x,y-1,z,.1);
      schedule(x,y+1,z,.1);
    }
    return;
  }

  if(id===B.LAVA&&nextTo(x,y,z,B.WATER)){
    changeBlock(x,y,z,B.OBSIDIAN);
    return;
  }

  if(id===B.WATER&&nextTo(x,y,z,B.LAVA)){
    for(const [a,b,c] of neighbors(x,y,z)){
      if(block(a,b,c)===B.LAVA){
        changeBlock(a,b,c,B.COBBLE);
        break;
      }
    }
    return;
  }

  if(id===B.WATER||id===B.LAVA){
    if(block(x,y-1,z)===B.AIR){
      changeBlock(x,y-1,z,id);
      return;
    }

    const chance=id===B.WATER?.6:.2;

    if(Math.random()<chance){
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      const [dx,dz]=dirs[
        Math.floor(Math.random()*dirs.length)
      ];

      if(
        Math.abs(x+dx-player.x)<18 &&
        Math.abs(z+dz-player.z)<18 &&
        block(x+dx,y,z+dz)===B.AIR
      ){
        changeBlock(x+dx,y,z+dz,id);
      }
    }

    return;
  }

  if(id===B.ICE&&(
    nextTo(x,y,z,B.LAVA)||
    nextTo(x,y,z,B.FIRE)
  )){
    changeBlock(x,y,z,B.WATER);
    return;
  }

  if(id===B.FIRE){
    for(const [a,b,c] of neighbors(x,y,z)){
      if([
        B.WOOD,B.LEAVES,B.PLANKS,
        B.BIRCH_LOG,B.CHERRY_LOG,
        B.BIRCH_LEAVES,B.CHERRY_LEAVES
      ].includes(block(a,b,c))&&Math.random()<.2){
        changeBlock(a,b,c,B.FIRE);
      }
    }

    if(Math.random()<.3){
      changeBlock(x,y,z,B.AIR);
    }else{
      schedule(x,y,z,1);
    }
    return;
  }

  if(id===B.TNT&&(
    nextTo(x,y,z,B.FIRE)||
    nextTo(x,y,z,B.LAVA)
  )){
    explode(x,y,z);
  }
}

function updatePhysics(){
  const count=physicsQueue.length;
  let budget=24;

  for(let i=0;i<count&&budget>0;i++){
    const job=physicsQueue.shift();
    if(!job) break;

    if(job.at>gameSeconds){
      physicsQueue.push(job);
      continue;
    }

    pending.delete(job.k);
    react(job.x,job.y,job.z);
    budget--;
  }
}

/* =====================================================
   CROP GROWTH
   ===================================================== */

let growthTimer=0;

function updateCrops(dt){
  growthTimer+=dt;
  if(growthTimer<4) return;
  growthTimer=0;

  let changed=0;

  for(const [k,age] of cropAges){
    if(age>=3) continue;

    const [x,y,z]=k.split(",").map(Number);

    if(block(x,y,z)!==B.CROPS){
      cropAges.delete(k);
      continue;
    }

    // Crops need farmland directly underneath.
    if(block(x,y-1,z)!==B.FARMLAND) continue;

    // Nearby water increases growth probability.
    let hydrated=false;

    for(let dx=-4;dx<=4&&!hydrated;dx++){
      for(let dz=-4;dz<=4;dz++){
        if(block(x+dx,y-1,z+dz)===B.WATER){
          hydrated=true;
          break;
        }
      }
    }

    const chance=hydrated?.85:.45;

    if(Math.random()<chance){
      cropAges.set(k,age+1);
      rebuild(x,z);
      changed++;
    }

    if(changed>=12) break;
  }
}

function plantSeed(x,y,z){
  if(block(x,y,z)!==B.FARMLAND) return false;
  if(block(x,y+1,z)!==B.AIR) return false;

  if(!creative&&!take("seeds")){
    notify("You need wheat seeds");
    return false;
  }

  changeBlock(x,y+1,z,B.CROPS);

  cropAges.set(key(x,y+1,z),0);
  rebuild(x,z);

  notify("Seeds planted — watch them grow!");
  return true;
}

function harvestCrop(x,y,z){
  const age=cropAge(x,y,z);

  if(age>=3){
    add("wheat",2);
    add("seeds",2);
    notify("Harvested ripe wheat!");
  }else{
    add("seeds",1);
    notify("Crop harvested too early");
  }

  changeBlock(x,y,z,B.AIR);
}

/* =====================================================
   LOCAL PIXEL TEXTURES FOR CHARACTERS
   ===================================================== */

const materialCache=new Map();

function mat(color){
  if(!materialCache.has(color)){
    materialCache.set(
      color,
      new THREE.MeshLambertMaterial({color})
    );
  }
  return materialCache.get(color);
}

function pixels(draw){
  const canvas=document.createElement("canvas");
  canvas.width=32;
  canvas.height=32;

  const c=canvas.getContext("2d");
  c.imageSmoothingEnabled=false;

  const r=(color,x,y,w,h)=>{
    c.fillStyle=color;
    c.fillRect(x,y,w,h);
  };

  draw(r);

  const texture=new THREE.CanvasTexture(canvas);
  texture.magFilter=THREE.NearestFilter;
  texture.minFilter=THREE.NearestFilter;
  texture.colorSpace=THREE.SRGBColorSpace;

  return new THREE.MeshLambertMaterial({
    map:texture
  });
}

function part(group,w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    material
  );

  mesh.position.set(x,y,z);
  group.add(mesh);
  return mesh;
}

/* =====================================================
   ORIGINAL BLOCKY PLAYER CHARACTER
   ===================================================== */

const playerModel=new THREE.Group();

const skin=mat(0xd2a17e);
const shirt=mat(0x299ac2);
const pants=mat(0x304b99);
const shoes=mat(0x353535);
const hair=mat(0x433026);

part(playerModel,.82,.88,.42,shirt,0,1.11,0);

const playerFace=pixels(r=>{
  r("#cfa17d",0,0,32,32);
  r("#4a3325",0,0,32,9);
  r("#4a3325",0,9,5,6);
  r("#4a3325",27,9,5,6);
  r("#ffffff",6,13,8,6);
  r("#ffffff",19,13,8,6);
  r("#4676a0",9,14,3,4);
  r("#4676a0",22,14,3,4);
  r("#1b2e45",10,15,2,3);
  r("#1b2e45",23,15,2,3);
  r("#ae805e",14,21,5,3);
  r("#714c3d",12,27,9,2);
});

const head=new THREE.Mesh(
  new THREE.BoxGeometry(.67,.67,.67),
  [skin,skin,hair,skin,skin,playerFace]
);
head.position.set(0,1.86,0);
playerModel.add(head);

const leftArm=new THREE.Group();
const rightArm=new THREE.Group();
const leftLeg=new THREE.Group();
const rightLeg=new THREE.Group();

leftArm.position.set(-.54,1.49,0);
rightArm.position.set(.54,1.49,0);

leftLeg.position.set(-.2,.69,0);
rightLeg.position.set(.2,.69,0);

part(leftArm,.26,.78,.33,shirt,0,-.4,0);
part(rightArm,.26,.78,.33,shirt,0,-.4,0);

part(leftArm,.26,.24,.33,skin,0,-.67,0);
part(rightArm,.26,.24,.33,skin,0,-.67,0);

part(leftLeg,.31,.7,.35,pants,0,-.35,0);
part(rightLeg,.31,.7,.35,pants,0,-.35,0);

part(leftLeg,.32,.17,.39,shoes,0,-.64,-.03);
part(rightLeg,.32,.17,.39,shoes,0,-.64,-.03);

playerModel.add(
  leftArm,rightArm,
  leftLeg,rightLeg
);

scene.add(playerModel);

/* =====================================================
   ANIMAL MODELS AND FACES
   ===================================================== */

const animalTypes={
  horse:{
    color:0x906542,
    face:0xb48b69,
    leg:0x684830,
    size:[.9,.84,1.6],
    speed:8,
    jump:9,
    seat:1.6
  },
  cow:{
    color:0x725848,
    face:0xd2a5a0,
    leg:0x554238,
    size:[1,.85,1.45],
    speed:5,
    jump:6,
    seat:1.4
  },
  pig:{
    color:0xe59fa5,
    face:0xf3b5bc,
    leg:0xc78991,
    size:[.85,.69,1.2],
    speed:4.4,
    jump:5.7,
    seat:1.15
  },
  sheep:{
    color:0xe6e3db,
    face:0xb9aea3,
    leg:0x857971,
    size:[.95,.8,1.25],
    speed:5.5,
    jump:6.5,
    seat:1.35
  }
};

function animalFace(type){
  const colors={
    horse:["#936541","#be987b","#523929"],
    cow:["#a28b76","#d4aaa4","#4f4037"],
    pig:["#e5a2a8","#f9bdc5","#9c5966"],
    sheep:["#e6dfd5","#c1b3a5","#74675b"]
  }[type];

  return pixels(r=>{
    r(colors[0],0,0,32,32);
    r(colors[1],4,4,24,22);
    r(colors[2],3,10,10,3);
    r(colors[2],19,10,10,3);
    r("#f1f0e8",5,14,8,6);
    r("#f1f0e8",19,14,8,6);
    r("#282525",9,15,3,4);
    r("#282525",23,15,3,4);
    r(colors[1],7,21,18,10);
    r(colors[2],10,25,4,3);
    r(colors[2],19,25,4,3);
    r(colors[2],13,30,7,1);

    if(type==="sheep"){
      r("#f2f0e9",0,0,32,8);
    }
  });
}

const animalFaces=Object.fromEntries(
  Object.keys(animalTypes).map(type=>[
    type,animalFace(type)
  ])
);

const animals=[];
let animalsSpawned=false;
let mounted=null;

function createAnimal(x,z,type){
  const cfg=animalTypes[type];
  const group=new THREE.Group();
  const body=mat(cfg.color);
  const legsMat=mat(cfg.leg);

  const [w,h,d]=cfg.size;
  const legHeight=type==="horse"?.85:.48;
  const bodyY=legHeight+h/2;

  part(group,w,h,d,body,0,bodyY,0);

  const headY=legHeight+h+.23;
  const headZ=-d*.48;

  const face=new THREE.Mesh(
    new THREE.BoxGeometry(.61,.61,.58),
    [mat(cfg.face),mat(cfg.face),
     body,body,body,animalFaces[type]]
  );

  face.position.set(0,headY,headZ);
  group.add(face);

  // Ears.
  for(const side of [-1,1]){
    part(
      group,.16,.25,.17,body,
      side*.23,headY+.4,headZ
    );
  }

  if(type==="horse"){
    part(
      group,.23,.48,.25,mat(0x423024),
      0,headY+.27,headZ+.23
    );
    part(
      group,.65,.12,.75,mat(0x62412b),
      0,bodyY+h/2+.04,0
    );
  }

  if(type==="pig"){
    part(
      group,.36,.22,.18,mat(0xf6b5be),
      0,headY-.15,headZ-.37
    );
  }

  if(type==="sheep"){
    part(
      group,.78,.24,.58,mat(0xf4f0e9),
      0,headY+.3,headZ
    );
  }

  const legs=[];

  for(const sx of [-1,1]){
    for(const sz of [-1,1]){
      const pivot=new THREE.Group();
      pivot.position.set(sx*w*.32,legHeight,sz*d*.31);

      part(
        pivot,.2,legHeight,.2,legsMat,
        0,-legHeight/2,0
      );

      group.add(pivot);
      legs.push({pivot,sx,sz});
    }
  }

  const tail=part(
    group,.12,.43,.14,
    type==="horse"?mat(0x423024):body,
    0,bodyY,d*.55
  );

  group.position.set(
    x,height(Math.round(x),Math.round(z))+.5,z
  );

  group.userData.kind="animal";

  scene.add(group);

  const animal={
    type,cfg,group,legs,tail,
    hp:5,
    angle:0,
    timer:0,
    walking:0,
    moving:false,
    x0:x,z0:z,
    vy:0,
    grounded:true
  };

  animals.push(animal);
  return animal;
}

function spawnAnimals(){
  if(animalsSpawned) return;
  animalsSpawned=true;

  createAnimal(7,8,"horse");
  createAnimal(-9,8,"cow");
  createAnimal(10,-8,"pig");
  createAnimal(-8,-10,"sheep");
  createAnimal(29,46,"sheep");
}

function animateAnimal(a,dt){
  if(a.moving) a.walking+=dt*8;

  for(const leg of a.legs){
    const phase=leg.sx===leg.sz?0:Math.PI;
    const target=a.moving
      ?Math.sin(a.walking+phase)*.4:0;

    leg.pivot.rotation.x+=
      (target-leg.pivot.rotation.x)*
      Math.min(1,dt*12);
  }

  a.tail.rotation.z=Math.sin(gameSeconds*3)*.16;
  a.group.rotation.y=a.angle;
}

function updateAnimals(dt){
  for(const a of animals){
    if(a===mounted){
      animateAnimal(a,dt);
      continue;
    }

    a.timer-=dt;
    if(a.timer<=0){
      a.timer=2+Math.random()*3;
      a.angle+=(Math.random()-.5)*2;
    }

    const nx=a.group.position.x+Math.sin(a.angle)*dt*.35;
    const nz=a.group.position.z+Math.cos(a.angle)*dt*.35;

    if(
      Math.abs(nx-a.x0)>9 ||
      Math.abs(nz-a.z0)>9
    ){
      a.angle+=Math.PI;
      a.moving=false;
      animateAnimal(a,dt);
      continue;
    }

    const ny=height(Math.round(nx),Math.round(nz))+.5;
    const tx=Math.round(nx);
    const tz=Math.round(nz);

    // Fences physically keep animals inside pens.
    if(
      Math.abs(ny-a.group.position.y)<1 &&
      !solid(block(tx,Math.round(ny+.8),tz))
    ){
      a.group.position.set(nx,ny,nz);
      a.moving=true;
    }else{
      a.angle+=Math.PI;
      a.moving=false;
    }

    animateAnimal(a,dt);
  }
}

/* =====================================================
   VILLAGER MODELS
   ===================================================== */

const villagerJobs={
  farmer:0x917448,
  librarian:0xc5c0b6,
  smith:0x687884,
  villager:0x79533d
};

function villagerFace(job){
  return pixels(r=>{
    r("#cda17e",0,0,32,32);
    r("#dfb18b",3,7,26,19);
    r("#684934",0,0,32,6);

    if(job==="farmer") r("#b99a52",0,0,32,6);
    if(job==="librarian") r("#e9dfc2",0,0,32,6);
    if(job==="smith") r("#6b747d",0,0,32,6);

    r("#604333",3,9,11,3);
    r("#604333",19,9,10,3);
    r("#eee8db",5,13,8,6);
    r("#eee8db",19,13,8,6);
    r("#447650",8,14,3,4);
    r("#447650",22,14,3,4);
    r("#202b21",9,15,2,3);
    r("#202b21",23,15,2,3);
    r("#ae7c5c",13,17,7,10);
    r("#e4b18c",14,17,6,8);
    r("#845a43",11,29,11,2);
  });
}

const villagerFaces=Object.fromEntries(
  Object.keys(villagerJobs).map(j=>[
    j,villagerFace(j)
  ])
);

const villagers=[];
let villagersSpawned=false;

function createVillager(x,z,job){
  const group=new THREE.Group();
  const robe=mat(villagerJobs[job]);
  const skinMat=mat(0xcda17e);

  part(group,.72,.9,.45,robe,0,1,0);

  const head=new THREE.Mesh(
    new THREE.BoxGeometry(.61,.61,.61),
    [skinMat,skinMat,skinMat,
     skinMat,skinMat,villagerFaces[job]]
  );

  head.position.set(0,1.7,-.02);
  group.add(head);

  part(group,.16,.22,.16,skinMat,0,1.56,-.4);
  part(group,.82,.24,.27,robe,0,1.11,-.31);

  part(group,.2,.5,.22,mat(0x45362f),-.17,.26,0);
  part(group,.2,.5,.22,mat(0x45362f),.17,.26,0);

  group.position.set(x,5.5,z);
  group.userData.kind="villager";

  scene.add(group);

  villagers.push({
    group,job,
    angle:0,
    timer:0
  });
}

function spawnVillagers(){
  if(villagersSpawned) return;
  villagersSpawned=true;

  createVillager(37,26,"farmer");
  createVillager(47,26,"librarian");
  createVillager(37,39,"smith");
  createVillager(47,39,"villager");
}

function updateVillagers(dt){
  for(const v of villagers){
    v.timer-=dt;

    if(v.timer<=0){
      v.timer=2+Math.random()*3;
      v.angle+=(Math.random()-.5)*2;
    }

    const x=v.group.position.x+Math.sin(v.angle)*dt*.35;
    const z=v.group.position.z+Math.cos(v.angle)*dt*.35;

    if(
      x<30||x>55||z<16||z>42 ||
      solid(block(Math.round(x),6,Math.round(z)))
    ){
      v.angle+=Math.PI;
    }else{
      v.group.position.x=x;
      v.group.position.z=z;
    }

    v.group.rotation.y=v.angle;
  }
}

/* =====================================================
   PLAYER PHYSICS AND CAMERA
   ===================================================== */

const player={
  x:0,
  y:height(0,0)+.51,
  z:0,
  vx:0,vy:0,vz:0,
  yaw:0,pitch:0,
  grounded:false
};

if(
  Array.isArray(stored.position) &&
  stored.position.length===3 &&
  stored.position.every(Number.isFinite)
){
  [player.x,player.y,player.z]=stored.position;
}

const keys={};
let cameraMode=0;
let fallTimer=0;

function collision(x,y,z){
  const e=.001;

  const minX=Math.floor(x-.3+e+.5);
  const maxX=Math.floor(x+.3-e+.5);
  const minY=Math.floor(y+e+.5);
  const maxY=Math.floor(y+1.8-e+.5);
  const minZ=Math.floor(z-.3+e+.5);
  const maxZ=Math.floor(z+.3-e+.5);

  for(let a=minX;a<=maxX;a++){
    for(let b=minY;b<=maxY;b++){
      for(let c=minZ;c<=maxZ;c++){
        if(solid(block(a,b,c))) return true;
      }
    }
  }

  return false;
}

function moveAxis(axis,distance){
  const steps=Math.ceil(Math.abs(distance)/.08);
  if(!steps) return true;

  const amount=distance/steps;

  for(let i=0;i<steps;i++){
    const x=player.x+(axis==="x"?amount:0);
    const y=player.y+(axis==="y"?amount:0);
    const z=player.z+(axis==="z"?amount:0);

    if(collision(x,y,z)) return false;
    player[axis]+=amount;
  }

  return true;
}

function movementVector(){
  const fx=-Math.sin(player.yaw);
  const fz=-Math.cos(player.yaw);
  const rx=Math.cos(player.yaw);
  const rz=-Math.sin(player.yaw);

  let x=0,z=0;

  if(keys.KeyW){x+=fx;z+=fz;}
  if(keys.KeyS){x-=fx;z-=fz;}
  if(keys.KeyA){x-=rx;z-=rz;}
  if(keys.KeyD){x+=rx;z+=rz;}

  const len=Math.hypot(x,z);

  return len
    ?{x:x/len,z:z/len,moving:true}
    :{x:0,z:0,moving:false};
}

function updatePlayer(dt){
  if(mounted){
    updateRiding(dt);
    return;
  }

  const m=movementVector();

  const sneaking=keys.ShiftLeft||keys.ShiftRight;
  const sprinting=keys.ControlLeft||keys.ControlRight;

  const speed=sneaking?2.3:sprinting?9:6;

  player.vx+=m.x*38*dt;
  player.vz+=m.z*38*dt;

  const friction=block(
    Math.round(player.x),
    Math.round(player.y-.52),
    Math.round(player.z)
  )===B.ICE?2:12;

  player.vx*=Math.exp(-friction*dt);
  player.vz*=Math.exp(-friction*dt);

  const horizontal=Math.hypot(player.vx,player.vz);

  if(horizontal>speed){
    player.vx*=speed/horizontal;
    player.vz*=speed/horizontal;
  }

  const inWater=block(
    Math.round(player.x),
    Math.round(player.y+.7),
    Math.round(player.z)
  )===B.WATER;

  if(flying||creative){
    player.vy=
      (keys.Space?speed:0)-
      (keys.KeyX?speed:0);
  }else{
    player.vy=Math.max(
      -25,
      player.vy-(inWater?7:24)*dt
    );

    if(inWater&&keys.Space) player.vy=3.3;
    else if(keys.Space&&player.grounded){
      player.vy=8.5;
      player.grounded=false;
    }
  }

  if(!moveAxis("x",player.vx*dt)) player.vx=0;
  if(!moveAxis("z",player.vz*dt)) player.vz=0;

  const fallingSpeed=player.vy;

  if(!moveAxis("y",player.vy*dt)){
    if(
      fallingSpeed<-12&&!creative&&!inWater
    ){
      health=Math.max(
        0,
        health-Math.ceil((-fallingSpeed-10)/3)
      );
      notify("Fall damage!");
    }

    player.grounded=player.vy<0;
    player.vy=0;
  }else{
    player.grounded=false;
  }

  const feet=block(
    Math.round(player.x),
    Math.round(player.y+.5),
    Math.round(player.z)
  );

  if(
    !creative &&
    (feet===B.LAVA||feet===B.FIRE)
  ){
    fallTimer+=dt;

    if(fallTimer>=1){
      health=Math.max(0,health-3);
      fallTimer=0;
    }
  }else{
    fallTimer=0;
  }

  if(health<=0||player.y<MIN_Y-5){
    player.x=0;
    player.z=0;
    player.y=height(0,0)+.51;
    player.vx=player.vy=player.vz=0;
    health=20;
    food=Math.max(food,10);
    notify("Respawned!");
  }
}

function updatePlayerModel(dt){
  playerModel.visible=cameraMode!==0;

  playerModel.position.set(
    player.x,
    player.y,
    player.z
  );

  playerModel.rotation.y=player.yaw;

  const moving=Math.hypot(player.vx,player.vz)>.2;
  const walk=gameSeconds*10;
  const swing=moving?Math.sin(walk)*.65:0;

  leftArm.rotation.x=swing;
  rightArm.rotation.x=-swing;
  leftLeg.rotation.x=-swing;
  rightLeg.rotation.x=swing;
}

function updateCamera(){
  const eye=new THREE.Vector3(
    player.x,
    player.y+1.62,
    player.z
  );

  if(mounted){
    eye.y=mounted.group.position.y+
      mounted.cfg.seat+1.05;
  }

  if(cameraMode===0){
    camera.position.copy(eye);
    camera.rotation.set(
      player.pitch,
      player.yaw,
      0,
      "YXZ"
    );
    return;
  }

  const forward=new THREE.Vector3(
    -Math.sin(player.yaw)*Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw)*Math.cos(player.pitch)
  );

  const distance=cameraMode===1?4:-4;

  const desired=eye.clone().addScaledVector(
    forward,
    -distance
  );

  // Prevent third-person camera going through terrain.
  const ray=new THREE.Vector3()
    .subVectors(desired,eye);

  const length=ray.length();

  ray.normalize();

  let allowed=length;

  for(let d=.3;d<length;d+=.2){
    const p=eye.clone().addScaledVector(ray,d);

    if(solid(block(
      Math.round(p.x),
      Math.round(p.y),
      Math.round(p.z)
    ))){
      allowed=Math.max(.25,d-.3);
      break;
    }
  }

  camera.position.copy(
    eye.clone().addScaledVector(ray,allowed)
  );

  camera.lookAt(eye);
}

/* =====================================================
   MOUNT AND RIDE ANIMALS
   ===================================================== */

function mountAnimal(a){
  if(mounted) return;

  mounted=a;
  a.vy=0;
  a.grounded=true;
  a.moving=false;

  $("rideStatus").hidden=false;
  $("rideName").textContent=
    `Riding ${a.type.toUpperCase()}`;

  notify(
    `Mounted ${a.type} — Shift to dismount`
  );
}

function dismount(){
  if(!mounted) return;

  const a=mounted;
  mounted=null;

  const offsets=[
    [1.7,0],[-1.7,0],
    [0,1.7],[0,-1.7],
    [2,0],[-2,0]
  ];

  let found=false;

  for(const [dx,dz] of offsets){
    const x=a.group.position.x+dx;
    const z=a.group.position.z+dz;
    const y=height(Math.round(x),Math.round(z))+.51;

    if(!collision(x,y,z)){
      player.x=x;
      player.y=y;
      player.z=z;
      found=true;
      break;
    }
  }

  if(!found){
    player.x=a.group.position.x;
    player.z=a.group.position.z;
    player.y=a.group.position.y+a.cfg.seat+1;
  }

  player.vx=player.vy=player.vz=0;
  $("rideStatus").hidden=true;

  notify("Dismounted");
}

function updateRiding(dt){
  const a=mounted;
  if(!a) return;

  const m=movementVector();
  a.moving=m.moving;

  if(m.moving){
    const speed=a.cfg.speed*
      (keys.ControlLeft?1.2:1);

    const nx=a.group.position.x+m.x*speed*dt;
    const nz=a.group.position.z+m.z*speed*dt;

    const gy=height(Math.round(nx),Math.round(nz))+.5;

    const blocked=solid(block(
      Math.round(nx),
      Math.round(gy+1),
      Math.round(nz)
    ));

    if(
      !blocked &&
      Math.abs(gy-a.group.position.y)<=1.1
    ){
      a.group.position.x=nx;
      a.group.position.z=nz;
    }

    a.angle=Math.atan2(-m.x,-m.z);
  }

  if(keys.Space&&a.grounded){
    a.vy=a.cfg.jump;
    a.grounded=false;
  }

  if(!a.grounded){
    a.vy-=24*dt;
    a.group.position.y+=a.vy*dt;
  }

  const ground=height(
    Math.round(a.group.position.x),
    Math.round(a.group.position.z)
  )+.5;

  if(a.group.position.y<=ground){
    a.group.position.y=ground;
    a.vy=0;
    a.grounded=true;
  }

  player.x=a.group.position.x;
  player.z=a.group.position.z;
  player.y=a.group.position.y+a.cfg.seat-1.2;
  player.vx=player.vy=player.vz=0;
}

/* =====================================================
   INVENTORY, CRAFTING AND LAB
   ===================================================== */

function entry(title,description,actions){
  const row=document.createElement("div");
  row.className="entry";

  const info=document.createElement("div");
  info.className="info";

  const strong=document.createElement("strong");
  strong.textContent=title;

  const small=document.createElement("small");
  small.textContent=description;

  info.append(strong,small);
  row.append(info);

  for(const [label,callback,disabled] of actions){
    const button=document.createElement("button");
    button.textContent=label;
    button.disabled=!!disabled;
    button.onclick=callback;
    row.append(button);
  }

  $("entries").append(row);
}

function openPanel(type,chest=""){
  panel=type;
  chestKey=chest;

  $("panel").hidden=false;
  $("menu").hidden=true;

  if(document.pointerLockElement){
    document.exitPointerLock();
  }

  drawPanel();
}

function closePanel(){
  panel="";
  $("panel").hidden=true;

  renderer.domElement.requestPointerLock()
    .catch(()=>{$("menu").hidden=false;});
}

$("close").onclick=closePanel;

function craft(output,count,ingredients){
  const possible=Object.entries(ingredients).every(
    ([id,n])=>(inventory[id]||0)>=n
  );

  if(!possible) return;

  for(const [id,n] of Object.entries(ingredients)){
    take(id,n);
  }

  add(output,count);
  drawPanel();
  notify(`Crafted ${itemName(output)}`);
}

function recipeRows(recipes){
  for(const [output,count,ingredients] of recipes){
    const possible=Object.entries(ingredients).every(
      ([id,n])=>(inventory[id]||0)>=n
    );

    const detail=Object.entries(ingredients)
      .map(([id,n])=>`${n} ${itemName(normalizeId(id))}`)
      .join(" + ");

    entry(
      `${itemIcon(output)} ${itemName(output)} ×${count}`,
      detail,
      [[
        "CRAFT",
        ()=>craft(output,count,ingredients),
        !possible
      ]]
    );
  }
}

function drawPanel(){
  if(!panel) return;

  $("entries").replaceChildren();

  const titles={
    inventory:"🎒 INVENTORY",
    crafting:"🔨 CRAFTING",
    chemistry:"⚗️ CHEMISTRY LAB",
    furnace:"🔥 FURNACE",
    trading:"💚 VILLAGER TRADING",
    chest:"📦 CHEST"
  };

  $("panelTitle").textContent=titles[panel];
  $("help").textContent=
    "Select an item or choose an action.";

  if(panel==="inventory"){
    for(const [id,count] of Object.entries(inventory)){
      if(count<=0) continue;
      const item=normalizeId(id);

      entry(
        `${itemIcon(item)} ${itemName(item)}`,
        `Quantity: ${count}`,
        [[
          "SELECT",
          ()=>{
            slots[selected]=item;
            closePanel();
          }
        ]]
      );
    }
  }

  if(panel==="crafting") recipeRows(RECIPES);
  if(panel==="chemistry") recipeRows(CHEMISTRY);
  if(panel==="furnace") recipeRows(SMELTING);

  if(panel==="trading"){
    recipeRows([
      ["emerald",1,{wheat:5}],
      [B.PLANKS,8,{emerald:1}]
    ]);
  }

  if(panel==="chest"){
    chestData[chestKey] ||= {};
    const contents=chestData[chestKey];

    for(const [id,count] of Object.entries(inventory)){
      if(count<=0) continue;

      entry(
        `${itemName(normalizeId(id))} — Bag`,
        `${count} available`,
        [[
          "STORE 1",
          ()=>{
            if(take(id)){
              contents[id]=(contents[id]||0)+1;
              drawPanel();
            }
          }
        ]]
      );
    }

    for(const [id,count] of Object.entries(contents)){
      if(count<=0) continue;

      entry(
        `${itemName(normalizeId(id))} — Chest`,
        `${count} stored`,
        [[
          "TAKE 1",
          ()=>{
            contents[id]--;
            add(id);
            drawPanel();
          }
        ]]
      );
    }
  }
}

/* =====================================================
   SAVE GAME
   ===================================================== */

function saveGame(silent=false){
  try{
    localStorage.setItem(SAVE,JSON.stringify({
      edits:[...edits],
      chests:chestData,
      inventory,
      slots,
      cropAges:[...cropAges],
      position:[player.x,player.y,player.z],
      health,food
    }));

    if(!silent) notify("World saved");
  }catch{
    notify("Unable to save world");
  }
}

let resetting=false;

$("reset").onclick=()=>{
  if(!confirm("Delete saved BLOCKVERSE world?")) return;

  resetting=true;
  localStorage.removeItem(SAVE);
  location.reload();
};

window.addEventListener("beforeunload",()=>{
  if(!resetting) saveGame(true);
});

/* =====================================================
   INPUT AND CONTROLS
   ===================================================== */

$("play").onclick=()=>{
  renderer.domElement.requestPointerLock();
};

renderer.domElement.addEventListener("click",()=>{
  if(!playing&&!panel){
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange",()=>{
  playing=document.pointerLockElement===renderer.domElement;

  $("menu").hidden=playing||!!panel;
  $("hud").hidden=!playing;

  if(!playing){
    for(const k of Object.keys(keys)) keys[k]=false;
  }
});

document.addEventListener("mousemove",e=>{
  if(!playing) return;

  player.yaw-=e.movementX*.0022;
  player.pitch=THREE.MathUtils.clamp(
    player.pitch-e.movementY*.0022,
    -1.48,1.48
  );
});

document.addEventListener("keydown",e=>{
  if([
    "Space","ArrowUp","ArrowDown","F5"
  ].includes(e.code)){
    e.preventDefault();
  }

  if(panel&&e.code==="Escape"){
    closePanel();
    return;
  }

  keys[e.code]=true;
  if(!playing||e.repeat) return;

  if(mounted&&[
    "ShiftLeft","ShiftRight"
  ].includes(e.code)){
    dismount();
    return;
  }

  if(e.code==="F5"){
    cameraMode=(cameraMode+1)%3;
    $("viewLabel").textContent=[
      "First Person",
      "Third Person — Back",
      "Third Person — Front"
    ][cameraMode];

    notify($("viewLabel").textContent);
  }

  if(/^Digit[1-9]$/.test(e.code)){
    selected=Number(e.code.slice(-1))-1;
  }

  if(e.code==="KeyE") openPanel("inventory");
  if(e.code==="KeyC") openPanel("crafting");
  if(e.code==="KeyH") openPanel("chemistry");
  if(e.code==="KeyP") saveGame();

  if(e.code==="KeyF"){
    flying=!flying;
    player.vy=0;
    notify(flying?"Flying ON":"Flying OFF");
  }

  if(e.code==="KeyG"){
    creative=!creative;
    notify(creative?"CREATIVE":"SURVIVAL");
  }

  if(e.code==="KeyV"){
    if(mounted) dismount();

    player.x=40;
    player.y=5.51;
    player.z=28;
    player.vx=player.vy=player.vz=0;

    lastCenter="";
    notify("Welcome to the village");
  }

  if(e.code==="KeyR"){
    if(take("bread")){
      food=Math.min(20,food+5);
      notify("Ate bread");
    }else if(take("apple")){
      food=Math.min(20,food+4);
      notify("Ate apple");
    }else if(take("cooked")){
      food=Math.min(20,food+6);
      notify("Ate cooked meat");
    }else{
      notify("No edible food selected");
    }
  }
});

document.addEventListener("keyup",e=>{
  keys[e.code]=false;
});

document.addEventListener("contextmenu",e=>{
  e.preventDefault();
});

/* =====================================================
   BLOCK AND MOB TARGETING
   ===================================================== */

const look=new THREE.Vector3();
const raycaster=new THREE.Raycaster();

function trace(){
  // Ray comes from the player's eyes, so placing and
  // mining still work in third-person camera modes.
  const origin=new THREE.Vector3(
    player.x,player.y+1.62,player.z
  );

  const direction=new THREE.Vector3(
    -Math.sin(player.yaw)*Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw)*Math.cos(player.pitch)
  );

  let previous=null;
  let last="";

  for(let d=.05;d<=REACH;d+=.055){
    const x=Math.floor(origin.x+direction.x*d+.5);
    const y=Math.floor(origin.y+direction.y*d+.5);
    const z=Math.floor(origin.z+direction.z*d+.5);

    const k=key(x,y,z);
    if(k===last) continue;
    last=k;

    const id=block(x,y,z);

    if(id!==B.AIR){
      return {x,y,z,id,place:previous,distance:d};
    }

    previous={x,y,z};
  }

  return null;
}

function mobTarget(){
  const groups=[
    ...villagers.map(v=>v.group),
    ...animals.map(a=>a.group)
  ];

  if(!groups.length) return null;

  const origin=new THREE.Vector3(
    player.x,player.y+1.62,player.z
  );

  const direction=new THREE.Vector3(
    -Math.sin(player.yaw)*Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw)*Math.cos(player.pitch)
  );

  raycaster.set(origin,direction);
  raycaster.far=REACH;

  const hits=raycaster.intersectObjects(groups,true);
  if(!hits.length) return null;

  let object=hits[0].object;

  while(object.parent&&!object.userData.kind){
    object=object.parent;
  }

  const villager=villagers.find(v=>v.group===object);
  const animal=animals.find(a=>a.group===object);

  if(villager){
    return {
      kind:"villager",
      value:villager,
      distance:hits[0].distance
    };
  }

  if(animal){
    return {
      kind:"animal",
      value:animal,
      distance:hits[0].distance
    };
  }

  return null;
}

/* =====================================================
   MINING, HARVESTING AND PLACING
   ===================================================== */

function mine(target){
  if(!target||target.id===B.BEDROCK) return;

  if(target.id===B.TNT){
    explode(target.x,target.y,target.z);
    return;
  }

  if(target.id===B.CROPS){
    harvestCrop(target.x,target.y,target.z);
    return;
  }

  if(changeBlock(
    target.x,target.y,target.z,B.AIR
  )){
    if(target.id===B.LEAVES&&Math.random()<.25){
      add("apple");
    }else if(![
      B.WATER,B.LAVA,B.FIRE
    ].includes(target.id)){
      add(target.id);
    }

    notify(`Mined ${itemName(target.id)}`);
  }
}

function interact(target){
  if(!target) return;

  const held=slots[selected];

  if(
    [B.WATER,B.LAVA].includes(target.id) &&
    held==="bucket" && take("bucket")
  ){
    add(
      target.id===B.WATER
        ?"water_bucket":"lava_bucket"
    );

    changeBlock(
      target.x,target.y,target.z,B.AIR
    );
    notify("Bucket filled");
    return;
  }

  if(target.id===B.CHEST){
    openPanel("chest",key(target.x,target.y,target.z));
    return;
  }

  if(target.id===B.FURNACE){
    openPanel("furnace");
    return;
  }

  if(target.id===B.LAB){
    openPanel("chemistry");
    return;
  }

  if(target.id===B.FARMLAND){
    plantSeed(target.x,target.y,target.z);
    return;
  }

  if(target.id===B.CROPS){
    harvestCrop(target.x,target.y,target.z);
    return;
  }

  if(target.id===B.TNT){
    explode(target.x,target.y,target.z);
    return;
  }

  if(!target.place) return;

  const {x,y,z}=target.place;
  if(block(x,y,z)!==B.AIR) return;

  if(held==="water_bucket"||held==="lava_bucket"){
    if(!take(held)) return;

    add("bucket");

    changeBlock(
      x,y,z,
      held==="water_bucket"?B.WATER:B.LAVA
    );
    return;
  }

  if(held==="seeds"){
    // Plant by aiming at the farmland underneath.
    if(block(x,y-1,z)===B.FARMLAND){
      plantSeed(x,y-1,z);
    }else{
      notify("Seeds require farmland");
    }
    return;
  }

  if(
    typeof held!=="number" ||
    [B.AIR,B.BEDROCK,B.WATER,B.LAVA].includes(held)
  ) return;

  const overlaps=
    x+.5>player.x-.3 &&
    x-.5<player.x+.3 &&
    y+.5>player.y &&
    y-.5<player.y+1.8 &&
    z+.5>player.z-.3 &&
    z-.5<player.z+.3;

  if(overlaps) return;

  if(!creative&&!take(held)){
    notify(`No ${itemName(held)} available`);
    return;
  }

  changeBlock(x,y,z,held);
  notify(`Placed ${itemName(held)}`);
}

let cooldown=0;

document.addEventListener("mousedown",e=>{
  if(!playing||cooldown>0) return;

  const target=trace();
  const mob=mobTarget();

  if(
    mob &&
    (!target||mob.distance<target.distance)
  ){
    if(e.button===2&&mob.kind==="animal"){
      if(!mounted) mountAnimal(mob.value);
      cooldown=.2;
      return;
    }

    if(e.button===2&&mob.kind==="villager"){
      openPanel("trading");
      return;
    }

    if(e.button===0&&mob.kind==="animal"){
      const animal=mob.value;

      if(animal===mounted) return;

      animal.hp--;

      if(animal.hp<=0){
        scene.remove(animal.group);
        const i=animals.indexOf(animal);
        if(i>=0) animals.splice(i,1);

        add("meat",2);
        notify("Collected raw meat");
      }

      cooldown=.2;
      return;
    }
  }

  if(e.button===0) mine(target);
  if(e.button===2) interact(target);

  cooldown=.14;
});

/* =====================================================
   HOTBAR
   ===================================================== */

const hotbar=$("hotbar");

for(let i=0;i<9;i++){
  const div=document.createElement("div");
  div.className="slot";

  const icon=document.createElement("span");
  const count=document.createElement("small");

  div.append(icon,count);
  hotbar.append(div);
}

function updateHotbar(){
  [...hotbar.children].forEach((div,i)=>{
    const id=slots[i];

    div.classList.toggle("active",selected===i);
    div.classList.toggle(
      "empty",(inventory[id]||0)<=0
    );

    div.querySelector("span").textContent=
      itemIcon(id);

    div.querySelector("small").textContent=
      inventory[id]||0;
  });

  const held=slots[selected];

  $("selection").textContent=
    `${itemName(held)} (${inventory[held]||0})`;
}

/* =====================================================
   MAIN GAME LOOP
   ===================================================== */

const clock=new THREE.Clock();

let fpsFrames=0;
let fpsTime=0;
let uiTimer=0;
let physicsTimer=0;
let hungerTimer=0;
let saveTimer=0;
let dayTime=0;

stream();
updateHotbar();

function animate(){
  requestAnimationFrame(animate);

  const dt=Math.min(.04,clock.getDelta());
  gameSeconds+=dt;

  fpsFrames++;
  fpsTime+=dt;

  if(fpsTime>=1){
    $("fps").textContent=
      `FPS ${Math.round(fpsFrames/fpsTime)}`;

    fpsFrames=0;
    fpsTime=0;
  }

  if(playing){
    updatePlayer(dt);
    updatePlayerModel(dt);
    updateCamera();

    stream();
    spawnAnimals();

    if(
      Math.abs(player.x-42)<40 &&
      Math.abs(player.z-29)<40
    ){
      spawnVillagers();
    }

    updateAnimals(dt);
    updateVillagers(dt);
    updateCrops(dt);

    cooldown=Math.max(0,cooldown-dt);

    hungerTimer+=dt;
    saveTimer+=dt;
    uiTimer+=dt;

    if(hungerTimer>=6){
      hungerTimer=0;

      if(!creative){
        food=Math.max(0,food-1);
        if(food===0){
          health=Math.max(0,health-1);
        }
      }
    }

    if(saveTimer>=45){
      saveTimer=0;
      saveGame(true);
    }

    if(uiTimer>=.13){
      uiTimer=0;

      $("coords").textContent=
        `XYZ ${Math.floor(player.x)} `+
        `${Math.floor(player.y)} `+
        `${Math.floor(player.z)}`;

      $("biome").textContent=biome(
        Math.floor(player.x),
        Math.floor(player.z)
      );

      $("health").textContent=Math.ceil(health);
      $("food").textContent=Math.ceil(food);
      $("mode").textContent=
        creative?"CREATIVE":"SURVIVAL";

      $("chunks").textContent=
        `Chunks ${chunks.size}`;

      const mob=mobTarget();
      const target=trace();

      $("targetName").textContent=
        mob&&(!target||mob.distance<target.distance)
          ?mob.kind==="animal"
            ?`${mob.value.type.toUpperCase()} — Right-click to ride`
            :`${mob.value.job.toUpperCase()} — Right-click to trade`
          :target
            ?target.id===B.CROPS
              ?`Wheat — Growth ${cropAge(
                target.x,target.y,target.z
              )+1}/4`
              :itemName(target.id)
            :"";

      updateHotbar();
    }
  }

  physicsTimer+=dt;

  if(physicsTimer>=.1){
    physicsTimer=0;
    updatePhysics();
  }

  dayTime+=dt*.013;

  const daylight=.5+.5*Math.cos(dayTime);

  ambient.intensity=.55+daylight*1.35;
  sun.intensity=.25+daylight*1.3;

  scene.background.setRGB(
    .07+daylight*.47,
    .10+daylight*.69,
    .20+daylight*.73
  );

  processChunks();

  if(noticeTimer>0){
    noticeTimer-=dt;

    if(noticeTimer<=0){
      $("notice").textContent="";
    }
  }

  renderer.render(scene,camera);
}

updateCamera();
animate();

window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
