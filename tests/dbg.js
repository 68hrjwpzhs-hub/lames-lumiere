const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  console.log(await pg.evaluate(() => {
    T.setup(285); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'heavy'; const log = [];
    for (let i = 0; i < 200; i++) { if (G.e.state === 'broken' && !(G.p.state === 'attack' && G.p.move.kind === 'jab')) G.p.intent.act = 'jab'; T.stepN(1); if (i % 6 === 0) log.push(`${i} d=${(G.e.x - G.p.x).toFixed(0)} p=${G.p.state}${G.p.move ? ':' + G.p.move.kind + ':' + G.p.phase() : ''} e=${G.e.state}`); }
    return log.join('\n') + '\n' + T.types().join(',') + ' reach jab ' + REACH.jab;
  })); await b.close();
})();
