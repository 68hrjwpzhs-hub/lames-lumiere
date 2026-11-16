// gros plan des corps 3D : le zoom de fin de manche cadre les duellistes
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const pre = process.argv[2] || 'close', looks = (process.argv[3] || 'player:maitre').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/TUNNEL|404/.test(m.text()) || m.type() === 'warning') errs.push(m.text().slice(0, 300)); });
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady, null, { timeout: 60000 }).catch(() => errs.push('corps absents'));
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  let i = 0; if (process.env.ZOOM) await pg.evaluate(() => window.CAMZ = 1);
  for (const pair of looks) { const [a, c] = pair.split(':');
    await pg.evaluate(([a, c]) => { T.setup(235); G.venue = 'salle'; const mk = k => k === 'player' ? LOOKS.player : k === 'drac' ? Object.assign({}, LOOKS.maitre, { race: 'drac', skin: '#4f7a62', hairStyle: 'chauve', beard: 'none', hatType: 'aucun', plume: null, coat: '#1e3a2e', coat2: '#10241c', hose: '#10241c', boot: '#0e1612', trim: '#7ad0a0', cape: '#0e1a14', name: 'Drac' }) : LOOKS[k] || Object.assign({}, HEROES[k].look, { name: HEROES[k].name }); G.p.look = mk(a); G.e.look = mk(c); G.state = 'fight'; T.stepN(40); G.cam = window.CAMZ ? { s: 6, x: G.p.J.head[0] + 10, y: G.p.J.head[1] + 10 } : { s: 2.2, x: (G.p.x + G.e.x) / 2, y: GROUND - 120 }; G.camera = () => G.cam; G.render(1 / 60); }, [a, c]);
    await pg.waitForFunction(() => R3D.venue === 'salle', null, { timeout: 60000 }); await pg.waitForTimeout(300); await pg.evaluate(() => G.render(1 / 60));
    await pg.screenshot({ path: `${__dirname}/out/${pre}_${i++}.png` }); }
  console.log(errs.join('\n')); await b.close();
})();
