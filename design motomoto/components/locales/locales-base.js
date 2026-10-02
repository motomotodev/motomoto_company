/* Los locales y productos se leen de datos-restaurantes.js (RESTAURANTES). Ahí se editan. */
const EXTRA={}, LOCALES={};
items.forEach(it=>{
  LOCALES[it.n]=RESTAURANTES.filter(r=>r.categoria===it.n).map(r=>{
    const P=r.productos.map(p=>({n:p.nombre,e:p.emoji,p:p.precio,t:p.tiempo,d:p.descripcion,img:p.imagen,sc:p.subcategoria}));
    EXTRA[r.nombre]=P.slice(3);           /* los 3 primeros van en el cartel, el resto en "Ver todos los productos" */
    return {n:r.nombre,a:r.ubicacion.zona,r:r.calificacion,t:r.tiempo,env:r.envio,tag:r.etiqueta,dishes:P.slice(0,3),data:r};
  });
});

/* ---------- utilidades ---------- */
const S =n=>'S/ '+n.toFixed(2).replace(/\.00$/,'');
const S2=n=>'S/ '+n.toFixed(2);
const art=d=>d.img?`<img src="${d.img}" alt="" onerror="this.replaceWith(document.createTextNode('${d.e}'))">`:d.e;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lx={cat:0,r:0,d:0}, cart=new Map();
const lxSign=$('lxSign'), lxPlate=$('lxPlate'), lxInfo=$('lxInfo');
const restart=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const curList=()=>LOCALES[items[lx.cat].n]||[];
const curRest=()=>curList()[lx.r];
const full=()=>{const r=curRest();return r.dishes.concat(EXTRA[r.n]||[])};
const curDish=()=>full()[lx.d];
