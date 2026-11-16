// =============================== 7.0 · sprint 60 : quatre nouveaux lieux ===============================
// La Grande Galerie du Louvre (le tournoi du roi), les cachots du Châtelet, le Pré-aux-Clercs à l'aube, les toits de Notre-Dame sous l'orage.

const GAL_PORTRAIT = (q, x, y, w, h) => { q.fillStyle = '#2a2018'; q.fillRect(x, y, w, h); q.fillStyle = '#1a1410'; q.beginPath(); q.ellipse(x + w / 2, y + h * .78, w * .38, h * .3, 0, 0, 7); q.fill(); q.fillStyle = '#d8b090'; q.beginPath(); q.ellipse(x + w / 2, y + h * .38, w * .14, h * .15, 0, 0, 7); q.fill(); q.fillStyle = '#e8e0d0'; q.fillRect(x + w * .36, y + h * .52, w * .28, h * .06); };
const GAL_PAYSAGE = (q, x, y, w, h) => { const sk = q.createLinearGradient(0, y, 0, y + h); sk.addColorStop(0, '#8aa0b8'); sk.addColorStop(.6, '#d8c8a0'); sk.addColorStop(1, '#4a5a30'); q.fillStyle = sk; q.fillRect(x, y, w, h); q.fillStyle = '#3a4a28'; q.beginPath(); q.moveTo(x, y + h * .7); q.quadraticCurveTo(x + w * .4, y + h * .5, x + w, y + h * .68); q.lineTo(x + w, y + h); q.lineTo(x, y + h); q.fill(); q.fillStyle = '#2a3018'; q.beginPath(); q.arc(x + w * .25, y + h * .58, w * .12, 0, 7); q.fill(); };
function paintGalerie(g) {
  const R = rng(1640);
  // voûte peinte et caissons dorés
  const vg = g.createLinearGradient(0, 0, 0, 120); vg.addColorStop(0, '#3a4a6a'); vg.addColorStop(1, '#8a98a8'); g.fillStyle = vg; g.fillRect(0, 0, W, 120);
  for (let x = 0; x < W; x += 80) { g.fillStyle = 'rgba(216,178,94,.55)'; g.fillRect(x, 0, 4, 120); for (let y = 10; y < 110; y += 40) { g.strokeStyle = 'rgba(216,178,94,.5)'; g.lineWidth = 2; g.strokeRect(x + 10, y, 60, 30); g.fillStyle = `rgba(255,240,220,${.06 + R() * .08})`; g.fillRect(x + 12, y + 2, 56, 26); } }
  g.fillStyle = '#b08a40'; g.fillRect(0, 116, W, 10); g.fillStyle = '#e0c070'; g.fillRect(0, 116, W, 3);
  // mur : fenêtres sur la Seine à gauche, tableaux et pilastres
  g.fillStyle = '#c8bca8'; g.fillRect(0, 126, W, 304); grime(g, 0, 126, W, 304, 41, .2);
  for (let x = 30; x < W; x += 180) {
    g.fillStyle = '#a89878'; g.fillRect(x - 12, 126, 24, 304); g.fillStyle = '#d8ccb4'; g.fillRect(x - 12, 126, 6, 304);
    const wx = x + 34; if ((x / 180 | 0) % 2 === 0) { g.fillStyle = '#7aa0c8'; roundWin(g, wx, 160, 100, 200); g.fill(); g.save(); roundWin(g, wx, 160, 100, 200); g.clip(); const sk = g.createLinearGradient(0, 160, 0, 360); sk.addColorStop(0, '#a8c8e8'); sk.addColorStop(1, '#e8e0c8'); g.fillStyle = sk; g.fillRect(wx, 150, 100, 210); g.fillStyle = 'rgba(90,110,130,.6)'; g.fillRect(wx, 300, 100, 60); g.restore(); g.strokeStyle = '#6a5a3a'; g.lineWidth = 3; roundWin(g, wx, 160, 100, 200); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(wx + 50, 160); g.lineTo(wx + 50, 360); for (let y = 210; y < 360; y += 50) { g.moveTo(wx, y); g.lineTo(wx + 100, y); } g.stroke(); }
    else { paintingFrame(g, wx, 190, 110, 130, R() < .5 ? GAL_PORTRAIT : GAL_PAYSAGE); }
  }
  // tribunes de la cour, de part et d'autre
  for (const [x0, x1] of [[0, 260], [700, 960]]) { g.fillStyle = '#5a1a1e'; g.fillRect(x0, 360, x1 - x0, 70); g.fillStyle = '#d8b25e'; g.fillRect(x0, 358, x1 - x0, 4); for (let i = 0; i < 7; i++) person(g, x0 + 20 + i * ((x1 - x0 - 40) / 6), 396, 46, ['bourgeois', 'dame', 'garde'][i % 3], R, { col: ['#2a2a5a', '#4a1a2a', '#3a3a3a'][i % 3] }); }
  // dais du roi au fond
  g.fillStyle = '#2a3a7a'; g.beginPath(); g.moveTo(400, 200); g.lineTo(560, 200); g.lineTo(580, 300); g.lineTo(380, 300); g.fill(); for (let x = 410; x < 560; x += 22) { g.fillStyle = '#d8b25e'; g.beginPath(); g.moveTo(x, 214); g.lineTo(x + 4, 222); g.lineTo(x + 8, 214); g.lineTo(x + 4, 230); g.fill(); }
  g.fillStyle = '#d8b25e'; g.fillRect(392, 196, 176, 6); person(g, 480, 300, 66, 'bourgeois', R, { col: '#2a3a7a', cape: '#5a1418' }); g.fillStyle = '#e8c870'; g.fillRect(472, 232, 16, 7);
  // parquet en point de Hongrie
  perspFloor(g, 430, 12, 7, '#8a6038', '#6a4626', { planks: true, vary: .1, lines: 'rgba(40,24,12,.4)' });
  g.fillStyle = 'rgba(255,230,190,.08)'; g.fillRect(0, 430, W, 110);
}
function paintChatelet(g) {
  const R = rng(1641);
  g.fillStyle = '#1a1614'; g.fillRect(0, 0, W, H);
  // voûte en berceau
  for (let x = -40; x < W + 40; x += 240) { g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(x, 300); g.quadraticCurveTo(x + 120, -60, x + 240, 300); g.lineTo(x + 240, 0); g.lineTo(x, 0); g.fill(); }
  masonry(g, 0, 60, W, 370, 16, 8, [74, 64, 56], R, { grimeA: .5 });
  for (let x = -40; x < W + 40; x += 240) { g.strokeStyle = '#141010'; g.lineWidth = 14; g.beginPath(); g.moveTo(x, 330); g.quadraticCurveTo(x + 120, -20, x + 240, 330); g.stroke(); }
  // cellules à barreaux
  for (const cx of [120, 760]) { g.fillStyle = '#0a0808'; g.fillRect(cx - 70, 220, 140, 210); g.fillStyle = 'rgba(255,140,60,.05)'; g.fillRect(cx - 70, 220, 140, 210); person(g, cx + 20, 420, 34, 'moine', R, { col: '#2a2420' }); g.strokeStyle = '#3a3634'; g.lineWidth = 5; for (let x = cx - 64; x <= cx + 64; x += 18) { g.beginPath(); g.moveTo(x, 220); g.lineTo(x, 430); g.stroke(); } g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 70, 260); g.lineTo(cx + 70, 260); g.moveTo(cx - 70, 380); g.lineTo(cx + 70, 380); g.stroke(); }
  // chaînes et anneaux
  for (const x of [330, 600]) { g.strokeStyle = '#4a4440'; g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.beginPath(); g.ellipse(x, 150 + k * 12, 4, 6, 0, 0, 7); g.stroke(); } g.beginPath(); g.arc(x, 250, 12, 0, 7); g.stroke(); }
  // escalier qui monte à droite, torches
  for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#3a322c' : '#4a4038'; g.fillRect(880 - k * 22, 430 - (k + 1) * 10, 100 + k * 22, 10); }
  for (const x of [250, 480, 700]) { g.fillStyle = '#2a2018'; g.fillRect(x - 4, 200, 8, 26); g.fillStyle = '#ff9a40'; g.beginPath(); g.moveTo(x - 7, 200); g.quadraticCurveTo(x, 168, x + 7, 200); g.fill(); g.fillStyle = '#fff0b0'; g.beginPath(); g.moveTo(x - 3, 200); g.quadraticCurveTo(x, 182, x + 3, 200); g.fill(); glow(g, x, 190, 140, 'rgba(255,140,60,A)', .5); }
  // sol de dalles et paille
  cobbles(g, 430, R, '84,74,64', { wet: '255,150,80' });
  g.fillStyle = 'rgba(200,170,90,.35)'; for (let i = 0; i < 140; i++) { const x = R() * W, y = 440 + R() * 90; g.fillRect(x, y, 6 + R() * 10, 1.2); }
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(0, 430, W, H - 430);
}
function paintPre(g) {
  const R = rng(1642);
  skyGrad(g, 0, 330, [[0, '#4a5a7a'], [.5, '#c8a0a0'], [.85, '#f0c8a0'], [1, '#f8e0c0']]);
  glow(g, 760, 300, 240, 'rgba(255,220,170,A)', .5); g.fillStyle = '#fff4dc'; g.beginPath(); g.arc(760, 308, 22, Math.PI, 0); g.fill();
  cloudBank(g, R, 260, 80, 340, 20, 'rgba(200,170,180,.5)', 'rgba(255,220,200,.7)', 'rgba(110,100,130,.3)', 760, 300, 10);
  // le Louvre et la Seine, de l'autre côté
  g.fillStyle = '#7a7088'; g.fillRect(380, 250, 560, 60); for (let x = 390; x < 930; x += 18) { g.fillStyle = '#6a6078'; g.fillRect(x, 240, 10, 12); } g.fillStyle = '#5a5068'; g.beginPath(); g.moveTo(560, 250); g.lineTo(600, 210); g.lineTo(640, 250); g.fill(); g.beginPath(); g.moveTo(800, 250); g.lineTo(830, 220); g.lineTo(860, 250); g.fill();
  const wg = g.createLinearGradient(0, 300, 0, 340); wg.addColorStop(0, '#d0b8b0'); wg.addColorStop(1, '#8a8aa0'); g.fillStyle = wg; g.fillRect(0, 306, W, 34); for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,240,220,${R() * .3})`; g.fillRect(R() * W, 308 + R() * 30, 10 + R() * 30, 1); }
  // le pré : herbe rase, saules, brume basse
  const pg = g.createLinearGradient(0, 336, 0, H); pg.addColorStop(0, '#6a7a4a'); pg.addColorStop(.4, '#4a5a32'); pg.addColorStop(1, '#2a321a'); g.fillStyle = pg; g.fillRect(0, 336, W, H - 336);
  for (let i = 0; i < 900; i++) { const x = R() * W, y = 340 + Math.pow(R(), .8) * 200, h = 3 + (y - 336) * .03; g.strokeStyle = `rgba(${R() < .5 ? '120,140,80' : '60,80,40'},.6)`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 3, y - h); g.stroke(); }
  for (const [x, s] of [[90, 1.2], [300, .8], [880, 1]]) { g.fillStyle = '#3a3a22'; g.fillRect(x - 5 * s, 260, 10 * s, 90); for (let k = 0; k < 14; k++) { g.strokeStyle = 'rgba(70,90,50,.85)'; g.lineWidth = 2; g.beginPath(); const a = -Math.PI / 2 + (k - 7) * .2; g.moveTo(x, 262); g.quadraticCurveTo(x + Math.cos(a) * 50 * s, 220 * 1 + Math.sin(a) * 30, x + Math.cos(a) * 70 * s, 330 + k % 3 * 6); g.stroke(); } }
  for (let i = 0; i < 6; i++) { const y = 360 + i * 14; g.fillStyle = `rgba(255,240,230,${.12 - i * .015})`; g.fillRect(0, y, W, 16); }
  // deux témoins au loin
  person(g, 200, 360, 26, 'bourgeois', R, { col: '#2a2a3a' }); person(g, 760, 360, 26, 'bourgeois', R, { col: '#3a2a2a', dir: -1 });
}
function paintToitsND(g) {
  const R = rng(1643);
  skyGrad(g, 0, 400, [[0, '#0a0c14'], [.6, '#1e2434'], [1, '#2e3448']]);
  cloudBank(g, R, 480, 60, 600, 40, 'rgba(40,44,60,.9)', 'rgba(90,100,130,.6)', 'rgba(10,10,20,.6)', 300, 0, 18);
  // la flèche et les tours au fond
  g.fillStyle = '#141820'; g.fillRect(560, 60, 130, 300); g.fillRect(740, 60, 130, 300); for (const x of [560, 740]) for (let k = 0; k < 3; k++) { g.fillStyle = '#0c0e14'; lancet(g, x + 20 + k * 34, 110, 20, 80); g.fill(); }
  g.fillStyle = '#141820'; g.beginPath(); g.moveTo(400, 300); g.lineTo(420, 40); g.lineTo(440, 300); g.fill();
  // le toit de plomb en pente douce, la gargouille, la balustrade
  g.fillStyle = '#3a4250'; g.beginPath(); g.moveTo(-20, 360); g.lineTo(980, 330); g.lineTo(980, 440); g.lineTo(-20, 440); g.fill();
  for (let x = -20; x < 980; x += 30) { g.strokeStyle = 'rgba(20,24,34,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 360 - (x + 20) * .03); g.lineTo(x + 10, 440); g.stroke(); }
  g.fillStyle = '#2a2e38'; g.fillRect(0, 420, W, 14); for (let x = 6; x < W; x += 26) { g.fillStyle = '#343a46'; g.fillRect(x, 392, 10, 30); g.beginPath(); g.arc(x + 5, 392, 7, Math.PI, 0); g.fill(); }
  g.fillStyle = '#2a2e38'; g.beginPath(); g.moveTo(40, 380); g.quadraticCurveTo(80, 340, 140, 350); g.lineTo(170, 340); g.lineTo(160, 360); g.lineTo(130, 368); g.quadraticCurveTo(90, 380, 70, 420); g.lineTo(40, 420); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(150, 348, 2.2, 0, 7); g.fill();
  // la Seine, très bas, et les lumières de Paris
  for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,190,110,${.2 + R() * .5})`; g.fillRect(R() * W, 300 + R() * 30, 2, 2); }
  // sol : faîtage de plomb mouillé
  cobbles(g, 440, R, '70,76,90', { wet: '170,190,230' });
  const sh = g.createLinearGradient(0, 440, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.5)'); g.fillStyle = sh; g.fillRect(0, 440, W, H - 440);
}
Object.assign(VENUES, {
  galerie: { name: 'Grande Galerie du Louvre', draw: paintGalerie, tint: null, lights: [[140, 260, 220, 'rgba(230,240,255,A)'], [500, 260, 220, 'rgba(230,240,255,A)']] },
  chatelet: { name: 'Les cachots du Châtelet', draw: paintChatelet, tint: 'rgba(30,20,10,.1)', lights: [[250, 190, 80, 'rgba(255,140,60,A)'], [480, 190, 80, 'rgba(255,140,60,A)'], [700, 190, 80, 'rgba(255,140,60,A)']] },
  pre: { name: 'Le Pré-aux-Clercs à l\'aube', draw: paintPre, tint: null, lights: [[760, 300, 260, 'rgba(255,220,170,A)']] },
  toits: { name: 'Les toits de Notre-Dame', draw: paintToitsND, tint: 'rgba(10,14,30,.1)', lights: [[300, 0, 260, 'rgba(150,170,220,A)']] },
});
VENUE_KEYS.push('galerie', 'chatelet', 'pre', 'toits');
Object.assign(LIGHTING, {
  galerie: { from: [-.7, -.6], key: '240,244,255', keyA: .18, shade: '50,40,40', shadeA: .38, rim: '255,248,236', rimA: .75, amb: '255,230,200', ambA: .07, cast: [.5, .25], castA: .2, glaze: 'rgba(90,80,60,.06)' },
  chatelet: { from: [0, -.6], key: '255,150,80', keyA: .16, shade: '14,8,4', shadeA: .55, rim: '255,160,90', rimA: .9, amb: '120,90,60', ambA: .08, cast: [0, .3], castA: .26, glaze: 'rgba(40,20,10,.16)' },
  pre: { from: [.8, -.4], key: '255,224,190', keyA: .2, shade: '50,40,60', shadeA: .4, rim: '255,220,180', rimA: .9, amb: '220,200,210', ambA: .08, cast: [-.7, .22], castA: .2, glaze: 'rgba(160,120,120,.08)' },
  toits: { from: [-.3, -.95], key: '170,190,240', keyA: .14, shade: '6,8,20', shadeA: .55, rim: '180,200,255', rimA: .85, amb: '60,70,100', ambA: .1, cast: [.3, .3], castA: .2, glaze: 'rgba(20,24,50,.16)' },
});
Object.assign(Paint.TINT, { galerie: [[255, 236, 210], .05, .01], chatelet: [[255, 150, 80], .14, .1], pre: [[255, 210, 190], .1, .02], toits: [[60, 70, 120], .22, .12] });
Object.assign(ATMOS, { galerie: ['255,250,230', 50, -4, 1], chatelet: ['255,150,70', 30, -18, 2], pre: ['255,240,220', 40, -3, 1], toits: ['190,200,255', 30, -3, 1] });
OUTDOOR.push('pre', 'toits'); Object.assign(RAIN_P, { pre: .1, toits: .85 });
if (typeof GL_GRADE !== 'undefined') Object.assign(GL_GRADE, { galerie: { gain: [1.03, 1.01, .98], con: 1.04, sat: 1.04, amb: .25 }, chatelet: { gain: [1.06, .96, .88], con: 1.12, sat: .96, amb: .55 }, pre: { gain: [1.05, 1, .96], con: 1.03, sat: 1.04, amb: .3 }, toits: { gain: [.9, .96, 1.1], con: 1.12, sat: .9, amb: .55 } });
Object.assign(FG_KIT, {
  galerie: (g) => { g.fillStyle = '#2a0e10'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(70, 0); g.bezierCurveTo(40, 140, 70, 250, 30, 360); g.lineTo(-40, 360); g.fill(); g.fillStyle = '#d8b25e'; g.fillRect(-40, 90, 100, 6); g.fillStyle = '#1e1810'; g.fillRect(920, 0, 60, H); },
  chatelet: (g) => { g.strokeStyle = '#100c0a'; g.lineWidth = 10; for (let x = -10; x < 70; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.fillStyle = '#0c0a08'; g.fillRect(920, 0, 60, H); },
  pre: (g) => { g.fillStyle = '#1a2010'; for (let k = 0; k < 18; k++) { g.beginPath(); g.ellipse(10 + k * 4, 520 - k * 6, 30, 70, -.3 + k * .02, 0, 7); g.fill(); } g.beginPath(); g.ellipse(940, 500, 60, 90, .2, 0, 7); g.fill(); },
  toits: (g) => { g.fillStyle = '#0c0e14'; g.beginPath(); g.moveTo(-20, 540); g.lineTo(-20, 300); g.lineTo(40, 260); g.lineTo(80, 300); g.lineTo(80, 540); g.fill(); g.beginPath(); g.moveTo(900, 540); g.lineTo(920, 360); g.lineTo(980, 340); g.lineTo(980, 540); g.fill(); },
});
