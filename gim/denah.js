/* Denah realistis bersama untuk gim pindotutuko.id: material lantai, perabot, dinding tebal, simbol pintu.
   Denah.draw(svg,{rooms,W,H,entry,doors:[[a,b,state?]],lang,tint:{k:[r,g,b]},hideFurn,labels:{k:'teks'},onRoom,sel,focus}) */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
function el(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function cat(r){var k=r.k;if(r.ty==='gang')return k==='JLN'?'road':'gang';
  if(/^(KM|WC)$/.test(k))return 'bath';if(/^(DPR|PAW)$/.test(k))return 'kitchen';if(/^(KT1|KT2|KTU|KTA|SKI|STN|GKI|GTE)$/.test(k))return 'bed';if(k==='STE')return 'krob';
  if(/^(TAM|LAP)$/.test(k)||(k==='HAL'&&r.w>=12&&r.h<=2&&r.n&&/Halaman/.test(r.n.id)))return 'grass';if(/^(TRS|TER)$/.test(k))return 'terrace';if(k==='PEN')return 'pendopo';if(k==='HAL')return 'parking';
  if(/^(TMU|KEL|DAL|TGU|FOY|PRI)$/.test(k))return 'living';if(k==='MKN')return 'dining';if(/^R[1-4]$/.test(k))return 'class';if(/^(DSN|STF|PND|FAR|KTR)$/.test(k))return 'office';
  if(/^(ARS|LAB|GDG)$/.test(k))return 'store';if(/^(PR1|PR2)$/.test(k))return 'exam';if(k==='TGA')return 'stair';if(/^(LOB|KOR|LOR|LSM)$/.test(k))return 'hall';if(/^(LSY|LIK)$/.test(k))return 'market';if(/^(KSA|KSB)$/.test(k))return 'kiosk';if(k==='MUS')return 'prayer';return 'living'}
var FLOOR={bath:'pTile',kitchen:'pTile',exam:'pTile',market:'pTile',bed:'pWood',krob:'pWood',prayer:'pWood',grass:'pGrass',terrace:'pStone',gang:'pStone',road:'pAsph',parking:'pAsph',pendopo:'pTegel',hall:'pTegel',kiosk:'pTerr',living:'pTerr',dining:'pTerr',class:'pTerr',office:'pTerr',store:'pTerr',stair:'pTerr'};
function defs(svg,uid){var d=el('defs',{},svg);function pat(id,w,h,f){var p=el('pattern',{id:id+uid,width:w,height:h,patternUnits:'userSpaceOnUse'},d);f(p)}
  pat('pWood',.24,1.6,function(p){el('rect',{width:.24,height:1.6,fill:'#dcbf93'},p);el('line',{x1:.235,y1:0,x2:.235,y2:1.6,stroke:'#b8976a','stroke-width':.012},p);el('line',{x1:0,y1:.9,x2:.24,y2:.9,stroke:'#c4a578','stroke-width':.01},p)});
  pat('pTile',.4,.4,function(p){el('rect',{width:.4,height:.4,fill:'#e6eef0'},p);el('path',{d:'M0 .4V0H.4',fill:'none',stroke:'#b9c7cc','stroke-width':.018},p)});
  pat('pTerr',.6,.6,function(p){el('rect',{width:.6,height:.6,fill:'#ece4d6'},p);el('path',{d:'M0 .6V0H.6',fill:'none',stroke:'#d8ccb7','stroke-width':.012},p);[[.12,.2],[.4,.1],[.3,.45],[.5,.38]].forEach(function(c){el('circle',{cx:c[0],cy:c[1],r:.014,fill:'#b9ab92'},p)})});
  pat('pTegel',.5,.5,function(p){el('rect',{width:.5,height:.5,fill:'#e3d6bf'},p);el('rect',{width:.25,height:.25,fill:'#d6c5a6'},p);el('rect',{x:.25,y:.25,width:.25,height:.25,fill:'#d6c5a6'},p)});
  pat('pStone',.9,.6,function(p){el('rect',{width:.9,height:.6,fill:'#d7cfc0'},p);el('path',{d:'M0 0H.9M0 .3H.9M.45 0V.3M0 .3V.6M.9 .3V.6',stroke:'#b9ae9b','stroke-width':.015,fill:'none'},p)});
  pat('pGrass',.5,.5,function(p){el('rect',{width:.5,height:.5,fill:'#a8cf8a'},p);el('path',{d:'M.1 .2l.03 -.08M.14 .2l.02 -.07M.35 .42l.03 -.08M.38 .42l.02 -.06',stroke:'#7fb062','stroke-width':.02},p)});
  pat('pAsph',1,1,function(p){el('rect',{width:1,height:1,fill:'#6f6f72'},p);[[.2,.3],[.7,.6],[.45,.85]].forEach(function(c){el('circle',{cx:c[0],cy:c[1],r:.02,fill:'#858589'},p)})})}
var FS={fill:'#fffdf8',stroke:'#7b6f60','stroke-width':.03};
function fr(g,x,y,w,h,ex){var a={x:x,y:y,width:w,height:h,rx:.05};for(var k in FS)a[k]=FS[k];if(ex)for(var k2 in ex)a[k2]=ex[k2];return el('rect',a,g)}
function circ(g,cx,cy,r,f){return el('circle',{cx:cx,cy:cy,r:r,fill:f||'#fffdf8',stroke:'#7b6f60','stroke-width':.03},g)}
function furn(g,r,ct){var x=r.x,y=r.y,w=r.w,h=r.h,m=.3,cx=x+w/2,cy=y+h/2;
  if(ct==='bed'&&w>=2&&h>=2){var bw=Math.min(1.5,w-2*m),bh=Math.min(2,h-2*m);fr(g,x+m,y+m,bw,bh);fr(g,x+m+.1,y+m+.08,bw-.2,.35,{fill:'#f1ebe0'});el('line',{x1:x+m,x2:x+m+bw,y1:y+m+bh*.55,y2:y+m+bh*.55,stroke:'#7b6f60','stroke-width':.03},g);if(w-bw>1.6)fr(g,x+w-m-.6,y+m,.6,1.2,{fill:'#efe5d4'})}
  else if(ct==='krob'){fr(g,cx-.8,y+m,1.6,Math.min(1.6,h-2*m),{fill:'#e9d9b8'});fr(g,cx-.6,y+m+.2,1.2,Math.min(1.2,h-2*m-.4),{fill:'#f7efe0'})}
  else if(ct==='living'&&w>=2&&h>=2){var sw=Math.min(2.2,w-2*m);fr(g,cx-sw/2,y+h-m-.75,sw,.75);fr(g,cx-sw/2+.12,y+h-m-.75,sw-.24,.2,{fill:'#efe5d4'});fr(g,cx-.5,y+h-m-1.7,1,.6,{fill:'#e9dcc6'})}
  else if(ct==='dining'){fr(g,cx-.8,cy-.45,1.6,.9,{fill:'#e9dcc6'});[-.5,0,.5].forEach(function(o){circ(g,cx+o,cy-.7,.18);circ(g,cx+o,cy+.7,.18)})}
  else if(ct==='kitchen'){fr(g,x+.12,y+.12,w-.24,.6,{fill:'#efe8dc'});circ(g,x+w-.6,y+.42,.13,'none');circ(g,x+w-1,y+.42,.13,'none');fr(g,x+.5,y+.22,.6,.4,{fill:'#dfe9ee'})}
  else if(ct==='bath'){el('ellipse',{cx:x+.55,cy:y+.6,rx:.2,ry:.27,fill:'#fffdf8',stroke:'#7b6f60','stroke-width':.03},g);fr(g,x+.38,y+.15,.34,.18);fr(g,x+w-.85,y+.15,.6,.4,{fill:'#dfe9ee'})}
  else if(ct==='class'){el('line',{x1:x+.5,x2:x+w-.5,y1:y+.25,y2:y+.25,stroke:'#2f4f3f','stroke-width':.08},g);for(var yy=y+1;yy<y+h-.6;yy+=.9)for(var xx=x+.45;xx<x+w-.6;xx+=.8)fr(g,xx,yy,.6,.4)}
  else if(ct==='office'){fr(g,cx-.6,cy-.35,1.2,.6,{fill:'#e9dcc6'});circ(g,cx,cy+.55,.2)}
  else if(ct==='store'){fr(g,x+.15,y+.15,w-.3,.4,{fill:'#e5dccb'});fr(g,x+.15,y+h-.55,w-.3,.4,{fill:'#e5dccb'})}
  else if(ct==='exam'){fr(g,x+.25,y+.3,.7,1.8);fr(g,x+w-1.1,y+h-1,.85,.5,{fill:'#e9dcc6'})}
  else if(ct==='stair'){for(var s2=0;s2<9;s2++)el('line',{x1:x+.3,x2:x+w-.3,y1:y+.3+s2*(h-.6)/9,y2:y+.3+s2*(h-.6)/9,stroke:'#7b6f60','stroke-width':.025},g)}
  else if(ct==='pendopo'){[[.33,.3],[.67,.3],[.33,.7],[.67,.7]].forEach(function(p){fr(g,x+w*p[0]-.15,y+h*p[1]-.15,.3,.3,{fill:'#6b4f3a',stroke:'none'})});[[0,0],[1,0],[0,1],[1,1],[.5,0],[.5,1]].forEach(function(p){fr(g,x+.15+(w-.5)*p[0],y+.15+(h-.5)*p[1],.2,.2,{fill:'#8a6a4f',stroke:'none'})})}
  else if(ct==='grass'){[[.25,.4],[.75,.5]].forEach(function(p,i){if(w<3&&i)return;var rr=Math.min(.7,h*.3);el('circle',{cx:x+w*p[0]+.06,cy:y+h*p[1]+.06,r:rr,fill:'#000',opacity:.12},g);el('circle',{cx:x+w*p[0],cy:y+h*p[1],r:rr,fill:'#5e9e55',opacity:.9},g)})}
  else if(ct==='market'){for(var yy2=y+.6;yy2<y+h-.5;yy2+=1.2)for(var xx2=x+.5;xx2<x+w-.8;xx2+=1.5)fr(g,xx2,yy2,1.1,.6,{fill:'#e9dcc6'})}
  else if(ct==='kiosk'){fr(g,x+.2,y+.2,w-.4,.5,{fill:'#e9dcc6'});fr(g,x+.2,y+.2,.5,h-.4,{fill:'#e9dcc6'})}
  else if(ct==='prayer'){for(var i=0;i<3;i++)el('line',{x1:x+.4,x2:x+w-.4,y1:y+.8+i*.7,y2:y+.8+i*.7,stroke:'#8a6a4f','stroke-width':.05,'stroke-dasharray':'.4 .1'},g);fr(g,cx-.3,y+.15,.6,.3,{fill:'#e9dcc6'})}
  else if(ct==='parking'){for(var px=x+.5;px<x+w-.5;px+=1.2)el('line',{x1:px,x2:px,y1:y+.2,y2:y+h-.2,stroke:'#f3f3f3','stroke-width':.05},g)}}
function roomAt(plan,px,py){for(var i=0;i<plan.length;i++){var r=plan[i];if(px>r.x&&px<r.x+r.w&&py>r.y&&py<r.y+r.h)return r}return null}
function closed(r){return r.ty!=='open'&&r.ty!=='gang'}
function segs(plan){var out=[],seen={};plan.forEach(function(r){if(!closed(r))return;
  function add(x1,y1,x2,y2,nx,ny){var k=[x1,y1,x2,y2].join(',');if(seen[k])return;seen[k]=1;var o=roomAt(plan,(x1+x2)/2+nx*.1,(y1+y2)/2+ny*.1);out.push({x1:x1,y1:y1,x2:x2,y2:y2,ext:!o,a:r.k,b:o?o.k:null})}
  for(var x=r.x;x<r.x+r.w;x++){add(x,r.y,x+1,r.y,0,-1);add(x,r.y+r.h,x+1,r.y+r.h,0,1)}
  for(var y=r.y;y<r.y+r.h;y++){add(r.x,y,r.x,y+1,-1,0);add(r.x+r.w,y,r.x+r.w,y+1,1,0)}});
  var by={};out.forEach(function(s,i){if(!s.ext)return;var r=plan.filter(function(q){return q.k===s.a})[0],ct=cat(r);if(/bath|stair|store/.test(ct))return;var key=s.a+(s.y1===s.y2?'h'+s.y1:'v'+s.x1);(by[key]=by[key]||[]).push(i)});
  for(var k in by){var l=by[k];if(l.length>=2)out[l[Math.floor(l.length/2)]].win=true}return out}
function sharedEdge(a,b){var e=1e-9,lo,hi;
  if(Math.abs(a.x+a.w-b.x)<e||Math.abs(b.x+b.w-a.x)<e){var x=Math.abs(a.x+a.w-b.x)<e?b.x:a.x;lo=Math.max(a.y,b.y);hi=Math.min(a.y+a.h,b.y+b.h);if(hi-lo>e)return {v:true,x:x,lo:lo,hi:hi}}
  if(Math.abs(a.y+a.h-b.y)<e||Math.abs(b.y+b.h-a.y)<e){var y=Math.abs(a.y+a.h-b.y)<e?b.y:a.y;lo=Math.max(a.x,b.x);hi=Math.min(a.x+a.w,b.x+b.w);if(hi-lo>e)return {v:false,y:y,lo:lo,hi:hi}}return null}
function geom(plan,a,b){var A=plan.filter(function(r){return r.k===a})[0],B=plan.filter(function(r){return r.k===b})[0];if(!A||!B)return null;var s=sharedEdge(A,B);if(!s)return null;
  var len=Math.min((s.hi-s.lo)*.6,1),mid=(s.lo+s.hi)/2,hz=!s.v,p0=hz?[mid-len/2,s.y]:[s.x,mid-len/2],p1=hz?[mid+len/2,s.y]:[s.x,mid+len/2],bc=[B.x+B.w/2,B.y+B.h/2],nrm=hz?[0,bc[1]>s.y?1:-1]:[bc[0]>s.x?1:-1,0];
  return {s:s,hz:hz,len:len,p0:p0,p1:p1,nrm:nrm,oo:!closed(A)&&!closed(B)}}
function doorSym(g,G,state){var hz=G.hz,p0=G.p0,p1=G.p1,n=G.nrm,len=G.len;if(G.oo)return;
  var gr=hz?{x:p0[0],y:p0[1]-.11,width:len,height:.22}:{x:p0[0]-.11,y:p0[1],width:.22,height:len};gr.fill='#efe6d6';el('rect',gr,g);
  [p0,p1].forEach(function(p){el('line',{x1:p[0]-n[0]*.11,y1:p[1]-n[1]*.11,x2:p[0]+n[0]*.11,y2:p[1]+n[1]*.11,stroke:'#2b2622','stroke-width':.05},g)});
  if(state===2)return;var H=p0,C=p1,O=[H[0]+n[0]*len,H[1]+n[1]*len],v1=[O[0]-H[0],O[1]-H[1]],v2=[C[0]-H[0],C[1]-H[1]],sw=(v1[0]*v2[1]-v1[1]*v2[0])>0?1:0;
  el('line',{x1:H[0],y1:H[1],x2:O[0],y2:O[1],stroke:'#8a5a2b','stroke-width':.06,'stroke-linecap':'round'},g);
  el('path',{d:'M'+O[0]+' '+O[1]+' A'+len+' '+len+' 0 0 '+sw+' '+C[0]+' '+C[1],fill:'none',stroke:'#8a5a2b','stroke-width':.025,'stroke-dasharray':'.06 .05'},g)}
var UID=0;
function draw(svg,o){var uid='_'+(++UID),plan=o.rooms,lang=o.lang||'id';svg.innerHTML='';svg.setAttribute('viewBox','-0.7 -0.7 '+(o.W+1.4)+' '+(o.H+2));defs(svg,uid);
  el('rect',{x:-0.7,y:-0.7,width:o.W+1.4,height:o.H+2,fill:'#f4efe6'},svg);
  if(o.blocks){var gB=el('g',{},svg);for(var gx=0;gx<o.W;gx++)for(var gy=0;gy<o.H-1;gy++){if(roomAt(plan,gx+.5,gy+.5))continue;var hh=((gx*73856093)^(gy*19349663))>>>0;el('rect',{x:gx+.06,y:gy+.06,width:.88,height:.88,fill:['#b5523b','#9c4a33','#8d8f93','#c46b45','#a8583e'][hh%5],rx:.05},gB);el('line',{x1:gx+.06,x2:gx+.94,y1:gy+.5,y2:gy+.5,stroke:'#000','stroke-opacity':.25,'stroke-width':.04},gB)}}
  var gF=el('g',{},svg),gFu=el('g',{'pointer-events':'none'},svg),gW=el('g',{'pointer-events':'none'},svg),gD=el('g',{'pointer-events':'none'},svg),gS=el('g',{'pointer-events':'none'},svg),gT=el('g',{'pointer-events':'none'},svg);
  plan.forEach(function(r){var ct=cat(r),c=o.tint&&o.tint[r.k],fill=c?'rgb('+c.join(',')+')':'url(#'+FLOOR[ct]+uid+')';
    var rect=el('rect',{x:r.x,y:r.y,width:r.w,height:r.h,fill:fill,'class':'room',tabindex:o.onRoom?0:-1,role:o.onRoom?'button':'img','aria-label':r.n[lang]},gF);
    if(o.onRoom){rect.style.cursor='pointer';rect.addEventListener('click',function(){o.onRoom(r.k)});rect.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();o.onRoom(r.k)}})}
    if(!closed(r))el('rect',{x:r.x+.04,y:r.y+.04,width:r.w-.08,height:r.h-.08,fill:'none',stroke:'#7a6e5d','stroke-width':.04,'stroke-dasharray':'.25 .15'},gF);
    if(!c&&!o.hideFurn)furn(gFu,r,ct);
    if(o.sel===r.k||o.focus===r.k)el('rect',{x:r.x+.12,y:r.y+.12,width:Math.max(.05,r.w-.24),height:Math.max(.05,r.h-.24),fill:o.sel===r.k?'rgba(163,58,42,.12)':'none',stroke:o.sel===r.k?'#a33a2a':'#1f1c18','stroke-width':.14,'stroke-dasharray':o.focus===r.k&&o.sel!==r.k?'.3 .18':'none',rx:.08},gS);
    var name=r.n[lang],vert=r.h>r.w*1.6&&r.w<2.2,span=(vert?r.h:r.w)-.3,thick=vert?r.w:r.h,fs=Math.min(.46,thick*.4,span/(name.length*.56)),cx=r.x+r.w/2,cy=r.y+r.h/2,sub=o.labels&&o.labels[r.k],ink=c?((.299*c[0]+.587*c[1]+.114*c[2])>150?'#1b1814':'#fff'):'#1f1c18',show2=sub!=null&&thick>=1.4;
    var tx=el('text',{x:cx,y:cy+(show2?-.12:fs*.36),'text-anchor':'middle','font-size':fs,'font-weight':700,fill:ink,stroke:c?'none':'#fffaf2','stroke-width':.09,'paint-order':'stroke','stroke-linejoin':'round','font-family':'Inter,system-ui,sans-serif'},gT);if(vert)tx.setAttribute('transform','rotate(-90 '+cx+' '+cy+')');tx.textContent=name;
    if(show2){var vt=el('text',{x:cx,y:cy+.5,'text-anchor':'middle','font-size':Math.min(.42,fs),'font-weight':700,fill:ink,'font-family':'Space Grotesk,Inter,sans-serif'},gT);vt.textContent=sub}});
  segs(plan).forEach(function(sg){el('line',{x1:sg.x1,y1:sg.y1,x2:sg.x2,y2:sg.y2,stroke:'#2b2622','stroke-width':.17,'stroke-linecap':'square'},gW);
    if(sg.win){var hz=sg.y1===sg.y2,mx=(sg.x1+sg.x2)/2,my=(sg.y1+sg.y2)/2,a=hz?{x:mx-.35,y:my-.07,width:.7,height:.14}:{x:mx-.07,y:my-.35,width:.14,height:.7};a.fill='#f7fbff';a.stroke='#2b2622';a['stroke-width']=.025;el('rect',a,gW)}});
  (o.doors||[]).forEach(function(d){var G=geom(plan,d[0],d[1]);if(G)doorSym(gD,G,d[2]||1)});
  if(o.entry){var ex=o.entry[0],ey=o.entry[1];el('path',{d:'M'+ex+' '+(ey+1.05)+' L'+ex+' '+(ey+.25)+' M'+(ex-.3)+' '+(ey+.55)+' L'+ex+' '+(ey+.25)+' L'+(ex+.3)+' '+(ey+.55),stroke:'#a33a2a','stroke-width':.12,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},gT);
    var en=el('text',{x:ex+.45,y:ey+.95,'font-size':.36,fill:'#a33a2a','font-weight':700},gT);en.textContent=lang==='en'?'Entry':'Masuk'}}
window.Denah={draw:draw,cat:cat,segs:segs,geom:geom,closed:closed,roomAt:roomAt};
})();
