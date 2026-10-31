var KBOSM=(function(){
var CELL=12,EPS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
function bbox(lat,lon,W,H){var dy=H*CELL/2/111320,dx=W*CELL/2/(111320*Math.cos(lat*Math.PI/180));return {s:lat-dy,n:lat+dy,w:lon-dx,e:lon+dx}}
function query(b){var bb=[b.s,b.w,b.n,b.e].map(function(v){return v.toFixed(6)}).join(',');
 return '[out:json][timeout:40];(way["building"]('+bb+');way["highway"]('+bb+');way["waterway"]('+bb+');way["natural"="water"]('+bb+');relation["natural"="water"]('+bb+');way["landuse"~"^(grass|village_green|recreation_ground|reservoir|basin)$"]('+bb+');way["leisure"~"^(park|garden|playground|pitch)$"]('+bb+');node["natural"="tree"]('+bb+'););out geom;'}
function fetchAny(q){var ctrls=[];return new Promise(function(res,rej){var fails=0;EPS.forEach(function(u){var c=new AbortController();ctrls.push(c);
  fetch(u,{method:'POST',body:'data='+encodeURIComponent(q),signal:c.signal}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){ctrls.forEach(function(x){if(x!==c)x.abort()});res(j)}).catch(function(){if(++fails===EPS.length)rej(new Error('overpass'))})})})}
function dseg(px,py,a,b){var vx=b[0]-a[0],vy=b[1]-a[1],L=vx*vx+vy*vy,t=L?((px-a[0])*vx+(py-a[1])*vy)/L:0;t=Math.max(0,Math.min(1,t));var x=a[0]+t*vx-px,y=a[1]+t*vy-py;return Math.sqrt(x*x+y*y)}
function dline(px,py,p){var m=1e9;for(var i=1;i<p.length;i++)m=Math.min(m,dseg(px,py,p[i-1],p[i]));return m}
function inPoly(x,y,p){var c=false;for(var i=0,j=p.length-1;i<p.length;j=i++){var a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function raster(j,lat,lon,W,H){var b=bbox(lat,lon,W,H),kx=111320*Math.cos(lat*Math.PI/180),ky=111320;
 function xy(p){return [(p.lon-b.w)*kx/CELL,(b.n-p.lat)*ky/CELL]}
 var P={b:[],w:[],g:[]},lines=[],trees=[];
 (j.elements||[]).forEach(function(e){var t=e.tags||{};
  if(e.type==='node'){if(t.natural==='tree')trees.push(xy(e));return}
  var gs=[];if(e.type==='way'&&e.geometry)gs=[e.geometry];else if(e.type==='relation')(e.members||[]).forEach(function(m){if(m.role!=='inner'&&m.geometry)gs.push(m.geometry)});
  gs.forEach(function(gm){var pts=gm.map(xy),cl=gm.length>3&&gm[0].lat===gm[gm.length-1].lat&&gm[0].lon===gm[gm.length-1].lon;
   if(t.building){if(cl)P.b.push(pts);return}
   if(t.natural==='water'||/^(reservoir|basin)$/.test(t.landuse||'')||t.waterway==='riverbank'){if(cl)P.w.push(pts);return}
   if(t.leisure||/^(grass|village_green|recreation_ground)$/.test(t.landuse||'')){if(cl)P.g.push(pts);return}
   if(t.waterway){var wd={river:22,canal:10,stream:7}[t.waterway],w=parseFloat(t.width)||wd;if(w)lines.push({k:'W',p:pts,r:Math.max(w/2,6)/CELL});return}
   if(t.highway&&t.area!=='yes'){var h=t.highway,rw={motorway:12,trunk:10,trunk_link:8,primary:9,primary_link:7,secondary:8,secondary_link:6,tertiary:7,tertiary_link:6,residential:6,unclassified:6}[h];
     if(rw)lines.push({k:'R',p:pts,r:Math.max(rw/2,6)/CELL});else if(/^(living_street|service|footway|path|steps|pedestrian|track|cycleway|alley|corridor)$/.test(h))lines.push({k:'g',p:pts,r:6/CELL})}})});
 var g=[],nH=0,land=0,known=0;
 for(var y=0;y<H;y++){var row=[];for(var x=0;x<W;x++){var cx=x+.5,cy=y+.5,tp=null,k,i;
   var hit=function(k){return lines.some(function(l){return l.k===k&&dline(cx,cy,l.p)<l.r})};
   var cover=function(arr){var n=0;for(var a=0;a<3;a++)for(var c=0;c<3;c++){var sx=x+(a+.5)/3,sy=y+(c+.5)/3;if(arr.some(function(p){return inPoly(sx,sy,p)}))n++}return n};
   if(hit('W')||cover(P.w)>=5)tp='W';else if(hit('R'))tp='R';else if(hit('g'))tp='g';
   else{var cb=cover(P.b);if(cb>=3)tp='h';else if(cover(P.g)>=5)tp='r';else if(trees.some(function(p){return p[0]>=x&&p[0]<x+1&&p[1]>=y&&p[1]<y+1}))tp='t'}
   if(tp==='h')nH++;if(tp!=='W'&&tp!=='R'&&tp!=='g'){land++;if(tp)known++}
   row.push(tp)}g.push(row)}
 var filled=land>0&&nH/land<.35;
 for(y=0;y<H;y++)for(x=0;x<W;x++)if(g[y][x]===null)g[y][x]=filled?'h':'e';
 var hasR=g.some(function(r){return r.indexOf('R')>=0}),addedR=false;
 if(!hasR){var cand=[[0,'top'],[H-1,'bottom']].map(function(c){var wn=g[c[0]].filter(function(v){return v==='W'}).length;return {y:c[0],wn:wn}}).sort(function(a,b){return a.wn-b.wn})[0];
   for(x=0;x<W;x++)if(g[cand.y][x]!=='W')g[cand.y][x]='R';addedR=true}
 var kk=0;g.forEach(function(r){r.forEach(function(v){if(v==='h')kk++})});
 return {rows:g.map(function(r){return r.join('')}),filled:filled,addedR:addedR,houses:kk,bld:P.b.length,lines:lines.length,water:g.some(function(r){return r.indexOf('W')>=0})}}
function load(lat,lon,W,H){var key='kbosm:'+lat.toFixed(5)+','+lon.toFixed(5)+':'+W+'x'+H;try{var c=localStorage.getItem(key);if(c)return Promise.resolve(JSON.parse(c))}catch(e){}
 return fetchAny(query(bbox(lat,lon,W,H))).then(function(j){var r=raster(j,lat,lon,W,H);try{localStorage.setItem(key,JSON.stringify(r))}catch(e){}return r})}
return {bbox:bbox,raster:raster,load:load,CELL:CELL};
})();
