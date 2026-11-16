# Édition Lumière 6.0 · L'atelier des peintres (révolution graphique, étape 1)

Le moteur accepte maintenant la peinture des artistes. Les règles du combat ne bougent pas (vérifié).
Document de cadrage : « Révolution graphique 2D · document de cadrage » (Claude Docs).

## Ce que le jeu sait faire
- **Personnages peints** (`src/art.js`, branché dans `src/figgl.js`).
  - Par héros, trois planches de 2048×1024 aux zones du gabarit :
    - `couleur.png` : la peinture ;
    - `relief.png` : normales OpenGL (rouge vers la droite, vert vers le haut, bleu vers l'écran) ;
    - `matieres.png` : rouge = métal, vert = peau, bleu = cuir, noir = étoffe.
  - Chaque pièce peinte remplace celle du code ; une zone vide garde la peinture du code, on peut donc livrer pièce par pièce.
  - Les normales peintes sont tournées avec chaque os (repère tangent par sommet), y compris pour la jupe et la cape.
- **Décors en plans.**
  - 1 à 6 plans de 1920×1080, chacun avec une profondeur :
    - 0 : suit l'écran (horizon) ;
    - 1 : suit le monde (sol des duellistes).
  - Les plans glissent et zooment selon cette profondeur.
  - Les lueurs des flambeaux du lieu restent en option.
- **Effets dessinés.** Planches d'images côte à côte, jouées à l'endroit du choc. Déclencheurs : parade, touche, croisement, blocage. Fusion « lumière » ou normale.
- **Jeu d'acteur des coups.**
  - Décalages par coup et par phase (buste, épaule, coude, tête, hauteur, bras libre), ajoutés à la pose dessinée.
  - Pendant l'exécution, seuls la tête et le bras libre bougent : la lame reste celle des règles.
- **Lumière des lieux.** Lumière principale, ambiance, brume, brillant du sol, hauteur de la lumière, réglables et réversibles.

## Atelier des peintres (`src/atelier.js`)
- Accès : Options → Lumière → Atelier des peintres, ou l'adresse du jeu suivie de `?atelier`.
- Cinq onglets : Personnages, Décors, Effets, Animation, Lumière.
- On glisse ses PNG sur le panneau, puis « Essayer en duel » lance aussitôt le héros contre lui-même, dans le lieu choisi.
- Exports : `calques.json`, `effets.json`, `animations.json`, `lumieres.json`, et pour chaque héros le gabarit et les planches de départ. Dans l'aperçu Claude, où le téléchargement est bloqué, le texte est copié dans le presse-papiers ; les images se téléchargent depuis le site ou l'appli installée.

## Chaîne de production
- Dossier `art/` (voir `art/LISEZMOI.md`) : `heros/<id>/`, `decors/<lieu>/`, `effets/`, `animations.json`, `lumieres.json`.
- `python3 tools/art_build.py` (lancé aussi par `sh build.sh`) intègre les livraisons dans `src/art_pack.js`.
  - Couleur : WebP sans perte.
  - Plans de décor : WebP qualité 90.
  - Relief et matières : PNG.
- `node tools/gabarits.js [héros…]` produit `art/gabarits/` : pour les 8 héros, le gabarit annoté et les 3 planches de départ ; pour les 18 lieux, un gabarit de décor. Déjà générés et livrés (36 Mo).
- Le gabarit d'un héros montre :
  - en rouge, les zones de chaque pièce ;
  - en bleu, les os et articulations ;
  - en pointillés, le quadrilatère de la jupe ;
  - la peinture actuelle en transparence, et les conventions de couleur.

## Tests
- `tests/art_test.js` :
  - un buste peint en rouge apparaît et les jambes non peintes gardent la peinture du code ;
  - le relief et les matières changent l'éclairage ;
  - les plans de décor suivent l'écran ou le monde selon leur profondeur ;
  - un effet se joue sur une parade, puis disparaît ;
  - le jeu d'acteur des animateurs s'applique ;
  - la lumière se règle et se rétablit ;
  - l'atelier s'ouvre avec ses 5 onglets, et les gabarits ont la bonne taille.
- Chaîne vérifiée de bout en bout : des livraisons de test déposées dans `art/` arrivent bien dans le jeu, puis ont été retirées.

## Limites
- Aucune peinture d'artiste n'est encore livrée : le jeu a exactement l'aspect de la 5.5 tant que le dossier `art/` est vide (hors gabarits).
- Le plumet est peint avec la tête : il ne bouge pas.
- Le bras libre, le fourreau et la main gauche restent dessinés en 2D.
- Toujours rien de mesuré sur un vrai iPhone.
