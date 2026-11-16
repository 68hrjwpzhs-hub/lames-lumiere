# Édition Lumière 1.0 (jeu 7.0.0)

Une version à part des Lames de l'Ombre : **mêmes mécaniques, même contenu que la 7.0.0**, avec un nouveau moteur de rendu, « Lumen » (`src/lumen.js`). Le jeu principal n'est pas modifié.

## Ce que fait le moteur
Le monde n'est plus dessiné sur un seul canevas. Il est dessiné en trois calques (le décor, les personnages, les effets), que la carte graphique assemble avec un calcul de lumière par pixel.

- **Décor en relief** : le décor a une géométrie (un mur, un sol qui fuit vers le fond) et un relief tiré de sa peinture. Les briques, les boiseries et les pavés accrochent la lumière.
- **Personnages en volume** : la silhouette est « gonflée », la lumière tourne autour du corps. Liseré à contre-jour, reflets sur l'acier des lames et des gardes.
- **Sources ponctuelles** : chaque flambeau, cierge, âtre ou lanterne éclaire autour de lui et vacille. L'étincelle d'une parade éclaire toute la scène pendant un tiers de seconde. L'éclair de l'orage aussi. La fureur d'un boss rougeoie.
- **Ombres portées** : les duellistes projettent leur ombre sur le mur et sur le sol. Elle s'allonge et tourne selon la source. Ombre de contact sous les pieds.
- **Brume éclairée** autour des flammes, traversée par les silhouettes.
- **Reflets** sur les sols cirés (marbre du palais, parquet de la Galerie, dallage de Notre-Dame) et sur les pavés mouillés.
- **Optique** : halo des hautes lumières, air chaud qui tremble au-dessus des flammes, franges colorées au bord de l'image, vignettage, grain, étalonnage par lieu et par ville.
- Les 18 lieux ont leurs réglages (`LUMEN_V`) : intérieur ou plein air, lumière de face ou contre-jour (toits de Paris, navire, Arsenal, Pré-aux-Clercs), brume, sol réfléchissant.

## Replis
- Options → **Lumière** : le moteur s'allume et se coupe ; « Détail : complet / allégé » (calques à 75 %, sans reflets).
- Si l'image dépasse 26 ms en moyenne pendant 8 secondes de combat, le moteur s'allège tout seul. Si cela ne suffit pas, il se coupe et le jeu revient au rendu de la 7.0.0 (WebGL simple, puis 2D). Un message le dit.
- Sans WebGL, ou si l'appareil interrompt la carte graphique : rendu de la 7.0.0.

## Ce qui change dans le code du jeu
- `src/game.js` (`render`) : le dessin du monde passe d'un calque à l'autre quand Lumen est en marche ; rien ne change sinon.
- `src/paint.js`, `src/v6_lumiere.js` : les ombres plates, reflets et liserés du rendu 2D sont laissés au moteur.
- `src/v4_meta.js` : le mode photo capture l'image éclairée.
- `tools/pwa_build.py` : nom, icône dorée, cache hors ligne séparé (`ldl-`).
- Aucune règle de combat, aucune donnée de sauvegarde n'est touchée.

## Mise en ligne
Dans un dépôt à part (`lames-lumiere`), pas dans un sous-dossier du jeu principal : le service hors ligne du jeu principal afficherait le jeu principal à sa place. Voir `LISEZMOI.md`.

## Tests
- `tests/lumen.js` (11 vérifications) : calques, sources, étincelle, ombre portée mesurée sur le mur, éclair, détail allégé, garde-fou, mode photo, options.
- Toute la suite de la 7.0.0 repasse avec le moteur allumé.
- Captures : `tests/lshots.js` (18 lieux), `tests/lflash.js` (parade, pluie), `tests/lmisc.js` (accueil, histoire, fin de manche).

## Limites connues
- Testé sur un iPhone 13 simulé, avec une carte graphique logicielle : la vitesse réelle sur iPhone n'est pas mesurée.
- Les ombres portées viennent de la silhouette entière : la lame et la cape comptent comme le corps.
- Les personnages ne se font pas d'ombre l'un sur l'autre.
