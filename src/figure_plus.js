// =============================== Édition Lumière 1.1 · personnages plus fins, mouvement secondaire ===============================
// Rien ici ne touche aux articulations ni à la pointe de la lame : les coups, les portées et les parades restent ceux de la 7.0.0.
// Seul le dessin s'enrichit, par-dessus les fonctions d'origine :
//  · mains gantées (doigts, phalanges, crispin), dentelle festonnée aux poignets, fraise à godets ;
//  · pourpoint : crevés qui laissent voir la doublure, boutons brillants, baudrier et sa boucle ;
//  · bottes : talon, semelle, éperon, pli et piqûre du revers ;
//  · rapière : coquille, fusée filigranée, pommeau godronné, gouttière de la lame ;
//  · mouvement secondaire (ressorts) : le fourreau bat contre la jambe, l'ourlet de la jupe suit avec retard, le gland du baudrier danse.
const FigPlus = {
  cur: null, on: true,
  // état des ressorts d'un combattant (porté par l'objet lui-même : les silhouettes fantômes en héritent)
  st(f) { if (!f._fp) f._fp = { t: G.time, x: f.x, vx: 0, sc: 0, scv: 0, hem: 0, hemv: 0 }; return f._fp; },
  tick(f) {
    const s = this.st(f), now = G.time, dt = Math.min(.05, now - s.t); if (!(dt > 0)) { if (!isFinite(s.t) || now < s.t) s.t = now; return s; } s.t = now;
    if (!isFinite(s.sc + s.scv + s.hem + s.hemv + s.vx + s.x)) { s.sc = s.scv = s.hem = s.hemv = s.vx = 0; s.x = f.x; } // garde-fou : jamais de valeur non finie dans le dessin
    const vx = isFinite(f.x) && isFinite(s.x) ? (f.x - s.x) / dt : 0, ax = (vx - s.vx) / Math.max(dt, .004); s.x = f.x; s.vx = vx;
    const d = f.dir || 1, kick = clamp(-ax * d * .00042, -1.2, 1.2) + (f.state === 'attack' && f.t < .12 ? .25 : 0);
    // fourreau : pendule amorti, relancé par les accélérations
    s.scv += (-s.sc * 60 - s.scv * 7 + kick * 140) * dt; s.sc = clamp(s.sc + s.scv * dt, -.7, .7);
    // ourlet : suit la vitesse avec retard
    const tgt = clamp(-vx * d * .028, -9, 9); s.hemv += ((tgt - s.hem) * 70 - s.hemv * 9) * dt; s.hem = clamp(s.hem + s.hemv * dt, -11, 11);
    return s;
  },
  hi(g, x, y, r, a) { g.fillStyle = `rgba(255,250,236,${a})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); },
};
// ---- le combattant : on note qui est dessiné, on fait avancer ses ressorts ----
const drawFighter0 = drawFighter;
drawFighter = function (g, f, opts = {}) { const prev = FigPlus.cur; FigPlus.cur = f; if (FigPlus.on && !opts.shadowOnly && G.time !== undefined) { try { FigPlus.tick(f); } catch (e) { } } try { return drawFighter0(g, f, opts); } finally { FigPlus.cur = prev; } };
// ---- mains : gant à crispin, doigts refermés, phalanges ----
const drawHand0 = drawHand;
drawHand = function (g, wr, ang, col, C, claws) {
  if (!FigPlus.on || claws) return drawHand0(g, wr, ang, col, C, claws);
  const f = FigPlus.cur, S = f ? norm(f.look) : null, glove = S && col !== S.skin, c = C(col), dk = C(shade(col, -.28)), lt = C(shade(col, .22));
  g.save(); g.translate(wr[0], wr[1]); g.rotate(ang);
  if (glove) { // crispin : le gant s'évase sur le poignet
    g.fillStyle = dk; g.beginPath(); g.moveTo(-3, -4.6); g.lineTo(-10.5, -6.4); g.quadraticCurveTo(-11.6, 0, -10.5, 6.4); g.lineTo(-3, 4.6); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
    g.strokeStyle = lt; g.lineWidth = .9; g.globalAlpha = .7; g.beginPath(); g.moveTo(-10.2, -5.8); g.quadraticCurveTo(-11.2, 0, -10.2, 5.8); g.stroke(); g.globalAlpha = 1;
  }
  // paume et dos de la main
  const pg = g.createLinearGradient(0, -5, 0, 5); pg.addColorStop(0, lt); pg.addColorStop(.5, c); pg.addColorStop(1, dk);
  g.fillStyle = f && f.flash > 0 ? c : pg; g.beginPath(); g.moveTo(-4, -4.4); g.quadraticCurveTo(2, -5.6, 5.4, -3.8); g.quadraticCurveTo(7.4, 0, 5.4, 3.8); g.quadraticCurveTo(2, 5.4, -4, 4.4); g.quadraticCurveTo(-5.4, 0, -4, -4.4); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  // quatre doigts refermés sur la poignée
  for (let i = 0; i < 4; i++) { const y = -3.5 + i * 2.25; g.fillStyle = i % 2 ? c : lt; g.beginPath(); g.ellipse(4.4 - Math.abs(i - 1.5) * .5, y, 2.7, 1.2, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(22,13,10,.45)'; g.lineWidth = .55; g.stroke(); }
  for (let i = 0; i < 4; i++) FigPlus.hi(g, 3 - Math.abs(i - 1.5) * .4, -3.7 + i * 2.25, .5, .35); // phalanges
  // pouce posé sur la garde
  g.fillStyle = dk; g.beginPath(); g.ellipse(2.4, 3.1, 3.3, 1.7, .45, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = .7; g.stroke();
  if (glove) { g.strokeStyle = 'rgba(20,10,8,.4)'; g.lineWidth = .5; g.beginPath(); g.moveTo(-3.4, -2); g.lineTo(1.5, -2.4); g.moveTo(-3.4, 1); g.lineTo(1.5, .8); g.stroke(); } // coutures du gant
  g.restore();
};
// ---- bras : crevés du pourpoint, dentelle au poignet ----
const drawArmS0 = drawArmS;
drawArmS = function (g, L, sh, el, wr, d, C, back) {
  const f = FigPlus.cur, S = norm(L), fancy = FigPlus.on && (S.style === 'renaissance' || S.style === 'dame');
  if (FigPlus.on && back && f && !f._ghost) { try { drawScabbard(g, f, S, C); } catch (e) { } } // le fourreau pend derrière tout le reste
  drawArmS0(g, L, sh, el, wr, d, C, back); if (!fancy) return;
  const wf = S.body === 'f' ? .88 : 1, dk = back ? -.25 : 0, col = c => C(dk ? shade(c, dk) : c);
  // crevés : deux fentes en amande sur le haut du bras, la doublure claire dessous
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, lin = col(shade(S.trim, .1));
  for (const k of [-.3, .3]) { const cx = sh[0] + dx * .38 + nx * k * 11 * wf, cy = sh[1] + dy * .38 + ny * k * 11 * wf, h = l * .24;
    g.fillStyle = 'rgba(10,6,6,.45)'; g.beginPath(); g.moveTo(cx - ux * h, cy - uy * h); g.quadraticCurveTo(cx + nx * 2.6, cy + ny * 2.6, cx + ux * h, cy + uy * h); g.quadraticCurveTo(cx - nx * 2.6, cy - ny * 2.6, cx - ux * h, cy - uy * h); g.fill();
    g.fillStyle = lin; g.globalAlpha = .9; g.beginPath(); g.moveTo(cx - ux * h * .86, cy - uy * h * .86); g.quadraticCurveTo(cx + nx * 1.7, cy + ny * 1.7, cx + ux * h * .86, cy + uy * h * .86); g.quadraticCurveTo(cx - nx * 1.5, cy - ny * 1.5, cx - ux * h * .86, cy - uy * h * .86); g.fill(); g.globalAlpha = 1; }
  // dentelle : festons au bord de la manchette, plis de la toile
  const ex = wr[0] - el[0], ey = wr[1] - el[1], el2 = Math.hypot(ex, ey) || 1, vx = ex / el2, vy = ey / el2, qx = -vy, qy = vx, w = 5.4 * wf, lace = C(back ? '#d9d1bf' : '#f7f1e2');
  g.fillStyle = lace; for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(wr[0] + vx * 1.2 + qx * i * w * .42, wr[1] + vy * 1.2 + qy * i * w * .42, 1.9, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(120,108,90,.55)'; g.lineWidth = .6; for (let i = -2; i <= 2; i++) { const bx = wr[0] - vx * el2 * .17 + qx * i * w * .4, by = wr[1] - vy * el2 * .17 + qy * i * w * .4; g.beginPath(); g.moveTo(bx, by); g.lineTo(wr[0] + vx * 1.4 + qx * i * w * .44, wr[1] + vy * 1.4 + qy * i * w * .44); g.stroke(); }
};
// ---- fourreau : pend au baudrier, bat contre la jambe (ressort) ----
function drawScabbard(g, f, S, C) {
  if (S.race === 'drac' || S.style === 'moine' || f.noBlade || !f.J) return; const j = f.J, d = f.dir, s = FigPlus.st(f);
  const a = (.62 + s.sc + (f.pose ? f.pose.torso * DEG * .5 : 0)) , len = 74, hx = j.gx - d * 9, hy = j.gy - 5, ex = hx - d * Math.cos(a) * len, ey = hy + Math.sin(a) * len;
  const nx = -(ey - hy) / len, ny = (ex - hx) / len, col = S.style === 'rodeur' ? S.boot : '#2a1c16', trim = C(f.rapier && f.rapier.hilt || S.trim);
  // bélières
  g.strokeStyle = C(shade(col, .15)); g.lineWidth = 1.6; g.beginPath(); g.moveTo(j.gx - d * 4, j.gy - 7); g.lineTo(lerp(hx, ex, .12), lerp(hy, ey, .12)); g.moveTo(j.gx - d * 12, j.gy - 6); g.lineTo(lerp(hx, ex, .32), lerp(hy, ey, .32)); g.stroke();
  // corps du fourreau : cuir sombre, plus fin vers la bouterolle
  const sg = g.createLinearGradient(hx + nx * 3, hy + ny * 3, hx - nx * 3, hy - ny * 3); sg.addColorStop(0, shade(col, .28)); sg.addColorStop(.5, col); sg.addColorStop(1, shade(col, -.4));
  g.fillStyle = f.flash > 0 ? C(col) : sg; g.beginPath(); g.moveTo(hx + nx * 2.8, hy + ny * 2.8); g.lineTo(ex + nx * 1.2, ey + ny * 1.2); g.lineTo(ex - nx * 1.2, ey - ny * 1.2); g.lineTo(hx - nx * 2.8, hy - ny * 2.8); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  // chape et bouterolle de métal
  const band = (u0, u1, w0, w1) => { const x0 = lerp(hx, ex, u0), y0 = lerp(hy, ey, u0), x1 = lerp(hx, ex, u1), y1 = lerp(hy, ey, u1); g.fillStyle = trim; g.beginPath(); g.moveTo(x0 + nx * w0, y0 + ny * w0); g.lineTo(x1 + nx * w1, y1 + ny * w1); g.lineTo(x1 - nx * w1, y1 - ny * w1); g.lineTo(x0 - nx * w0, y0 - ny * w0); g.closePath(); g.fill(); };
  band(0, .1, 3.2, 3); band(.3, .34, 2.6, 2.5); band(.88, 1, 1.8, 1); g.fillStyle = trim; g.beginPath(); g.arc(ex, ey, 1.7, 0, 7); g.fill(); FigPlus.hi(g, lerp(hx, ex, .05) + nx * 1.2, lerp(hy, ey, .05) + ny * 1.2, .8, .5);
}
// ---- buste : fraise à godets, boutons brillants, baudrier ----
const drawTorsoS0 = drawTorsoS;
drawTorsoS = function (g, f, j, L, C) {
  drawTorsoS0(g, f, j, L, C); if (!FigPlus.on) return; const S = norm(L), d = f.dir, tor = f.pose.torso * DEG, s = FigPlus.st(f);
  if (S.race === 'drac' || S.style === 'moine') return;
  g.save(); g.translate(j.gx, j.gy); g.rotate(tor * d); g.scale(d, 1);
  // baudrier : de l'épaule arrière à la hanche avant, boucle et gland qui danse
  if (S.style !== 'paysan') { const bc = S.style === 'rodeur' ? S.boot : shade(S.coat2, -.25), fem = S.body === 'f';
    g.save(); torsoPath(g, S); g.clip();
    g.strokeStyle = C(bc); g.lineWidth = fem ? 3.6 : 4.6; g.beginPath(); g.moveTo(-13, -56); g.quadraticCurveTo(2, -34, 15, -9); g.stroke();
    g.strokeStyle = C(shade(bc, .4)); g.lineWidth = .8; g.globalAlpha = .7; g.setLineDash([1.4, 1.8]); g.beginPath(); g.moveTo(-11.6, -56.6); g.quadraticCurveTo(3.4, -34.6, 16.4, -9.6); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; // piqûre
    g.fillStyle = C(S.trim); g.beginPath(); g.ellipse(2.6, -32.5, 3.4, 2.6, .9, 0, 7); g.fill(); g.fillStyle = C(bc); g.beginPath(); g.ellipse(2.6, -32.5, 1.6, 1.1, .9, 0, 7); g.fill(); FigPlus.hi(g, 1.6, -33.6, .7, .6); g.restore();
    const sw = s.sc * .9; g.strokeStyle = C(S.trim); g.lineWidth = 1.1; g.beginPath(); g.moveTo(14, -8); g.lineTo(14 + Math.sin(sw) * 9, -8 + Math.cos(sw) * 9); g.stroke(); g.fillStyle = C(S.trim); g.beginPath(); g.ellipse(14 + Math.sin(sw) * 11, -8 + Math.cos(sw) * 11, 1.7, 2.6, -sw, 0, 7); g.fill(); // gland
  }
  if (S.style === 'renaissance') {
    // crevés de la poitrine
    g.save(); torsoPath(g, S); g.clip();
    for (const [x, y] of [[-6, -44], [-8, -30], [-7, -17]]) { g.fillStyle = 'rgba(10,6,6,.4)'; g.beginPath(); g.moveTo(x - 4.6, y + 3.6); g.quadraticCurveTo(x + 1.5, y + 1.6, x + 5, y - 3.4); g.quadraticCurveTo(x - 1.5, y - 1.4, x - 4.6, y + 3.6); g.fill(); g.fillStyle = C(shade(S.trim, .1)); g.globalAlpha = .85; g.beginPath(); g.moveTo(x - 3.6, y + 2.8); g.quadraticCurveTo(x + 1.1, y + 1, x + 4, y - 2.6); g.quadraticCurveTo(x - 1, y - .8, x - 3.6, y + 2.8); g.fill(); g.globalAlpha = 1; }
    g.restore();
    for (let k = 0; k < 7; k++) { const y = -10 - k * 6.5, x = (S.body === 'f' ? 13 : 15.5) - Math.abs(y + 30) * .06; g.strokeStyle = 'rgba(20,10,8,.4)'; g.lineWidth = .5; g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.stroke(); FigPlus.hi(g, x - .5, y - .6, .55, .75); } // reflet des boutons
    FigPlus.hi(g, 10.6, -6.6, .8, .6); // boucle du ceinturon
    // fraise : deux rangs de godets, ombre dessous
    g.fillStyle = 'rgba(30,18,14,.28)'; g.beginPath(); g.ellipse(1.5, -56.5, 13.5, 4.6, 0, 0, 7); g.fill();
    for (const [yy, rx, ry, c0, c1] of [[-58.2, 14, 5.2, '#d9d1c0', '#b9b09c'], [-60, 13, 4.8, '#fbf7ec', '#dcd4c2']]) {
      const n = 13; for (let i = 0; i < n; i++) { const a = Math.PI * (i + .5) / n, x = 1 - Math.cos(a) * rx, y = yy + Math.sin(a) * ry * .55; g.fillStyle = C(i % 2 ? c0 : c1); g.beginPath(); g.ellipse(x, y, rx / n * 1.7, ry * .62, 0, 0, 7); g.fill(); }
      g.fillStyle = C(c0); g.beginPath(); g.ellipse(1, yy - .4, rx - 1.5, ry * .55, 0, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(110,100,84,.5)'; g.lineWidth = .55; for (let k = -10; k <= 10; k += 2.5) { g.beginPath(); g.moveTo(1 + k, -63.2); g.lineTo(1 + k * 1.12, -56.4); g.stroke(); }
  }
  g.restore();
};
// ---- jupe : l'ourlet suit le mouvement avec retard ; plis plus profonds ----
const drawSkirt0 = drawSkirt;
drawSkirt = function (g, f, j, L, C) {
  const S = norm(L); if (!FigPlus.on || !(S.style === 'dame' || S.style === 'moine')) return drawSkirt0(g, f, j, L, C);
  const s = FigPlus.st(f), sh = leg => ({ hip: leg.hip, knee: [leg.knee[0] + s.hem * .45, leg.knee[1]], foot: [leg.foot[0] + s.hem, leg.foot[1]] }), j2 = Object.assign({}, j, { bl: sh(j.bl), fl: sh(j.fl) });
  drawSkirt0(g, f, j2, L, C);
  // plis : bandes d'ombre et de lumière de la taille à l'ourlet
  const d = f.dir, k = S.style === 'moine' ? .96 : .74; let hb = legAt(j2.bl, k), hf = legAt(j2.fl, k); hb = [hb[0] - d * 10, hb[1] + 2]; hf = [hf[0] + d * 10, hf[1] + 2]; const mid = (hb[0] + hf[0]) / 2; if ((hf[0] - hb[0]) * d < 34) { hb[0] = mid - d * 17; hf[0] = mid + d * 17; }
  const wb = [j.gx - d * 15 * (S.body === 'f' ? .85 : 1), j.gy - 6], wfr = [j.gx + d * 14, j.gy - 6];
  for (let i = 0; i < 5; i++) { const u = .14 + i * .18, x0 = lerp(wb[0], wfr[0], u), x1 = lerp(hb[0], hf[0], u), y1 = lerp(hb[1], hf[1], u) + 3, w = 3.2 + i % 2;
    g.fillStyle = i % 2 ? 'rgba(255,240,220,.07)' : 'rgba(8,4,10,.2)'; g.beginPath(); g.moveTo(x0 - .8, j.gy - 4); g.quadraticCurveTo(lerp(x0, x1, .5) + d * 2, lerp(j.gy, y1, .5), x1 - w, y1); g.lineTo(x1 + w, y1); g.quadraticCurveTo(lerp(x0, x1, .5) + d * 3, lerp(j.gy, y1, .5), x0 + .8, j.gy - 4); g.closePath(); g.fill(); }
};
// ---- bottes : talon, semelle, éperon ; revers piqué ----
const drawFoot0 = drawFoot;
drawFoot = function (g, L, ax, ay, d, front, C, type) {
  drawFoot0(g, L, ax, ay, d, front, C, type); if (!FigPlus.on || type === 'sandale') return; const Lf = front ? 21 : 14;
  g.fillStyle = C(shade(L.boot, -.45)); g.fillRect(Math.min(ax - d * 7.5, ax - d * 2.5), ay + 4.2, 5, 2.4); // talon
  g.strokeStyle = C(shade(L.boot, .4)); g.globalAlpha = .5; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax + d * 5, ay - 2.2); g.quadraticCurveTo(ax + d * (Lf - 6), ay - .6, ax + d * (Lf - 2.5), ay + 1.6); g.stroke(); g.lineCap = 'butt'; g.globalAlpha = 1; // reflet du cuir sur le cou-de-pied
  if (type === 'botte') { const f = FigPlus.cur, S = f ? norm(f.look) : L, tc = C(S.trim || '#c8a050'), sx = ax - d * 8.4, sy = ay + .6; // éperon : branche et molette
    g.strokeStyle = tc; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ax - d * 6.5, sy); g.lineTo(sx - d * 2.6, sy - .6); g.stroke();
    g.fillStyle = tc; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + (G.time || 0) * 0; g.beginPath(); g.moveTo(sx - d * 3.4, sy - .6); g.lineTo(sx - d * 3.4 + Math.cos(a) * 2.4, sy - .6 + Math.sin(a) * 2.4); g.lineTo(sx - d * 3.4 + Math.cos(a + .5) * .9, sy - .6 + Math.sin(a + .5) * .9); g.closePath(); g.fill(); }
    g.strokeStyle = C(shade(L.boot, -.5)); g.lineWidth = 1; g.beginPath(); g.moveTo(ax - d * 6.6, ay - 1.4); g.lineTo(ax + d * 3.6, ay - 3.2); g.stroke(); // bride de l'éperon
  }
};
const bootTop0 = bootTop;
bootTop = function (g, a, b, w, col, C) {
  bootTop0(g, a, b, w, col, C); if (!FigPlus.on) return; const kx = b[0] - a[0], ky = b[1] - a[1], kl = Math.hypot(kx, ky) || 1, px = -ky / kl, py = kx / kl;
  g.strokeStyle = C(shade(col, .45)); g.lineWidth = 1; g.globalAlpha = .65; g.beginPath(); g.moveTo(a[0] + px * w, a[1] + py * w - 2); g.lineTo(a[0] - px * w, a[1] - py * w - 2); g.stroke(); // bord clair du revers
  g.strokeStyle = C(shade(col, -.5)); g.globalAlpha = .55; g.lineWidth = .7; g.setLineDash([1.2, 1.6]); g.beginPath(); g.moveTo(b[0] + px * (w - 3), b[1] + py * (w - 3) - 1.4); g.lineTo(b[0] - px * (w - 3), b[1] - py * (w - 3) - 1.4); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; // piqûre
};
// ---- rapière : gouttière, coquille, fusée filigranée, pommeau godronné ----
const drawRapier0 = drawRapier;
drawRapier = function (g, f, j, L, C) {
  const ang = drawRapier0(g, f, j, L, C); if (!FigPlus.on || f.disarmed) return ang;
  const bx = j.tip[0] - j.wr[0], by = j.tip[1] - j.wr[1], bl = Math.hypot(bx, by) || 1, ux = bx / bl, uy = by / bl, nx = -uy, ny = ux, R = f.rapier, trim = C(R ? R.hilt : L.trim), fam = R && R.fam;
  // gouttière : un filet sombre au tiers fort de la lame
  g.strokeStyle = 'rgba(30,36,46,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(j.wr[0] + ux * 13, j.wr[1] + uy * 13); g.lineTo(j.wr[0] + ux * bl * .42, j.wr[1] + uy * bl * .42); g.stroke();
  // coquille : une demi-coupe d'acier devant la main (pleine pour l'épée de cour, ajourée sinon)
  const q = [j.wr[0] + ux * 5.5, j.wr[1] + uy * 5.5], a0 = Math.atan2(uy, ux);
  g.save(); g.translate(q[0], q[1]); g.rotate(a0);
  const cg = g.createLinearGradient(0, -8, 0, 8); cg.addColorStop(0, shade(R ? R.hilt : L.trim, .4)); cg.addColorStop(.5, R ? R.hilt : L.trim); cg.addColorStop(1, shade(R ? R.hilt : L.trim, -.45));
  g.fillStyle = f.flash > 0 ? trim : cg; g.globalAlpha = fam === 'sabre' ? 0 : .92; g.beginPath(); g.moveTo(-1.5, -7.6); g.quadraticCurveTo(5.4, -6, 5.6, 0); g.quadraticCurveTo(5.4, 6, -1.5, 7.6); g.quadraticCurveTo(1.6, 0, -1.5, -7.6); g.closePath(); g.fill(); g.globalAlpha = 1;
  if (fam !== 'sabre') { g.strokeStyle = 'rgba(20,12,8,.5)'; g.lineWidth = .6; g.stroke(); if (fam !== 'cour') { g.fillStyle = 'rgba(20,12,10,.55)'; for (const y of [-4, 0, 4]) { g.beginPath(); g.arc(2.6 - Math.abs(y) * .2, y, .8, 0, 7); g.fill(); } } FigPlus.hi(g, 3.4, -3.4, .9, .55); }
  // fusée : fil torsadé
  g.strokeStyle = 'rgba(235,225,200,.5)'; g.lineWidth = .6; for (let x = -15; x <= -8; x += 1.8) { g.beginPath(); g.moveTo(x, -2); g.lineTo(x + 1.1, 2); g.stroke(); }
  // pommeau godronné
  g.fillStyle = trim; g.beginPath(); g.ellipse(-18.5, 0, 4.2, 3.7, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(20,12,8,.45)'; g.lineWidth = .5; for (const k of [-1.6, 0, 1.6]) { g.beginPath(); g.moveTo(-22, k * .5); g.quadraticCurveTo(-18.5, k * 1.9, -15, k * .5); g.stroke(); } FigPlus.hi(g, -19.6, -1.4, 1, .6);
  g.restore();
  return ang;
};
