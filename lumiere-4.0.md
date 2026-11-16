# Édition Lumière 4.0 · « La Limite »

Objectif : pousser le code maison aussi loin que possible sur le mouvement, la fluidité, l'image, l'interface et le son, sans toucher aux règles du combat de la 7.0.0. Nouveau fichier : `src/lumen4.js` ; moteur : `src/lumen.js`.

## 1. Mesurer (Perf4)
- Compteur intégré : images par seconde, temps d'image moyen et pire, coût du moteur Lumière, définition des calques.
- Options → Lumière → « Compteur d'images » (coupé par défaut).
- « Copier la mesure » copie un rapport texte (appareil, écran, moyenne et pire seconde en combat, détail par seconde) à coller dans un message.
- But : obtenir enfin des chiffres sur un vrai iPhone. Jusqu'ici, tout a été mesuré sur un iPhone simulé.

## 2. L'animation séparée des règles (Anim4)
- Le jeu calcule toujours les touches sur sa propre pose, qui ne change pas.
- On dessine une pose « visuelle » qui en dérive, avec des ressorts par articulation :
  - élan et dépassement : le bras traîne derrière le mouvement, puis le dépasse et revient ;
  - anticipation : pendant la préparation d'un coup, le buste et le bras partent en arrière, le corps se tasse (jusqu'à 6° mesurés sur une fente) ;
  - le corps avant le bras : le buste mène, le bras suit avec du retard ;
  - le retour en garde après le coup dépasse un peu, puis se pose.
- Verrouillage : pendant l'exécution d'un coup, la pose dessinée rejoint exactement la pose de jeu (écart mesuré : 0). Ce qu'on voit toucher est ce qui touche.
- Réactions selon la zone touchée : au bras, le bras est rejeté ; à la jambe, le corps plie ; au torse, le buste et la tête partent en arrière.
- Parade : la lame de l'attaquant est déviée et glisse ; les deux lames vibrent.
- Lame qui plie : sur une touche ou une parade, la lame se courbe et vibre environ 0,15 s ; la garde se dessine comme avant.
- Traînées : sur un coup rapide, un éventail lumineux translucide suit la lame.
- Option : « Mouvements enrichis » (active par défaut).
- Vérifié :
  - dessiner la pose enrichie ne change rien à ce que la simulation lit (positions, articulations, pointe, souffle, pieds), sur 400 pas de combat ;
  - la main gauche (dague, cape) reste à sa place.

## 3. Fluidité
- Définition auto (Res4) : si les images dépassent ~19,5 ms en moyenne, la définition des calques baisse par paliers de 8 %, jusqu'à 60 % au minimum. Elle remonte quand il y a de la marge. Option « Définition auto ».
- Essayé puis retiré : n'envoyer à la carte graphique que la zone des personnages. Mesure faite, le cadrage de cinéma fait occuper aux duellistes plus de 80 % de l'image dans presque tous les cas, donc il n'y avait rien à gagner. Le code a été retiré pour ne pas ajouter de risque.

## 4. Image
- Rayons de lumière (rayons volumétriques en espace écran) : la lumière des fenêtres hautes, du soleil ou de la lune s'étire en halo directionnel.
  - Réglés lieu par lieu, dans 11 lieux : Notre-Dame, la salle, le palais, la galerie, la plaza, le pré, les toits, le canal, l'arsenal, l'académie, la loggia.
  - Option « Rayons de lumière ».
  - En détail allégé, ils sont coupés.

## 5. Interface et HUD
- Sceau de cire qui tombe et rebondit au centre de l'écran à chaque manche gagnée.
- Buée du souffle devant la bouche d'un duelliste essoufflé.
- Charte unique (cartes, boutons dorés, boutons secondaires, options) et transition douce à l'ouverture de chaque écran (coupée en « mouvements réduits »).

## 6. Son
- Sons spatialisés : chaque son de combat part à gauche ou à droite selon l'endroit du duel à l'écran.
- Pas selon le sol : plancher (salle, académie, auberge, navire, galerie), marbre (palais, Notre-Dame), herbe (pré), plomb (toits), pavé ailleurs ; clapotis en plus sous la pluie.
- La musique qui monte avec la tension du duel (vie basse, dernière manche) existait déjà : la Tarentelle en couches de la 7.0.

## Pas fait (limites honnêtes)
- Personnages entièrement dessinés par la carte graphique : non. Ils restent dessinés en 2D puis éclairés par Lumen.
- Ombres d'un duelliste sur l'autre : non.
- Jeu de jambes plus riche : non. Les pieds restent ceux de la 7.0.
- Petit ragdoll à la mise hors de combat : non.
- Didacticiel par-dessus le combat, commandes tactiles adaptatives : non.
- Particules par la carte graphique, parallaxe du ciel dans le shader : non.
- Rien n'a été mesuré sur un vrai iPhone : c'est le rôle du compteur. Une mesure envoyée permettra de régler la définition auto.

## Tests
- `tests/lumen.js` : 23 vérifications. Ajouts :
  - anticipation et verrouillage ;
  - le dessin ne modifie pas la simulation ;
  - définition auto, rayons, compteur exportable, sceau, buée, pas selon le sol, options.
- Toute la suite passe (suite 50/50, histoire, héros, sprints 9 à 51).
- Captures : `tests/l4shots.js`.
