# Édition Lumière 4.5 · « Le reste »

Cette version reprend les points laissés de côté en 4.0. Les règles du combat ne changent toujours pas. Nouveau fichier : `src/lumen5.js` ; le jeu de jambes et la chute souple sont dans `src/lumen4.js` (Anim4) ; les ombres et les particules passent par `src/lumen.js`.

## Ombre d'un duelliste sur l'autre
- Chaque corps est résumé en 7 capsules : buste, tête, bras (2), jambes (3). Le shader les reçoit à chaque image.
- Pour chaque pixel d'un personnage, on suit le rayon vers la lumière principale et vers les deux sources proches les plus fortes (flambeaux, étincelle de parade). S'il traverse le corps de l'autre duelliste, ce pixel s'assombrit.
- Vérifié : ça assombrit seulement, jamais ça n'éclaire.
- L'effet reste discret, parce que les duellistes se font face sur le même plan.
- Option « Ombres entre duellistes ». Coupé en détail allégé.

## Particules par la carte graphique
- Les braises et les poussières dans la lumière sont dessinées en un seul appel à la carte graphique (points additifs), et non plus en 2D.
- Il y en a donc trois fois plus : 300 au lieu de 90.
- Nouvelles gerbes d'étincelles :
  - 46 sur une parade ;
  - 22 sur une touche ;
  - 18 sur des lames croisées ou un blocage.
  Elles retombent et rebondissent sur le sol.
- Option « Particules par la carte graphique ». Coupé en « mouvements réduits ».

## Mouvement
- Jeu de jambes :
  - le buste suit la marche, en avant comme en arrière ;
  - il se lance dans le pas rapide ;
  - les hanches passent d'un appui à l'autre ;
  - le corps fléchit quand un pied se repose.
- Chute souple (petite poupée de chiffon) à la mise hors de combat :
  - le corps suit la chute prévue par le jeu ;
  - les bras, la lame et la tête deviennent des chaînes souples accrochées au corps (gravité, longueurs fixes, arrêt au sol) ;
  - on en tire des angles ajoutés à la pose : le dessin reste celui des personnages, sans aucun effet sur les règles.
  - Ce n'est pas une poupée de chiffon complète : le buste et les jambes suivent toujours l'animation du jeu.

## Conseils par-dessus le combat
- Une bulle apparaît au-dessus du duelliste concerné pendant les 8 premiers duels :
  - « Il arme son coup : maintenez GARDE pour parer » ;
  - « Parade ! Frappez tout de suite : RIPOSTE » ;
  - coup paré ;
  - essoufflement ;
  - « avancez » ;
  - la feinte, après trois coups parés.
- Chaque conseil apparaît au plus 3 fois et disparaît dès que le geste est fait.
- Traduits en anglais. Option « Conseils en combat ».

## Commandes tactiles qui s'adaptent
- Le jeu note où le pouce appuie vraiment sur chaque bouton.
- Après 12 appuis, le bouton glisse vers cet endroit (14 px au plus).
- Il grossit un peu (jusqu'à +12 %) si le pouce tombe souvent près du bord.
- Après 30 appuis, la petite aide (« maintenir : lourde »…) s'efface.
- Réglages retenus sur l'appareil. Options « Commandes qui s'adaptent » et « Replacer les boutons » ; ce dernier remet aussi les conseils à zéro.

## Toujours pas fait
- Personnages entièrement dessinés par la carte graphique : il faudrait réécrire tout le dessin des personnages (des milliers de lignes de tracé 2D) en maillages. C'est la vraie limite du code maison actuel, et c'est un chantier en soi.
- Parallaxe du ciel dans le shader : pas fait.
- Mesure sur un vrai iPhone : toujours en attente du compteur d'images (Options → Lumière → Compteur d'images → Copier la mesure).

## Tests
- `tests/lumen.js` : 24 vérifications, tout est vert.
- Suite complète verte. `sprint34` a dépassé son délai une fois sous charge ; il passe en séquentiel.
- Captures : `tests/l5shots.js`.
