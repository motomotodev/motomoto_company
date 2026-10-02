# MotoMoto · Delivery

Página estática (HTML + CSS + JS puro) organizada en componentes independientes.

## Estructura

```
motomoto/
├─ index.html                 ← GENERADO por build.js (no editar a mano)
├─ index.template.html        ← esqueleto de la página (head + orden de componentes)
├─ build.js                   ← ensambla index.html  →  node build.js
├─ js_order.txt               ← orden de carga de los JS (importa: comparten variables globales)
├─ css/
│  ├─ fonts.css               ← @font-face de Sharpie
│  └─ base.css                ← variables, reset, estilos globales
├─ components/
│  ├─ fondo/        video de fondo + filtro SVG
│  ├─ header/       logo, redes sociales
│  ├─ buscador/     buscador + botón de mapa (+ scrim)
│  ├─ hero/         escenario principal + categorías
│  ├─ locales/      cartel del local, carta completa, horario, logos
│  ├─ restaurantes/ lista "Todos los restaurantes"
│  ├─ boleta/       carrito, Servicio VIP, panel lateral, promociones
│  ├─ paquetes/     envío de paquetes
│  ├─ mapa/         mapa de locales (+ configuración compartida)
│  ├─ footer/       pie, textos legales, aviso de cookies
│  ├─ nav-movil/    barra inferior móvil + hojas Pedidos/Favoritos/Perfil
│  └─ login/        ingreso con celular + PIN
│     └─ cada carpeta: <nombre>.html · <nombre>.css · <nombre>.js
├─ data/restaurantes.js       ← locales, productos, horarios (antes datos-restaurantes.js)
├─ assets/fonts, assets/img   ← fuentes y logos
├─ img/restaurantes/<id>/...  ← logo, fondo y productos de cada local
└─ database/001_initial_schema.sql
```

## Uso

1. Edita el HTML/CSS/JS dentro de `components/<nombre>/`.
2. Ejecuta `node build.js` para regenerar `index.html`.
3. Abre `index.html` (funciona con doble clic o en cualquier hosting estático).

Para agregar un componente nuevo: crea su carpeta, añade `<!--@include nombre-->` en
`index.template.html` y registra sus archivos en las listas `CSS` y `js_order.txt`.
