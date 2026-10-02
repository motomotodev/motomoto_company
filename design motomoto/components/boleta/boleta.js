/* ---------- boleta (carrito) ---------- */
const rc=$('rc'), rcPaper=$('rcPaper'); let rcNo=String(Math.floor(100000+Math.random()*900000));
let rcOpen=false, rcLast=null, flashKey=null, rcT, rcClose;
const fee=e=>parseFloat(String(e||'').replace(/[^\d.]/g,''))||0;
function totals(){
  const rows=[...cart.entries()], g=new Map();
  rows.forEach(([k,r])=>{ if(!g.has(r.R.n))g.set(r.R.n,{r:r.R,ce:r.ce,env:fee(r.env),it:[]}); g.get(r.R.n).it.push([k,r]) });
  const groups=[...g.values()], sub=rows.reduce((s,[,r])=>s+r.q*r.d.p,0), env=groups.reduce((s,x)=>s+x.env,0);
  const P=window.MM_PROMO?MM_PROMO.calc(rows,sub):{disc:0,net:{},vipFree:false};
  const vipOn=!!(window.MM_VIP&&rows.length), vipFree=vipOn&&P.vipFree, vip=vipOn&&!vipFree?2.5:0;
  return {groups,sub,env,vip,vipList:vipOn?2.5:0,vipFree,disc:P.disc,net:P.net,subNet:sub-P.disc,tot:sub-P.disc+env+vip,n:rows.reduce((s,[,r])=>s+r.q,0)};
}
function tween(el,to,ms=700){
  const from=parseFloat(el.dataset.v||0); el.dataset.v=to;
  if(reduce||from===to){el.textContent=S2(to);return}
  const t0=performance.now();
  (function tick(t){const p=Math.min((t-t0)/ms,1),e=1-Math.pow(1-p,3);el.textContent=S2(from+(to-from)*e);if(p<1)requestAnimationFrame(tick)})(t0);
}
function barcode(){
  let a=+rcNo,x=0,o='';const rnd=()=>((a=(a*1664525+1013904223)>>>0)/4294967296);
  while(x<240){const w=1+Math.floor(rnd()*3);o+=`<rect x="${x}" width="${w}" height="40"/>`;x+=w+1+Math.floor(rnd()*3)}
  return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true">${o}</svg>`;
}
function updateGo(t){
  const a=$('rcGo');
  if(!t.n){a.classList.add('off');a.href='#';a.setAttribute('aria-disabled','true');$('rcGoT').textContent='';return}
  a.classList.remove('off');a.removeAttribute('aria-disabled');
  const msg=`Hola MotoMoto, quiero hacer este pedido (Boleta N° ${rcNo}):\n`+
    t.groups.map(g=>`\n*${g.r.n}*\n`+g.it.map(([,r])=>`• ${r.q}x ${r.d.n} – ${S2(r.q*r.d.p)}`).join('\n')).join('\n')+
    `\n\nSubtotal: ${S2(t.sub)}\nEnvío: ${S2(t.env)}${t.disc?'\n🏷️ *Descuento:* -'+S2(t.disc):''}${t.vipFree?'\n👑 *Servicio VIP:* GRATIS':t.vip?'\n👑 *Servicio VIP:* '+S2(t.vip):''}\n*Total: ${S2(t.tot)}*`+(window.MM_LOC?`\n\n📍 Ubicación de entrega: https://maps.google.com/?q=${window.MM_LOC.join(',')}`:'');
  a.href='#'; $('rcGoT').textContent=S2(t.tot);
}
function renderReceipt(){
  const t=totals();
  rcPaper.classList.toggle('empty',!t.n);
  $('rcItems').innerHTML=t.n?t.groups.map(g=>`<div class="rc-g"><div class="rc-gh"><span class="lx-logo xs" style="--lg:${logoBg(g.r.n)}">${logoInner(g.r,g.ce)}</span><span>${g.r.n}</span></div>`+
    g.it.map(([k,r])=>`<div class="rc-row${k===flashKey?' flash':''}" data-k="${k}"><div class="rc-q"><button type="button" data-a="dec" aria-label="Quitar uno de ${r.d.n}">−</button><b>${r.q}</b><button type="button" data-a="inc" aria-label="Agregar uno de ${r.d.n}">+</button></div><span class="rc-n">${r.d.n}</span>${window.rowP?rowP(k,r,t):'<span class="rc-p">'+S2(r.q*r.d.p)+'</span>'}</div>`).join('')+`</div>`).join('')
    :`<div class="rc-empty"><span>🧾</span><b>Tu boleta está vacía</b><small>Agrega platos y aparecerán aquí.</small></div>`;
  flashKey=null;
  $('rcEnvL').textContent=t.groups.length>1?`Envío (${t.groups.length} locales)`:'Envío';
  tween($('rcSub'),t.subNet); tween($('rcEnv'),t.env); tween($('rcTot'),t.tot,900); vipUI(t);
  updateGo(t);
  if(window.MM_PROMO)MM_PROMO.ui(t);
  if(window.MM_RCSIDE)MM_RCSIDE(t);
}
function openReceipt(){
  if(rcOpen)return; rcOpen=true; rcLast=document.activeElement; clearTimeout(rcClose); if(window.MM_PROMO)MM_PROMO.onOpen();
  $('rcDate').textContent=new Date().toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'});
  $('rcNoT').textContent=rcNo; $('rcCode').textContent=rcNo; $('rcBar').innerHTML=barcode();
  ['rcSub','rcEnv','rcTot'].forEach(i=>$(i).dataset.v=0);
  rcPaper.classList.remove('sent'); $('rcGo').classList.remove('sending'); $('rcGoL').textContent='Pedir';
  rc.hidden=false; rc.classList.remove('closing'); void rc.offsetWidth; rc.classList.add('open');
  document.body.style.overflow='hidden'; $('rcItems').parentNode.scrollTop=0;
  renderReceipt(); $('rcClose').focus({preventScroll:true});
}
function closeReceipt(){
  if(!rcOpen)return; rcOpen=false; rc.classList.add('closing'); rc.classList.remove('open');
  rcClose=setTimeout(()=>{rc.hidden=true;rc.classList.remove('closing');document.body.style.overflow=''},reduce?0:520);
  if(rcLast&&rcLast.focus)rcLast.focus({preventScroll:true});
}
$('rcBack').onclick=$('rcClose').onclick=$('rcMore').onclick=closeReceipt;
$('rcClear').onclick=()=>{cart.clear();renderOrder()};
$('rcItems').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]'); if(!b)return;
  const row=b.closest('.rc-row'), k=row.dataset.k, r=cart.get(k); if(!r)return;
  if(b.dataset.a==='inc'){r.q++;flashKey=k;renderOrder();return}
  if(r.q>1){r.q--;flashKey=k;renderOrder();return}
  row.classList.add('out'); setTimeout(()=>{cart.delete(k);renderOrder()},reduce?0:260);
});
$('rcGo').addEventListener('click',e=>{
  e.preventDefault();
  const a=e.currentTarget;
  if(a.classList.contains('off')){restart(a,'shake');return}
  if(a.classList.contains('sending'))return;
  const cer=totals().groups.filter(g=>cerradoR(g.r));
  if(cer.length){restart(a,'shake');mmToast(cer.map(g=>`${g.r.n}: ${cerradoR(g.r).detalle}`).join(' · ')+'. Quítalo de tu pedido para continuar.');return}
  saveOrder(totals());                                   /* se guarda en este dispositivo (localStorage) */
  rcPaper.classList.add('sent'); a.classList.add('sending'); $('rcGoL').textContent='¡Pedido guardado!';
  clearTimeout(rcT); rcT=setTimeout(()=>{
    const id=rcNo; closeReceipt();
    setTimeout(()=>{cart.clear();window.MM_VIP=false;rcNo=String(Math.floor(100000+Math.random()*900000));
      rcPaper.classList.remove('sent');a.classList.remove('sending');$('rcGoL').textContent='Pedir';renderOrder();mmToast('Pedido N° '+id+' guardado ✓')},650);
  },1700);
});
addEventListener('keydown',e=>{
  if(!rcOpen)return;
  if(e.key==='Escape'){closeReceipt();return}
  if(e.key==='Tab'){
    const f=[...rc.querySelectorAll('button:not([disabled]),a[href]')].filter(x=>x.offsetParent);
    if(!f.length)return; const i=f.indexOf(document.activeElement);
    if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
    else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
  }
});

setCat(0); renderOrder();
