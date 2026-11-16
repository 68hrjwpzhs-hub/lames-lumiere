// =============================== 6.0 · sprints 42 et 43 : Paris vivant, et les conséquences ===============================
// Une horloge de jeu (chaque duel, mission ou voyage fait passer les heures), des événements qui naissent et meurent sur la carte,
// trois personnages récurrents, des quartiers qui vous protègent, vous craignent ou vous dénoncent.
// Conséquences : blessures qui durent quelques jours (le chirurgien les soigne), arrestation par le guet, duel au premier sang ou à outrance.
const PNJ = {
  margot: { name: 'Margot', role: 'tient la Croix-Blanche', hint: 'Amie : les alliés de la taverne coûtent 20 % de moins.' },
  bertrand: { name: 'Le capitaine Bertrand', role: 'commande le guet', hint: 'Ami : le guet ferme les yeux sur vous. Ennemi : il vous cherche.' },
  anselme: { name: 'Maître Anselme', role: 'chirurgien de l\'Hôtel-Dieu', hint: 'Ami : ses soins coûtent 30 % de moins.' },
};
const EVENTS = {
  rixe: { name: 'Rixe à la taverne', dur: 6, fight: 'melee', ecus: 70, rep: { honneur: 2 }, pnj: { margot: 1 }, att: 1,
    text: q => `Des bretteurs ivres mettent à sac une taverne de ${QUARTIERS[q].name}. Margot vous fait signe : il faut les séparer.`, act: 'Séparer les bretteurs' },
  enlevement: { name: 'Enlèvement', dur: 5, fight: 'chase', ecus: 90, rep: { honneur: 3 }, pnj: { margot: 2 }, att: 2,
    text: q => `On enlève la nièce de Margot dans ${QUARTIERS[q].name} ! Le ravisseur file par les toits.`, act: 'Le poursuivre' },
  guet: { name: 'Le guet en alerte', dur: 8, fight: null, att: 0,
    text: q => `Le capitaine Bertrand a doublé les rondes dans ${QUARTIERS[q].name}. Chaque duel y attirera une lame de plus, et l'on risque l'arrestation.` },
  clandestin: { name: 'Duel clandestin', dur: 4, fight: 'duel', level: 'maitre', bet: true, rep: { crainte: 2 }, att: 0,
    text: q => `Un duel clandestin se prépare dans ${QUARTIERS[q].name}. Les paris sont ouverts : misez sur vous-même.`, act: 'Miser et se battre' },
  vol: { name: 'Un marchand dépouillé', dur: 6, fight: 'duel', level: 'duelliste', ecus: 50, rep: { honneur: 1 }, pnj: { bertrand: 1 }, att: 1,
    text: q => `Un tire-laine vient de dépouiller un marchand dans ${QUARTIERS[q].name}. Le guet arrive trop tard, comme toujours.`, act: 'Rattraper le voleur' },
  rumeur: { name: 'La rumeur se confirme', dur: 8, fight: 'duel', level: 'duelliste', ecus: 80, rep: { faveur: 1 }, att: 1,
    text: q => `« ${Carte.rumeur(q)} » C'était vrai, et l'homme qu'il faut trouver vous attend.`, act: 'Aller voir' },
};
const EV_ICON = 'M12 4 L12 14 M12 18.5 L12 19';
const EV_AT = { louvre: [196, 150], marais: [548, 146], cite: [512, 194], pontneuf: [350, 186], stgermain: [330, 262], stantoine: [760, 140] };
const Monde = {
  data() { const d = Save.data; if (!d.monde) d.monde = { jour: 1, h: 18, ev: [], att: {}, pnj: {}, bl: {}, arrest: null, n: 0 }; return d.monde; },
  abs() { const D = this.data(); return D.jour * 24 + D.h; },
  heure() { return this.data().h; },
  jour() { return this.data().jour; },
  periode() { const h = this.heure(); return h < 6 ? 'nuit' : h < 12 ? 'matin' : h < 18 ? 'après-midi' : h < 21 ? 'soir' : 'nuit'; },
  label() { return `Jour ${this.jour()} · ${this.periode()}`; },
  avance(hrs) {
    const D = this.data(); D.h += hrs; while (D.h >= 24) { D.h -= 24; D.jour++; }
    D.ev = D.ev.filter(e => e.until > this.abs() && !e.done || e.done && e.until > this.abs() - 24).slice(-8);
    for (const z in D.bl) if (D.bl[z] <= this.abs()) delete D.bl[z];
    this.spawn(); Save.persist();
  },
  rng() { const D = this.data(); D.n = (D.n || 0) + 1; return Defi.rng('ldo-monde-' + D.jour + '-' + D.h + '-' + D.n); },
  active() { const now = this.abs(); return this.data().ev.filter(e => !e.done && e.until > now); },
  spawn(force) {
    const R = this.rng(); if (!force && (this.active().length >= 2 || R() > .65)) return null;
    const qs = Object.keys(QUARTIERS).filter(q => q !== 'stantoine' || (Carte.data().total || 0) >= 3), ks = Object.keys(EVENTS), k = ks[Math.floor(R() * ks.length)], q = qs[Math.floor(R() * qs.length)];
    if (this.active().some(e => e.q === q)) return null;
    const ev = { id: `ev-${this.data().jour}-${this.data().h}-${k}-${q}`, k, q, until: this.abs() + EVENTS[k].dur, foe: pick(MISSION_FOES), venue: pick(QUARTIERS[q].venues) };
    this.data().ev.push(ev); return ev;
  },
  guetActive(q) { return this.active().some(e => e.k === 'guet' && e.q === q); },
  // ---- quartiers : de -10 à +10 ----
  att(q) { return this.data().att[q] || 0; },
  addAtt(q, n) { if (!q || !QUARTIERS[q]) return; const A = this.data().att; A[q] = clamp((A[q] || 0) + n, -10, 10); },
  attState(q) { const a = this.att(q); if (a >= 4) return 'protege'; if (a <= -4) return 'denonce'; if (Rep.data().crainte >= 40 && a <= 1) return 'craint'; return 'neutre'; },
  ATT: { protege: ['Le quartier vous protège', 'missions +10 % d\'écus, le guet vous laisse passer'], denonce: ['Le quartier vous dénonce', 'le guet y est toujours sur vos talons'], craint: ['Le quartier vous craint', 'vos adversaires y partent essoufflés'], neutre: ['Le quartier vous observe', 'vos actes y décideront de votre nom'] },
  // ---- personnages récurrents : de -5 à +5 ----
  pnj(k) { return this.data().pnj[k] || 0; },
  addPnj(k, n) { const P = this.data().pnj; P[k] = clamp((P[k] || 0) + n, -5, 5); },
  // ---- conséquences ----
  regle() { return store.get('ct2d.regle', 'outrance'); },
  regleHTML() { const r = this.regle(); return `<div class="m6-regle" role="group" aria-label="Règle du duel"><button class="opt small" data-regle="sang" aria-pressed="${r === 'sang'}"><b>Au premier sang</b><span>vite fini, moitié moins d'écus, sans séquelle</span></button><button class="opt small" data-regle="outrance" aria-pressed="${r === 'outrance'}"><b>À outrance</b><span>deux manches, +25 % d'écus, blessures durables</span></button></div>`; },
  bindRegle(c, U) { c.querySelectorAll('[data-regle]').forEach(b => b.addEventListener('click', () => { store.set('ct2d.regle', b.dataset.regle); Snd.tick(); U.renderCard(); })); },
  mult(opts) { const r = opts && opts.regle; return r === 'sang' ? .5 : r === 'outrance' ? 1.25 : 1; },
  wounds() { const D = this.data(), now = this.abs(); return Object.keys(D.bl).filter(z => D.bl[z] > now); },
  carries() { const o = G.matchOpts || {}; return !G.silent && G.mode !== 'training' && G.mode !== 'story' && !o.ecole && !o.defi && G.state !== 'demo'; },
  soinPrix() { return Math.round(40 * this.wounds().length * (this.pnj('anselme') >= 2 ? .7 : 1)); },
  soigner() { const p = this.soinPrix(), d = Save.data; if ((d.ecus || 0) < p) return toastMsg(`Il faut ${p} écus pour le chirurgien.`), false; d.ecus -= p; this.data().bl = {}; this.addPnj('anselme', 1); Save.persist(); return true; },
  dormir() { const h = this.heure(), w = h < 7 ? 7 - h : 31 - h; this.avance(w); if (this.wounds().length) { const D = this.data(); for (const z in D.bl) D.bl[z] -= 12; } this.avance(0); },
  // ---- arrestation ----
  arrestCheck(q, won) {
    if (!q || !QUARTIERS[q] || this.pnj('bertrand') >= 2) return; const guet = Carte.guet(q), cr = Rep.data().crainte;
    const p = !won && guet ? .6 : won && guet && cr >= 60 ? .25 : this.attState(q) === 'denonce' && !won ? .4 : 0;
    if (p && Math.random() < p) { this.data().arrest = { q, amende: 60 + Math.max(0, -this.pnj('bertrand')) * 20 }; Save.persist(); }
  },
  // ---- jouer un événement ----
  opp(ev, level) { const m = { id: ev.id, type: 'duel', level, foe: ev.foe }; return Carte.foeOpp(m); },
  play(ev, bet) {
    const E = EVENTS[ev.k], base = { mode: 'duel', venue: ev.venue, evId: ev.id, noJoute: E.fight === 'melee' };
    this.cur = { ev, bet: bet || 0 }; if (bet) { Save.data.ecus -= bet; Save.persist(); }
    if (E.fight === 'melee') return Melee.start([this.opp(ev, 'duelliste'), ...Melee.gardes(3).slice(0, 2)].map((f, i) => i ? Object.assign({}, f, { name: 'Bretteur ivre' }) : f), base);
    if (E.fight === 'chase') return Chase.start({ id: ev.id }, () => G.startMatch(Object.assign({}, base, { opp: Object.assign({}, this.opp(ev, 'duelliste'), { name: 'Le ravisseur' }), chaseWon: true, noJoute: true })), () => this.endEv(false));
    G.startMatch(Object.assign({}, base, { opp: this.opp(ev, E.level || 'duelliste'), wins: E.bet ? 1 : 2 }));
  },
  endEv(won) {
    const C = this.cur; if (!C) return ''; this.cur = null; const ev = C.ev, E = EVENTS[ev.k], d = Save.data; let txt;
    const e = this.data().ev.find(x => x.id === ev.id); if (e) e.done = true;
    if (won) {
      const mul = this.mult(G.matchOpts) * (this.attState(ev.q) === 'protege' ? 1.1 : 1), gain = Math.round(((E.ecus || 0) + C.bet * 2) * mul); d.ecus = (d.ecus || 0) + gain;
      if (E.rep) Rep.add(E.rep); for (const k in E.pnj || {}) this.addPnj(k, E.pnj[k]); this.addAtt(ev.q, E.att || 0);
      txt = `${E.name} : +${gain} écus.${E.pnj ? ' ' + Object.keys(E.pnj).map(k => `${PNJ[k].name} s'en souviendra.`).join(' ') : ''}`;
    } else { this.addAtt(ev.q, -1); txt = `${E.name} : c'est manqué.${C.bet ? ` Votre mise de ${C.bet} écus est perdue.` : ''}`; }
    this.arrestCheck(ev.q, won); Save.persist(); return txt;
  },
  // ---- sur la carte ----
  ext: {
    kind: 'ev',
    seals(city) {
      if (city !== 'paris') return []; const out = [];
      for (const e of Monde.active()) { const Q = QUARTIERS[e.q], at = EV_AT[e.q] || [422, 195]; if (!Q) continue; out.push({ id: 'ev:' + e.id, x: at[0], y: at[1], wax: '#b07a22', icon: EV_ICON, cls: 'ev', aria: `${EVENTS[e.k].name} : ${Q.name}` }); }
      if (Monde.wounds().length) out.push({ id: 'chir:1', x: 528, y: 250, wax: '#e8e0cc', dark: true, icon: 'M12 5 L12 19 M5 12 L19 12', label: 'Hôtel-Dieu', aria: 'Le chirurgien de l\'Hôtel-Dieu' });
      if (Monde.data().arrest) out.push({ id: 'arr:1', x: P5.you[0], y: P5.you[1] - 34, wax: '#1a1a2a', icon: 'M7 10 C7 6 17 6 17 10 L17 13 C17 17 7 17 7 13 Z M9 17 L9 20 M15 17 L15 20', aria: 'Arrêté par le guet' });
      return out;
    },
    card(k, U) {
      const e = Monde.data().ev.find(x => x.id === k); if (!e) return ''; const E = EVENTS[e.k], left = Math.max(0, e.until - Monde.abs());
      let b = `<p>${UI5.esc(E.text(e.q))}</p><p class="rum">Encore ${left} heure${left > 1 ? 's' : ''} avant que l'occasion ne passe.</p>`;
      if (E.fight) {
        b += Monde.regleHTML();
        if (E.bet) { b += '<div class="row">'; for (const m of [20, 50, 100]) b += `<button class="go" data-bet="${m}">Miser ${m} écus</button>`; b += '</div>'; }
        else b += `<button class="go" data-ev="go">${E.act}</button>`;
      }
      return U.card('#b07a22', 'Événement · ' + QUARTIERS[e.q].name, E.name, b);
    },
    bind(c, k, U, kind) {
      Monde.bindRegle(c, U); if (kind !== 'ev') return; const e = Monde.data().ev.find(x => x.id === k); if (!e) return;
      c.querySelectorAll('[data-ev]').forEach(b => b.addEventListener('click', () => { Snd.init(); U.ret = 'paris'; Monde.play(e); }));
      c.querySelectorAll('[data-bet]').forEach(b => b.addEventListener('click', () => { const m = +b.dataset.bet; if ((Save.data.ecus || 0) < m) return toastMsg(`Il vous faut ${m} écus pour miser.`); Snd.init(); U.ret = 'paris'; Monde.play(e, m); }));
    },
    qExtra(q, city) {
      if (city !== 'paris') return Monde.regleHTML(); const st = Monde.attState(q), [t, d] = Monde.ATT[st];
      return `<p class="m6-att m6-${st}"><b>${t}</b> · ${d}</p>${Monde.guetActive(q) ? '<p><b>Le guet est en alerte ici.</b></p>' : ''}${Monde.regleHTML()}`;
    },
    onRender(U) { const s = $('p5Sub'); if (s) s.textContent = `${Rep.title()} · ${Monde.label()}`; if (Monde.data().arrest) U.sel = 'arr:1'; },
  },
  extChir: {
    kind: 'chir',
    card(k, U) {
      const W = Monde.wounds(), D = Monde.data(), now = Monde.abs(), N = { bras: 'Bras armé', jambe: 'Jambe', torse: 'Flanc' };
      let b = `<p>${PNJ.anselme.name}, ${PNJ.anselme.role}, examine vos blessures. Tant qu'elles ne sont pas refermées, vous les portez à chaque duel.</p>`;
      for (const z of W) b += `<p class="m6-att m6-denonce"><b>${N[z]}</b> · encore ${Math.ceil((D.bl[z] - now) / 24 * 10) / 10} jour(s)</p>`;
      b += `<button class="go" data-chir="soin">Se faire soigner · ${Monde.soinPrix()} écus</button><button class="go alt" data-chir="dormir">Dormir à la Croix-Blanche jusqu'au matin</button>`;
      return U.card('#e8e0cc', 'L\'île de la Cité', 'L\'Hôtel-Dieu', b);
    },
    bind(c, k, U, kind) { if (kind !== 'chir') return; c.querySelectorAll('[data-chir]').forEach(b => b.addEventListener('click', () => { if (b.dataset.chir === 'soin') { if (Monde.soigner()) { Snd.ding(); toastMsg('Maître Anselme recoud vos plaies.'); } } else { Monde.dormir(); toastMsg(`Vous voilà reposé : ${Monde.label()}.`); } U.sel = null; U.renderParis(); })); },
  },
  extArr: {
    kind: 'arr',
    card(k, U) {
      const A = Monde.data().arrest; if (!A) return '';
      return `<div class="ey"><span><i style="background:#1a1a2a"></i>Le guet</span></div><h4>Arrêté !</h4><p>${PNJ.bertrand.name} vous tient au collet dans ${QUARTIERS[A.q] ? QUARTIERS[A.q].name : 'Paris'}. Les édits du roi interdisent le duel.</p>
        <button class="go" data-arr="payer">Payer l'amende · ${A.amende} écus</button><button class="go alt" data-arr="nuit">Passer la nuit au Châtelet</button><button class="go alt" data-arr="fuir">S'enfuir par les toits</button>`;
    },
    bind(c, k, U, kind) {
      if (kind !== 'arr') return; const D = Monde.data(), A = D.arrest;
      c.querySelectorAll('[data-arr]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.arr, d = Save.data;
        if (a === 'payer') { if ((d.ecus || 0) < A.amende) return toastMsg('Vous n\'avez pas de quoi payer.'); d.ecus -= A.amende; Monde.addPnj('bertrand', 1); D.arrest = null; Save.persist(); toastMsg('Le capitaine empoche l\'amende et vous relâche.'); U.sel = null; U.renderParis(); }
        else if (a === 'nuit') { D.arrest = null; Rep.add({ honneur: -1 }); Monde.avance(12); toastMsg(`Une nuit sur la paille du Châtelet. ${Monde.label()}.`); U.sel = null; U.renderParis(); }
        else { Snd.init(); U.ret = 'paris'; D.arrest = null; Save.persist();
          Chase.start({ id: 'fuite-' + Monde.abs() }, () => { Chase.on = false; Rep.add({ crainte: 2 }); Monde.addPnj('bertrand', -1); Save.persist(); G.toMenu(); UI5.openParis(); toastMsg('Vous semez le guet sur les toits.'); },
            () => { D.arrest = { q: A.q, amende: A.amende * 2 }; Save.persist(); return 'Repris ! L\'amende double.'; }); }
      }));
    },
  },
  init() {
    this.data();
    // les missions changent avec le jour de jeu
    Carte.day = () => Defi.dayKey() + '-j' + Monde.jour();
    const cg = Carte.guet.bind(Carte); Carte.guet = q => { if (Monde.pnj('bertrand') >= 2 || Monde.attState(q) === 'protege') return false; return Monde.guetActive(q) || Monde.attState(q) === 'denonce' || cg(q); };
    // fin d'une mission : quartier, règle du duel, arrestation
    const ce = Carte.end.bind(Carte); Carte.end = function (won) {
      const C = this.cur, m = C && C.m, before = Save.data.ecus || 0, r = ce(won); if (!m) return r;
      const gain = (Save.data.ecus || 0) - before; if (won && gain > 0) { const mul = Monde.mult(G.matchOpts) * (Monde.attState(m.q) === 'protege' ? 1.1 : 1), extra = Math.round(gain * mul) - gain; Save.data.ecus += extra; }
      Monde.addAtt(m.q, !won ? -1 : m.type === 'cardinal' ? -1 : m.type === 'melee' ? 0 : 1); Monde.arrestCheck(m.q, won); Save.persist(); return r;
    };
    // la règle du duel s'applique aux missions, aux événements et aux rivaux
    const sm = G.startMatch; G.startMatch = function (opts = {}) {
      if (opts instanceof Event) opts = {};
      if ((opts.mission || opts.evId || opts.rival) && !opts.regle && !opts.melee) { opts = Object.assign({}, opts, { regle: Monde.regle() }); if (opts.regle === 'sang') opts.wins = 1; }
      return sm.call(this, opts);
    };
    const df = G.dmgFor; G.dmgFor = function (a, d, m) { let v = df.apply(this, arguments); if (this.matchOpts && this.matchOpts.regle === 'sang') v = Math.round(v * 2.2); return v; };
    // blessures durables : portées dès la première manche
    const sr = G.startRound; G.startRound = function () {
      const r = sr.apply(this, arguments);
      if (Monde.carries() && this.matchOpts && this.matchOpts.regle !== 'sang') { const W = Monde.wounds(); for (const z of W) { this.p.wounds[z] = 1; if (!this.p.marks.some(k => k.z === z)) this.p.marks.push({ z, s: .8, seed: 1.7 }); } if (W.length && this.round === 1) this.say('Vos blessures ne sont pas refermées…', [this.p.x, GROUND - 250], '#f0a48c', 18); }
      const q = this.matchOpts && (this.matchOpts.mission ? (Carte.cur && Carte.cur.m && Carte.cur.m.q) : Monde.cur && Monde.cur.ev.q);
      if (q && QUARTIERS[q] && Monde.attState(q) === 'craint' && this.round === 1) { this.e.breath = Math.min(this.e.breath, .7); this.say('Il vous craint.', [this.e.x, GROUND - 250], '#ffd76a', 18); }
      return r;
    };
    const ar = G.afterRound; G.afterRound = function () {
      const r = ar.apply(this, arguments);
      if (this.state === 'over' && Monde.carries()) {
        const o = this.matchOpts || {}; if (o.regle !== 'sang') { const D = Monde.data(); for (const z of ['bras', 'jambe', 'torse']) if (this.p.wounds[z]) D.bl[z] = Math.max(D.bl[z] || 0, Monde.abs() + (z === 'torse' ? 48 : 24)); }
        if (o.evId && Monde.cur) { const won = this.wins[0] > this.wins[1], t = Monde.endEv(won); $('overReward').textContent = t + ' ' + $('overReward').textContent; $('again').textContent = 'Carte de Paris'; this.overAction = 'carte'; }
        Monde.avance(2);
      }
      return r;
    };
    UI5.ext.push(this.ext, this.extChir, this.extArr);
    const ac = UI5.allyCost.bind(UI5); UI5.allyCost = a => Math.round(ac(a) * (Monde.pnj('margot') >= 3 ? .8 : 1));
    const st = document.createElement('style'); st.textContent = `.m6-regle{display:flex;gap:6px}.m6-regle .opt{flex:1 1 0;text-align:left;color:var(--pci);border-color:var(--pline);min-height:52px}.m6-regle .opt b{font:700 13px var(--body)}.m6-regle .opt span{font-size:11px;color:var(--pcm)}.m6-regle .opt[aria-pressed="true"]{border-color:#b07a22;background:rgba(176,122,34,.14)}
.m6-att{font-size:13px!important;padding:4px 8px;border-radius:6px;background:rgba(59,42,26,.07)}.m6-att.m6-protege{background:rgba(61,90,58,.16)}.m6-att.m6-denonce{background:rgba(155,47,36,.13)}.m6-att.m6-craint{background:rgba(47,74,110,.14)}`; document.head.appendChild(st);
  },
};
