const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  console.log(await pg.evaluate(() => {
    T.setup(285); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'heavy'; const log = [];
    for (let i = 0; i < 160; i++) { if (G.e.state === 'broken' && !(G.p.state === 'attack' && G.p.move.kind === 'jab')) G.p.intent.act = 'jab'; T.stepN(1);
      if (G.p.state === 'attack' && G.p.move.kind === 'jab' && G.p.phase() !== 'prep') { const h = G.e.hurt(); log.push(`t=${G.p.t.toFixed(3)} tip=${G.p.J.tip.map(Math.round)} wr=${G.p.J.wr.map(Math.round)} torso=${h[0][0].map(Math.round)}->${h[0][1].map(Math.round)} head=${h[1][0].map(Math.round)} ex=${Math.round(G.e.x)} px=${G.p.x.toFixed(0)} pose.a1=${G.p.pose.a1.toFixed(0)}`); if (log.length > 6) break; } }
    return log.join('\n');
  })); await b.close();
})();
