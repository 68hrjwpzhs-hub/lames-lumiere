// =============================== 7.0 · sprint 61 : deux nouvelles lames ===============================
// Oriane de Valcroze, « la Main-Gauche » : rapière et main gauche (dague). Une parade parfaite coupe aussi avec la dague.
// Barthélemy Aubrac, « l'Aveugle » : un vieux maître qui n'y voit presque plus. Pas de signal visuel de parade pour lui,
// mais il l'entend : un tic à l'approche, un tic plus clair au bon moment. Sa fenêtre de parade parfaite est plus large.
// Chacun a son récit personnel (personnages et dialogues originaux).
Object.assign(HEROES, {
  oriane: { id7: 'oriane', name: 'Oriane de Valcroze', title: 'La Main-Gauche', desc: 'Fille d\'un maître d\'armes de Lyon, elle se bat des deux mains : la rapière attaque, la dague répond.',
    resist: 1.04, speed: .92, dmg: 1, dash: 1.1, parry: .01, passive: ['Main gauche', 'Chaque parade parfaite coupe aussi avec la dague (4 points).'], offhand: 'dague',
    rapier: { name: 'La Sœur jumelle', desc: 'Rapière lyonnaise, assortie à sa dague.', speed: .92, power: 1, len: 112, guard: .01, blade: '#eef2f6', hilt: '#c8a050' },
    look: { style: 'dame', body: 'f', skin: '#efc8a8', hair: '#7a2e14', hairStyle: 'long', beard: 'none', hatType: 'feutre', hat: '#1a2a1e', plume: '#d8b25e', cape: '#14241a', coat: '#2a4a32', coat2: '#14261a', hose: '#141c16', trim: '#d8b25e', boot: '#2a1a12', glove: '#4a3422' } },
  aubrac: { id7: 'aubrac', name: 'Barthélemy Aubrac', title: 'L\'Aveugle', desc: 'Ancien maître de la salle du Petit-Pont. Ses yeux l\'ont quitté, pas ses oreilles : il pare au son.',
    resist: .95, speed: 1.08, dmg: 1.05, dash: .92, parry: .06, passive: ['Parer à l\'oreille', 'Pas de signal visuel de parade : un tic sonore à la place. Fenêtre de parade parfaite +0,06 s.'],
    rapier: { name: 'La Canne d\'acier', desc: 'Lame sobre, garde à anneaux usée par la main.', speed: 1.02, power: 1.06, len: 114, guard: .02, blade: '#dde3ea', hilt: '#8a8f98' },
    look: { style: 'renaissance', body: 'h', age: 'vieux', scar: true, skin: '#d8a888', hair: '#e4e0d8', hairStyle: 'long', beard: 'full', hatType: 'aucun', plume: null, cape: '#2a2420', coat: '#4a3e34', coat2: '#2a221c', hose: '#2a221c', stock: '#c8c0a8', trim: '#a8a090', boot: '#2a1a12', glove: '#4a3a2a' } },
});
HERO_IDS.push('oriane', 'aubrac');
HERO_OFFHAND.oriane = 'dague'; HERO_OFFHAND.aubrac = null;
// récits personnels
Object.assign(SPK, { maitrelyon: { name: 'Maître Gaspard Valcroze', col: '#2a4a32' }, eleve: { name: 'Le premier élève', col: '#3a2a1a' } });
Object.assign(STORY_FOES, {
  maitrelyon: { name: 'Maître Gaspard Valcroze', level: 'maitre', tweak: { slow: 1.42, perfect: .5, feint: .3 }, rapier: 'milanaise', offhand: 'dague', look: () => mk('maitre', { coat: '#2a4a32', coat2: '#14261a', hose: '#14261a', hair: '#a8a090', beard: 'pointed', plume: null }) },
  eleve: { name: 'Le premier élève', level: 'maitre', tweak: { slow: 1.38, aggr: .62, stopHit: .25 }, rapier: 'tolede', offhand: null, look: () => mk('maitre', { coat: '#5a3a1a', coat2: '#2e1e0c', hose: '#2e1e0c', beard: 'moustache', plume: '#b2302a' }) },
});
STORY.push(
  { id: 'r_oriane', side: true, act: 'Récits des nouvelles lames', title: 'La Salle de Lyon', venue: 'salle', hero: 'oriane',
    intro: [L_('narr', 'Lyon, 1630. Dans la salle d\'armes de son père, Oriane apprend tout, mais n\'a jamais le droit de tirer devant les élèves.'),
      L_('maitrelyon', 'Une fille ne tire pas en salle, Oriane. On rirait de moi jusqu\'à Vienne.'),
      L_('oriane', 'Alors tirez contre moi, père. Si je perds, je range la dague. Si je gagne, c\'est vous qui rirez le premier.'),
      L_('narr', 'Astuce : une parade parfaite d\'Oriane coupe aussi avec la dague.')],
    fights: [{ foe: 'maitrelyon', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites' },
    outro: [L_('maitrelyon', 'La main gauche… je ne t\'ai jamais appris ça.'), L_('oriane', 'Vous me l\'avez appris sans le savoir : vous paraiez toujours trop tard de ce côté.'), L_('narr', 'Le lendemain, une épée neuve et une dague assortie attendaient sur son lit.')], rewards: { ecus: 160 } },
  { id: 'r_aubrac', side: true, act: 'Récits des nouvelles lames', title: 'La Salle du Petit-Pont', venue: 'nuit', hero: 'aubrac',
    intro: [L_('narr', 'Paris, une nuit d\'hiver. Le premier élève de Barthélemy Aubrac a ouvert sa propre salle, et dit partout que son vieux maître est fini.'),
      L_('eleve', 'Vous n\'y voyez plus, maître. Je vous ai tout pris : vos élèves, votre salle, et bientôt votre nom.'),
      L_('aubrac', 'Tu m\'as pris ce que tu pouvais voir. Le reste, tu ne l\'as jamais entendu.'),
      L_('narr', 'Astuce : aucun signal visuel. Écoutez le tic : un premier à l\'approche, un second au bon moment.')],
    fights: [{ foe: 'eleve', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites, à l\'oreille' },
    outro: [L_('eleve', 'Comment… vous ne pouviez pas me voir…'), L_('aubrac', 'Ton pied gauche racle quand tu prépares ta fente. Il raclait déjà quand tu avais quinze ans.'), L_('narr', 'La salle du Petit-Pont rouvrit au printemps. On y apprend à parer les yeux fermés.')], rewards: { ecus: 160 } },
);
Object.assign(LESSONS, {
  r_oriane: { name: 'La main gauche', tip: 'Parez au dernier instant : la dague coupe en même temps.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  r_aubrac: { name: 'Parer à l\'oreille', tip: 'Fermez les yeux s\'il le faut : le second tic donne le moment.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
});
for (const [id, fk] of [['r_oriane', 'maitrelyon'], ['r_aubrac', 'eleve']]) {
  const c = STORY.find(x => x.id === id), who = { [fk]: 'e' }, n = c.intro.length, m = c.outro.length;
  const iSteps = []; for (let k = 0; k < n; k++) iSteps.push(k === 0 ? [['cam', 520, 1.05], ['walk', 'p', 310]] : k === n - 1 ? [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', 'salut']] : [['cam', k % 2 ? 620 : 340, 1.35]]);
  const oSteps = []; for (let k = 0; k < m; k++) oSteps.push(k === m - 1 ? [['cam', 480, 1.05], ['stance', 'e', 'stand']] : [['cam', k % 2 ? 340 : 620, 1.35]]);
  CINE[id] = { intro: { place: { p: -60, e: 650 }, cast: {}, stance: { p: 'stand', e: 'stand' }, who, steps: iSteps }, outro: { place: { p: 330, e: 640 }, cast: {}, stance: { p: 'stand', e: 'kneel' }, who, steps: oSteps } };
}
const Heros7 = {
  is(f, id) { const h = heroOf(f); return !!(h && h.id7 === id); },
  aveugle() { return G.p && this.is(G.p, 'aubrac'); },
  init() {
    // Oriane : la dague coupe pendant la parade parfaite
    const pa = G.parry; G.parry = function (a, d, bp) { const r = pa.apply(this, arguments); if (Heros7.is(d, 'oriane') && a && a.hp > 1) { a.hp = Math.max(1, a.hp - 4); this.say('Main gauche !', [bp[0], bp[1] - 62], '#d8f0c0', 20); this.spark(bp, 8, '#e8f4d8'); Snd.tick(); } return r; };
    // Aubrac : pas de signal visuel, mais deux tics sonores
    const pc = G.parryCue; G.parryCue = function () { if (Heros7.aveugle()) return; return pc.apply(this, arguments); };
    const ci = G.cueInfo; G.cueInfo = function () { if (Heros7.aveugle() && !Heros7.ear) return null; return ci.apply(this, arguments); };
    const st = G.step; G.step = function (dt) {
      const r = st.apply(this, arguments);
      if (this.state === 'fight' && Heros7.aveugle() && this.pw !== 'stricte') {
        Heros7.ear = true; let c = null; try { c = ci.call(this); } finally { Heros7.ear = false; }
        if (!c) { Heros7.mv = null; Heros7.ph = 0; }
        else { if (Heros7.mv !== this.e.move) { Heros7.mv = this.e.move; Heros7.ph = 0; } const ph = c.inWin ? 2 : 1; if (ph > Heros7.ph) { Heros7.ph = ph; Heros7.tic(ph); } }
      }
      return r;
    };
  },
  tic(ph) { if (ph === 2) { Snd.tone(1760, .12, .2, 'triangle'); Snd.tone(2640, .1, .08, 'sine'); } else Snd.tone(1100, .06, .09, 'triangle'); this.lastTic = { ph, t: G.time }; },
};
