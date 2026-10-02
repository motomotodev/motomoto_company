/* ===== CÓDIGOS DE PROMOCIÓN ==============================================
   EDITA SOLO ESTE BLOQUE `PROMOS` para crear, cambiar o quitar códigos.
   tipo:'descuento'  → `monto` en soles, se reparte entre los platos (los precios "bajan").
                       primero:true = solo vale en el primer pedido de ese celular.
   tipo:'vipgratis'  → `pedidos` = cuántos pedidos llevan el Servicio VIP sin cobrarse.
   ===================================================================== */
const PROMOS={
  MOTOMOTO:{tipo:'descuento',monto:10,primero:true},
  PUCALLPA:{tipo:'vipgratis',pedidos:10}
};
window.MM_PROMO=(()=>{
'use strict';
const KEY='mm_promo', el=id=>document.getElementById(id), VIPLIST=2.5;
const norm=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase();
const vibe=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const ordersN=()=>{try{return (JSON.parse(localStorage.getItem('mm_orders'))||[]).length}catch(e){return 0}};

/* ---------- estado (se guarda en este dispositivo) ---------- */
function load(){
  let s=null; try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  s=s&&typeof s==='object'?s:{};
  const ok=(c,t)=>c&&PROMOS[c]&&PROMOS[c].tipo===t;
  return {
    off:ok(s.off,'descuento')?s.off:null,
    used:Array.isArray(s.used)?s.used.filter(c=>PROMOS[c]):[],
    vip:s.vip&&ok(s.vip.code,'vipgratis')&&typeof s.vip.left==='number'?{code:s.vip.code,left:Math.max(0,Math.floor(s.vip.left))}:null
  };
}
let st=load(), FX=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const vipLeft=()=>st.vip?st.vip.left:0;

/* ---------- cálculo: lo usa totals() ---------- */
function calc(rows,sub){
  let disc=0; const net={};
  const P=st.off&&PROMOS[st.off];
  if(P&&sub>0){
    const cents=rows.map(([,r])=>Math.round(r.q*r.d.p*100)), tot=cents.reduce((a,b)=>a+b,0);
    const dc=Math.min(Math.round(P.monto*100),tot); let left=dc;
    const cut=cents.map(c=>{const v=Math.floor(dc*c/tot);left-=v;return v});
    const order=cents.map((c,i)=>i).sort((a,b)=>cents[b]-cents[a]);
    for(let i=0;left>0&&order.length;i++,left--)cut[order[i%order.length]]++;
    rows.forEach(([k],i)=>{net[k]={was:cents[i]/100,now:(cents[i]-cut[i])/100}});
    disc=dc/100;
  }
  return {disc,net,vipFree:vipLeft()>0};
}

/* HTML del precio de cada plato (con el precio viejo tachado si hay descuento) */
window.rowP=(k,r,t)=>{
  const n=t.net&&t.net[k];
  if(!n||n.now===n.was)return `<span class="rc-p">${S2(r.q*r.d.p)}</span>`;
  return `<span class="rc-p dn" data-w="${n.was}" data-n="${n.now}"><s class="rc-was">${S2(n.was)}</s><b>${S2(n.now)}</b></span>`;
};

/* ---------- animaciones ---------- */
function count(node,from,to,ms,delay,fmt){
  fmt=fmt||S2; if(!node)return; node.textContent=fmt(from);
  if(reduce){node.textContent=fmt(to);return}
  const t0=performance.now()+(delay||0);
  (function tick(now){
    if(!node.isConnected)return;
    const p=Math.min(Math.max((now-t0)/ms,0),1), e=1-Math.pow(1-p,3);
    node.textContent=fmt(from+(to-from)*e); if(p<1)requestAnimationFrame(tick);
  })(performance.now());
}
function banner(kind,title,sub){
  const b=document.createElement('div'); b.className='rc-banner '+kind; b.innerHTML=`<b>${title}</b><small>${sub}</small>`; document.body.append(b);
  if(reduce){setTimeout(()=>b.remove(),3200);return}
  b.animate([{transform:'translate(-50%,-160%) scale(.8)',opacity:0},{transform:'translate(-50%,0) scale(1.07)',opacity:1,offset:.55},{transform:'translate(-50%,0) scale(1)',opacity:1}],{duration:700,easing:'cubic-bezier(.22,1.2,.36,1)',fill:'forwards'});
  setTimeout(()=>{b.animate([{opacity:1},{opacity:0,transform:'translate(-50%,-26px)'}],{duration:380,fill:'forwards'}).onfinish=()=>b.remove()},3300);
}
function rain(list,n){
  if(reduce)return; const H=innerHeight, W=innerWidth;
  for(let i=0;i<n;i++){
    const e=document.createElement('i'); e.className='rc-fall'; e.textContent=list[i%list.length];
    const sway=(Math.random()-.5)*140, rot=(Math.random()-.5)*600;
    e.style.cssText=`left:${Math.random()*W}px;top:-44px;font-size:${18+Math.random()*20}px`; document.body.append(e);
    e.animate([{transform:'translate(0,0) rotate(0)',opacity:0},{opacity:1,offset:.08},{transform:`translate(${sway}px,${H+70}px) rotate(${rot}deg)`,opacity:1}],
      {duration:1500+Math.random()*1500,delay:Math.random()*800,easing:'cubic-bezier(.3,.1,.6,1)',fill:'both'}).onfinish=()=>e.remove();
  }
}
function play(f,t){
  const paper=el('rcPaper');
  if(f.k==='off'){
    [...document.querySelectorAll('#rcItems .rc-p.dn')].forEach((p,i)=>{
      const d=380+i*150; p.style.setProperty('--d',d+'ms'); p.classList.add('dropping');
      count(p.querySelector('b'),+p.dataset.w,+p.dataset.n,1100,d);
    });
    count(el('rcDlV'),0,t.disc,1200,300,v=>'−'+S2(v));
    count(el('rcGoT'),f.tot0,t.tot,1300,350,S2);
    const big=document.querySelector('#rcPaper .rc-l.big'); if(big)restart(big,'dropfx');
    paper.classList.add('flashg'); setTimeout(()=>paper.classList.remove('flashg'),1600);
    banner('off',`🎉 ¡Código ${f.code} aplicado!`,`Ahorras ${S2(t.disc)} en tu primer pedido`);
    rain(['🏷️','💸','🪙','⬇️','🏷️','🎉'],30); vibe([18,40,18,40,30]);
  }else{
    document.querySelectorAll('#rcPaper .rc-free').forEach(x=>restart(x,'stamp'));
    if(typeof vipSparks==='function')vipSparks(f.x,f.y);
    const n=PROMOS[f.code].pedidos;
    banner('vip',`👑 ¡${f.code} activado!`,`Tus primeros ${n} pedidos son VIP y no pagas el servicio`);
    rain(['👑','✨','🎟️','⭐','💛','✨'],30); vibe([25,50,25,50,40]);
  }
}

/* ---------- pintar la boleta (se llama al final de renderReceipt) ---------- */
function ui(t){
  const paper=el('rcPaper'), left=vipLeft(), free=left>0;
  paper.classList.toggle('promo',t.disc>0); paper.classList.toggle('vipfree',!!t.vipFree);
  el('rcSubWas').textContent=t.disc>0?S2(t.sub):'';
  el('rcDlN').textContent=st.off||'';
  if(!(FX&&FX.k==='off'))el('rcDlV').textContent='−'+S2(t.disc);
  el('rcVlV').innerHTML=t.vipFree?`<s class="rc-was">${S2(VIPLIST)}</s> <b class="rc-free">GRATIS</b>`:S2(VIPLIST);
  const rp=el('rvP'); rp.classList.toggle('free',free);
  rp.innerHTML=free?`<s>+${S2(VIPLIST)}</s><b>GRATIS</b>`:'+'+S2(VIPLIST);
  el('rvSm').textContent=free?`Gratis con ${st.vip.code} · quedan ${left}`:'Prioridad en tu pedido';
  const c=[];
  if(st.off)c.push(`<div class="rp-chip off"><span class="rp-ci">🏷️</span><span class="rp-ct"><span>${st.off}</span><small>${t.disc>0?'Ahorras '+S2(t.disc):'Descuento activo'} en tu primer pedido</small></span><button type="button" data-rm="${st.off}" aria-label="Quitar código ${st.off}">✕</button></div>`);
  if(free){const n=PROMOS[st.vip.code].pedidos;
    c.push(`<div class="rp-chip vip${FX&&FX.k==='vip'?' new':''}"><span class="rp-ci">🎟️</span><span class="rp-ct"><span>${st.vip.code} · VIP gratis</span><span class="rp-pips" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="${i<left?'on':''}" style="--i:${i}"></i>`).join('')}</span><small>Te quedan ${left} de ${n} pedidos</small></span></div>`)}
  el('rpChips').innerHTML=c.join('');
  if(FX){const f=FX;FX=null;play(f,t)}
}

/* ---------- aplicar un código ---------- */
function say(msg,kind,shake){
  const m=el('rpMsg'); m.textContent=msg; m.className='rp-msg '+(kind||'');
  if(shake){const i=el('rpIn');restart(i,'bad');vibe(60)}
}
function closeForm(){el('rpForm').hidden=true;el('rpOpen').setAttribute('aria-expanded','false');el('rpIn').value='';el('rpMsg').textContent=''}
function apply(raw){
  const code=norm(raw), P=PROMOS[code];
  if(!code)return say('Escribe tu código de promoción.','err',true);
  if(!P)return say('Ese código no existe o ya venció. Revisa que esté bien escrito.','err',true);
  if(!cart.size)return say('Agrega un plato para usar tu código.','err',true);
  if(P.tipo==='descuento'){
    if(st.off===code)return say(`¡Ya tienes ${code} aplicado!`,'ok');
    if(st.used.includes(code)||(P.primero&&ordersN()>0))return say('Este código es solo para tu primer pedido.','err',true);
    const before=totals(); st.off=code; save();
    FX={k:'off',code,tot0:before.tot}; closeForm(); renderReceipt();
  }else{
    if(st.vip&&st.vip.code===code)return vipLeft()>0?say(`¡${code} ya está activo! Te quedan ${vipLeft()} pedidos VIP gratis.`,'ok'):say(`Ya usaste tus ${P.pedidos} pedidos VIP gratis.`,'err',true);
    const pr=el('rcPaper').getBoundingClientRect(), br=el('rpIn').getBoundingClientRect(), x=br.left+br.width/2-pr.left, y=br.top+br.height/2-pr.top;
    el('rcPaper').style.setProperty('--gx',x+'px'); el('rcPaper').style.setProperty('--gy',y+'px');
    st.vip={code,left:P.pedidos}; save(); window.MM_VIP=true;
    FX={k:'vip',code,x,y}; closeForm(); renderReceipt();
  }
}

/* ---------- al enviar el pedido se gastan los beneficios ---------- */
function codes(t){const a=[];if(t.disc>0&&st.off)a.push(st.off);if(t.vipFree&&st.vip)a.push(st.vip.code);return a}
function consume(t){
  if(t.disc>0&&st.off){st.used=[...new Set([...st.used,st.off])];st.off=null}
  if(t.vipFree&&st.vip)st.vip.left=Math.max(0,st.vip.left-1);
  save();
}
/* al abrir la boleta: si aún le quedan pedidos VIP gratis, el VIP va activado */
function onOpen(){if(vipLeft()>0&&cart.size)window.MM_VIP=true}

/* ---------- eventos ---------- */
el('rpOpen').onclick=()=>{
  const f=el('rpForm'), open=f.hidden; f.hidden=!open; el('rpOpen').setAttribute('aria-expanded',open);
  if(open){el('rpMsg').textContent='';setTimeout(()=>{el('rpIn').focus({preventScroll:true});f.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'})},80)}
};
el('rpGo').onclick=()=>apply(el('rpIn').value);
el('rpIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();apply(e.target.value)}});
el('rpIn').addEventListener('input',()=>{el('rpMsg').textContent='';el('rpMsg').className='rp-msg'});
el('rpChips').addEventListener('click',e=>{
  const b=e.target.closest('[data-rm]'); if(!b)return;
  if(st.off===b.dataset.rm){st.off=null;save();renderReceipt();mmToast('Código quitado')}
});

return {calc,ui,codes,consume,onOpen};
})();
renderOrder();
