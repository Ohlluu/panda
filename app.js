import {
  zone,
  dateKey,
  parseDate,
  todayKey,
  addDays,
  slotsFor,
  firstOpening,
  initialState,
} from './scheduling.js';
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
const KEY = 'little-panda-demo-v1';
let memory = initialState(),
  storageOK = true;
function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return value?.settings?.weekly?.length === 7 && Array.isArray(value.bookings) ? value : memory;
  } catch {
    return memory;
  }
}
let state = read(),
  lang = 'en';
try {
  lang = localStorage.getItem('panda-language') === 'es' ? 'es' : 'en';
} catch {}
function save() {
  memory = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    storageOK = false;
    toast(
      T(
        'Storage unavailable; changes last for this visit.',
        'Almacenamiento no disponible; los cambios duran esta visita.',
      ),
    );
  }
}
const T = (en, es) => (lang === 'es' ? es : en);
const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  leaf: '<path d="M20 3C9 2 3 8 6 15c7 4 14-1 14-12Z"/><path d="m3 21 12-12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-2-10 1Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  people:
    '<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-16a3 3 0 0 1 0 6m3 4a6 6 0 0 1 3 6"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};
function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.leaf}</svg>`;
}
function brand() {
  return `<a class="brand" href="#/" aria-label="Little Panda Daycare"><img src="assets/favicon.svg" alt="" width="52" height="52"><span>little panda<small>D A Y C A R E</small></span></a>`;
}
const programs = () => [
  {
    id: 'infant',
    symbol: '☁',
    title: T('Tiny beginnings', 'Pequeños comienzos'),
    age: T('Infants · 6 weeks–15 months', 'Bebés · 6 semanas–15 meses'),
    desc: T(
      'Gentle routines, cozy cuddles, and a world of first discoveries. A caring start, at their own little pace.',
      'Rutinas tranquilas, mucho cariño y un mundo de primeros descubrimientos. Un comienzo a su propio ritmo.',
    ),
    color: 'peach',
  },
  {
    id: 'toddler',
    symbol: '✿',
    title: T('Curious explorers', 'Exploradores curiosos'),
    age: T('Toddlers · 15 months–3 years', 'Niños pequeños · 15 meses–3 años'),
    desc: T(
      'Big feelings. Busy little hands. Room to explore, make friends, and discover “I can do it!”',
      'Grandes emociones y pequeñas manos ocupadas. Espacio para explorar, hacer amigos y descubrir: «¡Yo puedo!».',
    ),
    color: 'sage',
  },
  {
    id: 'preschool',
    symbol: '✳',
    title: T('Ready, set, wonder', 'Listos para descubrir'),
    age: T('Preschool · 3–5 years', 'Preescolar · 3–5 años'),
    desc: T(
      'Stories, creative play, and joyful learning that build confidence for kindergarten and beyond.',
      'Cuentos, juego creativo y aprendizaje alegre para llegar al kínder con confianza.',
    ),
    color: 'lavender',
  },
  {
    id: 'school',
    symbol: '☀',
    title: T('A little more adventure', 'Un poco más de aventura'),
    age: T('School age · Kindergarten–6th grade', 'Edad escolar · Kínder–6.º grado'),
    desc: T(
      'A welcoming place to recharge, get homework help, and keep the fun going before and after school.',
      'Un lugar acogedor para descansar, recibir ayuda con tareas y seguir disfrutando antes y después de clases.',
    ),
    color: 'butter',
  },
];
function programName(id) {
  return programs().find((p) => p.id === id)?.age || id;
}
function longDate(key, opts = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', opts).format(parseDate(key));
}
function timeLabel(value) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date('2000-01-01T' + value));
}
function btn(text, href = '#/book', cls = 'primary') {
  return `<a class="button ${cls}" href="${href}">${text}${icon('arrow')}</a>`;
}
function header() {
  return `<div class="announcement">${icon('leaf')} ${T('Little hearts. Big possibilities.', 'Pequeños corazones. Grandes posibilidades.')} <span>${T('Care in English & Spanish', 'Cuidado en inglés y español')}</span></div><header class="site-header"><div class="container header-inner">${brand()}<nav id="nav" aria-label="${T('Main navigation', 'Navegación principal')}"><a href="#/about">${T('Our story', 'Nuestra historia')}</a><a href="#/programs">${T('Our programs', 'Programas')}</a><a href="#/day">${T('A day here', 'Un día aquí')}</a><a href="#/faq">${T('Parent FAQs', 'Preguntas')}</a></nav><div class="header-actions"><div class="language" aria-label="${T('Language', 'Idioma')}"><button data-lang="en" aria-pressed="${lang === 'en'}">EN</button><span>/</span><button data-lang="es" aria-pressed="${lang === 'es'}">ES</button></div>${btn(T('Book a tour', 'Agenda una visita'))}<button class="menu-toggle icon-button" id="menu-toggle" aria-label="${T('Open menu', 'Abrir menú')}" aria-expanded="false">${icon('menu')}</button></div></div></header>`;
}
function footer() {
  return `<footer><div class="container footer-grid"><div>${brand()}<p>${T('A little wonder. A lot of love.', 'Un poco de asombro. Mucho amor.')}<br>${T('A beautiful beginning starts here.', 'Un hermoso comienzo empieza aquí.')}</p></div><div><strong>${T('Come explore', 'Ven a explorar')}</strong><a href="#/programs">${T('Our programs', 'Nuestros programas')}</a><a href="#/about">${T('Our story', 'Nuestra historia')}</a><a href="#/faq">${T('Parent FAQs', 'Preguntas frecuentes')}</a></div><div><strong>${T('Let’s connect', 'Conectemos')}</strong><a href="#/book">${T('Schedule your visit', 'Agenda tu visita')}</a><a href="tel:+18474558687">847-455-8687</a><small>${T('Honey Bear family contact · New location details coming soon', 'Contacto de la familia Honey Bear · Nueva dirección próximamente')}</small></div><div class="footer-note">${icon('globe')}<strong>${T('Every family belongs.', 'Cada familia tiene su lugar.')}</strong><p>${T('We speak English. Hablamos español.', 'Hablamos español. We speak English.')}</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Little Panda Daycare</span><span>${T('Demo · Stock photography · Program details subject to confirmation', 'Demo · Fotos de archivo · Detalles de programas por confirmar')}</span><a href="#/admin">${T('Staff demo', 'Demo del personal')} ↗</a></div></footer>`;
}
function home() {
  return `${header()}<main id="main"><section class="hero container"><div class="hero-copy"><div class="eyebrow"><span class="tiny-flower">✳</span> ${T('A HAPPY PLACE TO GROW', 'UN LUGAR FELIZ PARA CRECER')}</div><h1>${T('Little moments.<br>Big <span>beginnings.</span>', 'Pequeños momentos.<br>Grandes <span>comienzos.</span>')}</h1><p>${T('A nurturing little world where your child feels safe, loved, and free to be wonderfully themselves. Let’s grow something beautiful, together.', 'Un pequeño mundo lleno de cariño donde tu hijo se siente seguro, amado y libre de ser quien es. Crezcamos juntos, con alegría.')}</p><div class="hero-buttons">${btn(T('Come meet your panda family', 'Conoce a tu familia panda'))}<a class="text-link" href="#/programs">${T('Explore our programs', 'Explora los programas')} ${icon('arrow')}</a></div><div class="hero-meta"><span>${icon('heart')}${T('Family-centered care', 'Cuidado centrado en la familia')}</span><span>${icon('globe')}${T('English & Spanish', 'Inglés y español')}</span></div></div><div class="hero-art"><div class="sun-doodle" aria-hidden="true">☀</div><img class="hero-photo" src="assets/classroom.jpg" alt="${T('A teacher sharing a story with a group of curious children — illustrative stock photo', 'Una maestra lee un cuento con niños curiosos — foto de archivo ilustrativa')}" fetchpriority="high" width="1600" height="1067"><span class="photo-sticker"><span>♡</span>${T('Small steps.<br>Extraordinary things.', 'Pequeños pasos.<br>Cosas extraordinarias.')}</span><div class="panda-badge"><img src="assets/favicon.svg" alt="" width="72" height="72"><div>${T('Their happy place.', 'Su lugar feliz.')}<small>${T('Your peace of mind.', 'Tu tranquilidad.')}</small></div></div><span class="scribble" aria-hidden="true">〰</span></div></section><div class="values-ribbon"><div class="container"><span>✳ ${T('LEARN THROUGH PLAY', 'APRENDER JUGANDO')}</span><span>♡ ${T('GROW WITH LOVE', 'CRECER CON AMOR')}</span><span>☀ ${T('MAKE LITTLE DISCOVERIES', 'HACER PEQUEÑOS DESCUBRIMIENTOS')}</span><span>✿ ${T('BELONG TOGETHER', 'CREAR COMUNIDAD')}</span></div></div>
<section class="section container" id="programs"><div class="section-heading"><div><div class="eyebrow">${T('ROOM FOR EVERY LITTLE PERSONALITY', 'ESPACIO PARA CADA PERSONALIDAD')}</div><h2>${T('Growing at their own <em>pace.</em>', 'Creciendo a su propio <em>ritmo.</em>')}</h2></div><p>${T('From first smiles to big-kid adventures, a thoughtful next step for every stage.', 'Desde las primeras sonrisas hasta las grandes aventuras, acompañamos cada etapa.')}</p></div><div class="program-grid">${programs()
    .map(
      (p, i) =>
        `<article class="program-card ${p.color}"><span class="program-symbol" aria-hidden="true">${p.symbol}</span><span class="program-number">0${i + 1}</span><p class="age">${p.age}</p><h3>${p.title}</h3><p>${p.desc}</p><a href="#/book" data-program="${p.id}">${T('Let’s explore', 'Vamos a explorar')}${icon('arrow')}</a></article>`,
    )
    .join(
      '',
    )}</div><p class="section-footnote">${T('Illustrative program offerings for the new center. Ages and availability will be confirmed before enrollment.', 'Oferta ilustrativa para el nuevo centro. Edades y disponibilidad por confirmar antes de la inscripción.')}</p></section>
<section class="story-section" id="about"><div class="container story-grid"><div class="story-images"><img class="story-main" src="assets/learning.jpg" alt="${T('Two young children building with colorful wooden blocks — stock photo', 'Dos niñas construyen con bloques de colores — foto de archivo')}" loading="lazy" width="900" height="600"><img class="story-small" src="assets/child.jpg" alt="${T('A smiling child enjoying a colorful art activity — stock photo', 'Una niña sonríe durante una actividad de arte — foto de archivo')}" loading="lazy" width="1000" height="1506"><span class="story-seal">${icon('heart')}<span>${T('little people,<br>big love', 'pequeños seres,<br>gran amor')}</span></span></div><div class="story-copy"><div class="eyebrow">${T('MORE THAN DAYCARE. A LITTLE COMMUNITY.', 'MÁS QUE UNA GUARDERÍA. UNA COMUNIDAD.')}</div><h2>${T('They bring the wonder.<br>We bring the <em>care.</em>', 'Ellos traen el asombro.<br>Nosotros, el <em>cariño.</em>')}</h2><p>${T('Choosing care is a big decision. We believe it should feel like finding your people: a place that celebrates your child, listens to your family, and makes the everyday feel a little more special.', 'Elegir quién cuidará a tu hijo es una gran decisión. Queremos que se sienta como encontrar a tu gente: un lugar que celebra a tu hijo, escucha a tu familia y hace especial lo cotidiano.')}</p><p>${T('Inspired by the family-centered approach of Honey Bear Day Care, Little Panda brings together joyful learning, meaningful connections, and a love for every little milestone.', 'Inspirado en el enfoque familiar de Honey Bear Day Care, Little Panda reúne aprendizaje alegre, conexiones significativas y amor por cada pequeño logro.')}</p><div class="story-points"><span>${icon('check')}${T('A partnership with parents', 'Una alianza con las familias')}</span><span>${icon('check')}${T('Learning through discovery', 'Aprender descubriendo')}</span><span>${icon('check')}${T('Connection in two languages', 'Conexión en dos idiomas')}</span></div>${btn(T('Let’s get to know each other', 'Conozcámonos'), '#/book', 'outline')}</div></div></section>
<section class="section container" id="day"><div class="center-heading"><div class="eyebrow">${T('ORDINARY DAYS. EXTRAORDINARY DISCOVERIES.', 'DÍAS COTIDIANOS. DESCUBRIMIENTOS EXTRAORDINARIOS.')}</div><h2>${T('A little peek into our <em>day.</em>', 'Una miradita a nuestro <em>día.</em>')}</h2><p>${T('A comforting rhythm, with plenty of room for a little magic.', 'Una rutina que da confianza, con mucho espacio para la magia.')}</p></div><div class="day-grid">${[
    [
      'sun',
      T('Hello, sunshine', 'Hola, sol'),
      T('Warm welcomes & free play', 'Bienvenidas y juego libre'),
      T(
        'A gentle start, familiar faces, and time to settle in.',
        'Un inicio tranquilo, caras conocidas y tiempo para adaptarse.',
      ),
    ],
    [
      'book',
      T('Wonder & discover', 'Imaginar y descubrir'),
      T('Stories, art & exploration', 'Cuentos, arte y exploración'),
      T(
        'Little questions lead to big discoveries through play.',
        'Las pequeñas preguntas llevan a grandes descubrimientos.',
      ),
    ],
    [
      'leaf',
      T('Nourish & recharge', 'Comer y descansar'),
      T('Mealtime & quiet moments', 'Comidas y momentos tranquilos'),
      T(
        'A chance to refuel, rest, and get ready for more.',
        'Tiempo para nutrirse, descansar y recuperar energía.',
      ),
    ],
    [
      'heart',
      T('Play, then hooray!', '¡A jugar y celebrar!'),
      T('Friendships & happy goodbyes', 'Amistades y despedidas felices'),
      T(
        'More adventures and little stories to take home.',
        'Más aventuras y pequeñas historias para llevar a casa.',
      ),
    ],
  ]
    .map(
      (d, i) =>
        `<article class="day-item"><span class="day-icon day-${i}">${icon(d[0])}</span><span class="day-step">0${i + 1}</span><h3>${d[1]}</h3><strong>${d[2]}</strong><p>${d[3]}</p></article>`,
    )
    .join(
      '',
    )}</div><p class="section-footnote">${T('Sample daily rhythm. Activities and routines vary by age.', 'Ejemplo de rutina diaria. Las actividades varían según la edad.')}</p></section>
<section class="care-band"><div class="container care-grid"><div><div class="eyebrow">${T('FOR YOUR LITTLE ONE. FOR YOUR PEACE OF MIND.', 'PARA TU PEQUEÑO. PARA TU TRANQUILIDAD.')}</div><h2>${T('Care you can<br><em>feel good about.</em>', 'Cuidado que<br><em>te da confianza.</em>')}</h2><p>${T('Your questions matter. During your tour, let’s talk about the details that help your family feel at home.', 'Tus preguntas importan. Durante tu visita, hablemos de los detalles que hacen sentir a tu familia como en casa.')}</p></div><div class="care-topics">${[
    [
      'shield',
      T('Safety, thoughtfully considered', 'Seguridad en cada detalle'),
      T(
        'Ask about arrival, authorized pickup, and classroom routines.',
        'Conoce las rutinas de llegada, recogida autorizada y del salón.',
      ),
    ],
    [
      'people',
      T('A real connection with families', 'Una conexión real con las familias'),
      T(
        'Talk about daily updates, milestones, and how we stay in touch.',
        'Conversemos sobre noticias diarias, logros y comunicación.',
      ),
    ],
    [
      'globe',
      T('Two languages. One warm welcome.', 'Dos idiomas. Una cálida bienvenida.'),
      T(
        'Explore your options and plan your visit in English or Spanish.',
        'Explora las opciones y planea tu visita en inglés o español.',
      ),
    ],
  ]
    .map((x) => `<article>${icon(x[0])}<div><h3>${x[1]}</h3><p>${x[2]}</p></div></article>`)
    .join('')}</div></div></section>
<section class="section container faq-section" id="faq"><div><div class="eyebrow">${T('BIG QUESTIONS WELCOME', 'LAS GRANDES PREGUNTAS SON BIENVENIDAS')}</div><h2>${T('A little clarity<br>for <em>parents.</em>', 'Un poco de claridad<br>para las <em>familias.</em>')}</h2><p>${T('Because finding the right fit starts with a good conversation.', 'Porque encontrar el lugar ideal empieza con una buena conversación.')}</p><a class="text-link" href="#/book">${T('Ask us on a tour', 'Pregúntanos en una visita')} ${icon('arrow')}</a></div><div class="faq-list">${[
    [
      T('How do we get started?', '¿Cómo empezamos?'),
      T(
        'Book a tour at a time that works for your family. We’ll get to know your needs, explore the programs, and talk through next steps. A tour does not commit you to enrollment.',
        'Agenda una visita cuando te convenga. Conoceremos tus necesidades, exploraremos los programas y hablaremos de los siguientes pasos. Una visita no te compromete a inscribirte.',
      ),
    ],
    [
      T('Can I bring my child to the tour?', '¿Puedo llevar a mi hijo a la visita?'),
      T(
        'Absolutely. We’d love to meet your little one. Add any questions or accessibility needs when booking so we can plan a welcoming visit.',
        '¡Claro! Nos encantará conocer a tu pequeño. Incluye tus preguntas o necesidades de accesibilidad al reservar para preparar una visita acogedora.',
      ),
    ],
    [
      T('Do you offer care in Spanish?', '¿Ofrecen cuidado en español?'),
      T(
        'Bilingual connection is part of the Little Panda vision. You can browse this site and book in either language. Ask about classroom language options during your visit.',
        'La conexión bilingüe es parte de la visión de Little Panda. Puedes explorar este sitio y reservar en ambos idiomas. Pregunta por los idiomas del salón durante tu visita.',
      ),
    ],
    [
      T(
        'What about tuition and financial assistance?',
        '¿Qué hay de la matrícula y la ayuda financiera?',
      ),
      T(
        'Tuition depends on your child’s age and care schedule. During your visit, ask for current rates, enrollment fees, and any assistance options available at the new center.',
        'Las tarifas dependen de la edad y el horario de cuidado. Durante tu visita, pregunta por las tarifas actuales, cuotas de inscripción y opciones de ayuda disponibles en el nuevo centro.',
      ),
    ],
    [
      T(
        'Where is the new center, and what are the hours?',
        '¿Dónde está el nuevo centro y cuál es el horario?',
      ),
      T(
        'The new Little Panda location and operating hours will be added before launch. The phone listed here is the existing Honey Bear family contact. Tour times shown are demonstration availability.',
        'La dirección y el horario del nuevo centro se agregarán antes del lanzamiento. El teléfono indicado es el contacto actual de Honey Bear. Los horarios de visita son de demostración.',
      ),
    ],
  ]
    .map(
      (x, i) =>
        `<details ${i === 0 ? 'open' : ''}><summary>${x[0]}<span>+</span></summary><p>${x[1]}</p></details>`,
    )
    .join('')}</div></section>
<section class="visit-banner container"><span class="banner-flower" aria-hidden="true">✿</span><div><div class="eyebrow">${T('YOUR NEXT CHAPTER STARTS WITH HELLO', 'TU PRÓXIMO CAPÍTULO EMPIEZA CON UN HOLA')}</div><h2>${T('Come for a visit.<br>Stay for the <em>feeling.</em>', 'Ven a conocernos.<br>Quédate por el <em>cariño.</em>')}</h2><p>${T('Meet the people. Ask all the questions. Picture your little one here.', 'Conoce al equipo. Haz todas tus preguntas. Imagina a tu pequeño aquí.')}</p>${btn(T('Find a time to visit', 'Encuentra un horario'))}<small>${T(`A relaxed, ${state.settings.duration}-minute introduction. Little ones welcome.`, `Una presentación tranquila de ${state.settings.duration} minutos. Los pequeños son bienvenidos.`)}</small></div><img src="assets/logo.png" alt="Little Panda Daycare" loading="lazy" width="2149" height="733"></section></main>${footer()}`;
}
let booking = {
  date: null,
  time: null,
  step: 1,
  program: 'preschool',
  details: {},
  result: null,
  month: null,
};
function bookingPage() {
  const earliest = firstOpening(state.settings, state.bookings);
  if (!booking.date && earliest) booking.date = earliest;
  if (!booking.month) booking.month = (booking.date || todayKey()).slice(0, 7);
  return `${header()}<main id="main" class="booking-page container"><a href="#/" class="back-link">← ${T('Back to our happy place', 'Volver al inicio')}</a><div class="booking-heading"><div class="eyebrow">${T('LET’S START WITH HELLO', 'EMPECEMOS CON UN HOLA')}</div><h1>${T('Meet your little one’s<br>next <em>happy place.</em>', 'Conoce el próximo<br><em>lugar feliz</em> de tu hijo.')}</h1><p>${T('A little look around. A lot to look forward to.', 'Una pequeña visita. Mucho por descubrir.')}</p></div><div class="booking-layout"><aside class="visit-info"><img src="assets/learning.jpg" alt="${T('Children exploring wooden toys', 'Niñas exploran juguetes de madera')}" width="900" height="600"><div><span class="tag">${T('A PERSONAL WELCOME', 'UNA BIENVENIDA PERSONAL')}</span><h2>${T('Your family tour', 'Tu visita familiar')}</h2><p>${T('Explore the space, meet our approach, and tell us all about your little one.', 'Conoce el espacio, nuestro enfoque y cuéntanos sobre tu pequeño.')}</p><ul><li>${icon('clock')}<span>${state.settings.duration} ${T('minutes · No commitment', 'minutos · Sin compromiso')}</span></li><li>${icon('people')}<span>${T('Parents & little ones welcome', 'Familias y pequeños bienvenidos')}</span></li><li>${icon('globe')}<span>${T('English or Spanish', 'Inglés o español')}</span></li><li>${icon('pin')}<span>${T('New location details coming soon', 'Nueva dirección próximamente')}</span></li></ul><div class="demo-note">${T('Interactive demo · Bookings stay in this browser. No emails or texts are sent. Please use sample contact details.', 'Demo interactiva · Las reservas quedan en este navegador. No se envían correos ni mensajes. Usa datos de ejemplo.')}</div></div></aside><section class="booking-panel" id="booking-panel">${booking.result ? confirmation() : booking.step === 1 ? calendarPanel() : detailsPanel()}</section></div></main>${footer()}`;
}
function calendarPanel() {
  const [y, m] = booking.month.split('-').map(Number),
    first = new Date(y, m - 1, 1),
    offset = first.getDay(),
    days = new Date(y, m, 0).getDate();
  const slots = booking.date ? slotsFor(booking.date, state.settings, state.bookings) : [];
  if (booking.time && !slots.includes(booking.time)) booking.time = null;
  const names = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(lang === 'es' ? 'es' : 'en', { weekday: 'short' }).format(
      new Date(2026, 10, 1 + i),
    ),
  );
  return `<div class="step-label">${T('STEP 1 OF 2', 'PASO 1 DE 2')}<span>${T('Choose your visit', 'Elige tu visita')}</span></div><h2>${T('A good day to say hello.', 'Un buen día para decir hola.')}</h2><p class="muted">${T('Choose a date, then a time that suits your family.', 'Elige una fecha y un horario que le convenga a tu familia.')}</p><div class="calendar-heading"><h3>${longDate(dateKey(first), { month: 'long', year: 'numeric' })}</h3><div><button class="icon-button" data-month="-1" ${booking.month <= todayKey().slice(0, 7) ? 'disabled' : ''} aria-label="${T('Previous month', 'Mes anterior')}">‹</button><button class="icon-button" data-month="1" ${booking.month >= addDays(todayKey(), 90).slice(0, 7) ? 'disabled' : ''} aria-label="${T('Next month', 'Mes siguiente')}">›</button></div></div><div class="calendar-grid">${names.map((d) => `<span class="weekday">${d}</span>`).join('')}${Array.from({ length: offset }, () => '<span></span>').join('')}${Array.from(
    { length: days },
    (_, i) => {
      const key = dateKey(new Date(y, m - 1, i + 1)),
        available = slotsFor(key, state.settings, state.bookings).length > 0;
      return `<button class="calendar-day ${key === booking.date ? 'selected' : ''} ${key === todayKey() ? 'today' : ''}" data-date="${key}" ${!available ? 'disabled' : ''} aria-label="${longDate(key)}" aria-pressed="${key === booking.date}">${i + 1}${available ? '<i></i>' : ''}</button>`;
    },
  ).join(
    '',
  )}</div><div class="time-heading"><h3>${booking.date ? longDate(booking.date, { weekday: 'short', month: 'short', day: 'numeric' }) : T('Available times', 'Horarios disponibles')}</h3><span>${T('Chicago time', 'Hora de Chicago')}</span></div><div class="time-slots">${slots.length ? slots.map((s) => `<button class="time-slot ${booking.time === s ? 'selected' : ''}" data-time="${s}" aria-pressed="${booking.time === s}">${timeLabel(s)}</button>`).join('') : `<p class="empty-state">${T('No openings on this date. Please choose another day.', 'No hay horarios en esta fecha. Elige otro día.')}</p>`}</div><button class="button primary full" id="booking-next" ${booking.time ? '' : 'disabled'}>${T('Continue', 'Continuar')}${icon('arrow')}</button><p class="microcopy">${icon('heart')}${T('We can’t wait to meet your family.', 'Nos encantará conocer a tu familia.')}</p>`;
}
function detailsPanel() {
  const d = booking.details;
  return `<div class="step-label">${T('STEP 2 OF 2', 'PASO 2 DE 2')}<span>${T('A little about you', 'Un poco sobre ti')}</span></div><h2>${T('Let’s make it a date.', 'Hagamos la cita.')}</h2><div class="selected-visit">${icon('calendar')}<div><strong>${longDate(booking.date)}</strong><span>${timeLabel(booking.time)} · ${state.settings.duration} min · ${T('Chicago time', 'Hora de Chicago')}</span></div><button class="text-button" id="booking-back">${T('Change', 'Cambiar')}</button></div><form id="booking-form"><div class="field-grid"><label>${T('Parent / guardian name', 'Nombre del padre, madre o tutor')}<input name="name" required autocomplete="name" maxlength="100" value="${esc(d.name || '')}" placeholder="${T('Your full name', 'Tu nombre completo')}"></label><label>${T('Email address', 'Correo electrónico')}<input name="email" type="email" required autocomplete="email" maxlength="150" value="${esc(d.email || '')}" placeholder="you@example.com"></label><label>${T('Phone number', 'Número de teléfono')}<input name="phone" type="tel" required autocomplete="tel" minlength="7" maxlength="30" value="${esc(d.phone || '')}" placeholder="(555) 123-4567"></label><label>${T('Program of interest', 'Programa de interés')}<select name="program">${programs()
    .map(
      (p) =>
        `<option value="${p.id}" ${booking.program === p.id ? 'selected' : ''}>${p.age}</option>`,
    )
    .join(
      '',
    )}</select></label><label>${T('Preferred language', 'Idioma preferido')}<select name="language"><option value="en" ${(d.language || lang) === 'en' ? 'selected' : ''}>English</option><option value="es" ${(d.language || lang) === 'es' ? 'selected' : ''}>Español</option></select></label><label>${T('Anything you’d like us to know?', '¿Algo que quieras contarnos?')} <span class="optional">${T('(optional)', '(opcional)')}</span><textarea name="notes" rows="3" maxlength="1000" placeholder="${T('Questions, accessibility needs…', 'Preguntas, necesidades de accesibilidad…')}">${esc(d.notes || '')}</textarea></label></div><label class="checkbox-label"><input type="checkbox" required name="consent">${T('I understand this is a demo booking stored in this browser, and no messages will be sent.', 'Entiendo que esta es una reserva de demostración guardada en este navegador y que no se enviarán mensajes.')}</label><button class="button primary full" type="submit">${T('Confirm my visit', 'Confirmar mi visita')}${icon('check')}</button><button type="button" class="text-button centered" id="details-back">← ${T('Back to dates', 'Volver a las fechas')}</button></form>`;
}
function confirmation() {
  const b = booking.result;
  return `<div class="confirmation"><span class="success-icon">${icon('check')}</span><div class="eyebrow">${T('IT’S A LITTLE DATE!', '¡TENEMOS UNA CITA!')}</div><h2>${T('See you soon,', '¡Hasta pronto,')}<br>${esc(b.name.split(' ')[0])}!</h2><p>${T('Your demo visit is confirmed. We’re looking forward to meeting your family.', 'Tu visita de demostración está confirmada. Nos encantará conocer a tu familia.')}</p><div class="confirmation-card"><strong>${longDate(b.date)}</strong><span>${timeLabel(b.time)} · ${b.duration} min</span><span>${T('America/Chicago time zone', 'Zona horaria America/Chicago')}</span><hr><span>${programName(b.program)}</span><small>${T('Reference', 'Referencia')}: ${esc(b.id.slice(-8).toUpperCase())}</small></div><button class="button primary full" id="download-calendar">${icon('download')}${T('Add to calendar', 'Agregar al calendario')}</button><button class="button outline full" id="manage-visit">${T('Manage this visit', 'Administrar esta visita')}</button><p class="demo-note">${T('No confirmation email was sent. This demonstration is saved only in this browser. The new center’s address is pending.', 'No se envió un correo de confirmación. Esta demostración se guarda solo en este navegador. La dirección del nuevo centro está pendiente.')}</p><a href="#/" class="text-link">${T('Back to Little Panda', 'Volver a Little Panda')}${icon('arrow')}</a></div>`;
}
let adminTab = 'bookings',
  filter = 'upcoming',
  query = '';
function adminPage() {
  return `<div class="admin-shell"><aside class="admin-sidebar">${brand()}<div class="sidebar-label">${T('YOUR LITTLE COMMAND CENTER', 'TU PEQUEÑO CENTRO DE CONTROL')}</div><nav aria-label="${T('Administration', 'Administración')}"><button data-tab="bookings" class="${adminTab === 'bookings' ? 'active' : ''}">${icon('calendar')}${T('Bookings', 'Reservas')}<span>${state.bookings.filter((b) => b.status === 'confirmed' && b.date >= todayKey()).length}</span></button><button data-tab="availability" class="${adminTab === 'availability' ? 'active' : ''}">${icon('clock')}${T('Availability', 'Disponibilidad')}</button></nav><div class="sidebar-bottom"><div class="sidebar-panda"><img src="assets/favicon.svg" alt="" width="56" height="56"><p>${T('More time for<br>little moments.', 'Más tiempo para<br>pequeños momentos.')}</p></div><a href="#/">${icon('arrow')}${T('View website', 'Ver sitio web')}</a><a href="#/book">${icon('calendar')}${T('Preview booking page', 'Ver página de reservas')}</a></div></aside><div class="admin-main"><header class="admin-header"><a class="admin-mobile-brand" href="#/">🐼 Little Panda</a><span>${icon('sun')}${T('A lovely day to welcome families.', 'Un hermoso día para recibir familias.')}</span><div class="language"><button data-lang="en" aria-pressed="${lang === 'en'}">EN</button>/<button data-lang="es" aria-pressed="${lang === 'es'}">ES</button></div><span class="admin-avatar">LP</span></header><main id="main"><div class="admin-demo">${icon('leaf')}<div><strong>${T('You’re exploring the staff demo', 'Estás explorando la demo del personal')}</strong><span>${T('No login required. Changes and sample bookings are stored in this browser only.', 'Sin inicio de sesión. Los cambios y las reservas se guardan solo en este navegador.')}</span></div></div><div class="admin-title"><div><div class="eyebrow">LITTLE PANDA DAYCARE</div><h1>${adminTab === 'bookings' ? T('Hello, little possibilities.', 'Hola, pequeñas posibilidades.') : T('Make room for a hello.', 'Haz espacio para un hola.')}</h1><p>${adminTab === 'bookings' ? T('A thoughtful welcome starts with a well-planned visit.', 'Una cálida bienvenida empieza con una visita bien planeada.') : T('Set your rhythm. Families can book the times you make available.', 'Define tu ritmo. Las familias pueden reservar los horarios que ofreces.')}</p></div>${btn(T('Preview booking', 'Ver reservas'), '#/book', 'outline')}</div><div class="admin-tabs-mobile"><button data-tab="bookings" class="${adminTab === 'bookings' ? 'active' : ''}">${T('Bookings', 'Reservas')}</button><button data-tab="availability" class="${adminTab === 'availability' ? 'active' : ''}">${T('Availability', 'Disponibilidad')}</button></div>${adminTab === 'bookings' ? bookingsAdmin() : availabilityAdmin()}</main><div class="admin-footer">${T('Little Panda staff demo · America/Chicago', 'Demo del personal Little Panda · America/Chicago')}<button class="text-button" id="reset-demo">${T('Reset demo data', 'Restablecer datos demo')}</button></div></div></div>`;
}
function bookingsAdmin() {
  const active = state.bookings.filter((b) => b.status === 'confirmed' && b.date >= todayKey()),
    week = active.filter((b) => b.date <= addDays(todayKey(), 7));
  const list = state.bookings
    .filter(
      (b) =>
        (filter === 'all' ||
          (filter === 'cancelled' && b.status === 'cancelled') ||
          (filter === 'upcoming' && b.status === 'confirmed' && b.date >= todayKey())) &&
        `${b.name} ${b.email}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return `<div class="stat-grid"><article><span>${T('Upcoming visits', 'Próximas visitas')}</span><strong>${active.length}</strong><small>${icon('calendar')}${T('New families to welcome', 'Nuevas familias por conocer')}</small></article><article><span>${T('In the next 7 days', 'En los próximos 7 días')}</span><strong>${week.length}</strong><small>${icon('heart')}${T('Little connections, big beginnings', 'Pequeñas conexiones, grandes comienzos')}</small></article><article><span>${T('Next available visit', 'Próxima visita disponible')}</span><strong class="date-stat">${firstOpening(state.settings, state.bookings) ? longDate(firstOpening(state.settings, state.bookings), { month: 'short', day: 'numeric' }) : T('Fully booked', 'Sin horarios')}</strong><small>${icon('clock')}${state.settings.duration} ${T('minute family tours', 'minutos por visita')}</small></article></div><section class="admin-card"><div class="card-heading"><div><h2>${T('Your family visits', 'Tus visitas familiares')}</h2><p>${T('Every booking is the start of a new connection.', 'Cada reserva es el comienzo de una nueva conexión.')}</p></div><input class="search" type="search" id="booking-search" aria-label="${T('Search bookings', 'Buscar reservas')}" placeholder="${T('Search families…', 'Buscar familias…')}" value="${esc(query)}"></div><div class="filter-row" role="group" aria-label="${T('Filter bookings', 'Filtrar reservas')}">${[
    ['upcoming', T('Upcoming', 'Próximas')],
    ['all', T('All visits', 'Todas')],
    ['cancelled', T('Cancelled', 'Canceladas')],
  ]
    .map(
      (x) =>
        `<button data-filter="${x[0]}" class="${filter === x[0] ? 'active' : ''}">${x[1]}</button>`,
    )
    .join(
      '',
    )}</div><div class="booking-list">${list.length ? list.map((b) => `<article class="booking-row"><div class="date-tile"><span>${longDate(b.date, { month: 'short' })}</span><strong>${parseDate(b.date).getDate()}</strong></div><div class="booking-person"><h3>${esc(b.name)}${b.sample ? `<span class="sample-badge">${T('SAMPLE', 'EJEMPLO')}</span>` : ''}</h3><span>${esc(b.email)}</span><small>${programName(b.program)}</small></div><div class="booking-when"><strong>${timeLabel(b.time)}</strong><span>${b.duration} min · ${b.language === 'es' ? 'Español' : 'English'}</span><span class="status ${b.status}">${b.status === 'confirmed' ? T('Confirmed', 'Confirmada') : T('Cancelled', 'Cancelada')}</span></div><button class="small-button" data-manage="${esc(b.id)}">${T('View details', 'Ver detalles')}${icon('chevron')}</button></article>`).join('') : `<div class="empty-state">${icon('calendar')}<h3>${T('A little room for new beginnings.', 'Espacio para nuevos comienzos.')}</h3><p>${T('No visits match this view. Try a different filter or make a demo booking.', 'No hay visitas en esta vista. Cambia el filtro o haz una reserva de prueba.')}</p>${btn(T('Make a demo booking', 'Crear reserva de prueba'), '#/book', 'outline')}</div>`}</div></section>`;
}
function availabilityAdmin() {
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(lang === 'es' ? 'es' : 'en', { weekday: 'long' }).format(
      new Date(2026, 10, 1 + i),
    ),
  );
  return `<div class="availability-layout"><section class="admin-card"><div class="card-heading"><div><h2>${T('Your weekly rhythm', 'Tu ritmo semanal')}</h2><p>${T('Choose the days and hours you welcome families.', 'Elige los días y horarios para recibir familias.')}</p></div><span class="tag">America/Chicago</span></div><form id="availability-form"><div class="weekly-schedule">${state.settings.weekly.map((d, i) => `<div class="schedule-row"><label class="day-switch"><input type="checkbox" name="day-${i}" ${d.enabled ? 'checked' : ''}><span>${dayNames[i]}</span></label><div class="schedule-hours"><label class="sr-only" for="start-${i}">${dayNames[i]} ${T('start time', 'hora inicial')}</label><input type="time" id="start-${i}" name="start-${i}" value="${d.start}" ${d.enabled ? 'required' : 'disabled'}><span>—</span><label class="sr-only" for="end-${i}">${dayNames[i]} ${T('end time', 'hora final')}</label><input type="time" id="end-${i}" name="end-${i}" value="${d.end}" ${d.enabled ? 'required' : 'disabled'}></div></div>`).join('')}</div><div class="settings-grid"><label>${T('Tour duration', 'Duración de la visita')}<select name="duration">${[15, 30, 45, 60].map((n) => `<option value="${n}" ${state.settings.duration === n ? 'selected' : ''}>${n} ${T('minutes', 'minutos')}</option>`).join('')}</select></label><label>${T('Breathing room between tours', 'Descanso entre visitas')}<select name="buffer">${[0, 15, 30].map((n) => `<option value="${n}" ${state.settings.buffer === n ? 'selected' : ''}>${n} ${T('minutes', 'minutos')}</option>`).join('')}</select></label></div><p class="form-message" id="schedule-error" role="alert"></p><div class="save-row"><span>${icon('shield')}${T('Existing bookings stay reserved.', 'Las reservas existentes se conservan.')}</span><button class="button primary" type="submit">${T('Save availability', 'Guardar disponibilidad')}${icon('check')}</button></div></form></section><aside><section class="admin-card blocked-card"><div class="card-heading"><div><h2>${T('A little time off', 'Un pequeño descanso')}</h2><p>${T('Block holidays, closures, or busy days.', 'Bloquea días festivos, cierres o días ocupados.')}</p></div></div><form id="block-form"><label>${T('Date to block', 'Fecha a bloquear')}<input type="date" name="date" required min="${todayKey()}" max="${addDays(todayKey(), 90)}"></label><button class="button outline full" type="submit">+ ${T('Block this date', 'Bloquear esta fecha')}</button></form><div class="blocked-list">${
    state.settings.blocked.length
      ? state.settings.blocked
          .slice()
          .sort()
          .map(
            (d) =>
              `<div><span>${longDate(d, { month: 'short', day: 'numeric' })}</span><button class="icon-button" data-unblock="${d}" aria-label="${T('Unblock', 'Desbloquear')} ${d}">${icon('close')}</button></div>`,
          )
          .join('')
      : `<p class="muted">${T('No blocked dates. A fresh calendar!', 'Sin fechas bloqueadas. ¡Un calendario libre!')}</p>`
  }</div></section><div class="availability-tip">${icon('leaf')}<h3>${T('A schedule that works for you.', 'Un horario a tu medida.')}</h3><p>${T('Families see open times for the next 90 days. Reserved visits and blocked dates automatically disappear from the booking calendar.', 'Las familias ven horarios de los próximos 90 días. Las visitas reservadas y los días bloqueados no aparecen en el calendario.')}</p></div></aside></div>`;
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function route() {
  const route = location.hash || '#/';
  document.documentElement.lang = lang;
  document.title = route.startsWith('#/admin')
    ? T('Staff dashboard | Little Panda', 'Panel del personal | Little Panda')
    : route.startsWith('#/book')
      ? T('Book a tour | Little Panda', 'Agenda una visita | Little Panda')
      : 'Little Panda Daycare | ' +
        T('Little moments. Big beginnings.', 'Pequeños momentos. Grandes comienzos.');
  $('#app').innerHTML = route.startsWith('#/admin')
    ? adminPage()
    : route.startsWith('#/book')
      ? bookingPage()
      : home();
  bind();
  const section = route.slice(2);
  if (['about', 'programs', 'day', 'faq'].includes(section))
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView());
}
function rememberDetails() {
  const form = $('#booking-form');
  if (form) {
    booking.details = Object.fromEntries(new FormData(form));
    booking.program = booking.details.program;
  }
}
function refreshBooking() {
  const active = document.activeElement;
  const focus = active?.dataset.date
    ? `[data-date="${active.dataset.date}"]`
    : active?.dataset.time
      ? `[data-time="${active.dataset.time}"]`
      : null;
  rememberDetails();
  const panel = $('#booking-panel');
  if (panel) {
    panel.innerHTML = booking.result
      ? confirmation()
      : booking.step === 1
        ? calendarPanel()
        : detailsPanel();
    bindBooking();
    if (focus) $(focus)?.focus({ preventScroll: true });
  }
}
function bind() {
  document.querySelectorAll('a[href="#/book"]').forEach((el) =>
    el.addEventListener('click', () => {
      if (booking.result) {
        booking = {
          date: null,
          time: null,
          month: null,
          step: 1,
          program: 'preschool',
          details: {},
          result: null,
        };
        if (location.hash === '#/book') route();
      }
    }),
  );
  document.querySelectorAll('[data-lang]').forEach(
    (el) =>
      (el.onclick = () => {
        rememberDetails();
        lang = el.dataset.lang;
        try {
          localStorage.setItem('panda-language', lang);
        } catch {}
        route();
      }),
  );
  $('#menu-toggle')?.addEventListener('click', (e) => {
    const button = e.currentTarget,
      open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', open);
    button.setAttribute(
      'aria-label',
      T(open ? 'Close menu' : 'Open menu', open ? 'Cerrar menú' : 'Abrir menú'),
    );
    button.innerHTML = icon(open ? 'close' : 'menu');
    $('#nav').classList.toggle('open', open);
  });
  document.querySelectorAll('[data-program]').forEach(
    (el) =>
      (el.onclick = () => {
        booking = {
          date: null,
          time: null,
          month: null,
          step: 1,
          program: el.dataset.program,
          details: {},
          result: null,
        };
      }),
  );
  bindBooking();
  bindAdmin();
}
function bindBooking() {
  document.querySelectorAll('[data-date]').forEach(
    (el) =>
      (el.onclick = () => {
        booking.date = el.dataset.date;
        booking.time = null;
        refreshBooking();
      }),
  );
  document.querySelectorAll('[data-time]').forEach(
    (el) =>
      (el.onclick = () => {
        booking.time = el.dataset.time;
        refreshBooking();
      }),
  );
  document.querySelectorAll('[data-month]').forEach(
    (el) =>
      (el.onclick = () => {
        const [y, m] = booking.month.split('-').map(Number),
          d = new Date(y, m - 1 + Number(el.dataset.month), 1);
        booking.month = dateKey(d).slice(0, 7);
        refreshBooking();
      }),
  );
  $('#booking-next')?.addEventListener('click', () => {
    if (!slotsFor(booking.date, state.settings, state.bookings).includes(booking.time))
      return refreshBooking();
    booking.step = 2;
    refreshBooking();
    $('#booking-panel').scrollIntoView({ block: 'start', behavior: 'smooth' });
    $('#booking-form input')?.focus({ preventScroll: true });
  });
  for (const id of ['booking-back', 'details-back'])
    $('#' + id)?.addEventListener('click', () => {
      rememberDetails();
      booking.step = 1;
      refreshBooking();
    });
  $('#booking-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    rememberDetails();
    state = read();
    if (!slotsFor(booking.date, state.settings, state.bookings).includes(booking.time)) {
      booking.step = 1;
      booking.time = null;
      refreshBooking();
      return toast(
        T(
          'That time is no longer available. Please choose another.',
          'Ese horario ya no está disponible. Elige otro.',
        ),
      );
    }
    const b = {
      ...booking.details,
      name: booking.details.name.trim(),
      email: booking.details.email.trim(),
      date: booking.date,
      time: booking.time,
      duration: state.settings.duration,
      id: crypto.randomUUID(),
      status: 'confirmed',
      sample: false,
    };
    if (!b.name) return;
    delete b.consent;
    state.bookings.push(b);
    save();
    booking.result = b;
    refreshBooking();
    $('#booking-panel').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  $('#download-calendar')?.addEventListener('click', () => downloadICS(booking.result));
  $('#manage-visit')?.addEventListener('click', () => showVisit(booking.result.id, false));
}
function bindAdmin() {
  document.querySelectorAll('[data-tab]').forEach(
    (el) =>
      (el.onclick = () => {
        adminTab = el.dataset.tab;
        route();
      }),
  );
  document.querySelectorAll('[data-filter]').forEach(
    (el) =>
      (el.onclick = () => {
        filter = el.dataset.filter;
        route();
      }),
  );
  $('#booking-search')?.addEventListener('input', (e) => {
    query = e.target.value;
    const pos = e.target.selectionStart;
    route();
    $('#booking-search').focus();
    $('#booking-search').setSelectionRange?.(pos, pos);
  });
  document
    .querySelectorAll('[data-manage]')
    .forEach((el) => (el.onclick = () => showVisit(el.dataset.manage, true)));
  document.querySelectorAll('.day-switch input').forEach(
    (el) =>
      (el.onchange = () => {
        el.closest('.schedule-row')
          .querySelectorAll('input[type=time]')
          .forEach((input) => {
            input.disabled = !el.checked;
            input.required = el.checked;
          });
      }),
  );
  $('#availability-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target),
      duration = Number(data.get('duration'));
    let weekly = [];
    for (let i = 0; i < 7; i++) {
      const previous = state.settings.weekly[i],
        enabled = data.has('day-' + i),
        start = data.get('start-' + i) || previous.start,
        end = data.get('end-' + i) || previous.end;
      if (
        enabled &&
        (start >= end ||
          Number(end.slice(0, 2)) * 60 +
            Number(end.slice(3)) -
            Number(start.slice(0, 2)) * 60 -
            Number(start.slice(3)) <
            duration)
      ) {
        $('#schedule-error').textContent = T(
          'Each enabled day needs an end time at least one tour after the start.',
          'Cada día activo necesita una hora final al menos una visita después del inicio.',
        );
        return;
      }
      weekly.push({ enabled, start, end });
    }
    state.settings = { ...state.settings, weekly, duration, buffer: Number(data.get('buffer')) };
    save();
    booking.date = null;
    booking.time = null;
    booking.month = null;
    route();
    toast(
      T(
        'Availability saved. Your booking calendar is up to date.',
        'Disponibilidad guardada. El calendario está actualizado.',
      ),
    );
  });
  $('#block-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = new FormData(e.target).get('date');
    if (!state.settings.blocked.includes(date)) state.settings.blocked.push(date);
    save();
    route();
    toast(
      T(
        'Date blocked. Existing visits are preserved.',
        'Fecha bloqueada. Las visitas existentes se conservan.',
      ),
    );
  });
  document.querySelectorAll('[data-unblock]').forEach(
    (el) =>
      (el.onclick = () => {
        state.settings.blocked = state.settings.blocked.filter((d) => d !== el.dataset.unblock);
        save();
        route();
        toast(T('Date reopened.', 'Fecha desbloqueada.'));
      }),
  );
  $('#reset-demo')?.addEventListener('click', () => {
    openDialog(
      `<h2>${T('Start fresh?', '¿Empezar de nuevo?')}</h2><p>${T('This removes demo bookings and schedule changes in this browser and restores the sample data.', 'Esto elimina las reservas y cambios de este navegador y restaura los datos de ejemplo.')}</p><button class="button danger full" id="confirm-reset">${T('Reset demo data', 'Restablecer datos demo')}</button>`,
    );
    $('#confirm-reset').onclick = () => {
      state = initialState();
      save();
      booking = {
        date: null,
        time: null,
        month: null,
        step: 1,
        program: 'preschool',
        details: {},
        result: null,
      };
      $('#dialog').close();
      route();
      toast(T('A fresh start. Demo data restored.', 'Un nuevo comienzo. Datos restaurados.'));
    };
  });
}
let priorFocus;
function openDialog(html) {
  priorFocus = document.activeElement;
  const d = $('#dialog');
  d.setAttribute('aria-labelledby', 'dialog-title');
  d.innerHTML = `<button class="icon-button dialog-close" aria-label="${T('Close dialog', 'Cerrar diálogo')}">${icon('close')}</button>${html}`;
  d.querySelector('h2')?.setAttribute('id', 'dialog-title');
  $('.dialog-close').onclick = () => d.close();
  if (!d.open) d.showModal();
  d.onclose = () => priorFocus?.focus();
  d.onclick = (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        d.close();
    }
  };
}
function showVisit(id, isAdmin) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return;
  openDialog(
    `<span class="tag">${b.status === 'confirmed' ? T('CONFIRMED VISIT', 'VISITA CONFIRMADA') : T('CANCELLED VISIT', 'VISITA CANCELADA')}</span><h2>${esc(b.name)}</h2><p>${esc(b.email)}<br>${esc(b.phone)}</p><div class="selected-visit">${icon('calendar')}<div><strong>${longDate(b.date)}</strong><span>${timeLabel(b.time)} · ${b.duration} min · Chicago</span></div></div><p><strong>${programName(b.program)}</strong><br>${T('Preferred language', 'Idioma preferido')}: ${b.language === 'es' ? 'Español' : 'English'}</p>${b.notes ? `<p class="visit-notes">${esc(b.notes)}</p>` : ''}${b.status === 'confirmed' ? `<div class="dialog-actions"><button class="button primary" id="reschedule">${T('Reschedule', 'Reprogramar')}</button><button class="button outline" id="cancel-visit">${T('Cancel visit', 'Cancelar visita')}</button></div>` : ''}<p class="demo-note">${T('Demo only. No notifications will be sent.', 'Solo demo. No se enviarán notificaciones.')}</p>`,
  );
  $('#reschedule')?.addEventListener('click', () => rescheduleVisit(id, isAdmin));
  $('#cancel-visit')?.addEventListener('click', () => {
    openDialog(
      `<h2>${T('Cancel this visit?', '¿Cancelar esta visita?')}</h2><p>${longDate(b.date)} · ${timeLabel(b.time)}<br>${T('This time will become available for another family.', 'Este horario quedará disponible para otra familia.')}</p><button class="button danger full" id="confirm-cancel">${T('Yes, cancel visit', 'Sí, cancelar visita')}</button>`,
    );
    $('#confirm-cancel').onclick = () => {
      b.status = 'cancelled';
      save();
      if (booking.result?.id === id) {
        booking.result = null;
        booking.step = 1;
        booking.time = null;
      }
      $('#dialog').close();
      route();
      toast(
        T(
          'Visit cancelled. The time is available again.',
          'Visita cancelada. El horario vuelve a estar disponible.',
        ),
      );
    };
  });
}
function rescheduleVisit(id, isAdmin) {
  const b = state.bookings.find((x) => x.id === id),
    first = firstOpening(state.settings, state.bookings, id);
  openDialog(
    `<h2>${T('Find a new little moment.', 'Encuentra un nuevo momento.')}</h2><p>${T('Choose another date and available time.', 'Elige otra fecha y un horario disponible.')}</p><form id="reschedule-form"><label>${T('Date', 'Fecha')}<input type="date" name="date" id="reschedule-date" value="${first || todayKey()}" min="${todayKey()}" max="${addDays(todayKey(), 90)}" required></label><label>${T('Available time · Chicago', 'Horario disponible · Chicago')}<select name="time" id="reschedule-time" required></select></label><p id="reschedule-error" class="form-message" role="alert"></p><button class="button primary full" type="submit">${T('Save new time', 'Guardar nuevo horario')}</button></form>`,
  );
  const populate = () => {
    const slots = slotsFor($('#reschedule-date').value, state.settings, state.bookings, id);
    $('#reschedule-time').innerHTML = slots.length
      ? slots.map((t) => `<option value="${t}">${timeLabel(t)}</option>`).join('')
      : `<option value="">${T('No available times', 'Sin horarios disponibles')}</option>`;
  };
  populate();
  $('#reschedule-date').onchange = populate;
  $('#reschedule-form').onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target),
      date = data.get('date'),
      time = data.get('time');
    if (!slotsFor(date, state.settings, state.bookings, id).includes(time)) {
      populate();
      $('#reschedule-error').textContent = T(
        'Please choose an available time.',
        'Elige un horario disponible.',
      );
      return;
    }
    Object.assign(b, { date, time, duration: state.settings.duration });
    save();
    if (booking.result?.id === id) booking.result = b;
    $('#dialog').close();
    route();
    toast(
      T(
        'A new time, same warm welcome. Visit rescheduled.',
        'Nueva hora, la misma bienvenida. Visita reprogramada.',
      ),
    );
  };
}
function downloadICS(b) {
  const stamp = b.date.replaceAll('-', '') + 'T' + b.time.replace(':', '') + '00';
  const [h, m] = b.time.split(':').map(Number),
    end = new Date(parseDate(b.date));
  end.setHours(h, m + b.duration, 0, 0);
  const endStamp =
    dateKey(end).replaceAll('-', '') +
    'T' +
    String(end.getHours()).padStart(2, '0') +
    String(end.getMinutes()).padStart(2, '0') +
    '00';
  const contents = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Little Panda//Tour Demo//EN',
    'BEGIN:VTIMEZONE',
    'TZID:America/Chicago',
    'BEGIN:DAYLIGHT',
    'DTSTART:20070311T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'TZOFFSETFROM:-0600',
    'TZOFFSETTO:-0500',
    'TZNAME:CDT',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'DTSTART:20071104T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0600',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${b.id}@littlepanda.demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=${zone}:${stamp}`,
    `DTEND;TZID=${zone}:${endStamp}`,
    'SUMMARY:Little Panda Daycare - Demo Family Tour',
    'DESCRIPTION:Demo appointment. New center address pending. No notification has been sent.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' })),
    a = document.createElement('a');
  a.href = url;
  a.download = 'little-panda-visit.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
window.addEventListener('hashchange', () => {
  route();
  if (!['#/about', '#/programs', '#/day', '#/faq'].includes(location.hash)) window.scrollTo(0, 0);
});
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    state = read();
    route();
  }
});
route();
