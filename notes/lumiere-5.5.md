# Édition Lumière 5.5 · Personnages, étape 2, et un moteur plus économe

Objectif : gagner en finesse là où ça se voit (les duellistes), et récupérer de la marge de calcul là où ça ne se voit pas, pour pouvoir s'offrir ces gains sur iPhone.

## Personnages par la carte graphique, étape 2 (`src/figgl.js`)
- **Plus nets.** La planche de textures passe de 1024×1024 cuite à 2,5× à 2048×1024 cuite à 3×.
  - De près, au cadrage serré, les costumes ne sont plus agrandis. Il y a environ un pixel de texture par pixel d'écran.
  - De loin, les mipmaps évitent le scintillement des galons et des boutons.
  - La planche 2D qui sert à la cuisson est libérée après l'envoi : environ 8 Mo de mémoire en moins par tenue. On garde au plus 4 tenues.
- **La jupe devient une pièce souple** (robes de dame et de moine, pans de paysan et de rôdeur). C'est un quadrilatère déformable : la taille suit les hanches, l'ourlet se pose sur les deux jambes, exactement comme le dessin 2D. La robe d'Isaure s'ouvre en fente, avec du volume et un reflet velouté.
- **La cape passe en maillage.** Elle est tendue sur le tissu simulé de la 7.0 (deux bords de 7 points), lissée en courbe (24 rangées). Ses plis sont éclairés : quand le tissu se resserre, les normales ondulent et la lumière dessine les plis.
- **Le zoom des moments forts** (touche, coup de grâce) s'applique maintenant aussi aux maillages et aux particules.
- **Correction d'un défaut de la 5.0** : la pose de cuisson aplatissait les jambes, ce qui déformait les robes cuites. La cuisson part désormais de la vraie pose de garde.
- **Sécurité** : si la cuisson d'une tenue échoue, ce personnage est dessiné en 2D. Après trois échecs, le mode maillages se coupe.

## Moteur plus économe (`src/lumen.js`, `src/lumen4.js`)
- **Le décor cède en premier.** Le décor et les personnages ont chacun leur définition. Quand l'appareil peine, le décor baisse d'abord, jusqu'à 55 % : il est déjà flou au fond, on le remarque à peine. Les personnages ne baissent qu'ensuite, jusqu'à 60 %. Quand la marge revient, les personnages remontent d'abord.
- **Envoi des calques sans réallocation.** Quand la taille ne change pas, `texSubImage2D` remplace `texImage2D` : pas de nouvelle texture à chaque image.
- **Calques vides non renvoyés.** Un calque d'effets ou de personnages resté vide n'est plus renvoyé. En combat, ça arrive rarement : le bras libre, le fourreau et la poussière y sont presque toujours.
- **Pas de tableau neuf à chaque image.** Les sommets des maillages vont dans un tampon unique réutilisé.

## Image
- **Lissage des bords** (anti-crénelage allégé, de type FXAA) dans la passe finale. Sur un contraste marqué, l'image est moyennée le long du bord, pas à travers. Ça adoucit les contours des lames, des chapeaux et des décors, surtout quand la définition auto a baissé. Option « Lissage des bords ».

## Limites honnêtes
- Le bras libre, le fourreau et la main gauche restent en 2D. Le calque des personnages est donc encore envoyé à chaque image : c'est le prochain gain possible.
- Le plumet du chapeau est cuit avec la tête : il ne bouge pas en mode maillages.
- Toujours rien de mesuré sur un vrai iPhone. Le compteur d'images (Options → Lumière) et « Copier la mesure » sont là pour ça.

## Tests
- `tests/figgl_test.js` : robe souple, mipmaps, zoom, décor réduit d'abord, envoi des calques, lissage.
- `tests/lumen.js` : le test de définition auto vérifie que le décor baisse en premier.
