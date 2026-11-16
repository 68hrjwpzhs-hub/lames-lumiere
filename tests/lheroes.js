// Édition Lumière 3.0 : les huit héros côte à côte, en silhouette et en couleur → tests/out/heros_*.png
const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open({ viewport: { width: 1600, height: 900 }, ui5: true });
  const shot = async (sil) => { const url = await pg.evaluate(sil => {
    const ids = HERO_IDS, cw = 190, c = document.createElement('canvas'); c.width = cw * ids.length; c.height = 330; const g = c.getContext('2d'); g.fillStyle = sil ? '#e8e0d0' : '#5a4a3a'; g.fillRect(0, 0, c.width, c.height);
    ids.forEach((id, i) => { const H = HEROES[id], f = new Fighter(true, Object.assign({ blade: H.rapier.blade }, H.look, { name: H.name })); f.rapier = H.rapier; f.opp = { x: 99999, state: 'idle', move: null, dist: () => 999 }; f.x = 0; f.dir = 1; f.state = 'idle'; f.t = 0; f.gline = 'ext';
      for (let k = 0; k < 40; k++) { f.pose = f.animate(1 / 60); f.updateFeet(1 / 60); } f.J = f.joints();
      const t = document.createElement('canvas'); t.width = cw; t.height = 330; const q = t.getContext('2d'); q.translate(cw * .42, 320 - GROUND); FigPlus.cur = null; drawFighter(q, f, { bare: true });
      if (sil) { q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#1a1210'; q.fillRect(0, 0, cw, 330); }
      g.drawImage(t, i * cw, 0); g.fillStyle = sil ? '#3a2a1a' : '#efe3c6'; g.font = '14px Georgia'; g.fillText(H.name.split(' ')[0], i * cw + 8, 18); });
    return c.toDataURL(); }, sil); require('fs').writeFileSync(`out/heros_${sil ? 'silhouettes' : 'couleurs'}.png`, Buffer.from(url.split(',')[1], 'base64')); };
  await shot(true); await shot(false);
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
