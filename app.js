import * as THREE from "three";

const canvas = document.querySelector("#stage");
const wrap = document.querySelector("#stageWrap");
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(wrap.clientWidth,wrap.clientHeight,false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#30206e");
scene.fog = new THREE.Fog("#30206e", 12, 27);
const camera = new THREE.PerspectiveCamera(35,wrap.clientWidth/wrap.clientHeight,.1,100);
camera.position.set(0,4.4,12.8);
camera.lookAt(0,1.9,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x4d3478,2.1));
const key = new THREE.DirectionalLight(0xffffff,2.4); key.position.set(-4,8,7); key.castShadow=true; scene.add(key);
const pinkLight = new THREE.PointLight(0xff62bd,45,15); pinkLight.position.set(-5,3,1); scene.add(pinkLight);
const blueLight = new THREE.PointLight(0x51cfff,38,15); blueLight.position.set(5,4,-2); scene.add(blueLight);

const mat = (color, roughness=.78, metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const floor = new THREE.Mesh(new THREE.CircleGeometry(9,64),mat("#34206b")); floor.rotation.x=-Math.PI/2; floor.position.y=-.02; floor.receiveShadow=true; scene.add(floor);
const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.3,5.5,.24,64),mat("#6c42b6",.4,.25)); platform.position.y=.12; platform.receiveShadow=true; platform.castShadow=true; scene.add(platform);
const rim = new THREE.Mesh(new THREE.TorusGeometry(5.25,.09,10,80),mat("#ff75bd",.3,.4)); rim.rotation.x=Math.PI/2; rim.position.y=.25; scene.add(rim);
for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),mat(i%2?"#ffd66b":"#75eaff",.3));bulb.position.set(Math.cos(a)*5.25,.27,Math.sin(a)*5.25);scene.add(bulb)}
const back = new THREE.Mesh(new THREE.PlaneGeometry(18,8),mat("#39267e"));back.position.set(0,4,-5);scene.add(back);
for(let i=0;i<7;i++){let x=-7+i*2.3;let beam=new THREE.Mesh(new THREE.CylinderGeometry(.03,.8,8,16,1,true),new THREE.MeshBasicMaterial({color:i%2?0x7c5dff:0xff66b7,transparent:true,opacity:.12,side:THREE.DoubleSide}));beam.position.set(x,4,-3.9);beam.rotation.z=(i-3)*-.12;scene.add(beam)}
const stars=new THREE.Group();scene.add(stars);
for(let i=0;i<55;i++){let s=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.035,8,8),new THREE.MeshBasicMaterial({color:[0xffffff,0xffd76a,0x8deaff][i%3]}));s.position.set((Math.random()-.5)*15,1+Math.random()*6,-2.8+Math.random()*2);stars.add(s)}

function sphere(parent,color,pos,scale,detail=24){const m=new THREE.Mesh(new THREE.SphereGeometry(1,detail,detail),mat(color));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function capsule(parent,color,pos,r=.14,len=.48){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,4,12),mat(color));m.position.set(...pos);m.castShadow=true;parent.add(m);return m}
function makeCharacter(type,x){
 const root=new THREE.Group();root.position.set(x,.25,0);scene.add(root);
 const fur=type==="kiko"?"#ef783c":type==="milo"?"#c8cbd5":"#a96b43";
 const light=type==="kiko"?"#fff0df":type==="milo"?"#f5f3ef":"#e7b98a";
 const shirt=type==="kiko"?"#ed334c":type==="milo"?"#3978e8":"#28a66a";
 const body=sphere(root,fur,[0,1.12,0],[.57,.72,.43]);
 sphere(root,shirt,[0,1.05,.05],[.59,.48,.44]);
 sphere(root,light,[0,.98,.46],[.31,.31,.07]);
 const head=new THREE.Group();head.position.set(0,2.18,0);root.add(head);
 sphere(head,fur,[0,0,0],[.72,.67,.58],32);
 sphere(head,light,[0,-.28,.43],[.47,.29,.23]);
 // Ears
 if(type==="kiko"){let e1=sphere(head,fur,[-.43,.62,0],[.22,.55,.19]);e1.rotation.z=-.28;let e2=sphere(head,fur,[.43,.62,0],[.22,.55,.19]);e2.rotation.z=.28;sphere(head,"#ffb5a1",[-.43,.62,.16],[.11,.38,.035]);sphere(head,"#ffb5a1",[.43,.62,.16],[.11,.38,.035])}
 if(type==="milo"){let e1=sphere(head,fur,[-.32,.8,0],[.19,.78,.17]);e1.rotation.z=-.1;let e2=sphere(head,fur,[.32,.8,0],[.19,.78,.17]);e2.rotation.z=.1;sphere(head,"#f3a6b8",[-.32,.8,.15],[.105,.58,.035]);sphere(head,"#f3a6b8",[.32,.8,.15],[.105,.58,.035])}
 if(type==="teddy"){sphere(head,fur,[-.58,.43,0],[.25,.27,.2]);sphere(head,fur,[.58,.43,0],[.25,.27,.2]);sphere(head,light,[-.58,.43,.16],[.13,.15,.05]);sphere(head,light,[.58,.43,.16],[.13,.15,.05])}
 const eyes=[];
 for(const ex of [-.27,.27]){sphere(head,"#fff",[ex,.12,.49],[.17,.2,.08]);const iris=sphere(head,type==="milo"?"#4d85d7":"#5b3827",[ex,.1,.56],[.09,.12,.035]);sphere(head,"#17152a",[ex,.1,.59],[.045,.07,.02]);sphere(head,"#fff",[ex-.025,.145,.61],[.025,.03,.012]);eyes.push(iris)}
 if(type==="milo"){for(const ex of [-.27,.27]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.205,.025,8,32),mat("#292d43"));ring.position.set(ex,.12,.52);head.add(ring)}const bridge=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,.025),mat("#292d43"));bridge.position.set(0,.12,.54);head.add(bridge)}
 const nose=sphere(head,type==="kiko"?"#633c32":type==="milo"?"#ef9cae":"#56352b",[0,-.12,.67],[.09,.065,.05]);
 const mouth=sphere(head,"#51212b",[0,-.37,.615],[.15,.035,.025]);
 const arms=[];
 for(const side of [-1,1]){let arm=capsule(root,shirt,[side*.62,1.25,.02],.14,.46);arm.rotation.z=side*.45;arms.push(arm);sphere(root,light,[side*.72,.99,.04],[.17,.16,.16])}
 const legs=[];for(const side of [-1,1]){let leg=capsule(root,fur,[side*.25,.4,.02],.16,.35);legs.push(leg);sphere(root,type==="milo"?"#f0f1f5":"#fff0df",[side*.27,.22,.17],[.23,.13,.34])}
 // Hoodie mark
 const badge=sphere(root,type==="kiko"?"#ffd35c":type==="milo"?"#eaf2ff":"#f5e6a8",[0,1.2,.49],[.13,.13,.035]);
 return {type,root,head,mouth,arms,legs,eyes,phase:Math.random()*6};
}
const characters={kiko:makeCharacter("kiko",-3),milo:makeCharacter("milo",0),teddy:makeCharacter("teddy",3)};
let selected="kiko",playing=true,recording=false,clock=new THREE.Clock(),audioLevel=0;
const audio=document.querySelector("#songAudio");
let analyser=null,audioCtx=null,sourceNode=null;
function setScene(v){const configs={concert:["#30206e","#34206b"],sunset:["#ed8d75","#8d4b86"],mint:["#5a9f9a","#246a72"]};scene.background=new THREE.Color(configs[v][0]);scene.fog.color.set(configs[v][0]);floor.material.color.set(configs[v][1]);back.material.color.set(configs[v][0]);}
document.querySelector("#sceneSelect").addEventListener("change",e=>setScene(e.target.value));
document.querySelectorAll(".character-chip").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.character;document.querySelectorAll(".character-chip").forEach(x=>x.classList.toggle("active",x===b));document.querySelector("#singerSelect").value=selected}));
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();const data=new Uint8Array(32);if(analyser){analyser.getByteFrequencyData(data);audioLevel=data.reduce((a,b)=>a+b,0)/(data.length*255)}
 Object.values(characters).forEach((c,i)=>{const active=playing;const beat=Math.sin(t*5+c.phase);c.root.position.y=.25+(active?Math.max(0,beat)*.18:0);c.root.rotation.z=active?Math.sin(t*2+c.phase)*.035:0;c.head.rotation.y=active?Math.sin(t*1.4+c.phase)*.09:0;c.head.rotation.z=active?Math.sin(t*2+c.phase)*.035:0;c.mouth.scale.y=.035+(active?(audioLevel>.015?audioLevel*.5:Math.max(0,Math.sin(t*8+c.phase))*.12):0);c.arms.forEach((a,j)=>{a.rotation.z=(j===0?-.45:.45)+(active?Math.sin(t*5+c.phase+j)*.3:0)});c.legs.forEach((l,j)=>{l.rotation.x=active?Math.sin(t*5+c.phase+j)*.17:0})});
 stars.rotation.y=t*.025;renderer.render(scene,camera)}
animate();
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
new ResizeObserver(resize).observe(wrap);
document.querySelector("#playBtn").onclick=()=>{playing=true;if(audio.src)audio.play().catch(()=>{})};
document.querySelector("#pauseBtn").onclick=()=>{playing=false;audio.pause()};
document.querySelector("#resetBtn").onclick=()=>{audio.pause();audio.currentTime=0;playing=false};
audio.addEventListener("play",()=>playing=true);audio.addEventListener("pause",()=>playing=false);
document.querySelector("#audioFile").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;audio.src=URL.createObjectURL(f);document.querySelector("#audioName").textContent=f.name;});
audio.addEventListener("play",()=>{if(!audioCtx){audioCtx=new AudioContext();sourceNode=audioCtx.createMediaElementSource(audio);analyser=audioCtx.createAnalyser();analyser.fftSize=64;sourceNode.connect(analyser);analyser.connect(audioCtx.destination)}audioCtx.resume()});
document.querySelector("#assignBtn").onclick=()=>{const who=document.querySelector("#singerSelect").value.toUpperCase();const ta=document.querySelector("#lyrics");const start=ta.selectionStart,end=ta.selectionEnd;const tag=`[${who}]\n`;ta.value=ta.value.slice(0,start)+tag+ta.value.slice(start,end)+ta.value.slice(end);ta.focus()};
const status=document.querySelector("#renderStatus");
document.querySelector("#renderBtn").onclick=async()=>{
 if(recording)return;const seconds=document.querySelector("#durationSelect").value;const max=seconds==="audio"?(audio.duration||30):Number(seconds);
 if(!Number.isFinite(max)||max<=0){status.textContent="Please upload a valid audio file or choose a fixed duration.";return}
 try{
  if(audio.src){audio.currentTime=0;if(!audioCtx){audioCtx=new AudioContext();sourceNode=audioCtx.createMediaElementSource(audio);analyser=audioCtx.createAnalyser();analyser.fftSize=64;sourceNode.connect(analyser);analyser.connect(audioCtx.destination)}await audioCtx.resume()}
  const canvasStream=renderer.domElement.captureStream(30);let tracks=[...canvasStream.getVideoTracks()];
  if(audio.src&&audio.captureStream){tracks.push(...audio.captureStream().getAudioTracks())}
  const stream=new MediaStream(tracks);const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?"video/webm;codecs=vp9,opus":"video/webm";
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(document.querySelector("#songTitle").value.trim().replace(/[^a-z0-9-_]+/gi,"-")||"aidel-toons")+".webm";a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent="Your animated video has been downloaded. Convert WebM to MP4 in a video editor if needed.";recording=false;document.querySelector("#renderBtn").textContent="● Record animated video"};
  recording=true;document.querySelector("#renderBtn").textContent="Recording…";status.textContent=`Recording for up to ${Math.round(max)} seconds. Keep this tab open.`;playing=true;if(audio.src)await audio.play().catch(()=>{});rec.start();setTimeout(()=>{if(rec.state!=="inactive")rec.stop();audio.pause()},Math.min(max,300)*1000);
 }catch(err){recording=false;status.textContent="Recording failed in this browser. Try Chrome and allow media playback. "+err.message}
};
async function requestBackend(path,payload){status.textContent="Sending request to the AIDEL TOONS backend…";try{const base=(localStorage.getItem("aidelBackend")||"").replace(/\/$/,"");if(!base){status.textContent="Backend not connected yet. Deploy the backend and set its URL in the browser's local storage as aidelBackend. See README.";return}const res=await fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw new Error(data.error||"Request failed");status.textContent=data.message||"Request accepted. Check your connected AI workflow for its result."}catch(e){status.textContent="Could not complete AI request: "+e.message}}
document.querySelector("#generateMusicBtn").onclick=()=>requestBackend("/api/generate-music",{title:document.querySelector("#songTitle").value,lyrics:document.querySelector("#lyrics").value,characters:["Kiko","Milo","Teddy"],voiceDirections:{Kiko:"bright youthful playful cartoon pop",Milo:"smooth melodic mid-range pop",Teddy:"warm deeper playful cartoon pop"}});
document.querySelector("#generateVideoBtn").onclick=()=>requestBackend("/api/generate-video",{title:document.querySelector("#songTitle").value,lyrics:document.querySelector("#lyrics").value,style:"colourful stylized cinematic 3D cartoon",characters:["Kiko","Milo","Teddy"]});
document.querySelector("#helpBtn").onclick=()=>document.querySelector("#helpDialog").showModal();
document.querySelector("#closeHelp").onclick=()=>document.querySelector("#helpDialog").close();
