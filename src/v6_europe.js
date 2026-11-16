// =============================== 6.0 · sprint 46 : la carte d'Europe ===============================
// La carte gravée sert pour d'autres villes : Madrid, Venise, Londres, chacune avec ses quartiers, ses rumeurs et ses missions du jour.
// On voyage entre elles en diligence ou en navire (des jours de route, des écus, et parfois une mauvaise rencontre en chemin).
const EU_CITIES = {
  paris: { name: 'Paris', at: [380, 196], port: false },
  madrid: { name: 'Madrid', at: [196, 352], you: [420, 236],
    q: { alcazar: { name: 'L\'Alcázar', at: [212, 150], venues: ['alcazar'], desc: 'Le palais du roi sur sa falaise, au-dessus du Manzanares.' },
      plaza: { name: 'La Plaza Mayor', at: [420, 176], venues: ['plaza'], desc: 'Marchés, fêtes et exécutions sous les balcons de fer.' },
      sol: { name: 'La Puerta del Sol', at: [566, 158], venues: ['plaza', 'auberge'], desc: 'La porte de l\'Est, ses fontaines et ses nouvellistes.' },
      lavapies: { name: 'Lavapiés', at: [470, 302], venues: ['auberge', 'academia'], desc: 'Ruelles en pente, tavernes et salles d\'armes de quartier.' },
      prado: { name: 'Le Prado', at: [704, 250], venues: ['academia', 'cloitre'], desc: 'Promenades, couvents et jardins hors les murs.' } },
    rum: { alcazar: ['Un garde du roi vend des passes pour les galeries.', 'Le Cercle de fer n\'est pas tout à fait mort.'], plaza: ['On parie gros sur les duels de la Plaza.', 'Un bravo sévillan défie tous les Français.'], sol: ['Les nouvellistes racontent vos exploits, en les grossissant.', 'Un courrier de Lisbonne a disparu.'], lavapies: ['Une maestra enseigne la nuit, à la lanterne.', 'On vend des lames de Tolède volées.'], prado: ['Des nobles se battent à l\'aube derrière les couvents.', 'Un jardinier a vu des capes noires.'] },
    foes: ['Un espadachín de la Plaza', 'Un alguazil corrompu', 'Un diestro de Tolède', 'Un soldat des tercios'] },
  venise: { name: 'Venise', at: [640, 244], port: true, you: [520, 250],
    q: { sanmarco: { name: 'San Marco', at: [524, 226], venues: ['palais', 'canal'], desc: 'La place, le palais des Doges, et ses bouches de lion.' },
      rialto: { name: 'Le Rialto', at: [462, 152], venues: ['canal'], desc: 'Le pont de pierre neuf, les banques et les marchands.' },
      arsenale: { name: 'L\'Arsenal', at: [664, 196], venues: ['arsenal'], desc: 'Le chantier des galères, gardé jour et nuit.' },
      dorsoduro: { name: 'Dorsoduro', at: [340, 238], venues: ['canal', 'palais'], desc: 'Les quais au soleil, les palais des familles nouvelles.' },
      cannaregio: { name: 'Cannaregio', at: [380, 108], venues: ['canal', 'auberge'], desc: 'Canaux étroits, ponts sans parapet, et le quartier juif.' } },
    rum: { sanmarco: ['Une dénonciation anonyme vous vise dans une bouche de lion.', 'Le Conseil des Dix recrute des lames discrètes.'], rialto: ['Un banquier cherche un garde pour la nuit.', 'Les bravi se retrouvent sous le pont.'], arsenale: ['Des plans de galère circulent encore.', 'Un arsenalotto vend des secrets pour du vin.'], dorsoduro: ['Un masque doré a été vu au bal d\'hier.', 'On se bat sur les Zattere à la tombée du jour.'], cannaregio: ['Un pont sans parapet a déjà noyé deux duellistes.', 'Une verrière de Murano vous cherche.'] },
    foes: ['Un bravo masqué', 'Un sbire du Conseil', 'Un gondolier armé', 'Un spadassin dalmate'] },
  londres: { name: 'Londres', at: [272, 104], port: true, you: [430, 196],
    q: { city: { name: 'La City', at: [468, 158], venues: ['auberge', 'cloitre'], desc: 'Marchands, cathédrale Saint-Paul et ruelles enfumées.' },
      tower: { name: 'La Tour', at: [606, 190], venues: ['bastion'], desc: 'La forteresse royale, sa ménagerie et ses prisonniers.' },
      southwark: { name: 'Southwark', at: [470, 340], venues: ['auberge', 'nuit'], desc: 'Théâtres, combats d\'ours et tavernes de la rive sud.' },
      whitehall: { name: 'Whitehall', at: [188, 206], venues: ['cloitre', 'salle'], desc: 'Le palais du roi Charles, ses courtisans et ses intrigues.' },
      docks: { name: 'Les docks', at: [772, 252], venues: ['navire'], desc: 'Navires de la Compagnie des Indes et marins sans maître.' } },
    rum: { city: ['Un maître d\'armes italien enseigne près de Saint-Paul.', 'Les apprentis se battent au bâton le dimanche.'], tower: ['Un prisonnier français attend à la Tour.', 'Les gardes jouent leurs soldes aux dés.'], southwark: ['On joue une pièce où l\'on se bat à la rapière, pour de vrai.', 'Un bretteur gallois défie qui veut.'], whitehall: ['Un courtisan cherche un second pour un duel.', 'La reine aime les Français, le roi beaucoup moins.'], docks: ['Un capitaine paie bien pour une escorte.', 'Des contrebandiers débarquent la nuit.'] },
    foes: ['Un spadassin de Southwark', 'Un garde de la Tour', 'Un gentilhomme de la cour', 'Un marin des docks'] },
};
// jours de route ; par la mer quand les deux villes sont des ports
const EU_ROUTES = { 'londres-paris': 4, 'madrid-paris': 12, 'paris-venise': 14, 'madrid-venise': 10, 'londres-madrid': 9, 'londres-venise': 16 };
const Europe = {
  viewing: false,
  CITIES: Object.assign({ europe: { name: 'L\'Europe' } }, EU_CITIES),
  home() { return Save.data.ville || 'paris'; },
  city() { return this.viewing ? 'europe' : this.home(); },
  quartiers(c) { const C = EU_CITIES[c]; return C && C.q ? C.q : {}; },
  you(c) { return c === 'europe' ? (EU_CITIES[this.home()] || EU_CITIES.paris).at : (EU_CITIES[c] && EU_CITIES[c].you) || [422, 200]; },
  missions(c, q, day = Carte.day()) {
    const C = EU_CITIES[c]; if (!C || !C.q || !C.q[q]) return []; const R = Defi.rng(`ldo-${c}-${q}-${day}`), pk = a => a[Math.floor(R() * a.length)], Q = C.q[q], out = [], types = ['duel', 'duel', 'melee', 'poursuite', 'infiltration'];
    for (let i = 0; i < 3; i++) { const type = pk(types), level = pk(['duelliste', 'duelliste', 'maitre']), foe = pk(C.foes), venue = pk(Q.venues), dis = type === 'infiltration' ? pk(Object.keys(DISGUISES)) : null;
      out.push({ id: `${day}-${c}_${q}-${i}`, q, city: c, type, level, foe, venue, need: dis, ecus: { duel: 70, melee: 120, poursuite: 90, infiltration: 100 }[type] + (level === 'maitre' ? 40 : 0) }); }
    return out;
  },
  rumeur(c, q, day = Carte.day()) { const L = EU_CITIES[c].rum[q]; return L[Math.floor(Defi.rng(`ldo-rum-${c}-${q}-${day}`)() * L.length)]; },
  route(a, b) { const k = [a, b].sort().join('-'), days = EU_ROUTES[k] || 10, sea = !!(EU_CITIES[a].port && EU_CITIES[b].port) || k === 'londres-paris'; return { days, sea, cost: days * 8 }; },
  // ---- les plans gravés ----
  svg(c) {
    const lbl = (x, y, s, t, it) => `<text class="lbl k-f p-s" x="${x}" y="${y}" font-size="${s}" text-anchor="middle" stroke-width="3.5" ${it ? 'font-style="italic" font-family="\'IM Fell English\', Georgia, serif"' : 'font-family="\'IM Fell English SC\', Georgia, serif" letter-spacing="2"'}>${t}</text>`;
    const compass = `<g transform="translate(52 336)" class="k-s" fill="none"><circle r="17" stroke-width=".8"/><path class="k-f" d="M0 -21 L4 0 L0 21 L-4 0 Z" fill-opacity=".85" stroke-width=".6"/><text class="k-f" y="-25" text-anchor="middle" font-family="'IM Fell English SC', Georgia, serif" font-size="10" stroke="none">N</text></g>`;
    let inner = '';
    if (c === 'madrid') {
      const wall = 'M168 70 L300 44 L470 40 L640 56 L760 110 L780 220 L740 320 L600 362 L420 370 L260 350 L176 280 L160 170 Z', river = 'M100 -10 C 120 80, 90 160, 120 240 S 150 360, 130 400';
      inner = `<path d="${wall}" fill="url(#p5h)"/><g fill="none" class="p-s" stroke-width="3.2" stroke-linecap="round"><path d="M212 168 C 300 180, 380 186, 566 168"/><path d="M420 176 C 440 240, 460 280, 470 350"/><path d="M566 168 C 620 200, 680 230, 760 240"/><path d="M300 60 C 320 140, 360 200, 420 236"/></g>
<path class="k-s" d="${river}" fill="none" stroke-width="20"/><path d="${river}" fill="none" stroke="url(#p5w)" stroke-width="17"/>
<path class="k-s" d="${wall}" fill="none" stroke-width="4"/><path class="p-s" d="${wall}" fill="none" stroke-width="1.6"/>
<rect class="k-f" x="196" y="132" width="40" height="30" fill-opacity=".8"/><rect class="p-f" x="206" y="140" width="20" height="14"/><g class="k-f">${[[196, 132], [236, 132], [196, 162], [236, 162]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>
<rect class="p-f k-s" x="398" y="196" width="44" height="30" stroke-width="1.4"/><rect class="k-s" x="406" y="203" width="28" height="16" fill="none" stroke-width=".6"/>
<g class="k-f" fill-opacity=".5">${Array.from({ length: 14 }, (_, i) => `<circle cx="${676 + (i % 7) * 12}" cy="${270 + Math.floor(i / 7) * 16}" r="3"/>`).join('')}</g>
${lbl(212, 196, 12, 'L\'Alcázar')}${lbl(420, 248, 13, 'Plaza Mayor')}${lbl(566, 196, 12, 'Puerta del Sol')}${lbl(470, 330, 13, 'Lavapiés')}${lbl(704, 312, 12, 'El Prado')}${lbl(56, 140, 14, 'le Manzanares', 1)}${compass}`;
    } else if (c === 'venise') {
      const isle = 'M150 200 C 180 120, 300 70, 420 80 C 540 85, 640 120, 700 150 L 760 200 C 740 250, 690 270, 600 280 L 520 272 C 470 290, 380 300, 300 290 C 220 280, 160 250, 150 200 Z', canal = 'M 222 176 C 320 130, 420 120, 460 160 C 500 200, 420 236, 380 250 C 440 270, 520 262, 580 254';
      const giud = 'M290 320 C 380 312, 480 316, 570 310 L 570 330 C 480 338, 380 338, 290 340 Z';
      inner = `<rect width="844" height="390" fill="url(#p5w)" opacity=".7"/><path class="p-f k-s" d="${isle}" stroke-width="1.2"/><path d="${isle}" fill="url(#p5h)"/>
<path class="p-f k-s" d="${giud}" stroke-width="1"/><path d="${giud}" fill="url(#p5h)"/><ellipse class="p-f k-s" cx="640" cy="320" rx="26" ry="12" stroke-width="1"/><ellipse class="p-f k-s" cx="470" cy="28" rx="56" ry="16" stroke-width="1"/><path d="M800 60 L 830 380" class="k-s" stroke-width="10" stroke-linecap="round"/><path d="M800 60 L 830 380" class="p-s" stroke-width="8" stroke-linecap="round"/>
<path class="k-s" d="${canal}" fill="none" stroke-width="14"/><path d="${canal}" fill="none" stroke="url(#p5w)" stroke-width="11"/>
<g class="k-s" fill="none" stroke-width="1" stroke-opacity=".6">${Array.from({ length: 9 }, (_, i) => `<path d="M${240 + i * 55} ${110 + (i % 3) * 18} C ${260 + i * 55} ${160 + (i % 2) * 20}, ${250 + i * 55} ${200}, ${270 + i * 55} ${250 + (i % 3) * 10}"/>`).join('')}</g>
<rect class="k-s" x="646" y="182" width="40" height="30" fill="none" stroke-width="2"/><rect class="w-f" x="650" y="186" width="32" height="22"/><rect class="p-f k-s" x="456" y="152" width="14" height="6" stroke-width="1"/><rect class="k-f" x="520" y="240" width="22" height="14" fill-opacity=".7"/>
${lbl(502, 140, 12, 'Rialto')}${lbl(524, 274, 12, 'San Marco')}${lbl(666, 236, 12, 'Arsenal')}${lbl(330, 274, 12, 'Dorsoduro')}${lbl(380, 76, 12, 'Cannaregio')}${lbl(430, 360, 13, 'la Giudecca', 1)}${lbl(470, 56, 12, 'Murano', 1)}${lbl(110, 120, 15, 'la lagune', 1)}${compass}`;
    } else if (c === 'londres') {
      const thames = 'M-10 296 C 150 280, 300 300, 420 290 S 640 260, 860 290', wall = 'M330 286 L320 150 L360 96 L470 80 L590 100 L640 160 L650 270';
      inner = `<path d="M330 286 L320 150 L360 96 L470 80 L590 100 L640 160 L650 270 Z" fill="url(#p5h)"/><path d="M120 280 L120 160 L260 150 L320 200 L320 286 Z" fill="url(#p5h)" opacity=".7"/><path d="M380 300 L700 290 L720 360 L360 370 Z" fill="url(#p5h)" opacity=".8"/>
<g fill="none" class="p-s" stroke-width="3.2" stroke-linecap="round"><path d="M188 206 C 260 200, 330 192, 468 158"/><path d="M468 158 C 540 170, 600 200, 662 216"/><path d="M430 196 C 450 160, 460 120, 470 82"/></g>
<path class="k-s" d="${thames}" fill="none" stroke-width="30"/><path d="${thames}" fill="none" stroke="url(#p5w)" stroke-width="27"/>
<g class="p-f k-s" stroke-width=".9"><path d="M514 272 L528 272 L528 304 L514 304 Z"/>${[0, 1, 2, 3].map(k => `<rect x="${511 + (k % 2) * 12}" y="${274 + k * 7}" width="7" height="5"/>`).join('')}</g>
<path class="k-s" d="${wall}" fill="none" stroke-width="5"/><path class="p-s" d="${wall}" fill="none" stroke-width="2"/>
<rect class="k-f" x="644" y="226" width="34" height="30" fill-opacity=".8"/><g class="k-f">${[[644, 226], [678, 226], [644, 256], [678, 256]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>
<path class="k-f" d="M420 184 L446 184 L446 190 L420 190 Z M430 172 L436 172 L436 202 L430 202 Z"/><circle class="p-f k-s" cx="430" cy="350" r="12" stroke-width="1.4"/>
<g class="k-f" fill-opacity=".8">${[740, 780, 820].map(x => `<path d="M${x} 300 L${x + 26} 300 L${x + 22} 308 L${x + 4} 308 Z M${x + 12} 300 L${x + 12} 280"/>`).join('')}</g>
${lbl(468, 128, 13, 'La City')}${lbl(662, 202, 12, 'La Tour')}${lbl(500, 370, 12, 'Southwark')}${lbl(188, 240, 12, 'Whitehall')}${lbl(772, 330, 12, 'Les docks')}${lbl(150, 300, 15, 'la Tamise', 1)}${compass}`;
    } else {
      const eng = 'M200 30 C 230 10, 280 20, 300 40 C 320 70, 330 110, 320 140 C 300 160, 250 170, 210 160 C 230 130, 190 100, 210 80 C 190 60, 190 40, 200 30 Z';
      const land = 'M300 175 C 340 150, 400 120, 470 120 C 560 100, 680 96, 860 100 L 860 -10 L 380 -10 C 400 40, 420 90, 400 120 C 360 130, 320 150, 300 175 Z';
      const fra = 'M300 175 C 340 150, 420 140, 470 150 C 520 160, 560 190, 570 230 C 560 270, 540 300, 500 320 C 460 330, 420 330, 380 340 C 340 340, 300 330, 290 300 C 300 270, 280 240, 260 220 C 270 200, 280 185, 300 175 Z';
      const esp = 'M100 330 C 170 300, 260 300, 300 316 C 336 340, 344 370, 330 400 L 40 400 C 40 370, 60 345, 100 330 Z', ita = 'M560 180 C 610 160, 680 170, 700 200 C 708 230, 688 250, 700 272 C 726 300, 764 330, 796 372 L 776 400 L 734 400 C 712 362, 684 332, 652 304 C 630 282, 610 262, 590 240 C 572 220, 552 200, 560 180 Z';
      const routes = Object.keys(EU_ROUTES).map(k => { const [a, b] = k.split('-'), A = EU_CITIES[a].at, B = EU_CITIES[b].at, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - 40; return `<path d="M${A[0]} ${A[1]} Q ${mx} ${my} ${B[0]} ${B[1]}"/>`; }).join('');
      inner = `<rect width="844" height="390" fill="url(#p5w)" opacity=".8"/>${[land, eng, fra, esp, ita].map(p => `<path class="p-f k-s" d="${p}" stroke-width="1.2"/><path d="${p}" fill="url(#p5h)" opacity=".55"/>`).join('')}
<g class="k-s" fill="none" stroke-width="1.2">${Array.from({ length: 7 }, (_, i) => `<path d="M${560 + i * 16} 214 l6 -10 l6 10"/>`).join('')}</g>
<g class="k-s" fill="none" stroke-width="1.2" stroke-dasharray="2 5" stroke-linecap="round" stroke-opacity=".7">${routes}</g>
${lbl(260, 30, 13, 'Angleterre', 1)}${lbl(430, 270, 16, 'Royaume de France', 1)}${lbl(96, 380, 14, 'Espagne', 1)}${lbl(640, 300, 13, 'Italie', 1)}${lbl(610, 196, 11, 'les Alpes', 1)}${lbl(120, 220, 15, 'Océan', 1)}${lbl(760, 60, 13, 'Saint-Empire', 1)}${compass}`;
    }
    return UI5.svgFrame(inner, this.you(c), `Plan gravé : ${this.CITIES[c].name}`);
  },
  // ---- voyager ----
  open() { this.viewing = true; UI5.sel = null; UI5.openParis(); },
  travel(to) {
    const from = this.home(), R = this.route(from, to), d = Save.data; if (from === to) return;
    if ((d.ecus || 0) < R.cost) return toastMsg(`Le voyage coûte ${R.cost} écus.`);
    d.ecus -= R.cost; Monde.avance(R.days * 24); this.pending = to; Save.persist();
    if (Math.random() < .45) { // une mauvaise rencontre en chemin
      const sea = R.sea, foe = sea ? { name: 'Un pirate barbaresque', level: 'duelliste', venue: 'navire' } : { name: 'Un brigand de grand chemin', level: 'duelliste', venue: pick(['auberge', 'bastion']) };
      const m = { id: 'route-' + Monde.abs(), type: 'duel', level: foe.level, foe: foe.name };
      toastMsg(sea ? 'Des voiles barbaresques à l\'horizon !' : 'Des brigands barrent la route !'); UI5.ret = 'paris';
      return G.startMatch({ mode: 'duel', venue: foe.venue, voyage: to, noJoute: true, opp: Carte.foeOpp(m) });
    }
    this.arrive();
  },
  arrive(note) { const to = this.pending; if (!to) return; this.pending = null; Save.data.ville = to; this.viewing = false; Save.persist(); UI5.openParis(); toastMsg(`${note ? note + ' ' : ''}Vous arrivez à ${EU_CITIES[to].name}. ${Monde.label()}.`); },
  ext: {
    kind: 'vi',
    seals(city) {
      if (city !== 'europe') return [{ id: 'vi:voyage', x: 112, y: 344, wax: '#5a4a2a', icon: 'M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z', label: 'Voyager', aria: 'Voyager vers une autre ville' }];
      const home = Europe.home(); return Object.keys(EU_CITIES).map(c => ({ id: 'vi:' + c, x: EU_CITIES[c].at[0], y: EU_CITIES[c].at[1], wax: c === home ? '#c19a45' : '#2a4a6a', dark: c === home, icon: 'M5 20 L5 10 L9 7 L9 4 L11 4 L11 6 L13 4 L19 9 L19 20 Z M10 20 L10 15 L14 15 L14 20', label: EU_CITIES[c].name, aria: c === home ? `${EU_CITIES[c].name} : vous y êtes` : `Voyager vers ${EU_CITIES[c].name}` }));
    },
    card(k, U) {
      if (k === 'voyage') return U.card('#5a4a2a', 'En route', 'Voyager', `<p>Diligences, navires et chemins de poste relient Paris, Madrid, Venise et Londres. Chaque ville a ses quartiers, ses missions et ses lames.</p><button class="go" data-vi="europe">Ouvrir la carte d'Europe</button>`);
      const home = Europe.home(); if (k === home) return U.card('#c19a45', 'Votre ville', EU_CITIES[k].name, `<p>Vous êtes à ${EU_CITIES[k].name}.</p><button class="go" data-vi="retour">Revenir au plan de la ville</button>`);
      const R = Europe.route(home, k);
      return U.card('#2a4a6a', R.sea ? 'Par la mer' : 'Par la route', EU_CITIES[k].name, `<p>${R.sea ? 'Un navire' : 'La diligence'} depuis ${EU_CITIES[home].name} : ${R.days} jours, ${R.cost} écus. ${R.sea ? 'On parle de pirates barbaresques.' : 'Les routes ne sont pas sûres.'}</p><button class="go" data-vi="partir">Partir</button>`);
    },
    bind(c, k, U, kind) {
      if (kind !== 'vi') return;
      c.querySelectorAll('[data-vi]').forEach(b => b.addEventListener('click', () => { const a = b.dataset.vi; Snd.init();
        if (a === 'europe') Europe.open(); else if (a === 'retour') { Europe.viewing = false; U.sel = null; U.renderParis(); } else Europe.travel(k); }));
    },
  },
  init() {
    UI5.ext.push(this.ext);
    const bh = UI5.backHome.bind(UI5); UI5.backHome = () => { if (Europe.viewing) { Europe.viewing = false; UI5.sel = null; return UI5.renderParis(); } return bh(); };
    const op = UI5.openParis.bind(UI5); UI5.openParis = q => { if (q && Europe.home() !== 'paris' && QUARTIERS[q]) Save.data.ville = 'paris'; return op(q); };
    const ar = G.afterRound; G.afterRound = function () {
      const r = ar.apply(this, arguments), o = this.matchOpts || {};
      if (this.state === 'over' && o.voyage && Europe.pending) { const won = this.wins[0] > this.wins[1]; let note = '';
        if (!won) { const lost = Math.round((Save.data.ecus || 0) * .3); Save.data.ecus -= lost; note = `Dépouillé de ${lost} écus.`; } else { Save.data.ecus = (Save.data.ecus || 0) + 40; note = 'La route est libre (+40 écus).'; }
        $('overReward').textContent = note + ' ' + $('overReward').textContent; $('again').textContent = 'Continuer le voyage'; this.overAction = 'voyage'; this.voyageNote = note; }
      return r;
    };
    $('again').addEventListener('click', e => { if (G.overAction === 'voyage') { e.stopImmediatePropagation(); G.toMenu(); Europe.arrive(); } }, true);
    $('overMenu').addEventListener('click', () => { if (G.overAction === 'voyage') Europe.arrive(); }, true);
  },
};
