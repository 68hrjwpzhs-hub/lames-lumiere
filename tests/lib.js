// Playwright : celui du projet (npm i -D playwright) ou, à défaut, celui de l'environnement de développement d'origine
const fs = require('fs'), path = require('path');
const { chromium, devices } = (() => { try { return require('playwright'); } catch (e) { return require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); } })();
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
exports.devices = devices;
exports.open = async (opts = {}) => {
  const b = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const ctx = await b.newContext(opts.device ? { ...devices[opts.device] } : { viewport: { width: 1280, height: 720 } });
  // 5.0 : les anciens tests passent par l'interface classique, même après un rechargement ou un localStorage vidé
  await ctx.addInitScript(o => { const ls = window.localStorage, keep = () => { if (!o.ui5 && ls.getItem('ct2d.ui5') === null) ls.setItem('ct2d.ui5', 'false'); if (!o.joute && ls.getItem('ct2d.joute') === null) ls.setItem('ct2d.joute', 'false'); }, clr = ls.clear.bind(ls); ls.clear = () => { clr(); keep(); }; keep(); }, { ui5: !!opts.ui5, joute: !!opts.joute });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message + (process.env.STACK ? e.stack : ''))); pg.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts/.test(m.text())) errs.push(m.text()); });
  await pg.goto('file://' + (opts.file || path.join(__dirname, '..', 'index.html'))); await pg.waitForFunction(() => typeof G !== 'undefined' && G.p && typeof V2 !== 'undefined', null, { timeout: 20000 }).catch(() => { }); await pg.waitForTimeout(600);
  // 5.0 : les anciens tests passent par l'interface classique (le registre) ; les tests 5.0 demandent ui5
  if (!opts.ui5) await pg.evaluate(() => { try { if (typeof UI5 !== 'undefined') { store.set('ct2d.ui5', false); UI5.apply(); G.show('menu'); } } catch (e) { } });
  if (!opts.joute) await pg.evaluate(() => { try { store.set('ct2d.joute', false); } catch (e) { } }); // la joute verbale (4.0) a ses propres tests
  return { b, ctx, pg, errs };
};
