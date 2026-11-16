# construit la version installable (PWA) dans dist/ : page, manifeste, service worker, icônes, notice
import os, re, json, shutil, math
from PIL import Image, ImageDraw, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D = ROOT + '/dist'
src = open(ROOT + '/index.html', encoding='utf-8').read()
ver = re.search(r"GAME_VERSION = '([^']+)'", src).group(1) + '-L' + re.search(r"LUMIERE_VERSION = '([^']+)'", src).group(1)
shutil.rmtree(D, ignore_errors=True); os.makedirs(D + '/icons')
head = '''<meta name="theme-color" content="#0c0b10">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Lames · Lumière">'''
page = src.replace("<title>Les Lames de l'Ombre · Édition Lumière</title>", "<title>Les Lames de l'Ombre · Édition Lumière</title>\n" + head, 1)
# 7.0 : les décors haute définition sortent de la page (4 Mo de moins à charger au lancement) ; chacun est chargé quand on en a besoin
import base64
os.makedirs(D + '/decors'); DECORS = []
def _decor(m):
    k, b64 = m.group(1), m.group(2); open(D + '/decors/%s.webp' % k, 'wb').write(base64.b64decode(b64)); DECORS.append('./decors/%s.webp' % k)
    return "  %s: 'decors/%s.webp'," % (k, k)
page = re.sub(r"^  ([a-z0-9_]+): 'data:image/webp;base64,([A-Za-z0-9+/=]+)',?$", _decor, page, flags=re.M)
if not page.lstrip().lower().startswith('<!doctype'): page = '<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n' + page
open(D + '/index.html', 'w', encoding='utf-8').write(page)
man = {"name": "Les Lames de l'Ombre · Édition Lumière", "short_name": "Lames · Lumière", "description": "Duels à la rapière, Paris 1633. Rendu éclairé en relief.", "lang": "fr",
       "start_url": "./", "scope": "./", "display": "fullscreen", "orientation": "landscape", "background_color": "#0c0b10", "theme_color": "#0c0b10",
       "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                 {"src": "icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
json.dump(man, open(D + '/manifest.webmanifest', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
sw = '''// service worker : tout le jeu en cache (hors ligne) ; une nouvelle version attend que le joueur la demande au menu
const CACHE = 'ldl-%s'; // préfixe propre à l'Édition Lumière : le jeu principal (ldo-) et elle ne touchent pas au cache l'un de l'autre
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];
const DECORS = %s; // chargés en arrière-plan, sans retarder l'installation
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => { c.addAll(DECORS).catch(() => {}); }))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ldl-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const font = /fonts\\.(googleapis|gstatic)\\.com/.test(r.url);
  if (!font && new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: r.mode === 'navigate' }) || (r.mode === 'navigate' ? await c.match('./index.html') : null);
    if (hit) return hit;
    try { const res = await fetch(r); if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; } catch (err) { return hit || Response.error(); }
  }));
});
''' % (ver, json.dumps(DECORS))
open(D + '/sw.js', 'w').write(sw)
json.dump({"version": ver}, open(D + '/version.json', 'w'))
open(D + '/.nojekyll', 'w').write('')
# ---- icône : écu d'argent aux trois chevrons de gueules sur deux rapières croisées, fond nuit, cercle d'or ----
def icon(N, mask=False):
    S = 4 * N; im = Image.new('RGB', (S, S), (12, 11, 16)); d = ImageDraw.Draw(im)
    for r in range(S // 2, 0, -4): t = r / (S / 2); c = tuple(int(a * (1 - t) + b * t) for a, b in zip((150, 96, 34), (16, 12, 10))); d.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r], fill=c)
    k = .78 if mask else 1.0; cx = cy = S / 2; R = S * .44 * k
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(216, 178, 94), width=int(S * .018))
    def blade(a):
        ux, uy = math.cos(a), math.sin(a); L = R * .95; x0, y0, x1, y1 = cx - ux * L, cy - uy * L, cx + ux * L * .9, cy + uy * L * .9
        d.line([x0, y0, x1, y1], fill=(222, 228, 236), width=int(S * .016)); hx, hy = cx - ux * L * .62, cy - uy * L * .62; nx, ny = -uy, ux; q = R * .16
        d.line([hx + nx * q, hy + ny * q, hx - nx * q, hy - ny * q], fill=(216, 178, 94), width=int(S * .02)); d.ellipse([x0 - S * .02, y0 - S * .02, x0 + S * .02, y0 + S * .02], fill=(216, 178, 94))
    blade(math.radians(-135)); blade(math.radians(-45))
    w, h = R * .78, R * .95; top = cy - h * .55
    shield = [(cx - w / 2, top), (cx + w / 2, top), (cx + w / 2, top + h * .55)] + [(cx + w / 2 * math.cos(t), top + h * .55 + h * .45 * math.sin(t)) for t in [i / 20 * math.pi for i in range(21)]] + [(cx - w / 2, top + h * .55)]
    d.polygon(shield, fill=(236, 232, 224), outline=(216, 178, 94)); d.line(shield + [shield[0]], fill=(216, 178, 94), width=int(S * .012))
    for i in range(3):
        y = top + h * (.16 + i * .22); t = h * .085
        d.polygon([(cx - w * .40, y + h * .16), (cx, y), (cx + w * .40, y + h * .16), (cx + w * .40, y + h * .16 + t), (cx, y + t), (cx - w * .40, y + h * .16 + t)], fill=(170, 26, 34))
    return im.resize((N, N), Image.LANCZOS)
icon(180).save(D + '/icons/apple-touch-icon.png'); icon(192).save(D + '/icons/icon-192.png'); icon(512).save(D + '/icons/icon-512.png'); icon(512, True).save(D + '/icons/icon-512-maskable.png')
readme = '''# Les Lames de l'Ombre · Édition Lumière — version installable %s

Même jeu que la version 7.0.0 (mêmes mécaniques, même contenu), avec le moteur de rendu « Lumen » : lumière par pixel, relief, ombres portées, reflets.
Elle vit à côté du jeu principal, dans son propre dépôt, pour que les deux ne se gênent pas.

Mettre cette édition en ligne (environ 5 minutes, sans ligne de commande) :

1. Sur https://github.com : « New repository », nom `lames-lumiere`, **Public**, « Create repository ». Ne la mettez pas dans un sous-dossier du dépôt `lames-de-l-ombre` : le jeu principal s'afficherait à sa place.
2. Dans ce dépôt : « uploading an existing file », glissez **tout le contenu de ce dossier** (index.html, manifest.webmanifest, sw.js, version.json, les dossiers icons et decors, et le fichier .nojekyll), puis « Commit changes ».
3. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save. Après 1 à 2 minutes : `https://<votre-nom>.github.io/lames-lumiere/`.
4. Sur l'iPhone, ouvrez cette adresse dans **Safari** → Partager → **Sur l'écran d'accueil**. Vous aurez deux icônes : le jeu principal et l'Édition Lumière.
5. La sauvegarde ne passe pas toute seule d'une icône à l'autre sur iPhone : dans le jeu principal, Options → Sauvegarde → Exporter → Copier le code ; dans l'Édition Lumière, Options → Sauvegarde → collez → Importer.

Si l'iPhone ralentit, le moteur s'allège tout seul, puis revient au rendu de la 7.0.0 (Options → Lumière pour le rallumer).
''' % ver
open(D + '/LISEZMOI.md', 'w', encoding='utf-8').write(readme)
print('dist', ver, sorted(os.listdir(D)), os.path.getsize(D + '/index.html'))
