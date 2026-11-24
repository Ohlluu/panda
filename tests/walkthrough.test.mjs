import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultWalkthroughRooms,
  availableDoorways,
  validateWalkthroughRoom,
  removeScene,
  reachableScenes,
  walkthroughPhotos,
} from '../walkthrough-data.js';
import { existsSync } from 'node:fs';
test('all six views and directional return paths belong to one connected walkthrough', () => {
  const rooms = defaultWalkthroughRooms();
  assert.equal(rooms.length, 6);
  assert.equal(rooms[0].id, 'entrance');
  assert.equal(reachableScenes(rooms).size, 6);
  for (const r of rooms) {
    assert.equal(validateWalkthroughRoom(r, rooms), null);
    for (const p of availableDoorways(r, rooms)) assert(rooms.some((n) => n.id === p.target));
    if (r.returnTo) assert(rooms.some((n) => n.id === r.returnTo));
  }
});
test('the hallway branches into specific rooms rather than the next item in a gallery', () => {
  const rooms = defaultWalkthroughRooms(),
    hall = rooms.find((r) => r.id === 'hallway');
  assert.deepEqual(
    availableDoorways(hall, rooms).map((p) => p.target),
    ['classroom', 'playroom', 'garden'],
  );
  for (const id of ['classroom', 'playroom', 'garden'])
    assert.equal(rooms.find((r) => r.id === id).points[0].target, 'hallway');
});
test('hidden and missing destinations are not clickable; deleting a view removes inbound links', () => {
  let rooms = defaultWalkthroughRooms();
  rooms.find((r) => r.id === 'garden').visible = false;
  assert(
    !availableDoorways(
      rooms.find((r) => r.id === 'hallway'),
      rooms,
    ).some((p) => p.target === 'garden'),
  );
  rooms = removeScene(rooms, 'hallway');
  assert(
    !rooms.some((r) => r.returnTo === 'hallway' || r.points.some((p) => p.target === 'hallway')),
  );
});
test('invalid destination and incomplete translations cannot be saved', () => {
  const rooms = defaultWalkthroughRooms(),
    room = structuredClone(rooms[0]);
  room.points[0].target = room.id;
  assert.equal(validateWalkthroughRoom(room, rooms), 'destination');
  room.points[0].target = 'missing';
  assert.equal(validateWalkthroughRoom(room, rooms), 'destination');
  room.points[0].target = 'reception';
  room.points[0].label.es = '';
  assert.equal(validateWalkthroughRoom(room, rooms), 'translation');
});
test('all six coordinated generated photographs are present', () => {
  for (const [, src] of walkthroughPhotos)
    assert(existsSync(new URL('../' + src, import.meta.url)), src);
});
