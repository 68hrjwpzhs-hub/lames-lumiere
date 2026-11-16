// =============================== 6.0 · sprint 47 : trois décors de Venise ===============================
// Le Grand Canal de nuit (palais aux fenêtres gothiques, gondole, reflets), la salle de bal d'un palais masqué
// (damas rouge, lustres de Murano, damier de marbre, masques), l'Arsenal au crépuscule (galère sur cale, échafaudages, grue).

function paintCanal(g) {
  const R = rng(1630);
  skyGrad(g, 0, 300, [[0, '#08121e'], [.55, '#14283a'], [1, '#2a4656']]);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(230,236,255,${.2 + R() * .6})`; g.fillRect(R() * W, R() * 170, 1.4, 1.4); }
  glow(g, 770, 70, 150, 'rgba(200,220,255,A)', .35); g.fillStyle = '#eef2f8'; g.beginPath(); g.arc(770, 70, 17, 0, 7); g.fill(); g.fillStyle = 'rgba(160,180,210,.35)'; g.beginPath(); g.arc(764, 66, 5, 0, 7); g.arc(776, 76, 3, 0, 7); g.fill();
  // une église à coupole au loin, à gauche
  g.fillStyle = '#16222e'; g.fillRect(40, 168, 120, 132); g.beginPath(); g.ellipse(100, 168, 52, 46, 0, Math.PI, 0); g.fill(); g.fillRect(96, 100, 8, 24); g.beginPath(); g.ellipse(100, 128, 14, 12, 0, Math.PI, 0); g.fill();
  // les palais de l'autre rive : façades d'enduit, fenêtres gothiques, cheminées en entonnoir
  const cols = [[150, 96, 90], [170, 140, 100], [190, 176, 150], [130, 90, 100], [160, 120, 84]]; let x = 150;
  while (x < W + 20) {
    const w = 96 + R() * 70, top = 120 + R() * 50, c = cols[Math.floor(R() * cols.length)].map(v => v * .55 | 0);
    g.fillStyle = `rgb(${c})`; g.fillRect(x, top, w, 300 - top); grime(g, x, top, w, 300 - top, (x * 7) | 0, .3);
    g.fillStyle = `rgb(${c.map(v => v * .7 | 0)})`; g.fillRect(x - 2, top - 6, w + 4, 7);
    for (let k = 0; k < 2; k++) { const cx = x + 14 + R() * (w - 28); g.fillStyle = '#1a1416'; g.fillRect(cx - 3, top - 22, 6, 16); g.beginPath(); g.moveTo(cx - 8, top - 30); g.lineTo(cx + 8, top - 30); g.lineTo(cx + 3, top - 20); g.lineTo(cx - 3, top - 20); g.fill(); }
    for (let row = 0; row < 3; row++) { const wy = top + 18 + row * 38; if (wy > 268) break; const n = Math.floor((w - 16) / 22);
      for (let k = 0; k < n; k++) { const wx = x + 10 + k * 22, lit = R() < .28; g.fillStyle = lit ? '#f0b05a' : '#141820'; lancet(g, wx, wy, 12, 24); g.fill(); if (lit) { glow(g, wx + 6, wy + 12, 22, 'rgba(255,170,80,A)', .35); g.fillStyle = 'rgba(255,170,80,.16)'; for (let r = 0; r < 4; r++) g.fillRect(wx + 3 + (R() - .5) * 4, 306 + r * 26 + (300 - wy) * .1, 6, 12 + R() * 10); } } } // reflets des fenêtres
    if (R() < .5) { g.fillStyle = '#0e0c10'; g.fillRect(x + w * .3, top + 58, w * .4, 4); for (let b = 0; b <= 8; b++) g.fillRect(x + w * .3 + b * w * .05, top + 50, 1.5, 9); } // balcon
    x += w + 2;
  }
  // l'eau : bleu sombre, rides claires, reflet de la lune
  const wg = g.createLinearGradient(0, 300, 0, 430); wg.addColorStop(0, '#16303e'); wg.addColorStop(1, '#0a1820'); g.fillStyle = wg; g.fillRect(0, 300, W, 130);
  for (let i = 0; i < 160; i++) { const y = 304 + Math.pow(R(), 1.4) * 124, w2 = 6 + R() * 26 * (1 + (y - 300) / 80); g.fillStyle = `rgba(160,200,220,${.04 + R() * .1})`; g.fillRect(R() * W, y, w2, 1.2); }
  for (let y = 304; y < 428; y += 6) { const w2 = 8 + (y - 300) * .25 + R() * 10; g.fillStyle = `rgba(220,230,255,${.35 - (y - 300) / 500})`; g.fillRect(770 - w2 / 2 + (R() - .5) * 14, y, w2, 2); }
  // paline à rayures et gondole
  for (const [px, c] of [[260, '#a83030'], [300, '#a83030'], [640, '#2a4a8a']]) { g.fillStyle = '#e8e0d0'; g.fillRect(px, 270, 7, 120); g.fillStyle = c; for (let y = 278; y < 380; y += 22) g.fillRect(px, y, 7, 10); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(px + 4, 270, 3, 120); }
  g.fillStyle = '#060608'; g.beginPath(); g.moveTo(400, 372); g.quadraticCurveTo(500, 392, 610, 368); g.quadraticCurveTo(622, 350, 628, 340); g.lineTo(632, 346); g.quadraticCurveTo(624, 372, 600, 384); g.quadraticCurveTo(500, 400, 410, 384); g.quadraticCurveTo(394, 380, 388, 362); g.closePath(); g.fill();
  g.fillStyle = '#c8c8d0'; g.beginPath(); g.moveTo(626, 340); g.lineTo(640, 336); g.lineTo(640, 344); g.lineTo(630, 350); g.fill(); // le fer de proue
  person(g, 430, 372, 34, 'bourgeois', R, { col: '#1a1a22', dir: -1 }); g.strokeStyle = '#2a1e14'; g.lineWidth = 2; g.beginPath(); g.moveTo(426, 346); g.lineTo(456, 400); g.stroke();
  // la fondamenta : rebord de pierre d'Istrie, dalles mouillées, lanternes
  g.fillStyle = '#d8d2c4'; g.fillRect(0, 426, W, 9); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 434, W, 3);
  cobbles(g, 437, R, '120,116,110', { wet: '255,200,130' });
  for (const lx of [180, 790]) { g.fillStyle = '#1a1614'; g.fillRect(lx - 3, 300, 6, 140); g.fillRect(lx - 10, 296, 20, 5); g.fillStyle = '#2a2018'; g.beginPath(); g.moveTo(lx - 9, 296); g.lineTo(lx + 9, 296); g.lineTo(lx + 6, 272); g.lineTo(lx - 6, 272); g.fill(); g.fillStyle = '#ffcf7a'; g.fillRect(lx - 5, 276, 10, 18); glow(g, lx, 286, 120, 'rgba(255,170,80,A)', .55); glow(g, lx, 470, 110, 'rgba(255,170,90,A)', .14); }
  const sh = g.createLinearGradient(0, 437, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(2,6,14,.5)'); g.fillStyle = sh; g.fillRect(0, 437, W, H - 437);
}

function paintPalaisVenise(g) {
  const R = rng(1631);
  // mur de damas rouge et motif doré
  g.fillStyle = '#4a1014'; g.fillRect(0, 0, W, 440);
  for (let y = 70; y < 430; y += 34) for (let x = (y / 34 % 2) * 22; x < W; x += 44) { g.fillStyle = 'rgba(230,180,90,.08)'; g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo(x + 9, y, x, y + 10); g.quadraticCurveTo(x - 9, y, x, y - 10); g.fill(); }
  grime(g, 0, 0, W, 440, 77, .25);
  // plafond peint et corniche dorée
  const cg = g.createLinearGradient(0, 0, 0, 62); cg.addColorStop(0, '#3a5a7a'); cg.addColorStop(1, '#8aa0b0'); g.fillStyle = cg; g.fillRect(0, 0, W, 62);
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,240,220,${.15 + R() * .2})`; g.beginPath(); g.ellipse(R() * W, 20 + R() * 30, 50 + R() * 60, 10 + R() * 8, 0, 0, 7); g.fill(); }
  g.fillStyle = '#b08a40'; g.fillRect(0, 60, W, 12); g.fillStyle = '#e0c070'; g.fillRect(0, 60, W, 3); g.fillStyle = '#6a4a1c'; g.fillRect(0, 70, W, 4); for (let x = 6; x < W; x += 18) { g.fillStyle = '#d8b25e'; g.fillRect(x, 74, 8, 6); }
  // pilastres dorés et hautes fenêtres sur la nuit
  for (let x = 60; x < W; x += 210) {
    g.fillStyle = '#9a7a38'; g.fillRect(x - 14, 80, 28, 350); g.fillStyle = '#d8b25e'; g.fillRect(x - 14, 80, 5, 350); g.fillStyle = '#6a4a1c'; g.fillRect(x + 9, 80, 5, 350); g.fillStyle = '#c8a050'; g.fillRect(x - 20, 80, 40, 12); g.fillRect(x - 20, 418, 40, 12);
    const wx = x + 62; g.fillStyle = '#0c1424'; roundWin(g, wx, 110, 86, 230); g.fill(); g.save(); roundWin(g, wx, 110, 86, 230); g.clip(); glow(g, wx + 60, 150, 80, 'rgba(180,200,255,A)', .3); for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(220,230,255,.6)'; g.fillRect(wx + R() * 86, 120 + R() * 100, 1.2, 1.2); } g.restore();
    g.strokeStyle = '#c8a050'; g.lineWidth = 4; roundWin(g, wx, 110, 86, 230); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(wx + 43, 110); g.lineTo(wx + 43, 340); for (let y = 170; y < 340; y += 42) { g.moveTo(wx, y); g.lineTo(wx + 86, y); } g.stroke();
    g.fillStyle = '#6a1018'; g.beginPath(); g.moveTo(wx - 8, 96); g.quadraticCurveTo(wx + 10, 220, wx - 2, 344); g.lineTo(wx - 14, 344); g.lineTo(wx - 14, 96); g.fill(); g.beginPath(); g.moveTo(wx + 94, 96); g.quadraticCurveTo(wx + 76, 220, wx + 88, 344); g.lineTo(wx + 100, 344); g.lineTo(wx + 100, 96); g.fill(); // tentures
  }
  // les invités masqués, au fond
  for (let i = 0; i < 11; i++) { const px = 40 + i * 84 + R() * 30, ty = R() < .5 ? 'dame' : 'bourgeois'; person(g, px, 432, 36 + R() * 6, ty, R, { dir: R() < .5 ? 1 : -1, col: ['#2a1a3a', '#1a2a3a', '#4a1a2a', '#2a2a2a', '#3a2a14'][Math.floor(R() * 5)] }); g.fillStyle = R() < .5 ? '#ece6da' : '#d8b25e'; g.fillRect(px - 3, 432 - (36 * .85) - 2, 6, 3); }
  // damier de marbre
  perspFloor(g, 432, 9, 9, '#d8d0c0', '#2a2224', { vary: .12 });
  const rf = g.createLinearGradient(0, 432, 0, H); rf.addColorStop(0, 'rgba(255,220,160,.12)'); rf.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = rf; g.fillRect(0, 432, W, H - 432);
  // lustres de Murano
  for (const lx of [290, 670]) { g.strokeStyle = '#8a7040'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, 72); g.lineTo(lx, 120); g.stroke(); glow(g, lx, 140, 170, 'rgba(255,200,120,A)', .45);
    g.strokeStyle = 'rgba(200,230,255,.8)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(lx, 140, 52, 12, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(lx, 128, 30, 8, 0, 0, 7); g.stroke();
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, cx = lx + Math.cos(a) * 52, cy = 140 + Math.sin(a) * 12; candle(g, cx, cy, 12); }
    for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(210,240,255,.7)'; g.beginPath(); g.ellipse(lx - 40 + k * 11, 156 + (k % 2) * 6, 2, 5, 0, 0, 7); g.fill(); } }
}

function paintArsenal(g) {
  const R = rng(1632);
  skyGrad(g, 0, 330, [[0, '#2a2240'], [.45, '#7a4a5a'], [.8, '#e0905a'], [1, '#f0c080']]);
  glow(g, 620, 300, 260, 'rgba(255,190,110,A)', .45);
  cloudBank(g, R, 300, 90, 360, 22, 'rgba(120,80,100,.6)', 'rgba(255,170,120,.7)', 'rgba(60,40,70,.4)', 620, 300, 12);
  // murs crénelés de briques et tour d'entrée
  masonry(g, 0, 200, 230, 140, 14, 7, [120, 60, 44], R, { grimeA: .35 }); masonry(g, 780, 190, 180, 150, 14, 7, [120, 60, 44], R, { grimeA: .35 });
  for (const [a, b, top] of [[0, 230, 200], [780, 960, 190]]) for (let x = a; x < b; x += 20) { g.fillStyle = '#6a3424'; g.fillRect(x, top - 12, 12, 12); }
  masonry(g, 840, 110, 70, 230, 14, 7, [130, 66, 48], R, { grimeA: .3 }); g.fillStyle = '#3a2420'; g.beginPath(); g.moveTo(832, 112); g.lineTo(875, 70); g.lineTo(918, 112); g.fill(); g.fillStyle = '#d8c0a0'; g.beginPath(); g.arc(875, 160, 12, 0, 7); g.fill(); g.fillStyle = '#3a2a20'; g.fillRect(874, 152, 2, 9); // horloge
  // le bassin : eau qui reflète le couchant
  const wg = g.createLinearGradient(0, 330, 0, 400); wg.addColorStop(0, '#c8805a'); wg.addColorStop(1, '#3a2a3a'); g.fillStyle = wg; g.fillRect(0, 330, W, 70);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,220,170,${R() * .25})`; g.fillRect(R() * W, 332 + R() * 66, 6 + R() * 24, 1.2); }
  // la galère sur sa cale : coque, membrures, échafaudage
  g.fillStyle = '#3a2416'; g.beginPath(); g.moveTo(250, 300); g.quadraticCurveTo(300, 380, 470, 384); g.lineTo(700, 380); g.quadraticCurveTo(740, 360, 760, 300); g.lineTo(720, 296); g.lineTo(290, 296); g.closePath(); g.fill();
  for (let x = 300; x < 720; x += 16) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 298); g.quadraticCurveTo(x + 4, 340, x + 8, 382); g.stroke(); }
  for (let y = 306; y < 380; y += 10) { g.strokeStyle = 'rgba(120,80,50,.4)'; g.beginPath(); g.moveTo(280 + (y - 300) * .6, y); g.lineTo(740 - (y - 300) * .4, y); g.stroke(); }
  g.strokeStyle = '#2a1a10'; g.lineWidth = 4; for (let x = 560; x < 740; x += 18) { g.beginPath(); g.moveTo(x, 298); g.quadraticCurveTo(x + 6, 250, x - 4, 210); g.stroke(); } // membrures à nu
  g.strokeStyle = '#5a4430'; g.lineWidth = 3; for (const x of [270, 360, 450, 540, 630, 720, 790]) { g.beginPath(); g.moveTo(x, 200); g.lineTo(x, 430); g.stroke(); } for (const y of [230, 280]) { g.beginPath(); g.moveTo(260, y); g.lineTo(800, y); g.stroke(); }
  g.fillStyle = '#6a5038'; g.fillRect(260, 226, 540, 6); g.fillRect(260, 276, 540, 6);
  person(g, 400, 226, 26, 'porteur', R, { col: '#4a3a2a' }); person(g, 660, 276, 26, 'bourgeois', R, { col: '#3a2a1a', dir: -1 });
  // grue à roue
  g.strokeStyle = '#2a1a10'; g.lineWidth = 5; g.beginPath(); g.moveTo(140, 330); g.lineTo(170, 120); g.lineTo(300, 90); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(300, 90); g.lineTo(300, 180); g.stroke(); g.beginPath(); g.arc(150, 300, 34, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(150, 300); g.lineTo(150 + Math.cos(a) * 34, 300 + Math.sin(a) * 34); g.stroke(); }
  g.fillStyle = '#5a4a3a'; g.fillRect(292, 180, 16, 22);
  // le chantier : sol de planches, bois empilé, braseros
  perspFloor(g, 430, 12, 6, '#6a4e34', '#5a422c', { planks: true, vary: .12, lines: 'rgba(30,18,10,.45)' });
  g.fillStyle = '#7a5a3a'; for (let k = 0; k < 4; k++) g.fillRect(40, 412 - k * 9, 150, 8); g.fillStyle = '#5a4028'; for (let k = 0; k < 4; k++) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(46 + i * 26, 416 - k * 9, 3.6, 0, 7); g.fill(); }
  for (const bx of [250, 820]) { g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(bx - 14, 430); g.lineTo(bx + 14, 430); g.lineTo(bx + 10, 404); g.lineTo(bx - 10, 404); g.fill(); g.fillStyle = '#ff9a40'; g.beginPath(); g.moveTo(bx - 9, 404); g.quadraticCurveTo(bx, 374, bx + 9, 404); g.fill(); glow(g, bx, 398, 130, 'rgba(255,140,60,A)', .5); }
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(20,10,20,.45)'); g.fillStyle = sh; g.fillRect(0, 430, W, H - 430);
}

Object.assign(VENUES, {
  canal: { name: 'Grand Canal', draw: paintCanal, tint: 'rgba(10,30,50,.08)', lights: [[180, 286, 80, 'rgba(255,170,80,A)'], [790, 286, 80, 'rgba(255,170,80,A)'], [770, 70, 220, 'rgba(200,220,255,A)']] },
  palais: { name: 'Palais Valdomar, bal masqué', draw: paintPalaisVenise, tint: null, lights: [[290, 140, 150, 'rgba(255,200,120,A)'], [670, 140, 150, 'rgba(255,200,120,A)']] },
  arsenal: { name: 'L\'Arsenal de Venise', draw: paintArsenal, tint: null, lights: [[250, 398, 90, 'rgba(255,140,60,A)'], [820, 398, 90, 'rgba(255,140,60,A)'], [620, 300, 260, 'rgba(255,190,110,A)']] },
});
VENUE_KEYS.push('canal', 'palais', 'arsenal');
Object.assign(LIGHTING, {
  canal: { from: [.3, -.9], key: '200,220,255', keyA: .12, shade: '8,16,34', shadeA: .5, rim: '255,190,120', rimA: .85, amb: '90,130,170', ambA: .09, cast: [-.3, .3], castA: .2, glaze: 'rgba(20,50,70,.14)' },
  palais: { from: [0, -1], key: '255,220,170', keyA: .2, shade: '50,10,16', shadeA: .42, rim: '255,226,170', rimA: .85, amb: '255,180,140', ambA: .08, cast: [0, .26], castA: .2, glaze: 'rgba(90,20,24,.1)' },
  arsenal: { from: [.6, -.5], key: '255,200,140', keyA: .2, shade: '40,20,40', shadeA: .45, rim: '255,180,110', rimA: .9, amb: '255,170,120', ambA: .08, cast: [-.6, .3], castA: .24, glaze: 'rgba(120,60,40,.1)' },
});
Object.assign(Paint.TINT, { canal: [[60, 110, 150], .18, .1], palais: [[255, 190, 150], .08, .03], arsenal: [[255, 170, 120], .12, .04] });
Object.assign(ATMOS, { canal: ['200,220,255', 30, -3, 1], palais: ['255,226,180', 50, -5, 1], arsenal: ['255,150,70', 40, -18, 2] });
OUTDOOR.push('canal', 'arsenal'); Object.assign(RAIN_P, { canal: .15, arsenal: .15 });
if (typeof GL_GRADE !== 'undefined') Object.assign(GL_GRADE, { canal: { gain: [.92, 1.0, 1.08], con: 1.1, sat: 1.0, amb: .55 }, palais: { gain: [1.06, .98, .94], con: 1.06, sat: 1.08, amb: .35 }, arsenal: { gain: [1.06, .98, .92], con: 1.07, sat: 1.06, amb: .35 } });
Object.assign(FG_KIT, {
  canal: (g) => { g.fillStyle = '#0a0c10'; g.fillRect(-10, 0, 26, H); g.fillStyle = '#e8e0d0'; for (let y = 20; y < H; y += 60) g.fillRect(-10, y, 26, 24); g.fillStyle = 'rgba(10,12,16,.85)'; g.fillRect(-10, 0, 26, H);
    g.fillStyle = '#0c0a0c'; g.fillRect(930, 300, 10, 240); g.beginPath(); g.moveTo(918, 300); g.lineTo(952, 300); g.lineTo(946, 270); g.lineTo(924, 270); g.fill(); },
  palais: (g) => { g.fillStyle = '#2a060a'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(80, 0); g.bezierCurveTo(50, 140, 84, 260, 36, 380); g.bezierCurveTo(16, 420, -20, 420, -40, 400); g.closePath(); g.fill(); g.fillStyle = '#8a6a28'; g.fillRect(-40, 120, 110, 8);
    g.fillStyle = '#1e1810'; g.fillRect(912, 0, 70, H); g.fillStyle = '#6a5020'; g.fillRect(904, 300, 86, 14); },
  arsenal: (g) => { g.strokeStyle = '#140c08'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, 0); g.quadraticCurveTo(60, 120, 30, 230); g.stroke(); g.fillStyle = '#140c08'; g.beginPath(); g.arc(30, 240, 12, 0, 7); g.fill();
    g.fillStyle = '#1a120c'; for (const [x, y] of [[900, 470], [944, 470], [922, 420]]) { g.beginPath(); g.ellipse(x, y, 24, 34, 0, 0, 7); g.fill(); } },
});
