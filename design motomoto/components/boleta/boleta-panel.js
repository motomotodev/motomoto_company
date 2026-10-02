/* ===== BOLETA · PANEL LATERAL: 1) punto del local  2) ubicación del cliente ===== */
(()=>{
const side=$('rcSide'),pts=$('rcPts'),route=$('rcRoute'),msg=$('rcMapMsg');
let map=null,layer=null,failed=false,tm;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const km=(a,b)=>{const r=Math.PI/180,x=(b[0]-a[0])*r,y=(b[1]-a[1])*r,h=Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const ptOf=g=>{const p=(window.MM_PTS||[]).find(x=>x.R.n===g.r.n);return p?p.ll:null};
const addr=g=>{const u=(g.r.data&&g.r.data.ubicacion)||{};const d=/^por completar/i.test(u.direccion||'')?'':u.direccion;return [d,u.zona,u.ciudad].filter(Boolean).join(' · ')};
const dir=ll=>`https://www.google.com/maps/dir/?api=1&destination=${ll[0]},${ll[1]}`;
const openMapBtn=()=>{
  const b=$('mapBtn'); if(!b)return;
  if(typeof rcOpen!=='undefined'&&rcOpen){
    window.MM_RC_BACK=true; closeReceipt();          /* 1) la boleta se retira */
    setTimeout(()=>b.click(),(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)?0:580); /* 2) recién entonces se abre el mapa */
  }else b.click();
};
/* 3) al cerrar o confirmar el mapa, la boleta vuelve sola */
new MutationObserver(()=>{ if($('mp').hidden&&window.MM_RC_BACK){window.MM_RC_BACK=false;setTimeout(()=>{if(typeof openReceipt==='function')openReceipt()},160)} })
  .observe($('mp'),{attributes:true,attributeFilter:['hidden']});

window.MM_RCSIDE=function(t){
  side.classList.toggle('off',!t.n);
  if(!t.n)return;
  const me=window.MM_LOC||null, locs=t.groups.map(g=>({g,ll:ptOf(g)}));
  const one=locs.length===1&&locs[0].ll&&me?km(me,locs[0].ll):null;
  pts.innerHTML=locs.map(({g,ll})=>`<div class="rc-pt"><span class="n">1</span><div class="t"><small>Punto del local</small><b>${esc(g.r.n)}</b><em>${esc(addr(g)||'Ubicación aproximada')}</em></div>${ll?`<a href="${dir(ll)}" target="_blank" rel="noopener" aria-label="Cómo llegar a ${esc(g.r.n)}">Ir ↗</a>`:''}</div>`).join('')+
    `<div class="rc-pt cl"><span class="n">2</span><div class="t"><small>Ubicación del cliente</small>${me
      ?`<b>Entrega marcada</b><em>${me[0].toFixed(5)}, ${me[1].toFixed(5)}${one!=null?` · ≈ ${one.toFixed(1)} km del local`:''}</em>`
      :`<b>Aún sin marcar</b><em>Marca dónde te entregamos</em>`}</div><button type="button" data-loc>${me?'Cambiar':'Marcar'}</button></div>`;
  route.innerHTML=locs.map(({g})=>`<div class="rc-rt"><i>1</i><span><b>${esc(g.r.n)}</b><br>${esc(addr(g)||'Local')}</span></div>`).join('')+
    `<div class="rc-rt cl"><i>2</i><span><b>${me?'Entrega marcada':'Sin ubicación de entrega'}</b>${me?`<br>${me[0].toFixed(5)}, ${me[1].toFixed(5)}`:''}</span><button type="button" data-loc>${me?'Cambiar':'Marcar'}</button></div>`;
  draw(locs,me);
};
async function draw(locs,me){
  if(failed)return;
  try{await MM_GEO.loadL()}catch(e){failed=true;msg.hidden=false;msg.textContent='No se pudo cargar el mapa. Igual puedes ver las direcciones.';return}
  if(!map)map=MM_GEO.createMap($('rcMapEl'));
  if(layer)layer.remove(); layer=L.layerGroup().addTo(map); msg.hidden=true;
  const all=[];
  locs.forEach(({g,ll})=>{ if(!ll)return; all.push(ll);
    L.marker(ll,{title:g.r.n,icon:L.divIcon({className:'',html:`<div class="mp-pin" style="--i:0"><span>${g.ce||'🍽️'}</span></div>`,iconSize:[44,44],iconAnchor:[22,48]})}).addTo(layer);
    if(me)L.polyline([ll,me],{color:'#ff7a29',weight:3,dashArray:'6 8',opacity:.9}).addTo(layer);
  });
  if(me){all.push(me);L.marker(me,{title:'Tu ubicación',zIndexOffset:900,icon:L.divIcon({className:'',html:'<div class="mp-me"><i></i><span>🏠</span></div>',iconSize:[46,46],iconAnchor:[23,23]})}).addTo(layer)}
  clearTimeout(tm); tm=setTimeout(()=>{
    map.invalidateSize();
    if(all.length>1)map.fitBounds(L.latLngBounds(all).pad(.35),{maxZoom:16,animate:false});
    else if(all.length)map.setView(all[0],16,{animate:false});
  },(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)?0:750);
}
/* "Marcar / Cambiar" abre el mapa de ubicación que ya existe (queda por encima de la boleta) */
side.addEventListener('click',e=>{if(e.target.closest('[data-loc]'))openMapBtn()});
$('rcPaper').addEventListener('click',e=>{if(e.target.closest('[data-loc]'))openMapBtn()});
})();
