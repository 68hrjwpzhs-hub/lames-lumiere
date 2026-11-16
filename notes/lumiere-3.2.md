# Édition Lumière 3.2 · la barre de vie en fourreau

## Barre de vie (`src/lumen3.js`, Hud3 ; branchée dans `src/v5_ui.js`)
- La vie est une lame dans son fourreau.
  - Fourreau de cuir sombre cerclé d'acier, avec un liseré clair en haut.
  - Le sang est d'un rouge profond et vernissé ; sous 30 de vie, il devient plus vif et bat comme un pouls.
  - Une garde de rapière dorée, quillons et coquille, ferme le côté du nom ; une bouterolle d'acier ferme l'autre bout.
- La traînée de parchemin montre ce que la dernière touche a coûté.
- Des encoches marquent chaque quart de vie.
- Deux fois plus haute que l'ancien trait fin : on la lit d'un coup d'œil.
- Réglage : Options → Lumière → « Barres de vie en fourreau ». Si on le coupe, on retrouve la barre de la 5.0.

## Correction (aussi dans le jeu principal)
- Bug : une rapière arrachée par un désarmement était posée au sol, mais la physique de chute des rapières la reprenait sans vitesse de départ. Ses coordonnées devenaient non finies, et le dessin de la lame levait une erreur à chaque image tant qu'elle restait au sol.
- Il existait depuis la 6.0. C'était l'erreur « valeur non finie » vue par intermittence dans les tests.
- Corrigé dans `src/v6_combat.js` : la rapière est posée à plat et reste au repos.
- La correction est dans les sources du jeu principal, mais pas encore publiée sur son site.

## Tests
- `tests/lumen.js` : 20 vérifications (barre de vie, rapière désarmée qui reste posée).
- `tests/lhud.js` : capture de la barre.
- Toute la suite repasse ; le test de vitesse `sprint11` a échoué une fois sous charge et passe en séquentiel.
