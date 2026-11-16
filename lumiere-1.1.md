# Édition Lumière 1.1 · personnages et mouvement secondaire

Le dessin des personnages s'enrichit (`src/figure_plus.js`). Les articulations et la pointe de la lame ne bougent pas : les coups, les portées et les parades restent ceux de la 7.0.0 (vérifié par un test).

## Détail des personnages
- **Mains** : gant à crispin, quatre doigts refermés sur la poignée, phalanges, pouce, coutures.
- **Poignets et col** : dentelle festonnée, fraise à deux rangs de godets.
- **Pourpoint** : crevés qui laissent voir la doublure (bras et poitrine), reflet des boutons, baudrier avec boucle et piqûre.
- **Jupe** : plis profonds, de la taille à l'ourlet.
- **Bottes** : talon, reflet du cuir, éperon à molette, revers piqué.
- **Rapière** : gouttière de la lame, coquille (pleine pour l'épée de cour, ajourée sinon, absente sur le sabre), fusée filigranée, pommeau godronné.

## Mouvement secondaire (ressorts)
- Le **fourreau** pend au baudrier et bat contre la jambe à chaque pas, fente ou recul.
- L'**ourlet de la jupe** suit le corps avec retard.
- Le **gland** du baudrier danse.

## Tests
- `tests/lumen.js` passe à 12 vérifications (mêmes articulations, dessin enrichi, fourreau qui bat).
- `tests/lbench.js` : gros plans des personnages dans le jeu.
- Toute la suite repasse.

## Pas fait
- Les poses de combat ne sont pas retouchées : elles décident des touches, y toucher changerait les mécaniques.
- Visages et décors : inchangés dans cette version.
