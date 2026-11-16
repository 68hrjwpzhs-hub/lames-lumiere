const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(([bot, lvl]) => {
    const cnt = {}; const origEv = G.event.bind(G);
    G.event = (t, i) => { const who = (i.a || (i.ev && i.ev[0].a) || {}).isPlayer ? 'bot' : 'ia'; const k = t + ':' + who + (i.m ? ':' + i.m.kind : ''); cnt[k] = (cnt[k] || 0) + 1; origEv(t, i); };
    const m = T.botMatch(bot, lvl); G.event = origEv; return { m, cnt };
  }, [process.argv[2] || 'marteleur', process.argv[3] || 'maitre']);
  console.log(JSON.stringify(r, null, 0)); await b.close();
})();
