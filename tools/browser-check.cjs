const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); return res.end();
    }
    const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png'};
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless: true, channel: 'chrome'});
  try {
  const page = await browser.newPage({ viewport: {width: 1440, height: 900} });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(base + '/') && response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  for (const file of ['index.html', 'portfolio.html', 'terms.html', 'privacy_policy.html']) {
    await page.goto(`${base}/${file}`, {waitUntil: 'networkidle'});
    await page.locator('#navbar-placeholder header').waitFor();
    await page.locator('#footer-placeholder footer').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${file}: horizontal overflow`);
    assert.equal(await page.evaluate(() => [...document.images].some(img => img.complete && img.naturalWidth === 0)), false, `${file}: broken image`);
    if (process.env.QA_DIR && file === 'index.html') {
      await page.screenshot({path: path.join(process.env.QA_DIR, 'home-desktop.png')});
    }
    if (file === 'index.html') {
      await page.locator('[onclick="goToSlide(2)"]').click();
      assert.equal(await page.locator('#carousel-inner').evaluate(el => el.style.transform), 'translateX(-200%)');
      await page.locator('[onclick="nextSlide()"]').click({force: true});
      assert.equal(await page.locator('#carousel-inner').evaluate(el => el.style.transform), 'translateX(0%)');
    }
    if (file === 'terms.html' || file === 'privacy_policy.html') {
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.locator('.back-to-top').waitFor({state: 'visible'});
      await page.locator('.back-to-top').click();
      await page.waitForFunction(() => window.scrollY === 0);
    } else {
      assert.equal(await page.locator('#ai-chat-window').isVisible(), false);
      await page.locator('#ai-chat-btn').click();
      await page.locator('[onclick="sendPredefinedQuestion(\'q5\')"]').click();
      await page.locator('#chat-messages').getByText(/topvicmo@gmail.com/).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#ai-chat-window').isVisible(), false);
    }
    await page.setViewportSize({width: 390, height: 844});
    await page.locator('#mobile-menu-btn').click();
    assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobile-menu').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${file}: mobile overflow`);
    if (file === 'index.html') {
      await page.locator('#mobile-menu-btn').click();
      await page.locator('#mobile-menu a[href="index.html#contact"]').click();
      await page.waitForFunction(() => Math.abs(document.getElementById('contact').getBoundingClientRect().top - 80) < 5);
      assert.equal(await page.locator('#mobile-menu').isVisible(), false);
      if (process.env.QA_DIR) await page.screenshot({path: path.join(process.env.QA_DIR, 'contact-mobile.png')});
    }
    if (file === 'portfolio.html') {
      await page.setViewportSize({width: 390, height: 568});
      await page.locator('#ai-chat-btn').click();
      const bounds = await page.locator('#ai-chat-window').boundingBox();
      assert(bounds.y >= 0 && bounds.y + bounds.height <= 568, 'chat outside viewport');
      if (process.env.QA_DIR) await page.screenshot({path: path.join(process.env.QA_DIR, 'chat-mobile.png')});
      await page.locator('#ai-chat-close').click();
    }
    console.log(`PASS ${file}: desktop/mobile navigation and interactions`);
    await page.setViewportSize({width: 320, height: 568});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${file}: narrow mobile overflow`);
    await page.setViewportSize({width: 1440, height: 900});
  }
  assert.deepEqual(errors, []);
  await page.goto(`${base}/index.html#services`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => Math.abs(document.getElementById('services').getBoundingClientRect().top - 80) < 5);
  console.log('PASS initial hash offset; no JavaScript errors or local HTTP failures');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error); process.exit(1);});
