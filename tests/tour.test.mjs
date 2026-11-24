import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultTourRooms, tourPhotoSource, clampPoint, validTourRoom } from '../tour-data.js';
test('tour starts with six distinct bilingual sample spaces and markers', () => {
  const rooms = defaultTourRooms();
  assert.equal(rooms.length, 6);
  assert.equal(new Set(rooms.map((r) => r.id)).size, 6);
  for (const room of rooms) {
    assert(validTourRoom(room));
    assert(room.visible && room.sample);
    assert(room.points.length > 0);
  }
});
test('each reset creates independent tour data', () => {
  const a = defaultTourRooms(),
    b = defaultTourRooms();
  a[0].title.en = 'Changed';
  a[0].points[0].label.en = 'Changed';
  assert.notEqual(b[0].title.en, 'Changed');
  assert.notEqual(b[0].points[0].label.en, 'Changed');
});
test('photo sources allow known stock and encoded photos, never executable URLs', () => {
  assert.equal(tourPhotoSource({ photo: 'learning' }), 'assets/learning.jpg');
  assert.equal(
    tourPhotoSource({ image: 'data:image/jpeg;base64,YWJj' }),
    'data:image/jpeg;base64,YWJj',
  );
  for (const image of [
    'javascript:alert(1)',
    'data:image/svg+xml;base64,YWJj',
    'https://example.com/photo.jpg',
    'data:image/png;base64,\" onerror=alert(1)',
  ])
    assert.equal(tourPhotoSource({ photo: 'learning', image }), 'assets/learning.jpg');
});
test('marker coordinates stay within the visible photo area', () => {
  assert.deepEqual(clampPoint(-20, 120), { x: 5, y: 92 });
  assert.deepEqual(clampPoint(0, 0), { x: 5, y: 8 });
  assert.deepEqual(clampPoint(50.4, 30.8), { x: 50, y: 31 });
  assert.deepEqual(clampPoint(NaN, undefined), { x: 50, y: 50 });
});
test('saving requires bilingual descriptions and complete marker text', () => {
  const room = defaultTourRooms()[0];
  room.title.es = ' ';
  assert(!validTourRoom(room));
  room.title.es = 'Salón';
  room.points[0].body.es = '';
  assert(!validTourRoom(room));
  room.points = [];
  assert(validTourRoom(room));
});
