const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await (await b.newContext({ viewport: { width: 640, height: 360 } })).newPage();
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady && R3D.mxGl, null, { timeout: 60000 });
  await pg.addScriptTag({ content: fs.readFileSync('/home/claude/ct2d/tests/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => { try { T.setup(235); G.venue = 'salle'; curHero = () => HEROES.vaucelles; G.p.look = HEROES.vaucelles.look; G.state = 'fight'; try { G.render(1/60); } catch (e) {} await new Promise(z => setTimeout(z, 8000));
    const g = R3D.mxGl.p_joe; if (!g) return 'pas chargé'; const nm = []; g.scene.traverse(o => { if (o.isBone && /UpLeg|Hips/.test(o.name)) nm.push(o.name); }); const sk = []; g.scene.traverse(o => { if (o.isSkinnedMesh) sk.push(o.name + ':' + o.skeleton.bones.length + ':' + o.skeleton.bones[0].name); }); return nm.join(' ') + ' || ' + sk.join(' '); } catch (e) { return e.stack; } });
  console.log(r); await b.close(); })();
