#!/usr/bin/env python3
"""Intègre les livraisons des artistes (dossier art/) dans le jeu : écrit src/art_pack.js.
art/heros/<id>/couleur.png · relief.png · matieres.png (2048×1024, zones du gabarit)
art/decors/<lieu>/plan1.png … + calques.json {"plans":[{"fichier":"plan1.png","profondeur":0}, …], "lumieres_du_lieu": true}
art/effets/<nom>.png + art/effets/effets.json {"<nom>":{"images":8,"ips":24,"taille":120,"sur":"parade","fusion":"lumière"}}
art/animations.json · art/lumieres.json (exportés depuis l'atelier)
Couleurs et plans : WebP (sans perte pour les personnages) ; relief et matières : PNG (sans perte, indispensables aux normales)."""
import base64, io, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ART = os.path.join(ROOT, 'art'); OUT = os.path.join(ROOT, 'src', 'art_pack.js')
def uri(path, kind):
    try:
        from PIL import Image
        im = Image.open(path).convert('RGBA'); b = io.BytesIO()
        if kind == 'png': im.save(b, 'PNG', optimize=True); mime = 'image/png'
        else: im.save(b, 'WEBP', lossless=(kind == 'webp-lossless'), quality=90, method=6); mime = 'image/webp'
        data = b.getvalue()
    except ImportError:
        data = open(path, 'rb').read(); mime = 'image/png'
    return f'data:{mime};base64,' + base64.b64encode(data).decode()
def jload(p):
    try: return json.load(open(p, encoding='utf-8'))
    except FileNotFoundError: return None
pack = {'heros': {}, 'decors': {}, 'effets': {}, 'animations': {}, 'lumieres': {}}; report = []
hd = os.path.join(ART, 'heros')
for hid in sorted(os.listdir(hd)) if os.path.isdir(hd) else []:
    h = {}
    for k, kind in (('couleur', 'webp-lossless'), ('relief', 'png'), ('matieres', 'png')):
        p = os.path.join(hd, hid, k + '.png')
        if os.path.exists(p): h[k] = uri(p, kind)
    if h: pack['heros'][hid] = h; report.append(f'héros {hid} : ' + ', '.join(h))
dd = os.path.join(ART, 'decors')
for v in sorted(os.listdir(dd)) if os.path.isdir(dd) else []:
    cfg = jload(os.path.join(dd, v, 'calques.json'))
    files = sorted(f for f in os.listdir(os.path.join(dd, v)) if f.lower().startswith('plan') and f.lower().endswith('.png'))
    plans = cfg['plans'] if cfg and cfg.get('plans') else [{'fichier': f, 'profondeur': (i / max(1, len(files) - 1)) if len(files) > 1 else 1} for i, f in enumerate(files)]
    P = [{'src': uri(os.path.join(dd, v, p['fichier']), 'webp'), 'depth': p['profondeur'], 'name': p['fichier']} for p in plans if os.path.exists(os.path.join(dd, v, p['fichier']))]
    if P: pack['decors'][v] = {'plans': P, 'lights': (cfg or {}).get('lumieres_du_lieu', True)}; report.append(f'décor {v} : {len(P)} plans')
fx = jload(os.path.join(ART, 'effets', 'effets.json')) or {}
for n, o in fx.items():
    p = os.path.join(ART, 'effets', o.get('fichier', n + '.png'))
    if os.path.exists(p): pack['effets'][n] = dict({k: o[k] for k in ('images', 'ips', 'taille', 'sur', 'fusion') if k in o}, src=uri(p, 'png')); report.append(f'effet {n} ({o.get("sur", "parade")})')
pack['animations'] = jload(os.path.join(ART, 'animations.json')) or {}; pack['lumieres'] = jload(os.path.join(ART, 'lumieres.json')) or {}
if pack['animations']: report.append('animations : ' + ', '.join(pack['animations']))
if pack['lumieres']: report.append('lumières : ' + ', '.join(pack['lumieres']))
empty = not any(pack[k] for k in pack)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// Généré par tools/art_build.py à partir du dossier art/ : ne pas modifier à la main.\n')
    f.write('const ART_PACK_DATA = ' + ('null' if empty else json.dumps(pack, ensure_ascii=False)) + ';\n')
print('art : ' + ('aucune livraison' if empty else ' · '.join(report)) + f' ({os.path.getsize(OUT) // 1024} Ko)')
