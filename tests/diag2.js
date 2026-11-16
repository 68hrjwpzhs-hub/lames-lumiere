const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(([bot, lvl]) => {
    const cnt = {}; const oh = G.hit;
    G.hit = function (a, d, at, info) { if (a.isPlayer) { const k = `${d.state}|g=${d.guarding}|plan=${G.ai.plan ? G.ai.plan.type + (G.ai.plan.wary ? 'W' : '') : '-'}|cov=${info.cov}|${d.move ? d.move.kind + ':' + d.phase() : ''}`; cnt[k] = (cnt[k] || 0) + 1; } return oh.call(this, a, d, at, info); };
    const m = T.botMatch(bot, lvl); G.hit = oh; return { m, cnt };
  }, [process.argv[2], process.argv[3]]);
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
