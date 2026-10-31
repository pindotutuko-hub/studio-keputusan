/* Klien mode kelas bersama untuk gim pindotutuko.id · Dikembangkan oleh: Pindo Tutuko */
(function(){
"use strict";
var API='/kelas/api/index.php?r=';
var URLS={garis:'/garis-waktu/',pintu:'/arsitek-pintu/',krisis:'/krisis-kota/',kampung:'/kampung-brantas/'};
var TX={
 id:{join:"Gabung kuis kelas",h:"Gabung kuis kelas",p:"Masukkan kode sesi dari dosen. Skor dihitung ulang di server dari jawabanmu.",code:"Kode sesi",name:"Nama",nim:"NIM / ID (opsional)",go:"Gabung & mulai",cancel:"Batal",
  inClass:"Kelas: {t}",sending:"Mengirim jawaban ke kelas…",result:"Hasil kelas (dihitung server)",rank:"Peringkat sementara: {r} dari {n}",retry:"Kirim ulang",fail:"Gagal mengirim: {e}",
  e_not_found:"Kode sesi tidak ditemukan.",e_closed:"Sesi sudah ditutup dosen.",e_name_required:"Nama wajib diisi.",e_bad_code:"Kode harus 6 karakter.",e_full:"Sesi sudah penuh.",e_already_submitted:"Jawaban sudah terkirim.",e_net:"Koneksi bermasalah.",e_forbidden:"Akses ditolak.",e_bad_payload:"Data jawaban tidak valid.",moving:"Kode ini untuk gim lain — membuka gim yang benar…"},
 en:{join:"Join a class quiz",h:"Join a class quiz",p:"Enter the session code from your lecturer. Your score is recomputed on the server from your answers.",code:"Session code",name:"Name",nim:"Student ID (optional)",go:"Join & start",cancel:"Cancel",
  inClass:"Class: {t}",sending:"Sending answers to the class…",result:"Class result (server-computed)",rank:"Current rank: {r} of {n}",retry:"Resend",fail:"Sending failed: {e}",
  e_not_found:"Session code not found.",e_closed:"The session has been closed.",e_name_required:"Name is required.",e_bad_code:"The code must be 6 characters.",e_full:"The session is full.",e_already_submitted:"Answers already submitted.",e_net:"Connection problem.",e_forbidden:"Access denied.",e_bad_payload:"Invalid answer data.",moving:"This code belongs to another game — opening it…"}
};
var S={avail:false,sess:null,opts:null,res:null};
function L(){var l=S.opts&&S.opts.lang?S.opts.lang():'id';return TX[l]?l:'id'}
function t(k,v){var s=TX[L()][k]||k;if(v)for(var p in v)s=s.split('{'+p+'}').join(v[p]);return s}
function err(e){return TX[L()]['e_'+e]||t('e_net')}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function api(r,d){var o={method:d?'POST':'GET',headers:{},cache:'no-store',credentials:'same-origin'};if(d){o.headers['Content-Type']='application/json';o.body=JSON.stringify(d)}
  return fetch(API+r,o).then(function(x){return x.json().catch(function(){return {ok:false,error:'net'}})},function(){return {ok:false,error:'net'}})}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function css(){if(document.getElementById('kelasCss'))return;var s=document.createElement('style');s.id='kelasCss';s.textContent=
 '.kl-btn{border:1px solid var(--line,#ddd);background:transparent;color:var(--ink,#222);border-radius:12px;padding:10px 15px;font:inherit;font-weight:700;cursor:pointer}'+
 '.kl-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}'+
 '.kl-box{background:var(--card,#fff);color:var(--ink,#222);border:1px solid var(--line,#ddd);border-radius:18px;padding:22px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}'+
 '.kl-box h3{margin:0 0 6px;font-family:"Space Grotesk",Inter,sans-serif;font-size:20px}.kl-box p{margin:0 0 10px;color:var(--muted,#666);font-size:13px}'+
 '.kl-box label{display:grid;gap:4px;font-size:13px;font-weight:600;color:var(--muted,#666);margin:8px 0}.kl-box input{font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line,#ddd);background:var(--bg,#fafafa);color:var(--ink,#222)}'+
 '.kl-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.kl-go{background:var(--accent,#8a2b2b);color:#fff;border:0}.kl-msg{color:var(--bad,#a33);font-size:13px;min-height:1.2em;margin-top:8px}'+
 '.kl-badge{display:inline-flex;align-items:center;gap:6px;background:var(--accentSoft,#eee);color:var(--ink,#222);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}'+
 '.kl-res{border:1px solid var(--line,#ddd);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:14px}.kl-res b{font-family:"Space Grotesk",Inter,sans-serif}';
 document.head.appendChild(s)}
function openJoin(code){css();var ov=document.createElement('div');ov.className='kl-ov';
 ov.innerHTML='<form class="kl-box"><h3>'+t('h')+'</h3><p>'+t('p')+'</p><label>'+t('code')+'<input name="c" maxlength="6" autocomplete="off" autocapitalize="characters" required value="'+esc(code||'')+'"></label><label>'+t('name')+'<input name="n" maxlength="60" required value="'+esc(store('klName')||'')+'"></label><label>'+t('nim')+'<input name="m" maxlength="30"></label><div class="kl-row"><button class="kl-btn kl-go" type="submit">'+t('go')+'</button><button class="kl-btn" type="button" data-x>'+t('cancel')+'</button></div><div class="kl-msg"></div></form>';
 document.body.appendChild(ov);var f=ov.querySelector('form'),msg=ov.querySelector('.kl-msg');(code?f.n:f.c).focus();
 ov.querySelector('[data-x]').onclick=function(){ov.remove()};
 f.onsubmit=function(e){e.preventDefault();var b=f.querySelector('[type=submit]');b.disabled=true;msg.textContent='';var c=f.c.value.trim().toUpperCase();
  api('join',{code:c,name:f.n.value,nim:f.m.value,game:S.opts.game}).then(function(r){b.disabled=false;
   if(r.error==='wrong_game'&&URLS[r.game]){msg.textContent=t('moving');location.href=URLS[r.game]+'?kode='+encodeURIComponent(c);return}
   if(!r.ok){msg.textContent=err(r.error);return}
   store('klName',f.n.value);S.sess={code:c,pid:r.pid,token:r.token,title:r.title,settings:r.settings,params:r.params};S.res=null;ov.remove();S.opts.onStart(S.sess)})}}
function mount(el){if(!el||!S.avail)return;css();el.innerHTML='';var b=document.createElement('button');b.type='button';b.className='kl-btn';b.textContent=t('join');b.onclick=function(){openJoin('')};el.appendChild(b)}
function badge(){return S.sess?'<span class="kl-badge">🎓 '+esc(t('inClass',{t:S.sess.title}))+'</span>':''}
/* Submit once; renders status into box and calls back with the server result */
function submit(payload,box,fmtResult){var s=S.sess;if(!s)return;if(S.res){render();return}
 if(box)box.innerHTML='<div class="kl-res">'+t('sending')+'</div>';
 api('submit',{code:s.code,pid:s.pid,token:s.token,payload:payload}).then(function(r){
  if(r.ok){S.res=r;render();return}
  if(box){box.innerHTML='<div class="kl-res"><span style="color:var(--bad,#a33)">'+esc(t('fail',{e:err(r.error)}))+'</span> <button class="kl-btn" type="button">'+t('retry')+'</button></div>';var bt=box.querySelector('button');if(bt)bt.onclick=function(){submit(payload,box,fmtResult)}}});
 function render(){if(!box)return;var r=S.res;box.innerHTML='<div class="kl-res"><b>'+t('result')+' · '+esc(s.title)+'</b><div>'+(fmtResult?fmtResult(r.result):esc(r.result.score))+'</div><div style="color:var(--muted,#666);font-size:13px">'+t('rank',{r:r.rank,n:r.n})+'</div></div>'}}
function init(opts){S.opts=opts;if(!/^https?:$/.test(location.protocol))return;
 var to=new Promise(function(res){setTimeout(function(){res({ok:false})},4000)});
 Promise.race([api('ping'),to]).then(function(r){if(!r||!r.ok)return;S.avail=true;(opts.mounts||[]).forEach(function(id){mount(document.getElementById(id))});
  var m=/[?&]kode=([A-Za-z0-9]{6})/.exec(location.search);if(m)openJoin(m[1].toUpperCase())})}
window.Kelas={init:init,openJoin:openJoin,submit:submit,badge:badge,active:function(){return !!S.sess},session:function(){return S.sess},end:function(){S.sess=null;S.res=null},
  remount:function(){(S.opts&&S.opts.mounts||[]).forEach(function(id){mount(document.getElementById(id))})},t:t};
})();
