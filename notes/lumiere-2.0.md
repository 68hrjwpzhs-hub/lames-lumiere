# Édition Lumière 2.0 « Le Tableau »

Le but : que la différence avec le jeu principal se voie sur une simple capture. Les règles ne changent pas : distances, portées et temps du combat restent ceux de la 7.0.0. Seule l'image change.

## Cadrage (`src/lumen2.js`, Cadre)
- Les duellistes occupent environ la moitié de la hauteur de l'écran (un tiers avant).
- Quand les lames s'engagent, la caméra se rapproche.
- Sur un pas de retraite, elle recule avec le combattant.
- Sur une attaque, le cadre suit le coup et penche un peu (pas en « mouvements réduits »).
- Entrée en scène : plan large de la salle, puis la caméra descend sur les deux adversaires.
- Fin de manche : plan rapproché sur le vainqueur.
- Options → Lumière → « Cadrage rapproché » rétablit le cadrage de la 7.0.

## Palette par lieu (`src/lumen.js`, LUMEN_LOOK)
- Chaque lieu a deux dominantes : une teinte dans les ombres, une dans les lumières, plus son contraste et sa saturation.
- Exemples :
  - palais : rouge et or ;
  - Pont-Neuf : bleu nuit et lanternes orange ;
  - Notre-Dame : violet et cierges dorés ;
  - toits sous l'orage : gris acier.
- Le vignettage suit les duellistes, comme un projecteur.

## Profondeur
- Flou de profondeur : le mur du fond et le tout premier plan du sol sont flous ; la piste reste nette. Le flou est plus fort quand la caméra serre.
- Premier plan (`Fg2`) : deux bandes floues propres à chaque lieu défilent plus vite que la piste. En haut : draperies, lustres, chaînes, branches, cordages, linge. En bas : spectateurs de dos, râteliers, cierges, grille, bornes, herbes.

## Moments forts
- **Touche** : pendant un dixième de seconde, le décor tombe dans le noir et les silhouettes ressortent en clair. Jamais en « mouvements réduits ».
- **Parade parfaite** : gerbe d'étincelles et coup de zoom.

## Corrections
- Garde-fou contre une valeur non finie dans les ressorts du fourreau (une erreur de dessin vue une fois dans les tests).

## Tests
- `tests/lumen.js` : 16 vérifications, dont le cadrage (plan large puis serré), la palette et le premier plan des 18 lieux, l'image d'impact (et son absence en mouvements réduits), et le plan sur le vainqueur.
- `tests/lmoments.js` : captures des moments forts.
- Toute la suite repasse.

## Limites
- Coût mesuré sur une carte graphique logicielle : 30 à 40 ms par image pour le moteur. Ce chiffre ne dit rien de l'iPhone, qui a une vraie carte graphique, mais le flou et le premier plan ajoutent du travail par rapport à la 1.1.
- Si l'iPhone rame : Options → Lumière → « Détail : allégé » (coupe le flou et les reflets), puis « Cadrage rapproché » si besoin.
