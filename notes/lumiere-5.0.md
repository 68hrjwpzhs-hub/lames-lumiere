# Édition Lumière 5.0 · Chantier « personnages par la carte graphique », étape 1

Choix retenu : la beauté d'abord. Les duellistes ne sont plus tracés en 2D à chaque image. Ce sont désormais des maillages articulés, peints et éclairés pixel par pixel par la carte graphique. Nouveau fichier : `src/figgl.js` ; branchement dans `src/lumen.js`.

## Comment ça marche
1. **Cuisson.**
   - Pour chaque tenue, les pièces sont peintes une seule fois, à plat, par les fonctions de dessin habituelles du jeu, à 2,5 fois la définition de référence.
   - Les pièces : jambe arrière, jambe avant, buste avec jupe et cou, tête avec chapeau, bras armé, rapière, main armée.
   - Tout va sur une planche de textures de 1024×1024, gardée en mémoire (6 tenues au plus).
   - Les costumes, les visages, les carrures et les gardes de rapière sont donc exactement ceux du jeu.
2. **Maillages.**
   - Chaque pièce est une grille de sommets (environ 1 000 triangles par duelliste).
   - Bras et jambes sont attachés à deux os, avec un fondu au coude et au genou : les articulations plient sans couture.
   - Le pied a son propre os et reste à plat.
   - Le buste, la tête, la lame et la main sont rigides.
   - Les os viennent des articulations dessinées (`f.J`, y compris les mouvements enrichis de la 4.0). Les règles ne bougent pas (vérifié).
3. **Volume.**
   - Chaque sommet porte une normale : cylindre autour de l'os pour les membres, le buste et la lame, sphère pour la tête.
   - Le shader l'affine avec le relief de la peinture : plis, galons, coutures.
   - Le moteur Lumen éclaire ces vraies normales au lieu de deviner le volume à partir de la silhouette floutée.
4. **Matières**, repérées pixel par pixel :
   - **peau** : la lumière diffuse sous la peau, d'un ton rosé ;
   - **étoffe** : reflet velouté vers les bords ;
   - **cuir** (gants, bottes, fusée de la rapière) : reflet doux ;
   - **métal** (lame, garde) : le décor s'y reflète, avec un éclat net.
5. **Ce qui reste en 2D, sous les maillages** : bras libre, fourreau, main gauche (dague, cape, rondache), cape au vent. Le dragon garde entièrement son dessin 2D.

## Réglage
- Options → Lumière → « Personnages par la carte graphique (essai) ». Actif par défaut avec le moteur Lumière.
- En cas d'erreur de la carte graphique, il se coupe tout seul et le dessin 2D reprend.

## Ce que ça change à l'écran
- Les membres et le buste ont un vrai modelé, les coudes et les genoux plient proprement.
- La lumière des flambeaux et de l'étincelle de parade glisse sur les manches, et la lame brille selon son angle.
- Netteté : les maillages sont dessinés à la définition de l'écran, même quand la définition des calques baisse.

## Pas encore fait (étapes suivantes du chantier)
- Le plumet et l'ourlet ne bougent plus au vent en mode maillages : les ressorts de la 1.1 sont cuits à l'arrêt. Il faudra en faire des os.
- Le buste est rigide : la jupe tourne avec lui au lieu de pendre. Il faudra un os de bassin et un os de jupe.
- Le bras libre et la cape restent en 2D.
- L'ordre de dessin entre deux duellistes qui se chevauchent est simplifié (la cape de l'un peut passer derrière le corps de l'autre).
- Rien n'a été mesuré sur un vrai iPhone. En navigateur sans carte graphique (rendu logiciel des tests), une image prend environ 40 % de temps en moins en mode maillages, car les corps ne sont plus tracés en 2D. Sur iPhone, seule la mesure le dira.

## Tests
- `tests/figgl_test.js` vérifie :
  - les deux duellistes sont en maillages ;
  - une cuisson par tenue ;
  - corps absents du calque 2D ;
  - articulations intactes ;
  - aucune erreur de la carte graphique.
- Captures : `tests/figgl.js` (2D contre maillages), `tests/figgl2.js` (chaque héros, en garde et en fente).
