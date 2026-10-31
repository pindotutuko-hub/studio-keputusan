var KBOSM=(function(){
/* Rasterisasi data OpenStreetMap (ubin vektor OpenMapTiles dari OpenFreeMap) ke papan 16 × 11 petak @12 m. */
var CELL=12;
function bbox(lat,lon,W,H){var dy=H*CELL/2/111320,dx=W*CELL/2/(111320*Math.cos(lat*Math.PI/180));return {s:lat-dy,n:lat+dy,w:lon-dx,e:lon+dx}}
function dseg(px,py,a,b){var vx=b[0]-a[0],vy=b[1]-a[1],L=vx*vx+vy*vy,t=L?((px-a[0])*vx+(py-a[1])*vy)/L:0;t=Math.max(0,Math.min(1,t));var x=a[0]+t*vx-px,y=a[1]+t*vy-py;return Math.sqrt(x*x+y*y)}
function dline(px,py,p){var m=1e9;for(var i=1;i<p.length;i++)m=Math.min(m,dseg(px,py,p[i-1],p[i]));return m}
function inRing(x,y,p){var c=false;for(var i=0,j=p.length-1;i<p.length;j=i++){var a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function inPoly(x,y,poly){if(!inRing(x,y,poly[0]))return false;for(var i=1;i<poly.length;i++)if(inRing(x,y,poly[i]))return false;return true}
/* feats: [{layer:'building'|'water'|'waterway'|'transportation'|'park'|'landcover', props:{}, geom:GeoJSON geometry}] */
function raster(feats,lat,lon,W,H){var b=bbox(lat,lon,W,H),kx=111320*Math.cos(lat*Math.PI/180),ky=111320;
 function xy(c){return [(c[0]-b.w)*kx/CELL,(b.n-c[1])*ky/CELL]}
 function polys(g){if(g.type==='Polygon')return [g.coordinates.map(function(r){return r.map(xy)})];if(g.type==='MultiPolygon')return g.coordinates.map(function(p){return p.map(function(r){return r.map(xy)})});return []}
 function lines(g){if(g.type==='LineString')return [g.coordinates.map(xy)];if(g.type==='MultiLineString')return g.coordinates.map(function(l){return l.map(xy)});return []}
 var P={b:[],w:[],g:[]},L=[],nB=0;
 feats.forEach(function(f){var p=f.props||{},c=p['class'],g=f.geom;if(!g)return;
  if(f.layer==='building'){nB++;P.b=P.b.concat(polys(g))}
  else if(f.layer==='water')P.w=P.w.concat(polys(g));
  else if(f.layer==='park'||(f.layer==='landcover'&&/grass|wood|forest/.test(c||'')))P.g=P.g.concat(polys(g));
  else if(f.layer==='waterway'){var wd={river:22,canal:10,stream:7}[c];if(wd)lines(g).forEach(function(l){L.push({k:'W',p:l,r:Math.max(wd/2,6)/CELL})})}
  else if(f.layer==='transportation'&&g.type.indexOf('Polygon')<0){var rw={motorway:12,trunk:10,primary:9,secondary:8,tertiary:7,minor:6}[c];
   if(rw)lines(g).forEach(function(l){L.push({k:'R',p:l,r:Math.max(rw/2,6)/CELL})});
   else if(/^(service|path|track|pedestrian)$/.test(c||''))lines(g).forEach(function(l){L.push({k:'g',p:l,r:5/CELL})})}});
 var g=[],nH=0,land=0;
 for(var y=0;y<H;y++){var row=[];for(var x=0;x<W;x++){var cx=x+.5,cy=y+.5,tp=null;
   var hit=function(k){return L.some(function(l){return l.k===k&&dline(cx,cy,l.p)<l.r})};
   var cover=function(arr){var n=0;for(var a=0;a<3;a++)for(var c=0;c<3;c++){var sx=x+(a+.5)/3,sy=y+(c+.5)/3;if(arr.some(function(p){return inPoly(sx,sy,p)}))n++}return n};
   if(hit('W')||cover(P.w)>=5)tp='W';else if(hit('R'))tp='R';else if(hit('g'))tp='g';
   else if(cover(P.b)>=3)tp='h';else if(cover(P.g)>=5)tp='r';
   if(tp==='h')nH++;if(tp!=='W'&&tp!=='R'&&tp!=='g')land++;row.push(tp)}g.push(row)}
 var filled=land>0&&nH/land<.35;
 for(y=0;y<H;y++)for(x=0;x<W;x++)if(g[y][x]===null)g[y][x]=filled?'h':'e';
 var hasR=g.some(function(r){return r.indexOf('R')>=0}),addedR=false;
 if(!hasR){var top=g[0].filter(function(v){return v==='W'}).length,bot=g[H-1].filter(function(v){return v==='W'}).length,ry=top<=bot?0:H-1;for(x=0;x<W;x++)if(g[ry][x]!=='W')g[ry][x]='R';addedR=true}
 var kk=0;g.forEach(function(r){r.forEach(function(v){if(v==='h')kk++})});
 return {rows:g.map(function(r){return r.join('')}),filled:filled,addedR:addedR,houses:kk,bld:nB,water:g.some(function(r){return r.indexOf('W')>=0})}}
/* Ambil fitur dari peta MapLibre yang sudah memuat ubin OpenFreeMap. */
function fromMap(map,lat,lon,W,H){var src=null,st=map.getStyle();for(var k in st.sources)if(st.sources[k].type==='vector'){src=k;break}
 if(!src)throw new Error('nosrc');var out=[];
 ['building','water','waterway','transportation','park','landcover'].forEach(function(l){var fs=[];try{fs=map.querySourceFeatures(src,{sourceLayer:l})}catch(e){}
  fs.forEach(function(f){out.push({layer:l,props:f.properties,geom:f.geometry})})});
 return raster(out,lat,lon,W,H)}
return {bbox:bbox,raster:raster,fromMap:fromMap,CELL:CELL};
})();
