import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
const output = (name) => path.join(os.tmpdir(), name);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: output('panda-desktop.png'), fullPage: true });
await page.getByRole('button', { name: 'ES', exact: true }).click();
assert.equal(await page.locator('html').getAttribute('lang'), 'es');
await page.getByRole('heading', { name: /Días llenos/ }).waitFor();
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.goto('http://localhost:5173/#/book');
await page.locator('[data-time]').first().click();
const time = await page.locator('[data-time].selected').getAttribute('data-time');
const date = await page.locator('[data-date].selected').getAttribute('data-date');
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.getByLabel('Parent / guardian name').fill('Demo Family');
await page.getByLabel('Email address').fill('demo@example.com');
await page.getByLabel('Phone number').fill('555-123-4567');
await page.getByRole('checkbox').check();
await page.getByRole('button', { name: 'Confirm my visit' }).click();
await page.getByRole('heading', { name: /See you soon/ }).waitFor();
await page.screenshot({ path: output('panda-confirmation.png'), fullPage: true });
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Add to calendar' }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), 'little-panda-visit.ics');
await page.goto('http://localhost:5173/#/admin');
await page.getByRole('heading', { name: 'Demo Family', exact: true }).waitFor();
await page.evaluate(() => scrollTo(0, 0));
await page.screenshot({ path: output('panda-admin.png'), fullPage: true });
await page.reload();
await page.getByRole('heading', { name: 'Demo Family', exact: true }).waitFor();
await page.getByRole('searchbox', { name: 'Search bookings' }).fill('Demo Family');
assert.equal(await page.locator('.booking-row').count(), 1);
await page.getByRole('searchbox', { name: 'Search bookings' }).fill('');
const bookings = await page.evaluate(
  () => JSON.parse(localStorage.getItem('little-panda-demo-v1')).bookings,
);
const id = bookings.find((b) => b.name === 'Demo Family').id;
await page.locator(`[data-manage="${id}"]`).click();
await page.getByRole('button', { name: 'Reschedule', exact: true }).click();
await page.locator('#reschedule-time').selectOption({ index: 1 });
await page.getByRole('button', { name: 'Save new time' }).click();
await page.locator(`[data-manage="${id}"]`).click();
await page.getByRole('button', { name: 'Cancel visit', exact: true }).click();
await page.getByRole('button', { name: 'Yes, cancel visit' }).click();
assert.equal(await page.locator(`[data-manage="${id}"]`).count(), 0);
await page.getByRole('button', { name: 'Availability', exact: true }).click();
await page.locator('select[name="duration"]').selectOption('45');
await page.getByRole('button', { name: 'Save availability' }).click();
assert.equal(await page.locator('select[name="duration"]').inputValue(), '45');
await page.locator('#block-form input').fill(date);
await page.getByRole('button', { name: 'Block this date' }).click();
assert.equal(await page.locator(`[data-unblock="${date}"]`).count(), 1);
await page.goto('http://localhost:5173/#/book');
assert(await page.locator(`[data-date="${date}"]`).isDisabled());
await page.getByRole('button', { name: 'ES', exact: true }).click();
await page.getByRole('heading', { name: 'Un buen día para decir hola.' }).waitFor();
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['#/', '#/book', '#/admin']) {
    await page.goto('http://localhost:5173/' + route);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(100);
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `Overflow ${width} ${route}`,
    );
    if (width === 390) {
      if (route === '#/') {
        await page.getByRole('button', { name: 'Abrir menú' }).click();
        await page.getByRole('button', { name: 'Cerrar menú' }).click();
      }
      await page.screenshot({
        path: output(`panda-mobile-${route.replace(/[^a-z]/g, '') || 'home'}.png`),
        fullPage: true,
      });
    }
  }
}
assert.deepEqual(errors, []);
console.log(
  'PASS: EN/ES, booking, persistence, calendar download, admin reschedule/cancel, availability, blocked dates, mobile menu, responsive overflow at 390/768/1440px, and browser errors.',
);
await browser.close();
