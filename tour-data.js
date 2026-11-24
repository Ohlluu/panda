export const tourPhotos = [
  ['classroom', 'assets/classroom.jpg', 'Story time', 'Hora del cuento'],
  ['learning', 'assets/learning.jpg', 'Learning together', 'Aprendiendo juntos'],
  ['infants', 'assets/tour-infants.jpg', 'Infant care', 'Cuidado infantil'],
  ['art', 'assets/child.jpg', 'Little artists', 'Pequeños artistas'],
  ['building', 'assets/playroom.jpg', 'Building & play', 'Construir y jugar'],
  ['outdoor', 'assets/tour-outdoor.jpg', 'Outdoor adventures', 'Aventuras al aire libre'],
];
const words = (en, es) => ({ en, es });
export function defaultTourRooms() {
  return [
    [
      'preschool',
      'classroom',
      'book',
      words('The preschool room', 'El salón preescolar'),
      words(
        'Big stories. Even bigger imaginations.',
        'Grandes cuentos. Imaginaciones aún más grandes.',
      ),
      [
        [
          68,
          27,
          words('Story circle', 'La ronda de cuentos'),
          words(
            'Stories invite children to listen, imagine, and share.',
            'Los cuentos invitan a escuchar, imaginar y compartir.',
          ),
        ],
        [
          30,
          65,
          words('Learning together', 'Aprender juntos'),
          words(
            'A little space for big conversations and new friends.',
            'Un espacio para conversar y hacer nuevos amigos.',
          ),
        ],
      ],
    ],
    [
      'infants',
      'infants',
      'heart',
      words('The infant nook', 'El rincón de bebés'),
      words(
        'A gentle start for the littlest pandas.',
        'Un comienzo cariñoso para los pandas más pequeños.',
      ),
      [
        [
          28,
          67,
          words('A cozy beginning', 'Un comienzo acogedor'),
          words(
            'Ask us about daily routines, feeding, and individual care.',
            'Pregunta por las rutinas, alimentación y cuidado individual.',
          ),
        ],
        [
          72,
          32,
          words('Little discoveries', 'Pequeños descubrimientos'),
          words(
            'Time to connect and explore at their own pace.',
            'Tiempo para conectar y explorar a su propio ritmo.',
          ),
        ],
      ],
    ],
    [
      'toddlers',
      'learning',
      'people',
      words('The toddler room', 'El salón de pequeñitos'),
      words(
        'Little hands, a whole world to discover.',
        'Manitas pequeñas, un mundo por descubrir.',
      ),
      [
        [
          53,
          65,
          words('Build something new', 'Construir algo nuevo'),
          words(
            'Blocks and hands-on play make room for trying again.',
            'Los bloques y el juego invitan a volver a intentar.',
          ),
        ],
        [
          78,
          33,
          words('First friendships', 'Primeras amistades'),
          words(
            'Learning to share, take turns, and play together.',
            'Aprender a compartir, esperar turnos y jugar juntos.',
          ),
        ],
      ],
    ],
    [
      'art',
      'art',
      'sun',
      words('The art corner', 'El rincón de arte'),
      words('A little color. A lot of possibility.', 'Un poco de color. Muchas posibilidades.'),
      [
        [
          70,
          75,
          words('Made by little hands', 'Hecho por manitas'),
          words(
            'Paint, explore, and enjoy the process of making.',
            'Pintar, explorar y disfrutar el proceso de crear.',
          ),
        ],
        [
          25,
          30,
          words('Their own ideas', 'Sus propias ideas'),
          words(
            'Every little artist has a different way to see the world.',
            'Cada pequeño artista ve el mundo a su manera.',
          ),
        ],
      ],
    ],
    [
      'play',
      'building',
      'leaf',
      words('The play space', 'El espacio de juego'),
      words('What will we build today?', '¿Qué vamos a construir hoy?'),
      [
        [
          38,
          40,
          words('Big little ideas', 'Pequeñas grandes ideas'),
          words(
            'Open-ended play turns a pile of blocks into anything.',
            'El juego libre convierte los bloques en cualquier cosa.',
          ),
        ],
        [
          72,
          70,
          words('Try, then try again', 'Intentar una vez más'),
          words(
            'Sorting, connecting, and solving little problems together.',
            'Clasificar, conectar y resolver pequeños retos juntos.',
          ),
        ],
      ],
    ],
    [
      'outdoor',
      'outdoor',
      'sun',
      words('Outdoor adventures', 'Aventuras al aire libre'),
      words('Fresh air. Happy feet.', 'Aire fresco. Pies felices.'),
      [
        [
          38,
          72,
          words('Move & explore', 'Moverse y explorar'),
          words(
            'A chance to stretch, balance, and keep moving.',
            'Una oportunidad para estirarse, equilibrarse y moverse.',
          ),
        ],
        [
          74,
          34,
          words('Play together', 'Jugar juntos'),
          words(
            'Ask about outdoor routines and activities during your visit.',
            'Pregunta por las rutinas y actividades al aire libre durante tu visita.',
          ),
        ],
      ],
    ],
  ].map(([id, photo, symbol, title, description, points]) => ({
    id,
    photo,
    symbol,
    title,
    description,
    visible: true,
    sample: true,
    points: points.map(([x, y, label, body], i) => ({ id: `${id}-${i}`, x, y, label, body })),
  }));
}
export function tourPhotoSource(room) {
  if (
    typeof room.image === 'string' &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(room.image)
  )
    return room.image;
  return tourPhotos.find((p) => p[0] === room.photo)?.[1] || tourPhotos[0][1];
}
export function clampPoint(x, y) {
  return {
    x: Math.round(Math.max(5, Math.min(95, Number.isFinite(Number(x)) ? Number(x) : 50))),
    y: Math.round(Math.max(8, Math.min(92, Number.isFinite(Number(y)) ? Number(y) : 50))),
  };
}
export function validTourRoom(room) {
  return (
    ['en', 'es'].every((l) => room.title?.[l]?.trim() && room.description?.[l]?.trim()) &&
    Array.isArray(room.points) &&
    room.points.every((p) => ['en', 'es'].every((l) => p.label?.[l]?.trim() && p.body?.[l]?.trim()))
  );
}
