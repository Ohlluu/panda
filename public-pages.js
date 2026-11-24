// Demo content adapted from Honey Bear's public staff/program pages; no staff photographs reused.
export function createPublicPages({ T, esc, icon, header, footer, btn }) {
  const staff = () => [
    ['Wanda Guerra', T('Director / Owner', 'Directora / Propietaria')],
    [
      'Jenny Lazcano',
      T(
        'Assistant Director · EHS / Preschool teacher',
        'Subdirectora · Maestra de EHS / Preescolar',
      ),
    ],
    ['Reyna Gonzalez', T('Early Head Start teacher', 'Maestra de Early Head Start')],
    ['Natalie Palafox', T('Early Head Start teacher', 'Maestra de Early Head Start')],
    [
      'Amanda Guerra',
      T('Director · Early Head Start teacher', 'Directora · Maestra de Early Head Start'),
    ],
    [
      'Lily Guerra',
      T(
        'Assistant Director · EHS / Preschool teacher',
        'Subdirectora · Maestra de EHS / Preescolar',
      ),
    ],
    ['Julissa Villegas', T('Assistant teacher', 'Maestra auxiliar')],
    ['Alejandra Villegas', T('Assistant Preschool teacher', 'Maestra auxiliar de preescolar')],
    ['Gladys Mendoza', T('Assistant Director / Teacher', 'Subdirectora / Maestra')],
    ['Debbie Styka', T('Preschool For All teacher', 'Maestra de Preschool For All')],
  ];
  const pageHeading = (eyebrow, title, intro) =>
    `<div class="content-page-heading"><span class="hand-note">${eyebrow}</span><h1>${title}</h1>${intro ? `<p>${intro}</p>` : ''}</div>`;
  const demoSource = (type = 'staff') =>
    `<p class="content-source-note">${T('Demo information adapted from Honey Bear Day Care. Little Panda staffing and program details can be updated before launch.', 'Información demo adaptada de Honey Bear Day Care. El personal y los programas de Little Panda pueden actualizarse antes del lanzamiento.')} <a href="https://www.honeybeardaycarecenter.com/${type === 'staff' ? 'about-us' : 'our-programs'}/" target="_blank" rel="noopener noreferrer">${T('Source', 'Fuente')} ↗</a></p>`;
  const cta = () =>
    `<section class="content-page-cta"><span class="hand-note">${T('Let’s get to know each other.', 'Vamos a conocernos.')}</span>${btn(T('Come for a visit', 'Ven a visitarnos'))}</section>`;
  function about() {
    return `<div class="container content-page about-page">${pageHeading(T('Our story, our people', 'Nuestra historia, nuestra gente'), T('Little pandas.<br><em>Big-hearted people.</em>', 'Pequeños pandas.<br><em>Grandes corazones.</em>'), T('Family-owned care, a love of learning, and a warm welcome in two languages.', 'Cuidado familiar, amor por el aprendizaje y una cálida bienvenida en dos idiomas.'))}<section class="founder-feature" aria-labelledby="founder-heading"><div class="founder-paper"><span class="founder-initials" aria-hidden="true">WG</span><span class="hand-note">${T('Meet Wanda', 'Conoce a Wanda')}</span><span class="founder-flower" aria-hidden="true">✿</span></div><div><span class="content-kicker">${T('THE HEART BEHIND THE CARE', 'EL CORAZÓN DETRÁS DEL CUIDADO')}</span><h2 id="founder-heading">Wanda Guerra</h2><strong>${T('Director & Owner', 'Directora y propietaria')}</strong><p>${T('Wanda has owned Honey Bear Day Care since 2012. Her background combines classroom teaching with more than 30 years in education, according to the center’s profile.', 'Wanda es propietaria de Honey Bear Day Care desde 2012. Según el perfil del centro, combina experiencia como maestra con más de 30 años en educación.')}</p><div class="credential-tags"><span>${T('Early Childhood Education · Triton College', 'Educación infantil · Triton College')}</span><span>${T('Bachelor’s degree in education', 'Licenciatura en educación')}</span><span>CPR / First Aid</span><span>ServSafe</span></div></div></section><section class="team-section"><div class="content-section-heading"><span class="hand-note">${T('Friendly faces. Caring hands.', 'Caras amables. Manos cariñosas.')}</span><h2>${T('Meet the <em>team.</em>', 'Conoce al <em>equipo.</em>')}</h2></div><div class="staff-grid">${staff()
      .map(
        ([name, role], i) =>
          `<article class="staff-card staff-color-${i % 4}"><div class="staff-initials" aria-hidden="true">${name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')}</div><h3>${esc(name)}</h3><p>${role}</p></article>`,
      )
      .join(
        '',
      )}</div>${demoSource()}</section><section class="values-page-grid"><article>${icon('globe')}<h3>${T('English & Español', 'Español & English')}</h3><p>${T('Bilingual connection is part of Honey Bear’s family-centered approach.', 'La conexión bilingüe es parte del enfoque familiar de Honey Bear.')}</p></article><article>${icon('heart')}<h3>${T('Families belong here', 'Las familias son parte')}</h3><p>${T('Parent involvement and conversations about each child’s growth are part of the care.', 'La participación de las familias y el diálogo sobre cada niño forman parte del cuidado.')}</p></article></section>${cta()}</div>`;
  }
  function programs() {
    const offerings = [
      {
        id: 'early',
        title: T('Infants & toddlers', 'Bebés y pequeñitos'),
        age: T('6 weeks–3 years', '6 semanas–3 años'),
        tag: 'Early Head Start · EHS-CCP',
        symbol: 'heart',
        image: 'assets/learning.jpg',
        intro: T(
          'A caring start, with everyday routines and early learning shaped around each child.',
          'Un comienzo cariñoso con rutinas y aprendizaje adaptados a cada niño.',
        ),
        features: [
          T(
            'Meals, formula feeding, and diapering',
            'Comidas, alimentación con fórmula y cambio de pañales',
          ),
          T(
            'Developmental screenings and observations',
            'Evaluaciones y observaciones del desarrollo',
          ),
          T('Activities that involve the whole family', 'Actividades para toda la familia'),
          T(
            'Support for individual developmental needs',
            'Apoyo para las necesidades individuales del desarrollo',
          ),
        ],
      },
      {
        id: 'preschool',
        title: T('Preschool', 'Preescolar'),
        age: T('3–5 years', '3–5 años'),
        tag: 'Preschool For All',
        symbol: 'book',
        image: 'assets/classroom.jpg',
        intro: T(
          'Hands-on learning that helps children feel ready for their next big step.',
          'Aprendizaje práctico para dar el siguiente gran paso con confianza.',
        ),
        features: [
          T(
            'Creative Curriculum and Teaching Strategies',
            'Creative Curriculum y Teaching Strategies',
          ),
          T('Developmental screenings and referrals', 'Evaluaciones del desarrollo y referencias'),
          T(
            'Art, exploration, and creative activities',
            'Arte, exploración y actividades creativas',
          ),
          T(
            'Quarterly parent-teacher conferences',
            'Reuniones trimestrales entre familias y maestros',
          ),
        ],
      },
      {
        id: 'school',
        title: T('Before & after school', 'Antes y después de clases'),
        age: T('Kindergarten–6th grade', 'Kínder–6.º grado'),
        tag: T('School-age care', 'Cuidado en edad escolar'),
        symbol: 'sun',
        image: 'assets/tour-outdoor.jpg',
        intro: T(
          'A welcoming place for homework, friendships, and a little more play.',
          'Un lugar acogedor para las tareas, los amigos y un poco más de juego.',
        ),
        features: [
          T('Homework help and e-learning support', 'Ayuda con tareas y aprendizaje en línea'),
          T('Activities and nutritious snacks', 'Actividades y refrigerios nutritivos'),
          T(
            'School transportation listed at Honey Bear',
            'Transporte escolar indicado en Honey Bear',
          ),
          T(
            'Roy, Scott & Westdale · Mannheim District 83',
            'Roy, Scott y Westdale · Distrito Mannheim 83',
          ),
        ],
      },
    ];
    return `<div class="container content-page programs-page">${pageHeading(T('A little care for every stage', 'Cuidado para cada etapa'), T('Small steps.<br><em>Wonderful discoveries.</em>', 'Pequeños pasos.<br><em>Grandes descubrimientos.</em>'), T('Programs inspired by the learning and family support offered at Honey Bear.', 'Programas inspirados en el aprendizaje y apoyo familiar de Honey Bear.'))}<div class="program-detail-list">${offerings.map((p, i) => `<section class="program-detail program-detail-${i}"><div class="program-detail-photo"><img src="${p.image}" alt="${T('Illustrative stock photo of children learning or playing', 'Foto ilustrativa de niños aprendiendo o jugando')}" loading="lazy"><span>${p.age}</span></div><div><span class="content-kicker">${p.tag}</span><h2>${p.title}</h2><p>${p.intro}</p><ul>${p.features.map((f) => `<li>${icon('check')}${f}</li>`).join('')}</ul>${btn(T('Ask about this program', 'Pregunta por este programa'))}</div></section>`).join('')}</div>${demoSource('programs')}<section class="partner-strip"><h2>${T('Connected with the community', 'Conectados con la comunidad')}</h2><p>${T('Organizations listed by Honey Bear', 'Organizaciones indicadas por Honey Bear')}</p><div><span>Early Head Start</span><a href="https://www.actforchildren.org/" target="_blank" rel="noopener noreferrer">Illinois Action for Children ↗</a><a href="https://www.plcca.org/" target="_blank" rel="noopener noreferrer">PLCCA ↗</a><span>WIC</span><span>Preschool For All</span></div></section>${cta()}</div>`;
  }
  function day() {
    return `<div class="container content-page day-page">${pageHeading(T('A peek at our day', 'Un vistazo a nuestro día'), T('Play. Learn.<br><em>Do it all again.</em>', 'Jugar. Aprender.<br><em>Volver a empezar.</em>'), T('A sample daily rhythm, with room for each age and personality.', 'Una rutina de ejemplo con espacio para cada edad y personalidad.'))}<div class="daily-timeline">${[
      [
        'sun',
        T('A happy hello', 'Una bienvenida feliz'),
        T('Arrival & settling in', 'Llegada y adaptación'),
        T(
          'Familiar faces, a warm welcome, and a little time to get comfortable.',
          'Caras conocidas, una cálida bienvenida y tiempo para sentirse a gusto.',
        ),
      ],
      [
        'book',
        T('Let’s discover something', 'Vamos a descubrir'),
        T('Stories, play & learning', 'Cuentos, juego y aprendizaje'),
        T(
          'Songs, books, building, and creative activities turn little questions into discoveries.',
          'Canciones, libros, bloques y actividades creativas convierten las preguntas en descubrimientos.',
        ),
      ],
      [
        'leaf',
        T('A little pause', 'Una pequeña pausa'),
        T('Meals & quiet time', 'Comidas y descanso'),
        T(
          'A chance to refuel, rest, and reset. Routines change with each child’s age.',
          'Tiempo para comer, descansar y recuperar energía. Las rutinas cambian según la edad.',
        ),
      ],
      [
        'people',
        T('More friends, more fun', 'Más amigos, más diversión'),
        T('Play & family pickup', 'Juego y recogida'),
        T(
          'More exploring, a happy goodbye, and something to share on the way home.',
          'Más exploración, una despedida feliz y algo para contar de camino a casa.',
        ),
      ],
    ]
      .map(
        ([symbol, title, tag, body], i) =>
          `<article><div class="timeline-sticker sticker-${i}">${icon(symbol)}</div><div><span class="content-kicker">${tag}</span><h2>${title}</h2><p>${body}</p></div></article>`,
      )
      .join(
        '',
      )}</div><div class="day-page-photo"><img src="assets/learning.jpg" alt="${T('Children exploring wooden toys — illustrative stock photo', 'Niñas exploran juguetes de madera — foto ilustrativa')}" loading="lazy"><span class="hand-note">${T('Every day, a little discovery.', 'Cada día, un descubrimiento.')}</span></div><p class="content-source-note">${T('Illustrative routine for the demo; final schedules are not yet provided.', 'Rutina ilustrativa para la demo; aún no se han proporcionado los horarios finales.')}</p>${cta()}</div>`;
  }
  function faq() {
    const questions = [
      [
        T('How do we get started?', '¿Cómo empezamos?'),
        T(
          'Book a family visit, bring your little one, and ask your questions. There is no commitment to enroll.',
          'Agenda una visita familiar, trae a tu pequeño y haz tus preguntas. No hay compromiso de inscripción.',
        ),
      ],
      [
        T('What ages are included?', '¿Qué edades se incluyen?'),
        T(
          'The Honey Bear program guide covers 6 weeks through 6th grade. Little Panda’s final age groups and openings will be confirmed.',
          'La guía de Honey Bear incluye desde las 6 semanas hasta 6.º grado. Los grupos y lugares de Little Panda se confirmarán.',
        ),
      ],
      [
        T('Can we speak Spanish?', '¿Podemos hablar en español?'),
        T(
          'Yes. Explore this site and book in English or Spanish. Ask about classroom language options when you visit.',
          'Sí. Explora el sitio y reserva en español o inglés. Pregunta por los idiomas del salón durante tu visita.',
        ),
      ],
      [
        T('What is tuition?', '¿Cuánto cuesta?'),
        T(
          'Rates are not listed on the source website. Ask about tuition, enrollment fees, and assistance during your visit.',
          'La página de origen no indica tarifas. Pregunta por tarifas, inscripción y ayuda durante tu visita.',
        ),
      ],
      [
        T('Is school transportation available?', '¿Hay transporte escolar?'),
        T(
          'Honey Bear lists transportation for Roy, Scott, and Westdale elementary schools in District 83. The new center’s arrangements need confirmation.',
          'Honey Bear indica transporte a las primarias Roy, Scott y Westdale del Distrito 83. El servicio del nuevo centro está por confirmar.',
        ),
      ],
      [
        T('Where is Little Panda?', '¿Dónde está Little Panda?'),
        T(
          'The new address and opening hours are pending. The contact page includes the existing Honey Bear location for this demo.',
          'La nueva dirección y horario están pendientes. La página de contacto incluye la ubicación actual de Honey Bear para esta demo.',
        ),
      ],
    ];
    return `<div class="container content-page faq-page">${pageHeading(T('For the grown-ups', 'Para las familias'), T('Good questions.<br><em>Let’s talk.</em>', 'Buenas preguntas.<br><em>Conversemos.</em>'), '')}<div class="faq-list dedicated-faq-list">${questions.map(([q, a]) => `<details><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join('')}</div>${cta()}</div>`;
  }
  function contact() {
    return `<div class="container content-page contact-page">${pageHeading(T('Let’s connect', 'Conectemos'), T('Start with <em>hello.</em>', 'Empieza con un <em>hola.</em>'), T('Come meet the people behind the care.', 'Ven a conocer a las personas detrás del cuidado.'))}<div class="contact-page-grid"><section><span class="hand-note">${T('Our current daycare', 'Nuestra guardería actual')}</span><h2>Honey Bear Day Care Center</h2><p>${icon('pin')}2359 N. Mannheim Rd.<br>Melrose Park, IL 60164</p><a class="contact-phone" href="tel:+18474558687">${icon('people')}847-455-8687</a><p class="contact-fax">${T('Fax', 'Fax')}: 847-789-9705</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=2359+N+Mannheim+Rd+Melrose+Park+IL+60164" target="_blank" rel="noopener noreferrer">${T('Open directions', 'Ver indicaciones')} ↗</a></section><section class="contact-visit-card">${icon('calendar')}<h2>${T('Visit Little Panda', 'Visita Little Panda')}</h2><p>${T('Try the demo booking calendar and find a time to meet. The new location and hours can be added when confirmed.', 'Prueba el calendario demo y encuentra un horario. La nueva ubicación y horario se agregarán cuando se confirmen.')}</p>${btn(T('Book a family visit', 'Agenda una visita familiar'))}</section></div><p class="content-source-note">${T('Existing Honey Bear contact information is used for this demo.', 'Se utiliza el contacto actual de Honey Bear para esta demo.')} <a href="https://www.honeybeardaycarecenter.com/contact-us/" target="_blank" rel="noopener noreferrer">${T('Source', 'Fuente')} ↗</a></p></div>`;
  }
  const pages = { about, programs, day, faq, contact };
  return {
    has: (route) => Object.hasOwn(pages, route),
    render: (route) => `${header()}<main id="main">${pages[route]()}</main>${footer()}`,
    title: (route) =>
      ({
        about: T('Our story & team', 'Historia y equipo'),
        programs: T('Our programs', 'Programas'),
        day: T('A day here', 'Un día aquí'),
        faq: T('Parent FAQs', 'Preguntas frecuentes'),
        contact: T('Contact', 'Contacto'),
      })[route],
  };
}
