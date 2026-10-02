#!/usr/bin/env node
/* Ensambla index.html a partir de los componentes.
   Uso:  node build.js
   - Plantilla:  index.template.html   (marcadores <!--@include nombre--> y <!--@css--> / <!--@js-->)
   - Cada componente vive en components/<nombre>/ con su .html, .css y .js
   El ORDEN de las listas CSS y JS importa (es el orden original de la página). */
const fs = require('fs');
const path = require('path');
const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* ---------- orden de carga ---------- */
const CSS = [
  'css/fonts.css', 'css/base.css',
  'components/header/header.css',
  'components/hero/hero.css',
  'components/buscador/buscador.css',
  'components/mapa/mapa.css',
  'components/locales/locales.css',
  'components/restaurantes/restaurantes.css',
  'components/boleta/boleta.css',
  'components/paquetes/paquetes.css',
  'components/footer/footer.css',
  'components/nav-movil/nav-movil.css',
  'components/login/login.css',
];
const JS = ['data/restaurantes.js'].concat(
  read('js_order.txt').split('\n').filter(Boolean).map((f) => 'components/' + f)
);

/* ---------- ensamblado ---------- */
const include = (name) => {
  const [comp, file] = name.includes('/') ? name.split('/') : [name, name];
  return read(`components/${comp}/${file}.html`).replace(
    /<!--@include ([\w\/-]+)-->/g, (_, n) => include(n));
};
let html = read('index.template.html')
  .replace(/<!--@include ([\w\/-]+)-->/g, (_, n) => include(n))
  .replace('<!--@css-->', CSS.map((f) => `<link rel="stylesheet" href="${f}">`).join('\n'))
  .replace('<!--@js-->', JS.map((f) => `<script src="${f}"></script>`).join('\n'));
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`index.html generado · ${CSS.length} CSS · ${JS.length} JS`);
