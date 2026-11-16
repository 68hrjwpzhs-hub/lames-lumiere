// Édition Lumière : gros plans des personnages dans le jeu (moteur allumé) → tests/out/bench_*.png ; node tests/lbench.js [héros…] [--venue=salle] [--off]
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const args = process.argv.slice(2), heroes = args.filter(a => !a.startsWith('--')), venue = (args.find(a => a.startsWith('--venue=')) || '=salle').split('=')[1], off = args.includes('--off');
  const { b, pg, errs } = await open({ viewport: { width: 1280, height: 720 }, ui5: true });
  await pg.evaluate(off => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); if (off) Lumen.set(false); }, off);
  for (const h of heroes.length ? heroes : ['vaucelles']) {
    await pg.evaluate(([h, venue]) => { G.toMenu(); Save.data.hero = h; applyAvatar(); G.silent = false; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue });
      window.__who = 'p'; if (!G.camera0) { G.camera0 = G.camera; G.camera = function (rdt) { this.camera0(rdt); const f = window.__who === 'p' ? this.p : this.e, c = this.cam; c.s = 2.5; c.x = clamp(f.x + f.dir * 30, W / 5, W - W / 5); c.y = GROUND - 100; return c; }; } }, [h, venue]);
    await pg.waitForTimeout(2300); await pg.screenshot({ path: `out/bench_${h}_1.png` });
    await pg.waitForTimeout(2600); await pg.screenshot({ path: `out/bench_${h}_2.png` });
    await pg.evaluate(() => { window.__who = 'e'; }); await pg.waitForTimeout(700); await pg.screenshot({ path: `out/bench_${h}_3.png` });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
