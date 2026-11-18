import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slotsFor,
  initialState,
  addDays,
  todayKey,
  parseDate,
  validateWindows,
} from '../scheduling.js';
const now = new Date('2026-11-16T14:00:00Z');
const settings = initialState().settings;
test('weekly schedule produces duration and buffer spaced slots', () => {
  const slots = slotsFor('2026-11-17', settings, [], null, now);
  assert.equal(slots[0], '09:00');
  assert.equal(slots[1], '09:45');
  assert.equal(slots.at(-1), '15:00');
});
test('blocks dates, disabled weekdays, past dates and the booking horizon', () => {
  assert.deepEqual(
    slotsFor('2026-11-17', { ...settings, blocked: ['2026-11-17'] }, [], null, now),
    [],
  );
  for (const d of ['2026-11-15', '2026-11-21', '2027-05-01'])
    assert.deepEqual(slotsFor(d, settings, [], null, now), []);
});
test('overlapping bookings and buffers are excluded, cancellations release time', () => {
  const booking = {
    id: 'one',
    date: '2026-11-17',
    time: '09:00',
    duration: 60,
    status: 'confirmed',
  };
  let slots = slotsFor(booking.date, settings, [booking], null, now);
  assert(!slots.includes('09:00'));
  assert(!slots.includes('09:45'));
  assert(slots.includes('10:30'));
  assert(
    slotsFor(booking.date, settings, [{ ...booking, status: 'cancelled' }], null, now).includes(
      '09:00',
    ),
  );
  assert(slotsFor(booking.date, settings, [booking], 'one', now).includes('09:00'));
});
test('today excludes times that have already passed in Chicago', () => {
  const slots = slotsFor('2026-11-16', settings, [], null, new Date('2026-11-16T16:00:00Z'));
  assert(!slots.includes('09:00'));
  assert(!slots.includes('09:45'));
  assert(slots.includes('10:30'));
});
test('existing bookings still block time after duration changes', () => {
  const b = { date: '2026-11-17', time: '09:00', duration: 60, status: 'confirmed' };
  assert(
    !slotsFor(b.date, { ...settings, duration: 15, buffer: 0 }, [b], null, now).includes('09:45'),
  );
});

test('multiple daily windows leave the lunch gap unavailable', () => {
  const weekly = settings.weekly.map((d) => ({
    ...d,
    windows: [
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
    ],
  }));
  const slots = slotsFor('2026-11-17', { ...settings, weekly, buffer: 0 }, [], null, now);
  assert.deepEqual(slots, ['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30']);
});
test('a tour never crosses the end of a window and buffers apply across windows', () => {
  const weekly = settings.weekly.map((d) => ({
    ...d,
    windows: [
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:00' },
    ],
  }));
  const bookings = [
    { id: 'one', date: '2026-11-17', time: '10:00', duration: 60, status: 'confirmed' },
  ];
  assert.deepEqual(
    slotsFor('2026-11-17', { ...settings, weekly, duration: 30, buffer: 30 }, bookings, null, now),
    [],
  );
});
test('legacy one-window schedules continue to work without losing bookings', () => {
  const weekly = settings.weekly.map((d) => ({ enabled: d.enabled, start: '09:00', end: '12:00' }));
  const slots = slotsFor('2026-11-17', { ...settings, weekly }, [], null, now);
  assert.equal(slots[0], '09:00');
  assert(!slots.includes('12:00'));
});
test('overlapping raw windows do not duplicate returned time slots', () => {
  const weekly = settings.weekly.map((d) => ({
    ...d,
    windows: [
      { start: '10:00', end: '12:00' },
      { start: '10:00', end: '12:00' },
    ],
  }));
  assert.deepEqual(slotsFor('2026-11-17', { ...settings, weekly, buffer: 0 }, [], null, now), [
    '10:00',
    '10:30',
    '11:00',
    '11:30',
  ]);
});

test('admin validation rejects overlapping, invalid, reversed, empty and too-short windows', () => {
  assert.equal(
    validateWindows(
      [
        { start: '10:00', end: '12:00' },
        { start: '11:00', end: '13:00' },
      ],
      30,
    ),
    'overlap',
  );
  for (const windows of [
    [{ start: '12:00', end: '10:00' }],
    [{ start: '10:00', end: '10:15' }],
    [{ start: '25:00', end: '26:00' }],
  ])
    assert.equal(validateWindows(windows, 30), 'short');
  assert.equal(validateWindows([], 30), 'empty');
  assert.equal(
    validateWindows(
      [
        { start: '13:00', end: '15:00' },
        { start: '10:00', end: '12:00' },
      ],
      30,
    ),
    null,
  );
});
