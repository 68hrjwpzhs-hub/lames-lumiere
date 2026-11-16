// =============================== 7.0 · sprint 63 : Carrière de bretteur, 1633-1640 ===============================
// Le temps passe : 20 jours font une saison, 4 saisons une année. La carrière commence au printemps 1633 et s'achève à l'hiver 1640.
// À chaque saison : les rivaux vieillissent (ils montent en grade, ou raccrochent l'épée), les quartiers oublient un peu,
// l'hiver fait tomber la neige sur Paris, et chaque hiver le roi tient son tournoi. Une chronique garde la trace de tout.
const SAISONS7 = ['Printemps', 'Été', 'Automne', 'Hiver'], SAISON_JOURS7 = 20;
const Carriere7 = {
  data() { const d = Save.data; if (!d.carr7) d.carr7 = { s: this.idx(), fin: 0 }; if (!d.chron) d.chron = []; return d.carr7; },
  idx(j) { j = j || (typeof Monde !== 'undefined' ? Monde.jour() : 1); return Math.floor((j - 1) / SAISON_JOURS7); },
  saison(i) { i = i === undefined ? this.idx() : i; return SAISONS7[i % 4]; },
  annee(i) { i = i === undefined ? this.idx() : i; return 1633 + Math.floor(i / 4); },
  hiver() { return this.saison() === 'Hiver'; },
  label(i) { return `${this.saison(i)} ${this.annee(i)}`; },
  chron(t, kind) { const C = Save.data.chron = Save.data.chron || []; C.push({ i: this.idx(), j: Monde.jour(), t, k: kind || 'monde' }); if (C.length > 80) C.splice(0, C.length - 80); Save.persist(); },
  // changement de saison
  tourne(from, to) {
    const D = this.data(); D.s = to;
    for (let i = from + 1; i <= to; i++) {
      const L = this.label(i); this.chron(`${L} commence.`, 'saison');
      if (typeof Rival !== 'undefined') for (const r of Rival.actifs()) {
        r.age = (r.age || 0) + 1;
        if (r.age % 4 === 0 && r.rank < 4) { r.rank++; this.chron(`${r.name} a pris du métier : on l'appelle désormais ${Rival.title(r)}.`, 'rival'); }
        if (r.age >= 10 && Math.random() < .35) { r.etat = 'retire'; this.chron(`${r.name} a raccroché l'épée. On dit qu'il tient une auberge.`, 'rival'); }
      }
      const A = Monde.data().att; for (const q in A) if (A[q]) A[q] -= Math.sign(A[q]); // les quartiers oublient un peu
      if (SAISONS7[i % 4] === 'Hiver') this.chron(`Hiver ${1633 + Math.floor(i / 4)} : le roi ouvre son tournoi dans la Grande Galerie du Louvre.`, 'roi');
      if (1633 + Math.floor(i / 4) > 1640 && !D.fin) { D.fin = 1; this.chron('La carrière s\'achève : sept années de lame dans Paris et en Europe.', 'fin'); this.finPending = true; }
    }
    Save.persist(); if (G.state !== 'fight') toastMsg(`${this.label(to)} commence.`);
  },
  epilogue() {
    this.finPending = false; const C = Save.data.chron || [], S = Story.data(), R = typeof Rival !== 'undefined' ? Rival.list() : [];
    const lines = [`Paris, hiver 1640. ${curHero().name} a ${Journal7.renommee()} de Renommée : ${Journal7.titre().toLowerCase()}.`,
      `${Object.keys(S.done).length} chapitres vécus, ${R.filter(r => r.etat === 'vaincu').length} rivaux vaincus, ${typeof Roi7 !== 'undefined' ? Roi7.data().wins : 0} tournois du Roi gagnés.`,
      `La chronique compte ${C.length} pages. La partie continue : Paris ne dort jamais.`];
    toastMsg(lines[0]); this.showChron(lines);
  },
  // ---- la chronique ----
  html(n) { const C = (Save.data.chron || []).slice(-n).reverse(); if (!C.length) return '<p class="rum">Rien encore. La chronique s\'écrit en jouant.</p>'; return C.map(e => `<p class="c7-e c7-${e.k}"><b>${this.label(e.i)}</b> ${UI5.esc(e.t)}</p>`).join(''); },
  showChron(head) {
    let s = $('chron7'); if (!s) { s = document.createElement('section'); s.className = 'screen'; s.id = 'chron7'; s.hidden = true; document.body.appendChild(s); if (!V2.screens.includes('chron7')) V2.screens.push('chron7'); }
    s.innerHTML = `<div class="card c7-card"><div class="u5-eye">Chronique</div><h2>${this.label()} · Jour ${Monde.jour()}</h2>${head ? head.map(l => `<p class="c7-head">${UI5.esc(l)}</p>`).join('') : ''}<div class="c7-list">${this.html(80)}</div><button class="btn" id="c7Close">Retour</button></div>`;
    G.show('chron7'); $('c7Close').addEventListener('click', () => { if (typeof UI5 !== 'undefined' && document.body.classList.contains('ui5')) UI5.openParis(); else G.toMenu(); });
  },
  ext: {
    kind: 'chron',
    seals(city) { return city === 'paris' ? [{ id: 'chron:1', x: 790, y: 336, wax: '#6a5a40', icon: 'M6 4 L16 4 L18 6 L18 20 L6 20 Z M9 9 L15 9 M9 12 L15 12 M9 15 L13 15', label: Carriere7.label(), aria: `Chronique, ${Carriere7.label()}` }] : []; },
    card(k, U) { return U.card('#6a5a40', 'Chronique', `${Carriere7.label()} · jour ${Monde.jour()}`, `<p>Saison ${(Carriere7.idx() % 4) + 1} sur 4 · ${SAISON_JOURS7 - ((Monde.jour() - 1) % SAISON_JOURS7)} jours avant la suivante.</p>${Carriere7.html(4)}<button class="go" data-chron="1">Toute la chronique</button>`); },
    bind(c, k, U, kind) { if (kind === 'chron') c.querySelectorAll('[data-chron]').forEach(b => b.addEventListener('click', () => Carriere7.showChron())); },
  },
  init() {
    const st = document.createElement('style');
    st.textContent = `#chron7{background:radial-gradient(ellipse at 50% 30%,#2a2218,#0c0a08)}.c7-card{width:min(640px,92vw);max-height:88vh;overflow:auto}.c7-list{display:flex;flex-direction:column;gap:4px;margin:10px 0}.c7-e{margin:0;font-size:14px;color:#d9ccae}.c7-e b{color:#e2c06e;font-weight:400;font-family:var(--display);margin-right:6px}.c7-rival b{color:#e08a6a}.c7-roi b{color:#f0d890}.c7-head{color:#efe3c6;font-size:15px}`;
    document.head.appendChild(st);
    const D = this.data(); D.s = Math.min(D.s, this.idx());
    Monde.label = function () { return `${Carriere7.label()} · Jour ${this.jour()} · ${this.periode()}`; };
    const av = Monde.avance.bind(Monde); Monde.avance = function (h) { const a = Carriere7.idx(), r = av(h), b = Carriere7.idx(); if (b > a) Carriere7.tourne(a, b); return r; };
    // la neige d'hiver sur Paris
    const wp = Weather6.pick.bind(Weather6); Weather6.pick = function () { const k = wp(); if (k || G.silent || G.mode === 'training' || G.mode === 'story' || G.weather === 'rain') return k; if (Light6.city() === 'paris' && Carriere7.hiver() && OUTDOOR.includes(G.venue) && Math.random() < .5) return 'neige'; return k; };
    // la chronique note les grands moments
    if (typeof Rival !== 'undefined') { const re = Rival.end.bind(Rival); Rival.end = function (won) { const r = this.cur, res = re(won); if (r) Carriere7.chron(won ? `Victoire sur ${r.name}.` : `Défaite contre ${r.name}. Il ne l'oubliera pas.`, 'rival'); return res; }; }
    if (typeof Roi7 !== 'undefined') { const re = Roi7.end.bind(Roi7); Roi7.end = function (won) { const before = this.data().wins, res = re(won); if (this.data().wins > before) Carriere7.chron(`${curHero().name} remporte le Tournoi du Roi (${Carriere7.label()}).`, 'roi'); return res; }; }
    const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const c = STORY.find(x => x.id === id); if (c && (/08$|10$/.test(id) || c.id === 'ch10')) Carriere7.chron(`${c.title} : un chapitre de la grande histoire se referme.`, 'histoire'); };
    UI5.ext.push(this.ext);
    // l'épilogue de 1640 s'affiche au retour sur la carte
    const op = UI5.openParis.bind(UI5); UI5.openParis = function (q) { const r = op(q); if (Carriere7.finPending) setTimeout(() => Carriere7.epilogue(), 300); return r; };
    // dernier module 7.0 : l'accueil a pu s'afficher avant que les modules ne soient prêts
    try { if ($('accueil') && !$('accueil').hidden) UI5.refreshAccueil(); } catch (e) { console.error(e); }
  },
};
