const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const url = process.env.LAB_TEST_URL || 'http://localhost:8088/';
(async () => {
  const report = [];
  const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page = await context.newPage();
    const failures = []; const requests = [];
    page.on('pageerror',e=>failures.push(e.message));page.on('request',r=>requests.push(r.url()));
    await page.goto(url);
    await page.waitForFunction(()=>document.documentElement.dataset.robotScene==='ready');
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    report.push('Mobile layout and reduced-motion default');
    await page.getByRole('button',{name:'학습',exact:true}).click();
    assert.equal(await page.locator('#system-label').textContent(),'VLA / POLICY');
    await page.locator('[data-project="perception"]').click();
    assert.equal(await page.locator('#project-link').getAttribute('href'),'https://github.com/kanghyunmin-bot/UUV-VINS-SLAM');
    await page.locator('.preview-app[data-app="1"]').click();
    assert.equal(await page.locator('.preview-app[data-app="1"]').getAttribute('aria-pressed'),'true');
    report.push('Mode selection, research destination and app selection');
    assert.deepEqual(failures,[]);
    const external=requests.filter(u=>!u.startsWith(new URL(url).origin)&&!u.startsWith('data:')&&!u.startsWith('blob:'+new URL(url).origin));
    assert.deepEqual(external,[]);
    report.push('No page errors or third-party runtime requests');
    await context.close();
  } finally { await browser.close(); }
  const fallbackBrowser = await chromium.launch({channel:'chrome',headless:true,args:['--disable-webgl']});
  try {
    const page = await fallbackBrowser.newPage({viewport:{width:1280,height:800}});
    await page.goto(url);
    await page.waitForFunction(()=>document.documentElement.dataset.robotScene==='fallback');
    assert.equal(await page.locator('.scene-fallback').isVisible(),true);
    await page.locator('[data-project="learning"]').click();
    assert.match(await page.locator('#project-link').getAttribute('href'),/tools\/vla_gui$/);
    await page.getByRole('button',{name:'학습',exact:true}).click();
    assert.equal(await page.locator('#system-label').textContent(),'VLA / POLICY');
    assert.equal(await page.locator('.preview-app').first().isDisabled(),true);
    report.push('WebGL-disabled poster and usable content controls');
  } finally { await fallbackBrowser.close(); }
  console.log(JSON.stringify({status:'passed',checks:report},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
