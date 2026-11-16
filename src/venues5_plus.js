// =============================== Édition Lumière 3.1 · les quatre lieux de la 7.0, repris ===============================
// La Grande Galerie, le Châtelet, le Pré-aux-Clercs et les toits de Notre-Dame étaient plus pauvres que les autres lieux.
// Chaque peinture d'origine est gardée ; on peint par-dessus ce qui lui manquait. Les versions HD sont refaites à partir de là.
(() => {
  const plus = (k, fn) => { const V = VENUES[k], d0 = V.draw; V.draw = function (g) { d0(g); g.save(); try { fn(g, rng(k.length * 977 + 5)); } catch (e) { console.error('décor', k, e); } g.restore(); }; };
  // ---- Grande Galerie : voûte peinte, lustres, tapis royal, bannières fleurdelisées, plus de cour ----
  plus('galerie', (g, R) => {
    for (let x = 100; x < W; x += 240) { // médaillons peints au plafond
      g.fillStyle = 'rgba(216,178,94,.85)'; g.beginPath(); g.ellipse(x, 58, 62, 34, 0, 0, 7); g.fill();
      const sk = g.createRadialGradient(x - 10, 50, 4, x, 58, 56); sk.addColorStop(0, '#f4e2c0'); sk.addColorStop(.5, '#a8c0d8'); sk.addColorStop(1, '#6a88a8'); g.fillStyle = sk; g.beginPath(); g.ellipse(x, 58, 55, 28, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,250,240,.7)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x - 30 + k * 18 + R() * 6, 52 + R() * 12, 12, 5, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(120,60,50,.8)'; g.beginPath(); g.ellipse(x + 12, 60, 5, 9, .4, 0, 7); g.fill(); // une allégorie, en petit
    }
    for (const x of [300, 660]) { const y0 = 128; // lustres de cristal, au-dessus des tableaux
      g.strokeStyle = '#8a6a30'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 104); g.lineTo(x, y0); g.stroke();
      g.fillStyle = '#c8a050'; g.beginPath(); g.ellipse(x, y0 + 10, 40, 7, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y0 + 2, 18, 5, 0, 0, 7); g.fill();
      for (let k = -3; k <= 3; k++) { g.fillStyle = 'rgba(220,240,255,.8)'; g.beginPath(); g.moveTo(x + k * 11, y0 + 14); g.lineTo(x + k * 11 - 2, y0 + 24); g.lineTo(x + k * 11 + 2, y0 + 24); g.fill(); g.fillStyle = '#f4ecd8'; g.fillRect(x + k * 11 - 1.5, y0 - 6, 3, 10); }
      glow(g, x, y0 - 8, 60, 'rgba(255,220,150,A)', .32); for (let k = -3; k <= 3; k++) glow(g, x + k * 11, y0 - 9, 6, 'rgba(255,230,170,A)', .9);
    }
    for (const x of [220, 740]) { g.fillStyle = '#2a3a7a'; g.fillRect(x - 22, 130, 44, 110); g.beginPath(); g.moveTo(x - 22, 240); g.lineTo(x, 256); g.lineTo(x + 22, 240); g.fill(); g.fillStyle = '#d8b25e'; g.fillRect(x - 22, 130, 44, 5); for (const [dx, dy] of [[-8, 160], [8, 160], [0, 190], [-8, 218], [8, 218]]) { g.beginPath(); g.moveTo(x + dx, dy - 6); g.quadraticCurveTo(x + dx + 4, dy, x + dx, dy + 6); g.quadraticCurveTo(x + dx - 4, dy, x + dx, dy - 6); g.fill(); } } // bannières fleurdelisées
    // tapis royal qui file vers le dais
    g.fillStyle = 'rgba(120,20,30,.9)'; g.beginPath(); g.moveTo(420, 432); g.lineTo(540, 432); g.lineTo(640, H); g.lineTo(320, H); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(216,178,94,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(426, 432); g.lineTo(332, H); g.moveTo(534, 432); g.lineTo(628, H); g.stroke();
    for (let k = 0; k < 5; k++) { const y = 446 + k * 20, w = 60 + k * 18; g.fillStyle = 'rgba(216,178,94,.45)'; g.beginPath(); g.moveTo(480, y - 4); g.lineTo(480 + w * .08, y); g.lineTo(480, y + 4); g.lineTo(480 - w * .08, y); g.fill(); }
    for (const x of [290, 340, 620, 670]) person(g, x, 432, 42, R() < .5 ? 'dame' : 'bourgeois', R, { col: ['#5a1a2a', '#2a3a5a', '#4a3a1a', '#3a1a4a'][Math.floor(R() * 4)], dir: x < 480 ? 1 : -1 }); // courtisans au bord de la piste
  });
  // ---- Châtelet : pierre suintante, porte de fer, paille, fers au mur, rais de lumière par le soupirail ----
  plus('chatelet', (g, R) => {
    for (let i = 0; i < 26; i++) { const x = R() * W, y = 90 + R() * 260, L = 20 + R() * 70; const sg = g.createLinearGradient(0, y, 0, y + L); sg.addColorStop(0, 'rgba(10,8,6,.35)'); sg.addColorStop(1, 'rgba(10,8,6,0)'); g.fillStyle = sg; g.fillRect(x, y, 3 + R() * 6, L); g.fillStyle = 'rgba(255,200,140,.18)'; g.fillRect(x + 1, y, 1, L * .7); } // suintement et reflets humides
    // soupirail : un rai de lumière froide qui tombe en biais
    g.fillStyle = '#0c0a08'; g.fillRect(452, 70, 56, 30); g.strokeStyle = '#3a3634'; g.lineWidth = 4; for (let x = 460; x < 508; x += 12) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 100); g.stroke(); }
    const ray = g.createLinearGradient(480, 100, 560, 430); ray.addColorStop(0, 'rgba(190,210,255,.22)'); ray.addColorStop(1, 'rgba(190,210,255,0)'); g.fillStyle = ray; g.beginPath(); g.moveTo(452, 100); g.lineTo(508, 100); g.lineTo(640, 430); g.lineTo(540, 430); g.closePath(); g.fill();
    // porte de fer cloutée au centre
    g.fillStyle = '#1e1a18'; g.beginPath(); g.moveTo(420, 430); g.lineTo(420, 300); g.quadraticCurveTo(480, 262, 540, 300); g.lineTo(540, 430); g.closePath(); g.fill();
    g.fillStyle = '#2e2824'; g.fillRect(426, 304, 108, 126); g.strokeStyle = '#141010'; g.lineWidth = 3; for (const y of [330, 372, 412]) { g.beginPath(); g.moveTo(426, y); g.lineTo(534, y); g.stroke(); }
    g.fillStyle = '#5a524c'; for (let y = 318; y < 428; y += 14) for (let x = 434; x < 530; x += 16) { g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); }
    g.fillStyle = '#6a6058'; g.fillRect(516, 360, 12, 4); g.beginPath(); g.arc(522, 372, 6, 0, 7); g.lineWidth = 2; g.strokeStyle = '#6a6058'; g.stroke();
    // fers scellés au mur, banc, seau, bottes de paille
    for (const x of [200, 640]) { g.strokeStyle = '#4a4440'; g.lineWidth = 3; g.beginPath(); g.arc(x, 300, 8, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, 308); g.quadraticCurveTo(x + 14, 340, x + 30, 330); g.stroke(); g.beginPath(); g.arc(x + 34, 332, 7, 0, 7); g.stroke(); }
    g.fillStyle = '#3a2a1c'; g.fillRect(250, 402, 110, 10); g.fillRect(258, 412, 8, 20); g.fillRect(344, 412, 8, 20);
    g.fillStyle = '#4a3a28'; g.beginPath(); g.moveTo(600, 432); g.lineTo(604, 404); g.lineTo(628, 404); g.lineTo(632, 432); g.fill(); g.strokeStyle = '#6a5a40'; g.lineWidth = 2; g.beginPath(); g.moveTo(602, 414); g.lineTo(630, 414); g.stroke();
    for (const [x, w] of [[30, 120], [820, 140]]) { g.fillStyle = '#8a7040'; g.beginPath(); g.ellipse(x + w / 2, 430, w / 2, 16, 0, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(220,190,110,.6)'; g.lineWidth = 1; for (let i = 0; i < 30; i++) { const xx = x + R() * w; g.beginPath(); g.moveTo(xx, 430); g.lineTo(xx + (R() - .5) * 20, 430 - R() * 16); g.stroke(); } }
  });
  // ---- Pré-aux-Clercs : la Grande Galerie au loin, la Seine qui reflète l'aube, peupliers, brume en couches, barques, oiseaux ----
  plus('pre', (g, R) => {
    // la Grande Galerie du Louvre, longue façade basse, et les Tuileries
    g.fillStyle = '#8a8098'; g.fillRect(40, 268, 340, 36); for (let x = 46; x < 380; x += 14) { g.fillStyle = '#7a7088'; g.fillRect(x, 276, 6, 12); } g.fillStyle = '#6a6080'; g.beginPath(); g.moveTo(40, 268); g.lineTo(60, 254); g.lineTo(380, 254); g.lineTo(380, 268); g.fill();
    g.fillStyle = '#7a7090'; g.beginPath(); g.moveTo(20, 304); g.lineTo(20, 246); g.lineTo(36, 230); g.lineTo(52, 246); g.lineTo(52, 304); g.fill(); // pavillon
    // reflets de l'aube sur la Seine : longues bandes dorées
    for (let i = 0; i < 14; i++) { const y = 308 + i * 2.2, w = 40 + R() * 160; g.fillStyle = `rgba(255,220,170,${.35 - i * .02})`; g.fillRect(760 - w / 2 + (R() - .5) * 60, y, w, 1.2); }
    for (const [x, d] of [[520, 1], [640, -1]]) { g.fillStyle = '#3a3040'; g.beginPath(); g.moveTo(x - 22, 318); g.quadraticCurveTo(x, 326, x + 22, 318); g.lineTo(x + 18 * d, 314); g.lineTo(x - 18 * d, 314); g.fill(); g.fillRect(x - 1, 300, 2, 14); } // barques
    // peupliers sur l'autre rive
    for (const x of [440, 470, 690, 720, 940]) { g.fillStyle = 'rgba(70,80,70,.7)'; g.beginPath(); g.ellipse(x, 262, 10, 46, 0, 0, 7); g.fill(); }
    // brume en couches, plus épaisse près de l'eau
    for (let i = 0; i < 8; i++) { const y = 296 + i * 10; const mg = g.createLinearGradient(0, y, 0, y + 22); mg.addColorStop(0, 'rgba(255,236,226,0)'); mg.addColorStop(.5, `rgba(255,236,226,${.16 - i * .016})`); mg.addColorStop(1, 'rgba(255,236,226,0)'); g.fillStyle = mg; g.fillRect(0, y, W, 22); }
    // oiseaux dans l'aube
    g.strokeStyle = 'rgba(60,50,60,.7)'; g.lineWidth = 1.3; for (let i = 0; i < 7; i++) { const x = 560 + R() * 260, y = 120 + R() * 80, w = 4 + R() * 3; g.beginPath(); g.moveTo(x - w, y - 2); g.quadraticCurveTo(x - w / 2, y - 4, x, y); g.quadraticCurveTo(x + w / 2, y - 4, x + w, y - 2); g.stroke(); }
    // rosée qui brille dans l'herbe, au premier plan
    for (let i = 0; i < 90; i++) { const x = R() * W, y = 440 + R() * 100; g.fillStyle = `rgba(255,240,210,${.25 + R() * .45})`; g.fillRect(x, y, 1.6, 1.6); }
  });
  // ---- Toits de Notre-Dame : façade ouest (galerie des rois, rose), nuages éclairés, toits de Paris et fenêtres, gargouille ----
  plus('toits', (g, R) => {
    // nuages d'orage éclairés par le dessous
    for (let i = 0; i < 7; i++) { const x = R() * W, y = 30 + R() * 90, r = 80 + R() * 90; const cg = g.createRadialGradient(x, y + r * .4, 4, x, y, r); cg.addColorStop(0, 'rgba(120,130,170,.35)'); cg.addColorStop(1, 'rgba(120,130,170,0)'); g.fillStyle = cg; g.fillRect(x - r, y - r, r * 2, r * 2); }
    // façade ouest : tours carrées reliées, galerie des rois, grande rose
    g.fillStyle = '#1a1e28'; g.fillRect(560, 60, 310, 300); g.fillStyle = '#20252f'; g.fillRect(560, 60, 130, 300); g.fillRect(740, 60, 130, 300);
    g.fillStyle = '#0c0e14'; for (const x of [560, 740]) for (let k = 0; k < 3; k++) { lancet(g, x + 20 + k * 34, 110, 20, 80); g.fill(); }
    g.fillStyle = '#262c38'; g.fillRect(556, 196, 318, 10); g.fillRect(556, 236, 318, 8); for (let x = 566; x < 866; x += 14) { g.fillStyle = '#141820'; g.fillRect(x, 208, 8, 26); } // galerie des rois
    g.fillStyle = '#0e1018'; g.beginPath(); g.arc(715, 290, 44, 0, 7); g.fill(); const rg = g.createRadialGradient(715, 290, 4, 715, 290, 40); rg.addColorStop(0, 'rgba(255,200,120,.75)'); rg.addColorStop(.6, 'rgba(160,80,140,.45)'); rg.addColorStop(1, 'rgba(60,60,140,.3)'); g.fillStyle = rg; g.beginPath(); g.arc(715, 290, 38, 0, 7); g.fill(); // la rose éclairée de l'intérieur
    g.strokeStyle = '#141820'; g.lineWidth = 2; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(715, 290); g.lineTo(715 + Math.cos(a) * 38, 290 + Math.sin(a) * 38); g.stroke(); } g.beginPath(); g.arc(715, 290, 18, 0, 7); g.stroke();
    // toits de Paris entre le mur et nous : pignons, cheminées, fenêtres allumées
    for (let x = -20; x < 560; x += 46 + R() * 30) { const h = 40 + R() * 50, w = 40 + R() * 30, y = 330 - h; g.fillStyle = '#12151c'; g.beginPath(); g.moveTo(x, 336); g.lineTo(x, y + 16); g.lineTo(x + w / 2, y); g.lineTo(x + w, y + 16); g.lineTo(x + w, 336); g.fill(); g.fillRect(x + w * .7, y - 12, 7, 22); if (R() < .7) { g.fillStyle = `rgba(255,190,110,${.5 + R() * .4})`; g.fillRect(x + w * .3, y + 26, 5, 7); } }
    // gargouille au premier plan gauche, bien découpée
    g.fillStyle = '#20242e'; g.beginPath(); g.moveTo(0, 410); g.lineTo(0, 370); g.quadraticCurveTo(40, 350, 70, 356); g.quadraticCurveTo(96, 340, 116, 352); g.lineTo(130, 348); g.lineTo(122, 360); g.lineTo(132, 364); g.lineTo(112, 368); g.quadraticCurveTo(80, 372, 64, 396); g.lineTo(52, 420); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(84, 352); g.lineTo(90, 336); g.lineTo(96, 350); g.fill(); g.fillStyle = 'rgba(170,190,230,.4)'; g.beginPath(); g.moveTo(10, 368); g.quadraticCurveTo(50, 352, 80, 356); g.lineTo(80, 358); g.quadraticCurveTo(50, 356, 10, 372); g.fill(); // corne, liseré de pluie
  });
})();
