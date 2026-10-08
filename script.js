
import * as THREE from "https://esm.sh/three@0.180.0";

// ====================================
// GALAXY BLOCKVERSE V4
// 3D SINGLE-PLAYER SURVIVAL GAME
// ====================================

const SAVE_KEY = "galaxy_blockverse_v4";
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8acaff);
scene.fog = new THREE.Fog(0x8acaff, 35, 95);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.05, 150
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// LIGHTING
const ambient = new THREE.HemisphereLight(
  0xd9efff, 0x5e7545, 2
);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffefce, 2.4);
sun.position.set(28, 45, 22);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -35;
sun.shadow.camera.right = 35;
sun.shadow.camera.top = 35;
sun.shadow.camera.bottom = -35;
scene.add(sun);

// PIXEL-STYLE TEXTURES
function pixelMaterial(hex, seed) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(hex);

  let n = seed >>> 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      n = (n * 1664525 + 1013904223) >>> 0;
      const shade = ((n / 4294967296) - 0.5) * 0.2;
      const c = base.clone();
      c.r = THREE.MathUtils.clamp(c.r + shade, 0, 1);
      c.g = THREE.MathUtils.clamp(c.g + shade, 0, 1);
      c.b = THREE.MathUtils.clamp(c.b + shade, 0, 1);
      ctx.fillStyle = "#" + c.getHexString();
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshLambertMaterial({map: texture});
}

const grass = pixelMaterial(0x50ad3b, 11);
const dirt = pixelMaterial(0x83522f, 12);
const stone = pixelMaterial(0x898a90, 13);
const wood = pixelMaterial(0x926035, 14);
const leaves = pixelMaterial(0x29853b, 15);
const sand = pixelMaterial(0xe0cb8c, 16);
const brick = pixelMaterial(0xa75948, 17);
const grassSide = pixelMaterial(0x71964a, 18);

const BLOCKS = {
  1: {name:"Grass", material:[
    grassSide,grassSide,grass,dirt,grassSide,grassSide
  ]},
  2: {name:"Dirt",material:dirt},
  3: {name:"Stone",material:stone},
  4: {name:"Wood",material:wood},
  5: {name:"Leaves",material:leaves},
  6: {name:"Sand",material:sand},
  7: {name:"Fence",material:wood},
  8: {name:"Brick",material:brick}
};

const SIZE = 25;
const cube = new THREE.BoxGeometry(1,1,1);
const world = new Map();
const visible = new Map();
const neighbours = [
  [1,0,0],[-1,0,0],[0,1,0],
  [0,-1,0],[0,0,1],[0,0,-1]
];

function key(x,y,z) { return `${x},${y},${z}`; }
function blockAt(x,y,z) { return world.get(key(x,y,z)) || 0; }
function setBlockData(x,y,z,type) {
  if(type) world.set(key(x,y,z),type);
  else world.delete(key(x,y,z));
}

function rand(n) {
  let v = Math.sin(n*127.1+78.233)*43758.5453;
  return v-Math.floor(v);
}

// TERRAIN GENERATION
function terrainHeight(x,z) {
  const hills =
    Math.sin(x*.13)*2 +
    Math.cos(z*.11)*2 +
    Math.sin((x+z)*.07)*2;

  const spawn = Math.hypot(x,z-5);
  const flatten = Math.min(1,spawn/8);
  return Math.floor(hills*flatten);
}

for(let x=-SIZE;x<=SIZE;x++){
  for(let z=-SIZE;z<=SIZE;z++){
    const h = terrainHeight(x,z);
    setBlockData(x,h,z,h < -1 ? 6 : 1);
    for(let y=h-1;y>=-7;y--){
      setBlockData(x,y,z,y>h-3?2:3);
    }
  }
}

// TREES
function makeTree(x,z) {
  const h=terrainHeight(x,z);
  if(h < 0 || h > 4) return;
  const trunk=4+Math.floor(rand(x*31+z*17)*2);

  for(let y=1;y<=trunk;y++)
    setBlockData(x,h+y,z,4);

  for(let dx=-2;dx<=2;dx++){
    for(let dz=-2;dz<=2;dz++){
      for(let dy=trunk-1;dy<=trunk+2;dy++){
        if(Math.abs(dx)+Math.abs(dz)<4){
          const xx=x+dx, zz=z+dz;
          if(Math.abs(xx)<=SIZE && Math.abs(zz)<=SIZE
             && !blockAt(xx,h+dy,zz))
            setBlockData(xx,h+dy,zz,5);
        }
      }
    }
  }
}

for(let x=-22;x<=22;x+=5){
  for(let z=-22;z<=22;z+=5){
    if(rand(x*113+z*97)>0.45 &&
       Math.hypot(x,z-5)>9){
      makeTree(x,z);
    }
  }
}

// FENCE SHAPE
function makeFence() {
  const group = new THREE.Group();

  function part(w,h,d,x,y,z) {
    const mesh=new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),wood
    );
    mesh.position.set(x,y,z);
    mesh.castShadow=true;
    group.add(mesh);
  }

  part(.25,1,.25,0,0,0);
  for(const y of [-.18,.2]){
    part(1,.12,.13,0,y,0);
    part(.13,.12,1,0,y,0);
  }
  return group;
}

// RENDER EXPOSED BLOCKS
function refreshBlock(x,y,z) {
  const id=key(x,y,z);
  const old=visible.get(id);
  if(old) {
    scene.remove(old);
    visible.delete(id);
  }

  const type=blockAt(x,y,z);
  if(!type) return;

  const exposed=neighbours.some(([dx,dy,dz])=>
    !blockAt(x+dx,y+dy,z+dz)
  );
  if(!exposed) return;

  const mesh=type===7
    ? makeFence()
    : new THREE.Mesh(cube,BLOCKS[type].material);

  mesh.position.set(x,y,z);
  mesh.userData.block=true;
  mesh.userData.type=type;

  mesh.traverse(obj=>{
    if(obj.isMesh){
      obj.receiveShadow=true;
      obj.castShadow=(type===4||type===5||type===7);
    }
  });

  scene.add(mesh);
  visible.set(id,mesh);
}

function refreshAround(x,y,z) {
  refreshBlock(x,y,z);
  for(const [dx,dy,dz] of neighbours)
    refreshBlock(x+dx,y+dy,z+dz);
}

// SAVE SYSTEM
let saved=null;
try {
  saved=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
} catch {}

const changes=new Map();
if(saved && Array.isArray(saved.changes)){
  for(const entry of saved.changes){
    if(!Array.isArray(entry)||entry.length!==2) continue;
    const [id,type]=entry;
    if(!/^-?\d+,-?\d+,-?\d+$/.test(id)) continue;
    if(!Number.isInteger(type)||type<0||type>8) continue;
    const [x,y,z]=id.split(",").map(Number);
    if(Math.abs(x)>SIZE||Math.abs(z)>SIZE||y < -15||y>40)
      continue;
    setBlockData(x,y,z,type);
    changes.set(id,type);
  }
}

for(const id of world.keys()){
  const [x,y,z]=id.split(",").map(Number);
  refreshBlock(x,y,z);
}

function modifyBlock(x,y,z,type) {
  if(Math.abs(x)>SIZE||Math.abs(z)>SIZE||
     y < -15||y > 40) return false;

  setBlockData(x,y,z,type);
  changes.set(key(x,y,z),type);
  refreshAround(x,y,z);
  return true;
}

// WATER
const water=new THREE.Mesh(
  new THREE.PlaneGeometry(2*SIZE+1,2*SIZE+1),
  new THREE.MeshPhongMaterial({
    color:0x278fcb,
    transparent:true,
    opacity:.6,
    depthWrite:false,
    side:THREE.DoubleSide
  })
);
water.rotation.x=-Math.PI/2;
water.position.y=-2.25;
scene.add(water);

// CLOUDS
const clouds=[];
const cloudMat=new THREE.MeshBasicMaterial({color:0xffffff});
for(let i=0;i<10;i++){
  const cloud=new THREE.Group();
  for(let p=0;p<3;p++){
    const part=new THREE.Mesh(
      new THREE.BoxGeometry(5,1.2,3),cloudMat
    );
    part.position.x=p*3;
    cloud.add(part);
  }
  cloud.position.set(rand(i+2)*70-35,20+rand(i+8)*8,
    rand(i+12)*70-35);
  scene.add(cloud);
  clouds.push(cloud);
}

// PLAYER
const player={
  health:100,
  hunger:100,
  eyeHeight:1.62,
  radius:.27,
  velocityY:0,
  grounded:false,
  flying:false,
  yaw:0,
  pitch:0
};

const inventory={
  1:20,2:20,3:20,4:20,5:10,6:20,7:8,8:10,
  meat:3,wheat:0
};

if(saved?.inventory){
  for(const [id,count] of Object.entries(saved.inventory)){
    if((BLOCKS[id]||id==="meat"||id==="wheat") &&
       Number.isInteger(count) && count>=0 && count<=99999)
      inventory[id]=count;
  }
}
if(saved?.player){
  player.health=Math.max(1,Math.min(100,
    Number(saved.player.health)||100));
  player.hunger=Math.max(0,Math.min(100,
    Number(saved.player.hunger)??100));
}

camera.position.set(0,terrainHeight(0,5)+2.12,5);
if(saved?.position && saved.position.length===3 &&
   saved.position.every(Number.isFinite)){
  const [x,y,z]=saved.position;
  if(Math.abs(x)<SIZE&&Math.abs(z)<SIZE&&y>-10&&y<40)
    camera.position.set(x,y,z);
}

// CREATURE MODELS
const creatures=[];
const animalColors={
  cow:0xe4e0d4,
  pig:0xf2a0ac,
  sheep:0xf6f2e8,
  chicken:0xf8edcc,
  monster:0x7050a3
};

function modelPart(group,w,h,d,color,x,y,z) {
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    new THREE.MeshLambertMaterial({color})
  );
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  group.add(mesh);
  return mesh;
}

function spawnCreature(kind,x,z) {
  const group=new THREE.Group();
  const color=animalColors[kind];
  const small=kind==="chicken";
  const hostile=kind==="monster";
  const legs=[];

  const w=small?.48:.85;
  const length=small?.65:1.25;
  const bodyY=small?.48:.85;

  modelPart(group,w,.7,length,color,0,bodyY,0);
  modelPart(group,small?.38:.55,small?.4:.55,
    small?.38:.55,color,0,bodyY+.18,-length/2-.22);

  for(const xx of [-w*.3,w*.3]){
    for(const zz of [-length*.28,length*.28]){
      legs.push(modelPart(group,.18,.43,.18,
        hostile?0x433062:0x777064,xx,.24,zz));
    }
  }

  for(const xx of [-.16,.16]){
    modelPart(group,.095,.095,.055,
      hostile?0xff3131:0x111111,
      xx,bodyY+.24,-length/2-.51);
  }

  if(kind==="cow"){
    modelPart(group,.45,.28,.06,0x252525,0,
      bodyY+.1,.35);
    modelPart(group,.4,.2,.16,0xe99eaa,0,
      bodyY,-length/2-.5);
  }

  if(kind==="pig"){
    modelPart(group,.35,.22,.16,0xd17c8f,0,
      bodyY+.1,-length/2-.52);
  }

  if(kind==="chicken"){
    modelPart(group,.2,.16,.2,0xf4b327,0,
      bodyY+.12,-length/2-.45);
    modelPart(group,.18,.16,.18,0xd52a28,0,
      bodyY+.5,-length/2-.2);
  }

  const ground=terrainHeight(Math.round(x),Math.round(z))+.5;
  group.position.set(x,ground,z);
  group.rotation.y=rand(x*27+z*19)*Math.PI*2;

  scene.add(group);
  const creature={
    group,kind,legs,
    health:hostile?35:20,
    direction:group.rotation.y,
    timer:1+rand(x+z)*3,
    speed:hostile?1.9:.6,
    phase:rand(x*z)*6,
    hostile
  };
  group.userData.creature=creature;
  creatures.push(creature);
}

const kinds=["cow","pig","sheep","chicken"];
for(let i=0;i<28;i++){
  const x=Math.floor(rand(i*47+2)*42)-21;
  const z=Math.floor(rand(i*83+7)*42)-21;
  if(terrainHeight(x,z)>=0 &&
     Math.hypot(x,z-5)>5){
    spawnCreature(kinds[i%4],x,z);
  }
}

for(let i=0;i<7;i++){
  const x=Math.floor(rand(i*53+91)*40)-20;
  const z=Math.floor(rand(i*61+77)*40)-20;
  if(Math.hypot(x,z-5)>12 && terrainHeight(x,z)>=0)
    spawnCreature("monster",x,z);
}

function updateCreatures(dt,t,isNight) {
  for(const c of creatures){
    c.group.visible=!c.hostile||isNight;
    if(c.hostile&&!isNight) continue;

    c.timer-=dt;
    if(c.timer<=0){
      c.timer=1+Math.random()*3;
      c.direction+=(Math.random()-.5)*2.5;
    }

    let speed=c.speed;
    if(c.hostile){
      const dx=camera.position.x-c.group.position.x;
      const dz=camera.position.z-c.group.position.z;
      const distance=Math.hypot(dx,dz);

      if(distance<11 && distance>0.1){
        c.direction=Math.atan2(-dx,-dz);
        speed=2.2;
      }

      if(distance<1.5 && damageTimer<=0){
        player.health=Math.max(0,player.health-8);
        damageTimer=1.6;
        message("A monster attacked you!");
      }
    }

    const nx=c.group.position.x-Math.sin(c.direction)*speed*dt;
    const nz=c.group.position.z-Math.cos(c.direction)*speed*dt;

    if(Math.abs(nx)<SIZE-2&&Math.abs(nz)<SIZE-2){
      const oldH=terrainHeight(
        Math.round(c.group.position.x),
        Math.round(c.group.position.z)
      );
      const newH=terrainHeight(Math.round(nx),Math.round(nz));
      if(newH>=0&&Math.abs(newH-oldH)<=1){
        c.group.position.x=nx;
        c.group.position.z=nz;
        c.group.position.y=newH+.5;
      } else {
        c.direction+=Math.PI;
      }
    } else c.direction+=Math.PI;

    c.group.rotation.y=c.direction;
    c.legs.forEach((leg,i)=>{
      leg.rotation.x=Math.sin(t*7+c.phase+i*Math.PI)*.3;
    });
  }
}

// USER INTERFACE
const menu=document.getElementById("menu");
const ui=document.getElementById("gameUI");
const inventoryPanel=document.getElementById("inventoryPanel");
const craftPanel=document.getElementById("craftPanel");
const keys={};

let playing=false;
let selected=1;
let messageTimer=0;
let damageTimer=0;
let worldTime=0;

function message(text){
  document.getElementById("message").textContent=text;
  messageTimer=2.7;
}

function selectBlock(n){
  if(!BLOCKS[n])return;
  selected=n;
  document.querySelectorAll(".slot").forEach(el=>{
    el.classList.toggle("selected",Number(el.dataset.block)===n);
  });
}

function showMenuPanel(panel){
  document.exitPointerLock?.();
  inventoryPanel.hidden=true;
  craftPanel.hidden=true;
  panel.hidden=false;
  if(panel===inventoryPanel) updateInventory();
  else updateRecipes();
}

function closePanels(){
  inventoryPanel.hidden=true;
  craftPanel.hidden=true;
}

document.getElementById("playBtn").onclick=()=>{
  closePanels();
  renderer.domElement.requestPointerLock();
};

document.addEventListener("pointerlockchange",()=>{
  playing=document.pointerLockElement===renderer.domElement;
  menu.style.display=playing?"none":"flex";
  ui.hidden=!playing;
  if(!playing){
    for(const k in keys)keys[k]=false;
  }
});

document.getElementById("closeInventory").onclick=()=>{
  closePanels();
  renderer.domElement.requestPointerLock();
};
document.getElementById("closeCraft").onclick=()=>{
  closePanels();
  renderer.domElement.requestPointerLock();
};

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
    selectBlock(Number(e.code.slice(5)));
  }

  if(e.code==="KeyF"&&!e.repeat){
    player.flying=!player.flying;
    player.velocityY=0;
    message(player.flying?"Flying enabled":"Flying disabled");
  }

  if(e.code==="KeyE"&&!e.repeat) showMenuPanel(inventoryPanel);
  if(e.code==="KeyC"&&!e.repeat) showMenuPanel(craftPanel);
  if(e.code==="KeyH"&&!e.repeat) eatFood();
  if(e.code==="KeyP"&&!e.repeat) saveGame();
});

document.addEventListener("keyup",e=>{
  keys[e.code]=false;
});

function updateInventory(){
  const list=document.getElementById("inventoryList");
  list.replaceChildren();

  for(const [id,count] of Object.entries(inventory)){
    const name=BLOCKS[id]?.name||
      (id==="meat"?"Cooked Food":"Wheat");
    const row=document.createElement("div");
    row.className="inventoryRow";
    const left=document.createElement("span");
    left.textContent=name;
    const right=document.createElement("strong");
    right.textContent=count;
    row.append(left,right);
    list.append(row);
  }
}

const recipes=[
  {name:"4 Wooden Fences",cost:{4:4},out:7,count:4},
  {name:"4 Brick Blocks",cost:{2:4,3:2},out:8,count:4},
  {name:"4 Wooden Blocks",cost:{4:2},out:4,count:4},
  {name:"8 Dirt Blocks",cost:{1:8},out:2,count:8},
  {name:"1 Food",cost:{wheat:3},out:"meat",count:1}
];

function craft(recipe){
  const possible=Object.entries(recipe.cost).every(
    ([id,count])=>(inventory[id]||0)>=count
  );
  if(!possible){
    message("Not enough resources!");
    return;
  }

  for(const [id,count] of Object.entries(recipe.cost))
    inventory[id]-=count;

  inventory[recipe.out]=(inventory[recipe.out]||0)+recipe.count;
  updateRecipes();
  updateInventory();
}

function updateRecipes(){
  const list=document.getElementById("recipeList");
  list.replaceChildren();

  for(const recipe of recipes){
    const div=document.createElement("div");
    div.className="recipe";

    const title=document.createElement("strong");
    title.textContent=recipe.name;

    const detail=document.createElement("p");
    detail.textContent=Object.entries(recipe.cost).map(
      ([id,count])=>`${count} ${BLOCKS[id]?.name||id}`
    ).join(" + ");

    const button=document.createElement("button");
    button.textContent="Craft";
    button.onclick=()=>craft(recipe);
    button.disabled=!Object.entries(recipe.cost).every(
      ([id,count])=>(inventory[id]||0)>=count
    );

    div.append(title,detail,button);
    list.append(div);
  }
}

function eatFood(){
  if(inventory.meat>0){
    inventory.meat--;
    player.hunger=Math.min(100,player.hunger+25);
    player.health=Math.min(100,player.health+8);
    message("You ate food!");
  } else message("No food available");
}

// COLLISIONS
function solidAt(x,y,z){
  return !!blockAt(Math.round(x),Math.round(y),Math.round(z));
}

function collides(position){
  const r=player.radius;
  for(const dx of [-r,r]){
    for(const dz of [-r,r]){
      for(const dy of [-1.48,-.85,-.12]){
        if(solidAt(position.x+dx,position.y+dy,position.z+dz))
          return true;
      }
    }
  }
  return false;
}

function moveAxis(axis,amount){
  const next=camera.position.clone();
  next[axis]+=amount;
  if(!collides(next)){
    camera.position[axis]=next[axis];
    return true;
  }
  return false;
}

// MINING, BUILDING, COMBAT
const raycaster=new THREE.Raycaster();
raycaster.far=6;

document.addEventListener("contextmenu",e=>e.preventDefault());

document.addEventListener("mousedown",e=>{
  if(!playing || (e.button!==0 && e.button!==2))return;

  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const targets=[
    ...visible.values(),
    ...creatures.filter(c=>c.group.visible).map(c=>c.group)
  ];
  const hits=raycaster.intersectObjects(targets,true);
  if(!hits.length)return;

  const hit=hits[0];
  let target=hit.object;
  while(target.parent && !target.userData.block &&
        !target.userData.creature)
    target=target.parent;

  const mob=target.userData.creature;

  if(mob){
    if(e.button===0){
      mob.health-=10;
      message("Hit "+mob.kind+"!");
      if(mob.health<=0){
        scene.remove(mob.group);
        creatures.splice(creatures.indexOf(mob),1);
        inventory.meat=(inventory.meat||0)+1;
        message("Creature defeated! +1 food");
      }
    }
    return;
  }

  if(!target.userData.block)return;

  const p=target.position;
  if(e.button===0){
    const type=blockAt(p.x,p.y,p.z);
    if(modifyBlock(p.x,p.y,p.z,0)){
      inventory[type]=(inventory[type]||0)+1;
      message("+1 "+BLOCKS[type].name);
    }
  }

  if(e.button===2){
    if((inventory[selected]||0)<=0){
      message("No blocks left! Mine or craft more.");
      return;
    }

    const pos=p.clone().add(hit.face.normal).round();
    const overlap=
      Math.abs(pos.x-camera.position.x)<.85 &&
      Math.abs(pos.z-camera.position.z)<.85 &&
      pos.y+.5>camera.position.y-1.62 &&
      pos.y-.5<camera.position.y+.2;

    if(!overlap&&!blockAt(pos.x,pos.y,pos.z)){
      if(modifyBlock(pos.x,pos.y,pos.z,selected))
        inventory[selected]--;
    }
  }
});

// SAVE PROGRESS
function saveGame(){
  try {
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      inventory,
      changes:[...changes],
      player:{
        health:player.health,
        hunger:player.hunger
      },
      position:camera.position.toArray()
    }));
    message("World saved!");
  } catch {
    message("Unable to save. Browser storage may be full.");
  }
}

document.getElementById("resetBtn").onclick=()=>{
  if(confirm("Reset your saved world?")){
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
};

// GAME LOOP
const clock=new THREE.Clock();
const move=new THREE.Vector3();
let survivalTimer=0;
let saveTimer=0;

function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.035);
  const t=clock.elapsedTime;

  worldTime+=dt;
  const dayProgress=(worldTime%240)/240;
  const isNight=dayProgress>.55 && dayProgress<.95;

  const brightness=isNight?.25:1;
  ambient.intensity=2*brightness;
  sun.intensity=2.4*brightness;
  scene.background.setHex(isNight?0x101a3b:0x8acaff);
  scene.fog.color.copy(scene.background);

  document.getElementById("clockText").textContent=
    isNight?"🌙 NIGHT":"☀️ DAY";

  for(const cloud of clouds){
    cloud.position.x+=dt*.4;
    if(cloud.position.x>55)cloud.position.x=-55;
  }

  water.position.y=-2.25+Math.sin(t*1.3)*.025;

  if(playing){
    if(keys.ArrowLeft)player.yaw+=2.4*dt;
    if(keys.ArrowRight)player.yaw-=2.4*dt;

    camera.rotation.y=player.yaw;
    camera.rotation.x=player.pitch;

    const forward=new THREE.Vector3(
      -Math.sin(player.yaw),0,-Math.cos(player.yaw)
    );
    const right=new THREE.Vector3(
      Math.cos(player.yaw),0,-Math.sin(player.yaw)
    );

    move.set(0,0,0);
    if(keys.KeyW||keys.ArrowUp)move.add(forward);
    if(keys.KeyS||keys.ArrowDown)move.sub(forward);
    if(keys.KeyA)move.sub(right);
    if(keys.KeyD)move.add(right);

    const speed=keys.ShiftLeft?7:4.5;

    if(move.lengthSq()>0){
      move.normalize().multiplyScalar(speed*dt);
      moveAxis("x",move.x);
      moveAxis("z",move.z);
    }

    if(player.flying){
      if(keys.Space)moveAxis("y",speed*dt);
      if(keys.ControlLeft)moveAxis("y",-speed*dt);
      player.velocityY=0;
    }else{
      if(keys.Space&&player.grounded){
        player.velocityY=7.5;
        player.grounded=false;
      }
      player.velocityY=Math.max(-18,player.velocityY-21*dt);
      const moved=moveAxis("y",player.velocityY*dt);
      if(!moved){
        player.grounded=player.velocityY<=0;
        player.velocityY=0;
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

    if(camera.position.y < -12 || player.health<=0){
      player.health=100;
      player.hunger=Math.max(50,player.hunger);
      camera.position.set(0,terrainHeight(0,5)+2.12,5);
      player.velocityY=0;
      message("Respawned at starting point!");
    }

    damageTimer=Math.max(0,damageTimer-dt);
    updateCreatures(dt,t,isNight);

    survivalTimer+=dt;
    if(survivalTimer>=5){
      survivalTimer=0;
      player.hunger=Math.max(0,player.hunger-1);
      if(player.hunger===0)
        player.health=Math.max(0,player.health-2);
    }

    document.getElementById("coordinates").textContent=
      `XYZ: ${camera.position.x.toFixed(0)}, `+
      `${camera.position.y.toFixed(0)}, `+
      `${camera.position.z.toFixed(0)}`;

    document.getElementById("healthText").textContent=
      `❤️ ${Math.ceil(player.health)} / 100`;
    document.getElementById("hungerText").textContent=
      `🍗 ${Math.ceil(player.hunger)} / 100`;

    document.getElementById("healthFill").style.width=
      player.health+"%";
    document.getElementById("hungerFill").style.width=
      player.hunger+"%";

    document.getElementById("selectedText").textContent=
      `${BLOCKS[selected].name} (${inventory[selected]||0})`;

    saveTimer+=dt;
    if(saveTimer>=60){
      saveTimer=0;
      saveGame();
    }
  }

  if(messageTimer>0){
    messageTimer-=dt;
    if(messageTimer<=0)
      document.getElementById("message").textContent="";
  }

  renderer.render(scene,camera);
}
animate();

window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
