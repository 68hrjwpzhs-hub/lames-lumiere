// =============================== 6.0 · sprint 41 : le Rival ===============================
// Des adversaires qui reviennent. Celui qui vous bat devient un rival ; celui que vous blessez peut jurer vengeance.
// Un rival garde ses cicatrices, apprend vos coups favoris (il les pare mieux), gagne des titres quand il vous bat,
// et vous provoque sur la carte. Battu trois fois, il s'avoue vaincu : à vous de l'épargner ou de l'humilier.
const RIVAL_NOMS = ['Gaspard de Montlaur', 'Renaud de Saint-Phal', 'Aymeric Brisach', 'Josselin de la Tour-Grise', 'Thibaut Mauvoisin', 'Clément d\'Orvilliers', 'Fulcran de Lodève', 'Hélène de Vaudrey', 'Bérenger Coustal', 'Ysabeau de Lancrau'];
const RIVAL_TAUNTS = ['Je connais vos fentes par cœur, à présent.', 'On dit que vous fuyez les rendez-vous. Prouvez le contraire.', 'Ma cicatrice me rappelle votre nom chaque matin.', 'Paris n\'est pas assez grand pour nous deux.', 'Ce soir, je finirai ce que nous avons commencé.', 'Votre panache ne vous sauvera pas deux fois.'];
const RIVAL_ICON = 'M5 9 C5 6 9 5 12 7 C15 5 19 6 19 9 C19 12 16 14 12 14 C8 14 5 12 5 9 Z M8.5 9.5 L10.5 9.5 M13.5 9.5 L15.5 9.5';
const Rival = {
  list() { const d = Save.data; d.rivaux = d.rivaux || []; return d.rivaux; },
  actifs() { return this.list().filter(r => r.etat === 'actif'); },
  get(id) { return this.list().find(r => r.id === id); },
  title(r) {
    const S = r.scars || [], de = { marais: 'du Marais', cite: 'de la Cité', pontneuf: 'du Pont-Neuf', louvre: 'du Louvre', stgermain: 'de Saint-Germain', stantoine: 'du faubourg' }[r.q] || 'de Paris';
    if (r.rank >= 4) return 'le Fléau de Paris'; if (r.rank >= 2) return `la Terreur ${de}`;
    if (S.includes('torse')) return 'le Balafré'; if (S.includes('jambe')) return 'le Boiteux'; if (S.includes('bras')) return 'Main-Gauche'; return r.rank >= 1 ? 'le Rancunier' : 'l\'Inconnu';
  },
  fullName(r) { return `${r.name}, ${this.title(r)}`; },
  favTop(r) { let b = null; for (const k in r.fav || {}) if (!b || r.fav[k] > r.fav[b]) b = k; return b && r.fav[b] >= 3 ? b : null; },
  // naissance d'un rival : le vainqueur d'un duel perdu, ou un vaincu blessé qui jure vengeance
  create(o, why, scar) {
    if (this.actifs().length >= 4 || !o || !o.look) return null;
    const generic = /^(Un|Une|Le|La)\s/.test(o.name || '') || !o.name, R = this.list();
    const name = generic ? RIVAL_NOMS.find(n => !R.some(r => r.name === n)) || pick(RIVAL_NOMS) : o.name;
    const mo = G.matchOpts || {}, mq = mo.mission ? String(mo.mission).split('-').slice(-2)[0] : null, q = (mq && QUARTIERS[mq] ? mq : null) || (typeof Monde !== 'undefined' && Monde.cur && Monde.cur.ev.q) || pick(Object.keys(QUARTIERS).filter(k => k !== 'stantoine'));
    const r = { id: 'r' + Date.now().toString(36) + R.length, name, look: Object.assign({}, o.look), level: o.level === 'maitre' ? 'maitre' : 'duelliste', arch: o.arch || null, rapier: o.rapier || 'tolede', offhand: o.offhand || null,
      q, rank: why === 'vainqueur' ? 1 : 0, scars: scar ? [scar] : [], fav: {}, w: 0, l: why === 'vainqueur' ? 1 : 0, etat: 'actif', next: (typeof Monde !== 'undefined' ? Monde.abs() : 0) + 6, why };
    R.push(r); Save.persist(); return r;
  },
  opp(r) {
    const lv = r.rank >= 2 ? 'maitre' : r.level, tw = { perfect: Math.min(.7, .4 + r.rank * .06 + r.w * .02), react: Math.max(.15, .21 - r.rank * .012), lineRead: Math.min(.95, .7 + r.rank * .05) };
    return { name: this.fullName(r), level: lv, tweak: tw, arch: r.arch, rapier: r.rapier, offhand: r.offhand, look: Object.assign({}, r.look, { scars: r.scars.slice() }), boss: r.rank >= 3 ? 'force' : null, rivalFav: this.favTop(r) };
  },
  venue(r) { const Q = QUARTIERS[r.q]; return Q ? pick(Q.venues) : pick(VENUE_KEYS); },
  play(r, extra) { this.cur = r; this.moves = {}; G.startMatch(Object.assign({ mode: 'duel', venue: this.venue(r), rival: r.id, opp: this.opp(r) }, extra || {})); },
  // fin d'un duel contre un rival
  end(won) {
    const r = this.cur; this.cur = null; if (!r) return ''; let txt;
    for (const k in this.moves || {}) r.fav[k] = (r.fav[k] || 0) + this.moves[k];
    const zs = ['bras', 'jambe', 'torse'].filter(z => G.e.wounds[z] && !r.scars.includes(z)); r.scars.push(...zs);
    if (won) {
      r.w++; Rep.add({ honneur: 2 }); const gain = Math.round((60 + r.rank * 30) * (typeof Monde !== 'undefined' ? Monde.mult(G.matchOpts) : 1)); Save.data.ecus = (Save.data.ecus || 0) + gain;
      if (r.w >= 3) { r.etat = 'vaincu'; txt = `${r.name} pose un genou à terre : il s'avoue vaincu. +${gain} écus. Décidez de son sort sur la carte.`; }
      else txt = `${this.fullName(r)} recule, blessé dans son orgueil. +${gain} écus.${zs.length ? ' Il en gardera la cicatrice.' : ''}`;
    } else { r.l++; r.rank = Math.min(4, r.rank + 1); Rep.add({ honneur: -1 }); txt = `${r.name} triomphe et gagne un titre : ${this.title(r)}.`; }
    const fav = this.favTop(r); if (fav && MOVES[fav]) txt += ` Il a appris à lire vos ${MOVES[fav].name.toLowerCase()}s.`;
    r.next = (typeof Monde !== 'undefined' ? Monde.abs() : 0) + 10; Save.persist(); return txt;
  },
  // provocation ignorée trop longtemps : il clame partout que vous avez fui
  check() {
    if (typeof Monde === 'undefined') return; const now = Monde.abs();
    for (const r of this.actifs()) if (r.next && now > r.next + 30) { r.next = now; r.rank = Math.min(4, r.rank + 1); Rep.add({ honneur: -1 }); toastMsg(`${r.name} clame partout que vous avez fui.`); }
  },
  ext: {
    kind: 'rv',
    seals(city) {
      if (city !== 'paris') return []; Rival.check(); const now = typeof Monde !== 'undefined' ? Monde.abs() : 1e9, out = [];
      Rival.list().forEach((r, i) => {
        const at = { louvre: [206, 118], marais: [520, 96], cite: [420, 252], pontneuf: [330, 212], stgermain: [300, 282], stantoine: [790, 250] }[r.q] || [422, 195], x = at[0] + (i % 2) * 6, y = at[1] - (i % 2) * 6;
        if (r.etat === 'actif' && now >= (r.next || 0)) out.push({ id: 'rv:' + r.id, x, y, wax: '#1c1a1e', icon: RIVAL_ICON, aria: `${Rival.fullName(r)} vous provoque` });
        if (r.etat === 'vaincu') out.push({ id: 'rv:' + r.id, x, y, wax: '#5a5560', icon: RIVAL_ICON, aria: `${r.name} attend votre décision` });
      });
      return out;
    },
    card(id, U) {
      const r = Rival.get(id); if (!r) return ''; const N = { bras: 'au bras', jambe: 'à la jambe', torse: 'au flanc' }, fav = Rival.favTop(r);
      if (r.etat === 'vaincu') return U.card('#5a5560', 'Votre rival', r.name, `<p>Battu trois fois, ${r.name} vous attend, l'épée au fourreau. Que faites-vous ?</p><button class="go" data-rv="epargner">L'épargner (honneur +3)</button><button class="go alt" data-rv="humilier">Exiger sa bourse (crainte +3, +80 écus)</button>`);
      let b = `<p class="rum">« ${UI5.esc(RIVAL_TAUNTS[(r.name.length + r.l + r.w) % RIVAL_TAUNTS.length])} »</p>`;
      b += `<p>Duels : ${r.w} victoire${r.w > 1 ? 's' : ''} pour vous, ${r.l} pour lui.${r.scars.length ? ` Cicatrice${r.scars.length > 1 ? 's' : ''} ${r.scars.map(z => N[z]).join(', ')}.` : ''}${fav ? ` Il pare mieux vos ${MOVES[fav].name.toLowerCase()}s.` : ''}</p>`;
      b += Monde.regleHTML() + `<button class="go" data-rv="go">Relever le défi</button>`;
      return U.card('#1c1a1e', 'Votre rival', UI5.esc(Rival.fullName(r)), b);
    },
    bind(c, id, U, kind) {
      if (kind !== 'rv') return; const r = Rival.get(id); if (!r) return; Monde.bindRegle(c, U);
      c.querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.rv;
        if (a === 'go') { Snd.init(); U.ret = 'paris'; Rival.play(r); return; }
        if (a === 'epargner') { r.etat = 'epargne'; Rep.add({ honneur: 3 }); toastMsg(`${r.name} vous salue. On dit qu'il parle de vous avec respect.`); }
        else { r.etat = 'humilie'; Rep.add({ crainte: 3 }); Save.data.ecus = (Save.data.ecus || 0) + 80; toastMsg(`${r.name} quitte Paris, la bourse vide.`); }
        Save.persist(); U.sel = null; U.renderParis();
      }));
    },
  },
  init() {
    // les coups du joueur pendant un duel de rival : il les retiendra
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) { if (this.isPlayer && G.matchOpts && G.matchOpts.rival && Rival.moves && MOVES[kind] && kind !== 'riposte') Rival.moves[kind] = (Rival.moves[kind] || 0) + 1; return sm.apply(this, arguments); };
    // il pare mieux le coup qu'il a appris à lire
    const pc = AI.prototype.perceive; AI.prototype.perceive = function () { const S = pc.apply(this, arguments), f = G.matchOpts && G.matchOpts.opp && G.matchOpts.opp.rivalFav;
      if (f && this.me === G.e) { if (this.basePerfect === undefined) this.basePerfect = this.L.perfect; this.L.perfect = S && S.kind === f ? Math.min(.92, this.basePerfect + .3) : this.basePerfect; } return S; };
    const ar = G.afterRound; G.afterRound = function () {
      const r = ar.apply(this, arguments), o = this.matchOpts || {};
      if (this.state === 'over' && !this.silent && this.mode !== 'training' && this.mode !== 'story' && !o.ecole && !o.defi) {
        const won = this.wins[0] > this.wins[1];
        if (o.rival && Rival.cur) { const t = Rival.end(won); $('overReward').textContent = t + ' ' + $('overReward').textContent; $('again').textContent = 'Carte de Paris'; this.overAction = 'carte'; }
        else if (o.opp && !o.melee && this.mode !== 'run') {
          const zone = ['torse', 'jambe', 'bras'].find(z => this.e.wounds[z]);
          let nv = null; if (!won) nv = Rival.create(o.opp, 'vainqueur'); else if (zone && Math.random() < .45) nv = Rival.create(o.opp, 'blesse', zone);
          if (nv) $('overReward').textContent += won ? ` ${nv.name} se relève et jure de se venger.` : ` ${nv.name} se souviendra de vous : un rival est né.`;
        }
      }
      return r;
    };
    UI5.ext.push(this.ext);
  },
};
