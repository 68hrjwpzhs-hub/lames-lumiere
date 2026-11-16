// planche d'animation 3D : un coup, image par image (temps simulés), personnages Mixamo
// usage : node r3danim.js heavy 0,.1,.18,.22,.26,.3,.34,.38,.42,.46,.6 [hero:foe] [venue] [dist]
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const kind = process.argv[2] || 'heavy', times = (process.argv[3] || '0,.12,.2,.26,.32,.38,.44,.5,.7').split(',').map(Number);
const [h, foe] = (process.argv[4] || 'vaucelles:maitre').split(':'), venue = process.argv[5] || 'salle', dist = +(process.argv[6] || 300);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 960, height: 540 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady && R3D.mxGl, null, { timeout: 60000 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const setup = ([h, foe, venue, dist]) => { T.setup(dist); G.venue = venue; curHero = () => HEROES[h]; G.p.look = Object.assign({}, HEROES[h].look, { name: HEROES[h].name }); G.e.look = LOOKS[foe] || Object.assign({}, HEROES[foe].look, { name: HEROES[foe].name }); G.state = 'fight'; T.stepN(40); G.cam = { s: 1.5, x: G.p.x + 90, y: GROUND - 120 }; G.camera = () => G.cam; G.render(1 / 60); };
  await pg.evaluate(setup, [h, foe, venue, dist]); await pg.waitForTimeout(6000); await pg.evaluate(setup, [h, foe, venue, dist]);
  await pg.waitForFunction(v => R3D.venue === v, venue, { timeout: 60000 }); for (let i = 0; i < 5; i++) await pg.evaluate(() => G.render(1 / 30));
  await pg.evaluate(([d, tw]) => { window.__dist = d; if (tw !== '') window.__tw = +tw; }, [dist, process.env.TW || '']); await pg.evaluate(k => { G.frame = () => {}; T.setup(); G.state = 'fight'; G.e.intent.guard = false; T.ai0 = G.e.update; if (k === 'pending') { G.p.intent.holdAtk = true; G.p.startPending('jab'); } else if (k === 'parried' || k === 'broken' || k === 'hit') { G.p.setState(k, k === 'broken' ? .78 : k === 'hit' ? .5 : .8); } else if (k === 'dashF' || k === 'dashB') G.p.startDash(k === 'dashF' ? 1 : -1); else if (k === 'feint') G.p.feint(); else G.p.startMove(k); window.__t = 0; window.__log = []; const u0 = G.p.setState.bind(G.p); G.p.setState = (s, d) => { window.__log.push(s + '@' + window.__t.toFixed(3) + ' ' + (G.p.move && G.p.move.kind)); u0(s, d); }; }, kind);
  let i = 0;
  for (const t of times) {
    const info = await pg.evaluate(t => { while (window.__t < t - 1e-6) { G.hitStop = 0; G.slowT = 0; G.p.intent.holdAtk = true; G.step(1 / 120); window.__t += 1 / 120; } G.cam.x = G.p.x + 90; if (window.__tw !== undefined) G.p.pose.tw = window.__tw; G.render(1 / 60); const p = G.p.pose; return { st: G.p.state, a3: Math.round(p.a3), bz: Math.round(p.bz), t: +window.__t.toFixed(3) }; }, t);
    await pg.waitForTimeout(150); await pg.evaluate(() => { if (window.__tw !== undefined) G.p.pose.tw = window.__tw; G.render(1 / 60); });
    await pg.screenshot({ path: `${__dirname}/out/anim_${String(i++).padStart(2, '0')}.png` }); console.log(JSON.stringify(info));
  }
  console.log(await pg.evaluate(() => window.__log.join(' | ') + ' ev:' + T.types().join(','))); console.log(errs.join('\n')); await b.close();
})();
