/* ===== PIE DE PÁGINA Y TEXTOS LEGALES ===================================
   EDITA SOLO ESTE BLOQUE `LEGAL` con los datos reales de tu negocio.
   Lo que dice "[COMPLETAR ...]" sale resaltado en amarillo hasta que lo llenes.
   ===================================================================== */
const LEGAL={
  marca:'MotoMoto',
  razon:'[COMPLETAR razón social o nombre del titular]',
  ruc:'[COMPLETAR RUC de 11 dígitos]',
  dir:'[COMPLETAR dirección legal], Pucallpa, Ucayali, Perú',
  correo:'[COMPLETAR correo de contacto]',
  tel:'[COMPLETAR teléfono]',
  horario:'Todos los días · según el horario de cada local',
  web:'[COMPLETAR dirección de tu página web]',
  actualizado:'29 de septiembre de 2026'
};
(()=>{
const $=id=>document.getElementById(id);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pend=v=>/\[COMPLETAR/.test(v);
const F=v=>pend(v)?`<span class="todo">${esc(v)}</span>`:esc(v);
const L=LEGAL, mail=pend(L.correo)?null:L.correo;

/* pie */
$('ftEmp').innerHTML=`<li>${F(L.razon)}</li><li>RUC: ${F(L.ruc)}</li><li>${F(L.dir)}</li><li>${F(L.horario)}</li>`;
const wa=(typeof WA!=='undefined')?WA:'';
$('ftAy').innerHTML=(mail?`<li><a href="mailto:${esc(mail)}">${esc(mail)}</a></li>`:`<li>${F(L.correo)}</li>`)+
  (wa?`<li><a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a></li>`:'')+
  `<li>${F(L.tel)}</li><li><a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener">INDECOPI ↗</a></li>`;
$('ftCopy').innerHTML=`© ${new Date().getFullYear()} ${F(L.razon)} · RUC ${F(L.ruc)} · Todos los derechos reservados. ${esc(L.marca)} es una marca de su titular.`;

const cab=`<p><small>Última actualización: ${esc(L.actualizado)}</small></p>`;
const aviso=`<div class="lg-warn">Texto base. Debe ser revisado por un abogado y completado con los datos reales del negocio antes de publicar la web.</div>`;
const TXT={
terminos:{t:'Términos y condiciones',h:()=>cab+`
<h3>1. Quiénes somos</h3><p>Esta página web es operada por ${F(L.razon)}, con RUC ${F(L.ruc)} y domicilio en ${F(L.dir)} (en adelante, «${esc(L.marca)}»). Al usar la web o hacer un pedido aceptas estos términos.</p>
<h3>2. Qué ofrecemos</h3><p>${esc(L.marca)} te permite ver la carta de restaurantes de Pucallpa, armar una boleta de pedido y solicitar su entrega a domicilio. Cada local es responsable de la preparación, la calidad y la información de sus productos.</p>
<h3>3. Quién puede usarla</h3><p>Debes tener 18 años cumplidos o contar con autorización de tu madre, padre o tutor. Te comprometes a dar datos veraces (teléfono y ubicación de entrega).</p>
<h3>4. Pedidos</h3><ul><li>La boleta de pedido es un resumen de lo que solicitas; no es un comprobante de pago tributario.</li><li>El pedido se considera aceptado cuando ${esc(L.marca)} o el local lo confirman por WhatsApp o por otro canal.</li><li>Si un producto no está disponible, te avisaremos para cambiarlo o retirarlo del pedido.</li></ul>
<h3>5. Precios y pagos</h3><p>Los precios están en soles (S/) e incluyen IGV. Se muestran el subtotal, el envío y el Servicio VIP (opcional) antes de que pidas. El total de la boleta es el que pagarás; los medios de pago disponibles se confirman al aceptar tu pedido. Puedes solicitar tu comprobante de pago (boleta o factura) al momento del pedido.</p>
<h3>6. Entrega</h3><p>Aplican las condiciones de la sección «Entregas, cancelaciones y devoluciones». Los tiempos mostrados son estimados y pueden variar por tráfico, clima o alta demanda.</p>
<h3>7. Uso permitido</h3><p>Está prohibido hacer pedidos falsos, dar datos de terceros sin permiso, intentar dañar la página o usarla con fines ilícitos.</p>
<h3>8. Propiedad intelectual</h3><p>Las marcas, logos, textos e imágenes de ${esc(L.marca)} y de los locales pertenecen a sus titulares. No puedes copiarlos ni usarlos sin autorización.</p>
<h3>9. Responsabilidad</h3><p>Hacemos lo posible para que la información sea correcta y la web funcione sin interrupciones, pero no garantizamos que esté libre de errores. Esto no limita los derechos que la ley te reconoce como consumidor.</p>
<h3>10. Reclamos</h3><p>Contamos con un <a href="#" data-lg="reclamos">Libro de Reclamaciones virtual</a>. El proveedor responde reclamos y quejas en un plazo máximo de 15 días hábiles. Reclamar no te impide acudir al INDECOPI u otras vías.</p>
<h3>11. Ley aplicable</h3><p>Estos términos se rigen por las leyes de la República del Perú, en especial la Ley 29571 (Código de Protección y Defensa del Consumidor). Para cualquier controversia son competentes los jueces de Pucallpa, sin perjuicio de tu derecho como consumidor.</p>
<h3>12. Cambios</h3><p>Podemos actualizar estos términos; la versión vigente es la publicada aquí con su fecha de actualización.</p>`+aviso},
privacidad:{t:'Política de privacidad',h:()=>cab+`
<p>Tu privacidad importa. Esta política explica cómo tratamos tus datos personales conforme a la Ley 29733, Ley de Protección de Datos Personales, y su reglamento.</p>
<h3>1. Responsable</h3><p>${F(L.razon)} · RUC ${F(L.ruc)} · ${F(L.dir)} · Correo: ${F(L.correo)}.</p>
<h3>2. Qué datos tratamos</h3><ul><li>Ubicación de entrega (coordenadas), solo si la marcas o permites que el navegador la detecte.</li><li>Datos de tu pedido: platos, montos, número de boleta.</li><li>Datos de contacto (nombre, teléfono, correo) cuando los das para un pedido, consulta o reclamo.</li></ul>
<h3>3. Para qué los usamos</h3><ul><li>Gestionar y entregar tu pedido, y calcular distancias y envío.</li><li>Atender consultas, reclamos y quejas.</li><li>Cumplir obligaciones legales y tributarias.</li></ul>
<h3>4. Consentimiento</h3><p>Tratamos tus datos con tu consentimiento libre, previo, expreso e informado, que das al marcar tu ubicación o enviar un pedido o formulario. Puedes retirarlo en cualquier momento.</p>
<h3>5. Con quién los compartimos</h3><p>Con el local que prepara tu pedido y con el repartidor, solo lo necesario para la entrega. También intervienen servicios técnicos: OpenStreetMap (mapas y búsqueda de direcciones), Leaflet/cdnjs (carga del mapa) y WhatsApp (comunicación). No vendemos tus datos.</p>
<h3>6. Dónde se guardan</h3><p>Tu ubicación y pedidos recientes se guardan en el almacenamiento local de tu propio navegador y puedes borrarlos limpiando los datos del sitio. Los datos que nos envíes por WhatsApp o correo se conservan mientras sean necesarios para atenderte y por los plazos legales.</p>
<h3>7. Tus derechos (ARCO)</h3><p>Puedes solicitar acceso, rectificación, cancelación y oposición escribiendo a ${F(L.correo)} con tu nombre y documento de identidad. Si no estás conforme con la respuesta, puedes acudir a la Autoridad Nacional de Protección de Datos Personales (Ministerio de Justicia y Derechos Humanos).</p>
<h3>8. Seguridad y menores</h3><p>Aplicamos medidas razonables para proteger tus datos. No recopilamos a sabiendas datos de menores de edad sin autorización de sus padres o tutores.</p>
<h3>9. Cambios</h3><p>Publicaremos aquí cualquier cambio a esta política.</p>`+aviso},
cookies:{t:'Política de cookies y almacenamiento',h:()=>cab+`
<p>Esta web no usa cookies de publicidad ni de seguimiento. Sí usa el <b>almacenamiento local</b> de tu navegador para funcionar:</p>
<ul><li><b>Ubicación de entrega</b> que marcas en el mapa.</li><li><b>Pedidos recientes y búsquedas recientes</b>, para que los tengas a mano.</li><li><b>Tu aceptación de este aviso</b>.</li></ul>
<p>Además, al abrir el mapa se cargan recursos de terceros (OpenStreetMap y cdnjs), que pueden registrar tu dirección IP como cualquier sitio web.</p>
<p>Puedes borrar estos datos en cualquier momento desde la configuración de tu navegador («Borrar datos del sitio»).</p>`},
entregas:{t:'Entregas, cancelaciones y devoluciones',h:()=>cab+`
<h3>Cobertura y tiempos</h3><p>Entregamos en Pucallpa y zonas indicadas en la web. El tiempo mostrado en cada local es un estimado.</p>
<h3>Costo de envío</h3><p>Cada local tiene su envío, que ves en la boleta. Si pides a varios locales se cobra el envío de cada uno. El Servicio VIP (opcional) da prioridad a tu pedido.</p>
<h3>Datos de entrega</h3><p>Debes marcar bien tu ubicación y estar disponible por teléfono. Si no logramos contactarte o la dirección es incorrecta, el pedido puede cancelarse y podría cobrarse el costo del envío.</p>
<h3>Cancelaciones</h3><p>Puedes cancelar mientras el local no haya empezado a preparar tu pedido. Al tratarse de alimentos preparados y perecibles, una vez iniciada la preparación no procede la cancelación.</p>
<h3>Problemas con tu pedido</h3><p>Si tu pedido llega incompleto, en mal estado o distinto al solicitado, avísanos de inmediato por WhatsApp o correo con una foto. Evaluaremos reponer el producto o devolverte el monto correspondiente. También puedes usar el <a href="#" data-lg="reclamos">Libro de Reclamaciones</a>.</p>`+aviso}
};

/* libro de reclamaciones */
function reclamos(){
  return `<p><b>${F(L.razon)}</b> · RUC ${F(L.ruc)}<br>${F(L.dir)}</p>
<p><small>Conforme al Código de Protección y Defensa del Consumidor (Ley 29571), esta empresa cuenta con un Libro de Reclamaciones virtual a tu disposición.</small></p>
<form id="rlF" class="lg-f" autocomplete="on">
 <label class="w">1. Nombre completo<input name="nombre" required></label>
 <label>DNI / CE / Pasaporte<input name="doc" required></label>
 <label>Teléfono<input name="tel" type="tel" required></label>
 <label class="w">Correo electrónico<input name="mail" type="email" required></label>
 <label class="w">Domicilio<input name="dom" required></label>
 <label class="ck w"><input type="checkbox" name="menor"> Soy menor de edad; presento este reclamo con mi madre, padre o tutor.</label>
 <label>2. Bien contratado<select name="bien"><option>Producto</option><option>Servicio</option></select></label>
 <label>Monto reclamado (S/)<input name="monto" inputmode="decimal" placeholder="0.00"></label>
 <label class="w">Descripción del bien contratado<input name="desc" required placeholder="Ej.: Pedido N° 595198, Lasaña de Pizzería Don Luigi"></label>
 <label>3. Tipo<select name="tipo"><option>Reclamo</option><option>Queja</option></select></label>
 <label class="w"><span>Detalle del reclamo o queja</span><textarea name="det" required></textarea></label>
 <label class="w">Pedido del consumidor<textarea name="ped" required></textarea></label>
 <label class="ck w"><input type="checkbox" name="acep" required> Acepto el tratamiento de mis datos personales solo para atender este reclamo o queja.</label>
 <div class="w"><small>• El reclamo es la disconformidad con el producto o servicio; la queja es la disconformidad no relacionada con ellos (por ejemplo, mala atención). • La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para denunciar ante el INDECOPI. • El proveedor debe responder en un plazo no mayor a 15 días hábiles.</small></div>
 <button class="lg-go w" type="submit">Enviar hoja de reclamación</button>
</form><div id="rlOk"></div>`;
}
function bindReclamos(){
  const f=$('rlF'); if(!f)return;
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(f).entries());
    let list=[];try{list=JSON.parse(localStorage.getItem('mm_reclamos')||'[]')}catch(_){}
    const n=String(list.length+1).padStart(6,'0')+'-'+new Date().getFullYear();
    const fecha=new Date().toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short'});
    const rec={n,fecha,...d,menor:!!d.menor};
    try{localStorage.setItem('mm_reclamos',JSON.stringify(list.concat(rec)))}catch(_){}
    const body=`HOJA DE RECLAMACIÓN N° ${n}\nFecha: ${fecha}\nProveedor: ${L.razon} · RUC ${L.ruc}\n\nConsumidor: ${d.nombre} · Doc: ${d.doc}\nTel: ${d.tel} · Correo: ${d.mail}\nDomicilio: ${d.dom}\n${rec.menor?'(Menor de edad, con apoyo de padre/madre/tutor)\n':''}\nBien contratado: ${d.bien} · ${d.desc}\nMonto reclamado: S/ ${d.monto||'0.00'}\nTipo: ${d.tipo}\nDetalle: ${d.det}\nPedido del consumidor: ${d.ped}`;
    f.hidden=true;
    $('rlOk').innerHTML=`<div class="lg-ok"><b>✓ Hoja de reclamación N° ${n}</b><p>Registrada el ${esc(fecha)}. Guarda o imprime esta constancia. Te responderemos al correo indicado en un plazo máximo de 15 días hábiles.</p><div class="row"><button type="button" id="rlPr">Imprimir / guardar PDF</button>${mail?`<a href="mailto:${esc(mail)}?cc=${encodeURIComponent(d.mail)}&subject=${encodeURIComponent('Hoja de reclamación N° '+n)}&body=${encodeURIComponent(body)}">Enviar por correo</a>`:''}${wa?`<a href="https://wa.me/${wa}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">Enviar por WhatsApp</a>`:''}</div>${mail?'':`<p class="todo"><small>Falta configurar el correo del negocio en LEGAL.correo.</small></p>`}</div>`;
    $('rlPr').onclick=()=>window.print();
  });
}

/* ventana */
const box=$('lg'); let last=null;
function openLg(k){
  const isR=k==='reclamos', d=TXT[k];
  $('lgT').textContent=isR?'Libro de Reclamaciones virtual':d.t;
  $('lgB').innerHTML=isR?reclamos():d.h(); $('lgB').scrollTop=0;
  if(isR)bindReclamos();
  last=document.activeElement; box.hidden=false; document.body.style.overflow='hidden'; $('lgX').focus({preventScroll:true});
}
function closeLg(){box.hidden=true;document.body.style.overflow='';if(last&&last.focus)last.focus({preventScroll:true})}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lg]'); if(b){e.preventDefault();openLg(b.dataset.lg);return}
  if(e.target===box)closeLg();
});
$('lgX').onclick=closeLg;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)closeLg()});

/* aviso de almacenamiento */
const ck=$('ckBar'); let seen=false; try{seen=localStorage.getItem('mm_ck')==='1'}catch(_){}
if(!seen)ck.hidden=false;
$('ckOk').onclick=()=>{ck.hidden=true;try{localStorage.setItem('mm_ck','1')}catch(_){}};
})();
