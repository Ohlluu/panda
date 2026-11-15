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
  return `<a class="brand" href="#/" aria-label="Little Panda Daycare"><img class="brand-logo" src="assets/logo.png" alt="Little Panda Daycare" width="2149" height="733"></a>`;
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
  return `<div class="announcement">${icon('sun')} ${T('A little play. A lot of happy.', 'Un poco de juego. Mucha alegría.')} <span>${T('Care in English & Spanish', 'Cuidado en inglés y español')}</span></div><header class="site-header"><div class="container header-inner">${brand()}<nav id="nav" aria-label="${T('Main navigation', 'Navegación principal')}"><a href="#/about">${T('Our story', 'Nuestra historia')}</a><a href="#/programs">${T('Our programs', 'Programas')}</a><a href="#/day">${T('A day here', 'Un día aquí')}</a><a href="#/faq">${T('Parent FAQs', 'Preguntas')}</a></nav><div class="header-actions"><div class="language" aria-label="${T('Language', 'Idioma')}"><button data-lang="en" aria-pressed="${lang === 'en'}">EN</button><span>/</span><button data-lang="es" aria-pressed="${lang === 'es'}">ES</button></div>${btn(T('Book a tour', 'Agenda una visita'))}<button class="menu-toggle icon-button" id="menu-toggle" aria-label="${T('Open menu', 'Abrir menú')}" aria-expanded="false">${icon('menu')}</button></div></div></header>`;
}
function footer() {
  return `<footer><div class="container footer-grid"><div>${brand()}<p>${T('See you soon, little sunshine!', '¡Hasta pronto, rayito de sol!')}<br>${T('A beautiful beginning starts here.', 'Un hermoso comienzo empieza aquí.')}</p></div><div><strong>${T('Come explore', 'Ven a explorar')}</strong><a href="#/programs">${T('Our programs', 'Nuestros programas')}</a><a href="#/about">${T('Our story', 'Nuestra historia')}</a><a href="#/faq">${T('Parent FAQs', 'Preguntas frecuentes')}</a></div><div><strong>${T('Let’s connect', 'Conectemos')}</strong><a href="#/book">${T('Schedule your visit', 'Agenda tu visita')}</a><a href="tel:+18474558687">847-455-8687</a><small>${T('Honey Bear family contact · New location details coming soon', 'Contacto de la familia Honey Bear · Nueva dirección próximamente')}</small></div><div class="footer-note">${icon('globe')}<strong>${T('Every family belongs.', 'Cada familia tiene su lugar.')}</strong><p>${T('We speak English. Hablamos español.', 'Hablamos español. We speak English.')}</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Little Panda Daycare</span><span>${T('Demo · Stock photography · Program details subject to confirmation', 'Demo · Fotos de archivo · Detalles de programas por confirmar')}</span><a href="#/admin">${T('Staff demo', 'Demo del personal')} ↗</a></div></footer>`;
}
function home() {
  const rainbow = `<svg class="rainbow-doodle" viewBox="0 0 210 125" aria-hidden="true"><path d="M20 110a85 85 0 0 1 170 0" stroke="#f47b70"/><path d="M40 110a65 65 0 0 1 130 0" stroke="#ffc640"/><path d="M60 110a45 45 0 0 1 90 0" stroke="#65b7d0"/></svg>`;
  const sun = `<svg class="happy-sun" viewBox="0 0 160 160" aria-hidden="true"><g stroke="#ed9e20" stroke-width="7" stroke-linecap="round"><path d="M80 8v12m0 120v12M8 80h12m120 0h12M29 29l9 9m84 84 9 9M29 131l9-9m84-84 9-9"/></g><circle cx="80" cy="80" r="45" fill="#ffc83d"/><path d="M62 73q5-8 10 0m16 0q5-8 10 0" fill="none" stroke="#59402f" stroke-width="3" stroke-linecap="round"/><path d="M68 88q12 17 24 0" fill="#dc6e56" stroke="#59402f" stroke-width="2" stroke-linejoin="round"/><ellipse cx="55" cy="85" rx="7" ry="4" fill="#f89569"/><ellipse cx="105" cy="85" rx="7" ry="4" fill="#f89569"/></svg>`;
  const toyIcons = [
    `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M40 27v-8q10-9 20 0v8" fill="#ffba90" stroke="#704c46" stroke-width="3"/><rect x="32" y="29" width="36" height="57" rx="13" fill="#fffdf1" stroke="#704c46" stroke-width="3" transform="rotate(12 50 55)"/><path d="m39 47 25 5m-25 6 9 2m-11 8 9 2" stroke="#7ac7d2" stroke-width="4" stroke-linecap="round"/><path d="m72 22 3-6m3 16 8-1" stroke="#e57964" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="13" y="49" width="37" height="37" rx="5" fill="#fbbe43" stroke="#7a592c" stroke-width="2" transform="rotate(-8 30 65)"/><rect x="54" y="46" width="35" height="39" rx="5" fill="#ef887a" stroke="#99544e" stroke-width="2" transform="rotate(7 70 65)"/><rect x="34" y="12" width="35" height="35" rx="5" fill="#7dbbde" stroke="#527c9b" stroke-width="2" transform="rotate(6 50 30)"/><path d="m44 34 7-13 7 13m-11-4h9" fill="none" stroke="white" stroke-width="3"/><circle cx="30" cy="68" r="8" fill="none" stroke="white" stroke-width="3"/><path d="m64 58 12 1-7 16Z" fill="none" stroke="white" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m20 75 15-5 45-45-13-13-45 45Z" fill="#f8c447" stroke="#8a672a" stroke-width="2"/><path d="m22 57 13 13-15 5Z" fill="#ffe7c4"/><path d="m65 14 5-5q5-4 10 1l9 9q4 5-1 9l-6 5Z" fill="#ef8e90"/><path d="m42 61 29-29m-37 21 29-29" stroke="#fff0b8" stroke-width="3"/><path d="M43 86q20-14 40-3" fill="none" stroke="#7dbbde" stroke-width="4" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M38 27v-8q12-12 24 0v8" fill="none" stroke="#8d6c98" stroke-width="6"/><rect x="22" y="23" width="56" height="63" rx="18" fill="#b59bce" stroke="#796488" stroke-width="2"/><path d="M24 46q26 14 52 0" fill="none" stroke="#8a749d" stroke-width="3"/><rect x="34" y="55" width="32" height="21" rx="7" fill="#ffdf72"/><path d="m45 35 5-9 5 9-5 7Z" fill="#fff7d8"/></svg>`,
  ];
  const names = [
    T('Babies', 'Bebés'),
    T('Toddlers', 'Pequeñitos'),
    T('Preschool', 'Preescolar'),
    T('School-age kids', 'Escolares'),
  ];
  const blurbs = [
    T(
      'Cuddles, cozy routines, and those wonderful first discoveries.',
      'Abrazos, rutinas tranquilas y esos primeros descubrimientos.',
    ),
    T(
      'Little hands, big ideas, and so much to explore together.',
      'Manitas pequeñas, grandes ideas y mucho por explorar.',
    ),
    T(
      'Paint, play, make friends. And get ready for the next big step!',
      'Pintar, jugar, hacer amigos. ¡Y prepararse para el siguiente paso!',
    ),
    T(
      'A friendly spot for homework, new friends, and after-school fun.',
      'Un lugar para las tareas, los amigos y la diversión después de clases.',
    ),
  ];
  const faqs = [
    [
      T('Can we come and look around?', '¿Podemos visitar el centro?'),
      T(
        'Yes! Pick an available time and come meet us. Bring your child, ask your questions, and see how it feels. There’s no commitment to enroll.',
        '¡Sí! Elige un horario disponible y ven a conocernos. Trae a tu hijo, haz tus preguntas y conoce el ambiente. No hay compromiso de inscripción.',
      ),
    ],
    [
      T('What ages are the programs for?', '¿Para qué edades son los programas?'),
      T(
        'This demo includes care from 6 weeks through school age, inspired by the Honey Bear programs. Exact ages and availability at Little Panda will be confirmed before enrollment.',
        'Esta demo incluye cuidado desde las 6 semanas hasta la edad escolar, inspirado en los programas de Honey Bear. Las edades y disponibilidad de Little Panda se confirmarán antes de la inscripción.',
      ),
    ],
    [
      T('Do you speak Spanish?', '¿Hablan español?'),
      T(
        '¡Sí! Explore the website and book your visit in English or Spanish. Tell us your preferred language when you book, and ask about classroom language options when we meet.',
        '¡Sí! Explora el sitio y reserva tu visita en español o inglés. Indica tu idioma preferido al reservar y pregunta por los idiomas del salón durante tu visita.',
      ),
    ],
    [
      T('How much does care cost?', '¿Cuánto cuesta el cuidado?'),
      T(
        'Rates depend on your child’s age and the schedule you need. We can talk through tuition, enrollment fees, and available assistance during your visit.',
        'Las tarifas dependen de la edad de tu hijo y del horario que necesitas. Durante la visita hablaremos de las tarifas, cuotas de inscripción y ayuda disponible.',
      ),
    ],
    [
      T('Where are you, and when are you open?', '¿Dónde están y cuál es el horario?'),
      T(
        'The new Little Panda address and opening hours are coming soon. For now, the phone number is the existing Honey Bear family contact. The tour calendar is for demonstration.',
        'La nueva dirección y el horario de Little Panda estarán disponibles pronto. Por ahora, el teléfono es el contacto actual de Honey Bear. El calendario de visitas es de demostración.',
      ),
    ],
  ];
  return `${header()}<main id="main"><div id="sunny-home">
  <section class="sunny-hero"><div class="cloud cloud-one" aria-hidden="true"></div><div class="cloud cloud-two" aria-hidden="true"></div><div class="container sunny-hero-grid"><div class="sunny-hero-copy"><span class="hand-note welcome-note">${T('Hello, little sunshine!', '¡Hola, rayito de sol!')}</span><h1>${T('<span class="word-blue">Happy little</span><br><span class="word-coral">days.</span> <span class="word-blue">Bright</span><br><span class="word-purple">big futures.</span>', '<span class="word-blue">Días llenos</span><br><span class="word-coral">de alegría.</span><br><span class="word-purple">¡A crecer!</span>')}</h1><p>${T('Messy art. New friends. One more story, please! A happy place for your child to play, learn, and feel right at home.', 'Arte con las manos. Nuevos amigos. ¡Otro cuento, por favor! Un lugar feliz para jugar, aprender y sentirse como en casa.')}</p><div class="sunny-buttons">${btn(T('Come say hello!', '¡Ven a conocernos!'))}<a class="sunny-secondary" href="#/programs">${T('Find their age group', 'Encuentra su grupo')} ${icon('arrow')}</a></div><p class="bilingual-note">${icon('globe')} ${T('English & Español. Everyone’s welcome.', 'Español & English. Todos son bienvenidos.')}</p></div><div class="sunny-photo-world">${sun}<div class="main-snapshot"><img src="assets/classroom.jpg" alt="${T('A teacher reading a story with children — illustrative stock photo', 'Una maestra comparte un cuento con niños — foto de archivo ilustrativa')}" width="1600" height="1067" fetchpriority="high"><span class="hand-note">${T('“One more story!”', '«¡Otro cuento!»')}</span></div><div class="small-snapshot"><img src="assets/learning.jpg" alt="${T('Children playing together with colorful wooden blocks — stock photo', 'Niñas juegan con bloques de colores — foto de archivo')}" width="900" height="600"><span class="hand-note">${T('Better together ♡', 'Juntos es mejor ♡')}</span></div><span class="hero-spark spark-one" aria-hidden="true">✦</span><span class="hero-spark spark-two" aria-hidden="true">✦</span>${rainbow}</div></div></section>
  <section class="hello-strip container" aria-label="${T('Our approach', 'Nuestro enfoque')}"><span><b class="strip-flower">✿</b>${T('A whole lot of play', 'Mucho, mucho juego')}</span><span><b class="strip-heart">♡</b>${T('A whole lot of love', 'Mucho, mucho amor')}</span><span><b class="strip-sun">☀</b>${T('A little more sunshine', 'Un poquito más de sol')}</span></section>
  <section class="sunny-programs section container" id="programs"><div class="sunny-section-title"><span class="hand-note">${T('From tiny toes to big adventures', 'De pequeños pasos a grandes aventuras')}</span><h2>${T('There’s room for <span>every little one.</span>', 'Hay un lugar para <span>cada pequeño.</span>')}</h2><p>${T('A little care, a little play, and something new to learn every day.', 'Un poco de cuidado, mucho juego y algo nuevo por aprender cada día.')}</p></div><div class="sunny-program-grid">${programs()
    .map(
      (p, i) =>
        `<article class="sunny-program program-${i}"><div class="toy-circle">${toyIcons[i]}</div><h3>${names[i]}</h3><span class="sunny-age">${p.age.split(' · ')[1]}</span><p>${blurbs[i]}</p><a href="#/book" data-program="${p.id}" aria-label="${T('Visit our ', 'Visita nuestro grupo de ')}${names[i]}">${T('Come explore', 'Ven a explorar')} ${icon('arrow')}</a></article>`,
    )
    .join(
      '',
    )}</div><p class="section-footnote">${T('Demo program guide. Final age groups and availability to be confirmed.', 'Guía de programas demo. Edades y disponibilidad final por confirmar.')}</p></section>
  <section class="sunny-story" id="about"><div class="container sunny-story-grid"><div class="sunny-story-photo"><img src="assets/child.jpg" alt="${T('A happy child covered in colorful paint — illustrative stock photo', 'Una niña feliz con pintura de colores — foto de archivo ilustrativa')}" width="1000" height="1506" loading="lazy"><span class="tape" aria-hidden="true"></span><div class="paint-stamp">${T('A little messy.<br>A lot of fun!', '¡Un poco de lío.<br>Mucha diversión!')}</div><span class="story-flower" aria-hidden="true">✿</span></div><div class="sunny-story-copy"><span class="hand-note">${T('A big welcome to our little world', 'Bienvenidos a nuestro pequeño mundo')}</span><h2>${T('Childhood should<br>be full of <span>happy.</span>', 'La infancia merece<br>mucha <span>alegría.</span>')}</h2><p>${T('The kind with paint on their fingers, a favorite book on their lap, and a friend waiting to play.', 'De esa que deja pintura en los dedos, un cuento favorito en el regazo y un amigo esperando para jugar.')}</p><p>${T('That’s the feeling we’re creating at Little Panda. Inspired by the family-focused care at Honey Bear, we’re making room for curious kids, caring grown-ups, and families who feel they belong.', 'Ese es el ambiente que queremos en Little Panda. Inspirados en el cuidado familiar de Honey Bear, creamos un lugar para niños curiosos, adultos cariñosos y familias que se sienten parte de él.')}</p><ul class="sunny-checks"><li>${T('Time to play, try, and try again', 'Tiempo para jugar, intentar y volver a intentar')}</li><li>${T('A friendly face and a listening ear', 'Una cara amable y alguien que te escucha')}</li><li>${T('A connection with your whole family', 'Una conexión con toda tu familia')}</li></ul>${btn(T('Let’s meet each other', 'Vamos a conocernos'))}</div></div></section>
  <section class="sunny-day" id="day"><div class="container"><div class="sunny-section-title"><span class="hand-note">${T('So, what did you do today?', 'Y hoy, ¿qué hiciste?')}</span><h2>${T('A day full of <span>“guess what!”</span>', 'Un día lleno de <span>«¡adivina qué!»</span>')}</h2></div><div class="sunny-day-grid">${[
    [
      'sun',
      T('Hello, friends!', '¡Hola, amigos!'),
      T(
        'A warm welcome, a wave goodbye, and time to settle in and play.',
        'Una cálida bienvenida, una despedida y tiempo para adaptarse y jugar.',
      ),
    ],
    [
      'book',
      T('Let’s make something', 'Vamos a crear'),
      T(
        'Stories, songs, building, painting. Where will our imaginations go?',
        'Cuentos, canciones, bloques, pintura. ¿Adónde nos llevará la imaginación?',
      ),
    ],
    [
      'leaf',
      T('Refuel & rest', 'Comer y descansar'),
      T(
        'A bite to eat and a quiet moment. Even explorers need a little rest.',
        'Algo rico y un momento de calma. Hasta los exploradores necesitan descansar.',
      ),
    ],
    [
      'heart',
      T('See you tomorrow!', '¡Hasta mañana!'),
      T(
        'More play, happy goodbyes, and a little story to share on the way home.',
        'Más juegos, despedidas felices y una historia para contar de camino a casa.',
      ),
    ],
  ]
    .map(
      (d, i) =>
        `<article><div class="day-doodle doodle-${i}">${icon(d[0])}</div><h3>${d[1]}</h3><p>${d[2]}</p></article>`,
    )
    .join(
      '',
    )}</div><p class="section-footnote">${T('A sample day. Routines and activities change with each age group.', 'Un día de ejemplo. Las rutinas y actividades cambian según el grupo de edad.')}</p></div></section>
  <section class="sunny-parent section container"><div class="sunny-section-title"><span class="hand-note">${T('And for you, grown-ups…', 'Y para ustedes, familias…')}</span><h2>${T('Let’s talk about <span>the important stuff.</span>', 'Hablemos de <span>lo que importa.</span>')}</h2></div><div class="sunny-parent-grid">${[
    [
      'shield',
      T('Safe & sound', 'Seguros y tranquilos'),
      T(
        'From drop-off to pickup, ask us about the everyday routines that help keep children safe.',
        'Desde la llegada hasta la recogida, conoce las rutinas que ayudan a cuidar a los niños.',
      ),
    ],
    [
      'people',
      T('You’re part of this, too', 'Tú también eres parte'),
      T(
        'Tell us about your child. Ask about updates, milestones, and how we’ll stay in touch.',
        'Cuéntanos sobre tu hijo. Pregunta por las noticias, los logros y cómo seguiremos en contacto.',
      ),
    ],
    [
      'globe',
      T('Hola! Hello!', '¡Hola! Hello!'),
      T(
        'Two languages to help you feel at home. Browse, ask questions, and book in English or Spanish.',
        'Dos idiomas para sentirte como en casa. Explora, pregunta y reserva en español o inglés.',
      ),
    ],
  ]
    .map((d) => `<article>${icon(d[0])}<h3>${d[1]}</h3><p>${d[2]}</p></article>`)
    .join('')}</div></section>
  <section class="sunny-faq" id="faq"><div class="container sunny-faq-grid"><div><span class="hand-note">${T('It’s okay to have a million questions', 'Se vale tener mil preguntas')}</span><h2>${T('Good questions.<br><span>Honest answers.</span>', 'Buenas preguntas.<br><span>Respuestas claras.</span>')}</h2><p>${T('Choosing a daycare is a big deal. Let’s start here, and talk about the rest when you visit.', 'Elegir una guardería es importante. Empecemos aquí y conversemos del resto durante tu visita.')}</p>${rainbow}</div><div class="faq-list">${faqs.map((q, i) => `<details ${i === 0 ? 'open' : ''}><summary>${q[0]}<span>+</span></summary><p>${q[1]}</p></details>`).join('')}</div></div></section>
  <section class="sunny-visit"><div class="container sunny-visit-inner">${sun}<span class="hand-note">${T('The best way to get to know us?', '¿La mejor forma de conocernos?')}</span><h2>${T('Come on <span>over!</span>', '¡Ven a <span>visitarnos!</span>')}</h2><p>${T('Bring your little one. Bring your questions.<br>We’ll bring the warm welcome.', 'Trae a tu pequeño. Trae tus preguntas.<br>Nosotros ponemos la cálida bienvenida.')}</p>${btn(T('Let’s book a visit', 'Vamos a agendar una visita'))}<small>${state.settings.duration} ${T('minutes to look around. No pressure, just hello.', 'minutos para conocernos. Sin presión, solo un hola.')}</small></div></section>
  </div></main>${footer()}`;
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
        T('Happy little days. Bright big futures.', 'Días llenos de alegría. ¡A crecer!');
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
