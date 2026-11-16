// =============================== 7.0 · sprint 57 : un seul fil conducteur ===============================
// La Renommée remplace à l'écran les trois jauges (honneur, crainte, faveur restent derrière, pour les effets).
// Le journal montre toujours trois objectifs clairs, tirés de l'état de la partie ; un objectif atteint est salué.
// Les écrans de pause et de fin de duel passent à la charte 5.0.
const REN7_TITRES = [[0, 'Lame inconnue'], [25, 'Bretteur'], [50, 'Lame redoutée'], [90, 'Gloire de Paris'], [150, 'Légende du royaume']];
const Journal7 = {
  last: null,
  renommee() { const R = Rep.data(); return Math.max(0, Math.round((R.honneur || 0) + (R.crainte || 0) * .6 + (R.faveur || 0) * .6 - 35)); }, // 35 : la réputation de départ
  titre() { const n = this.renommee(); let t = REN7_TITRES[0][1]; for (const [v, s] of REN7_TITRES) if (n >= v) t = s; return t; },
  objectifs() {
    const out = [], add = (id, t, s) => { if (out.length < 3 && !out.some(o => o.id === id)) out.push({ id, t, s }); };
    if (typeof Prologue7 !== 'undefined' && !Prologue7.done() && !store.get('ct2d.initDone', 0)) add('prologue', 'Jouer le prologue', 'Une nuit de pluie, rue des Tournelles');
    if (typeof Monde !== 'undefined' && Monde.data().arrest) add('arrest', 'Régler votre affaire avec le guet', 'Sur la carte de Paris');
    if (typeof Rival !== 'undefined') { const r = Rival.actifs().find(x => (x.next || 0) <= Monde.abs()); if (r) add('rival-' + r.id, `Relever le défi de ${r.name}`, Rival.title(r)); }
    if (typeof Monde !== 'undefined' && Monde.wounds().length) add('soins', 'Faire soigner vos blessures', 'Hôtel-Dieu, île de la Cité');
    const i = typeof UI5 !== 'undefined' ? UI5.nextChapter() : -1; if (i >= 0) add('ch-' + STORY[i].id, `Histoire : ${STORY[i].title}`, (STORY[i].act || '').split(' · ').slice(0, 2).join(' · '));
    if (typeof Roi7 !== 'undefined') { const R = Roi7.reqs().find(r => !r.ok); if (R) add('roi-' + R.t.slice(0, 12), 'Se qualifier pour le Tournoi du Roi', R.t); else if (!Roi7.data().wins) add('roi', 'Gagner le Tournoi du Roi', 'Grande Galerie du Louvre'); }
    if (typeof Ecoles6 !== 'undefined') { const D = Ecoles6.data(); if (!Object.keys(D.lecon).length) add('lecon', 'Prendre une leçon chez un maître', 'Les maîtres d\'armes du Marais'); else if (D.pts >= 2) add('botte', 'Apprendre une botte secrète', `${D.pts} points de maîtrise`); }
    if (typeof Epreuves7 !== 'undefined') { const s = Epreuves7.stars(), n = [5, 10, 15, 25, 30, 40, 60, 90].find(v => v > s); if (n) add('ep-' + n, `Épreuves : ${n} étoiles`, `${s} / ${n}`); }
    if (Ach7.cities() < 1) add('voyage', 'Voyager hors de Paris', 'Madrid, Venise ou Londres');
    if (typeof Monde !== 'undefined') { const e = Monde.active().find(x => EVENTS[x.k].fight); if (e) add('ev-' + e.id, EVENTS[e.k].name, QUARTIERS[e.q].name); }
    add('mission', 'Accomplir une mission du jour', 'Un sceau rouge sur la carte');
    return out;
  },
  check() {
    const now = this.objectifs().map(o => o.id); if (this.last) { const gone = this.last.filter(o => !now.includes(o.id) && !/^ep-|^roi-|^mission/.test(o.id)); if (gone.length && G.state !== 'fight') toastMsg(`Objectif accompli : ${gone[0].t}`); }
    this.last = this.objectifs();
  },
  panel() {
    let el = $('j7Panel'); const A = $('accueil'); if (!A) return; if (!el) { el = document.createElement('aside'); el.id = 'j7Panel'; el.setAttribute('aria-label', 'Journal'); A.appendChild(el); }
    el.innerHTML = `<div class="u5-eye">Journal</div>` + this.objectifs().map(o => `<div class="j7-o"><b>${UI5.esc(o.t)}</b><span>${UI5.esc(o.s || '')}</span></div>`).join('') + `<div class="j7-ren">Renommée ${this.renommee()} · ${this.titre()}</div>`;
  },
  init() {
    const st = document.createElement('style');
    st.textContent = `#j7Panel{position:absolute;right:calc(max(16px,env(safe-area-inset-right)) + 24px);top:calc(max(10px,env(safe-area-inset-top)) + 76px);width:min(270px,34vw);display:flex;flex-direction:column;gap:6px;padding:12px 14px;background:rgba(12,10,8,.62);border:1px solid rgba(226,192,110,.22);border-radius:12px}
.j7-o b{display:block;font:400 16px/1.15 var(--display);color:#efe3c6}.j7-o span{font-size:12px;color:#b9ab8c}.j7-ren{font-size:12px;color:#e2c06e;border-top:1px solid rgba(226,192,110,.2);padding-top:6px}
#accueil .a5-sheet:not([hidden]) ~ #j7Panel,#j7Panel.off{display:none}
@media (max-height:430px){#j7Panel{top:calc(max(10px,env(safe-area-inset-top)) + 66px);width:min(230px,27vw)!important;gap:4px;padding:9px 12px}.j7-o b{font-size:14.5px}.j7-o span{font-size:11px}}
body.ui5 #over .card,body.ui5 #pause .card{width:min(560px,92vw)}body.ui5 #over h2,body.ui5 #pause h2{font-size:32px}body.ui5 #overGrade{color:#e2c06e}body.ui5 #overBilan .b{border-radius:8px;border-color:rgba(226,192,110,.2)}body.ui5 #overBilan .tip{border-radius:6px}`;
    document.head.appendChild(st);
    // la Renommée à la place des trois jauges sur la carte ; le titre suit la Renommée
    Rep.title = () => Journal7.titre();
    UI5.ext.push({ kind: 'j7', onRender() { const R = $('p5Rep'); if (!R) return; const e = Save.data.ecus || 0, n = Journal7.renommee(); R.innerHTML = `<span title="Renommée">${UI5.svgI('M12 3 L14.5 9 L21 9.5 L16 13.5 L17.5 20 L12 16.5 L6.5 20 L8 13.5 L3 9.5 L9.5 9 Z', 16)}<b>${n}</b></span><span title="Écus"><span class="a5-coin" style="margin:0"></span><b id="p5E">${e}</b></span><b id="p5H" hidden></b><b id="p5C" hidden></b><b id="p5F" hidden></b>`; R.setAttribute('aria-label', `Renommée ${n}, ${e} écus`); } });
    // journal sur l'accueil
    const qk = UI5.quick.bind(UI5); UI5.quick = function (open) { const r = qk(open); const el = $('j7Panel'); if (el) el.classList.toggle('off', !!open); return r; };
    const ra = UI5.refreshAccueil.bind(UI5); UI5.refreshAccueil = function () { ra(); try { Journal7.panel(); Journal7.check(); } catch (e) { console.error('journal', e); } };
    // les villes visitées
    if (typeof Europe !== 'undefined') { const ar = Europe.arrive.bind(Europe); Europe.arrive = function (n) { const to = this.pending; if (to && to !== 'paris') { Save.data.villes7 = Save.data.villes7 || {}; Save.data.villes7[to] = 1; } return ar(n); }; }
  },
};
