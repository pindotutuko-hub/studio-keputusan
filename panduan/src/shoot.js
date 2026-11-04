// node shoot.js plan.json  → menulis gambar layar sesuai rencana
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
(async()=>{ const plan=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); const dir=path.dirname(path.resolve(process.argv[2]));
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:plan.viewport||{width:1366,height:860},deviceScaleFactor:1.5}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 if(plan.init) await p.addInitScript(plan.init);
 await p.goto(plan.url,{waitUntil:'load'}); await p.waitForTimeout(plan.wait||1500);
 for(const s of plan.shots){ if(s.js) await p.evaluate(s.js); await p.waitForTimeout(s.wait||900);
   const o={path:path.join(dir,s.file),type:'jpeg',quality:82};
   if(s.el){ const e=await p.$(s.el); if(!e){ console.log('NO EL',s.el); continue; } await e.screenshot(o); }
   else { if(s.clipH) o.clip={x:0,y:s.y||0,width:(plan.viewport||{width:1366}).width,height:s.clipH}; if(s.full) o.fullPage=true; await p.screenshot(o); }
   if(s.hl){ const vw=(plan.viewport||{width:1366}).width, vh=s.clipH||(plan.viewport||{height:860}).height, y0=s.y||0;
     const boxes=await p.evaluate(([hl,vw,vh,y0])=>hl.map(q=>{ let e=null; if(q.startsWith('h:')){ const t=q.slice(2); const h=[...document.querySelectorAll('h1,h2,h3,h4,b,label,button')].find(x=>x.offsetParent&&x.textContent.trim().startsWith(t)); e=h&&(h.closest('.card,.kpis,fieldset')||((h.parentElement&&h.parentElement.getBoundingClientRect().height<innerHeight*0.85&&h.parentElement.tagName!=='SECTION')?h.parentElement:h)); } else if(q.startsWith('t:')){ const t=q.slice(2); e=[...document.querySelectorAll('button,a,label,select,input')].find(x=>x.offsetParent&&x.textContent.trim().startsWith(t)); } else e=document.querySelector(q); if(!e) return null; const r=e.getBoundingClientRect(); return [Math.max(0,r.left/vw),Math.max(0,(r.top-y0)/vh),Math.min(1,r.right/vw),Math.min(1,(r.bottom-y0)/vh)]; }),[s.hl,vw,vh,y0]);
     fs.writeFileSync(path.join(dir,s.file+'.hl.json'),JSON.stringify(boxes)); }
   console.log('ok',s.file); }
 console.log('errs',errs.slice(0,3)); await b.close(); })();
