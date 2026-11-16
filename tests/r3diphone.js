// iPhone 13 émulé (paysage, tactile, DPR 3) : chargement 3D, duel, erreurs, capture
const { chromium, devices } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const d = devices['iPhone 13 landscape'] || devices['iPhone 13']; const ctx = await b.newContext({ ...d }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/TUNNEL|404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForTimeout(8000);
  await pg.evaluate(() => G.startMatch({})); await pg.waitForTimeout(25000);
  const info = await pg.evaluate(() => ({ vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio, r3: G.r3, venue: R3D.venue, mobile: R3D.mobile, rdpr: R3D.renderer.getPixelRatio(), bloom: R3D.bloom.enabled, mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null, cast: R3D.fighters.map(F => Object.keys(F.mx || {}).join()) }));
  console.log(JSON.stringify(info)); await pg.screenshot({ path: __dirname + '/out/iphone13.png', timeout: 180000 }); console.log(errs.join('\n')); await b.close(); })();
