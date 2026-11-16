// =============================== 7.0 · sprints 55 et 62 : garde-robe, rapières légendaires, familles d'armes ===============================
// Garde-robe : chapeaux, plumes, capes, pourpoints et reflets de lame, gagnés en jouant, sans effet sur le combat.
// Huit rapières légendaires, chacune avec son histoire au carnet. Trois familles d'armes (mêmes boutons, autre rythme) :
// l'épée de cour (légère, récupère vite, courte), la rapière longue (portée, lente), le sabre de marin (coups de taille qui brisent la garde).
const COSM7 = {
  hat: [['feutre', 'Feutre à larges bords', null], ['beret', 'Béret', null], ['capuche', 'Capuche de rôdeur', () => Epreuves7.stars() >= 5], ['aucun', 'Tête nue', null]],
  plume: [['#e8e4dc', 'Plume blanche', null], ['#b2302a', 'Plume écarlate', () => Epreuves7.stars() >= 10], ['#d8b25e', 'Plume dorée', () => Epreuves7.stars() >= 25], ['#2a4a8a', 'Plume azur', () => Ach7.cities() >= 2], ['#3a8a5a', 'Plume de Venise', () => !!Story.data().done.d08], [null, 'Sans plume', null]],
  cape: [['#141418', 'Cape noire', null], ['#5a0e12', 'Cape cardinale', () => Rep.data().faveur >= 40], ['#1a2440', 'Cape de nuit', () => (Save.data.nuitMax || 1) >= 3], ['#2a4a5a', 'Cape de lagune', () => !!Story.data().done.d04], ['#c8a050', 'Cape d\'or du Roi', () => !!(Save.data.roi7 && Save.data.roi7.wins)], [null, 'Sans cape', null]],
  coat: [['hero', 'Pourpoint du héros', null], ['#24324e|#141c30', 'Bleu de France', () => Epreuves7.stars() >= 15], ['#5a1a1e|#2e0c0e', 'Rouge de garde', () => Ach7.rivals() >= 1], ['#1a1a1a|#0a0a0a', 'Noir d\'Espagne', () => Ecoles6.count('espagnole') >= 2], ['#3a1a4a|#1e0e28', 'Pourpre de Venise', () => Epreuves7.stars() >= 40], ['#d8d0c0|#8a8070', 'Blanc de tournoi', () => Epreuves7.stars() >= 60]],
  blade: [['hero', 'Acier de la lame', null], ['#f6e2a8', 'Reflet doré', () => Epreuves7.stars() >= 30], ['#c8e0ff', 'Reflet de lune', () => (Save.data.nuitMax || 1) >= 5], ['#ffd0c8', 'Reflet de braise', () => Ach7.rivals() >= 3]],
};
const LEGEND7 = {
  aube: { name: 'L\'Aube de Lacombe', fam: 'rapiere', desc: 'La lame d\'entraînement du vieux maître, affûtée pour vous.', speed: .9, power: 1.1, len: 116, guard: .02, blade: '#f0f0e8', hilt: '#c8a050', cond: () => !!Story.data().done.ch10, hint: 'Terminer le Livre I' },
  serpent: { name: 'Le Serpent de Murano', fam: 'cour', desc: 'Garde de verre filé : légère comme un souffle.', speed: .8, power: 1, len: 104, guard: .02, blade: '#e8f8ff', hilt: '#6ac8d8', cond: () => !!Story.data().done.d08, hint: 'Terminer le Livre IV' },
  ligne: { name: 'La Ligne du Cercle', fam: 'longue', desc: 'Forgée pour la destreza : toujours en ligne.', speed: 1.02, power: 1.12, len: 136, guard: .03, blade: '#eef2f6', hilt: '#b89048', cond: () => Ecoles6.count('espagnole') >= 4, hint: 'Les quatre bottes espagnoles' },
  rancune: { name: 'La Rancune', fam: 'rapiere', desc: 'Prise à un rival qui ne l\'a jamais pardonné.', speed: .9, power: 1.18, len: 114, guard: 0, blade: '#c8ccd2', hilt: '#5a1a1e', cond: () => Ach7.rivals() >= 3, hint: 'Vaincre trois rivaux' },
  lune: { name: 'La Lame de lune', fam: 'rapiere', desc: 'Elle ne brille que la nuit.', speed: .86, power: 1.12, len: 118, guard: .02, blade: '#d0e0ff', hilt: '#9aa8c8', cond: () => (Save.data.nuitMax || 1) >= 6, hint: 'Ouvrir la Nuit VI' },
  brume: { name: 'La Brume de Londres', fam: 'sabre', desc: 'Sabre de la Tamise, qui fend les gardes comme le brouillard.', speed: .96, power: 1.2, len: 106, guard: .01, blade: '#d8dce4', hilt: '#4a5a6a', cond: () => Ach7.cityMissions('londres') >= 5, hint: 'Cinq missions à Londres' },
  etoile: { name: 'L\'Étoile du maître', fam: 'cour', desc: 'Récompense des épreuves : vive et sûre.', speed: .78, power: 1.06, len: 106, guard: .04, blade: '#fff4d0', hilt: '#e8c870', cond: () => Epreuves7.stars() >= 60, hint: '60 étoiles d\'épreuves' },
  royale: { name: 'La Royale', fam: 'rapiere', desc: 'Remise par le roi au vainqueur de son tournoi.', speed: .86, power: 1.22, len: 120, guard: .03, blade: '#fbfbff', hilt: '#e8c870', cond: () => !!(Save.data.roi7 && Save.data.roi7.wins), hint: 'Gagner le Tournoi du Roi' },
};
const ARMS7 = { // familles vendues au marché
  cour: { name: 'Épée de cour', desc: 'Légère et rapide, récupère vite ; courte portée.', base: 260, rar: 1, speed: .82, power: .92, len: 100, guard: .01, blade: '#eef2f6', hilt: '#d8b25e', fam: 'cour' },
  courdor: { name: 'Épée de cour dorée', desc: 'La plus vive des lames de salon.', base: 640, rar: 2, speed: .78, power: .98, len: 102, guard: .02, blade: '#f6f0e0', hilt: '#e8c870', fam: 'cour' },
  longue: { name: 'Rapière longue', desc: 'Une allonge d\'un pied de plus ; lente à revenir.', base: 300, rar: 1, speed: 1.1, power: 1.06, len: 134, guard: 0, blade: '#e4ebf2', hilt: '#a8acb4', fam: 'longue' },
  longuenoire: { name: 'La Longue noire', desc: 'Rapière longue d\'acier bruni.', base: 720, rar: 2, speed: 1.06, power: 1.12, len: 138, guard: .01, blade: '#9aa2ac', hilt: '#3a3a42', fam: 'longue' },
  sabre: { name: 'Sabre de marin', desc: 'Coups de taille : la fente et l\'imbroccata brisent la garde.', base: 380, rar: 1, speed: 1, power: 1.12, len: 104, guard: 0, blade: '#d6dde4', hilt: '#8a6a3a', fam: 'sabre' },
  sabrecorsaire: { name: 'Sabre de corsaire', desc: 'Lourd et courbe, gagné sur une galère barbaresque.', base: 780, rar: 2, speed: .98, power: 1.2, len: 106, guard: .01, blade: '#e0e4ea', hilt: '#c8a050', fam: 'sabre' },
};
const Ach7 = {
  rivals() { return typeof Rival !== 'undefined' ? Rival.list().filter(r => r.etat !== 'actif').length : 0; },
  cities() { const v = Save.data.villes7 || {}; return Object.keys(v).length; },
  cityMissions(c) { const D = Carte.data().done || {}; return Object.keys(D).filter(k => k.includes(c + '_') && D[k]).length; },
};
const Garde7 = {
  f: null, raf: 0, tab: 'hat',
  data() { const d = Save.data; if (!d.garde7) d.garde7 = {}; return d.garde7; },
  // les rapières légendaires se donnent d'elles-mêmes, quand on les mérite
  grant() {
    const d = Save.data; d.owned = d.owned || []; let got = null;
    for (const k in LEGEND7) { const id = 'leg_' + k; if (!d.owned.includes(id) && LEGEND7[k].cond()) { d.owned.push(id); got = LEGEND7[k]; if (typeof Codex !== 'undefined' && Codex.unlock) try { Codex.unlock('leg7_' + k); } catch (e) { } } }
    if (got) { Save.persist(); toastMsg(`Rapière légendaire : ${got.name}. Elle vous attend dans la garde-robe.`); Snd.ding && Snd.ding(); }
  },
  look(base) { const G7 = this.data(), L = Object.assign({}, base);
    if (G7.hat) L.hatType = G7.hat; if (G7.plume !== undefined) L.plume = G7.plume; if (G7.cape !== undefined) L.cape = G7.cape;
    if (G7.coat && G7.coat !== 'hero') { const [a, b] = G7.coat.split('|'); L.coat = a; L.coat2 = b; } if (G7.blade && G7.blade !== 'hero') L.blade = G7.blade; return L; },
  build() {
    if ($('garde7')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'garde7'; s.hidden = true;
    s.innerHTML = `<div class="card gr7-card"><div class="r5-head"><button class="u5-round" id="gr7Back" aria-label="Retour">${UI5.svgI('M15 5 L8 12 L15 19')}</button><b>La garde-robe</b></div>
      <div class="gr7-wrap"><canvas id="gr7Cv"></canvas><div class="gr7-side"><div class="mtabs" id="gr7Tabs"></div><div class="gr7-list" id="gr7List"></div></div></div></div>`;
    document.body.appendChild(s); const st = document.createElement('style');
    st.textContent = '.gr7-card{width:min(900px,96vw)}.gr7-wrap{display:flex;gap:14px;align-items:flex-start}#gr7Cv{flex:0 0 200px;width:200px;height:250px;border-radius:10px;border:1px solid rgba(226,192,110,.25)}.gr7-side{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}.gr7-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.gr7-list .opt{text-align:left;min-height:48px}.gr7-list .opt b{font-size:14px}.gr7-list .opt span{font-size:11px}.gr7-list .sw{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:6px;vertical-align:-1px;border:1px solid rgba(255,255,255,.3)}@media (max-height:430px){#gr7Cv{flex-basis:150px;width:150px;height:190px}}';
    document.head.appendChild(st); $('gr7Back').addEventListener('click', () => { cancelAnimationFrame(this.raf); this.raf = 0; G.show('menu'); });
    const tabs = [['hat', 'Chapeau'], ['plume', 'Plume'], ['cape', 'Cape'], ['coat', 'Pourpoint'], ['blade', 'Lame'], ['leg', 'Légendes']];
    $('gr7Tabs').innerHTML = tabs.map(([k, n]) => `<button data-k="${k}" role="tab">${n}</button>`).join(''); $('gr7Tabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.k; this.render(); }));
    this.f = new Fighter(true, LOOKS.player); this.f.opp = { x: 99999, state: 'idle', move: null, dist: () => 999 };
  },
  open() { this.build(); this.grant(); this.render(); G.show('garde7'); this.loop(); },
  render() {
    $('gr7Tabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === this.tab)); const G7 = this.data(); let h = '';
    if (this.tab === 'leg') { const own = Save.data.owned || [];
      for (const k in LEGEND7) { const L = LEGEND7[k], id = 'leg_' + k, has = own.includes(id), eq = Save.data.equipped === id; h += `<button class="opt" data-leg="${id}" ${has ? '' : 'disabled'} aria-pressed="${eq}"><b>${L.name}${eq ? ' ✓' : ''}</b><span>${has ? `${L.desc} · ${{ cour: 'épée de cour', longue: 'rapière longue', sabre: 'sabre', rapiere: 'rapière' }[L.fam]}` : L.hint}</span></button>`; } }
    else for (const [v, n, cond] of COSM7[this.tab]) { const ok = !cond || cond(), cur = (G7[this.tab] === undefined ? (v === 'hero' ? 'hero' : undefined) : G7[this.tab]) === v, sw = v && v.startsWith('#') ? `<i class="sw" style="background:${v.split('|')[0]}"></i>` : '';
      h += `<button class="opt" data-v="${v}" ${ok ? '' : 'disabled'} aria-pressed="${cur}"><b>${sw}${n}</b><span>${ok ? (cur ? 'porté' : 'disponible') : 'à gagner'}</span></button>`; }
    $('gr7List').innerHTML = h;
    $('gr7List').querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.v; G7[this.tab] = v === 'null' ? null : v; Save.persist(); applyAvatar(); Snd.tick(); this.render(); }));
    $('gr7List').querySelectorAll('[data-leg]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.leg; Save.data.equipped = Save.data.equipped === id ? 'heros' : id; Save.persist(); Snd.tick(); this.render(); }));
  },
  loop() {
    const cv = $('garde7') && !$('garde7').hidden && $('gr7Cv'); if (!cv) { this.raf = 0; return; } const g = cv.getContext('2d'), f = this.f, dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth || 200, hh = cv.clientHeight || 250;
    if (!cv.clientWidth) { this.raf = requestAnimationFrame(() => this.loop()); return; } if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const h = curHero(), eq = RAPIERS[Save.data.equipped] || h.rapier; f.look = Object.assign({}, LOOKS.player); f.rapier = eq; f.arch = h.arch || null;
    const t = performance.now() / 1000, ph = t % 6; f.x = 0; f.dir = 1; f.state = ph > 3 && ph < 4.6 ? 'guard' : 'idle'; f.t = ph; f.gline = 'ext'; f.pose = f.animate(1 / 60); f.updateFeet(1 / 60); f.J = f.joints();
    const s = Math.min(hh / 250, w / 290); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh); const bg = g.createLinearGradient(0, 0, 0, hh); bg.addColorStop(0, '#2a2230'); bg.addColorStop(1, '#4a3a34'); g.fillStyle = bg; g.fillRect(0, 0, w, hh);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - 45 * s), dpr * (hh / 2 - (GROUND - 118) * s)); try { drawFighter(g, f); } catch (e) { }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  init() {
    for (const k in LEGEND7) RAPIERS['leg_' + k] = Object.assign({ base: 0, rar: 3, legend: true }, LEGEND7[k]);
    for (const k in ARMS7) { RAPIERS[k] = Object.assign({}, ARMS7[k]); if (!RAPIER_IDS.includes(k)) RAPIER_IDS.push(k); }
    if (typeof CODEX !== 'undefined') for (const k in LEGEND7) if (!CODEX.some(c => c.id === 'leg7_' + k)) CODEX.push({ id: 'leg7_' + k, cat: 'ecole', title: LEGEND7[k].name, hint: LEGEND7[k].hint, text: LEGEND7[k].desc + ' Rapière légendaire, légende du jeu.' });
    if (!V2.screens.includes('garde7')) V2.screens.push('garde7'); this.build();
    // la tenue choisie s'applique au héros
    const aa = applyAvatar; applyAvatar = function () { const r = aa.apply(this, arguments); LOOKS.player = Garde7.look(LOOKS.player); if (G.p && G.p.isPlayer && G.mode !== 'story') G.p.look = LOOKS.player; return r; };
    applyAvatar();
    // familles d'armes : épée de cour (récupère vite), sabre (coups de taille qui brisent la garde)
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) { const r = sm.apply(this, arguments); const fam = this.rapier && this.rapier.fam;
      if (this.move && fam === 'cour') { this.move.rec *= .85; this.move.lunge = Math.max(0, this.move.lunge - 8); } if (this.move && fam === 'longue') this.move.rec *= 1.08; return r; };
    const bl = G.block; G.block = function (a, d, bp, info) { const fam = a.rapier && a.rapier.fam, m = a.move; if (fam === 'sabre' && m && (m.kind === 'fente' || m.kind === 'circ' || m.kind === 'tajo')) { this.say('Coup de taille !', [d.x, GROUND - 240], '#ffd27a', 18); return this.breakGuard(a, d, bp, info); } return bl.apply(this, arguments); };
    // remises de récompenses
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments); if (this.state === 'over' && !this.silent) setTimeout(() => Garde7.grant(), 600); return r; };
    const P = V2.panel('salle'), row = P && P.querySelector('.row'); if (row && !$('goGarde7')) { const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'goGarde7'; b.textContent = 'Garde-robe'; b.addEventListener('click', () => { Snd.init(); this.open(); }); row.appendChild(b); }
  },
};
