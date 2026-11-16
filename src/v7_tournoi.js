// =============================== 7.0 · sprint 56 : le Tournoi du Roi ===============================
// Le but final qui relie tout : la Renommée, les écoles, les rivaux et les voyages qualifient pour le grand tournoi
// de la Grande Galerie du Louvre. Cinq tours (vos anciens rivaux s'y inscrivent), la vie ne revient qu'à moitié entre deux.
// La victoire : la Royale, un générique, et une nouvelle partie + enrichie. Le tournoi revient chaque hiver.
const ROI7_FIELD = [
  { name: 'Le champion de Bourgogne', lv: 'duelliste', sig: 'gaucher', look: { coat: '#6a2a1a', coat2: '#3a1408', plume: '#d8b25e' } },
  { name: 'Le favori espagnol', lv: 'maitre', arch: 'destreza', sig: 'deuxlames', look: { coat: '#1a1a1a', coat2: '#0a0a0a', trim: '#c8a050', beard: 'pointed' } },
  { name: 'Le Colosse de Flandre', lv: 'maitre', sig: 'colosse', look: { style: 'paysan', coat: '#7a6a4a', coat2: '#3a3020', beard: 'full' }, rival: true },
  { name: 'La Dame de Venise', lv: 'maitre', sig: 'danseur', look: { style: 'dame', body: 'f', coat: '#3a1a4a', coat2: '#1e0e28', hairStyle: 'chignon', beard: 'none', mask: 'colombina', maskCol: '#d8b25e' } },
  { name: 'Hector de Valmont, champion du Roi', lv: 'maitre', sig: 'vieuxmaitre', boss: 'force', look: { coat: '#d8d0c0', coat2: '#8a8070', trim: '#d8b25e', cape: '#2a3a7a', plume: '#e8e4dc', beard: 'full', hair: '#c8c0b0' }, tweak: { perfect: .66, react: .16 } },
];
const Roi7 = {
  cur: null,
  data() { const d = Save.data; if (!d.roi7) d.roi7 = { wins: 0, tries: 0, best: 0 }; return d.roi7; },
  renommee() { return typeof Journal7 !== 'undefined' ? Journal7.renommee() : 0; },
  reqs() {
    const bottes = typeof Ecoles6 !== 'undefined' ? Object.keys(Ecoles6.data().own).length : 0, invit = typeof Story !== 'undefined' && !!Story.data().done.e06;
    return [{ ok: this.renommee() >= 30, t: `Renommée 30 (vous : ${this.renommee()})` }, { ok: bottes >= 2, t: `Deux bottes secrètes apprises (${bottes}/2)` }, { ok: Ach7.cities() >= 1 || invit, t: 'Avoir voyagé hors de Paris' }, { ok: (Monde.data().jour || 1) >= 2, t: 'Un jour au moins à Paris' }].map(r => invit ? Object.assign(r, { ok: true }) : r);
  },
  qualified() { return this.reqs().every(r => r.ok); },
  opp(i) {
    const F = ROI7_FIELD[i]; let o = { name: F.name, level: F.lv, arch: F.arch || null, rapier: F.lv === 'maitre' ? 'pappenheimer' : 'tolede', look: mk(F.lv, F.look), tweak: Object.assign({ perfect: .5 + i * .04 }, F.tweak), boss: F.boss || null };
    if (F.rival && typeof Rival !== 'undefined') { const R = Rival.list().filter(r => r.etat === 'actif' || r.etat === 'epargne').sort((a, b) => b.rank - a.rank)[0]; if (R) { const ro = Rival.opp(R); ro.name = `${R.name}, votre rival`; return Object.assign(ro, { level: 'maitre' }); } }
    return F.sig ? Sig7.apply(o, F.sig) : o;
  },
  start() { this.cur = { round: 0, hp: 100, log: [] }; this.data().tries++; Save.persist(); this.render(); G.show('roi7'); },
  fight() { const C = this.cur; G.startMatch({ mode: 'duel', venue: typeof VENUES.galerie !== 'undefined' ? 'galerie' : 'salle', roi7: C.round, noJoute: C.round > 0, wins: C.round === 4 ? 3 : 2, opp: this.opp(C.round) }); },
  // ---- écran ----
  build() {
    if ($('roi7')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'roi7'; s.hidden = true;
    s.innerHTML = `<div class="card"><div class="r5-head"><button class="u5-round" id="roi7Back" aria-label="Retour">${UI5.svgI('M15 5 L8 12 L15 19')}</button><b>Le Tournoi du Roi</b></div><div id="roi7Body"></div><div class="row"><button class="btn" id="roi7Go">En garde</button><button class="btn ghost" id="roi7Quit">Abandonner</button></div></div>`;
    document.body.appendChild(s); $('roi7Back').addEventListener('click', () => { this.cur = null; G.show('menu'); }); $('roi7Quit').addEventListener('click', () => { this.cur = null; G.show('menu'); }); $('roi7Go').addEventListener('click', () => { Snd.init(); this.fight(); });
  },
  render() {
    const C = this.cur, names = ['Premier tour', 'Huitième', 'Quart de finale', 'Demi-finale', 'Finale'];
    let h = `<p>La Grande Galerie du Louvre. Le roi en personne, la cour, les ambassadeurs. ${C.round < 5 ? `Prochain duel : <b>${names[C.round]}</b> contre <b>${UI5.esc(this.opp(C.round).name)}</b>.` : ''}</p><div class="bracket runSteps">`;
    for (let i = 0; i < 5; i++) h += `<div class="${i < C.round ? 'done' : i === C.round ? 'now' : ''}"><b>${names[i]}</b>${i <= C.round ? UI5.esc(ROI7_FIELD[i].name.split(',')[0]) : '?'}</div>`;
    h += `</div><div class="purse"><span>Vie</span><span class="bar" style="width:160px;display:inline-block;height:8px"><i style="width:${C.hp}%;background:linear-gradient(90deg,#8d2219,#d8473a)"></i></span><b>${Math.round(C.hp)}</b></div>`;
    $('roi7Body').innerHTML = h;
  },
  end(won) {
    const C = this.cur, D = this.data(); if (!C) return '';
    if (!won) { D.best = Math.max(D.best, C.round); this.cur = null; Save.persist(); return `Éliminé au tour ${C.round + 1}. Le roi applaudit poliment ; il y aura un autre hiver.`; }
    C.round++; C.hp = Math.min(100, Math.max(1, G.p.hp) + 50); D.best = Math.max(D.best, C.round);
    if (C.round >= 5) { D.wins++; this.cur = null; Save.data.ecus = (Save.data.ecus || 0) + 1000; Rep.add({ honneur: 10, faveur: 5 }); Save.persist(); this.credits = true; return 'Vous avez gagné le Tournoi du Roi ! +1000 écus. Le roi vous remet la Royale.'; }
    Save.persist(); return `Victoire ! En route pour le tour suivant (+50 de vie).`;
  },
  // ---- générique ----
  showCredits() {
    let s = $('credits7'); if (!s) { s = document.createElement('section'); s.className = 'screen'; s.id = 'credits7'; s.hidden = true; document.body.appendChild(s); if (!V2.screens.includes('credits7')) V2.screens.push('credits7');
      const st = document.createElement('style'); st.textContent = '#credits7{background:#0a0806;overflow:hidden}.cr7-roll{position:absolute;left:0;right:0;top:100%;text-align:center;animation:cr7 32s linear forwards;color:#efe3c6}.cr7-roll h2{font:400 40px var(--display);color:#e2c06e;margin:24px 0 6px}.cr7-roll h3{margin:22px 0 4px}.cr7-roll p{font-size:16px;margin:2px 0;color:#d9ccae}@keyframes cr7{to{transform:translateY(-260%)}}#cr7Skip{position:absolute;right:calc(max(12px,env(safe-area-inset-right)) + 12px);bottom:calc(max(10px,env(safe-area-inset-bottom)) + 10px);z-index:2}@media (prefers-reduced-motion:reduce){.cr7-roll{animation:none;top:10%}}'; document.head.appendChild(st); }
    const S = Story.data(), D = this.data();
    s.innerHTML = `<div class="cr7-roll"><h2>Les Lames de l'Ombre</h2><p>Paris, 1633 · Madrid · Venise · Londres</p><h3>Vainqueur du Tournoi du Roi</h3><p>${UI5.esc(curHero().name)}</p>
      <h3>Une création de</h3><p>Nicolas</p><h3>Développement, écriture et musique</h3><p>Claude, avec Nicolas</p><h3>Les lames de l'Ombre</h3><p>Hugues de Vaucelles · Isaure de Mirande · Bastien d'Armagnac</p><p>Dom Álvaro Teixeira · Corvin · Mathurin Brise-Garde</p><p>Oriane de Valcroze · Barthélemy Aubrac</p>
      <h3>Votre légende</h3><p>${Object.keys(S.done).length} chapitres · ${typeof Epreuves7 !== 'undefined' ? Epreuves7.stars() : 0} étoiles d'épreuves · ${Ach7.rivals()} rivaux vaincus · ${D.wins} tournoi${D.wins > 1 ? 's' : ''} du Roi</p>
      <h3>Remerciements</h3><p>Aux maîtres d'armes d'hier : Capoferro, Carranza, Narváez, Thibault, Saint-Didier</p><p>Et à vous, qui avez tenu la lame jusqu'ici.</p><h2>Fin</h2><p>Une nouvelle partie + vous attend : vos bottes, votre garde-robe et vos légendes vous suivent.</p></div><button class="btn ghost" id="cr7Skip">Continuer</button>`;
    G.show('credits7'); Music.play('victoire'); $('cr7Skip').addEventListener('click', () => { G.show('menu'); });
  },
  ext: {
    kind: 'roi',
    seals(city) { return city === 'paris' && (Roi7.qualified() || (Monde.data().jour || 1) >= 3) ? [{ id: 'roi:1', x: 176, y: 246, wax: '#c8a050', dark: true, icon: 'M4 18 L6 8 L10 12 L12 6 L14 12 L18 8 L20 18 Z M4 20 L20 20', label: 'Tournoi du Roi', aria: 'Le Tournoi du Roi, au Louvre' }] : []; },
    card(k, U) {
      const R = Roi7.reqs(), q = Roi7.qualified(), D = Roi7.data();
      let b = `<p>Chaque hiver, le roi réunit les meilleures lames d'Europe dans la Grande Galerie du Louvre.${D.wins ? ` Vous l'avez déjà gagné ${D.wins} fois.` : ''}</p>`;
      for (const r of R) b += `<p class="m6-att ${r.ok ? 'm6-protege' : ''}">${r.ok ? '✓' : '·'} ${r.t}</p>`;
      b += q ? `<button class="go" data-roi="go">Entrer dans la Grande Galerie</button>` : `<p class="rum">Remplissez ces conditions pour être invité.</p>`;
      return U.card('#c8a050', 'Le Louvre', 'Le Tournoi du Roi', b);
    },
    bind(c, k, U, kind) { if (kind === 'roi') c.querySelectorAll('[data-roi]').forEach(b => b.addEventListener('click', () => { U.ret = 'paris'; Roi7.start(); })); },
  },
  init() {
    if (!V2.screens.includes('roi7')) V2.screens.push('roi7'); this.build(); UI5.ext.push(this.ext);
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments), o = this.matchOpts || {};
      if (this.state === 'over' && o.roi7 !== undefined && Roi7.cur) { const won = this.wins[0] > this.wins[1], t = Roi7.end(won); $('overReward').textContent = t + ' ' + $('overReward').textContent; $('again').textContent = Roi7.cur ? 'Tour suivant' : Roi7.credits ? 'Le générique' : 'Carte de Paris'; this.overAction = 'roi7'; }
      return r; };
    $('again').addEventListener('click', e => { if (G.overAction === 'roi7') { e.stopImmediatePropagation(); G.toMenu(); if (Roi7.cur) { Roi7.render(); G.show('roi7'); } else if (Roi7.credits) { Roi7.credits = false; Roi7.showCredits(); } else UI5.openParis(); } }, true);
    // la vie du tournoi se garde d'un tour à l'autre
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); if (this.matchOpts && this.matchOpts.roi7 !== undefined && Roi7.cur && this.round === 1) this.p.hp = this.p.hpShow = Roi7.cur.hp; return r; };
  },
};
