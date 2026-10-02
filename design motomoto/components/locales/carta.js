/* ---------- carta completa del local ---------- */
let mOpen=false, mTimer;
const card=$('lxCard'), mxTrack=$('mxTrack'), mxStage=$('mxStage'), favs=new Set((()=>{try{return JSON.parse(localStorage.getItem('mm_favs'))||[]}catch(e){return[]}})());
lx.s=0; lx.sub='all';
const HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-8-4.9-9.5-10C1.6 7.6 3.7 4.5 7 4.5c2 0 3.800 1.100 5 3 1.200-1.900 3-3 5-3 3.300 0 5.400 3.100 4.500 6.500C20 16.100 12 21 12 21z"/></svg>';
const CLOCK='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const vis=()=>parseInt(getComputedStyle(mxStage).getPropertyValue('--vis'))||3;

/* subcategorías: cada local define las suyas en datos-restaurantes.js (subcategorias + subcategoria de cada producto) */
const subsOf=r=>(r.data&&r.data.subcategorias)||[];
function paintSubs(){
  const box=$('mxSubs'), subs=subsOf(curRest()), all=full();
  box.hidden=!subs.length; box.scrollLeft=0;
  if(!subs.length){box.innerHTML='';return}
  const chip=(id,e,n,c)=>`<button class="mx-sub${lx.sub===id?' on':''}" type="button" role="tab" aria-selected="${lx.sub===id}" data-sub="${id}"><i>${e}</i>${n}<em>${c}</em></button>`;
  box.innerHTML=chip('all','🍽️','Todos',all.length)
    +subs.filter(x=>all.some(d=>d.sc===x.id)).map(x=>chip(x.id,x.emoji||'',x.nombre,all.filter(d=>d.sc===x.id).length)).join('');
}
function paintTrack(){
  /* data-k conserva el índice real del producto, así favoritos y carrito siguen funcionando aunque haya filtro */
  const f=full().map((d,k)=>({d,k})).filter(x=>lx.sub==='all'||x.d.sc===lx.sub);
  mxTrack.innerHTML=f.map(({d,k},j)=>{
    const key=`${lx.cat}|${lx.r}|${k}`, on=favs.has(key);
    return `<article class="mx-c" data-k="${k}" style="--k:${j}">
      <span class="mx-emo">${art(d)}</span>
      <span class="mx-time">${CLOCK}${d.t}</span>
      <h4>${d.n}</h4><p>${d.d}</p>
      <div class="mx-foot">
        <div class="mx-pr"><small>Precio</small><b>${S(d.p)}</b></div>
        <button class="mx-heart${on?' on':''}" type="button" aria-label="Favorito" aria-pressed="${on}">${HEART}</button>
      </div>
      <button class="mx-add" type="button"><span>Agregar</span><i>+</i></button>
    </article>`}).join('');
}
function buildMenu(){
  const r=curRest();
  card.style.setProperty('--fondo',r.data&&r.data.fondo?`url("${r.data.fondo}")`:'none');
  $('mxTag').textContent=r.tag; $('mxName').textContent=r.n; paintLogo($('mxLogo'),r);
  $('mxSub').textContent=`★ ${r.r}  ·  ${r.t}  ·  ${r.env}  ·  ${r.a}`;
  paintSubs(); paintTrack();
}
$('mxSubs').addEventListener('click',e=>{
  const b=e.target.closest('.mx-sub'); if(!b||b.dataset.sub===lx.sub)return;
  const bx=$('mxSubs'); lx.sub=b.dataset.sub; lx.s=0;
  [...bx.children].forEach(x=>{const o=x===b;x.classList.toggle('on',o);x.setAttribute('aria-selected',o)});
  paintTrack();
  mxTrack.style.transition='none'; slide(); void mxTrack.offsetWidth; mxTrack.style.transition='';
  [...mxTrack.children].forEach(c=>c.classList.add('pop'));
  const br=b.getBoundingClientRect(), cr=bx.getBoundingClientRect();   /* solo mueve la barra, no la página */
  bx.scrollTo({left:bx.scrollLeft+(br.left-cr.left)-(cr.width-br.width)/2,behavior:reduce?'auto':'smooth'});
});
function slide(){
  const c=[...mxTrack.children], n=c.length, v=vis(), max=Math.max(0,n-v);
  lx.s=Math.min(Math.max(lx.s,0),max);
  if(n)mxTrack.style.transform=`translateX(${-c[lx.s].offsetLeft}px)`;
  c.forEach((el,i)=>{el.inert=i<lx.s||i>=lx.s+v});
  $('mxL').disabled=lx.s===0; $('mxR').disabled=lx.s>=max;
  const bar=$('mxBar'); bar.style.width=(Math.min(v,n)/Math.max(n,1)*100)+'%'; bar.style.left=(lx.s/Math.max(n,1)*100)+'%';
  $('mxCount').textContent=n===1?'1 producto':`${lx.s+1}–${Math.min(lx.s+v,n)} de ${n} productos`;
}
function openMenu(at){
  if(mOpen)return; mOpen=true; clearTimeout(mTimer);
  const cr=card.getBoundingClientRect(), br=$('lxMenuB').getBoundingClientRect();
  card.style.setProperty('--vx',(br.left+br.width/2-cr.left)+'px');
  card.style.setProperty('--vy',(br.top+br.height/2-cr.top)+'px');
  lx.sub='all'; buildMenu(); lx.s=typeof at==='number'?at:0;
  $('lxMenuB').classList.add('go');
  card.classList.add('dk');                       /* 1) el cartel se oscurece desde el botón */
  mTimer=setTimeout(()=>{                         /* 2) recién ahí salen las cards */
    $('lxMenuB').classList.remove('go');
    card.classList.add('dk2'); slide();
    [...mxTrack.children].forEach(c=>c.classList.add('pop'));
    
    $('mxBack').focus({preventScroll:true});
  },reduce?0:850);
}
function closeMenu(silent){
  if(!mOpen)return; mOpen=false; clearTimeout(mTimer);
  $('lxMenuB').classList.remove('go');
  card.classList.remove('dk2'); void card.offsetWidth; card.classList.remove('dk');
  if(!silent)$('lxMenuB').focus({preventScroll:true});
}
$('lxMenuB').onclick=()=>openMenu();
$('mxBack').onclick=()=>closeMenu();
addEventListener('keydown',e=>{if(e.key==='Escape'&&!rcOpen)closeMenu()});
$('mxL').onclick=()=>{lx.s--;slide()};
$('mxR').onclick=()=>{lx.s++;slide()};
addEventListener('resize',()=>{if(mOpen)slide()});
$('mxView').addEventListener('scroll',e=>{e.target.scrollLeft=0});

/* deslizar con el dedo */
let sx=null;
$('mxView').addEventListener('pointerdown',e=>sx=e.clientX);
$('mxView').addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>45){lx.s+=dx<0?1:-1;slide()}});

/* corazón + agregar */
mxTrack.addEventListener('click',e=>{
  const c=e.target.closest('.mx-c'); if(!c)return; const k=+c.dataset.k, key=`${lx.cat}|${lx.r}|${k}`;
  const h=e.target.closest('.mx-heart');
  if(h){
    favs.has(key)?favs.delete(key):favs.add(key);
    h.classList.toggle('on',favs.has(key)); h.setAttribute('aria-pressed',favs.has(key));
    restart(h,'beat'); window.MM_NAV&&MM_NAV.favs(); return;
  }
  const a=e.target.closest('.mx-add');
  if(a){
    if(bloqueado(curRest()))return;
    const d=full()[k], row=cart.get(key);
    row?row.q++:cart.set(key,{d,rest:curRest().n,env:curRest().env,R:curRest(),ce:items[lx.cat].e,q:1});
    fly(c.querySelector('.mx-emo')); renderOrder();
    a.classList.add('ok'); a.firstChild.textContent='¡Agregado!'; a.lastChild.textContent='✓';
    clearTimeout(a._t); a._t=setTimeout(()=>{a.classList.remove('ok');a.firstChild.textContent='Agregar';a.lastChild.textContent='+'},1500);
  }
});
