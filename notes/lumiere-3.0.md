# Édition Lumière 3.0 · carrures et personnages peints

Deux chantiers, sans toucher aux règles : les articulations et la pointe de la lame restent celles de la 7.0.0, et c'est vérifié par un test.

## Une carrure par héros (`src/figure_build.js`)
Les huit héros avaient le même corps. Chacun a désormais sa carrure : épaisseur des bras et des jambes, largeur du buste, taille de la tête, port de tête.

| Carrure | Héros | Effet |
|---|---|---|
| massive | Mathurin (et le Colosse) | membres +60 %, buste très large, petite tête |
| robuste | Vaucelles, Bastien | membres +20 %, buste large |
| élancée | Isaure, Oriane (et le Danseur) | membres −28 %, buste étroit |
| sèche | Álvaro | membres −20 % |
| ramassée | Corvin | petite tête portée en avant |
| voûtée | Barthélemy (et le Vieux Maître) | tête plus grosse, nettement portée en avant |

Réglage : Options → Lumière → « Carrure des héros ».

## Personnages peints (`src/lumen.js`)
- Le moteur repeint les personnages à chaque image : chaque pixel prend la couleur la plus uniforme de son voisinage (filtre de Kuwahara), comme une touche de gouache.
- Des coups de brosse orientés modulent ensuite la matière.
- Les petits détails dessinés (piqûres, galons fins) se fondent en aplats, et les bords deviennent irréguliers.
- Le filtre ne s'applique qu'aux personnages, en détail complet. Réglage : Options → Lumière → « Personnages peints ».

Choix technique : au lieu de repeindre hors du jeu des centaines d'images par héros (page bien plus lourde, risque de décaler les touches), la peinture est faite en direct par la carte graphique, sur le dessin exact du personnage. Aucune image n'est ajoutée.

## Tests
- `tests/lumen.js` : 17 vérifications, dont la nouvelle « carrure » : pointe de lame identique, Mathurin plus massif, Isaure plus fine, filtre actif.
- `tests/lheroes.js` : planche des huit héros, en silhouette et en couleur.
- Toute la suite repasse ; le test de vitesse du rendu 2D (`sprint11`) a échoué une fois sous charge et passe en séquentiel.

## Pas fait dans cette version
- Visages plus lisibles en plan rapproché.
- Particules éclairées.
- Reprise des quatre décors de la 7.0.
- Habillage de l'interface.

## Limite
Le coût réel du filtre sur iPhone n'est pas mesuré : sur la carte graphique logicielle des tests, la différence est dans le bruit.
