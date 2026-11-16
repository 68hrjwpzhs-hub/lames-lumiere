// =============================== 7.0 · sprint 53 : des adversaires à signature ===============================
// Six familles de bretteurs, chacune avec sa botte et un signal visible juste avant : on apprend à lire un adversaire,
// sans commande nouvelle. On les croise dans les missions, les événements, la Nuit de Paris, les épreuves et le Tournoi du Roi.
const SIG7 = {
  gaucher: { name: 'Le Gaucher', tell: 'Il attaque par la ligne du dedans : un éclat blanc à sa main gauche annonce le coup.', kinds: ['degage', 'bassa'],
    tweak: { w: { degage: 3, bassa: 2, jab: 1, fente: 1, circ: .4, heavy: .3, compo: .5, beat: .3, lie: .2 }, lineRead: .78 }, col: '255,255,255' },
  colosse: { name: 'Le Colosse', tell: 'Lent et massif : il frappe du pied et sa ceinture rougeoie avant la fente lourde. Encaisse 15 % de moins.', kinds: ['heavy'],
    tweak: { slow: 1.3, aggr: .6, w: { heavy: 3, jab: .8, fente: 1.2, circ: .6, compo: .3, beat: .2, lie: .1 } }, col: '255,90,60' },
  deuxlames: { name: 'Le Duelliste à deux lames', tell: 'Après son estocade, la dague suit : parez la première, ou rompez.', kinds: ['jab'], offhand: 'dague',
    tweak: { w: { jab: 3, bassa: 1, fente: 1, degage: .6, circ: .4, heavy: .3, compo: .5, beat: .3, lie: .2 }, aggr: .6 }, col: '255,215,106' },
  danseur: { name: 'Le Danseur', tell: 'Il tourne autour de vous, entre et sort : ses pieds laissent une traînée claire avant d\'attaquer.', kinds: ['jab', 'compo', 'degage'],
    tweak: { dashBack: .6, esq: .35, aggr: .6, w: { jab: 2, compo: 2, degage: 1.2, fente: .8, bassa: .8, circ: .3, heavy: .2, beat: .3, lie: .2 } }, col: '190,230,255' },
  vieuxmaitre: { name: 'Le Vieux Maître', tell: 'Il attend et contre tout : sa pointe bleuit quand il guette votre préparation (coup d\'arrêt).', kinds: ['jab'],
    tweak: { perfect: .62, punish: .95, aggr: .3, stopHit: .45, react: .17 }, col: '120,170,255' },
  fou: { name: 'Le Fou', tell: 'Imprévisible, il feinte sans arrêt ; il rit juste avant la vraie attaque.', kinds: ['jab', 'fente', 'circ', 'bassa', 'heavy', 'compo', 'degage'],
    tweak: { feint: .6, noise: .09, aggr: .75 }, col: '255,240,120' },
};
const SIG7_KEYS = Object.keys(SIG7);
const Sig7 = {
  pending: null,
  // ajoute une signature à un adversaire (une fois sur trois, tirée d'après l'identifiant)
  dress(opp, seed, p = .33) {
    if (!opp || opp.sig || opp.arch === 'drac' || opp.boss) return opp; const R = Defi.rng('sig7-' + seed); if (R() > p) return opp;
    const k = SIG7_KEYS[Math.floor(R() * SIG7_KEYS.length)]; return this.apply(opp, k);
  },
  apply(opp, k) { const S = SIG7[k]; return Object.assign({}, opp, { sig: k, tweak: Object.assign({}, opp.tweak, S.tweak), offhand: S.offhand !== undefined ? S.offhand : opp.offhand, name: opp.name }); },
  draw(g) {
    const e = G.e, S = e && SIG7[e.sig]; if (!S || !e.J || G.state === 'menu') return; const j = e.J, t = G.time;
    const prep = e.state === 'attack' && e.move && S.kinds.includes(e.move.kind) && e.phase() === 'prep';
    g.save(); g.globalCompositeOperation = 'lighter';
    if (e.sig === 'gaucher' && prep) glow(g, j.bwr[0], j.bwr[1], 34, `rgba(${S.col},A)`, .7);
    if (e.sig === 'colosse' && prep) { glow(g, j.gx, j.gy - 8, 60, `rgba(${S.col},A)`, .55 + .2 * Math.sin(t * 20)); if (!e.stamped || e.stamped !== e.move.id) { e.stamped = e.move.id; Depth.kick(e.feet.f.x, 8, e.dir); G.shake = Math.max(G.shake, 3); Snd.tick(); } }
    if (e.sig === 'deuxlames' && prep) glow(g, j.bwr[0], j.bwr[1], 28, `rgba(${S.col},A)`, .8);
    if (e.sig === 'danseur' && prep) { g.strokeStyle = `rgba(${S.col},.5)`; g.lineWidth = 3; for (const ft of [e.feet.f, e.feet.b]) { g.beginPath(); g.arc(ft.x, GROUND - 2, 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
    if (e.sig === 'vieuxmaitre' && e.state !== 'attack' && Math.abs(e.x - G.p.x) < REACH.jab + 30 && G.p.state === 'attack' && G.p.phase && G.p.phase() === 'prep') glow(g, j.tip[0], j.tip[1], 26, `rgba(${S.col},A)`, .9);
    if (e.sig === 'fou' && prep && e.laughed !== e.move.id) { e.laughed = e.move.id; Sig7.laugh(); G.say('Ha !', [j.head[0], j.head[1] - 30], '#fff07a', 18); }
    g.restore();
  },
  laugh() { const c = Snd.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime; for (let i = 0; i < 3; i++) { const o = c.createOscillator(), gg = c.createGain(), tt = t + i * .09; o.type = 'triangle'; o.frequency.setValueAtTime(420 - i * 30, tt); o.frequency.exponentialRampToValueAtTime(300 - i * 20, tt + .07); gg.gain.setValueAtTime(.0001, tt); gg.gain.exponentialRampToValueAtTime(.03, tt + .01); gg.gain.exponentialRampToValueAtTime(.0001, tt + .08); o.connect(gg); gg.connect(Snd.out); o.start(tt); o.stop(tt + .1); } },
  init() {
    const ds = Story.drawSig.bind(Story); Story.drawSig = function (g) { ds(g); try { Sig7.draw(g); } catch (e) { } };
    // le colosse encaisse
    const df = G.dmgFor; G.dmgFor = function (a, d, m) { let v = df.apply(this, arguments); if (d.sig === 'colosse') v = Math.round(v * .85); return v; };
    // la dague du duelliste à deux lames suit son estocade
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments);
      if ((type === 'hit' || type === 'block') && info && info.a && info.a.sig === 'deuxlames' && info.m && info.m.kind === 'jab' && !Sig7.pending) Sig7.pending = { a: info.a, d: info.d, at: this.time + .2 };
      return r; };
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); const P = Sig7.pending;
      if (P && this.time >= P.at) { Sig7.pending = null; const d = P.d; if (d && d.state !== 'ko' && this.state === 'fight' && Math.abs(P.a.x - d.x) < REACH.jab + 30) {
        if (d.guarding) { this.say('Dague parée', [d.x, GROUND - 230], '#e6eef6', 16); Snd.tick(); } else if (d.state !== 'esq') { d.hp = Math.max(1, d.hp - 4); d.flash = .1; this.say('Coup de dague !', [d.x, GROUND - 236], '#ffd27a', 18); Snd.hit(false); } } }
      return r; };
    // on les croise partout
    const fo = Carte.foeOpp.bind(Carte); Carte.foeOpp = function (m) { return Sig7.dress(fo(m), m.id); };
    // première rencontre : le carnet explique le signal
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); const k = this.e.sig, S = SIG7[k];
      if (S && this.round === 1 && !this.silent) { const seen = store.get('ct2d.sig7', {}); if (!seen[k]) { seen[k] = 1; store.set('ct2d.sig7', seen); toastMsg(`${S.name} : ${S.tell}`); } } return r; };
  },
};
