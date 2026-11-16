# Les Lames de l'Ombre · Édition Lumière — version installable 7.0.0-L6.0

Même jeu que la version 7.0.0 (mêmes mécaniques, même contenu), avec le moteur de rendu « Lumen » : lumière par pixel, relief, ombres portées, reflets.
Elle vit à côté du jeu principal, dans son propre dépôt, pour que les deux ne se gênent pas.

Mettre cette édition en ligne (environ 5 minutes, sans ligne de commande) :

1. Sur https://github.com : « New repository », nom `lames-lumiere`, **Public**, « Create repository ». Ne la mettez pas dans un sous-dossier du dépôt `lames-de-l-ombre` : le jeu principal s'afficherait à sa place.
2. Dans ce dépôt : « uploading an existing file », glissez **tout le contenu de ce dossier** (index.html, manifest.webmanifest, sw.js, version.json, les dossiers icons et decors, et le fichier .nojekyll), puis « Commit changes ».
3. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save. Après 1 à 2 minutes : `https://<votre-nom>.github.io/lames-lumiere/`.
4. Sur l'iPhone, ouvrez cette adresse dans **Safari** → Partager → **Sur l'écran d'accueil**. Vous aurez deux icônes : le jeu principal et l'Édition Lumière.
5. La sauvegarde ne passe pas toute seule d'une icône à l'autre sur iPhone : dans le jeu principal, Options → Sauvegarde → Exporter → Copier le code ; dans l'Édition Lumière, Options → Sauvegarde → collez → Importer.

Si l'iPhone ralentit, le moteur s'allège tout seul, puis revient au rendu de la 7.0.0 (Options → Lumière pour le rallumer).
