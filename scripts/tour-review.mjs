import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173/#/tour');
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('little-panda-demo-v1')) || null;
  if (s) return;
});
// Preserve older room edits while adding the new walkthrough collection.
await page.evaluate(() => {
  const s = {
    settings: {
      weekly: Array.from({ length: 7 }, (_, i) => ({
        enabled: i > 0 && i < 6,
        start: '09:00',
        end: '16:00',
      })),
      duration: 30,
      buffer: 15,
      blocked: [],
    },
    bookings: [],
    newsletters: [],
    tourRooms: [
      { id: 'legacy', title: { en: 'Keep my original room edits', es: 'Conservar mis cambios' } },
    ],
  };
  localStorage.setItem('little-panda-demo-v1', JSON.stringify(s));
});
await page.reload();
const stage = () => page.locator('.walk-stage');
const go = async (id) => {
  await page.locator(`.walk-stage [data-walk-to="${id}"]`).click();
  assert.equal(await stage().getAttribute('data-scene'), id);
  await page.waitForFunction(
    () =>
      document.querySelector('.walk-scene-image')?.complete &&
      document.querySelector('.walk-scene-image')?.naturalWidth > 0,
  );
};
assert.equal(await stage().getAttribute('data-scene'), 'entrance');
assert.equal(await page.locator('.tour-thumbnails').count(), 0);
assert(await page.locator('#walk-back').isDisabled());
await page.locator('.walk-stage [data-walk-to=reception]').focus();
await page.keyboard.press('Enter');
assert.equal(await stage().getAttribute('data-scene'), 'reception');
await go('hallway');
assert.deepEqual(
  await page
    .locator('.walk-stage [data-walk-to]')
    .evaluateAll((es) => es.map((e) => e.dataset.walkTo)),
  ['classroom', 'playroom', 'garden'],
);
await page.evaluate(() => scrollTo(0, 0));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: path.join(os.tmpdir(), 'panda-connected-hallway.png'),
  fullPage: true,
});
await go('classroom');
await go('hallway');
assert.equal(await page.locator('.walk-breadcrumbs button').count(), 3);
await go('playroom');
await go('hallway');
await go('garden');
await go('hallway');
await page.locator('.walk-stage').press('Alt+ArrowLeft');
assert.equal(await stage().getAttribute('data-scene'), 'reception');
await page.locator('.walk-turn-back').click();
assert.equal(await stage().getAttribute('data-scene'), 'entrance');
await page.getByRole('button', { name: 'ES', exact: true }).click();
await page.getByRole('heading', { name: 'Entrada', exact: true }).waitFor();
await page.locator('.walk-stage [data-walk-to=reception]').click();
await page.getByRole('heading', { name: 'Recepción', exact: true }).waitFor();
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.locator('#tour-enlarge').click();
await page.getByRole('dialog').getByRole('heading', { name: 'Reception', exact: true }).waitFor();
await page.keyboard.press('Escape');
await page.locator('#walk-restart').click();
assert.equal(await stage().getAttribute('data-scene'), 'entrance');
assert.match(await page.locator('.walk-progress').textContent(), /^1 \/ 6/);
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Virtual tour', exact: true }).click();
await page.locator('[data-tour-edit=hallway]').click();
assert.equal(await page.locator('[data-point-kind]').count(), 3);
assert.equal(await page.locator('[data-point-target]').first().inputValue(), 'classroom');
await page
  .locator('#tour-photo-upload')
  .setInputFiles({ name: 'test.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
assert.match(await page.locator('#tour-error').textContent(), /JPG/);
await page
  .locator('#tour-photo-upload')
  .setInputFiles(path.resolve('assets/walkthrough/hallway.jpg'));
await page.locator('#tour-photo-choice option[value=custom]').waitFor({ state: 'attached' });
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
const data = await page.evaluate(() => JSON.parse(localStorage.getItem('little-panda-demo-v1')));
assert.equal(data.tourRooms[0].title.en, 'Keep my original room edits');
assert(data.walkthroughRooms.find((r) => r.id === 'hallway').image.startsWith('data:image/jpeg'));
await page.getByRole('button', { name: 'Add a space', exact: true }).click();
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
assert.match(await page.locator('#tour-error').textContent(), /both languages/);
await page.locator('#tour-room-title').fill('A new view');
await page.locator('#tour-room-description').fill('A connected room.');
await page.locator('#tour-add-point').click();
await page.locator('[data-point-target]').selectOption('hallway');
await page.locator('[data-point-label]').fill('Return to hallway');
await page.getByRole('button', { name: 'Español', exact: true }).click();
await page.locator('#tour-room-title').fill('Una nueva vista');
await page.locator('#tour-room-description').fill('Un salón conectado.');
await page.locator('[data-point-label]').fill('Volver al pasillo');
await page.locator('#tour-admin-photo').click({ position: { x: 100, y: 100 } });
await page.locator('#tour-admin-photo').press('ArrowRight');
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
const newId = await page.evaluate(
  () =>
    JSON.parse(localStorage.getItem('little-panda-demo-v1')).walkthroughRooms.find(
      (r) => r.title.en === 'A new view',
    ).id,
);
await page.locator('[data-tour-edit=hallway]').click();
await page.locator('#tour-add-point').click();
const field = page.locator('[data-point-editor]').last();
await field.locator('[data-point-target]').selectOption(newId);
await field.locator('[data-point-label]').fill('Explore the new view');
await page.getByRole('button', { name: 'Español', exact: true }).click();
await page
  .locator('[data-point-editor]')
  .last()
  .locator('[data-point-label]')
  .fill('Explorar la nueva vista');
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
await page.goto('http://localhost:5173/#/tour');
await go('reception');
await go('hallway');
await go(newId);
await go('hallway');
// Hidden destinations must disappear from the doorway controls without breaking existing history.
await page.goto('http://localhost:5173/#/admin');
await page.locator(`[data-tour-edit="${newId}"]`).click();
await page.locator('input[name=visible]').uncheck();
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
await page.goto('http://localhost:5173/#/tour');
assert.equal(await page.locator(`.walk-stage [data-walk-to="${newId}"]`).count(), 0);
for (const width of [390, 768, 900, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const language of ['en', 'es']) {
    await page.goto('http://localhost:5173/#/tour');
    await page.getByRole('button', { name: language.toUpperCase(), exact: true }).click();
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `Walkthrough overflow ${width} ${language}`,
    );
    const fit = await page
      .locator('.walk-scene-image')
      .evaluate((e) => getComputedStyle(e).objectFit);
    assert.equal(fit, 'contain');
    if (width === 390 && language === 'es')
      await page.screenshot({
        path: path.join(os.tmpdir(), 'panda-connected-mobile.png'),
        fullPage: true,
      });
    await page.goto('http://localhost:5173/#/admin');
    await page.locator('[data-tab=tour]:visible').click();
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `Admin overflow ${width} ${language}`,
    );
  }
}
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.locator(`[data-tour-delete="${newId}"]`).click();
await page.getByRole('button', { name: 'Delete space', exact: true }).click();
assert(
  !(await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem('little-panda-demo-v1')).walkthroughRooms.some((r) =>
        r.points.some((p) => p.target === id),
      ),
    newId,
  )),
);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('little-panda-demo-v1'));
  s.walkthroughRooms.forEach((r) => (r.visible = false));
  localStorage.setItem('little-panda-demo-v1', JSON.stringify(s));
});
await page.goto('http://localhost:5173/#/tour');
await page.reload();
await page
  .getByRole('heading', { name: 'A little look around, coming soon.', exact: true })
  .waitFor();
assert.deepEqual(errors, []);
console.log(
  'PASS: connected door graph, branching and return routes, breadcrumbs, keyboard navigation, EN/ES, image alignment, photo upload, bilingual destination editing, new connected views, hiding/deleting destinations, legacy edit preservation, empty state, and mobile/tablet/desktop layouts.',
);
await browser.close();
