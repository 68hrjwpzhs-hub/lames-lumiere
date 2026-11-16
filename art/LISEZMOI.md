# Dossier des artistes · Les Lames de l'Ombre, Édition Lumière

Tout ce qui est déposé ici est intégré au jeu par `python3 tools/art_build.py` (lancé aussi par `sh build.sh`).
Pour voir son travail sans rien installer : dans le jeu, Options → Lumière → **Atelier des peintres**, puis glisser ses PNG sur le panneau.

## Personnages · `heros/<id>/`
Identifiants : vaucelles, isaure, bastien, alvaro, corvin, mathurin, oriane, aubrac (les tenues d'adversaires prennent leur clé de tenue).
- `couleur.png` · 2048 × 1024 · la peinture, fond transparent, personnage tourné vers la droite.
- `relief.png` · 2048 × 1024 · normales en convention OpenGL : rouge = vers la droite, vert = vers le haut, bleu = vers l'écran ; une surface plate vaut (128, 128, 255).
- `matieres.png` · 2048 × 1024 · rouge = métal, vert = peau, bleu = cuir, noir = étoffe.
- Chaque pièce reste dans sa zone du gabarit (rouge) et tourne autour de ses os (bleu). Une zone laissée vide garde la peinture du code : on peut livrer pièce par pièce.
- Point de départ : `gabarits/heros/<id>/` contient le gabarit et les trois planches actuelles, à repeindre par-dessus.

## Décors · `decors/<lieu>/`
- `plan1.png` (le fond) … `plan6.png` (le premier plan) · 1920 × 1080 · fonds transparents sauf le fond.
- `calques.json` : `{"plans":[{"fichier":"plan1.png","profondeur":0}, …], "lumieres_du_lieu": true}` ; profondeur 0 = suit l'écran (horizon), 1 = sol des duellistes. Sans fichier, les plans sont répartis de 0 à 1 dans l'ordre des noms.
- Gabarit : `gabarits/decors/<lieu>.png` (sol des duellistes, pied du mur, zone du combat, bandeau de l'interface).

## Effets · `effets/`
- `<nom>.png` : images carrées côte à côte, fond transparent.
- `effets.json` : `{"<nom>": {"images": 8, "ips": 24, "taille": 120, "sur": "parade", "fusion": "lumière"}}` ; `sur` = parade, touche, croisement ou blocage ; `fusion` = lumière (s'ajoute, pour les étincelles) ou normal (pour le sang, la poussière).

## Animation et lumière
- `animations.json` et `lumieres.json` : exportés depuis l'atelier (onglets Animation et Lumière), à déposer ici tels quels.
