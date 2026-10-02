/* El video de fondo se pausa mientras hay una ventana abierta (menos tirones) */
(()=>{const v=document.getElementById('bg');if(!v)return;
const els=['rc','mp','pk','lg'].map(i=>document.getElementById(i)).filter(Boolean);let was=false,t;
const chk=()=>{clearTimeout(t);t=setTimeout(()=>{const open=els.some(e=>!e.hidden);
  if(open){if(!v.paused){was=true;v.pause()}}else if(was){was=false;v.play().catch(()=>{})}},200)};
const mo=new MutationObserver(chk);els.forEach(e=>mo.observe(e,{attributes:true,attributeFilter:['hidden']}));})();
