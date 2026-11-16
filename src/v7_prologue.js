// =============================== 7.0 · sprints 51 et 52 : le prologue jouable, et le ressenti des coups ===============================
// Prologue : une nuit de pluie rue des Tournelles. Maître Lacombe vous met une lame en main (les cinq gestes de l'initiation,
// sans écran d'aide), puis un tire-laine lui vole sa bourse : premier vrai duel. Ensuite seulement, l'accueil et Paris.
// Ressenti : arrêt sur image dosé selon le coup, caméra qui accompagne la fente, sons en couches (acier, étoffe, souffle),
// voile rouge quand on est touché, onde sous le pouce sur les boutons tactiles.
const PRO7_LINES = {
  intro: [['narr', 'Paris, 1633. Une nuit de pluie, rue des Tournelles. Une lanterne, une cour, et un vieil homme qui vous attend.'],
    ['lacombe', 'Le Cardinal cherche des lames sûres. Toi, tu cherches du travail. Voyons si l\'un de nous perd son temps.'],
    ['lacombe', 'Prends cette rapière. Je ne t\'expliquerai rien : je vais t\'attaquer, et tu apprendras.']],
  outro: [['lacombe', 'Pas mal, pour une première nuit. Tu tiens la mesure, tu pares, tu ripostes.'],
    ['narr', 'Un cri dans la ruelle. Une silhouette file avec la bourse du maître d\'armes.'],
    ['lacombe', 'Ma bourse ! Rattrape-le, et ne le tue pas : un voleur mort ne rend rien.']],
  fin: [['lacombe', 'Te voilà une lame de l\'Ombre, ou presque. Demain, Paris t\'appartient.'],
    ['narr', 'Fin du prologue. La carte de Paris vous attend : missions, rivaux, écoles… et un jour, le Tournoi du Roi.']],
};
const Prologue7 = {
  phase: null, lines: null, k: 0,
  done() { return !!store.get('ct2d.prologue7', 0); },
  start() {
    this.phase = 'intro'; Snd.init(); store.set('ct2d.initOffered', 1);
    G.mode = 'duel'; G.venue = 'nuit'; G.fixedVenue = 'nuit'; G.state = 'scene'; G.show(null); $('touch').hidden = true; G.banner = null; G.weather = 'rain';
    applyAvatar(); G.e.look = Object.assign({}, LOOKS.maitre, { name: 'Maître Lacombe', coat: '#4a3a2a', coat2: '#2a2018', hair: '#c8c0b0', beard: 'full' });
    G.p.reset(-40); G.e.reset(640); G.clearIntent(G.p); G.clearIntent(G.e); Music.play('menu'); this.say('intro');
  },
  say(part) { this.lines = PRO7_LINES[part]; this.k = 0; this.show(); },
  show() {
    const [who, txt] = this.lines[this.k], sp = SPK[who] || SPK.narr, box = $('scene'); box.hidden = false; box.classList.remove('bub'); box.classList.toggle('narr', !sp.name);
    $('sceneChoices').innerHTML = ''; $('sceneTap').hidden = false; $('sceneName').textContent = sp.name; $('sceneCrest').hidden = !sp.name; $('sceneCrest').textContent = sp.name ? 'L' : ''; $('sceneCrest').style.background = sp.col;
    $('sceneText').textContent = txt; $('sceneText').classList.toggle('narr', !sp.name); $('sceneEye').textContent = 'Prologue · Une nuit de pluie';
    if (this.phase === 'intro' && G.p.x < 300) G.p.x = 300;
  },
  next() {
    Snd.tick(); this.k++; if (this.k < this.lines.length) return this.show(); $('scene').hidden = true;
    if (this.phase === 'intro') { this.phase = 'init'; G.level = 'training'; G.exercise = 'initiation'; G.startMatch({ venue: 'nuit' }); return; }
    if (this.phase === 'outro') { this.phase = 'voleur'; G.level = 'debutant'; G.startMatch({ venue: 'nuit', noJoute: true, prologue7: true, wins: 1, opp: { name: 'Le tire-laine', level: 'debutant', tweak: { slow: 1.7 }, rapier: 'garnison', look: mk('debutant', { style: 'paysan', coat: '#5a4a3a', coat2: '#3a2e22', hose: '#3a2e22', hatType: 'capuche', hat: '#2a2018', plume: null }) } }); return; }
    if (this.phase === 'fin') { this.phase = null; store.set('ct2d.prologue7', 1); G.toMenu(); if (typeof UI5 !== 'undefined' && UI5.on()) { UI5.ret = 'accueil'; G.show('accueil'); } }
  },
  scene(part) { this.phase = part; G.state = 'scene'; G.show(null); $('touch').hidden = true; G.banner = null; G.p.reset(330); G.e.reset(630); G.clearIntent(G.p); G.clearIntent(G.e); this.say(part); },
  init() {
    const sn = Story.next.bind(Story); Story.next = function () { if (Prologue7.phase && G.state === 'scene') return Prologue7.next(); return sn(); };
    const sk = Story.skip.bind(Story); Story.skip = function () { if (Prologue7.phase && G.state === 'scene') { Prologue7.k = Prologue7.lines.length - 1; return Prologue7.next(); } return sk(); };
    // l'initiation finie, la scène reprend au lieu de revenir au menu
    const tm = G.toMenu; G.toMenu0 = tm; G.toMenu = function () { if (Prologue7.phase === 'init' && store.get('ct2d.initDone', 0)) { tm.apply(this, arguments); return Prologue7.scene('outro'); } return tm.apply(this, arguments); };
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments); if (this.state === 'over' && this.matchOpts && this.matchOpts.prologue7) { const won = this.wins[0] > this.wins[1]; $('overReward').textContent = won ? 'La bourse est rendue à Maître Lacombe.' : 'Le voleur s\'enfuit… mais Lacombe a vu votre courage.'; $('again').textContent = 'Suite'; this.overAction = 'prologue7'; } return r; };
    $('again').addEventListener('click', e => { if (G.overAction === 'prologue7') { e.stopImmediatePropagation(); G.overAction = null; Prologue7.scene('fin'); } }, true);
    $('overMenu').addEventListener('click', () => { if (G.overAction === 'prologue7') { G.overAction = null; store.set('ct2d.prologue7', 1); Prologue7.phase = null; } }, true);
    // l'accueil propose le prologue au premier lancement
    if (typeof UI5 !== 'undefined') {
      const ci = UI5.contInfo.bind(UI5); UI5.contInfo = function () { if (!Prologue7.done() && !store.get('ct2d.initDone', 0)) return { t: 'Prologue', s: 'Paris, 1633 · une nuit de pluie', k: 'prologue' }; return ci(); };
      const co = UI5.cont.bind(UI5); UI5.cont = function () { if (this.contInfo().k === 'prologue') { this.ret = 'accueil'; return Prologue7.start(); } return co(); };
    }
  },
};
// ---------------- ressenti des coups ----------------
const Feel7 = {
  hurt: 0, push: 0, pushDir: 0,
  noise(t0, dur, type, f, q, v, dest) { const c = Snd.ctx; if (!c || !Snd.nb || G.silent || !CFG.sfx) return; const s = c.createBufferSource(); s.buffer = Snd.nb; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const g = c.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); s.connect(b); b.connect(g); g.connect(dest || Snd.out); s.start(t0, Math.random()); s.stop(t0 + dur + .05); },
  ring(f, v, dur) { const c = Snd.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(Snd.out); o.start(t); o.stop(t + dur + .05); },
  layer(type, info) {
    const c = Snd.ctx; if (!c) return; const t = c.currentTime;
    if (type === 'hit') { this.noise(t, .12, 'lowpass', 380, .8, .09); this.noise(t + .05, .28, 'bandpass', 900, 1.2, .035); } // étoffe percée, souffle coupé
    if (type === 'parry') { this.ring(2850, .03, .7); this.ring(4120, .015, .5); } // l'acier qui chante
    if (type === 'block') this.ring(2400, .018, .3);
    if (type === 'break') this.noise(t, .2, 'lowpass', 220, .7, .1);
  },
  init() {
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); if (!this.silent) Feel7.layer(type, info);
      if (type === 'hit' && info && info.d === this.p) Feel7.hurt = 1; if (type === 'hit' && info && info.m && (info.m.kind === 'jab' || info.m.kind === 'bassa')) this.hitStop = Math.min(this.hitStop, .04); return r; };
    // la caméra accompagne la fente et la fente lourde
    const cam = G.camera; G.camera = function (rdt) { const c = cam.apply(this, arguments); if (this.state !== 'fight') return c;
      let k = 0, d = 0; for (const f of [this.p, this.e]) if (f.state === 'attack' && f.move && (f.move.kind === 'fente' || f.move.kind === 'heavy') && f.phase && f.phase() !== 'prep') { k = 1; d = f.dir; }
      Feel7.push += (k - Feel7.push) * Math.min(1, rdt * 8); if (k) Feel7.pushDir = d; if (Feel7.push > .01) { c.x += Feel7.pushDir * 14 * Feel7.push; c.s *= 1 + .025 * Feel7.push; } return c; };
    // voile rouge quand on est touché
    const hud = G.hud; G.hud = function (g) { const r = hud.apply(this, arguments); if (Feel7.hurt > .01) { g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); const gr = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .65); gr.addColorStop(0, 'rgba(150,0,0,0)'); gr.addColorStop(1, `rgba(150,10,10,${.38 * Feel7.hurt})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); Feel7.hurt *= .9; } return r; };
    // onde sous le pouce
    const st = document.createElement('style'); st.textContent = '.tb::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid rgba(243,232,207,.7);opacity:0;transform:scale(.8);pointer-events:none}.tb.pulse7::after{animation:tb7 .32s ease-out}@keyframes tb7{0%{opacity:.8;transform:scale(.85)}100%{opacity:0;transform:scale(1.35)}}@media (prefers-reduced-motion:reduce){.tb.pulse7::after{animation:none}}'; document.head.appendChild(st);
    document.querySelectorAll('#touch .tb').forEach(b => b.addEventListener('pointerdown', () => { b.classList.remove('pulse7'); void b.offsetWidth; b.classList.add('pulse7'); }));
  },
};
// plateformes des nouveaux lieux (7.0) : définies ici, après v6_combat.js
Object.assign(PLATFORMS6, { chatelet: [{ x0: 820, x1: 1010, h: 34, k: 'pierre' }], toits: [{ x0: -50, x1: 170, h: 36, k: 'pierre' }] });
