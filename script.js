
import * as THREE from 'https://esm.sh/three@0.180.0';

// GALAXY BLOCKVERSE — OCEANS, VILLAGES & SURVIVAL
const $ = id => document.getElementById(id);
const STORE = 'galaxy-blockverse-ocean-v2';
const CS = 12, RADIUS = 1, BOTTOM = -96;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91cfff);
scene.fog = new THREE.Fog(0x91cfff,24,75);

const camera = new THREE.PerspectiveCamera(
  75,innerWidth/innerHeight,0.05,110
);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(
  0xe2efff,0x5e7246,1.85
);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffefce,1.6);
sun.position.set(20,45,25);
scene.add(sun);

// ITEMS AND BLOCKS
const ITEMS = {
  grass:{name:'Grass',icon:'🟩',color:0x59b941,block:true},
  dirt:{name:'Dirt',icon:'🟫',color:0x8b5a38,block:true},
  stone:{name:'Stone',icon:'🪨',color:0x858b93,block:true},
  wood:{name:'Wood',icon:'🪵',color:0x95643c,block:true},
  leaves:{name:'Leaves',icon:'🍃',color:0x2e9147,block:true},
  sand:{name:'Sand',icon:'🏖️',color:0xe4cf8a,block:true},
  fence:{name:'Fence',icon:'🚧',color:0x976842,block:true},
  planks:{name:'Wood Planks',icon:'🪵',color:0xc18d54,block:true},
  glass:{name:'Glass',icon:'🪟',color:0x9edcf2,block:true},
  chest:{name:'Chest',icon:'📦',color:0xa47439,block:true},
  furnace:{name:'Furnace',icon:'🔥',color:0x555961,block:true},
  wheat:{name:'Wheat',icon:'🌾',color:0xc4b54b},
  raw_meat:{name:'Raw Meat',icon:'🥩',color:0xbf6266},
  cooked_meat:{name:'Cooked Meat',icon:'🍖',color:0x995734},
  coal:{name:'Coal',icon:'⚫',color:0x282c32},
  iron:{name:'Iron Ore',icon:'🔩',color:0xc58e69},
  diamond:{name:'Diamond',icon:'💎',color:0x4fcbd7},
  arrows:{name:'Arrows',icon:'🏹',color:0xdac89a},
  wood_sword:{name:'Wood Sword',icon:'🗡️',damage:5},
  stone_sword:{name:'Stone Sword',icon:'⚔️',damage:7},
  iron_sword:{name:'Iron Sword',icon:'⚔️',damage:9},
  diamond_sword:{name:'Diamond Sword',icon:'💎',damage:12},
  axe:{name:'Axe',icon:'🪓',damage:7},
  pickaxe:{name:'Pickaxe',icon:'⛏️',damage:4},
  bow:{name:'Bow',icon:'🏹',damage:7},
  shield:{name:'Shield',icon:'🛡️'},
  gold:{name:'Gold Ore',icon:'🟨',color:0xddac2e},
  copper:{name:'Copper Ore',icon:'🟠',color:0xb46d48},
  emerald:{name:'Emerald',icon:'💚',color:0x24c56b},
  lava:{name:'Lava',icon:'🌋',color:0xf55c17},
  bedrock:{name:'Bedrock',icon:'⬛',color:0x262a2e},
  seeds:{name:'Seeds',icon:'🌱'},
  carrot:{name:'Carrot',icon:'🥕'},
  potato:{name:'Potato',icon:'🥔'},
  crops:{name:'Crops',icon:'🌾',color:0x85b53a,block:true},
  farmland:{name:'Farmland',icon:'🟤',color:0x65442a,block:true},
  bed:{name:'Bed',icon:'🛏️',color:0xb94d54,block:true},
  lead:{name:'Lead / Rope',icon:'🪢'},
  saddle:{name:'Saddle',icon:'🏇'},
  gold_sword:{name:'Gold Sword',icon:'🗡️',damage:8},
  netherite_sword:{
    name:'Netherite Sword',icon:'⚔️',damage:14
  }
};

const HOTBAR = [
  'grass','dirt','stone','wood','leaves',
  'sand','fence','planks','glass'
];

const RECIPES = [
  ['planks',4,{wood:1}],
  ['fence',4,{planks:4}],
  ['chest',1,{planks:8}],
  ['furnace',1,{stone:8}],
  ['glass',4,{sand:4,coal:1}],
  ['wood_sword',1,{planks:2,wood:1}],
  ['stone_sword',1,{stone:2,wood:1}],
  ['iron_sword',1,{iron:2,wood:1}],
  ['diamond_sword',1,{diamond:2,wood:1}],
  ['axe',1,{stone:3,wood:2}],
  ['pickaxe',1,{stone:3,wood:2}],
  ['bow',1,{wood:3,leaves:2}],
  ['shield',1,{planks:6,iron:1}],
  ['arrows',8,{stone:1,wood:1}],
  ['bed',1,{planks:3,leaves:3}],
  ['lead',2,{leaves:4,wood:1}],
  ['saddle',1,{planks:4,iron:2}],
  ['farmland',4,{dirt:4}],
  ['crops',4,{seeds:4}],
  ['gold_sword',1,{gold:2,wood:1}],
  ['netherite_sword',1,{diamond:4,gold:4,iron:4}],
  ['cooked_meat',1,{raw_meat:1,wood:1}]
];

// SAVE DATA
let save = {};
try {
  save = JSON.parse(localStorage.getItem(STORE)||'{}');
} catch {
  save = {};
}

const edits = new Map(
  Array.isArray(save.edits)?save.edits:[]
);
const chests = save.chests &&
  typeof save.chests==='object' ? save.chests : {};

const inv = {
  grass:20,dirt:20,stone:12,wood:12,leaves:8,
  sand:12,fence:8,planks:8,glass:4,
  raw_meat:0,cooked_meat:3,arrows:12,
  seeds:6,carrot:4,potato:3,lead:1,
  saddle:1,crops:6,farmland:6,bed:1
};

for(const [k,v] of Object.entries(save.inv||{})){
  if(ITEMS[k] && Number.isInteger(v) && v>=0 && v<100000){
    inv[k]=v;
  }
}

let selected=0, equipped='fists';
let xp=0,level=1,health=100,hunger=100;

if(save.stats){
  health=Math.max(1,Math.min(100,save.stats.health||100));
  hunger=Math.max(0,Math.min(100,save.stats.hunger??100));
  level=Math.max(1,save.stats.level||1);
  xp=Math.max(0,save.stats.xp||0);
}

if(ITEMS[save.equipped] && (inv[save.equipped]||0)>0){
  equipped=save.equipped;
}

// INFINITE HORIZONTAL TERRAIN
const hash=(x,z)=>{
  const v=Math.sin(x*127.1+z*311.7)*43758.5453;
  return v-Math.floor(v);
};

const heightCache=new Map();
const treeCache=new Map();

function height(x,z){
  const k=`${x},${z}`;
  if(heightCache.has(k))return heightCache.get(k);

  const continental =
    Math.sin(x*.013)+
    Math.cos(z*.016)+
    Math.sin((x-z)*.009);

  let h=Math.floor(
    continental*6-3+
    Math.sin(x*.11)*2+
    Math.cos(z*.09)*2
  );

  if(Math.hypot(x,z-4)<17)h=Math.max(h,3);

  if(x>=37&&x<=60&&z>=14&&z<=34)h=4;

  heightCache.set(k,h);
  return h;
}

function treeAt(x,z){
  const k=`${x},${z}`;
  if(treeCache.has(k))return treeCache.get(k);

  const result =
    x%7===0 &&
    z%7===0 &&
    hash(x/7,z/7)>.45 &&
    height(x,z)>2 &&
    !(x>=34&&x<=64&&z>=11&&z<=37) &&
    Math.hypot(x,z-4)>9;

  treeCache.set(k,result);
  return result;
}

function cave(x,y,z){
  if(y>-5 || y<BOTTOM+2)return false;
  const n=
    Math.sin(x*.14+y*.11)+
    Math.cos(z*.12-y*.09)+
    Math.sin((x+z)*.075+y*.15);
  return n>2.34;
}

function village(x,y,z){
  if(x<37||x>60||z<14||z>34)return null;

  const h=4;
  for(const [cx,cz] of [[42,20],[55,26]]){
    if(x>=cx-3&&x<=cx+3&&z>=cz-3&&z<=cz+3){
      const edge =
        x===cx-3||x===cx+3||
        z===cz-3||z===cz+3;

      if(y===h+1&&edge&&x===cx&&z===cz-3)
        return null;

      if(y>=h+1&&y<=h+3&&edge){
        if(
          y===h+2 &&
          ((x===cx&&z===cz+3)||
           (x===cx+3&&z===cz))
        )return 'glass';

        return 'planks';
      }

      if(y===h+4)return 'wood';
    }
  }

  if(y===h+1&&x>=38&&x<=45&&z===28)
    return 'farmland';

  if(y===h+2&&x>=38&&x<=45&&z===28)
    return 'crops';

  if(y===h+1&&x>=46&&x<=51&&z===20)
    return 'fence';

  if(y===h+1&&x===42&&z===22)
    return 'chest';

  if(y===h+1&&x===54&&z===27)
    return 'bed';

  return null;
}

function natural(x,y,z){
  if(y<=BOTTOM)return 'bedrock';

  const h=height(x,z);

  if(x>=37&&x<=60&&z>=14&&z<=34){
    const structure=village(x,y,z);
    if(structure)return structure;
  }

  // Trees can cross chunk boundaries.
  for(let tx=Math.floor((x-2)/7)*7;tx<=x+2;tx+=7){
    for(let tz=Math.floor((z-2)/7)*7;tz<=z+2;tz+=7){
      if(!treeAt(tx,tz))continue;
      const th=height(tx,tz);
      const dx=Math.abs(x-tx);
      const dz=Math.abs(z-tz);

      if(dx===0&&dz===0&&y>th&&y<=th+4)
        return 'wood';

      if(dx<=2&&dz<=2&&dx+dz<4&&
         y>=th+3&&y<=th+6)
        return 'leaves';
    }
  }

  if(y>h)return null;
  if(y===h)return h<=0?'sand':'grass';
  if(y>=h-3)return 'dirt';

  if(cave(x,y,z)){
    if(
      y<-48 &&
      Math.sin(x*.27+z*.12)+
      Math.cos(z*.2-y*.14)>1.25
    )return 'lava';

    return null;
  }

  const ore=hash(x*13+y*7,z*17+y*11);

  if(y<-42&&ore>.987)return 'diamond';
  if(y<-30&&ore>.977)return 'gold';
  if(y<-10&&ore>.972)return 'iron';
  if(y<-6&&ore>.968)return 'copper';
  if(y<-20&&ore>.992)return 'emerald';
  if(y<h-5&&ore>.947)return 'coal';

  return 'stone';
}

function block(x,y,z){
  const k=`${x},${y},${z}`;
  return edits.has(k)?edits.get(k):natural(x,y,z);
}

function change(x,y,z,id){
  if(y<=BOTTOM||y>55)return false;
  edits.set(`${x},${y},${z}`,id);
  rebuildNearby(x,z);
  return true;
}

// CHUNK MESH GENERATION
const chunks=new Map();
const waterChunks=new Map();

const dirs=[
  [1,0,0],[-1,0,0],
  [0,1,0],[0,-1,0],
  [0,0,1],[0,0,-1]
];

const faces=[
  {
    n:[1,0,0],
    p:[
      [.5,-.5,-.5],[.5,.5,-.5],
      [.5,.5,.5],[.5,-.5,.5]
    ],
    s:.82
  },
  {
    n:[-1,0,0],
    p:[
      [-.5,-.5,.5],[-.5,.5,.5],
      [-.5,.5,-.5],[-.5,-.5,-.5]
    ],
    s:.8
  },
  {
    n:[0,1,0],
    p:[
      [-.5,.5,-.5],[-.5,.5,.5],
      [.5,.5,.5],[.5,.5,-.5]
    ],
    s:1.1
  },
  {
    n:[0,-1,0],
    p:[
      [-.5,-.5,.5],[-.5,-.5,-.5],
      [.5,-.5,-.5],[.5,-.5,.5]
    ],
    s:.58
  },
  {
    n:[0,0,1],
    p:[
      [.5,-.5,.5],[.5,.5,.5],
      [-.5,.5,.5],[-.5,-.5,.5]
    ],
    s:.92
  },
  {
    n:[0,0,-1],
    p:[
      [-.5,-.5,-.5],[-.5,.5,-.5],
      [.5,.5,-.5],[.5,-.5,-.5]
    ],
    s:.76
  }
];

const voxelMat=new THREE.MeshLambertMaterial({
  vertexColors:true,
  side:THREE.FrontSide
});

function buildChunk(cx,cz){
  const positions=[];
  const colors=[];
  const normals=[];
  const indices=[];

  const x0=cx*CS;
  const z0=cz*CS;

  for(let x=x0;x<x0+CS;x++){
    for(let z=z0;z<z0+CS;z++){
      const ymax=height(x,z)+7;

      for(let y=BOTTOM+1;y<=ymax;y++){
        const id=block(x,y,z);
        if(!id)continue;

        const rgb=new THREE.Color(
          ITEMS[id]?.color||0x888888
        );
        const jitter=.93+
          hash(x+y*71,z+y*13)*.13;

        for(let f=0;f<6;f++){
          const [dx,dy,dz]=dirs[f];

          if(block(x+dx,y+dy,z+dz))
            continue;

          const base=positions.length/3;

          for(const p of faces[f].p){
            positions.push(
              x+p[0],y+p[1],z+p[2]
            );

            normals.push(...faces[f].n);

            const s=faces[f].s*jitter;
            colors.push(
              Math.min(1,rgb.r*s),
              Math.min(1,rgb.g*s),
              Math.min(1,rgb.b*s)
            );
          }

          indices.push(
            base,base+1,base+2,
            base,base+2,base+3
          );
        }
      }
    }
  }

  const geo=new THREE.BufferGeometry();

  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions,3)
  );
  geo.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals,3)
  );
  geo.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors,3)
  );
  geo.setIndex(indices);
  geo.computeBoundingSphere();

  const mesh=new THREE.Mesh(geo,voxelMat);
  mesh.userData.terrain=true;
  scene.add(mesh);
  return mesh;
}

function disposeChunk(id){
  const mesh=chunks.get(id);
  if(mesh){
    scene.remove(mesh);
    mesh.geometry.dispose();
    chunks.delete(id);
  }

  const sea=waterChunks.get(id);
  if(sea){
    scene.remove(sea);
    sea.geometry.dispose();
    waterChunks.delete(id);
  }
}

const waterMat=new THREE.MeshPhongMaterial({
  color:0x258bce,
  transparent:true,
  opacity:.64,
  side:THREE.DoubleSide,
  depthWrite:false
});

function buildSea(cx,cz){
  const vertices=[];
  const indices=[];

  for(let x=cx*CS;x<(cx+1)*CS;x++){
    for(let z=cz*CS;z<(cz+1)*CS;z++){
      if(height(x,z)>0)continue;

      const b=vertices.length/3;
      vertices.push(
        x-.5,.54,z-.5,
        x+.5,.54,z-.5,
        x+.5,.54,z+.5,
        x-.5,.54,z+.5
      );
      indices.push(
        b,b+1,b+2,b,b+2,b+3
      );
    }
  }

  if(!indices.length)return;

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices,3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh=new THREE.Mesh(geometry,waterMat);
  scene.add(mesh);
  waterChunks.set(`${cx},${cz}`,mesh);
}

function rebuildNearby(x,z){
  const cx=Math.floor(x/CS);
  const cz=Math.floor(z/CS);

  for(let a=cx-1;a<=cx+1;a++){
    for(let b=cz-1;b<=cz+1;b++){
      const id=`${a},${b}`;
      if(chunks.has(id)){
        disposeChunk(id);
        chunks.set(id,buildChunk(a,b));
        buildSea(a,b);
      }
    }
  }
}

let previousChunk='';

function streamChunks(){
  const cx=Math.floor(camera.position.x/CS);
  const cz=Math.floor(camera.position.z/CS);
  const id=`${cx},${cz}`;

  if(previousChunk===id)return;
  previousChunk=id;

  const needed=new Set();

  for(let x=cx-RADIUS;x<=cx+RADIUS;x++){
    for(let z=cz-RADIUS;z<=cz+RADIUS;z++){
      needed.add(`${x},${z}`);
    }
  }

  for(const id of [...chunks.keys()]){
    if(!needed.has(id))disposeChunk(id);
  }

  for(const id of needed){
    if(!chunks.has(id)){
      const [x,z]=id.split(',').map(Number);
      chunks.set(id,buildChunk(x,z));
      buildSea(x,z);
    }
  }

  createNearbyMobs(cx,cz);
}

// PLAYER AND COLLISION
const player={
  vy:0,
  grounded:false,
  yaw:0,
  pitch:0,
  flying:false,
  creative:false
};

camera.position.set(0,height(0,4)+2.3,4);

if(
  Array.isArray(save.pos)&&
  save.pos.length===3&&
  save.pos.every(Number.isFinite)&&
  save.pos[1]>BOTTOM+2
){
  camera.position.fromArray(save.pos);
}

const keys={};
const movement=new THREE.Vector3();

function solid(x,y,z){
  const b=block(
    Math.round(x),
    Math.round(y),
    Math.round(z)
  );
  return !!b && b!=='leaves';
}

function collision(p){
  for(const dx of [-.27,.27]){
    for(const dz of [-.27,.27]){
      for(const dy of [-1.48,-.85,-.12]){
        if(solid(
          p.x+dx,p.y+dy,p.z+dz
        ))return true;
      }
    }
  }
  return false;
}

function moveAxis(axis,step){
  const n=camera.position.clone();
  n[axis]+=step;

  if(!collision(n)){
    camera.position[axis]=n[axis];
    return true;
  }
  return false;
}

// ANIMAL AND MONSTER MODELS
const mobs=[];
const spawned=new Set();

const mobColors={
  cow:0xe5e2d8,
  pig:0xf3a6b5,
  sheep:0xf5f4e8,
  chicken:0xf8f0d6,
  horse:0x805636,
  wolf:0x9a9993,
  fish:0xec9b32,
  squid:0x315b81,
  villager:0xbba18a,
  zombie:0x5a9b65,
  skeleton:0xd6d2c5,
  spider:0x383442,
  creeper:0x449d40
};

function bodyPart(g,w,h,d,color,x,y,z){
  const m=new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    new THREE.MeshLambertMaterial({color})
  );
  m.position.set(x,y,z);
  g.add(m);
  return m;
}

function createMob(kind,x,z){
  const g=new THREE.Group();
  const legs=[];

  const small=
    kind==='chicken'||kind==='fish';

  const hostile=[
    'zombie','skeleton','spider','creeper'
  ].includes(kind);

  const c=mobColors[kind];

  const w=small?.5:.85;
  const l=small?.65:1.2;
  const by=small?.5:.82;

  bodyPart(g,w,.65,l,c,0,by,0);

  bodyPart(
    g,
    small?.4:.53,.5,.48,
    c,0,by+.17,-l/2-.19
  );

  for(const xx of [-w*.3,w*.3]){
    for(const zz of [-l*.3,l*.3]){
      legs.push(
        bodyPart(
          g,.16,.4,.16,
          hostile?0x454049:0x7b726d,
          xx,.22,zz
        )
      );
    }
  }

  for(const xx of [-.15,.15]){
    bodyPart(
      g,.09,.09,.05,
      hostile?0xff3333:0x111111,
      xx,by+.24,-l/2-.46
    );
  }

  // Distinguishing animal features.
  if(kind==='pig'||kind==='cow'){
    bodyPart(
      g,.28,.18,.14,
      kind==='pig'?0xd98391:0xdca3a7,
      0,by+.08,-l/2-.5
    );
  }

  if(kind==='chicken'){
    bodyPart(
      g,.2,.13,.2,
      0xffc12f,0,by+.08,-l/2-.47
    );
  }

  if(kind==='horse'){
    bodyPart(g,.18,.55,.18,0x30221b,0,by+.35,.1);
    bodyPart(g,.2,.32,.16,0x30221b,0,by+.3,l/2+.1);
  }

  if(kind==='wolf'||kind==='horse'){
    for(const xx of [-.21,.21]){
      bodyPart(
        g,.14,.25,.16,c,
        xx,by+.55,-l/2-.2
      );
    }
  }

  if(kind==='creeper'){
    bodyPart(
      g,.3,.38,.06,
      0x17221c,0,by+.06,-l/2-.45
    );
  }

  if(kind==='villager'){
    bodyPart(
      g,.15,.19,.2,
      0xc08468,0,by+.15,-l/2-.46
    );
  }

  const aquatic=kind==='fish'||kind==='squid';

  g.position.set(
    x,
    aquatic?0:height(Math.round(x),Math.round(z))+.5,
    z
  );

  scene.add(g);

  const mob={
    g,legs,kind,hostile,
    hp:hostile?28:18,
    angle:hash(x,z)*6.28,
    timer:2,cooldown:0,
    led:false,ridden:false,love:0
  };

  g.userData.mob=mob;
  mobs.push(mob);
  return mob;
}

function createNearbyMobs(cx,cz){
  for(let a=cx-1;a<=cx+1;a++){
    for(let b=cz-1;b<=cz+1;b++){
      const id=`${a},${b}`;
      if(spawned.has(id))continue;

      spawned.add(id);

      for(let i=0;i<3;i++){
        const x=a*CS+Math.floor(
          hash(a*47+i,b*13)*CS
        );
        const z=b*CS+Math.floor(
          hash(a*31,b*17+i)*CS
        );

        const ocean=height(x,z)<=0;

        const kind=ocean
          ? ['fish','fish','squid'][
              Math.floor(hash(x*3,z*2)*3)
            ]
          : [
              'cow','pig','sheep','chicken',
              'horse','wolf','zombie',
              'skeleton','spider','creeper'
            ][Math.floor(hash(x*3,z*2)*10)];

        createMob(kind,x,z);
      }
    }
  }

  if(
    cx>=2&&cx<=5&&cz>=0&&cz<=3&&
    !spawned.has('village-people')
  ){
    spawned.add('village-people');
    createMob('villager',43,23);
    createMob('villager',55,23);
    createMob('horse',48,29);
  }

  for(let i=mobs.length-1;i>=0;i--){
    if(
      mobs[i].g.position.distanceTo(camera.position)>85
    ){
      scene.remove(mobs[i].g);
      mobs.splice(i,1);
    }
  }
}

let dayClock=Number.isFinite(save.dayClock)
  ? save.dayClock : 0;

let noticeTimer=0;
let damageTimer=0;
let ridden=null;

function tell(t){
  $('notice').textContent=t;
  noticeTimer=2.5;
}

function addItem(id,n=1){
  inv[id]=(inv[id]||0)+n;
}

function addXP(n){
  xp+=n;
  while(xp>=level*20){
    xp-=level*20;
    level++;
    tell(`Level ${level}!`);
  }
}

function killMob(m){
  scene.remove(m.g);
  mobs.splice(mobs.indexOf(m),1);

  if(!m.hostile){
    if(m.kind==='fish')addItem('raw_meat',1);

    if([
      'cow','pig','sheep','chicken'
    ].includes(m.kind)){
      addItem(
        'raw_meat',
        m.kind==='chicken'?1:2
      );
    }
  }else if(m.kind==='skeleton'){
    addItem('arrows',2);
  }

  addXP(m.hostile?7:3);
  tell(`Loot collected from ${m.kind}`);
}

function updateMobs(dt,time,night){
  for(const m of mobs){
    m.g.visible=!m.hostile||night;
    if(!m.g.visible)continue;

    m.timer-=dt;
    m.cooldown=Math.max(0,m.cooldown-dt);

    if(m.timer<0){
      m.timer=1+Math.random()*3;
      m.angle+=(Math.random()-.5)*2.7;
    }

    const dx=camera.position.x-m.g.position.x;
    const dz=camera.position.z-m.g.position.z;
    const d=Math.hypot(dx,dz);

    let speed=.7;

    if(m.ridden){
      m.g.position.set(
        camera.position.x,
        camera.position.y-1.15,
        camera.position.z
      );
      continue;
    }

    if(m.led&&d>2){
      m.angle=Math.atan2(-dx,-dz);
      speed=2.6;
    }

    if(m.love>0){
      m.love=Math.max(0,m.love-dt);
    }

    if(m.hostile&&d<12){
      m.angle=Math.atan2(-dx,-dz);
      speed=2;

      if(
        d<1.5 &&
        m.cooldown===0 &&
        !player.creative
      ){
        health=Math.max(
          0,
          health-(
            inv.shield?5:
            m.kind==='creeper'?18:
            m.kind==='skeleton'?6:8
          )
        );
        m.cooldown=1.5;
        tell('Monster attack!');
      }
    }

    const nx=m.g.position.x-
      Math.sin(m.angle)*speed*dt;

    const nz=m.g.position.z-
      Math.cos(m.angle)*speed*dt;

    const old=height(
      Math.round(m.g.position.x),
      Math.round(m.g.position.z)
    );

    const next=height(
      Math.round(nx),Math.round(nz)
    );

    const aquatic=
      m.kind==='fish'||m.kind==='squid';

    if(aquatic){
      if(next<=0){
        m.g.position.x=nx;
        m.g.position.z=nz;
        m.g.position.y=
          -.1+Math.sin(time*2+m.angle)*.1;
      }else{
        m.angle+=Math.PI;
      }
    }else if(
      Math.abs(next-old)<=1 &&
      next>0 &&
      ![
        'fence','wood','planks','glass','chest'
      ].includes(
        block(Math.round(nx),next+1,Math.round(nz))
      ) &&
      ![
        'fence','wood','planks','glass'
      ].includes(
        block(Math.round(nx),next+2,Math.round(nz))
      )
    ){
      m.g.position.set(nx,next+.5,nz);
    }else{
      m.angle+=Math.PI;
    }

    m.g.rotation.y=m.angle;

    m.legs.forEach((leg,i)=>{
      leg.rotation.x=
        Math.sin(time*6+i*Math.PI)*.3;
    });
  }
}

// INVENTORY, CRAFTING, CHESTS, FURNACE
let playing=false;
let panelType=null;
let currentChest=null;

function row(root,label,description,actions){
  const el=document.createElement('div');
  el.className='entry';

  const text=document.createElement('div');
  text.className='info';

  const strong=document.createElement('strong');
  strong.textContent=label;
  text.append(strong);

  if(description){
    const sm=document.createElement('small');
    sm.textContent=description;
    text.append(sm);
  }

  el.append(text);

  for(const [title,fn,disabled] of actions){
    const btn=document.createElement('button');
    btn.textContent=title;
    btn.disabled=!!disabled;
    btn.onclick=fn;
    el.append(btn);
  }

  root.append(el);
}

function showPanel(type,chestKey=null){
  panelType=type;
  currentChest=chestKey;

  $('panel').hidden=false;
  $('menu').hidden=true;

  document.exitPointerLock?.();
  drawPanel();
}

function hidePanel(){
  panelType=null;
  currentChest=null;

  $('panel').hidden=true;
  $('menu').hidden=true;

  renderer.domElement.requestPointerLock();
}

function drawPanel(){
  if(!panelType)return;

  const root=$('panelContent');
  root.replaceChildren();

  $('panelTitle').textContent={
    inventory:'🎒 INVENTORY',
    craft:'🔨 CRAFTING',
    chest:'📦 CHEST STORAGE',
    furnace:'🔥 FURNACE'
  }[panelType];

  $('panelHelp').textContent={
    inventory:'Select blocks for your hotbar or equip weapons.',
    craft:'Craft recipes from gathered resources.',
    chest:'Store and retrieve items. Chest contents are saved.',
    furnace:'Cook 1 raw meat using 1 wood or 1 coal.'
  }[panelType];

  if(panelType==='inventory'){
    for(const [id,n] of Object.entries(inv)){
      if(!n)continue;

      const actions=[];

      if(ITEMS[id]?.block){
        actions.push([
          'Select',
          ()=>{
            if(!HOTBAR.includes(id)){
              HOTBAR[selected]=id;
            }else{
              selected=HOTBAR.indexOf(id);
            }
            hidePanel();
          }
        ]);
      }

      if(ITEMS[id]?.damage){
        actions.push([
          'Equip',
          ()=>{
            equipped=id;
            hidePanel();
          }
        ]);
      }

      row(
        root,
        `${ITEMS[id]?.icon||'•'} ${ITEMS[id]?.name||id}`,
        `Quantity: ${n}`,
        actions
      );
    }
  }

  else if(panelType==='craft'){
    for(const [id,count,cost] of RECIPES){
      const possible=Object.entries(cost).every(
        ([item,n])=>(inv[item]||0)>=n
      );

      row(
        root,
        `${ITEMS[id].icon} ${count} ${ITEMS[id].name}`,
        Object.entries(cost)
          .map(([k,v])=>`${v} ${ITEMS[k].name}`)
          .join(' + '),
        [[
          'Craft',
          ()=>{
            if(!Object.entries(cost).every(
              ([k,n])=>(inv[k]||0)>=n
            ))return;

            for(const [k,n] of Object.entries(cost)){
              inv[k]-=n;
            }

            addItem(id,count);
            tell(`Crafted ${ITEMS[id].name}`);
            drawPanel();
          },
          !possible
        ]]
      );
    }
  }

  else if(panelType==='chest'){
    if(!chests[currentChest]){
      chests[currentChest]={};
    }

    const storage=chests[currentChest];

    for(const [id,n] of Object.entries(inv)){
      if(n>0){
        row(
          root,
          `${ITEMS[id].name} (bag)`,
          `${n} available`,
          [[
            'Store 1',
            ()=>{
              inv[id]--;
              storage[id]=(storage[id]||0)+1;
              drawPanel();
            }
          ]]
        );
      }
    }

    for(const [id,n] of Object.entries(storage)){
      if(n>0&&ITEMS[id]){
        row(
          root,
          `${ITEMS[id].name} (chest)`,
          `${n} stored`,
          [[
            'Take 1',
            ()=>{
              storage[id]--;
              addItem(id);
              drawPanel();
            }
          ]]
        );
      }
    }
  }

  else if(panelType==='furnace'){
    row(
      root,
      '🍖 Cook raw meat',
      `Raw: ${inv.raw_meat||0} · Wood: ${inv.wood||0} · Coal: ${inv.coal||0}`,
      [[
        'Cook',
        ()=>{
          if((inv.raw_meat||0)<1)return;

          const fuel=(inv.coal||0)>0
            ?'coal':'wood';

          if((inv[fuel]||0)<1)return;

          inv[fuel]--;
          inv.raw_meat--;
          addItem('cooked_meat');

          tell('Cooked one meal');
          drawPanel();
        },
        !(
          inv.raw_meat>0 &&
          (inv.wood>0||inv.coal>0)
        )
      ]]
    );
  }
}

$('closePanel').onclick=hidePanel;

function eat(){
  if(inv.cooked_meat>0){
    inv.cooked_meat--;
    hunger=Math.min(100,hunger+28);
    health=Math.min(100,health+4);
    tell('Ate cooked meat (+28 hunger)');
  }else if(inv.raw_meat>0){
    inv.raw_meat--;
    hunger=Math.min(100,hunger+8);

    if(Math.random()<.25){
      hunger=Math.max(0,hunger-12);
    }

    tell('Ate raw meat (less nutrition)');
  }else{
    tell('No food! Hunt animals or cook meat.');
  }
}

// SAVING AND RESETTING
function saveGame(silent=false){
  try{
    localStorage.setItem(
      STORE,
      JSON.stringify({
        edits:[...edits],
        chests,
        inv,
        equipped,
        pos:camera.position.toArray(),
        stats:{health,hunger,level,xp},
        dayClock
      })
    );

    if(!silent)tell('World saved');
  }catch{
    tell('Save unavailable: browser storage is full');
  }
}

let resettingWorld=false;

window.addEventListener('beforeunload',()=>{
  if(!resettingWorld)saveGame(true);
});

$('reset').onclick=()=>{
  if(confirm(
    'Erase this saved world, inventory, and chests?'
  )){
    resettingWorld=true;
    localStorage.removeItem(STORE);
    location.reload();
  }
};

$('play').onclick=()=>{
  $('panel').hidden=true;
  panelType=null;
  renderer.domElement.requestPointerLock();
};

document.addEventListener('pointerlockchange',()=>{
  playing=
    document.pointerLockElement===renderer.domElement;

  $('menu').hidden=playing||!!panelType;
  $('hud').hidden=!playing;

  if(!playing){
    for(const k of Object.keys(keys)){
      keys[k]=false;
    }
  }
});

document.addEventListener('mousemove',e=>{
  if(!playing)return;

  player.yaw-=e.movementX*.002;
  player.pitch=THREE.MathUtils.clamp(
    player.pitch-e.movementY*.002,
    -1.45,1.45
  );
});

document.addEventListener('keydown',e=>{
  if([
    'Space','ArrowUp','ArrowDown',
    'ArrowLeft','ArrowRight'
  ].includes(e.code)){
    e.preventDefault();
  }

  keys[e.code]=true;
  if(!playing||e.repeat)return;

  if(/^Digit[1-9]$/.test(e.code)){
    selected=Number(e.code.slice(-1))-1;
  }

  if(e.code==='KeyE')showPanel('inventory');
  if(e.code==='KeyC')showPanel('craft');
  if(e.code==='KeyR')eat();
  if(e.code==='KeyP')saveGame();

  if(e.code==='KeyF'){
    player.flying=!player.flying;
    player.vy=0;
    tell(player.flying?'Flying on':'Flying off');
  }

  if(e.code==='KeyG'){
    player.creative=!player.creative;
    tell(player.creative?'Creative mode':'Survival mode');
  }

  if(e.code==='KeyX'&&ridden){
    ridden.ridden=false;
    ridden=null;
    tell('Dismounted horse');
  }

  if(e.code==='KeyV'){
    camera.position.set(
      49,height(49,24)+2.3,24
    );
    streamChunks();
    tell('Visited village!');
  }

  if(e.code==='KeyQ'){
    const opts=[
      'fists',
      ...Object.keys(inv).filter(
        k=>ITEMS[k]?.damage&&inv[k]>0
      )
    ];

    equipped=opts[
      (opts.indexOf(equipped)+1)%opts.length
    ];

    tell(
      `Equipped ${ITEMS[equipped]?.name||'Fists'}`
    );
  }
});

document.addEventListener('keyup',e=>{
  keys[e.code]=false;
});

document.addEventListener(
  'contextmenu',
  e=>e.preventDefault()
);

// MINING, BUILDING AND CREATURE INTERACTION
const caster=new THREE.Raycaster();
const cross=new THREE.Vector2();

function raycast(max){
  caster.setFromCamera(cross,camera);
  caster.far=max;

  const targets=[
    ...chunks.values(),
    ...mobs.filter(m=>m.g.visible).map(m=>m.g)
  ];

  const hits=caster.intersectObjects(targets,true);
  if(!hits.length)return null;

  const hit=hits[0];
  let target=hit.object;

  while(
    target.parent &&
    !target.userData.terrain &&
    !target.userData.mob
  ){
    target=target.parent;
  }

  return {hit,target};
}

function faceBlock(hit,inward){
  const normal=hit.face.normal.clone()
    .transformDirection(hit.object.matrixWorld);

  const p=hit.point.clone().addScaledVector(
    normal,inward?-.02:.02
  );

  return {
    x:Math.round(p.x),
    y:Math.round(p.y),
    z:Math.round(p.z)
  };
}

let attackTimer=0;

document.addEventListener('mousedown',e=>{
  if(
    !playing ||
    ![0,2].includes(e.button) ||
    attackTimer>0
  )return;

  const weapon=ITEMS[equipped];
  const ranged=e.button===0&&equipped==='bow';

  const result=raycast(ranged?28:6);
  if(!result)return;

  const {hit,target}=result;

  if(e.button===0){
    if(target.userData.mob){
      if(ranged){
        if((inv.arrows||0)<1){
          tell('No arrows');
          return;
        }
        inv.arrows--;
      }

      const m=target.userData.mob;
      m.hp-=weapon?.damage||3;
      attackTimer=.35;

      if(m.hp<=0)killMob(m);
      else tell(`Hit ${m.kind}`);

      return;
    }

    if(target.userData.terrain){
      const p=faceBlock(hit,true);
      const id=block(p.x,p.y,p.z);
      if(!id)return;

      const chestKey=`${p.x},${p.y},${p.z}`;

      if(
        id==='chest' &&
        chests[chestKey] &&
        Object.values(chests[chestKey])
          .some(v=>v>0)
      ){
        tell('Empty chest before mining it');
        return;
      }

      if(change(p.x,p.y,p.z,null)){
        addItem(id);

        if(id==='leaves'&&Math.random()<.2){
          addItem('seeds');
        }

        addXP(1);
        tell(`Mined ${ITEMS[id].name}`);
      }
    }
  }

  else if(target.userData.mob){
    const m=target.userData.mob;

    if(m.kind==='horse'&&(inv.saddle||0)>0){
      if(ridden)ridden.ridden=false;
      ridden=m;
      m.ridden=true;
      tell('Riding horse! X dismount');
    }

    else if((inv.lead||0)>0&&!m.hostile){
      m.led=!m.led;

      tell(
        m.led
          ?'Animal on lead: it follows you'
          :'Lead released'
      );
    }

    else if(
      ((inv.wheat||0)>0 &&
        ['cow','sheep','horse'].includes(m.kind)) ||
      ((inv.carrot||0)>0&&m.kind==='pig')
    ){
      const food=m.kind==='pig'?'carrot':'wheat';

      inv[food]--;
      m.love=30;

      tell('Animal fed; feed another nearby animal to breed');

      const partner=mobs.find(other=>
        other!==m &&
        other.kind===m.kind &&
        other.love>0 &&
        other.g.position.distanceTo(
          m.g.position
        )<6
      );

      if(partner){
        partner.love=0;
        m.love=0;

        createMob(
          m.kind,
          Math.round(m.g.position.x+1),
          Math.round(m.g.position.z)
        );

        tell('New baby animal spawned!');
      }
    }

    else if(m.kind==='villager'){
      tell(
        'Villager: Welcome! The village farm is nearby.'
      );
    }

    else{
      tell(
        'Use a lead, suitable food, or a saddle.'
      );
    }
  }

  else if(target.userData.terrain){
    const p=faceBlock(hit,true);
    const id=block(p.x,p.y,p.z);
    const k=`${p.x},${p.y},${p.z}`;

    if(id==='chest'){
      showPanel('chest',k);
      return;
    }

    if(id==='furnace'){
      showPanel('furnace');
      return;
    }

    if(id==='bed'){
      dayClock=0;
      health=Math.min(100,health+15);
      tell('Slept in bed: morning!');
      return;
    }

    if(id==='crops'){
      change(p.x,p.y,p.z,'farmland');
      addItem('wheat',2);
      addItem('seeds',2);
      tell('Harvested wheat and seeds!');
      return;
    }

    if(id==='farmland'&&inv.seeds>0){
      inv.seeds--;
      change(p.x,p.y,p.z,'crops');
      tell('Planted crops');
      return;
    }

    const q=faceBlock(hit,false);
    const item=HOTBAR[selected];

    if(!player.creative&&(inv[item]||0)<=0){
      tell(`No ${ITEMS[item].name} left`);
      return;
    }

    if(block(q.x,q.y,q.z))return;

    const overlap=
      Math.abs(q.x-camera.position.x)<.8 &&
      Math.abs(q.z-camera.position.z)<.8 &&
      q.y+.5>camera.position.y-1.55 &&
      q.y-.5<camera.position.y+.1;

    if(overlap)return;

    if(change(q.x,q.y,q.z,item)){
      if(!player.creative)inv[item]--;
      tell(`Placed ${ITEMS[item].name}`);
    }
  }
});

// HOTBAR
const hotbar=$('hotbar');

for(let i=0;i<9;i++){
  const el=document.createElement('div');
  el.className='slot';

  const digit=document.createElement('small');
  digit.textContent=i+1;

  const icon=document.createElement('span');
  icon.textContent=ITEMS[HOTBAR[i]].icon;

  el.append(icon,digit);
  hotbar.append(el);
}

// MAIN GAME LOOP
streamChunks();

const clock=new THREE.Clock();
let foodTick=0;
let saveTick=0;

function animate(){
  requestAnimationFrame(animate);

  const dt=Math.min(.04,clock.getDelta());
  const t=clock.elapsedTime;

  if(playing){
    dayClock+=dt;

    const night=
      (dayClock%240)>135 &&
      (dayClock%240)<215;

    ambient.intensity=night?.55:1.85;
    sun.intensity=night?.15:1.6;

    scene.background.setHex(
      night?0x122344:0x91cfff
    );

    scene.fog.color.copy(scene.background);

    if(keys.ArrowLeft)player.yaw+=2.4*dt;
    if(keys.ArrowRight)player.yaw-=2.4*dt;

    camera.rotation.y=player.yaw;
    camera.rotation.x=player.pitch;

    const f=new THREE.Vector3(
      -Math.sin(player.yaw),
      0,
      -Math.cos(player.yaw)
    );

    const r=new THREE.Vector3(
      Math.cos(player.yaw),
      0,
      -Math.sin(player.yaw)
    );

    movement.set(0,0,0);

    if(keys.KeyW||keys.ArrowUp)movement.add(f);
    if(keys.KeyS||keys.ArrowDown)movement.sub(f);
    if(keys.KeyD)movement.add(r);
    if(keys.KeyA)movement.sub(r);

    const speed=ridden
      ?9.5
      :keys.ShiftLeft?7.4:4.4;

    if(movement.lengthSq()){
      movement.normalize().multiplyScalar(speed*dt);
      moveAxis('x',movement.x);
      moveAxis('z',movement.z);
    }

    if(player.flying||player.creative){
      if(keys.Space)moveAxis('y',speed*dt);

      if(keys.ControlLeft){
        moveAxis('y',-speed*dt);
      }

      player.vy=0;
    }else{
      if(keys.Space&&player.grounded){
        player.vy=7.5;
        player.grounded=false;
      }

      player.vy=Math.max(
        -22,player.vy-21*dt
      );

      const moved=moveAxis(
        'y',player.vy*dt
      );

      if(!moved){
        player.grounded=player.vy<=0;
        player.vy=0;
      }else{
        const test=camera.position.clone();
        test.y-=.07;
        player.grounded=collision(test);
      }
    }

    // Respawn only for death or falling below the world.
    if(camera.position.y<BOTTOM-8||health<=0){
      camera.position.set(
        0,height(0,4)+2.3,4
      );
      player.vy=0;
      health=100;
      hunger=Math.max(50,hunger);
      tell('Respawned at spawn point');
    }

    const feet=block(
      Math.round(camera.position.x),
      Math.round(camera.position.y-1.45),
      Math.round(camera.position.z)
    );

    if(feet==='lava'&&!player.creative){
      damageTimer+=dt;

      if(damageTimer>1){
        damageTimer=0;
        health=Math.max(0,health-12);
        tell('Lava burns!');
      }
    }

    const underwater=
      height(
        Math.round(camera.position.x),
        Math.round(camera.position.z)
      )<=0 &&
      camera.position.y<.54;

    if(underwater&&!player.creative){
      damageTimer+=dt;

      if(damageTimer>7){
        damageTimer=0;
        health=Math.max(0,health-4);
        tell('Swim up for air!');
      }
    }

    if(ridden){
      ridden.g.position.set(
        camera.position.x,
        camera.position.y-1.2,
        camera.position.z
      );
    }

    streamChunks();
    updateMobs(dt,t,night);

    attackTimer=Math.max(0,attackTimer-dt);
    damageTimer=Math.max(0,damageTimer-dt);

    foodTick+=dt;

    if(foodTick>6){
      foodTick=0;

      if(!player.creative){
        hunger=Math.max(0,hunger-1);

        if(hunger===0){
          health=Math.max(0,health-2);
        }
      }
    }

    saveTick+=dt;

    if(saveTick>45){
      saveTick=0;
      saveGame(true);
    }

    $('coords').textContent=
      `XYZ ${Math.floor(camera.position.x)} `+
      `${Math.floor(camera.position.y)} `+
      `${Math.floor(camera.position.z)}`;

    $('day').textContent=
      night?'🌙 Night':'☀ Day';

    $('health').textContent=Math.ceil(health);
    $('hunger').textContent=Math.ceil(hunger);
    $('level').textContent=level;

    $('weapon').textContent=
      'Weapon: '+
      (ITEMS[equipped]?.name||'Fists')+
      (player.creative?' · Creative':'');

    const id=HOTBAR[selected];

    $('selected').textContent=
      `${ITEMS[id].name} (${inv[id]||0})`;

    [...hotbar.children].forEach((e,i)=>{
      e.classList.toggle(
        'active',i===selected
      );

      e.querySelector('span').textContent=
        ITEMS[HOTBAR[i]].icon;
    });
  }

  if(noticeTimer>0){
    noticeTimer-=dt;
    if(noticeTimer<=0){
      $('notice').textContent='';
    }
  }

  renderer.render(scene,camera);
}

animate();

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
