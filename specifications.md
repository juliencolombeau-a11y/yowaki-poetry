# Spécifications fonctionnelles et techniques — Yowaki Poetry

## État de référence

La V1 est déployée sur Cloudflare Workers à l'adresse :
`https://yowaki-poetry.yboawhafkuil.workers.dev`.

Elle utilise une base Cloudflare D1 contenant **494 poèmes**, le binding `DB`, des sessions `nuxt-auth-utils` et Cloudinary pour les médias. Le compte administrateur initial a été créé et le secret temporaire de bootstrap a été supprimé après déploiement.

## 1. Objet du projet

Yowaki Poetry est un site web responsive permettant de consulter et d'administrer le recueil de poèmes de Yowaki. Le projet transforme un corpus de 494 textes détectés dans `poemes.md` - dont une partie des métadonnées est décrite dans un export CSV - en un catalogue consultable, filtrable et enrichissable.

Le site doit rester utilisable sans compte pour la consultation publique. Un espace d'administration protégé doit permettre à un administrateur unique de gérer les fiches, les classifications et les médias associés.

Les nouvelles et autres textes longs, dont le contenu source est un PDF, sont hors du périmètre initial du catalogue de poèmes. Le modèle doit toutefois permettre leur intégration ultérieure sans refonte majeure.

## 2. Périmètre

### 2.1 Version initiale

- page d'accueil avec identité du recueil, texte d'introduction et accès immédiat à la recherche ;
- catalogue public sous forme de cartes responsive, avec vignette image lorsqu'elle existe ;
- recherche textuelle ;
- filtres par collection, forme, métrique, rimes, langue, thème, calligramme et type de contenu ;
- pagination ou chargement par pages ;
- fiche détaillée d'un poème ;
- navigation depuis une caractéristique vers les autres poèmes correspondants ;
- affichage du texte intégral en conservant les retours à la ligne et les strophes ;
- affichage d'une image associée lorsqu'elle existe ;
- prise en charge d'un PDF associé comme média téléchargeable et, si possible, consultable dans le navigateur ;
- connexion d'un administrateur ;
- création, modification et suppression d'une fiche ;
- import initial contrôlé du CSV et du corpus Markdown ;
- import ou remplacement d'une image depuis l'interface d'administration ;
- validations serveur, journalisation minimale et gestion des erreurs.

### 2.2 Hors périmètre initial

- comptes publics, commentaires et notation ;
- édition collaborative ou workflow de validation à plusieurs niveaux ;
- analyse automatique parfaite de la métrique, des rimes ou des thèmes ;
- génération automatique d'illustrations ;
- conversion systématique des PDF en texte éditable ;
- catalogue public des nouvelles avant validation du modèle éditorial ;
- multilinguisme de l'interface.

## 3. Utilisateurs et droits

| Profil | Consultation publique | Connexion | Création/modification/suppression | Gestion du compte |
| --- | --- | --- | --- | --- |
| Visiteur | Oui | Non | Non | Non |
| Administrateur | Oui | Oui | Oui | Oui, au minimum son accès |

Même si l'interface masque les actions d'administration, toutes les routes d'écriture doivent vérifier la session et le rôle côté serveur. Il ne doit y avoir qu'un seul compte administrateur en production dans la première version.

## 4. Parcours fonctionnels

### 4.1 Accueil et catalogue

L'accueil doit présenter :

- le nom du recueil et son identité visuelle ;
- un texte d'accueil configurable ou maintenu dans le code selon la décision retenue ;
- un champ de recherche ;
- des filtres accessibles sur grand écran et regroupés dans un panneau sur mobile ;
- le nombre de résultats ;
- des cartes contenant le titre, la collection en sous-titre lorsqu'elle existe, les tags de forme et métrique, une vignette conditionnelle et un lien vers la fiche.

La recherche doit porter au minimum sur le titre, le texte intégral, la série, la langue et les thèmes. Les filtres sont combinables. Toute modification de recherche ou de filtre remet la pagination à la première page.

### 4.2 Fiche d'un poème

La fiche doit afficher :

- le titre ;
- la série ou collection, lorsqu'elle existe ;
- les caractéristiques de forme, métrique, strophe et rimes ;
- la langue ;
- les thèmes ;
- l'indication de calligramme ;
- l'image associée, avec un état explicite lorsqu'elle est absente ;
- le texte intégral avec une mise en page lisible ;
- le PDF associé, le cas échéant, avec téléchargement et affichage intégré si le navigateur le permet ;
- des liens vers les résultats partageant une caractéristique.

Les URL de fiches doivent être stables et partageables. L'identifiant technique peut être utilisé dans un premier temps ; un slug pourra être ajouté ensuite si le besoin SEO ou éditorial le justifie.

### 4.3 Administration

L'administrateur doit pouvoir :

- se connecter et se déconnecter ;
- lister les poèmes avec recherche et filtres ;
- créer une fiche ;
- modifier tous les champs éditoriaux ;
- téléverser, remplacer ou retirer une image ;
- téléverser, remplacer ou retirer un PDF ;
- supprimer une fiche après confirmation explicite ;
- créer une nouvelle valeur de référence lorsqu'une classification n'existe pas encore ;
- voir les erreurs de validation de façon compréhensible.
- rechercher dans le titre et le texte intégral ;
- parcourir les résultats par pages de 50 lignes ;
- saisir une valeur existante ou une nouvelle valeur pour les champs éditoriaux de référence.

La suppression d'un poème ne doit pas supprimer silencieusement un média partagé. La stratégie de nettoyage Cloudinary doit être définie et testée avant d'être automatisée.

## 5. Données métier

### 5.1 Entité `poems`

Champs recommandés :

| Champ | Type logique | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | entier | Oui | Clé primaire auto-incrémentée |
| `legacyId` | entier | Non | Identifiant historique du CSV, unique lorsqu'il existe |
| `documentOrder` | entier | Oui | Identifiant applicatif initial dans l'ordre de `poemes.md` |
| `title` | texte | Oui | Titre affiché |
| `body` | texte long | Oui | Texte intégral, retours à la ligne conservés |
| `excerpt` | texte | Non | Extrait éditorial ou généré à l'import |
| `collection` | texte/référence | Non | Correspond à la colonne `Série`, une seule collection par texte |
| `form` | référence | Non | Quatrains, sonnet marotique, calligramme, etc. |
| `stanza` | référence | Non | Distiques, tercets, quatrains, etc. |
| `meter` | référence | Non | Octosyllabe, alexandrin, non standard, etc. |
| `rhymeScheme` | référence | Non | Plates, croisées, embrassées, redoublées |
| `languages` | références multiples | Oui par défaut | Français, anglais, occitan, bilingue, etc. |
| `isCalligram` | booléen | Oui | Valeur issue du corpus, modifiable |
| `contentType` | référence | Oui | `poem` en V1, extensible à `news` ou `short-story` |
| `date` | date | Non | Date de création, vide tant qu'elle n'est pas connue |
| `notes` | texte long | Non | Notes éditoriales affichées publiquement et modifiables par l'administrateur |
| `createdAt` | date | Oui | Audit |
| `updatedAt` | date | Oui | Audit |

Les termes de classification doivent être stockés de façon cohérente et normalisée. Une table de références ou des tables de liaison sont préférables à des chaînes dupliquées si les thèmes deviennent nombreux ou multiples.

### 5.2 Thèmes et relations

Un poème peut avoir plusieurs thèmes et plusieurs langues. Prévoir des relations `poem_themes` et `poem_languages`, plutôt que des champs texte uniques. La collection, la forme et la métrique restent mono-valuées en V1 ; un calligramme peut toutefois conserver une métrique.

### 5.3 Entité `media`

Prévoir une table séparée pour les médias :

- `id` ;
- `poemId` ;
- `kind` : `image` ou `pdf` ;
- `cloudinaryPublicId` ;
- `cloudinaryUrl` ;
- `mimeType` ;
- `originalFilename` ;
- `sizeBytes` ;
- `createdAt` et `updatedAt`.

Cette séparation évite de mélanger les métadonnées du poème avec les détails de stockage et permet d'ajouter plusieurs médias plus tard. En V1, l'interface peut limiter à une image principale et un PDF principal par fiche.

### 5.4 Import initial

L'import doit être déterministe, relançable et traçable :

1. lire et valider `poemes.md` comme source complète ;
2. créer `documentOrder` dans l'ordre du Markdown et conserver `legacyId` lorsqu'il existe ;
3. rapprocher les métadonnées CSV des textes du Markdown ;
4. convertir les valeurs vides en `null` ;
5. normaliser les libellés connus sans écraser les informations ambiguës ;
6. produire un rapport des textes importés, mis à jour, ignorés et à vérifier ;
7. ne jamais déduire silencieusement une information éditoriale incertaine et laisser la date vide lorsqu'elle est inconnue.

Les fichiers Markdown d'analyse servent de sources d'aide à la classification, mais ne doivent pas être considérés comme vérité automatique sans contrôle. Les cas ambigus doivent être signalés dans le rapport d'import ou dans l'interface d'administration.

L'import initial réalisé contient 494 poèmes. Le fichier `poemes.md` reste la source de référence pour le titre, le texte et l'ordre documentaire ; le CSV complète uniquement les métadonnées lorsqu'une correspondance fiable existe.

## 6. Médias et PDF

Cloudinary reste le stockage recommandé pour les images, dans un dossier logique `poetry`, conformément au projet de référence. Les secrets Cloudinary restent exclusivement côté serveur.

Pour les PDF :

- accepter uniquement les types MIME et tailles autorisés ; limiter les images à 10 Mo ;
- stocker le fichier comme ressource brute ou selon la fonctionnalité Cloudinary validée lors du prototype ;
- ne jamais supposer qu'un PDF est une image ;
- proposer la lecture intégrée par défaut et un téléchargement public ;
- tester l'affichage intégré sur les navigateurs ciblés ;
- prévoir une vignette ou un état de remplacement si le navigateur ne peut pas afficher le document.

Le formulaire doit valider le type et la taille avant l'envoi, puis la route serveur doit refaire toutes les vérifications. Une image ou un PDF absent ne doit pas empêcher la consultation de la fiche.

## 7. Architecture technique cible

Reprendre le socle de Juno-Matos :

- Nuxt 4 pour le rendu, les pages et les routes serveur ;
- Vue 3 et Vuetify pour l'interface responsive ;
- NuxtHub DB avec SQLite en local et Cloudflare D1 en production ;
- Drizzle ORM et migrations SQL versionnées ;
- `nuxt-auth-utils` pour les sessions chiffrées ;
- Cloudinary pour les images dans `poetry` et l'étude du stockage PDF ;
- GitHub pour le code et le déclenchement du déploiement ;
- Cloudflare Workers/Pages et Wrangler pour l'exécution et la mise en production ;
- npm et `package-lock.json` pour des installations reproductibles.

Structure recommandée :

```text
app/
  components/
  layouts/
  pages/
    index.vue
    poems/[id].vue
    login.vue
    admin/poems/
server/
  api/
    poems/
    auth/
    media/
  db/
    schema.ts
    migrations/
  utils/
scripts/
shared/
```

Les pages et composants ne sont jamais une frontière de sécurité. Les routes `server/api` valident les entrées, vérifient la session et effectuent les écritures.

## 8. API minimale

Routes publiques :

- `GET /api/poems` : recherche, filtres, tri et pagination ;
- `GET /api/poems/:id` : détail public ;
- `GET /api/references` : valeurs disponibles pour les filtres.

Routes protégées :

- `POST /api/auth/login` ;
- `POST /api/auth/logout` ;
- `GET /api/auth/session` ;
- `POST /api/auth/bootstrap` durant l'initialisation uniquement ;
- `POST /api/poems` ;
- `PUT /api/poems/:id` ;
- `DELETE /api/poems/:id` ;
- `POST /api/media/image` ;
- `POST /api/media/pdf` ;
- routes éventuelles de gestion des références.

Toutes les routes d'écriture doivent utiliser une validation serveur stricte, limiter les tailles et renvoyer des statuts HTTP cohérents.

## 9. Sécurité, qualité et accessibilité

- ne jamais commiter `.env`, une base locale, un export de données ou un secret ;
- conserver les secrets dans la configuration locale et Cloudflare, jamais dans `runtimeConfig.public` ;
- utiliser un secret de session aléatoire d'au moins 32 caractères ;
- utiliser un secret temporaire pour le bootstrap, puis le supprimer ;
- protéger directement les endpoints, pas seulement les boutons ;
- limiter les uploads et contrôler MIME, extension et taille ;
- éviter les injections HTML : le texte des poèmes doit être rendu comme texte, sauf besoin explicitement validé ;
- ajouter des textes alternatifs d'image ;
- rendre les filtres utilisables au clavier et sur mobile ;
- vérifier contrastes, focus, titres hiérarchisés et messages d'erreur ;
- tester visiteur, administrateur, session expirée et fichier invalide.

## 10. Déploiement et exploitation

En local :

```powershell
npm install
npm run dev
npx nuxt typecheck
npm run build
```

En production :

1. créer la base D1 ;
2. configurer `CLOUDFLARE_D1_DATABASE_ID` et les secrets dans l'environnement Production ;
3. appliquer les migrations ;
4. construire et inspecter `.output/server/wrangler.json` ;
5. exécuter `npx wrangler deploy --dry-run` ;
6. déployer ;
7. importer les données initiales après migration ;
8. créer le compte administrateur ;
9. supprimer le secret de bootstrap et redéployer ;
10. tester les parcours publics, administratifs, médias et mobiles.

La configuration de production actuelle déclare un unique binding D1 `DB`, utilisé par NuxtHub. Ne jamais ajouter un second binding vers la même base. Un build réussi ne prouve pas que les migrations, secrets et données de production sont corrects.

Après le premier bootstrap, `NUXT_BOOTSTRAP_SECRET` doit être supprimé de Cloudflare et l'application redéployée. Toute évolution de schéma doit ajouter une nouvelle migration versionnée, puis être appliquée à D1 avant le déploiement du code qui l'utilise.

Les exports `.data/` servent uniquement aux opérations locales ou d'import ponctuel. Ils restent exclus de GitHub et ne doivent pas être servis par l'application.

## 11. Critères d'acceptation de la V1

- les données importées sont comptées et rapprochées du corpus source ;
- un visiteur peut rechercher, filtrer, ouvrir et partager une fiche ;
- le texte conserve sa structure de strophes et ses retours à la ligne ;
- les filtres affichent des valeurs cohérentes avec les données ;
- l'administrateur peut créer, modifier, supprimer et enrichir une fiche ;
- une image peut être ajoutée ou remplacée sans exposer les secrets ;
- un PDF valide peut être associé, lu intégré et téléchargé ;
- les écritures non authentifiées sont refusées ;
- `npx nuxt typecheck`, le build et le dry-run Wrangler réussissent ;
- les migrations locales et D1 sont identiques et appliquées dans l'ordre ;
- aucun secret ni export de données n'est présent dans le dépôt ;
- les parcours principaux fonctionnent sur mobile et au clavier.

## 12. Règles d'évolution

- préserver `contentType = poem` pour les fiches existantes ;
- ajouter les nouvelles comme un type de contenu distinct après validation du modèle éditorial ;
- ne pas rendre obligatoires pour les poèmes les champs spécifiques aux nouvelles ;
- créer une migration SQL pour chaque évolution de schéma ;
- préserver les anciennes URL et le `documentOrder` des poèmes ;
- tester localement, construire, effectuer un dry-run Wrangler et vérifier D1 avant chaque mise en production ;
- conserver les valeurs éditoriales saisies librement, même lorsqu'elles ne figurent pas encore dans les listes de référence ;
- documenter toute modification de la structure des médias, des droits ou du processus de déploiement.
