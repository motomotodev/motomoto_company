/* ===== MAPA ===== */
(()=>{
const mp=$('mp'),btn=$('mapBtn');
const N=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const ZN={centro:[-8.3791,-74.5539],yarinacocha:[-8.3450,-74.5780],callao:[-8.3400,-74.5790],manantay:[-8.4020,-74.5520]};
try{window.MM_LOC=JSON.parse(localStorage.getItem('mm_loc'))}catch(e){}
if(window.MM_LOC){btn.classList.add('set');btn.querySelector('.plus').textContent='✓'}
/* Posición de cada local: usa ubicacion.lat / ubicacion.lng de datos-restaurantes.js si existen; si no, la aproxima por zona */
const PTS=[];
items.forEach((it,c)=>(LOCALES[it.n]||[]).forEach((R,r)=>{
  const u=(R.data&&R.data.ubicacion)||{};let la=u.lat??u.latitud,lo=u.lng??u.lon??u.longitud;
  if(la==null||lo==null){const z=N(R.a),b=ZN[Object.keys(ZN).find(k=>z.includes(k))||'centro'],h=hueOf(R.n);la=b[0]+Math.sin(h)*.0045;lo=b[1]+Math.cos(h*1.7)*.0045}
  PTS.push({c,r,R,e:it.e,ll:[+la,+lo]});
}));
window.MM_PTS=PTS;let map,dm,markers=[],sel=null,filt=-1,last=null;
const km=(a,b)=>{const r=Math.PI/180,x=(b[0]-a[0])*r,y=(b[1]-a[1])*r,h=Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const origin=()=>dm?[dm.getLatLng().lat,dm.getLatLng().lng]:window.MM_LOC||null;
const vis=()=>{const v=PTS.filter(p=>filt<0||p.c===filt),o=origin();return o?v.sort((a,b)=>km(o,a.ll)-km(o,b.ll)):v};
function toast(t){const d=document.createElement('div');d.className='mm-toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2600)}
const loadL=()=>MM_GEO.loadL();

$('mpChips').innerHTML=[[-1,'📍','Todos']].concat(items.map((it,i)=>[i,it.e,it.n])).map(([i,e,n])=>`<button type="button" data-c="${i}"${i<0?' class="on"':''}>${e} ${n}</button>`).join('');
$('mpChips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  filt=+b.dataset.c;sel=null;[...$('mpChips').children].forEach(x=>x.classList.toggle('on',x===b));paintList();if(map){paintPins();fit()}});

function paintList(){
  const o=origin();
  $('mpList').innerHTML=vis().map((p,i)=>`<article class="mp-c${p===sel?' on':''}" data-k="${PTS.indexOf(p)}" style="--i:${i}">
    <span class="lx-logo xs" style="--lg:${logoBg(p.R.n)}">${logoInner(p.R,p.e)}</span>
    <div class="mp-i"><b>${p.R.n}</b><small>★ ${p.R.r} · ${p.R.t} · ${p.R.env}${o?` · <em>${km(o,p.ll).toFixed(1)} km</em>`:''}</small></div>
    <div class="mp-a"><button type="button" data-a="go">Ver carta</button><a href="https://www.google.com/maps/dir/?api=1&destination=${p.ll[0]},${p.ll[1]}" target="_blank" rel="noopener" aria-label="Cómo llegar">↗</a></div></article>`).join('');
}
function paintPins(){
  markers.forEach(m=>m.remove());markers=[];
  vis().forEach((p,i)=>{
    const m=L.marker(p.ll,{title:p.R.n,icon:L.divIcon({className:'',html:`<div class="mp-pin" style="--i:${i}"><span>${p.e}</span></div>`,iconSize:[44,44],iconAnchor:[22,48]})}).addTo(map);
    m.on('click',()=>choose(p));p.m=m;markers.push(m);
  });
}
function fit(){const v=vis();if(!v.length)return;const pts=v.map(p=>p.ll);if(dm)pts.push(dm.getLatLng());map.flyToBounds(L.latLngBounds(pts).pad(.35),{duration:reduce?0:.8,maxZoom:15})}
function choose(p){
  sel=p;markers.forEach(m=>m.getElement()&&m.getElement().classList.remove('sel'));
  if(p.m&&p.m.getElement())p.m.getElement().classList.add('sel');
  map.flyTo(p.ll,Math.max(map.getZoom(),15),{duration:reduce?0:.7});
  document.querySelectorAll('.mp-c').forEach(c=>{const on=PTS[c.dataset.k]===p;c.classList.toggle('on',on);if(on)c.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})});
}
$('mpList').addEventListener('click',e=>{
  const c=e.target.closest('.mp-c');if(!c||e.target.closest('a'))return;const p=PTS[c.dataset.k];
  if(e.target.closest('[data-a="go"]')){close();setTimeout(()=>window.MM_GO({t:'r',c:p.c,r:p.r,n:p.R.n,menu:true}),reduce?0:300)}
  else if(map)choose(p);
});
function setDest(ll){
  if(!dm){dm=L.marker(ll,{draggable:true,zIndexOffset:900,icon:L.divIcon({className:'',html:'<div class="mp-me"><i></i><span>🏠</span></div>',iconSize:[46,46],iconAnchor:[23,23]})}).addTo(map);dm.on('dragend',upd)}
  else dm.setLatLng(ll);
  upd();
}
function upd(){const p=dm.getLatLng();$('mpAddr').textContent=`📍 Entrega marcada (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`;$('mpOk').disabled=false;paintList()}
function initMap(){
  map=L.map('mpMap',{zoomControl:false,attributionControl:false}).setView(ZN.centro,13);
  L.control.attribution({position:'topleft',prefix:false}).addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);
  MM_GEO.addTiles(map);
  map.on('click',e=>setDest(e.latlng));
  if(window.MM_LOC)setDest(L.latLng(window.MM_LOC));
  $('mpMsg').hidden=true;
}
$('mpLoc').onclick=()=>{
  const b=$('mpLoc');
  if(!map)return toast('El mapa aún no carga');
  if(!navigator.geolocation)return toast('Tu navegador no permite ubicación');
  b.classList.add('busy');
  navigator.geolocation.getCurrentPosition(pos=>{b.classList.remove('busy');const ll=L.latLng(pos.coords.latitude,pos.coords.longitude);setDest(ll);map.flyTo(ll,15,{duration:reduce?0:.9})},
    ()=>{b.classList.remove('busy');toast('No pudimos ubicarte. Toca el mapa para marcarla.')},{enableHighAccuracy:true,timeout:9000});
};
$('mpOk').onclick=()=>{
  const p=dm.getLatLng();window.MM_LOC=[+p.lat.toFixed(6),+p.lng.toFixed(6)];
  try{localStorage.setItem('mm_loc',JSON.stringify(window.MM_LOC))}catch(e){}
  btn.classList.add('set');btn.querySelector('.plus').textContent='✓';btn.setAttribute('aria-label','Mapa · ubicación de entrega añadida');
  close();toast('Ubicación de entrega guardada ✓');renderOrder();dispatchEvent(new Event('mmloc'));
};
async function openMap(){
  const b=btn.getBoundingClientRect();
  mp.style.setProperty('--ox',(b.left+b.width/2)+'px');mp.style.setProperty('--oy',(b.top+b.height/2)+'px');
  last=document.activeElement;mp.hidden=false;void mp.offsetWidth;mp.classList.add('open');
  document.body.style.overflow='hidden';btn.classList.add('seen');$('mpClose').focus({preventScroll:true});
  paintList();
  try{await loadL()}catch(e){$('mpMsg').hidden=false;$('mpMsg').textContent='No se pudo cargar el mapa. Revisa tu conexión: igual puedes ver la lista de locales.';return}
  if(!map)initMap();
  setTimeout(()=>{map.invalidateSize();paintPins();fit()},reduce?0:450);
}
function close(){
  if(mp.hidden)return;mp.classList.remove('open');document.body.style.overflow='';
  setTimeout(()=>{mp.hidden=true},reduce?0:650);if(last&&last.focus)last.focus({preventScroll:true});
}
btn.onclick=openMap;$('mpClose').onclick=close;
mp.addEventListener('click',e=>{if(e.target===mp)close()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!mp.hidden)close()});
})();
