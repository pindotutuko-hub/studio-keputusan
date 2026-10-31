/* Denah 3D bersama (three.js) untuk gim pindotutuko.id.
   import {create} from '/gim/denah3d.js'; const v=create(el,{model:()=>({...}),onRoom:k=>{},lang:()=>'id',t:{}}); v.update(); v.tour(k); */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const WH=2.6,WT=.17,DH=2.05;
const texC={};
function tex(kind){if(texC[kind])return texC[kind];const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 const P={wood:()=>{g.fillStyle='#d9b88a';g.fillRect(0,0,256,256);for(let i=0;i<8;i++){g.fillStyle=i%2?'#cfac7c':'#dcbd91';g.fillRect(i*32,0,31,256);g.strokeStyle='rgba(120,80,40,.25)';for(let k=0;k<6;k++){g.beginPath();g.moveTo(i*32+4+k*4,0);g.bezierCurveTo(i*32+8+k*4,80,i*32+k*4,170,i*32+6+k*4,256);g.stroke()}g.fillStyle='#b8966a';g.fillRect(i*32+31,0,1,256);g.fillRect(i*32,(i*97)%256,32,1)}},
  tile:()=>{g.fillStyle='#e7eff1';g.fillRect(0,0,256,256);g.strokeStyle='#b7c6cc';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,256);g.moveTo(0,i*64);g.lineTo(256,i*64);g.stroke()}},
  terr:()=>{g.fillStyle='#ece4d5';g.fillRect(0,0,256,256);for(let i=0;i<900;i++){g.fillStyle=['#b9ab92','#a7998a','#d4c6ae','#8f8676'][i%4];g.fillRect((i*73)%256,(i*151)%256,2,2)}g.strokeStyle='#d6c9b2';g.lineWidth=2;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,256);g.moveTo(0,i*128);g.lineTo(256,i*128);g.stroke()}},
  tegel:()=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#d4c3a3':'#e4d7c0';g.fillRect(x*64,y*64,64,64)}},
  stone:()=>{g.fillStyle='#d6cebf';g.fillRect(0,0,256,256);g.strokeStyle='#b5aa96';g.lineWidth=3;for(let y=0;y<4;y++){g.beginPath();g.moveTo(0,y*64);g.lineTo(256,y*64);g.stroke();for(let x=0;x<3;x++){const ox=(y%2)*42+x*85;g.beginPath();g.moveTo(ox,y*64);g.lineTo(ox,y*64+64);g.stroke()}}},
  grass:()=>{g.fillStyle='#8fbf6e';g.fillRect(0,0,256,256);for(let i=0;i<1600;i++){g.fillStyle=['#7cae5c','#a3cf82','#6e9f50'][i%3];g.fillRect((i*97)%256,(i*57)%256,2,4)}},
  asph:()=>{g.fillStyle='#5f6064';g.fillRect(0,0,256,256);for(let i=0;i<1400;i++){g.fillStyle=['#6c6d71','#56575b','#77787c'][i%3];g.fillRect((i*89)%256,(i*41)%256,2,2)}}};
 (P[kind]||P.terr)();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;texC[kind]=t;return t}
const FK={bath:'tile',kitchen:'tile',exam:'tile',market:'tile',bed:'wood',krob:'wood',prayer:'wood',grass:'grass',terrace:'stone',gang:'stone',road:'asph',parking:'asph',pendopo:'tegel',hall:'tegel'};
export function create(host,opt){
 const D=window.Denah,M={};let renderer,scene,camera,controls,root,hud,tour=null,angles={},doorObjs={},floors=[],clock=new THREE.Clock();
 const mat=(c,o)=>{const k=c+JSON.stringify(o||{});if(!M[k])M[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{}));return M[k]};
 const box=new THREE.BoxGeometry(1,1,1);
 const B=(m,x,y,z,sx,sy,sz,p)=>{const o=new THREE.Mesh(box,m);o.scale.set(sx,sy,sz);o.position.set(x,y+sy/2,z);o.castShadow=true;o.receiveShadow=true;(p||root).add(o);return o};
 const lang=()=>opt.lang?opt.lang():'id',T=k=>(opt.t&&opt.t[lang()]&&opt.t[lang()][k])||k;
 function label(text,sub){const c=document.createElement('canvas'),g=c.getContext('2d');c.width=512;c.height=sub?180:120;g.font='700 54px Inter,system-ui,sans-serif';const w=Math.min(500,g.measureText(text).width+40);
  g.fillStyle='rgba(255,253,248,.92)';g.beginPath();g.roundRect((512-w)/2,10,w,sub?160:96,28);g.fill();g.fillStyle='#1f1c18';g.textAlign='center';g.fillText(text,256,78);if(sub){g.font='700 48px Inter,system-ui,sans-serif';g.fillStyle='#a33a2a';g.fillText(sub,256,145)}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(2.6,2.6*c.height/512,1);s.renderOrder=10;return s}
 function furn(r,ct){const x=r.x,z=r.y,w=r.w,h=r.h,cx=x+w/2,cz=z+h/2,m=.3,W1=mat('#f7f2ea'),Wd=mat('#8a6a4f'),Fa=mat('#c9b79a');
  if(ct==='bed'&&w>=2&&h>=2){const bw=Math.min(1.5,w-2*m),bh=Math.min(2,h-2*m);B(Wd,x+m+bw/2,0,z+m+bh/2,bw,.28,bh);B(W1,x+m+bw/2,.28,z+m+bh/2+.1,bw-.06,.16,bh-.25);B(mat('#7d9bb0'),x+m+bw/2,.42,z+m+bh*.65,bw-.04,.04,bh*.6);if(w-bw>1.6)B(Wd,x+w-m-.3,0,z+m+.6,.6,1.8,1.2)}
  else if(ct==='krob'){B(mat('#7a4b2a'),cx,0,z+m+.8,1.6,.5,1.6);B(mat('#c8a14b'),cx,.5,z+m+.8,1.3,.9,.06)}
  else if(ct==='living'&&w>=2&&h>=2){const sw=Math.min(2.2,w-2*m);B(Fa,cx,0,z+h-m-.38,sw,.42,.75);B(Fa,cx,.42,z+h-m-.1,sw,.4,.2);B(Wd,cx,0,z+h-m-1.4,1,.4,.6)}
  else if(ct==='dining'){B(Wd,cx,0,cz,1.6,.75,.9);[-.5,0,.5].forEach(o=>{B(Wd,cx+o,0,cz-.7,.4,.45,.4);B(Wd,cx+o,0,cz+.7,.4,.45,.4)})}
  else if(ct==='kitchen'){B(mat('#e9e2d6'),cx,0,z+.42,w-.24,.88,.6);B(mat('#3a3a3a'),x+w-.8,.88,z+.42,.8,.02,.45)}
  else if(ct==='bath'){B(W1,x+.55,0,z+.6,.4,.42,.55);B(W1,x+w-.55,.75,z+.35,.6,.12,.4)}
  else if(ct==='class'){for(let zz=z+1;zz<z+h-.6;zz+=.9)for(let xx=x+.45;xx<x+w-.6;xx+=.8)B(mat('#c9a77e'),xx+.3,.7,zz+.2,.6,.04,.4);B(mat('#2f4f3f'),cx,.9,z+.12,w-1,1.1,.04)}
  else if(ct==='office'){B(Wd,cx,0,cz,1.2,.75,.6);B(mat('#444'),cx,0,cz+.6,.45,.48,.45)}
  else if(ct==='store'){B(mat('#d9cdb7'),cx,0,z+.35,w-.3,1.9,.4);B(mat('#d9cdb7'),cx,0,z+h-.35,w-.3,1.9,.4)}
  else if(ct==='exam'){B(W1,x+.6,0,z+1.2,.7,.7,1.8)}
  else if(ct==='stair'){for(let i=0;i<9;i++)B(mat('#cfc6b6'),cx,0,z+h-.3-i*(h-.6)/9,w-.6,.17*(i+1),(h-.6)/9)}
  else if(ct==='pendopo'){[[.33,.3],[.67,.3],[.33,.7],[.67,.7]].forEach(p=>B(mat('#6b4f3a'),x+w*p[0],0,z+h*p[1],.28,3.2,.28));[[0,0],[1,0],[0,1],[1,1],[.5,0],[.5,1]].forEach(p=>B(mat('#8a6a4f'),x+.25+(w-.5)*p[0],0,z+.25+(h-.5)*p[1],.2,2.4,.2))}
  else if(ct==='grass'){[[.25,.4],[.75,.5]].forEach((p,i)=>{if(w<3&&i)return;B(mat('#6b4f3a'),x+w*p[0],0,z+h*p[1],.16,1.4,.16);const s=new THREE.Mesh(new THREE.IcosahedronGeometry(Math.min(.9,h*.35),1),mat(i?'#4f8f4a':'#5e9e55'));s.position.set(x+w*p[0],1.9,z+h*p[1]);s.castShadow=true;root.add(s)})}
  else if(ct==='market'){for(let zz=z+.9;zz<z+h-.5;zz+=1.2)for(let xx=x+1;xx<x+w-.6;xx+=1.5){B(mat('#c9a77e'),xx,0,zz,1.1,.8,.6);B(mat(['#d94f3a','#e0a526','#5e9e55'][Math.floor(xx+zz)%3]),xx,.8,zz,.9,.12,.45)}}
  else if(ct==='kiosk'){B(mat('#c9a77e'),cx,0,z+.45,w-.4,.9,.5)}
  else if(ct==='prayer'){B(mat('#6f8f6a'),cx,.01,cz,w-.6,.02,h-.6)}
  else if(ct==='parking'){for(let i=0;i<3;i++){const px=x+1.5+i*3;if(px>x+w-1)break;B(mat(['#a33a2a','#2f6f8f','#d8d8d8'][i]),px,.2,z+h/2,1.6,.5,.8)}}}
 function build(){if(!root)return;root.clear();floors=[];const mdl=opt.model(),plan=mdl.rooms;
  plan.forEach(r=>{const ct=D.cat(r),c=mdl.tint&&mdl.tint[r.k];let m;
   if(c)m=new THREE.MeshStandardMaterial({color:new THREE.Color(`rgb(${c.join(',')})`),roughness:.9});else{const t=tex(FK[ct]||'terr').clone();t.needsUpdate=true;t.repeat.set(r.w/2,r.h/2);m=new THREE.MeshStandardMaterial({map:t,roughness:ct==='grass'?1:.6})}
   if(mdl.sel===r.k){m.emissive=new THREE.Color('#a33a2a');m.emissiveIntensity=.35}
   const f=new THREE.Mesh(new THREE.PlaneGeometry(r.w,r.h),m);f.rotation.x=-Math.PI/2;f.position.set(r.x+r.w/2,.01,r.y+r.h/2);f.receiveShadow=true;f.userData.k=r.k;root.add(f);floors.push(f);
   if(!c&&!mdl.hideFurn)furn(r,ct);
   const sub=mdl.labels&&mdl.labels[r.k];if(mdl.showLabels!==false||sub!=null){const sp=label(r.n[lang()],sub);sp.position.set(r.x+r.w/2,2.9,r.y+r.h/2);root.add(sp)}});
  if(mdl.blocks){const roofs=['#b5523b','#9c4a33','#8d8f93','#c46b45','#a8583e'];for(let gx=0;gx<mdl.W;gx++)for(let gy=0;gy<mdl.H-1;gy++){if(D.roomAt(plan,gx+.5,gy+.5))continue;const h=((gx*73856093)^(gy*19349663))>>>0,hh=1.6+(h%3)*.5;B(mat('#efe6d6'),gx+.5,0,gy+.5,.92,hh,.92);const rf=new THREE.Mesh(new THREE.ConeGeometry(.68,.5,4),mat(roofs[h%5]));rf.rotation.y=Math.PI/4;rf.position.set(gx+.5,hh+.25,gy+.5);rf.castShadow=true;root.add(rf)}}
  const opens=(mdl.doors||[]).map(d=>({G:D.geom(plan,d[0],d[1]),state:d[2]||1,key:d[0]+'|'+d[1]})).filter(o=>o.G);
  const wallM=mat('#f2ede4'),capM=mat('#2b2622'),glass=mat('#a9cbe0',{transparent:true,opacity:.35,roughness:.05}),frameM=mat('#6f5a46');
  D.segs(plan).forEach(sg=>{const hz=sg.y1===sg.y2,a=hz?sg.x1:sg.y1,b=hz?sg.x2:sg.y2,line=hz?sg.y1:sg.x1;let cut=null;
   opens.forEach(o=>{if(o.G.oo||o.G.hz!==hz)return;const ol=hz?o.G.p0[1]:o.G.p0[0];if(Math.abs(ol-line)>1e-6)return;const o1=hz?o.G.p0[0]:o.G.p0[1],o2=hz?o.G.p1[0]:o.G.p1[1];if(o2>a&&o1<b)cut=[Math.max(a,o1),Math.min(b,o2)]});
   const piece=(u1,u2,y0,y1,m)=>{if(u2-u1<1e-4)return;const c=(u1+u2)/2;if(hz)B(m,c,y0,line,u2-u1+.001,y1-y0,WT);else B(m,line,y0,c,WT,y1-y0,u2-u1+.001)};
   if(cut){piece(a,cut[0],0,WH,wallM);piece(cut[1],b,0,WH,wallM);piece(cut[0],cut[1],DH,WH,wallM)}
   else if(sg.win){piece(a,b,0,.9,wallM);piece(a,b,2.1,WH,wallM);const c=(a+b)/2;if(hz)B(glass,c,.9,line,.98,1.2,.03);else B(glass,line,.9,c,.03,1.2,.98)}else piece(a,b,0,WH,wallM);
   const c=(a+b)/2;if(hz)B(capM,c,WH,line,b-a+WT,.02,WT);else B(capM,line,WH,c,WT,.02,b-a+WT)});
  const doorM=mat('#8a5a2b');opens.forEach(o=>{const G=o.G;if(G.oo)return;const hz=G.hz,p0=G.p0,p1=G.p1,len=G.len,mid=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2];
   if(hz){B(frameM,p0[0]+.03,0,p0[1],.06,DH,WT+.04);B(frameM,p1[0]-.03,0,p0[1],.06,DH,WT+.04);B(frameM,mid[0],DH-.06,p0[1],len,.08,WT+.04)}else{B(frameM,p0[0],0,p0[1]+.03,WT+.04,DH,.06);B(frameM,p0[0],0,p1[1]-.03,WT+.04,DH,.06);B(frameM,p0[0],DH-.06,mid[1],WT+.04,.08,len)}
   if(o.state===1){const piv=new THREE.Group();piv.position.set(p0[0],0,p0[1]);root.add(piv);const lw=len-.08;B(doorM,hz?lw/2:0,0,hz?0:lw/2,hz?lw:.05,DH-.08,hz?.05:lw,piv);
    const n=G.nrm,target=hz?(n[1]>0?-1:1)*Math.PI*.45:(n[0]>0?1:-1)*Math.PI*.45;piv.rotation.y=angles[o.key]??0;doorObjs[o.key]={piv,target}}});
  if(mdl.entry){const e=mdl.entry,ar=new THREE.Mesh(new THREE.ConeGeometry(.3,.6,16),mat('#a33a2a'));ar.rotation.x=-Math.PI/2;ar.position.set(e[0],.15,e[1]+.6);root.add(ar);B(mat('#a33a2a'),e[0],0,e[1]+1.3,.14,.1,.9)}}
 function frame(){const m=opt.model(),cx=m.W/2,cz=m.H/2,R=Math.max(m.W,m.H);controls.target.set(cx,0,cz);camera.position.set(cx-R*.15,R*1.35,cz+R*1.15);controls.update()}
 function nav(){const bar=document.createElement('div');bar.className='nav3d';const en=()=>lang()==='en';
  const Bt=(l,tt,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.title=tt;b.setAttribute('aria-label',tt);b.onclick=e=>{e.stopPropagation();fn()};b.addEventListener('pointerdown',e=>e.stopPropagation());bar.appendChild(b);return b};
  const rot=a=>{const o=camera.position.clone().sub(controls.target);o.applyAxisAngle(new THREE.Vector3(0,1,0),a);camera.position.copy(controls.target).add(o);controls.update()};
  Bt('⟲',en()?'Rotate left':'Putar kiri',()=>rot(Math.PI/8));Bt('⟳',en()?'Rotate right':'Putar kanan',()=>rot(-Math.PI/8));
  Bt('＋',en()?'Zoom in':'Perbesar',()=>{camera.position.lerp(controls.target,.2);controls.update()});Bt('－',en()?'Zoom out':'Perkecil',()=>{const o=camera.position.clone().sub(controls.target).multiplyScalar(1.25);if(o.length()<50)camera.position.copy(controls.target).add(o);controls.update()});
  const ar=Bt('↻',en()?'Auto-rotate':'Putar otomatis',()=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=1.2;ar.classList.toggle('on',controls.autoRotate)});
  Bt('⌂',en()?'Reset view':'Pandangan awal',()=>{stopTour();controls.autoRotate=false;ar.classList.remove('on');frame()});host.appendChild(bar)}
 function resize(){const w=host.clientWidth,h=host.clientHeight||w*.75;if(!w)return;renderer.setSize(w,h,false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';camera.aspect=w/h;camera.updateProjectionMatrix()}
 function pathTo(target){const m=opt.model(),adj={};m.rooms.forEach(r=>adj[r.k]=[]);(m.doors||[]).forEach(d=>{adj[d[0]].push(d[1]);adj[d[1]].push(d[0])});const s0=m.root||m.rooms[0].k,prev={};prev[s0]=null;const q=[s0];
  for(let i=0;i<q.length;i++)adj[q[i]].forEach(v=>{if(!(v in prev)){prev[v]=q[i];q.push(v)}});if(!(target in prev))return null;const seq=[];for(let k=target;k!=null;k=prev[k])seq.unshift(k);
  const ctr=k=>{const r=m.rooms.find(r=>r.k===k);return [r.x+r.w/2,r.y+r.h/2]},e=m.entry||ctr(s0),pts=[{p:[e[0],e[1]+3],d:0,r:null},{p:[e[0],e[1]-.2],d:0,r:seq[0]},{p:ctr(seq[0]),d:0,r:seq[0]}];
  for(let i=1;i<seq.length;i++){const G=D.geom(m.rooms,seq[i-1],seq[i]);if(!G){pts.push({p:ctr(seq[i]),d:i,r:seq[i]});continue}const md=[(G.p0[0]+G.p1[0])/2,(G.p0[1]+G.p1[1])/2],n=G.hz?[0,1]:[1,0],ca=ctr(seq[i-1]),sd=(ca[0]-md[0])*n[0]+(ca[1]-md[1])*n[1]>0?1:-1;
   pts.push({p:[md[0]+n[0]*sd*.6,md[1]+n[1]*sd*.6],d:i-1,r:seq[i-1]});pts.push({p:[md[0]-n[0]*sd*.6,md[1]-n[1]*sd*.6],d:i,r:seq[i]});pts.push({p:ctr(seq[i]),d:i,r:seq[i]})}return pts}
 const nameOf=k=>{const r=opt.model().rooms.find(r=>r.k===k);return r?r.n[lang()]:k};
 function startTour(target){const pts=pathTo(target);if(!pts)return;controls.enabled=false;controls.autoRotate=false;tour={pts,i:0,u:0,look:new THREE.Vector3(pts[1].p[0],1.5,pts[1].p[1]),target};camera.position.set(pts[0].p[0],1.6,pts[0].p[1]);hud.style.display='block'}
 function stepTour(dt){const t=tour,a=t.pts[t.i],b=t.pts[t.i+1];if(!b){hud.textContent=T('arrive').replace('{r}',nameOf(t.target)).replace('{d}',a.d);return}
  const dx=b.p[0]-a.p[0],dz=b.p[1]-a.p[1],len=Math.hypot(dx,dz)||1e-3;t.u+=dt*1.3/len;if(t.u>=1){t.i++;t.u=0;return}
  camera.position.set(a.p[0]+dx*t.u,1.6,a.p[1]+dz*t.u);const nx=t.pts[Math.min(t.pts.length-1,t.i+2)]||b,la=new THREE.Vector3(b.p[0]*.7+nx.p[0]*.3,1.45,b.p[1]*.7+nx.p[1]*.3);t.look.lerp(la,Math.min(1,dt*3));camera.lookAt(t.look);
  hud.textContent=T('depthNow').replace('{d}',b.d).replace('{r}',b.r?nameOf(b.r):'')}
 function stopTour(){if(!tour)return;tour=null;controls.enabled=true;hud.style.display='none';frame()}
 // init
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 host.appendChild(renderer.domElement);renderer.domElement.style.display='block';
 scene=new THREE.Scene();scene.background=new THREE.Color('#cfe3f2');scene.fog=new THREE.Fog('#cfe3f2',40,90);camera=new THREE.PerspectiveCamera(42,4/3,.05,300);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=1.48;controls.minDistance=2;controls.maxDistance=50;controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
 scene.add(new THREE.HemisphereLight('#ffffff','#9b8b6c',.95));const sun=new THREE.DirectionalLight('#fff4e0',2.1);sun.position.set(-12,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,far:80});sun.shadow.bias=-.0004;scene.add(sun);scene.add(sun.target);
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(200,200),mat('#c9bea5'));gr.rotation.x=-Math.PI/2;gr.position.y=-.01;gr.receiveShadow=true;scene.add(gr);
 root=new THREE.Group();scene.add(root);hud=document.createElement('div');hud.className='tourHud';hud.style.display='none';host.appendChild(hud);nav();build();frame();sun.target.position.copy(controls.target);
 const ray=new THREE.Raycaster(),v=new THREE.Vector2();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||tour)return;const d=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(d>6||!opt.onRoom)return;const r=renderer.domElement.getBoundingClientRect();v.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v,camera);const h=ray.intersectObjects(floors,false)[0];if(h)opt.onRoom(h.object.userData.k)});
 new ResizeObserver(resize).observe(host);resize();
 (function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta());for(const k in doorObjs){const d=doorObjs[k],c=d.piv.rotation.y;d.piv.rotation.y=c+(d.target-c)*Math.min(1,dt*4);angles[k]=d.piv.rotation.y}if(tour)stepTour(dt);else controls.update();renderer.render(scene,camera)})();
 return {update:build,frame,tour:startTour,stopTour,isTour:()=>!!tour};
}
