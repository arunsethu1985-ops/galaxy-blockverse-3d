
import * as THREE from "https://esm.sh/three@0.180.0";

// GALAXY BLOCKVERSE — SINGLE PLAYER
const $ = id => document.getElementById(id);
const SAVE = "galaxy-blockverse-complete-1";
const SIZE = 22;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91caff);
scene.fog = new THREE.Fog(0x91caff, 35, 90);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.05, 150
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9edff,0x68874b,1.8));
const sunlight = new THREE.DirectionalLight(0xffeac5,2.1);
sunlight.position.set(25,45,18);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024,1024);
sunlight.shadow.camera.left = -30;
sunlight.shadow.camera.right = 30;
sunlight.shadow.camera.top = 30;
sunlight.shadow.camera.bottom = -30;
scene.add(sunlight);

// PROCEDURAL PIXEL TEXTURES
function makeMaterial(hex,seed) {
  const c=document.createElement("canvas");
  c.width=c.height=16;
  const ctx=c.getContext("2d");
  const base=new THREE.Color(hex);
  let n=seed;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    n=(n*1664525+1013904223)>>>0;
    const v=(n/4294967296-.5)*.22;
    const col=base.clone();
    col.r=THREE.MathUtils.clamp(col.r+v,0,1);
    col.g=THREE.MathUtils.clamp(col.g+v,0,1);
    col.b=THREE.MathUtils.clamp(col.b+v,0,1);
    ctx.fillStyle="#"+col.getHexString();
    ctx.fillRect(x,y,1,1);
  }
  const tex=new THREE.CanvasTexture(c);
  tex.magFilter=THREE.NearestFilter;
  tex.minFilter=THREE.NearestFilter;
  tex.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshLambertMaterial({map:tex});
}

const M={
  grass:makeMaterial(0x55b63e,1),
  side:makeMaterial(0x699549,2),
  dirt:makeMaterial(0x815330,3),
  stone:makeMaterial(0x888d91,4),
  wood:makeMaterial(0x926338,5),
  leaves:makeMaterial(0x2d8d3e,6),
  sand:makeMaterial(0xe7d28e,7),
  brick:makeMaterial(0xa85448,8),
  glass:new THREE.MeshPhongMaterial({
    color:0xa3eaff,transparent:true,opacity:.5,
    depthWrite:false,side:THREE.DoubleSide
  }),
  ore:makeMaterial(0x4c89ad,10),
  crop:makeMaterial(0x79b13f,11),
  chest:makeMaterial(0xa87939,12)
};

const BLOCKS={
  1:{name:"Grass",icon:"🟩",mat:[
    M.side,M.side,M.grass,M.dirt,M.side,M.side
  ]},
  2:{name:"Dirt",icon:"🟫",mat:M.dirt},
  3:{name:"Stone",icon:"🪨",mat:M.stone},
  4:{name:"Wood",icon:"🪵",mat:M.wood},
  5:{name:"Leaves",icon:"🍃",mat:M.leaves},
  6:{name:"Sand",icon:"🏖️",mat:M.sand},
  7:{name:"Fence",icon:"🚧",mat:M.wood},
  8:{name:"Brick",icon:"🧱",mat:M.brick},
  9:{name:"Glass",icon:"🪟",mat:M.glass},
  10:{name:"Ore",icon:"💎",mat:M.ore},
  11:{name:"Crops",icon:"🌾",mat:M.crop},
  12:{name:"Door",icon:"🚪",mat:M.wood},
  13:{name:"Chest",icon:"📦",mat:M.chest}
};

const cube = new THREE.BoxGeometry(1,1,1);
const world = new Map();
const visible = new Map();
const changes = new Map();
const K=(x,y,z)=>`${x},${y},${z}`;
const dirs=[
  [1,0,0],[-1,0,0],[0,1,0],
  [0,-1,0],[0,0,1],[0,0,-1]
];
const get=(x,y,z)=>world.get(K(x,y,z))||0;
const put=(x,y,z,t)=>{
  if(t)world.set(K(x,y,z),t);
  else world.delete(K(x,y,z));
};
function random(n) {
  const v=Math.sin(n*127.1+78.233)*43758.5453;
  return v-Math.floor(v);
}
function height(x,z) {
  let n=Math.sin(x*.14)*2.5+
    Math.cos(z*.12)*2+
    Math.sin((x+z)*.075)*2.1;
  n*=Math.min(1,Math.hypot(x,z-5)/7);
  return Math.floor(n);
}

// WORLD GENERATION
for(let x=-SIZE;x<=SIZE;x++){
  for(let z=-SIZE;z<=SIZE;z++){
    const h=height(x,z);
    put(x,h,z,h<-1?6:1);
    for(let y=h-1;y>=-7;y--){
      put(x,y,z,y>h-3?2:3);
    }
    if(h>1&&random(x*47+z*91)>.975)
      put(x,h-2,z,10);
  }
}

function generateTree(x,z){
  const h=height(x,z);
  if(h<0||h>4)return;
  for(let y=1;y<=4;y++)put(x,h+y,z,4);
  for(let dx=-2;dx<=2;dx++){
    for(let dz=-2;dz<=2;dz++){
      for(let dy=3;dy<=6;dy++){
        if(Math.abs(dx)+Math.abs(dz)>3)continue;
        const a=x+dx,b=z+dz;
        if(Math.abs(a)>SIZE||Math.abs(b)>SIZE)continue;
        if(!get(a,h+dy,b))put(a,h+dy,b,5);
      }
    }
  }
}

for(let x=-19;x<=19;x+=5)
  for(let z=-19;z<=19;z+=5)
    if(random(x*111+z*73)>.42 &&
       Math.hypot(x,z-5)>8)
      generateTree(x,z);

// PLACED STRUCTURES
function seedStructure(){
  const x=12,z=10,h=height(x,z);
  put(x,h+1,z,13);
  for(let d=-2;d<=2;d++){
    put(x+d,h+1,z+3,7);
  }
}
seedStructure();

// SHAPED BUILDING PIECES
function part(g,w,h,d,x,y,z,mat){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);
  m.castShadow=true;
  g.add(m);
  return m;
}
function shape(type){
  const g=new THREE.Group();
  if(type===7){
    part(g,.24,1,.24,0,0,0,M.wood);
    for(const y of [-.2,.18]){
      part(g,1,.13,.13,0,y,0,M.wood);
      part(g,.13,.13,1,0,y,0,M.wood);
    }
  }else if(type===12){
    part(g,.85,1,.15,0,0,0,M.wood);
    part(g,.08,.08,.12,.3,0,.1,M.stone);
  }else if(type===11){
    for(let i=-1;i<=1;i++)
      part(g,.12,.52,.12,i*.22,-.18,0,M.crop);
  }else if(type===13){
    part(g,.85,.7,.8,0,-.15,0,M.chest);
    part(g,.85,.1,.85,0,.25,0,M.wood);
  }
  return g;
}
function refresh(x,y,z){
  const id=K(x,y,z);
  if(visible.has(id)){
    scene.remove(visible.get(id));
    visible.delete(id);
  }
  const type=get(x,y,z);
  if(!type)return;
  if(!dirs.some(([a,b,c])=>!get(x+a,y+b,z+c)))return;

  const obj=[7,11,12,13].includes(type)
    ?shape(type)
    :new THREE.Mesh(cube,BLOCKS[type].mat);

  obj.position.set(x,y,z);
  obj.userData.block=true;
  obj.userData.type=type;
  obj.traverse(o=>{
    if(o.isMesh){
      o.receiveShadow=true;
      o.castShadow=[4,5,7,12,13].includes(type);
    }
  });
  scene.add(obj);
  visible.set(id,obj);
}
function editBlock(x,y,z,t,record=true){
  if(Math.abs(x)>SIZE||Math.abs(z)>SIZE||
     y < -12||y>35)return false;
  put(x,y,z,t);
  if(record)changes.set(K(x,y,z),t);
  refresh(x,y,z);
  dirs.forEach(([a,b,c])=>refresh(x+a,y+b,z+c));
  return true;
}

// GAME DATA
const inventory={
  1:20,2:15,3:10,4:12,5:8,6:8,7:8,8:8,9:8,
  10:0,11:4,12:2,13:2,
  meat:4,wheat:0,arrows:16,coins:0
};

const weapons={
  fists:{name:"Fists",damage:3,range:3},
  woodSword:{name:"Wooden Sword",damage:5,range:4},
  stoneSword:{name:"Stone Sword",damage:7,range:4},
  ironSword:{name:"Iron Sword",damage:9,range:4},
  diamondSword:{name:"Diamond Sword",damage:12,range:4},
  axe:{name:"Battle Axe",damage:10,range:3.5},
  bow:{name:"Bow",damage:7,range:24},
  crossbow:{name:"Crossbow",damage:11,range:30},
  trident:{name:"Trident",damage:12,range:6}
};

const player={
  health:100,hunger:100,xp:0,level:1,
  yaw:0,pitch:0,vy:0,
  flying:false,creative:false,grounded:false
};
const owned=new Set(["fists"]);
let equipped="fists",selected=1;
let gameTime=0;

let saved=null;
try{saved=JSON.parse(localStorage.getItem(SAVE)||"null");}
catch{}

if(saved){
  if(Array.isArray(saved.edits)){
    for(const item of saved.edits){
      if(!Array.isArray(item)||item.length!==2)continue;
      const [id,t]=item;
      if(!/^-?\d+,-?\d+,-?\d+$/.test(id))continue;
      if(!Number.isInteger(t)||t<0||t>13)continue;
      const [x,y,z]=id.split(",").map(Number);
      if(Math.abs(x)>SIZE||Math.abs(z)>SIZE||
         y < -12||y>35)continue;
      put(x,y,z,t);
      changes.set(id,t);
    }
  }
  if(saved.inventory){
    for(const id of Object.keys(inventory)){
      const v=saved.inventory[id];
      if(Number.isInteger(v)&&v>=0&&v<100000)
        inventory[id]=v;
    }
  }
  if(saved.player){
    for(const name of ["health","hunger","xp","level"]){
      if(Number.isFinite(saved.player[name]))
        player[name]=saved.player[name];
    }
  }
  if(Array.isArray(saved.owned))
    saved.owned.forEach(id=>{if(weapons[id])owned.add(id);});
  if(owned.has(saved.equipped))equipped=saved.equipped;
  if(Number.isFinite(saved.gameTime))
    gameTime=saved.gameTime;
}

for(const id of world.keys()){
  const [x,y,z]=id.split(",").map(Number);
  refresh(x,y,z);
}

camera.position.set(0,height(0,5)+2.12,5);
if(Array.isArray(saved?.position)&&
   saved.position.length===3&&
   saved.position.every(Number.isFinite)){
  const [x,y,z]=saved.position;
  if(Math.abs(x)<SIZE&&Math.abs(z)<SIZE&&y>-10&&y<35)
    camera.position.set(x,y,z);
}

// WATER AND SKY
const water=new THREE.Mesh(
  new THREE.PlaneGeometry(SIZE*2+1,SIZE*2+1),
  new THREE.MeshPhongMaterial({
    color:0x278ccc,transparent:true,opacity:.56,
    depthWrite:false,side:THREE.DoubleSide
  })
);
water.rotation.x=-Math.PI/2;
water.position.y=-2.25;
scene.add(water);

const clouds=[];
const cloudMat=new THREE.MeshBasicMaterial({color:0xffffff});
for(let i=0;i<9;i++){
  const g=new THREE.Group();
  for(let j=0;j<3;j++)
    part(g,5,1.2,3,j*3,0,0,cloudMat);
  g.position.set(
    random(i+3)*75-37,
    23+random(i+7)*9,
    random(i+11)*75-37
  );
  scene.add(g);
  clouds.push(g);
}

// CREATURES
const mobs=[];
const mobColors={
  cow:0xf1eee6,pig:0xf5a6ac,
  sheep:0xf7f5ed,chicken:0xfff4d4,
  wolf:0x929498,zombie:0x589c61,
  skeleton:0xd3d2c7,spider:0x39323f
};

function spawnMob(kind,x,z){
  const g=new THREE.Group(),legs=[];
  const hostile=["zombie","skeleton","spider"].includes(kind);
  const small=kind==="chicken";
  const w=small?.45:.8,l=small?.65:1.2;
  const bodyY=small?.45:.8;
  const col=mobColors[kind];

  part(g,w,.65,l,0,bodyY,0,
    new THREE.MeshLambertMaterial({color:col}));
  const skin=new THREE.MeshLambertMaterial({color:col});
  part(g,small?.35:.52,.52,.48,0,bodyY+.2,
    -l/2-.2,skin);

  const legMat=new THREE.MeshLambertMaterial({
    color:hostile?0x494554:0x746b66
  });
  for(const xx of [-w*.3,w*.3])
    for(const zz of [-l*.3,l*.3])
      legs.push(part(g,.17,.4,.17,xx,.22,zz,legMat));

  const eyeMat=new THREE.MeshBasicMaterial({
    color:hostile?0xff3333:0x151515
  });
  for(const xx of [-.16,.16])
    part(g,.09,.09,.06,xx,bodyY+.25,
      -l/2-.49,eyeMat);

  const h=height(Math.round(x),Math.round(z));
  g.position.set(x,h+.5,z);
  scene.add(g);
  const m={
    group:g,legs,kind,hostile,
    hp:hostile?35:20,
    direction:random(x*13+z*31)*6.28,
    timer:2,speed:hostile?1.9:.65,
    cooldown:0,phase:Math.random()*6
  };
  g.userData.mob=m;
  mobs.push(m);
  return m;
}

for(let i=0;i<32;i++){
  const x=Math.floor(random(i*43+11)*39)-19;
  const z=Math.floor(random(i*79+21)*39)-19;
  if(height(x,z)>=0&&Math.hypot(x,z-5)>5){
    spawnMob(
      ["cow","pig","sheep","chicken","wolf"][i%5],
      x,z
    );
  }
}
for(let i=0;i<9;i++){
  const x=Math.floor(random(i*63+111)*40)-20;
  const z=Math.floor(random(i*83+119)*40)-20;
  if(height(x,z)>=0&&Math.hypot(x,z-5)>12)
    spawnMob(["zombie","skeleton","spider"][i%3],x,z);
}

let noticeTime=0;
function notify(s){
  $("notice").textContent=s;
  noticeTime=2.7;
}
function addXP(value){
  player.xp+=value;
  while(player.xp>=player.level*20){
    player.xp-=player.level*20;
    player.level++;
    notify("LEVEL UP! "+player.level);
  }
}
function defeat(m){
  scene.remove(m.group);
  mobs.splice(mobs.indexOf(m),1);
  if(m.hostile){
    addXP(7);
    if(m.kind==="skeleton")inventory.arrows+=2;
    inventory.coins+=1;
  }else{
    addXP(2);
    inventory.meat+=1;
  }
  notify("Loot collected from "+m.kind);
}
function updateMobs(dt,t,night){
  for(const m of mobs){
    m.group.visible=!m.hostile||night;
    if(!m.group.visible)continue;
    m.timer-=dt;
    m.cooldown=Math.max(0,m.cooldown-dt);
    if(m.timer<=0){
      m.timer=1+Math.random()*3;
      m.direction+=(Math.random()-.5)*2.5;
    }
    const dx=camera.position.x-m.group.position.x;
    const dz=camera.position.z-m.group.position.z;
    const dist=Math.hypot(dx,dz);
    let speed=m.speed;
    if(m.hostile&&dist<10){
      m.direction=Math.atan2(-dx,-dz);
      speed=2.1;
      if(dist<1.5&&m.cooldown===0&&!player.creative){
        player.health=Math.max(0,player.health-7);
        m.cooldown=1.6;
        notify("Monster attack!");
      }
    }
    const nx=m.group.position.x-Math.sin(m.direction)*speed*dt;
    const nz=m.group.position.z-Math.cos(m.direction)*speed*dt;
    if(Math.abs(nx)<SIZE-2&&Math.abs(nz)<SIZE-2){
      const h=height(Math.round(nx),Math.round(nz));
      const old=height(
        Math.round(m.group.position.x),
        Math.round(m.group.position.z)
      );
      if(h>=0&&Math.abs(h-old)<=1)
        m.group.position.set(nx,h+.5,nz);
      else m.direction+=Math.PI;
    }else m.direction+=Math.PI;
    m.group.rotation.y=m.direction;
    m.legs.forEach((leg,i)=>{
      leg.rotation.x=Math.sin(t*8+m.phase+i*Math.PI)*.3;
    });
  }
}

// CRAFTING
const recipes=[
  {name:"Wooden Sword",cost:{"4":3},weapon:"woodSword"},
  {name:"Stone Sword",cost:{"3":3,"4":1},weapon:"stoneSword"},
  {name:"Iron Sword",cost:{"10":3,"4":1},weapon:"ironSword"},
  {name:"Diamond Sword",cost:{"10":10,"4":2},weapon:"diamondSword"},
  {name:"Battle Axe",cost:{"3":4,"4":2},weapon:"axe"},
  {name:"Bow",cost:{"4":3,"5":2},weapon:"bow"},
  {name:"Crossbow",cost:{"4":4,"10":3},weapon:"crossbow"},
  {name:"Trident",cost:{"10":7,"4":2},weapon:"trident"},
  {name:"8 Arrows",cost:{"3":1,"4":1},item:"arrows",qty:8},
  {name:"4 Fences",cost:{"4":4},item:"7",qty:4},
  {name:"4 Bricks",cost:{"2":4,"3":2},item:"8",qty:4},
  {name:"4 Glass Blocks",cost:{"6":4},item:"9",qty:4},
  {name:"1 Door",cost:{"4":3},item:"12",qty:1},
  {name:"1 Treasure Chest",cost:{"4":8},item:"13",qty:1},
  {name:"4 Crops",cost:{"2":2},item:"11",qty:4},
  {name:"3 Meals",cost:{"wheat":3},item:"meat",qty:3}
];

function canCraft(r){
  return Object.entries(r.cost).every(
    ([id,n])=>(inventory[id]||0)>=n
  )&&(!r.weapon||!owned.has(r.weapon));
}
function craft(r){
  if(!canCraft(r))return notify("Missing materials");
  for(const [id,n] of Object.entries(r.cost))
    inventory[id]-=n;
  if(r.weapon){
    owned.add(r.weapon);
    equipped=r.weapon;
  }else{
    inventory[r.item]=(inventory[r.item]||0)+r.qty;
  }
  notify("Crafted "+r.name);
  renderCraft();
  renderInventory();
}
function renderCraft(){
  const root=$("recipes");
  root.replaceChildren();
  for(const r of recipes){
    const row=document.createElement("div");
    row.className="recipe";
    const left=document.createElement("div");
    const strong=document.createElement("strong");
    strong.textContent=r.name;
    const desc=document.createElement("p");
    desc.textContent=Object.entries(r.cost).map(
      ([id,n])=>`${n} ${BLOCKS[id]?.name||id}`
    ).join(" + ");
    left.append(strong,desc);
    const btn=document.createElement("button");
    btn.textContent=r.weapon&&owned.has(r.weapon)?"OWNED":"CRAFT";
    btn.disabled=!canCraft(r);
    btn.onclick=()=>craft(r);
    row.append(left,btn);
    root.append(row);
  }
}
function renderInventory(){
  const root=$("items");
  root.replaceChildren();
  for(const [id,qty] of Object.entries(inventory)){
    const row=document.createElement("div");
    row.className="item";
    const name=document.createElement("span");
    name.textContent=BLOCKS[id]?.name||id;
    const value=document.createElement("span");
    value.textContent=qty;
    row.append(name,value);
    if(BLOCKS[id]){
      const btn=document.createElement("button");
      btn.textContent="SELECT";
      btn.onclick=()=>{
        selected=Number(id);
        closePanels();
        notify("Selected "+BLOCKS[id].name);
      };
      row.append(btn);
    }
    root.append(row);
  }
  for(const id of owned){
    if(id==="fists")continue;
    const row=document.createElement("div");
    row.className="item";
    const name=document.createElement("span");
    name.textContent=weapons[id].name;
    const btn=document.createElement("button");
    btn.textContent="EQUIP";
    btn.onclick=()=>{
      equipped=id;
      closePanels();
      notify("Equipped "+weapons[id].name);
    };
    row.append(name,btn);
    root.append(row);
  }
}
function eat(){
  if(inventory.meat<1)return notify("No food");
  inventory.meat--;
  player.hunger=Math.min(100,player.hunger+25);
  player.health=Math.min(100,player.health+5);
  notify("Food eaten");
}

// USER INPUT
const keys={};
let playing=false,attackCooldown=0;
let foodTimer=0,saveTimer=0;
let uiPanel=null;

function makeHotbar(){
  const root=$("hotbar");
  root.replaceChildren();
  for(let n=1;n<=9;n++){
    const item=document.createElement("div");
    item.className="slot";
    item.dataset.id=n;
    item.innerHTML=`${BLOCKS[n].icon}<small>${n}</small>`;
    root.append(item);
  }
}
makeHotbar();

function closePanels(){
  $("inventoryPanel").hidden=true;
  $("craftPanel").hidden=true;
  uiPanel=null;
}
function openPanel(id){
  uiPanel=id;
  document.exitPointerLock?.();
  $("inventoryPanel").hidden=id!=="inventoryPanel";
  $("craftPanel").hidden=id!=="craftPanel";
  if(id==="inventoryPanel")renderInventory();
  else renderCraft();
}
$("play").onclick=()=>{
  closePanels();
  renderer.domElement.requestPointerLock();
};
document.querySelectorAll(".close").forEach(b=>{
  b.onclick=()=>{
    closePanels();
    renderer.domElement.requestPointerLock();
  };
});
document.addEventListener("pointerlockchange",()=>{
  playing=document.pointerLockElement===renderer.domElement;
  $("menu").style.display=playing||uiPanel?"none":"flex";
  $("hud").hidden=!playing;
  if(!playing){
    Object.keys(keys).forEach(k=>keys[k]=false);
  }
});
document.addEventListener("mousemove",e=>{
  if(!playing)return;
  player.yaw-=e.movementX*.002;
  player.pitch=THREE.MathUtils.clamp(
    player.pitch-e.movementY*.002,-1.48,1.48
  );
});
document.addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(["Space","ArrowUp","ArrowDown",
      "ArrowLeft","ArrowRight"].includes(e.code))
    e.preventDefault();
  if(!playing)return;
  if(e.code.startsWith("Digit")){
    const n=Number(e.code.slice(5));
    if(n>=1&&n<=9)selected=n;
  }
  if(e.code==="KeyF"&&!e.repeat){
    player.flying=!player.flying;
    player.vy=0;
    notify(player.flying?"Fly ON":"Fly OFF");
  }
  if(e.code==="KeyG"&&!e.repeat){
    player.creative=!player.creative;
    notify(player.creative?"CREATIVE":"SURVIVAL");
  }
  if(e.code==="KeyE"&&!e.repeat)openPanel("inventoryPanel");
  if(e.code==="KeyC"&&!e.repeat)openPanel("craftPanel");
  if(e.code==="KeyR"&&!e.repeat)eat();
  if(e.code==="KeyP"&&!e.repeat)saveGame();
  if(e.code==="KeyQ"&&!e.repeat){
    const list=[...owned];
    equipped=list[(list.indexOf(equipped)+1)%list.length];
    notify("Equipped "+weapons[equipped].name);
  }
});
document.addEventListener("keyup",e=>keys[e.code]=false);
document.addEventListener("contextmenu",e=>e.preventDefault());

// COLLISION
function collides(pos){
  for(const dx of [-.27,.27])
    for(const dz of [-.27,.27])
      for(const dy of [-1.48,-.85,-.12]){
        const t=get(
          Math.round(pos.x+dx),
          Math.round(pos.y+dy),
          Math.round(pos.z+dz)
        );
        if(t&&t!==11&&t!==12)return true;
      }
  return false;
}
function moveAxis(axis,amount){
  const p=camera.position.clone();
  p[axis]+=amount;
  if(!collides(p)){
    camera.position[axis]=p[axis];
    return true;
  }
  return false;
}

// INTERACTION
const raycaster=new THREE.Raycaster();
const center=new THREE.Vector2(0,0);

document.addEventListener("mousedown",e=>{
  if(!playing||![0,2].includes(e.button))return;
  if(attackCooldown>0)return;

  raycaster.setFromCamera(center,camera);
  raycaster.far=e.button===0?weapons[equipped].range:6;
  const objects=[
    ...visible.values(),
    ...mobs.filter(m=>m.group.visible).map(m=>m.group)
  ];
  const hits=raycaster.intersectObjects(objects,true);
  if(!hits.length)return;
  const hit=hits[0];

  let target=hit.object;
  while(target.parent&&!target.userData.block&&
        !target.userData.mob){
    target=target.parent;
  }
  const mob=target.userData.mob;

  if(e.button===0){
    if(mob){
      if(["bow","crossbow"].includes(equipped)){
        if(inventory.arrows<=0)
          return notify("No arrows");
        inventory.arrows--;
      }
      mob.hp-=weapons[equipped].damage;
      attackCooldown=.35;
      if(mob.hp<=0)defeat(mob);
      else notify("Hit "+mob.kind);
      return;
    }
    if(target.userData.block){
      const p=target.position;
      const type=get(p.x,p.y,p.z);
      if(editBlock(p.x,p.y,p.z,0)){
        inventory[type]=(inventory[type]||0)+1;
        if(type===11)inventory.wheat+=2;
        addXP(1);
        notify("Mined "+BLOCKS[type].name);
      }
    }
  }

  if(e.button===2&&target.userData.block){
    const p=target.position;
    const type=get(p.x,p.y,p.z);

    if(type===13){
      inventory.coins+=2;
      inventory.meat+=2;
      inventory[10]+=1;
      editBlock(p.x,p.y,p.z,0);
      notify("Treasure chest! Coins, food and ore!");
      return;
    }

    if(!player.creative&&(inventory[selected]||0)<=0)
      return notify("No blocks available");

    const pos=p.clone().add(hit.face.normal).round();
    const overlap=
      Math.abs(pos.x-camera.position.x)<.8&&
      Math.abs(pos.z-camera.position.z)<.8&&
      pos.y+.5>camera.position.y-1.62&&
      pos.y-.5<camera.position.y+.2;

    if(!overlap&&!get(pos.x,pos.y,pos.z)){
      if(editBlock(pos.x,pos.y,pos.z,selected)){
        if(!player.creative)inventory[selected]--;
        notify("Placed "+BLOCKS[selected].name);
      }
    }
  }
});

// SAVE
function saveGame(){
  try{
    localStorage.setItem(SAVE,JSON.stringify({
      edits:[...changes],
      inventory,
      player:{
        health:player.health,hunger:player.hunger,
        xp:player.xp,level:player.level
      },
      owned:[...owned],equipped,
      position:camera.position.toArray(),
      gameTime
    }));
    notify("World saved");
  }catch{
    notify("Save failed — browser storage full");
  }
}
$("reset").onclick=()=>{
  if(confirm("Reset this BLOCKVERSE world?")){
    localStorage.removeItem(SAVE);
    location.reload();
  }
};

// GAME LOOP
const clock=new THREE.Clock();
const movement=new THREE.Vector3();

function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.033);
  const t=clock.elapsedTime;

  if(playing)gameTime+=dt;
  const night=(gameTime%240)>132&&
              (gameTime%240)<225;
  sunlight.intensity=night?.16:2.1;
  scene.background.setHex(night?0x121d3e:0x91caff);
  scene.fog.color.copy(scene.background);

  for(const cloud of clouds){
    cloud.position.x+=dt*.4;
    if(cloud.position.x>55)cloud.position.x=-55;
  }
  water.position.y=-2.25+Math.sin(t)*.025;

  if(playing){
    if(keys.ArrowLeft)player.yaw+=2.3*dt;
    if(keys.ArrowRight)player.yaw-=2.3*dt;
    camera.rotation.y=player.yaw;
    camera.rotation.x=player.pitch;

    const forward=new THREE.Vector3(
      -Math.sin(player.yaw),0,-Math.cos(player.yaw)
    );
    const right=new THREE.Vector3(
      Math.cos(player.yaw),0,-Math.sin(player.yaw)
    );
    movement.set(0,0,0);
    if(keys.KeyW||keys.ArrowUp)movement.add(forward);
    if(keys.KeyS||keys.ArrowDown)movement.sub(forward);
    if(keys.KeyA)movement.sub(right);
    if(keys.KeyD)movement.add(right);

    const speed=keys.ShiftLeft?7.5:4.5;
    if(movement.lengthSq()>0){
      movement.normalize().multiplyScalar(speed*dt);
      moveAxis("x",movement.x);
      moveAxis("z",movement.z);
    }

    if(player.flying||player.creative){
      if(keys.Space)moveAxis("y",speed*dt);
      if(keys.ControlLeft)moveAxis("y",-speed*dt);
      player.vy=0;
    }else{
      if(keys.Space&&player.grounded){
        player.vy=7.5;
        player.grounded=false;
      }
      player.vy=Math.max(-18,player.vy-21*dt);
      const moved=moveAxis("y",player.vy*dt);
      if(!moved){
        player.grounded=player.vy<=0;
        player.vy=0;
      }else{
        const probe=camera.position.clone();
        probe.y-=.07;
        player.grounded=collides(probe);
      }
    }

    camera.position.x=THREE.MathUtils.clamp(
      camera.position.x,-SIZE+1,SIZE-1
    );
    camera.position.z=THREE.MathUtils.clamp(
      camera.position.z,-SIZE+1,SIZE-1
    );

    if(camera.position.y < -12||player.health<=0){
      camera.position.set(0,height(0,5)+2.12,5);
      player.health=100;
      player.vy=0;
      notify("Respawned");
    }

    updateMobs(dt,t,night);
    attackCooldown=Math.max(0,attackCooldown-dt);

    foodTimer+=dt;
    if(foodTimer>=5){
      foodTimer=0;
      if(!player.creative){
        player.hunger=Math.max(0,player.hunger-1);
        if(player.hunger===0)
          player.health=Math.max(0,player.health-2);
      }
    }

    saveTimer+=dt;
    if(saveTimer>=60){
      saveTimer=0;
      saveGame();
    }

    $("coords").textContent=
      `XYZ ${camera.position.x.toFixed(0)} `+
      `${camera.position.y.toFixed(0)} `+
      `${camera.position.z.toFixed(0)}`;
    $("time").textContent=night?"🌙 NIGHT":"☀ DAY";
    $("health").textContent=Math.ceil(player.health);
    $("hunger").textContent=Math.ceil(player.hunger);
    $("level").textContent=player.level;
    $("hpFill").style.width=player.health+"%";
    $("foodFill").style.width=player.hunger+"%";
    $("xpFill").style.width=
      Math.min(100,player.xp/(player.level*20)*100)+"%";
    $("weapon").textContent=weapons[equipped].name;
    $("mode").textContent=player.creative?
      "CREATIVE":"SURVIVAL";
    $("selected").textContent=
      `${BLOCKS[selected].name} (${inventory[selected]||0})`;

    document.querySelectorAll(".slot").forEach(el=>{
      el.classList.toggle(
        "active",Number(el.dataset.id)===selected
      );
    });
  }

  if(noticeTime>0){
    noticeTime-=dt;
    if(noticeTime<=0)$("notice").textContent="";
  }

  renderer.render(scene,camera);
}

animate();
window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
