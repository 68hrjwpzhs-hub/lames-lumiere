// =============================== Révolution graphique · la peinture des artistes ===============================
// Le moteur accepte maintenant ce que peint l'équipe, sans changer une règle du combat :
//  · personnages : planche couleur, planche de relief (normales), planche des matières, aux zones du gabarit (2048×1024) ;
//    une pièce absente de la planche peinte garde la peinture du code ;
//  · décors : 1 à 6 plans peints (1920×1080), chacun avec sa profondeur (0 horizon … 1 sol des duellistes) ;
//  · effets : planches d'images jouées sur un événement (parade, touche, croisement, blocage) ;
//  · jeu d'acteur des coups (décalages par phase) et lumière de chaque lieu, réglés dans l'atelier.
// Les livraisons du dossier art/ sont intégrées par tools/art_build.py (src/art_pack.js) ; l'atelier les charge à chaud.
const ART_NAMES = { legB: 'Jambe arrière', legF: 'Jambe avant', skirt: 'Jupe, pans, robe', torso: 'Buste et cou', head: 'Tête et chapeau', arm: 'Bras armé', rapier: 'Rapière', hand: 'Main armée', cape: 'Étoffe de la cape' };
const ART_EVENTS = { parry: 'parade', hit: 'touche', clash: 'croisement', block: 'blocage' };
const ART_LUM_KEYS = { key: [0, 1.2, 'Lumière principale'], amb: [0, 1.2, 'Ambiance'], fog: [0, .8, 'Brume'], gloss: [0, .8, 'Brillant du sol'], kz: [-1, 1.5, 'Hauteur de la lumière'] };
// 6.2 · jeu d'acteur par défaut de chaque coup (degrés ; hauteur en pixels) : élan avant de frapper, buste qui accompagne,
// tête qui suit la lame, bras libre en contrepoids, petit rebond au retour en garde. Pendant l'exécution, seuls la tête et le bras libre
// bougent (la lame reste celle des règles). Ce que les animateurs règlent dans l'atelier remplace la phase correspondante.
const ART_ANIM_DEFAULT = {
  jab: { prep: { torso: -2, a1: -4, b1: 4 }, exec: { head: 3, b1: -6 }, rec: { torso: 1.5, py: 1 } },
  fente: { prep: { torso: -4, a1: -5, py: -3, b1: 10 }, exec: { head: 5, b1: -14 }, rec: { torso: 3, py: 1.5, b1: 4 } },
  bassa: { prep: { torso: 3, py: -4, a1: -3 }, exec: { head: 6, b1: -8 }, rec: { py: 2, torso: -1.5 } },
  degage: { prep: { a1: -3, a2: 4, torso: -1 }, exec: { head: 3 }, rec: { torso: 1 } },
  circ: { prep: { a2: 5, torso: -1.5 }, exec: { head: 3, b1: -5 }, rec: { torso: 1 } },
  compo: { prep: { torso: -2, a1: -3 }, exec: { head: 4, b1: -6 }, rec: { torso: 2 } },
  heavy: { prep: { torso: -7, a1: -10, py: -4, b1: 12 }, exec: { head: 6, b1: -16 }, rec: { torso: 4, py: 2, b1: 5 } },
  riposte: { prep: { torso: 3, a1: -2 }, exec: { head: 4, b1: -9 }, rec: { torso: 1.5 } },
  beat: { prep: { a1: -6, torso: -1 }, exec: { head: 2 }, rec: { torso: 1 } },
  tajo: { prep: { a1: -9, torso: -4, b1: 8 }, exec: { head: 4, b1: -10 }, rec: { torso: 3 } },
  griffe: { prep: { torso: -3, py: -2 }, exec: { head: 4, b1: -6 }, rec: { torso: 2 } },
  lie: { prep: { a2: 4, torso: -1 }, exec: { head: 2 }, rec: { torso: 1 } },
};
// 6.3 · scuola italiana : chaque coup joué comme dans les traités (Capo Ferro, Fabris, Giganti), sur tout le coup.
// Temps s : 0→1 préparation, 1→2 exécution, 2→3 retour ; chaque clé : [[s, valeur], …], nulle à 0 et à 3, lissée entre les points.
// Pendant l'exécution, seuls la tête et le bras libre bougent (la lame reste celle des règles) ; le reste ne joue qu'avant et après.
const ITAL = {
  // stoccata : compacte, le poignet mène, le contrepoids répond à peine
  jab: { torso: [[.5, -2.5], [.95, -1], [2.25, 2], [2.7, -.6]], a1: [[.55, -4], [.9, -1.5]], a3: [[.5, 3], [.9, -2], [2.3, -2.5]], head: [[.6, -2], [1.4, 4], [2.4, 1]], b1: [[.6, 10], [1.3, -14], [1.8, -18], [2.35, 6], [2.75, -2]], b2: [[.6, 12], [1.5, -16], [2.4, 6]], py: [[.55, -1.5], [2.3, 1]] },
  // passata / stoccata lunga : on se charge sur la jambe arrière, le bras libre monte comme une aile,
  // puis il est lancé en arrière et vers le bas (contrappeso) ; au retour, c'est lui qui « rappelle » le corps
  fente: { torso: [[.45, -5], [.9, -2], [2.2, 3.5], [2.65, -1.5]], a1: [[.5, -6], [.92, -2]], a3: [[.5, 4], [.9, -1], [2.25, -3]], py: [[.5, -4], [.9, -1.5], [2.3, 2], [2.7, -.8]], head: [[.5, -3], [1.35, 6], [1.9, 7], [2.5, 2]], b1: [[.55, 26], [.95, 18], [1.4, -22], [1.85, -30], [2.25, 14], [2.65, -4]], b2: [[.55, 30], [1.4, -22], [1.9, -26], [2.35, 10]] },
  // stoccata sotto : le corps plonge, la tête passe sous la ligne, la main libre descend vers le sol
  bassa: { torso: [[.5, 3], [.92, 4], [2.3, -2.5]], py: [[.5, -5], [.92, -3], [2.3, 2.5]], a1: [[.5, -4]], head: [[.55, 4], [1.4, 9], [1.9, 8], [2.4, 2]], b1: [[.6, -8], [1.4, 34], [1.9, 38], [2.4, 8]], b2: [[.6, -6], [1.4, 28], [1.9, 30], [2.4, 6]] },
  // cavazione : la pointe fait un petit cercle serré autour du fer adverse, le corps ne bouge presque pas
  degage: { a3: [[.25, 7], [.5, 0], [.75, -6], [.95, -2], [2.3, -2]], a2: [[.25, -3], [.5, 5], [.75, 2]], torso: [[.4, -1.5], [2.3, 1.5]], head: [[.5, -2], [1.4, 3], [2.3, 1]], b1: [[.5, 6], [1.4, -10], [2.3, 4]], b2: [[.5, 8], [1.4, -10]] },
  // imbroccata : le corps s'élève, la main monte en prima, puis tout plonge vers la poitrine adverse
  circ: { py: [[.45, 3], [.9, -2.5], [2.3, 1.5]], torso: [[.45, -5], [.9, 1], [2.3, 3], [2.7, -1]], a1: [[.45, 6], [.85, 2]], a3: [[.45, -6], [.9, 3], [2.3, -3]], head: [[.45, -4], [1.3, 6], [2.4, 2]], b1: [[.45, 24], [1.35, -20], [1.9, -26], [2.35, 10]], b2: [[.45, 26], [1.4, -20], [2.35, 8]] },
  // finta e cavazione : une menace franche (le buste avance, la tête vise), puis le corps se rassemble et passe dessous
  compo: { torso: [[.25, 4], [.5, -1], [.7, -4], [.95, -1.5], [2.3, 2.5]], head: [[.25, 4], [.5, -1], [.75, -2], [1.4, 5], [2.4, 1.5]], a3: [[.25, -3], [.55, 6], [.8, -4], [2.3, -2]], py: [[.25, 1], [.7, -3], [2.3, 1.5]], b1: [[.25, -8], [.7, 16], [1.4, -18], [1.9, -22], [2.35, 8]], b2: [[.7, 18], [1.4, -18], [2.35, 6]] },
  // fente lourde : la grande charge ; le bras libre très haut, la tête rentrée, puis l'abandon complet vers l'avant
  heavy: { torso: [[.4, -8], [.85, -3], [2.2, 4.5], [2.65, -2]], a1: [[.45, -11], [.9, -3]], a3: [[.45, 6], [2.3, -4]], py: [[.45, -5], [.9, -2], [2.3, 2.5], [2.7, -1]], head: [[.45, -5], [1.3, 7], [1.9, 8], [2.5, 2]], b1: [[.5, 34], [.9, 26], [1.35, -26], [1.85, -34], [2.25, 16], [2.65, -5]], b2: [[.5, 36], [1.4, -26], [1.9, -30], [2.35, 12]] },
  // risposta : sans préparation, la tête claque vers la cible, le contrepoids part d'un coup
  riposte: { torso: [[.5, 2], [2.3, 2], [2.7, -.8]], head: [[.6, 2], [1.3, 6], [2.4, 1.5]], b1: [[.6, 6], [1.35, -20], [1.8, -24], [2.35, 8]], b2: [[.6, 8], [1.4, -18], [2.35, 6]], a3: [[2.3, -3]] },
  // battuta : un coup sec du poignet, la hanche aide à peine, le bras libre se fige
  beat: { a3: [[.55, 9], [.9, 3], [2.25, -4], [2.6, 1.5]], a2: [[.55, -3]], torso: [[.55, -2], [2.3, 1.5]], head: [[.5, -1.5], [1.4, 2]], b1: [[.55, 8], [1.4, -6], [2.3, 3]], b2: [[.55, 10], [1.4, -6]] },
  // legamento : le fer est pris en spirale, lentement, le corps s'incline et accompagne
  lie: { a3: [[.35, 6], [.7, -3], [.95, 2], [2.3, -2]], a2: [[.35, 4], [.7, -2]], torso: [[.5, 3], [.95, 2], [2.4, -1.5]], head: [[.5, 3], [1.4, 4], [2.4, 1]], b1: [[.5, 12], [1.4, -10], [2.35, 5]], b2: [[.5, 14], [1.4, -10]] },
  // adversaires : le tajo (taille espagnole) et les griffes gardent leur caractère, plus ample
  tajo: { a1: [[.5, -10], [.9, -4]], torso: [[.5, -5], [2.3, 3]], head: [[.5, -3], [1.4, 5], [2.4, 1]], b1: [[.5, 18], [1.4, -16], [2.35, 6]], b2: [[.5, 18], [1.4, -14]] },
  griffe: { torso: [[.5, -4], [2.3, 2.5]], py: [[.5, -3], [2.3, 1.5]], head: [[.5, -2], [1.4, 5]], b1: [[.5, -10], [1.4, 8]] },
};
const ital = (pts, s) => { let a = [0, 0]; for (const b of pts.concat([[3, 0]])) { if (s <= b[0]) { const u = (s - a[0]) / Math.max(1e-3, b[0] - a[0]), e = u * u * (3 - 2 * u); return a[1] + (b[1] - a[1]) * e; } a = b; } return 0; };
// 6.4 · l'identité des lames : chaque coup a son propre chemin de pointe, joué sur la lame DESSINÉE seulement.
// La lame de jeu (portées, parades, touches) ne change pas : la trajectoire dessinée la rejoint avant l'exécution et la quitte après.
// s : 0→1 préparation, 1→2 exécution, 2→3 retour ; a3 : angle de la lame, bz : profondeur (la pointe passe devant ou derrière),
// a2 : coude. Les cercles « en profondeur » se lisent de profil : la lame raccourcit et s'allonge pendant que la pointe monte et descend.
const B6 = {
  bump: (s, a, b) => s <= a || s >= b ? 0 : Math.sin(Math.PI * (s - a) / (b - a)),
  ph: (s, a, b, n) => s <= a || s >= b ? 0 : 2 * Math.PI * n * (s - a) / (b - a),
  ss: u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); },
};
const BLADE6 = {
  // stoccata dritta : la pointe s'abaisse d'un rien puis remonte dans la ligne, sans détour ; au retour, elle reste « en présence »
  jab: s => { const b = B6.bump; return { a3: -8 * b(s, .02, .8) + 9 * b(s, 2.05, 2.75), a2: 7 * b(s, .02, .8), bz: 0 }; },
  // passata : un tour de cavazione complet avant de partir (la pointe tourne autour du fer adverse), puis le grand départ ;
  // au retour la pointe balaie bas et revient en ligne
  fente: s => { const p = B6.ph(s, .04, .8, 1); return { a3: 11 * Math.sin(p) - 13 * B6.bump(s, 2.0, 2.55) + 6 * B6.bump(s, 2.45, 2.95), bz: 24 * (1 - Math.cos(p)) / 2, a2: 6 * B6.bump(s, .04, .8) }; },
  // stoccata sotto : la pointe plonge sous la garde adverse, main tournée, la lame vue en raccourci ; elle se relève en sortant
  bassa: s => { const b = B6.bump; return { a3: -26 * b(s, 0, .82) + 12 * b(s, 2.05, 2.8), bz: 18 * b(s, 0, .82), a2: -6 * b(s, 0, .82) }; },
  // cavazione : deux petits cercles serrés autour du fer, rapides, la main ne bouge pas
  degage: s => { const p = B6.ph(s, .05, .82, 2), r = B6.bump(s, .05, .82); return { a3: 8 * r * Math.sin(p), bz: 22 * r * Math.cos(p), a2: 0 }; },
  // imbroccata : la main monte en prima, la pointe passe très haut, puis plonge de haut en bas vers la poitrine
  circ: s => { const b = B6.bump; return { a3: 42 * b(s, 0, .85) - 15 * b(s, 2.0, 2.6), a2: 16 * b(s, 0, .85), bz: 10 * b(s, .3, .85) }; },
  // finta e cavazione : la pointe menace droit devant, puis fait un demi-tour par-dessous pour passer de l'autre côté
  compo: s => { const b = B6.bump, p = B6.ph(s, .38, .85, 1); return { a3: -5 * b(s, 0, .38) - 15 * Math.sin(p / 2) * (s > .38 && s < .85 ? 1 : 0) + 7 * b(s, 2.1, 2.8), bz: 28 * Math.sin(p) * (s > .38 && s < .85 ? 1 : 0), a2: -4 * b(s, 0, .38) }; },
  // fente lourde : le moulinet est déjà dans le jeu ; au retour, la lame retombe lourdement puis se redresse
  heavy: s => { const b = B6.bump; return { a3: -16 * b(s, 2.0, 2.5) + 7 * b(s, 2.4, 2.95), bz: 0, a2: 0 }; },
  // risposta : pas de préparation ; au retour, un tour de poignet sec, signature du tireur qui vient de toucher
  riposte: s => { const p = B6.ph(s, 2.05, 2.7, 1), r = B6.bump(s, 2.05, 2.7); return { a3: 10 * r * Math.sin(p), bz: 20 * r * Math.cos(p), a2: 0 }; },
  // battuta : la lame s'ouvre largement, claque, puis rebondit
  beat: s => { const b = B6.bump; return { a3: 24 * b(s, 0, .85) - 11 * b(s, 2.0, 2.4) + 4 * b(s, 2.35, 2.8), bz: -8 * b(s, 0, .85), a2: 8 * b(s, 0, .85) }; },
  // legamento : une spirale qui se resserre, un tour et demi, pour envelopper le fer
  lie: s => { const p = B6.ph(s, 0, .85, 1.5), r = B6.bump(s, 0, .85) * (1 - .6 * clamp(s / .85, 0, 1)); return { a3: 14 * r * Math.sin(p), bz: 30 * r * Math.cos(p), a2: 4 * r }; },
  // tajo espagnol : un moulinet complet de la lame avant la taille descendante
  tajo: s => { const u = clamp((s - .02) / .74, 0, 1); return { a3: s < .76 ? -360 * B6.ss(u) : 0, bz: 0, a2: 10 * B6.bump(s, 0, .76) }; },
};
const ART_ANIM_KEYS = { torso: 'Buste', a1: 'Épaule', a2: 'Coude', head: 'Tête', py: 'Hauteur', b1: 'Bras libre' };
const Art = {
  rev: 0, heros: {}, decors: {}, effets: {}, anim: {}, lum: {}, lum0: {}, live: [],
  img(src) { return new Promise((ok, ko) => { if (src instanceof HTMLCanvasElement || src instanceof HTMLImageElement && src.complete) return ok(src); const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }); },
  regions() { const o = {}; for (const k in FG_PARTS) o[k] = FG_PARTS[k].r; o.cape = FG_CAPE; return o; },
  // à qui appartient une tenue : un héros (par son identifiant) ou une tenue d'adversaire (clé de LOOKS)
  key(f) {
    const L = f && f.look; if (!L) return null; const same = (a) => a && a.style === L.style && a.coat === L.coat && a.skin === L.skin;
    for (const id in HEROES) if (same(HEROES[id].look)) return id; for (const k in LOOKS) if (k !== 'player' && same(LOOKS[k])) return k; return null;
  },
  sigOf(f) { const k = this.key(f), h = k && this.heros[k]; return h ? k + ':' + h.rev : ''; },
  forget() { if (typeof FigGL === 'undefined') return; const g = Lumen.gl; for (const [k, v] of FigGL.cache) { if (g) { g.deleteTexture(v.tex); if (v.nt) g.deleteTexture(v.nt); if (v.mt) g.deleteTexture(v.mt); } } FigGL.cache.clear(); },
  // ---- personnages ----
  sheet(src) { const c = document.createElement('canvas'); c.width = FG_AW; c.height = FG_AH; c.getContext('2d').drawImage(src, 0, 0, FG_AW, FG_AH); return c; },
  filled(c) { const g = c.getContext('2d'), R = this.regions(), o = {}; for (const k in R) { const r = R[k], x = Math.floor(r[0] * FG_BK), y = Math.floor(r[1] * FG_BK), w = Math.ceil((r[2] - r[0]) * FG_BK), h = Math.ceil((r[3] - r[1]) * FG_BK), d = g.getImageData(x, y, w, h).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 8) n++; o[k] = n > 20; } return o; },
  async setHero(id, maps) {
    const h = this.heros[id] || (this.heros[id] = { rev: 0 });
    for (const k of ['couleur', 'relief', 'matieres']) if (maps[k] !== undefined) { if (maps[k] === null) { delete h[k]; continue; } const c = this.sheet(await this.img(maps[k])); h[k] = c; if (k === 'couleur') h.filled = this.filled(c); }
    h.rev++; this.rev++; this.forget(); return h;
  },
  clearHero(id) { delete this.heros[id]; this.rev++; this.forget(); },
  // la planche cuite par le code, où chaque pièce peinte remplace la sienne
  applyHero(f, a) {
    const h = this.heros[this.key(f)]; a.painted = []; if (!h || !h.couleur || !a.cv) return; const g = a.cv.getContext('2d'), R = this.regions(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (const k in R) { if (!h.filled[k]) continue; const r = R[k], x = r[0] * FG_BK, y = r[1] * FG_BK, w = (r[2] - r[0]) * FG_BK, hh = (r[3] - r[1]) * FG_BK; g.clearRect(x, y, w, hh); g.drawImage(h.couleur, x, y, w, hh, x, y, w, hh); a.painted.push(k); if (k === 'cape') a.capeOk = true; }
    g.restore();
  },
  mapsHero(f, a) {
    const h = this.heros[this.key(f)], g = Lumen.gl; if (!h || !g) return;
    const up = c => { const t = Lumen.texture(); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, c); g.generateMipmap(g.TEXTURE_2D); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR); return t; };
    if (h.relief) a.nt = up(h.relief); if (h.matieres) a.mt = up(h.matieres);
  },
  // ---- gabarits et planches de départ (la peinture actuelle du code, à repeindre) ----
  stubFor(id) { const L = HEROES[id] ? HEROES[id].look : LOOKS[id], f = new Fighter(true, Object.assign({}, L)); f.rapier = HEROES[id] ? HEROES[id].rapier : RAPIERS.garnison; f.dir = 1; return f; },
  starters(id) {
    const f = this.stubFor(id), a = FigGL.bake(f), W2 = FG_AW, H2 = FG_AH, src = a.cv.getContext('2d').getImageData(0, 0, W2, H2).data, S = norm(f.look);
    const rel = document.createElement('canvas'), mat = document.createElement('canvas'); rel.width = mat.width = W2; rel.height = mat.height = H2;
    const rg = rel.getContext('2d'), mg = mat.getContext('2d'), RD = rg.createImageData(W2, H2), MD = mg.createImageData(W2, H2), rd = RD.data, md = MD.data, R = this.regions();
    const hex = c => { const m = /^#?([0-9a-f]{6})$/i.exec(c || ''); return m ? [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16)) : [999, 999, 999]; }, sk = hex(S.skin), bt = hex(S.boot), dist = (r, g2, b, c) => Math.hypot(r - c[0], g2 - c[1], b - c[2]) / 255;
    // forme de chaque pièce pour la normale de départ : axe vertical (x), horizontal (y) ou sphère
    const shape = { legB: ['x', 40, 9.5], legF: ['x', 110, 9.5], torso: ['x', 220, 21], skirt: ['x', 460, 30], cape: ['x', (FG_CAPE[0] + FG_CAPE[2]) / 2, 21], arm: ['y', 42, 8.5], rapier: ['y', 96, 3], head: ['s', 330, 70, 17], hand: ['s', 622, 96, 7] };
    for (const k in R) { const r = R[k], sh = shape[k]; if (!sh) continue;
      for (let y = Math.floor(r[1] * FG_BK); y < Math.ceil(r[3] * FG_BK); y++) for (let x = Math.floor(r[0] * FG_BK); x < Math.ceil(r[2] * FG_BK); x++) {
        const i = (y * W2 + x) * 4; if (src[i + 3] < 10) continue; const ux = x / FG_BK, uy = y / FG_BK; let nx = 0, ny = 0;
        if (sh[0] === 'x') nx = clamp((ux - sh[1]) / sh[2], -1, 1) * .9; else if (sh[0] === 'y') ny = -clamp((uy - sh[1]) / sh[2], -1, 1) * .9; else { nx = clamp((ux - sh[1]) / sh[3], -1, 1) * .9; ny = -clamp((uy - sh[2]) / sh[3], -1, 1) * .9; const m = Math.hypot(nx, ny); if (m > .95) { nx *= .95 / m; ny *= .95 / m; } }
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)); rd[i] = Math.round((nx * .5 + .5) * 255); rd[i + 1] = Math.round((ny * .5 + .5) * 255); rd[i + 2] = Math.round((nz * .5 + .5) * 255); rd[i + 3] = 255;
        const cr = src[i], cg = src[i + 1], cb = src[i + 2], lum = (cr * .299 + cg * .587 + cb * .114) / 255;
        let m = [0, 0, 0]; if (dist(cr, cg, cb, sk) < .13) m = [0, 255, 0]; else if (k === 'rapier') m = lum < .2 ? [0, 0, 255] : [255, 0, 0]; else if (k === 'hand' || ((k === 'legB' || k === 'legF') && dist(cr, cg, cb, bt) < .16)) m = [0, 0, 255];
        md[i] = m[0]; md[i + 1] = m[1]; md[i + 2] = m[2]; md[i + 3] = 255; } }
    rg.putImageData(RD, 0, 0); mg.putImageData(MD, 0, 0); return { couleur: a.cv, relief: rel, matieres: mat };
  },
  gabarit(id) {
    const f = this.stubFor(id), a = FigGL.bake(f), c = document.createElement('canvas'); c.width = FG_AW; c.height = FG_AH; const g = c.getContext('2d'), R = this.regions(), K = FG_BK;
    g.globalAlpha = .35; g.drawImage(a.cv, 0, 0); g.globalAlpha = 1; g.lineWidth = 2; g.font = '600 22px sans-serif';
    const lab = (t, x, y, col) => { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 5; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y); };
    for (const k in R) { const r = R[k]; g.setLineDash([10, 6]); g.strokeStyle = '#c0392b'; g.lineWidth = 2; g.strokeRect(r[0] * K, r[1] * K, (r[2] - r[0]) * K, (r[3] - r[1]) * K); g.setLineDash([]); lab(ART_NAMES[k] || k, r[0] * K + 6, r[1] * K - 8 < 20 ? r[1] * K + 24 : r[1] * K - 8, '#c0392b'); }
    // os et articulations : la pièce tourne autour de ces points
    g.strokeStyle = '#1f6fb2'; g.fillStyle = '#1f6fb2'; g.lineWidth = 3;
    for (const k in FG_PARTS) { const p = FG_PARTS[k], bones = k === 'rapier' ? [[p.bones[0][0], [p.bones[0][0][0] + a.len, p.bones[0][0][1]]]] : p.bones; if (!bones) continue;
      for (const b of bones) { g.beginPath(); g.moveTo(b[0][0] * K, b[0][1] * K); g.lineTo(b[1][0] * K, b[1][1] * K); g.stroke(); for (const q of b) { g.beginPath(); g.arc(q[0] * K, q[1] * K, 6, 0, 7); g.fill(); } } }
    if (a.skb) { g.strokeStyle = '#1f6fb2'; g.setLineDash([4, 4]); g.beginPath(); const [B0, F0, HB, HF] = a.skb; g.moveTo(B0[0] * K, B0[1] * K); g.lineTo(F0[0] * K, F0[1] * K); g.lineTo(HF[0] * K, HF[1] * K); g.lineTo(HB[0] * K, HB[1] * K); g.closePath(); g.stroke(); g.setLineDash([]); }
    g.font = '18px sans-serif'; const notes = [`Gabarit · ${HEROES[id] ? HEROES[id].name : id} · 2048 × 1024 · 3 px par unité · personnage tourné vers la droite`, 'Rouge : zone de chaque pièce (ne pas déborder) · bleu : os et articulations (la pièce tourne autour) · pointillés : quadrilatère de la jupe',
      'couleur.png : la peinture, fond transparent · relief.png : normales OpenGL (rouge = droite, vert = haut, bleu = vers l\'écran ; plat = 128,128,255)', 'matieres.png : rouge = métal, vert = peau, bleu = cuir, noir = étoffe · une zone laissée vide garde la peinture du code'];
    notes.forEach((t, i) => lab(t, 24, 830 + i * 30, '#222')); return c;
  },
  gabaritDecor(v) {
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d'), k = 2; g.globalAlpha = .5; g.drawImage(venueCanvas(v), 0, 0, 1920, 1080); g.globalAlpha = 1;
    const line = (y, t, col) => { g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([14, 8]); g.beginPath(); g.moveTo(0, y * k); g.lineTo(1920, y * k); g.stroke(); g.setLineDash([]); g.font = '600 26px sans-serif'; g.fillStyle = col; g.fillText(t, 20, y * k - 10); };
    line(GROUND, 'Sol des duellistes (profondeur 1)', '#c0392b'); line(FLOOR_Y, 'Pied du mur : le sol brille et reflète en dessous', '#1f6fb2');
    g.strokeStyle = 'rgba(192,57,43,.8)'; g.lineWidth = 3; g.strokeRect(120 * k, (GROUND - 300) * k, 720 * k, 300 * k); g.fillStyle = '#c0392b'; g.fillText('Zone du combat : laisser lisible', 128 * k, (GROUND - 300) * k + 34);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 1920, 78 * k); g.fillStyle = '#fff'; g.fillText('Bandeau de l\'interface (vies, temps)', 20, 50);
    g.font = '20px sans-serif'; g.fillStyle = '#222'; g.fillText(`Gabarit du lieu « ${VENUES[v] ? VENUES[v].name : v} » · 1920 × 1080 · 2 px par unité · plan1.png = le fond … plan6.png = le premier plan, fonds transparents`, 20, 1060); return c;
  },
  // ---- décors en plans ----
  async setDecor(v, plans, opts = {}) { const P = []; for (const p of plans) P.push({ img: await this.img(p.img || p.src), depth: clamp(+p.depth, 0, 1.2), name: p.name || '' }); P.sort((a, b) => a.depth - b.depth); this.decors[v] = { plans: P, lights: opts.lights !== false }; this.rev++; return this.decors[v]; },
  clearDecor(v) { delete this.decors[v]; this.rev++; },
  drawDecor(g, v, cam, t) {
    const D = this.decors[v]; if (!D) return false; const s = cam.s || 1;
    // chaque plan glisse selon sa profondeur : 0 suit l'écran (horizon), 1 suit le monde (sol des duellistes)
    for (const p of D.plans) { const f = p.depth, sL = Math.pow(s, f), cx = W / 2 + (cam.x - W / 2) * f, cy = H / 2 + (cam.y - H / 2) * f, k = sL / s;
      g.drawImage(p.img, (0 - cx) * k + cam.x, (0 - cy) * k + cam.y, W * k, H * k); }
    if (D.lights) drawVenueLights(g, v, t); return true;
  },
  // ---- effets dessinés ----
  async setEffet(name, o) { this.effets[name] = Object.assign({ images: 8, ips: 24, taille: 120, sur: 'parade', fusion: 'lumière' }, o, { img: await this.img(o.img || o.src) }); this.rev++; return this.effets[name]; },
  fire(type, at) { const sur = ART_EVENTS[type] || type; for (const n in this.effets) { const e = this.effets[n]; if (e.sur === sur && at) this.live.push({ e, x: at[0], y: at[1], t0: G.time, flip: Math.random() < .5 }); } if (this.live.length > 24) this.live.splice(0, this.live.length - 24); },
  drawFx(g) {
    if (!this.live.length) return; const now = G.time; this.live = this.live.filter(l => (now - l.t0) * l.e.ips < l.e.images);
    for (const l of this.live) { const e = l.e, i = Math.floor((now - l.t0) * e.ips), fw = e.img.width / e.images, fh = e.img.height, sz = e.taille; g.save(); g.globalCompositeOperation = e.fusion === 'normal' ? 'source-over' : 'lighter'; g.translate(l.x, l.y); if (l.flip) g.scale(-1, 1); g.drawImage(e.img, i * fw, 0, fw, fh, -sz / 2, -sz * fh / fw / 2, sz, sz * fh / fw); g.restore(); }
  },
  // ---- jeu d'acteur des coups ----
  animTarget(kind, ph, tgt, t, m) {
    const own = this.anim[kind] && this.anim[kind][ph], I = !own && store.get('ct2d.ital', true) !== false && ITAL[kind];
    if (I) { const sP = ph === 'prep' ? clamp(t / Math.max(.03, m.wu), 0, 1) : ph === 'exec' ? 1 + clamp((t - m.wu) / Math.max(.03, m.act), 0, 1) : 2 + clamp((t - m.wu - m.act) / Math.max(.03, m.rec), 0, 1); for (const k in I) tgt[k] = (tgt[k] || 0) + ital(I[k], sP); return; }
    const A = own || (store.get('ct2d.jeu62', true) !== false && ART_ANIM_DEFAULT[kind] && ART_ANIM_DEFAULT[kind][ph]); if (!A) return; const u = ph === 'prep' ? t / Math.max(.03, m.wu) : ph === 'exec' ? (t - m.wu) / Math.max(.03, m.act) : (t - m.wu - m.act) / Math.max(.03, m.rec), e = Math.sin(Math.PI * clamp(u, 0, 1));
    for (const k in A) tgt[k] = (tgt[k] || 0) + A[k] * e;
  },
  // décalage de la lame dessinée : nul pendant l'exécution (± 0,03 s), libre avant et après
  bladeOff(f) {
    const m = f.move; if (f.state !== 'attack' || !m || !m.kind || m.kind === 'pending' || store.get('ct2d.lames6', true) === false) return null; const F = BLADE6[m.kind]; if (!F) return null;
    const t = f.t, A = m.wu - .03, B = m.wu + m.act + .02, w = t > A && t < B ? 0 : t <= A ? clamp((A - t) / .03, 0, 1) : clamp((t - B) / .04, 0, 1); if (!w) return null;
    const s = t < m.wu ? clamp(t / Math.max(.03, m.wu), 0, 1) : t <= m.wu + m.act ? 1 + (t - m.wu) / Math.max(.03, m.act) : 2 + clamp((t - m.wu - m.act) / Math.max(.03, m.rec), 0, 1), o = F(s);
    return { a3: (o.a3 || 0) * w, bz: (o.bz || 0) * w, a2: (o.a2 || 0) * w };
  },
  // ---- lumière des lieux ----
  setLum(v, o) { if (!LUMEN_V[v]) return; if (!this.lum0[v]) this.lum0[v] = Object.assign({}, LUMEN_V[v]); this.lum[v] = Object.assign(this.lum[v] || {}, o); Object.assign(LUMEN_V[v], o); },
  resetLum(v) { if (this.lum0[v]) Object.assign(LUMEN_V[v], this.lum0[v]); delete this.lum[v]; },
  // ---- sorties : un fichier à télécharger (site, appli) ; dans un aperçu sans téléchargement, le texte est copié ----
  save(name, data) {
    try { const blob = data instanceof HTMLCanvasElement ? null : new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.download = name;
      if (blob) a.href = URL.createObjectURL(blob); else a.href = data.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); } catch (e) { }
    if (!(data instanceof HTMLCanvasElement)) { try { navigator.clipboard.writeText(typeof data === 'string' ? data : JSON.stringify(data, null, 1)); } catch (e) { } }
    if (typeof toastMsg === 'function') toastMsg(`${name} : enregistré (copié aussi dans le presse-papiers si c'est du texte).`);
  },
  // ---- livraisons intégrées au jeu (tools/art_build.py) ----
  async loadPack(P) {
    if (!P) return; try {
      for (const id in P.heros || {}) await this.setHero(id, P.heros[id]);
      for (const v in P.decors || {}) await this.setDecor(v, P.decors[v].plans, P.decors[v]);
      for (const n in P.effets || {}) await this.setEffet(n, P.effets[n]);
      Object.assign(this.anim, P.animations || {}); for (const v in P.lumieres || {}) this.setLum(v, P.lumieres[v]);
    } catch (e) { console.error('art pack', e); }
  },
  init() {
    const db = Depth.drawBack.bind(Depth); Depth.drawBack = function (g, v, cam, t) { if (Art.decors[v]) { try { if (Art.drawDecor(g, v, cam, t)) return; } catch (e) { console.error('art decor', e); } } return db(g, v, cam, t); };
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); try { if (ART_EVENTS[type]) Art.fire(type, (type === 'parry' && this.flare) ? [this.flare.x, this.flare.y] : info && info.a && info.a.J ? info.a.J.tip : this.flare ? [this.flare.x, this.flare.y] : null); } catch (e) { } return r; };
    const af = Ambiance.front.bind(Ambiance); Ambiance.front = function (g, t) { const r = af(g, t); try { Art.drawFx(g); } catch (e) { } return r; };
    this.loadPack(typeof ART_PACK_DATA !== 'undefined' ? ART_PACK_DATA : null);
    if (typeof Atelier !== 'undefined') Atelier.init();
  },
};
