// =============================== 5.0 « Grand Siècle » : un accueil à trois choix, la carte gravée de Paris, un combat épuré ===============================
// Rien n'est supprimé : l'ancien menu devient le « registre » (salle d'armes, bibliothèque, options, duel libre),
// et chaque mode (Histoire, défi, tournois, Nuit de Paris, missions, taverne) est un sceau posé sur la carte.
// L'interface classique reste disponible (Options), et c'est elle que les anciens tests utilisent.
const P5 = {
  // positions sur la planche gravée (844 × 390)
  q: { louvre: [250, 168], marais: [600, 120], cite: [470, 221], pontneuf: [398, 190], stgermain: [418, 284], stantoine: [770, 196] },
  modes: {
    histoire: { at: [560, 318], wax: '#c19a45', dark: true, name: 'Histoire', icon: 'M4 5 C7 4 10 4 12 6 C14 4 17 4 20 5 L20 19 C17 18 14 18 12 20 C10 18 7 18 4 19 Z M12 6 L12 20' },
    defi: { at: [649, 151], wax: '#2f4a6e', name: 'Défi du jour', icon: 'M12 7 A5 5 0 1 0 12.01 7 M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12' },
    tournois: { at: [190, 300], wax: '#3d5a3a', name: 'Tournois', icon: 'M7 4 L17 4 L17 9 C17 13 14 15 12 15 C10 15 7 13 7 9 Z M12 15 L12 19 M8 20 L16 20 M7 6 L4 6 L4 8 C4 10 6 11 7 11 M17 6 L20 6 L20 8 C20 10 18 11 17 11' },
    nuit: { at: [614, 250], wax: '#24304f', name: 'Nuit de Paris', icon: 'M15 4 C10 5 7 9 8 14 C9 18 13 20 18 19 C14 18 11 15 11 11 C11 8 13 5 15 4 Z' },
    taverne: { at: [262, 318], wax: '#6b4a2a', name: 'Taverne', icon: 'M6 6 L16 6 L16 19 L6 19 Z M16 9 L19 9 L19 15 L16 15 M8 9 L8 16 M11 9 L11 16 M14 9 L14 16' },
  },
  swords: 'M5 5 L19 19 M19 5 L5 19 M4 8 L8 4 M16 4 L20 8',
  you: [288, 210],
};
const UI5 = {
  ret: 'accueil', sel: null,
  on() { return store.get('ct2d.ui5', true) !== false; },
  duels() { return store.get('ct2d.ui5.duels', 0); },
  svgI(d, w = 18) { return `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`; },
  esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },

  // ---------------- charte : couleurs, polices, composants ----------------
  css() {
    if ($('ui5css')) return; const st = document.createElement('style'); st.id = 'ui5css';
    st.textContent = `
body.ui5{--u-ink:#15110d;--u-parch:#efe3c6;--u-sepia:#3b2a1a;--u-gold:#e2c06e;--u-wax:#9b2f24;--u-muted:#b9ab8c;--gold:#e2c06e;--muted:#b9ab8c;--parch:#efe3c6}
body.ui5 .screen{background:rgba(12,10,8,.74)}
body.ui5 .card{background:#15110d;border:1px solid rgba(226,192,110,.22);border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.55);padding:18px 22px}
body.ui5 .btn{background:var(--u-gold);color:#1b1408;border:0;border-radius:8px;font:400 18px var(--display);letter-spacing:0;min-height:44px;padding:8px 18px}
body.ui5 .btn.ghost{background:transparent;color:var(--u-parch);border:1px solid rgba(226,192,110,.45)}
body.ui5 .btn.small{font-size:16px;min-height:40px;padding:6px 14px}
body.ui5 .opt{border-radius:8px;border-color:rgba(239,227,198,.16);background:rgba(255,255,255,.025)}
body.ui5 .opt[aria-pressed="true"]{border-color:var(--u-gold);background:rgba(226,192,110,.12)}
body.ui5 .eyebrow,body.ui5 h3{font:700 11px var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--u-gold)}
body.ui5 h2{font-size:30px;color:#f3e8cf}
body.ui5 .item,body.ui5 .bracket div{border-radius:8px}
body.ui5 .tag{border-radius:10px}
body.ui5 #menu .card>.eyebrow,body.ui5 #menu .card>h1,body.ui5 #menu .welcome,body.ui5 #menu .mpanel[data-k="jouer"]>.row:has(#goStory){display:none}
body.ui5 .r5-head{display:flex;align-items:center;gap:12px}
body.ui5 .r5-head b{font:400 24px var(--display);color:#f3e8cf}
.u5-round{width:44px;height:44px;border-radius:22px;border:1px solid rgba(226,192,110,.4);background:rgba(12,10,8,.55);color:var(--u-parch,#efe3c6);display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer;flex:0 0 auto}
.u5-round:hover,.u5-round:focus-visible{border-color:rgba(226,192,110,.85)}
body:not(.ui5) .r5-head{display:none}
/* accueil */
#accueil{background:none;align-items:stretch;justify-content:flex-start}
#accueil .a5-scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,10,8,.94) 0%,rgba(12,10,8,.8) 36%,rgba(12,10,8,.2) 64%,rgba(12,10,8,0) 82%),linear-gradient(0deg,rgba(12,10,8,.65),rgba(12,10,8,0) 30%)}
#accueil .a5-in{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px;padding:24px calc(max(16px,env(safe-area-inset-right)) + 40px) 24px calc(max(16px,env(safe-area-inset-left)) + 40px)}
.u5-eye{font:700 11px var(--body);letter-spacing:.24em;text-transform:uppercase;color:#e2c06e}
.a5-title{font:400 clamp(32px,6vw,52px)/1.02 var(--display);color:#f3e8cf;margin:2px 0 0}
.a5-nav{display:flex;flex-direction:column;width:min(330px,46vw)}
.a5-choice{display:flex;align-items:center;gap:14px;min-height:62px;border:0;border-top:1px solid rgba(226,192,110,.28);background:none;color:#efe3c6;text-align:left;padding:4px 0;cursor:pointer;font:inherit}
.a5-choice:last-child{border-bottom:1px solid rgba(226,192,110,.28)}
.a5-choice .mk{width:18px;display:flex;color:#e2c06e;opacity:0;transition:opacity .15s}
.a5-choice:first-child .mk,.a5-choice:hover .mk,.a5-choice:focus-visible .mk{opacity:1}
.a5-choice b{display:block;font:400 26px/1 var(--display);color:#efe3c6}
.a5-choice:first-child b{color:#e2c06e}
.a5-choice small{display:block;font-size:13px;color:#b9ab8c;margin-top:3px}
.a5-icons{position:absolute;top:calc(max(10px,env(safe-area-inset-top)) + 14px);right:calc(max(16px,env(safe-area-inset-right)) + 24px);display:flex;gap:10px}
.a5-foot{position:absolute;bottom:calc(max(8px,env(safe-area-inset-bottom)) + 14px);right:calc(max(16px,env(safe-area-inset-right)) + 24px);display:flex;align-items:center;gap:14px;font-size:13px;color:#d9ccae}
.a5-foot i{font:italic 15px 'IM Fell English',Georgia,serif}
.a5-coin{display:inline-block;width:10px;height:10px;border-radius:5px;background:#e2c06e;margin-right:6px}
#a5Update{position:absolute;left:calc(max(16px,env(safe-area-inset-left)) + 40px);bottom:calc(max(8px,env(safe-area-inset-bottom)) + 10px)}
.a5-sheet{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55)}
.a5-sheet>div{width:min(440px,90vw);background:#15110d;border:1px solid rgba(226,192,110,.3);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 24px 60px rgba(0,0,0,.6)}
.a5-sheet h2{margin:0;font:400 26px var(--display);color:#f3e8cf}
.a5-lv{display:flex;gap:8px}.a5-lv .opt{flex:1 1 0;text-align:center}
/* carte de Paris */
#paris{background:#ecdfc0;--pp:#ecdfc0;--pk:#3b2a1a;--pks:#6a5236;--pw:#d5d0b2;--pf:#dccdaa;--psh:#5a3c17;--prt:#7a1f17;--pchip:rgba(240,229,203,.93);--pline:rgba(59,42,26,.28);--pcard:#f6eedb;--pci:#2a1d10;--pcm:#5b4630;--pbtn:#2a1d10;--pbi:#f3e6c4}
#paris.nuit{background:#1b2030;--pp:#1b2030;--pk:#a9b2c6;--pks:#8d97ad;--pw:#26314b;--pf:#121624;--psh:#05070d;--prt:#e2c06e;--pchip:rgba(27,32,48,.92);--pline:rgba(169,178,198,.35);--pcard:#242a3d;--pci:#eef0f5;--pcm:#b6bdcc;--pbtn:#e2c06e;--pbi:#1b1408}
#p5Box{position:absolute}
#p5Box svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.k-f{fill:var(--pk)}.k-s{stroke:var(--pk)}.p-f{fill:var(--pp)}.p-s{stroke:var(--pp)}.w-f{fill:var(--pw)}.f-f{fill:var(--pf)}.ks-f{fill:var(--pks)}.sh-c{stop-color:var(--psh)}.rt-s{stroke:var(--prt)}
.lbl{paint-order:stroke;stroke-linejoin:round}
.p5-seal{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border:0;background:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .18s ease}
.p5-seal:hover{transform:scale(1.08)}
.p5-seal .wx{width:32px;height:32px;border-radius:48% 52% 50% 50%/52% 47% 53% 48%;display:flex;align-items:center;justify-content:center;color:#f3e6c4;box-shadow:0 2px 5px rgba(0,0,0,.4),inset 0 -3px 0 rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.12);transition:width .15s,height .15s}
.p5-seal[aria-pressed="true"] .wx{width:40px;height:40px;box-shadow:0 0 0 3px #e2c06e,0 4px 10px rgba(0,0,0,.45),inset 0 -3px 0 rgba(0,0,0,.25)}
.p5-seal.dark .wx{color:#2a1d10}
.p5-seal.done .wx{filter:saturate(.25) brightness(1.15);opacity:.8}
.p5-seal.ev .wx{animation:p5pulse 1.6s ease-in-out infinite}@keyframes p5pulse{50%{box-shadow:0 0 0 5px rgba(226,192,110,.45),0 2px 5px rgba(0,0,0,.4)}}
.p5-seal.lock .wx{background:transparent!important;border:1.5px dashed var(--pks);box-shadow:none;color:var(--pks)}
.p5-seal .n{position:absolute;right:0;top:0;min-width:16px;height:16px;border-radius:8px;background:#e2c06e;color:#1b1408;font:800 10.5px/16px var(--body);text-align:center}
.p5-seal .lb{position:absolute;top:41px;left:50%;transform:translateX(-50%);white-space:nowrap;font:italic 12.5px 'IM Fell English',Georgia,serif;color:var(--pk);text-shadow:0 0 3px var(--pp),0 0 3px var(--pp),0 0 2px var(--pp);pointer-events:none}
.p5-top{position:absolute;left:calc(max(12px,env(safe-area-inset-left)) + 10px);top:calc(max(8px,env(safe-area-inset-top)) + 10px);display:flex;align-items:center;gap:12px}
.p5-top .u5-round{background:var(--pchip);border-color:var(--pline);color:var(--pk)}
.p5-title{display:flex;flex-direction:column;padding:2px 12px 4px;background:var(--pchip);border-radius:6px}
.p5-title b{font:400 26px/1 var(--display);color:var(--pk)}
.p5-title span{font:italic 13px 'IM Fell English',Georgia,serif;color:var(--pks)}
.p5-rep{position:absolute;right:calc(max(12px,env(safe-area-inset-right)) + 10px);top:calc(max(8px,env(safe-area-inset-top)) + 12px);display:flex;gap:2px;padding:5px;border-radius:22px;background:var(--pchip);border:1px solid var(--pline)}
.p5-rep>span{display:flex;align-items:center;gap:5px;height:30px;padding:0 9px;font:700 14px var(--body);color:var(--pk)}
.p5-rep>span:last-child{border-left:1px solid var(--pline)}
.p5-card{position:absolute;top:calc(max(8px,env(safe-area-inset-top)) + 72px);width:min(300px,42vw);max-height:calc(100% - 90px);overflow:auto;touch-action:pan-y;box-sizing:border-box;padding:16px 16px 14px;background:var(--pcard);border:1px solid var(--pline);border-radius:10px;box-shadow:0 14px 34px rgba(20,12,4,.32);display:flex;flex-direction:column;gap:9px;color:var(--pci)}
.p5-card .ey{display:flex;align-items:center;justify-content:space-between;gap:8px;font:700 11px var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--pcm)}
.p5-card .ey i{display:inline-block;width:10px;height:10px;border-radius:5px;margin-right:8px;vertical-align:-1px}
.p5-card .x{width:36px;height:36px;margin:-10px -10px 0 0;border:0;background:none;color:var(--pcm);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.p5-card h4{margin:0;font:400 21px/1.12 var(--display);color:var(--pci)}
.p5-card p{margin:0;font-size:14px;line-height:1.4;color:var(--pcm)}
.p5-card .rum{font:italic 14px/1.35 'IM Fell English',Georgia,serif}
.p5-card .go{height:44px;border:0;border-radius:8px;background:var(--pbtn);color:var(--pbi);display:flex;align-items:center;justify-content:center;gap:8px;font:400 19px var(--display);cursor:pointer;flex:0 0 auto}
.p5-card .go.alt{background:transparent;color:var(--pci);border:1px solid var(--pline);font-size:16px;height:40px}
.p5-mis{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--pline);padding-top:8px}
.p5-mis b{font:700 14px var(--body);color:var(--pci)}.p5-mis span{font-size:12.5px;color:var(--pcm)}
.p5-mis .row{gap:6px}.p5-mis .opt{color:var(--pci);border-color:var(--pline);min-height:40px;flex:1 1 auto}
.p5-mis.done{opacity:.6}
/* transition à l'encre */
#ink5{position:fixed;inset:0;z-index:60;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(12,10,8,.92) 0%,rgba(12,10,8,.97) 60%,#0c0a08 100%)}
#ink5.go{animation:ink5 .42s ease-out}
@keyframes ink5{0%{opacity:.85}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){#ink5.go{animation:none}.p5-seal,.a5-choice .mk{transition:none}}
/* combat épuré : boutons plus discrets ; les aides (« maintenir : lourde ») ne restent que pour les premiers duels */
body.ui5 .tb{border-width:1.5px;border-color:rgba(243,232,207,.32);background-color:rgba(10,9,12,.24);font:700 13px var(--body);letter-spacing:.06em}
body.ui5 #bAtk{font-size:15px}body.ui5 #bEsq,body.ui5 #bGuard,body.ui5 #bFeint{font-size:13px}
body.ui5 #purse{display:none}
body.ui5 #bAtk{border-color:rgba(226,192,110,.7);color:#f1d892}
body.ui5 #bGuard{border-color:rgba(201,214,226,.55)}
body.ui5 #bEsq{border-color:rgba(150,200,230,.55)}
body.ui5:not(.novice) .tb small,body.ui5:not(.novice) #stickHint{display:none}
body.ui5 #stickBase{border-width:1.5px;border-color:rgba(243,232,207,.22);background:rgba(10,9,12,.2)}
body.ui5 #stickKnob{background:rgba(243,232,207,.6)}
body.ui5 #bPause{border-radius:22px;background:rgba(10,9,12,.35);border-color:rgba(243,232,207,.3)}
@media (max-height:430px){.a5-choice{min-height:54px}.a5-choice b{font-size:23px}#accueil .a5-in{gap:14px}.p5-card{gap:7px}.p5-card h4{font-size:19px}}
`;
    document.head.appendChild(st);
  },

  // ---------------- accueil ----------------
  buildAccueil() {
    if ($('accueil')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'accueil'; s.hidden = true;
    const ico = {
      salle: 'M5 19 L17 7 M14 5 C16 4 19 4 20 4 C20 5 20 8 19 10 M7 14 L10 17 M4 20 L6 18',
      biblio: 'M4 5 C7 4 10 4 12 6 C14 4 17 4 20 5 L20 19 C17 18 14 18 12 20 C10 18 7 18 4 19 Z M12 6 L12 20',
      opts: 'M4 7 L20 7 M4 17 L20 17 M9 4.6 A2.4 2.4 0 1 0 9.01 4.6 M15 14.6 A2.4 2.4 0 1 0 15.01 14.6',
    };
    const mk = this.svgI('M4 20 L18 6 M15 4 L20 9 M6 15 L9 18');
    s.innerHTML = `<div class="a5-scrim"></div><div class="a5-in">
      <div><div class="u5-eye">Paris · 1633 · Édition Lumière</div><h1 class="a5-title">Les Lames de l'Ombre</h1></div>
      <nav class="a5-nav" aria-label="Menu principal">
        <button class="a5-choice" id="a5Cont"><span class="mk">${mk}</span><span><b id="a5ContT">Continuer</b><small id="a5ContS"></small></span></button>
        <button class="a5-choice" id="a5Paris"><span class="mk">${mk}</span><span><b>Paris</b><small>La carte, les missions, la nuit</small></span></button>
        <button class="a5-choice" id="a5Quick"><span class="mk">${mk}</span><span><b>Duel rapide</b><small>Un adversaire, un décor au hasard</small></span></button>
      </nav></div>
      <div class="a5-icons"><button class="u5-round" id="a5Salle" aria-label="Salle d'armes" title="Salle d'armes">${this.svgI(ico.salle, 20)}</button><button class="u5-round" id="a5Biblio" aria-label="Bibliothèque" title="Bibliothèque">${this.svgI(ico.biblio, 20)}</button><button class="u5-round" id="a5Opts" aria-label="Options" title="Options">${this.svgI(ico.opts, 20)}</button></div>
      <div class="a5-foot"><i id="a5Name"></i><span><span class="a5-coin"></span><span id="a5Ecus"></span></span></div>
      <button class="btn" id="a5Update" hidden>Nouvelle version : mettre à jour</button>
      <div class="a5-sheet" id="a5QuickBox" hidden><div role="dialog" aria-label="Duel rapide">
        <div class="r5-head" style="justify-content:space-between"><h2>Duel rapide</h2><button class="u5-round" id="a5QClose" aria-label="Fermer">${this.svgI('M6 6 L18 18 M18 6 L6 18', 16)}</button></div>
        <div class="u5-eye">Adversaire</div>
        <div class="a5-lv" id="a5Lv"><button class="opt" data-v="debutant"><b>Débutant</b><span>lent, prévisible</span></button><button class="opt" data-v="duelliste"><b>Duelliste</b><span>varie le rythme</span></button><button class="opt" data-v="maitre"><b>Maître</b><span>mesure et feintes</span></button></div>
        <button class="btn" id="a5QGo">En garde !</button>
        <button class="btn ghost" id="a5QMore">Décor, exercices et autres réglages</button>
      </div></div>`;
    document.body.appendChild(s);
    $('a5Cont').addEventListener('click', () => { Snd.init(); this.cont(); });
    $('a5Paris').addEventListener('click', () => { Snd.init(); this.openParis(); });
    $('a5Quick').addEventListener('click', () => { Snd.init(); this.quick(true); });
    $('a5QClose').addEventListener('click', () => this.quick(false));
    $('a5QGo').addEventListener('click', () => { this.quick(false); const lv = this.qLevel || 'duelliste', b = $('lvls') && $('lvls').querySelector(`[data-v="${lv}"]`); if (b) b.click(); G.level = lv; this.ret = 'accueil'; G.startMatch({ venue: pick(VENUE_KEYS) }); });
    $('a5QMore').addEventListener('click', () => { this.quick(false); this.registre('jouer'); });
    $('a5Lv').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { this.qLevel = b.dataset.v; this.selLv(); Snd.step && Snd.step(); }));
    $('a5Salle').addEventListener('click', () => { Snd.init(); this.registre('salle'); });
    $('a5Biblio').addEventListener('click', () => { Snd.init(); this.registre('biblio'); });
    $('a5Opts').addEventListener('click', () => { Snd.init(); this.registre('options'); });
    // la mise à jour de l'appli installée reste visible dès l'accueil
    const up = $('pwaUpdate'), a5u = $('a5Update'); if (up) { const sync = () => { a5u.hidden = up.hidden; }; new MutationObserver(sync).observe(up, { attributes: true, attributeFilter: ['hidden'] }); sync(); a5u.addEventListener('click', () => up.click()); }
  },
  selLv() { $('a5Lv').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === (this.qLevel || 'duelliste'))); },
  quick(open) { $('a5QuickBox').hidden = !open; if (open) { this.qLevel = ['debutant', 'duelliste', 'maitre'].includes(G.level) ? G.level : 'duelliste'; this.selLv(); } },
  nextChapter() {
    if (typeof STORY === 'undefined' || typeof Story === 'undefined') return -1; const D = Story.data().done;
    for (let i = 0; i < STORY.length; i++) { const c = STORY[i]; if (c.side || D[c.id]) continue; try { if (Story.unlocked(i)) return i; } catch (e) { } }
    return -1;
  },
  contInfo() {
    if (!store.get('ct2d.initDone', 0) && !store.get('ct2d.initOffered', 0)) return { t: 'Premier duel', s: 'L\'initiation : une minute, cinq gestes', k: 'init' };
    const i = this.nextChapter(); if (i >= 0) { const c = STORY[i]; return { t: 'Continuer', s: `${(c.act || 'Histoire').split(' · ')[0]} · ${c.title}`, k: 'story', i }; }
    return { t: 'Continuer', s: 'Paris vous attend', k: 'paris' };
  },
  cont() {
    const C = this.contInfo(); this.ret = 'accueil';
    if (C.k === 'init') { store.set('ct2d.initOffered', 1); const w = document.querySelector('#menu .welcome'); if (w) w.remove(); G.level = 'training'; G.exercise = 'initiation'; G.startMatch(); return; }
    if (C.k === 'story') { Music.play && Music.play('menu'); Story.play(C.i); return; }
    this.openParis();
  },
  refreshAccueil() {
    const C = this.contInfo(); $('a5ContT').textContent = C.t; $('a5ContS').textContent = C.s;
    let nm = ''; try { nm = curHero().name; } catch (e) { } $('a5Name').textContent = nm; $('a5Ecus').textContent = `${Save.data.ecus || 0} écus`;
  },
  registre(tab) { this.ret = 'menu'; if (typeof Menu !== 'undefined' && tab) Menu.open(tab); G.show('menu'); },
  backHome() { this.ret = 'accueil'; G.show('accueil'); },

  // ---------------- carte gravée ----------------
  mapSVG() {
    const wallR = 'M150 250 L140 175 L168 112 L238 70 L360 46 L482 42 L604 54 L694 88 L738 140 L744 192', wallL = 'M640 200 L648 236 L626 300 L560 346 L452 368 L340 362 L262 330 L232 290 L210 248';
    const river = 'M-10 264 C 120 258, 210 248, 300 238 S 430 222, 500 214 S 660 198, 860 186';
    const cite = 'M418 222 C 432 212, 470 208, 520 211 C 534 213, 536 224, 520 228 C 480 234, 440 232, 418 222 Z', stl = 'M546 206 C 560 200, 590 199, 602 203 C 604 209, 590 213, 560 213 C 550 212, 544 210, 546 206 Z';
    const bast = [[140, 175], [168, 112], [238, 70], [360, 46], [482, 42], [604, 54], [694, 88], [648, 236], [626, 300], [560, 346], [452, 368], [340, 362], [262, 330], [232, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5"/>`).join('');
    const lbl = (x, y, s, t) => `<text class="lbl k-f p-s" x="${x}" y="${y}" font-size="${s}" text-anchor="middle" stroke-width="3.5">${t}</text>`;
    return this.svgFrame(`
<path d="${wallR} L660 198 L500 214 L430 222 L300 238 L210 248 Z" fill="url(#p5h)"/>
<path d="M210 248 L300 238 L430 222 L500 214 L640 200 ${wallL.slice(9)} Z" fill="url(#p5h)"/>
<g fill="none" class="p-s" stroke-width="3.2" stroke-linecap="round"><path d="M150 170 C 230 160, 330 150, 430 146 S 560 150, 640 160 S 720 175, 744 180"/><path d="M440 218 C 438 170, 445 110, 455 42"/><path d="M520 212 C 525 160, 540 110, 560 52"/><path d="M470 236 C 468 280, 466 320, 462 368"/><path d="M330 240 C 320 280, 300 320, 290 346"/><path d="M238 72 C 228 120, 210 170, 192 246"/><path d="M560 205 C 600 240, 610 290, 600 330"/></g>
<g fill="none" class="k-s" stroke-width=".8" stroke-opacity=".5" stroke-dasharray="3 3"><path d="M482 42 L492 0"/><path d="M744 182 L860 172"/><path d="M462 368 L458 400"/><path d="M140 175 L-10 160"/><path d="M262 330 L190 400"/></g>
<rect class="p-f k-s" x="168" y="196" width="58" height="34" stroke-width=".8"/><path class="k-s" d="M168 213 L226 213 M197 196 L197 230" stroke-width=".5" stroke-opacity=".6"/>
<rect class="p-f k-s" x="440" y="328" width="62" height="26" stroke-width=".8"/><path class="k-s" d="M440 341 L502 341 M471 328 L471 354 M446 331 L496 351" stroke-width=".5" stroke-opacity=".6"/>
<rect class="k-f" x="232" y="204" width="32" height="22" fill-opacity=".75"/><rect class="p-f" x="240" y="210" width="16" height="10"/>
<rect class="k-f" x="300" y="150" width="22" height="15" fill-opacity=".7"/>
<rect class="p-f k-s" x="638" y="140" width="22" height="22" stroke-width="1.2"/>
<path class="k-s" d="${river}" fill="none" stroke-width="30"/><path d="${river}" fill="none" stroke="url(#p5w)" stroke-width="27"/>
<path class="p-f k-s" d="${cite}" stroke-width="1"/><path d="${cite}" fill="url(#p5h)"/><path class="p-f k-s" d="${stl}" stroke-width="1"/><path d="${stl}" fill="url(#p5h)"/>
<path class="k-f" d="M494 219 L512 219 L512 224 L494 224 Z M500 214 L506 214 L506 229 L500 229 Z"/>
<g class="p-f k-s" stroke-width=".9"><path d="M410 207 L421 207 L423 241 L412 241 Z"/><path d="M486 197 L494 197 L494 211 L486 211 Z"/><path d="M468 229 L476 229 L476 241 L468 241 Z"/><path d="M570 192 L577 192 L577 203 L570 203 Z"/></g>
<g fill="none" stroke-linejoin="round"><path class="k-s" d="${wallR}" stroke-width="5"/><path class="p-s" d="${wallR}" stroke-width="2"/><path class="k-s" d="${wallL}" stroke-width="5"/><path class="p-s" d="${wallL}" stroke-width="2"/></g>
<g class="p-f k-s" stroke-width="1.4">${bast}</g>
<g font-family="'IM Fell English SC', Georgia, serif" letter-spacing="2">${lbl(248, 200, 12, 'Le Louvre')}${lbl(600, 82, 15, 'Le Marais')}${lbl(470, 254, 12, 'La Cité')}${lbl(418, 318, 15, 'Saint-Germain')}${lbl(360, 140, 11, 'Palais-Cardinal')}${lbl(370, 262, 10, 'Pont-Neuf')}</g>
<text class="lbl k-f p-s" x="96" y="276" font-family="'IM Fell English', Georgia, serif" font-style="italic" font-size="15" stroke-width="3" transform="rotate(-3 96 276)">la Seine</text>
<g id="p5Fog"><g filter="url(#p5b)" class="f-f"><ellipse cx="800" cy="150" rx="92" ry="80"/><ellipse cx="806" cy="260" rx="86" ry="96"/><ellipse cx="740" cy="210" rx="44" ry="70"/><ellipse cx="780" cy="350" rx="80" ry="50"/></g>
<text class="ks-f" x="768" y="246" text-anchor="middle" font-family="'IM Fell English', Georgia, serif" font-style="italic" font-size="13">Faubourg Saint-Antoine</text><text class="ks-f" x="768" y="262" text-anchor="middle" font-family="'Alegreya Sans', sans-serif" font-size="10" letter-spacing="2">INEXPLORÉ</text></g>
<g transform="translate(52 336)" class="k-s" fill="none"><circle r="17" stroke-width=".8"/><circle r="13" stroke-width=".4"/><path class="k-f" d="M0 -21 L4 0 L0 21 L-4 0 Z" fill-opacity=".85" stroke-width=".6"/><path d="M-21 0 L0 3 L21 0 L0 -3 Z" stroke-width=".6"/><text class="k-f" y="-25" text-anchor="middle" font-family="'IM Fell English SC', Georgia, serif" font-size="10" stroke="none">N</text></g>
`, P5.you);
  },
  // cadre commun des cartes gravées : motifs, fond de champs, tracé, « vous », vignettage, double filet
  svgFrame(inner, you, label = 'Plan gravé de Paris en 1633') {
    return `<svg viewBox="0 0 844 390" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}">
<defs>
<pattern id="p5h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="k-s" x1="0" y1="0" x2="0" y2="5" stroke-width=".8" stroke-opacity=".45"/></pattern>
<pattern id="p5c" width="10" height="10" patternUnits="userSpaceOnUse"><circle class="k-f" cx="2" cy="2" r=".75" fill-opacity=".28"/><circle class="k-f" cx="7" cy="7" r=".6" fill-opacity=".18"/></pattern>
<pattern id="p5w" width="8" height="3" patternUnits="userSpaceOnUse"><rect class="w-f" width="8" height="3"/><line class="k-s" x1="0" y1="1.5" x2="5" y2="1.5" stroke-width=".5" stroke-opacity=".35"/></pattern>
<filter id="p5b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
<radialGradient id="p5v" cx="50%" cy="50%" r="70%"><stop class="sh-c" offset="60%" stop-opacity="0"/><stop class="sh-c" offset="100%" stop-opacity=".38"/></radialGradient>
</defs>
<rect width="844" height="390" fill="url(#p5c)"/>${inner}<path id="p5Route" class="rt-s" d="" fill="none" stroke-width="2.2" stroke-dasharray="1 6" stroke-linecap="round"/>
<g transform="translate(${you[0]} ${you[1]})"><circle class="k-f" r="6"/><circle class="p-f" r="2.4"/><text class="lbl k-f p-s" y="20" text-anchor="middle" font-family="'IM Fell English', Georgia, serif" font-style="italic" font-size="12" stroke-width="3">vous</text></g>
<rect width="844" height="390" fill="url(#p5v)" pointer-events="none"/>
<rect class="k-s" x="7" y="7" width="830" height="376" fill="none" stroke-width="1.2" stroke-opacity=".7"/><rect class="k-s" x="11" y="11" width="822" height="368" fill="none" stroke-width=".5" stroke-opacity=".6"/>
</svg>`;
  },
  buildParis() {
    if ($('paris')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'paris'; s.hidden = true;
    const I = d => this.svgI(d, 16);
    s.innerHTML = `<div id="p5Box">${this.mapSVG()}<div id="p5Seals"></div></div>
      <div class="p5-top"><button class="u5-round" id="p5Back" aria-label="Retour à l'accueil">${this.svgI('M15 5 L8 12 L15 19')}</button><div class="p5-title"><b id="p5Title">Paris</b><span id="p5Sub"></span></div></div>
      <div class="p5-rep" id="p5Rep"><span title="Honneur">${I('M20 4 C12 4 6 10 5 19 M20 4 C19 11 14 15 8 15 M4 20 L7 17')}<b id="p5H"></b></span><span title="Crainte">${I('M12 3 L12 16 M8 16 L16 16 M12 16 L12 21 M10 6 L12 3 L14 6')}<b id="p5C"></b></span><span title="Faveur du Cardinal">${I('M12 3 L12 21 M6 9 L18 9')}<b id="p5F"></b></span><span title="Écus"><span class="a5-coin" style="margin:0"></span><b id="p5E"></b></span></div>
      <div class="p5-card" id="p5Card" role="dialog" hidden></div>`;
    document.body.appendChild(s);
    $('p5Back').addEventListener('click', () => this.backHome());
    addEventListener('resize', () => { if (!$('paris').hidden) this.layout(); });
  },
  layout() {
    const vw = innerWidth, vh = innerHeight, sc = Math.min(vw / 844, vh / 390), w = 844 * sc, h = 390 * sc, b = $('p5Box');
    b.style.width = w + 'px'; b.style.height = h + 'px'; b.style.left = (vw - w) / 2 + 'px'; b.style.top = (vh - h) / 2 + 'px'; this.sc = sc;
    for (const el of $('p5Seals').children) { el.style.left = (+el.dataset.x * sc) + 'px'; el.style.top = (+el.dataset.y * sc) + 'px'; }
    this.route();
  },
  night() { const h = typeof Monde !== 'undefined' ? Monde.heure() : new Date().getHours(); return store.get('ct2d.ui5.nuit', null) ?? (h >= 21 || h < 6); },
  // 6.0 : la ville courante (Paris, Madrid, Venise, Londres) et les modules qui posent leurs sceaux et leurs fiches sur la carte
  city() { return (typeof Europe !== 'undefined' && Europe.city()) || 'paris'; },
  ext: [],
  cityQ() { if (this.city() === 'paris') { const o = {}; for (const q in QUARTIERS) o[q] = Object.assign({ at: P5.q[q] || [422, 195] }, QUARTIERS[q]); return o; } return Europe.quartiers(this.city()); },
  missions(q) { return this.city() === 'paris' ? Carte.missions(q) : Europe.missions(this.city(), q); },
  rumeur(q) { return this.city() === 'paris' ? Carte.rumeur(q) : Europe.rumeur(this.city(), q); },
  locked(q) { return this.city() === 'paris' && q === 'stantoine' && (Carte.data().total || 0) < 3; },
  you() { return this.city() === 'paris' ? P5.you : Europe.you(this.city()); },
  seals() {
    const out = [], D = Carte.data(), total = D.total || 0, duels = this.duels(), Qs = this.cityQ();
    for (const q in Qs) {
      const [x, y] = Qs[q].at, lock = this.locked(q); let left = 0;
      if (!lock) for (const m of this.missions(q)) if (!D.done[m.id]) left++;
      out.push({ id: 'q:' + q, x, y, wax: '#9b2f24', icon: P5.swords, lock, n: lock ? 0 : left, done: !lock && !left, aria: Qs[q].name + (lock ? ' : inexploré' : ` : ${left} mission${left > 1 ? 's' : ''}`) });
    }
    if (this.city() === 'paris') {
      const M = P5.modes, show = { histoire: true, defi: true, tournois: duels >= 1, nuit: duels >= 2, taverne: total >= 1 };
      for (const k in M) { if (!show[k]) continue; const m = M[k]; let done = false; if (k === 'defi') try { done = !!Defi.data().done[Defi.dayKey()]; } catch (e) { }
        out.push({ id: 'm:' + k, x: m.at[0], y: m.at[1], wax: m.wax, icon: m.icon, dark: m.dark, label: m.name, done, aria: m.name }); }
    }
    for (const X of this.ext) { try { out.push(...(X.seals ? X.seals(this.city()) || [] : [])); } catch (e) { console.error('carte', e); } }
    return out;
  },
  openParis(q) {
    this.buildParis(); this.ret = 'paris'; this.sel = q ? 'q:' + q : null;
    G.show('paris');
  },
  renderParis() {
    const P = $('paris'), city = this.city(); P.classList.toggle('nuit', !!this.night());
    if (this.svgCity !== city) { const old = $('p5Box').querySelector('svg'), tmp = document.createElement('div'); tmp.innerHTML = city === 'paris' ? this.mapSVG() : Europe.svg(city); old.replaceWith(tmp.firstElementChild); this.svgCity = city; }
    $('p5Title').textContent = city === 'paris' ? 'Paris' : Europe.CITIES[city].name;
    const R = Rep.data(); $('p5Sub').textContent = Rep.title(); $('p5H').textContent = R.honneur; $('p5C').textContent = R.crainte; $('p5F').textContent = R.faveur; $('p5E').textContent = Save.data.ecus || 0;
    $('p5Rep').setAttribute('aria-label', `Honneur ${R.honneur}, crainte ${R.crainte}, faveur du Cardinal ${R.faveur}, ${Save.data.ecus || 0} écus`);
    const fog = $('p5Fog'); if (fog) fog.style.display = city === 'paris' && (Carte.data().total || 0) < 3 ? '' : 'none';
    for (const X of this.ext) if (X.onRender) try { X.onRender(this); } catch (e) { console.error('carte', e); }
    const box = $('p5Seals'); box.innerHTML = ''; const list = this.seals(); if (this.sel && !list.some(s => s.id === this.sel)) this.sel = null;
    for (const s of list) {
      const b = document.createElement('button'); b.className = 'p5-seal' + (s.dark ? ' dark' : '') + (s.done ? ' done' : '') + (s.lock ? ' lock' : '') + (s.cls ? ' ' + s.cls : ''); b.dataset.x = s.x; b.dataset.y = s.y; b.dataset.id = s.id;
      b.setAttribute('aria-label', s.aria); b.setAttribute('aria-pressed', s.id === this.sel);
      b.innerHTML = `<span class="wx" style="background:${s.wax}">${this.svgI(s.lock ? 'M7 11 L7 8 C7 5 9 4 12 4 C15 4 17 5 17 8 L17 11 M6 11 L18 11 L18 20 L6 20 Z' : s.icon, 17)}</span>${s.n ? `<span class="n">${s.n}</span>` : ''}${s.label ? `<span class="lb">${this.esc(s.label)}</span>` : ''}`;
      b.addEventListener('click', () => { Snd.init(); Snd.tick && Snd.tick(); this.sel = this.sel === s.id ? null : s.id; this.renderParis(); });
      box.appendChild(b);
    }
    this.layout(); this.renderCard();
  },
  route() {
    const r = $('p5Route'); if (!r) return; const s = this.sel && $('p5Seals').querySelector(`[data-id="${this.sel}"]`);
    if (!s) { r.setAttribute('d', ''); return; } const [px, py] = this.you(), x = +s.dataset.x, y = +s.dataset.y, mx = (px + x) / 2, my = Math.min(py, y) - 46;
    r.setAttribute('d', `M${px} ${py} Q ${mx} ${my} ${x} ${y}`);
  },
  card(wax, eye, title, body) {
    return `<div class="ey"><span><i style="background:${wax}"></i>${eye}</span><button class="x" id="p5X" aria-label="Fermer">${this.svgI('M6 6 L18 18 M18 6 L6 18', 16)}</button></div><h4>${title}</h4>${body}`;
  },
  renderCard() {
    const c = $('p5Card'), id = this.sel; if (!id) { c.hidden = true; return; } c.hidden = false;
    const [kind, k] = id.split(':'), seal = $('p5Seals').querySelector(`[data-id="${id}"]`), sx = seal ? +seal.dataset.x : 0;
    // la fiche s'ouvre du côté opposé au sceau
    const right = sx < 422; c.style.left = right ? 'auto' : `calc(max(12px, env(safe-area-inset-left)) + 10px)`; c.style.right = right ? `calc(max(12px, env(safe-area-inset-right)) + 10px)` : 'auto';
    const go = (t, cls = '') => `<button class="go ${cls}" data-act="${cls ? 'alt' : 'go'}">${t}</button>`; let html = '', acts = {}, X = null;
    if (kind === 'q') {
      const Q = this.cityQ()[k], D = Carte.data();
      if (this.locked(k)) html = this.card('#9b2f24', 'Quartier', Q.name, `<p>${Q.desc}</p><p class="rum">Le faubourg reste à explorer : accomplissez trois missions dans Paris pour y être introduit.</p>`);
      else {
        let rows = ''; for (const m of this.missions(k)) { const T = MISSION_TYPES[m.type], done = D.done[m.id];
          rows += `<div class="p5-mis${done ? ' done' : ''}"><b>${T.name}</b><span>contre ${this.esc(m.foe)} · ${m.level === 'maitre' ? 'maître' : 'duelliste'} · ${m.ecus} écus${m.type === 'infiltration' ? ' · déguisement requis' : ''}</span>`;
          if (done) rows += `<span>Accomplie ✓</span>`;
          else if (m.type === 'infiltration') { rows += '<div class="row">'; for (const d in DISGUISES) rows += `<button class="opt small" data-mission="${m.id}" data-dis="${d}">${DISGUISES[d].name}</button>`; rows += '</div>'; }
          else rows += `<button class="go" data-mission="${m.id}">Y aller ${this.svgI('M5 12 L19 12 M13 6 L19 12 L13 18', 16)}</button>`;
          rows += '</div>'; }
        let extra = ''; for (const E of this.ext) if (E.qExtra) try { extra += E.qExtra(k, this.city()) || ''; } catch (e) { console.error('carte', e); }
        html = this.card('#9b2f24', 'Quartier', Q.name, `<p>${Q.desc}</p><p class="rum">« ${this.esc(this.rumeur(k))} »</p>${this.city() === 'paris' && Carte.guet(k) ? '<p><b>Le guet patrouille :</b> un adversaire de plus.</p>' : ''}${extra}${rows}`);
      }
    } else if (kind === 'm') {
      const M = P5.modes[k];
      if (k === 'histoire') { const i = this.nextChapter(), ch = i >= 0 ? STORY[i] : null;
        html = this.card(M.wax, 'Histoire', ch ? this.esc(ch.title) : 'Le livre est refermé', `<p>${ch ? this.esc(ch.act || '') : 'Tous les chapitres ouverts sont joués. Rejouez-les pour gagner des étoiles.'}</p>${ch ? go('Reprendre') : ''}${go('Tous les chapitres', 'alt')}`);
        acts.go = () => Story.play(i); acts.alt = () => $('goStory').click(); }
      if (k === 'defi') { let done = false; try { done = !!Defi.data().done[Defi.dayKey()]; } catch (e) { }
        html = this.card(M.wax, 'Place Royale', 'Défi du jour', `<p>Une règle nouvelle chaque jour, la même pour tous. ${done ? 'Le défi d\'aujourd\'hui est relevé.' : 'Une seule tentative compte.'}</p>${go(done ? 'Voir le défi' : 'Relever le défi')}`);
        acts.go = () => $('goDefi').click(); }
      if (k === 'tournois') { html = this.card(M.wax, 'Pré-aux-Clercs', 'Tournois', '<p>Des tableaux à élimination : écus, renommée et rapières à la clé.</p>' + go('Voir les tournois')); acts.go = () => $('goTour').click(); }
      if (k === 'nuit') { html = this.card(M.wax, 'Paris, la nuit', 'Nuit de Paris', '<p>Une nuit entière de duels à la suite, avec des faveurs à choisir entre deux rencontres. On ne revient pas en arrière.</p>' + go('Partir dans la nuit')); acts.go = () => $('goRun').click(); }
      if (k === 'taverne') { const cur = Save.data.allie, own = Save.data.allies || []; let rows = '';
        for (const a in ALLIES) { const A = ALLIES[a], has = own.includes(a), cost = this.allyCost(a); rows += `<div class="p5-mis"><b>${A.name}</b><span>${A.desc}</span><button class="go ${has && cur === a ? 'alt' : ''}" data-ally="${a}">${has ? (cur === a ? 'À vos côtés · le renvoyer' : 'Le prendre avec vous') : `Engager · ${cost} écus`}</button></div>`; }
        html = this.card(M.wax, 'Saint-Germain', 'La taverne', '<p>Engagez un allié : il vous suit en duel et en mission.</p>' + rows); }
    } else { X = this.ext.find(x => x.kind === kind); if (X) try { html = X.card(k, this); } catch (e) { console.error('carte', e); html = ''; } }
    if (!html) { c.hidden = true; return; }
    c.innerHTML = html; const cx = $('p5X'); if (cx) cx.addEventListener('click', () => { this.sel = null; this.renderParis(); });
    c.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => { Snd.init(); this.ret = 'paris'; (acts[b.dataset.act] || (() => { }))(); }));
    c.querySelectorAll('[data-mission]').forEach(b => b.addEventListener('click', () => { const m = this.missions(k).find(x => x.id === b.dataset.mission); if (!m) return; Snd.init(); this.ret = 'paris'; Carte.play(m, b.dataset.dis); }));
    c.querySelectorAll('[data-ally]').forEach(b => b.addEventListener('click', () => this.hire(b.dataset.ally)));
    for (const E of this.ext) if (E.bind && (E === X || (kind === 'q' && E.qExtra))) try { E.bind(c, k, this, kind); } catch (e) { console.error('carte', e); }
  },
  allyCost(a) { return ALLIES[a].cost; },

  // la taverne : même règle que la carte de la 4.0 (payer une fois, puis le prendre ou le renvoyer)
  hire(k) { const A = ALLIES[k], d = Save.data, cost = this.allyCost(k); d.allies = d.allies || []; if (!d.allies.includes(k)) { if ((d.ecus || 0) < cost) return toastMsg(`Il faut ${cost} écus pour engager ${A.name}.`); d.ecus -= cost; d.allies.push(k); } d.allie = d.allie === k ? null : k; Save.persist(); this.renderParis(); },
  // ---------------- combat épuré : le haut de l'écran ----------------
  hudTop(g, u) {
    const p = G.p, e = G.e, bw = Math.min(290 * u, W / 2 - 96 * u), y0 = 14 * u, pan = typeof Panache !== 'undefined' && G.mode !== 'training';
    const rr = (x, y, w, h) => { const r = Math.min(h / 2, w / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    const side = (f, right) => {
      const i = right ? 1 : 0, x0 = right ? W - 34 * u - bw : 34 * u, xa = right ? x0 + bw : x0, dir = right ? -1 : 1;
      const nm = f.isPlayer && typeof curHero === 'function' ? curHero().name : (f.look && f.look.name) || '';
      g.textAlign = right ? 'right' : 'left'; g.font = `${Math.round(15 * u)}px "IM Fell English SC", Georgia, serif`;
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(nm, xa + 1, y0 + 12 * u + 1); g.fillStyle = '#f3e8cf'; g.fillText(nm, xa, y0 + 12 * u);
      // manches gagnées : petits losanges dorés à la suite du nom
      if (G.mode !== 'training') { const tw = g.measureText(nm).width; for (let k = 0; k < (G.winsNeeded || 2); k++) { const cx = xa + dir * (tw + 12 * u + k * 13 * u), cy = y0 + 7 * u, r = 4.2 * u; g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); if (G.wins[i] > k) { g.fillStyle = '#e2c06e'; g.fillRect(-r, -r, 2 * r, 2 * r); } else { g.strokeStyle = 'rgba(243,232,207,.55)'; g.lineWidth = 1.2; g.strokeRect(-r, -r, 2 * r, 2 * r); } g.restore(); } }
      // vie : un trait fin, la traînée claire rattrape la vraie valeur
      const H3 = typeof Hud3 !== 'undefined' && Hud3.on(), by = y0 + 19 * u, bh = (H3 ? 11 : 6) * u, w1 = bw * clamp(f.hpShow, 0, 100) / 100, w2 = bw * clamp(f.hp, 0, 100) / 100;
      if (H3) Hud3.life(g, f, x0, by, bw, bh, right, u, w1, w2); else {
      g.fillStyle = 'rgba(0,0,0,.35)'; rr(x0 - 1, by - 1, bw + 2, bh + 2); g.fill(); g.fillStyle = 'rgba(243,232,207,.16)'; rr(x0, by, bw, bh); g.fill();
      if (w1 > 1) { g.fillStyle = 'rgba(243,232,207,.5)'; rr(right ? x0 + bw - w1 : x0, by, w1, bh); g.fill(); }
      if (w2 > 1) { g.fillStyle = f.hp < 30 ? '#ff7a5a' : right ? '#d0644f' : '#efe3c6'; rr(right ? x0 + bw - w2 : x0, by, w2, bh); g.fill(); } }
      // souffle : un fil sous la vie
      let ny = by + bh + 5 * u;
      if (f.breath !== undefined && CFG.breath) { const sw = bw * .7, w3 = sw * clamp(f.breath, 0, 1), low = f.winded, pul = low ? .55 + .45 * Math.abs(Math.sin(G.time * 7)) : 1;
        g.fillStyle = 'rgba(243,232,207,.14)'; g.fillRect(right ? x0 + bw - sw : x0, ny, sw, 2.5 * u); g.globalAlpha = pul; g.fillStyle = low ? '#e8a060' : '#8fb4c9'; g.fillRect(right ? x0 + bw - w3 : x0, ny, w3, 2.5 * u); g.globalAlpha = 1;
        if (low && f.isPlayer) { g.font = `800 ${Math.round(9.5 * u)}px "Alegreya Sans", sans-serif`; g.fillStyle = `rgba(232,160,96,${pul})`; g.fillText('À BOUT DE SOUFFLE', right ? x0 + bw - sw - 6 * u : x0 + sw + 6 * u, ny + 4 * u); }
        ny += 8 * u; }
      // panache : une rapière qui se remplit d'or
      if (pan) { const k = clamp((Panache.v[i] || 0) / 100, 0, 1), full = Panache.ready && Panache.ready[i], L = Math.min(118 * u, bw * .5), hx = xa, cy = ny + 4 * u, b0 = hx + dir * 12 * u;
        g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(205,191,159,.9)'; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(hx, cy); g.lineTo(b0 - dir * 2 * u, cy); g.stroke();
        g.lineWidth = 1.4 * u; g.beginPath(); g.moveTo(b0 - dir * 3 * u, cy - 5 * u); g.quadraticCurveTo(b0 + dir * 4 * u, cy, b0 - dir * 3 * u, cy + 5 * u); g.stroke();
        g.strokeStyle = 'rgba(243,232,207,.22)'; g.lineWidth = 2.4 * u; g.beginPath(); g.moveTo(b0, cy); g.lineTo(b0 + dir * L, cy); g.stroke();
        if (k > 0) { if (full) { g.shadowColor = 'rgba(255,215,106,.9)'; g.shadowBlur = 8 * u * (.6 + .4 * Math.sin(G.time * 10)); } g.strokeStyle = full ? '#ffd76a' : '#e2c06e'; g.beginPath(); g.moveTo(b0, cy); g.lineTo(b0 + dir * L * k, cy); g.stroke(); g.shadowBlur = 0; g.fillStyle = '#f6dd96'; g.beginPath(); g.arc(b0 + dir * L * k, cy, 2.6 * u, 0, 7); g.fill(); }
        g.restore(); ny += 12 * u; }
      // blessures : de petites étiquettes sobres
      g.font = `800 ${Math.round(9 * u)}px "Alegreya Sans", sans-serif`; let ix = xa; for (const z of ['bras', 'jambe', 'torse']) if (f.wounds && f.wounds[z]) { const t = z === 'torse' ? 'FLANC' : z.toUpperCase(), tw = g.measureText(t).width + 8 * u, xx = right ? ix - tw : ix; g.fillStyle = 'rgba(155,47,36,.85)'; rr(xx, ny, tw, 12 * u); g.fill(); g.fillStyle = '#ffe2d6'; g.textAlign = 'left'; g.fillText(t, xx + 4 * u, ny + 9 * u); ix += (right ? -1 : 1) * (tw + 4 * u); g.textAlign = right ? 'right' : 'left'; }
    };
    side(p, false); side(e, true); return true;
  },

  // ---------------- mise en place ----------------
  apply() {
    const on = this.on(); document.body.classList.toggle('ui5', on);
    const tab = document.querySelector('#menu .mtabs button[data-k="jouer"]'); if (tab) tab.textContent = on ? 'Duel libre' : 'Jouer';
    this.novice();
  },
  novice() { document.body.classList.toggle('novice', this.duels() < 3); },
  init() {
    this.css(); this.buildAccueil(); this.buildParis();
    const ink = document.createElement('div'); ink.id = 'ink5'; document.body.appendChild(ink);
    for (const s of ['accueil', 'paris']) if (!V2.screens.includes(s)) V2.screens.push(s);
    // le registre (ancien menu) : un retour vers l'accueil en tête
    const card = $('menu') && $('menu').querySelector('.card'); if (card && !card.querySelector('.r5-head')) { const h = document.createElement('div'); h.className = 'r5-head'; h.innerHTML = `<button class="u5-round" id="r5Back" aria-label="Retour à l'accueil">${this.svgI('M15 5 L8 12 L15 19')}</button><b>Registre</b>`; card.prepend(h); $('r5Back').addEventListener('click', () => this.backHome()); }
    // « menu » mène là d'où l'on vient : l'accueil, la carte, ou le registre
    const sh = G.show; let last = null;
    G.show = function (id) {
      if (id === 'menu' && UI5.on() && UI5.ret !== 'menu') id = UI5.ret;
      if (!UI5.on() && (id === 'accueil' || id === 'paris')) id = 'menu';
      const r = sh.call(this, id);
      if (id !== last && UI5.on()) { const k = $('ink5'); k.classList.remove('go'); void k.offsetWidth; k.classList.add('go'); }
      last = id; if (id === 'accueil') UI5.refreshAccueil(); if (id === 'paris' && $('paris') && !$('paris').hidden) UI5.renderParis();
      return r;
    };
    // la carte de la 4.0 s'ouvre sur la carte gravée
    const co = Carte.open; Carte.open = function (q) { if (UI5.on()) return UI5.openParis(q); return co.apply(this, arguments); };
    // le panache se dessine sur la rapière du nouveau bandeau
    if (typeof Panache !== 'undefined') { const pd = Panache.draw; Panache.draw = function () { if (UI5.on()) return; return pd.apply(this, arguments); }; }
    // découverte progressive : on compte les duels menés à leur terme
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments); if (this.state === 'over' && this.mode !== 'training' && !this.silent) { store.set('ct2d.ui5.duels', UI5.duels() + 1); UI5.novice(); } return r; };
    const sm = G.startMatch; G.startMatch = function () { UI5.novice(); return sm.apply(this, arguments); };
    // option : revenir à l'interface classique
    const P = V2.panel('options'), row = $('optGL') && $('optGL').parentElement; if (row && !$('optUI5')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optUI5'; b.textContent = 'Interface 5.0'; b.setAttribute('aria-pressed', this.on()); b.addEventListener('click', () => { store.set('ct2d.ui5', !this.on()); b.setAttribute('aria-pressed', this.on()); this.ret = this.on() ? 'menu' : 'accueil'; this.apply(); G.show('menu'); }); row.appendChild(b); }
    this.apply();
    if (this.on() && G.state === 'menu' && !$('menu').hidden) { this.ret = 'accueil'; G.show('accueil'); }
  },
};
