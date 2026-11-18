# Telón · Agenda cultural con Web Components

Proyecto de la actividad evaluativa **“Web Components, HTML Templates y frameworks”**.

## Integrantes

- **Juan Manuel Castro**
- **David Ricardo López**

## Descripción

*Telón* es una agenda cultural de Bogotá (ficticia, con fines académicos) construida solo con **HTML, CSS y JavaScript nativos**. Cada evento de la cartelera es una instancia de un mismo Web Component, `<evento-cultural>`, que se arma a partir de un `<template>` propio, se encapsula en Shadow DOM, recibe sus datos por atributos y muestra una nota libre a través de un `<slot>`.

El repositorio también incluye la investigación de las Partes 1 y 2 en [`INVESTIGACION.md`](INVESTIGACION.md).

## Caso elegido

**Tarjeta de evento para una agenda cultural (título, fecha, lugar, cupos).** Es uno de los casos que propone el docente. Lo ampliamos con `categoria` y `capacidad`, lo que permite mostrar la ocupación del evento y un estado visual (cupos disponibles, últimos cupos o agotado).

| Atributo | Ejemplo | Uso dentro del componente |
|---|---|---|
| `titulo` | `La casa de los espejos` | Título de la tarjeta |
| `categoria` | `teatro`, `musica`, `cine`, `danza`, `literatura` | Etiqueta y color de acento (`:host([categoria="..."])`) |
| `fecha` | `2026-11-27T19:30` | Bloque de día y mes, y fecha completa con hora |
| `lugar` | `Sala Teusaquillo` | Lugar del evento |
| `cupos` | `42` | Cupos libres; baja en 1 con cada reserva |
| `capacidad` | `120` | Aforo total; con él se calculan la barra de ocupación y el estado |
| *slot* (contenido) | Texto o HTML entre las etiquetas | Nota o descripción libre del evento |

## Tecnologías utilizadas

- **HTML5:** `<template>`, `<slot>` y estructura semántica.
- **CSS3:** variables, Grid, Flexbox, `:host`, `::slotted`, *container queries* y `color-mix()`.
- **JavaScript (ES2022):** Custom Elements, Shadow DOM, campos privados de clase, `CustomEvent` e `Intl.DateTimeFormat`.
- **Fuentes locales con licencia SIL OFL 1.1:** Gloock e Instrument Sans, guardadas en `assets/fuentes/` para que el diseño se vea igual sin conexión.
- **No usamos ningún framework ni librería** (ni React, ni Vue, ni Angular, ni Bootstrap, ni Tailwind), y el proyecto **no necesita npm**.

## Estructura del proyecto

```
web-components-castro-lopez/
├── README.md
├── INVESTIGACION.md
├── index.html              → template propio, 3 instancias, formulario y secciones de la página
├── css/
│   └── estilos.css         → estilos de la página (los del componente viven en el <template>)
├── js/
│   └── main.js             → clase EventoCultural, registro y lógica de la página
└── assets/
    ├── mockups/
    │   ├── desktop.png     → mockup de escritorio
    │   └── mobile.png      → mockup de celular
    ├── capturas/
    │   ├── escritorio.png  → captura real de la página completa (1440 px)
    │   ├── tablet.png      → captura real de la página completa (820 px)
    │   └── movil.png       → captura real de la página completa (390 px)
    └── fuentes/            → tipografías .woff y sus licencias OFL
```

## Cómo ejecutarlo

No hay nada que instalar.

1. Clona o descarga el repositorio.
2. Abre `index.html` con doble clic en un navegador actualizado (Chrome, Edge, Firefox o Safari).

También se puede servir con cualquier servidor estático, por ejemplo la extensión *Live Server* de VS Code o `python -m http.server`, y abrir `http://localhost:8000`.

## Cómo probar el componente

**Requisitos en la página**

| Requisito | Dónde verlo | Qué comprobar |
|---|---|---|
| **R1 · Template propio** | `index.html`, `<template id="plantilla-evento">`; se clona en `main.js` (`// R1`) | Trae su propio `<style>` y marcadores vacíos (`data-campo="titulo"`, `"lugar"`, `"cupos"`…) que `main.js` rellena. La plantilla original nunca se modifica: cada instancia usa una copia hecha con `cloneNode(true)`. |
| **R2 · Componente** | `js/main.js`, `class EventoCultural extends HTMLElement` (`// R2`) | Se registra con `customElements.define('evento-cultural', …)` y clona el template en un Shadow DOM `open`. Usa `constructor`, `connectedCallback`, `disconnectedCallback` y `attributeChangedCallback`. |
| **R3 · Atributos** | `observedAttributes` (`// R3`) | Seis atributos. Cada instancia de la cartelera muestra datos distintos. |
| **R4 · Slot** | `<slot>` dentro de `.nota` en el template y `#revisarNota` (`// R4`) | El texto entre `<evento-cultural>` y `</evento-cultural>` aparece como nota. La tercera tarjeta proyecta HTML (`<strong>`), que se estiliza con `::slotted`. |
| **R5 · Reutilización** | `#lista-eventos` en `index.html` y `// R5` en `main.js` | Tres instancias con datos distintos, la misma clase y el mismo template. Los indicadores de la portada se calculan a partir de ellas. |

Los únicos comentarios del código son los cinco marcadores `// R1` a `// R5` de `js/main.js`, como pide la actividad.

**Pruebas interactivas**

1. **Reservar cupo:** haz clic en *Reservar cupo* en la primera o segunda tarjeta. El atributo `cupos` baja en 1 y la tarjeta se vuelve a pintar sola. La segunda pasa a *Agotado* después de 6 reservas. La tercera ya empieza agotada, con el botón deshabilitado.
2. **Publicar un evento:** completa el formulario *Publicar evento*. Se crea una nueva instancia con `document.createElement('evento-cultural')`. Si dejas la nota vacía, el slot muestra su **contenido de respaldo** (“Pronto publicaremos la descripción de este evento.”).
3. **Desde la consola del navegador (F12):**

```js
const tarjeta = document.querySelector('evento-cultural');
tarjeta.setAttribute('titulo', 'Título cambiado');   // attributeChangedCallback vuelve a pintar
tarjeta.setAttribute('categoria', 'danza');          // cambia el color de acento
tarjeta.setAttribute('cupos', '3');                  // cambia a “¡Últimos cupos!”
tarjeta.shadowRoot.querySelector('.titulo');         // Shadow DOM en modo open
document.querySelector('.titulo');                   // null: el contenido está encapsulado
document.getElementById('plantilla-evento').content; // DocumentFragment del template
```

4. **Responsive:** abre las herramientas de desarrollo y prueba anchos de 1440, 1024, 820 y 390 px. La cuadrícula pasa de 3 a 2 columnas y luego a 1. Además, el propio componente usa *container queries*: en tarjetas anchas (por ejemplo, la tercera en tableta) la fecha se mueve a una columna lateral, y en tarjetas angostas el botón ocupa todo el ancho.

## Mockups

Los mockups combinan **capturas reales** de la página

### Mockup de escritorio

<img width="821" height="946" alt="image" src="https://github.com/user-attachments/assets/f980fa0a-9c93-41a4-bfce-566adc73230e" />

### Mockup de celular

Viewport de 390 × 844 px: a la izquierda la portada y a la derecha la cartelera. La navegación baja a una segunda fila, los botones se apilan y cada tarjeta ocupa el ancho completo, con el botón de reserva a lo ancho.

![Mockup de celular de Telón](assets/mockups/mobile.png)

### Capturas reales de página completa

Son capturas sin marco, tomadas directamente del navegador:

- [Escritorio, 1440 px](assets/capturas/escritorio.png)
- [Tableta, 820 px](assets/capturas/tablet.png)
- [Celular, 390 px](assets/capturas/movil.png)

## Organización del trabajo en GitHub

| Integrante | Rama | Responsabilidad |
|---|---|---|
| Juan Manuel Castro | `feature/investigacion` | `INVESTIGACION.md`, revisión de fuentes y documentación |
| David Ricardo López | `feature/desarrollo` | `index.html`, `css/`, `js/main.js`, `assets/` e implementación de R1–R5 |
| Ambos | `main` | Integración mediante Pull Requests, revisión cruzada y verificación final |

Cada integrante hace sus commits desde su propia cuenta de GitHub, y el historial de `main` conserva los commits de ambos.

## Declaración de uso de inteligencia artificial

En este proyecto usamos inteligencia artificial (Claude, de Anthropic) como **herramienta de apoyo** para:

- **investigar y organizar la información:**buscar y encontrar informacion valiosa de las tecnologias aplicadas (MDN, web.dev, Can I use y las documentaciones de React, Vue, Angular, Node.js y npm) que nos ayude a culminar la investigacion de forma existosa y estructurar las respuestas
- **desarrollar y revisar el código:** nos ayudo a revisar el codigo y corregir fallas en los momentos cruciales
- **diseñar la interfaz:** nos ayudo sugiriendonos estilos que podriamos usar para la interfaz de la pagina 
- **revisar la documentación:** la ia nos ayudo a corregir faltas de ortografia y complementar la informacion

Los integrantes revisamos, comprendimos y validamos todo lo entregado: verificamos las fuentes, ejecutamos el proyecto y podemos explicar con nuestras palabras cada parte del código y de la investigación. La responsabilidad por el contenido entregado es nuestra.
