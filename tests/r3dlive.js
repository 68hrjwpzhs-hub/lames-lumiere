const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/TUNNEL|404/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForTimeout(15000);
  await pg.screenshot({ path: __dirname + '/out/r3d_menu.png' });
  console.log(await pg.evaluate(() => ({ r3: G.r3, venue: R3D.venue, state: G.state, body: document.body.className })));
  await pg.evaluate(() => { G.startMatch({}); }).catch(e => errs.push(String(e)));
  await pg.waitForTimeout(12000); await pg.screenshot({ path: __dirname + '/out/r3d_live.png' });
  console.log(await pg.evaluate(() => ({ r3: G.r3, venue: R3D.venue, state: G.state })));
  console.log(errs.join('\n')); await b.close();
})();
