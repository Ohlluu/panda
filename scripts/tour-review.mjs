import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173/#/tour');
await page.evaluate(() => document.fonts.ready);
assert.equal(await page.locator('.tour-thumbnails>button').count(), 6);
assert(await page.locator('#tour-prev').isDisabled());
await page.locator('[data-tour-point]').first().click();
assert(await page.locator('.tour-point-detail h3').isVisible());
await page.locator('#tour-close-point').click();
assert.equal(await page.locator('.tour-point-detail h3').count(), 0);
await page.locator('#tour-next').click();
await page.getByRole('heading', { name: 'The infant nook', exact: true }).waitFor();
await page.locator('.tour-photo-stage').press('ArrowRight');
await page.getByRole('heading', { name: 'The toddler room', exact: true }).waitFor();
await page.locator('.tour-photo-stage').press('ArrowLeft');
await page.getByRole('heading', { name: 'The infant nook', exact: true }).waitFor();
await page.getByRole('button', { name: 'ES', exact: true }).click();
await page.getByRole('heading', { name: 'El rincón de bebés', exact: true }).waitFor();
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.locator('#tour-enlarge').click();
await page
  .getByRole('dialog')
  .getByRole('heading', { name: 'The infant nook', exact: true })
  .waitFor();
await page.keyboard.press('Escape');
assert(!(await page.getByRole('dialog').isVisible()));
await page.locator('.tour-thumbnails>button').last().click();
assert(await page.locator('#tour-next').isDisabled());
await page.locator('.tour-thumbnails>button').first().click();
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(os.tmpdir(), 'panda-tour-desktop.png'), fullPage: true });
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'Virtual tour', exact: true }).click();
await page.locator('[data-tour-edit="preschool"]').click();
await page.locator('#tour-room-title').fill('Preschool & play <fun>');
await page.locator('#tour-room-description').fill('Stories and friends.');
await page.getByRole('button', { name: 'Español', exact: true }).click();
await page.locator('#tour-room-title').fill('Preescolar y juego');
await page.locator('#tour-room-description').fill('Cuentos y amigos.');
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
await page.locator('[data-tour-move="preschool:1"]').click();
await page.goto('http://localhost:5173/#/tour');
assert.equal(
  await page.locator('.tour-room-nav [data-tour-room]').first().getAttribute('data-tour-room'),
  'infants',
);
await page.locator('.tour-room-nav [data-tour-room="preschool"]').click();
await page.getByRole('heading', { name: 'Preschool & play <fun>', exact: true }).waitFor();
await page.goto('http://localhost:5173/#/admin');
await page.locator('#tour-room-form input[name=visible]').uncheck();
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
await page.goto('http://localhost:5173/#/tour');
assert.equal(await page.locator('.tour-thumbnails>button').count(), 5);
await page.goto('http://localhost:5173/#/admin');
await page.locator('#tour-room-form input[name=visible]').check();
await page
  .locator('#tour-photo-upload')
  .setInputFiles({ name: 'test.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
assert.match(await page.locator('#tour-error').textContent(), /JPG/);
await page.locator('#tour-photo-upload').setInputFiles(path.resolve('assets/learning.jpg'));
await page.locator('#tour-photo-choice option[value=custom]').waitFor({ state: 'attached' });
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
await page.reload();
await page.getByRole('button', { name: 'Virtual tour', exact: true }).click();
await page.locator('[data-tour-edit="preschool"]').click();
assert.equal(await page.locator('#tour-photo-choice').inputValue(), 'custom');
await page.getByRole('button', { name: 'Add a space', exact: true }).click();
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
assert.match(await page.locator('#tour-error').textContent(), /English and Spanish/);
await page.locator('#tour-room-title').fill('A new demo space');
await page.locator('#tour-room-description').fill('A new room to explore.');
await page.locator('#tour-add-point').click();
await page.locator('[data-point-label]').fill('A little discovery');
await page.locator('[data-point-body]').fill('A new detail.');
await page.getByRole('button', { name: 'Español', exact: true }).click();
await page.locator('#tour-room-title').fill('Un nuevo espacio');
await page.locator('#tour-room-description').fill('Un salón para explorar.');
await page.locator('[data-point-label]').fill('Un descubrimiento');
await page.locator('[data-point-body]').fill('Un nuevo detalle.');
const imageBox = await page.locator('#tour-admin-photo').boundingBox();
await page
  .locator('#tour-admin-photo')
  .click({ position: { x: imageBox.width * 0.7, y: imageBox.height * 0.3 } });
await page.locator('#tour-admin-photo').press('ArrowRight');
await page.getByRole('button', { name: 'Save tour changes', exact: true }).click();
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('little-panda-demo-v1')));
const newRoom = saved.tourRooms.find((r) => r.title.en === 'A new demo space');
assert.equal(newRoom.points[0].x, 75);
assert.equal(newRoom.points[0].y, 30);
await page.goto('http://localhost:5173/#/tour');
assert.equal(await page.locator('.tour-thumbnails>button').count(), 7);
await page.locator(`.tour-room-nav [data-tour-room="${newRoom.id}"]`).click();
await page.locator('[data-tour-point]').click();
await page.getByRole('heading', { name: 'A little discovery', exact: true }).waitFor();
for (const width of [390, 768, 900, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const language of ['en', 'es']) {
    await page.goto('http://localhost:5173/#/tour');
    await page.getByRole('button', { name: language.toUpperCase(), exact: true }).click();
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `Tour overflow ${width} ${language}`,
    );
    if (width === 390 && language === 'es')
      await page.screenshot({
        path: path.join(os.tmpdir(), 'panda-tour-mobile.png'),
        fullPage: true,
      });
    await page.goto('http://localhost:5173/#/admin');
    await page.locator('[data-tab=tour]:visible').click();
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `Admin overflow ${width} ${language}`,
    );
    if (width === 390 && language === 'es')
      await page.screenshot({
        path: path.join(os.tmpdir(), 'panda-tour-admin-mobile.png'),
        fullPage: true,
      });
  }
}
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.locator(`[data-tour-delete="${newRoom.id}"]`).click();
await page.getByRole('button', { name: 'Delete space', exact: true }).click();
assert.equal(await page.locator(`[data-tour-edit="${newRoom.id}"]`).count(), 0);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('little-panda-demo-v1'));
  s.tourRooms.forEach((r) => (r.visible = false));
  localStorage.setItem('little-panda-demo-v1', JSON.stringify(s));
});
await page.goto('http://localhost:5173/#/tour');
await page.reload();
await page
  .getByRole('heading', { name: 'A little look around, coming soon.', exact: true })
  .waitFor();
assert.deepEqual(errors, []);
console.log(
  'PASS: tour navigation, marker details, keyboard navigation, enlarged photos, bilingual editing, reorder/hide, photo upload validation/persistence, room and marker creation/deletion/positioning, empty state, EN/ES layouts at 390/768/900/1440px.',
);
await browser.close();
