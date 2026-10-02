/* ===== SERVICIO VIP ===== */
window.MM_VIP=false;
function vipUI(t){
  const on=!!window.MM_VIP&&t.n>0,b=$('rcVip');
  $('rcPaper').classList.toggle('vip',on);b.classList.toggle('on',on);b.setAttribute('aria-checked',on);
  $('rcTitle').textContent=on?'BOLETA VIP':'BOLETA DE PEDIDO';
}
function vipSparks(x,y){
  if(reduce)return;const P=$('rcPaper');
  for(let i=0;i<16;i++){
    const e=document.createElement('i');e.className='rc-spark';e.textContent=i%3?'✦':'✧';e.style.cssText=`left:${x}px;top:${y}px`;P.append(e);
    const a=Math.PI*2*i/16,d=70+Math.random()*90;
    e.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(1.3) rotate(140deg)`,opacity:0}],{duration:800+Math.random()*350,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>e.remove();
  }
}
$('rcVip').onclick=()=>{
  window.MM_VIP=!window.MM_VIP;
  const p=$('rcPaper').getBoundingClientRect(),b=$('rcVip').getBoundingClientRect(),x=b.left+b.width/2-p.left,y=b.top+b.height/2-p.top;
  $('rcPaper').style.setProperty('--gx',x+'px');$('rcPaper').style.setProperty('--gy',y+'px');
  if(window.MM_VIP&&navigator.vibrate)navigator.vibrate(25);
  renderReceipt();
  if(window.MM_VIP)vipSparks(x,y);
};
