/* ===== BARRA INFERIOR MÓVIL: navegación + hojas de Pedidos / Favoritos / Perfil ===== */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const nav=$('mn'), sheet=$('ms'), scrim=$('msScrim'), body=$('msB'), title=$('msT'), head=$('msHead');
if(!nav||!sheet)return;
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches, mob=matchMedia('(max-width:768px)');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rd=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const buzz=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
const again=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const TABS=['home','menu','orders','favs','profile'];
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.9-9.5-10C1.6 7.6 3.7 4.5 7 4.5c2 0 3.8 1.1 5 3 1.2-1.9 3-3 5-3 3.3 0 5.4 3.1 4.5 6.5C20 16.1 12 21 12 21z"/></svg>';
let scrollTab='home', sheetTab=null, closeT;

/* ---------- barra: pestaña activa ---------- */
function paintNav(){
  const t=sheetTab||scrollTab;
  nav.style.setProperty('--a',Math.max(0,TABS.indexOf(t)));
  nav.querySelectorAll('.mn-i').forEach(b=>{
    const on=b.dataset.t===t; b.classList.toggle('on',on);
    on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');
  });
}
let raf=0;
function spy(){
  raf=0; const l=$('locales'); if(!l)return;
  scrollTab=l.getBoundingClientRect().top<innerHeight*.55?'menu':'home';
  if(!sheetTab)paintNav();
}
addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(spy)},{passive:true});
addEventListener('resize',()=>{if(!mob.matches)closeSheet()});

/* ---------- el teclado no debe empujar la barra ---------- */
const isField=el=>!!el&&el.matches&&el.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,select');
addEventListener('focusin',e=>{if(mob.matches&&isField(e.target)){
  document.documentElement.classList.add('mn-kb');
  if(sheet.contains(e.target))setTimeout(()=>e.target.scrollIntoView({block:'center',behavior:rm?'auto':'smooth'}),250);
}});
addEventListener('focusout',()=>setTimeout(()=>{if(!isField(document.activeElement))document.documentElement.classList.remove('mn-kb')},80));

/* ---------- hoja inferior ---------- */
const T={orders:{t:'Mis pedidos',paint:()=>paintOrders()},favs:{t:'Mis favoritos',paint:()=>paintFavs()},profile:{t:'Mi perfil',paint:()=>paintProfile()}};
function openSheet(k){
  if(sheetTab===k){closeSheet();return}
  const first=!sheetTab; clearTimeout(closeT);
  sheetTab=k; title.textContent=T[k].t; T[k].paint();
  sheet.hidden=false; scrim.hidden=false; sheet.style.transform='';
  void sheet.offsetWidth; sheet.classList.add('open'); scrim.classList.add('open');
  body.scrollTop=0; if(!first&&!rm)again(body,'swap');
  paintNav();
}
function closeSheet(){
  if(!sheetTab)return; sheetTab=null;
  sheet.classList.remove('open'); scrim.classList.remove('open'); paintNav();
  closeT=setTimeout(()=>{if(!sheetTab){sheet.hidden=true;scrim.hidden=true}},rm?0:340);
}
scrim.addEventListener('click',closeSheet);
$('msX').addEventListener('click',()=>{buzz();closeSheet()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&sheetTab)closeSheet()});

/* deslizar hacia abajo para cerrar */
let y0=null, dy=0;
head.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;y0=e.clientY;dy=0;sheet.style.transition='none';try{head.setPointerCapture(e.pointerId)}catch(_){}});
head.addEventListener('pointermove',e=>{if(y0===null)return;dy=Math.max(0,e.clientY-y0);sheet.style.transform=`translateY(${dy}px)`});
const endDrag=()=>{if(y0===null)return;y0=null;sheet.style.transition='';const far=dy>90;if(far){closeSheet()}sheet.style.transform='';dy=0};
head.addEventListener('pointerup',endDrag); head.addEventListener('pointercancel',endDrag);

/* ---------- toques en la barra ---------- */
const toLocales=()=>{$('locales').scrollIntoView({behavior:rm?'auto':'smooth',block:'start'})};
nav.addEventListener('click',e=>{
  const b=e.target.closest('.mn-i'); if(!b)return; buzz();
  const t=b.dataset.t;
  if(t==='home'){closeSheet();if(typeof mOpen!=='undefined'&&mOpen)closeMenu(true);scrollTo({top:0,behavior:rm?'auto':'smooth'})}
  else if(t==='menu'){closeSheet();toLocales()}
  else openSheet(t);
});

/* ---------- utilidades de datos ---------- */
const dishesOf=R=>R.dishes.concat(EXTRA[R.n]||[]);
function findDish(local,plato){
  for(let ci=0;ci<items.length;ci++){
    const L=LOCALES[items[ci].n]||[];
    for(let ri=0;ri<L.length;ri++){
      if(L[ri].n!==local)continue;
      const k=dishesOf(L[ri]).findIndex(x=>x.n===plato);
      if(k>-1)return {key:`${ci}|${ri}|${k}`,d:dishesOf(L[ri])[k],R:L[ri],ci};
    }
  }
  return null;
}
function favList(){
  return [...favs].reverse().map(key=>{
    const [ci,ri,k]=key.split('|').map(Number), R=(LOCALES[(items[ci]||{}).n]||[])[ri], d=R&&dishesOf(R)[k];
    return d?{key,ci,ri,k,d,R}:null;
  }).filter(Boolean);
}
function addToCart(key,d,R,ci){
  if(bloqueado(R))return;
  const row=cart.get(key);
  row?row.q++:cart.set(key,{d,rest:R.n,env:R.env,R,ce:items[ci].e,q:1});
  renderOrder();
}
const empty=(e,t,s,b,go)=>`<div class="ms-empty"><span>${e}</span><b>${t}</b><small>${s}</small>${b?`<button type="button" class="ms-cta" data-go="${go}">${b}</button>`:''}</div>`;

/* ---------- PEDIDOS ---------- */
const ESTADO={pendiente:'Pendiente'};
function orderCard(o){
  const d=new Date(o.fecha), when=isNaN(d)?'':d.toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const locs=(o.locales||[]).map(l=>`<div class="od-l"><b>${esc(l.local)}</b><span>${(l.items||[]).map(i=>`${esc(i.cant)}× ${esc(i.plato)}`).join(', ')}</span></div>`).join('');
  const st=ESTADO[o.estado]||esc(o.estado||'Pendiente');
  return `<article class="od"><header><div><b>Pedido N° ${esc(o.id)}</b><small>${when}</small></div><span class="od-st">${st}</span></header>${locs}
    <footer><b>${S2(+o.total||0)}</b>${o.descuento>0?`<small class="od-save">🏷️ ahorraste ${S2(+o.descuento)}</small>`:''}<button type="button" class="ms-ghost" data-re="${esc(o.id)}">Pedir de nuevo</button></footer></article>`;
}
function paintOrders(){
  const t=totals(), list=rd('mm_orders',[]); let h='';
  if(t.n){
    const names=t.groups.flatMap(g=>g.it).map(([,r])=>`${r.q}× ${esc(r.d.n)}`).join(' · ');
    h+=`<div class="pd-now"><div class="pd-nt"><small>🧾 Tu boleta actual</small><b>${t.n} ${t.n===1?'plato':'platos'} · ${S2(t.subNet)}</b><p>${names}</p></div>
      <button type="button" class="ms-cta" data-act="boleta">Ver boleta y pedir <i>→</i></button></div>`;
  }
  if(list.length)h+=`<h4 class="ms-sec">Historial <em>${list.length}</em></h4>`+list.map(orderCard).join('');
  else if(!t.n)h=empty('🛵','Aún no tienes pedidos','Cuando hagas tu primer pedido lo verás aquí para repetirlo con un toque.','Explorar el menú','menu');
  body.innerHTML=h;
}
function reorder(id){
  const o=rd('mm_orders',[]).find(x=>String(x.id)===String(id)); if(!o)return;
  let add=0, miss=0;
  (o.locales||[]).forEach(l=>(l.items||[]).forEach(it=>{
    const f=findDish(l.local,it.plato); if(!f||cerradoR(f.R)){miss++;return}
    const row=cart.get(f.key), q=Math.max(1,+it.cant||1);
    row?row.q+=q:cart.set(f.key,{d:f.d,rest:f.R.n,env:f.R.env,R:f.R,ce:items[f.ci].e,q});
    add+=q;
  }));
  renderOrder();
  if(!add){mmToast('Esos platos ya no están disponibles o el local está cerrado');return}
  closeSheet(); openReceipt();
  if(miss)setTimeout(()=>mmToast('Algunos platos ya no están disponibles'),700);
}

/* ---------- FAVORITOS ---------- */
function paintFavs(){
  const L=favList();
  body.innerHTML=L.length?L.map(f=>`<div class="fv" data-key="${f.key}">
      <span class="fv-e">${art(f.d)}</span>
      <div class="fv-t"><b>${esc(f.d.n)}</b><small>${esc(f.R.n)} · ⏱ ${esc(f.d.t)}</small><em>${S2(f.d.p)}</em></div>
      <div class="fv-a"><button type="button" data-add aria-label="Agregar ${esc(f.d.n)} al pedido">+</button>
        <button type="button" data-del aria-label="Quitar ${esc(f.d.n)} de favoritos">${HEART}</button></div></div>`).join('')
    :empty('🤍','Aún no tienes favoritos','Toca el corazón en un plato del menú y lo guardamos aquí para pedirlo rápido.','Ver el menú','menu');
}
function syncHearts(){
  if(typeof mxTrack==='undefined')return;
  [...mxTrack.children].forEach(c=>{
    const h=c.querySelector('.mx-heart'); if(!h)return;
    const on=favs.has(`${lx.cat}|${lx.r}|${c.dataset.k}`); h.classList.toggle('on',on); h.setAttribute('aria-pressed',on);
  });
}
function goLocal(f){
  closeSheet(); if(typeof mOpen!=='undefined'&&mOpen)closeMenu(true);
  setCat(f.ci); setRest(f.ri); toLocales();
  setTimeout(()=>openMenu(f.k),rm?0:500);
}

/* ---------- PERFIL ---------- */
function paintProfile(){
  const u=rd('mm_sender',{}), loc=window.MM_LOC, nO=rd('mm_orders',[]).length, nm=String(u.n||'').trim();
  const wa=(typeof REDES!=='undefined'&&REDES.whatsapp)||(typeof WA!=='undefined'?`https://wa.me/${WA}`:'#');
  body.innerHTML=`
    <div class="pf-hero"><span class="pf-av">${nm?esc(nm[0].toUpperCase()):'🛵'}</span>
      <div><b>${nm?esc(nm):'Invitado'}</b><small>${nO} ${nO===1?'pedido':'pedidos'} · ${favs.size} ${favs.size===1?'favorito':'favoritos'}</small></div></div>
    ${(window.MM_AUTH&&MM_AUTH.user())?'':`<div class="pf-card"><h4>🔐 Tu cuenta</h4><p>Ingresa para hacer tus pedidos y seguirlos desde aquí.</p><button type="button" class="ms-cta" data-act="login">Ingresar o crear cuenta</button></div>`}
    <div class="pf-card"><h4>📍 Ubicación de entrega</h4>
      <p>${loc?'Ya tenemos tu punto de entrega guardado en este dispositivo.':'Aún no marcas dónde te entregamos.'}</p>
      <button type="button" class="ms-cta" data-act="map">${loc?'Cambiar ubicación':'Marcar en el mapa'}</button></div>
    <div class="pf-card"><h4>👤 Tus datos</h4>
      <p>Se guardan solo en este dispositivo y agilizan tus envíos de paquetes.</p>
      <label>Nombre<input id="pfN" type="text" autocomplete="name" maxlength="40" placeholder="Tu nombre" value="${esc(u.n||'')}"></label>
      <label>Celular<input id="pfP" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="999 999 999" value="${esc(u.p||'')}"></label>
      <small class="pf-err" id="pfE" hidden>Ingresa un celular válido de 9 dígitos.</small>
      <button type="button" class="ms-ghost" data-act="save">Guardar datos</button>${(window.MM_AUTH&&MM_AUTH.user())?`<button type="button" class="ms-ghost" data-act="logout">Cerrar sesión</button>`:''}</div>
    <div class="pf-grid">
      <button type="button" data-act="pack"><span>📦</span>Enviar un paquete</button>
      <button type="button" data-act="map"><span>🗺️</span>Mapa de locales</button>
      <a href="${esc(wa)}" target="_blank" rel="noopener"><span>💬</span>Escríbenos por WhatsApp</a>
      <button type="button" data-lg="reclamos"><span>📖</span>Libro de reclamaciones</button>
    </div>
    <p class="pf-legal"><button type="button" data-lg="terminos">Términos y condiciones</button> · <button type="button" data-lg="privacidad">Privacidad</button></p>`;
}
function saveProfile(){
  const n=$('pfN').value.trim(), p=$('pfP').value.trim(), digits=p.replace(/\D/g,''), err=$('pfE');
  if(p&&digits.length<9){err.hidden=false;$('pfP').focus();return}
  err.hidden=true; wr('mm_sender',{n,p}); mmToast('Datos guardados ✓'); paintProfile();
}

/* ---------- toques dentro de la hoja ---------- */
body.addEventListener('click',e=>{
  const t=e.target;
  const act=t.closest('[data-act]'), go=t.closest('[data-go]'), re=t.closest('[data-re]');
  if(act){
    const a=act.dataset.act;
    if(a==='boleta'){closeSheet();openReceipt()}
    else if(a==='map'){closeSheet();$('mapBtn').click()}
    else if(a==='pack'){closeSheet();$('pkOpen').click()}
    else if(a==='save')saveProfile();
    else if(a==='login'){closeSheet();MM_AUTH.open()}
    else if(a==='logout'){MM_AUTH.logout();paintProfile()}
    return;
  }
  if(go){closeSheet();toLocales();return}
  if(re){buzz();reorder(re.dataset.re);return}
  const row=t.closest('.fv'); if(!row)return;
  const f=favList().find(x=>x.key===row.dataset.key); if(!f)return;
  if(t.closest('[data-add]')){
    const b=t.closest('[data-add]'); buzz(); addToCart(f.key,f.d,f.R,f.ci);
    b.classList.add('ok'); b.textContent='✓'; setTimeout(()=>{b.classList.remove('ok');b.textContent='+'},1300);
  }else if(t.closest('[data-del]')){
    buzz(); favs.delete(f.key); wr('mm_favs',[...favs]); syncHearts(); badgeFavs();
    row.classList.add('out'); setTimeout(()=>{if(sheetTab==='favs')paintFavs()},rm?0:320);
  }else goLocal(f);
});

/* ---------- insignias ---------- */
function setBadge(el,n,pop){
  const prev=+el.dataset.n||0; el.dataset.n=n; el.textContent=n>99?'99+':n; el.hidden=!n;
  if(n>prev&&pop&&!rm){again(el,'pop');again(el.parentNode,'bump')}
}
function badgeFavs(pop){setBadge($('mnBf'),favs.size,pop)}
window.MM_NAV={
  cart(t){setBadge($('mnBo'),t.n,true);if(sheetTab==='orders')paintOrders()},
  favs(){wr('mm_favs',[...favs]);badgeFavs(true);if(sheetTab==='favs')paintFavs()}
};

/* arranque */
MM_NAV.cart(totals()); badgeFavs(); spy(); paintNav();
})();
