/* CATEGORÍAS (edita aquí) */
const WA='51999999999', DUR=5000;
const items=[
 {n:'Pizza',   e:'🍕', l1:'Pizza',   l2:'Artesanal', k:'#1 Más pedido',    r:4.8, p:'Pizzería Don Luigi', a:'Pucallpa · Centro', d:'Masa madre, queso fundido y horno de leña. La favorita de los viernes.', m:['25 min','S/ 3 envío','120 pedidos']},
 {n:'Burger',  e:'🍔', l1:'Burger',  l2:'Doble',     k:'#2 Más pedido',    r:4.7, p:'Burger House',       a:'Pucallpa · Yarinacocha', d:'Carne jugosa, cheddar y salsa de la casa. Papas crocantes incluidas.', m:['20 min','S/ 3 envío','98 pedidos']},
 {n:'Sushi',   e:'🍣', l1:'Sushi',   l2:'Roll',      k:'Recomendado',      r:4.9, p:'Sushi Bar',          a:'Pucallpa · Centro', d:'Rolls frescos con salsa acevichada. Perfectos para compartir.', m:['35 min','S/ 4 envío','76 pedidos']},
 {n:'Pollo',   e:'🍗', l1:'Pollo',   l2:'a la Brasa',k:'Clásico',          r:4.6, p:'Pollería El Rey',    a:'Pucallpa · Manantay', d:'Dorado, jugoso y con su cremita. El clásico que nunca falla.', m:['30 min','S/ 3 envío','150 pedidos']},
 {n:'Chifa',   e:'🍜', l1:'Chifa',   l2:'al Wok',    k:'Sabor de la casa', r:4.5, p:'Chifa Oriental',     a:'Pucallpa · Centro', d:'Tallarín saltado, arroz chaufa y wantán frito, recién salidos del wok.', m:['30 min','S/ 3 envío','84 pedidos']},
 {n:'Helados', e:'🍨', l1:'Helado',  l2:'Cremoso',   k:'Para el calor',    r:4.8, p:'Heladería Polar',    a:'Pucallpa · Centro', d:'Sabores amazónicos: aguaje, camu camu y coco. Bien fríos.', m:['15 min','S/ 2 envío','60 pedidos']},
];

const $=id=>document.getElementById(id), stage=$('stage'), thumbs=$('thumbs'), bar=$('bar');
let cur=0, busy=false, timer, hover=false;

thumbs.innerHTML=items.map((it,i)=>`<button class="t" data-i="${i}"><span class="d">${it.e}</span><small>${it.n}</small></button>`).join('');
const tb=[...thumbs.children];

function letters(t){return [...t].map((ch,i)=>ch===' '?' ':`<i style="--i:${i}">${ch}</i>`).join('')}
function centerThumb(el){ /* centra la miniatura dentro de su barra, sin mover la página */
  thumbs.scrollTo({left:el.offsetLeft-(thumbs.clientWidth-el.clientWidth)/2, top:el.offsetTop-(thumbs.clientHeight-el.clientHeight)/2, behavior:'smooth'});
}
function fill(i){
  const it=items[i];
  $('emoji').textContent=it.e; $('kicker').textContent=it.k;
  $('title').innerHTML=`<span class="l l1">${letters(it.l1)}</span><span class="l l2">${letters(it.l2)}</span>`;
  $('place').textContent=it.p; $('area').textContent=it.a; $('desc').textContent=it.d;
  $('meta').innerHTML=it.m.map(x=>`<span>${x}</span>`).join('');
  tb.forEach((b,k)=>b.classList.toggle('on',k===i));
  centerThumb(tb[i]);
  const s=$('score'), t0=performance.now();
  (function tick(t){const p=Math.min((t-t0)/700,1);s.textContent=(it.r*p).toFixed(1);if(p<1)requestAnimationFrame(tick)})(t0);
}
function restartBar(){bar.classList.remove('run');void bar.offsetWidth;if(!hover)bar.classList.add('run');
  clearTimeout(timer);timer=setTimeout(()=>hover?restartBar():go(cur+1,1),DUR);}

function go(n,dir){
  n=(n+items.length)%items.length;
  if(busy||(n===cur&&stage.dataset.ready))return; busy=true;
  stage.style.setProperty('--dir',dir||1);
  stage.classList.add('out');
  setTimeout(()=>{
    cur=n; fill(cur);
    stage.classList.remove('out'); stage.classList.add('pre'); void stage.offsetWidth;
    stage.classList.remove('pre');
    setTimeout(()=>busy=false,450);
  },360);
  restartBar();
}
tb.forEach((b,i)=>b.onclick=()=>go(i,i>cur?1:-1));
$('next').onclick=()=>go(cur+1,1); $('prev').onclick=()=>go(cur-1,-1);
addEventListener('keydown',e=>{if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;if(e.key==='ArrowRight'||e.key==='ArrowDown')go(cur+1,1);if(e.key==='ArrowLeft'||e.key==='ArrowUp')go(cur-1,-1)});

let x0=null;
stage.addEventListener('pointerdown',e=>x0=e.clientX);
addEventListener('pointerup',e=>{if(x0===null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1),dx<0?1:-1)});
const dock=document.querySelector('.dock');
dock.addEventListener('mouseenter',()=>{hover=true;bar.classList.remove('run');clearTimeout(timer)});
dock.addEventListener('mouseleave',()=>{hover=false;restartBar()});

fill(0); stage.dataset.ready=1; restartBar();
