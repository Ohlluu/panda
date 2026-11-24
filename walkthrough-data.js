// A small spatial graph. Doorway markers link views; order does not imply a connection.
export const walkthroughPhotos = [
  'entrance',
  'reception',
  'hallway',
  'classroom',
  'playroom',
  'garden',
].map((id) => [
  `walk-${id}`,
  `assets/walkthrough/${id}.jpg`,
  {
    entrance: 'Main entrance',
    reception: 'Reception',
    hallway: 'Hallway',
    classroom: 'Blue classroom',
    playroom: 'Coral playroom',
    garden: 'Garden',
  }[id],
  {
    entrance: 'Entrada principal',
    reception: 'Recepción',
    hallway: 'Pasillo',
    classroom: 'Salón azul',
    playroom: 'Sala de juegos coral',
    garden: 'Jardín',
  }[id],
]);
const w = (en, es) => ({ en, es });
export function defaultWalkthroughRooms() {
  const link = (target, x, y, en, es, direction = 'forward') => ({
    id: crypto.randomUUID(),
    kind: 'link',
    target,
    x,
    y,
    direction,
    label: w(en, es),
    body: w('', ''),
  });
  return [
    {
      id: 'entrance',
      title: w('Entrance', 'Entrada'),
      description: w(
        'Your visit starts here. Click the doorway to come inside.',
        'Tu visita empieza aquí. Haz clic en la puerta para entrar.',
      ),
      symbol: 'heart',
      photo: 'walk-entrance',
      points: [link('reception', 50, 53, 'Come inside', 'Pasa adelante')],
    },
    {
      id: 'reception',
      title: w('Reception', 'Recepción'),
      description: w(
        'Through the arch, the rest of our little world is waiting.',
        'Al otro lado del arco te espera nuestro pequeño mundo.',
      ),
      symbol: 'people',
      photo: 'walk-reception',
      points: [link('hallway', 50, 60, 'Walk into the hallway', 'Entrar al pasillo')],
      returnTo: 'entrance',
    },
    {
      id: 'hallway',
      title: w('Hallway', 'Pasillo'),
      description: w(
        'Blue door for the classroom. Coral for play. Green for the garden.',
        'Azul para el salón. Coral para jugar. Verde para el jardín.',
      ),
      symbol: 'leaf',
      photo: 'walk-hallway',
      points: [
        link('classroom', 19, 53, 'Blue classroom', 'Salón azul', 'left'),
        link('playroom', 84, 53, 'Playroom', 'Sala de juegos', 'right'),
        link('garden', 50, 53, 'Garden', 'Jardín'),
      ],
      returnTo: 'reception',
    },
    {
      id: 'classroom',
      title: w('Blue classroom', 'Salón azul'),
      description: w(
        'A little room for stories, making, and discovery. The blue door leads back.',
        'Un espacio para cuentos, creaciones y descubrimientos. La puerta azul te lleva de vuelta.',
      ),
      symbol: 'book',
      photo: 'walk-classroom',
      points: [
        link('hallway', 78, 48, 'Back through the blue door', 'Volver por la puerta azul', 'back'),
      ],
      returnTo: 'hallway',
    },
    {
      id: 'playroom',
      title: w('Coral playroom', 'Sala de juegos coral'),
      description: w(
        'A little imagination goes a long way. Head back through the coral door.',
        'La imaginación llega muy lejos. Vuelve por la puerta coral.',
      ),
      symbol: 'sun',
      photo: 'walk-playroom',
      points: [
        link(
          'hallway',
          22,
          48,
          'Back through the coral door',
          'Volver por la puerta coral',
          'back',
        ),
      ],
      returnTo: 'hallway',
    },
    {
      id: 'garden',
      title: w('Garden', 'Jardín'),
      description: w(
        'A little outdoor exploring. The green door takes you back inside.',
        'Un poco de exploración al aire libre. La puerta verde te lleva adentro.',
      ),
      symbol: 'leaf',
      photo: 'walk-garden',
      points: [link('hallway', 50, 48, 'Go back inside', 'Volver adentro', 'back')],
      returnTo: 'hallway',
    },
  ].map((room) => ({ ...room, visible: true, sample: true }));
}
export function availableDoorways(room, rooms) {
  return room.points.filter(
    (p) =>
      p.kind === 'link' &&
      p.target !== room.id &&
      rooms.some((r) => r.id === p.target && r.visible),
  );
}
export function validateWalkthroughRoom(room, rooms) {
  if (!['en', 'es'].every((l) => room.title?.[l]?.trim() && room.description?.[l]?.trim()))
    return 'translation';
  for (const p of room.points) {
    if (p.kind === 'link') {
      if (!p.target || p.target === room.id || !rooms.some((r) => r.id === p.target))
        return 'destination';
      if (!['en', 'es'].every((l) => p.label?.[l]?.trim())) return 'translation';
    } else if (!['en', 'es'].every((l) => p.label?.[l]?.trim() && p.body?.[l]?.trim()))
      return 'translation';
  }
  return null;
}
export function removeScene(rooms, id) {
  return rooms
    .filter((r) => r.id !== id)
    .map((r) => ({
      ...r,
      returnTo: r.returnTo === id ? null : r.returnTo,
      points: r.points.filter((p) => p.kind !== 'link' || p.target !== id),
    }));
}
export function reachableScenes(rooms, startId = rooms.find((r) => r.visible)?.id) {
  const seen = new Set(),
    queue = [startId];
  while (queue.length) {
    const id = queue.shift(),
      room = rooms.find((r) => r.id === id && r.visible);
    if (!room || seen.has(id)) continue;
    seen.add(id);
    queue.push(...availableDoorways(room, rooms).map((p) => p.target));
    if (room.returnTo) queue.push(room.returnTo);
  }
  return seen;
}
