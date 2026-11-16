// =============================== 6.0 · sprint 47 : Livre IV « Le Carnaval de Venise » (8 chapitres, 2 actes) ===============================
// Intrigue, personnages et dialogues originaux (la famille Valdomar, la Compagnie du Masque d'argent, Chiara Lanzoni sont inventés).
// Faits historiques cités : le carnaval et ses masques (bauta, colombina), l'Arsenal, le Conseil des Dix, le verre de Murano.
// Le Livre IV s'ouvre après le Livre III. Au chapitre 5, il faut deviner qui se cache sous le masque : se tromper rend le duel plus dur.
// Sa fin dépend du choix du dernier chapitre (livrer la Bauta noire au Conseil des Dix, ou la laisser fuir sur la lagune).
Object.assign(SPK, {
  chiara: { name: 'Chiara Lanzoni, verrière de Murano', col: '#2a4a5a' }, bravo: { name: 'Le bravo du Rialto', col: '#2a2a2a' }, contremaitre: { name: 'Le contremaître de l\'Arsenal', col: '#5a3a1a' },
  colombina: { name: 'La Colombine d\'argent', col: '#4a4a5a' }, lieutenant: { name: 'Le lieutenant du Masque', col: '#3a2a3a' }, medico: { name: 'Le Médecin de la peste', col: '#3a3a30' },
  valdomar: { name: 'Ser Ettore Valdomar', col: '#1a1a1a' }, capbravi: { name: 'Le capitaine des bravi', col: '#4a1a1a' },
});
const VENISE_LOOK = (lv, o) => mk(lv, Object.assign({ hatType: 'feutre', plume: null }, o));
Object.assign(STORY_FOES, {
  bravo: { name: 'Le bravo du Rialto', level: 'duelliste', tweak: { slow: 1.5, aggr: .6 }, rapier: 'venitienne', offhand: 'cape', look: () => VENISE_LOOK('duelliste', { coat: '#2a2a2e', coat2: '#141418', hose: '#141418', cape: '#141418', beard: 'none', mask: 'bauta' }) },
  contremaitre: { name: 'Le contremaître de l\'Arsenal', level: 'duelliste', tweak: { slow: 1.55, aggr: .5 }, rapier: 'pappenheimer', offhand: 'rondache', look: () => mk('duelliste', { style: 'paysan', coat: '#6a4a2a', coat2: '#3a2a18', hose: '#3a2a18', hatType: 'beret', hat: '#3a2a18', beard: 'full', hair: '#3a2a18', plume: null }) },
  colombina: { name: 'La Colombine d\'argent', level: 'maitre', tweak: { slow: 1.45, feint: .45, esq: .25 }, rapier: 'milanaise', offhand: 'dague', look: () => mk('maitre', { style: 'dame', body: 'f', coat: '#5a5a6a', coat2: '#2a2a34', hose: '#2a2a34', hairStyle: 'chignon', hair: '#14100c', beard: 'none', plume: '#e8e4dc', mask: 'colombina', maskCol: '#c8ccd8' }) },
  lieutenant: { name: 'Le lieutenant du Masque', level: 'maitre', tweak: { slow: 1.45, perfect: .45 }, rapier: 'venitienne', offhand: null, look: () => VENISE_LOOK('maitre', { coat: '#3a1a2a', coat2: '#1e0c16', hose: '#1e0c16', cape: '#1e0c16', mask: 'colombina', maskCol: '#d8b25e' }) },
  lieutenantPrevenu: { name: 'Le lieutenant, prévenu', level: 'maitre', tweak: { slow: 1.3, perfect: .58, aggr: .7, react: .17 }, rapier: 'venitienne', offhand: 'dague', look: () => VENISE_LOOK('maitre', { coat: '#3a1a2a', coat2: '#1e0c16', hose: '#1e0c16', cape: '#1e0c16', mask: 'colombina', maskCol: '#d8b25e' }) },
  arsenalotto: { name: 'Un arsenalotto armé', level: 'duelliste', tweak: { slow: 1.6 }, rapier: 'garnison', offhand: null, look: () => mk('duelliste', { style: 'paysan', coat: '#5a4a3a', coat2: '#3a2e22', hose: '#3a2e22', hatType: 'aucun', plume: null }) },
  capbravi: { name: 'Le capitaine des bravi', level: 'maitre', tweak: { slow: 1.4, aggr: .65, stopHit: .3 }, rapier: 'solingen', offhand: 'dague', look: () => VENISE_LOOK('maitre', { coat: '#4a1a1a', coat2: '#2a0c0c', hose: '#2a0c0c', cape: '#2a0c0c', beard: 'full', mask: 'bauta' }) },
  medico: { name: 'Le Médecin de la peste', level: 'maitre', tweak: { slow: 1.35, feint: .5, esq: .22, bait: .3 }, rapier: 'venitienne', offhand: 'cape', boss: 'feinte', look: () => mk('maitre', { style: 'rodeur', coat: '#2a2820', coat2: '#14130e', hose: '#14130e', hatType: 'feutre', hat: '#0e0e0a', cape: '#14130e', beard: 'none', plume: null, mask: 'medico' }) },
  valdomar: { name: 'Ser Ettore Valdomar, la Bauta noire', level: 'maitre', tweak: { slow: 1.28, fer: .5, derob: .6, perfect: .52, react: .17 }, rapier: 'ferrara', offhand: 'dague', boss: 'fer', look: () => VENISE_LOOK('maitre', { coat: '#141414', coat2: '#0a0a0a', hose: '#0a0a0a', trim: '#c8a050', cape: '#0a0a0a', hair: '#8a8a8a', mask: 'bauta' }) },
});
NPC_LOOK.chiara = () => mk('duelliste', { style: 'dame', body: 'f', coat: '#2a4a5a', coat2: '#14242e', hose: '#14242e', hairStyle: 'long', hair: '#6a3a1a', beard: 'none', plume: null, hatType: 'aucun' });
const ACT8 = 'Livre IV · Acte VIII · Les masques', ACT9 = 'Livre IV · Acte IX · La Bauta noire';
const bonMasque = S => S.choices.d05 === 'dore', livree = S => S.choices.d08 === 'livrer';
STORY.push(
  { id: 'd01', book: 4, act: ACT8, title: 'Le Grand Canal', venue: 'canal', hero: 'isaure',
    intro: [L_('narr', 'Février 1635. Venise en carnaval : six mois de masques, de musique et de duels qu\'on ne déclare pas.'),
      L_('isaure', 'Une lettre sans signature, un sceau d\'argent en forme de masque, et un rendez-vous sur la fondamenta. J\'aurais dû rester à Paris.'),
      L_('bravo', 'La Française aux lettres. Mon maître paie bien ceux qui jettent les curieuses dans le canal.'),
      L_('narr', 'Astuce : sa cape couvre ses ripostes. Parez, puis ripostez tout de suite.')],
    fights: [{ foe: 'bravo', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('bravo', 'La Compagnie… du Masque d\'argent… vous trouvera…'), L_('chiara', 'Vous l\'avez désarmé sans le tuer. Ici, on appelle ça de la politesse. Je m\'appelle Chiara, et c\'est moi qui vous ai écrit.')], rewards: { ecus: 160 } },
  { id: 'd02', book: 4, act: ACT8, title: 'L\'Arsenal', venue: 'arsenal', hero: 'mathurin',
    intro: [L_('chiara', 'Le Masque d\'argent loue ses lames aux familles nobles. Mais il vole aussi : les plans des galères de l\'Arsenal.'),
      L_('mathurin', 'Des plans de galère. Je ne sais pas lire un plan, mais je sais reconnaître un voleur.'),
      L_('contremaitre', 'Personne n\'entre à l\'Arsenal sans la parole du provéditeur. Et personne n\'en sort avec des papiers.'),
      L_('narr', 'Astuce : sa rondache bloque tout, sauf la fente lourde. Maintenez Attaque pour briser sa garde.')],
    fights: [{ foe: 'contremaitre', wins: 2 }], goal: { type: 'stat', stat: 'gbreaks', op: '>=', v: 1, label: 'Briser sa garde une fois' },
    outro: [L_('contremaitre', 'Je ne suis pas votre voleur ! On m\'a payé pour garder la cale numéro sept, rien de plus.'), L_('mathurin', 'La cale numéro sept. Celle qui brûle, là-bas ?')], rewards: { ecus: 170 } },
  { id: 'd03', book: 4, act: ACT8, title: 'Le Pont des masques', venue: 'canal', hero: 'bastien',
    intro: [L_('narr', 'Minuit sur un petit pont du Cannaregio. Une dame en colombine d\'argent attend, une dague à la ceinture.'),
      L_('colombina', 'Vous cherchez la Bauta noire, Gascon. Personne ne la trouve. Elle trouve les gens.'),
      L_('bastien', 'Alors elle m\'a trouvé. Et vous, vous êtes quoi ? Le message ou la messagère ?'),
      L_('narr', 'Astuce : elle feinte et esquive. N\'attaquez pas dans le vide : esquivez sa vraie attaque, puis ripostez.')],
    fights: [{ foe: 'colombina', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies' },
    outro: [L_('colombina', 'Au bal du palais Valdomar, demain. Celui qui ne danse pas compte les invités. C\'est lui.'), L_('bastien', 'Celui qui ne danse pas. C\'est maigre, comme indice.')], rewards: { ecus: 180 } },
  { id: 'd04', book: 4, act: ACT8, title: 'Le Bal du palais Valdomar', venue: 'palais', hero: 'vaucelles',
    intro: [L_('narr', 'Le palais Valdomar, sur le Grand Canal. Trois cents masques, deux lustres de Murano, et autant de dagues sous les manteaux.'),
      L_('vaucelles', 'Je ne danse plus depuis la prise de Montauban. Ça tombe bien, je ne suis pas venu pour danser.'),
      L_('lieutenant', 'Un vieux soldat français au bal ? Vous vous êtes trompé de carnaval, monsieur.'),
      L_('narr', 'Astuce : il pare bien. Attaquez au moment où il se prépare (coup d\'arrêt).')],
    fights: [{ foe: 'lieutenant', wins: 2 }], goal: { type: 'stat', stat: 'stopHits', op: '>=', v: 1, label: 'Un coup d\'arrêt' },
    outro: [L_('lieutenant', 'Vous ne verrez jamais son visage. Il porte trois masques ce soir.'), L_('chiara', 'Trois masques : un blanc à canne d\'argent, un doré qui ne danse pas, un à long bec. Lequel est le maître ?')], rewards: { ecus: 190 } },
  { id: 'd05', book: 4, act: ACT8, title: 'Qui est sous le masque ?', venue: 'palais', hero: 'isaure',
    intro: [L_('narr', 'Fin du bal. Trois masques quittent la salle par trois portes différentes. Il faut en suivre un, et un seul.'),
      L_('isaure', 'La Colombine a dit : celui qui ne danse pas compte les invités.'),
      L_('chiara', 'Décidez vite. Les portes se referment.')],
    choice: { prompt: 'Quel masque suivez-vous ?', options: [{ id: 'blanc', label: 'Le masque blanc à canne d\'argent', desc: 'Il a salué le doge du carnaval.' }, { id: 'dore', label: 'Le masque doré qui ne danse pas', desc: 'Il est resté contre une colonne toute la soirée.' }, { id: 'bec', label: 'Le masque à long bec', desc: 'Il est parti le premier, très vite.' }] },
    get fights() { return bonMasque(Story.data()) ? [{ foe: 'lieutenant', wins: 2 }] : [{ foe: 'lieutenantPrevenu', wins: 2 }]; },
    goal: { type: 'stat', stat: 'perfect', op: '>=', v: 1, label: 'Une parade parfaite' },
    outro: [Object.assign(L_('narr', 'Le masque doré tombe : c\'est le lieutenant, qui portait les comptes de la Compagnie. Vous le surprenez seul, sans ses gardes.'), { cond: bonMasque }),
      Object.assign(L_('narr', 'Mauvaise porte : le masque que vous suiviez n\'était qu\'un leurre. Le lieutenant, prévenu, vous attendait avec ses meilleurs gardes.'), { cond: S => !bonMasque(S) }),
      L_('isaure', 'Les comptes de la Compagnie. Des noms de familles, des sommes… et une adresse à l\'Arsenal.')], rewards: { ecus: 200 } },
  { id: 'd06', book: 4, act: ACT9, title: 'L\'Arsenal en feu', venue: 'arsenal', hero: 'alvaro', chain: true,
    intro: [L_('narr', 'La cale numéro sept brûle. Les bravi de la Compagnie y emportent les plans des galères vers une barque.'),
      L_('alvaro', 'Deux lames entre nous et la barque. Une à la fois, et sans perdre le souffle.'),
      L_('capbravi', 'Le Portugais du cercle ! La Bauta paiera double pour ta tête.'),
      L_('narr', 'Astuce : deux duels d\'affilée, la vie ne revient qu\'en partie. Économisez votre souffle.')],
    fights: [{ foe: 'arsenalotto', wins: 1 }, { foe: 'capbravi', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('capbravi', 'Les plans sont déjà partis. La Bauta les vendra à qui paiera le plus.'), L_('chiara', 'La barque file vers la lagune. Il n\'y a qu\'un endroit où elle peut aller à cette heure : le palais Valdomar, par l\'eau.')], rewards: { ecus: 230 } },
  { id: 'd07', book: 4, act: ACT9, title: 'Le Canal de minuit', venue: 'canal', hero: 'corvin',
    intro: [L_('narr', 'Minuit. Sur la fondamenta du palais, un homme au masque de médecin de la peste garde la porte d\'eau.'),
      L_('medico', 'Je soigne Venise de ses curieux. Le remède est toujours le même : un peu de fer.'),
      L_('corvin', 'Je ne suis pas curieux. Je suis pressé.'),
      L_('narr', 'Astuce : il change de rythme sous 50 % de vie, puis jette ses dernières forces sous 25 %. Attendez la vraie attaque.')],
    fights: [{ foe: 'medico', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies contre le Médecin' },
    outro: [L_('medico', 'Il vous attend en haut… dans la salle de bal… seul.'), L_('corvin', 'Seul. Il a enfin compris quelque chose.')], rewards: { ecus: 250 } },
  { id: 'd08', book: 4, act: ACT9, title: 'La Bauta noire', venue: 'palais', hero: null,
    intro: [L_('narr', 'La salle de bal, vide. Les lustres brûlent encore. Au centre du damier, un homme en bauta noire tient une rapière de Ferrare.'),
      L_('valdomar', 'Ettore Valdomar. Ma famille a fait la guerre aux Turcs, et la paix avec tout le monde. J\'ai seulement mis un prix sur la paix.'),
      L_('valdomar', 'Les lames de l\'Ombre. Six noms que je vendrais très cher au Conseil des Dix. Ou à vos ennemis de Paris.'),
      L_('narr', 'Astuce : il cherche votre fer et se dérobe. Sous 25 % de vie, il attaque sans retenue.')],
    fights: [{ foe: 'valdomar', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites contre la Bauta noire' },
    outroChoice: { prompt: 'Valdomar est à terre. Par la fenêtre, une barque attend sur le canal.', options: [{ id: 'livrer', label: 'Le livrer au Conseil des Dix', desc: 'La justice de Venise, lente et sans appel.' }, { id: 'fuir', label: 'Le laisser fuir sur la lagune', desc: 'En échange des plans des galères, et de son silence.' }] },
    outro: [L_('valdomar', 'Vous ne savez pas ce que vous venez d\'acheter…')],
    endings: {
      livrer: [L_('narr', 'Le Conseil des Dix reçoit Valdomar, les comptes et les plans. La Compagnie du Masque d\'argent disparaît en une nuit.'), L_('chiara', 'Venise vous doit une faveur. Elle ne le dira jamais, mais elle s\'en souviendra.'), L_('narr', 'Fin du Livre IV. Le carnaval continue, comme si de rien n\'était.')],
      fuir: [L_('narr', 'La barque s\'éloigne dans la brume. Valdomar a laissé les plans, et une promesse de silence.'), L_('chiara', 'Un homme comme lui ne tient jamais une promesse longtemps. Mais il ne l\'oubliera pas non plus.'), L_('narr', 'Fin du Livre IV. Quelque part sur la lagune, une bauta noire regarde Venise s\'éloigner.')],
    },
    rewards: { ecus: 400 } },
);
Object.assign(LESSONS, {
  d01: { name: 'Contre la cape', tip: 'Sa cape couvre ses ripostes : parez, puis ripostez aussitôt.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  d02: { name: 'Briser la rondache', tip: 'Maintenez Attaque : la fente lourde brise sa garde.', label: 'Une garde brisée', ok: s => (s.gbreaks || 0) >= 1 },
  d03: { name: 'La vraie attaque', tip: 'Elle feinte : esquivez seulement l\'attaque qui part pour de bon.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
  d04: { name: 'Le coup d\'arrêt', tip: 'Frappez pendant qu\'il prépare son attaque.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  d05: { name: 'Le bon temps', tip: 'Levez la garde au dernier instant, quand la pointe rougeoie.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  d06: { name: 'Le souffle', tip: 'Deux duels d\'affilée : ne gaspillez pas vos gardes.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  d07: { name: 'La patience', tip: 'Il feinte beaucoup : ne levez la garde que quand la pointe rougeoie.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
  d08: { name: 'Se dérober', tip: 'Il cherche votre fer : ← + Attaque, la pointe passe sous sa lame.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
});
const B4_FOE = { d01: 'bravo', d02: 'contremaitre', d03: 'colombina', d04: 'lieutenant', d05: 'lieutenant', d06: 'arsenalotto', d07: 'medico', d08: 'valdomar' };
for (const id in B4_FOE) {
  const c = STORY.find(x => x.id === id), fk = B4_FOE[id], who = { [fk]: 'e' }, n = c.intro.length, m = c.outro.length;
  const withChiara = id === 'd01' || id === 'd04' || id === 'd05' || id === 'd06', cast = withChiara ? { chiara: { x: 900, face: 'p', stance: 'stand' } } : {};
  if (withChiara) who.chiara = 'chiara'; if (id === 'd06') who.capbravi = 'e'; if (id === 'd05') who.lieutenantPrevenu = 'e';
  const iSteps = []; for (let k = 0; k < n; k++) iSteps.push(k === 0 ? [['cam', 520, 1.05], ['walk', 'p', 310]] : k === n - 1 ? [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', 'salut']] : [['cam', k % 2 ? 620 : 340, 1.35]]);
  const oSteps = []; for (let k = 0; k < m; k++) oSteps.push(k === m - 1 ? [['cam', 480, 1.05], ['stance', 'e', 'stand']] : [['cam', k % 2 ? 340 : 620, 1.35]]);
  CINE[id] = { intro: { place: { p: -60, e: 650 }, cast, stance: { p: 'stand', e: 'stand' }, who, steps: iSteps }, outro: { place: { p: 330, e: 640 }, cast, stance: { p: 'stand', e: 'kneel' }, who, steps: oSteps } };
}
CODEX.push(
  { id: 'carnaval', cat: 'lieu', title: 'Le carnaval de Venise', hint: 'Terminer « Le Grand Canal »', text: 'Au XVIIe siècle, le carnaval dure de la Saint-Étienne au mardi gras, et les masques sont permis une grande partie de l\'année. La bauta, masque blanc qui couvre tout le visage, rend chacun égal et anonyme ; la colombina ne cache que les yeux.' },
  { id: 'arsenal', cat: 'lieu', title: 'L\'Arsenal de Venise', hint: 'Terminer « L\'Arsenal »', text: 'Le plus grand chantier naval d\'Europe : des milliers d\'arsenalotti y construisent les galères de la République à la chaîne. On raconte qu\'en temps de guerre, une galère pouvait y être achevée en une journée.' },
  { id: 'dix', cat: 'lieu', title: 'Le Conseil des Dix', hint: 'Terminer « Qui est sous le masque ? »', text: 'Créé en 1310 pour veiller sur la sûreté de la République, le Conseil des Dix juge en secret les complots et l\'espionnage. Ses « bouches de lion », boîtes aux lettres de pierre, recueillent les dénonciations anonymes.' },
  { id: 'murano', cat: 'lieu', title: 'Le verre de Murano', hint: 'Terminer « Le Bal du palais Valdomar »', text: 'Depuis la fin du XIIIe siècle, les verriers de Venise travaillent sur l\'île de Murano. Leurs secrets (cristal, miroirs, lustres) sont si précieux qu\'il leur est longtemps interdit de quitter la République.' },
  { id: 'masquedargent', cat: 'ombre', title: 'La Compagnie du Masque d\'argent', hint: 'Terminer le Livre IV', text: 'Une compagnie de bravi masqués qui louait ses lames aux grandes familles pendant le carnaval, et volait pour le compte de la Bauta noire. Légende du jeu.' },
);
(() => { const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const m = { d01: 'carnaval', d02: 'arsenal', d04: 'murano', d05: 'dix', d08: 'masquedargent' }; if (m[id]) Codex.unlock(m[id]); }; })();
(() => { const sl = Story.showList.bind(Story); Story.showList = function () { sl(); const S = this.data(), el = $('storyEnding'); if (el && S.done.d08) el.textContent += (el.textContent ? ' ' : '') + (livree(S) ? 'Livre IV : la Compagnie du Masque d\'argent a disparu.' : 'Livre IV : une bauta noire vogue sur la lagune.'); }; })();
