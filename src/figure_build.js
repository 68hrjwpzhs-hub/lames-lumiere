// =============================== Édition Lumière 3.0 · une carrure par héros ===============================
// Jusqu'ici les huit héros avaient le même corps, avec d'autres couleurs. Chacun a désormais sa carrure : épaisseur des membres,
// largeur du buste, taille de la tête, port de tête. On les reconnaît à leur ombre seule.
// Seul le dessin change : les articulations, la pointe de la lame et donc les touches restent exactement celles de la 7.0.0.
// limb : épaisseur des membres · torso : largeur du buste (px) · head : taille de la tête · hunch : tête portée en avant (px) · leg : épaisseur des jambes
const BUILDS = {
  massif: { limb: 1.62, leg: 1.48, torso: 14, head: .86, hunch: 3 },    // Mathurin, le Colosse
  robuste: { limb: 1.2, leg: 1.16, torso: 5, head: .97, hunch: 0 },    // Vaucelles, Bastien
  elance: { limb: .72, leg: .76, torso: -6, head: 1.06, hunch: -2 },   // Isaure, Oriane
  sec: { limb: .8, leg: .82, torso: -3, head: 1.02, hunch: 0 },        // Álvaro, le diestro
  ramasse: { limb: 1.04, leg: 1.1, torso: 3, head: .88, hunch: 5 },    // Corvin, sous sa capuche
  voute: { limb: .9, leg: .9, torso: 2, head: 1.12, hunch: 9 },        // Barthélemy l'Aveugle
};
const HERO_BUILD = { vaucelles: 'robuste', bastien: 'robuste', mathurin: 'massif', isaure: 'elance', oriane: 'elance', alvaro: 'sec', corvin: 'ramasse', aubrac: 'voute' };
const Build = {
  on() { return store.get('ct2d.carrure', true) !== false; },
  of(f) { if (!f || !this.on()) return null; const L = f.look || {}; return BUILDS[L.build] || null; },
  legs: 0, // vrai pendant le dessin des jambes
  // le Colosse et le Danseur des adversaires à signature ont aussi leur carrure ; réglage dans les options
  init() {
    for (const id in HERO_BUILD) if (HEROES[id]) HEROES[id].look.build = HERO_BUILD[id]; applyAvatar();
    if (typeof Sig7 !== 'undefined') { const ap = Sig7.apply.bind(Sig7); Sig7.apply = function (opp, k) { const o = ap(opp, k), b = { colosse: 'massif', danseur: 'elance', vieuxmaitre: 'voute' }[k]; if (b && o.look) o.look = Object.assign({}, o.look, { build: b }); return o; }; }
    const r = $('optLumen') && $('optLumen').parentElement; if (r && !$('optCarrure')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optCarrure'; c.textContent = 'Carrure des héros'; c.addEventListener('click', () => { store.set('ct2d.carrure', !this.on()); c.setAttribute('aria-pressed', this.on()); }); r.appendChild(c); c.setAttribute('aria-pressed', this.on()); }
    if (r && !$('optPinceau')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optPinceau'; c.textContent = 'Personnages peints'; const on = () => store.get('ct2d.pinceau', true) !== false; c.addEventListener('click', () => { store.set('ct2d.pinceau', !on()); c.setAttribute('aria-pressed', on()); }); r.appendChild(c); c.setAttribute('aria-pressed', on()); }
  },
};
const limb0 = limb;
limb = function (g, a, b, wa, wb, col, o) { const B = Build.of(FigPlus.cur); if (B) { const k = Build.legs ? B.leg : B.limb; wa *= k; wb *= k; } return limb0(g, a, b, wa, wb, col, o); };
const drawLegS0 = drawLegS;
drawLegS = function () { Build.legs++; try { return drawLegS0.apply(this, arguments); } finally { Build.legs--; } };
const torsoPath0 = torsoPath;
torsoPath = function (g, S, wider = 0) { const B = Build.of(FigPlus.cur); return torsoPath0(g, S, wider + (B ? B.torso : 0)); };
const drawHeadS0 = drawHeadS;
drawHeadS = function (g, f, j, L, C) {
  const B = Build.of(f); if (!B || f.state === 'ko') return drawHeadS0(g, f, j, L, C);
  const hx = j.head[0] + f.dir * B.hunch, hy = j.head[1] + Math.abs(B.hunch) * .5;
  g.save(); g.translate(hx, hy); g.scale(B.head, B.head); g.translate(-j.head[0], -j.head[1]); try { return drawHeadS0(g, f, j, L, C); } finally { g.restore(); }
};
