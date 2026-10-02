/* ===== redes · pedidos locales ===== */
const REDES={whatsapp:`https://wa.me/${WA}`,tiktok:'https://www.tiktok.com/@motomoto',facebook:'https://www.facebook.com/motomoto',instagram:'https://www.instagram.com/motomoto',telegram:'https://t.me/motomoto',twitter:'https://x.com/motomoto'}; /* ← pon aquí tus enlaces reales */
document.querySelectorAll('.soc a').forEach(a=>a.href=REDES[a.dataset.r]);
function mmToast(t){const d=document.createElement('div');d.className='mm-toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2800)}
function saveOrder(t){
  const o={id:rcNo,fecha:new Date().toISOString(),estado:'pendiente',
    locales:t.groups.map(g=>({local:g.r.n,envio:g.env,items:g.it.map(([,r])=>({plato:r.d.n,cant:r.q,precio:r.d.p}))})),
    subtotal:t.sub,descuento:t.disc||0,vipGratis:!!t.vipFree,codigos:window.MM_PROMO?MM_PROMO.codes(t):[],envio:t.env,servicioVip:t.vip,total:t.tot,ubicacion:window.MM_LOC||null};
  try{const a=JSON.parse(localStorage.getItem('mm_orders'))||[];a.unshift(o);localStorage.setItem('mm_orders',JSON.stringify(a.slice(0,50)))}catch(e){}
  if(window.MM_PROMO)MM_PROMO.consume(t);
  return o;
}
