/* Inspirasi foto untuk gim pindotutuko.id — mengambil foto dari koleksi Lensa Preseden (/preseden/data.json).
   Pemakaian: Inspirasi.mount(el,{cats:['kayutangan',...],re:/gang|lorong/i,n:4,lang:function(){return 'id'},title:{id:'..',en:'..'},seed:1})
             Inspirasi.update(el,{...opsi baru})  */
(function(){
'use strict';
var DATA_URL='/preseden/data.json',PRE='/preseden/',cache=null,wait=[];
function load(cb){if(cache)return cb(cache);wait.push(cb);if(wait.length>1)return;
  fetch(DATA_URL,{cache:'force-cache'}).then(function(r){return r.json()}).then(function(d){cache=Array.isArray(d)?d:[];}).catch(function(){cache=[]}).then(function(){var w=wait;wait=[];w.forEach(function(f){f(cache)})})}
var ALB_URL='/wp-content/uploads/album/album.json',acache=null,await_=[];
function loadAlb(cb){if(acache)return cb(acache);await_.push(cb);if(await_.length>1)return;
  fetch(ALB_URL,{cache:'force-cache'}).then(function(r){return r.json()}).then(function(d){acache=((d&&d.items)||[]).filter(function(x){return !x.ar&&!/^(video|tutorial)$/.test(x.th||'')}).map(function(x){return {id:'al:'+x.id,title:x.ti||'',city:x.lo||'',cat:x.th,y:x.y}})}).catch(function(){acache=[]}).then(function(){var w=await_;await_=[];w.forEach(function(f){f(acache)})})}
function img(id){return id.indexOf('al:')===0?'/wp-content/uploads/album/w/'+id.slice(3)+'.jpg':PRE+'img/'+id+'.jpg'}
function thumb(id){return id.indexOf('al:')===0?'/wp-content/uploads/album/t2/'+id.slice(3)+'.jpg':PRE+'img/'+id+'-t.jpg'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function rng(seed){var s=(seed|0)||1;return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}
function hav(a,b,c,d){var R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h))}
function pick(data,o){if(o.near){var nr=o.near,near=data.filter(function(x){return typeof x.lat==='number'&&hav(nr.lat,nr.lon,x.lat,x.lon)<=(nr.km||1)}).sort(function(a,b){return hav(nr.lat,nr.lon,a.lat,a.lon)-hav(nr.lat,nr.lon,b.lat,b.lon)});
  if(near.length){var r0=rng(o.seed||1),top=near.slice(0,Math.max(o.n||4,8));for(var q=top.length-1;q>0;q--){var z=Math.floor(r0()*(q+1)),tt=top[q];top[q]=top[z];top[z]=tt}if(top.length>=(o.n||4))return top.slice(0,o.n||4);o=Object.assign({},o,{ids:top.map(function(x){return x.id})})}}
  var c=o.cats||[],re=o.re,ids=o.ids||[],n=o.n||4;
  var pool=(c.length||re)?data.filter(function(x){return (!c.length||c.indexOf(x.cat)>=0)&&(!re||re.test(x.title||''))}):[];
  if(o.album&&o.albumData){var ar=o.album.re,th=o.album.th||[];pool=pool.concat(o.albumData.filter(function(x){return (!th.length||th.indexOf(x.cat)>=0)&&(!ar||ar.test(x.title))}))}
  data.concat(o.albumData||[]).forEach(function(x){if(ids.indexOf(x.id)>=0&&pool.indexOf(x)<0)pool.push(x)});
  if(pool.length<n&&c.length)data.forEach(function(x){if(pool.length<n*3&&pool.indexOf(x)<0&&c.indexOf(x.cat)>=0)pool.push(x)});
  var seen={};pool=pool.filter(function(x){var k=(x.title||'')+'|'+(x.city||'');if(seen[k]>=1)return false;seen[k]=(seen[k]||0)+1;return true});
  var pinned=pool.filter(function(x){return ids.indexOf(x.id)>=0}),rest=pool.filter(function(x){return ids.indexOf(x.id)<0}),r=rng(o.seed||Date.now());
  for(var i=rest.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=rest[i];rest[i]=rest[j];rest[j]=t}
  return pinned.concat(rest).slice(0,n)}
var CSS='.insp{margin:0}.insp-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 8px}.insp-h b{font-size:14px}.insp-h a{font-size:12px;color:inherit;opacity:.75}'+
 '.insp-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}.insp-i{position:relative;border:0;padding:0;border-radius:10px;overflow:hidden;cursor:zoom-in;background:#0002;aspect-ratio:4/3}'+
 '.insp-i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.insp-i:hover img{transform:scale(1.05)}'+
 '.insp-i span{position:absolute;left:0;right:0;bottom:0;padding:14px 7px 5px;font-size:11px;line-height:1.25;color:#fff;text-align:left;background:linear-gradient(transparent,rgba(0,0,0,.72))}'+
 '.insp-c{font-size:11px;opacity:.7;margin-top:6px}.insp-lb{position:fixed;inset:0;z-index:2147483100;background:rgba(10,10,10,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;cursor:zoom-out}'+
 '.insp-lb img{max-width:100%;max-height:80vh;border-radius:8px;box-shadow:0 10px 40px #000}.insp-lb p{color:#eee;font:14px/1.4 Inter,system-ui,sans-serif;text-align:center;max-width:720px;margin:10px 0 0}';
function css(){if(document.getElementById('insp-css'))return;var s=document.createElement('style');s.id='insp-css';s.textContent=CSS;document.head.appendChild(s)}
var L={id:{h:'Inspirasi dari lapangan',more:'Lensa Preseden →',cr:'Foto: koleksi Pindo Tutuko'},en:{h:'Inspiration from the field',more:'Photo Precedents →',cr:'Photos: Pindo Tutuko collection'}};
function render(el){var o=el.__insp,lg=o.lang?o.lang():'id',tx=L[lg]||L.id,title=o.title?(o.title[lg]||o.title.id):tx.h;
  load(function(data){if(o.album&&!o.albumData){return loadAlb(function(al){o.albumData=al;render(el)})}var list=pick(data,o);if(!list.length){el.innerHTML='';el.hidden=true;return}el.hidden=false;
    el.innerHTML='<div class="insp"><div class="insp-h"><b>'+esc(title)+'</b><a href="'+PRE+'" target="_blank" rel="noopener">'+tx.more+'</a></div><div class="insp-g">'+
      list.map(function(x,i){return '<button class="insp-i" type="button" data-i="'+i+'"><img loading="lazy" alt="'+esc(x.title)+'" src="'+thumb(x.id)+'" onerror="this.onerror=null;this.src=\''+img(x.id)+'\'"><span>'+esc(x.title)+(x.city?' · '+esc(x.city):'')+'</span></button>'}).join('')+
      '</div><div class="insp-c">'+tx.cr+'</div></div>';
    el.querySelectorAll('.insp-i').forEach(function(b){b.onclick=function(){var x=list[+b.getAttribute('data-i')],lb=document.createElement('div');lb.className='insp-lb';
      lb.innerHTML='<img alt="'+esc(x.title)+'" src="'+img(x.id)+'"><p>'+esc(x.title)+(x.area?' — '+esc(x.area):'')+(x.city?', '+esc(x.city):'')+(x.country?', '+esc(x.country):'')+(x.date?' · '+esc(x.date.slice(0,4)):'')+'</p>';
      function close(){lb.remove();document.removeEventListener('keydown',k)}function k(e){if(e.key==='Escape')close()}lb.onclick=close;document.addEventListener('keydown',k);document.body.appendChild(lb)}})})}
window.Inspirasi={mount:function(el,o){if(!el)return;css();el.__insp=o||{};render(el)},update:function(el,o){if(!el)return;el.__insp=Object.assign({},el.__insp||{},o||{});render(el)},refresh:function(el){if(el&&el.__insp)render(el)},_pick:function(o,cb){load(function(d){if(o.album){loadAlb(function(al){o.albumData=al;cb(pick(d,o))})}else cb(pick(d,o))})}};
})();
