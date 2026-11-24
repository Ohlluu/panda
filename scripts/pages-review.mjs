import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const base = 'http://localhost:5173/';
await page.goto(base);
const navigate = async (label) => {
  const toggle = page.getByRole('button', { name: /Open menu|Abrir menú/ });
  if (await toggle.isVisible()) await toggle.click();
  await page
    .getByRole('navigation', { name: /Main navigation|Navegación principal/ })
    .getByRole('link', { name: label, exact: true })
    .click();
};
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await navigate('Our story');
await page.locator('.about-page').waitFor();
assert.equal(await page.locator('.sunny-hero').count(), 0);
assert.equal(await page.locator('.staff-card').count(), 10);
assert.match(await page.locator('.founder-feature').textContent(), /2012/);
assert.equal(await page.evaluate(() => scrollY), 0);
assert.match(await page.title(), /Our story/);
assert.equal(await page.locator('#nav a[aria-current=page]').getAttribute('href'), '#/about');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(os.tmpdir(), 'panda-about-page.png'), fullPage: true });
await navigate('Programs');
await page.locator('.programs-page').waitFor();
assert.equal(await page.locator('.program-detail').count(), 3);
assert.match(await page.locator('.programs-page').textContent(), /Roy, Scott & Westdale/);
assert.equal(await page.locator('.about-page').count(), 0);
assert.equal(await page.evaluate(() => scrollY), 0);
await navigate('A day here');
await page.locator('.day-page').waitFor();
assert.equal(await page.locator('.daily-timeline article').count(), 4);
assert.equal(await page.locator('.programs-page').count(), 0);
await page.locator('footer a[href="#/faq"]').click();
await page.locator('.faq-page').waitFor();
await page.locator('.dedicated-faq-list summary').first().click();
assert((await page.locator('.dedicated-faq-list details').first().getAttribute('open')) !== null);
await page.locator('footer a[href="#/contact"]').click();
await page.locator('.contact-page').waitFor();
assert.match(await page.locator('.contact-page').textContent(), /2359 N. Mannheim/);
await navigate('Home');
await page.locator('.sunny-hero').waitFor();
assert.equal(await page.locator('#nav a[aria-current=page]').getAttribute('href'), '#/');
assert.equal(await page.evaluate(() => scrollY), 0);
await navigate('Our story');
await page.goBack();
await page.locator('.sunny-hero').waitFor();
await page.goForward();
await page.locator('.about-page').waitFor();
await page.reload();
await page.locator('.about-page').waitFor();
for (const width of [390, 768, 900, 1100, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const language of ['en', 'es']) {
    for (const route of ['#/about', '#/programs', '#/day', '#/faq', '#/contact']) {
      await page.goto(base + route);
      await page.getByRole('button', { name: language.toUpperCase(), exact: true }).click();
      await page.locator('.content-page h1').waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), language);
      assert.equal(await page.locator('.sunny-hero').count(), 0);
      assert(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
        `Overflow ${width} ${route} ${language}`,
      );
      if (width === 390 && language === 'es' && route === '#/about')
        await page.screenshot({
          path: path.join(os.tmpdir(), 'panda-about-mobile.png'),
          fullPage: true,
        });
    }
    await page.goto(base + '#/about');
    await navigate(language === 'en' ? 'Home' : 'Inicio');
    await page.locator('.sunny-hero').waitFor();
  }
}
assert.deepEqual(errors, []);
console.log(
  'PASS: explicit Home navigation, dedicated public pages, top-of-page transitions, active links, browser back/forward, direct loads, owner/staff/program content, FAQs/contact, EN/ES layouts at 390/768/900/1100/1440px.',
);
await browser.close();
