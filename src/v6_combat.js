// =============================== 6.0 · sprint 45 : combat enrichi ===============================
// Désarmement (parade parfaite contre une fente lourde, battement ou saisie sur un adversaire essoufflé) : la rapière tombe au sol,
// il faut aller la ramasser ; l'adversaire peut l'écarter du pied. Au corps à corps, l'attaque devient un coup de pommeau,
// et le fer (battement, prise de fer) une saisie qui projette. Certains lieux ont deux hauteurs (dunette, rempart, pont, échafaudage) :
// d'en haut on frappe plus fort de haut en bas, d'en bas on vise les jambes. Les boss ont une troisième phase sous 25 points de vie.
// Visages : cicatrices des rivaux et masques de Venise.
const PLATFORMS6 = {
  navire: [{ x0: 770, x1: 1010, h: 44, k: 'bois' }], bastion: [{ x0: -50, x1: 190, h: 40, k: 'pierre' }], alcazar: [{ x0: 790, x1: 1010, h: 30, k: 'pierre' }],
  canal: [{ x0: 660, x1: 1010, h: 30, k: 'pierre' }], arsenal: [{ x0: -50, x1: 180, h: 48, k: 'bois' }],
};
const CLOSE6 = 62;
const Combat6 = {
  on() { return G.mode !== 'training' && G.state !== 'demo' && !(G.matchOpts && G.matchOpts.defi); },
  // ---- deux hauteurs ----
  lift(f) {
    const P = PLATFORMS6[G.venue]; if (!P || !f) return 0; const x = f.x;
    for (const p of P) { if (x >= p.x0 && x <= p.x1) return p.h; const ramp = 40; if (x > p.x0 - ramp && x < p.x0) return p.h * (x - (p.x0 - ramp)) / ramp; if (x > p.x1 && x < p.x1 + ramp) return p.h * (p.x1 + ramp - x) / ramp; }
    return 0;
  },
  drawPlatforms(g) {
    const P = PLATFORMS6[G.venue]; if (!P) return;
    for (const p of P) {
      const top = GROUND - p.h, x0 = Math.max(-60, p.x0), x1 = Math.min(W + 60, p.x1), col = p.k === 'pierre' ? ['#6a6460', '#4a4440', '#2a2624'] : p.k === 'pont' ? ['#8a7a64', '#5a4c3c', '#2a2218'] : ['#6a4a2a', '#4a321c', '#24180c'];
      g.fillStyle = col[1]; g.fillRect(x0, top, x1 - x0, GROUND - top + 30); g.fillStyle = col[0]; g.fillRect(x0, top - 4, x1 - x0, 6);
      g.strokeStyle = col[2]; g.lineWidth = 1.5; if (p.k === 'pierre') { for (let y = top + 8; y < GROUND + 30; y += 14) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); for (let x = x0 + ((y / 14) % 2) * 22; x < x1; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); } } }
      else for (let x = x0; x < x1; x += 26) { g.beginPath(); g.moveTo(x, top); g.lineTo(x, GROUND + 30); g.stroke(); }
      // marches vers le bas, du côté de l'arène
      const edge = p.x0 > 0 ? p.x0 : p.x1, s = p.x0 > 0 ? -1 : 1;
      for (let k = 0; k < 3; k++) { const hh = p.h * (3 - k) / 3, w = 14; g.fillStyle = col[k % 2 ? 1 : 0]; g.fillRect(s < 0 ? edge - (k + 1) * w : edge + k * w, GROUND - hh, w, hh); g.fillStyle = col[2]; g.fillRect(s < 0 ? edge - (k + 1) * w : edge + k * w, GROUND - hh, w, 2); }
      if (p.k === 'pont') { g.strokeStyle = '#3a2e22'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, top - 34); g.lineTo(x1, top - 34); g.stroke(); for (let x = x0 + 10; x < x1; x += 30) { g.beginPath(); g.moveTo(x, top - 34); g.lineTo(x, top - 2); g.stroke(); } }
    }
  },
  // ---- désarmement ----
  disarm(f, why) {
    if (!f || f.disarmed || f.state === 'ko' || !f.J || !this.on()) return; f.disarmed = true; f.guarding = false; f.pickT = 0;
    const L = (f.rapier && f.rapier.len) || 110, cx = clamp(f.x + f.dir * 90, 70, W - 70);
    G.drops = G.drops || []; G.drops.push({ f, cx, cy: GROUND - 5, L, ang: f.dir > 0 ? 0 : Math.PI, mid: true, rest: true, vx: 0, vy: 0, va: 0 }); // posée à plat : la chute des rapières (game.js) ne la reprend pas
    G.say(why || 'Désarmé !', [f.x, GROUND - 250], f.isPlayer ? '#f0a48c' : '#ffd76a', 24); Snd.clang(false); G.shake = 6; G.hitStop = .06; f.stats.disarmed = (f.stats.disarmed || 0) + 1;
  },
  dropOf(f) { return (G.drops || []).find(d => d.mid && d.f === f); },
  stepDrops(dt) {
    for (const f of [G.p, G.e]) {
      const d = this.dropOf(f); if (!d) continue; if (!f.disarmed) { G.drops.splice(G.drops.indexOf(d), 1); continue; }
      const o = f.opp;
      if (o && !o.disarmed && Math.abs(o.x - d.cx) < 30 && Math.abs(f.x - d.cx) > 60 && G.time - (d.kicked || -9) > 1.2) { d.kicked = G.time; d.cx = clamp(d.cx + Math.sign(d.cx - f.x || 1) * 110, 60, W - 60); G.say('Écartée du pied', [d.cx, GROUND - 60], '#e6eef6', 16); Snd.tick(); }
      if (Math.abs(f.x - d.cx) < 36 && f.state !== 'hit' && f.state !== 'ko') { f.pickT = (f.pickT || 0) + dt; if (f.pickT > .3) { f.disarmed = false; f.pickT = 0; G.drops.splice(G.drops.indexOf(d), 1); G.say('Ramassée !', [f.x, GROUND - 240], '#e6eef6', 18); Snd.swish(1); } } else f.pickT = 0;
    }
  },
  // ---- corps à corps : pommeau, saisie ----
  close(f) { return f.opp && Math.abs(f.opp.x - f.x) < CLOSE6 && f.opp.state !== 'ko'; },
  pommeau(f) {
    const d = f.opp; f.lastClose = G.time; f.setState('recoil', .24); const hp = [d.J ? d.J.head[0] : d.x, d.J ? d.J.head[1] + 10 : GROUND - 200];
    if (d.guarding) { d.kb = f.dir * 120; d.spend('block'); G.say('Pommeau dans la garde', hp, '#e6eef6', 16); Snd.tick(); }
    else { const dmg = f.disarmed ? 3 : 5; d.hp = Math.max(1, d.hp - dmg); d.setState('hit', .3); d.kb = f.dir * 170; d.breath = Math.max(0, d.breath - .1); d.flash = .1; G.spark(hp, 8, '#ffe6c0'); Snd.hit(false); G.shake = 4; G.say(f.disarmed ? 'Coup de poing !' : 'Coup de pommeau !', hp, '#ffd27a', 20); f.stats.hits++; }
  },
  saisie(f) {
    const d = f.opp; f.lastClose = G.time; f.setState('recoil', .3);
    const winded = d.winded || d.breath < .25; d.guarding = false; d.setState('broken', .55); d.kb = f.dir * 320; d.breath = Math.max(0, d.breath - .3); Snd.crack(); G.shake = 7; G.hitStop = .05;
    G.say('Saisie !', [d.x, GROUND - 240], '#ffd27a', 22); if (winded && Math.random() < .5) this.disarm(d, 'Saisi et désarmé !');
  },
  // ---- visages : cicatrices et masques ----
  face(g, f) {
    const L = f.look || {}, j = f.J; if (!j || (!L.mask && !(L.scars && L.scars.length)) || f.state === 'ko' && f.t > 1) return;
    const d = f.dir, tilt = ((f.pose.torso || 0) + (f.pose.head || 0)) * DEG; g.save(); g.translate(j.head[0], j.head[1]); g.rotate(tilt * d); g.scale(d, 1);
    if (L.scars && L.scars.length && !L.mask) { g.strokeStyle = 'rgba(110,30,26,.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(3, -6); g.lineTo(9.5, 4); g.stroke(); g.strokeStyle = 'rgba(240,200,180,.5)'; g.lineWidth = .7; g.beginPath(); g.moveTo(3.6, -6); g.lineTo(10, 4); g.stroke(); for (const k of [0, 1, 2]) { g.strokeStyle = 'rgba(110,30,26,.7)'; g.lineWidth = .8; g.beginPath(); g.moveTo(4 + k * 2.4, -3.4 + k * 3.6); g.lineTo(6 + k * 2.4, -4.6 + k * 3.6); g.stroke(); } }
    if (L.mask === 'bauta') { g.fillStyle = '#ece6da'; g.beginPath(); g.moveTo(-1, -11); g.quadraticCurveTo(10, -12, 11, -3); g.lineTo(14.5, 6); g.lineTo(9, 9); g.lineTo(9.5, 13); g.lineTo(2, 12); g.quadraticCurveTo(-2, 2, -1, -11); g.fill(); g.strokeStyle = '#b89a50'; g.lineWidth = .8; g.stroke(); g.fillStyle = '#141014'; g.beginPath(); g.ellipse(7, -3, 2.2, 1.4, -.2, 0, 7); g.fill(); }
    else if (L.mask === 'colombina') { g.fillStyle = L.maskCol || '#c8a040'; g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(6, -9, 12, -5); g.quadraticCurveTo(12.5, -1, 9, 0); g.quadraticCurveTo(4, -1.5, -2, 0); g.closePath(); g.fill(); g.fillStyle = '#141014'; g.beginPath(); g.ellipse(7.5, -3.6, 1.9, 1.2, -.2, 0, 7); g.fill(); g.strokeStyle = '#f0e0a0'; g.lineWidth = .6; g.stroke(); g.fillStyle = '#e8dcc4'; for (const k of [0, 1, 2]) { g.beginPath(); g.ellipse(-4 - k * 2, -8 - k * 2.6, 1.4, 4.6, -.6, 0, 7); g.fill(); } }
    else if (L.mask === 'medico') { g.fillStyle = '#e8e2d4'; g.beginPath(); g.moveTo(-1, -11); g.quadraticCurveTo(9, -12, 10.5, -4); g.lineTo(25, 6); g.lineTo(9, 5); g.lineTo(6, 9); g.lineTo(0, 6); g.closePath(); g.fill(); g.strokeStyle = '#9a8a6a'; g.lineWidth = .8; g.stroke(); g.fillStyle = '#141014'; g.beginPath(); g.arc(6.5, -3.5, 1.8, 0, 7); g.fill(); }
    g.restore();
  },
  init() {
    // les coups au corps à corps, et pas d'attaque sans rapière
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) {
      if (Combat6.on() && !this.elan && kind !== 'riposte' && kind !== 'heavy' && kind !== 'fente' && Combat6.close(this) && G.time - (this.lastClose || -9) > .8) {
        if (kind === 'lie' || kind === 'beat') { if (!this.disarmed) return Combat6.saisie(this); }
        else if (['jab', 'bassa', 'degage', 'circ', 'compo', 'tajo'].includes(kind)) return Combat6.pommeau(this);
      }
      if (this.disarmed) return; return sm.apply(this, arguments);
    };
    const cg = Fighter.prototype.canGuard; Fighter.prototype.canGuard = function () { return !this.disarmed && cg.apply(this, arguments); };
    // désarmé, l'IA court ramasser sa lame
    const th = AI.prototype.think; AI.prototype.think = function (dt) {
      const me = this.me; if (me.disarmed) { const d = Combat6.dropOf(me), it = me.intent; if (d) { it.dx = Math.abs(d.cx - me.x) > 12 ? Math.sign(d.cx - me.x) : 0; it.guard = false; it.act = null; it.dash = 0; return; } }
      return th.apply(this, arguments);
    };
    // causes de désarmement
    const pa = G.parry; G.parry = function (a, d, bp, info) { const m = a.move, r = pa.apply(this, arguments); if (m && m.kind === 'heavy' && info && info.perfect) Combat6.disarm(a, 'Fente parée : désarmé !'); return r; };
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); if (type === 'beat' && info && info.d && Math.random() < (info.d.winded || info.d.breath < .25 ? .5 : .12)) Combat6.disarm(info.d, 'Lame battue : désarmé !'); return r; };
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); if (this.state === 'fight' || this.state === 'round') Combat6.stepDrops(dt); return r; };
    const sr = G.startRound; G.startRound = function () { this.drops = (this.drops || []).filter(d => !d.mid); this.e.phase3 = false; return sr.apply(this, arguments); };
    // deux hauteurs : dessin et avantage
    const dw = Finisher.drawWorld.bind(Finisher); Finisher.drawWorld = function (g) { Combat6.drawPlatforms(g); return dw(g); };
    const pa2 = Paint.actor.bind(Paint); Paint.actor = function (g, f, venue, time) { const h = Combat6.lift(f); if (h) { g.save(); g.translate(0, -h); } const r = pa2(g, f, venue, time); Combat6.face(g, f); if (h) g.restore(); return r; };
    const dm = G.drawMarks; G.drawMarks = function (g, f) { const h = Combat6.lift(f); if (!h) return dm.apply(this, arguments); g.save(); g.translate(0, -h); const r = dm.apply(this, arguments); g.restore(); return r; };
    const gl = Depth.glint.bind(Depth); Depth.glint = function (g, f, t) { const h = Combat6.lift(f); if (!h) return gl(g, f, t); g.save(); g.translate(0, -h); gl(g, f, t); g.restore(); };
    const df = G.dmgFor; G.dmgFor = function (a, d, m) { let v = df.apply(this, arguments); const la = Combat6.lift(a), ld = Combat6.lift(d);
      if (la - ld > 15 && ['circ', 'heavy', 'tajo', 'fente'].includes(m.kind)) { v = Math.round(v * 1.15); if (a.isPlayer) this.say('D\'en haut !', [d.x, GROUND - 230], '#ffd27a', 16); }
      if (ld - la > 15 && m.kind === 'bassa') { v = Math.round(v * 1.15); if (a.isPlayer) this.say('Aux jambes !', [d.x, GROUND - 230], '#ffd27a', 16); }
      return v; };
    // boss : troisième phase
    const hit = G.hit; G.hit = function (a, d, at, info) { const r = hit.apply(this, arguments);
      if (d === this.e && d.phase2 && !d.phase3 && d.hp > 0 && d.hp <= 25 && this.ai && this.ai.L) { d.phase3 = true; const L = this.ai.L; L.aggr = Math.min(.95, (L.aggr || .5) + .2); L.perfect = Math.min(.8, (L.perfect || .4) + .08); L.react = Math.max(.14, (L.react || .2) - .02); d.slow *= .92; CutIn.show(d, 'Dernier carré', '#e05a4a'); this.say('Il jette ses dernières forces !', [d.x, GROUND - 262], '#f0a48c', 20); this.slowT = Math.max(this.slowT, .3); }
      return r; };
  },
};
