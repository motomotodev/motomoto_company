/* ===== HORARIO · usa estadoLocal() de datos-restaurantes.js ===== */
const estadoR=R=>estadoLocal(R.data);
const cerradoR=R=>{const e=estadoR(R);return e.abierto?null:e};
function bloqueado(R){               /* true = el local está cerrado: avisa y no deja agregar */
  const e=cerradoR(R); if(!e)return false;
  mmToast(`${R.n} está cerrado · ${e.detalle}`); return true;
}
const pillHr=R=>{const e=estadoR(R);return `<span class="hr-pill${e.abierto?'':' off'}">${e.corto}${e.detalle?` <small>· ${e.detalle}</small>`:''}</span>`};
function paintEstado(){
  const R=curRest(); if(!R)return; const e=estadoR(R);
  $('lxState').className='hr-pill'+(e.abierto?'':' off');
  $('lxState').innerHTML=`${e.corto}${e.detalle?` <small>· ${e.detalle}</small>`:''}`;
  $('lxHrL').innerHTML=horarioSemana(R.data).map(d=>`<b class="${d.hoy?'hoy':''}">${d.dia}</b><span>${d.texto}</span>`).join('');
  resetAdd();
}
$('lxHrB').onclick=()=>{const L=$('lxHrL'),o=L.hidden;L.hidden=!o;$('lxHrB').setAttribute('aria-expanded',o);$('lxHrB').textContent=o?'Ocultar horario':'Ver horario'};

/* chips de categoría */
$('lxCats').innerHTML=items.map((it,i)=>`<button role="tab" data-i="${i}"><span>${it.e}</span>${it.n}</button>`).join('');
$('lxCats').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setCat(+b.dataset.i)});
function setCat(i){
  lx.cat=i; lx.r=0; lx.d=0;
  [...$('lxCats').children].forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-selected',k===i)});
  const cc=$('lxCats'), on=cc.children[i], br=on.getBoundingClientRect(), cr=cc.getBoundingClientRect(); cc.scrollTo({left:cc.scrollLeft+(br.left-cr.left)-(cr.width-br.width)/2,behavior:reduce?'auto':'smooth'}); /* solo mueve la barra, no la página */
  renderTabs(); setRest(0);
}

/* locales = pestañas arriba a la derecha */
function renderTabs(){
  $('lxTabs').innerHTML=curList().map((r,i)=>`<button data-r="${i}">${r.n}</button>`).join('');
}
$('lxTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&+b.dataset.r!==lx.r){setRest(+b.dataset.r);keepSign()}});

function setRest(i){
  lx.r=i; lx.d=0; const r=curRest(); closeMenu(true);
  [...$('lxTabs').children].forEach((b,k)=>b.classList.toggle('on',k===i));
  { const tb=$('lxTabs'), el=tb.children[i];
    if(el){const tr=tb.getBoundingClientRect(), br=el.getBoundingClientRect();
      tb.scrollTo({left:tb.scrollLeft+(br.left-tr.left)-(tr.width-br.width)/2,behavior:reduce?'auto':'smooth'})} }
  $('lxRest').textContent=r.n; $('lxTag').textContent=r.tag; paintLogo($('lxLogo'),r);
  $('lxVert').innerHTML=`★ ${r.r}   ·   ${r.t}   ·   ${r.env.replace(/\s*envío/i,'')}<span class="vx"> envío</span>   ·   ${r.a}`;
  $('lxChips').innerHTML=[['⭐',r.r,'Calif.'],['⏱️',r.t,'Tiempo'],['🛵',r.env.replace(/\s*envío/i,''),'Envío'],['📍',r.a,'Zona']]
    .map(([i,v,l])=>`<span class="lx-chip"><i>${i}</i><b>${v}</b><small>${l}</small></span>`).join('');
  restart(lxSign,'run');                       /* el cartel vuelve a caer y balancearse */
  $('lxCards').innerHTML=r.dishes.map((d,k)=>`
    <button class="lx-c" data-d="${k}" aria-label="${d.n}, ${S(d.p)}">
      <span class="p">${art(d)}</span><em>${S(d.p)}</em><b>${d.n}</b>
    </button>`).join('');
  $('lxDots').innerHTML=r.dishes.map((d,k)=>`<button data-d="${k}" aria-label="Plato ${k+1}"></button>`).join('');
  setDish(0); $('lxHrL').hidden=true; $('lxHrB').textContent='Ver horario'; paintEstado();
}

/* plato seleccionado = panel grande */
function setDish(k,animate=true){
  lx.d=k; const r=curRest(), d=curDish(), nx=r.dishes[(k+1)%r.dishes.length];
  $('lxDish').innerHTML=art(d); $('lxNextE').innerHTML=art(nx);
  $('lxName').textContent=d.n; $('lxDesc').textContent=d.d; $('lxPrice').textContent=S2(d.p); $('lxTime').textContent=d.t;
  [...$('lxCards').children].forEach((b,i)=>b.classList.toggle('on',i===k));
  [...$('lxDots').children].forEach((b,i)=>b.classList.toggle('on',i===k));
  resetAdd(); $('lxMenuN').textContent=full().length;
  if(animate&&!reduce){restart(lxPlate,'swap');restart(lxInfo,'swap')}
}
$('lxCards').addEventListener('click',e=>{const b=e.target.closest('.lx-c');if(b)setDish(+b.dataset.d)});
$('lxDots').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setDish(+b.dataset.d)});
$('lxNext').onclick=()=>setDish((lx.d+1)%curRest().dishes.length);

/* agregar al carrito */
let addT;
const addLbl=()=>cerradoR(curRest())?'Local cerrado':matchMedia('(max-width:768px)').matches?'Agregar':'Agregar al carrito';
function resetAdd(){clearTimeout(addT);$('lxAdd').classList.remove('ok');$('lxAdd').classList.toggle('closed',!!cerradoR(curRest()));$('lxAddT').textContent=addLbl();$('lxAddI').textContent='+'}
$('lxAdd').onclick=()=>{
  if(bloqueado(curRest()))return;
  const d=curDish(), k=`${lx.cat}|${lx.r}|${lx.d}`, row=cart.get(k);
  row?row.q++:cart.set(k,{d,rest:curRest().n,env:curRest().env,R:curRest(),ce:items[lx.cat].e,q:1});
  fly(); renderOrder();
  $('lxAdd').classList.add('ok'); $('lxAddT').textContent='¡Agregado!'; $('lxAddI').textContent='✓';
  clearTimeout(addT); addT=setTimeout(resetAdd,1600);
};
function bump(){restart(mOpen?$('lxCartM'):$('lxCartB'),'bump')}
function fly(srcEl){
  if(reduce){bump();return}
  const src=srcEl||$('lxDish'), a=src.getBoundingClientRect(), b=(mOpen?$('lxCartM'):$('lxCartB')).getBoundingClientRect();
  const size=Math.min(a.width,a.height)||140;
  const g=document.createElement('span'); g.className='lx-fly'; g.innerHTML=src.innerHTML;
  g.style.cssText=`left:${a.left+a.width/2-size/2}px;top:${a.top+a.height/2-size/2}px;width:${size}px;height:${size}px;font-size:${size*.62}px`;
  document.body.appendChild(g);
  const dx=b.left+b.width/2-(a.left+a.width/2), dy=b.top+b.height/2-(a.top+a.height/2);
  g.animate([
    {transform:'translate(0,0) scale(1) rotate(0)',opacity:1},
    {transform:`translate(${dx*.4}px,${dy*.4-60}px) scale(.5) rotate(140deg)`,opacity:1,offset:.55},
    {transform:`translate(${dx}px,${dy}px) scale(.06) rotate(320deg)`,opacity:.3}
  ],{duration:800,easing:'cubic-bezier(.45,0,.7,.4)'}).onfinish=()=>{g.remove();bump()};
}
function renderOrder(){
  const t=totals();
  $('lxN').textContent=t.n; document.querySelectorAll('.cb-l').forEach(x=>x.textContent=t.n?`Mi pedido · ${S2(t.subNet)}`:'Mi pedido'); $('lxCartB').classList.toggle('has',t.n>0); $('lxNM').textContent=t.n; $('lxCartM').classList.toggle('has',t.n>0);
  $('lxOrder').hidden=!t.n; window.MM_NAV&&MM_NAV.cart(t);
  $('lxSumB').textContent=`${t.n} ${t.n===1?'plato':'platos'} · ${S2(t.subNet)}`;
  $('lxSumS').textContent=t.groups.flatMap(g=>g.it).map(([,r])=>`${r.q}x ${r.d.n}`).join(', ');
  if(rcOpen)renderReceipt();
}
$('lxCartB').onclick=$('lxCartM').onclick=$('lxSee').onclick=()=>openReceipt();

/* entrada desde el principal: "Ver locales" baja al apartado con la categoría que se está viendo */
function goLocales(e){
  if(e)e.preventDefault();
  if(lx.cat!==cur)setCat(cur);
  $('locales').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
$('openLocales').addEventListener('click',goLocales);
document.querySelector('.tabs span').addEventListener('click',()=>goLocales());
