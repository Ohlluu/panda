// All calendar dates and appointment times use America/Chicago wall time.
export const zone = 'America/Chicago';
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDate(key) {
  return new Date(key + 'T12:00:00');
}
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(key, n) {
  const d = parseDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}
export function minutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
export function wallTime(n) {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}
export function slotsFor(date, settings, bookings, ignoreId = null, now = new Date()) {
  const today = todayKey(now);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < today ||
    date > addDays(today, 90) ||
    settings.blocked.includes(date)
  )
    return [];
  const day = settings.weekly[parseDate(date).getDay()];
  if (!day?.enabled) return [];
  const duration = Number(settings.duration),
    buffer = Number(settings.buffer);
  if (!Number.isFinite(duration) || duration < 15 || !Number.isFinite(buffer) || buffer < 0)
    return [];
  const windows = dayWindows(day);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(now);
  const current =
    Number(parts.find((p) => p.type === 'hour').value) * 60 +
    Number(parts.find((p) => p.type === 'minute').value);
  const out = new Set();
  for (const window of windows) {
    const start = minutes(window.start),
      end = minutes(window.end);
    if (!validTime(window.start) || !validTime(window.end) || start >= end) continue;
    for (let t = start; t + duration <= end; t += duration + buffer) {
      if (date === today && t <= current) continue;
      const overlaps = bookings.some(
        (b) =>
          b.id !== ignoreId &&
          b.status !== 'cancelled' &&
          b.date === date &&
          t < minutes(b.time) + Number(b.duration) + buffer &&
          t + duration + buffer > minutes(b.time),
      );
      if (!overlaps) out.add(wallTime(t));
    }
  }
  return [...out].sort();
}
export function firstOpening(settings, bookings, ignoreId = null) {
  const today = todayKey();
  for (let n = 0; n <= 90; n++) {
    const key = addDays(today, n);
    if (slotsFor(key, settings, bookings, ignoreId).length) return key;
  }
  return null;
}
export function initialState() {
  const weekly = Array.from({ length: 7 }, (_, i) => ({
    enabled: i > 0 && i < 6,
    windows: [{ start: '09:00', end: '16:00' }],
  }));
  const settings = { weekly, duration: 30, buffer: 15, blocked: [] };
  const bookings = [];
  for (const [offset, name, email, program, time] of [
    [2, 'Sofia Martinez', 'sofia@example.com', 'preschool', '10:30'],
    [3, 'James Wilson', 'james@example.com', 'infant', '09:00'],
    [5, 'Isabella Garcia', 'isabella@example.com', 'toddler', '13:30'],
  ]) {
    let date = addDays(todayKey(), offset);
    while (!weekly[parseDate(date).getDay()].enabled) date = addDays(date, 1);
    bookings.push({
      id: 'sample-' + offset,
      name,
      email,
      phone: '(555) 010-2026',
      program,
      date,
      time,
      duration: 30,
      status: 'confirmed',
      language: offset === 2 ? 'es' : 'en',
      notes: '',
      sample: true,
    });
  }
  return { settings, bookings, newsletters: [] };
}

// Older demos saved a single start/end pair. Keep them readable without resetting appointments.
export function dayWindows(day) {
  return Array.isArray(day?.windows)
    ? day.windows
    : [{ start: day?.start || '09:00', end: day?.end || '16:00' }];
}
export function validTime(time) {
  return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
export function validateWindows(windows, duration) {
  if (!windows.length) return 'empty';
  for (const w of windows) {
    if (!validTime(w.start) || !validTime(w.end) || minutes(w.end) - minutes(w.start) < duration)
      return 'short';
  }
  const sorted = [...windows].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i++) if (sorted[i].start < sorted[i - 1].end) return 'overlap';
  return null;
}
