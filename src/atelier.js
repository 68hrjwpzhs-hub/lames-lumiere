// =============================== Atelier des peintres ===============================
// Dans le jeu (Options → Lumière → Atelier des peintres) : les artistes glissent leurs PNG et voient aussitôt le duel avec leur peinture,
// éclairée et en mouvement. Cinq onglets : Personnages, Décors, Effets, Animation, Lumière. Chaque réglage s'exporte vers le dossier art/.
const Atelier = {
  el: null, tab: 'heros',
  css: `#atelier{position:fixed;top:calc(env(safe-area-inset-top) + 8px);right:calc(env(safe-area-inset-right) + 8px);z-index:80;width:min(380px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;
    background:rgba(18,13,9,.94);border:1px solid rgba(216,178,94,.5);border-radius:10px;color:#efe3c6;font:14px/1.4 "Alegreya Sans",sans-serif;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
  #atelier h3{margin:0 0 6px;font:600 17px "IM Fell English SC",Georgia,serif;color:#e6c878}#atelier .tabs{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 8px}
  #atelier button,#atelier select,#atelier input[type=number]{font:inherit;color:#1e140a;background:#e6c878;border:1px solid #f4e2a8;border-radius:6px;padding:3px 8px;margin:2px 2px 2px 0}
  #atelier button.ghost,#atelier .tabs button{background:rgba(20,14,10,.6);color:#efe3c6;border-color:rgba(190,196,206,.5)}#atelier .tabs button[aria-pressed=true]{border-color:#e2c06e;color:#e6c878}
  #atelier label{display:block;margin:4px 0}#atelier input[type=range]{width:100%}#atelier .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}#atelier .hint{color:#b9ab8c;font-size:12.5px}
  #atelier .drop{border:1px dashed rgba(216,178,94,.6);border-radius:8px;padding:8px;margin:6px 0;text-align:center;color:#b9ab8c}#atelier .drop.on{background:rgba(216,178,94,.15)}`,
  open() { if (!this.el) this.build(); this.el.hidden = false; this.render(); },
  close() { if (this.el) this.el.hidden = true; },
  h(tag, attrs = {}, kids = []) { const e = document.createElement(tag); for (const k in attrs) { if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } for (const c of [].concat(kids)) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); return e; },
  build() {
    const st = document.createElement('style'); st.textContent = this.css; document.head.appendChild(st);
    this.el = this.h('div', { id: 'atelier', role: 'dialog', 'aria-label': 'Atelier des peintres' }); document.body.appendChild(this.el);
    this.el.addEventListener('dragover', e => { e.preventDefault(); this.el.classList.add('on'); }); this.el.addEventListener('drop', e => { e.preventDefault(); this.files([...e.dataTransfer.files]); });
    this.sel = { hero: (typeof Save !== 'undefined' && Save.data && Save.data.hero) || 'vaucelles', venue: G.venue || 'salle', move: 'fente', phase: 'prep', fx: { sur: 'parade', images: 8, ips: 24, taille: 120, fusion: 'lumière' } };
  },
  // un duel d'essai : le héros choisi contre lui-même, dans le lieu choisi
  essai() { const id = this.sel.hero, L = HEROES[id] ? HEROES[id].look : LOOKS[id]; G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: this.sel.venue }); G.p.look = Object.assign({}, L); G.e.look = Object.assign({}, L); },
  async files(list) {
    const t = this.tab, rd = f => URL.createObjectURL(f);
    if (t === 'heros') { const m = {}; for (const f of list) { const n = f.name.toLowerCase(); const k = n.includes('relief') ? 'relief' : n.includes('mati') ? 'matieres' : 'couleur'; m[k] = rd(f); } await Art.setHero(this.sel.hero, m); }
    else if (t === 'decors') { const cur = Art.decors[this.sel.venue] ? Art.decors[this.sel.venue].plans.map(p => ({ img: p.img, depth: p.depth, name: p.name })) : []; const fs = list.slice().sort((a, b) => a.name.localeCompare(b.name)); fs.forEach((f, i) => cur.push({ img: rd(f), depth: fs.length > 1 ? i / (fs.length - 1) : 1, name: f.name })); await Art.setDecor(this.sel.venue, cur); }
    else if (t === 'effets') { for (const f of list) await Art.setEffet(f.name.replace(/\.png$/i, ''), Object.assign({}, this.sel.fx, { img: rd(f) })); }
    this.render();
  },
  pick(label, key, opts, on) { const s = this.h('select', { 'aria-label': label, onchange: e => { this.sel[key] = e.target.value; if (on) on(); this.render(); } }); for (const [v, t] of opts) { const o = this.h('option', { value: v, text: t }); if (v === this.sel[key]) o.selected = true; s.appendChild(o); } return this.h('label', {}, [label + ' ', s]); },
  file(label, multi, cb) { const i = this.h('input', { type: 'file', accept: 'image/png,image/webp', 'aria-label': label }); if (multi) i.multiple = true; i.addEventListener('change', () => cb([...i.files])); return this.h('label', {}, [label + ' ', i]); },
  slider(label, val, lo, hi, step, on) { const v = this.h('span', { text: (+val).toFixed(2) }), r = this.h('input', { type: 'range', min: lo, max: hi, step, value: val, 'aria-label': label }); r.addEventListener('input', () => { v.textContent = (+r.value).toFixed(2); on(+r.value); }); return this.h('label', {}, [this.h('div', { class: 'row' }, [label, v]), r]); },
  render() {
    const E = this.el; if (!E) return; E.innerHTML = ''; const h = (...a) => this.h(...a);
    E.appendChild(h('div', { class: 'row' }, [h('h3', { text: 'Atelier des peintres' }), h('button', { class: 'ghost', onclick: () => this.close(), 'aria-label': 'Fermer l\'atelier', text: '✕' })]));
    const tabs = h('div', { class: 'tabs' }); for (const [k, t] of [['heros', 'Personnages'], ['decors', 'Décors'], ['effets', 'Effets'], ['anim', 'Animation'], ['lum', 'Lumière']]) { const b = h('button', { text: t, onclick: () => { this.tab = k; this.render(); } }); b.setAttribute('aria-pressed', this.tab === k); tabs.appendChild(b); } E.appendChild(tabs);
    const heroes = Object.keys(HEROES).map(id => [id, HEROES[id].name]).concat(Object.keys(LOOKS).filter(k => k !== 'player').map(k => [k, 'Adversaire · ' + (LOOKS[k].name || k)]));
    const venues = VENUE_KEYS.map(k => [k, VENUES[k].name || k]);
    if (this.tab === 'heros') {
      const H = Art.heros[this.sel.hero];
      E.append(this.pick('Héros', 'hero', heroes), h('button', { text: 'Essayer en duel', onclick: () => this.essai() }),
        h('div', { class: 'drop', text: 'Glissez ici couleur.png, relief.png, matieres.png (2048 × 1024)' }),
        this.file('Planches', true, fs => this.files(fs)),
        h('p', { class: 'hint', text: H ? `Peinture chargée : ${['couleur', 'relief', 'matieres'].filter(k => H[k]).join(', ')}${H.filled ? ' · pièces peintes : ' + Object.keys(H.filled).filter(k => H.filled[k]).map(k => ART_NAMES[k]).join(', ') : ''}` : 'Aucune peinture : le personnage garde la peinture du code.' }),
        h('div', { class: 'row' }, [h('button', { class: 'ghost', text: 'Gabarit', onclick: () => Art.save(`gabarit_${this.sel.hero}.png`, Art.gabarit(this.sel.hero)) }),
          h('button', { class: 'ghost', text: 'Planches de départ', onclick: () => { const s = Art.starters(this.sel.hero); for (const k in s) Art.save(`${k}.png`, s[k]); } }),
          H ? h('button', { class: 'ghost', text: 'Retirer la peinture', onclick: () => { Art.clearHero(this.sel.hero); this.render(); } }) : null]),
        h('p', { class: 'hint', text: 'Les planches de départ sont la peinture actuelle du code, aux bonnes zones : repeignez par-dessus. Relief : rouge = droite, vert = haut, bleu = vers l\'écran. Matières : rouge métal, vert peau, bleu cuir, noir étoffe.' }));
    } else if (this.tab === 'decors') {
      const D = Art.decors[this.sel.venue];
      E.append(this.pick('Lieu', 'venue', venues), h('button', { text: 'Essayer en duel', onclick: () => this.essai() }), h('div', { class: 'drop', text: 'Glissez ici plan1.png … plan6.png (1920 × 1080), du fond au premier plan' }), this.file('Plans', true, fs => this.files(fs)));
      if (D) { D.plans.forEach((p, i) => E.appendChild(this.slider(`Plan ${i + 1}${p.name ? ' · ' + p.name : ''} · profondeur`, p.depth, 0, 1.2, .01, v => { p.depth = v; }))); const cb = h('input', { type: 'checkbox' }); cb.checked = D.lights; cb.addEventListener('change', () => { D.lights = cb.checked; }); E.appendChild(h('label', {}, [cb, ' Garder les lueurs des flambeaux du lieu']));
        E.appendChild(h('div', { class: 'row' }, [h('button', { class: 'ghost', text: 'Exporter calques.json', onclick: () => Art.save('calques.json', { plans: D.plans.map((p, i) => ({ fichier: p.name || `plan${i + 1}.png`, profondeur: +p.depth.toFixed(2) })), lumieres_du_lieu: D.lights }) }), h('button', { class: 'ghost', text: 'Retirer', onclick: () => { Art.clearDecor(this.sel.venue); this.render(); } })])); }
      E.appendChild(h('button', { class: 'ghost', text: 'Gabarit du lieu', onclick: () => Art.save(`gabarit_${this.sel.venue}.png`, Art.gabaritDecor(this.sel.venue)) }));
    } else if (this.tab === 'effets') {
      const fx = this.sel.fx, num = (k, lo, hi) => { const i = h('input', { type: 'number', min: lo, max: hi, value: fx[k], 'aria-label': k }); i.addEventListener('change', () => { fx[k] = +i.value; }); return i; };
      const sur = h('select', { 'aria-label': 'Déclencheur', onchange: e => { fx.sur = e.target.value; } }); for (const v of ['parade', 'touche', 'croisement', 'blocage']) { const o = h('option', { value: v, text: v }); if (v === fx.sur) o.selected = true; sur.appendChild(o); }
      E.append(h('label', {}, ['Déclencheur ', sur]), h('div', { class: 'row' }, ['Images ', num('images', 1, 64), ' Cadence ', num('ips', 1, 60), ' Taille ', num('taille', 10, 600)]),
        h('div', { class: 'drop', text: 'Glissez ici une planche d\'images côte à côte (PNG transparent)' }), this.file('Planche', true, fs => this.files(fs)),
        h('p', { class: 'hint', text: Object.keys(Art.effets).length ? 'Effets chargés : ' + Object.keys(Art.effets).map(n => `${n} (${Art.effets[n].sur})`).join(', ') : 'Aucun effet chargé.' }),
        h('div', { class: 'row' }, [h('button', { text: 'Déclencher', onclick: () => Art.fire(fx.sur, G.p && G.e ? [(G.p.x + G.e.x) / 2, GROUND - 150] : [480, 300]) }),
          h('button', { class: 'ghost', text: 'Exporter effets.json', onclick: () => Art.save('effets.json', Object.fromEntries(Object.entries(Art.effets).map(([n, e]) => [n, { fichier: n + '.png', images: e.images, ips: e.ips, taille: e.taille, sur: e.sur, fusion: e.fusion }]))) })]));
    } else if (this.tab === 'anim') {
      const moves = Object.keys(MOVES).filter(k => MOVES[k].wu).map(k => [k, MOVES[k].name || k]), A = Art.anim[this.sel.move] || (Art.anim[this.sel.move] = {}), P = A[this.sel.phase] || (A[this.sel.phase] = {});
      E.append(this.pick('Coup', 'move', moves), this.pick('Phase', 'phase', [['prep', 'Préparation'], ['exec', 'Exécution (tête et bras libre seulement)'], ['rec', 'Retour en garde']]));
      for (const k in ART_ANIM_KEYS) E.appendChild(this.slider(ART_ANIM_KEYS[k], P[k] || 0, -20, 20, .5, v => { P[k] = v; }));
      E.append(h('div', { class: 'row' }, [h('button', { text: 'Rejouer le coup', onclick: () => { if (G.state !== 'fight') this.essai(); setTimeout(() => { try { G.p.x = 300; G.e.x = 700; G.p.startMove(this.sel.move); } catch (e) { } }, G.state === 'fight' ? 0 : 2600); } }),
        h('button', { class: 'ghost', text: 'Exporter animations.json', onclick: () => Art.save('animations.json', Art.anim) })]),
        h('p', { class: 'hint', text: 'Décalages en degrés (hauteur en pixels), ajoutés à la pose dessinée seulement : les touches ne changent pas. Pendant l\'exécution, la lame suit la pose de jeu.' }));
    } else if (this.tab === 'lum') {
      const v = this.sel.venue, L = LUMEN_V[v] || {};
      E.append(this.pick('Lieu', 'venue', venues), h('button', { text: 'Essayer en duel', onclick: () => this.essai() }));
      for (const k in ART_LUM_KEYS) { const [lo, hi, t] = ART_LUM_KEYS[k]; E.appendChild(this.slider(t, L[k] || 0, lo, hi, .01, x => Art.setLum(v, { [k]: x }))); }
      E.append(h('div', { class: 'row' }, [h('button', { class: 'ghost', text: 'Exporter lumieres.json', onclick: () => Art.save('lumieres.json', Art.lum) }), h('button', { class: 'ghost', text: 'Réinitialiser', onclick: () => { Art.resetLum(v); this.render(); } })]));
    }
  },
  init() {
    const row = $('optLumen') && $('optLumen').parentElement; if (row && !$('optAtelier')) { const c = this.h('button', { class: 'opt small', id: 'optAtelier', text: 'Atelier des peintres', onclick: () => this.open() }); row.appendChild(c); }
    try { if (new URLSearchParams(location.search).get('atelier') !== null) setTimeout(() => this.open(), 800); } catch (e) { }
  },
};
