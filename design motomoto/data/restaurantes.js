/* =====================================================================
   MOTOMOTO · DATOS DE RESTAURANTES  (reemplaza a una base de datos)
   ---------------------------------------------------------------------
   Aquí está TODO: restaurantes, ubicación, teléfono, horario, logo,
   imagen de fondo y sus productos (cada uno con su propia imagen).
   El HTML solo lee este archivo; no hace falta tocar el HTML para
   agregar o editar un local.

   CARPETA DE IMÁGENES (junto al HTML):
     img/restaurantes/<id-del-local>/logo.png
     img/restaurantes/<id-del-local>/fondo.jpg
     img/restaurantes/<id-del-local>/productos/<id-del-producto>.png   (PNG sin fondo se ve mejor)

   Si una imagen todavía no existe, la página muestra el emoji / emblema
   provisorio en su lugar, así que puedes ir subiendo las imágenes poco a poco.

   SUBCATEGORÍAS (opcional, propias de cada local):
     - En el local: subcategorias: [ {id:"rolls", nombre:"Rolls", emoji:"🍣"}, ... ]
     - En cada producto: subcategoria:"rolls"   (el id de la subcategoría)
     Se muestran como botones arriba de "Ver todos los productos".
     Si un local no define "subcategorias", no muestra botones. Un producto sin
     "subcategoria" solo aparece en "Todos".

   HORARIO (abre y cierra solo):
     - Cada local tiene "horario" con los 7 días. La web calcula sola si está
       ABIERTO o CERRADO según la hora del cliente y bloquea los pedidos cuando cierra.
     - Día sin atención: lunes: {cerrado:true}
     - Turno partido (almuerzo y cena): {abre:"12:00", cierra:"15:00", abre2:"18:00", cierra2:"23:00"}
     - Cerrar de inmediato (feriado, se acabó el gas, etc.) sin tocar el horario:
       agrega  cierreManual: true  dentro del local. Quítalo para que vuelva al horario.

   PARA AGREGAR UN LOCAL: copia un bloque completo { ... }, cambia el id,
   la "categoria" (debe ser una de: Pizza, Burger, Sushi, Pollo, Chifa, Helados)
   y llena sus datos. Separa los bloques con coma.
   ===================================================================== */

const RESTAURANTES = [
  {
    id: "pizzeria-don-luigi",
    categoria: "Pizza",
    nombre: "Pizzería Don Luigi",
    etiqueta: "#1 Más pedido",
    calificacion: 4.8,
    tiempo: "25 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 101",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37800, lng: -74.55520   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/pizzeria-don-luigi/logo.png",
    fondo: "img/restaurantes/pizzeria-don-luigi/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"pizzas", nombre:"Pizzas", emoji:"🍕"},
      {id:"pastas-horno", nombre:"Pastas y horno", emoji:"🍝"},
      {id:"ensaladas", nombre:"Ensaladas", emoji:"🥗"},
      {id:"postres", nombre:"Postres", emoji:"🍰"}
    ],

    productos: [
      {id:"pizza-margarita", subcategoria:"pizzas", nombre:"Pizza Margarita", emoji:"🍕", precio:28, tiempo:"20 min", descripcion:"Salsa de tomate casera, mozzarella fundida y albahaca fresca sobre masa madre, horneada en horno de leña.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/pizza-margarita.png"},
      {id:"pepperoni", subcategoria:"pizzas", nombre:"Pepperoni", emoji:"🍕", precio:34, tiempo:"25 min", descripcion:"Doble porción de pepperoni crocante con mozzarella y un toque de orégano.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/pepperoni.png"},
      {id:"lasana", subcategoria:"pastas-horno", nombre:"Lasaña", emoji:"🍝", precio:26, tiempo:"25 min", descripcion:"Capas de pasta, carne al ragú y bechamel, gratinada con queso.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/lasana.png"},
      {id:"cuatro-quesos", subcategoria:"pizzas", nombre:"Cuatro Quesos", emoji:"🍕", precio:36, tiempo:"25 min", descripcion:"Mozzarella, parmesano, gorgonzola y provolone.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/cuatro-quesos.png"},
      {id:"calzone", subcategoria:"pastas-horno", nombre:"Calzone", emoji:"🥟", precio:24, tiempo:"25 min", descripcion:"Masa rellena de jamón y queso, dorada al horno.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/calzone.png"},
      {id:"ensalada-caprese", subcategoria:"ensaladas", nombre:"Ensalada Caprese", emoji:"🥗", precio:18, tiempo:"10 min", descripcion:"Tomate, mozzarella y albahaca fresca.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/ensalada-caprese.png"},
      {id:"tiramisu", subcategoria:"postres", nombre:"Tiramisú", emoji:"🍰", precio:15, tiempo:"5 min", descripcion:"Postre italiano de café y mascarpone.",
       imagen:"img/restaurantes/pizzeria-don-luigi/productos/tiramisu.png"}
    ]
  },

  {
    id: "la-pizzeria-del-puerto",
    categoria: "Pizza",
    nombre: "La Pizzería del Puerto",
    etiqueta: "Horno de leña",
    calificacion: 4.6,
    tiempo: "30 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 102",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Yarinacocha",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.33800, lng: -74.57770   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/la-pizzeria-del-puerto/logo.png",
    fondo: "img/restaurantes/la-pizzeria-del-puerto/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"pizzas", nombre:"Pizzas", emoji:"🍕"},
      {id:"pastas", nombre:"Pastas", emoji:"🍝"},
      {id:"acompanar", nombre:"Para acompañar", emoji:"🥖"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"pizza-amazonica", subcategoria:"pizzas", nombre:"Pizza Amazónica", emoji:"🍕", precio:36, tiempo:"30 min", descripcion:"Cecina, plátano maduro y queso derretido. El sabor de la selva en cada porción.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/pizza-amazonica.png"},
      {id:"hawaiana", subcategoria:"pizzas", nombre:"Hawaiana", emoji:"🍕", precio:30, tiempo:"25 min", descripcion:"Jamón, piña dulce y mucho queso sobre masa esponjosa.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/hawaiana.png"},
      {id:"fettuccine-alfredo", subcategoria:"pastas", nombre:"Fettuccine Alfredo", emoji:"🍝", precio:27, tiempo:"25 min", descripcion:"Pasta al dente en salsa cremosa de queso parmesano.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/fettuccine-alfredo.png"},
      {id:"pizza-criolla", subcategoria:"pizzas", nombre:"Pizza Criolla", emoji:"🍕", precio:33, tiempo:"30 min", descripcion:"Chorizo, cebolla morada y ají amarillo.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/pizza-criolla.png"},
      {id:"pan-al-ajo", subcategoria:"acompanar", nombre:"Pan al ajo", emoji:"🥖", precio:10, tiempo:"10 min", descripcion:"Pan crujiente con mantequilla de ajo y queso.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/pan-al-ajo.png"},
      {id:"ravioles", subcategoria:"pastas", nombre:"Ravioles", emoji:"🍝", precio:28, tiempo:"25 min", descripcion:"Rellenos de ricota en salsa de tomate.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/ravioles.png"},
      {id:"gaseosa-1l", subcategoria:"bebidas", nombre:"Gaseosa 1L", emoji:"🥤", precio:8, tiempo:"5 min", descripcion:"Bien fría.",
       imagen:"img/restaurantes/la-pizzeria-del-puerto/productos/gaseosa-1l.png"}
    ]
  },

  {
    id: "burger-house",
    categoria: "Burger",
    nombre: "Burger House",
    etiqueta: "#2 Más pedido",
    calificacion: 4.7,
    tiempo: "20 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 103",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Yarinacocha",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.33690, lng: -74.57900   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/burger-house/logo.png",
    fondo: "img/restaurantes/burger-house/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"hamburguesas", nombre:"Hamburguesas", emoji:"🍔"},
      {id:"hot-dogs", nombre:"Hot dogs", emoji:"🌭"},
      {id:"snacks", nombre:"Snacks", emoji:"🍟"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"doble-cheese", subcategoria:"hamburguesas", nombre:"Doble Cheese", emoji:"🍔", precio:22, tiempo:"20 min", descripcion:"Doble carne jugosa, cheddar fundido y salsa de la casa en pan brioche.",
       imagen:"img/restaurantes/burger-house/productos/doble-cheese.png"},
      {id:"hot-dog-especial", subcategoria:"hot-dogs", nombre:"Hot Dog Especial", emoji:"🌭", precio:14, tiempo:"15 min", descripcion:"Salchicha premium, papas al hilo, queso y salsas.",
       imagen:"img/restaurantes/burger-house/productos/hot-dog-especial.png"},
      {id:"papas-loaded", subcategoria:"snacks", nombre:"Papas Loaded", emoji:"🍟", precio:16, tiempo:"15 min", descripcion:"Papas crocantes con cheddar, tocino y cebollita china.",
       imagen:"img/restaurantes/burger-house/productos/papas-loaded.png"},
      {id:"burger-clasica", subcategoria:"hamburguesas", nombre:"Burger Clásica", emoji:"🍔", precio:18, tiempo:"15 min", descripcion:"Carne, lechuga, tomate y mayonesa.",
       imagen:"img/restaurantes/burger-house/productos/burger-clasica.png"},
      {id:"nuggets", subcategoria:"snacks", nombre:"Nuggets", emoji:"🍗", precio:15, tiempo:"15 min", descripcion:"Ocho piezas crocantes con dip a elección.",
       imagen:"img/restaurantes/burger-house/productos/nuggets.png"},
      {id:"aros-de-cebolla", subcategoria:"snacks", nombre:"Aros de cebolla", emoji:"🧅", precio:12, tiempo:"15 min", descripcion:"Empanizados y dorados, con salsa rosada.",
       imagen:"img/restaurantes/burger-house/productos/aros-de-cebolla.png"},
      {id:"malteada", subcategoria:"bebidas", nombre:"Malteada", emoji:"🥤", precio:12, tiempo:"10 min", descripcion:"Vainilla, chocolate o fresa.",
       imagen:"img/restaurantes/burger-house/productos/malteada.png"}
    ]
  },

  {
    id: "grill-ucayali",
    categoria: "Burger",
    nombre: "Grill Ucayali",
    etiqueta: "Parrilla",
    calificacion: 4.5,
    tiempo: "25 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 104",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37470, lng: -74.55390   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/grill-ucayali/logo.png",
    fondo: "img/restaurantes/grill-ucayali/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"hamburguesas", nombre:"Hamburguesas", emoji:"🍔"},
      {id:"parrilla", nombre:"Parrilla", emoji:"🍖"},
      {id:"ensaladas", nombre:"Ensaladas", emoji:"🥗"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🍋"}
    ],

    productos: [
      {id:"burger-amazonica", subcategoria:"hamburguesas", nombre:"Burger Amazónica", emoji:"🍔", precio:24, tiempo:"25 min", descripcion:"Carne a la parrilla, queso, plátano frito y ají charapita.",
       imagen:"img/restaurantes/grill-ucayali/productos/burger-amazonica.png"},
      {id:"bbq-bacon", subcategoria:"hamburguesas", nombre:"BBQ Bacon", emoji:"🍔", precio:26, tiempo:"25 min", descripcion:"Tocino crocante, cebolla caramelizada y salsa BBQ ahumada.",
       imagen:"img/restaurantes/grill-ucayali/productos/bbq-bacon.png"},
      {id:"alitas-bbq", subcategoria:"parrilla", nombre:"Alitas BBQ", emoji:"🍗", precio:20, tiempo:"20 min", descripcion:"Alitas bañadas en salsa BBQ con papas y crema de ají.",
       imagen:"img/restaurantes/grill-ucayali/productos/alitas-bbq.png"},
      {id:"costillas-bbq", subcategoria:"parrilla", nombre:"Costillas BBQ", emoji:"🍖", precio:38, tiempo:"30 min", descripcion:"Costillar al horno en salsa BBQ con papas.",
       imagen:"img/restaurantes/grill-ucayali/productos/costillas-bbq.png"},
      {id:"choripan", subcategoria:"parrilla", nombre:"Choripán", emoji:"🌭", precio:13, tiempo:"15 min", descripcion:"Chorizo a la parrilla con chimichurri.",
       imagen:"img/restaurantes/grill-ucayali/productos/choripan.png"},
      {id:"ensalada-grill", subcategoria:"ensaladas", nombre:"Ensalada Grill", emoji:"🥗", precio:16, tiempo:"10 min", descripcion:"Verduras frescas y pollo a la parrilla.",
       imagen:"img/restaurantes/grill-ucayali/productos/ensalada-grill.png"},
      {id:"limonada", subcategoria:"bebidas", nombre:"Limonada", emoji:"🍋", precio:7, tiempo:"5 min", descripcion:"Natural, frozen o con hierbabuena.",
       imagen:"img/restaurantes/grill-ucayali/productos/limonada.png"}
    ]
  },

  {
    id: "sushi-bar",
    categoria: "Sushi",
    nombre: "Sushi Bar",
    etiqueta: "Recomendado",
    calificacion: 4.9,
    tiempo: "35 min",
    envio: "S/ 4 envío",

    telefono: "+51 961 000 105",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37910, lng: -74.55520   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"12:00", cierra:"22:30"},
      martes   : {abre:"12:00", cierra:"22:30"},
      miercoles: {abre:"12:00", cierra:"22:30"},
      jueves   : {abre:"12:00", cierra:"22:30"},
      viernes  : {abre:"12:00", cierra:"00:00"},
      sabado   : {abre:"12:00", cierra:"00:00"},
      domingo  : {abre:"12:00", cierra:"22:30"}
    },

    logo:  "img/restaurantes/sushi-bar/logo.png",
    fondo: "img/restaurantes/sushi-bar/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"rolls", nombre:"Rolls", emoji:"🍣"},
      {id:"nigiri", nombre:"Nigiri", emoji:"🍙"},
      {id:"ramen", nombre:"Ramen", emoji:"🍜"},
      {id:"entradas", nombre:"Entradas", emoji:"🫛"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🍵"}
    ],

    productos: [
      {id:"acevichado-roll", subcategoria:"rolls", nombre:"Acevichado Roll", emoji:"🍣", precio:32, tiempo:"35 min", descripcion:"Langostino tempura, palta y salsa acevichada por encima.",
       imagen:"img/restaurantes/sushi-bar/productos/acevichado-roll.png"},
      {id:"maki-fresh", subcategoria:"rolls", nombre:"Maki Fresh", emoji:"🍱", precio:28, tiempo:"30 min", descripcion:"Roll fresco de salmón y pepino, envuelto en alga nori.",
       imagen:"img/restaurantes/sushi-bar/productos/maki-fresh.png"},
      {id:"tempura-roll", subcategoria:"rolls", nombre:"Tempura Roll", emoji:"🍤", precio:30, tiempo:"35 min", descripcion:"Roll crocante relleno de langostino, queso crema y palta.",
       imagen:"img/restaurantes/sushi-bar/productos/tempura-roll.png"},
      {id:"salmon-nigiri", subcategoria:"nigiri", nombre:"Salmón Nigiri", emoji:"🍣", precio:26, tiempo:"25 min", descripcion:"Seis piezas de salmón fresco sobre arroz.",
       imagen:"img/restaurantes/sushi-bar/productos/salmon-nigiri.png"},
      {id:"ramen", subcategoria:"ramen", nombre:"Ramen", emoji:"🍜", precio:30, tiempo:"30 min", descripcion:"Caldo intenso con cerdo, huevo y fideos.",
       imagen:"img/restaurantes/sushi-bar/productos/ramen.png"},
      {id:"edamame", subcategoria:"entradas", nombre:"Edamame", emoji:"🫛", precio:12, tiempo:"10 min", descripcion:"Vainas al vapor con sal marina.",
       imagen:"img/restaurantes/sushi-bar/productos/edamame.png"},
      {id:"te-verde", subcategoria:"bebidas", nombre:"Té Verde", emoji:"🍵", precio:6, tiempo:"5 min", descripcion:"Caliente o frío.",
       imagen:"img/restaurantes/sushi-bar/productos/te-verde.png"}
    ]
  },

  {
    id: "sakura-roll",
    categoria: "Sushi",
    nombre: "Sakura Roll",
    etiqueta: "Para compartir",
    calificacion: 4.6,
    tiempo: "40 min",
    envio: "S/ 4 envío",

    telefono: "+51 961 000 106",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Manantay",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.40010, lng: -74.54730   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"12:00", cierra:"22:30"},
      martes   : {abre:"12:00", cierra:"22:30"},
      miercoles: {abre:"12:00", cierra:"22:30"},
      jueves   : {abre:"12:00", cierra:"22:30"},
      viernes  : {abre:"12:00", cierra:"00:00"},
      sabado   : {abre:"12:00", cierra:"00:00"},
      domingo  : {abre:"12:00", cierra:"22:30"}
    },

    logo:  "img/restaurantes/sakura-roll/logo.png",
    fondo: "img/restaurantes/sakura-roll/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"rolls", nombre:"Rolls", emoji:"🍣"},
      {id:"combos", nombre:"Combos", emoji:"🍱"},
      {id:"entradas", nombre:"Entradas", emoji:"🥟"},
      {id:"sopas-fideos", nombre:"Sopas y fideos", emoji:"🍜"},
      {id:"postres", nombre:"Postres", emoji:"🍡"}
    ],

    productos: [
      {id:"california-roll", subcategoria:"rolls", nombre:"California Roll", emoji:"🍣", precio:29, tiempo:"35 min", descripcion:"Kanikama, palta y pepino, cubierto de ajonjolí.",
       imagen:"img/restaurantes/sakura-roll/productos/california-roll.png"},
      {id:"combo-sakura", subcategoria:"combos", nombre:"Combo Sakura", emoji:"🍱", precio:54, tiempo:"40 min", descripcion:"24 piezas surtidas para compartir entre dos o tres.",
       imagen:"img/restaurantes/sakura-roll/productos/combo-sakura.png"},
      {id:"gyozas", subcategoria:"entradas", nombre:"Gyozas", emoji:"🥟", precio:18, tiempo:"25 min", descripcion:"Empanaditas japonesas de cerdo, doradas a la plancha.",
       imagen:"img/restaurantes/sakura-roll/productos/gyozas.png"},
      {id:"ebi-furai-roll", subcategoria:"rolls", nombre:"Ebi Furai Roll", emoji:"🍤", precio:31, tiempo:"35 min", descripcion:"Langostino empanizado con salsa teriyaki.",
       imagen:"img/restaurantes/sakura-roll/productos/ebi-furai-roll.png"},
      {id:"sopa-miso", subcategoria:"sopas-fideos", nombre:"Sopa Miso", emoji:"🍲", precio:12, tiempo:"15 min", descripcion:"Caldo de miso con tofu y alga.",
       imagen:"img/restaurantes/sakura-roll/productos/sopa-miso.png"},
      {id:"yakisoba", subcategoria:"sopas-fideos", nombre:"Yakisoba", emoji:"🍜", precio:24, tiempo:"25 min", descripcion:"Fideos salteados con verduras y pollo.",
       imagen:"img/restaurantes/sakura-roll/productos/yakisoba.png"},
      {id:"mochi", subcategoria:"postres", nombre:"Mochi", emoji:"🍡", precio:10, tiempo:"5 min", descripcion:"Bolitas de arroz rellenas de helado.",
       imagen:"img/restaurantes/sakura-roll/productos/mochi.png"}
    ]
  },

  {
    id: "polleria-el-rey",
    categoria: "Pollo",
    nombre: "Pollería El Rey",
    etiqueta: "Clásico",
    calificacion: 4.6,
    tiempo: "30 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 107",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Manantay",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.39900, lng: -74.54860   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"12:00", cierra:"23:30"},
      martes   : {abre:"12:00", cierra:"23:30"},
      miercoles: {abre:"12:00", cierra:"23:30"},
      jueves   : {abre:"12:00", cierra:"23:30"},
      viernes  : {abre:"12:00", cierra:"00:00"},
      sabado   : {abre:"12:00", cierra:"00:00"},
      domingo  : {abre:"12:00", cierra:"23:30"}
    },

    logo:  "img/restaurantes/polleria-el-rey/logo.png",
    fondo: "img/restaurantes/polleria-el-rey/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"brasa", nombre:"Pollo a la brasa", emoji:"🍗"},
      {id:"parrillas", nombre:"Parrillas", emoji:"🍢"},
      {id:"extras", nombre:"Extras", emoji:"🍟"},
      {id:"postres", nombre:"Postres", emoji:"🍮"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"1-4-de-pollo", subcategoria:"brasa", nombre:"1/4 de pollo", emoji:"🍗", precio:18, tiempo:"25 min", descripcion:"Pollo a la brasa dorado con papas fritas, ensalada y cremas.",
       imagen:"img/restaurantes/polleria-el-rey/productos/1-4-de-pollo.png"},
      {id:"pollo-entero", subcategoria:"brasa", nombre:"Pollo entero", emoji:"🍗", precio:62, tiempo:"35 min", descripcion:"Pollo entero a la brasa con papas, ensalada y cremas para la familia.",
       imagen:"img/restaurantes/polleria-el-rey/productos/pollo-entero.png"},
      {id:"anticuchos", subcategoria:"parrillas", nombre:"Anticuchos", emoji:"🍢", precio:16, tiempo:"20 min", descripcion:"Brochetas de corazón marinadas con ají panca, con papa y choclo.",
       imagen:"img/restaurantes/polleria-el-rey/productos/anticuchos.png"},
      {id:"1-8-de-pollo", subcategoria:"brasa", nombre:"1/8 de pollo", emoji:"🍗", precio:12, tiempo:"20 min", descripcion:"Porción personal con papas y ensalada.",
       imagen:"img/restaurantes/polleria-el-rey/productos/1-8-de-pollo.png"},
      {id:"salchipapa", subcategoria:"extras", nombre:"Salchipapa", emoji:"🍟", precio:14, tiempo:"15 min", descripcion:"Papas fritas con salchicha y cremas.",
       imagen:"img/restaurantes/polleria-el-rey/productos/salchipapa.png"},
      {id:"mazamorra", subcategoria:"postres", nombre:"Mazamorra", emoji:"🍮", precio:7, tiempo:"5 min", descripcion:"Postre criollo de maíz morado.",
       imagen:"img/restaurantes/polleria-el-rey/productos/mazamorra.png"},
      {id:"chicha-morada", subcategoria:"bebidas", nombre:"Chicha morada", emoji:"🥤", precio:8, tiempo:"5 min", descripcion:"Jarra bien helada.",
       imagen:"img/restaurantes/polleria-el-rey/productos/chicha-morada.png"}
    ]
  },

  {
    id: "brasas-del-ucayali",
    categoria: "Pollo",
    nombre: "Brasas del Ucayali",
    etiqueta: "Sabor amazónico",
    calificacion: 4.5,
    tiempo: "30 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 108",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37580, lng: -74.55390   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"12:00", cierra:"23:30"},
      martes   : {abre:"12:00", cierra:"23:30"},
      miercoles: {abre:"12:00", cierra:"23:30"},
      jueves   : {abre:"12:00", cierra:"23:30"},
      viernes  : {abre:"12:00", cierra:"00:00"},
      sabado   : {abre:"12:00", cierra:"00:00"},
      domingo  : {abre:"12:00", cierra:"23:30"}
    },

    logo:  "img/restaurantes/brasas-del-ucayali/logo.png",
    fondo: "img/restaurantes/brasas-del-ucayali/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"amazonicos", nombre:"Platos amazónicos", emoji:"🥘"},
      {id:"brasa", nombre:"Pollo a la brasa", emoji:"🍗"},
      {id:"acompanamientos", nombre:"Acompañamientos", emoji:"🍟"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"juane-de-gallina", subcategoria:"amazonicos", nombre:"Juane de gallina", emoji:"🥘", precio:18, tiempo:"25 min", descripcion:"Arroz sazonado con gallina, envuelto y cocido en hoja de bijao.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/juane-de-gallina.png"},
      {id:"tacacho-con-cecina", subcategoria:"amazonicos", nombre:"Tacacho con cecina", emoji:"🥓", precio:22, tiempo:"25 min", descripcion:"Plátano verde machacado con cecina dorada y chorizo regional.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/tacacho-con-cecina.png"},
      {id:"1-2-pollo", subcategoria:"brasa", nombre:"1/2 pollo", emoji:"🍗", precio:34, tiempo:"30 min", descripcion:"Medio pollo a la brasa con papas fritas y ensalada.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/1-2-pollo.png"},
      {id:"inchicapi", subcategoria:"amazonicos", nombre:"Inchicapi", emoji:"🥣", precio:20, tiempo:"25 min", descripcion:"Sopa de maní con gallina y yuca.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/inchicapi.png"},
      {id:"patarashca", subcategoria:"amazonicos", nombre:"Patarashca", emoji:"🐟", precio:26, tiempo:"30 min", descripcion:"Pescado envuelto en bijao y asado.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/patarashca.png"},
      {id:"yuca-frita", subcategoria:"acompanamientos", nombre:"Yuca frita", emoji:"🍟", precio:10, tiempo:"15 min", descripcion:"Dorada y crocante con ají de la casa.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/yuca-frita.png"},
      {id:"refresco-de-cocona", subcategoria:"bebidas", nombre:"Refresco de cocona", emoji:"🥤", precio:7, tiempo:"5 min", descripcion:"Fruta amazónica bien fría.",
       imagen:"img/restaurantes/brasas-del-ucayali/productos/refresco-de-cocona.png"}
    ]
  },

  {
    id: "chifa-oriental",
    categoria: "Chifa",
    nombre: "Chifa Oriental",
    etiqueta: "Sabor de la casa",
    calificacion: 4.5,
    tiempo: "30 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 109",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37470, lng: -74.55520   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/chifa-oriental/logo.png",
    fondo: "img/restaurantes/chifa-oriental/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"arroces", nombre:"Arroces", emoji:"🍚"},
      {id:"tallarines", nombre:"Tallarines", emoji:"🍜"},
      {id:"casa", nombre:"Platos de la casa", emoji:"🍗"},
      {id:"entradas", nombre:"Entradas", emoji:"🥟"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🍵"}
    ],

    productos: [
      {id:"tallarin-saltado", subcategoria:"tallarines", nombre:"Tallarín Saltado", emoji:"🍜", precio:22, tiempo:"25 min", descripcion:"Tallarines salteados al wok con pollo, verduras y sillao.",
       imagen:"img/restaurantes/chifa-oriental/productos/tallarin-saltado.png"},
      {id:"arroz-chaufa", subcategoria:"arroces", nombre:"Arroz Chaufa", emoji:"🍚", precio:20, tiempo:"20 min", descripcion:"Arroz frito al wok con huevo, cebollita china y pollo.",
       imagen:"img/restaurantes/chifa-oriental/productos/arroz-chaufa.png"},
      {id:"wantan-frito", subcategoria:"entradas", nombre:"Wantán Frito", emoji:"🥟", precio:14, tiempo:"15 min", descripcion:"Ocho wantanes crocantes con salsa agridulce.",
       imagen:"img/restaurantes/chifa-oriental/productos/wantan-frito.png"},
      {id:"chaufa-de-mariscos", subcategoria:"arroces", nombre:"Chaufa de Mariscos", emoji:"🦐", precio:28, tiempo:"25 min", descripcion:"Arroz al wok con mariscos y cebollita china.",
       imagen:"img/restaurantes/chifa-oriental/productos/chaufa-de-mariscos.png"},
      {id:"chi-jau-kay", subcategoria:"casa", nombre:"Chi Jau Kay", emoji:"🍗", precio:24, tiempo:"25 min", descripcion:"Pollo troceado en salsa de ostión.",
       imagen:"img/restaurantes/chifa-oriental/productos/chi-jau-kay.png"},
      {id:"kam-lu-wantan", subcategoria:"casa", nombre:"Kam Lu Wantán", emoji:"🥟", precio:26, tiempo:"25 min", descripcion:"Wantán frito con verduras en salsa agridulce.",
       imagen:"img/restaurantes/chifa-oriental/productos/kam-lu-wantan.png"},
      {id:"te-chifa", subcategoria:"bebidas", nombre:"Té Chifa", emoji:"🍵", precio:4, tiempo:"5 min", descripcion:"Té caliente de cortesía.",
       imagen:"img/restaurantes/chifa-oriental/productos/te-chifa.png"}
    ]
  },

  {
    id: "chifa-dragon-dorado",
    categoria: "Chifa",
    nombre: "Chifa Dragón Dorado",
    etiqueta: "Wok a la leña",
    calificacion: 4.4,
    tiempo: "35 min",
    envio: "S/ 3 envío",

    telefono: "+51 961 000 110",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Manantay",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.40120, lng: -74.54730   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"11:00", cierra:"23:00"},
      martes   : {abre:"11:00", cierra:"23:00"},
      miercoles: {abre:"11:00", cierra:"23:00"},
      jueves   : {abre:"11:00", cierra:"23:00"},
      viernes  : {abre:"11:00", cierra:"00:00"},
      sabado   : {abre:"11:00", cierra:"00:00"},
      domingo  : {abre:"11:00", cierra:"23:00"}
    },

    logo:  "img/restaurantes/chifa-dragon-dorado/logo.png",
    fondo: "img/restaurantes/chifa-dragon-dorado/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"especiales", nombre:"Especiales", emoji:"🍜"},
      {id:"salteados", nombre:"Salteados", emoji:"🥩"},
      {id:"arroces", nombre:"Arroces", emoji:"🍚"},
      {id:"sopas-entradas", nombre:"Sopas y entradas", emoji:"🍲"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"aeropuerto", subcategoria:"especiales", nombre:"Aeropuerto", emoji:"🍜", precio:26, tiempo:"30 min", descripcion:"Combinación de arroz chaufa y tallarín saltado en un solo plato.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/aeropuerto.png"},
      {id:"pollo-tipakay", subcategoria:"especiales", nombre:"Pollo Tipakay", emoji:"🍗", precio:24, tiempo:"30 min", descripcion:"Pollo crocante bañado en salsa agridulce de la casa.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/pollo-tipakay.png"},
      {id:"sopa-wantan", subcategoria:"sopas-entradas", nombre:"Sopa Wantán", emoji:"🍲", precio:18, tiempo:"25 min", descripcion:"Caldo aromático con wantanes rellenos y verduras.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/sopa-wantan.png"},
      {id:"lomo-saltado", subcategoria:"salteados", nombre:"Lomo Saltado", emoji:"🥩", precio:26, tiempo:"25 min", descripcion:"Lomo al wok con cebolla, tomate y papas.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/lomo-saltado.png"},
      {id:"chaufa-especial", subcategoria:"arroces", nombre:"Chaufa Especial", emoji:"🍚", precio:24, tiempo:"25 min", descripcion:"Con pollo, cerdo y tortilla de huevo.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/chaufa-especial.png"},
      {id:"rollitos-primavera", subcategoria:"sopas-entradas", nombre:"Rollitos Primavera", emoji:"🥟", precio:12, tiempo:"15 min", descripcion:"Cuatro rollitos crocantes con salsa.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/rollitos-primavera.png"},
      {id:"gaseosa-500ml", subcategoria:"bebidas", nombre:"Gaseosa 500ml", emoji:"🥤", precio:5, tiempo:"5 min", descripcion:"Bien fría.",
       imagen:"img/restaurantes/chifa-dragon-dorado/productos/gaseosa-500ml.png"}
    ]
  },

  {
    id: "heladeria-polar",
    categoria: "Helados",
    nombre: "Heladería Polar",
    etiqueta: "Para el calor",
    calificacion: 4.8,
    tiempo: "15 min",
    envio: "S/ 2 envío",

    telefono: "+51 961 000 111",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Centro",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.37800, lng: -74.55780   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"10:00", cierra:"22:00"},
      martes   : {abre:"10:00", cierra:"22:00"},
      miercoles: {abre:"10:00", cierra:"22:00"},
      jueves   : {abre:"10:00", cierra:"22:00"},
      viernes  : {abre:"10:00", cierra:"00:00"},
      sabado   : {abre:"10:00", cierra:"00:00"},
      domingo  : {abre:"10:00", cierra:"22:00"}
    },

    logo:  "img/restaurantes/heladeria-polar/logo.png",
    fondo: "img/restaurantes/heladeria-polar/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"sabores", nombre:"Sabores", emoji:"🍨"},
      {id:"copas", nombre:"Copas", emoji:"🍧"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"aguaje", subcategoria:"sabores", nombre:"Aguaje", emoji:"🍨", precio:8, tiempo:"10 min", descripcion:"Helado cremoso del fruto amazónico, dulce y ligeramente ácido.",
       imagen:"img/restaurantes/heladeria-polar/productos/aguaje.png"},
      {id:"camu-camu", subcategoria:"sabores", nombre:"Camu Camu", emoji:"🍧", precio:7, tiempo:"10 min", descripcion:"Refrescante y cítrico, cargado de vitamina C.",
       imagen:"img/restaurantes/heladeria-polar/productos/camu-camu.png"},
      {id:"coco", subcategoria:"sabores", nombre:"Coco", emoji:"🍦", precio:7, tiempo:"10 min", descripcion:"Cremoso helado de coco natural con trocitos de fruta.",
       imagen:"img/restaurantes/heladeria-polar/productos/coco.png"},
      {id:"chocolate", subcategoria:"sabores", nombre:"Chocolate", emoji:"🍫", precio:7, tiempo:"10 min", descripcion:"Cremoso, con cacao amazónico.",
       imagen:"img/restaurantes/heladeria-polar/productos/chocolate.png"},
      {id:"fresa", subcategoria:"sabores", nombre:"Fresa", emoji:"🍓", precio:7, tiempo:"10 min", descripcion:"Fruta natural y mucha cremosidad.",
       imagen:"img/restaurantes/heladeria-polar/productos/fresa.png"},
      {id:"copa-polar", subcategoria:"copas", nombre:"Copa Polar", emoji:"🍨", precio:15, tiempo:"10 min", descripcion:"Tres sabores con salsa y barquillo.",
       imagen:"img/restaurantes/heladeria-polar/productos/copa-polar.png"},
      {id:"batido-de-aguaje", subcategoria:"bebidas", nombre:"Batido de Aguaje", emoji:"🥤", precio:10, tiempo:"10 min", descripcion:"Aguaje cremoso, dulce y espeso.",
       imagen:"img/restaurantes/heladeria-polar/productos/batido-de-aguaje.png"}
    ]
  },

  {
    id: "frozen-amazonia",
    categoria: "Helados",
    nombre: "Frozen Amazonía",
    etiqueta: "Sabores de la selva",
    calificacion: 4.7,
    tiempo: "20 min",
    envio: "S/ 2 envío",

    telefono: "+51 961 000 112",   // ← PON AQUÍ el número real al que se le llama

    ubicacion: {
      direccion: "Por completar (calle y número)",   // ← dirección real
      zona: "Yarinacocha",
      ciudad: "Pucallpa",
      referencia: "",
      lat: -8.33800, lng: -74.57510   // ← coordenadas aproximadas, cámbialas por las reales
    },

    horario: {   // formato 24 h. Si cierra de madrugada pon "00:00" o "01:00". Para un día cerrado: {cerrado:true}
      lunes    : {abre:"10:00", cierra:"22:00"},
      martes   : {abre:"10:00", cierra:"22:00"},
      miercoles: {abre:"10:00", cierra:"22:00"},
      jueves   : {abre:"10:00", cierra:"22:00"},
      viernes  : {abre:"10:00", cierra:"00:00"},
      sabado   : {abre:"10:00", cierra:"00:00"},
      domingo  : {abre:"10:00", cierra:"22:00"}
    },

    logo:  "img/restaurantes/frozen-amazonia/logo.png",
    fondo: "img/restaurantes/frozen-amazonia/fondo.jpg",

    subcategorias: [   // ← las subcategorías de ESTE local (cada uno tiene las suyas). Aparecen como botones en "Ver todos los productos"
      {id:"copas", nombre:"Copas y sundaes", emoji:"🍨"},
      {id:"conos", nombre:"Conos", emoji:"🍦"},
      {id:"raspadillas", nombre:"Raspadillas y paletas", emoji:"🍧"},
      {id:"postres", nombre:"Postres", emoji:"🧇"},
      {id:"bebidas", nombre:"Bebidas", emoji:"🥤"}
    ],

    productos: [
      {id:"copa-selva", subcategoria:"copas", nombre:"Copa Selva", emoji:"🍨", precio:14, tiempo:"15 min", descripcion:"Tres bolas de sabores amazónicos con salsa de frutos rojos.",
       imagen:"img/restaurantes/frozen-amazonia/productos/copa-selva.png"},
      {id:"cono-doble", subcategoria:"conos", nombre:"Cono Doble", emoji:"🍦", precio:9, tiempo:"10 min", descripcion:"Dos bolas a elección en cono crocante.",
       imagen:"img/restaurantes/frozen-amazonia/productos/cono-doble.png"},
      {id:"raspadilla", subcategoria:"raspadillas", nombre:"Raspadilla", emoji:"🍧", precio:6, tiempo:"10 min", descripcion:"Hielo raspado con jarabe de frutas y leche condensada.",
       imagen:"img/restaurantes/frozen-amazonia/productos/raspadilla.png"},
      {id:"sundae-cacao", subcategoria:"copas", nombre:"Sundae Cacao", emoji:"🍦", precio:12, tiempo:"10 min", descripcion:"Helado de vainilla con cacao y maní.",
       imagen:"img/restaurantes/frozen-amazonia/productos/sundae-cacao.png"},
      {id:"waffle-con-helado", subcategoria:"postres", nombre:"Waffle con helado", emoji:"🧇", precio:16, tiempo:"15 min", descripcion:"Waffle caliente con dos bolas y miel.",
       imagen:"img/restaurantes/frozen-amazonia/productos/waffle-con-helado.png"},
      {id:"paleta-de-camu", subcategoria:"raspadillas", nombre:"Paleta de Camu", emoji:"🍧", precio:5, tiempo:"5 min", descripcion:"Paleta cítrica de camu camu.",
       imagen:"img/restaurantes/frozen-amazonia/productos/paleta-de-camu.png"},
      {id:"milkshake", subcategoria:"bebidas", nombre:"Milkshake", emoji:"🥤", precio:11, tiempo:"10 min", descripcion:"Cremoso, con el sabor que elijas.",
       imagen:"img/restaurantes/frozen-amazonia/productos/milkshake.png"}
    ]
  }
];

/* ---------- ayudas (no hace falta tocarlas) ---------- */
const DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

/* ---------- HORARIO · abrir y cerrar solo ---------- */
const DIAS_NOMBRE = {domingo:'Domingo',lunes:'Lunes',martes:'Martes',miercoles:'Miércoles',jueves:'Jueves',viernes:'Viernes',sabado:'Sábado'};
const _min = h => { const [a,b] = h.split(':').map(Number); return a*60+b; };

/* turnos de un día: [[abre,cierra], ...] en texto. Acepta el segundo turno abre2/cierra2 */
function turnosDia(h){
  if(!h || h.cerrado) return [];
  const t = [[h.abre, h.cierra]];
  if(h.abre2 && h.cierra2) t.push([h.abre2, h.cierra2]);
  return t;
}
/* todos los turnos de la semana en una línea de tiempo (minutos desde el domingo 00:00).
   Un cierre pasada la medianoche ("00:00", "01:00") sigue en el día siguiente. */
function _intervalos(r){
  const out = [];
  DIAS.forEach((d,i) => turnosDia(r.horario && r.horario[d]).forEach(([a,c]) => {
    const ini = i*1440 + _min(a); let fin = i*1440 + _min(c);
    if(fin <= ini) fin += 1440;
    out.push({ini, fin, abre:a, cierra:c, dia:i});
  }));
  return out;
}

/* ¿Está abierto ahora? true/false */
function estaAbierto(r, fecha = new Date()){
  return estadoLocal(r, fecha).abierto;
}

/* Estado completo: { abierto, corto:"Abierto"|"Cerrado", detalle:"Cierra a las 23:00" | "Abre mañana a las 11:00" } */
function estadoLocal(r, fecha = new Date()){
  if(r.cierreManual) return {abierto:false, corto:'Cerrado', detalle:'Cerrado temporalmente'};
  if(!r.horario)     return {abierto:true,  corto:'Abierto', detalle:''};
  const SEM = 7*1440, ahora = fecha.getDay()*1440 + fecha.getHours()*60 + fecha.getMinutes();
  const iv = _intervalos(r);
  if(!iv.length) return {abierto:false, corto:'Cerrado', detalle:'Sin atención esta semana'};
  for(const v of iv){
    for(const off of [0, SEM]){
      if(ahora + off >= v.ini && ahora + off < v.fin)
        return {abierto:true, corto:'Abierto', detalle:'Cierra a las ' + v.cierra};
    }
  }
  /* próxima apertura: el inicio más cercano hacia adelante (con vuelta de semana) */
  let mejor = null;
  for(const v of iv){
    let d = v.ini - ahora; if(d <= 0) d += SEM;
    if(!mejor || d < mejor.d) mejor = {d, v};
  }
  const dias = Math.floor((ahora + mejor.d) / 1440) - Math.floor(ahora / 1440);
  const cuando = dias === 0 ? 'hoy' : dias === 1 ? 'mañana' : 'el ' + DIAS_NOMBRE[DIAS[mejor.v.dia]].toLowerCase();
  return {abierto:false, corto:'Cerrado', detalle:'Abre ' + cuando + ' a las ' + mejor.v.abre};
}

/* Texto de horario de hoy, ej. "11:00 – 23:00" (o "11:00 – 15:00 · 18:00 – 23:00") */
function horarioHoy(r, fecha = new Date()){
  const t = turnosDia(r.horario && r.horario[DIAS[fecha.getDay()]]);
  return t.length ? t.map(x => x[0] + ' – ' + x[1]).join(' · ') : 'Cerrado hoy';
}

/* Semana completa para mostrarla, empezando por el lunes */
function horarioSemana(r, fecha = new Date()){
  return ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map(d => {
    const t = turnosDia(r.horario && r.horario[d]);
    return {dia:DIAS_NOMBRE[d], texto: t.length ? t.map(x => x[0] + ' – ' + x[1]).join(' · ') : 'Cerrado', hoy: d === DIAS[fecha.getDay()]};
  });
}
