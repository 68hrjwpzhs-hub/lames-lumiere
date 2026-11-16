// captures du rendu 3D (serveur local http://127.0.0.1:8765/test3d.html)
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const pre = process.argv[2] || 'r3d', venues = (process.argv[3] || 'salle,eglise,nuit,loggia,cloitre').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D || (window.__r3dfail), null, { timeout: 30000 }).catch(() => errs.push('R3D absent'));
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const v of venues) {
    await pg.evaluate(v => { T.setup(235); G.venue = v; G.e.look = LOOKS.maitre; G.p.look = LOOKS.player; G.state = 'fight'; G.render(1 / 60); }, v);
    await pg.waitForFunction(v => R3D.venue === v, v, { timeout: 60000 }).catch(() => errs.push('timeout ' + v));
    await pg.waitForFunction(() => R3D.bodiesReady, null, { timeout: 60000 }).catch(() => errs.push('corps absents')); await pg.waitForTimeout(500);
    await pg.evaluate(() => { T.stepN(30); G.e.intent.guard = true; T.stepN(20); G.p.intent.act = 'jab'; T.stepN(Math.round(.2 * 120)); G.render(1 / 60); });
    await pg.screenshot({ path: `${__dirname}/out/${pre}_${v}.png` });
  }
  const perf = await pg.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 20; i++) { T.stepN(1); G.render(1 / 60); } return Math.round((performance.now() - t0) / 20); });
  console.log('ms/image (swiftshader, CPU)', perf); console.log(errs.join('\n')); await b.close();
})();
