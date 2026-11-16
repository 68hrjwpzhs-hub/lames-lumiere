// =============================== 6.0 · sprint 44 : les écoles d'escrime ===============================
// Trois arbres de bottes secrètes : l'école italienne, la destreza espagnole, l'école française. Chaque école a son maître,
// installé dans une salle du Marais : il faut le battre en leçon avant d'apprendre sa première botte. Les bottes s'achètent
// avec des points de maîtrise (un par duel gagné) et des écus. Quatre bottes d'une école et deux d'une autre ouvrent la Botte de l'Ombre.
const ECOLES6 = {
  italienne: { name: 'École italienne', col: '#7a2a24', venue: 'loggia', maitre: { name: 'Maestro Ferrante Gozzi', level: 'maitre', tweak: { slow: 1.35, esq: .22, stopHit: .3 }, rapier: 'venitienne', look: () => mk('maitre', { coat: '#3a1418', coat2: '#240c10', plume: '#c8c0b0', beard: 'pointed', hair: '#3a2a20' }) },
    devise: 'Le temps avant la force : frapper dans le temps de l\'autre.',
    bottes: [
      { id: 'it1', name: 'Stoccata vive', desc: 'Estocades et estocades basses : +2 de dégâts.' },
      { id: 'it2', name: 'Passata sotto', desc: 'La riposte qui suit une esquive inflige +5.' },
      { id: 'it3', name: 'Contro-tempo', desc: 'Toucher pendant la préparation adverse : +6.' },
      { id: 'it4', name: 'Botte de Capoferro', desc: 'Votre fente porte 14 pas plus loin et inflige +3.' }] },
  espagnole: { name: 'Destreza espagnole', col: '#2a2a3a', venue: 'academia', maitre: { name: 'Don Diego de Arellano', level: 'maitre', arch: 'destreza', tweak: { slow: 1.35, fer: .45 }, rapier: 'tolede', look: () => mk('maitre', { coat: '#1a1a1a', coat2: '#0e0e0e', trim: '#c8a050', plume: '#b2302a', beard: 'pointed' }) },
    devise: 'Le cercle et l\'angle : ne jamais céder la ligne.',
    bottes: [
      { id: 'es1', name: 'Compás', desc: 'Vos coups et vos gardes coûtent 20 % de souffle en moins.' },
      { id: 'es2', name: 'Atajo', desc: 'Votre prise de fer part 20 % plus vite et inflige +3.' },
      { id: 'es3', name: 'Ángulo', desc: 'Fenêtre de parade parfaite +0,03 s.' },
      { id: 'es4', name: 'Tajo maestro', desc: 'Votre fente lourde inflige 20 % de plus.' }] },
  francaise: { name: 'École française', col: '#2a3a6a', venue: 'salle', maitre: { name: 'Maître Anne de Saint-Ange', level: 'maitre', tweak: { slow: 1.35, perfect: .5, punish: .9 }, rapier: 'solingen', look: () => mk('maitre', { style: 'dame', body: 'f', coat: '#2a3a6a', coat2: '#141e3a', hose: '#141e3a', hairStyle: 'chignon', hair: '#5a3a20', beard: 'none', plume: '#e8e4da' }) },
    devise: 'La parade et la riposte : laisser venir, puis répondre.',
    bottes: [
      { id: 'fr1', name: 'Battement sec', desc: 'Votre battement part 25 % plus vite.' },
      { id: 'fr2', name: 'Garde haute', desc: 'Vous subissez 8 % de dégâts en moins.' },
      { id: 'fr3', name: 'Riposte foudroyante', desc: 'Vos ripostes infligent +4.' },
      { id: 'fr4', name: 'Coup de Jarnac', desc: 'L\'estocade basse inflige +3 et blesse la jambe une fois sur trois.' }] },
};
const OMBRE6 = { id: 'ombre', name: 'Botte de l\'Ombre', desc: 'La première touche de chaque manche inflige 60 % de plus ; chaque parade parfaite rend 3 points de vie.' };
const Ecoles6 = {
  data() { const d = Save.data; if (!d.ecoles6) d.ecoles6 = { pts: 1, own: {}, lecon: {} }; return d.ecoles6; },
  has(id) { return !!this.data().own[id] && G.state !== 'menu' && G.mode !== 'training' && !(G.matchOpts && (G.matchOpts.ecole || G.matchOpts.defi)) && !G.silent; },
  count(s) { return ECOLES6[s].bottes.filter(b => this.data().own[b.id]).length; },
  ombreOk() { const c = Object.keys(ECOLES6).map(s => this.count(s)).sort((a, b) => b - a); return c[0] >= 4 && c[1] >= 2; },
  cost(i) { return { pts: i + 1, ecus: [0, 40, 80, 120][i] }; },
  state(s, i) { const D = this.data(), b = ECOLES6[s].bottes[i]; if (D.own[b.id]) return 'acquise'; if (!D.lecon[s]) return 'lecon'; if (i > 0 && !D.own[ECOLES6[s].bottes[i - 1].id]) return 'verrou'; return 'dispo'; },
  learn(s, i) {
    const D = this.data(), b = ECOLES6[s].bottes[i], c = this.cost(i), d = Save.data; if (this.state(s, i) !== 'dispo') return false;
    if (D.pts < c.pts) return toastMsg(`Il faut ${c.pts} point${c.pts > 1 ? 's' : ''} de maîtrise : gagnez des duels.`), false;
    if ((d.ecus || 0) < c.ecus) return toastMsg(`Il faut ${c.ecus} écus.`), false;
    D.pts -= c.pts; d.ecus -= c.ecus; D.own[b.id] = 1; Save.persist(); Snd.ding(); toastMsg(`${ECOLES6[s].maitre.name} vous enseigne : ${b.name}.`); return true;
  },
  learnOmbre() { const D = this.data(), d = Save.data; if (D.own.ombre || !this.ombreOk()) return false; if (D.pts < 3 || (d.ecus || 0) < 150) return toastMsg('Il faut 3 points de maîtrise et 150 écus.'), false; D.pts -= 3; d.ecus -= 150; D.own.ombre = 1; Save.persist(); Snd.ding(); toastMsg('Vous avez forgé votre propre botte : la Botte de l\'Ombre.'); return true; },
  lecon(s) { const E = ECOLES6[s], M = E.maitre; this.leconCur = s; G.startMatch({ mode: 'duel', venue: E.venue, lecon6: s, noJoute: true, wins: 1, opp: { name: M.name, level: M.level, tweak: M.tweak, arch: M.arch, rapier: M.rapier, look: M.look(), offhand: null } }); },
  // ---- écran : le traité des bottes ----
  build() {
    if ($('bottes6')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'bottes6'; s.hidden = true;
    s.innerHTML = '<div class="card b6-card"><div class="r5-head"><button class="u5-round" id="b6Back" aria-label="Retour">' + UI5.svgI('M15 5 L8 12 L15 19') + '</button><b>Les écoles d\'escrime</b></div><p class="keys" id="b6Pts"></p><div class="b6-grid" id="b6Grid"></div><div id="b6Ombre"></div><div class="row b6-classic"><button class="btn ghost" id="b6Back2">Retour</button></div></div>';
    document.body.appendChild(s); const st = document.createElement('style');
    st.textContent = '.b6-card{width:min(900px,96vw)}.b6-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.b6-col{display:flex;flex-direction:column;gap:6px;border:1px solid rgba(226,192,110,.2);border-radius:10px;padding:10px}.b6-col h4{margin:0;font:400 19px var(--display);color:#f3e8cf}.b6-col .dv{font:italic 13px/1.3 "IM Fell English",Georgia,serif;color:var(--muted)}.b6-col .opt{text-align:left;min-height:44px}.b6-col .opt b{font-size:15px}.b6-col .opt span{font-size:11.5px}.b6-col .opt.acq{border-color:#8fd08a;background:rgba(120,200,110,.1)}.b6-col .opt:disabled{opacity:.45}.b6-col .lec{font-size:12.5px;color:#f0c870}body.ui5 .b6-classic{display:none}@media (max-height:430px){.b6-grid{gap:6px}.b6-col{padding:7px}.b6-col .opt{min-height:40px;padding:5px 8px}}';
    document.head.appendChild(st);
    const back = () => G.show('menu'); $('b6Back').addEventListener('click', back); $('b6Back2').addEventListener('click', back);
  },
  open() { this.build(); this.render(); G.show('bottes6'); },
  render() {
    const D = this.data(); $('b6Pts').textContent = `Points de maîtrise : ${D.pts} · ${Save.data.ecus || 0} écus · un point par duel gagné`;
    let h = '';
    for (const s in ECOLES6) { const E = ECOLES6[s];
      h += `<div class="b6-col" style="border-top:3px solid ${E.col}"><h4>${E.name}</h4><span class="dv">${E.devise}</span>`;
      if (!D.lecon[s]) h += `<span class="lec">${E.maitre.name} n'enseigne qu'à qui l'a touché une fois.</span><button class="btn small" data-lecon="${s}">Prendre la leçon</button>`;
      else h += `<span class="lec" style="color:var(--muted)">Élève de ${E.maitre.name}</span>`;
      E.bottes.forEach((b, i) => { const st = this.state(s, i), c = this.cost(i);
        h += `<button class="opt${st === 'acquise' ? ' acq' : ''}" data-s="${s}" data-i="${i}" ${st === 'dispo' ? '' : 'disabled'}><b>${b.name}${st === 'acquise' ? ' ✓' : ''}</b><span>${b.desc}${st === 'dispo' ? ` · ${c.pts} pt${c.pts > 1 ? 's' : ''}${c.ecus ? `, ${c.ecus} écus` : ''}` : ''}</span></button>`; });
      h += '</div>'; }
    $('b6Grid').innerHTML = h;
    $('b6Ombre').innerHTML = `<button class="opt${D.own.ombre ? ' acq' : ''}" id="b6Om" style="width:100%;text-align:left;margin-top:8px" ${D.own.ombre || !this.ombreOk() ? 'disabled' : ''}><b>${OMBRE6.name}${D.own.ombre ? ' ✓' : ''}</b><span>${OMBRE6.desc} ${D.own.ombre ? '' : this.ombreOk() ? '· 3 pts, 150 écus' : '· s\'ouvre avec quatre bottes d\'une école et deux d\'une autre'}</span></button>`;
    $('b6Grid').querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { if (this.learn(b.dataset.s, +b.dataset.i)) this.render(); }));
    $('b6Grid').querySelectorAll('[data-lecon]').forEach(b => b.addEventListener('click', () => { Snd.init(); this.lecon(b.dataset.lecon); }));
    $('b6Om').addEventListener('click', () => { if (this.learnOmbre()) this.render(); });
  },
  // ---- effets ----
  ext: {
    kind: 'ec',
    seals(city) { return city === 'paris' ? [{ id: 'ec:1', x: 690, y: 128, wax: '#4a3a5a', icon: 'M5 19 L17 7 M14 5 C16 4 19 4 20 4 C20 5 20 8 19 10 M7 14 L10 17', label: 'Les maîtres', aria: 'Les maîtres d\'armes du Marais' }] : []; },
    card(k, U) {
      const D = Ecoles6.data(); let b = '<p>Rue des Tournelles, trois salles d\'armes se font face. Chaque maître y enseigne ses bottes secrètes.</p>';
      for (const s in ECOLES6) b += `<p class="m6-att"><b>${ECOLES6[s].name}</b> · ${D.lecon[s] ? `${Ecoles6.count(s)}/4 bottes` : 'leçon à prendre'}</p>`;
      b += `<p>Points de maîtrise : <b>${D.pts}</b></p><button class="go" data-ec="go">Ouvrir le traité des bottes</button>`;
      return U.card('#4a3a5a', 'Le Marais', 'Les maîtres d\'armes', b);
    },
    bind(c, k, U, kind) { if (kind === 'ec') c.querySelectorAll('[data-ec]').forEach(b => b.addEventListener('click', () => { U.ret = 'paris'; Ecoles6.open(); })); },
  },
  init() {
    this.data(); if (!V2.screens.includes('bottes6')) V2.screens.push('bottes6'); this.build();
    // bonus du héros (fenêtre de parade, ripostes, fente lourde, résistance, parade qui soigne)
    const ch = curHero; curHero = function () { return Ecoles6.heroMod(ch.apply(this, arguments)); };
    this.init2();
  },
  heroMod(h) {
    { if (!['fight', 'round', 'ko'].includes(G.state) || G.mode === 'story') return h; const E = Ecoles6; if (!Object.keys(E.data().own).length) return h;
      const o = Object.assign({}, h); if (E.has('es3')) o.parry = (o.parry || 0) + .03; if (E.has('fr3')) o.ripBonus = (o.ripBonus || 0) + 4; if (E.has('es4')) o.heavyMul = (o.heavyMul || 1) * 1.2; if (E.has('fr2')) o.resist = (o.resist || 1) * .92; if (E.has('ombre')) o.parryHeal = (o.parryHeal || 0) + 3; return o; }
  },
  init2() {
    const df = G.dmgFor; G.dmgFor = function (a, d, m) {
      let v = df.apply(this, arguments); if (!a.isPlayer || G.mode === 'story') return v; const E = Ecoles6;
      if (E.has('it1') && (m.kind === 'jab' || m.kind === 'bassa')) v += 2;
      if (E.has('it2') && m.kind === 'riposte' && a.ripEsq) { v += 5; a.ripEsq = false; }
      if (E.has('it3') && d.state === 'attack' && d.move && (d.move.kind === 'pending' || d.phase() === 'prep')) v += 6;
      if (E.has('it4') && m.kind === 'fente') v += 3;
      if (E.has('es2') && m.kind === 'lie') v += 3;
      if (E.has('fr4') && m.kind === 'bassa') v += 3;
      if (E.has('ombre') && !a.ombreDone) { v = Math.round(v * 1.6); a.ombreDone = true; this.say('Botte de l\'Ombre !', [d.x, GROUND - 262], '#c9d6e2', 20); }
      return v;
    };
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) {
      if (!this.isPlayer || G.mode === 'story') return sm.apply(this, arguments); const E = Ecoles6, s0 = this.slow;
      if (kind === 'riposte') this.ripEsq = !!(this.ripOffer && this.ripOffer.esq);
      if (E.has('es2') && kind === 'lie') this.slow *= .8; if (E.has('fr1') && kind === 'beat') this.slow *= .75;
      const r = sm.apply(this, arguments); this.slow = s0; if (E.has('it4') && kind === 'fente' && this.move) this.move.lunge += 14; return r;
    };
    const sp = Fighter.prototype.spend; Fighter.prototype.spend = function () { const b = this.breath, r = sp.apply(this, arguments); if (this.isPlayer && Ecoles6.has('es1') && G.mode !== 'story') this.breath += (b - this.breath) * .2; return r; };
    const hit = G.hit; G.hit = function (a, d, at, info) { const m = a.move, r = hit.apply(this, arguments);
      if (a.isPlayer && m && m.kind === 'bassa' && Ecoles6.has('fr4') && d.hp > 0 && !d.wounds.jambe && Math.random() < .34) { d.wounds.jambe = 1; d.marks.push({ z: 'jambe', s: 1, seed: 2 }); this.say('Coup de Jarnac !', [d.x, GROUND - 240], '#ff9a7a', 20); }
      return r; };
    const sr = G.startRound; G.startRound = function () { this.p.ombreDone = false; return sr.apply(this, arguments); };
    // points de maîtrise et leçons
    const ar = G.afterRound; G.afterRound = function () {
      const r = ar.apply(this, arguments), o = this.matchOpts || {};
      if (this.state === 'over' && !this.silent && this.mode !== 'training' && !o.ecole) { const won = this.wins[0] > this.wins[1], D = Ecoles6.data();
        if (o.lecon6) { if (won) { D.lecon[o.lecon6] = 1; D.pts++; $('overReward').textContent = `${ECOLES6[o.lecon6].maitre.name} vous accepte pour élève. ` + $('overReward').textContent; } else $('overReward').textContent = `${ECOLES6[o.lecon6].maitre.name} range sa lame : « Revenez quand vous saurez toucher. » ` + $('overReward').textContent; $('again').textContent = 'Le traité des bottes'; this.overAction = 'bottes6'; }
        else if (won) D.pts++;
        Save.persist(); }
      return r;
    };
    $('again').addEventListener('click', e => { if (G.overAction === 'bottes6') { e.stopImmediatePropagation(); G.toMenu(); Ecoles6.open(); } }, true);
    // accès : le sceau des maîtres sur la carte, et le registre (salle d'armes)
    UI5.ext.push(this.ext);
    const P = V2.panel('salle'), row = P && P.querySelector('.row'); if (row && !$('goBottes')) { const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'goBottes'; b.textContent = 'Écoles d\'escrime'; b.addEventListener('click', () => { Snd.init(); this.open(); }); row.appendChild(b); }
  },
};
