/* Babat Alas v0.1 — simulasi permukiman 3D (pindotutuko.id)
   Rujukan struktur: simcity-threejs-clone (CitySim.js) © Daniel Greenheck, MIT. Semua model bangunan dibuat prosedural. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from 'three/addons/objects/Water.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const $=id=>document.getElementById(id);
const API='api/';
const N=128,START=40;     // dunia 128×128 petak (1 petak ≈ 10 m); wilayah awal 40×40 di tengah
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let lang=store.get('baLang')==='en'?'en':'id';
const SET=Object.assign({vol:.7,amb:.8,sfx:1,q:'auto',shadow:true,crowd:1,keys:true,cam:1,touch:true,autosave:true,tips:true,ui:1},(()=>{try{return JSON.parse(store.get('baSet')||'{}')}catch(e){return {}}})());
const saveSet=()=>store.set('baSet',JSON.stringify(SET));

/* ================= Teks ================= */
const TX={
 id:{home:'Beranda',tag:'Simulasi permukiman 3D · dari babat alas sampai kawasan pintar',intro:'Kamu adalah pemimpin yang membuka lahan di lokasi nyata di Indonesia atau dunia. Tumbuhkan dusun menjadi kampung, desa, sampai kawasan modern — dengan memperhatikan ekonomi, sosial budaya, dan lingkungan. Permainan tersimpan dan bisa dilanjutkan kapan saja.',
  login:'Masuk',register:'Daftar',user:'Nama pengguna (3–32 huruf/angka)',pass:'Kata sandi (min. 6)',kampus:'Kampus / institusi (opsional)',kelas:'Kode kelas dari dosen (opsional)',guest:'Main sebagai tamu',privacy:'Tidak perlu email. Kata sandi disimpan dalam bentuk hash. Mode tamu hanya tersimpan di peramban ini.',
  continue:'Lanjutkan permainan',newgame:'Permainan baru',logout:'Keluar',hello:'Selamat datang, {n}',guestHi:'Mode tamu',saveInfo:'Simpanan: <b>{name}</b> · {loc} · era {era} · {kk} KK · bulan ke-{m}',noSave:'Belum ada simpanan. Mulai permainan baru.',confirmNew:'Permainan lama akan diganti. Klik lagi untuk yakin.',
  charH:'Buat tokoh pemimpin',charP:'Tokohmu memulai sebagai pembuka lahan. Gelarnya naik mengikuti tahap permukiman dan aturan negara tempat kampung didirikan.',cName:'Nama tokoh',cAvatar:'Rupa tokoh',cOrigin:'Asal daerah',cMotto:'Semboyan',cStyle:'Gaya bangunan utama',cStyleP:'Gaya bisa diganti per bangunan. Gaya lokal memberi bonus kohesi warga; gaya modern menaikkan nilai lahan pada era akhir.',next:'Lanjut',back:'Kembali',
  locH:'Pilih lahan yang akan dibuka',locP:'Geser peta ke lokasi nyata mana pun di dunia. Iklim, musim, dan gelar pemimpin mengikuti lokasi; medan, sungai, dan hutan dibangkitkan dari lokasi itu (kotak oranye ≈ 400 × 400 m).',lName:'Nama permukiman',start:'Mulai babat alas',osm:'Peta © kontributor OpenStreetMap · OpenFreeMap. Medan permainan adalah hasil bangkitan, bukan data survei.',
  coin:'Kas',wood:'Kayu',food:'Pangan',kk:'KK',happy:'Bahagia',coh:'Kohesi',water:'Air',
  months:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],year:'Th',era:'Era {n}',
  eras:['Babat alas','Dusun','Kampung','Desa','Kelurahan','Kota kecil','Kota'],
  missions:'Misi',info:'Info',menu:'Menu',save:'Simpan sekarang',saved:'Tersimpan',saving:'Menyimpan…',saveFail:'Gagal menyimpan — dicoba lagi otomatis',neighbors:'Tetangga',exit:'Keluar ke menu',lang:'English',help:'Cara bermain',
  noMoney:'Kas tidak cukup.',noWood:'Kayu tidak cukup — babat hutan dulu.',needClear:'Bersihkan hutan dulu (alat Babat).',onWater:'Tidak bisa di air.',occupied:'Petak sudah terisi.',locked:'Terbuka di era {n}.',outside:'Di luar wilayahmu — perluas wilayah dulu (Menu → Perluas wilayah).',expH:'Perluas wilayah',expP:'Wilayahmu {w} × {h} petak (±{m} m). Setiap perluasan menambah 8 petak (±80 m) ke satu arah. Tidak ada batas waktu — permukimanmu bisa terus tumbuh sampai seluruh lembah 128 × 128 petak.',expNeed:'Syarat: {kk} KK · biaya 💰{c} 🪵{w}',expDir:['⬆ Utara','➡ Timur','⬇ Selatan','⬅ Barat'],expDone:'Wilayah bertambah! Tanah baru siap dibuka.',expMax:'Sudah mencapai batas lembah ke arah ini.',expKK:'Butuh {kk} KK untuk memperluas.',
  tl:{rt:'Balai RT',taman:'Taman',kebun:'Kebun',bengkel:'Bengkel',sekolah:'Sekolah',klinik:'Puskesmas',kom:'Kom.',info:'Info',babat:'Babat',path:'Jalan',house:'Rumah',field:'Ladang',well:'Sumur',barn:'Lumbung',pond:'Kolam',tree:'Pohon',hall:'Balai adat',worship:'Ibadah',market:'Pasar',bull:'Bongkar'},
  tlD:{rt:'Kohesi lingkungan kecil',taman:'Bermain anak, bahagia',kebun:'Komoditas khas → dagang',bengkel:'Kerajinan khas → dagang',sekolah:'Pendidikan, pertumbuhan',klinik:'Kesehatan, warga tak pergi',kom:'Komunikasi, jaringan dagang +',info:'Lihat data petak',babat:'Buka hutan → kayu',path:'Jalan setapak',house:'1 KK, pakai gaya',field:'Pangan +6/bln, 2 pekerja',well:'Air bersih radius 5',barn:'Simpan pangan +120',pond:'Ikan, pangan +2',tree:'Teduh & hijau',hall:'Kohesi warga',worship:'Bahagia radius 8',market:'Jual surplus → kas',bull:'Hapus, kayu kembali 50%'},
  st:{jawa:['Limasan Jawa','genteng, dinding bata'],joglo:['Joglo','atap tinggi bertingkat'],panggung:['Panggung kayu','Melayu/Kalimantan'],gadang:['Rumah gadang','gonjong Minang'],tongkonan:['Tongkonan','atap perahu Toraja'],bali:['Bale Bali','bata merah, alang-alang'],honai:['Honai','bulat, jerami (Papua)'],kolonial:['Indis/kolonial','atap tinggi, beranda'],modern:['Modern tropis','atap datar, kaca'],machiya:['Machiya','kayu gelap (Jepang)'],eropa:['Rumah deret','pelana curam (Eropa)']},
  adv:{elder:'Tetua adat',eng:'Tukang',eco:'Juru kas'},
  tips:['Babat beberapa petak hutan dulu untuk mendapat kayu — jangan habiskan semuanya, hutan menahan air.','Rumah butuh sumur dalam radius 5 petak, kalau tidak warga kurang bahagia.','Ladang butuh 2 pekerja. Setiap KK menyumbang 2 pekerja.','Lumbung menyimpan pangan untuk musim kemarau.','Jangan membangun terlalu dekat sungai: musim hujan bisa membawa banjir.'],
  ev:{dry:'Kemarau panjang: hasil ladang turun 40% selama 3 bulan.',flood:'Banjir! Ladang di tepi sungai rusak.',migr:'Keluarga pendatang tiba dan menetap.',fest:'Warga mengadakan selamatan: kohesi naik.',pest:'Hama menyerang ladang: pangan berkurang.',hunger:'Pangan habis! Warga kelaparan dan ada yang pergi.',leave:'Ada KK yang pindah karena tidak betah.',born:'Keluarga baru menempati rumah.'},
  ms:{m1:'Babat 10 petak hutan',m2:'Bangun 3 rumah',m3:'Bangun sumur',m4:'Bangun 2 ladang',m5:'Bangun lumbung',m6:'Capai 20 KK (naik ke Dusun)',m7:'Bangun balai adat',m8:'Bangun tempat ibadah',m9:'Bangun pasar',m10:'Kohesi ≥ 70',m11:'Capai 50 KK (naik ke Kampung)'},
  eraUp:'Permukimanmu naik menjadi {e}!',eraUpP:'Gelarmu kini: <b>{t}</b>. Bangunan baru terbuka.',ok:'Lanjut',
  infoTile:'Petak ({x},{y})',land:{F:'Hutan',G:'Lahan terbuka',W:'Sungai',P:'Jalan setapak'},kv:{type:'Jenis',style:'Gaya',water:'Air bersih',worship:'Dekat ibadah',flood:'Rawan banjir',yes:'ya',no:'tidak'},
  helpTxt:'<b>Kamera:</b> seret untuk memutar, dua jari/klik kanan untuk menggeser, cubit/gulir untuk zoom.<br><b>Membangun:</b> pilih alat di bilah bawah, lalu ketuk petak. Jalan & babat bisa diseret.<br><b>Waktu:</b> ⏸ jeda, ▶ normal, ⏩ cepat. Satu langkah = satu bulan.<br><b>Simpan:</b> otomatis setiap menit dan saat keluar.',
  nbH:'Tetangga & teman sekelas',nbNone:'Belum ada permukiman lain di dekatmu, sekelas, atau sekampus.',nbRel:{dekat:'tetangga',kelas:'sekelas',kampus:'sekampus'},
  guestWarn:'Mode tamu: simpanan hanya di peramban ini.',bye:'Sampai jumpa!',errNet:'Koneksi bermasalah.',
  e:{eula:'Setujui ketentuan penggunaan dulu.',rude:'Nama mengandung kata yang tidak pantas.',no_class:'Kode kelas tidak ditemukan.',origin:'Akses ditolak.',bad_name:'Nama kelas terlalu pendek atau tidak pantas.',forbidden:'Hanya pembuat kelas yang dapat mengunduh rekap.',too_big:'Simpanan terlalu besar.',bad_user:'Nama pengguna 3–32 huruf/angka/._-',bad_pass:'Kata sandi minimal 6 karakter.',user_taken:'Nama pengguna sudah dipakai.',bad_login:'Nama pengguna atau kata sandi salah.',rate_limited:'Terlalu banyak percobaan, tunggu sebentar.',auth:'Sesi berakhir, silakan masuk lagi.'}},
 en:{home:'Home',tag:'3D settlement simulation · from clearing the forest to a smart district',intro:'You are the leader who opens land at a real place in Indonesia or anywhere in the world. Grow a hamlet into a kampung, a village and finally a modern district — balancing economy, social-cultural life and environment. Your game is saved and can be continued any time.',
  login:'Log in',register:'Sign up',user:'Username (3–32 letters/digits)',pass:'Password (min. 6)',kampus:'Campus / institution (optional)',kelas:'Class code from lecturer (optional)',guest:'Play as guest',privacy:'No email needed. Passwords are stored hashed. Guest mode saves only in this browser.',
  continue:'Continue game',newgame:'New game',logout:'Log out',hello:'Welcome, {n}',guestHi:'Guest mode',saveInfo:'Save: <b>{name}</b> · {loc} · era {era} · {kk} households · month {m}',noSave:'No save yet. Start a new game.',confirmNew:'Your old game will be replaced. Click again to confirm.',
  charH:'Create your leader',charP:'Your character starts as the land-opener. The title rises with each settlement stage and follows the rules of the country where the kampung is founded.',cName:'Character name',cAvatar:'Appearance',cOrigin:'Home region',cMotto:'Motto',cStyle:'Main building style',cStyleP:'Style can be changed per building. Local styles add community cohesion; modern styles raise land value in later eras.',next:'Next',back:'Back',
  locH:'Choose the land to open',locP:'Pan the map to any real place in the world. Climate, seasons and the leader’s title follow the location; terrain, river and forest are generated from it (orange box ≈ 400 × 400 m).',lName:'Settlement name',start:'Start clearing',osm:'Map © OpenStreetMap contributors · OpenFreeMap. The game terrain is generated, not survey data.',
  coin:'Funds',wood:'Timber',food:'Food',kk:'Households',happy:'Happy',coh:'Cohesion',water:'Water',
  months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],year:'Y',era:'Era {n}',
  eras:['Clearing','Hamlet','Kampung','Village','Urban ward','Town','City'],
  missions:'Missions',info:'Info',menu:'Menu',save:'Save now',saved:'Saved',saving:'Saving…',saveFail:'Save failed — will retry',neighbors:'Neighbours',exit:'Exit to menu',lang:'Bahasa Indonesia',help:'How to play',
  noMoney:'Not enough funds.',noWood:'Not enough timber — clear forest first.',needClear:'Clear the forest first (Clear tool).',onWater:'Cannot build on water.',occupied:'Tile is taken.',locked:'Unlocks in era {n}.',outside:'Outside your territory — expand first (Menu → Expand territory).',expH:'Expand territory',expP:'Your territory is {w} × {h} tiles (±{m} m). Each expansion adds 8 tiles (±80 m) in one direction. There is no time limit — your settlement can keep growing until it fills the whole 128 × 128 valley.',expNeed:'Requires {kk} households · cost 💰{c} 🪵{w}',expDir:['⬆ North','➡ East','⬇ South','⬅ West'],expDone:'Territory expanded! New land is ready to open.',expMax:'Valley edge reached in this direction.',expKK:'Needs {kk} households to expand.',
  tl:{rt:'Neighbourhood hall',taman:'Playground',kebun:'Plantation',bengkel:'Workshop',sekolah:'School',klinik:'Clinic',kom:'Comms',info:'Info',babat:'Clear',path:'Path',house:'House',field:'Field',well:'Well',barn:'Granary',pond:'Fish pond',tree:'Tree',hall:'Hall',worship:'Worship',market:'Market',bull:'Demolish'},
  tlD:{rt:'Small-area cohesion',taman:'Children play, happiness',kebun:'Signature crop → trade',bengkel:'Signature craft → trade',sekolah:'Education, growth',klinik:'Health, fewer leave',kom:'Communication, trade network +',info:'Inspect a tile',babat:'Open forest → timber',path:'Footpath',house:'1 household, uses style',field:'Food +6/mo, 2 workers',well:'Clean water radius 5',barn:'Store food +120',pond:'Fish, food +2',tree:'Shade & green',hall:'Community cohesion',worship:'Happy radius 8',market:'Sell surplus → funds',bull:'Remove, 50% timber back'},
  st:{jawa:['Javanese limasan','tiles, brick walls'],joglo:['Joglo','tall tiered roof'],panggung:['Timber stilt house','Malay/Borneo'],gadang:['Rumah gadang','Minang horns'],tongkonan:['Tongkonan','Toraja boat roof'],bali:['Balinese bale','red brick, thatch'],honai:['Honai','round, thatch (Papua)'],kolonial:['Indies/colonial','tall roof, veranda'],modern:['Tropical modern','flat roof, glass'],machiya:['Machiya','dark timber (Japan)'],eropa:['Row house','steep gable (Europe)']},
  adv:{elder:'Elder',eng:'Builder',eco:'Treasurer'},
  tips:['Clear a few forest tiles first for timber — do not clear it all, forest holds water.','Houses need a well within 5 tiles, otherwise residents are less happy.','A field needs 2 workers. Each household provides 2 workers.','A granary stores food for the dry season.','Do not build too close to the river: the rainy season can bring floods.'],
  ev:{dry:'Long drought: field yields drop 40% for 3 months.',flood:'Flood! Riverside fields are damaged.',migr:'A migrant family arrives and settles.',fest:'Residents hold a communal feast: cohesion rises.',pest:'Pests attack the fields: food lost.',hunger:'Out of food! People go hungry and some leave.',leave:'A household moved away, unhappy.',born:'A new family moves into a house.'},
  ms:{m1:'Clear 10 forest tiles',m2:'Build 3 houses',m3:'Build a well',m4:'Build 2 fields',m5:'Build a granary',m6:'Reach 20 households (become a Hamlet)',m7:'Build a community hall',m8:'Build a place of worship',m9:'Build a market',m10:'Cohesion ≥ 70',m11:'Reach 50 households (become a Kampung)'},
  eraUp:'Your settlement is now a {e}!',eraUpP:'Your title is now: <b>{t}</b>. New buildings are unlocked.',ok:'Continue',
  infoTile:'Tile ({x},{y})',land:{F:'Forest',G:'Open land',W:'River',P:'Footpath'},kv:{type:'Type',style:'Style',water:'Clean water',worship:'Near worship',flood:'Flood-prone',yes:'yes',no:'no'},
  helpTxt:'<b>Camera:</b> drag to rotate, two fingers/right-drag to pan, pinch/scroll to zoom.<br><b>Building:</b> pick a tool in the bottom bar, then tap a tile. Paths & clearing can be dragged.<br><b>Time:</b> ⏸ pause, ▶ normal, ⏩ fast. One step = one month.<br><b>Saving:</b> automatic every minute and on exit.',
  nbH:'Neighbours & classmates',nbNone:'No other settlements near you, in your class or campus yet.',nbRel:{dekat:'neighbour',kelas:'classmate',kampus:'same campus'},
  guestWarn:'Guest mode: saved only in this browser.',bye:'See you!',errNet:'Connection problem.',
  e:{eula:'Please accept the terms of use first.',rude:'The name contains inappropriate words.',no_class:'Class code not found.',origin:'Access denied.',bad_name:'Class name is too short or inappropriate.',forbidden:'Only the class creator can download the recap.',too_big:'Save is too large.',bad_user:'Username 3–32 letters/digits/._-',bad_pass:'Password must be at least 6 characters.',user_taken:'Username already taken.',bad_login:'Wrong username or password.',rate_limited:'Too many attempts, please wait.',auth:'Session ended, please log in again.'}}
};
const t=(k,v)=>{let s=k.split('.').reduce((o,p)=>o&&o[p],TX[lang]);if(s==null)s=k;if(v&&typeof s==='string')for(const p in v)s=s.split('{'+p+'}').join(v[p]);return s};
function applyStatic(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(n=>{n.innerHTML=t(n.getAttribute('data-t'))});$('langBtn').textContent=lang==='id'?'EN':'ID';$('aGo').textContent=authMode==='login'?t('login'):t('register')}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastT=0;function toast(s){const e=$('toast');e.textContent=s;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2600)}

/* ================= Gelar menurut negara ================= */
const TITLES={
 ID:['Kepala Adat Pembuka Lahan','Kepala Dusun','Kepala Kampung','Kepala Desa','Lurah','Camat','Wali Kota'],
 MY:['Tok Pembuka Kampung','Ketua Kampung','Ketua Kampung','Penghulu Mukim','Penghulu Mukim','Yang Dipertua Majlis','Datuk Bandar'],
 JP:['Kaitakusha (pembuka lahan)','Ketua buraku','Ketua mura','Sonchō (kepala desa)','Sonchō','Chōchō (kepala kota kecil)','Shichō (wali kota)'],
 PH:['Datu','Barangay Captain','Barangay Captain','Barangay Captain','Barangay Captain','Municipal Mayor','City Mayor'],
 XX:['Founder','Hamlet head','Village head','Village chief','Ward head','Town mayor','Mayor']};
const TITLES_EN={ID:['Customary founder','Hamlet head (Kepala Dusun)','Kampung head','Village head (Kepala Desa)','Ward head (Lurah)','Sub-district head (Camat)','Mayor (Wali Kota)'],MY:['Kampung founder','Village head (Ketua Kampung)','Village head','Penghulu (mukim head)','Penghulu','Council president','Mayor (Datuk Bandar)'],JP:['Kaitakusha (land-opener)','Buraku leader','Mura leader','Sonchō (village mayor)','Sonchō','Chōchō (town mayor)','Shichō (city mayor)'],PH:['Datu','Barangay Captain','Barangay Captain','Barangay Captain','Barangay Captain','Municipal Mayor','City Mayor'],XX:['Founder','Hamlet head','Village head','Village chief','Ward head','Town mayor','Mayor']};
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
 try{const b={user:$('aUser').value.trim(),pass:$('aPass').value};if(authMode==='reg'){b.kampus=$('aKampus').value;b.kelas=$('aKelas').value;b.name=b.user;b.eula=EULA_VER}
  const j=await api(authMode==='login'?'login':'register',b);TOKEN=j.token;store.set('baTok',TOKEN);ME=j.me;GUEST=false;$('aPass').value='';if(!ME.eula){try{await api('eula',{ver:EULA_VER})}catch(e){}}await hub()}
 catch(err){$('aErr').textContent=t('e.'+err.message)!=='e.'+err.message?t('e.'+err.message):t('errNet')}finally{$('aGo').disabled=false}};
$('aGuest').onclick=()=>{GUEST=true;ME={user:'tamu',name:lang==='en'?'Guest':'Tamu'};hub()};
async function hub(){show('scHub');let meta=null;$('hubErr').textContent='';
 if(GUEST){$('hubHello').textContent=t('guestHi');$('hubSub').textContent=t('guestWarn');const s=store.get('baGuestSave');if(s){try{const j=JSON.parse(s);meta={name:j.meta.name,loc:j.loc.name,era:j.era,kk:j.kk,month:j.t}}catch(e){}}}
 else{try{const j=await api('me');ME=j.me;meta=j.saveMeta}catch(e){TOKEN=null;store.del('baTok');show('scAuth');$('aErr').textContent=t('e.auth');return}$('hubHello').textContent=t('hello',{n:ME.name});$('hubSub').textContent=(ME.kampus||'')+(ME.kelas?' · '+ME.kelas:'')}
 $('hubSave').innerHTML='<p>'+(meta?t('saveInfo',{name:esc(meta.name),loc:esc(meta.loc),era:meta.era,kk:meta.kk,m:meta.month}):t('noSave'))+'</p>';
 $('hubCont').classList.toggle('hidden',!meta);let armed=false;
 $('hubNew').onclick=()=>{if(meta&&!armed){armed=true;$('hubErr').textContent=t('confirmNew');setTimeout(()=>{armed=false},4000);return}newChar()};
 $('hubCont').onclick=loadGame;
 let ex=$('hubExtra');if(!ex){ex=document.createElement('div');ex.id='hubExtra';ex.className='row';ex.style.marginTop='10px';$('hubErr').before(ex)}
 ex.innerHTML=`<button class="bigbtn alt" id="hxSet">⚙️ ${SETN[lang].h}</button><button class="bigbtn alt" id="hxBoard">🏆 ${lt('h')}</button>`+(GUEST?'':`<button class="bigbtn alt" id="hxJoin">🎓 ${lt('join')}</button><button class="bigbtn alt" id="hxDosen">👩‍🏫 ${lt('dosen')}</button><button class="bigbtn alt" id="hxDel" style="color:#a33a2a">${lt('del')}</button>`);
 $('hxBoard').onclick=()=>board();$('hxSet').onclick=settings;if(!GUEST){$('hxJoin').onclick=joinClass;$('hxDosen').onclick=dosenRoom;$('hxDel').onclick=deleteAccount}
 $('hubOut').onclick=async()=>{if(!GUEST){try{await api('logout',{})}catch(e){}}TOKEN=null;store.del('baTok');ME=null;show('scAuth')}}

/* ---------- Tokoh ---------- */
const STYLES=['jawa','joglo','panggung','gadang','tongkonan','bali','honai','kolonial','modern','machiya','eropa'];
/* ---------- Editor avatar (SVG berlapis; semua bagian bisa diatur) ---------- */
const AVO={face:4,skin:7,eyes:5,brow:3,mouth:4,nose:3,hair:8,hairC:7,beard:4,hat:9,cloth:4,clothC:10,acc:4,bg:6};
const AVP={skin:['#f1c9a5','#e0ac7e','#c68c5a','#b97a48','#a86b3d','#8d5a35','#6b4128'],hairC:['#1b1b1b','#3b2a1a','#5a3a22','#8a5a2b','#b9873a','#9a9a9a','#e8e2d6'],clothC:['#1f6f4f','#a33a2a','#2f4f7f','#e0a526','#7a3b6b','#efe6d6','#3b3b3b','#c25b8a','#5b3b25','#2f8f8f'],bg:['#e9f1e6','#f6e7cf','#dfe9f3','#f3dfe6','#e6e1f3','#2b3a33']};
const AVN={id:{face:'Bentuk wajah',skin:'Warna kulit',eyes:'Mata',brow:'Alis',mouth:'Mulut',nose:'Hidung',hair:'Rambut',hairC:'Warna rambut',beard:'Kumis/jenggot',hat:'Penutup kepala',cloth:'Pakaian',clothC:'Warna pakaian',acc:'Aksesori',bg:'Latar',rnd:'🎲 Acak',
  v:{face:['Oval','Bulat','Persegi','Hati'],eyes:['Titik','Bulat','Sipit','Besar','Teduh'],brow:['Tipis','Tebal','Melengkung'],mouth:['Senyum','Tertawa','Datar','Bicara'],nose:['Kecil','Sedang','Mancung'],hair:['Botak','Pendek','Belah samping','Keriting','Panjang','Sanggul','Jabrik','Kuncir'],beard:['Tanpa','Kumis','Jenggot','Brewok'],hat:['Tanpa','Blangkon','Peci','Udeng Bali','Caping','Kerudung','Iket','Topi','Mahkota adat'],cloth:['Kemeja','Beskap/surjan','Kaos','Jas'],acc:['Tanpa','Kacamata','Anting','Kalung']}},
 en:{face:'Face shape',skin:'Skin tone',eyes:'Eyes',brow:'Brows',mouth:'Mouth',nose:'Nose',hair:'Hair',hairC:'Hair colour',beard:'Moustache/beard',hat:'Headwear',cloth:'Clothing',clothC:'Clothing colour',acc:'Accessory',bg:'Background',rnd:'🎲 Random',
  v:{face:['Oval','Round','Square','Heart'],eyes:['Dots','Round','Narrow','Big','Gentle'],brow:['Thin','Thick','Arched'],mouth:['Smile','Laugh','Neutral','Talking'],nose:['Small','Medium','Pointed'],hair:['Bald','Short','Side part','Curly','Long','Bun','Spiky','Ponytail'],beard:['None','Moustache','Beard','Full beard'],hat:['None','Blangkon','Peci','Balinese udeng','Caping','Headscarf','Iket','Cap','Ceremonial crown'],cloth:['Shirt','Beskap/surjan','T-shirt','Jacket'],acc:['None','Glasses','Earrings','Necklace']}}};
const avDefault=()=>({face:0,skin:2,eyes:1,brow:0,mouth:0,nose:0,hair:1,hairC:0,beard:0,hat:1,cloth:1,clothC:0,acc:0,bg:0});
function avRandom(){const a={};for(const k in AVO)a[k]=Math.floor(Math.random()*AVO[k]);a.bg=Math.floor(Math.random()*5);return a}
function avatarCustom(a,opt){const sk=AVP.skin[a.skin],hc=AVP.hairC[a.hairC],cc=AVP.clothC[a.clothC],dk='#2a1d14',cx=60,cy=58;
 const face=[`<ellipse cx="60" cy="58" rx="22" ry="27" fill="${sk}"/>`,`<circle cx="60" cy="59" r="25" fill="${sk}"/>`,`<rect x="37" y="33" width="46" height="52" rx="14" fill="${sk}"/>`,`<path d="M36 46q0-16 24-16t24 16q0 22-24 39q-24-17-24-39z" fill="${sk}"/>`][a.face];
 const body=`<path d="M14 120q2-26 46-28q44 2 46 28z" fill="${cc}"/><rect x="52" y="78" width="16" height="14" fill="${sk}"/>`+[
  `<path d="M50 92l10 10 10-10" fill="#fff" stroke="#00000022"/><path d="M60 102v18" stroke="#00000033" stroke-width="1.5"/>`,
  `<path d="M48 92l12 28M72 92l-8 18" stroke="#00000044" stroke-width="2" fill="none"/><circle cx="57" cy="106" r="1.4" fill="#c8a14b"/><circle cx="59" cy="113" r="1.4" fill="#c8a14b"/>`,
  `<path d="M50 92q10 8 20 0" stroke="#00000033" stroke-width="2" fill="none"/>`,
  `<path d="M48 92l12 16 12-16" fill="#fff"/><path d="M48 92l8 28M72 92l-8 28" stroke="#00000055" stroke-width="2" fill="none"/><path d="M58 98l2 10 2-10z" fill="#a33a2a"/>`][a.cloth];
 const ears=`<ellipse cx="37" cy="60" rx="4" ry="6" fill="${sk}"/><ellipse cx="83" cy="60" rx="4" ry="6" fill="${sk}"/>`;
 const back=a.hair===4?`<path d="M34 50q-2 40 6 52h40q8-12 6-52z" fill="${hc}"/>`:a.hair===7?`<path d="M80 52q14 10 8 36q-4-14-10-20z" fill="${hc}"/>`:'';
 const ey=[`<circle cx="51" cy="58" r="2.4" fill="${dk}"/><circle cx="69" cy="58" r="2.4" fill="${dk}"/>`,
  `<ellipse cx="51" cy="58" rx="4.2" ry="3.4" fill="#fff"/><ellipse cx="69" cy="58" rx="4.2" ry="3.4" fill="#fff"/><circle cx="51.5" cy="58.3" r="2.2" fill="${dk}"/><circle cx="69.5" cy="58.3" r="2.2" fill="${dk}"/>`,
  `<path d="M46 58q5-2.5 10 0M64 58q5-2.5 10 0" stroke="${dk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  `<ellipse cx="51" cy="58" rx="5" ry="5.5" fill="#fff"/><ellipse cx="69" cy="58" rx="5" ry="5.5" fill="#fff"/><circle cx="51" cy="59" r="3.4" fill="${dk}"/><circle cx="69" cy="59" r="3.4" fill="${dk}"/><circle cx="52.2" cy="57.6" r="1.1" fill="#fff"/><circle cx="70.2" cy="57.6" r="1.1" fill="#fff"/>`,
  `<path d="M46 59q5 3 10 0M64 59q5 3 10 0" stroke="${dk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`][a.eyes];
 const br=[`<path d="M45 51q6-3 12 0M63 51q6-3 12 0" stroke="${hc}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,`<path d="M44 51l13-2M63 49l13 2" stroke="${hc}" stroke-width="3.6" stroke-linecap="round"/>`,`<path d="M45 52q6-6 12-1M63 51q6-5 12 1" stroke="${hc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`][a.brow];
 const no=[`<path d="M59 62q1 4 3 4" stroke="#00000044" stroke-width="1.6" fill="none"/>`,`<path d="M60 60q-3 7 0 8q3 0 4-1" stroke="#00000055" stroke-width="1.8" fill="none"/>`,`<path d="M60 56l-4 11h7" stroke="#00000055" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`][a.nose];
 const mo=[`<path d="M52 72q8 6 16 0" stroke="#7a3a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,`<path d="M51 70q9 11 18 0z" fill="#7a2a22"/><path d="M53 71h14v2h-14z" fill="#fff"/>`,`<path d="M53 73h14" stroke="#7a3a2a" stroke-width="2.2" stroke-linecap="round"/>`,`<ellipse cx="60" cy="73" rx="4" ry="3" fill="#7a2a22"/>`][a.mouth];
 const be=['',`<path d="M50 68q10-4 20 0q-10 2-20 0z" fill="${hc}"/>`,`<path d="M52 76q8 14 16 0q-8 4-16 0z" fill="${hc}"/>`,`<path d="M38 62q2 26 22 26t22-26q-6 14-22 14t-22-14z" fill="${hc}" opacity=".9"/><path d="M50 68q10-4 20 0q-10 2-20 0z" fill="${hc}"/>`][a.beard];
 const ha=['',`<path d="M38 46q22-20 44 0q-22-6-44 0z" fill="${hc}"/>`,`<path d="M36 52q0-24 24-24t24 24q-4-14-24-14t-20 12q-2-8-4 2z" fill="${hc}"/>`,
  [30,40,50,60,70,80,90].map((x,i)=>`<circle cx="${x/1.0*0.6+24}" cy="${36+(i%2)*4}" r="8" fill="${hc}"/>`).join('')+`<circle cx="38" cy="48" r="7" fill="${hc}"/><circle cx="82" cy="48" r="7" fill="${hc}"/>`,
  `<path d="M35 56q-2-28 25-28t25 28q-6-18-25-18t-25 18z" fill="${hc}"/>`,`<path d="M36 50q2-22 24-22t24 22q-8-12-24-12t-24 12z" fill="${hc}"/><circle cx="60" cy="24" r="9" fill="${hc}"/>`,
  `<path d="M36 48l4-16 6 8 5-14 5 12 6-14 4 13 7-11 2 14 7-6-2 14q-12-8-44 0z" fill="${hc}"/>`,`<path d="M36 52q0-24 24-24t24 24q-6-14-24-14t-24 14z" fill="${hc}"/>`][a.hair];
 const hats=['',`<path d="M34 48q26-30 52 0v4H34z" fill="#3b2a1a"/><path d="M36 46h48" stroke="#c8a14b" stroke-width="2"/><path d="M40 40l8 8M52 36l8 10M66 36l6 10" stroke="#6b4a2a" stroke-width="1.6"/><ellipse cx="86" cy="48" rx="5" ry="6" fill="#3b2a1a"/>`,
  `<rect x="38" y="24" width="44" height="22" rx="4" fill="#1b1b1b"/><path d="M38 40h44" stroke="#333" stroke-width="2"/>`,`<path d="M34 46q26-22 52 0l-2 4H36z" fill="#f3f3f3"/><path d="M58 30l10-10 2 14z" fill="#f3f3f3"/><path d="M36 46h48" stroke="#d9c38a" stroke-width="2"/>`,
  `<path d="M10 46L60 14l50 32z" fill="#d9b66a"/><path d="M10 46L60 14l50 32" stroke="#a9883e" stroke-width="2" fill="none"/>`,`<path d="M30 70q-4-44 30-44t30 44v40H30z" fill="${cc}"/><ellipse cx="60" cy="60" rx="21" ry="25" fill="${sk}"/>`,
  `<path d="M34 46q26-22 52 0l-4 6H38z" fill="#7a3a2a"/><path d="M34 44q26-8 52 0" stroke="#e0a526" stroke-width="2.4" fill="none"/><path d="M82 40l10-8-2 12z" fill="#7a3a2a"/>`,
  `<path d="M36 46q0-22 24-22t24 22z" fill="${cc}"/><path d="M60 46h34q-4 6-34 4z" fill="${cc}"/><circle cx="60" cy="24" r="2.4" fill="#fff"/>`,
  `<path d="M36 46l6-20 9 12 9-18 9 18 9-12 6 20z" fill="#e0a526"/><circle cx="60" cy="30" r="3" fill="#a33a2a"/><path d="M36 46h48" stroke="#a37a1e" stroke-width="3"/>`][a.hat];
 const acc=['',`<circle cx="51" cy="58" r="7" fill="none" stroke="#222" stroke-width="2"/><circle cx="69" cy="58" r="7" fill="none" stroke="#222" stroke-width="2"/><path d="M58 58h4M44 57l-6-2M76 57l6-2" stroke="#222" stroke-width="2"/>`,`<circle cx="37" cy="68" r="2.4" fill="#e0a526"/><circle cx="83" cy="68" r="2.4" fill="#e0a526"/>`,`<path d="M48 92q12 12 24 0" stroke="#e0a526" stroke-width="2.4" fill="none"/><circle cx="60" cy="100" r="3" fill="#2f8f8f"/>`][a.acc];
 if(opt&&opt.faceOnly)return `<svg viewBox="30 30 60 60" xmlns="http://www.w3.org/2000/svg">${ey}${br}${mo}${be}</svg>`;
 const hideHair=a.hat===5;
 return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="${AVP.bg[a.bg]}"/>${hideHair?'':back}${body}${a.hat===5?hats:''}${ears}${face}${ey}${br}${no}${mo}${be}${hideHair?'':ha}${a.hat===5?'':hats}${acc}</svg>`}
function avatarOf(c){return c&&c.ava?avatarCustom(c.ava):avatarSVG(c?c.av||0:0)}
function renderAvEditor(){const c=draft.char;c.ava=c.ava||avDefault();const a=c.ava,T=AVN[lang];
 const row=k=>{const isCol=AVP[k],n=AVO[k];if(isCol)return `<div class="avr"><span>${T[k]}</span><div class="sw">${AVP[k].slice(0,n).map((col,i)=>`<button type="button" class="${i===a[k]?'on':''}" style="background:${col}" data-k="${k}" data-i="${i}" aria-label="${T[k]} ${i+1}"></button>`).join('')}</div></div>`;
  return `<div class="avr"><span>${T[k]}</span><div class="avst"><button type="button" data-k="${k}" data-d="-1">◀</button><b>${T.v[k][a[k]]}</b><button type="button" data-k="${k}" data-d="1">▶</button></div></div>`};
 $('cAvs').innerHTML=`<div class="aved"><div class="avprev"><div id="av3d" class="av3d"></div><div class="av2d">${avatarCustom(a)}</div><button type="button" class="bigbtn alt" id="avRnd">${T.rnd}</button></div><div class="avopts">${['face','skin','hair','hairC','eyes','brow','nose','mouth','beard','hat','cloth','clothC','acc','bg'].map(row).join('')}</div></div>`;
 $('cAvs').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(b.dataset.d)a[k]=(a[k]+(+b.dataset.d)+AVO[k])%AVO[k];else a[k]=+b.dataset.i;Snd.click();renderAvEditor()});
 $('avRnd').onclick=()=>{c.ava=avRandom();Snd.click();renderAvEditor()};
 try{AvPrev.mount($('av3d'));AvPrev.set(a)}catch(e){$('av3d').remove()}}

/* ================= Avatar 3D (prosedural; pola editor modular ala CharacterStudio M3-org, MIT) ================= */
const faceTexCache={};
function faceTexture(a){const key=JSON.stringify([a.eyes,a.brow,a.nose,a.mouth,a.beard,a.hairC,a.acc]);if(faceTexCache[key])return faceTexCache[key];
 const c=document.createElement('canvas');c.width=c.height=512;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const img=new Image();
 img.onload=()=>{const g=c.getContext('2d');g.clearRect(0,0,512,512);g.drawImage(img,0,0,512,512);tex.needsUpdate=true};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(avatarCustom(a,{faceOnly:true}));return faceTexCache[key]=tex}
/** Membangun tokoh 3D bersendi (pinggul, bahu) agar bisa berjalan seperti warga. Tinggi ±1,8 satuan. */
function buildAvatar3D(a){a=a||avDefault();const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75},o||{}));
 const sk=M(AVP.skin[a.skin]),hc=M(AVP.hairC[a.hairC],{roughness:.9}),cc=M(AVP.clothC[a.clothC]),dark=M('#2b2b2b'),gold=M('#d4a32a',{metalness:.6,roughness:.35}),white=M('#f4f1ea');
 const g=new THREE.Group(),up=new THREE.Group();up.position.y=.78;g.add(up);const add=(m,p,x,y,z)=>{const o=new THREE.Mesh(m,p);o.position.set(x||0,y||0,z||0);o.castShadow=true;return o};
 // torso & pakaian
 const torso=add(new THREE.CylinderGeometry(.24,.2,.55,18),cc,0,.3);up.add(torso);up.add(add(new THREE.SphereGeometry(.24,18,10,0,Math.PI*2,0,Math.PI/2),cc,0,.56));
 if(a.cloth===0){up.add(add(new THREE.BoxGeometry(.2,.05,.08),white,0,.6,.16));up.add(add(new THREE.BoxGeometry(.02,.42,.01),M('#00000033'),0,.33,.235))}
 if(a.cloth===1){for(let i=0;i<4;i++)up.add(add(new THREE.SphereGeometry(.018,8,6),gold,.06-i*.025,.5-i*.1,.215));up.add(add(new THREE.CylinderGeometry(.205,.205,.06,18),M('#5a3a22'),0,.1))}
 if(a.cloth===3){up.add(add(new THREE.BoxGeometry(.1,.4,.02),white,0,.38,.215));up.add(add(new THREE.ConeGeometry(.03,.25,4),M('#a33a2a'),0,.42,.23).rotateX(Math.PI))}
 const neck=add(new THREE.CylinderGeometry(.07,.08,.12,12),sk,0,.66);up.add(neck);
 // kepala
 const head=new THREE.Group();head.position.y=.95;head.scale.setScalar(1.35);up.add(head);const hs=[[.95,1.12,1],[1.05,1,1.02],[1.04,1.04,1],[1,1.06,.98]][a.face];
 const skull=add(new THREE.SphereGeometry(.22,32,24),sk);skull.scale.set(...hs);head.add(skull);
 const face=new THREE.Mesh(new THREE.SphereGeometry(.2215,40,24,Math.PI/2-.95,1.9,.62,1.55),new THREE.MeshStandardMaterial({map:faceTexture(a),transparent:true,roughness:.8,depthWrite:false}));face.scale.set(...hs);head.add(face);
 [-1,1].forEach(s=>head.add(add(new THREE.SphereGeometry(.045,10,8),sk,s*.205*hs[0],0,.0)));
 const nose=add(new THREE.SphereGeometry(a.nose===2?.032:.026,10,8),sk,0,-.03,.215*hs[2]);nose.scale.z=a.nose===2?1.5:1;head.add(nose);
 // rambut
 const cap=(sc,y)=>{const m=add(new THREE.SphereGeometry(.232,28,16,0,Math.PI*2,0,Math.PI*sc),hc,0,y||0);m.scale.set(...hs);return m};
 const hairs=[()=>{},()=>head.add(cap(.42)),()=>{head.add(cap(.45));head.add(add(new THREE.BoxGeometry(.12,.05,.2),hc,.12,.17,.05))},
  ()=>{for(let i=0;i<26;i++){const t=i/26*Math.PI*2,r=.16+(i%3)*.03;head.add(add(new THREE.SphereGeometry(.07,10,8),hc,Math.cos(t)*r,.13+(i%2)*.05,Math.sin(t)*r-.03))}},
  ()=>{head.add(cap(.5));const b=add(new THREE.BoxGeometry(.4,.5,.12),hc,0,-.18,-.14);head.add(b)},()=>{head.add(cap(.45));head.add(add(new THREE.SphereGeometry(.1,14,10),hc,0,.1,-.22))},
  ()=>{head.add(cap(.4));for(let i=0;i<9;i++){const k=add(new THREE.ConeGeometry(.05,.16,6),hc,(i-4)*.045,.24,-.02+Math.abs(i-4)*-.01);k.rotation.z=(i-4)*-.15;head.add(k)}},
  ()=>{head.add(cap(.45));const p=add(new THREE.CylinderGeometry(.04,.02,.32,8),hc,0,-.02,-.25);p.rotation.x=.4;head.add(p)}];
 if(a.hat!==5){const covered=[1,2,3,6,7,8].includes(a.hat);hairs[covered&&[2,3,6].includes(a.hair)?1:a.hair]()}
 // kumis/jenggot 3D tipis (detail di tekstur wajah)
 // penutup kepala
 const hats=[()=>{},
  ()=>{const b=add(new THREE.SphereGeometry(.236,28,14,0,Math.PI*2,0,Math.PI*.42),M('#3b2a1a'));b.scale.set(...hs);head.add(b);head.add(add(new THREE.TorusGeometry(.215,.012,6,30),gold,0,.07).rotateX(Math.PI/2));head.add(add(new THREE.SphereGeometry(.07,12,10),M('#3b2a1a'),0,.02,-.22))},
  ()=>{head.add(add(new THREE.CylinderGeometry(.205,.21,.14,24),M('#151515'),0,.2))},
  ()=>{head.add(add(new THREE.TorusGeometry(.2,.04,8,24),white,0,.13).rotateX(Math.PI/2));head.add(add(new THREE.ConeGeometry(.06,.18,4),white,0,.25,.16).rotateX(-.4))},
  ()=>{head.add(add(new THREE.ConeGeometry(.52,.22,32),M('#d9b66a',{roughness:.95}),0,.22))},
  ()=>{const h=add(new THREE.SphereGeometry(.25,28,18,0,Math.PI*2,0,Math.PI*.62),cc);h.scale.set(...hs);head.add(h);const d=add(new THREE.CylinderGeometry(.22,.3,.3,24,1,true),cc,0,-.28,-.01);head.add(d);face.position.z=.012},
  ()=>{head.add(add(new THREE.TorusGeometry(.212,.035,8,24),M('#7a3a2a'),0,.12).rotateX(Math.PI/2));head.add(add(new THREE.BoxGeometry(.03,.12,.12),M('#7a3a2a'),.15,.2,-.12))},
  ()=>{const c=add(new THREE.SphereGeometry(.236,24,12,0,Math.PI*2,0,Math.PI*.42),cc);c.scale.set(...hs);head.add(c);head.add(add(new THREE.BoxGeometry(.26,.02,.18),cc,0,.09,.22))},
  ()=>{head.add(add(new THREE.CylinderGeometry(.21,.22,.08,24),gold,0,.18));for(let i=0;i<8;i++){const t=i/8*Math.PI*2;head.add(add(new THREE.ConeGeometry(.035,.12,4),gold,Math.cos(t)*.2,.27,Math.sin(t)*.2))}}];
 hats[a.hat]();
 if(a.acc===1){[-1,1].forEach(s=>head.add(add(new THREE.TorusGeometry(.055,.008,6,18),dark,s*.075,0,.225)));head.add(add(new THREE.BoxGeometry(.05,.008,.008),dark,0,0,.228))}
 if(a.acc===2)[-1,1].forEach(s=>head.add(add(new THREE.SphereGeometry(.02,8,6),gold,s*.215,-.07,0)));
 if(a.acc===3)up.add(add(new THREE.TorusGeometry(.12,.012,6,24),gold,0,.6,.06).rotateX(Math.PI/2.4));
 // lengan & kaki bersendi
 const limb=(x,y,len,r,mat,par,hand)=>{const j=new THREE.Group();j.position.set(x,y,0);const m=add(new THREE.CylinderGeometry(r,r*.85,len,10),mat,0,-len/2);j.add(m);if(hand)j.add(add(new THREE.SphereGeometry(r*1.05,10,8),sk,0,-len-.02));par.add(j);return j};
 const arms=[limb(-.265,.56,.46,.06,cc,up,1),limb(.265,.56,.46,.06,cc,up,1)];arms[0].rotation.z=-.12;arms[1].rotation.z=.12;up.add(add(new THREE.SphereGeometry(.075,12,10),cc,-.25,.56),add(new THREE.SphereGeometry(.075,12,10),cc,.25,.56));
 const pants=a.cloth===1?M('#6b4a2a'):dark;const legs=[limb(-.1,.8,.74,.08,pants,g),limb(.1,.8,.74,.08,pants,g)];
 legs.forEach(l=>{const f=add(new THREE.BoxGeometry(.11,.06,.2),M('#3a2a1f'),0,-.76,.04);l.add(f)});
 return {m:g,up,legs,arms,head,ph:Math.random()*6}}
/* ---------- Pratinjau 3D di layar pembuatan tokoh ---------- */
const AvPrev={r:null,scene:null,cam:null,ctl:null,obj:null,raf:0,
 mount(host){if(!this.r){this.r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});this.r.setPixelRatio(Math.min(2,devicePixelRatio));this.r.toneMapping=THREE.ACESFilmicToneMapping;this.r.shadowMap.enabled=true;
   this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(30,1,.1,50);this.cam.position.set(.7,1.75,3.9);this.ctl=new OrbitControls(this.cam,this.r.domElement);this.ctl.target.set(0,1.3,0);this.ctl.enablePan=false;this.ctl.minDistance=1.6;this.ctl.maxDistance=5.5;this.ctl.autoRotate=true;this.ctl.autoRotateSpeed=1.4;this.ctl.enableDamping=true;
   this.scene.add(new THREE.HemisphereLight('#ffffff','#8a7a60',1.1));const d=new THREE.DirectionalLight('#fff2dc',2.4);d.position.set(2,4,3);d.castShadow=true;this.scene.add(d);const f=new THREE.DirectionalLight('#bcd6ea',.8);f.position.set(-3,2,-2);this.scene.add(f);
   const gr=new THREE.Mesh(new THREE.CircleGeometry(.9,40),new THREE.MeshStandardMaterial({color:'#d9cfbf'}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;this.scene.add(gr);
   this.ctl.addEventListener('start',()=>{this.ctl.autoRotate=false})}
  host.innerHTML='';host.appendChild(this.r.domElement);const w=host.clientWidth||150,h=host.clientHeight||190;this.r.setSize(w,h,false);this.r.domElement.style.width='100%';this.r.domElement.style.height='100%';this.cam.aspect=w/h;this.cam.updateProjectionMatrix();
  cancelAnimationFrame(this.raf);const t0=performance.now();const loop=()=>{this.raf=requestAnimationFrame(loop);if(!document.body.contains(this.r.domElement))return cancelAnimationFrame(this.raf);const t=(performance.now()-t0)/1000;
   if(this.obj){const o=this.obj;o.up.position.y=.78+Math.sin(t*2)*.008;o.arms[1].rotation.x=Math.sin(t*.9)>.85?-2.4+Math.sin(t*12)*.25:0;o.head.rotation.y=Math.sin(t*.6)*.25}
   this.ctl.update();this.r.render(this.scene,this.cam)};loop()},
 set(a){if(this.obj)this.scene.remove(this.obj.m);this.obj=buildAvatar3D(a);this.scene.add(this.obj.m)},
 shot(){try{return this.r.domElement.toDataURL('image/png')}catch(e){return null}}};
let draft={char:{name:'',av:0,origin:'',motto:'',style:'jawa'}};
function renderCharForm(){const c=draft.char;renderAvEditor();
 $('cStyles').innerHTML=STYLES.map(s=>`<button type="button" class="${s===c.style?'on':''}" data-s="${s}">${t('st.'+s)[0]}<small>${t('st.'+s)[1]}</small></button>`).join('');
 $('cStyles').querySelectorAll('button').forEach(b=>b.onclick=()=>{c.style=b.dataset.s;renderCharForm()})}
function newChar(){draft={char:{ava:avRandom(),name:ME&&ME.name&&!GUEST?ME.name:'',av:0,origin:'',motto:'',style:'jawa'}};show('scChar');$('cName').value=draft.char.name;$('cOrigin').value='';$('cMotto').value='';renderCharForm()}
$('cBack').onclick=hub;
$('cNext').onclick=()=>{const n=$('cName').value.trim();if(n.length<2){$('cErr').textContent=lang==='en'?'Name is too short.':'Nama terlalu pendek.';return}$('cErr').textContent='';draft.char._shot=AvPrev.r?AvPrev.shot():null;Object.assign(draft.char,{name:n,origin:$('cOrigin').value.trim(),motto:$('cMotto').value.trim()});pickLoc()};

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
function newState(loc,ch,name){const seed=seedOf(loc),w=genWorld(seed);return {v:1,seed,loc,char:ch,m0:new Date().getMonth(),clk:{h:7,d:1},wx:'cerah',links:[],stock:{},meta:{name,created:Date.now()},own:{x0:(N-START)/2,y0:(N-START)/2,x1:(N+START)/2,y1:(N+START)/2},exp:0,era:1,t:0,res:{coin:60,wood:25,food:60},kk:2,happy:62,coh:60,
 land:w.land.map(r=>r.join('')),b:[],nid:1,flags:{},done:[],ev:{dry:0},stats:{cleared:0},score:0}}


/* ================= v0.3: kalender, musim, cuaca, pembangunan bertahap, mata uang, komoditas, jaringan ================= */
const CUR={ID:['Rp',150000,'id-ID'],MY:['RM',45,'ms-MY'],SG:['S$',13,'en-SG'],JP:['¥',1500,'ja-JP'],PH:['₱',550,'en-PH'],TH:['฿',330,'th-TH'],VN:['₫',250000,'vi-VN'],US:['US$',10,'en-US'],GB:['£',8,'en-GB'],AU:['A$',15,'en-AU'],CN:['¥',70,'zh-CN'],KR:['₩',13000,'ko-KR'],IN:['₹',850,'en-IN'],MA:['MAD',95,'fr-MA'],EUR:['€',9,'de-DE'],XX:['US$',10,'en-US']};
const EUROZ=['NL','DE','FR','BE','IT','ES','AT','PT','FI','IE','GR','SK','SI','LU','EE','LV','LT','HR','MT','CY'];
const curOf=()=>CUR[S&&S.loc?S.loc.cc:'XX']||(EUROZ.includes(S&&S.loc&&S.loc.cc)?CUR.EUR:CUR.XX);
function money(v,short){const [sym,rate,loc]=curOf();const x=v*rate,a=Math.abs(x);let s;
 if(short&&a>=1e9)s=(x/1e9).toLocaleString(loc,{maximumFractionDigits:1})+(lang==='en'?'B':' M');else if(short&&a>=1e6)s=(x/1e6).toLocaleString(loc,{maximumFractionDigits:1})+(lang==='en'?'M':' jt');else if(short&&a>=1e4)s=(x/1e3).toLocaleString(loc,{maximumFractionDigits:0})+(lang==='en'?'k':' rb');else s=Math.round(x).toLocaleString(loc);return sym+' '+s}
/* musim per iklim & belahan bumi */
const SEASN={id:{hujan:'Musim hujan',kemarau:'Musim kemarau',pancaroba:'Pancaroba',semi:'Musim semi',panas:'Musim panas',gugur:'Musim gugur',dingin:'Musim dingin'},en:{hujan:'Wet season',kemarau:'Dry season',pancaroba:'Transition',semi:'Spring',panas:'Summer',gugur:'Autumn',dingin:'Winter'}};
const SEAS_IC={hujan:'🌧️',kemarau:'☀️',pancaroba:'🌦️',semi:'🌸',panas:'🌞',gugur:'🍂',dingin:'❄️'};
const calM=()=>((S.m0||0)+S.t)%12, calY=()=>Math.floor(((S.m0||0)+S.t)/12)+1;
function seasonOf(m){const cl=S.loc.climate,lat=S.loc.lat;if(cl==='trop'||cl==='tropdry'){const south=lat<0;
  const wet=south?[10,11,0,1,2]:[4,5,6,7,8,9].slice(cl==='tropdry'?1:0,cl==='tropdry'?5:6),tr=south?[3,9]:[3,10];if(wet.includes(m))return 'hujan';if(tr.includes(m))return 'pancaroba';return 'kemarau'}
 const nh=lat>=0,mm=nh?m:(m+6)%12;return mm>=2&&mm<=4?'semi':mm>=5&&mm<=7?'panas':mm>=8&&mm<=10?'gugur':'dingin'}
const WXN={id:{cerah:'Cerah',berawan:'Berawan',gerimis:'Gerimis',hujan:'Hujan',badai:'Hujan badai',kabut:'Berkabut',salju:'Salju',panas:'Terik'},en:{cerah:'Clear',berawan:'Cloudy',gerimis:'Drizzle',hujan:'Rain',badai:'Thunderstorm',kabut:'Foggy',salju:'Snow',panas:'Scorching'}};
const WX_IC={cerah:'☀️',berawan:'⛅',gerimis:'🌦️',hujan:'🌧️',badai:'⛈️',kabut:'🌫️',salju:'🌨️',panas:'🔥'};
function rollWeather(){const s=seasonOf(calM()),r=Math.random();const T={hujan:[['hujan',.35],['gerimis',.2],['badai',.12],['berawan',.2],['cerah',.13]],kemarau:[['cerah',.55],['panas',.2],['berawan',.2],['gerimis',.05]],pancaroba:[['berawan',.3],['cerah',.25],['hujan',.2],['badai',.1],['gerimis',.15]],
  semi:[['cerah',.35],['berawan',.3],['gerimis',.2],['hujan',.15]],panas:[['cerah',.5],['panas',.2],['berawan',.15],['badai',.15]],gugur:[['berawan',.35],['hujan',.25],['kabut',.2],['cerah',.2]],dingin:[['salju',.4],['berawan',.25],['kabut',.15],['cerah',.2]]}[s];
 let a=0;for(const [k,p] of T){a+=p;if(r<=a)return k}return 'cerah'}
/* lahan: kesuburan & kemiringan */
const fert=(x,y)=>.6+fbm(x/9,y/9,S.seed%983+11)*.9;
const slope=(x,y)=>{const H=R3.H;if(!H)return 0;const a=[H[y][x],H[y][x+1],H[y+1][x],H[y+1][x+1]];return Math.max(...a)-Math.min(...a)};
/* komoditas khas kampung: alam + budaya */
const COMN={id:{padi:'Padi',kelapa:'Kelapa',pisang:'Pisang',kopi:'Kopi',teh:'Teh',jagung:'Jagung',ternak:'Ternak',ikan:'Ikan',kayu:'Kayu & rotan',madu:'Madu hutan',sayur:'Sayur',gandum:'Gandum',apel:'Apel',susu:'Susu',batik:'Batik',anyaman:'Anyaman bambu',gerabah:'Gerabah',ukir:'Ukiran kayu',tenun:'Tenun',songket:'Songket',keramik:'Keramik',keju:'Keju',kerajinan:'Kerajinan kayu',beras:'Beras'},
 en:{padi:'Rice',kelapa:'Coconut',pisang:'Banana',kopi:'Coffee',teh:'Tea',jagung:'Maize',ternak:'Livestock',ikan:'Fish',kayu:'Timber & rattan',madu:'Forest honey',sayur:'Vegetables',gandum:'Wheat',apel:'Apples',susu:'Milk',batik:'Batik',anyaman:'Bamboo weaving',gerabah:'Earthenware',ukir:'Woodcarving',tenun:'Woven cloth',songket:'Songket',keramik:'Ceramics',keju:'Cheese',kerajinan:'Woodcraft',beras:'Rice'}};
const COM_IC={padi:'🌾',kelapa:'🥥',pisang:'🍌',kopi:'☕',teh:'🍵',jagung:'🌽',ternak:'🐄',ikan:'🐟',kayu:'🪵',madu:'🍯',sayur:'🥬',gandum:'🌾',apel:'🍎',susu:'🥛',batik:'🧵',anyaman:'🧺',gerabah:'🏺',ukir:'🪚',tenun:'🧶',songket:'🧶',keramik:'🏺',keju:'🧀',kerajinan:'🪚'};
const PRICE={padi:2,kelapa:2,pisang:1.5,kopi:4,teh:3.5,jagung:1.8,ternak:5,ikan:3,kayu:2.5,madu:6,sayur:2,gandum:2,apel:3,susu:3,batik:8,anyaman:5,gerabah:5,ukir:9,tenun:8,songket:9,keramik:7,keju:7,kerajinan:6};
function ecoProfile(st){const cl=st.loc.climate,cc=st.loc.cc,r=rng(st.seed+5),land=st.land.join(''),water=land.includes('W'),forest=(land.split('F').length-1)/land.length;
 const crop=cl==='trop'?(r()<.45?'kopi':r()<.5?'kelapa':'pisang'):cl==='tropdry'?(r()<.5?'jagung':'ternak'):cl==='sub'?(r()<.5?'teh':'sayur'):(r()<.5?'apel':'susu');
 const craftL={ID:['batik','anyaman','gerabah','ukir','tenun'],MY:['songket','anyaman'],JP:['keramik','kerajinan'],PH:['anyaman','kerajinan'],NL:['keju','keramik'],FR:['keju'],DE:['kerajinan']}[cc]||(EUROZ.includes(cc)?['keju','keramik']:['kerajinan']);
 const craft=craftL[Math.floor(r()*craftL.length)];const nat=[];if(water)nat.push('ikan');if(forest>.25)nat.push(r()<.5?'madu':'kayu');
 return {staple:cl==='temp'?'gandum':cl==='tropdry'?'jagung':'padi',crop,craft,nat}}
/* kampung tetangga (NPC) untuk jaringan dagang */
const SYL={ID:[['Sumber','Karang','Wono','Tegal','Sido','Ngadi','Tirto','Pandan','Kali','Rejo'],['rejo','sari','mulyo','agung','harjo','wangi','asri','makmur','jati','kerto']],MY:[['Kampung ','Sungai ','Bukit ','Batu ','Padang '],['Baru','Raja','Melati','Jaya','Indah']],JP:[['Kami','Shimo','Naka','Kita','Minami'],['mura','sato','kawa','yama','hara']],XX:[['North','South','Old','New','Green'],['field','brook','wood','ford','haven']]};
function npcVillages(st){const r=rng(st.seed+9),L=SYL[st.loc.cc]||SYL.XX,P=ecoProfile(st);const all=Object.keys(PRICE);const out=[];
 for(let i=0;i<5;i++){const nm=L[0][Math.floor(r()*L[0].length)]+L[1][Math.floor(r()*L[1].length)];const want=all.filter(k=>k!==P.crop&&k!==P.craft&&r()<.25).slice(0,3);if(!want.length)want.push(P.craft);
  out.push({id:'npc'+i,name:(st.loc.cc==='ID'?'Desa ':'')+nm,km:+(2+r()*18).toFixed(1),want:[P.crop,P.craft,...P.nat].filter(()=>r()<.7).concat(want).slice(0,4),cost:20+Math.floor(r()*30)})}return out}


/* ---------- perdagangan bulanan ---------- */
function tradeMonth(staff,smul){const P=S.eco||(S.eco=ecoProfile(S)),out={income:0,items:[]};const kom=count('kom'),mk=count('market');const links=(S.links||[]).length,mult=1+.12*Math.min(links,8)+(kom?.15:0);
 const prod={};const add=(k,v)=>{prod[k]=(prod[k]||0)+v};built().forEach(b=>{if(b.t==='kebun')add(P.crop,6*staff*smul*fert(b.x,b.y));if(b.t==='bengkel')add(P.craft,3*staff);if(b.t==='pond')add('ikan',1.5*staff)});
 if(P.nat.includes('madu'))add('madu',Math.min(3,(S.land.join('').split('F').length-1)/2500));
 for(const k in prod){S.stock[k]=(S.stock[k]||0)+prod[k]}
 if(!mk&&!links)return out;const cap=(mk?14:0)+links*10;let sold=0;
 for(const k in S.stock){const q=Math.min(S.stock[k],Math.max(0,cap-sold));if(q<=0)continue;const want=(S.links||[]).some(l=>(l.want||[]).includes(k))?1.3:1;const v=q*PRICE[k]*.5*mult*want;S.stock[k]-=q;sold+=q;out.income+=v;out.items.push([k,+q.toFixed(1),Math.round(v)])}
 out.income=Math.min(Math.round(out.income),6*mk+10*(count('kebun')+count('bengkel')+count('pond'))+8*links+4);return out}
/* ---------- hari: cuaca & pembangunan ---------- */
function dayTick(){S.wx=rollWeather();R3.weather(S.wx,seasonOf(calM()));if(S.wx==='badai'&&Math.random()<.15)advise(lang==='en'?'Thunderstorm! Keep away from the river.':'Hujan badai! Jauhi tepi sungai.','eng');
 // pembangunan: tiap lokasi butuh 2 tukang; tukang = pekerja yang belum bekerja
 const sites=S.b.filter(b=>b.bt>0);if(!sites.length)return;let jobs=0;built().forEach(b=>{jobs+=BT[b.t].jobs||0});let free=Math.max(1,S.kk*2-Math.floor(jobs*.6));const wxMul=S.wx==='badai'||S.wx==='salju'?0:S.wx==='hujan'?.5:1;
 for(const b of sites){if(free<2||!wxMul)break;free-=2;b.bt=Math.max(0,+(b.bt-wxMul).toFixed(2));if(b.bt<=0){delete b.bt;R3.delB(b.id);R3.addB(b);Snd.play('build');toast('✅ '+t('tl.'+b.t)+(lang==='en'?' completed':' selesai dibangun'));if(b.t==='house')R3.villagers();after()}else R3.progress(b)}}
const rushCost=b=>Math.ceil(b.bt*(2+b.w*b.h)*1.5);
function rush(b){const c=rushCost(b);if(S.res.coin<c){toast(t('noMoney'));Snd.play('err');return}let jobs=0;built().forEach(q=>{jobs+=BT[q.t].jobs||0});if(S.kk*2-jobs<2){toast(lang==='en'?'Not enough free workers to rush.':'Tukang tidak cukup untuk mempercepat.');Snd.play('err');return}
 S.res.coin-=c;delete b.bt;R3.delB(b.id);R3.addB(b);Snd.play('build');Snd.play('coin');if(b.t==='house')R3.villagers();after();$('info').classList.add('hidden')}
/* ---------- panel jaringan dagang ---------- */
async function network(){const P=S.eco||(S.eco=ecoProfile(S)),npc=S.npc||(S.npc=npcVillages(S)),C=COMN[lang];let real=[];if(!GUEST){try{real=(await api('neighbors',null,'&lat='+S.loc.lat+'&lon='+S.loc.lon)).list}catch(e){}}
 const linked=id=>(S.links||[]).some(l=>l.id===id),need=count('market')+count('kom')>0;
 const row=(v,isReal)=>`<div class="nb"><div><b>${esc(v.name)}</b>${isReal?` <small>· ${esc(v.who)}</small>`:''}<br><small>${isReal?esc(v.loc)+' · '+t('nbRel.'+v.rel):(lang==='en'?'NPC village':'Kampung NPC')} · ${v.km} km${v.want?' · '+(lang==='en'?'wants ':'butuh ')+v.want.map(k=>COM_IC[k]+' '+C[k]).join(', '):''}</small></div><div>${linked(v.id)?`<b style="color:#2f8f6a">✓ ${lang==='en'?'Linked':'Terhubung'}</b>`:`<button class="bigbtn alt lk" data-id="${v.id}" data-real="${isReal?1:0}" ${need?'':'disabled'}>🤝 ${money(v.cost||30,true)}</button>`}</div></div>`;
 const tr=S._trade;modal(`<h2>🤝 ${lang==='en'?'Trade network':'Jaringan dagang'}</h2><p class="note">${lang==='en'?'Your signature products':'Produk khas kampungmu'}: ${[P.staple,P.crop,P.craft,...P.nat].map(k=>COM_IC[k]+' '+C[k]).join(' · ')}</p>`+
  (need?'':`<p class="err">${lang==='en'?'Build a market or a comms post first.':'Bangun pasar atau pos komunikasi dulu.'}</p>`)+(tr&&tr.items.length?`<p><b>${lang==='en'?'Last month sold':'Terjual bulan lalu'}:</b> ${tr.items.map(i=>COM_IC[i[0]]+' '+C[i[0]]+' ×'+i[1]).join(', ')} → <b>${money(tr.income,true)}</b></p>`:'')+
  `<h3>${lang==='en'?'Real neighbours':'Tetangga nyata (pemain)'}</h3>`+(real.length?real.map(v=>row(Object.assign({cost:25},v),1)).join(''):`<p class="note">${t('nbNone')}</p>`)+`<h3>${lang==='en'?'Nearby villages':'Kampung sekitar'}</h3>`+npc.map(v=>row(v,0)).join(''));
 document.querySelectorAll('.lk').forEach(b=>b.onclick=()=>{const isR=b.dataset.real==='1',v=isR?real.find(q=>q.id===b.dataset.id):npc.find(q=>q.id===b.dataset.id),c=v.cost||25;if(S.res.coin<c){toast(t('noMoney'));return}S.res.coin-=c;S.links.push({id:v.id,name:v.name,want:v.want||[],real:isR?1:0});Snd.play('coin');S.coh+=1;after();network()})}

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
 market:{era:2,w:2,h:2,c:{coin:25,wood:20},jobs:2,days:8},
 rt:{era:1,w:1,h:1,c:{coin:8,wood:10},coh:1,days:4},
 taman:{era:1,w:1,h:1,c:{coin:6,wood:4},days:2},
 kebun:{era:1,w:2,h:2,c:{coin:6,wood:3},jobs:2,days:3},
 bengkel:{era:1,w:1,h:1,c:{coin:10,wood:8},jobs:2,days:4},
 sekolah:{era:2,w:2,h:2,c:{coin:30,wood:25},jobs:1,days:10},
 klinik:{era:2,w:1,h:1,c:{coin:35,wood:15},jobs:1,days:8},
 kom:{era:2,w:1,h:1,c:{coin:20,wood:10},days:5}};
Object.assign(BT.house,{days:3});Object.assign(BT.field,{days:2});Object.assign(BT.well,{days:2});Object.assign(BT.barn,{days:4});Object.assign(BT.pond,{days:2});Object.assign(BT.tree,{days:1});Object.assign(BT.hall,{days:12});Object.assign(BT.worship,{days:10});
const TOOLS=['info','babat','path','house','field','kebun','well','barn','pond','tree','|','rt','taman','bengkel','|','hall','worship','market','sekolah','klinik','kom','|','bull'];
const ICON={rt:'🏡',taman:'🛝',kebun:'🌴',bengkel:'🛠️',sekolah:'🏫',klinik:'🏥',kom:'📡',info:'🔍',babat:'🪓',path:'🟫',house:'🏠',field:'🌾',well:'💧',barn:'🛖',pond:'🐟',tree:'🌳',hall:'🏛️',worship:'🕌',market:'🏪',bull:'🧹'};

let S=null;          // keadaan permainan
let occ=null;        // occ[y][x] = id bangunan
function rebuildOcc(){occ=[];for(let y=0;y<N;y++)occ.push(new Array(N).fill(0));S.b.forEach(b=>{for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++)occ[b.y+dy][b.x+dx]=b.id})}
const L=(x,y)=>S.land[y][x];
function setL(x,y,c){S.land[y]=S.land[y].substring(0,x)+c+S.land[y].substring(x+1)}
const inside=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const inOwn=(x,y)=>{const o=S.own;return x>=o.x0&&y>=o.y0&&x<o.x1&&y<o.y1};
const ownC=()=>[(S.own.x0+S.own.x1)/2,(S.own.y0+S.own.y1)/2];
function near(x,y,type,r){return S.b.some(b=>b.t===type&&Math.abs(b.x+(b.w-1)/2-x)<=r&&Math.abs(b.y+(b.h-1)/2-y)<=r)}
function nearWater(x,y,r){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(inside(X,Y)&&L(X,Y)==='W')return true}return false}
const count=t=>S.b.filter(b=>b.t===t&&!b.bt).length;
const built=()=>S.b.filter(b=>!b.bt);

/** Satu langkah = satu bulan. */
function tick(){S.t++;const R=S.res,m=calM(),cl=S.loc.climate,sea=seasonOf(m);const rainy=sea==='hujan'||sea==='pancaroba'||sea==='gugur';S._sea=sea;
 S._rain=rainy;const workers=S.kk*2;let jobsNeed=0;S.b.forEach(b=>{if(BT[b.t].jobs)jobsNeed+=BT[b.t].jobs});const staff=jobsNeed?Math.min(1,workers/jobsNeed):1;
 const smul={hujan:1.1,pancaroba:.95,kemarau:.75,semi:.9,panas:1,gugur:1.2,dingin:.25}[sea];let prod=0;built().forEach(b=>{if(BT[b.t].food){let f=BT[b.t].food*staff*(b.dmg?0.3:1);if(b.t==='field'){f*=(fert(b.x,b.y)+fert(b.x+1,b.y+1))/2;f*=sea==='kemarau'&&nearWater(b.x,b.y,4)?1.25:1;f*=smul}prod+=f}});if(S.ev.dry>0){prod*=.6;S.ev.dry--}
 const cons=S.kk*2,cap=40+count('barn')*BT.barn.store;R.food=Math.min(cap,R.food+prod-cons);
 let msg=null;if(R.food<0){R.food=0;S.happy-=12;if(S.kk>1){S.kk--;msg=t('ev.hunger')}}
 // kas: iuran warga + pasar menjual surplus
 const surplus=Math.max(0,prod-cons);R.coin+=Math.round(S.kk*.6+count('market')*Math.min(surplus,12)*.5);const tr=tradeMonth(staff,smul);R.coin+=tr.income;S._trade=tr;
 // air & ibadah & kohesi
 const houses=built().filter(b=>b.t==='house');const wet=houses.filter(h=>near(h.x,h.y,'well',5)).length,wor=houses.filter(h=>near(h.x,h.y,'worship',8)).length;
 const wc=houses.length?wet/houses.length:1,wr=houses.length?wor/houses.length:0;
 const trees=S.b.filter(b=>b.t==='tree').length+S.land.join('').split('F').length-1;const green=Math.min(1,trees/(N*N*.25));
 const target=40+(R.food>cons?12:-8)+wc*18+wr*10+green*8+(S.coh-60)*.2-(S.kk>houses.length?10:0);const fac=Math.min(1,count('taman')/Math.max(1,S.kk/10))*5+Math.min(1,count('sekolah')*15/Math.max(1,S.kk))*7+Math.min(1,count('klinik')*20/Math.max(1,S.kk))*7+(sea==='dingin'?-4:0);S.happy+=Math.round((target+fac-S.happy)*.25);
 const cohT=50+count('hall')*12+Math.min(10,count('rt')*3)+(localStyleShare()*15)-(S.kk>30?5:0);S.coh+=Math.round((cohT-S.coh)*.15);
 // pertumbuhan
 const capH=houses.length*BT.house.cap;if(S.happy>=55&&R.food>S.kk*3&&capH>S.kk&&Math.random()<(.6+(count('sekolah')?.15:0))){S.kk++;if(Math.random()<.3)msg=msg||t('ev.born')}
 if(S.happy<35&&S.kk>2&&Math.random()<(count('klinik')?.18:.35)){S.kk--;msg=t('ev.leave')}
 // banjir musim hujan
 if(rainy&&Math.random()<(sea==='hujan'?.08:.04)){let hit=0;S.b.forEach(b=>{if((b.t==='field'||b.t==='house')&&nearWater(b.x,b.y,1)){b.dmg=3;hit++}});if(hit)msg=t('ev.flood');Snd.play('flood')}
 S.b.forEach(b=>{if(b.dmg){b.dmg--;if(!b.dmg)delete b.dmg}});
 // kejadian acak
 const e=Math.random();if(!msg){if(e<.025&&S.ev.dry<=0){S.ev.dry=3;msg=t('ev.dry')}else if(e<.05&&capH>S.kk){S.kk++;msg=t('ev.migr')}else if(e<.065){S.coh=Math.min(100,S.coh+8);msg=t('ev.fest');R3.gather(25);Snd.play('fest')}else if(e<.08){R.food=Math.max(0,R.food-15);msg=t('ev.pest')}}
 S.happy=Math.max(0,Math.min(100,S.happy));S.coh=Math.max(0,Math.min(100,S.coh));
 S.score=Math.round(S.kk*10+S.happy+S.coh+S.era*100+R.coin*.1);
 if(!msg)maybeEvent();if(msg)advise(msg);checkMissions();checkEra();updHUD();dirty=true;R3.villagers();R3.season(rainy)}
function localStyleShare(){const reg={ID:['jawa','joglo','panggung','gadang','tongkonan','bali','honai','kolonial'],MY:['panggung','gadang','kolonial'],JP:['machiya'],NL:['eropa'],DE:['eropa'],FR:['eropa'],GB:['eropa'],BE:['eropa']}[S.loc.cc]||[];const hs=S.b.filter(b=>b.t==='house');if(!hs.length)return .5;return hs.filter(h=>reg.indexOf(h.s)>=0).length/hs.length}

/* ---------- Misi & era ---------- */
const MISS={1:[['m1',()=>S.stats.cleared>=10],['m2',()=>count('house')>=3],['m3',()=>count('well')>=1],['m4',()=>count('field')>=2],['m5',()=>count('barn')>=1],['m6',()=>S.kk>=20]],2:[['m7',()=>count('hall')>=1],['m8',()=>count('worship')>=1],['m9',()=>count('market')>=1],['m10',()=>S.coh>=70],['m11',()=>S.kk>=50]]};
/** Misi tanpa akhir: setelah daftar era selesai, muncul target lanjutan (KK & perluasan wilayah). */
const NEXTREQ={id:{3:'50 KK + balai, ibadah, pasar',4:'100 KK + sekolah, puskesmas, 2 balai RT',5:'200 KK + 3 jaringan dagang + pos komunikasi',6:'400 KK',7:'800 KK'},en:{3:'50 households + hall, worship, market',4:'100 households + school, clinic, 2 neighbourhood halls',5:'200 households + 3 trade links + comms post',6:'400 households',7:'800 households'}};
function missList(){const L0=(MISS[S.era]||[]).slice();if(!MISS[S.era]&&ERA_REQ[S.era+1])L0.push(['nx'+(S.era+1),ERA_REQ[S.era+1]]);if(L0.every(([k])=>S.done.indexOf(k)>=0)){const n=Math.max(25,Math.ceil((S.kk+1)/25)*25),e=(S.exp||0)+1;L0.push(['kk'+n,()=>S.kk>=n],['ex'+e,()=>(S.exp||0)>=e])}return L0}
function msLabel(k){if(/^kk\d+$/.test(k))return (lang==='en'?'Reach ':'Capai ')+k.slice(2)+(lang==='en'?' households':' KK');if(/^nx\d+$/.test(k))return (lang==='en'?'Next: ':'Naik ke ')+t('eras')[+k.slice(2)-1]+' — '+NEXTREQ[lang][k.slice(2)];if(/^ex\d+$/.test(k))return (lang==='en'?'Expand territory (#':'Perluas wilayah (ke-')+k.slice(2)+')';return t('ms.'+k)}
function checkMissions(){missList().forEach(([k,f])=>{if(S.done.indexOf(k)<0&&f()){S.done.push(k);S.res.coin+=15;Snd.play('mission');toast('✅ '+msLabel(k)+' · +15')}});renderMissions()}
const ERA_REQ={2:()=>S.kk>=20&&count('barn')>=1,3:()=>S.kk>=50&&count('hall')&&count('worship')&&count('market'),4:()=>S.kk>=100&&count('sekolah')&&count('klinik')&&count('rt')>=2,5:()=>S.kk>=200&&(S.links||[]).length>=3&&count('kom'),6:()=>S.kk>=400,7:()=>S.kk>=800};
function checkEra(){const nx=S.era+1;if(ERA_REQ[nx]&&ERA_REQ[nx]()){S.era=nx;S.res.coin+=40*nx;eraModal();renderBar()}}
function eraModal(){Snd.play('era');const m=$('modal');m.classList.remove('hidden');m.innerHTML=`<div class="box eraUp"><div class="big">🎉</div><h2>${t('eraUp',{e:t('eras')[S.era-1]})}</h2><p>${t('eraUpP',{t:esc(titleOf(S.loc.cc,S.era))})}</p><button class="bigbtn gold" id="eOk">${t('ok')}</button></div>`;$('eOk').onclick=()=>{m.classList.add('hidden');eraDialog()};save(true)}

/* ================= 3D ================= */
const R3={};
(function(){let renderer,scene,camera,controls,root,terrain,water,trees,trunks,bmeshes={},ghost,sun,hemi,people=[],clock=new THREE.Clock(),tod=.35;
 const M={};const mat=(c,o)=>{const k=c+JSON.stringify(o||{});if(!M[k])M[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{}));return M[k]};
 const box=new THREE.BoxGeometry(1,1,1);
 R3.hAt=(x,y)=>{const H=R3.H;if(!H)return 0;const X=Math.max(0,Math.min(N,x)),Y=Math.max(0,Math.min(N,y)),xi=Math.min(N-1,Math.floor(X)),yi=Math.min(N-1,Math.floor(Y)),fx=X-xi,fy=Y-yi;return H[yi][xi]*(1-fx)*(1-fy)+H[yi][xi+1]*fx*(1-fy)+H[yi+1][xi]*(1-fx)*fy+H[yi+1][xi+1]*fx*fy};
 const TCOL={F:'#4f7d3a',G:'#93b462',W:'#5e8fb0',P:'#b99a6b',D:'#a98d63'};
 R3.init=el=>{renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.1,500);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=1.35;controls.minDistance=6;controls.maxDistance=150;controls.target.set(N/2,0,N/2);camera.position.set(N/2-14,30,N/2+30);controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  hemi=new THREE.HemisphereLight('#ffffff','#7d6b4a',.9);scene.add(hemi);sun=new THREE.DirectionalLight('#fff3dc',2.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,far:200});sun.shadow.bias=-.0005;scene.add(sun);scene.add(sun.target);sun.target.position.set(N/2,0,N/2);
  root=new THREE.Group();scene.add(root);
  ghost=new THREE.Mesh(new THREE.BoxGeometry(1,.3,1),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.35}));ghost.visible=false;scene.add(ghost);
  new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();R3.resizePost(w,h)}).observe(el);R3.setupSky();
  loop()};
 function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta());controls.update();
  R3.life(dt);
  R3.precStep(dt);if(wmesh)wmesh.material.uniforms.time.value+=dt*.6;else if(water&&water.material.map){water.material.map.offset.x+=dt*.02}
  R3.render()}
 R3.daylight=f=>{tod=f;const el=Math.sin((f*24-6)/12*Math.PI),az=(f*24-6)/12*Math.PI;const tg=controls.target;sun.position.set(tg.x+Math.cos(az)*45,Math.max(3,el*55),tg.z-18);sun.target.position.set(tg.x,0,tg.z);const k=Math.max(0,Math.min(1,(el+.08)/.35));sun.intensity=(.15+2.1*k)*wxDim;hemi.intensity=(.22+.7*k)*(.6+.4*wxDim);
  const day=new THREE.Color(R3.rainy?'#a9bfcf':'#bcd6ea'),dusk=new THREE.Color('#e9a46a'),nightC=new THREE.Color('#0f1a2e');const c=nightC.clone().lerp(dusk,Math.min(1,k*2)).lerp(day,Math.max(0,k*2-1));if(sky&&k>.12){sky.visible=true;scene.background=null;R3.skyUpdate(new THREE.Vector3(Math.cos(az),el,-.4).normalize());renderer.toneMappingExposure=.55+.4*k}else{if(sky)sky.visible=false;scene.background=c;renderer.toneMappingExposure=1}scene.fog=new THREE.Fog(c,(R3.fogNear||110)*(wxDim<.6?.8:1),(R3.fogNear||110)*2.4);sun.color.set(k<.5?'#ffc58a':'#fff3dc')};
 R3.season=rainy=>{R3.rainy=rainy};
 function waterTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#4f86ad';g.fillRect(0,0,128,128);g.strokeStyle='rgba(220,238,250,.4)';g.lineWidth=2;for(let i=0;i<16;i++){const y=(i*37)%128,x=(i*53)%128;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+10,y-4,x+20,y);g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);t.colorSpace=THREE.SRGBColorSpace;return t}
 /* ---------- Realisme: tekstur prosedural, langit fisik, air berpantul, hutan tropis (three.js addons, MIT) ---------- */
 const TX3={};function ctex(key,size,draw,rep){if(TX3[key])return TX3[key];const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep)t.repeat.set(rep,rep);return TX3[key]=t}
 const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
 const speck=(g,n,cols,rmin,rmax)=>{for(let i=0;i<n;i++){g.fillStyle=cols[Math.floor(rnd()*cols.length)];const r=rmin+rnd()*(rmax-rmin);g.beginPath();g.arc(rnd()*g.canvas.width,rnd()*g.canvas.height,r,0,7);g.fill()}};
 const T3={
  detail:()=>ctex('detail',256,(g,s)=>{g.fillStyle='#e9e9e9';g.fillRect(0,0,s,s);speck(g,2600,['#ffffff','#d2d2d2','#c4c4c4','#f6f6f6','#b8b8b8'],.6,1.8);g.strokeStyle='rgba(120,120,120,.18)';for(let i=0;i<500;i++){const x=rnd()*s,y=rnd()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*3,y-2-rnd()*4);g.stroke()}}),
  gravel:()=>ctex('gravel',256,(g,s)=>{g.fillStyle='#b59a72';g.fillRect(0,0,s,s);speck(g,1800,['#9c8360','#c9b28c','#8a7354','#d8c4a0','#7a6448'],.8,2.6)}),
  tile:()=>ctex('tile',256,(g,s)=>{g.fillStyle='#8f3f2a';g.fillRect(0,0,s,s);const rh=s/8,cw=s/8;for(let r=0;r<8;r++)for(let c=0;c<9;c++){const x=c*cw-(r%2)*cw/2,y=r*rh;const gr=g.createLinearGradient(x,0,x+cw,0);gr.addColorStop(0,'#7a3322');gr.addColorStop(.5,['#b5583a','#a94f33','#c0623f'][(r+c)%3]);gr.addColorStop(1,'#6c2c1d');g.fillStyle=gr;g.fillRect(x+1,y,cw-2,rh-2);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x,y+rh-3,cw,3)}},3),
  thatch:()=>ctex('thatch',256,(g,s)=>{g.fillStyle='#a88a4c';g.fillRect(0,0,s,s);for(let i=0;i<2200;i++){g.strokeStyle=['#c9a961','#8e7238','#b3944f','#dcc07a','#7a5f2c'][i%5];g.lineWidth=.7+rnd();const x=rnd()*s,y=rnd()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*4,y+10+rnd()*14);g.stroke()}},2),
  ijuk:()=>ctex('ijuk',256,(g,s)=>{g.fillStyle='#24211d';g.fillRect(0,0,s,s);for(let i=0;i<2600;i++){g.strokeStyle=['#3a352e','#151311','#4a433a','#2d2924'][i%4];g.lineWidth=.6+rnd()*.8;const x=rnd()*s,y=rnd()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*3,y+12+rnd()*16);g.stroke()}},2),
  wood:()=>ctex('wood',256,(g,s)=>{const n=8;for(let i=0;i<n;i++){g.fillStyle=['#7a5233','#6c4829','#86603d','#714c2e'][i%4];g.fillRect(0,i*s/n,s,s/n);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,i*s/n,s,2);g.strokeStyle='rgba(40,25,10,.25)';for(let k=0;k<6;k++){const y=i*s/n+4+rnd()*(s/n-8);g.beginPath();g.moveTo(0,y);g.bezierCurveTo(s/3,y+(rnd()-.5)*6,2*s/3,y+(rnd()-.5)*6,s,y);g.stroke()}}},1),
  brick:()=>ctex('brick',256,(g,s)=>{g.fillStyle='#d8c8b0';g.fillRect(0,0,s,s);const bh=s/12,bw=s/5;for(let r=0;r<12;r++)for(let c=-1;c<6;c++){g.fillStyle=['#b0563c','#a24c34','#bb6244','#9a4630'][(r*3+c)&3];g.fillRect(c*bw+(r%2)*bw/2+1.5,r*bh+1.5,bw-3,bh-3)}},2),
  plaster:()=>ctex('plaster',256,(g,s)=>{g.fillStyle='#efe8da';g.fillRect(0,0,s,s);speck(g,900,['rgba(0,0,0,.05)','rgba(255,255,255,.4)','rgba(120,100,70,.06)'],1,4);const gr=g.createLinearGradient(0,s*.75,0,s);gr.addColorStop(0,'rgba(90,70,40,0)');gr.addColorStop(1,'rgba(90,70,40,.22)');g.fillStyle=gr;g.fillRect(0,0,s,s)},1),
  gedek:()=>ctex('gedek',256,(g,s)=>{const n=16,w=s/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){g.fillStyle=(x+y)%2?'#c9ab70':'#b3934f';g.fillRect(x*w,y*w,w,w);g.fillStyle='rgba(0,0,0,.15)';(x+y)%2?g.fillRect(x*w,y*w,w,1.5):g.fillRect(x*w,y*w,1.5,w)}},1),
  leaf:()=>ctex('leaf',128,(g,s)=>{g.clearRect(0,0,s,s);g.fillStyle='#3f7d35';g.beginPath();g.moveTo(s/2,0);g.quadraticCurveTo(s,s*.45,s/2,s);g.quadraticCurveTo(0,s*.45,s/2,0);g.fill();g.strokeStyle='#2c5a26';g.lineWidth=2;g.beginPath();g.moveTo(s/2,0);g.lineTo(s/2,s);g.stroke();g.strokeStyle='rgba(30,70,25,.6)';g.lineWidth=1;for(let i=1;i<10;i++){g.beginPath();g.moveTo(s/2,i*s/10);g.lineTo(s*.12,i*s/10-8);g.moveTo(s/2,i*s/10);g.lineTo(s*.88,i*s/10-8);g.stroke()}}),
  waterN:()=>{if(TX3.wn)return TX3.wn;const s=256,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d'),im=g.createImageData(s,s),h=new Float32Array(s*s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){let v=0;for(let o=1;o<=4;o++){const f=o*2;v+=Math.sin((x/s)*Math.PI*2*f+o*1.3+Math.sin((y/s)*Math.PI*2*o)*1.5)*Math.cos((y/s)*Math.PI*2*f*.8+o)/o}h[y*s+x]=v}
   for(let y=0;y<s;y++)for(let x=0;x<s;x++){const dx=h[y*s+(x+1)%s]-h[y*s+(x-1+s)%s],dy=h[((y+1)%s)*s+x]-h[((y-1+s)%s)*s+x],i=(y*s+x)*4;im.data[i]=128+dx*40;im.data[i+1]=128+dy*40;im.data[i+2]=255;im.data[i+3]=255}g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return TX3.wn=t}};
 const TM={};const tmat=(k,c,o)=>TM[k]||(TM[k]=new THREE.MeshStandardMaterial(Object.assign({map:T3[k](),color:c||'#ffffff',roughness:.9},o||{})));
 /* langit fisik (Preetham) + peta lingkungan */
 let sky=null,pmrem=null,envRT=null,envT=0,composer=null,gtao=null,bloom=null,wmesh=null;
 R3.setupSky=()=>{if(sky)return;try{sky=new Sky();sky.scale.setScalar(4000);const u=sky.material.uniforms;u.turbidity.value=6;u.rayleigh.value=1.6;u.mieCoefficient.value=.006;u.mieDirectionalG.value=.85;scene.add(sky);pmrem=new THREE.PMREMGenerator(renderer)}catch(e){sky=null}};
 R3.skyUpdate=sp=>{if(!sky)return;sky.material.uniforms.sunPosition.value.copy(sp);if(wmesh)wmesh.material.uniforms.sunDirection.value.copy(sp).normalize();
  const nw=performance.now();if(pmrem&&nw-envT>8000){envT=nw;const sc=new THREE.Scene();sc.add(sky.clone());if(envRT)envRT.dispose();envRT=pmrem.fromScene(sc,0,.1,4000);scene.environment=envRT.texture;scene.environmentIntensity=.55}};
 /* pasca-proses: GTAO + bloom (kualitas tinggi saja) */
 R3.post=on=>{if(!on){composer=null;return}if(composer)return;try{composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));gtao=new GTAOPass(scene,camera,renderer.domElement.width,renderer.domElement.height);gtao.blendIntensity=.75;composer.addPass(gtao);
  bloom=new UnrealBloomPass(new THREE.Vector2(renderer.domElement.width,renderer.domElement.height),.35,.5,.86);composer.addPass(bloom);composer.addPass(new OutputPass());const s=new THREE.Vector2();renderer.getSize(s);composer.setSize(s.x,s.y)}catch(e){composer=null}};
 R3.render=()=>{if(composer)composer.render();else renderer.render(scene,camera)};
 R3.resizePost=(w,h)=>{if(composer)composer.setSize(w,h)};
 /* medan: warna per petak, normal halus dari peta tinggi, tekstur detail */
 function terrainNormals(H){const nrm=(a,b)=>{const xa=Math.max(0,a-1),xb=Math.min(N,a+1),ya=Math.max(0,b-1),yb=Math.min(N,b+1);const v=new THREE.Vector3(H[b][xa]-H[b][xb],2,H[ya][a]-H[yb][a]);return v.normalize()};return nrm}
 /* hutan: beberapa jenis pohon (instanced, geometri gabungan) */
 const FOREST={kinds:[],meshes:[]};
 function mergeCol(parts){const gs=parts.map(([geo,col])=>{const g=geo.toNonIndexed();const c=new THREE.Color(col),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){const v=.9+Math.random()*.2;a[i*3]=c.r*v;a[i*3+1]=c.g*v;a[i*3+2]=c.b*v}g.setAttribute('color',new THREE.BufferAttribute(a,3));g.deleteAttribute('uv');return g});return mergeGeometries(gs,false)}
 function treeKinds(clim){const K=[];const tr=(h,r)=>new THREE.CylinderGeometry(r*.7,r,h,5).translate(0,h/2,0);
  const blob=(x,y,z,r)=>new THREE.IcosahedronGeometry(r,0).translate(x,y,z);
  // pohon rindang (beringin/trembesi)
  K.push({w:clim==='temp'?.25:.4,geo:mergeCol([[tr(1.1,.09),'#5b4332'],[blob(0,1.35,0,.58),'#3d7a36'],[blob(.35,1.2,.15,.42),'#4a8a3c'],[blob(-.3,1.3,-.2,.44),'#356e30']])});
  if(clim==='trop'||clim==='tropdry'){
   // kelapa: batang melengkung + pelepah
   const pts=[];for(let i=0;i<=8;i++)pts.push(new THREE.Vector3(Math.sin(i/8*1.2)*.25,i/8*2.1,0));const curve=new THREE.CatmullRomCurve3(pts);const fr=[];for(let k=0;k<8;k++){const f=new THREE.PlaneGeometry(.18,1.05,1,3);const p=f.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)+.52;p.setY(i,y);p.setZ(i,-y*y*.35)}f.rotateX(-.35);f.rotateY(k/8*Math.PI*2);f.translate(pts[8].x,2.1,0);fr.push([f,k%2?'#3f8a3a':'#4d9a40'])}
   K.push({w:clim==='trop'?.3:.2,geo:mergeCol([[new THREE.TubeGeometry(curve,5,.055,5),'#8a7458'],...fr,[new THREE.SphereGeometry(.09,6,5).translate(pts[8].x,2.02,0),'#6b5a2a']])});
   // pisang
   const bl=[];for(let k=0;k<6;k++){const f=new THREE.PlaneGeometry(.32,.9,1,3);const p=f.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)+.45;p.setY(i,y);p.setZ(i,-y*y*.25)}f.rotateX(-.6);f.rotateY(k/6*Math.PI*2+.3);f.translate(0,.75,0);bl.push([f,k%2?'#5aa847':'#4b9a3c'])}
   K.push({w:.18,geo:mergeCol([[tr(.8,.07),'#7f8f4a'],...bl])});
   // rumpun bambu
   const bb=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2,r=.12+(k%3)*.05,h=1.6+(k%4)*.35;const c=new THREE.CylinderGeometry(.025,.03,h,4).translate(0,h/2,0);c.rotateZ((Math.cos(a))*.12);c.rotateX(Math.sin(a)*.12);c.translate(Math.cos(a)*r,0,Math.sin(a)*r);bb.push([c,k%2?'#7b9a3c':'#6a8a34']);bb.push([new THREE.IcosahedronGeometry(.2,0).scale(1,1.6,1).translate(Math.cos(a)*(r+.2),h-.1,Math.sin(a)*(r+.2)),'#5f9a3e'])}
   K.push({w:.12,geo:mergeCol(bb)})}
  if(clim==='temp'||clim==='sub'){K.push({w:.45,geo:mergeCol([[tr(.5,.07),'#5b4332'],[new THREE.ConeGeometry(.5,.9,8).translate(0,.85,0),'#2f5a34'],[new THREE.ConeGeometry(.4,.75,8).translate(0,1.3,0),'#356638'],[new THREE.ConeGeometry(.28,.6,8).translate(0,1.7,0),'#3b7040']])})}
  if(clim==='tropdry')K.push({w:.2,geo:mergeCol([[tr(1,.07),'#6b5236'],[new THREE.CylinderGeometry(.7,.55,.22,10).translate(0,1.1,0),'#6f8a3a']])});
  const tot=K.reduce((a,k)=>a+k.w,0);let acc=0;K.forEach(k=>{acc+=k.w/tot;k.cum=acc});return K}
 function forestPts(){const P=[],o=S.own,lowQ=SET.q==='low';for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='F'){const near=x>=o.x0-10&&x<o.x1+10&&y>=o.y0-10&&y<o.y1+10;if(!near&&(x+y)%2)continue;const n=near&&!lowQ?1+Math.floor(hash2(x,y,9)*2):1;for(let i=0;i<n;i++)P.push([x+.15+hash2(x,y,i+20)*.7,y+.15+hash2(x,y,i+40)*.7,.65+hash2(x,y,i)*.6,hash2(x,y,i+60),hash2(x,y,i+80)*6.28,x,y])}return P}
 R3.forest=()=>{FOREST.meshes.forEach(m=>{root.remove(m);m.dispose()});FOREST.meshes=[];if(!FOREST.kinds.length||FOREST.clim!==S.loc.climate){FOREST.kinds=treeKinds(S.loc.climate);FOREST.clim=S.loc.climate}
  const P=forestPts(),by=FOREST.kinds.map(()=>[]);P.forEach(p=>{let k=FOREST.kinds.findIndex(q=>p[3]<=q.cum);if(k<0)k=0;if(FOREST.kinds.length>3&&k===3&&!nearWater(p[5],p[6],3))k=0;by[k].push(p)});
  const o=new THREE.Object3D(),mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,side:THREE.DoubleSide});
  by.forEach((list,k)=>{if(!list.length)return;const m=new THREE.InstancedMesh(FOREST.kinds[k].geo,mat,list.length);list.forEach((p,i)=>{o.position.set(p[0],R3.hAt(p[0],p[1])-.02,p[1]);o.rotation.set(0,p[4],0);o.scale.setScalar(p[2]);o.updateMatrix();m.setMatrixAt(i,o.matrix)});m.castShadow=true;m.receiveShadow=true;root.add(m);FOREST.meshes.push(m)})};
 R3.world=()=>{R3.lifeReset();root.clear();bmeshes={};const H=genWorld(S.seed).H;R3.H=H;
  // medan: warna per petak, normal halus, tekstur detail
  const nrm=terrainNormals(H);const pos=[],col=[],nor=[],uv=[],c=new THREE.Color();for(let y=0;y<N;y++)for(let x=0;x<N;x++){tcol(c,x,y);
   const p=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]];[[0,2,1],[0,3,2]].forEach(tr=>tr.forEach(i=>{const [a,b]=p[i];pos.push(a,H[b][a],b);const n=nrm(a,b);nor.push(n.x,n.y,n.z);uv.push(a/2.5,b/2.5);col.push(c.r,c.g,c.b)}))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  terrain=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,map:T3.detail(),roughness:.97}));terrain.receiveShadow=true;root.add(terrain);
  const skirt=new THREE.Mesh(new THREE.BoxGeometry(N,4,N),mat('#5b4a33'));skirt.position.set(N/2,-2.05,N/2);root.add(skirt);
  {const wp=[],wu=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='W'){const q=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]];[[0,1,2],[0,2,3]].forEach(tr=>tr.forEach(i=>{wp.push(q[i][0],-q[i][1],0);wu.push(q[i][0]/5,q[i][1]/5)}))}
   const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(wu,2));wg.computeVertexNormals();wmesh=null;
   if(R3.hiQ&&wp.length){try{water=new Water(wg,{textureWidth:512,textureHeight:512,waterNormals:T3.waterN(),sunDirection:new THREE.Vector3(.3,1,.2).normalize(),sunColor:0xffffff,waterColor:0x2f5d6e,distortionScale:2.2,fog:true});water.material.uniforms.size.value=6;wmesh=water}catch(e){water=null}}
   if(!wmesh){const wt=waterTex();wt.repeat.set(1,1);water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({map:wt,transparent:true,opacity:.88,roughness:.08,metalness:.2,envMapIntensity:1.2}))}
   water.rotation.x=-Math.PI/2;water.position.y=.32;root.add(water)}
  R3.forest();
  // jalan setapak
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(L(x,y)==='P'){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.02,1.02),tmat('gravel'));m.rotation.x=-Math.PI/2;m.position.set(x+.5,R3.hAt(x+.5,y+.5)+.04,y+.5);m.receiveShadow=true;root.add(m)}
  S.b.forEach(b=>R3.addB(b));R3.border();const oc=ownC();R3.focus(oc[0],oc[1],34);R3.villagers()};
 /* ---------- bangunan prosedural ---------- */
 function B(g,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(box,m);o.scale.set(sx,sy,sz);o.position.set(x,y+sy/2,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function hipRoof(w,d,h,m){const g=new THREE.ConeGeometry(.7071,1,4,1);g.rotateY(Math.PI/4);const o=new THREE.Mesh(g,m);o.scale.set(w*1.06,h,d*1.06);o.castShadow=true;return o}
 function gable(w,d,h,m){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(0,h);sh.lineTo(w/2,0);sh.lineTo(-w/2,0);const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);const o=new THREE.Mesh(g,m);o.castShadow=true;return o}
 /** atap pelana melengkung dengan ujung naik (gonjong/tongkonan) */
 function saddle(len,wid,h,horn,m){const seg=24,sw=6,pos=[],idx=[];for(let i=0;i<=seg;i++){const u=i/seg*2-1;for(let j=0;j<=sw;j++){const v=j/sw*2-1,y=h*(1-Math.abs(v))+horn*Math.pow(Math.abs(u),3)*(1-.6*Math.abs(v));pos.push(u*len/2*(1+.25*Math.pow(Math.abs(u),4)),y,v*wid/2)}}
  for(let i=0;i<seg;i++)for(let j=0;j<sw;j++){const a=i*(sw+1)+j,b=a+sw+1;idx.push(a,b,a+1,b,b+1,a+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.material.side=THREE.DoubleSide;o.castShadow=true;return o}
 function house(style){const g=new THREE.Group(),wood=tmat('wood'),dark=tmat('wood','#6d5a4c'),plaster=tmat('plaster'),tile=tmat('tile'),thatch=tmat('thatch'),brick=tmat('brick'),ijuk=tmat('ijuk'),gedek=tmat('gedek'),stone=mat('#8f8a80'),glass=mat('#2c3a44',{roughness:.2,metalness:.3}),white=mat('#f6f3ec');
  const win=(x,y,z,ry,w,h,sh)=>{const q=new THREE.Group();const fr=new THREE.Mesh(box,dark);fr.scale.set(w+.04,h+.04,.02);q.add(fr);const gl=new THREE.Mesh(box,glass);gl.scale.set(w,h,.025);q.add(gl);const bar=new THREE.Mesh(box,dark);bar.scale.set(.012,h,.03);q.add(bar);
   if(sh){[-1,1].forEach(s=>{const p=new THREE.Mesh(box,mat(sh));p.scale.set(w/2,h,.015);p.position.set(s*(w*.75),0,.01);q.add(p)})}q.position.set(x,y,z);q.rotation.y=ry||0;g.add(q)};
  const door=(x,z,ry,h,c)=>{const q=new THREE.Group();const d=new THREE.Mesh(box,c||dark);d.scale.set(.15,h||.3,.025);d.position.y=(h||.3)/2;q.add(d);const k=new THREE.Mesh(new THREE.SphereGeometry(.01,6,4),mat('#c8a14b',{metalness:.7}));k.position.set(.05,(h||.3)*.5,.016);q.add(k);q.position.set(x,0,z);q.rotation.y=ry||0;g.add(q);return q};
  const posts=(pts,h,y0,r,m)=>pts.forEach(([a,b])=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.1,h,8),m||dark);c.position.set(a,y0+h/2,b);c.castShadow=true;g.add(c)});
  const umpak=(pts,y)=>pts.forEach(([a,b])=>{const u=new THREE.Mesh(new THREE.CylinderGeometry(.03,.045,.05,6),stone);u.position.set(a,(y||0)+.025,b);g.add(u)});
  const stair=(z,h,n)=>{for(let i=0;i<n;i++){const st=new THREE.Mesh(box,wood);st.scale.set(.22,.025,.07);st.position.set(0,h*(i+1)/(n+1),z+(n-i)*.06);g.add(st)}[-1,1].forEach(s=>{const r=new THREE.Mesh(box,dark);r.scale.set(.02,.02,n*.09);r.position.set(s*.11,h/2,z+n*.035);r.rotation.x=Math.atan2(h,n*.06);g.add(r)})};
  switch(style){
   case 'joglo':{B(g,stone,0,0,0,1,.05,1);B(g,tmat('wood','#c6a27e'),0,.05,-.08,.74,.45,.6);door(0,.225,0,.32,wood);win(-.22,.27,.226,0,.12,.14);win(.22,.27,.226,0,.12,.14);
    posts([[-.42,.42],[-.14,.42],[.14,.42],[.42,.42],[-.42,-.42],[.42,-.42]],.47,.05,.025);umpak([[-.42,.42],[-.14,.42],[.14,.42],[.42,.42]],.05);
    const r1=hipRoof(1.18,1.18,.18,tile);r1.position.y=.52+.09;g.add(r1);const r2=hipRoof(.78,.78,.2,tile);r2.position.y=.7+.1;g.add(r2);const r3=hipRoof(.46,.46,.42,tile);r3.position.y=.88+.21;g.add(r3);B(g,mat('#d4a32a',{metalness:.5}),0,1.28,0,.03,.08,.03);break}
   case 'panggung':{posts([[-.32,-.28],[0,-.28],[.32,-.28],[-.32,.28],[0,.28],[.32,.28]],.4,0,.03);umpak([[-.32,-.28],[.32,-.28],[-.32,.28],[.32,.28]]);B(g,wood,0,.4,0,.82,.05,.74);B(g,gedek,0,.45,-.05,.74,.38,.58);
    door(0,.24,0,.3,wood).position.y=.45;win(-.24,.66,.241,0,.12,.13,'#6f4b31');win(.24,.66,.241,0,.12,.13,'#6f4b31');stair(.28,.42,4);B(g,dark,0,.44,.3,.82,.025,.12);
    const r=gable(1.0,.95,.42,thatch);r.position.y=.83;r.rotation.y=Math.PI/2;g.add(r);break}
   case 'gadang':{posts([[-.38,-.24],[-.13,-.24],[.13,-.24],[.38,-.24],[-.38,.24],[.38,.24]],.3,0,.03);umpak([[-.38,-.24],[.38,-.24],[-.38,.24],[.38,.24]]);
    B(g,tmat('wood','#b06a3e'),0,.3,0,.95,.42,.6);for(let i=-3;i<=3;i++)win(i*.12,.5,.301,0,.07,.11,'#2f2a26');B(g,mat('#d4a32a',{metalness:.4}),0,.66,.302,.95,.03,.01);B(g,mat('#8a2d1f'),0,.32,.302,.95,.03,.01);
    const r=saddle(1.25,.82,.28,.62,ijuk);r.position.y=.72;g.add(r);const r2=saddle(.6,.5,.18,.35,ijuk);r2.position.set(0,.9,.0);r2.rotation.y=Math.PI/2;g.add(r2);stair(.32,.32,3);break}
   case 'tongkonan':{posts([[-.24,-.2],[0,-.2],[.24,-.2],[-.24,.2],[0,.2],[.24,.2]],.36,0,.035);B(g,tmat('wood','#7a3424'),0,.36,0,.58,.34,.48);
    const tor=ctex('toraja',128,(q,s)=>{q.fillStyle='#7a2a1c';q.fillRect(0,0,s,s);q.strokeStyle='#f2e6c8';q.lineWidth=3;for(let i=0;i<4;i++){q.beginPath();q.arc(s/4+(i%2)*s/2,s/4+Math.floor(i/2)*s/2,s/6,0,7);q.stroke();q.beginPath();q.arc(s/4+(i%2)*s/2,s/4+Math.floor(i/2)*s/2,s/12,0,7);q.stroke()}q.fillStyle='#1b1b1b';q.fillRect(0,s*.46,s,s*.08);q.fillStyle='#e0a526';q.fillRect(0,s*.48,s,s*.03)},2);
    const pn=new THREE.Mesh(new THREE.PlaneGeometry(.58,.34),new THREE.MeshStandardMaterial({map:tor}));pn.position.set(0,.53,.241);g.add(pn);
    const r=saddle(1.45,.72,.22,.55,ijuk);r.position.y=.7;r.rotation.y=Math.PI/2;g.add(r);
    const hn=new THREE.Mesh(new THREE.TorusGeometry(.09,.012,6,12,Math.PI),mat('#efe6d6'));hn.position.set(0,.78,.3);g.add(hn);posts([[0,.27]],.75,0,.02);break}
   case 'bali':{B(g,stone,0,0,0,.85,.08,.85);B(g,brick,0,.08,-.04,.7,.4,.62);B(g,mat('#d8cbb0'),0,.08,.275,.22,.4,.02);door(0,.29,0,.28,mat('#8a5a2b'));win(-.24,.3,.276,0,.1,.12,'#8a5a2b');win(.24,.3,.276,0,.1,.12,'#8a5a2b');
    posts([[-.38,.38],[.38,.38]],.42,.08,.025,mat('#8a5a2b'));const r=hipRoof(1.08,1.08,.56,thatch);r.position.y=.5+.28;g.add(r);B(g,mat('#d8cbb0'),0,.98,0,.05,.12,.05);break}
   case 'honai':{const c=new THREE.Mesh(new THREE.CylinderGeometry(.38,.4,.4,16),tmat('wood','#9c8a74'));c.position.y=.2;c.castShadow=true;g.add(c);const d=new THREE.Mesh(new THREE.SphereGeometry(.5,16,10,0,Math.PI*2,0,Math.PI/2),thatch);d.position.y=.36;d.scale.y=.95;d.castShadow=true;g.add(d);door(0,.385,0,.22,dark);break}
   case 'kolonial':{B(g,stone,0,0,0,.95,.08,.85);B(g,plaster,0,.08,-.06,.82,.52,.62);[-.36,-.12,.12,.36].forEach(a=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.52,10),white);c.position.set(a,.34,.36);c.castShadow=true;g.add(c)});B(g,white,0,.6,.36,.86,.04,.2);
    door(0,.256,0,.36,mat('#2f5a3a'));[-.26,.26].forEach(a=>win(a,.34,.256,0,.12,.22,'#2f5a3a'));[-.2,.2].forEach(a=>win(.415,.34,a,Math.PI/2,.12,.2,'#2f5a3a'));const r=hipRoof(1.05,.98,.55,tile);r.position.y=.62+.27;g.add(r);break}
   case 'modern':{B(g,plaster,0,0,0,.85,.45,.75);B(g,mat('#a9cbe0',{metalness:.4,roughness:.08}),0,.06,.376,.6,.32,.01);B(g,tmat('wood','#c9a27e'),-.32,.0,.376,.12,.4,.012);B(g,mat('#d9d9d6'),.1,.45,-.05,.75,.4,.55);B(g,mat('#a9cbe0',{metalness:.4,roughness:.08}),.1,.52,.226,.6,.26,.01);B(g,mat('#3a3a3a'),.1,.85,-.05,.84,.04,.64);B(g,mat('#3a3a3a'),0,.45,.0,.9,.03,.82);break}
   case 'machiya':{B(g,stone,0,0,0,.85,.04,.8);B(g,tmat('wood','#5a4434'),0,.04,0,.8,.5,.75);for(let i=-3;i<=3;i++)B(g,mat('#3e2d22'),i*.1,.08,.38,.025,.4,.02);B(g,plaster,0,.55,0,.78,.2,.72);win(0,.64,.361,0,.3,.1);const r=gable(.98,.92,.32,mat('#434a52',{roughness:.6}));r.position.y=.75;g.add(r);const r0=gable(.98,.2,.12,mat('#434a52'));r0.position.set(0,.52,.42);g.add(r0);break}
   case 'eropa':{B(g,brick,0,0,0,.7,.75,.75);[[.18,.3],[.18,-.18],[.5,.3],[.5,-.18]].forEach(([y,x])=>win(x,y+.08,.376,0,.13,.18));door(.0,.376,0,.32,mat('#2f3e5a'));const r=gable(.82,.85,.6,mat('#3c3f45',{roughness:.6}));r.position.y=.75;r.rotation.y=Math.PI/2;g.add(r);B(g,brick,.22,.9,.1,.1,.4,.1);break}
   default:{B(g,stone,0,0,0,.92,.05,.86);B(g,plaster,0,.05,-.04,.78,.45,.62);door(0,.272,0,.32,wood);win(-.24,.28,.272,0,.12,.14,'#6f4b31');win(.24,.28,.272,0,.12,.14,'#6f4b31');win(.392,.28,-.04,Math.PI/2,.12,.14,'#6f4b31');
    posts([[-.38,.4],[.38,.4]],.42,.05,.022);umpak([[-.38,.4],[.38,.4]],.05);const r=hipRoof(1.08,1.0,.42,tile);r.position.y=.5+.21;g.add(r)}}
  return g}
 function scaffold(b){const g=new THREE.Group(),bam=mat('#c9ab70'),net=new THREE.MeshStandardMaterial({color:'#3f8f5a',transparent:true,opacity:.45,side:THREE.DoubleSide});const w=b.w*.9,d=b.h*.9,hh=.7;
  [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z])=>B(g,bam,x,0,z,.035,hh,.035));[.25,.5].forEach(y=>{B(g,bam,0,y,-d/2,w,.025,.025);B(g,bam,0,y,d/2,w,.025,.025);B(g,bam,-w/2,y,0,.025,.025,d);B(g,bam,w/2,y,0,.025,.025,d)});
  const n=new THREE.Mesh(new THREE.BoxGeometry(w,hh*.8,d),net);n.position.y=hh*.45;g.add(n);B(g,tmat('wood'),.1,0,.1,.3,.08,.2);const bar=new THREE.Mesh(new THREE.PlaneGeometry(.9,.08),new THREE.MeshBasicMaterial({color:'#e0a526'}));bar.position.set(0,hh+.25,0);g.add(bar);g.userData.bar=bar;
  const cx=b.x+b.w/2,cz=b.y+b.h/2;g.position.set(cx,R3.hAt(cx,cz),cz);const T=BT[b.t];bar.scale.x=Math.max(.05,1-b.bt/(T.days||1));return g}
 R3.progress=b=>{const g=bmeshes[b.id];if(g&&g.userData.bar){const T=BT[b.t];g.userData.bar.scale.x=Math.max(.05,1-b.bt/(T.days||1))}};
 /* cuaca: hujan, salju, kabut */
 let prec=null,precK='',wxDim=1;R3.weather=(wx,sea)=>{if(prec){scene.remove(prec);prec.geometry.dispose();prec=null}const rain=['gerimis','hujan','badai'].includes(wx),snow=wx==='salju';precK=rain?'rain':snow?'snow':'';
  wxDim={cerah:1,panas:1.1,berawan:.75,gerimis:.65,hujan:.5,badai:.35,kabut:.6,salju:.6}[wx]||1;R3.fogNear=wx==='kabut'?25:wx==='badai'?50:110;
  if(precK){const n=rain?(wx==='badai'?3500:wx==='hujan'?2200:900):1600,pos=new Float32Array(n*(rain?6:3));for(let i=0;i<n;i++){const x=(Math.random()-.5)*60,y=Math.random()*25,z=(Math.random()-.5)*60;if(rain){pos.set([x,y,z,x+.05,y-.5,z],i*6)}else pos.set([x,y,z],i*3)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));prec=rain?new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#bcd0e0',transparent:true,opacity:.55})):new THREE.Points(g,new THREE.PointsMaterial({color:'#ffffff',size:.12,transparent:true,opacity:.9}));prec.frustumCulled=false;scene.add(prec)}
  // musim: warna pohon & tanah
  FOREST.meshes.forEach(m=>{m.material.color.set(sea==='gugur'?'#e0a060':sea==='dingin'&&S.loc.climate==='temp'?'#d9e4e8':sea==='kemarau'?'#d9cf9a':'#ffffff')});if(terrain)terrain.material.color.set(sea==='dingin'&&S.loc.climate==='temp'&&wx==='salju'?'#f2f4f6':sea==='kemarau'&&S.loc.climate!=='temp'?'#efe2b8':'#ffffff')};
 R3.precStep=dt=>{if(!prec)return;const a=prec.geometry.attributes.position,tg=controls.target,sp=precK==='rain'?22:2.2;for(let i=0;i<a.count;i++){let y=a.getY(i)-sp*dt;if(y<0)y+=25;a.setY(i,y);if(precK==='snow')a.setX(i,a.getX(i)+Math.sin(y+i)*dt*.3)}a.needsUpdate=true;prec.position.set(tg.x,0,tg.z)};
 function make(b){const g=new THREE.Group();const s=b.s||'jawa';
  if(b.t==='house')g.add(house(s));
  else if(b.t==='field'){const wet=S.loc.climate==='trop'||S.loc.climate==='sub';const sea=S._sea||'';const ripe=sea==='gugur'||sea==='kemarau';
   const base=new THREE.Mesh(new THREE.PlaneGeometry(1.94,1.94),mat(b.dmg?'#7a6a45':wet?'#5f7d5a':'#8a7a4a',{roughness:wet?.25:.95,metalness:wet?.15:0}));base.rotation.x=-Math.PI/2;base.position.set(.5,.045,.5);base.receiveShadow=true;g.add(base);
   const dyke=mat('#7a6a48');[[.5,-.47,1.95,.06],[.5,1.47,1.95,.06]].forEach(([x,z,w,d])=>B(g,dyke,x,.04,z,w,.05,d));[[-.47,.5],[1.47,.5],[.5,.5]].forEach(([x,z])=>B(g,dyke,x,.04,z,.06,.05,1.95));
   const tuft=new THREE.ConeGeometry(.035,.16,4);const tm=mat(b.dmg?'#8a7b4a':ripe?'#c9b44a':'#7fb03a');const n=Math.round(36*(.7+.3*(1-(b.dmg?1:0))));const im=new THREE.InstancedMesh(tuft,tm,n);const o=new THREE.Object3D();let k=0;
   for(let a=0;a<6;a++)for(let c=0;c<6;c++){if(k>=n)break;o.position.set(-.33+a*.33+(hash2(a,c,b.id)-.5)*.06,.12,-.33+c*.33+(hash2(c,a,b.id)-.5)*.06);o.rotation.y=hash2(a,c,7)*3;o.updateMatrix();im.setMatrixAt(k++,o.matrix)}im.castShadow=true;g.add(im)}
  else if(b.t==='well'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.35,12),mat('#9a9a92'));c.position.y=.17;c.castShadow=true;g.add(c);B(g,mat('#6b4f3a'),-.2,0,0,.05,.7,.05);B(g,mat('#6b4f3a'),.2,0,0,.05,.7,.05);B(g,mat('#6b4f3a'),0,.7,0,.5,.05,.05)}
  else if(b.t==='barn'){[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,c])=>B(g,mat('#4a3322'),a,0,c,.08,.4,.08));B(g,mat('#8a6a45'),0,.4,0,.7,.5,.7);const r=hipRoof(.95,.95,.5,mat('#b89a5a'));r.position.y=.9+.25;g.add(r)}
  else if(b.t==='pond'){const p=new THREE.Mesh(new THREE.CircleGeometry(.42,20),mat('#4f86ad',{roughness:.1}));p.rotation.x=-Math.PI/2;p.position.y=.04;g.add(p)}
  else if(b.t==='tree'){B(g,mat('#6b4f3a'),0,0,0,.1,.6,.1);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),mat('#4f8f4a'));c.position.y=.85;c.castShadow=true;g.add(c)}
  else if(b.t==='hall'){const pend=new THREE.Group();[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6],[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,c])=>B(pend,mat('#6b4f3a'),a,0,c,.09,.8,.09));B(pend,mat('#d8cbb0'),0,0,0,1.6,.1,1.6);
    const r=s==='gadang'||s==='tongkonan'?saddle(2,1.4,.4,.8,mat('#3b3530')):hipRoof(1.9,1.9,.5,mat('#9c4a33'));r.position.y=.8+(r.geometry.type==='ConeGeometry'?.25:0);pend.add(r);const r2=hipRoof(.9,.9,.5,mat('#9c4a33'));r2.position.y=1.3;if(!(s==='gadang'||s==='tongkonan'))pend.add(r2);pend.position.set(.5,0,.5);g.add(pend)}
  else if(b.t==='worship'){B(g,mat('#f2efe7'),0,0,0,.8,.55,.8);const r=hipRoof(.95,.95,.35,mat('#2f6f4f'));r.position.y=.55+.17;g.add(r);const r2=hipRoof(.55,.55,.35,mat('#2f6f4f'));r2.position.y=.9+.17;g.add(r2)}
  else if(b.t==='rt'){const P=new THREE.Group();[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,c])=>B(P,tmat('wood'),a,0,c,.05,.42,.05));B(P,mat('#8f8a80'),0,0,0,.8,.05,.8);const r=hipRoof(.95,.95,.32,tmat('tile'));r.position.y=.42+.16;P.add(r);B(P,tmat('wood'),0,.05,0,.5,.12,.2);g.add(P)}
  else if(b.t==='taman'){B(g,mat('#c8b48a'),0,0,0,.9,.02,.9);[[-.25,0],[.05,0]].forEach(([a])=>{B(g,mat('#c0392b'),a,0,-.25,.03,.42,.03);B(g,mat('#c0392b'),a+.25,0,-.25,.03,.42,.03)});B(g,mat('#c0392b'),-.12,.42,-.25,.32,.03,.03);B(g,mat('#2f6fb0'),-.12,.18,-.25,.12,.02,.08);
   const sl=new THREE.Mesh(box,mat('#e0a526'));sl.scale.set(.14,.02,.5);sl.position.set(.25,.18,.15);sl.rotation.x=.55;sl.castShadow=true;g.add(sl);B(g,mat('#2f8f6a'),.25,0,-.05,.14,.36,.08);const tr=new THREE.Mesh(new THREE.IcosahedronGeometry(.18,0),mat('#4f8f4a'));tr.position.set(-.3,.5,.3);g.add(tr);B(g,tmat('wood'),-.3,0,.3,.04,.32,.04)}
  else if(b.t==='kebun'){const ft=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),mat('#6f8f3a'));ft.rotation.x=-Math.PI/2;ft.position.set(.5,.04,.5);ft.receiveShadow=true;g.add(ft);const crop=(S.eco||(S.eco=ecoProfile(S))).crop;
   for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=-.2+i*.45,z=-.2+j*.45;if(crop==='kelapa'){B(g,mat('#8a7458'),x,0,z,.04,.55,.04);const c=new THREE.Mesh(new THREE.ConeGeometry(.2,.12,6),mat('#4d9a40'));c.position.set(x,.6,z);g.add(c)}else{const c=new THREE.Mesh(new THREE.IcosahedronGeometry(crop==='kopi'||crop==='teh'?.13:.16,0),mat(crop==='apel'?'#4f8f4a':crop==='teh'?'#5a9a3a':'#3f7d35'));c.position.set(x,.14,z);c.scale.y=.8;c.castShadow=true;g.add(c);if(crop==='apel'||crop==='kopi'){const f=new THREE.Mesh(new THREE.SphereGeometry(.03,5,4),mat(crop==='apel'?'#c0392b':'#8a2a1a'));f.position.set(x+.08,.18,z);g.add(f)}}}}
  else if(b.t==='bengkel'){B(g,mat('#8f8a80'),0,0,0,.85,.04,.75);[[-.38,-.32],[.38,-.32],[-.38,.32],[.38,.32]].forEach(([a,c])=>B(g,tmat('wood'),a,0,c,.04,.42,.04));B(g,tmat('gedek'),0,.04,-.33,.76,.38,.03);const r=gable(.95,.85,.25,tmat('tile'));r.position.y=.42;g.add(r);B(g,tmat('wood'),-.15,.04,.05,.35,.16,.2);B(g,mat('#b0563c'),.2,.04,.1,.12,.14,.12);B(g,mat('#d9b66a'),-.15,.2,.05,.1,.04,.1)}
  else if(b.t==='sekolah'){B(g,mat('#8f8a80'),.5,0,.5,1.9,.05,1.5);B(g,tmat('plaster'),.5,.05,.4,1.7,.45,.7);for(let i=0;i<5;i++){B(g,mat('#2c3a44',{roughness:.2}),-.15+i*.33,.2,.756,.16,.16,.01)}B(g,mat('#b84a2a'),.5,.05,.76,1.72,.08,.01);const r=hipRoof(1.9,.95,.35,tmat('tile'));r.position.set(.5,.5+.17,.4);g.add(r);
   B(g,mat('#c8c8c8',{metalness:.6}),1.25,0,1.15,.02,.9,.02);const fl=new THREE.Mesh(new THREE.PlaneGeometry(.22,.14),new THREE.MeshStandardMaterial({color:'#d32f2f',side:THREE.DoubleSide}));fl.position.set(1.37,.83,1.15);g.add(fl);const fw=new THREE.Mesh(new THREE.PlaneGeometry(.22,.07),new THREE.MeshStandardMaterial({color:'#ffffff',side:THREE.DoubleSide}));fw.position.set(1.37,.76,1.151);g.add(fw);B(g,mat('#c8b48a'),.5,0,1.15,1.6,.015,.6)}
  else if(b.t==='klinik'){B(g,mat('#8f8a80'),0,0,0,.92,.05,.85);B(g,mat('#f6f6f4'),0,.05,-.03,.8,.5,.66);B(g,mat('#2f8f6a'),0,.05,.305,.2,.32,.02);B(g,mat('#d32f2f'),0,.45,.31,.16,.05,.02);B(g,mat('#d32f2f'),0,.4,.31,.05,.15,.02);[-.25,.25].forEach(x=>B(g,mat('#2c3a44',{roughness:.2}),x,.22,.305,.14,.14,.01));const r=hipRoof(1.0,.85,.3,mat('#2f6f8f'));r.position.y=.55+.15;g.add(r)}
  else if(b.t==='kom'){B(g,mat('#8f8a80'),0,0,0,.5,.04,.5);const tw=new THREE.Group();[[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]].forEach(([a,c])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.015,.02,1.3,5),mat(S.era>=4?'#b8b8b8':'#c9ab70'));p.position.set(a*.6,.65,c*.6);p.rotation.z=-a*.15;p.rotation.x=c*.15;tw.add(p)});g.add(tw);
   if(S.era>=4){B(g,mat('#e8e8e8'),0,1.25,0,.08,.15,.08);[0,1,2].forEach(i=>{const d=new THREE.Mesh(box,mat('#f2f2f2'));d.scale.set(.03,.14,.06);d.position.set(Math.cos(i*2.1)*.08,1.18,Math.sin(i*2.1)*.08);g.add(d)})}else{const k=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.3,8),tmat('wood'));k.rotation.z=Math.PI/2;k.position.set(0,.85,0);g.add(k);const r=new THREE.Mesh(new THREE.ConeGeometry(.22,.18,4),tmat('thatch'));r.position.y=1.38;r.rotation.y=Math.PI/4;g.add(r)}}
  else if(b.t==='market'){for(let i=0;i<4;i++){const st=new THREE.Group();B(st,mat('#8a6a45'),0,0,0,.6,.45,.4);const c=new THREE.Mesh(new THREE.BoxGeometry(.7,.06,.55),mat(['#d94f3a','#e0a526','#2f8f6a','#3b6fb0'][i]));c.position.y=.7;st.add(c);st.position.set((i%2)*.9+.05,0,Math.floor(i/2)*.9+.05);g.add(st)}}
  const cx=b.x+b.w/2,cz=b.y+b.h/2;const two=['hall','market','field','kebun','sekolah'].includes(b.t);g.position.set(two?b.x+.5:cx,R3.hAt(cx,cz),two?b.y+.5:cz);if(b.r)g.rotation.y=b.r*Math.PI/2;return g}
 R3.addB=b=>{const g=b.bt>0?scaffold(b):make(b);g.userData.id=b.id;root.add(g);bmeshes[b.id]=g};
 R3.delB=id=>{const g=bmeshes[id];if(g){root.remove(g);delete bmeshes[id]}};
 R3.ghost=(x,y,w,h,ok)=>{if(x==null){ghost.visible=false;return}ghost.visible=true;ghost.scale.set(w,1,h);ghost.position.set(x+w/2,R3.hAt(x+w/2,y+h/2)+.15,y+h/2);ghost.material.color.set(ok?'#7dffb0':'#ff7d6b')};
 R3.trees=()=>{clearTimeout(R3._ft);R3._ft=setTimeout(()=>R3.forest(),120)};
 function tcol(c,x,y){const l=L(x,y);c.set(TCOL[l]||TCOL.G);if(l==='G'||l==='F'){c.offsetHSL(0,0,(hash2(x,y,3)-.5)*.06);if(S.loc.climate==='tropdry'&&l==='G')c.set('#b9ad6c')}if(!inOwn(x,y))c.lerp(new THREE.Color('#5d6a72'),.42);return c}
 R3.tileColor=(x,y)=>{const a=terrain.geometry.attributes.color,c=tcol(new THREE.Color(),x,y);const base=(y*N+x)*6;for(let i=0;i<6;i++)a.setXYZ(base+i,c.r,c.g,c.b);a.needsUpdate=true};
 let border=null;R3.border=()=>{if(border){root.remove(border);border.geometry.dispose()}const o=S.own,pts=[];const add=(x,y)=>pts.push(new THREE.Vector3(x,R3.hAt(x,y)+.25,y));
  for(let x=o.x0;x<=o.x1;x++)add(x,o.y0);for(let y=o.y0;y<=o.y1;y++)add(o.x1,y);for(let x=o.x1;x>=o.x0;x--)add(x,o.y1);for(let y=o.y1;y>=o.y0;y--)add(o.x0,y);
  border=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#ffd166'}));root.add(border)};
 R3.recolor=()=>{const c=new THREE.Color(),a=terrain.geometry.attributes.color;for(let y=0;y<N;y++)for(let x=0;x<N;x++){tcol(c,x,y);const base=(y*N+x)*6;for(let i=0;i<6;i++)a.setXYZ(base+i,c.r,c.g,c.b)}a.needsUpdate=true;R3.border()};
 R3.focus=(x,z,d)=>{controls.target.set(x,0,z);camera.position.set(x-d*.45,d*.9,z+d*.9)};
 R3.path=(x,y)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1.02,1.02),tmat('gravel'));m.rotation.x=-Math.PI/2;m.position.set(x+.5,R3.hAt(x+.5,y+.5)+.04,y+.5);m.receiveShadow=true;root.add(m)};
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
 function walkPose(p,dt,rate){p.ph+=dt*rate;const s=Math.sin(p.ph);p.legs[0].rotation.x=s*.6;p.legs[1].rotation.x=-s*.6;p.arms[0].rotation.x=-s*.5;p.arms[1].rotation.x=s*.5;p.up.rotation.x=.05;p.up.position.y=(p.uy||.2)+Math.abs(Math.cos(p.ph))*.012}
 function workPose(p,dt,kind){p.ph+=dt*4;const s=Math.sin(p.ph);p.legs[0].rotation.x=p.legs[1].rotation.x=0;
  if(kind==='hoe'){p.up.rotation.x=.45+s*.2;p.arms[0].rotation.x=p.arms[1].rotation.x=-1.1-s*.7}
  else if(kind==='chat'){p.up.rotation.x=0;p.arms[0].rotation.x=-.3-Math.max(0,Math.sin(p.ph*.7))*.8;p.arms[1].rotation.x=0;p.m.rotation.y+=Math.sin(p.ph*.3)*dt*.3}
  else if(kind==='pray'){p.up.rotation.x=.25+Math.max(0,s)*.9;p.arms[0].rotation.x=p.arms[1].rotation.x=-.4}
  else if(kind==='draw'){p.up.rotation.x=.35;p.arms[0].rotation.x=p.arms[1].rotation.x=-1+Math.abs(s)*.9}
  else if(kind==='play'){p.up.position.y=(p.uy||.2)+Math.abs(s)*.08;p.arms[0].rotation.x=p.arms[1].rotation.x=-2.6+s*.3}
  else {p.up.rotation.x=0;p.arms[0].rotation.x=p.arms[1].rotation.x=0}}
 const bOf=t=>S.b.filter(b=>b.t===t);
 function spotIn(b,out){if(out){const sd=Math.floor(Math.random()*4),u=Math.random();return sd===0?[b.x+u*b.w,b.y-.25]:sd===1?[b.x+u*b.w,b.y+b.h+.25]:sd===2?[b.x-.25,b.y+u*b.h]:[b.x+b.w+.25,b.y+u*b.h]}return [b.x+.15+Math.random()*(b.w-.3),b.y+.15+Math.random()*(b.h-.3)]}
 function forestEdge(){const o=S.own;for(let i=0;i<40;i++){const x=o.x0+Math.floor(Math.random()*(o.x1-o.x0)),y=o.y0+Math.floor(Math.random()*(o.y1-o.y0));if(L(x,y)==='F'){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(inside(X,Y)&&L(X,Y)==='G')return [x+.5+dx*.4,y+.5+dy*.4]}}}return null}
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
  m.position.y=R3.hAt(m.position.x,m.position.z);if(p.mk)p.mk.position.y=2.55+Math.sin(clock.elapsedTime*3)*.1}}
 let spd=()=>1;R3.speedFn=f=>{spd=f};
 R3.villagers=()=>{if(!S)return;const houses=bOf('house');const cf=SET.crowd;const adults=Math.min(Math.round(48*cf),Math.max(2,S.kk*2)),kids=Math.min(Math.round(18*cf),Math.floor(S.kk*.7));const want=adults+kids;const P=LIFE.people;
  while(P.filter(q=>!q.leader).length>want){let i=P.length-1;while(i>=0&&P[i].leader)i--;const p=P.splice(i,1)[0];root.remove(p.m)}
  while(P.filter(q=>!q.leader).length<want){const child=P.length>=adults;const p=mkPerson(child,child?null:pick(['caping','peci','kerudung',null,null]));p.child=child;const h=houses.length?houses[P.length%houses.length]:null;p.home=h?h.id:0;
   const s=h?spotIn(h,true):[N/2+Math.random()*2,N/2+Math.random()*2];p.m.position.set(s[0],R3.hAt(s[0],s[1]),s[1]);root.add(p.m);P.push(p);plan(p)}
  P.forEach((p,i)=>{if(!S.b.some(b=>b.id===p.home)&&houses.length)p.home=houses[i%houses.length].id});
  if(!LIFE.leader&&S.char.ava){try{const L1=buildAvatar3D(S.char.ava);L1.m.scale.setScalar(.3);L1.uy=.78;const mk=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,4),new THREE.MeshBasicMaterial({color:'#ffd166'}));mk.rotation.x=Math.PI;mk.position.y=2.55;L1.m.add(mk);L1.mk=mk;
   const oc=ownC();L1.m.position.set(oc[0]+.5,R3.hAt(oc[0],oc[1]),oc[1]+.5);root.add(L1.m);L1.home=houses[0]?houses[0].id:0;L1.leader=1;LIFE.leader=L1;P.push(L1);plan(L1)}catch(e){}}
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
    if(v.kind==='truk'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=v.a[0]+a,Y=v.a[1]+b;return inside(X,Y)&&occ[Y][X]&&(S.b.find(q=>q.id===occ[Y][X])||{}).t==='house'})){v.stop=2.2;if(Math.random()<.5)Snd.play('truck')}}
   const ax=v.a[0]+.5,az=v.a[1]+.5,bx=v.b[0]+.5,bz=v.b[1]+.5,dx=bx-ax,dz=bz-az,dl=Math.hypot(dx,dz)||1,nx=-dz/dl*.2,nz=dx/dl*.2;
   const x=ax+dx*v.u+nx,z=az+dz*v.u+nz;v.m.position.set(x,R3.hAt(x,z)+.03,z);if(dl>.1){const target=Math.atan2(dx,dz);let d=target-v.m.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));v.m.rotation.y+=d*Math.min(1,dt*8)}
   v.ws.forEach(w=>{w.rotation.x+=dt*v.speed*12});if(v.rider){if(v.kind==='gerobak')walkPose(v.rider,dt,8);else{v.rider.ph+=dt*(v.kind==='sepeda'?10:0);v.rider.legs[0].rotation.x=-1.3+Math.sin(v.rider.ph)*.5;v.rider.legs[1].rotation.x=-1.3-Math.sin(v.rider.ph)*.5;v.rider.arms[0].rotation.x=v.rider.arms[1].rotation.x=-1.1;v.rider.up.rotation.x=.25}}
   if(v.m.userData.beacon)v.m.userData.beacon.visible=true}}
 /* ---------- burung, asap dapur, cahaya ---------- */
 function stepAmbient(dt){const h=hour(),night=isNight();
  if(!LIFE.birds.length){for(let i=0;i<7;i++){const g=new THREE.Group();const wm=mat('#2b2b2b',{side:THREE.DoubleSide});const wg=new THREE.PlaneGeometry(.22,.07);const l=new THREE.Mesh(wg,wm),r=new THREE.Mesh(wg,wm);l.position.x=-.11;r.position.x=.11;const pl=new THREE.Group(),pr=new THREE.Group();pl.add(l);pr.add(r);g.add(pl,pr);g.rotation.order='YXZ';root.add(g);LIFE.birds.push({m:g,pl,pr,a:i*.5,r:5+i*.4,cx:ownC()[0],cz:ownC()[1],y:7+i*.3})}}
  LIFE.birds.forEach((b,i)=>{b.a+=dt*.25;const x=b.cx+Math.cos(b.a)*b.r+Math.sin(b.a*2.3+i)*.8,z=b.cz+Math.sin(b.a)*b.r;b.m.position.set(x,b.y+Math.sin(b.a*3+i)*.4,z);b.m.rotation.y=-b.a;const f=Math.sin(clock.elapsedTime*10+i)*.7;b.pl.rotation.z=f;b.pr.rotation.z=-f;b.m.visible=!night});
  // asap dapur pagi & sore
  const cook=(h>5&&h<8)||(h>16&&h<18.5);LIFE.smokeT-=dt;const hs=bOf('house');
  if(cook&&hs.length&&LIFE.smokeT<=0){LIFE.smokeT=.12;const hh=pick(hs);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR.smoke,transparent:true,depthWrite:false,opacity:.55}));sp.position.set(hh.x+.65,R3.hAt(hh.x+.5,hh.y+.5)+1,hh.y+.35);sp.scale.setScalar(.25);sp.userData.age=0;root.add(sp);LIFE.smoke.push(sp)}
  for(let i=LIFE.smoke.length-1;i>=0;i--){const s=LIFE.smoke[i];s.userData.age+=dt;const a=s.userData.age;s.position.y+=dt*.35;s.position.x+=dt*.12;s.scale.setScalar(.25+a*.35);s.material.opacity=Math.max(0,.55-a*.18);if(a>3){root.remove(s);s.material.dispose();LIFE.smoke.splice(i,1)}}
  LIFE.glows.forEach(g=>{g.visible=night&&(h>18.6||h<4.5+g.userData.f);g.material.opacity=.75+Math.sin(clock.elapsedTime*3+g.userData.f*9)*.1});
  if(LIFE.gather>0)LIFE.gather-=dt}
 R3.gather=s=>{LIFE.gather=s;LIFE.people.forEach(p=>{if(!isNight())plan(p)})};
 R3.lifeReset=()=>{[...LIFE.people.map(p=>p.m),...LIFE.veh.map(v=>v.m),...LIFE.hens.map(h=>h.m),...LIFE.birds.map(b=>b.m),...LIFE.smoke,...LIFE.glows].forEach(o=>root.remove(o));Object.assign(LIFE,{leader:null,people:[],veh:[],birds:[],hens:[],smoke:[],glows:[],paths:null})};
 R3.pathsDirty=()=>{LIFE.paths=null};
 R3.life=dt=>{if(!S)return;stepPeople(dt);stepHens(dt);stepVeh(dt);stepAmbient(dt)};
 R3.hour=hour;R3.leaderPos=()=>LIFE.leader?LIFE.leader.m.position:null;R3.lifeStats=()=>({bikes:LIFE.veh.filter(v=>v.kind==='sepeda').length,motors:LIFE.veh.filter(v=>v.kind==='motor'||v.kind==='mobil').length,hens:LIFE.hens.length});R3.look=(x,z,d)=>{controls.target.set(x,R3.hAt(x,z),z);camera.position.set(x-d*.3,R3.hAt(x,z)+d*1.1,z+d*.6)};R3.dbg=()=>({veh:LIFE.veh.map(v=>v.kind+':'+v.a+'>'+v.b),paths:pathNet().length,people:LIFE.people.length});
 R3.quality=()=>{const q=SET.q==='auto'?(Math.min(innerWidth,innerHeight)<700||devicePixelRatio>2.5?'med':'high'):SET.q;renderer.setPixelRatio(q==='low'?1:q==='med'?Math.min(1.5,devicePixelRatio):Math.min(2,devicePixelRatio));renderer.shadowMap.enabled=SET.shadow&&q!=='low';const hi=q==='high';if(R3.hiQ!==hi){R3.hiQ=hi;R3.post(hi);if(S&&terrain)R3.world()}sun.castShadow=renderer.shadowMap.enabled;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});const el=renderer.domElement.parentElement;if(el){const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false)}};R3.camSpeed=v=>{controls.rotateSpeed=v;controls.panSpeed=v;controls.zoomSpeed=v};R3.cam=()=>({camera,controls});
 R3.dom=()=>renderer.domElement;R3.controls=()=>controls;
})();

/* ================= Interaksi ================= */
let tool='info',dirty=false,speed=1,timer=0,curStyle='jawa',dragging=false;
function canAfford(c){return S.res.coin>=(c.coin||0)&&S.res.wood>=(c.wood||0)}
function pay(c){S.res.coin-=c.coin||0;S.res.wood-=c.wood||0}
function act(x,y,silent){const say=m=>{if(!silent){toast(m);Snd.play('err')}};
 if(tool==='info'){showInfo(x,y);return}
 if(tool!=='info'&&!inOwn(x,y)){say(t('outside'));return}
 if(tool==='babat'){if(L(x,y)!=='F')return;if(S.res.coin<1){say(t('noMoney'));return}S.res.coin-=1;S.res.wood+=4;setL(x,y,'G');S.stats.cleared++;Snd.play('chop');R3.tileColor(x,y);R3.trees();after();return}
 if(tool==='path'){if(L(x,y)!=='G'||occ[y][x]){if(L(x,y)==='F')say(t('needClear'));return}if(S.res.coin<1){say(t('noMoney'));return}S.res.coin-=1;setL(x,y,'P');Snd.play('path');R3.tileColor(x,y);R3.path(x,y);R3.pathsDirty();after();return}
 if(tool==='bull'){const id=occ[y][x];if(!id)return;const b=S.b.find(b=>b.id===id);S.res.wood+=Math.floor((BT[b.t].c.wood||0)/2);S.b=S.b.filter(q=>q.id!==id);R3.delB(id);rebuildOcc();Snd.play('bull');if(b.t==='house'&&S.kk>count('house'))S.kk=Math.max(1,count('house'));R3.villagers();after();return}
 const T=BT[tool];if(!T)return;if(T.era>S.era){say(t('locked',{n:T.era}));return}
 for(let dy=0;dy<T.h;dy++)for(let dx=0;dx<T.w;dx++){const X=x+dx,Y=y+dy;if(!inside(X,Y)||!inOwn(X,Y)){say(t('outside'));return}const l=L(X,Y);if(l==='W'){say(t('onWater'));return}if(l==='F'){say(t('needClear'));return}if(occ[Y][X]||l==='P'){say(t('occupied'));return}}
 if(!canAfford(T.c)){say(S.res.coin<(T.c.coin||0)?t('noMoney'):t('noWood'));return}
 const stp=slope(x,y)>.6;if(stp&&S.res.wood<(T.c.wood||0)*1.5){say(lang==='en'?'Steep slope: needs 50% more timber.':'Lahan miring: butuh kayu 50% lebih.');return}if(stp)S.res.wood-=Math.ceil((T.c.wood||0)*.5);pay(T.c);Snd.play('build');const b={id:S.nid++,t:tool,x,y,w:T.w,h:T.h,bt:T.days||1};if(tool==='house'||tool==='hall')b.s=curStyle;if(tool==='house'&&Math.random()<.5)b.r=Math.floor(Math.random()*4);S.b.push(b);rebuildOcc();R3.addB(b);R3.villagers();after()}
function after(){dirty=true;updHUD();checkMissions();checkEra()}
function placeOK(x,y){if(!x&&x!==0)return false;if(tool!=='info'&&!inOwn(x,y))return false;if(tool==='babat')return L(x,y)==='F';if(tool==='path')return L(x,y)==='G'&&!occ[y][x];if(tool==='bull')return !!occ[y][x];if(tool==='info')return true;const T=BT[tool];if(!T)return false;
 for(let dy=0;dy<T.h;dy++)for(let dx=0;dx<T.w;dx++){const X=x+dx,Y=y+dy;if(!inside(X,Y)||!inOwn(X,Y)||L(X,Y)!=='G'||occ[Y][X])return false}return T.era<=S.era&&canAfford(T.c)}
function bindInput(){const el=R3.dom();let down=null,last=null;
 el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,b:e.button};dragging=false;if((tool==='babat'||tool==='path')&&e.button===0&&e.pointerType!=='touch'){R3.controls().enabled=false;dragging=true;const c=R3.pick(e.clientX,e.clientY);if(c){act(c[0],c[1],true);last=c.join()}}});
 el.addEventListener('pointermove',e=>{const c=R3.pick(e.clientX,e.clientY);if(c){const T=BT[tool]||{w:1,h:1};R3.ghost(c[0],c[1],T.w,T.h,placeOK(c[0],c[1]))}else R3.ghost(null);
  if(dragging&&c&&c.join()!==last){act(c[0],c[1],true);last=c.join()}});
 el.addEventListener('pointerup',e=>{R3.controls().enabled=true;if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);if(!dragging&&d<7&&down.b===0){const c=R3.pick(e.clientX,e.clientY);if(c)act(c[0],c[1])}dragging=false;down=null;last=null});
 el.addEventListener('pointerleave',()=>R3.ghost(null))}

/* ================= UI gim ================= */
function renderBar(){$('bar').innerHTML=TOOLS.map(k=>{if(k==='|')return '<div class="sep"></div>';const T=BT[k],lock=T&&T.era>S.era,c=T?T.c:null;
  return `<button class="tool${k===tool?' on':''}${lock?' lock':''}" data-k="${k}" title="${esc(t('tlD.'+k))}"><i>${ICON[k]}</i><span>${t('tl.'+k)}</span><em>${c?(c.coin?money(c.coin,true):'')+(c.wood?' 🪵'+c.wood:''):k==='babat'?money(1,true)+' →🪵4':k==='path'?money(1,true):''}</em></button>`}).join('');
 $('bar').querySelectorAll('.tool').forEach(b=>b.onclick=()=>{Snd.click();const k=b.dataset.k,T=BT[k];if(T&&T.era>S.era){toast(t('locked',{n:T.era}));return}tool=k;renderBar();$('styleBar').classList.toggle('hidden',!(k==='house'||k==='hall'));if(k!=='info')$('info').classList.add('hidden')});
 $('styleBar').innerHTML=STYLES.map(s=>`<button class="${s===curStyle?'on':''}" data-s="${s}">${t('st.'+s)[0]}</button>`).join('');$('styleBar').querySelectorAll('button').forEach(b=>b.onclick=()=>{curStyle=b.dataset.s;renderBar()})}
function dateStr(){const c=S.clk||{h:7,d:1};return String(c.d).padStart(2,'0')+' '+t('months')[calM()]+' · '+t('year')+' '+calY()+' · '+String(Math.floor(c.h)).padStart(2,'0')+':'+String(Math.floor(c.h%1*4)*15).padStart(2,'0')}
function updHUD(){const R=S.res;$('hName').textContent=S.char.name;$('hTitle').textContent=titleOf(S.loc.cc,S.era);$('hAv').innerHTML=S.char._shot?`<img src="${S.char._shot}" alt="">`:avatarOf(S.char);
 $('hDate').textContent=dateStr();$('hEra').textContent=t('era',{n:S.era})+' · '+t('eras')[S.era-1];
 const cap=40+count('barn')*BT.barn.store,houses=count('house');
 const sea=seasonOf(calM());const st=[[SEAS_IC[sea],SEASN[lang][sea],WX_IC[S.wx||'cerah']+' '+WXN[lang][S.wx||'cerah'],false],['💰',t('coin'),money(R.coin,true),R.coin<5],['🪵',t('wood'),Math.floor(R.wood),R.wood<5],['🌾',t('food'),Math.floor(R.food)+'/'+cap,R.food<S.kk*3],['👪',t('kk'),S.kk+'/'+houses,S.kk>houses],['😊',t('happy'),S.happy,S.happy<45],['🤝',t('coh'),S.coh,S.coh<45]];
 $('hStats').innerHTML=st.map(s=>`<div class="st${s[3]?' warn':''}"><small>${s[0]} ${s[1]}</small><b>${s[2]}</b></div>`).join('')}
function renderMissions(){const list=missList();$('missions').innerHTML=`<h3>🎯 ${t('missions')} · ${t('eras')[S.era-1]}<button id="msX">–</button></h3>`+list.map(([k])=>`<div class="ms${S.done.indexOf(k)>=0?' done':''}"><i>${S.done.indexOf(k)>=0?'✅':'⬜'}</i><span>${msLabel(k)}</span></div>`).join('')+rapor()+`<p class="note" style="color:var(--muted);margin:6px 0 0">${esc(S.meta.name)} · ${esc(S.loc.name)}</p>`;
 $('msX').onclick=()=>{$('missions').classList.toggle('mini');$('missions').querySelectorAll('.ms,.note').forEach(e=>e.classList.toggle('hidden'))}}
const RAPN={id:{h:'Rapor permukiman',e:'Ekonomi warga',n:'Jejaring',c:'Kenyamanan',k:'Kepuasan',p:'Pertumbuhan',s:'Skor peringkat',w:'Dinilai server saat tersimpan.'},en:{h:'Settlement report',e:'Resident economy',n:'Networking',c:'Comfort',k:'Satisfaction',p:'Growth',s:'Ranking score',w:'Assessed by the server on save.'}};
function rapor(){const I=S._ind;if(!I)return GUEST?'':`<div class="rap note" style="color:var(--muted)">${RAPN[lang].h}: ${RAPN[lang].w}</div>`;const R=RAPN[lang];return `<div class="rap"><div class="r"><b>${R.h}</b><span></span><span></span></div>`+['e','n','c','k','p'].map(k=>`<div class="r"><span>${R[k]}</span><div class="bar"><i style="width:${I[k]}%"></i></div><span>${I[k]}</span></div>`).join('')+`<div class="r"><span>${R.s}</span><span></span><span class="sc">${I.score}</span></div></div>`}
function showInfo(x,y){const id=occ[y][x],b=id&&S.b.find(q=>q.id===id),i=$('info');i.classList.remove('hidden');
 const kv=(k,v)=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`;let h=`<h3>${t('infoTile',{x,y})}<button id="inX">✕</button></h3>`+kv(t('kv.type'),b?ICON[b.t]+' '+t('tl.'+b.t):t('land.'+L(x,y)));
 if(b&&b.s)h+=kv(t('kv.style'),t('st.'+b.s)[0]);h+=kv(t('kv.water'),near(x,y,'well',5)?t('kv.yes'):t('kv.no'))+kv(t('kv.worship'),near(x,y,'worship',8)?t('kv.yes'):t('kv.no'))+kv(t('kv.flood'),nearWater(x,y,1)?t('kv.yes'):t('kv.no'));
 h+=`<button class="bigbtn alt" id="inRef" style="margin-top:8px;width:100%">${PUS[lang].ref}</button>`;h+=kv(lang==='en'?'Fertility':'Kesuburan',Math.round(fert(x,y)*100)+'%')+kv(lang==='en'?'Slope':'Kemiringan',slope(x,y)>.6?(lang==='en'?'steep':'curam'):slope(x,y)>.3?(lang==='en'?'moderate':'sedang'):(lang==='en'?'flat':'datar'));if(b&&b.bt)h+=kv('🚧 '+(lang==='en'?'Under construction':'Sedang dibangun'),Math.ceil(b.bt)+(lang==='en'?' days left':' hari lagi'))+`<button class="bigbtn gold" id="inRush" style="width:100%;margin-top:6px">⚡ ${lang==='en'?'Rush':'Percepat'} · ${money(rushCost(b),true)}</button>`;i.innerHTML=h;$('inX').onclick=()=>i.classList.add('hidden');if($('inRush'))$('inRush').onclick=()=>rush(b);$('inRef').onclick=()=>pustaka('foto',b?TOOL_TOPIC[b.t]:(L(x,y)==='W'?'air':L(x,y)==='F'?'hijau':'kampung'))}
let advT=0;function advise(msg,who){if(!SET.tips&&!/!/.test(msg))return;const a=$('advisor'),w=who||'elder',face={elder:'👴🏽',eng:'👷🏽',eco:'🧮'}[w];a.innerHTML=`<div class="face">${face}</div><div><b>${t('adv.'+w)}</b><p>${esc(msg)}</p></div><button class="x" aria-label="tutup">✕</button>`;a.classList.remove('off');a.querySelector('.x').onclick=()=>a.classList.add('off');clearTimeout(advT);advT=setTimeout(()=>a.classList.add('off'),9000)}
function setSpeed(s){speed=s;if(!$('sp3')){const b=document.createElement('button');b.id='sp3';b.textContent='⏩⏩';b.title='×10';$('sp2').after(b);b.onclick=()=>setSpeed(3)}['spP','sp1','sp2','sp3'].forEach((id,i)=>$(id).classList.toggle('on',i===s))}
$('spP').onclick=()=>setSpeed(0);$('sp1').onclick=()=>setSpeed(1);$('sp2').onclick=()=>setSpeed(2);
(()=>{const b=document.createElement('button');b.id='pBtn';b.title='Pustaka';b.textContent='📚';b.className=$('mBtn').className;$('mBtn').before(b);b.onclick=()=>{Snd.click();pustaka(null,TOOL_TOPIC[tool]||pusTopic)}})();
$('mBtn').onclick=()=>{const m=$('menu');if(!m.classList.contains('hidden')){m.classList.add('hidden');return}
 m.innerHTML=`<button id="mSave">💾 ${t('save')} <span id="saveDot"></span></button><button id="mNb">🏘️ ${t('neighbors')}</button><button id="mSet">⚙️ ${SETN[lang].h}</button><button id="mNet">🤝 ${lang==='en'?'Trade network':'Jaringan dagang'}</button><button id="mExp">🗺️ ${t('expH')}</button><button id="mPus">📚 ${PUS[lang].h}</button><button id="mBoard">🏆 ${lt('h')}</button><button id="mSnd">${Snd.on?'🔊':'🔇'} ${lang==='en'?'Sound':'Suara'}</button><button id="mHelp">❓ ${t('help')}</button><button id="mLang">🌐 ${t('lang')}</button><button id="mExit">🚪 ${t('exit')}</button><button id="mHome">🏠 pindotutuko.id</button>`;m.classList.remove('hidden');
 $('mSave').onclick=()=>save(true);$('mBoard').onclick=()=>board();$('mSet').onclick=()=>{$('menu').classList.add('hidden');settings()};$('mNet').onclick=()=>{$('menu').classList.add('hidden');network()};$('mExp').onclick=()=>{$('menu').classList.add('hidden');expand()};$('mPus').onclick=()=>{$('menu').classList.add('hidden');pustaka(null,TOOL_TOPIC[tool]||pusTopic)};$('mSnd').onclick=()=>{Snd.toggle();$('mSnd').innerHTML=(Snd.on?'🔊':'🔇')+' '+(lang==='en'?'Sound':'Suara')};$('mNb').onclick=neighbors;$('mHelp').onclick=()=>modal(`<h2>${t('help')}</h2><p>${t('helpTxt')}</p>`);
 $('mLang').onclick=()=>{lang=lang==='id'?'en':'id';store.set('baLang',lang);applyStatic();renderBar();updHUD();renderMissions();m.classList.add('hidden')};
 $('mExit').onclick=async()=>{await save(true);stopGame();hub()};$('mHome').onclick=async()=>{await save(true);location.href='https://pindotutuko.id/'}};
const expCost=n=>({coin:40+30*n,wood:15+10*n,kk:6+5*n});
function expand(){const o=S.own,n=S.exp||0,c=expCost(n),w=o.x1-o.x0,h=o.y1-o.y0;
 modal(`<h2>🗺️ ${t('expH')}</h2><p>${t('expP',{w,h,m:w*10+' × '+h*10})}</p><p><b>${t('expNeed',{kk:c.kk,c:c.coin,w:c.wood})}</b></p><div class="row">${t('expDir').map((d,i)=>`<button class="bigbtn alt ex" data-d="${i}">${d}</button>`).join('')}</div><div class="err" id="exErr"></div>`);
 document.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{const d=+b.dataset.d,e=$('exErr');if(S.kk<c.kk){e.textContent=t('expKK',{kk:c.kk});Snd.play('err');return}if(!canAfford(c)){e.textContent=S.res.coin<c.coin?t('noMoney'):t('noWood');Snd.play('err');return}
  const nO=Object.assign({},o);if(d===0)nO.y0=Math.max(0,o.y0-8);if(d===1)nO.x1=Math.min(N,o.x1+8);if(d===2)nO.y1=Math.min(N,o.y1+8);if(d===3)nO.x0=Math.max(0,o.x0-8);
  if(nO.x0===o.x0&&nO.x1===o.x1&&nO.y0===o.y0&&nO.y1===o.y1){e.textContent=t('expMax');return}
  pay(c);S.own=nO;S.exp=n+1;R3.recolor();$('modal').classList.add('hidden');Snd.play('era');toast('🗺️ '+t('expDone'));after();save(true)})}
function modal(html){const m=$('modal');m.classList.remove('hidden');m.innerHTML=`<div class="box">${html}<div class="row" style="margin-top:12px"><button class="bigbtn" id="mOk">${t('ok')}</button></div></div>`;$('mOk').onclick=()=>m.classList.add('hidden')}
async function neighbors(){if(GUEST){modal(`<h2>${t('nbH')}</h2><p>${t('guestWarn')}</p>`);return}try{const j=await api('neighbors',null,'&lat='+S.loc.lat+'&lon='+S.loc.lon);
 modal(`<h2>${t('nbH')}</h2>`+(j.list.length?j.list.map(n=>`<div class="nb"><div><b>${esc(n.name)}</b> <small>· ${esc(n.who)}</small><br><small>${esc(n.loc)} · ${t('nbRel.'+n.rel)}${n.rel==='dekat'?' · '+n.km+' km':''}</small></div><div style="text-align:right"><b>${t('era',{n:n.era})}</b><br><small>${n.kk} KK</small></div></div>`).join(''):`<p>${t('nbNone')}</p>`))}catch(e){toast(t('errNet'))}}

/* ================= Simpan / muat ================= */
let saveVer=0,saving=false,lastSave=0;
async function save(force){if(!S||saving)return;if(!force&&!dirty)return;saving=true;const dot=$('saveDot');if(dot)dot.textContent=t('saving');
 try{if(GUEST)store.set('baGuestSave',JSON.stringify(S));else{const j=await fetch(API+'?a=save',{method:'POST',headers:{'Content-Type':'application/json','X-BA-Token':TOKEN},body:JSON.stringify({state:S,base:saveVer,force:true},(k,v)=>k==='_shot'?undefined:v)}).then(r=>r.json());if(!j.ok)throw new Error(j.error);saveVer=j.ver;if(j.ind){S._ind=j.ind;renderMissions()}if(j.ranked===false&&!S._warned){S._warned=1;advise(lt('notRanked',{f:(j.flags||[]).join(', ')}),'eco')}}
  dirty=false;lastSave=Date.now();if(dot)dot.textContent='✓ '+t('saved');if(force)toast('💾 '+t('saved'))}
 catch(e){if(dot)dot.textContent=t('saveFail');if(force)toast(t('saveFail'))}finally{saving=false}}
async function loadGame(){try{let st=null;if(GUEST){st=JSON.parse(store.get('baGuestSave')||'null')}else{const j=await api('load');st=j.save&&j.save.state;saveVer=j.save?j.save.ver:0}if(!st||!st.own||!st.land||st.land.length!==N)throw new Error('none');startGame(st,false)}catch(e){$('hubErr').textContent=t('errNet')}}
let started=false,loopT=0,clockS='';
function startGame(st,fresh){S=st;rebuildOcc();show('game');if(!started){R3.init($('view'));bindInput();started=true}
 applySet();if(S.char.ava&&!S.char._shot){try{const h=document.createElement('div');h.style.cssText='position:fixed;left:-400px;top:0;width:180px;height:220px';document.body.appendChild(h);AvPrev.mount(h);AvPrev.set(S.char.ava);AvPrev.ctl.autoRotate=false;setTimeout(()=>{S.char._shot=AvPrev.shot();h.remove();updHUD()},400)}catch(e){}}R3.world();curStyle=S.char.style||'jawa';tool='info';renderBar();updHUD();renderMissions();setSpeed(1);
 if(fresh){save(true);setTimeout(prolog,900)}
 clearInterval(loopT);R3.speedFn(()=>speed);S.clk=S.clk||{h:7,d:1};S.m0=S.m0==null?new Date().getMonth():S.m0;S.wx=S.wx||rollWeather();S.links=S.links||[];S.stock=S.stock||{};R3.weather(S.wx,seasonOf(calM()));R3.daylight(S.clk.h/24);window.__BA.setTod=v=>{S.clk.h=v*24;R3.daylight(v)};
 loopT=setInterval(()=>{if(!S)return;const mult=[0,1,3,10][speed]||0;if(!Dlg.busy&&mult){S.clk.h+=2*mult;while(S.clk.h>=24){S.clk.h-=24;S.clk.d++;dayTick();if(S.clk.d>30){S.clk.d=1;tick()}}}
  R3.daylight(speed>=3?.5:S.clk.h/24);$('hDate').textContent=dateStr();const ls=R3.lifeStats();const sea=seasonOf(calM());
  Snd.update({hour:S.clk.h,month:calM(),cc:S.loc.cc,climate:S.loc.climate,rainy:sea==='hujan'||sea==='pancaroba',rainNow:['hujan','badai','gerimis'].includes(S.wx),dry:S.ev.dry>0||sea==='kemarau',water:S.land.some(r=>r.indexOf('W')>=0),market:count('market')>0,forest:S.land.join('').split('F').length-1,bikes:ls.bikes,motors:ls.motors,chickens:ls.hens});
  if(SET.autosave&&Date.now()-lastSave>60000)save(false)},500)}
function stopGame(){clearInterval(loopT);S=null}
window.addEventListener('beforeunload',()=>{if(S&&dirty&&GUEST)store.set('baGuestSave',JSON.stringify(S))});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)save(false)});


/* ================= Ketentuan penggunaan (EULA) & disclaimer ================= */
const EULA_VER='2026-11-01';
const EULA={id:`<h2>Disclaimer & Ketentuan Penggunaan</h2><p class="note">Versi ${EULA_VER}. Baca sebelum bermain.</p><ol class="eula">
<li><b>Untuk pendidikan.</b> Babat Alas adalah simulasi yang disederhanakan untuk belajar arsitektur dan permukiman. Angka ekonomi, sosial, dan lingkungan di dalamnya adalah model latihan, <b>bukan</b> data nyata, nasihat profesional, atau dasar perencanaan sungguhan.</li>
<li><b>Akun.</b> Tidak perlu email. Gunakan kata sandi yang <b>berbeda</b> dari akun lain, jangan bagikan akun, dan satu orang satu akun.</li>
<li><b>Data yang disimpan:</b> nama pengguna, nama tampilan, kampus, kode kelas, simpanan permainan, dan skor. Peringkat menampilkan nama pengguna, nama permukiman, dan kampus. Tidak ada email, nomor telepon, atau lokasi perangkatmu. Lokasi permukiman adalah titik peta yang kamu pilih — <b>jangan memilih alamat rumah pribadi</b>. Akun dan datanya dapat kamu hapus sendiri dari menu. Pengelolaan data mengikuti prinsip pelindungan data pribadi (UU No. 27 Tahun 2022).</li>
<li><b>Main adil.</b> Dilarang mengubah kode atau data permainan, memakai skrip/bot, memanfaatkan celah, atau bermain dengan akun orang lain. Server memeriksa kewajaran setiap simpanan; skor yang tidak wajar <b>tidak masuk peringkat</b>, dapat dihapus, dan dapat didiskualifikasi oleh dosen.</li>
<li><b>Waspada penipuan.</b> Game ini gratis. Pengelola <b>tidak pernah</b> meminta uang, pulsa, data bank, kode OTP, atau kata sandi lewat pesan apa pun. Tidak ada fitur obrolan antarpemain. Abaikan pihak yang mengatasnamakan game ini.</li>
<li><b>Sopan.</b> Nama pengguna, tokoh, dan permukiman tidak boleh kasar, menyinggung SARA, atau melecehkan. Nama yang melanggar dapat diubah atau dihapus.</li>
<li><b>Pengguna di bawah 18 tahun</b> bermain dengan sepengetahuan orang tua atau guru.</li>
<li><b>Rekap semester</b> adalah bahan pertimbangan dosen, bukan nilai otomatis. Layanan disediakan apa adanya dan dapat berubah atau dihentikan. Peta © kontributor OpenStreetMap.</li></ol>
<p class="note">Pengelola: Pindo Tutuko · pindotutuko.id</p>`,
en:`<h2>Disclaimer & Terms of Use</h2><p class="note">Version ${EULA_VER}. Please read before playing.</p><ol class="eula">
<li><b>For education.</b> Babat Alas is a simplified simulation for learning architecture and settlements. Its economic, social and environmental figures are training models, <b>not</b> real data, professional advice or a basis for actual planning.</li>
<li><b>Accounts.</b> No email needed. Use a password <b>different</b> from your other accounts, do not share your account, one person one account.</li>
<li><b>Data stored:</b> username, display name, campus, class code, game saves and scores. Leaderboards show your username, settlement name and campus. No email, phone number or device location is collected. The settlement location is the map point you choose — <b>do not pick your private home address</b>. You can delete your account and its data yourself from the menu. Data handling follows personal-data-protection principles (Indonesian Law No. 27 of 2022).</li>
<li><b>Fair play.</b> Modifying game code or data, using scripts/bots, exploiting bugs or playing on someone else’s account is forbidden. The server checks every save for plausibility; implausible scores are <b>not ranked</b>, may be removed and may be disqualified by the lecturer.</li>
<li><b>Beware of scams.</b> This game is free. The operator <b>never</b> asks for money, phone credit, bank details, OTP codes or passwords through any message. There is no player chat. Ignore anyone claiming to represent this game.</li>
<li><b>Be respectful.</b> Usernames, character and settlement names must not be offensive, hateful or harassing. Violating names may be changed or removed.</li>
<li><b>Users under 18</b> play with the knowledge of a parent or teacher.</li>
<li><b>Semester recaps</b> are input for the lecturer’s judgement, not automatic grades. The service is provided as is and may change or end. Map © OpenStreetMap contributors.</li></ol>
<p class="note">Operator: Pindo Tutuko · pindotutuko.id</p>`};
const eulaOK=()=>store.get('baEula')===EULA_VER;
function showEula(then){let sc=$('scEula');if(!sc){sc=document.createElement('section');sc.id='scEula';sc.className='screen';document.body.appendChild(sc)}
 sc.classList.remove('hidden');['scAuth','scHub','scChar','scLoc'].forEach(s=>$(s).classList.add('hidden'));
 sc.innerHTML=`<div class="box wide" style="max-height:92vh;overflow:auto">${EULA[lang]}<label class="agree"><input type="checkbox" id="euChk"> ${lang==='en'?'I have read and agree to the disclaimer and terms of use.':'Saya telah membaca dan menyetujui disclaimer serta ketentuan penggunaan.'}</label>
  <div class="row" style="margin-top:12px"><button class="bigbtn gold" id="euGo" disabled>${lang==='en'?'Agree & continue':'Setuju & lanjut'}</button><button class="bigbtn alt" id="euLang">${lang==='id'?'English':'Bahasa Indonesia'}</button><a class="bigbtn alt" href="https://pindotutuko.id/" style="text-decoration:none">${lang==='en'?'Decline':'Tidak setuju'}</a></div></div>`;
 $('euChk').onchange=()=>{$('euGo').disabled=!$('euChk').checked};$('euLang').onclick=()=>{lang=lang==='id'?'en':'id';store.set('baLang',lang);applyStatic();showEula(then)};
 $('euGo').onclick=async()=>{store.set('baEula',EULA_VER);if(TOKEN){try{await api('eula',{ver:EULA_VER})}catch(e){}}sc.classList.add('hidden');Snd.click();then()}}

/* ================= Peringkat & ruang dosen ================= */
const LB={id:{h:'Peringkat semester',kelas:'Kelasku',kampus:'Kampusku',publik:'Publik',rank:'Peringkatmu: {r} dari {n}',none:'Belum ada skor di sini. Skor masuk setelah permainan tersimpan dengan data wajar.',guest:'Mode tamu tidak masuk peringkat. Daftar akun untuk ikut bersaing.',noKelas:'Kamu belum bergabung dengan kelas.',col:['#','Pemain','Permukiman','Era','KK','Skor (Eko·Jej·Nyaman·Puas·Tumbuh)'],
  dosen:'Ruang dosen',join:'Gabung kelas',joinP:'Masukkan kode kelas dari dosen.',joined:'Bergabung dengan kelas {k}.',mk:'Buat kelas baru',mkP:'Nama kelas, mis. Arsitektur Permukiman A — 2026 Ganjil',myC:'Kelas yang kamu kelola',code:'Kode',dl:'Unduh rekap (CSV)',noC:'Belum ada kelas.',share:'Bagikan kode ini kepada mahasiswa. Mereka memasukkannya saat mendaftar atau lewat “Gabung kelas”.',notRanked:'Simpanan ini tidak masuk peringkat karena datanya tidak wajar ({f}). Mainkan secara normal tanpa mengubah data.',del:'Hapus akun',delP:'Ketik kata sandi untuk menghapus akun, simpanan, dan skormu secara permanen.',delDone:'Akun dihapus.',sem:'Semester'},
 en:{h:'Semester leaderboard',kelas:'My class',kampus:'My campus',publik:'Public',rank:'Your rank: {r} of {n}',none:'No scores here yet. Scores appear after a plausible game save.',guest:'Guest mode is not ranked. Sign up to compete.',noKelas:'You have not joined a class.',col:['#','Player','Settlement','Era','HH','Score (Eco·Net·Comf·Sat·Grow)'],
  dosen:'Lecturer room',join:'Join class',joinP:'Enter the class code from your lecturer.',joined:'Joined class {k}.',mk:'Create a class',mkP:'Class name, e.g. Settlement Architecture A — 2026 Odd',myC:'Classes you manage',code:'Code',dl:'Download recap (CSV)',noC:'No classes yet.',share:'Share this code with students. They enter it when signing up or via “Join class”.',notRanked:'This save is not ranked because its data is implausible ({f}). Play normally without editing data.',del:'Delete account',delP:'Type your password to permanently delete your account, save and scores.',delDone:'Account deleted.',sem:'Semester'}};
const lt=(k,v)=>{let s=LB[lang][k];if(v)for(const p in v)s=s.split('{'+p+'}').join(v[p]);return s};
async function board(scope){scope=scope||(ME&&ME.kelas?'kelas':'publik');if(GUEST){modal(`<h2>🏆 ${lt('h')}</h2><p>${lt('guest')}</p>`);return}
 let j=null;try{j=await api('board',null,'&scope='+scope)}catch(e){toast(t('errNet'));return}
 const tabs=['kelas','kampus','publik'].map(s=>`<button class="${s===scope?'on':''}" data-s="${s}">${lt(s)}</button>`).join('');
 const rows=j.list.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td><b>${esc(r.who)}</b>${r.kampus?'<br><small>'+esc(r.kampus)+'</small>':''}</td><td>${esc(r.name)}</td><td>${r.era}</td><td>${r.kk}</td><td><b>${r.best}</b>${r.ind?`<br><small title="E/N/C/K/P">${r.ind.e}·${r.ind.n}·${r.ind.c}·${r.ind.k}·${r.ind.p}</small>`:''}</td></tr>`).join('');
 modal(`<h2>🏆 ${lt('h')} <small style="font-weight:600;color:#7b7266">· ${esc(j.sem)}</small></h2><div class="tabs lbt">${tabs}</div>`+(scope==='kelas'&&!(ME&&ME.kelas)?`<p>${lt('noKelas')}</p>`:j.list.length?`<p class="note">${j.myRank?lt('rank',{r:j.myRank,n:j.total}):''}</p><table class="lb"><tr>${lt('col').map(c=>`<th>${c}</th>`).join('')}</tr>${rows}</table>`:`<p>${lt('none')}</p>`));
 document.querySelectorAll('.lbt button').forEach(b=>b.onclick=()=>board(b.dataset.s))}
async function joinClass(){modal(`<h2>🎓 ${lt('join')}</h2><p>${lt('joinP')}</p><div class="fld"><input id="jcCode" maxlength="12" style="text-transform:uppercase"></div><div class="row"><button class="bigbtn gold" id="jcGo">${lt('join')}</button></div><div class="err" id="jcErr"></div>`);
 $('jcGo').onclick=async()=>{try{const j=await api('kelas_join',{code:$('jcCode').value});ME.kelas=j.kelas;$('modal').classList.add('hidden');toast(lt('joined',{k:j.kelas+' · '+j.nama}));if($('hubSub'))$('hubSub').textContent=(ME.kampus||'')+' · '+ME.kelas}catch(e){$('jcErr').textContent=t('e.'+e.message)}}}
async function dosenRoom(){let list=[];try{list=(await api('kelas_mine')).list}catch(e){}
 modal(`<h2>👩‍🏫 ${lt('dosen')}</h2><h3>${lt('myC')}</h3>`+(list.length?list.map(c=>`<div class="nb"><div><b>${esc(c.nama)}</b><br><small>${lt('code')}: <b style="font-size:16px;letter-spacing:2px">${c.code}</b></small></div><div><button class="bigbtn alt dl" data-c="${c.code}">⬇ ${lt('dl')}</button></div></div>`).join('')+`<p class="note">${lt('share')}</p>`:`<p>${lt('noC')}</p>`)+
  `<h3 style="margin-top:14px">${lt('mk')}</h3><div class="fld"><input id="kcName" maxlength="80" placeholder="${esc(lt('mkP'))}"></div><div class="row"><button class="bigbtn gold" id="kcGo">${lt('mk')}</button></div><div class="err" id="kcErr"></div>`);
 $('kcGo').onclick=async()=>{try{await api('kelas_new',{nama:$('kcName').value});dosenRoom()}catch(e){$('kcErr').textContent=t('e.'+e.message)}};
 document.querySelectorAll('.dl').forEach(b=>b.onclick=()=>rekapCSV(b.dataset.c))}
async function rekapCSV(code){try{const j=await api('rekap',null,'&code='+code);const head=['peringkat','user','permukiman','lokasi','skor_terbaik','skor_terakhir','ekonomi','jejaring','kenyamanan','kepuasan','pertumbuhan','era','kk','bulan_main','jumlah_simpan','mulai','terakhir'];
 const q=v=>{let s=String(v==null?'':v);if(/^[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
 const csv='﻿'+[head.join(',')].concat(j.rows.map((r,i)=>[i+1].concat(head.slice(1).map(h=>r[h])).map(q).join(','))).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`rekap-babat-alas-${j.kelas}-${j.sem}.csv`;document.body.appendChild(a);a.click();a.remove()}catch(e){toast(t('e.'+e.message))}}
function deleteAccount(){modal(`<h2>⚠️ ${lt('del')}</h2><p>${lt('delP')}</p><div class="fld"><input id="dlPass" type="password" autocomplete="current-password"></div><div class="row"><button class="bigbtn" style="background:#a33a2a" id="dlGo">${lt('del')}</button></div><div class="err" id="dlErr"></div>`);
 let armed=false;$('dlGo').onclick=async()=>{if(!armed){armed=true;$('dlErr').textContent=t('confirmNew').split('.')[0]+'…';$('dlGo').textContent='⚠️ '+lt('del')+' ?';return}try{await api('delete',{pass:$('dlPass').value});TOKEN=null;store.del('baTok');ME=null;$('modal').classList.add('hidden');stopGame();show('scAuth');toast(lt('delDone'))}catch(e){$('dlErr').textContent=t('e.'+e.message)}}}

/* ================= Suara (Web Audio, disintesis — tanpa berkas) ================= */
const Snd=(()=>{let ctx=null,master=null,fxB=null,ambB=null,cur=null,noiseBuf=null,beds={},on=store.get('baSnd')!=='0',last={};
 function init(){if(ctx)return true;try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return false}master=ctx.createGain();master.gain.value=on?SET.vol:0;master.connect(ctx.destination);fxB=ctx.createGain();fxB.gain.value=SET.sfx;fxB.connect(master);ambB=ctx.createGain();ambB.gain.value=SET.amb;ambB.connect(master);cur=fxB;
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}
 const now=()=>ctx.currentTime;
 function env(g,t0,a,peak,dec){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+dec)}
 function tone(f,dur,{type='sine',vol=.2,at=0,a=.005,f2=null,dest=cur}={}){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),t0=now()+at;o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);env(g,t0,a,vol,dur);o.connect(g);g.connect(dest);o.start(t0);o.stop(t0+a+dur+.05)}
 function burst(dur,{vol=.3,at=0,freq=1000,q=1,type='bandpass',a=.002}={}){if(!ctx)return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t0=now()+at;s.buffer=noiseBuf;s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;env(g,t0,a,vol,dur);s.connect(f);f.connect(g);g.connect(cur);s.start(t0,Math.random());s.stop(t0+a+dur+.05)}
 /** Lapisan suasana (noise terfilter yang bisa dinaikturunkan). */
 function bed(name,freq,q,type){if(beds[name])return beds[name];const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();s.buffer=noiseBuf;s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;g.gain.value=0;
  lfo.frequency.value=.07+Math.random()*.1;lg.gain.value=freq*.15;lfo.connect(lg);lg.connect(f.frequency);lfo.start();s.connect(f);f.connect(g);g.connect(ambB);s.start();return beds[name]={g,f}}
 function level(name,v){const b=beds[name];if(b)b.g.gain.setTargetAtTime(v,now(),1.2)}
 // ---- bunyi khas ----
 const chirp=()=>{const f=2200+Math.random()*1800,n=2+Math.floor(Math.random()*4);for(let i=0;i<n;i++)tone(f*(1+Math.random()*.15),.07,{vol:.05,at:i*.11,f2:f*1.4})};
 const cricket=()=>{const f=4300+Math.random()*600;for(let i=0;i<3;i++)tone(f,.03,{vol:.025,at:i*.05,type:'triangle'})};
 const frog=()=>{const f=180+Math.random()*120;for(let i=0;i<2+Math.floor(Math.random()*3);i++)tone(f,.08,{vol:.07,at:i*.16,type:'square',f2:f*.7})};
 const rooster=()=>{const seq=[[500,.12,700],[700,.15,900],[900,.45,600]];let t=0;seq.forEach(([f,d,f2])=>{tone(f,d,{type:'sawtooth',vol:.05,at:t,f2});tone(f*2,d,{type:'sine',vol:.03,at:t,f2:f2*2});t+=d})};
 const tokek=()=>{[0,.55].forEach((t,i)=>{tone(320,.12,{type:'square',vol:.05,at:t,f2:200});tone(160,.18,{type:'sine',vol:.06,at:t+.13,f2:110})})};
 const kentong=n=>{for(let i=0;i<(n||3);i++){tone(880,.18,{vol:.18,at:i*.32,f2:820});burst(.04,{vol:.08,at:i*.32,freq:1500,q:6})}};
 const bell=(f=196)=>{[1,2.76,5.4,8.9].forEach((m,i)=>tone(f*m,3.5/(i+1),{vol:.12/(i+1),a:.003}))};
 const slendro=[293.7,339,391,452,522,587.4];
 const gamelan=()=>{[0,2,4,5,3].forEach((k,i)=>{tone(slendro[k],1.2,{vol:.1,at:i*.22,type:'triangle'});tone(slendro[k]*2.01,.8,{vol:.04,at:i*.22})});tone(98,1.8,{vol:.12,at:1.1})};
 const chime=()=>[523,659,784,1047].forEach((f,i)=>tone(f,.5,{vol:.08,at:i*.09,type:'triangle'}));
 const cicada=()=>{const o=ctx.createOscillator(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain(),t0=now();o.type='sawtooth';o.frequency.value=5200;lfo.frequency.value=38;lg.gain.value=.03;lfo.connect(lg);lg.connect(g.gain);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.02,t0+.6);g.gain.linearRampToValueAtTime(0,t0+3.5);const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=5200;f.Q.value=3;o.connect(f);f.connect(g);g.connect(cur);o.start(t0);lfo.start(t0);o.stop(t0+3.6);lfo.stop(t0+3.6)};
 const bikeBell=()=>{tone(2650,.35,{vol:.05});tone(2650,.35,{vol:.05,at:.16})};
 const motor=()=>{const o=ctx.createOscillator(),g=ctx.createGain(),t0=now();o.type='sawtooth';o.frequency.setValueAtTime(70,t0);o.frequency.linearRampToValueAtTime(115,t0+.8);o.frequency.linearRampToValueAtTime(80,t0+1.8);const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=600;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.05,t0+.6);g.gain.linearRampToValueAtTime(0,t0+1.9);o.connect(f);f.connect(g);g.connect(cur);o.start(t0);o.stop(t0+2)};
 const truck=()=>{for(let i=0;i<3;i++)tone(1050,.18,{vol:.06,at:i*.45,type:'square'});burst(.6,{vol:.08,at:1.4,freq:300,q:.7})};
 const crowd=()=>{burst(2.5,{vol:.12,freq:700,q:.5,a:.4});for(let i=0;i<6;i++)tone(300+Math.random()*300,.2,{vol:.03,at:Math.random()*2,type:'triangle',f2:400+Math.random()*300})};
 const ALIAS={chop:()=>{burst(.09,{vol:.35,freq:900,q:2});tone(140,.12,{vol:.25,f2:70,type:'triangle'});setTimeout(()=>Math.random()<.35&&burst(.6,{vol:.12,freq:2500,q:.6,type:'highpass'}),120)},
  build:()=>{for(let i=0;i<3;i++){burst(.05,{vol:.3,at:i*.16,freq:1800,q:4});tone(320,.08,{vol:.12,at:i*.16,type:'triangle'})}},
  path:()=>burst(.25,{vol:.18,freq:600,q:.8,a:.03}),coin:()=>{tone(1318,.12,{vol:.08});tone(1760,.25,{vol:.08,at:.08})},
  bull:()=>{burst(.5,{vol:.3,freq:300,q:.6});burst(.3,{vol:.18,at:.15,freq:1400,q:1})},err:()=>tone(160,.18,{type:'square',vol:.06}),click:()=>tone(1400,.03,{vol:.04}),
  mission:()=>{(Snd.cc==='ID'||Snd.cc==='MY')?gamelan():chime()},era:()=>{(Snd.cc==='ID'||Snd.cc==='MY')?gamelan():bell(261)},
  flood:()=>{burst(4,{vol:.25,freq:1800,q:.4,type:'highpass',a:.5})},fest:()=>{(Snd.cc==='ID'?kentong(5):bell());crowd()},kentong:()=>kentong(4),truck,bike:bikeBell,motor};
 const api2={get on(){return on},cc:'XX',
  toggle(){on=!on;store.set('baSnd',on?'1':'0');if(init())master.gain.setTargetAtTime(on?SET.vol:0,now(),.1);return on},
  levels(){if(!ctx)return;master.gain.setTargetAtTime(on?SET.vol:0,now(),.05);fxB.gain.setTargetAtTime(SET.sfx,now(),.05);ambB.gain.setTargetAtTime(SET.amb,now(),.05)},
  unlock(){if(init()&&ctx.state==='suspended')ctx.resume()},
  play(k){if(!on||!ctx||ctx.state!=='running')return;const f=ALIAS[k];if(f)try{f()}catch(e){}},
  click(){this.play('click')},
  /** Dipanggil tiap 0,5 detik: suasana mengikuti jam, musim, iklim, negara, dan isi kampung. */
  update(o){if(!on||!ctx||ctx.state!=='running')return;cur=ambB;try{this._u(o)}finally{cur=fxB}},
  _u(o){this.cc=o.cc;const h=o.hour,night=h<5.5||h>18.6,dawn=h>=4.8&&h<6.6,trop=o.climate==='trop'||o.climate==='tropdry',temp=o.climate==='temp';
   bed('river',700,.6,'bandpass');bed('wind',350,.4,'lowpass');bed('rain',3000,.3,'highpass');bed('market',650,.8,'bandpass');bed('forest',5200,1.2,'bandpass');
   level('river',o.water?.06:0);level('wind',(temp?.07:.03)+(o.dry?.05:0));level('rain',o.rainy&&o.rainNow?.11:0);level('market',o.market&&!night&&h>6&&h<15?.035:0);level('forest',!night?Math.min(.025,o.forest*.00004):0);
   const r=Math.random(),tick=(k,p,min)=>{if(r<p&&(now()-(last[k]||0))>min){last[k]=now();return true}return false};
   if(!night&&tick('bird',(trop?.35:.18)*(o.forest>50?1.3:.7),.3))chirp();
   if(night&&(trop||o.climate==='sub')&&tick('cricket',.6,.1))cricket();
   if(night&&o.rainy&&trop&&tick('frog',.25,.6))frog();
   if(dawn&&['ID','MY','PH','TH','VN'].includes(o.cc)&&tick('rooster',.12,6))rooster();
   if(night&&o.cc==='ID'&&tick('tokek',.02,25))tokek();
   if(o.cc==='ID'&&h>=22&&h<22.3&&tick('ronda',1,60))kentong(3);
   if(o.cc==='JP'&&((h>=6&&h<6.2)||(h>=18&&h<18.2))&&tick('jbell',1,40))bell(110);
   if(['NL','DE','FR','GB','BE','IT','ES','AT','CH','PL','CZ'].includes(o.cc)&&h>=12&&h<12.2&&tick('cbell',1,40)){bell(196);setTimeout(()=>bell(196),1600)}
   if(o.cc==='JP'&&o.month>=5&&o.month<=7&&!night&&tick('cicada',.12,4))cicada();
   if(o.bikes&&!night&&tick('bikebell',.04,5))bikeBell();if(o.motors&&tick('motor',.05,4))motor();
   if(o.chickens&&!night&&tick('cluck',.08,3))[0,.12,.24].forEach(t=>tone(600+Math.random()*200,.06,{type:'triangle',vol:.03,at:t,f2:450}))}};
 return api2})();
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>Snd.unlock(),{passive:true}));


/* ================= Pustaka: foto referensi, panduan, istilah, aturan, aspek, materi kuliah ================= */
const PUS_TOPICS=[
 {k:'rumah',ic:'🏠',id:'Rumah & gaya bangunan',en:'Houses & building styles',re:/rumah|joglo|limasan|gadang|tongkonan|honai|panggung|bale|adat|tradisional|kampung/i},
 {k:'kampung',ic:'🏘️',id:'Kampung & permukiman',en:'Kampung & settlements',re:/kampung|permukiman|gang|lorong|rusun|perumahan|desa/i},
 {k:'air',ic:'💧',id:'Air, sungai & sumur',en:'Water, rivers & wells',re:/sungai|kali|sumur|air|danau|kanal|jembatan|bantaran|kolam/i},
 {k:'ladang',ic:'🌾',id:'Sawah, ladang & lumbung',en:'Fields, farms & granaries',re:/sawah|ladang|kebun|lumbung|padi|tani|teras/i},
 {k:'pasar',ic:'🏪',id:'Pasar & ekonomi',en:'Markets & economy',re:/pasar|warung|toko|ruko|pedagang|alun/i},
 {k:'ibadah',ic:'🕌',id:'Ibadah & balai warga',en:'Worship & community halls',re:/masjid|musala|mushola|gereja|pura|vihara|klenteng|kuil|candi|balai|pendopo|pendapa/i},
 {k:'jalan',ic:'🛤️',id:'Jalan & mobilitas',en:'Streets & mobility',re:/jalan|gang|trotoar|sepeda|koridor|stasiun|lalu lintas/i},
 {k:'hijau',ic:'🌳',id:'Hutan & ruang terbuka hijau',en:'Forest & green open space',re:/hutan|pohon|taman|hijau|lanskap|kebun/i},
 {k:'kota',ic:'🏙️',id:'Kawasan modern & kota',en:'Modern districts & cities',re:/modern|gedung|kota|menara|apartemen|kantor|urban/i}];
const TOOL_TOPIC={house:'rumah',field:'ladang',barn:'ladang',well:'air',pond:'air',path:'jalan',tree:'hijau',babat:'hijau',hall:'ibadah',worship:'ibadah',market:'pasar',info:'kampung',bull:'kampung'};
const PUS={
 id:{h:'Pustaka',tabs:{foto:'📷 Foto',panduan:'🧭 Panduan',istilah:'📖 Istilah',aspek:'🧩 Aspek',aturan:'⚖️ Aturan',materi:'🎓 Materi'},more:'Foto lain',near:'Dekat lokasi kampungku',src:'Foto: koleksi Pindo Tutuko (album & Lensa Preseden). Ketuk foto untuk memperbesar.',ref:'📚 Referensi',
  panduan:[['1. Babat alas','Pilih lahan dekat sumber air tetapi tidak di bantaran. Babat secukupnya: hutan memberi kayu, tetapi juga menahan air dan menjaga iklim mikro. Sisakan hutan di tepi sungai dan lereng.'],
   ['2. Rumah pertama','Letakkan rumah berkelompok di tanah yang lebih tinggi, menghadap jalan setapak. Gaya lokal menaikkan kohesi warga karena sesuai iklim, bahan setempat, dan adat.'],
   ['3. Air & pangan','Sumur dalam radius 5 petak dari rumah. Ladang butuh tenaga kerja (2 orang per ladang) dan lumbung untuk cadangan musim kemarau.'],
   ['4. Jalan setapak','Hubungkan rumah, sumur, ladang, dan lumbung dengan jalan setapak. Jaringan jalan menjadi rangka permukiman — kelak menjadi jalan lingkungan, saluran, dan jaringan utilitas.'],
   ['5. Menjadi dusun','Capai 20 KK dan miliki lumbung. Bangun balai (kohesi), tempat ibadah (kebahagiaan), dan pasar (kas dari surplus).'],
   ['6. Seimbangkan','Perhatikan tiga pilar: ekonomi (kas, pangan), sosial budaya (bahagia, kohesi), dan lingkungan (hutan, air, banjir). Keputusan yang hanya mengejar satu pilar membuat warga pergi.']],
  istilah:[['Permukiman','Bagian lingkungan hunian yang terdiri atas lebih dari satu satuan perumahan, lengkap dengan prasarana, sarana, utilitas umum, dan kegiatan penunjang.'],['Perumahan','Kumpulan rumah sebagai bagian dari permukiman, beserta prasarana, sarana, dan utilitas umumnya.'],['Prasarana','Kelengkapan dasar fisik agar lingkungan hunian berfungsi: jalan, drainase, air bersih, sanitasi/air limbah, persampahan.'],['Sarana','Fasilitas penunjang kehidupan sosial, budaya, dan ekonomi: pendidikan, kesehatan, peribadatan, perdagangan, ruang terbuka, balai warga.'],['Utilitas umum','Kelengkapan penunjang pelayanan lingkungan, mis. listrik, telekomunikasi, gas, penerangan jalan.'],['KK (kepala keluarga)','Satuan rumah tangga; di gim ini satu rumah dihuni satu KK.'],['Kepadatan','Jumlah penduduk atau rumah per satuan luas lahan. Kepadatan tinggi menuntut prasarana dan ruang terbuka yang lebih terencana.'],['Sempadan sungai','Lahan di kiri-kanan sungai yang dibiarkan bebas bangunan untuk melindungi sungai dan mengurangi risiko banjir.'],['KDB / KLB','Koefisien Dasar Bangunan (luas lantai dasar ÷ luas lahan) dan Koefisien Lantai Bangunan (total luas lantai ÷ luas lahan). Muncul di era perumahan.'],['RTH','Ruang Terbuka Hijau: area bervegetasi untuk ekologi, resapan air, dan rekreasi.'],['Babat alas','Ungkapan Jawa untuk membuka hutan menjadi permukiman — awal berdirinya kampung.'],['Gotong royong','Kerja bersama warga tanpa upah untuk kepentingan bersama; menjadi modal sosial permukiman.'],['Lumbung','Bangunan penyimpan hasil panen; cadangan pangan komunal.'],['Kampung kota','Permukiman yang tumbuh organik di kota, padat, dengan ikatan sosial kuat.'],['Rumah tumbuh (incremental housing)','Rumah yang dibangun bertahap sesuai kemampuan penghuni.']],
  aspek:[['Lokasi','Topografi, kedekatan dengan air, risiko banjir/longsor, dan akses. Di gim: medan, sungai, dan indikator "rawan banjir".'],['Kependudukan','Jumlah KK, pertumbuhan, tenaga kerja, migrasi. Di gim: KK, pekerja ladang, pendatang, warga yang pergi.'],['Lingkungan','Hutan, air, iklim mikro, kebersihan. Di gim: hutan, pohon, kemarau, banjir, truk sampah.'],['Sosial budaya','Adat, gaya bangunan lokal, ruang bersama, kegiatan warga. Di gim: kohesi, balai, selamatan, gaya lokal.'],['Ekonomi','Mata pencaharian, pasar, pembiayaan pembangunan. Di gim: kas, pangan, pasar, biaya bangunan.'],['Prasarana','Jalan, air bersih, drainase, sanitasi, persampahan, energi. Di gim: jalan setapak, sumur, kolam; berikutnya saluran & listrik.'],['Sarana','Ibadah, pasar, balai, pendidikan, kesehatan, RTH. Di gim: tempat ibadah, pasar, balai; berikutnya sekolah & puskesmas.'],['Teknis','Struktur, bahan, orientasi, iklim, teknologi tepat guna (mis. penampungan air hujan).']],
  aturan:[['UU No. 1 Tahun 2011 tentang Perumahan dan Kawasan Permukiman','Dasar hukum penyelenggaraan perumahan dan kawasan permukiman di Indonesia (menggantikan UU No. 4 Tahun 1992).'],['PP No. 14 Tahun 2016 tentang Penyelenggaraan Perumahan dan Kawasan Permukiman','Aturan pelaksanaan UU No. 1 Tahun 2011.'],['UU No. 26 Tahun 2007 tentang Penataan Ruang','Dasar penataan ruang: rencana tata ruang, pemanfaatan, dan pengendalian ruang.'],['UU No. 28 Tahun 2002 tentang Bangunan Gedung; PP No. 16 Tahun 2021','Persyaratan tata bangunan dan keandalan bangunan gedung.'],['SNI 03-1733-2004','Tata cara perencanaan lingkungan perumahan di perkotaan: kebutuhan sarana dan prasarana menurut jumlah penduduk.'],['Permen PUPR No. 28/PRT/M/2015','Penetapan garis sempadan sungai dan garis sempadan danau.']],
  aturanNote:'Angka di dalam gim (radius sumur, biaya, risiko banjir) adalah <b>model latihan</b>, bukan angka regulasi. Untuk praktik nyata, rujuk naskah resmi peraturan yang berlaku dan aturan daerah setempat. Kampung di luar Indonesia mengikuti peraturan negara masing-masing.',
  materi:'Materi kuliah di Lensa Permukiman',materiP:'Slide kuliah Azas Perumahan & Permukiman dan Perancangan Permukiman (MKP). Buka untuk belajar lebih dalam.',apps:'Aplikasi pembelajaran lain'},
 en:{h:'Library',tabs:{foto:'📷 Photos',panduan:'🧭 Guide',istilah:'📖 Terms',aspek:'🧩 Aspects',aturan:'⚖️ Rules',materi:'🎓 Lessons'},more:'More photos',near:'Near my kampung',src:'Photos: Pindo Tutuko collection (album & Lensa Preseden). Tap a photo to enlarge.',ref:'📚 Reference',
  panduan:[['1. Clearing the forest','Choose land near water but not on the riverbank. Clear only what you need: forest gives timber but also holds water and keeps the microclimate cool. Keep forest along the river and slopes.'],['2. First houses','Cluster houses on higher ground facing a footpath. Local styles raise cohesion because they suit the climate, local materials and customs.'],['3. Water & food','A well within 5 tiles of each house. Fields need labour (2 people each) and a granary stores food for the dry season.'],['4. Footpaths','Connect houses, wells, fields and granary with footpaths. The path network is the skeleton of the settlement — later it becomes streets, drains and utility lines.'],['5. Becoming a hamlet','Reach 20 households and own a granary. Build a hall (cohesion), a place of worship (happiness) and a market (income from surplus).'],['6. Keep the balance','Watch three pillars: economy (funds, food), social-cultural (happiness, cohesion) and environment (forest, water, floods). Chasing only one pillar drives residents away.']],
  istilah:[['Settlement (permukiman)','Part of the living environment made of more than one housing unit, with infrastructure, facilities, public utilities and supporting activities.'],['Housing (perumahan)','A group of houses forming part of a settlement, with its infrastructure, facilities and utilities.'],['Infrastructure (prasarana)','Basic physical provisions: roads, drainage, clean water, sanitation/wastewater, solid waste.'],['Facilities (sarana)','Services for social, cultural and economic life: education, health, worship, trade, open space, community hall.'],['Public utilities','Supporting services such as electricity, telecommunication, gas, street lighting.'],['Household (KK)','One family unit; in this game one house holds one household.'],['Density','Number of people or houses per land area. High density needs well-planned infrastructure and open space.'],['River buffer (sempadan)','Land along a river kept free of buildings to protect the river and reduce flood risk.'],['Site coverage / FAR (KDB/KLB)','Ground-floor area ÷ plot area, and total floor area ÷ plot area. Appears in the housing-estate era.'],['Green open space (RTH)','Vegetated areas for ecology, water infiltration and recreation.'],['Babat alas','Javanese expression for clearing forest to found a settlement.'],['Gotong royong','Unpaid communal work for shared benefit; the social capital of a settlement.'],['Granary (lumbung)','Building for storing harvest; communal food reserve.'],['Urban kampung','An organically grown, dense urban settlement with strong social ties.'],['Incremental housing','Housing built step by step as residents can afford.']],
  aspek:[['Location','Topography, water, flood/landslide risk, access. In game: terrain, river, flood-prone indicator.'],['Population','Households, growth, labour, migration. In game: households, field workers, migrants, leavers.'],['Environment','Forest, water, microclimate, cleanliness. In game: forest, trees, drought, floods, garbage truck.'],['Social-cultural','Customs, local styles, shared spaces, community life. In game: cohesion, hall, feasts, local styles.'],['Economy','Livelihoods, markets, financing. In game: funds, food, market, building costs.'],['Infrastructure','Roads, water, drainage, sanitation, waste, energy. In game: footpaths, wells, ponds; drains & power next.'],['Facilities','Worship, market, hall, schools, clinics, green space. In game: worship, market, hall; schools & clinics next.'],['Technical','Structure, materials, orientation, climate, appropriate technology (e.g. rainwater harvesting).']],
  aturan:null,aturanNote:'Numbers in the game (well radius, costs, flood risk) are <b>training models</b>, not regulatory values. For real practice consult the official texts and local regulations. Kampungs outside Indonesia follow their own country’s rules. Indonesian references:',
  materi:'Lectures in Lensa Permukiman',materiP:'Slides of the courses Housing & Settlement Principles (Azas) and Settlement Design (MKP), in Indonesian.',apps:'Other learning apps'}};
const LECT=[['Azas','Pengertian Rumah dan Permukiman'],['Azas','Sejarah Perumahan'],['Azas','Urbanisasi'],['Azas','Tipe Rumah'],['Azas','Contoh Survei Rusun Menanggal'],['Azas','Incremental Housing'],['MKP','Aspek Perumahan & Permukiman'],['MKP','Prasarana Perumahan & Permukiman'],['MKP','Pengadaan Perumahan & Permukiman'],['MKP','Perumahan Kepadatan Tinggi'],['MKP','Struktur Permukiman & Prasarana Perkotaan'],['MKP','Penyediaan Lahan'],['MKP','Teknologi Perumahan & Permukiman'],['MKP','Teknologi Air Bersih'],['MKP','Pembangunan oleh Masyarakat'],['MKP','Affordable Housing in Indonesia'],['MKP','Design Principles for Social Housing']];
const APPS=[['/permukiman/','Lensa Permukiman','Perumahan & permukiman'],['/arsitektur-nusantara/','Lensa Arsitektur Nusantara','Rumah adat & gaya lokal'],['/preseden/','Lensa Preseden','Foto preseden arsitektur'],['/tata-kampung/','Tata Kampung','Strategi penataan kampung']];
let pusTab='foto',pusTopic='kampung',pusSeed=1,pusNear=false;
function pustaka(tab,topic){if(tab)pusTab=tab;if(topic)pusTopic=topic;const P=PUS[lang],m=$('modal');m.classList.remove('hidden');
 const tabs=Object.keys(P.tabs).map(k=>`<button class="${k===pusTab?'on':''}" data-k="${k}">${P.tabs[k]}</button>`).join('');
 const list=a=>a.map(([h,p])=>`<div class="pz"><b>${esc(h)}</b><p>${esc(p)}</p></div>`).join('');
 let body='';
 if(pusTab==='foto'){body=`<div class="lbt pzt">${PUS_TOPICS.map(o=>`<button class="${o.k===pusTopic?'on':''}" data-t="${o.k}">${o.ic} ${o[lang]}</button>`).join('')}</div><label class="agree" style="font-weight:600"><input type="checkbox" id="pzNear" ${pusNear?'checked':''}> ${P.near}</label><div id="pzG"></div><div class="row"><button class="bigbtn alt" id="pzMore">🔀 ${P.more}</button></div><p class="note">${P.src}</p>`}
 else if(pusTab==='panduan')body=list(P.panduan);else if(pusTab==='istilah')body=list(P.istilah);else if(pusTab==='aspek')body=list(P.aspek);
 else if(pusTab==='aturan')body=`<p class="note">${P.aturanNote}</p>`+list(PUS.id.aturan);
 else body=`<h3>${P.materi}</h3><p class="note">${P.materiP}</p>`+LECT.map(([c,tt],i)=>`<a class="pz lnk" href="https://pindotutuko.id/permukiman/#materials" target="_blank" rel="noopener"><b>${c} · ${String(i<6?i+1:i-5).padStart(2,'0')}</b> ${esc(tt)} ↗</a>`).join('')+`<h3>${P.apps}</h3>`+APPS.map(a=>`<a class="pz lnk" href="https://pindotutuko.id${a[0]}" target="_blank" rel="noopener"><b>${a[1]}</b> · ${a[2]} ↗</a>`).join('');
 m.innerHTML=`<div class="box wide pzbox"><h2>📚 ${P.h}<button class="x" id="pzX" aria-label="tutup">✕</button></h2><div class="lbt pztabs">${tabs}</div><div class="pzbody">${body}</div></div>`;
 $('pzX').onclick=()=>m.classList.add('hidden');m.querySelectorAll('.pztabs button').forEach(b=>b.onclick=()=>{Snd.click();pustaka(b.dataset.k)});
 if(pusTab==='foto'){m.querySelectorAll('.pzt button').forEach(b=>b.onclick=()=>pustaka('foto',b.dataset.t));$('pzMore').onclick=()=>{pusSeed++;pustaka()};$('pzNear').onchange=e=>{pusNear=e.target.checked;pustaka()};
  const T=PUS_TOPICS.find(o=>o.k===pusTopic),o={re:T.re,album:{re:T.re},n:12,seed:pusSeed*7+3,lang:()=>lang,title:{id:'',en:''}};if(pusNear&&S)o.near={lat:S.loc.lat,lon:S.loc.lon,km:400};
  if(window.Inspirasi)window.Inspirasi.mount($('pzG'),o);else $('pzG').innerHTML=`<p>${t('errNet')}</p>`}}


/* ================= Pengaturan & kontrol keyboard ================= */
const SETN={id:{h:'Pengaturan',snd:'🔊 Suara',gfx:'🖥️ Grafis',ctl:'🎮 Kontrol',play:'⚙️ Permainan',vol:'Volume utama',amb:'Suasana (alam, kampung)',sfx:'Efek (membangun, kendaraan)',mute:'Suara aktif',q:'Kualitas grafis',qv:{auto:'Otomatis',low:'Rendah (hemat baterai)',med:'Sedang',high:'Tinggi'},shadow:'Bayangan',crowd:'Kepadatan warga & kendaraan',keys:'Pintasan keyboard',cam:'Kecepatan kamera',touch:'Kontrol sentuh: 1 jari putar, 2 jari geser & zoom',autosave:'Simpan otomatis tiap menit',tips:'Saran penasihat',ui:'Ukuran antarmuka',lang:'Bahasa',keysH:'Daftar tombol',reset:'Kembalikan bawaan',
  keyList:[['W A S D / panah','Geser kamera'],['Q / E','Putar kamera'],['+ / −  (atau R / F)','Perbesar / perkecil'],['1–9, 0','Pilih alat bangun'],['Spasi','Jeda / lanjut'],['Tab','Ganti kecepatan ▶ / ⏩'],['B','Pustaka'],['L','Peringkat'],['P','Pengaturan'],['M','Menu'],['H','Cara bermain'],['Ctrl+S','Simpan'],['Esc','Tutup jendela / kembali ke Info']]},
 en:{h:'Settings',snd:'🔊 Sound',gfx:'🖥️ Graphics',ctl:'🎮 Controls',play:'⚙️ Gameplay',vol:'Master volume',amb:'Ambience (nature, village)',sfx:'Effects (building, vehicles)',mute:'Sound on',q:'Graphics quality',qv:{auto:'Automatic',low:'Low (battery saver)',med:'Medium',high:'High'},shadow:'Shadows',crowd:'Density of people & vehicles',keys:'Keyboard shortcuts',cam:'Camera speed',touch:'Touch: 1 finger rotate, 2 fingers pan & zoom',autosave:'Autosave every minute',tips:'Advisor tips',ui:'Interface size',lang:'Language',keysH:'Key bindings',reset:'Restore defaults',
  keyList:[['W A S D / arrows','Pan camera'],['Q / E','Rotate camera'],['+ / −  (or R / F)','Zoom in / out'],['1–9, 0','Select build tool'],['Space','Pause / resume'],['Tab','Toggle speed ▶ / ⏩'],['B','Library'],['L','Leaderboard'],['P','Settings'],['M','Menu'],['H','How to play'],['Ctrl+S','Save'],['Esc','Close window / back to Info']]}};
function applySet(){document.documentElement.style.setProperty('--uiScale',SET.ui);document.body.style.zoom='';document.body.classList.toggle('ui-l',SET.ui>1.05);document.body.classList.toggle('ui-s',SET.ui<.95);if(started)R3.quality();if(started)R3.camSpeed(SET.cam);Snd.levels()}
function settings(){const T=SETN[lang],m=$('modal');m.classList.remove('hidden');
 const rng=(k,min,max,st)=>`<label class="setr"><span>${T[k]}</span><input type="range" min="${min}" max="${max}" step="${st}" value="${SET[k]}" data-k="${k}"><b>${Math.round(SET[k]*100)}%</b></label>`;
 const chk=(k,v,lab)=>`<label class="setr chk"><span>${lab||T[k]}</span><input type="checkbox" data-c="${k}" ${v?'checked':''}></label>`;
 m.innerHTML=`<div class="box wide pzbox"><h2>⚙️ ${T.h}<button class="x" id="stX" aria-label="tutup">✕</button></h2><div class="setg">
  <section><h3>${T.snd}</h3>${chk('mute',Snd.on,T.mute)}${rng('vol',0,1,.05)}${rng('amb',0,1,.05)}${rng('sfx',0,1,.05)}</section>
  <section><h3>${T.gfx}</h3><label class="setr"><span>${T.q}</span><select data-s="q">${Object.keys(T.qv).map(k=>`<option value="${k}" ${SET.q===k?'selected':''}>${T.qv[k]}</option>`).join('')}</select></label>${chk('shadow',SET.shadow)}${rng('crowd',.3,1,.1)}${rng('ui',.85,1.25,.05)}</section>
  <section><h3>${T.ctl}</h3>${chk('keys',SET.keys)}${rng('cam',.4,2,.1)}<p class="note">${T.touch}</p><table class="lb keys"><tr><th colspan="2">${T.keysH}</th></tr>${T.keyList.map(([k,v])=>`<tr><td><kbd>${k}</kbd></td><td>${v}</td></tr>`).join('')}</table></section>
  <section><h3>${T.play}</h3>${chk('autosave',SET.autosave)}${chk('tips',SET.tips)}<label class="setr"><span>${T.lang}</span><select data-s="lang"><option value="id" ${lang==='id'?'selected':''}>Bahasa Indonesia</option><option value="en" ${lang==='en'?'selected':''}>English</option></select></label><button class="bigbtn alt" id="stReset">${T.reset}</button></section></div></div>`;
 $('stX').onclick=()=>m.classList.add('hidden');
 m.querySelectorAll('input[type=range]').forEach(i=>i.oninput=()=>{SET[i.dataset.k]=+i.value;i.nextElementSibling.textContent=Math.round(i.value*100)+'%';saveSet();applySet()});
 m.querySelectorAll('input[data-c]').forEach(i=>i.onchange=()=>{const k=i.dataset.c;if(k==='mute'){if(Snd.on!==i.checked)Snd.toggle()}else SET[k]=i.checked;saveSet();applySet();if(k==='crowd'&&S)R3.villagers()});
 m.querySelectorAll('select[data-s]').forEach(sel=>sel.onchange=()=>{const k=sel.dataset.s;if(k==='lang'){lang=sel.value;store.set('baLang',lang);applyStatic();if(S){renderBar();updHUD();renderMissions()}settings();return}SET[k]=sel.value;saveSet();applySet()});
 m.querySelector('input[data-k=crowd]').onchange=()=>{if(S)R3.villagers()};
 $('stReset').onclick=()=>{Object.assign(SET,{vol:.7,amb:.8,sfx:1,q:'auto',shadow:true,crowd:1,keys:true,cam:1,autosave:true,tips:true,ui:1});saveSet();applySet();settings()}}
const keyHeld=new Set();
window.addEventListener('keydown',e=>{if(!SET.keys||!S)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.tagName==='SELECT'))return;const k=e.key.toLowerCase(),modalOpen=!$('modal').classList.contains('hidden');
 if(k==='escape'){if(modalOpen)$('modal').classList.add('hidden');else{$('menu').classList.add('hidden');$('info').classList.add('hidden');tool='info';renderBar()}return}
 if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();save(true);return}
 if(modalOpen)return;
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','e','r','f','+','=','-'].includes(k)){keyHeld.add(k);e.preventDefault();return}
 const tl=TOOLS.filter(x=>x!=='|');if(/^[0-9]$/.test(k)){const i=k==='0'?9:+k-1;const b=$('bar').querySelectorAll('.tool')[i];if(b)b.click();return}
 if(k===' '){e.preventDefault();setSpeed(speed?0:1);return}if(k==='tab'){e.preventDefault();setSpeed(speed>=3?1:speed+1);return}
 if(k==='b')pustaka(null,TOOL_TOPIC[tool]||pusTopic);else if(k==='l')board();else if(k==='p')settings();else if(k==='m')$('mBtn').click();else if(k==='h')modal(`<h2>${t('help')}</h2><p>${t('helpTxt')}</p>`)});
window.addEventListener('keyup',e=>keyHeld.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keyHeld.clear());
(function keyCam(){requestAnimationFrame(keyCam);if(!started||!keyHeld.size)return;const {camera,controls}=R3.cam(),sp=.35*SET.cam,fw=new THREE.Vector3();camera.getWorldDirection(fw);fw.y=0;fw.normalize();const rt=new THREE.Vector3(-fw.z,0,fw.x),mv=new THREE.Vector3();
 if(keyHeld.has('w')||keyHeld.has('arrowup'))mv.add(fw);if(keyHeld.has('s')||keyHeld.has('arrowdown'))mv.sub(fw);if(keyHeld.has('d')||keyHeld.has('arrowright'))mv.add(rt);if(keyHeld.has('a')||keyHeld.has('arrowleft'))mv.sub(rt);
 if(mv.lengthSq()){mv.normalize().multiplyScalar(sp);camera.position.add(mv);controls.target.add(mv)}
 const off=camera.position.clone().sub(controls.target);if(keyHeld.has('q')||keyHeld.has('e')){off.applyAxisAngle(new THREE.Vector3(0,1,0),(keyHeld.has('q')?1:-1)*.03*SET.cam)}
 if(keyHeld.has('r')||keyHeld.has('+')||keyHeld.has('='))off.multiplyScalar(1-.02*SET.cam);if(keyHeld.has('f')||keyHeld.has('-'))off.multiplyScalar(1+.02*SET.cam);
 const L0=off.length();if(L0<6)off.setLength(6);if(L0>150)off.setLength(150);camera.position.copy(controls.target).add(off)})();


/* ================= Dialog interaktif (gaya novel visual) ================= */
const WHO={elder:{face:'👴🏽',id:'Mbah Tetua Adat',en:'Village Elder'},eng:{face:'👷🏽',id:'Pak Tukang',en:'Master Builder'},eco:{face:'🧮',id:'Juru Kas',en:'Treasurer'},merchant:{face:'🧕🏽',id:'Bu Pedagang Keliling',en:'Travelling Trader'},migrant:{face:'👨‍👩‍👧',id:'Keluarga Pendatang',en:'Migrant Family'},farmer:{face:'👩🏽‍🌾',id:'Mbok Tani',en:'Farmer'},kid:{face:'🧒🏽',id:'Anak-anak',en:'Children'},guru:{face:'👩🏽‍🏫',id:'Bu Guru',en:'Teacher'}};
const D=(id,en)=>()=>lang==='en'?en:id;
const Dlg={busy:false,
 play(nodes,start,done){const q=Object.fromEntries(nodes.map((n,i)=>[n.id||('#'+i),Object.assign({_i:i},n)]));const prevSpeed=speed;setSpeed(0);this.busy=true;
  let box=$('dlg');if(!box){box=document.createElement('div');box.id='dlg';document.body.appendChild(box)}
  const end=()=>{box.classList.remove('on');this.busy=false;setSpeed(prevSpeed||1);updHUD();renderMissions();if(done)done()};
  const show=key=>{const n=q[key];if(!n)return end();const me=n.who==='me',w=me?{face:null,id:S.char.name,en:S.char.name}:WHO[n.who]||WHO.elder;
   const txt=(typeof n.t==='function'?n.t():n.t).replace('{name}',S.char.name).replace('{loc}',S.loc.name.split(',')[0]).replace('{title}',titleOf(S.loc.cc,S.era));
   box.innerHTML=`<div class="dl ${me?'me':''}"><div class="pt">${me?avatarOf(S.char):`<span>${w.face}</span>`}</div><div class="bd"><b>${esc(w[lang])}</b><p id="dlT"></p><div class="ch" id="dlC"></div></div></div>`;box.classList.add('on');
   let i=0,full=false;const P=$('dlT');const tw=setInterval(()=>{i+=2;P.textContent=txt.slice(0,i);if(i>=txt.length){clearInterval(tw);full=true;opts()}},18);
   const next=()=>n.next===null?end():show(n.next||('#'+(n._i+1)));
   const opts=()=>{const C=$('dlC');if(n.ch){C.innerHTML=n.ch.map((c,k)=>{const ok=!c.if||c.if();return `<button class="dlb" data-k="${k}" ${ok?'':'disabled'}>${esc(typeof c.t==='function'?c.t():c.t)}${c.fx&&c.cost?` <small>${esc(c.cost())}</small>`:''}</button>`}).join('');
     C.querySelectorAll('.dlb').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=n.ch[+b.dataset.k];Snd.click();if(c.fx)c.fx();if(c.go===null)return end();show(c.go||('#'+(n._i+1)))})}
    else C.innerHTML=`<button class="dlb nx">${lang==='en'?'Continue ▸':'Lanjut ▸'}</button>`,C.querySelector('.nx').onclick=e=>{e.stopPropagation();Snd.click();next()}};
   box.onclick=()=>{if(!full){clearInterval(tw);P.textContent=txt;full=true;opts()}}};
  show(start||'#0')}};
const clampRes=()=>{S.res.food=Math.max(0,Math.min(40+count('barn')*BT.barn.store,S.res.food));S.res.wood=Math.max(0,S.res.wood);S.res.coin=Math.max(0,S.res.coin);S.happy=Math.max(0,Math.min(100,S.happy));S.coh=Math.max(0,Math.min(100,S.coh))};
const fx=f=>()=>{f();clampRes();dirty=true};
function prolog(){const nm=S.char.name;Dlg.play([
 {who:'elder',t:D('Sugeng rawuh, {name}. Hutan di {loc} ini belum pernah dibuka. Warga memilihmu untuk memimpin babat alas.','Welcome, {name}. The forest at {loc} has never been opened. The people chose you to lead the clearing.')},
 {who:'elder',t:D('Pesan leluhur: buka hutan secukupnya, jaga mata air, dan bangun bersama-sama. Kampung yang baik bukan yang paling besar, tetapi yang warganya sejahtera dan rukun.','Our ancestors said: clear only what you need, guard the springs, and build together. A good kampung is not the biggest one, but one whose people prosper and live in harmony.')},
 {who:'me',t:D('Apa yang harus kita lakukan lebih dulu, Mbah?','What should we do first, Elder?'),ch:[
  {t:D('Tunjukkan caranya, Mbah.','Show me how, Elder.'),go:'tut1'},
  {t:D('Saya ingin mencoba sendiri.','I would like to try on my own.'),go:'free'}]},
 {id:'tut1',who:'eng',t:D('Pilih alat 🪓 Babat di bilah bawah, lalu ketuk petak hutan. Tiap petak memberi 4 kayu. Sisakan hutan di tepi sungai, ya.','Pick the 🪓 Clear tool in the bottom bar, then tap forest tiles. Each gives 4 timber. Keep the forest along the river.'),ch:[{t:D('Siap, pilih Babat sekarang.','Ready — select Clear now.'),fx:()=>{tool='babat';renderBar()}}]},
 {who:'farmer',t:D('Setelah ada kayu, bangun 🏠 rumah berkelompok, 💧 sumur dekat rumah, lalu 🌾 ladang. Lumbung menyelamatkan kita saat kemarau.','With timber, build 🏠 houses in a cluster, a 💧 well nearby, then 🌾 fields. A granary saves us in the dry season.')},
 {who:'eco',t:D('Hubungkan semua bangunan dengan jalan setapak. Peringkat menilai ekonomi warga, jejaring, kenyamanan, dan kepuasan — bukan hanya jumlah rumah.','Connect every building with footpaths. The ranking rewards resident economy, networking, comfort and satisfaction — not just the number of houses.')},
 {who:'elder',t:D('Kalau bingung, buka 📚 Pustaka: ada foto, istilah, dan aturan. Mari mulai, {name}.','If unsure, open the 📚 Library for photos, terms and rules. Let us begin, {name}.'),next:null},
 {id:'free',who:'elder',t:D('Baik. Mbah akan datang bila warga membutuhkan keputusanmu. Ingat, 📚 Pustaka selalu ada di pojok atas.','Very well. I will come when the people need your decision. Remember, the 📚 Library is at the top corner.'),next:null}])}
function eraDialog(){Dlg.play([
 {who:'elder',t:D('Warga berkumpul di tanah lapang. Mulai hari ini kamu dikukuhkan sebagai {title}.','The people have gathered. From today you are confirmed as {title}.')},
 {who:'me',t:D('Bagaimana kita merayakannya?','How shall we celebrate?'),ch:[
  {t:D('Adakan selamatan bersama warga','Hold a communal feast'),cost:D('−20 kas, kohesi +8','−20 funds, cohesion +8'),if:()=>S.res.coin>=20,fx:fx(()=>{S.res.coin-=20;S.coh+=8;R3.gather(20);Snd.play('fest')})},
  {t:D('Cukup doa bersama, hemat kas','Just a shared prayer, save funds'),cost:D('kohesi +3','cohesion +3'),fx:fx(()=>{S.coh+=3})}]},
 {who:'elder',t:D('Dengan gelar baru, bangunan baru bisa didirikan. Bangun balai agar warga bisa bermusyawarah.','With the new title, new buildings are available. Build a hall so people can deliberate together.'),next:null}])}
/** Kejadian warga dengan pilihan. Dipanggil dari tick secara acak. */
const EVENTS=[
 {k:'migr',ok:()=>count('house')>S.kk,n:()=>[{who:'migrant',t:D('Kami keluarga dari seberang sungai. Ladang kami tergenang. Bolehkah kami menetap di sini?','We are a family from across the river. Our fields flooded. May we settle here?'),ch:[
   {t:D('Silakan, ada rumah kosong','Welcome, there is an empty house'),cost:D('+1 KK, pangan −8','+1 household, food −8'),fx:fx(()=>{S.kk++;S.res.food-=8;S.coh-=1}),go:'a'},
   {t:D('Maaf, kampung kami belum siap','Sorry, we are not ready yet'),cost:D('bahagia −2','happiness −2'),fx:fx(()=>{S.happy-=2}),go:'b'}]},
  {id:'a',who:'elder',t:D('Pendatang membawa tenaga dan pengetahuan baru. Pastikan pangan dan air cukup.','Newcomers bring labour and new knowledge. Make sure food and water are enough.'),next:null},{id:'b',who:'elder',t:D('Keputusan yang hati-hati. Siapkan rumah bila kampung sudah mampu.','A careful decision. Prepare houses once the kampung can afford it.'),next:null}]},
 {k:'trade',ok:()=>S.res.wood>=20,n:()=>[{who:'merchant',t:D('Kayumu bagus. Bagaimana kalau 20 kayu kutukar dengan 22 kepeng?','Your timber is good. How about 22 coins for 20 timber?'),ch:[
   {t:D('Setuju, tukar','Deal'),cost:D('−20 kayu, +22 kas','−20 timber, +22 funds'),fx:fx(()=>{S.res.wood-=20;S.res.coin+=22;Snd.play('coin')}),go:null},
   {t:D('Tidak, kayu untuk membangun','No, we need it for building'),go:null}]}]},
 {k:'well',ok:()=>count('house')>=3,n:()=>[{who:'farmer',t:D('Pak/Bu {title}, sumur kami jauh. Anak-anak harus berjalan jauh membawa air.','Leader, our well is far. The children walk a long way carrying water.'),ch:[
   {t:D('Kita gotong royong menggali sumur baru','We will dig a new well together'),cost:D('−6 kayu, kohesi +5, lalu pilih alat Sumur','−6 timber, cohesion +5, then pick the Well tool'),if:()=>S.res.wood>=6,fx:fx(()=>{S.res.wood-=6;S.coh+=5;S.res.coin+=4;tool='well';renderBar()}),go:null},
   {t:D('Nanti setelah panen','After the harvest'),cost:D('bahagia −3','happiness −3'),fx:fx(()=>{S.happy-=3}),go:null}]}]},
 {k:'dispute',ok:()=>count('house')>=5,n:()=>[{who:'eco',t:D('Dua keluarga berselisih soal batas pekarangan. Mereka menunggu keputusanmu.','Two families dispute their yard boundary. They await your decision.'),ch:[
   {t:D('Musyawarah di balai','Deliberate at the hall'),if:()=>count('hall')>0,cost:D('kohesi +6','cohesion +6'),fx:fx(()=>{S.coh+=6}),go:'m'},
   {t:D('Saya putuskan sendiri','I will decide myself'),cost:D('kohesi −4, bahagia +1','cohesion −4, happiness +1'),fx:fx(()=>{S.coh-=4;S.happy+=1}),go:'s'}]},
  {id:'m',who:'elder',t:D('Musyawarah mufakat menjaga kerukunan. Balai adalah ruang bersama yang penting dalam permukiman.','Consensus keeps harmony. The hall is a vital shared space in a settlement.'),next:null},{id:'s',who:'elder',t:D('Cepat, tetapi ada yang kecewa. Kelak bangun balai untuk bermusyawarah.','Quick, but someone is disappointed. Build a hall for deliberation later.'),next:null}]},
 {k:'dry',ok:()=>S.res.food>=20&&count('barn')>0,n:()=>[{who:'farmer',t:D('Kemarau datang lebih awal. Sebagian warga mulai kekurangan pangan.','The dry season came early. Some families are running short of food.'),ch:[
   {t:D('Bagikan cadangan lumbung','Share the granary reserve'),cost:D('pangan −15, bahagia +6, kohesi +3','food −15, happiness +6, cohesion +3'),fx:fx(()=>{S.res.food-=15;S.happy+=6;S.coh+=3}),go:null},
   {t:D('Hemat cadangan untuk nanti','Save the reserve for later'),cost:D('bahagia −5','happiness −5'),fx:fx(()=>{S.happy-=5}),go:null}]}]},
 {k:'kids',ok:()=>S.kk>=6,n:()=>[{who:'kid',t:D('Pak/Bu, kami ingin belajar membaca dan menghitung!','Leader, we want to learn to read and count!'),ch:[
   {t:D('Belajar di balai bersama Bu Guru','Study at the hall with the teacher'),if:()=>count('hall')>0,cost:D('−5 kas, bahagia +5','−5 funds, happiness +5'),fx:fx(()=>{S.res.coin-=5;S.happy+=5}),go:'g'},
   {t:D('Belajar di teras rumah dulu','Study on a house veranda for now'),cost:D('bahagia +2','happiness +2'),fx:fx(()=>{S.happy+=2}),go:'g'}]},
  {id:'g',who:'guru',t:D('Pendidikan adalah sarana penting permukiman. Di era berikutnya kita bisa membangun sekolah.','Education is a key facility of a settlement. In a later era we can build a school.'),next:null}]},
 {k:'stilt',ok:()=>S.land.some(r=>r.indexOf('W')>=0)&&count('house')>=2,n:()=>[{who:'eng',t:D('Rumah dekat sungai rawan banjir. Rumah panggung, lantai ditinggikan, dan menjaga sempadan sungai mengurangi risikonya.','Houses near the river are flood-prone. Stilt houses, raised floors and keeping the river buffer reduce the risk.'),ch:[
   {t:D('Tunjukkan referensinya','Show me references'),fx:()=>setTimeout(()=>pustaka('foto','air'),300),go:null},{t:D('Terima kasih, Pak','Thank you'),go:null}]}]},
 {k:'fest',ok:()=>S.kk>=8,n:()=>[{who:'elder',t:D('Panen tahun ini baik. Warga ingin mengadakan bersih desa.','The harvest was good. The people wish to hold a village cleansing ritual.'),ch:[
   {t:D('Setuju, kita rayakan bersama','Agreed, we celebrate together'),cost:D('pangan −10, kohesi +7','food −10, cohesion +7'),if:()=>S.res.food>=10,fx:fx(()=>{S.res.food-=10;S.coh+=7;R3.gather(25);Snd.play('fest')}),go:null},
   {t:D('Tahun depan saja','Next year'),go:null}]}]}];
let lastEv=0;
function maybeEvent(){if(Dlg.busy||S.t-lastEv<5||Math.random()>.28)return false;const pool=EVENTS.filter(e=>e.ok()&&S._lastEv!==e.k);if(!pool.length)return false;const e=pool[Math.floor(Math.random()*pool.length)];lastEv=S.t;S._lastEv=e.k;Dlg.play(e.n());return true}

/* ================= Mulai ================= */
applyStatic();
(async()=>{const go=async()=>{if(TOKEN){try{const j=await api('me');ME=j.me;if(!ME.eula){try{await api('eula',{ver:EULA_VER})}catch(e){}}hub();return}catch(e){TOKEN=null;store.del('baTok')}}show('scAuth')};if(!eulaOK())showEula(go);else go()})();
window.__BA={h:(x,z)=>R3.hAt(x,z),setAva:a=>{draft.char.ava=a;renderAvEditor()},rebuild:()=>{R3.world()},weather:w=>{S.wx=w;R3.weather(w,seasonOf(calM()));R3.daylight(S.clk.h/24)},ui:()=>{updHUD();renderMissions()},style:v=>{curStyle=v},cam:(x,y,z,tx,ty,tz)=>{const o=R3.cam();o.controls.target.set(tx,ty,tz);o.camera.position.set(x,y,z)},look:(x,z,d)=>R3.look(x,z,d),dbg:()=>R3.dbg(),state:()=>S,tick,act:(k,x,y)=>{tool=k;act(x,y,true)},BT};
