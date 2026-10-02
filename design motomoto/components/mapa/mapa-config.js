/* ===== MAPA · CONFIGURACIÓN ÚNICA (mapa de locales + envío de paquetes) =====
   Mientras tanto usa mapas GRATUITOS (OpenStreetMap + Nominatim para buscar direcciones).
   Cuando pases a Google Maps, solo se cambia este bloque: los dos mapas lo usan. */
window.MM_GEO=(()=>{
  const CFG={
    tiles:'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr:'© OpenStreetMap', maxZoom:19,
    centro:[-8.3791,-74.5539],                 /* Pucallpa */
    bbox:'-74.70,-8.25,-74.40,-8.50'           /* zona de búsqueda de direcciones (Nominatim: izq,arriba,der,abajo) */
  };
  let lp=null;
  const loadL=()=>window.L?Promise.resolve():(lp||(lp=new Promise((ok,no)=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.append(l);
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=ok;s.onerror=()=>{lp=null;no()};document.head.append(s)})));
  /* mosaicos oscuros. Si OpenStreetMap bloquea los mosaicos (pasa al abrir el HTML con doble clic, sin servidor), cambia solo a un mapa oscuro de respaldo */
  function addTiles(map){
    let ok=0,err=0,fb=false;
    const main=L.tileLayer(CFG.tiles,{maxZoom:CFG.maxZoom,className:'mm-dark-tiles',attribution:CFG.attr}).addTo(map);
    main.on('tileload',()=>{ok++});
    main.on('tileerror',()=>{err++;if(!fb&&!ok&&err>=3){fb=true;map.removeLayer(main);
      const E='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
      L.layerGroup([
        L.tileLayer(E+'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:CFG.maxZoom,attribution:'Tiles © Esri'}),
        L.tileLayer(E+'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:CFG.maxZoom})
      ]).addTo(map)}});
    return main;
  }
  function createMap(el){
    const map=L.map(el,{zoomControl:false,attributionControl:false}).setView(CFG.centro,13);
    L.control.attribution({position:'bottomleft',prefix:false}).addTo(map);
    L.control.zoom({position:'bottomright'}).addTo(map);
    addTiles(map);return map;
  }
  /* texto -> punto [lat,lng] (o null) */
  async function geocode(q){
    try{
      const u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=pe&bounded=1&accept-language=es&viewbox='+CFG.bbox+'&q='+encodeURIComponent(/pucallpa/i.test(q)?q:q+', Pucallpa');
      const r=await fetch(u);if(!r.ok)return null;const j=await r.json();
      return j&&j[0]?[+j[0].lat,+j[0].lon]:null;
    }catch(e){return null}
  }
  /* punto -> texto corto de la dirección ('' si no hay) */
  async function reverse(ll){
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=es&lat=${ll[0]}&lon=${ll[1]}`);
      if(!r.ok)return '';const j=await r.json(),a=j.address||{};
      const via=a.road||a.pedestrian||a.footway||a.path||'',zona=a.neighbourhood||a.suburb||a.quarter||'';
      return [via&&(via+(a.house_number?' '+a.house_number:'')),zona].filter(Boolean).join(', ')||j.name||'';
    }catch(e){return ''}
  }
  return {CFG,loadL,addTiles,createMap,geocode,reverse};
})();
