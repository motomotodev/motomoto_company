/* ===== LISTA DE RESTAURANTES ===== */
(()=>{
const grid=$('rlGrid');let cat=-1,srt='r';
const ALL=[];
items.forEach((it,c)=>(LOCALES[it.n]||[]).forEach((R,r)=>ALL.push({c,r,R,e:it.e,cn:it.n,mn:Math.min(...R.dishes.concat(EXTRA[R.n]||[]).map(d=>d.p)),mt:parseInt(R.t)||99})));
$('rlCats').innerHTML=[[-1,'🍽️','Todos']].concat(items.map((it,i)=>[i,it.e,it.n])).map(([i,e,n])=>`<button type="button" data-c="${i}"${i<0?' class="on"':''}>${e} ${n}</button>`).join('');
const km=(a,b)=>{const r=Math.PI/180,x=(b[0]-a[0])*r,y=(b[1]-a[1])*r,h=Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const dist=x=>{const p=(window.MM_PTS||[]).find(p=>p.R===x.R);return p&&window.MM_LOC?km(window.MM_LOC,p.ll):null};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
function render(){
  const l=ALL.filter(x=>cat<0||x.c===cat);
  l.sort((a,b)=>srt==='r'?b.R.r-a.R.r:srt==='t'?a.mt-b.mt:srt==='e'?fee(a.R.env)-fee(b.R.env):(dist(a)??99)-(dist(b)??99));
  $('rlN').textContent=`${l.length} ${l.length===1?'restaurante':'restaurantes'}`;
  grid.innerHTML=l.length?l.map((x,i)=>{const R=x.R,d=dist(x);return `<article class="rl-c${estadoR(R).abierto?'':' cerrado'}" tabindex="0" role="button" aria-label="Ver la carta de ${R.n}" data-c="${x.c}" data-r="${x.r}" style="--i:${i%6}">
    <div class="rl-bg" style="background:${logoBg(R.n)}" aria-hidden="true"></div>
    <span class="rl-go">Ver carta <span>→</span></span>
    <div class="rl-b"><h3>${R.n}</h3><p>${x.e} ${x.cn} · ${R.a}</p>
      <div class="rl-m"><span>★ ${R.r}</span><span>⏱ ${R.t}</span><span>🛵 ${R.env}</span><span>desde ${S(x.mn)}</span>${d!=null?`<span class="km">📍 ${d.toFixed(1)} km</span>`:''}${pillHr(R)}<span class="rl-tag">${R.tag}</span></div></div>
    <span class="lx-logo rl-lg" style="--lg:${logoBg(R.n)}">${logoInner(R,x.e)}</span></article>`}).join(''):'<div class="rl-empty">Aún no hay restaurantes aquí 🍽️</div>';
  grid.querySelectorAll('.rl-c').forEach(c=>io.observe(c));
}
const pickC=(el,fn)=>el.addEventListener('click',e=>{const b=e.target.closest('button');if(b)fn(b)});
pickC($('rlCats'),b=>{cat=+b.dataset.c;[...$('rlCats').children].forEach(x=>x.classList.toggle('on',x===b));render()});
pickC($('rlSort'),b=>{
  if(b.dataset.s==='d'&&!window.MM_LOC){toast('Marca tu ubicación para ver los más cercanos');$('mapBtn').click();return}
  srt=b.dataset.s;[...$('rlSort').children].forEach(x=>x.classList.toggle('on',x===b));render()});
const go=c=>window.MM_GO({t:'r',c:+c.dataset.c,r:+c.dataset.r,n:'',menu:true});
grid.addEventListener('click',e=>{const c=e.target.closest('.rl-c');if(c)go(c)});
grid.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const c=e.target.closest('.rl-c');if(c){e.preventDefault();go(c)}}});
addEventListener('mmloc',render);addEventListener('mmhora',render);
render();
})();
