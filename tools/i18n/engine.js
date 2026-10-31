/* ===== i18n EN (v3.1) — terjemahan antarmuka ID ⇄ EN di tingkat DOM. Kamus: I18N_EN (kunci = teks Indonesia, angka diganti {n}). ===== */
(function(){
  "use strict";
  var EN=window.I18N_EN||{}, KEY="sk-lang", NUM=/\d+(?:[.,]\d+)*/g;
  var lang=(function(){try{return localStorage.getItem(KEY)||"id"}catch(e){return "id"}})();
  var SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE)$/;
  var ORIG=new WeakMap(), ATTR=["placeholder","title","aria-label","data-tip"];
  var num=function(t){ if(t==null)return ""; if(/,/.test(t)){ if((t.match(/,/g)||[]).length>1) return t; return t.replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",","."); } if(/^\d{1,3}(?:\.\d{3})+$/.test(t)) return t.replace(/\./g,","); return t; };
  var tr=function(s){
    var m=s.match(/^(\s*)([\s\S]*?)(\s*)$/), core=m[2]; if(!core) return s;
    var norm=core.replace(/\s+/g," "), nums=norm.match(NUM)||[], k=norm.replace(NUM,"{n}"), v=EN[k], i=0, out;
    if(v==null){ var k2=k.replace(/^[·:\-–—\s]+|[·:\-–—\s]+$/g,""); if(k2!==k&&EN[k2]!=null){ v=k.replace(k2,EN[k2]); } }
    out = v!=null ? v.replace(/\{n\}/g,function(){return num(nums[i++])}) : core.replace(NUM,num);
    return m[1]+out+m[3];
  };
  var skipEl=function(el){ for(var e=el;e&&e!==document.body;e=e.parentElement){ if(SKIP.test(e.tagName)||e.isContentEditable||(e.classList&&e.classList.contains("no-i18n"))) return true; } return false; };
  var doText=function(n){
    var v=n.nodeValue, r=ORIG.get(n), src=(r&&r.out===v)?r.src:v;
    if(lang==="en"){ if(!/[A-Za-z0-9]/.test(src)) return; if(n.parentElement&&skipEl(n.parentElement)) return; var o=tr(src); ORIG.set(n,{src:src,out:o}); if(o!==v) n.nodeValue=o; }
    else if(r&&r.out===v&&r.src!==v){ n.nodeValue=r.src; ORIG.delete(n); }
  };
  var doAttr=function(el){
    for(var j=0;j<ATTR.length;j++){ var a=ATTR[j]; if(!el.hasAttribute(a)) continue; var v=el.getAttribute(a), sk="data-i18n-"+a.replace(/[^a-z]/g,""), so=el.getAttribute(sk), oo=el.getAttribute(sk+"o");
      var src=(so!=null&&oo===v)?so:v;
      if(lang==="en"){ var o=tr(src); el.setAttribute(sk,src); el.setAttribute(sk+"o",o); if(o!==v) el.setAttribute(a,o); }
      else if(so!=null&&oo===v){ el.setAttribute(a,so); el.removeAttribute(sk); el.removeAttribute(sk+"o"); } }
  };
  var walk=function(root){
    if(!root) return;
    if(root.nodeType===3){ doText(root); return; }
    if(root.nodeType!==1||SKIP.test(root.tagName)) return;
    doAttr(root);
    var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT), n;
    while((n=tw.nextNode())){ if(n.nodeType===3) doText(n); else if(n.hasAttribute&&(n.hasAttribute("title")||n.hasAttribute("placeholder")||n.hasAttribute("aria-label")||n.hasAttribute("data-tip"))) doAttr(n); }
  };
  var busy=false;
  var mo=new MutationObserver(function(list){
    if(busy) return; busy=true;
    try{ for(var i=0;i<list.length;i++){ var m=list[i];
      if(m.type==="characterData") doText(m.target);
      else if(m.type==="attributes"){ if(ATTR.indexOf(m.attributeName)>=0) doAttr(m.target); }
      else for(var j=0;j<m.addedNodes.length;j++) walk(m.addedNodes[j]); } } finally { busy=false; }
  });
  var titleId=document.title;
  var setBtn=function(){ var b=document.getElementById("bLang"); if(b){ b.textContent=lang==="en"?"ID":"EN"; b.title=lang==="en"?"Ganti ke Bahasa Indonesia":"Switch to English"; b.setAttribute("aria-label",b.title); } };
  var apply=function(){
    document.documentElement.lang=lang==="en"?"en":"id";
    if(lang==="en"){ titleId=titleId||document.title; document.title=tr(titleId); } else if(titleId) document.title=titleId;
    busy=true; try{ walk(document.body); } finally { busy=false; } setBtn();
  };
  window.skLang={ get:function(){return lang}, set:function(l){ lang=l==="en"?"en":"id"; try{localStorage.setItem(KEY,lang)}catch(e){} apply(); }, t:function(s){ return lang==="en"?tr(String(s)):String(s); }, tsv:function(x){ if(lang!=="en") return x; return String(x).split("\n").map(function(l){return l.split("\t").map(function(c){return tr(c)}).join("\t")}).join("\n"); } };
  var boot=function(){
    var b=document.getElementById("bLang"); if(b) b.addEventListener("click",function(){ window.skLang.set(lang==="en"?"id":"en"); });
    mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});
    apply();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
