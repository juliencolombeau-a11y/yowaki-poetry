# Yowaki poetry
## objectif
L'objectif est de réaliser un site internet, responsive, pour gérer des poèmes créés par l'auteur Yowaki.
Il existe déjà une grande quantité de textes écrits donc il faudra les analyser et classifier pour les afficher.
En plus du titre et du texte, un poème devra avoir un certain nombre de caractéristiques classiques sur la versification, le thème principal... mais aussi des caractéristiques comme la collection (s'il en existe une) ou une image associée s'il en existe une.

## interface
- Une page d'accueil avec titre, image et texte d'accueil. Une barre de recherche et des filtres.
- Une liste affichant les poèmes par card (titre, caractéristiques, vignette de l'image)
- un affichage des poèmes complets avec le titre, la collection (si existant), les caractéristiques, l'image et le texte intégral. Les caractéristiques pourraient être cliquables pour accéder aux autres poèmes (par exemple la collection jeunesse, je clique et j'accède à la liste des poèmes de la collection)
- un mode d'administration pour ajouter/modifier/supprimer des poèmes et leurs images. (un seul admin)

## technique
j'ai conçu une application pour gérer du matériel avec des technologies gratuites, tu trouveras tout cela dans guide-architecture-deploiement.md
Pour résumer c'est une application nuxt avec Vuetify, déployée par github,nuxthub et cloudlare. Les images seraient hébergées sur cloudinary.
Le fichier .env contient des clés pour cloudinary notamment.

## existant
- les poèmes sont dans un google docs, une copie ancienne est dans le fichier poemes.md
- tous les autres fichiers markdown sont soit des aides créées par NotebookLM pour l'analyse de ces poèmes soit des docuements que j'ai rédigés pour la classification des poèmes.
- pour l'instant il n'y a aucune image associée aux poèmes mais elles existent et j'aimerais pouvoir les importer facilement (par modification d'une fiche)
- certains poèmes ont une image sous forme de pdf, il faut que tu prennes ça en compte si possible dans l'importation mais aussi dans les différents affichages.
- certains textes sont des nouvelles et pas des poèmes, ils ont un titre, une image mais un corps de texte sous forme de PDF, il faudra réfléchir à comment les intégrer à tout ça dans un second temps.