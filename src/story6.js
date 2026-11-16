// =============================== 7.0 · sprint 59 : Livre V « La Couronne de fer » (10 chapitres, 2 actes) ===============================
// Intrigue, personnages et dialogues originaux (Aurèle de Saint-Vrain, la ligue de la Couronne de fer, Orso Valdomar sont inventés).
// Faits historiques cités : l'édit contre les duels (1626), le Grand Châtelet, le Pré-aux-Clercs, la Grande Galerie du Louvre.
// Les personnages des livres précédents reviennent, et ce qu'ils font dépend de vos choix passés :
//  · la Tisserande (Livre III) : alliée si vous aviez accepté son aide, rivale sinon ;
//  · la Bauta noire (Livre IV) : Valdomar lui-même si vous l'aviez laissé fuir, son frère s'il a été livré ;
//  · la fin dépend aussi du Registre (Livre I) et du choix du dernier chapitre.
Object.assign(SPK, {
  oriane: { name: 'Oriane de Valcroze', col: '#2a4a32' }, aubrac: { name: 'Barthélemy Aubrac', col: '#4a3e34' },
  spadassin: { name: 'Le spadassin à l\'anneau', col: '#3a3a3a' }, geolier: { name: 'Le guichetier du Châtelet', col: '#4a3a2a' },
  couvreur: { name: 'Le couvreur de la Couronne', col: '#2a2a34' }, orso: { name: 'Orso Valdomar', col: '#1a1a1a' },
  heraut: { name: 'Le héraut du tournoi', col: '#2a3a7a' }, champion: { name: 'Le champion de Lorraine', col: '#4a2a1a' },
  saintvrain: { name: 'Aurèle de Saint-Vrain', col: '#5a1a1e' }, garde7: { name: 'Le garde de la Couronne', col: '#2a2a2a' },
});
Object.assign(STORY_FOES, {
  spadassin: { name: 'Le spadassin à l\'anneau', level: 'duelliste', tweak: { slow: 1.5, aggr: .62 }, rapier: 'solingen', offhand: null, look: () => mk('duelliste', { coat: '#3a3a3e', coat2: '#1e1e22', hose: '#1e1e22', hatType: 'feutre', hat: '#141414', plume: null, beard: 'pointed' }) },
  geolier: { name: 'Le guichetier du Châtelet', level: 'duelliste', tweak: { slow: 1.5, aggr: .55, bait: .3 }, rapier: 'garnison', offhand: 'cape', look: () => mk('duelliste', { style: 'paysan', coat: '#5a4a32', coat2: '#2e2618', hose: '#2e2618', hatType: 'beret', hat: '#2a2014', beard: 'full', plume: null }) },
  agent7: { name: 'Un homme de la Couronne', level: 'duelliste', tweak: { slow: 1.48, feint: .35 }, rapier: 'milanaise', offhand: 'dague', look: () => mk('duelliste', { coat: '#2a2a2a', coat2: '#141414', hose: '#141414', trim: '#8a8a8a', cape: '#141414', plume: null }) },
  couvreur: { name: 'Le couvreur de la Couronne', level: 'maitre', tweak: { slow: 1.42, esq: .28, aggr: .6 }, rapier: 'venitienne', offhand: null, look: () => mk('maitre', { style: 'rodeur', coat: '#2a2a34', coat2: '#16161c', hose: '#16161c', hatType: 'capuche', hat: '#16161c', plume: null, beard: 'none' }) },
  orso: { name: 'Orso Valdomar, le frère', level: 'maitre', tweak: { slow: 1.36, aggr: .66, stopHit: .3, perfect: .45 }, rapier: 'ferrara', offhand: 'dague', boss: 'force', look: () => mk('maitre', { coat: '#2a1414', coat2: '#140a0a', hose: '#140a0a', trim: '#c8a050', cape: '#140a0a', hair: '#2a1a10', beard: 'full', mask: 'bauta' }) },
  champion: { name: 'Le champion de Lorraine', level: 'maitre', tweak: { slow: 1.4, perfect: .5, aggr: .55 }, rapier: 'pappenheimer', offhand: 'rondache', look: () => mk('maitre', { coat: '#6a3a1a', coat2: '#3a1e0c', hose: '#3a1e0c', trim: '#d8b25e', plume: '#e8c050', beard: 'full' }) },
  garde7: { name: 'Le garde de la Couronne', level: 'maitre', tweak: { slow: 1.38, perfect: .55, react: .18 }, rapier: 'coquille', offhand: null, look: () => mk('maitre', { coat: '#1a1a1a', coat2: '#0a0a0a', hose: '#0a0a0a', trim: '#a8acb4', cape: '#0a0a0a', plume: null }) },
  saintvrain: { name: 'Aurèle de Saint-Vrain, la Couronne de fer', level: 'maitre', tweak: { slow: 1.24, fer: .45, derob: .5, perfect: .58, react: .16, feint: .4 }, rapier: 'ferrara', offhand: 'dague', boss: 'fer', look: () => mk('maitre', { coat: '#5a1a1e', coat2: '#2e0c0e', hose: '#1a0a0a', trim: '#d8b25e', cape: '#1a0a0a', hair: '#d8c8a0', beard: 'pointed', plume: '#e8e4dc' }) },
});
NPC_LOOK.heraut = () => mk('duelliste', { coat: '#2a3a7a', coat2: '#141e40', hose: '#141e40', trim: '#d8b25e', plume: '#e8e4dc', beard: 'none' });
const ACT10 = 'Livre V · Acte X · Les anneaux de fer', ACT11 = 'Livre V · Acte XI · Le Tournoi du Roi';
const tissAmie = S => S.choices.c02 === 'accepter', baufuit = S => S.choices.d08 === 'fuir', regBrule = S => S.choices.ch10 === 'bruler';
STORY.push(
  { id: 'e01', book: 5, act: ACT10, title: 'Le Pré-aux-Clercs', venue: 'pre', hero: 'bastien',
    intro: [L_('narr', 'Mars 1636. L\'aube sur le Pré-aux-Clercs. Depuis l\'édit de 1626, on n\'y vient plus se battre… officiellement.'),
      L_('bastien', 'Un duel à l\'aube, sans témoins, contre un inconnu qui m\'a écrit mon nom en entier. Le Gascon que je suis aurait dû se méfier.'),
      L_('spadassin', 'On ne vous tuera pas, d\'Armagnac. On veut seulement savoir ce que valent les lames du Cardinal, avant le tournoi.'),
      L_('narr', 'Astuce : il attaque beaucoup. Parez et ripostez aussitôt.')],
    fights: [{ foe: 'spadassin', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('narr', 'À son doigt, un anneau de fer forgé en forme de couronne.'), L_('bastien', 'Une couronne de fer. Ça ne s\'achète pas chez l\'orfèvre, ce genre de bijou. Ça se mérite, ou ça se jure.')], rewards: { ecus: 220 } },
  { id: 'e02', book: 5, act: ACT10, title: 'Les cachots du Châtelet', venue: 'chatelet', hero: 'corvin',
    intro: [L_('narr', 'Le Grand Châtelet, siège de la prévôté de Paris. Le spadassin y attend son procès, dans un cachot sous la Seine.'),
      L_('corvin', 'Il a parlé d\'un tournoi. Il parlera du reste, si on lui laisse le temps.'),
      L_('geolier', 'Le prisonnier dort. Pour toujours, si vous voulez mon avis. Il y a des gens qui paient pour qu\'il se taise.'),
      L_('narr', 'Astuce : sa cape couvre ses attaques. Esquivez, puis touchez.')],
    fights: [{ foe: 'geolier', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies' },
    outro: [L_('spadassin', 'La Couronne de fer… des maîtres d\'armes de toute l\'Europe. Ils serviront le plus fort… et le plus fort sera bientôt le seul.'), L_('corvin', 'Qui les commande ?'), L_('spadassin', 'Un homme du Louvre. Il sourit à tout le monde.')], rewards: { ecus: 230 } },
  { id: 'e03', book: 5, act: ACT10, title: 'Le retour de la Tisserande', venue: 'nuit', hero: 'oriane',
    intro: [L_('narr', 'Le Pont-Neuf, la nuit. Une dame espagnole attend sous une lanterne, un éventail à la main. On l\'appelait la Tisserande, à Madrid.'),
      Object.assign(L_('tisserande', 'Vous m\'aviez fait confiance, à Madrid. Je viens payer ma dette : la Couronne de fer recrute mes anciens élèves.'), { cond: tissAmie }),
      Object.assign(L_('tisserande', 'Vous n\'aviez pas voulu de mon aide, à Madrid. Aujourd\'hui, c\'est moi qui la refuse. La Couronne de fer paie mieux que le Cardinal.'), { cond: S => !tissAmie(S) }),
      L_('oriane', 'Oriane de Valcroze. Je me bats des deux mains, madame. Quel que soit votre camp, ce soir, vous allez voir.'),
      L_('narr', 'Astuce : la main gauche ! Une parade parfaite d\'Oriane coupe aussi avec la dague.')],
    get fights() { return tissAmie(Story.data()) ? [{ foe: 'agent7', wins: 2 }] : [{ foe: 'tisserande', wins: 2 }]; },
    goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites' },
    outro: [Object.assign(L_('tisserande', 'Il était venu me faire taire. Il s\'appelait Gil, il avait de bonnes jambes. La Couronne ne gaspille pas ses hommes, elle les use.'), { cond: tissAmie }),
      Object.assign(L_('tisserande', 'Bien. Je vous dirai ce que je sais, et vous me laisserez repartir. Une dette pour une dette.'), { cond: S => !tissAmie(S) }),
      L_('tisserande', 'Le maître de la Couronne s\'appelle Aurèle de Saint-Vrain. Favori du roi, organisateur du tournoi. Il veut que le champion du roi soit l\'un des siens.')], rewards: { ecus: 240 } },
  { id: 'e04', book: 5, act: ACT10, title: 'Les toits de Notre-Dame', venue: 'toits', hero: 'aubrac',
    intro: [L_('narr', 'L\'orage sur l\'île de la Cité. Un messager de la Couronne passe par les toits de Notre-Dame, entre les gargouilles.'),
      L_('aubrac', 'Je n\'y vois presque plus, petit. Mais la pluie, elle, me dit tout : où il pose le pied, où il lève le bras.'),
      L_('couvreur', 'Un aveugle sur les toits ! On ne me croira jamais, à la taverne.'),
      L_('narr', 'Astuce : Barthélemy ne voit pas le signal de parade. Écoutez le tic : c\'est le moment de parer.')],
    fights: [{ foe: 'couvreur', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 1, label: 'Une parade parfaite, à l\'oreille' },
    outro: [L_('couvreur', 'Le message… est pour Venise. Pour la Bauta.'), L_('aubrac', 'Venise. Alors nos vieux amis du carnaval sont de la fête.')], rewards: { ecus: 250 } },
  { id: 'e05', book: 5, act: ACT10, title: 'La Bauta revient', venue: 'chatelet', hero: 'isaure',
    intro: [Object.assign(L_('narr', 'Dans la salle basse du Châtelet, une bauta noire attend. Vous l\'aviez laissé fuir sur la lagune : il est revenu.'), { cond: baufuit }),
      Object.assign(L_('valdomar', 'Je vous avais promis le silence. Je n\'avais rien promis sur le reste. La Couronne paie mes dettes de jeu.'), { cond: baufuit }),
      Object.assign(L_('narr', 'Dans la salle basse du Châtelet, une bauta noire attend. Ettore Valdomar est aux plombs de Venise ; c\'est son frère qui la porte.'), { cond: S => !baufuit(S) }),
      Object.assign(L_('orso', 'Vous avez livré mon frère au Conseil des Dix. Je suis venu à Paris pour vous rendre la politesse.'), { cond: S => !baufuit(S) }),
      L_('isaure', 'Toujours ces masques. À Paris, on se bat à visage découvert, monsieur.'),
      L_('narr', 'Astuce : il attaque sans retenue sous 50 % de vie. Gardez du souffle pour la fin.')],
    get fights() { return baufuit(Story.data()) ? [{ foe: 'valdomar', wins: 2 }] : [{ foe: 'orso', wins: 2 }]; },
    goal: { type: 'stat', stat: 'stopHits', op: '>=', v: 1, label: 'Un coup d\'arrêt' },
    outro: [Object.assign(L_('valdomar', 'Cette fois… je ne fuirai pas. Saint-Vrain vous attend à la Galerie. Il a gardé la place du roi pour lui.'), { cond: baufuit }),
      Object.assign(L_('orso', 'Mon frère… disait que vous étiez des gens d\'honneur. Je comprends pourquoi il a perdu.'), { cond: S => !baufuit(S) }),
      L_('isaure', 'La place du roi. Le tournoi n\'est pas un tournoi : c\'est une couronne qu\'on se partage.')], rewards: { ecus: 260 } },
  { id: 'e06', book: 5, act: ACT10, title: 'La leçon du Maestre', venue: 'academia', hero: 'alvaro',
    intro: [L_('narr', 'Une salle d\'armes espagnole, rue de Tournon. Le Maestre du Cercle de fer s\'y est réfugié depuis Madrid, sans élèves et sans titre.'),
      L_('maestre', 'Saint-Vrain a racheté mes élèves, Teixeira. Ceux qui restaient. Il en a fait des anneaux de sa couronne.'),
      L_('alvaro', 'Alors donnez-moi l\'invitation qu\'il vous a envoyée. Je porterai votre nom au tournoi.'),
      L_('maestre', 'Pas sans une dernière leçon. Sur le cercle, comme autrefois.'),
      L_('narr', 'Astuce : il cherche votre fer. Dérobez-vous (← + Attaque) et parez au dernier instant.')],
    fights: [{ foe: 'maestre', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites' },
    outro: [L_('maestre', 'Voici l\'invitation. Le Tournoi du Roi, Grande Galerie du Louvre. Le vainqueur devient le champion de Sa Majesté.'), L_('alvaro', 'Et le champion se tient à un pas du roi. Je comprends.'), L_('narr', 'Le Tournoi du Roi est ouvert : vous pouvez vous y inscrire depuis la carte de Paris.')], rewards: { ecus: 280 } },
  { id: 'e07', book: 5, act: ACT11, title: 'Premier tour', venue: 'galerie', hero: 'mathurin',
    intro: [L_('narr', 'La Grande Galerie du Louvre, qui court le long de la Seine. Des bancs, des tentures, et toute la cour.'),
      L_('heraut', 'Premier tour ! Pour la France : maître Mathurin, sergent aux gardes. Pour la Lorraine : le champion du duc !'),
      L_('mathurin', 'Une rondache. J\'aime bien les rondaches. Elles font un bruit honnête quand on les fend.'),
      L_('narr', 'Astuce : maintenez Attaque pour une fente lourde : elle brise sa garde.')],
    fights: [{ foe: 'champion', wins: 2 }], goal: { type: 'stat', stat: 'gbreaks', op: '>=', v: 1, label: 'Briser sa garde une fois' },
    outro: [L_('champion', 'Pas un homme de la Couronne, celui-là. Je me suis battu pour rien.'), L_('mathurin', 'Pour l\'honneur. Ce n\'est pas rien. C\'est même assez rare, ici.')], rewards: { ecus: 280 } },
  { id: 'e08', book: 5, act: ACT11, title: 'Demi-finale', venue: 'galerie', hero: 'aubrac', chain: true,
    intro: [L_('narr', 'Demi-finale. Deux gardes de la Couronne, l\'un après l\'autre : Saint-Vrain veut épuiser les lames du Cardinal.'),
      L_('aubrac', 'Deux hommes, deux pas différents. Le premier traîne la jambe gauche. Le second ne respire pas quand il attaque.'),
      L_('garde7', 'Le vieil aveugle ? On vous a fait une place d\'honneur, monsieur : la dernière.'),
      L_('narr', 'Astuce : deux duels d\'affilée, la vie ne revient qu\'en partie.')],
    fights: [{ foe: 'agent7', wins: 1 }, { foe: 'garde7', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('garde7', 'Comment… comment avez-vous vu venir ma dernière ?'), L_('aubrac', 'Je ne l\'ai pas vue. Je l\'ai entendue. Ton cœur battait trop fort.')], rewards: { ecus: 300 } },
  { id: 'e09', book: 5, act: ACT11, title: 'La place du roi', venue: 'galerie', hero: 'vaucelles',
    intro: [L_('narr', 'Avant la finale. Le roi a pris place au bout de la Galerie. Derrière lui, deux gardes portent un anneau de fer.'),
      L_('vaucelles', 'Deux anneaux derrière Sa Majesté. Si la finale tourne mal, ils frappent. Il faut les écarter sans bruit.'),
      L_('garde7', 'Le Vieux Loup. On nous avait prévenus qu\'il viendrait. On nous avait dit de le laisser vieillir encore un peu.'),
      L_('narr', 'Astuce : ne gaspillez pas votre souffle, parez au dernier instant.')],
    fights: [{ foe: 'garde7', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites' },
    outro: [L_('vaucelles', 'Le roi n\'a rien vu. C\'est le métier.'), L_('heraut', 'La finale ! Monsieur de Saint-Vrain, organisateur du tournoi, défendra lui-même la place de champion du roi !')], rewards: { ecus: 320 } },
  { id: 'e10', book: 5, act: ACT11, title: 'La Couronne de fer', venue: 'galerie', hero: null,
    intro: [L_('narr', 'La finale. Toute la cour retient son souffle. Aurèle de Saint-Vrain salue le roi, puis vous, avec le même sourire.'),
      L_('saintvrain', 'Les lames de l\'Ombre. Vous servez un cardinal qui vous cache. Moi, j\'offre à mes lames une couronne, et la lumière.'),
      Object.assign(L_('saintvrain', 'Vous avez brûlé le Registre, je le sais. Vous n\'avez plus de maître. Rejoignez-moi : il y a de la place dans un cercle de fer.'), { cond: regBrule }),
      Object.assign(L_('saintvrain', 'Le Cardinal garde toujours votre Registre. Il vous tient, et moi, je vous offre de vous en libérer.'), { cond: S => !regBrule(S) }),
      L_('narr', 'Astuce : il cherche votre fer, se dérobe et feinte. Sous 25 % de vie, il joue le tout pour le tout.')],
    fights: [{ foe: 'saintvrain', wins: 3 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 3, label: '3 parades parfaites contre Saint-Vrain' },
    outroChoice: { prompt: 'Saint-Vrain est à terre, devant le roi. Son anneau de fer a roulé sur le parquet.', options: [{ id: 'briser', label: 'Briser la Couronne', desc: 'Dénoncer la ligue devant le roi : tous ses membres seront poursuivis.' }, { id: 'garder', label: 'Garder l\'anneau', desc: 'Taire l\'affaire, et prendre en main ce que Saint-Vrain avait construit.' }] },
    outro: [L_('saintvrain', 'Vous auriez pu être des rois… vous resterez des ombres.')],
    endings: {
      briser: [L_('narr', 'Devant toute la cour, l\'anneau de fer est brisé sur l\'enclume des gardes. La ligue est démantelée en une semaine.'),
        Object.assign(L_('narr', 'Le roi demande le nom de ses sauveurs. Le Cardinal répond : « Personne, Sire. » Et dans un tiroir, le Registre écarlate attend toujours.'), { cond: S => !regBrule(S) }),
        Object.assign(L_('narr', 'Le roi demande le nom de ses sauveurs. Sans Registre et sans maître, les six lames donnent leur vrai nom, pour une fois.'), { cond: regBrule }),
        Object.assign(L_('tisserande', 'À Madrid, on dirait que vous avez bien tissé. Je rentre. Écrivez-moi, quand vous aurez besoin d\'un fil.'), { cond: tissAmie }),
        L_('narr', 'Fin du Livre V. Paris dort, et ses lames veillent.')],
      garder: [L_('narr', 'L\'anneau disparaît dans un gant. Saint-Vrain est exilé « pour sa santé ». La Couronne de fer change de maître sans changer de nom.'),
        Object.assign(L_('narr', 'Le Cardinal sourit en apprenant la nouvelle. Une ligue de plus dans son tiroir, à côté du Registre écarlate.'), { cond: S => !regBrule(S) }),
        Object.assign(L_('narr', 'Personne ne tient plus les six lames : ni Registre, ni Cardinal. Seulement un anneau de fer, et ce qu\'elles en feront.'), { cond: regBrule }),
        Object.assign(L_('valdomar', 'À Venise, on appelle ça un bon carnaval : on change de masque, et on garde la fête.'), { cond: baufuit }),
        L_('narr', 'Fin du Livre V. Quelque part dans Paris, une couronne de fer attend une tête.')],
    },
    rewards: { ecus: 600 } },
);
Object.assign(LESSONS, {
  e01: { name: 'Parer, puis répondre', tip: 'Il attaque beaucoup : parez, puis ripostez aussitôt.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  e02: { name: 'Sous la cape', tip: 'Sa cape couvre ses attaques : esquivez, puis touchez.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
  e03: { name: 'La main gauche', tip: 'Une parade parfaite d\'Oriane coupe aussi avec la dague.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  e04: { name: 'Parer à l\'oreille', tip: 'Le signal de parade est caché : écoutez le tic.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  e05: { name: 'Le coup d\'arrêt', tip: 'Frappez pendant qu\'il prépare son attaque.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  e06: { name: 'Le cercle', tip: 'Il cherche votre fer : dérobez-vous, puis parez au dernier instant.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  e07: { name: 'Fendre la rondache', tip: 'Maintenez Attaque : la fente lourde brise sa garde.', label: 'Une garde brisée', ok: s => (s.gbreaks || 0) >= 1 },
  e08: { name: 'Deux duels', tip: 'Ne gaspillez pas vos gardes : la vie ne revient qu\'en partie.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  e09: { name: 'Sans bruit', tip: 'Parez au dernier instant, quand la pointe rougeoie.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  e10: { name: 'La finale', tip: 'Il feinte et se dérobe : attendez la vraie attaque.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
});
const B5_FOE = { e01: 'spadassin', e02: 'geolier', e03: 'agent7', e04: 'couvreur', e05: 'orso', e06: 'maestre', e07: 'champion', e08: 'agent7', e09: 'garde7', e10: 'saintvrain' };
for (const id in B5_FOE) {
  const c = STORY.find(x => x.id === id), fk = B5_FOE[id], who = { [fk]: 'e' }, n = c.intro.length, m = c.outro.length;
  const ally = id === 'e03' ? 'tisserande' : (id === 'e07' || id === 'e09') ? 'heraut' : null, cast = ally ? { [ally]: { x: 900, face: 'p', stance: 'stand', if: ally === 'tisserande' ? tissAmie : undefined } } : {};
  if (ally && ally !== 'tisserande') who[ally] = ally; if (id === 'e05') who.valdomar = 'e'; if (id === 'e08' || id === 'e09') who.garde7 = 'e'; if (id === 'e02') who.spadassin = 'e';
  if (id === 'e03') Object.defineProperty(who, 'tisserande', { get: () => tissAmie(Story.data()) ? 'tisserande' : 'e', enumerable: true });
  const iSteps = []; for (let k = 0; k < n; k++) iSteps.push(k === 0 ? [['cam', 520, 1.05], ['walk', 'p', 310]] : k === n - 1 ? [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', 'salut']] : [['cam', k % 2 ? 620 : 340, 1.35]]);
  const oSteps = []; for (let k = 0; k < m; k++) oSteps.push(k === m - 1 ? [['cam', 480, 1.05], ['stance', 'e', 'stand']] : [['cam', k % 2 ? 340 : 620, 1.35]]);
  CINE[id] = { intro: { place: { p: -60, e: 650 }, cast, stance: { p: 'stand', e: 'stand' }, who, steps: iSteps }, outro: { place: { p: 330, e: 640 }, cast, stance: { p: 'stand', e: 'kneel' }, who, steps: oSteps } };
}
CODEX.push(
  { id: 'preauxclercs', cat: 'lieu', title: 'Le Pré-aux-Clercs', hint: 'Terminer « Le Pré-aux-Clercs »', text: 'Une prairie au bord de la Seine, face au Louvre, qui appartenait à l\'Université. On s\'y promenait, on s\'y querellait, et on s\'y battait en duel, au point que le nom est resté lié aux rencontres à l\'épée.' },
  { id: 'edit1626', cat: 'lieu', title: 'L\'édit contre les duels', hint: 'Terminer « Le Pré-aux-Clercs »', text: 'En 1626, un édit royal punit sévèrement les duels. L\'année suivante, le comte de Montmorency-Bouteville, qui s\'était battu en plein jour place Royale, est décapité : le Cardinal veut montrer que la loi vaut pour tous.' },
  { id: 'chatelet', cat: 'lieu', title: 'Le Grand Châtelet', hint: 'Terminer « Les cachots du Châtelet »', text: 'Une forteresse au bord de la Seine, siège de la prévôté de Paris : tribunal, police et prison. Ses cachots les plus profonds avaient des noms sinistres, et l\'on disait que certains étaient sous le niveau du fleuve.' },
  { id: 'grandegalerie', cat: 'lieu', title: 'La Grande Galerie du Louvre', hint: 'Terminer « Premier tour »', text: 'Construite sous Henri IV pour relier le Louvre aux Tuileries, elle longe la Seine sur près de quatre cents mètres. Au XVIIe siècle, des artisans du roi sont logés sous la galerie.' },
  { id: 'couronnefer', cat: 'ombre', title: 'La Couronne de fer', hint: 'Terminer le Livre V', text: 'Une ligue secrète de maîtres d\'armes venus de toute l\'Europe, réunie par Aurèle de Saint-Vrain pour placer l\'un des siens à côté du roi. Légende du jeu.' },
);
(() => { const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const m = { e01: ['preauxclercs', 'edit1626'], e02: ['chatelet'], e07: ['grandegalerie'], e10: ['couronnefer'] }; for (const k of m[id] || []) Codex.unlock(k); }; })();
(() => { const sl = Story.showList.bind(Story); Story.showList = function () { sl(); const S = this.data(), el = $('storyEnding'); if (el && S.done.e10) el.textContent += (el.textContent ? ' ' : '') + (S.choices.e10 === 'garder' ? 'Livre V : une couronne de fer attend une tête.' : 'Livre V : la Couronne de fer est brisée.'); }; })();
