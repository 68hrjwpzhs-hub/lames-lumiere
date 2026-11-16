// =============================== 7.0 · sprint 58 : musique et son ===============================
// Une couleur par ville dans la musique de combat : la guitare à Madrid, la mandoline à Venise, le consort de violes à Londres
// (Paris garde le clavecin, l'orgue à Notre-Dame et la flûte la nuit). Un motif pour chaque rival, joué quand il entre en lice.
// Au dernier carré d'un boss, la musique donne tout ce qu'elle a. Un thème court pour chaque ville sur sa carte.
const Music7 = {
  city() { try { return typeof Light6 !== 'undefined' && G.state !== 'menu' ? Light6.city() : (typeof UI5 !== 'undefined' ? UI5.city() : 'paris'); } catch (e) { return 'paris'; } },
  // motif d'un rival : cinq notes tirées de son nom (toujours les mêmes pour lui)
  motif(name) { let h = 7; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const sc = [62, 64, 65, 67, 69, 70, 72, 74]; const out = []; for (let i = 0; i < 5; i++) { out.push(sc[h % sc.length]); h = (h * 1103515245 + 12345) >>> 0; } return out; },
  playMotif(notes) { const c = Snd.ctx, bus = Music.bus; if (!c || !bus || G.silent || !CFG.music) return; const t = c.currentTime + .1; notes.forEach((m, i) => { Aud.cornet(m, t + i * .26, i === 4 ? .7 : .22, .06, bus, .1); Aud.viol(m - 12, t + i * .26, .24, .04, bus, -.1); }); Aud.timbale(38, t + 1.04, .2, bus); },
  init() {
    Aud.INST.guitarra = { name: 'gu', strings: [[0, 1], [2, .5]], pos: .18, bright: .7, dur: m => 1.6, decay: f => .3 + Math.min(.5, 50 / f), body: [[180, 4, 1.2], [520, 3, 1.4], [2600, 2, 1]] };
    Aud.INST.mandoline = { name: 'md', strings: [[0, 1], [3, .9]], pos: .1, bright: .9, dur: m => .9, decay: f => .2 + Math.min(.3, 30 / f), body: [[700, 4, 1.5], [3000, 3, 1.4]] };
    const col = Music.color.bind(Music); Music.color = function () { const c = Music7.city(); if (G.venue === 'eglise') return 'orgue'; if (c === 'madrid') return 'guitarra'; if (c === 'venise') return 'mandoline'; if (c === 'londres') return 'consort'; return col(); };
    const cp = Music.TRACKS.combat.play; Music.TRACKS.combat.play = function (s, t) {
      cp.call(this, s, t); const dt = 60 / 104 / 3, L = this.L, e = s % 6, bar = Math.floor(s / 6) % 8, cyc = Math.floor(s / 48) % 3, sec = cyc === 1 ? TAR_B : TAR_A, [b, tones] = CH[sec.ch[bar]], c = this.color(), bus = this.bus;
      if (L[1]) {
        if (c === 'guitarra' && (e === 2 || e === 5)) for (let i = 0; i < 3; i++) Aud.pluck('guitarra', tones[i], t + i * .022, .14, bus, .15); // rasgueado
        if (c === 'mandoline' && e !== 0) Aud.pluck('mandoline', tones[(e + bar) % 3] + 12, t, .1, bus, .25); // trémolo
        if (c === 'consort' && e === 0) for (const m of tones) Aud.viol(m - 12, t, dt * 5.5, .028, bus, .1, .7); // violes tenues
      }
      void b;
    };
    // le dernier carré d'un boss : toutes les couches
    const ten = Music.tension.bind(Music); Music.tension = function () { if (G.e && G.e.phase3 && G.state === 'fight') return 1; return ten(); };
    // le motif du rival à son entrée
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); if (this.round === 1 && this.matchOpts && this.matchOpts.rival && !this.silent) { const n = (this.e.look && this.e.look.name) || 'rival'; setTimeout(() => Music7.playMotif(Music7.motif(n.split(',')[0])), 500); } return r; };
    // un thème court pour chaque ville sur sa carte
    Music.TRACKS.ville = { dt: 60 / 84 / 2, play(s, t) {
      const c = Music7.city(), dt = 60 / 84 / 2, bus = this.bus, k = s % 32, ch = ['D', 'A', 'D', 'G', 'D', 'A', 'G', 'A'][Math.floor(k / 4)], [b, tones] = CH[ch] || CH.D;
      const inst = c === 'madrid' ? 'guitarra' : c === 'venise' ? 'mandoline' : c === 'londres' ? 'harpe' : 'clavecin';
      if (k % 4 === 0) { Aud.viol(b - 12, t, dt * 3.8, .06, bus, -.2, .7); }
      Aud.pluck(inst, tones[(k + (k >> 2)) % 3] + (k % 2 ? 12 : 0), t, .1, bus, .15);
    } };
    const op = UI5.openParis.bind(UI5); UI5.openParis = function (q) { const r = op(q); Music.play(Music7.city() === 'paris' ? 'menu' : 'ville'); return r; };
  },
};
