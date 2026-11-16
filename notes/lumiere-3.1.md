# Édition Lumière 3.1 · décors, visages, particules, boutons

La suite de la 3.0 : les points de la piste « code » qui restaient. Aucune règle ne change.

## Les quatre lieux de la 7.0, repris (`src/venues5_plus.js`, versions HD refaites)
La peinture d'origine est gardée ; on peint par-dessus ce qui lui manquait.
- **Grande Galerie** : médaillons peints au plafond, deux lustres de cristal, bannières fleurdelisées, tapis royal jusqu'au dais, courtisans au bord de la piste.
- **Châtelet** : pierre qui suinte, soupirail et rai de lumière froide, porte de fer cloutée, fers scellés au mur, banc, seau, bottes de paille.
- **Pré-aux-Clercs** : la Grande Galerie du Louvre et un pavillon au loin, reflets dorés de l'aube sur la Seine, barques, peupliers, brume en couches, oiseaux, rosée.
- **Toits de Notre-Dame** : façade ouest avec la galerie des rois et la grande rose éclairée de l'intérieur, nuages d'orage éclairés par en dessous, toits de Paris avec fenêtres allumées, gargouille.

## Visages (`src/lumen3.js`, Face3)
- Cils francs, iris cerclé, ombre de l'orbite, lèvres d'un ton plus chaud.
- Avec « Personnages peints », ces traits passent au-dessus de la peinture, pour ne pas être fondus par le pinceau.

## Particules (Parts)
- Des braises montent des flambeaux, des cierges et des âtres, avec leur couleur.
- Des poussières dansent dans les grandes lumières (fenêtres, soleil) et ne brillent que là où la lumière les touche.
- Aucune en « mouvements réduits ». Réglage : Options → Lumière → « Braises et poussières ».

## Boutons tactiles
Acier, cuir sombre et filet d'or, au lieu de cercles gris. Doré quand on appuie.

## Correction d'un test
Le test « au premier sang » (`tests/sprint41.js`) échouait parfois, aussi dans le jeu principal. Son adversaire recevait au hasard une cape, qui réduit les dégâts de 10 %. L'adversaire du test est maintenant sans main gauche et le lieu est fixé. Le jeu, lui, n'était pas en cause.

## Tests
- `tests/lumen.js` : 18 vérifications (nouvelle : braises, mouvements réduits, visages, décors HD).
- Toute la suite repasse. `sprint33` a échoué une fois au chargement de la page sous charge et passe en séquentiel.

## Pas fait
L'habillage complet de l'interface (barres de vie, bandeaux) : seuls les boutons tactiles sont repris.
