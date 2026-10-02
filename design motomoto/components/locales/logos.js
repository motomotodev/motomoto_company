/* ---------- logos de los locales ---------- */
/* Para usar el logo real de un local: LOGOS['Nombre exacto del local']='ruta/logo.png' */
const LOGOS=Object.fromEntries(RESTAURANTES.filter(r=>r.logo).map(r=>[r.nombre,r.logo]));
const STOPW=new Set(['de','del','la','el','los','las','y']);
/* emblema por local: [emoji, color 1, color 2] – son provisorios hasta poner el logo real en LOGOS */
const LOGO_DEF={
 'Pizzería Don Luigi':['🍕','#e53935','#2e7d32'],
 'La Pizzería del Puerto':['⚓','#0288d1','#01579b'],
 'Burger House':['🍔','#ff9800','#e65100'],
 'Grill Ucayali':['🥩','#c62828','#4e342e'],
 'Sushi Bar':['🍣','#ec407a','#311b92'],
 'Sakura Roll':['🌸','#f48fb1','#ad1457'],
 'Pollería El Rey':['👑','#fbc02d','#e65100'],
 'Brasas del Ucayali':['🔥','#ff7043','#5d4037'],
 'Chifa Oriental':['🥡','#e53935','#f9a825'],
 'Chifa Dragón Dorado':['🐉','#d32f2f','#ffb300'],
 'Heladería Polar':['🍦','#4fc3f7','#1565c0'],
 'Frozen Amazonía':['🍧','#26c6da','#7b1fa2']
};
const hueOf=n=>[...n].reduce((a,c)=>a+c.charCodeAt(0)*37,0)%360;
const logoBg=n=>{const d=LOGO_DEF[n];if(d)return `linear-gradient(140deg,${d[1]},${d[2]})`;const h=hueOf(n);return `linear-gradient(135deg,hsl(${h} 85% 58%),hsl(${(h+45)%360} 80% 38%))`};
const initialsOf=n=>{const w=n.split(/\s+/).filter(x=>!STOPW.has(x.toLowerCase()));return ((w[0]||n)[0]+((w[1]||'')[0]||'')).toUpperCase()};
const logoEmb=(r,ce)=>`<span class="lg-e">${(LOGO_DEF[r.n]||[ce||'🍽️'])[0]}</span>`;
const logoInner=(r,ce)=>LOGOS[r.n]?`<img src="${LOGOS[r.n]}" alt="" onerror="this.outerHTML=this.dataset.fb" data-fb='${logoEmb(r,ce)}'>`:logoEmb(r,ce);
function paintLogo(el,r,ce){ce=ce||items[lx.cat].e;el.style.setProperty('--lg',logoBg(r.n));el.innerHTML=logoInner(r,ce)}
function keepSign(){
  if(!matchMedia('(max-width:768px)').matches)return;
  
}
