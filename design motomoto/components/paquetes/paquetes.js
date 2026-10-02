/* ===== ENVÍO DE PAQUETES ===== */
(()=>{
const pk=$('pk'),btn=$('pkOpen');
const SZ=[['📄','Sobre','Documentos',5],['📦','Pequeño','Hasta 3 kg',8],['🧳','Mediano','Hasta 10 kg',12],['🛄','Grande','Hasta 25 kg',18]];
const ZN=['Centro','Yarinacocha','Manantay'];
const ZLL=[[-8.3791,-74.5539],[-8.3450,-74.5780],[-8.4020,-74.5520]];   /* centro de cada zona */
let st,last;
const chip=(g,i,t)=>`<button type="button" class="pk-chip${i===st[g]?' on':''}" data-g="${g}" data-v="${i}">${t}</button>`;
const price=()=>SZ[st.sz][3]+(st.from!==st.to?3:0)+($('pkFrag').checked?2:0);
function upd(){tween($('pkTot'),price(),450);$('pkNote').textContent=st.from!==st.to?'Envío entre zonas: +S/ 3.00':'Misma zona: sin recargo'}
function build(){
  st={sz:1,from:0,to:0,pay:0};
  $('pkSizes').innerHTML=SZ.map((z,i)=>`<button type="button" class="pk-sz${i===st.sz?' on':''}" data-g="sz" data-v="${i}"><span>${z[0]}</span><b>${z[1]}</b><small>${z[2]}</small><em>S/ ${z[3]}</em></button>`).join('');
  $('pkFrom').innerHTML=ZN.map((z,i)=>chip('from',i,'📍 '+z)).join('');
  $('pkTo').innerHTML=ZN.map((z,i)=>chip('to',i,'📍 '+z)).join('');
  $('pkPay').innerHTML=['💵 Yo pago','📦 Paga quien recibe'].map((t,i)=>chip('pay',i,t)).join('');
  try{const u=JSON.parse(localStorage.getItem('mm_sender'));if(u){$('pkSN').value=u.n;$('pkSP').value=u.p}}catch(e){}
  upd();
}

/* ---------- mapa de la ruta: 2 puntos (A recojo, B entrega) o texto ---------- */
let map=null,mapP=null,line=null,act='A';
const mk={A:null,B:null}, pts={A:null,B:null}, seq={A:0,B:0};
const INP={A:'pkSA',B:'pkRA'}, GRP={A:'from',B:'to'};
const dist=(a,b)=>{const r=Math.PI/180,x=(b[0]-a[0])*r,y=(b[1]-a[1])*r,h=Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const nearest=ll=>ZLL.reduce((bi,z,i)=>dist(ll,z)<dist(ll,ZLL[bi])?i:bi,0);
const pin=k=>L.divIcon({className:'',html:`<div class="pk-pin${k==='B'?' b':''}"><span>${k}</span></div>`,iconSize:[36,36],iconAnchor:[18,40]});
const kmAB=()=>pts.A&&pts.B?dist(pts.A,pts.B):null;
function paintAB(){
  ['A','B'].forEach(k=>{
    const t=pts[k]?($(INP[k]).value.trim()||'Punto marcado ✓'):'Toca el mapa';
    $('pk'+k+'T').textContent=t; pk.querySelector(`.pk-pt[data-p="${k}"]`).classList.toggle('set',!!pts[k]);
  });
  const km=kmAB();
  $('pkTip').innerHTML=!pts.A&&!pts.B?'<b>Toca el mapa</b> para marcar el punto A (recojo) y luego el B (entrega). ¿Prefieres escribir? Usa las direcciones de abajo y toca 🔎.'
    :!pts.A?'Falta el punto <b>A</b> (recojo). Tócalo en el mapa o escribe la dirección abajo.'
    :!pts.B?'Ahora toca el punto <b>B</b> (entrega) en el mapa, o escribe la dirección abajo.'
    :`Ruta de <b>≈ ${km.toFixed(1)} km</b> en línea recta. Arrastra A o B para ajustarlos.`;
}
function setAct(k){act=k;pk.querySelectorAll('.pk-pt').forEach(x=>x.classList.toggle('on',x.dataset.p===k))}
function drawLine(){
  if(line){line.remove();line=null}
  if(!map||!pts.A||!pts.B)return;
  line=L.polyline([pts.A,pts.B],{color:'#FF7A29',weight:4,opacity:.9,dashArray:'2 10',lineCap:'round'}).addTo(map);
  map.fitBounds(L.latLngBounds([pts.A,pts.B]).pad(.35),{maxZoom:16,animate:!reduce});
}
async function fillText(k,ll){
  const n=++seq[k];const t=await MM_GEO.reverse(ll);
  if(!t||n!==seq[k]||!pts[k])return;
  const inp=$(INP[k]);
  if(!inp.value.trim()||inp.dataset.auto){inp.value=t;inp.dataset.auto='1';inp.classList.remove('bad');paintAB()}
}
function setPoint(k,ll,fromText){
  ll=[+ll[0],+ll[1]];pts[k]=ll;
  if(!mk[k]){
    mk[k]=L.marker(ll,{draggable:true,icon:pin(k),zIndexOffset:k==='A'?900:800}).addTo(map);
    mk[k].on('dragend',()=>{const p=mk[k].getLatLng();setAct(k);setPoint(k,[p.lat,p.lng])});
  }else mk[k].setLatLng(ll);
  const g=GRP[k];st[g]=nearest(ll);                                   /* la zona se elige sola según el punto */
  pk.querySelectorAll(`[data-g="${g}"]`).forEach(x=>x.classList.toggle('on',+x.dataset.v===st[g]));
  const o=k==='A'?'B':'A';if(!pts[o])setAct(o);                        /* 1er toque = A, 2.º toque = B */
  drawLine();paintAB();upd();
  if(!fromText)fillText(k,ll);
}
function ensureMap(){
  if(map)return Promise.resolve(true);
  if(mapP)return mapP;
  mapP=MM_GEO.loadL().then(()=>{
    map=MM_GEO.createMap($('pkMapEl'));
    map.on('click',e=>setPoint(act,[e.latlng.lat,e.latlng.lng]));
    $('pkMMsg').hidden=true;return true;
  }).catch(()=>{mapP=null;$('pkMMsg').hidden=false;$('pkMMsg').textContent='No se pudo cargar el mapa. Escribe las direcciones abajo.';return false});
  return mapP;
}
async function locate(k){                                              /* texto -> punto en el mapa */
  const inp=$(INP[k]),q=inp.value.trim();
  if(!q){mmToast('Escribe una dirección para ubicarla');inp.focus();return}
  const b=pk.querySelector(`[data-f="${k}"]`);b.classList.add('busy');
  const ok=await ensureMap();const r=ok?await MM_GEO.geocode(q):null;b.classList.remove('busy');
  if(!ok)return mmToast('El mapa no cargó. Tu dirección escrita igual sirve');
  if(!r)return mmToast('No la encontramos. Toca el mapa para marcarla');
  delete inp.dataset.auto;seq[k]++;setPoint(k,r,true);
  map.flyTo(r,Math.max(map.getZoom(),16),{duration:reduce?0:.7});
}
function resetRoute(){
  ['A','B'].forEach(k=>{if(mk[k]){mk[k].remove();mk[k]=null}pts[k]=null;seq[k]++;delete $(INP[k]).dataset.auto});
  if(line){line.remove();line=null}
  setAct('A');paintAB();
}
pk.addEventListener('click',e=>{
  const p=e.target.closest('.pk-pt');if(p){setAct(p.dataset.p);if(pts[p.dataset.p]&&map)map.flyTo(pts[p.dataset.p],Math.max(map.getZoom(),15),{duration:reduce?0:.6});return}
  const f=e.target.closest('[data-f]');if(f){locate(f.dataset.f);return}
  if(e.target.closest('#pkLoc')){
    const b=$('pkLoc');if(!map)return mmToast('El mapa aún no carga');
    if(!navigator.geolocation)return mmToast('Tu navegador no permite ubicación');
    b.classList.add('busy');
    navigator.geolocation.getCurrentPosition(pos=>{b.classList.remove('busy');const ll=[pos.coords.latitude,pos.coords.longitude];setPoint(act,ll);map.flyTo(ll,16,{duration:reduce?0:.8})},
      ()=>{b.classList.remove('busy');mmToast('No pudimos ubicarte. Toca el mapa para marcarlo.')},{enableHighAccuracy:true,timeout:9000});
    return;
  }
  const b=e.target.closest('[data-g]');if(!b)return;
  const g=b.dataset.g;st[g]=+b.dataset.v;
  pk.querySelectorAll(`[data-g="${g}"]`).forEach(x=>x.classList.toggle('on',x===b));upd();
  if((g==='from'&&!pts.A||g==='to'&&!pts.B)&&map)map.flyTo(ZLL[st[g]],14,{duration:reduce?0:.6});   /* sin punto: el mapa se acerca a esa zona */
});
$('pkFrag').addEventListener('change',upd);
const ids=['pkSN','pkSP','pkSA','pkRN','pkRP','pkRA'];
ids.forEach(i=>$(i).addEventListener('input',()=>{$(i).classList.remove('bad');delete $(i).dataset.auto;if(i==='pkSA'||i==='pkRA')paintAB()}));
['A','B'].forEach(k=>$(INP[k]).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();locate(k)}}));
const phoneOk=v=>/^9\d{8}$/.test(v.replace(/[\s-]/g,'').replace(/^\+?51/,''));
$('pkGo').onclick=()=>{
  const val=i=>$(i).value.trim();
  const needTxt=i=>i==='pkSA'?!pts.A:i==='pkRA'?!pts.B:true;       /* la dirección puede ser texto O un punto del mapa */
  const bad=ids.filter(i=>(!val(i)&&needTxt(i))||((i==='pkSP'||i==='pkRP')&&!phoneOk(val(i))));
  ids.forEach(i=>{$(i).classList.remove('bad');if(bad.includes(i)){void $(i).offsetWidth;$(i).classList.add('bad')}});
  if(bad.length){const b0=bad[0];$(b0).focus();mmToast(b0==='pkSA'||b0==='pkRA'?'Escribe la dirección o marca el punto en el mapa':val(b0)?'Revisa el celular (9 dígitos)':'Completa los datos marcados');return}
  const id=String(Math.floor(100000+Math.random()*900000)),tot=price(),fr=$('pkFrag').checked,km=kmAB(),kmt=km!=null?+km.toFixed(2):null;
  const o={id,fecha:new Date().toISOString(),estado:'pendiente',tamano:SZ[st.sz][1],fragil:fr,descripcion:val('pkDesc'),paga:st.pay?'destinatario':'remitente',
    recojo:{zona:ZN[st.from],nombre:val('pkSN'),telefono:val('pkSP'),direccion:val('pkSA'),lat:pts.A?+pts.A[0].toFixed(6):null,lng:pts.A?+pts.A[1].toFixed(6):null},
    entrega:{zona:ZN[st.to],nombre:val('pkRN'),telefono:val('pkRP'),direccion:val('pkRA'),lat:pts.B?+pts.B[0].toFixed(6):null,lng:pts.B?+pts.B[1].toFixed(6):null},
    distanciaKm:kmt,total:tot};
  try{const a=JSON.parse(localStorage.getItem('mm_packs'))||[];a.unshift(o);localStorage.setItem('mm_packs',JSON.stringify(a.slice(0,50)));
    localStorage.setItem('mm_sender',JSON.stringify({n:val('pkSN'),p:val('pkSP')}))}catch(e){}
  $('pkId').textContent='N° '+id;
  $('pkSum').innerHTML=`${SZ[st.sz][0]} ${SZ[st.sz][1]}${fr?' · frágil':''}<br>${ZN[st.from]} → ${ZN[st.to]}${kmt!=null?` · ≈ ${kmt.toFixed(1)} km`:''}<br>Total <b>${S2(tot)}</b> · ${st.pay?'paga quien recibe':'pagas tú'}`;
  $('pkOk').hidden=false;
};
function open(){
  const b=btn.getBoundingClientRect();
  pk.style.setProperty('--ox',(b.left+b.width/2)+'px');pk.style.setProperty('--oy',(b.top+b.height/2)+'px');
  last=document.activeElement;$('pkForm').reset();$('pkOk').hidden=true;build();resetRoute();$('pkForm').scrollTop=0;
  pk.hidden=false;void pk.offsetWidth;pk.classList.add('open');document.body.style.overflow='hidden';$('pkClose').focus({preventScroll:true});
  setTimeout(()=>ensureMap().then(ok=>{if(ok){map.invalidateSize();map.setView(MM_GEO.CFG.centro,13,{animate:false})}}),reduce?0:450);
}
function close(){
  if(pk.hidden)return;pk.classList.remove('open');document.body.style.overflow='';
  setTimeout(()=>{pk.hidden=true},reduce?0:650);if(last&&last.focus)last.focus({preventScroll:true});
}
window.MM_PACK=open;
btn.onclick=open;$('pkClose').onclick=close;$('pkDone').onclick=close;
pk.addEventListener('click',e=>{if(e.target===pk)close()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!pk.hidden)close()});
})();
