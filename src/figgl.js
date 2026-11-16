// =============================== Chantier « personnages par la carte graphique » · étape 1 ===============================
// Beauté d'abord. Chaque personnage devient un ensemble de maillages articulés, peints et éclairés pixel par pixel :
//  1. Cuisson : les pièces du costume (jambes, buste et jupe, tête et chapeau, bras armé, rapière, main) sont peintes UNE fois,
//     à plat, par les mêmes fonctions de dessin que le jeu, dans une planche de textures à 2,5× la définition de référence.
//  2. Maillages : chaque pièce est une grille de sommets ; les membres sont « skinnés » sur deux os (épaule-coude-poignet,
//     hanche-genou-cheville) avec un fondu au coude et au genou, le pied a son propre os, posé à plat.
//  3. Volume : chaque sommet porte une normale (cylindre pour les membres et le buste, sphère pour la tête), affinée dans le
//     shader par le relief de la peinture. Le moteur Lumen éclaire ces normales au lieu de deviner le volume par la silhouette.
//  4. Ce qui pend derrière (bras libre, fourreau, cape, main gauche) reste dessiné en 2D, sous les maillages.
// Rien ne touche aux règles : les os viennent des articulations dessinées (f.J), exactement comme le dessin 2D.
// 5.5 : planche de 2048×1024 cuite à 3× (au lieu de 2,5× sur 1024²) et mipmaps : plus net de près, sans scintillement de loin
const FG_BK = 3, FG_AW = 2048, FG_AH = 1024;
// pièces : zone de la planche (unités de référence), os de cuisson, poids, section (rayon pour la normale)
const FG_PARTS = {
  legB: { r: [16, 56, 80, 182], bones: [[[40, 70], [40, 115]], [[40, 115], [40, 160]], [[40, 160], [60, 160]]], axis: 'y', k1: 115, k2: 160, hw: 9.5, grid: [7, 16] },
  legF: { r: [86, 56, 150, 182], bones: [[[110, 70], [110, 115]], [[110, 115], [110, 160]], [[110, 160], [130, 160]]], axis: 'y', k1: 115, k2: 160, hw: 9.5, grid: [7, 16] },
  torso: { r: [160, 34, 282, 262], bones: [[[220, 140], [220, 82]]], hw: 21, grid: [9, 12], rigid: true },
  head: { r: [284, 6, 388, 124], bones: [[[330, 86], [330, 70]]], hw: 15, grid: [14, 14], rigid: true, sphere: [330, 70] },
  arm: { r: [392, 20, 494, 62], bones: [[[410, 42], [441, 42]], [[441, 42], [469, 42]]], axis: 'x', k1: 441, hw: 8.5, grid: [16, 7] },
  rapier: { r: [400, 80, 590, 112], bones: [[[418, 96], [530, 96]]], hw: 3, grid: [12, 3], rigid: true, stretch: true },
  hand: { r: [600, 80, 640, 112], bones: [[[618, 96], [630, 96]]], hw: 6, grid: [3, 3], rigid: true },
  // 5.5 : la jupe (pans, basques, robe) devient une pièce à part, accrochée aux hanches et qui balance
  skirt: { r: [400, 122, 520, 262], bones: null, skirt: [460, 150], hw: 22, grid: [10, 14] }, // os : hanches, cuisse avant, cuisse arrière (posés à la cuisson)
};
// matière dominante de chaque pièce : 0 étoffe · 1 lame et garde · 2 main (gant) · 3 jambes (bottes repérées à leur couleur)
const FG_KIND = { rapier: 1, hand: 2, legB: 3, legF: 3 };
const FG_CAPE = [524, 122, 566, 262]; // zone de la planche réservée à l'étoffe de la cape
const FG_ORDER = ['legB', 'legF', 'skirt', 'torso', 'head', 'rapier', 'arm', 'hand'];
const FigGL = {
  on() { return store.get('ct2d.figgl', true) !== false; },
  cache: new Map(), q: [], P: null, buf: null, F: null, fw: 0, fh: 0, rot: 0, n: 0,
  // qui passe par la carte graphique : les humains (le dragon garde son dessin)
  use(f) { if (!this.on() || typeof Lumen === 'undefined' || !Lumen.on || !Lumen.ok || !f || !f.J || f._ghost) return false; const S = norm(f.look); return S.race !== 'drac' && G.state !== 'menu'; },
  sig(f) { const S = norm(f.look); return JSON.stringify([f.look, S.build || '', f.rapier && [f.rapier.len, f.rapier.hilt, f.rapier.blade], Build.on && Build.on(), store.get('ct2d.visages', true), typeof Art !== 'undefined' ? Art.sigOf(f) : '']); },
  // ---- 1. cuisson ----
  stub(f) {
    const s = new Fighter(f.isPlayer, f.look); s.rapier = f.rapier; s.offhand = null; s.opp = { x: 1e5, state: 'idle', move: null, dist: () => 999 }; s.reset(0); s.dir = 1; s.state = 'idle'; s.t = 0; s.flash = 0; s.disarmed = false; s.arch = f.arch; s.sig = f.sig; s._fg = true;
    // pose de garde du jeu (jambes, hauteur des hanches), buste et tête droits
    s.pose.torso = 0; s.pose.head = 0; s.pose.px = 0; s.J = s.joints(); return s;
  },
  bake(f) {
    const cv = document.createElement('canvas'); cv.width = FG_AW; cv.height = FG_AH; const g = cv.getContext('2d'), s = this.stub(f), S = norm(s.look), C = c => c, P = FG_PARTS, prev = FigPlus.cur;
    g.setTransform(FG_BK, 0, 0, FG_BK, 0, 0); g.lineJoin = 'round'; FigPlus.cur = s;
    const clip = (r, fn) => { g.save(); g.beginPath(); g.rect(r[0], r[1], r[2] - r[0], r[3] - r[1]); g.clip(); try { fn(); } catch (e) { console.error('figgl bake', e); } g.restore(); };
    let skb = null, capeOk = false;
    try {
      for (const [k, front] of [['legB', false], ['legF', true]]) { const b = P[k].bones; clip(P[k].r, () => drawLegS(g, S, { hip: b[0][0], knee: b[0][1], foot: b[1][1] }, 1, C, front)); }
      // le buste, la jupe et le cou, à partir d'articulations au repos décalées dans la zone
      { const o = P.torso.bones[0][0], J0 = s.J, dx = o[0] - J0.gx, dy = o[1] - J0.gy, mv = p => [p[0] + dx, p[1] + dy], j = {};
        for (const k in J0) { const v = J0[k]; j[k] = Array.isArray(v) ? mv(v) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, Array.isArray(b) ? mv(b) : b])) : k === 'gx' ? v + dx : k === 'gy' ? v + dy : v; }
        s.J = j; clip(P.torso.r, () => { limb(g, [j.neck[0], j.neck[1] + 4], j.head, S.body === 'f' ? 8 : 9, 7.5, C(shade(S.skin, -.12)), { line: false }); drawTorsoS(g, s, j, S, C); });
        const h = P.head.bones[0], dxh = h[1][0] - j.head[0], dyh = h[1][1] - j.head[1], jh = {}; for (const k in j) { const v = j[k]; jh[k] = Array.isArray(v) ? [v[0] + dxh, v[1] + dyh] : k === 'gx' ? v + dxh : k === 'gy' ? v + dyh : v; }
        s.J = jh; clip(P.head.r, () => drawHeadS(g, s, jh, S, C));
        const ok = P.skirt.skirt, dxs = ok[0] - J0.gx, dys = ok[1] - J0.gy, js = {}; for (const k in J0) { const v = J0[k]; js[k] = Array.isArray(v) ? [v[0] + dxs, v[1] + dys] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, Array.isArray(b) ? [b[0] + dxs, b[1] + dys] : b])) : k === 'gx' ? v + dxs : k === 'gy' ? v + dys : v; }
        s.J = js; clip(P.skirt.r, () => drawSkirt(g, s, js, S, C)); s.J = J0; skb = FigGL.skirtQuad(1, js, S); }
      { const b = P.arm.bones; clip(P.arm.r, () => drawArmS(g, S, b[0][0], b[0][1], b[1][1], 1, C, false)); }
      { const b = P.rapier.bones[0], j = { wr: b[0], tip: [b[0][0] + (f.rapier ? f.rapier.len : 112), b[0][1]], el: [b[0][0] - 28, b[0][1]] }; clip(P.rapier.r, () => drawRapier0FG(g, s, j, S, C)); }
      { const b = P.hand.bones[0]; clip(P.hand.r, () => drawHand(g, b[0], 0, swordHand(S), C)); }
      // 5.5 : l'étoffe de la cape (dégradé du bord extérieur vers le corps, galon de l'ourlet, col), posée ensuite sur le tissu simulé
      if (S.cape && S.style !== 'rodeur') { const r = FG_CAPE, w = r[2] - r[0], h = r[3] - r[1], cg = g.createLinearGradient(r[0], 0, r[2], 0); cg.addColorStop(0, shade(S.cape, -.38)); cg.addColorStop(.55, shade(S.cape, -.08)); cg.addColorStop(1, shade(S.cape, .2));
        g.fillStyle = cg; g.fillRect(r[0], r[1], w, h); g.fillStyle = shade(S.cape, -.2); g.fillRect(r[0], r[1], w, 3); g.fillStyle = S.trim; g.globalAlpha = .75; g.fillRect(r[0], r[3] - 2.2, w, 1.6); g.globalAlpha = 1;
        for (let i = 0; i < 46; i++) { g.fillStyle = `rgba(${i % 2 ? '255,240,220' : '0,0,0'},${.03 + (i % 5) * .006})`; g.fillRect(r[0] + (i * 7.3) % w, r[1] + 3, .7, h - 6); } capeOk = true; }
    } finally { FigPlus.cur = prev; }
    return { cv, len: f.rapier ? f.rapier.len : 112, skb, capeOk };
  },
  atlas(f) {
    const k = this.sig(f); let a = this.cache.get(k); if (a) return a; if (this.cache.size > 3) { for (const [kk, v] of this.cache) { if (v.tex && Lumen.gl) { Lumen.gl.deleteTexture(v.tex); if (v.nt) Lumen.gl.deleteTexture(v.nt); if (v.mt) Lumen.gl.deleteTexture(v.mt); } this.cache.delete(kk); break; } }
    a = this.bake(f); if (typeof Art !== 'undefined') Art.applyHero(f, a); const g = Lumen.gl; a.tex = Lumen.texture(); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, a.cv); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); g.generateMipmap(g.TEXTURE_2D); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR); a.cv = store.get('ct2d.debug', false) ? a.cv : (this.keepCv ? a.cv : null);
    if (typeof Art !== 'undefined') Art.mapsHero(f, a); this.cache.set(k, a); this.bakes = (this.bakes || 0) + 1; return a;
  },
  // ---- 2. maillages : os du monde à partir des articulations ----
  worldBones(f, j, a) {
    const d = f.dir, tipU = f.disarmed ? null : j.tip;
    return { legB: [[j.bl.hip, j.bl.knee], [j.bl.knee, j.bl.foot], [j.bl.foot, [j.bl.foot[0] + d * 20, j.bl.foot[1]]]], legF: [[j.fl.hip, j.fl.knee], [j.fl.knee, j.fl.foot], [j.fl.foot, [j.fl.foot[0] + d * 20, j.fl.foot[1]]]],
      skirt: this.skirtQuad(f.dir, j, norm(f.look)), torso: [[[j.gx, j.gy], j.neck]], head: [[j.neck, j.head]], arm: [[j.sh, j.el], [j.el, j.wr]], rapier: tipU ? [[j.wr, tipU]] : null, hand: [[j.wr, tipU || [j.wr[0] + (j.wr[0] - j.el[0]), j.wr[1] + (j.wr[1] - j.el[1])]]] };
  },
  // la jupe est un quadrilatère souple : taille (arrière, avant) et ourlet (posé sur les deux jambes), comme dans drawSkirt
  skirtQuad(d, j, S) {
    const k = { moine: .96, dame: .74, paysan: .4, rodeur: .34 }[S.style]; if (!k) return null;
    const wb = [j.gx - d * 15 * (S.body === 'f' ? .85 : 1), j.gy - 6], wf = [j.gx + d * 14, j.gy - 6]; let hb = legAt(j.bl, k), hf = legAt(j.fl, k); hb = [hb[0] - d * 10, hb[1] + 2]; hf = [hf[0] + d * 10, hf[1] + 2];
    const mid = (hb[0] + hf[0]) / 2; if ((hf[0] - hb[0]) * d < 34) { hb[0] = mid - d * 17; hf[0] = mid + d * 17; } return [wb, wf, hb, hf];
  },
  // 6.2 · le plumet reprend vie : un ressort pour chaque duelliste, relancé par les déplacements, l'attaque et un souffle d'air
  plume(f) {
    const S = norm(f.look); if (!S.plume || f.hatOff || (S.hatType && S.hatType !== 'feutre')) return 0;
    const s = f._fgPl || (f._fgPl = { a: 0, v: 0, x: f.x, t: G.time }), dt = clamp(G.time - s.t, 0, .05); s.t = G.time; if (!(dt > 0)) return s.a;
    const vx = (f.x - s.x) / dt; s.x = f.x; const tg = clamp(vx * f.dir * .0022, -.5, .6) + Math.sin(G.time * 2.3 + (f.isPlayer ? 0 : 1.7)) * .06 + (f.state === 'attack' ? .12 : 0) + (f.state === 'hit' ? .3 : 0);
    s.v += ((tg - s.a) * 70 - s.v * 5.5) * dt; s.a = clamp(s.a + s.v * dt, -.6, .7); return s.a;
  },
  // le zoom des moments forts s'applique aussi aux maillages et aux particules
  zoom() { if (!(G.zoom > .001)) return null; return { x: G.koFocus ? G.koFocus[0] : (G.p.x + G.e.x) / 2, y: G.koFocus ? G.koFocus[1] : GROUND - 120, k: 1 + G.zoom }; },
  VB: new Float32Array(1 << 16), vn: 0,
  put(v) { if (this.vn + 12 > this.VB.length) { const nb = new Float32Array(this.VB.length * 2); nb.set(this.VB); this.VB = nb; } this.VB.set(v, this.vn); this.vn += 12; },
  // la cape : bande lissée (Catmull-Rom) entre ses deux bords simulés ; les plis inclinent les normales quand le tissu se resserre
  cape(f, a) {
    const c = f.cloth; if (!a.capeOk || !c || !c.O || c.O.length < 3) return false; const d = f.dir, [ao, ai] = Cloth.anchors(f, f.J), O = c.O.map(p => p.slice()), I = c.I.map(p => p.slice()); O[0] = ao; I[0] = ai;
    const N = O.length, M = 4, cr = (P, i, t) => { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[Math.min(N - 1, i + 1)], p3 = P[Math.min(N - 1, i + 2)], t2 = t * t, t3 = t2 * t;
      return [0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)); };
    const rows = []; for (let i = 0; i < N - 1; i++) for (let m = 0; m < M; m++) rows.push([cr(O, i, m / M), cr(I, i, m / M), i + m / M]); rows.push([O[N - 1], I[N - 1], N - 1]);
    const Z = this.zoom(), r = FG_CAPE, cols = 4, V = [];
    rows.forEach(([o, ii, fi], k) => { const wR = c.W ? c.W[Math.min(N - 1, Math.round(fi))] * 2 : 30, w = Math.hypot(ii[0] - o[0], ii[1] - o[1]), sq = clamp(1 - w / (wR || 1), 0, .7), ax = [(ii[0] - o[0]) / (w || 1), (ii[1] - o[1]) / (w || 1)];
      for (let q = 0; q <= cols; q++) { const s2 = q / cols; let X = lerp(o[0], ii[0], s2), Y = lerp(o[1], ii[1], s2); if (Y > GROUND) Y = GROUND; if (Z) { X = Z.x + (X - Z.x) * Z.k; Y = Z.y + (Y - Z.y) * Z.k; }
        const cyl = (s2 - .5) * 1.1, fold = Math.sin(s2 * Math.PI * 3 + fi * 1.7) * (.15 + 1.1 * sq), cx = clamp(cyl + fold, -.95, .95);
        const nx2 = rows[Math.min(rows.length - 1, k + 1)], pv2 = rows[Math.max(0, k - 1)], dn = [(nx2[0][0] + nx2[1][0] - pv2[0][0] - pv2[1][0]) / 2, (nx2[0][1] + nx2[1][1] - pv2[0][1] - pv2[1][1]) / 2]; V.push([X, Y, lerp(r[0], r[2], s2) * FG_BK / FG_AW, lerp(r[1] + 1, r[3] - 1, k / (rows.length - 1)) * FG_BK / FG_AH, ax[0] * cx, ax[1] * cx, Math.sqrt(1 - cx * cx), 0, ax[0], ax[1], dn[0], dn[1]]); } });
    const row = cols + 1; for (let k = 0; k < rows.length - 1; k++) for (let q = 0; q < cols; q++) { const i0 = k * row + q; for (const v of [V[i0], V[i0 + 1], V[i0 + row], V[i0 + 1], V[i0 + row + 1], V[i0 + row]]) this.put(v); }
    return true;
  },
  push(f, j, a, out) {
    const d = f.dir, WB = this.worldBones(f, j, a), P = FG_PARTS, Z = this.zoom(), pl = store.get('ct2d.jeu62', true) !== false ? this.plume(f) : 0;
    for (const name of FG_ORDER) { const p0 = P[name], wb = WB[name]; if (!wb) continue; const b0r = P.rapier.bones[0][0], p = name === 'rapier' ? Object.assign({}, p0, { bones: [[b0r, [b0r[0] + a.len, b0r[1]]]] }) : p0; if (name === 'skirt' && (!a.skb || !wb)) continue; if (!p.bones && !p.skirt) continue;
      // repère de chaque os : origine, axe unitaire, perpendiculaire (retournée quand le personnage regarde à gauche), échelle le long de l'axe
      const fr = p.skirt ? [] : p.bones.map((b0, i) => { const w = wb[i], ax0 = [b0[1][0] - b0[0][0], b0[1][1] - b0[0][1]], l0 = Math.hypot(ax0[0], ax0[1]) || 1, ax = [w[1][0] - w[0][0], w[1][1] - w[0][1]], l = Math.hypot(ax[0], ax[1]) || 1;
        const u0 = [ax0[0] / l0, ax0[1] / l0], u = [ax[0] / l, ax[1] / l], pr = [-u[1] * d, u[0] * d], sc = p.rigid && !p.stretch ? 1 : (name === 'hand' ? 1 : l / l0);
        return { o0: b0[0], u0, p0: [-u0[1], u0[0]], o: w[0], u, pr, sc }; });
      const [gx, gy] = p.grid, r = p.r, V = [];
      for (let iy = 0; iy <= gy; iy++) for (let ix = 0; ix <= gx; ix++) {
        const bx = r[0] + (r[2] - r[0]) * ix / gx, by = r[1] + (r[3] - r[1]) * iy / gy;
        if (p.skirt) { // coordonnées (s, t) dans le quadrilatère cuit, puis même point dans le quadrilatère du monde
          const [B0, F0, HB, HF] = a.skb, [b1, f1, hb1, hf1] = wb; let t = (by - B0[1]) / Math.max(1, (HB[1] + HF[1]) / 2 - B0[1]), sx = .5;
          for (let it = 0; it < 3; it++) { const xl = lerp(B0[0], HB[0], t), xr = lerp(F0[0], HF[0], t); sx = (bx - xl) / ((xr - xl) || 1); const hy = lerp(HB[1], HF[1], sx), wy = lerp(B0[1], F0[1], sx); t = (by - wy) / ((hy - wy) || 1); }
          const L2 = (A, B, u) => [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u], top = L2(b1, f1, sx), bot = L2(hb1, hf1, sx); let X = top[0] + (bot[0] - top[0]) * t, Y = top[1] + (bot[1] - top[1]) * t;
          const ax = [f1[0] - b1[0], f1[1] - b1[1]], al = Math.hypot(ax[0], ax[1]) || 1, c = clamp((sx - .5) * 2, -1, 1) * .85, n = [ax[0] / al * c, ax[1] / al * c, Math.sqrt(Math.max(.05, 1 - c * c))];
          const bd = [bot[0] - top[0], bot[1] - top[1]]; if (Z) { X = Z.x + (X - Z.x) * Z.k; Y = Z.y + (Y - Z.y) * Z.k; } V.push([X, Y, bx * FG_BK / FG_AW, by * FG_BK / FG_AH, n[0], n[1], n[2], 0, ax[0] / al, ax[1] / al, bd[0], bd[1]]); continue; }
        let ws; if (p.rigid) ws = [1]; else if (p.axis === 'x') { const t = clamp((bx - (p.k1 - 6)) / 12, 0, 1), s2 = t * t * (3 - 2 * t); ws = [1 - s2, s2]; }
        else { const t = clamp((by - (p.k1 - 7)) / 14, 0, 1), s2 = t * t * (3 - 2 * t), tf = clamp((by - (p.k2 - 8)) / 6, 0, 1), sf = tf * tf * (3 - 2 * tf) * (bx > r[0] + (r[2] - r[0]) * .45 ? 1 : .0); ws = [1 - s2, s2 * (1 - sf), s2 * sf]; }
        let X = 0, Y = 0, NX = 0, NY = 0, vn = 0, TX = 0, TY = 0, BX = 0, BY = 0;
        ws.forEach((w, i) => { if (!w) return; const F = fr[i], qx = bx - F.o0[0], qy = by - F.o0[1], uu = qx * F.u0[0] + qy * F.u0[1], vv = qx * F.p0[0] + qy * F.p0[1];
          TX += w * (F.u[0] * F.u0[0] * F.sc + F.pr[0] * F.p0[0]); TY += w * (F.u[1] * F.u0[0] * F.sc + F.pr[1] * F.p0[0]); BX += w * (F.u[0] * F.u0[1] * F.sc + F.pr[0] * F.p0[1]); BY += w * (F.u[1] * F.u0[1] * F.sc + F.pr[1] * F.p0[1]);
          X += w * (F.o[0] + F.u[0] * uu * F.sc + F.pr[0] * vv); Y += w * (F.o[1] + F.u[1] * uu * F.sc + F.pr[1] * vv); NX += w * F.pr[0]; NY += w * F.pr[1]; vn += w * vv; });
        // normale : cylindre autour de l'os (membres, buste, lame), sphère pour la tête
        let n; if (p.sphere) { const F = fr[0], c0 = p.sphere, qx = bx - c0[0], qy = by - c0[1], R = 17, ux = qx / R, uy = qy / R, rr = Math.min(1, Math.hypot(ux, uy)), k = rr > 0 ? rr / Math.hypot(ux, uy) : 0;
            const wx = (F.u[0] * (qx * F.u0[0] + qy * F.u0[1]) + F.pr[0] * (qx * F.p0[0] + qy * F.p0[1])) / R, wy = (F.u[1] * (qx * F.u0[0] + qy * F.u0[1]) + F.pr[1] * (qx * F.p0[0] + qy * F.p0[1])) / R, m = Math.min(1, Math.hypot(wx, wy)), kk = m > 0 ? m / Math.hypot(wx, wy) : 0;
            n = [wx * kk * .95, wy * kk * .95, Math.sqrt(Math.max(.04, 1 - m * m))]; }
        else { const c = clamp(vn / p.hw, -1, 1) * .92, l = Math.hypot(NX, NY) || 1; n = [NX / l * c, NY / l * c, Math.sqrt(Math.max(.05, 1 - c * c))]; }
        if (pl && name === 'head') { // le plumet (derrière et au-dessus de la calotte) tourne autour de la calotte ; le bord du chapeau ne bouge presque pas
          const w = clamp((332 - bx) / 26, 0, 1) * clamp((57 - by) / 9, 0, 1); if (w > 0) { const F = fr[0], qx = 332 - F.o0[0], qy = 50 - F.o0[1], uu = qx * F.u0[0] + qy * F.u0[1], vv = qx * F.p0[0] + qy * F.p0[1], px0 = F.o[0] + F.u[0] * uu * F.sc + F.pr[0] * vv, py0 = F.o[1] + F.u[1] * uu * F.sc + F.pr[1] * vv;
            const th = -pl * w * d, c = Math.cos(th), sn = Math.sin(th), dx = X - px0, dy = Y - py0; X = px0 + dx * c - dy * sn; Y = py0 + dx * sn + dy * c; } }
        if (Z) { X = Z.x + (X - Z.x) * Z.k; Y = Z.y + (Y - Z.y) * Z.k; }
        V.push([X, Y, bx * FG_BK / FG_AW, by * FG_BK / FG_AH, n[0], n[1], n[2], FG_KIND[name] || 0, TX, TY, BX, BY]); }
      const row = gx + 1; for (let iy = 0; iy < gy; iy++) for (let ix = 0; ix < gx; ix++) { const i0 = iy * row + ix, q = [V[i0], V[i0 + 1], V[i0 + row], V[i0 + 1], V[i0 + row + 1], V[i0 + row]]; for (const v of q) this.put(v); }
    }
  },
  // ---- 3. rendu : planche de textures + maillages, dans le calque des personnages composé par la carte graphique ----
  setup(g) {
    this.dx = g.getExtension('OES_standard_derivatives');
    const sh = (t, src) => { const s = g.createShader(t); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
    const p = g.createProgram();
    g.attachShader(p, sh(g.VERTEX_SHADER, 'attribute vec2 pa;attribute vec2 pb;attribute vec3 pc;attribute float pk;attribute vec4 pt;uniform vec4 cam;uniform vec2 shake;uniform float rot;varying vec2 vu;varying vec3 vn;varying float vk;varying vec4 vt;void main(){vk=pk;vt=pt;vec2 q=(pa-cam.xy)*cam.z;float c=cos(rot),s=sin(rot);q=vec2(c*q.x-s*q.y,s*q.x+c*q.y);vec2 S=q+vec2(480.,270.)+shake;gl_Position=vec4(S.x/480.-1.,1.-S.y/270.,0.,1.);vu=pb;vn=pc;}'));
    g.attachShader(p, sh(g.FRAGMENT_SHADER, (this.dx ? '#extension GL_OES_standard_derivatives : enable\n' : '') + 'precision highp float;uniform sampler2D at;uniform float mode;uniform float flash;uniform vec2 px;uniform vec3 skin;uniform vec3 boot;uniform sampler2D nt;uniform sampler2D mt;uniform float hasN;uniform float hasM;varying vec2 vu;varying vec3 vn;varying float vk;varying vec4 vt;float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}void main(){vec4 c=texture2D(at,vu);if(c.a<.004)discard;vec3 n=normalize(vn);'
      // relief de la peinture : les plis, galons et coutures peints bombent la surface
      + 'float l0=lum(c.rgb/max(c.a,.001));float lx=lum(texture2D(at,vu+vec2(px.x,0.)).rgb)-lum(texture2D(at,vu-vec2(px.x,0.)).rgb);float ly=lum(texture2D(at,vu+vec2(0.,px.y)).rgb)-lum(texture2D(at,vu-vec2(0.,px.y)).rgb);'
      + 'vec4 pn=hasN>.5?texture2D(nt,vu):vec4(0.);if(pn.a>.5){vec3 m=pn.rgb*2.-1.;vec2 T2=normalize(vt.xy+1e-5),B2=normalize(vt.zw+1e-5);n=normalize(vec3(T2*m.x-B2*m.y,m.z));}else{'
      + (this.dx ? 'vec2 g2=vec2(dFdx(l0),dFdy(l0))*2.2;n=normalize(n+vec3(-g2.x,g2.y,0.)*.9);' : 'n=normalize(n+vec3(-lx,-ly,0.)*.8);') + '}'
      + 'vec3 al=c.rgb/max(c.a,.001);float sat=max(al.r,max(al.g,al.b))-min(al.r,min(al.g,al.b));float mat=0.;'
      // matières : peau (couleur de la peau), métal (lame, garde), cuir (gant, fusée, bottes), étoffe pour le reste
      + 'if(distance(al,skin)<.13)mat=1.;else if(vk>.5&&vk<1.5)mat=lum(al)<.2?2.:3.;else if(vk>1.5&&vk<2.5)mat=2.;else if(vk>2.5&&distance(al,boot)<.16)mat=2.;'
      // planche des matières peinte : rouge métal, vert peau, bleu cuir, noir étoffe
      + 'if(hasM>.5){vec4 pm=texture2D(mt,vu);if(pm.a>.5)mat=pm.r>.5?3.:pm.g>.5?1.:pm.b>.5?2.:0.;}'
      + 'if(mode<.5){vec3 col=mix(c.rgb,vec3(1.,.95,.86)*c.a,flash*.55);gl_FragColor=vec4(col,c.a);}else{gl_FragColor=vec4(vec3(n.xy*.5+.5,(mat+.5)/4.)*c.a,c.a);}}'));
    g.bindAttribLocation(p, 1, 'pa'); g.bindAttribLocation(p, 2, 'pb'); g.bindAttribLocation(p, 3, 'pc'); g.bindAttribLocation(p, 4, 'pk'); g.bindAttribLocation(p, 5, 'pt'); g.linkProgram(p); if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p));
    const u = {}; for (const n of ['cam', 'shake', 'rot', 'at', 'mode', 'flash', 'px', 'skin', 'boot', 'nt', 'mt', 'hasN', 'hasM']) u[n] = g.getUniformLocation(p, n); this.P = { p, u }; this.buf = g.createBuffer();
    this.copy = Lumen.prog('uniform sampler2D t;void main(){gl_FragColor=texture2D(t,v);}');
  },
  // appelé par Lumen.end : compose le calque des personnages (peinture 2D dessous, maillages dessus) et le tampon de normales
  compose(g, T, cam, w, h) {
    if (!this.q.length) return null; try { if (!this.P) this.setup(g); } catch (e) { console.error('figgl', e); store.set('ct2d.figgl', false); this.q = []; return null; }
    if (this.fw !== w || this.fh !== h || !this.F) { if (this.F) for (const k in this.F) { g.deleteTexture(this.F[k].t); g.deleteFramebuffer(this.F[k].f); } this.F = { A: Lumen.target(w, h), N: Lumen.target(w, h) }; this.fw = w; this.fh = h; }
    const F = this.F, quad = () => g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    g.bindFramebuffer(g.FRAMEBUFFER, F.A.f); g.viewport(0, 0, w, h); g.useProgram(this.copy.p); g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, T.act); g.uniform1i(this.copy.u.t, 0); quad();
    g.bindFramebuffer(g.FRAMEBUFFER, F.N.f); g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
    g.useProgram(this.P.p); const U = this.P.u; g.uniform4f(U.cam, cam.x, cam.y, cam.s, 0); g.uniform2f(U.shake, G.shakeX || 0, G.shakeY || 0); g.uniform1f(U.rot, this.rot || 0); g.uniform1i(U.at, 0); g.uniform2f(U.px, 1 / FG_AW, 1 / FG_AH);
    g.bindBuffer(g.ARRAY_BUFFER, this.buf); for (const [i, sz, off] of [[1, 2, 0], [2, 2, 2], [3, 3, 4], [4, 1, 7], [5, 4, 8]]) { g.enableVertexAttribArray(i); g.vertexAttribPointer(i, sz, g.FLOAT, false, 48, off * 4); } g.uniform1i(U.nt, 1); g.uniform1i(U.mt, 2);
    g.enable(g.BLEND); g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA); let tris = 0;
    for (const it of this.q) { const arr = this.VB.subarray(it.v[0], it.v[1]); g.bufferData(g.ARRAY_BUFFER, arr, g.STREAM_DRAW); g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, it.a.tex); g.uniform1f(U.flash, it.flash); g.uniform3fv(U.skin, it.skin); g.uniform3fv(U.boot, it.boot); g.uniform1f(U.hasN, it.a.nt ? 1 : 0); g.uniform1f(U.hasM, it.a.mt ? 1 : 0); g.activeTexture(g.TEXTURE1); g.bindTexture(g.TEXTURE_2D, it.a.nt || it.a.tex); g.activeTexture(g.TEXTURE2); g.bindTexture(g.TEXTURE_2D, it.a.mt || it.a.tex); g.activeTexture(g.TEXTURE0);
      for (const [fb, mode] of [[F.A, 0], [F.N, 1]]) { g.bindFramebuffer(g.FRAMEBUFFER, fb.f); g.viewport(0, 0, w, h); g.uniform1f(U.mode, mode); g.drawArrays(g.TRIANGLES, 0, arr.length / 12); } tris += arr.length / 36; }
    g.disable(g.BLEND); for (const i of [1, 2, 3, 4, 5]) g.disableVertexAttribArray(i); g.bindBuffer(g.ARRAY_BUFFER, Lumen.vb); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
    this.n = this.q.length; this.tris = tris; this.q = []; return F;
  },
  // ---- 4. ce qui reste en 2D, sous les maillages : fourreau, bras libre, main gauche, cape ----
  back(g, f) {
    const j = f.J, S = norm(f.look), C = f.flash > 0 ? (c => shade(c, .7)) : (c => c), prev = FigPlus.cur; FigPlus.cur = f;
    try { g.save(); g.lineJoin = 'round'; drawArmS(g, S, j.bsh, j.bel, j.bwr, f.dir, C, true); drawHand(g, j.bwr, Math.atan2(j.bwr[1] - j.bel[1], j.bwr[0] - j.bel[0]), S.skin, C, false);
      if (f.offhand && typeof drawOffhand === 'function') drawOffhand(g, f, j, C); if (S.style !== 'rodeur' && !f._fgCapeNext) drawCape(g, f, j, S, C); g.restore(); } finally { FigPlus.cur = prev; }
  },
  init() {
    const la = Lumen.actor.bind(Lumen); Lumen.actor = function (g, f, venue) {
      if (!FigGL.use(f)) return la(g, f, venue); const Lt = LIGHTING[venue] || LIGHTING.salle; LIGHT[0] = Lt.from[0]; LIGHT[1] = Lt.from[1]; RIM.a = 0; RIM.gy = 0; RIM.pat = null;
      let a; try { a = FigGL.atlas(f); } catch (e) { console.error('figgl atlas', e); FigGL.fail = (FigGL.fail || 0) + 1; if (FigGL.fail > 3) store.set('ct2d.figgl', false); return la(g, f, venue); }
      f._fgCapeNext = !!(a.capeOk && f.cloth && f.cloth.O && f.cloth.O.length > 2); drawTrail(g, f); FigGL.back(g, f);
      const v0 = FigGL.vn; f._fgCape = FigGL.cape(f, a); FigGL.push(f, f.J, a); const v = [v0, FigGL.vn]; const S = norm(f.look), hx = c => { const m = /^#?([0-9a-f]{6})$/i.exec(c || ''); return m ? [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16) / 255) : [9, 9, 9]; }; FigGL.q.push({ v, a, flash: f.flash > 0 ? 1 : 0, skin: hx(S.skin), boot: hx(S.boot) });
    };
    const b0 = Lumen.begin.bind(Lumen); Lumen.begin = function (Gm, cam, sx, sy, rot) { FigGL.q = []; FigGL.vn = 0; FigGL.rot = rot || 0; return b0(Gm, cam, sx, sy, rot); };
    const row = $('optLumen') && $('optLumen').parentElement; if (row && !$('optFigGL')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optFigGL'; c.textContent = 'Personnages par la carte graphique (essai)'; c.addEventListener('click', () => { store.set('ct2d.figgl', !FigGL.on()); c.setAttribute('aria-pressed', FigGL.on()); }); row.appendChild(c); c.setAttribute('aria-pressed', FigGL.on()); }
  },
};
// la rapière d'origine (sans la lame qui plie) pour la cuisson
const drawRapier0FG = typeof drawRapier4 !== 'undefined' ? drawRapier4 : drawRapier;
