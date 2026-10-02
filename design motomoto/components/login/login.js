/* ===== LOGIN: requisito para "Pedir" (cuenta local: celular + PIN) ===== */
(function(){
const $=id=>document.getElementById(id);
const rd=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const au=$('au'), card=au.querySelector('.au-card'), pins=[...au.querySelectorAll('.au-pin input')], segs=[...au.querySelectorAll('.au-seg button')];
let mode='up', cb=null, last=null, busy=false, lockUntil=0, prevOv='', tries={};
const users=()=>rd('mm_users',{});
const user=()=>{const p=rd('mm_session',null);return p?(users()[p]||null):null};
const digits=s=>String(s).replace(/\D/g,'').slice(0,9);
const fmt=d=>d.replace(/(\d{3})(?=\d)/g,'$1 ').trim();
const pinVal=()=>pins.map(i=>i.value).join('');
const clearPin=()=>{pins.forEach(i=>{i.value='';i.classList.remove('f')});pins[0].focus()};
async function hash(s){
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=5381;for(const c of s)h=(h*33^c.charCodeAt(0))>>>0;return 'x'+h}
}
function err(t){
  const e=$('auE'); e.textContent=t||''; e.hidden=!t;
  if(t&&!rm){const g=$('auPin');g.classList.remove('bad');void g.offsetWidth;g.classList.add('bad')}
}
function setMode(m){
  mode=m; au.classList.toggle('up',m==='up'); $('auName').inert=m!=='up';
  segs.forEach(b=>b.setAttribute('aria-selected',b.dataset.m===m));
  const pedir=cb?' y pedir':'';
  $('auT').textContent=cb?(m==='up'?'Crea tu cuenta para pedir':'Ingresa para pedir'):(m==='up'?'Crea tu cuenta':'Ingresa a tu cuenta');
  $('auGoL').textContent=(m==='up'?'Crear cuenta':'Ingresar')+pedir;
  err('');
}
function open(fn){
  if(!au.hidden)return;
  cb=fn||null; last=document.activeElement;
  const t=(typeof totals==='function')?totals():null;
  $('auSub').innerHTML=(cb&&t&&t.n)?`<b>${t.n} ${t.n===1?'plato':'platos'} · ${S2(t.tot)}</b> te esperan en tu boleta. Solo falta saber quién eres.`:'Guarda tus datos para pedir más rápido.';
  const s=rd('mm_sender',{}); $('auN').value='';
  $('auP').value=(s.p&&users()[digits(s.p)])?fmt(digits(s.p)):'';
  pins.forEach(i=>{i.value='';i.classList.remove('f');i.type='password'}); $('auEye').textContent='Mostrar PIN';
  setMode(Object.keys(users()).length?'in':'up');
  au.classList.remove('done'); $('auGo').disabled=false;
  prevOv=document.body.style.overflow; document.body.style.overflow='hidden';
  au.hidden=false; void au.offsetWidth; au.classList.add('open');
  setTimeout(()=>{(mode==='up'?$('auN'):($('auP').value?pins[0]:$('auP'))).focus({preventScroll:true})},rm?0:380);
}
function close(keep){
  au.classList.remove('open'); if(!keep)cb=null;
  setTimeout(()=>{au.hidden=true;document.body.style.overflow=prevOv},rm?0:480);
  if(last&&last.focus&&!keep)last.focus({preventScroll:true});
}
function ok(u){
  au.classList.add('done'); $('auGoL').textContent='¡Listo, '+u.n.split(' ')[0]+'!';
  setTimeout(()=>{
    const f=cb; cb=null; close(true);
    if(window.mmToast)mmToast('Hola, '+u.n.split(' ')[0]+' 👋');
    if(f)setTimeout(f,rm?0:420);
  },rm?0:750);
}
async function submit(){
  if(busy||au.classList.contains('done'))return;
  const now=Date.now(); if(now<lockUntil)return err('Demasiados intentos. Espera '+Math.ceil((lockUntil-now)/1000)+' s.');
  const p=digits($('auP').value), pv=pinVal(), n=$('auN').value.trim().replace(/\s+/g,' ');
  if(mode==='up'&&n.length<2){err('Escribe tu nombre.');$('auN').focus();return}
  if(!/^9\d{8}$/.test(p)){err('El celular debe tener 9 dígitos y empezar con 9.');$('auP').focus();return}
  if(pv.length<4){err('Completa tu PIN de 4 dígitos.');pins[pv.length].focus();return}
  busy=true; $('auGo').disabled=true;
  try{
    const U=users(); let u=U[p];
    if(mode==='up'){
      if(u){setMode('in');err('Ese celular ya tiene cuenta. Ingresa con tu PIN.');return}
      const s=Math.random().toString(36).slice(2,10);
      u=U[p]={n,p,s,h:await hash(s+pv),t:Date.now()}; wr('mm_users',U);
    }else{
      if(!u){setMode('up');err('No encontramos ese celular. Crea tu cuenta, toma 10 segundos.');return}
      if(await hash(u.s+pv)!==u.h){
        const k=tries[p]=(tries[p]||0)+1;
        if(k>=5){lockUntil=Date.now()+30000;tries[p]=0;err('Demasiados intentos. Espera 30 s.')}
        else err('PIN incorrecto. Te quedan '+(5-k)+(5-k===1?' intento.':' intentos.'));
        clearPin(); return;
      }
      tries[p]=0;
    }
    wr('mm_session',p); wr('mm_sender',{n:u.n,p}); ok(u);
  }finally{busy=false;if(!au.classList.contains('done'))$('auGo').disabled=false}
}
function logout(){try{localStorage.removeItem('mm_session')}catch(e){} if(window.mmToast)mmToast('Sesión cerrada')}

/* eventos */
segs.forEach(b=>b.onclick=()=>setMode(b.dataset.m));
$('auP').addEventListener('input',e=>{e.target.value=fmt(digits(e.target.value));err('')});
$('auN').addEventListener('input',()=>err(''));
$('auGo').onclick=submit; $('auX').onclick=$('auBack').onclick=()=>close();
$('auEye').onclick=()=>{const show=pins[0].type==='password';pins.forEach(i=>i.type=show?'text':'password');$('auEye').textContent=show?'Ocultar PIN':'Mostrar PIN'};
pins.forEach((el,i)=>{
  el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'').slice(-1);el.classList.toggle('f',!!el.value);err('');if(el.value&&i<3)pins[i+1].focus();else if(el.value&&i===3)$('auGo').focus()});
  el.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!el.value&&i>0){pins[i-1].value='';pins[i-1].classList.remove('f');pins[i-1].focus()}});
  el.addEventListener('paste',e=>{const d=((e.clipboardData&&e.clipboardData.getData('text'))||'').replace(/\D/g,'').slice(0,4);if(!d)return;e.preventDefault();pins.forEach((x,j)=>{x.value=d[j]||'';x.classList.toggle('f',!!x.value)});pins[Math.min(d.length,3)].focus()});
  el.addEventListener('focus',()=>el.select());
});
/* teclado: Esc cierra el login (no la boleta), Tab se queda dentro, Enter envía */
document.addEventListener('keydown',e=>{
  if(au.hidden)return;
  if(e.key==='Escape'){e.stopPropagation();close();return}
  if(e.key==='Tab'){
    e.stopPropagation();
    const f=[...card.querySelectorAll('button,input')].filter(x=>!x.disabled&&!x.closest('[inert]')&&x.offsetParent);
    if(!f.length)return; const i=f.indexOf(document.activeElement);
    if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
    else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}
    return;
  }
  if(e.key==='Enter'&&e.target.matches&&e.target.matches('.au input')){e.preventDefault();submit()}
},true);

/* PUERTA: "Pedir" en la boleta exige sesión; al entrar, el pedido sigue solo */
$('rc').addEventListener('click',e=>{
  const a=e.target.closest('#rcGo'); if(!a||user()||a.classList.contains('off'))return;
  e.preventDefault(); e.stopPropagation();
  open(()=>$('rcGo').click());
},true);

window.MM_AUTH={user,open,logout};
})();
