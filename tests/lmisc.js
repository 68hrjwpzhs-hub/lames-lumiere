// Édition Lumière : écrans divers (accueil, prologue, scène d'histoire, finale) → tests/out/lm_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const shot = async (n, w = 900) => { await pg.waitForTimeout(w); await pg.screenshot({ path: `out/lm_${n}.png` }); };
  await pg.evaluate(() => { store.set('ct2d.joute', false); }); await shot('1_accueil', 1500);
  await pg.evaluate(() => UI5.cont()); await shot('2_prologue', 1800);
  await pg.evaluate(() => { Prologue7.phase = null; $('scene').hidden = true; store.set('ct2d.prologue7', 1); store.set('ct2d.initDone', 1); G.toMenu(); Story.data().done.ch01 = { stars: 1 }; Story.play(0); }); await shot('3_scene', 2500);
  await pg.evaluate(() => { let k = 0; while (G.state === 'scene' && k++ < 40) { const c = document.querySelector('#sceneChoices button'); if (c) c.click(); else Story.next(); } }); await shot('4_story_fight', 4500);
  await pg.evaluate(() => { G.e.hp = 1; G.p.x = G.e.x - 150; G.hit && 0; G.endRound(G.p, 'Touche'); }); await shot('5_ko', 900); await shot('6_ko2', 1500);
  await pg.evaluate(() => { G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'auberge' }); }); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { $('pause') && G.pause && G.pause(); }); await shot('7_pause', 500);
  console.log(await pg.evaluate(() => ({ on: Lumen.on, cost: Lumen.cost })), errs.length ? errs : 'ok'); await b.close();
})();
