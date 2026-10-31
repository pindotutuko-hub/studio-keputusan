/* Babat Alas v0.1 — simulasi permukiman 3D (pindotutuko.id)
   Rujukan struktur: simcity-threejs-clone (CitySim.js) © Daniel Greenheck, MIT. Semua model bangunan dibuat prosedural. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const $=id=>document.getElementById(id);
const API='api/';
const N=40;               // petak per sisi (1 petak ≈ 10 m)
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let lang=store.get('baLang')==='en'?'en':'id';

/* ================= Teks ================= */
const TX={
 id:{home:'Beranda',tag:'Simulasi permukiman 3D · dari babat alas sampai kawasan pintar',intro:'Kamu adalah pemimpin yang membuka lahan di lokasi nyata di Indonesia atau dunia. Tumbuhkan dusun menjadi kampung, desa, sampai kawasan modern — dengan memperhatikan ekonomi, sosial budaya, dan lingkungan. Permainan tersimpan dan bisa dilanjutkan kapan saja.',
  login:'Masuk',register:'Daftar',user:'Nama pengguna (3–32 huruf/angka)',pass:'Kata sandi (min. 6)',kampus:'Kampus / institusi (opsional)',kelas:'Kode kelas dari dosen (opsional)',guest:'Main sebagai tamu',privacy:'Tidak perlu email. Kata sandi disimpan dalam bentuk hash. Mode tamu hanya tersimpan di peramban ini.',
  continue:'Lanjutkan permainan',newgame:'Permainan baru',logout:'Keluar',hello:'Selamat datang, {n}',guestHi:'Mode tamu',saveInfo:'Simpanan: <b>{name}</b> · {loc} · era {era} · {kk} KK · bulan ke-{m}',noSave:'Belum ada simpanan. Mulai permainan baru.',confirmNew:'Permainan lama akan diganti. Klik lagi untuk yakin.',
  charH:'Buat tokoh pemimpin',charP:'Tokohmu memulai sebagai pembuka lahan. Gelarnya naik mengikuti tahap permukiman dan aturan negara tempat kampung didirikan.',cName:'Nama tokoh',cAvatar:'Rupa tokoh',cOrigin:'Asal daerah',cMotto:'Semboyan',cStyle:'Gaya bangunan utama',cStyleP:'Gaya bisa diganti per bangunan. Gaya lokal memberi bonus kohesi warga; gaya modern menaikkan nilai lahan pada era akhir.',next:'Lanjut',back:'Kembali',
  locH:'Pilih lahan yang akan dibuka',locP:'Geser peta ke lokasi nyata mana pun di dunia. Iklim, musim, dan gelar pemimpin mengikuti lokasi; medan, sungai, dan hutan dibangkitkan dari lokasi itu (kotak oranye ≈ 400 × 400 m).',lName:'Nama permukiman',start:'Mulai babat alas',osm:'Peta © kontributor OpenStreetMap · OpenFreeMap. Medan permainan adalah hasil bangkitan, bukan data survei.',
  coin:'Kas',wood:'Kayu',food:'Pangan',kk:'KK',happy:'Bahagia',coh:'Kohesi',water:'Air',
  months:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],year:'Th',era:'Era {n}',
  eras:['Babat alas','Dusun','Kampung','Desa','Perumahan','Kawasan pintar'],
  missions:'Misi',info:'Info',menu:'Menu',save:'Simpan sekarang',saved:'Tersimpan',saving:'Menyimpan…',saveFail:'Gagal menyimpan — dicoba lagi otomatis',neighbors:'Tetangga',exit:'Keluar ke menu',lang:'English',help:'Cara bermain',
  noMoney:'Kas tidak cukup.',noWood:'Kayu tidak cukup — babat hutan dulu.',needClear:'Bersihkan hutan dulu (alat Babat).',onWater:'Tidak bisa di air.',occupied:'Petak sudah terisi.',locked:'Terbuka di era {n}.',
  tl:{info:'Info',babat:'Babat',path:'Jalan',house:'Rumah',field:'Ladang',well:'Sumur',barn:'Lumbung',pond:'Kolam',tree:'Pohon',hall:'Balai adat',worship:'Ibadah',market:'Pasar',bull:'Bongkar'},
  tlD:{info:'Lihat data petak',babat:'Buka hutan → kayu',path:'Jalan setapak',house:'1 KK, pakai gaya',field:'Pangan +6/bln, 2 pekerja',well:'Air bersih radius 5',barn:'Simpan pangan +120',pond:'Ikan, pangan +2',tree:'Teduh & hijau',hall:'Kohesi warga',worship:'Bahagia radius 8',market:'Jual surplus → kas',bull:'Hapus, kayu kembali 50%'},
  st:{jawa:['Limasan Jawa','genteng, dinding bata'],joglo:['Joglo','atap tinggi bertingkat'],panggung:['Panggung kayu','Melayu/Kalimantan'],gadang:['Rumah gadang','gonjong Minang'],tongkonan:['Tongkonan','atap perahu Toraja'],bali:['Bale Bali','bata merah, alang-alang'],honai:['Honai','bulat, jerami (Papua)'],kolonial:['Indis/kolonial','atap tinggi, beranda'],modern:['Modern tropis','atap datar, kaca'],machiya:['Machiya','kayu gelap (Jepang)'],eropa:['Rumah deret','pelana curam (Eropa)']},
  adv:{elder:'Tetua adat',eng:'Tukang',eco:'Juru kas'},
  tips:['Babat beberapa petak hutan dulu untuk mendapat kayu — jangan habiskan semuanya, hutan menahan air.','Rumah butuh sumur dalam radius 5 petak, kalau tidak warga kurang bahagia.','Ladang butuh 2 pekerja. Setiap KK menyumbang 2 pekerja.','Lumbung menyimpan pangan untuk musim kemarau.','Jangan membangun terlalu dekat sungai: musim hujan bisa membawa banjir.'],
  ev:{dry:'Kemarau panjang: hasil ladang turun 40% selama 3 bulan.',flood:'Banjir! Ladang di tepi sungai rusak.',migr:'Keluarga pendatang tiba dan menetap.',fest:'Warga mengadakan selamatan: kohesi naik.',pest:'Hama menyerang ladang: pangan berkurang.',hunger:'Pangan habis! Warga kelaparan dan ada yang pergi.',leave:'Ada KK yang pindah karena tidak betah.',born:'Keluarga baru menempati rumah.'},
  ms:{m1:'Babat 10 petak hutan',m2:'Bangun 3 rumah',m3:'Bangun sumur',m4:'Bangun 2 ladang',m5:'Bangun lumbung',m6:'Capai 20 KK (naik ke Dusun)',m7:'Bangun balai adat',m8:'Bangun tempat ibadah',m9:'Bangun pasar',m10:'Kohesi ≥ 70',m11:'Capai 50 KK (Kampung — segera di versi berikut)'},
  eraUp:'Permukimanmu naik menjadi {e}!',eraUpP:'Gelarmu kini: <b>{t}</b>. Bangunan baru terbuka.',ok:'Lanjut',
  infoTile:'Petak ({x},{y})',land:{F:'Hutan',G:'Lahan terbuka',W:'Sungai',P:'Jalan setapak'},kv:{type:'Jenis',style:'Gaya',water:'Air bersih',worship:'Dekat ibadah',flood:'Rawan banjir',yes:'ya',no:'tidak'},
  helpTxt:'<b>Kamera:</b> seret untuk memutar, dua jari/klik kanan untuk menggeser, cubit/gulir untuk zoom.<br><b>Membangun:</b> pilih alat di bilah bawah, lalu ketuk petak. Jalan & babat bisa diseret.<br><b>Waktu:</b> ⏸ jeda, ▶ normal, ⏩ cepat. Satu langkah = satu bulan.<br><b>Simpan:</b> otomatis setiap menit dan saat keluar.',
  nbH:'Tetangga & teman sekelas',nbNone:'Belum ada permukiman lain di dekatmu, sekelas, atau sekampus.',nbRel:{dekat:'tetangga',kelas:'sekelas',kampus:'sekampus'},
  guestWarn:'Mode tamu: simpanan hanya di peramban ini.',bye:'Sampai jumpa!',errNet:'Koneksi bermasalah.',
  e:{bad_user:'Nama pengguna 3–32 huruf/angka/._-',bad_pass:'Kata sandi minimal 6 karakter.',user_taken:'Nama pengguna sudah dipakai.',bad_login:'Nama pengguna atau kata sandi salah.',rate_limited:'Terlalu banyak percobaan, tunggu sebentar.',auth:'Sesi berakhir, silakan masuk lagi.'}},
 en:{home:'Home',tag:'3D settlement simulation · from clearing the forest to a smart district',intro:'You are the leader who opens land at a real place in Indonesia or anywhere in the world. Grow a hamlet into a kampung, a village and finally a modern district — balancing economy, social-cultural life and environment. Your game is saved and can be continued any time.',
  login:'Log in',register:'Sign up',user:'Username (3–32 letters/digits)',pass:'Password (min. 6)',kampus:'Campus / institution (optional)',kelas:'Class code from lecturer (optional)',guest:'Play as guest',privacy:'No email needed. Passwords are stored hashed. Guest mode saves only in this browser.',
  continue:'Continue game',newgame:'New game',logout:'Log out',hello:'Welcome, {n}',guestHi:'Guest mode',saveInfo:'Save: <b>{name}</b> · {loc} · era {era} · {kk} households · month {m}',noSave:'No save yet. Start a new game.',confirmNew:'Your old game will be replaced. Click again to confirm.',
  charH:'Create your leader',charP:'Your character starts as the land-opener. The title rises with each settlement stage and follows the rules of the country where the kampung is founded.',cName:'Character name',cAvatar:'Appearance',cOrigin:'Home region',cMotto:'Motto',cStyle:'Main building style',cStyleP:'Style can be changed per building. Local styles add community cohesion; modern styles raise land value in later eras.',next:'Next',back:'Back',
  locH:'Choose the land to open',locP:'Pan the map to any real place in the world. Climate, seasons and the leader’s title follow the location; terrain, river and forest are generated from it (orange box ≈ 400 × 400 m).',lName:'Settlement name',start:'Start clearing',osm:'Map © OpenStreetMap contributors · OpenFreeMap. The game terrain is generated, not survey data.',
  coin:'Funds',wood:'Timber',food:'Food',kk:'Households',happy:'Happy',coh:'Cohesion',water:'Water',
  months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],year:'Y',era:'Era {n}',
  eras:['Clearing','Hamlet','Kampung','Village','Housing estate','Smart district'],
  missions:'Missions',info:'Info',menu:'Menu',save:'Save now',saved:'Saved',saving:'Saving…',saveFail:'Save failed — will retry',neighbors:'Neighbours',exit:'Exit to menu',lang:'Bahasa Indonesia',help:'How to play',
  noMoney:'Not enough funds.',noWood:'Not enough timber — clear forest first.',needClear:'Clear the forest first (Clear tool).',onWater:'Cannot build on water.',occupied:'Tile is taken.',locked:'Unlocks in era {n}.',
  tl:{info:'Info',babat:'Clear',path:'Path',house:'House',field:'Field',well:'Well',barn:'Granary',pond:'Fish pond',tree:'Tree',hall:'Hall',worship:'Worship',market:'Market',bull:'Demolish'},
  tlD:{info:'Inspect a tile',babat:'Open forest → timber',path:'Footpath',house:'1 household, uses style',field:'Food +6/mo, 2 workers',well:'Clean water radius 5',barn:'Store food +120',pond:'Fish, food +2',tree:'Shade & green',hall:'Community cohesion',worship:'Happy radius 8',market:'Sell surplus → funds',bull:'Remove, 50% timber back'},
  st:{jawa:['Javanese limasan','tiles, brick walls'],joglo:['Joglo','tall tiered roof'],panggung:['Timber stilt house','Malay/Borneo'],gadang:['Rumah gadang','Minang horns'],tongkonan:['Tongkonan','Toraja boat roof'],bali:['Balinese bale','red brick, thatch'],honai:['Honai','round, thatch (Papua)'],kolonial:['Indies/colonial','tall roof, veranda'],modern:['Tropical modern','flat roof, glass'],machiya:['Machiya','dark timber (Japan)'],eropa:['Row house','steep gable (Europe)']},
  adv:{elder:'Elder',eng:'Builder',eco:'Treasurer'},
  tips:['Clear a few forest tiles first for timber — do not clear it all, forest holds water.','Houses need a well within 5 tiles, otherwise residents are less happy.','A field needs 2 workers. Each household provides 2 workers.','A granary stores food for the dry season.','Do not build too close to the river: the rainy season can bring floods.'],
  ev:{dry:'Long drought: field yields drop 40% for 3 months.',flood:'Flood! Riverside fields are damaged.',migr:'A migrant family arrives and settles.',fest:'Residents hold a communal feast: cohesion rises.',pest:'Pests attack the fields: food lost.',hunger:'Out of food! People go hungry and some leave.',leave:'A household moved away, unhappy.',born:'A new family moves into a house.'},
  ms:{m1:'Clear 10 forest tiles',m2:'Build 3 houses',m3:'Build a well',m4:'Build 2 fields',m5:'Build a granary',m6:'Reach 20 households (become a Hamlet)',m7:'Build a community hall',m8:'Build a place of worship',m9:'Build a market',m10:'Cohesion ≥ 70',m11:'Reach 50 households (Kampung — coming in the next version)'},
  eraUp:'Your settlement is now a {e}!',eraUpP:'Your title is now: <b>{t}</b>. New buildings are unlocked.',ok:'Continue',
  infoTile:'Tile ({x},{y})',land:{F:'Forest',G:'Open land',W:'River',P:'Footpath'},kv:{type:'Type',style:'Style',water:'Clean water',worship:'Near worship',flood:'Flood-prone',yes:'yes',no:'no'},
  helpTxt:'<b>Camera:</b> drag to rotate, two fingers/right-drag to pan, pinch/scroll to zoom.<br><b>Building:</b> pick a tool in the bottom bar, then tap a tile. Paths & clearing can be dragged.<br><b>Time:</b> ⏸ pause, ▶ normal, ⏩ fast. One step = one month.<br><b>Saving:</b> automatic every minute and on exit.',
  nbH:'Neighbours & classmates',nbNone:'No other settlements near you, in your class or campus yet.',nbRel:{dekat:'neighbour',kelas:'classmate',kampus:'same campus'},
  guestWarn:'Guest mode: saved only in this browser.',bye:'See you!',errNet:'Connection problem.',
  e:{bad_user:'Username 3–32 letters/digits/._-',bad_pass:'Password must be at least 6 characters.',user_taken:'Username already taken.',bad_login:'Wrong username or password.',rate_limited:'Too many attempts, please wait.',auth:'Session ended, please log in again.'}}
};
const t=(k,v)=>{let s=k.split('.').reduce((o,p)=>o&&o[p],TX[lang]);if(s==null)s=k;if(v&&typeof s==='string')for(const p in v)s=s.split('{'+p+'}').join(v[p]);return s};
function applyStatic(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(n=>{n.innerHTML=t(n.getAttribute('data-t'))});$('langBtn').textContent=lang==='id'?'EN':'ID';$('aGo').textContent=authMode==='login'?t('login'):t('register')}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastT=0;function toast(s){const e=$('toast');e.textContent=s;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2600)}

/* ================= Gelar menurut negara ================= */
const TITLES={
 ID:['Kepala Adat Pembuka Lahan','Kepala Dusun','Kepala Kampung','Kepala Desa','Lurah','Lurah Kawasan Pintar'],
 MY:['Tok Pembuka Kampung','Ketua Kampung','Ketua Kampung','Penghulu Mukim','Ketua Kampung (Taman)','Pengurus Bandar Pintar'],
 JP:['Kaitakusha (pembuka lahan)','Ketua buraku','Ketua mura','Sonchō (kepala desa)','Chōchō (kepala kota kecil)','Kepala distrik pintar'],
 PH:['Datu','Barangay Captain','Barangay Captain','Barangay Captain','Barangay Captain','Smart Barangay Captain'],
 XX:['Founder','Hamlet head','Village head','Village chief','District head','Smart district head']};
const TITLES_EN={ID:['Customary founder','Hamlet head (Kepala Dusun)','Kampung head','Village head (Kepala Desa)','Ward head (Lurah)','Smart-ward head'],MY:['Kampung founder','Village head (Ketua Kampung)','Village head','Penghulu (mukim head)','Estate head','Smart city steward'],JP:['Kaitakusha (land-opener)','Buraku leader','Mura leader','Sonchō (village mayor)','Chōchō (town mayor)','Smart district head'],PH:['Datu','Barangay Captain','Barangay Captain','Barangay Captain','Barangay Captain','Smart Barangay Captain'],XX:['Founder','Hamlet head','Village head','Village chief','District head','Smart district head']};
const titleOf=(cc,era)=>{const T=(lang==='en'?TITLES_EN:TITLES)[cc]||(lang==='en'?TITLES_EN:TITLES).XX;return T[Math.min(T.length,era)-1]};

/* ================= Avatar ================= */
const AV=[{hat:'blangkon',skin:'#c68c5a',cloth:'#5b3b25'},{hat:'peci',skin:'#a86b3d',cloth:'#1f6f4f'},{hat:'udeng',skin:'#b97a48',cloth:'#f2f2f2'},{hat:'kerudung',skin:'#d39a6a',cloth:'#7a3b6b'},{hat:'caping',skin:'#c08655',cloth:'#2f4f7f'},{hat:'none',skin:'#8d5a35',cloth:'#a33a2a'}];
function avatarSVG(i){const a=AV[i%AV.length];const hat={blangkon:`<path d="M18 30q14-14 28 0v4H18z" fill="#3b2a1a"/><circle cx="46" cy="32" r="4" fill="#3b2a1a"/><path d="M20 30h24" stroke="#c8a14b" stroke-width="2"/>`,peci:`<rect x="19" y="20" width="26" height="12" rx="3" fill="#1b1b1b"/>`,udeng:`<path d="M18 30q14-12 28 0l-2 4H20z" fill="#f3f3f3"/><path d="M30 18l6 6" stroke="#f3f3f3" stroke-width="4"/>`,kerudung:`<path d="M14 40q0-26 18-26t18 26v24H14z" fill="${a.cloth}"/>`,caping:`<path d="M8 32L32 14 56 32z" fill="#d9b66a"/>`,none:''}[a.hat];
 return `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e9f1e6"/><path d="M10 64q0-18 22-18t22 18z" fill="${a.cloth}"/><circle cx="32" cy="34" r="13" fill="${a.skin}"/><circle cx="27" cy="34" r="1.6" fill="#1b1b1b"/><circle cx="37" cy="34" r="1.6" fill="#1b1b1b"/><path d="M27 40q5 3 10 0" stroke="#5a3a22" stroke-width="1.6" fill="none"/>${hat}</svg>`}

/* ================= API ================= */
let TOKEN=store.get('baTok'),ME=null,GUEST=false;
async function api(a,body,extra){const h={'Content-Type':'application/json'};if(TOKEN)h['X-BA-Token']=TOKEN;const r=await fetch(API+'?a='+a+(extra||''),{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});let j=null;try{j=await r.json()}catch(e){}if(!j)throw new Error('net');if(!j.ok){const e=new Error(j.error||'err');e.data=j;throw e}return j}

/* ================= Alur layar ================= */
let authMode='login';
function show(id){['scAuth','scHub','scChar','scLoc'].forEach(s=>$(s).classList.toggle('hidden',s!==id));const g=id==='game';['hud','bar','missions'].forEach(s=>$(s).classList.toggle('hidden',!g));if(!g){$('info').classList.add('hidden');$('menu').classList.add('hidden');$('styleBar').classList.add('hidden')}$('homeLink').classList.toggle('hidden',g)}
$('tbLogin').onclick=()=>{authMode='login';$('tbLogin').classList.add('on');$('tbReg').classList.remove('on');$('regFields').classList.add('hidden');$('aPass').autocomplete='current-password';applyStatic()};
$('tbReg').onclick=()=>{authMode='reg';$('tbReg').classList.add('on');$('tbLogin').classList.remove('on');$('regFields').classList.remove('hidden');$('aPass').autocomplete='new-password';applyStatic()};
$('langBtn').onclick=()=>{lang=lang==='id'?'en':'id';store.set('baLang',lang);applyStatic();renderCharForm()};
$('fAuth').onsubmit=async e=>{e.preventDefault();$('aErr').textContent='';$('aGo').disabled=true;
 try{const b={user:$('aUser').value.trim(),pass:$('aPass').value};if(authMode==='reg'){b.kampus=$('aKampus').value;b.kelas=$('aKelas').value;b.name=b.user}
  const j=await api(authMode==='login'?'login':'register',b);TOKEN=j.token;store.set('baTok',TOKEN);ME=j.me;GUEST=false;$('aPass').value='';await hub()}
 catch(err){$('aErr').textContent=t('e.'+err.message)!=='e.'+err.message?t('e.'+err.message):t('errNet')}finally{$('aGo').disabled=false}};
$('aGuest').onclick=()=>{GUEST=true;ME={user:'tamu',name:lang==='en'?'Guest':'Tamu'};hub()};
async function hub(){show('scHub');let meta=null;$('hubErr').textContent='';
 if(GUEST){$('hubHello').textContent=t('guestHi');$('hubSub').textContent=t('guestWarn');const s=store.get('baGuestSave');if(s){try{const j=JSON.parse(s);meta={name:j.meta.name,loc:j.loc.name,era:j.era,kk:j.kk,month:j.t}}catch(e){}}}
 else{try{const j=await api('me');ME=j.me;meta=j.saveMeta}catch(e){TOKEN=null;store.del('baTok');show('scAuth');$('aErr').textContent=t('e.auth');return}$('hubHello').textContent=t('hello',{n:ME.name});$('hubSub').textContent=(ME.kampus||'')+(ME.kelas?' · '+ME.kelas:'')}
 $('hubSave').innerHTML='<p>'+(meta?t('saveInfo',{name:esc(meta.name),loc:esc(meta.loc),era:meta.era,kk:meta.kk,m:meta.month}):t('noSave'))+'</p>';
 $('hubCont').classList.toggle('hidden',!meta);let armed=false;
 $('hubNew').onclick=()=>{if(meta&&!armed){armed=true;$('hubErr').textContent=t('confirmNew');setTimeout(()=>{armed=false},4000);return}newChar()};
 $('hubCont').onclick=loadGame;
 $('hubOut').onclick=async()=>{if(!GUEST){try{await api('logout',{})}catch(e){}}TOKEN=null;store.del('baTok');ME=null;show('scAuth')}}

/* ---------- Tokoh ---------- */
const STYLES=['jawa','joglo','panggung','gadang','tongkonan','bali','honai','kolonial','modern','machiya','eropa'];
let draft={char:{name:'',av:0,origin:'',motto:'',style:'jawa'}};
function renderCharForm(){const c=draft.char;$('cAvs').innerHTML=AV.map((_,i)=>`<button type="button" class="${i===c.av?'on':''}" data-i="${i}">${avatarSVG(i)}</button>`).join('');
 $('cAvs').querySelectorAll('button').forEach(b=>b.onclick=()=>{c.av=+b.dataset.i;renderCharForm()});
 $('cStyles').innerHTML=STYLES.map(s=>`<button type="button" class="${s===c.style?'on':''}" data-s="${s}">${t('st.'+s)[0]}<small>${t('st.'+s)[1]}</small></button>`).join('');
 $('cStyles').querySelectorAll('button').forEach(b=>b.onclick=()=>{c.style=b.dataset.s;renderCharForm()})}
function newChar(){draft={char:{name:ME&&ME.name&&!GUEST?ME.name:'',av:0,origin:'',motto:'',style:'jawa'}};show('scChar');$('cName').value=draft.char.name;$('cOrigin').value='';$('cMotto').value='';renderCharForm()}
$('cBack').onclick=hub;
$('cNext').onclick=()=>{const n=$('cName').value.trim();if(n.length<2){$('cErr').textContent=lang==='en'?'Name is too short.':'Nama terlalu pendek.';return}$('cErr').textContent='';Object.assign(draft.char,{name:n,origin:$('cOrigin').value.trim(),motto:$('cMotto').value.trim()});pickLoc()};

/* ---------- Lokasi ---------- */
const PRESETS=[['Malang, Jawa Timur',-7.9426,112.6066],['Tana Toraja',-3.0446,119.8197],['Bukittinggi',-0.3051,100.3694],['Ubud, Bali',-8.5069,115.2625],['Wamena, Papua',-4.0947,138.9399],['Labuan Bajo',-8.4964,119.8877],['Kanazawa',36.5613,136.6562],['Rotterdam',51.9244,4.4777],['Melaka',2.1896,102.2501],['Marrakesh',31.6295,-7.9811]];
let lmap=null,locCC='XX',locName='';
function loadML(cb){if(window.maplibregl)return cb();const l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css';document.head.appendChild(l);const s=document.createElement('script');s.src='https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js';s.onload=cb;s.onerror=()=>{$('lErr').textContent=t('errNet')};document.head.appendChild(s)}
function boxGeo(lat,lon){const dy=200/111320,dx=200/(111320*Math.cos(lat*Math.PI/180));return {type:'Feature',geometry:{type:'Polygon',coordinates:[[[lon-dx,lat-dy],[lon+dx,lat-dy],[lon+dx,lat+dy],[lon-dx,lat+dy],[lon-dx,lat-dy]]]}}}
let geoT=0;
function pickLoc(){show('scLoc');$('locChips').innerHTML=PRESETS.map((p,i)=>`<button type="button" data-i="${i}">${esc(p[0])}</button>`).join('');
 loadML(()=>{if(lmap){lmap.resize();return}
  lmap=new maplibregl.Map({container:'locMap',style:'https://tiles.openfreemap.org/styles/liberty',center:[112.6066,-7.9426],zoom:13.5,attributionControl:{compact:true}});lmap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  lmap.on('load',()=>{const c=lmap.getCenter();lmap.addSource('b',{type:'geojson',data:boxGeo(c.lat,c.lng)});lmap.addLayer({id:'bf',type:'fill',source:'b',paint:{'fill-color':'#e67e22','fill-opacity':.15}});lmap.addLayer({id:'bl',type:'line',source:'b',paint:{'line-color':'#e67e22','line-width':3}});geo()});
  lmap.on('move',()=>{const c=lmap.getCenter(),s=lmap.getSource('b');if(s)s.setData(boxGeo(c.lat,c.lng))});lmap.on('moveend',()=>{clearTimeout(geoT);geoT=setTimeout(geo,700)})});
 $('locChips').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=PRESETS[+b.dataset.i];if(lmap)lmap.jumpTo({center:[p[2],p[1]],zoom:14});$('lName').value=(lang==='en'?'':'Kampung ')+p[0].split(',')[0]})}
async function geo(){if(!lmap)return;const c=lmap.getCenter();$('lInfo').textContent='…';
 try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${c.lat.toFixed(4)}&lon=${c.lng.toFixed(4)}&accept-language=${lang}`);const j=await r.json();const a=j.address||{};locCC=(a.country_code||'xx').toUpperCase();locName=[a.village||a.town||a.city||a.county||a.state,a.country].filter(Boolean).join(', ')||j.name||''}
 catch(e){locCC='XX';locName=c.lat.toFixed(3)+', '+c.lng.toFixed(3)}
 const cl=climateOf(c.lat);$('lInfo').innerHTML=`${esc(locName)}<br>${t('kv.type')}: ${lang==='en'?cl.en:cl.id} · ${esc(titleOf(locCC,1))}`;if(!$('lName').value)$('lName').value=(lang==='en'?'':'Kampung ')+(locName.split(',')[0]||'Baru')}
function climateOf(lat){const a=Math.abs(lat);return a<15?{k:'trop',id:'tropis basah',en:'humid tropical'}:a<28?{k:'tropdry',id:'tropis kering',en:'dry tropical'}:a<42?{k:'sub',id:'subtropis',en:'subtropical'}:{k:'temp',id:'beriklim sedang',en:'temperate'}}
$('lBack').onclick=()=>show('scChar');
$('lGo').onclick=()=>{if(!lmap)return;const c=lmap.getCenter();const name=$('lName').value.trim()||'Kampung';
 const S=newState({lat:+c.lat.toFixed(5),lon:+c.lng.toFixed(5),name:locName||name,cc:locCC,climate:climateOf(c.lat).k},draft.char,name);startGame(S,true)};

/* ================= Dunia & simulasi ================= */
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let x=a;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return((x^(x>>>14))>>>0)/4294967296}}
function hash2(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)>>>0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function noise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,f=t=>t*t*(3-2*t);const a=hash2(xi,yi,s),b=hash2(xi+1,yi,s),c=hash2(xi,yi+1,s),d=hash2(xi+1,yi+1,s);return a+(b-a)*f(xf)+(c-a)*f(yf)+(a-b-c+d)*f(xf)*f(yf)}
function fbm(x,y,s){return noise(x,y,s)*.6+noise(x*2.1,y*2.1,s+7)*.28+noise(x*4.3,y*4.3,s+13)*.12}
function seedOf(loc){return (Math.round(loc.lat*1e4)*73856093^Math.round(loc.lon*1e4)*19349663)>>>0}
/** Medan: tinggi per titik sudut (N+1)², sungai, hutan. Hasil deterministik dari seed. */
function genWorld(seed){const r=rng(seed),H=[],land=[];const hasRiver=r()<.8,horiz=r()<.5;let rp=8+Math.floor(r()*(N-16)),river=new Set();
 if(hasRiver){for(let i=0;i<N;i++){rp+=Math.round((r()-.5)*2.2);rp=Math.max(3,Math.min(N-4,rp));const w=r()<.3?3:2;for(let k=0;k<w;k++){const a=i,b=rp+k;river.add(horiz?b+','+a:a+','+b)}}}
 for(let y=0;y<=N;y++){H.push([]);for(let x=0;x<=N;x++)H[y].push(.55+fbm(x/11,y/11,seed%997)*2.6)}
 for(let y=0;y<N;y++){land.push([]);for(let x=0;x<N;x++){const k=x+','+y;const dc=Math.hypot(x-N/2,y-N/2);land[y].push(river.has(k)?'W':(fbm(x/7,y/7,seed%991+5)+(dc<6?-.3:dc<10?-.1:0)>.44?'F':'G'))}}
 // sungai lebih rendah
 river.forEach(k=>{const [x,y]=k.split(',').map(Number);[[0,0],[1,0],[0,1],[1,1]].forEach(([dx,dy])=>{H[y+dy][x+dx]=Math.min(H[y+dy][x+dx],0)})});
 return {H,land}}
function newState(loc,ch,name){const seed=seedOf(loc),w=genWorld(seed);return {v:1,seed,loc,char:ch,meta:{name,created:Date.now()},era:1,t:0,res:{coin:60,wood:25,food:60},kk:2,happy:62,coh:60,
 land:w.land.map(r=>r.join('')),b:[],nid:1,flags:{},done:[],ev:{dry:0},stats:{cleared:0},score:0}}

/* ---------- Katalog bangunan ---------- */
const BT={
 house:{era:1,w:1,h:1,c:{coin:2,wood:8},cap:1},
 field:{era:1,w:2,h:2,c:{coin:3,wood:2},jobs:2,food:6},
 well:{era:1,w:1,h:1,c:{coin:4,wood:2},water:5},
 barn:{era:1,w:1,h:1,c:{coin:6,wood:12},store:120},
 pond:{era:1,w:1,h:1,c:{coin:5,wood:0},jobs:1,food:2},
 tree:{era:1,w:1,h:1,c:{coin:1,wood:0}},
 hall:{era:2,w:2,h:2,c:{coin:20,wood:30},coh:1},
 worship:{era:2,w:1,h:1,c:{coin:15,wood:15},happyR:8},
 market:{era:2,w:2,h:2,c:{coin:25,wood:20},jobs:2}};
const TOOLS=['info','babat','path','house','field','well','barn','pond','tree','|','hall','worship','market','|','bull'];
const ICON={info:'🔍',babat:'🪓',path:'🟫',house:'🏠',field:'🌾',well:'💧',barn:'🛖',pond:'🐟',tree:'🌳',hall:'🏛️',worship:'🕌',market:'🏪',bull:'🧹'};

let S=null;          // keadaan permainan
let occ=null;        // occ[y][x] = id bangunan
function rebuildOcc(){occ=[];for(let y=0;y<N;y++)occ.push(new Array(N).fill(0));S.b.forEach(b=>{for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++)occ[b.y+dy][b.x+dx]=b.id})}
const L=(x,y)=>S.land[y][x];
function setL(x,y,c){S.land[y]=S.land[y].substring(0,x)+c+S.land[y].substring(x+1)}
const inside=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
function near(x,y,type,r){return S.b.some(b=>b.t===type&&Math.abs(b.x+(b.w-1)/2-x)<=r&&Math.abs(b.y+(b.h-1)/2-y)<=r)}
function nearWater(x,y,r){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(inside(X,Y)&&L(X,Y)==='W')return true}return false}
const count=t=>S.b.filter(b=>b.t===t).length;

/** Satu langkah = satu bulan. */
function tick(){S.t++;const R=S.res,m=S.t%12,cl=S.loc.climate;const rainy=cl==='temp'||cl==='sub'?(m>=3&&m<=8):(S.loc.lat<0?(m>=10||m<=3):(m>=5&&m<=9));
 const workers=S.kk*2;let jobsNeed=0;S.b.forEach(b=>{if(BT[b.t].jobs)jobsNeed+=BT[b.t].jobs});const staff=jobsNeed?Math.min(1,workers/jobsNeed):1;
 let prod=0;S.b.forEach(b=>{if(BT[b.t].food)prod+=BT[b.t].food*staff*(b.dmg?0.3:1)});if(S.ev.dry>0){prod*=.6;S.ev.dry--}
 prod*=cl==='temp'&&!rainy?.6:1;
 const cons=S.kk*2,cap=40+count('barn')*BT.barn.store;R.food=Math.min(cap,R.food+prod-cons);
 let msg=null;if(R.food<0){R.food=0;S.happy-=12;if(S.kk>1){S.kk--;msg=t('ev.hunger')}}
 // kas: iuran warga + pasar menjual surplus
 const surplus=Math.max(0,prod-cons);R.coin+=Math.round(S.kk*.6+count('market')*Math.min(surplus,12)*.5);
 // air & ibadah & kohesi
 const houses=S.b.filter(b=>b.t==='house');const wet=houses.filter(h=>near(h.x,h.y,'well',5)).length,wor=houses.filter(h=>near(h.x,h.y,'worship',8)).length;
 const wc=houses.length?wet/houses.length:1,wr=houses.length?wor/houses.length:0;
 const trees=S.b.filter(b=>b.t==='tree').length+S.land.join('').split('F').length-1;const green=Math.min(1,trees/(N*N*.25));
 const target=40+(R.food>cons?12:-8)+wc*18+wr*10+green*8+(S.coh-60)*.2-(S.kk>houses.length?10:0);S.happy+=Math.round((target-S.happy)*.25);
 const cohT=50+count('hall')*12+(localStyleShare()*15)-(S.kk>30?5:0);S.coh+=Math.round((cohT-S.coh)*.15);
 // pertumbuhan
 const capH=houses.length*BT.house.cap;if(S.happy>=55&&R.food>S.kk*3&&capH>S.kk&&Math.random()<.55){S.kk++;if(Math.random()<.3)msg=msg||t('ev.born')}
 if(S.happy<35&&S.kk>2&&Math.random()<.35){S.kk--;msg=t('ev.leave')}
 // banjir musim hujan
 if(rainy&&Math.random()<.06){let hit=0;S.b.forEach(b=>{if((b.t==='field'||b.t==='house')&&nearWater(b.x,b.y,1)){b.dmg=3;hit++}});if(hit)msg=t('ev.flood')}
 S.b.forEach(b=>{if(b.dmg){b.dmg--;if(!b.dmg)delete b.dmg}});
 // kejadian acak
 const e=Math.random();if(!msg){if(e<.025&&S.ev.dry<=0){S.ev.dry=3;msg=t('ev.dry')}else if(e<.05&&capH>S.kk){S.kk++;msg=t('ev.migr')}else if(e<.065){S.coh=Math.min(100,S.coh+8);msg=t('ev.fest');R3.gather(25)}else if(e<.08){R.food=Math.max(0,R.food-15);msg=t('ev.pest')}}
 S.happy=Math.max(0,Math.min(100,S.happy));S.coh=Math.max(0,Math.min(100,S.coh));
 S.score=Math.round(S.kk*10+S.happy+S.coh+S.era*100+R.coin*.1);
 if(msg)advise(msg);checkMissions();checkEra();updHUD();dirty=true;R3.villagers();R3.season(rainy)}
function localStyleShare(){const reg={ID:['jawa','joglo','panggung','gadang','tongkonan','bali','honai','kolonial'],MY:['panggung','gadang','kolonial'],JP:['machiya'],NL:['eropa'],DE:['eropa'],FR:['eropa'],GB:['eropa'],BE:['eropa']}[S.loc.cc]||[];const hs=S.b.filter(b=>b.t==='house');if(!hs.length)return .5;return hs.filter(h=>reg.indexOf(h.s)>=0).length/hs.length}

/* ---------- Misi & era ---------- */
const MISS={1:[['m1',()=>S.stats.cleared>=10],['m2',()=>count('house')>=3],['m3',()=>count('well')>=1],['m4',()=>count('field')>=2],['m5',()=>count('barn')>=1],['m6',()=>S.kk>=20]],2:[['m7',()=>count('hall')>=1],['m8',()=>count('worship')>=1],['m9',()=>count('market')>=1],['m10',()=>S.coh>=70],['m11',()=>S.kk>=50]]};
function checkMissions(){(MISS[S.era]||[]).forEach(([k,f])=>{if(S.done.indexOf(k)<0&&f()){S.done.push(k);S.res.coin+=15;toast('✅ '+t('ms.'+k)+' · +15')}});renderMissions()}
function checkEra(){if(S.era===1&&S.kk>=20&&count('barn')>=1){S.era=2;S.res.coin+=40;eraModal();renderBar()}}
function eraModal(){const m=$('modal');m.classList.remove('hidden');m.innerHTML=`<div class="box eraUp"><div class="big">🎉</div><h2>${t('eraUp',{e:t('eras')[S.era-1]})}</h2><p>${t('eraUpP',{t:esc(titleOf(S.loc.cc,S.era))})}</p><button class="bigbtn gold" id="eOk">${t('ok')}</button></div>`;$('eOk').onclick=()=>m.classList.add('hidden');save(true)}

/* ================= 3D ================= */
const R3={};
(function(){let renderer,scene,camera,controls,root,terrain,water,trees,trunks,bmeshes={},ghost,sun,hemi,people=[],clock=new THREE.Clock(),tod=.35;
 const M={};const mat=(c,o)=>{const k=c+JSON.stringify(o||{});if(!M[k])M[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{}));return M[k]};
 const box=new THREE.BoxGeometry(1,1,1);
 R3.hAt=(x,y)=>{const H=R3.H;if(!H)return 0;const X=Math.max(0,Math.min(N,x)),Y=Math.max(0,Math.min(N,y)),xi=Math.min(N-1,Math.floor(X)),yi=Math.min(N-1,Math.floor(Y)),fx=X-xi,fy=Y-yi;return H[yi][xi]*(1-fx)*(1-fy)+H[yi][xi+1]*fx*(1-fy)+H[yi+1][xi]*(1-fx)*fy+H[yi+1][xi+1]*fx*fy};
 const TCOL={F:'#4f7d3a',G:'#93b462',W:'#5e8fb0',P:'#b99a6b',D:'#a98d63'};
 R3.init=el=>{renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.1,500);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=1.35;controls.minDistance=6;controls.maxDistance=80;controls.target.set(N/2,0,N/2);camera.position.set(N/2-14,30,N/2+30);controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  hemi=new THREE.HemisphereLight('#ffffff','#7d6b4a',.9);scene.add(hemi);sun=new THREE.DirectionalLight('#fff3dc',2.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:150});sun.shadow.bias=-.0005;scene.add(sun);scene.add(sun.target);sun.target.position.set(N/2,0,N/2);
  root=new THREE.Group();scene.add(root);
  ghost=new THREE.Mesh(new THREE.BoxGeometry(1,.3,1),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.35}));ghost.visible=false;scene.add(ghost);
  new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}).observe(el);
  loop()};
 function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta());controls.update();
  R3.life(dt);
  if(water){water.material.map.offset.x+=dt*.02}
  renderer.render(scene,camera)}
 R3.daylight=f=>{tod=f;const el=Math.sin((f*24-6)/12*Math.PI),az=(f*24-6)/12*Math.PI;sun.position.set(N/2+Math.cos(az)*45,Math.max(3,el*55),N/2-18);const k=Math.max(0,Math.min(1,(el+.08)/.35));sun.intensity=.15+2.1*k;hemi.intensity=.22+.7*k;
  const day=new THREE.Color(R3.rainy?'#a9bfcf':'#bcd6ea'),dusk=new THREE.Color('#e9a46a'),nightC=new THREE.Color('#0f1a2e');const c=nightC.clone().lerp(dusk,Math.min(1,k*2)).lerp(day,Math.max(0,k*2-1));scene.background=c;scene.fog=new THREE.Fog(c,70,160);sun.color.set(k<.5?'#ffc58a':'#fff3dc')};
 R3.season=rainy=>{R3.rainy=rainy};
 function waterTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#4f86ad';g.fillRect(0,0,128,128);g.strokeStyle='rgba(220,238,250,.4)';g.lineWidth=2;for(let i=0;i<16;i++){const y=(i*37)%128,x=(i*53)%128;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+10,y-4,x+20,y);g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);t.colorSpace=THREE.SRGBColorSpace;return t}
 R3.world=()=>{R3.lifeReset();root.clear();bmeshes={};const H=genWorld(S.seed).H;R3.H=H;
  // medan: tiap petak 2 segitiga, warna per petak
  const pos=[],col=[],c=new THREE.Color();for(let y=0;y<N;y++)for(let x=0;x<N;x++){const l=L(x,y);c.set(TCOL[l]||TCOL.G);if(l==='G'||l==='F'){c.offsetHSL(0,0,(hash2(x,y,3)-.5)*.06);if(S.loc.climate==='tropdry'&&l==='G')c.set('#b9ad6c')}
   const p=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]].map(([a,b])=>[a,H[b][a],b]);[[0,2,1],[0,3,2]].forEach(tr=>tr.forEach(i=>{pos.push(...p[i]);col.push(c.r,c.g,c.b)}))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  terrain=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,flatShading:true}));terrain.receiveShadow=true;root.add(terrain);
  const skirt=new THREE.Mesh(new THREE.BoxGeometry(N,4,N),mat('#5b4a33'));skirt.position.set(N/2,-2.05,N/2);root.add(skirt);
  {const wp=[],wu=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='W'){const q=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]];[[0,2,1],[0,3,2]].forEach(tr=>tr.forEach(i=>{wp.push(q[i][0],.32,q[i][1]);wu.push(q[i][0]/5,q[i][1]/5)}))}
   const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(wu,2));wg.computeVertexNormals();const wt=waterTex();wt.repeat.set(1,1);
   water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({map:wt,transparent:true,opacity:.9,roughness:.15,metalness:.1}));root.add(water)}
  // pohon hutan (instanced)
  const clim=S.loc.climate,fT=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='F'){const n=2+Math.floor(hash2(x,y,9)*2);for(let i=0;i<n;i++)fT.push([x+.2+hash2(x,y,i+20)*.6,y+.2+hash2(x,y,i+40)*.6,.6+hash2(x,y,i)*.6])}
  const crownGeo=clim==='temp'?new THREE.ConeGeometry(.45,1.4,7):new THREE.IcosahedronGeometry(.5,0);const crownM=mat(clim==='temp'?'#2f5a34':clim==='tropdry'?'#6f8a3a':'#3f7a3c',{flatShading:true});
  trees=new THREE.InstancedMesh(crownGeo,crownM,Math.max(1,fT.length));trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.09,1,5),mat('#6b4f3a'),Math.max(1,fT.length));const o=new THREE.Object3D();
  fT.forEach((p,i)=>{const h=R3.hAt(p[0],p[1]);o.position.set(p[0],h+.5*p[2],p[1]);o.scale.set(p[2],p[2],p[2]);o.rotation.set(0,0,0);o.updateMatrix();trunks.setMatrixAt(i,o.matrix);o.position.y=h+(clim==='temp'?1.2:1.15)*p[2];o.rotation.y=p[0]*7;o.updateMatrix();trees.setMatrixAt(i,o.matrix)});
  trees.count=trunks.count=fT.length;trees.castShadow=trunks.castShadow=true;root.add(trees,trunks);
  // jalan setapak
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='P'){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat('#b99a6b'));m.rotation.x=-Math.PI/2;m.position.set(x+.5,R3.hAt(x+.5,y+.5)+.04,y+.5);m.receiveShadow=true;root.add(m)}
  S.b.forEach(b=>R3.addB(b));R3.villagers()};
 /* ---------- bangunan prosedural ---------- */
 function B(g,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(box,m);o.scale.set(sx,sy,sz);o.position.set(x,y+sy/2,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function hipRoof(w,d,h,m){const g=new THREE.ConeGeometry(.7071,1,4,1);g.rotateY(Math.PI/4);const o=new THREE.Mesh(g,m);o.scale.set(w*1.06,h,d*1.06);o.castShadow=true;return o}
 function gable(w,d,h,m){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(0,h);sh.lineTo(w/2,0);sh.lineTo(-w/2,0);const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);const o=new THREE.Mesh(g,m);o.castShadow=true;return o}
 /** atap pelana melengkung dengan ujung naik (gonjong/tongkonan) */
 function saddle(len,wid,h,horn,m){const seg=24,sw=6,pos=[],idx=[];for(let i=0;i<=seg;i++){const u=i/seg*2-1;for(let j=0;j<=sw;j++){const v=j/sw*2-1,y=h*(1-Math.abs(v))+horn*Math.pow(Math.abs(u),3)*(1-.6*Math.abs(v));pos.push(u*len/2*(1+.25*Math.pow(Math.abs(u),4)),y,v*wid/2)}}
  for(let i=0;i<seg;i++)for(let j=0;j<sw;j++){const a=i*(sw+1)+j,b=a+sw+1;idx.push(a,b,a+1,b,b+1,a+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.material.side=THREE.DoubleSide;o.castShadow=true;return o}
 function house(style){const g=new THREE.Group(),wood=mat('#7a5233'),dark=mat('#4a3322'),plaster=mat('#efe6d6'),tile=mat('#9c4a33'),thatch=mat('#b89a5a'),brick=mat('#b0563c');
  switch(style){
   case 'joglo':{B(g,plaster,0,0,0,.8,.55,.8);const r1=hipRoof(1,1,.22,tile);r1.position.y=.55+.11;g.add(r1);const r2=hipRoof(.55,.55,.5,tile);r2.position.y=.55+.22+.25;g.add(r2);break}
   case 'panggung':{[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,b])=>B(g,dark,a,0,b,.07,.45,.07));B(g,wood,0,.45,0,.78,.45,.7);const r=gable(.95,.85,.4,thatch);r.position.y=.9;r.rotation.y=Math.PI/2;g.add(r);B(g,dark,0,.2,.45,.3,.04,.2);break}
   case 'gadang':{[[-.35,-.25],[.35,-.25],[-.35,.25],[.35,.25]].forEach(([a,b])=>B(g,dark,a,0,b,.07,.3,.07));B(g,mat('#8a5a35'),0,.3,0,.9,.4,.6);const r=saddle(1.1,.75,.25,.55,mat('#3b3530'));r.position.y=.7;g.add(r);break}
   case 'tongkonan':{[[-.25,-.2],[.25,-.2],[-.25,.2],[.25,.2]].forEach(([a,b])=>B(g,dark,a,0,b,.08,.35,.08));B(g,mat('#6b3a24'),0,.35,0,.55,.35,.5);const r=saddle(1.3,.65,.2,.45,mat('#2b2b2b'));r.position.y=.7;r.rotation.y=Math.PI/2;g.add(r);break}
   case 'bali':{B(g,brick,0,0,0,.75,.5,.75);B(g,mat('#d8cbb0'),0,0,.42,.3,.5,.06);const r=hipRoof(1,1,.55,thatch);r.position.y=.5+.27;g.add(r);break}
   case 'honai':{const c=new THREE.Mesh(new THREE.CylinderGeometry(.38,.4,.4,14),mat('#6b4f3a'));c.position.y=.2;c.castShadow=true;g.add(c);const d=new THREE.Mesh(new THREE.SphereGeometry(.5,14,8,0,Math.PI*2,0,Math.PI/2),thatch);d.position.y=.38;d.scale.y=.9;d.castShadow=true;g.add(d);break}
   case 'kolonial':{B(g,mat('#f5f2ea'),0,0,0,.85,.6,.75);[-.3,-.1,.1,.3].forEach(a=>B(g,mat('#ffffff'),a,0,.45,.05,.55,.05));B(g,mat('#e8e2d6'),0,.55,.45,.8,.04,.18);const r=hipRoof(.95,.85,.55,mat('#b5523b'));r.position.y=.6+.27;g.add(r);break}
   case 'modern':{B(g,mat('#f4f4f2'),0,0,0,.85,.45,.75);B(g,mat('#a9cbe0',{metalness:.3,roughness:.15}),0,.08,.38,.6,.3,.02);B(g,mat('#d9d9d6'),.1,.45,-.05,.75,.4,.55);B(g,mat('#3a3a3a'),.1,.85,-.05,.82,.04,.62);break}
   case 'machiya':{B(g,mat('#3e2d22'),0,0,0,.8,.55,.75);for(let i=-3;i<=3;i++)B(g,mat('#5a4434'),i*.1,.05,.38,.03,.45,.02);const r=gable(.95,.9,.3,mat('#434a52'));r.position.y=.55;g.add(r);break}
   case 'eropa':{B(g,mat('#b35a3e'),0,0,0,.7,.75,.75);B(g,mat('#f2efe7'),0,.3,.38,.25,.25,.02);const r=gable(.8,.85,.55,mat('#3c3f45'));r.position.y=.75;r.rotation.y=Math.PI/2;g.add(r);break}
   default:{B(g,plaster,0,0,0,.8,.5,.75);B(g,mat('#6f4b31'),0,0,.38,.18,.36,.02);const r=hipRoof(.98,.92,.45,tile);r.position.y=.5+.22;g.add(r)}}
  return g}
 function make(b){const g=new THREE.Group();const s=b.s||'jawa';
  if(b.t==='house')g.add(house(s));
  else if(b.t==='field'){const f=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9,1,1),mat(b.dmg?'#8a7b4a':'#7fa83a'));f.rotation.x=-Math.PI/2;f.position.set(.5,.05,.5);f.receiveShadow=true;g.add(f);for(let i=0;i<6;i++)B(g,mat('#a3c64a'),-.35+i*.35+.5,.05,.5,.08,.2,1.7)}
  else if(b.t==='well'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.35,12),mat('#9a9a92'));c.position.y=.17;c.castShadow=true;g.add(c);B(g,mat('#6b4f3a'),-.2,0,0,.05,.7,.05);B(g,mat('#6b4f3a'),.2,0,0,.05,.7,.05);B(g,mat('#6b4f3a'),0,.7,0,.5,.05,.05)}
  else if(b.t==='barn'){[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,c])=>B(g,mat('#4a3322'),a,0,c,.08,.4,.08));B(g,mat('#8a6a45'),0,.4,0,.7,.5,.7);const r=hipRoof(.95,.95,.5,mat('#b89a5a'));r.position.y=.9+.25;g.add(r)}
  else if(b.t==='pond'){const p=new THREE.Mesh(new THREE.CircleGeometry(.42,20),mat('#4f86ad',{roughness:.1}));p.rotation.x=-Math.PI/2;p.position.y=.04;g.add(p)}
  else if(b.t==='tree'){B(g,mat('#6b4f3a'),0,0,0,.1,.6,.1);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),mat('#4f8f4a'));c.position.y=.85;c.castShadow=true;g.add(c)}
  else if(b.t==='hall'){const pend=new THREE.Group();[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6],[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,c])=>B(pend,mat('#6b4f3a'),a,0,c,.09,.8,.09));B(pend,mat('#d8cbb0'),0,0,0,1.6,.1,1.6);
    const r=s==='gadang'||s==='tongkonan'?saddle(2,1.4,.4,.8,mat('#3b3530')):hipRoof(1.9,1.9,.5,mat('#9c4a33'));r.position.y=.8+(r.geometry.type==='ConeGeometry'?.25:0);pend.add(r);const r2=hipRoof(.9,.9,.5,mat('#9c4a33'));r2.position.y=1.3;if(!(s==='gadang'||s==='tongkonan'))pend.add(r2);pend.position.set(.5,0,.5);g.add(pend)}
  else if(b.t==='worship'){B(g,mat('#f2efe7'),0,0,0,.8,.55,.8);const r=hipRoof(.95,.95,.35,mat('#2f6f4f'));r.position.y=.55+.17;g.add(r);const r2=hipRoof(.55,.55,.35,mat('#2f6f4f'));r2.position.y=.9+.17;g.add(r2)}
  else if(b.t==='market'){for(let i=0;i<4;i++){const st=new THREE.Group();B(st,mat('#8a6a45'),0,0,0,.6,.45,.4);const c=new THREE.Mesh(new THREE.BoxGeometry(.7,.06,.55),mat(['#d94f3a','#e0a526','#2f8f6a','#3b6fb0'][i]));c.position.y=.7;st.add(c);st.position.set((i%2)*.9+.05,0,Math.floor(i/2)*.9+.05);g.add(st)}}
  const cx=b.x+b.w/2,cz=b.y+b.h/2;g.position.set(b.t==='hall'||b.t==='market'||b.t==='field'?b.x+.5:cx,R3.hAt(cx,cz),b.t==='hall'||b.t==='market'||b.t==='field'?b.y+.5:cz);if(b.r)g.rotation.y=b.r*Math.PI/2;return g}
 R3.addB=b=>{const g=make(b);g.userData.id=b.id;root.add(g);bmeshes[b.id]=g};
 R3.delB=id=>{const g=bmeshes[id];if(g){root.remove(g);delete bmeshes[id]}};
 R3.ghost=(x,y,w,h,ok)=>{if(x==null){ghost.visible=false;return}ghost.visible=true;ghost.scale.set(w,1,h);ghost.position.set(x+w/2,R3.hAt(x+w/2,y+h/2)+.15,y+h/2);ghost.material.color.set(ok?'#7dffb0':'#ff7d6b')};
 R3.trees=()=>{// bangun ulang pohon hutan setelah babat
  const clim=S.loc.climate,o=new THREE.Object3D();let i=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='F'){const n=2+Math.floor(hash2(x,y,9)*2);for(let k=0;k<n;k++){if(i>=trees.instanceMatrix.count)break;const px=x+.2+hash2(x,y,k+20)*.6,pz=y+.2+hash2(x,y,k+40)*.6,sc=.6+hash2(x,y,k)*.6,h=R3.hAt(px,pz);o.position.set(px,h+.5*sc,pz);o.scale.set(sc,sc,sc);o.rotation.set(0,0,0);o.updateMatrix();trunks.setMatrixAt(i,o.matrix);o.position.y=h+(clim==='temp'?1.2:1.15)*sc;o.rotation.y=px*7;o.updateMatrix();trees.setMatrixAt(i,o.matrix);i++}}
  trees.count=trunks.count=i;trees.instanceMatrix.needsUpdate=trunks.instanceMatrix.needsUpdate=true};
 R3.tileColor=(x,y)=>{const a=terrain.geometry.attributes.color,l=L(x,y),c=new THREE.Color(TCOL[l]||TCOL.G);const base=(y*N+x)*6;for(let i=0;i<6;i++)a.setXYZ(base+i,c.r,c.g,c.b);a.needsUpdate=true};
 R3.path=(x,y)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat('#b99a6b'));m.rotation.x=-Math.PI/2;m.position.set(x+.5,R3.hAt(x+.5,y+.5)+.04,y+.5);m.receiveShadow=true;root.add(m)};
 R3.pick=(cx,cy)=>{const r=renderer.domElement.getBoundingClientRect(),v=new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(v,camera);const h=ray.intersectObject(terrain,false)[0];if(!h)return null;const x=Math.floor(h.point.x),y=Math.floor(h.point.z);return inside(x,y)?[x,y]:null};
 /* ================= Kehidupan: warga, kendaraan, suasana ================= */
 const LIFE={people:[],veh:[],birds:[],hens:[],smoke:[],glows:[],truckT:20,smokeT:0,gather:0};
 let SPR=null;function sprTex(a,b){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,a);r.addColorStop(1,b);g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 const hour=()=>tod*24,isNight=()=>{const h=hour();return h<5.5||h>18.6};
 const SKIN=['#c68c5a','#a86b3d','#8d5a35','#d39a6a','#b97a48'],CLOTH=['#a33a2a','#1f6f4f','#3b6fb0','#e0a526','#7a3b6b','#efe6d6','#2f4f7f','#c25b8a','#5b3b25'];
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 /** Orang dengan sendi pinggul/bahu agar bisa berjalan, mencangkul, mengayuh. */
 function mkPerson(child,hat){const g=new THREE.Group(),up=new THREE.Group();up.position.y=.2;g.add(up);const cl=pick(CLOTH),sk=pick(SKIN);
  const torso=new THREE.Mesh(box,mat(cl));torso.scale.set(.13,.19,.08);torso.position.y=.095;torso.castShadow=true;up.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.052,10,8),mat(sk));head.position.y=.25;head.castShadow=true;up.add(head);
  if(hat==='caping'){const c=new THREE.Mesh(new THREE.ConeGeometry(.11,.05,12),mat('#d9b66a'));c.position.y=.3;up.add(c)}else if(hat==='peci'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.035,10),mat('#1b1b1b'));c.position.y=.295;up.add(c)}else if(hat==='kerudung'){const c=new THREE.Mesh(new THREE.SphereGeometry(.062,10,8,0,Math.PI*2,0,Math.PI*.62),mat(pick(['#7a3b6b','#2f6f4f','#e9e1d0','#3b6fb0'])));c.position.y=.255;up.add(c)}
  const limb=(x,y,len,w,col,parent)=>{const j=new THREE.Group();j.position.set(x,y,0);const m=new THREE.Mesh(box,mat(col));m.scale.set(w,len,w);m.position.y=-len/2;m.castShadow=true;j.add(m);parent.add(j);return j};
  const legs=[limb(-.035,.2,.2,.045,'#3a3a3a',g),limb(.035,.2,.2,.045,'#3a3a3a',g)],arms=[limb(-.085,.18,.16,.035,cl,up),limb(.085,.18,.16,.035,cl,up)];
  if(child)g.scale.setScalar(.66);return {m:g,up,legs,arms,ph:Math.random()*6}}
 function walkPose(p,dt,rate){p.ph+=dt*rate;const s=Math.sin(p.ph);p.legs[0].rotation.x=s*.6;p.legs[1].rotation.x=-s*.6;p.arms[0].rotation.x=-s*.5;p.arms[1].rotation.x=s*.5;p.up.rotation.x=.05;p.up.position.y=.2+Math.abs(Math.cos(p.ph))*.012}
 function workPose(p,dt,kind){p.ph+=dt*4;const s=Math.sin(p.ph);p.legs[0].rotation.x=p.legs[1].rotation.x=0;
  if(kind==='hoe'){p.up.rotation.x=.45+s*.2;p.arms[0].rotation.x=p.arms[1].rotation.x=-1.1-s*.7}
  else if(kind==='chat'){p.up.rotation.x=0;p.arms[0].rotation.x=-.3-Math.max(0,Math.sin(p.ph*.7))*.8;p.arms[1].rotation.x=0;p.m.rotation.y+=Math.sin(p.ph*.3)*dt*.3}
  else if(kind==='pray'){p.up.rotation.x=.25+Math.max(0,s)*.9;p.arms[0].rotation.x=p.arms[1].rotation.x=-.4}
  else if(kind==='draw'){p.up.rotation.x=.35;p.arms[0].rotation.x=p.arms[1].rotation.x=-1+Math.abs(s)*.9}
  else if(kind==='play'){p.up.position.y=.2+Math.abs(s)*.08;p.arms[0].rotation.x=p.arms[1].rotation.x=-2.6+s*.3}
  else {p.up.rotation.x=0;p.arms[0].rotation.x=p.arms[1].rotation.x=0}}
 const bOf=t=>S.b.filter(b=>b.t===t);
 function spotIn(b,out){if(out){const sd=Math.floor(Math.random()*4),u=Math.random();return sd===0?[b.x+u*b.w,b.y-.25]:sd===1?[b.x+u*b.w,b.y+b.h+.25]:sd===2?[b.x-.25,b.y+u*b.h]:[b.x+b.w+.25,b.y+u*b.h]}return [b.x+.15+Math.random()*(b.w-.3),b.y+.15+Math.random()*(b.h-.3)]}
 function forestEdge(){for(let i=0;i<30;i++){const x=Math.floor(Math.random()*N),y=Math.floor(Math.random()*N);if(L(x,y)==='F'){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(inside(X,Y)&&L(X,Y)==='G')return [x+.5+dx*.4,y+.5+dy*.4]}}}return null}
 /** Pilih kegiatan menurut jam, umur, dan bangunan yang ada. */
 function plan(p){const h=hour(),home=S.b.find(b=>b.id===p.home)||bOf('house')[0];
  const go=(pt,act,dur)=>{const X=Math.floor(pt[0]),Y=Math.floor(pt[1]);if(!inside(X,Y)||L(X,Y)==='W'){pt=[p.m.position.x,p.m.position.z];act='idle';dur=2}p.tx=pt[0];p.tz=pt[1];p.act=act;p.dur=dur;p.state='walk'};
  if(isNight()||(!p.child&&h>17.8&&Math.random()<.6)){if(home)return go(spotIn(home,true),'home',9999);return go([p.m.position.x+(Math.random()-.5)*2,p.m.position.z+(Math.random()-.5)*2],'idle',5)}
  if(LIFE.gather>0){const hall=bOf('hall')[0]||bOf('worship')[0]||home;if(hall)return go(spotIn(hall,true),'chat',6)}
  if(p.child){const c=bOf('hall')[0]||home;if(c&&Math.random()<.7){const s=spotIn(c,true);return go([s[0]+(Math.random()-.5)*2,s[1]+(Math.random()-.5)*2],'play',3+Math.random()*4)}return go([p.m.position.x+(Math.random()-.5)*4,p.m.position.z+(Math.random()-.5)*4],'play',2)}
  const r=Math.random(),W=[];if(h>5.5&&h<11||h>14&&h<17)W.push(['field',bOf('field').length?5:0],['pond',bOf('pond').length?1:0],['wood',2]);
  W.push(['well',bOf('well').length?1.5:0],['market',bOf('market').length&&h>6&&h<15?3:0],['worship',bOf('worship').length&&(h<6.5||(h>11.8&&h<13)||h>15&&h<16)?6:0],['hall',bOf('hall').length?1:0],['visit',1.5],['home',1]);
  let tot=W.reduce((a,w)=>a+w[1],0),q=r*tot;let k='home';for(const w of W){q-=w[1];if(q<=0){k=w[0];break}}
  if(k==='field'){const f=pick(bOf('field'));return go(spotIn(f),'hoe',8+Math.random()*10)}
  if(k==='pond'){const f=pick(bOf('pond'));return go(spotIn(f,true),'idle',8)}
  if(k==='wood'){const e=forestEdge();if(e)return go(e,'hoe',6);}
  if(k==='well'){const f=pick(bOf('well'));return go(spotIn(f,true),'draw',4)}
  if(k==='market'){const f=pick(bOf('market'));return go(spotIn(f),'chat',6+Math.random()*6)}
  if(k==='worship'){const f=pick(bOf('worship'));return go(spotIn(f,true),'pray',6)}
  if(k==='hall'){const f=pick(bOf('hall'));return go(spotIn(f),'chat',8)}
  if(k==='visit'){const f=pick(bOf('house'));if(f)return go(spotIn(f,true),'chat',5)}
  if(home)return go(spotIn(home,true),'idle',4+Math.random()*4);return go([N/2,N/2],'idle',3)}
 function stepPeople(dt){const P=LIFE.people;for(const p of P){const m=p.m;
  if(p.state==='walk'){const dx=p.tx-m.position.x,dz=p.tz-m.position.z,d=Math.hypot(dx,dz);if(!m.visible)m.visible=true;
   if(d<.06){p.state='do';p.t=p.dur;if(p.act==='home'){m.visible=false}}else{const sp=(p.child?1.3:.75)*(1+.4*(spd()>1));m.position.x+=dx/d*Math.min(d,dt*sp);m.position.z+=dz/d*Math.min(d,dt*sp);m.rotation.y=Math.atan2(dx,dz);walkPose(p,dt,p.child?14:9)}}
  else{p.t-=dt;if(p.act!=='home')workPose(p,dt,p.act);if(p.t<=0||(p.act==='home'&&!isNight()&&hour()<17))plan(p)}
  m.position.y=R3.hAt(m.position.x,m.position.z)}}
 let spd=()=>1;R3.speedFn=f=>{spd=f};
 R3.villagers=()=>{if(!S)return;const houses=bOf('house');const adults=Math.min(48,Math.max(2,S.kk*2)),kids=Math.min(18,Math.floor(S.kk*.7));const want=adults+kids;const P=LIFE.people;
  while(P.length>want){const p=P.pop();root.remove(p.m)}
  while(P.length<want){const child=P.length>=adults;const p=mkPerson(child,child?null:pick(['caping','peci','kerudung',null,null]));p.child=child;const h=houses.length?houses[P.length%houses.length]:null;p.home=h?h.id:0;
   const s=h?spotIn(h,true):[N/2+Math.random()*2,N/2+Math.random()*2];p.m.position.set(s[0],R3.hAt(s[0],s[1]),s[1]);root.add(p.m);P.push(p);plan(p)}
  P.forEach((p,i)=>{if(!S.b.some(b=>b.id===p.home)&&houses.length)p.home=houses[i%houses.length].id});
  // ayam di sekitar rumah
  const wantH=Math.min(30,houses.length*2);while(LIFE.hens.length>wantH){root.remove(LIFE.hens.pop().m)}
  while(LIFE.hens.length<wantH){const h=houses[LIFE.hens.length%houses.length];const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),mat(pick(['#f2efe7','#8a4b2a','#2b2b2b'])));b.scale.set(1,.85,1.3);b.position.y=.06;g.add(b);const hd=new THREE.Mesh(new THREE.SphereGeometry(.028,6,5),b.material);hd.position.set(0,.11,.05);g.add(hd);const cm=new THREE.Mesh(new THREE.BoxGeometry(.012,.02,.02),mat('#d63a2a'));cm.position.set(0,.14,.05);g.add(cm);
   const s=spotIn(h,true);g.position.set(s[0],R3.hAt(s[0],s[1]),s[1]);root.add(g);LIFE.hens.push({m:g,hd,cx:s[0],cz:s[1],tx:s[0],tz:s[1],t:0})}
  // cahaya jendela malam
  LIFE.glows.forEach(g=>root.remove(g));LIFE.glows=[];SPR=SPR||{glow:sprTex('rgba(255,210,120,1)','rgba(255,170,60,0)'),smoke:sprTex('rgba(235,235,235,.9)','rgba(235,235,235,0)')};
  houses.forEach(h=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR.glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));sp.scale.set(.9,.9,1);sp.position.set(h.x+.5,R3.hAt(h.x+.5,h.y+.5)+.35,h.y+.95);sp.visible=false;sp.userData.f=Math.random();root.add(sp);LIFE.glows.push(sp)});
  LIFE.paths=null}
 function stepHens(dt){for(const c of LIFE.hens){c.t-=dt;const m=c.m;const dx=c.tx-m.position.x,dz=c.tz-m.position.z,d=Math.hypot(dx,dz);
  if(d>.03){m.position.x+=dx/d*dt*.35;m.position.z+=dz/d*dt*.35;m.rotation.y=Math.atan2(dx,dz);c.hd.position.y=.11}else{c.hd.position.y=.11-Math.max(0,Math.sin(clock.elapsedTime*9+c.cx))*.06;if(c.t<0){c.t=1+Math.random()*3;c.tx=c.cx+(Math.random()-.5)*1.4;c.tz=c.cz+(Math.random()-.5)*1.4}}
  m.position.y=R3.hAt(m.position.x,m.position.z);m.visible=!isNight()}}
 /* ---------- kendaraan di jaringan jalan ---------- */
 function pathNet(){if(LIFE.paths)return LIFE.paths;const T=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='P')T.push([x,y]);LIFE.paths=T;return T}
 const nb=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([X,Y])=>inside(X,Y)&&L(X,Y)==='P');
 const wheel=r=>{const w=new THREE.Mesh(new THREE.TorusGeometry(r,r*.18,6,14),mat('#1e1e1e'));w.rotation.y=Math.PI/2;return w};
 function mkVehicle(kind){const g=new THREE.Group(),ws=[];let rider=null,len=.5;
  if(kind==='sepeda'||kind==='motor'){const r=kind==='motor'?.075:.085;[-.14,.14].forEach(z=>{const w=wheel(r);w.position.set(0,r,z);g.add(w);ws.push(w)});
   const fr=new THREE.Mesh(box,mat(kind==='motor'?pick(['#c0392b','#1f4e8c','#222']):pick(['#2f8f6a','#d35400','#555'])));fr.scale.set(.04,kind==='motor'?.1:.04,.3);fr.position.y=kind==='motor'?.13:.15;g.add(fr);
   rider=mkPerson(false,kind==='motor'?null:pick(['caping','peci',null]));rider.m.position.set(0,.02,-.02);rider.m.scale.setScalar(.85);if(kind==='motor'){const hm=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),mat(pick(['#f2f2f2','#d63a2a','#1b1b1b'])));hm.position.y=.26;rider.up.add(hm)}g.add(rider.m);len=.35}
  else if(kind==='gerobak'){const c=new THREE.Mesh(box,mat('#8a6a45'));c.scale.set(.3,.12,.34);c.position.set(0,.16,0);g.add(c);const load=new THREE.Mesh(box,mat(pick(['#4f8f4a','#c8a14b','#9c4a33'])));load.scale.set(.24,.08,.28);load.position.set(0,.26,0);g.add(load);[-.17,.17].forEach(x=>{const w=wheel(.1);w.position.set(x,.1,0);g.add(w);ws.push(w)});
   rider=mkPerson(false,'caping');rider.m.position.set(0,0,.32);g.add(rider.m);len=.6}
  else if(kind==='mobil'){const c=new THREE.Mesh(box,mat(pick(['#e8e8e8','#b03a2e','#2e5a88','#2b2b2b','#c9a227']),{metalness:.4,roughness:.4}));c.scale.set(.28,.12,.5);c.position.y=.1;c.castShadow=true;g.add(c);const cab=new THREE.Mesh(box,mat('#9cc3dc',{metalness:.3,roughness:.15}));cab.scale.set(.24,.1,.26);cab.position.set(0,.21,-.02);g.add(cab);[[-.14,.16],[.14,.16],[-.14,-.16],[.14,-.16]].forEach(([x,z])=>{const w=wheel(.055);w.position.set(x,.055,z);g.add(w);ws.push(w)});len=.6}
  else if(kind==='truk'){const cab=new THREE.Mesh(box,mat('#e8e8e2'));cab.scale.set(.3,.22,.18);cab.position.set(0,.17,.3);cab.castShadow=true;g.add(cab);const gl=new THREE.Mesh(box,mat('#2a3a48'));gl.scale.set(.26,.08,.02);gl.position.set(0,.24,.4);g.add(gl);
   const bd=new THREE.Mesh(box,mat('#2f7d4a'));bd.scale.set(.32,.28,.46);bd.position.set(0,.2,-.05);bd.castShadow=true;g.add(bd);const st=new THREE.Mesh(box,mat('#e0a526'));st.scale.set(.33,.04,.47);st.position.set(0,.2,-.05);g.add(st);
   const bc=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:'#ff9a1f'}));bc.position.set(0,.3,.3);g.add(bc);g.userData.beacon=bc;
   [[-.15,.28],[.15,.28],[-.15,-.18],[.15,-.18]].forEach(([x,z])=>{const w=wheel(.07);w.position.set(x,.07,z);g.add(w);ws.push(w)});
   const crew=mkPerson(false,null);crew.m.position.set(.22,0,-.3);crew.m.visible=false;crew.m.scale.setScalar(.85);g.add(crew.m);g.userData.crew=crew;len=.8}
  return {m:g,ws,rider,kind,len}}
 function spawnVeh(kind){const T=pathNet();if(T.length<3)return null;const s=pick(T),v=mkVehicle(kind),n=nb(s[0],s[1]);if(!n.length)return null;v.a=s;v.b=pick(n);v.u=0;v.prev=null;v.speed={sepeda:.9,gerobak:.45,motor:2,mobil:2.2,truk:1}[kind];v.stop=0;v.life=kind==='truk'?70:1e9;root.add(v.m);return v}
 function stepVeh(dt){const T=pathNet();const era=S.era;const want=isNight()?Math.min(2,Math.floor(T.length/12)):Math.min(2+era*3,Math.floor(T.length/5));const V=LIFE.veh;
  if(V.filter(v=>v.kind!=='truk').length<want&&Math.random()<dt*.8){const k=era>=3?pick(['sepeda','motor','mobil','mobil','gerobak']):era>=2?pick(['sepeda','sepeda','motor','gerobak']):pick(['sepeda','gerobak','gerobak']);const v=spawnVeh(k);if(v)V.push(v)}
  LIFE.truckT-=dt;if(era>=2&&T.length>=10&&LIFE.truckT<=0&&!isNight()&&!V.some(v=>v.kind==='truk')){const v=spawnVeh('truk');if(v)V.push(v);LIFE.truckT=45+Math.random()*30}
  for(let i=V.length-1;i>=0;i--){const v=V[i];if(V.filter(v=>v.kind!=='truk').length>want+1&&v.kind!=='truk'&&Math.random()<dt*.3){root.remove(v.m);V.splice(i,1);continue}
   if(L(v.a[0],v.a[1])!=='P'||L(v.b[0],v.b[1])!=='P'||v.life<=0){root.remove(v.m);V.splice(i,1);continue}
   if(v.stop>0){v.stop-=dt;const cr=v.m.userData.crew;if(cr){cr.m.visible=true;workPose(cr,dt,'draw')}if(v.m.userData.beacon)v.m.userData.beacon.visible=Math.sin(clock.elapsedTime*10)>0;continue}else if(v.m.userData.crew)v.m.userData.crew.m.visible=false;
   v.u+=dt*v.speed;if(v.u>=1){v.u=0;v.life--;const n=nb(v.b[0],v.b[1]).filter(q=>!(q[0]===v.a[0]&&q[1]===v.a[1]));const pv=v.a;v.a=v.b;v.b=n.length?pick(n):pv;
    if(v.kind==='truk'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=v.a[0]+a,Y=v.a[1]+b;return inside(X,Y)&&occ[Y][X]&&(S.b.find(q=>q.id===occ[Y][X])||{}).t==='house'}))v.stop=2.2}
   const ax=v.a[0]+.5,az=v.a[1]+.5,bx=v.b[0]+.5,bz=v.b[1]+.5,dx=bx-ax,dz=bz-az,dl=Math.hypot(dx,dz)||1,nx=-dz/dl*.2,nz=dx/dl*.2;
   const x=ax+dx*v.u+nx,z=az+dz*v.u+nz;v.m.position.set(x,R3.hAt(x,z)+.03,z);if(dl>.1){const target=Math.atan2(dx,dz);let d=target-v.m.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));v.m.rotation.y+=d*Math.min(1,dt*8)}
   v.ws.forEach(w=>{w.rotation.x+=dt*v.speed*12});if(v.rider){if(v.kind==='gerobak')walkPose(v.rider,dt,8);else{v.rider.ph+=dt*(v.kind==='sepeda'?10:0);v.rider.legs[0].rotation.x=-1.3+Math.sin(v.rider.ph)*.5;v.rider.legs[1].rotation.x=-1.3-Math.sin(v.rider.ph)*.5;v.rider.arms[0].rotation.x=v.rider.arms[1].rotation.x=-1.1;v.rider.up.rotation.x=.25}}
   if(v.m.userData.beacon)v.m.userData.beacon.visible=true}}
 /* ---------- burung, asap dapur, cahaya ---------- */
 function stepAmbient(dt){const h=hour(),night=isNight();
  if(!LIFE.birds.length){for(let i=0;i<7;i++){const g=new THREE.Group();const wm=mat('#2b2b2b',{side:THREE.DoubleSide});const wg=new THREE.PlaneGeometry(.22,.07);const l=new THREE.Mesh(wg,wm),r=new THREE.Mesh(wg,wm);l.position.x=-.11;r.position.x=.11;const pl=new THREE.Group(),pr=new THREE.Group();pl.add(l);pr.add(r);g.add(pl,pr);g.rotation.order='YXZ';root.add(g);LIFE.birds.push({m:g,pl,pr,a:i*.5,r:5+i*.4,cx:N/2,cz:N/2,y:7+i*.3})}}
  LIFE.birds.forEach((b,i)=>{b.a+=dt*.25;const x=b.cx+Math.cos(b.a)*b.r+Math.sin(b.a*2.3+i)*.8,z=b.cz+Math.sin(b.a)*b.r;b.m.position.set(x,b.y+Math.sin(b.a*3+i)*.4,z);b.m.rotation.y=-b.a;const f=Math.sin(clock.elapsedTime*10+i)*.7;b.pl.rotation.z=f;b.pr.rotation.z=-f;b.m.visible=!night});
  // asap dapur pagi & sore
  const cook=(h>5&&h<8)||(h>16&&h<18.5);LIFE.smokeT-=dt;const hs=bOf('house');
  if(cook&&hs.length&&LIFE.smokeT<=0){LIFE.smokeT=.12;const hh=pick(hs);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR.smoke,transparent:true,depthWrite:false,opacity:.55}));sp.position.set(hh.x+.65,R3.hAt(hh.x+.5,hh.y+.5)+1,hh.y+.35);sp.scale.setScalar(.25);sp.userData.age=0;root.add(sp);LIFE.smoke.push(sp)}
  for(let i=LIFE.smoke.length-1;i>=0;i--){const s=LIFE.smoke[i];s.userData.age+=dt;const a=s.userData.age;s.position.y+=dt*.35;s.position.x+=dt*.12;s.scale.setScalar(.25+a*.35);s.material.opacity=Math.max(0,.55-a*.18);if(a>3){root.remove(s);s.material.dispose();LIFE.smoke.splice(i,1)}}
  LIFE.glows.forEach(g=>{g.visible=night&&(h>18.6||h<4.5+g.userData.f);g.material.opacity=.75+Math.sin(clock.elapsedTime*3+g.userData.f*9)*.1});
  if(LIFE.gather>0)LIFE.gather-=dt}
 R3.gather=s=>{LIFE.gather=s;LIFE.people.forEach(p=>{if(!isNight())plan(p)})};
 R3.lifeReset=()=>{[...LIFE.people.map(p=>p.m),...LIFE.veh.map(v=>v.m),...LIFE.hens.map(h=>h.m),...LIFE.birds.map(b=>b.m),...LIFE.smoke,...LIFE.glows].forEach(o=>root.remove(o));Object.assign(LIFE,{people:[],veh:[],birds:[],hens:[],smoke:[],glows:[],paths:null})};
 R3.pathsDirty=()=>{LIFE.paths=null};
 R3.life=dt=>{if(!S)return;stepPeople(dt);stepHens(dt);stepVeh(dt);stepAmbient(dt)};
 R3.hour=hour;R3.look=(x,z,d)=>{controls.target.set(x,R3.hAt(x,z),z);camera.position.set(x-d*.3,R3.hAt(x,z)+d*1.1,z+d*.6)};R3.dbg=()=>({veh:LIFE.veh.map(v=>v.kind+':'+v.a+'>'+v.b),paths:pathNet().length,people:LIFE.people.length});
 R3.dom=()=>renderer.domElement;R3.controls=()=>controls;
})();

/* ================= Interaksi ================= */
let tool='info',dirty=false,speed=1,timer=0,curStyle='jawa',dragging=false;
function canAfford(c){return S.res.coin>=(c.coin||0)&&S.res.wood>=(c.wood||0)}
function pay(c){S.res.coin-=c.coin||0;S.res.wood-=c.wood||0}
function act(x,y,silent){const say=m=>{if(!silent)toast(m)};
 if(tool==='info'){showInfo(x,y);return}
 if(tool==='babat'){if(L(x,y)!=='F')return;if(S.res.coin<1){say(t('noMoney'));return}S.res.coin-=1;S.res.wood+=4;setL(x,y,'G');S.stats.cleared++;R3.tileColor(x,y);R3.trees();after();return}
 if(tool==='path'){if(L(x,y)!=='G'||occ[y][x]){if(L(x,y)==='F')say(t('needClear'));return}if(S.res.coin<1){say(t('noMoney'));return}S.res.coin-=1;setL(x,y,'P');R3.tileColor(x,y);R3.path(x,y);R3.pathsDirty();after();return}
 if(tool==='bull'){const id=occ[y][x];if(!id)return;const b=S.b.find(b=>b.id===id);S.res.wood+=Math.floor((BT[b.t].c.wood||0)/2);S.b=S.b.filter(q=>q.id!==id);R3.delB(id);rebuildOcc();R3.villagers();after();return}
 const T=BT[tool];if(!T)return;if(T.era>S.era){say(t('locked',{n:T.era}));return}
 for(let dy=0;dy<T.h;dy++)for(let dx=0;dx<T.w;dx++){const X=x+dx,Y=y+dy;if(!inside(X,Y)){return}const l=L(X,Y);if(l==='W'){say(t('onWater'));return}if(l==='F'){say(t('needClear'));return}if(occ[Y][X]||l==='P'){say(t('occupied'));return}}
 if(!canAfford(T.c)){say(S.res.coin<(T.c.coin||0)?t('noMoney'):t('noWood'));return}
 pay(T.c);const b={id:S.nid++,t:tool,x,y,w:T.w,h:T.h};if(tool==='house'||tool==='hall')b.s=curStyle;if(tool==='house'&&Math.random()<.5)b.r=Math.floor(Math.random()*4);S.b.push(b);rebuildOcc();R3.addB(b);R3.villagers();after()}
function after(){dirty=true;updHUD();checkMissions();checkEra()}
function placeOK(x,y){if(!x&&x!==0)return false;if(tool==='babat')return L(x,y)==='F';if(tool==='path')return L(x,y)==='G'&&!occ[y][x];if(tool==='bull')return !!occ[y][x];if(tool==='info')return true;const T=BT[tool];if(!T)return false;
 for(let dy=0;dy<T.h;dy++)for(let dx=0;dx<T.w;dx++){const X=x+dx,Y=y+dy;if(!inside(X,Y)||L(X,Y)!=='G'||occ[Y][X])return false}return T.era<=S.era&&canAfford(T.c)}
function bindInput(){const el=R3.dom();let down=null,last=null;
 el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,b:e.button};dragging=false;if((tool==='babat'||tool==='path')&&e.button===0&&e.pointerType!=='touch'){R3.controls().enabled=false;dragging=true;const c=R3.pick(e.clientX,e.clientY);if(c){act(c[0],c[1],true);last=c.join()}}});
 el.addEventListener('pointermove',e=>{const c=R3.pick(e.clientX,e.clientY);if(c){const T=BT[tool]||{w:1,h:1};R3.ghost(c[0],c[1],T.w,T.h,placeOK(c[0],c[1]))}else R3.ghost(null);
  if(dragging&&c&&c.join()!==last){act(c[0],c[1],true);last=c.join()}});
 el.addEventListener('pointerup',e=>{R3.controls().enabled=true;if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);if(!dragging&&d<7&&down.b===0){const c=R3.pick(e.clientX,e.clientY);if(c)act(c[0],c[1])}dragging=false;down=null;last=null});
 el.addEventListener('pointerleave',()=>R3.ghost(null))}

/* ================= UI gim ================= */
function renderBar(){$('bar').innerHTML=TOOLS.map(k=>{if(k==='|')return '<div class="sep"></div>';const T=BT[k],lock=T&&T.era>S.era,c=T?T.c:null;
  return `<button class="tool${k===tool?' on':''}${lock?' lock':''}" data-k="${k}" title="${esc(t('tlD.'+k))}"><i>${ICON[k]}</i><span>${t('tl.'+k)}</span><em>${c?(c.coin?'💰'+c.coin:'')+(c.wood?' 🪵'+c.wood:''):k==='babat'?'💰1 →🪵4':k==='path'?'💰1':''}</em></button>`}).join('');
 $('bar').querySelectorAll('.tool').forEach(b=>b.onclick=()=>{const k=b.dataset.k,T=BT[k];if(T&&T.era>S.era){toast(t('locked',{n:T.era}));return}tool=k;renderBar();$('styleBar').classList.toggle('hidden',!(k==='house'||k==='hall'));if(k!=='info')$('info').classList.add('hidden')});
 $('styleBar').innerHTML=STYLES.map(s=>`<button class="${s===curStyle?'on':''}" data-s="${s}">${t('st.'+s)[0]}</button>`).join('');$('styleBar').querySelectorAll('button').forEach(b=>b.onclick=()=>{curStyle=b.dataset.s;renderBar()})}
function updHUD(){const R=S.res;$('hName').textContent=S.char.name;$('hTitle').textContent=titleOf(S.loc.cc,S.era);$('hAv').innerHTML=avatarSVG(S.char.av);
 $('hDate').textContent=t('months')[S.t%12]+' · '+t('year')+' '+(Math.floor(S.t/12)+1)+(clockS?' · '+clockS:'');$('hEra').textContent=t('era',{n:S.era})+' · '+t('eras')[S.era-1];
 const cap=40+count('barn')*BT.barn.store,houses=count('house');
 const st=[['💰',t('coin'),Math.floor(R.coin),R.coin<5],['🪵',t('wood'),Math.floor(R.wood),R.wood<5],['🌾',t('food'),Math.floor(R.food)+'/'+cap,R.food<S.kk*3],['👪',t('kk'),S.kk+'/'+houses,S.kk>houses],['😊',t('happy'),S.happy,S.happy<45],['🤝',t('coh'),S.coh,S.coh<45]];
 $('hStats').innerHTML=st.map(s=>`<div class="st${s[3]?' warn':''}"><small>${s[0]} ${s[1]}</small><b>${s[2]}</b></div>`).join('')}
function renderMissions(){const list=MISS[S.era]||[];$('missions').innerHTML=`<h3>🎯 ${t('missions')} · ${t('eras')[S.era-1]}<button id="msX">–</button></h3>`+list.map(([k])=>`<div class="ms${S.done.indexOf(k)>=0?' done':''}"><i>${S.done.indexOf(k)>=0?'✅':'⬜'}</i><span>${t('ms.'+k)}</span></div>`).join('')+`<p class="note" style="color:var(--muted);margin:6px 0 0">${esc(S.meta.name)} · ${esc(S.loc.name)}</p>`;
 $('msX').onclick=()=>{$('missions').classList.toggle('mini');$('missions').querySelectorAll('.ms,.note').forEach(e=>e.classList.toggle('hidden'))}}
function showInfo(x,y){const id=occ[y][x],b=id&&S.b.find(q=>q.id===id),i=$('info');i.classList.remove('hidden');
 const kv=(k,v)=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`;let h=`<h3>${t('infoTile',{x,y})}<button id="inX">✕</button></h3>`+kv(t('kv.type'),b?ICON[b.t]+' '+t('tl.'+b.t):t('land.'+L(x,y)));
 if(b&&b.s)h+=kv(t('kv.style'),t('st.'+b.s)[0]);h+=kv(t('kv.water'),near(x,y,'well',5)?t('kv.yes'):t('kv.no'))+kv(t('kv.worship'),near(x,y,'worship',8)?t('kv.yes'):t('kv.no'))+kv(t('kv.flood'),nearWater(x,y,1)?t('kv.yes'):t('kv.no'));
 i.innerHTML=h;$('inX').onclick=()=>i.classList.add('hidden')}
let advT=0;function advise(msg,who){const a=$('advisor'),w=who||'elder',face={elder:'👴🏽',eng:'👷🏽',eco:'🧮'}[w];a.innerHTML=`<div class="face">${face}</div><div><b>${t('adv.'+w)}</b><p>${esc(msg)}</p></div><button class="x" aria-label="tutup">✕</button>`;a.classList.remove('off');a.querySelector('.x').onclick=()=>a.classList.add('off');clearTimeout(advT);advT=setTimeout(()=>a.classList.add('off'),9000)}
function setSpeed(s){speed=s;['spP','sp1','sp2'].forEach((id,i)=>$(id).classList.toggle('on',[0,1,2][i]===s))}
$('spP').onclick=()=>setSpeed(0);$('sp1').onclick=()=>setSpeed(1);$('sp2').onclick=()=>setSpeed(2);
$('mBtn').onclick=()=>{const m=$('menu');if(!m.classList.contains('hidden')){m.classList.add('hidden');return}
 m.innerHTML=`<button id="mSave">💾 ${t('save')} <span id="saveDot"></span></button><button id="mNb">🏘️ ${t('neighbors')}</button><button id="mHelp">❓ ${t('help')}</button><button id="mLang">🌐 ${t('lang')}</button><button id="mExit">🚪 ${t('exit')}</button><button id="mHome">🏠 pindotutuko.id</button>`;m.classList.remove('hidden');
 $('mSave').onclick=()=>save(true);$('mNb').onclick=neighbors;$('mHelp').onclick=()=>modal(`<h2>${t('help')}</h2><p>${t('helpTxt')}</p>`);
 $('mLang').onclick=()=>{lang=lang==='id'?'en':'id';store.set('baLang',lang);applyStatic();renderBar();updHUD();renderMissions();m.classList.add('hidden')};
 $('mExit').onclick=async()=>{await save(true);stopGame();hub()};$('mHome').onclick=async()=>{await save(true);location.href='https://pindotutuko.id/'}};
function modal(html){const m=$('modal');m.classList.remove('hidden');m.innerHTML=`<div class="box">${html}<div class="row" style="margin-top:12px"><button class="bigbtn" id="mOk">${t('ok')}</button></div></div>`;$('mOk').onclick=()=>m.classList.add('hidden')}
async function neighbors(){if(GUEST){modal(`<h2>${t('nbH')}</h2><p>${t('guestWarn')}</p>`);return}try{const j=await api('neighbors',null,'&lat='+S.loc.lat+'&lon='+S.loc.lon);
 modal(`<h2>${t('nbH')}</h2>`+(j.list.length?j.list.map(n=>`<div class="nb"><div><b>${esc(n.name)}</b> <small>· ${esc(n.who)}</small><br><small>${esc(n.loc)} · ${t('nbRel.'+n.rel)}${n.rel==='dekat'?' · '+n.km+' km':''}</small></div><div style="text-align:right"><b>${t('era',{n:n.era})}</b><br><small>${n.kk} KK</small></div></div>`).join(''):`<p>${t('nbNone')}</p>`))}catch(e){toast(t('errNet'))}}

/* ================= Simpan / muat ================= */
let saveVer=0,saving=false,lastSave=0;
async function save(force){if(!S||saving)return;if(!force&&!dirty)return;saving=true;const dot=$('saveDot');if(dot)dot.textContent=t('saving');
 try{if(GUEST)store.set('baGuestSave',JSON.stringify(S));else{const j=await fetch(API+'?a=save',{method:'POST',headers:{'Content-Type':'application/json','X-BA-Token':TOKEN},body:JSON.stringify({state:S,base:saveVer,force:true})}).then(r=>r.json());if(!j.ok)throw new Error(j.error);saveVer=j.ver}
  dirty=false;lastSave=Date.now();if(dot)dot.textContent='✓ '+t('saved');if(force)toast('💾 '+t('saved'))}
 catch(e){if(dot)dot.textContent=t('saveFail');if(force)toast(t('saveFail'))}finally{saving=false}}
async function loadGame(){try{let st=null;if(GUEST){st=JSON.parse(store.get('baGuestSave')||'null')}else{const j=await api('load');st=j.save&&j.save.state;saveVer=j.save?j.save.ver:0}if(!st)throw new Error('none');startGame(st,false)}catch(e){$('hubErr').textContent=t('errNet')}}
let started=false,loopT=0,clockS='';
function startGame(st,fresh){S=st;rebuildOcc();show('game');if(!started){R3.init($('view'));bindInput();started=true}
 R3.world();curStyle=S.char.style||'jawa';tool='info';renderBar();updHUD();renderMissions();setSpeed(1);
 if(fresh){advise(t('tips')[0]);setTimeout(()=>advise(t('tips')[1],'eng'),10000);save(true)}
 clearInterval(loopT);R3.speedFn(()=>speed);let acc=0,tod=.25;R3.daylight(tod);loopT=setInterval(()=>{if(!S)return;tod=(tod+.0083*(speed||0))%1;R3.daylight(tod);const hh=Math.floor(tod*24),mm=Math.floor(tod*24*60%60/15)*15;clockS=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');$('hDate').textContent=t('months')[S.t%12]+' · '+t('year')+' '+(Math.floor(S.t/12)+1)+' · '+clockS;acc+=speed;if(acc>=8){acc=0;tick()}if(Date.now()-lastSave>60000)save(false)},500)}
function stopGame(){clearInterval(loopT);S=null}
window.addEventListener('beforeunload',()=>{if(S&&dirty&&GUEST)store.set('baGuestSave',JSON.stringify(S))});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)save(false)});

/* ================= Mulai ================= */
applyStatic();
(async()=>{if(TOKEN){try{const j=await api('me');ME=j.me;hub();return}catch(e){TOKEN=null;store.del('baTok')}}show('scAuth')})();
window.__BA={look:(x,z,d)=>R3.look(x,z,d),dbg:()=>R3.dbg(),state:()=>S,tick,act:(k,x,y)=>{tool=k;act(x,y,true)},BT};
