import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { initialState, addDays, todayKey, parseDate } from '../scheduling.js';
import os from 'node:os';
import path from 'node:path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// Seed the old single-range data model to exercise migration without resetting real demo data.
const legacy = initialState();
legacy.settings.weekly = legacy.settings.weekly.map((d) => ({
  enabled: d.enabled,
  start: '09:00',
  end: '16:00',
}));
delete legacy.newsletters;
await page.goto('http://localhost:5173');
await page.evaluate(
  (value) => localStorage.setItem('little-panda-demo-v1', JSON.stringify(value)),
  legacy,
);
await page.goto('http://localhost:5173/#/admin');
await page.reload();
await page.getByRole('button', { name: 'Availability', exact: true }).click();
let date = addDays(todayKey(), 14);
while (!legacy.settings.weekly[parseDate(date).getDay()].enabled) date = addDays(date, 1);
const day = parseDate(date).getDay();
await page.locator(`#start-${day}-0`).fill('10:00');
await page.locator(`#end-${day}-0`).fill('12:00');
await page.locator(`[data-add-window="${day}"]`).click();
assert.equal(await page.locator(`#start-${day}-0`).inputValue(), '10:00');
await page.locator(`#start-${day}-1`).fill('13:00');
await page.locator(`#end-${day}-1`).fill('15:00');
await page.locator('select[name=buffer]').selectOption('0');
await page.getByRole('button', { name: 'Save availability', exact: true }).click();
let data = await page.evaluate(() => JSON.parse(localStorage.getItem('little-panda-demo-v1')));
assert.equal(data.bookings.length, legacy.bookings.length);
assert.equal(data.settings.weekly[day].windows.length, 2);
await page.locator(`#start-${day}-1`).fill('11:00');
await page.getByRole('button', { name: 'Save availability', exact: true }).click();
assert.match(await page.locator('#schedule-error').textContent(), /cannot overlap/);
await page.locator(`#start-${day}-1`).fill('13:00');
await page.getByRole('button', { name: 'Save availability', exact: true }).click();
await page.goto('http://localhost:5173/#/book');
for (let i = 0; i < 3 && !(await page.locator(`[data-date="${date}"]`).count()); i++)
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
await page.locator(`[data-date="${date}"]`).click();
assert.deepEqual(
  await page.locator('[data-time]').evaluateAll((es) => es.map((e) => e.dataset.time)),
  ['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30'],
);
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Newsletters', exact: true }).click();
await page.getByRole('button', { name: 'New newsletter', exact: true }).click();
const title = 'A hello from Panda';
const body =
  'A note for our families.\n\n<script>window.newsletterExecuted=true</script>\nEveryone is welcome.';
await page.locator('#newsletter-title').fill(title);
await page.getByRole('button', { name: 'New newsletter', exact: true }).click();
await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
assert.equal(await page.locator('#newsletter-title').inputValue(), title);
await page.locator('#newsletter-summary').fill('A little classroom update.');
await page.locator('#newsletter-body').fill(body);
await page.getByRole('button', { name: 'Publish to website', exact: true }).click();
assert.match(await page.locator('#newsletter-error').textContent(), /English and Spanish/);
await page.getByRole('button', { name: 'Save draft', exact: true }).click();
await page.goto('http://localhost:5173/#/newsletters');
assert.equal(await page.locator('.newsletter-public-card').count(), 0);
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Español', exact: true }).click();
await page.locator('#newsletter-title').fill('Un saludo de Panda');
await page.locator('#newsletter-summary').fill('Noticias del salón.');
await page
  .locator('#newsletter-body')
  .fill('Una nota para nuestras familias.\n\nTodos son bienvenidos.');
await page.locator('#newsletter-cover').selectOption('learning');
await page.getByRole('button', { name: 'Preview', exact: true }).click();
await page
  .getByRole('dialog')
  .getByRole('heading', { name: 'Un saludo de Panda', exact: true })
  .waitFor();
await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
await page.getByRole('button', { name: 'Publish to website', exact: true }).click();
await page.screenshot({
  path: path.join(os.tmpdir(), 'panda-newsletters-admin.png'),
  fullPage: true,
});
await page.goto('http://localhost:5173/#/newsletters');
await page.getByRole('heading', { name: title, exact: true }).waitFor();
await page.locator('.newsletter-public-card').click();
assert((await page.locator('#main .newsletter-body').textContent()).includes('<script>'));
assert.equal(await page.evaluate(() => window.newsletterExecuted), undefined);
await page.getByRole('button', { name: 'ES', exact: true }).click();
await page.getByRole('heading', { name: 'Un saludo de Panda', exact: true }).waitFor();
await page.reload();
await page.getByRole('heading', { name: 'Un saludo de Panda', exact: true }).waitFor();
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Newsletters', exact: true }).click();
await page.locator('[data-edit-newsletter]').first().click();
await page.getByRole('button', { name: 'English', exact: true }).click();
await page.locator('#newsletter-title').fill('Unpublished revision');
await page.getByRole('button', { name: 'Save draft', exact: true }).click();
await page.goto('http://localhost:5173/#/newsletters');
await page.getByRole('heading', { name: title, exact: true }).waitFor();
assert.equal(
  await page.getByRole('heading', { name: 'Unpublished revision', exact: true }).count(),
  0,
);
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Publish changes', exact: true }).click();
await page.goto('http://localhost:5173/#/newsletters');
await page.getByRole('heading', { name: 'Unpublished revision', exact: true }).waitFor();
// Check the new editor, schedule, and public pages at phone/tablet/desktop widths in both languages.
for (const width of [390, 768, 900, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const language of ['en', 'es']) {
    await page.goto('http://localhost:5173/#/admin');
    await page.getByRole('button', { name: language.toUpperCase(), exact: true }).click();
    for (const tab of ['newsletters', 'availability']) {
      await page.locator(`[data-tab="${tab}"]:visible`).click();
      assert(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
        `Overflow ${width} ${tab} ${language}`,
      );
      if (width === 390 && language === 'es')
        await page.screenshot({
          path: path.join(os.tmpdir(), `panda-${tab}-mobile.png`),
          fullPage: true,
        });
    }
    for (const route of ['#/newsletters', '#/']) {
      await page.goto('http://localhost:5173/' + route);
      assert(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
        `Overflow ${width} ${route} ${language}`,
      );
    }
  }
}
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.getByRole('button', { name: 'Newsletters', exact: true }).click();
await page.getByRole('button', { name: 'Unpublish', exact: true }).click();
await page.getByRole('button', { name: 'Unpublish newsletter', exact: true }).click();
await page.goto('http://localhost:5173/#/newsletters');
assert.equal(await page.locator('.newsletter-public-card').count(), 0);
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Delete', exact: true }).click();
await page.getByRole('button', { name: 'Delete newsletter', exact: true }).click();
assert.equal(
  (await page.evaluate(() => JSON.parse(localStorage.getItem('little-panda-demo-v1')).newsletters))
    .length,
  0,
);
assert.deepEqual(errors, []);
console.log(
  'PASS: legacy schedule migration, split windows, lunch gap, overlap validation, bilingual newsletter drafts/preview/publishing, revision isolation, safe text rendering, persistence, unpublishing/deletion, EN/ES responsive layouts.',
);
await browser.close();
