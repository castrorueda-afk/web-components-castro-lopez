const plantillaEvento = document.getElementById('plantilla-evento');

const etiquetasCategoria = {
  teatro: 'Teatro',
  musica: 'Música',
  cine: 'Cine',
  danza: 'Danza',
  literatura: 'Literatura',
};

const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'short' });
const formatoHorario = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

const proporcionUltimosCupos = 0.15;

function leerEntero(valor, respaldo = 0) {
  const numero = Number.parseInt(valor, 10);
  return Number.isInteger(numero) && numero >= 0 ? numero : respaldo;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// R2
class EventoCultural extends HTMLElement {
  // R3
  static observedAttributes = ['titulo', 'categoria', 'fecha', 'lugar', 'cupos', 'capacidad'];

  #raiz;
  #campos;
  #tarjeta;
  #nota;
  #ranura;
  #conectado = false;

  constructor() {
    super();
    this.#raiz = this.attachShadow({ mode: 'open' });
    // R1
    this.#raiz.append(plantillaEvento.content.cloneNode(true));
    this.#campos = Object.fromEntries(
      Array.from(this.#raiz.querySelectorAll('[data-campo]'), (elemento) => [elemento.dataset.campo, elemento]),
    );
    this.#tarjeta = this.#raiz.querySelector('.tarjeta');
    this.#nota = this.#raiz.querySelector('.nota');
    this.#ranura = this.#raiz.querySelector('slot');
  }

  connectedCallback() {
    this.#conectado = true;
    this.#campos.boton.addEventListener('click', this.#reservar);
    this.#ranura.addEventListener('slotchange', this.#revisarNota);
    this.#renderizar();
    this.#revisarNota();
  }

  disconnectedCallback() {
    this.#conectado = false;
    this.#campos.boton.removeEventListener('click', this.#reservar);
    this.#ranura.removeEventListener('slotchange', this.#revisarNota);
  }

  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    if (this.#conectado && valorAnterior !== valorNuevo) {
      this.#renderizar();
    }
  }

  get titulo() {
    return this.getAttribute('titulo')?.trim() || 'Evento sin título';
  }

  get lugar() {
    return this.getAttribute('lugar')?.trim() || 'Lugar por confirmar';
  }

  get cupos() {
    return leerEntero(this.getAttribute('cupos'));
  }

  get capacidad() {
    return Math.max(leerEntero(this.getAttribute('capacidad'), this.cupos), this.cupos);
  }

  #renderizar() {
    const categoria = this.getAttribute('categoria') ?? '';
    this.#campos.titulo.textContent = this.titulo;
    this.#campos.categoria.textContent = etiquetasCategoria[categoria] ?? 'Cultura';
    this.#campos.lugar.textContent = this.lugar;
    this.#pintarFecha();
    this.#pintarCupos();
  }

  #pintarFecha() {
    const valorFecha = this.getAttribute('fecha') ?? '';
    const fecha = new Date(valorFecha);
    const esValida = valorFecha !== '' && !Number.isNaN(fecha.getTime());

    this.#campos.dia.textContent = esValida ? String(fecha.getDate()).padStart(2, '0') : '--';
    this.#campos.mes.textContent = esValida ? formatoMes.format(fecha).replace('.', '') : 'Por definir';
    this.#campos.horario.textContent = esValida ? capitalizar(formatoHorario.format(fecha)) : 'Fecha por confirmar';

    if (esValida) {
      this.#campos.horario.dateTime = valorFecha;
    } else {
      this.#campos.horario.removeAttribute('datetime');
    }
  }

  #pintarCupos() {
    const { cupos, capacidad } = this;
    const ocupacion = capacidad > 0 ? Math.round(((capacidad - cupos) / capacidad) * 100) : 100;
    let estado = 'disponible';

    if (cupos === 0) {
      estado = 'agotado';
    } else if (cupos / capacidad <= proporcionUltimosCupos) {
      estado = 'pocos';
    }

    const textosEstado = {
      disponible: `de ${capacidad} cupos libres`,
      pocos: `de ${capacidad} · ¡Últimos cupos!`,
      agotado: `de ${capacidad} · Agotado`,
    };

    this.#tarjeta.dataset.estado = estado;
    this.#campos.cupos.textContent = String(cupos);
    this.#campos.estado.textContent = textosEstado[estado];
    this.#campos.barra.style.setProperty('--ocupacion', `${ocupacion}%`);
    this.#campos.barra.setAttribute('aria-valuenow', String(ocupacion));
    this.#campos.barra.setAttribute('aria-valuetext', `${ocupacion} % de ocupación`);
    this.#campos.boton.disabled = estado === 'agotado';
    this.#campos.boton.textContent = estado === 'agotado' ? 'Agotado' : 'Reservar cupo';
  }

  // R4
  #revisarNota = () => {
    const tieneContenido = this.#ranura
      .assignedNodes()
      .some((nodo) => nodo.nodeType === Node.ELEMENT_NODE || nodo.textContent.trim() !== '');
    this.#nota.classList.toggle('nota-vacia', !tieneContenido);
  };

  #reservar = () => {
    const cuposRestantes = this.cupos - 1;

    if (cuposRestantes < 0) {
      return;
    }

    this.setAttribute('cupos', String(cuposRestantes));
    this.dispatchEvent(
      new CustomEvent('reserva', {
        bubbles: true,
        composed: true,
        detail: { titulo: this.titulo, cuposRestantes },
      }),
    );
  };
}

customElements.define('evento-cultural', EventoCultural);

// R5
const listaEventos = document.getElementById('lista-eventos');
const formularioEvento = document.getElementById('formulario-evento');
const aviso = document.getElementById('aviso');
const indicadores = {
  eventos: document.getElementById('total-eventos'),
  cupos: document.getElementById('total-cupos'),
  escenarios: document.getElementById('total-escenarios'),
};
const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
let temporizadorAviso;

function actualizarIndicadores() {
  const eventos = Array.from(listaEventos.querySelectorAll('evento-cultural'));
  const escenarios = new Set(eventos.map((evento) => evento.lugar.toLowerCase()));

  indicadores.eventos.textContent = String(eventos.length);
  indicadores.cupos.textContent = String(eventos.reduce((total, evento) => total + evento.cupos, 0));
  indicadores.escenarios.textContent = String(escenarios.size);
}

function mostrarAviso(mensaje) {
  aviso.textContent = mensaje;
  aviso.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), 3600);
}

function crearEvento({ titulo, categoria, fecha, lugar, aforo, nota }) {
  const evento = document.createElement('evento-cultural');
  const atributos = { titulo, categoria, fecha, lugar, cupos: aforo, capacidad: aforo };

  Object.entries(atributos).forEach(([nombre, valor]) => evento.setAttribute(nombre, valor));

  if (nota) {
    evento.append(nota);
  }

  return evento;
}

listaEventos.addEventListener('reserva', (evento) => {
  const { titulo, cuposRestantes } = evento.detail;
  const mensaje = cuposRestantes === 0
    ? `Reservaste el último cupo de «${titulo}».`
    : `Cupo reservado para «${titulo}». Quedan ${cuposRestantes}.`;

  mostrarAviso(mensaje);
  actualizarIndicadores();
});

formularioEvento.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const datos = Object.fromEntries(
    Array.from(new FormData(formularioEvento), ([nombre, valor]) => [nombre, String(valor).trim()]),
  );
  const nuevoEvento = crearEvento(datos);

  nuevoEvento.classList.add('recien-publicado');
  listaEventos.append(nuevoEvento);
  actualizarIndicadores();
  formularioEvento.reset();
  nuevoEvento.scrollIntoView({ behavior: movimientoReducido.matches ? 'auto' : 'smooth', block: 'center' });
  mostrarAviso(`«${nuevoEvento.titulo}» ya está en la cartelera.`);
});

actualizarIndicadores();
