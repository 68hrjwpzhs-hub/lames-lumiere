// =============================== 7.0 · sprint 54 : les épreuves du maître ===============================
// Trente défis courts, notés d'une à trois étoiles. Une partie de deux minutes, pour le métro.
// Les étoiles ouvrent la garde-robe et deux rapières légendaires.
const EP7_OPP = (lv, o = {}) => ({ name: o.name || { debutant: 'Un apprenti', duelliste: 'Un bretteur', maitre: 'Un maître d\'armes' }[lv], level: lv, tweak: o.tweak || {}, rapier: o.rapier || LEVEL_RAPIER[lv], look: mk(lv, o.look || {}), sig: o.sig || null, boss: o.boss || null, offhand: o.offhand !== undefined ? o.offhand : null });
const EPREUVES7 = [
  { id: 'e1', name: 'Premier sang', desc: 'Vainquez un apprenti.', opp: () => EP7_OPP('debutant'), s: [c => c.won, c => c.won && c.time < 25, c => c.won && c.taken === 0], l: ['Gagner', 'En moins de 25 s', 'Sans être touché'] },
  { id: 'e2', name: 'La riposte', desc: 'Parez, puis répondez.', opp: () => EP7_OPP('duelliste'), s: [c => c.won && c.st.ripostes >= 1, c => c.won && c.st.ripostes >= 3, c => c.won && (c.st.ripPerfect || 0) >= 2], l: ['Gagner avec une riposte', 'Trois ripostes', 'Deux ripostes parfaites'] },
  { id: 'e3', name: 'Mur de fer', desc: 'La parade parfaite, encore et encore.', opp: () => EP7_OPP('duelliste'), s: [c => c.won && c.st.perfect >= 1, c => c.won && c.st.perfect >= 3, c => c.won && c.st.perfect >= 5], l: ['Une parade parfaite', 'Trois', 'Cinq'] },
  { id: 'e4', name: 'Sans garde', desc: 'Gagnez sans jamais lever la garde : esquivez.', rule: 'sansgarde', opp: () => EP7_OPP('debutant'), s: [c => c.won, c => c.won && (c.st.esqOk || 0) >= 2, c => c.won && c.taken === 0], l: ['Gagner', 'Deux esquives', 'Sans être touché'] },
  { id: 'e5', name: 'Dans le temps', desc: 'Frappez pendant qu\'il prépare.', opp: () => EP7_OPP('duelliste'), s: [c => c.won && (c.st.stopHits || 0) >= 1, c => c.won && (c.st.stopHits || 0) >= 2, c => c.won && (c.st.stopHits || 0) >= 3], l: ['Un coup d\'arrêt', 'Deux', 'Trois'] },
  { id: 'e6', name: 'Le Colosse', desc: 'Lisez sa ceinture qui rougeoie.', opp: () => Sig7.apply(EP7_OPP('duelliste', { name: 'Le Colosse de Flandre' }), 'colosse'), s: [c => c.won, c => c.won && c.hp > 50, c => c.won && c.st.perfect >= 2], l: ['Gagner', 'Plus de 50 de vie', 'Deux parades parfaites'] },
  { id: 'e7', name: 'Le Gaucher', desc: 'Il attaque par le dedans.', opp: () => Sig7.apply(EP7_OPP('duelliste', { name: 'Le Gaucher de Nîmes' }), 'gaucher'), s: [c => c.won, c => c.won && c.hp > 50, c => c.won && c.taken === 0], l: ['Gagner', 'Plus de 50 de vie', 'Sans être touché'] },
  { id: 'e8', name: 'Deux lames', desc: 'La dague suit toujours l\'estocade.', opp: () => Sig7.apply(EP7_OPP('duelliste', { name: 'Le Bravo aux deux lames' }), 'deuxlames'), s: [c => c.won, c => c.won && c.st.perfect >= 2, c => c.won && c.hp > 60], l: ['Gagner', 'Deux parades parfaites', 'Plus de 60 de vie'] },
  { id: 'e9', name: 'Le Danseur', desc: 'Il entre et sort : tenez la mesure.', opp: () => Sig7.apply(EP7_OPP('duelliste', { name: 'Le Danseur de Séville' }), 'danseur'), s: [c => c.won, c => c.won && (c.st.stopHits || 0) >= 1, c => c.won && c.hp > 60], l: ['Gagner', 'Un coup d\'arrêt', 'Plus de 60 de vie'] },
  { id: 'e10', name: 'Le Vieux Maître', desc: 'Il contre tout : faites-le venir.', opp: () => Sig7.apply(EP7_OPP('maitre', { name: 'Le Vieux Maître de Pavie' }), 'vieuxmaitre'), s: [c => c.won, c => c.won && (c.st.beatOk || 0) >= 1, c => c.won && c.hp > 50], l: ['Gagner', 'Un battement réussi', 'Plus de 50 de vie'] },
  { id: 'e11', name: 'Le Fou', desc: 'Il feinte sans cesse : attendez le rire.', opp: () => Sig7.apply(EP7_OPP('duelliste', { name: 'Le Fou du Pont-Neuf' }), 'fou'), s: [c => c.won, c => c.won && (c.st.whiffs || 0) === 0, c => c.won && c.taken === 0], l: ['Gagner', 'Sans coup dans le vide', 'Sans être touché'] },
  { id: 'e12', name: 'Souffle court', desc: 'Vous partez essoufflé.', rule: 'souffle', opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && (c.st.whiffs || 0) === 0, c => c.won && c.time < 40], l: ['Gagner', 'Sans coup dans le vide', 'En moins de 40 s'] },
  { id: 'e13', name: 'Une seule touche', desc: 'Chaque touche est mortelle. Trois manches.', rule: 'unetouche', wins: 3, opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && c.lost <= 1, c => c.won && c.lost === 0], l: ['Gagner', 'Une manche perdue au plus', 'Sans manche perdue'] },
  { id: 'e14', name: 'Le fer', desc: 'Battement, prise de fer, dérobement.', opp: () => EP7_OPP('duelliste', { tweak: { fer: .4 } }), s: [c => c.won && (c.st.beatOk || 0) >= 1, c => c.won && (c.st.lies || 0) >= 2, c => c.won && (c.st.derob || 0) >= 1], l: ['Un battement réussi', 'Deux prises de fer', 'Un dérobement'] },
  { id: 'e15', name: 'Brise-garde', desc: 'La fente lourde contre une garde de pierre.', opp: () => EP7_OPP('duelliste', { tweak: { guardP: .95, hold: .6 } }), s: [c => c.won && (c.st.gbreaks || 0) >= 1, c => c.won && (c.st.gbreaks || 0) >= 2, c => c.won && (c.st.gbreaks || 0) >= 3], l: ['Une garde brisée', 'Deux', 'Trois'] },
  { id: 'e16', name: 'L\'anguille', desc: 'Esquivez au dernier instant.', opp: () => EP7_OPP('duelliste', { tweak: { aggr: .75 } }), s: [c => c.won && (c.st.esqOk || 0) >= 2, c => c.won && (c.st.esqOk || 0) >= 4, c => c.won && (c.st.esqPerfect || 0) >= 2], l: ['Deux esquives', 'Quatre', 'Deux esquives parfaites'] },
  { id: 'e17', name: 'À l\'aveugle', desc: 'La pointe ne rougeoie plus : écoutez le tic.', rule: 'aveugle', opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && c.st.perfect >= 1, c => c.won && c.st.perfect >= 3], l: ['Gagner', 'Une parade parfaite', 'Trois'] },
  { id: 'e18', name: 'Contre la montre', desc: '45 secondes pour vaincre.', rule: 'chrono', opp: () => EP7_OPP('duelliste'), s: [c => c.won && c.time < 45, c => c.won && c.time < 30, c => c.won && c.time < 20], l: ['Moins de 45 s', 'Moins de 30 s', 'Moins de 20 s'] },
  { id: 'e19', name: 'Sur la dunette', desc: 'Il tient la hauteur : allez le chercher.', venue: 'navire', opp: () => EP7_OPP('duelliste'), start: () => { G.e.x = 860; G.p.x = 560; }, s: [c => c.won, c => c.won && c.hp > 50, c => c.won && c.taken === 0], l: ['Gagner', 'Plus de 50 de vie', 'Sans être touché'] },
  { id: 'e20', name: 'Un contre trois', desc: 'Trois gardes, une seule lame.', melee: 3, opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && c.hp > 40, c => c.won && c.hp > 70], l: ['Gagner', 'Plus de 40 de vie', 'Plus de 70'] },
  { id: 'e21', name: 'Désarmer', desc: 'Parez sa fente lourde à la perfection.', opp: () => EP7_OPP('duelliste', { tweak: { w: { heavy: 3, jab: 1, fente: 1, bassa: .5, degage: .3, circ: .3, compo: .3, beat: .1, lie: .1 } } }), s: [c => c.won, c => c.won && c.disarm >= 1, c => c.won && c.disarm >= 2], l: ['Gagner', 'Le désarmer', 'Deux fois'] },
  { id: 'e22', name: 'Corps à corps', desc: 'Pommeau et saisie, au plus près.', opp: () => EP7_OPP('duelliste', { tweak: { aggr: .8 } }), s: [c => c.won, c => c.won && c.close >= 1, c => c.won && c.close >= 3], l: ['Gagner', 'Un coup au corps à corps', 'Trois'] },
  { id: 'e23', name: 'Maître contre maître', desc: 'Un vrai maître, sans ruse.', opp: () => EP7_OPP('maitre'), s: [c => c.won, c => c.won && c.hp > 50, c => c.won && c.taken === 0], l: ['Gagner', 'Plus de 50 de vie', 'Sans être touché'] },
  { id: 'e24', name: 'La nuit pluvieuse', desc: 'Pavés mouillés : la fente glisse plus loin.', venue: 'nuit', weather: 'rain', opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && c.st.ripostes >= 2, c => c.won && c.st.perfect >= 2], l: ['Gagner', 'Deux ripostes', 'Deux parades parfaites'] },
  { id: 'e25', name: 'Le bal masqué', desc: 'Un masque qui feinte et esquive.', venue: 'palais', opp: () => EP7_OPP('maitre', { name: 'Un masque d\'argent', tweak: { feint: .5, esq: .25 }, look: { mask: 'colombina', maskCol: '#c8ccd8' } }), s: [c => c.won, c => c.won && (c.st.esqOk || 0) >= 2, c => c.won && c.hp > 50], l: ['Gagner', 'Deux esquives', 'Plus de 50 de vie'] },
  { id: 'e26', name: 'Au premier sang', desc: 'Une seule manche, les coups pèsent double.', regle: 'sang', opp: () => EP7_OPP('maitre'), s: [c => c.won, c => c.won && c.time < 15, c => c.won && c.taken === 0], l: ['Gagner', 'En moins de 15 s', 'Sans être touché'] },
  { id: 'e27', name: 'Panache', desc: 'Remplissez la jauge, puis portez la botte.', opp: () => EP7_OPP('duelliste'), s: [c => c.won, c => c.won && c.panache >= 80, c => c.won && c.panache >= 140], l: ['Gagner', '80 points de panache', '140'] },
  { id: 'e28', name: 'Le marathon', desc: 'Trois manches à gagner contre un bretteur coriace.', wins: 3, opp: () => EP7_OPP('duelliste', { tweak: { perfect: .5 } }), s: [c => c.won, c => c.won && c.hp > 30, c => c.won && c.lost === 0], l: ['Gagner', 'Plus de 30 de vie', 'Sans manche perdue'] },
  { id: 'e29', name: 'Le Fléau', desc: 'Un rival qui a tout appris de vous.', opp: () => EP7_OPP('maitre', { name: 'Le Fléau des salles', tweak: { perfect: .66, lineRead: .95, react: .16 } }), s: [c => c.won, c => c.won && c.st.perfect >= 2, c => c.won && c.hp > 50], l: ['Gagner', 'Deux parades parfaites', 'Plus de 50 de vie'] },
  { id: 'e30', name: 'Le Roi des lames', desc: 'L\'épreuve ultime.', opp: () => Sig7.apply(EP7_OPP('maitre', { name: 'Le Roi des lames', tweak: { perfect: .7, react: .15 }, boss: 'force', rapier: 'ferrara' }), 'vieuxmaitre'), s: [c => c.won, c => c.won && c.st.ripostes >= 3, c => c.won && c.taken === 0], l: ['Gagner', 'Trois ripostes', 'Sans être touché'] },
];
const Epreuves7 = {
  cur: null,
  data() { const d = Save.data; if (!d.ep7) d.ep7 = {}; return d.ep7; },
  stars() { const D = this.data(); return Object.values(D).reduce((a, b) => a + b, 0); },
  start(i) {
    const E = EPREUVES7[i], o = E.opp(); this.cur = { i, t0: null, disarm: 0, close: 0, panache: 0 }; G.level = o.level;
    const base = { mode: 'duel', venue: E.venue || pick(['salle', 'cloitre', 'academia', 'loggia']), noJoute: true, epreuve7: E.id, wins: E.wins || (E.regle === 'sang' ? 1 : 1), regle: E.regle || null, opp: o };
    if (E.melee) return Melee.start([o, ...Melee.gardes(E.melee).slice(0, E.melee - 1)], base);
    G.startMatch(base);
  },
  // ---- écran ----
  build() {
    if ($('ep7')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'ep7'; s.hidden = true;
    s.innerHTML = `<div class="card ep7-card"><div class="r5-head"><button class="u5-round" id="ep7Back" aria-label="Retour">${UI5.svgI('M15 5 L8 12 L15 19')}</button><b>Les épreuves du maître</b></div><p class="keys" id="ep7Sum"></p><div class="ep7-grid" id="ep7Grid"></div></div>`;
    document.body.appendChild(s); const st = document.createElement('style');
    st.textContent = '.ep7-card{width:min(920px,96vw)}.ep7-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px}.ep7-grid .opt{text-align:left;min-height:58px}.ep7-grid .opt b{font-size:15px}.ep7-grid .opt span{font-size:11.5px}.ep7-grid .st{color:#e2c06e;letter-spacing:.12em;font-style:normal;font-size:13px}.ep7-grid .opt.lock{opacity:.45}';
    document.head.appendChild(st); $('ep7Back').addEventListener('click', () => G.show('menu'));
  },
  open() { this.build(); this.render(); G.show('ep7'); },
  unlocked(i) { return i < 6 || this.stars() >= Math.floor(i / 6) * 8; },
  render() {
    const D = this.data(); $('ep7Sum').textContent = `${this.stars()} étoiles sur 90 · les épreuves s'ouvrent par groupes de six (8 étoiles par groupe)`;
    $('ep7Grid').innerHTML = EPREUVES7.map((E, i) => { const n = D[E.id] || 0, ok = this.unlocked(i); return `<button class="opt${ok ? '' : ' lock'}" data-ep="${i}" ${ok ? '' : 'disabled'}><b>${i + 1}. ${E.name}</b><span>${ok ? E.desc : `${Math.floor(i / 6) * 8} étoiles pour l'ouvrir`}</span><i class="st">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</i></button>`; }).join('');
    $('ep7Grid').querySelectorAll('[data-ep]').forEach(b => b.addEventListener('click', () => { Snd.init(); this.start(+b.dataset.ep); }));
  },
  result() {
    const C = this.cur, E = EPREUVES7[C.i], p = G.p, won = G.wins[0] > G.wins[1];
    const c = { won, time: G.time - (C.t0 || G.time), taken: p.stats.taken || 0, hp: p.hp, st: p.stats, lost: G.wins[1], disarm: (G.e.stats.disarmed || 0) + (C.disarm || 0), close: C.close, panache: C.panache };
    let n = 0; E.s.forEach((f, k) => { try { if (f(c)) n = Math.max(n, k + 1); } catch (e) { } });
    const D = this.data(), prev = D[E.id] || 0; if (n > prev) D[E.id] = n; Save.persist(); this.cur = null;
    return { n, prev, labels: E.l.map((l, k) => (k < n ? '★ ' : '☆ ') + l).join(' · ') };
  },
  init() {
    if (!V2.screens.includes('ep7')) V2.screens.push('ep7'); this.build();
    // règles particulières
    const cg = Fighter.prototype.canGuard; Fighter.prototype.canGuard = function () { const E = Epreuves7.cur && EPREUVES7[Epreuves7.cur.i]; if (this.isPlayer && E && E.rule === 'sansgarde') return false; return cg.apply(this, arguments); };
    const df = G.dmgFor; G.dmgFor = function (a, d, m) { let v = df.apply(this, arguments); const E = Epreuves7.cur && EPREUVES7[Epreuves7.cur.i]; if (E && E.rule === 'unetouche') v = 100; return v; };
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments), C = Epreuves7.cur, E = C && EPREUVES7[C.i];
      if (E && this.matchOpts && this.matchOpts.epreuve7) { if (C.t0 === null) C.t0 = this.time; if (E.rule === 'souffle') this.p.breath = .2; if (E.rule === 'chrono') this.timer = 45; if (E.weather) this.weather = E.weather; if (E.start && this.round === 1) E.start(); this.epAveugle = E.rule === 'aveugle'; }
      else this.epAveugle = false; return r; };
    const pc = G.parryCue; G.parryCue = function () { if (this.epAveugle) return; return pc.apply(this, arguments); };
    if (typeof Combat6 !== 'undefined') { const po = Combat6.pommeau.bind(Combat6), sa = Combat6.saisie.bind(Combat6); Combat6.pommeau = f => { if (f.isPlayer && Epreuves7.cur) Epreuves7.cur.close++; return po(f); }; Combat6.saisie = f => { if (f.isPlayer && Epreuves7.cur) Epreuves7.cur.close++; return sa(f); }; }
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); if (Epreuves7.cur && typeof Panache !== 'undefined' && Panache.earned) Epreuves7.cur.panache = Math.max(Epreuves7.cur.panache, Panache.earned[0] || 0); return r; };
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments);
      if (this.state === 'over' && this.matchOpts && this.matchOpts.epreuve7 && Epreuves7.cur) { const R = Epreuves7.result(); $('overReward').textContent = `Épreuve : ${R.labels}.${R.n > R.prev ? ` Nouveau record : ${R.n} étoile${R.n > 1 ? 's' : ''} !` : ''} ` + $('overReward').textContent; $('again').textContent = 'Les épreuves'; this.overAction = 'ep7'; }
      return r; };
    $('again').addEventListener('click', e => { if (G.overAction === 'ep7') { e.stopImmediatePropagation(); G.toMenu(); Epreuves7.open(); } }, true);
    const P = V2.panel('salle'), row = P && P.querySelector('.row'); if (row && !$('goEp7')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'goEp7'; b.textContent = 'Épreuves du maître'; b.addEventListener('click', () => { Snd.init(); this.open(); }); row.prepend(b); }
  },
};
