/* ===== HORARIO · abre y cierra solo (revisa cada 30 s) ===== */
(()=>{
  const snap=()=>RESTAURANTES.map(r=>estadoLocal(r).abierto?1:0).join('');
  let last=snap();
  setInterval(()=>{
    const now=snap(); if(now===last)return; last=now;
    dispatchEvent(new Event('mmhora'));
    paintEstado();
    try{updateGo(totals())}catch(e){}
  },30000);
})();
