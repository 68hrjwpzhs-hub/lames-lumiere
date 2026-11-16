// gros plan de face et de profil sur la tête du joueur (caméra de débogage)
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const heroes = (process.argv[2] || 'vaucelles').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady && R3D.mxAvail && Object.keys(R3D.mxAvail).length, null, { timeout: 60000 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const shots = [];
  for (const h of heroes) for (const view of ['front', 'side', 'body']) {
    await pg.evaluate(([h, view]) => { T.setup(235); G.venue = 'salle'; G.p.look = Object.assign({}, HEROES[h].look, { name: h }); G.state = 'fight'; T.stepN(40);
      window.R3D_DEBUGCAM = (cam, R) => { const F = R.fighters[0], P = F.bodies && F.bodies[HEROES[h].look.body === 'f' ? 'f' : 'h']; if (!P) return; const hp = P.B.Head.getWorldPosition(new cam.position.constructor()); hp.y += .1;
        if (view === 'body') { hp.y -= .75; cam.position.set(hp.x + 1.2, hp.y + .3, hp.z + 3.2); cam.fov = 30; } else cam.position.set(hp.x + (view === 'front' ? .9 : 0), hp.y + .05, hp.z + (view === 'front' ? 0.1 : .9)); cam.clearViewOffset(); cam.fov = view === 'body' ? 32 : 30; cam.updateProjectionMatrix(); cam.lookAt(hp); };
      G.render(1 / 60); }, [h, view]);
    await pg.waitForFunction(() => R3D.venue === 'salle', null, { timeout: 60000 }); await pg.waitForTimeout(200); await pg.evaluate(() => G.render(1 / 60));
    const f = `${__dirname}/out/face_${h}_${view}.png`; await pg.screenshot({ path: f }); shots.push(f); }
  console.log(errs.join('\n')); await b.close();
})();
