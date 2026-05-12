// =====================================================
//  plantilla-blanconegro · script.js
// =====================================================

let CONFIG = {};

// ── Arranque ──────────────────────────────────────────
fetch('config.json')
  .then(r => r.json())
  .then(c => { CONFIG = c; init(c); })
  .catch(() => { initReveal(); initSmoothScroll(); });

function init(c) {
  poblarHero(c);
  poblarBienvenida(c);
  poblarCuando(c);
  poblarDonde(c);
  poblarDresscode(c);
  poblarRegalos(c);
  renderGaleria(c);
  poblarFooter(c);
  renderCalendario(c.fecha);
  startCountdown(c.fecha);
  initWhatsApp(c);
  initGuardarFecha(c);
  initPlayer(c);
  initCopiar();
  updateMeta(c);

  const refreshSnake = initCountdownSnake();

  if (c.splash !== false) {
    initSplash(() => {
      refreshSnake(); // recalcula dimensiones ahora que el contenido es visible
      initReveal();
      initSmoothScroll();
    });
  } else {
    initReveal();
    initSmoothScroll();
  }
}

// ── Poblar secciones ──────────────────────────────────
function poblarHero(c) {
  animateHeroNombre(c.nombre);
  setText('hero-frase',     c.frase);
  setText('hero-frase-sub', c.fraseSub);
  setText('hero-fecha',     c.fechaDisplay);
  document.title = `15 · ${c.nombre}`;

  if (c.heroFoto) {
    const hero = document.getElementById('hero');
    hero.style.backgroundImage = `url('${c.heroFoto}')`;
    hero.classList.add('hero--foto');
  }
}

function animateHeroNombre(nombre) {
  const el = document.getElementById('hero-nombre');
  if (!el) return;
  el.innerHTML = nombre.split('').map((char, i) => {
    const delay = (0.38 + i * 0.065).toFixed(2);
    const content = char === ' ' ? '&nbsp;' : char;
    return `<span class="hero-char" style="animation-delay:${delay}s">${content}</span>`;
  }).join('');
}

function poblarBienvenida(c) {
  setText('bv-titulo', c.bienvenida.titulo);
  setText('bv-texto',  c.bienvenida.texto);
  setText('bv-firma',  `— ${c.nombre}`);
}

function poblarCuando(c) {
  const fecha   = new Date(c.fecha);
  const meses   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  setText('cuando-dia-semana', diasSem[fecha.getDay()]);
  setText('cuando-numero',     String(fecha.getDate()));
  setText('cuando-mes',        `${meses[fecha.getMonth()]} · ${fecha.getFullYear()}`);
  setText('cuando-hora',       c.hora);
}

function poblarDonde(c) {
  setText('donde-nombre', c.lugar.nombre);
  setText('donde-barrio', c.lugar.barrio);
  setText('donde-dir',    c.lugar.direccion);
  const btn = document.getElementById('donde-mapa');
  if (btn) {
    btn.href = c.lugar.mapsUrl;
    btn.innerHTML = `Cómo llegar <span aria-hidden="true">→</span>`;
  }
}

function poblarDresscode(c) {
  setText('dc-texto', c.dresscode.texto);
  setText('dc-nota',  c.dresscode.nota);
}

function poblarRegalos(c) {
  setText('regalos-texto', c.regalos.texto);
  setText('regalos-alias', c.regalos.alias);
  setText('regalos-cbu',   c.regalos.cbu);
}

function poblarFooter(c) {
  setText('footer-mensaje', c.footer.mensaje);
  setText('footer-firma',   c.footer.firma);
}

// ── Galería ───────────────────────────────────────────
function renderGaleria(c) {
  const grid = document.getElementById('galeria-grid');
  if (!grid || !c.fotos?.length) return;
  grid.innerHTML = c.fotos.map(src => `
    <div class="galeria-item reveal"
         style="background-image:url('${src}')"
         role="img"
         aria-label="Foto de ${c.nombre}"></div>
  `).join('');
}

// ── Countdown ─────────────────────────────────────────
function startCountdown(fechaISO) {
  const target = new Date(fechaISO).getTime();

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-dias','cd-horas','cd-min','cd-seg'].forEach(id => setText(id, '00'));
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    setText('cd-dias',  String(d).padStart(3, '0'));
    setText('cd-horas', String(h).padStart(2, '0'));
    setText('cd-min',   String(m).padStart(2, '0'));
    setText('cd-seg',   String(s).padStart(2, '0'));
  };

  tick();
  setInterval(tick, 1000);
}

// ── Calendario del mes ────────────────────────────────
function renderCalendario(fechaISO) {
  const card = document.getElementById('calendario-card');
  if (!card) return;

  const fecha  = new Date(fechaISO);
  const year   = fecha.getFullYear();
  const month  = fecha.getMonth();
  const day    = fecha.getDate();
  const hoy    = new Date();

  const meses    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const cabecera = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

  const primero = new Date(year, month, 1).getDay();
  const offset  = primero === 0 ? 6 : primero - 1;
  const total   = new Date(year, month + 1, 0).getDate();
  const nombreDia = diasSem[fecha.getDay()];

  let celdas = '';
  for (let i = 0; i < offset; i++) {
    celdas += `<span class="cal-dia cal-dia--vacio"></span>`;
  }
  for (let d = 1; d <= total; d++) {
    const esEvento = d === day;
    const esHoy    = year  === hoy.getFullYear()
                  && month === hoy.getMonth()
                  && d     === hoy.getDate();
    let cls = 'cal-dia';
    if (esEvento)    cls += ' cal-dia--evento';
    else if (esHoy)  cls += ' cal-dia--hoy';
    celdas += `<span class="${cls}">${d}</span>`;
  }

  card.innerHTML = `
    <div class="cal-header">${meses[month]} ${year}</div>
    <div class="cal-semana">${cabecera.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="cal-grid">${celdas}</div>
    <p class="cal-label">${nombreDia} · ${day} de ${meses[month]}</p>
  `;
}

// ── Countdown border spin (efecto puro CSS: conic-gradient + @property en .cd-box) ───
function initCountdownSnake() {
  return () => {};
}

// ── Splash ────────────────────────────────────────────
function initSplash(onReveal) {
  const content = document.getElementById('invitation-content');
  const cta     = document.getElementById('hero-cta');
  const player  = document.getElementById('player');
  if (!content || !cta) return;

  content.classList.add('splash-oculto');
  if (player) player.classList.add('oculto');

  cta.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();

    content.classList.remove('splash-oculto');
    content.classList.add('splash-revelar');

    // Doble rAF para que el browser registre el estado inicial antes de animar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.classList.add('splash-visible');
        if (player) player.classList.remove('oculto');
        if (onReveal) onReveal();
        setTimeout(() => {
          const target = document.getElementById('bienvenida');
          if (target) window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        }, 350);
      });
    });
  }, { once: true });
}

// ── WhatsApp ──────────────────────────────────────────
function initWhatsApp(c) {
  const btn = document.getElementById('btn-whatsapp');
  if (!btn || !c.whatsapp) return;
  const url = `https://wa.me/${c.whatsapp.numero}?text=${encodeURIComponent(c.whatsapp.mensaje)}`;
  btn.href = url;
}

// ── Guardar en Google Calendar ────────────────────────
function initGuardarFecha(c) {
  const btn = document.getElementById('btn-calendario');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const fecha = new Date(c.fecha);
    const fin   = new Date(fecha.getTime() + 4 * 3600000);
    const fmt   = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent('15 de ' + c.nombre)}`
      + `&dates=${fmt(fecha)}/${fmt(fin)}`
      + `&details=${encodeURIComponent('Fiesta de 15 de ' + c.nombre)}`
      + `&location=${encodeURIComponent(c.lugar.direccion)}`;
    window.open(url, '_blank');
  });
}

// ── Música ────────────────────────────────────────────
function initPlayer(c) {
  const audio = document.getElementById('player-audio');
  const btn   = document.getElementById('player-btn');
  const play  = btn?.querySelector('.icon-play');
  const pause = btn?.querySelector('.icon-pause');
  if (!audio || !btn) return;

  if (c.musica?.src)     audio.src = c.musica.src;
  if (c.musica?.titulo)  setText('player-titulo',  c.musica.titulo);
  if (c.musica?.artista) setText('player-artista', c.musica.artista);
  audio.volume = 0.4;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      if (play)  play.style.display  = 'none';
      if (pause) pause.style.display = '';
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Pausar');
    } else {
      audio.pause();
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Reproducir');
    }
  });
}

// ── Copiar al portapapeles ────────────────────────────
function initCopiar() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.rc-copiar');
    if (!btn) return;
    const campo = document.getElementById(btn.dataset.campo);
    if (!campo) return;
    navigator.clipboard.writeText(campo.textContent.trim()).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copiado';
      btn.classList.add('copiado');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copiado');
      }, 2000);
    }).catch(() => {});
  });
}

// ── Scroll reveal ─────────────────────────────────────
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  const observe = () => document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  observe();
  setTimeout(observe, 300);
}

// ── Smooth scroll ─────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    });
  });
}

// ── Open Graph dinámico ───────────────────────────────
function updateMeta(c) {
  const set = (prop, val) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  set('og:title',       `15 de ${c.nombre}`);
  set('og:description', c.frase);
  if (c.heroFoto) set('og:image', c.heroFoto);
}

// ── Util ──────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.textContent = val;
}
