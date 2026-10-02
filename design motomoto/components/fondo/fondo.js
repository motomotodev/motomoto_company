/* VIDEO: móvil vs PC */
const v=document.getElementById('bg'), mq=matchMedia('(max-width: 768px), (orientation: portrait)');
/* Videos en la nube (Pixabay CDN). Si una URL falla, prueba la siguiente de la lista */
const VID={
  mobile:['https://cdn.pixabay.com/video/2023/08/09/175357-853206077_large.mp4','https://cdn.pixabay.com/video/2023/08/09/175357-853206077_medium.mp4'],
  pc:['https://cdn.pixabay.com/video/2026/08/15/370702_large.mp4','https://cdn.pixabay.com/video/2026/08/15/370702_medium.mp4']
};
let vi=0;
function setSrc(){const list=mq.matches?VID.mobile:VID.pc;vi=0;
  if(v.dataset.list!==(mq.matches?'m':'p')){v.dataset.list=mq.matches?'m':'p';v.src=list[0];v.play().catch(()=>{});}}
v.addEventListener('error',()=>{const list=mq.matches?VID.mobile:VID.pc;if(++vi<list.length){v.src=list[vi];v.play().catch(()=>{});}});
setSrc();mq.addEventListener('change',setSrc);
addEventListener('click',()=>v.paused&&v.play(),{once:true});
