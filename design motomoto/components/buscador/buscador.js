/* ===== BUSCADOR ===== */
(()=>{
const row=$('sxRow'),inp=$('sxIn'),pan=$('sxPanel'),scr=$('sxScrim'),clr=$('sxX');
const N=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IDX=[{t:'p',e:'📦',n:'Enviar un paquete',s:'Envía algo a otra persona',h:N('paquete paquetes envio envios enviar encomienda mensajeria')}];
items.forEach((it,c)=>{
  IDX.push({t:'c',c,e:it.e,n:it.n,s:'Categoría',h:N(it.n+' '+it.l1+' '+it.l2)});
  (LOCALES[it.n]||[]).forEach((R,r)=>{
    IDX.push({t:'r',c,r,e:it.e,n:R.n,s:`${R.a} · ★ ${R.r}`,h:N(R.n+' '+R.tag+' '+R.a+' '+it.n)});
    R.dishes.concat(EXTRA[R.n]||[]).forEach((d,k)=>IDX.push({t:'d',c,r,k,e:d.e,n:d.n,s:`${R.n} · ${S(d.p)}`,h:N(d.n+' '+d.d+' '+it.n)}));
  });
});
const toks=q=>N(q).split(/\s+/).filter(Boolean);
function find(q){
  const T=toks(q),g={p:[],c:[],r:[],d:[]};
  IDX.forEach(x=>{let s=0;for(const t of T){const i=x.h.indexOf(t);if(i<0){s=-1;break}s+=i===0?3:x.h.includes(' '+t)?2:1}if(s>=0)g[x.t].push([s,x])});
  for(const k in g)g[k]=g[k].sort((a,b)=>b[0]-a[0]).map(a=>a[1]);
  return g;
}
const hl=(t,T)=>{const n=N(t);for(const k of T){const i=n.indexOf(k);if(i>=0)return esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+k.length))+'</mark>'+esc(t.slice(i+k.length))}return esc(t)};
const recents=()=>{try{return JSON.parse(localStorage.getItem('mm_rec'))||[]}catch(e){return[]}};
const remember=q=>{q=q.trim();if(!q)return;try{localStorage.setItem('mm_rec',JSON.stringify([q,...recents().filter(x=>x!==q)].slice(0,5)))}catch(e){}};
const catChips=()=>`<div class="sx-chips">${items.map((it,i)=>`<button type="button" data-c="${i}">${it.e} ${it.n}</button>`).join('')}<button type="button" data-p>📦 Enviar paquete</button></div>`;
let list=[],act=-1;
function render(){
  const q=inp.value.trim();list=[];let h='';
  if(!q){
    const rec=recents();
    if(rec.length)h+=`<div class="sx-h">Recientes<button type="button" data-clr>Borrar</button></div><div class="sx-chips">${rec.map(x=>`<button type="button" data-q="${esc(x)}">🕘 ${esc(x)}</button>`).join('')}</div>`;
    h+=`<div class="sx-h">Categorías populares</div>`+catChips();
  }else{
    const g=find(q),T=toks(q);
    [['p','Servicios',1],['c','Categorías',2],['r','Locales',4],['d','Platos',6]].forEach(([k,l,m])=>{
      const a=g[k].slice(0,m);if(!a.length)return;h+=`<div class="sx-h">${l}</div>`;
      a.forEach(x=>{list.push(x);h+=`<button type="button" class="sx-r" role="option" data-i="${list.length-1}" style="--i:${list.length-1}"><span class="sx-e">${x.e}</span><span class="sx-t"><b>${hl(x.n,T)}</b><small>${esc(x.s)}</small></span><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`});
    });
    if(!list.length)h=`<div class="sx-none"><span>🔎</span><b>Sin resultados para “${esc(q)}”</b><small>Prueba otra palabra o elige una categoría</small></div>`+catChips();
  }
  pan.innerHTML=h;act=-1;
}
const open=()=>{row.classList.add('on');scr.classList.add('on');inp.setAttribute('aria-expanded','true');render()};
const shut=()=>{row.classList.remove('on');scr.classList.remove('on');inp.setAttribute('aria-expanded','false')};
function pick(x){
  if(x.t==='p'){inp.value='';clr.classList.remove('on');shut();inp.blur();setTimeout(()=>window.MM_PACK&&window.MM_PACK(),150);return}
  remember(inp.value.trim()||x.n);
  inp.value='';clr.classList.remove('on');shut();inp.blur();
  setCat(x.c);
  if(x.t!=='c')setRest(x.r);
  if(x.t==='d'&&x.k<3)setDish(x.k);
  $('locales').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  if(x.t==='d'&&x.k>=3)setTimeout(()=>openMenu(x.k),reduce?0:750);
  else if(x.menu)setTimeout(()=>openMenu(0),reduce?0:750);   /* «Ver carta»: entra directo a todos los productos */
}
window.MM_GO=pick;
inp.addEventListener('focus',open);
inp.addEventListener('input',()=>{if(!row.classList.contains('on'))open();else render();clr.classList.toggle('on',!!inp.value)});
scr.onclick=()=>{shut();inp.blur()};
clr.onclick=()=>{inp.value='';clr.classList.remove('on');inp.focus();render()};
pan.addEventListener('mousedown',e=>e.preventDefault());   /* no pierde el foco al tocar */
pan.addEventListener('click',e=>{
  const r=e.target.closest('.sx-r'),c=e.target.closest('[data-c]'),q=e.target.closest('[data-q]');
  if(r)pick(list[+r.dataset.i]);
  else if(c)pick({t:'c',c:+c.dataset.c,n:items[+c.dataset.c].n});
  else if(q){inp.value=q.dataset.q;clr.classList.add('on');render()}
  else if(e.target.closest('[data-p]'))pick({t:'p'})
  else if(e.target.closest('[data-clr]')){try{localStorage.removeItem('mm_rec')}catch(_){}render()}
});
inp.addEventListener('keydown',e=>{
  const rs=[...pan.querySelectorAll('.sx-r')];
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!rs.length)return;act=(act+(e.key==='ArrowDown'?1:-1)+rs.length)%rs.length;rs.forEach((b,i)=>b.classList.toggle('act',i===act));rs[act].scrollIntoView({block:'nearest'})}
  else if(e.key==='Enter'){e.preventDefault();const x=list[act>=0?act:0];if(x)pick(x)}
  else if(e.key==='Escape'){shut();inp.blur()}
});
addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if((e.key==='/'&&!typing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();scrollTo({top:0});inp.focus()}
});
const H=['¿Qué es lo que buscas?','Prueba “pizza”…','Prueba “sushi”…','Busca un local o un plato…'];let hi=0;
setInterval(()=>{if(document.activeElement!==inp&&!inp.value){hi=(hi+1)%H.length;inp.placeholder=H[hi]}},3200);
})();
