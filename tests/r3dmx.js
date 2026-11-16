// personnages Mixamo : chaque héros contre un adversaire, cadrage rapproché
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const pairs = (process.argv[2] || 'vaucelles:maitre').split(','), venue = process.argv[3] || 'salle';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if ((m.type() === 'error' && !/TUNNEL|404/.test(m.text())) || m.type() === 'warning') errs.push(m.text().slice(0, 300)); });
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady && R3D.mxGl, null, { timeout: 60000 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  let i = 0;
  for (const pair of pairs) { const [h, foe] = pair.split(':');
    const setup = ([h, foe, venue, cs]) => { T.setup(235); G.venue = venue; curHero = () => HEROES[h]; G.p.look = Object.assign({}, HEROES[h].look, { name: HEROES[h].name }); G.e.look = LOOKS[foe] || Object.assign({}, HEROES[foe].look, { name: HEROES[foe].name }); G.state = 'fight'; T.stepN(40); G.cam = { s: cs, x: (G.p.x + G.e.x) / 2, y: GROUND - 115 }; G.camera = () => G.cam; G.render(1 / 60); };
    const cs = +(process.env.CAMS || 2); await pg.evaluate(setup, [h, foe, venue, cs]); await pg.waitForTimeout(6000); await pg.evaluate(setup, [h, foe, venue, cs]); await pg.evaluate(() => { for (let i = 0; i < 30; i++) G.render(1 / 30); });
    await pg.waitForFunction(v => R3D.venue === v, venue, { timeout: 60000 }); await pg.waitForTimeout(300); await pg.evaluate(() => G.render(1 / 60));
    const cast = await pg.evaluate(() => R3D.fighters.map(F => Object.keys(F.mx || {}).filter(k => F.mx[k].root.visible).join('') || 'mannequin'));
    console.log(pair, cast.join(' vs '));
    await pg.screenshot({ path: `${__dirname}/out/mx_${i++}.png`, timeout: 180000 }); }
  console.log(errs.join('\n')); await b.close();
})();
