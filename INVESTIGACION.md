# Investigación: Web Components, HTML Templates y frameworks

**Integrantes:** Juan Manuel Castro · David Ricardo López
**Fecha de consulta de las fuentes:** 17 de noviembre de 2026

---

## Parte 1 · Web Components

### 1. ¿Qué problema resuelven los Web Components y qué aporta cada tecnología?

Resuelven la falta de una forma nativa de crear piezas de interfaz reutilizables y aisladas: antes había que copiar HTML, CSS y JS que chocaban con los estilos de cada página, o usar un framework. **Custom Elements** define etiquetas propias con una clase que extiende `HTMLElement` y tiene ciclo de vida. **Shadow DOM** adjunta al elemento un árbol DOM encapsulado, cuyos estilos e ids no chocan con el documento. **HTML Templates** guarda en `<template>` marcado que no se renderiza y se clona para cada instancia.

### 2. ¿En qué se diferencia un `<template>` de un `<div>` oculto con `display: none`?

**Qué se muestra:** ninguno se ve, pero el `<div>` es un nodo normal que solo el CSS oculta; el `<template>` nunca se pinta. **Qué se ejecuta:** el `<div>` no es inerte, así que sus `<script>` corren y sus `<img>` se descargan; el `<template>` es inerte hasta clonarse e insertarse. **Qué encuentra `document.querySelector`:** los elementos del `<div>` sí; los del `<template>` no, porque viven en un `DocumentFragment` aparte (`template.content`). Para buscarlos se usa `template.content.querySelector()`.

### 3. ¿Qué cambia entre el Shadow DOM en modo `"open"` y en modo `"closed"`?

La encapsulación es la misma; cambia el acceso desde JavaScript externo. Con `mode: "open"`, `elemento.shadowRoot` devuelve el `ShadowRoot`, y otros scripts, pruebas o DevTools pueden inspeccionarlo. Con `mode: "closed"`, devuelve `null` y solo el código que guardó la referencia de `attachShadow()` puede usarlo. Según web.dev, el modo cerrado **no es una medida de seguridad** y resta flexibilidad; por eso usamos `open`.

### 4. ¿Qué es un `<slot>` y para qué sirve en un componente reutilizable?

Un `<slot>` es un marcador de posición en el Shadow DOM donde se muestra el contenido escrito entre las etiquetas del componente (el *light DOM*). Puede ser por defecto (`<slot>`) o con nombre (`<slot name="pie">`, que recibe los hijos con `slot="pie"`), y admite contenido de respaldo. Así, el componente fija la estructura y el estilo, y cada instancia aporta su propio texto o HTML. En nuestra práctica, el texto dentro de `<evento-cultural>` es la nota de la tarjeta.

### 5. ¿Qué navegadores soportan hoy los Web Components?

Según **Can I use** (17/11/2026), **Shadow DOM v1** tiene soporte completo en Chrome 53+, Edge 79+, Firefox 63+, Safari 10+, iOS 11+ y Opera 40+ (97,37 % del uso global). **Custom Elements v1** es completo en Chrome 67+, Edge 79+, Firefox 63+ y Opera 64+. Safari e iOS figuran como parciales porque no admiten los *customized built-in elements* (`is="..."`), aunque sí los autónomos como el nuestro. MDN marca `<template>` como Baseline desde noviembre de 2015 y `attachShadow()` desde enero de 2020.

Fuentes de esta respuesta: [Can I use – Shadow DOM (V1)](https://caniuse.com/shadowdomv1), [Can I use – Custom Elements (V1)](https://caniuse.com/custom-elementsv1), [MDN – `<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template), [MDN – attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow). Fecha de consulta: 17/11/2026.

---

## Parte 2 · Frameworks, librerías y Node.js

### 1. Diferencia entre estándar del navegador, librería, framework y entorno de ejecución

Tomemos como ejemplo una tienda en línea y veamos qué papel cumple cada tipo de herramienta:

- **Estándar del navegador:** es una especificación pública (WHATWG, W3C) que los navegadores implementan de forma nativa, así que se usa sin instalar nada. *Ejemplo:* `customElements.define("boton-carrito", BotonCarrito)` o `fetch("/api/productos")` funcionan directamente en Chrome, Firefox o Safari.
- **Librería:** es código de terceros que **tu programa llama** cuando lo necesita; tú decides la estructura y el flujo. *Ejemplo:* React. Tú decides cuándo llamar `createRoot(...).render(<Catalogo />)`, y su documentación oficial aclara que React no impone cómo hacer el enrutamiento ni la carga de datos.
- **Framework:** es una estructura completa que **llama a tu código** (inversión de control). Define la arquitectura, las convenciones y las herramientas, y tú rellenas las piezas. *Ejemplo:* Angular. Trae router, formularios, inyección de dependencias y CLI, y es Angular quien crea y destruye tus componentes.
- **Entorno de ejecución:** es el programa que **ejecuta** código JavaScript fuera del navegador y le da acceso al sistema (archivos, red, procesos). *Ejemplo:* Node.js. Con `node servidor.js` levanta el servidor que responde los pedidos de la tienda.

La diferencia clave es **quién controla a quién**. El estándar viene en el navegador; la librería la llamas tú; el framework te llama a ti; y el entorno de ejecución es el lugar donde corre el código.

### 2. Tabla comparativa

| Criterio | Web Components nativos | React | Vue | Angular |
|---|---|---|---|---|
| **Tipo (estándar, librería o framework)** | Estándar del navegador: conjunto de APIs nativas (Custom Elements, Shadow DOM y HTML Templates). | Librería de JavaScript para construir interfaces; no impone cómo hacer el enrutamiento ni la carga de datos. | Framework “progresivo”: se adopta por partes, desde mejorar HTML estático sin compilación hasta aplicaciones completas. | Framework web completo, que incluye enrutador, formularios con validación, inyección de dependencias y CLI. |
| **Cómo se crea un componente** | Una clase que extiende `HTMLElement`, registrada con `customElements.define("mi-tarjeta", MiTarjeta)`, que normalmente clona un `<template>` en su Shadow DOM. | Una función de JavaScript que devuelve JSX, por ejemplo `function Tarjeta({ titulo }) { return <h3>{titulo}</h3>; }`, y recibe los datos por *props*. | Un archivo `.vue` (Single-File Component) que reúne `<template>`, `<script>` y `<style>`, o un objeto de opciones (`data`, `methods`) sin compilación. | Una clase TypeScript decorada con `@Component`, cuyos metadatos definen el selector, la plantilla HTML y los estilos. |
| **Necesita instalar herramientas (npm)** | No: basta un `.html` y un `.js` que el navegador ejecuta tal cual, sin compilar. | En la práctica sí: el JSX debe compilarse, y la documentación recomienda frameworks como Next.js o React Router, que se instalan con npm. | Es opcional: puede usarse sin paso de compilación, pero los archivos `.vue` requieren herramientas de compilación instaladas con npm. | Sí: Angular CLI se instala con npm (`npm install -g @angular/cli`) y necesita Node.js, que ya incluye npm. |
| **Ventajas principales** | Funcionan en cualquier página y dentro de cualquier framework, sin dependencias ni compilación, con encapsulación real de estilos gracias al Shadow DOM. | Modelo declarativo basado en componentes, ecosistema enorme y la posibilidad de reutilizar lo aprendido en web y móvil (React Native). | Plantillas cercanas al HTML, reactividad automática y adopción gradual, desde mejorar una página hasta una aplicación completa. | Todo integrado y con convenciones comunes, más `ng update` para migraciones automáticas; facilita proyectos grandes con muchos equipos. |
| **Desventajas principales** | API de bajo nivel: estado, re-renderizado y enlace de datos se programan a mano, y no incluye router ni gestión de estado. | Solo cubre la vista, así que enrutamiento y datos dependen de otras herramientas; además, JSX exige un paso de compilación. | Ecosistema y oferta laboral más pequeños que los de React; sus dos estilos (Options API y Composition API) pueden mezclarse en un equipo. | Curva de aprendizaje alta (TypeScript, decoradores, inyección de dependencias) y demasiada estructura para proyectos pequeños. |

### 3. ¿Qué es Node.js y qué relación tiene npm con React, Vue y Angular?

**Node.js es un entorno de ejecución de JavaScript**, de código abierto y multiplataforma, que ejecuta el motor V8 de Chrome fuera del navegador. **No es un framework ni un lenguaje:** es el programa que permite correr JavaScript en el computador o el servidor, con acceso a archivos, red y procesos, y operaciones de entrada/salida asíncronas que no bloquean. Se usa para:

- crear servidores, APIs y aplicaciones web (los frameworks de servidor como Express corren *sobre* Node.js);
- crear herramientas de línea de comandos y scripts;
- ejecutar las herramientas de desarrollo del frontend, como Vite o Angular CLI.

**npm** es el gestor de paquetes estándar de Node.js y viene incluido al instalarlo. Tiene tres partes: el sitio web, la interfaz de línea de comandos y el **registro**, una gran base de datos pública de paquetes JavaScript. React, Vue y Angular se distribuyen como paquetes de ese registro, así que se instalan con comandos como `npm install react react-dom` o `npm install -g @angular/cli`. Node.js ejecuta esas herramientas en el computador del desarrollador, aunque el resultado final (HTML, CSS y JS) corra en el navegador del usuario.

**Tienda en línea con React y Node.js:**

- **React (frontend, en el navegador del comprador):** dibuja el catálogo, los filtros, el carrito y el proceso de pago, y actualiza la interfaz sin recargar la página cada vez que cambia el estado.
- **Node.js (backend, en el servidor):** expone una API (`/api/productos`, `/api/pedidos`), consulta la base de datos, valida el inventario, autentica usuarios y procesa los pagos de forma segura.
- **Cómo se conectan:** React pide los datos con `fetch` a la API de Node.js y muestra la respuesta. Además, durante el desarrollo, Node.js ejecuta las herramientas que compilan la aplicación de React.

### 4. Elección de herramienta por caso

**a. Un botón de chat que varias empresas pegan en sus propias páginas → Web Components nativos.**

Cada empresa usa una tecnología distinta, y un elemento como `<chat-soporte>` se integra en todas con una etiqueta y un `<script>`. El Shadow DOM evita que los estilos del sitio rompan el botón y que el botón altere el sitio. Además, no obliga a cargar un framework, lo que mantiene el peso mínimo y evita depender de versiones de librerías.

**b. Una aplicación web grande para un banco, con muchos equipos de desarrollo → Angular.**

Al ser un framework completo y con convenciones comunes, Angular hace que todos los equipos estructuren componentes, servicios y rutas de la misma forma. TypeScript y la inyección de dependencias reducen errores en operaciones sensibles y facilitan las pruebas. Además, trae router, formularios con validación y `ng update` para migraciones, algo clave en un sistema que debe mantenerse por años.

---

## Fuentes bibliográficas

Todas las fuentes fueron consultadas el **17 de noviembre de 2026**.

| # | Fuente | Título del recurso | Enlace | Fecha de consulta |
|---|---|---|---|---|
| 1 | MDN Web Docs (oficial) | Web Components | https://developer.mozilla.org/en-US/docs/Web/API/Web_components | 17/11/2026 |
| 2 | MDN Web Docs (oficial) | `<template>`: HTML content template element | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template | 17/11/2026 |
| 3 | MDN Web Docs (oficial) | Element: attachShadow() method | https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | 17/11/2026 |
| 4 | MDN Web Docs (oficial) | Element: shadowRoot property | https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot | 17/11/2026 |
| 5 | MDN Web Docs (oficial) | Using templates and slots | https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots | 17/11/2026 |
| 6 | web.dev (técnica, Google) | Shadow DOM v1 – Self-contained Web Components | https://web.dev/articles/shadowdom-v1 | 17/11/2026 |
| 7 | web.dev (técnica, Google) | HTML's new template tag | https://web.dev/articles/webcomponents-template | 17/11/2026 |
| 8 | Can I use (técnica) | Custom Elements (V1) | https://caniuse.com/custom-elementsv1 | 17/11/2026 |
| 9 | Can I use (técnica) | Shadow DOM (V1) | https://caniuse.com/shadowdomv1 | 17/11/2026 |
| 10 | React (documentación oficial) | React – The library for web and native user interfaces | https://react.dev/ | 17/11/2026 |
| 11 | Vue.js (documentación oficial) | Introduction | https://vuejs.org/guide/introduction | 17/11/2026 |
| 12 | Angular (documentación oficial) | What is Angular? | https://angular.dev/overview | 17/11/2026 |
| 13 | Angular (documentación oficial) | Anatomy of components | https://angular.dev/guide/components | 17/11/2026 |
| 14 | Angular (documentación oficial, v19) | Local set-up | https://v19.angular.dev/tools/cli/setup-local | 17/11/2026 |
| 15 | Node.js (documentación oficial) | Introduction to Node.js | https://nodejs.org/learn/getting-started/introduction-to-nodejs | 17/11/2026 |
| 16 | Node.js (documentación oficial) | An introduction to the npm package manager | https://nodejs.org/learn/getting-started/an-introduction-to-the-npm-package-manager | 17/11/2026 |
| 17 | npm Docs (documentación oficial) | About npm | https://docs.npmjs.com/about-npm/ | 17/11/2026 |
