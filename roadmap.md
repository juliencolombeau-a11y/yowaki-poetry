# Roadmap — Yowaki Poetry

Cette roadmap transforme les documents métier existants en une application déployable. Les phases doivent être réalisées dans l'ordre lorsque la phase suivante dépend du schéma ou des décisions de la précédente.

## Phase 0 — Cadrage et décisions

**Objectif :** fermer les décisions qui influencent le modèle et l'interface.

- répondre à `questions.md` ;
- confirmer le nom du recueil, le texte d'accueil et l'identité visuelle ;
- valider la définition de série, collection, thème et type de contenu ;
- décider si les notes d'administration sont publiques ou privées ;
- confirmer la politique de stockage et de consultation des PDF ;
- décider si les fiches utilisent un identifiant ou un slug dans leurs URL.

**Sortie attendue :** spécifications validées, questionnaire renseigné, liste des décisions gelées.

## Phase 1 — Préparation et audit des sources

**Objectif :** rendre l'import fiable avant de construire l'interface.

- inventorier les 494 textes actuellement détectés dans `poemes.md` et les lignes correspondantes du CSV ;
- détecter les titres manquants, doublons, variantes d'accents et collisions de séries ;
- utiliser `poemes.md` comme source prioritaire pour l'ordre, les titres et les textes ;
- repérer les poèmes dont la mise en page est un calligramme ;
- produire une liste des classifications certaines, incertaines et absentes ;
- définir le format de rapport d'import ;
- ajouter les exclusions Git nécessaires pour `.env`, `.data`, `.output` et les fichiers temporaires.

**Sortie attendue :** jeu de données local nettoyé, rapport des anomalies et mapping documenté.

## Phase 2 — Initialisation technique

**Objectif :** créer un socle Nuxt reproductible aligné sur Juno-Matos.

- initialiser Nuxt 4, Vuetify, NuxtHub, Drizzle et `nuxt-auth-utils` ;
- préparer `nuxt.config.ts`, `wrangler.jsonc`, `.env.example` et `package-lock.json` ;
- configurer SQLite local puis la bascule D1 par variable d'environnement ;
- préparer les scripts de développement, typecheck, build et export/import ;
- vérifier le fonctionnement sur `http://localhost:3000` sous Windows.

**Sortie attendue :** application vide qui démarre, se type-checke et se construit.

## Phase 3 — Modèle de données et migrations

**Objectif :** créer le schéma durable avant les pages métier.

- créer les tables `poems`, `themes`, les références nécessaires et `media` ;
- créer la relation des thèmes multiples ;
- ajouter la table `users` et la session d'administration ;
- ajouter les index de recherche et de filtrage ;
- générer les migrations Drizzle ;
- tester les migrations sur une base locale propre et sur une base vide de préproduction.

**Sortie attendue :** schéma versionné, migration initiale reproductible et rapport de comptage.

## Phase 4 — Import initial

**Objectif :** charger le corpus sans perte silencieuse.

- implémenter l'import CSV ;
- compléter les corps depuis les Markdown ;
- créer `documentOrder` dans l'ordre du Markdown, préserver `legacyId` lorsqu'il existe et conserver les caractères accentués ;
- ajouter une date de création facultative, vide lorsque l'information est inconnue ;
- normaliser les valeurs de référence ;
- signaler les textes absents, doublons et classifications ambiguës ;
- rendre l'import relançable sans doublons ;
- exporter un jeu initial compatible D1.

**Sortie attendue :** base locale complète, rapport d'import approuvé et script d'export déterministe.

## Phase 5 — Catalogue public

**Objectif :** rendre le corpus consultable.

- construire l'accueil ;
- construire la recherche textuelle ;
- ajouter filtres combinables et pagination ;
- créer les cartes responsive ;
- créer la fiche détaillée ;
- préserver la mise en forme des poèmes ;
- ajouter navigation par caractéristiques ;
- ajouter SEO de base, états vides, chargement et erreurs.

**Sortie attendue :** un visiteur peut parcourir et retrouver les poèmes sans compte.

## Phase 6 — Authentification et administration

**Objectif :** permettre la maintenance quotidienne avec un seul administrateur.

- implémenter login, logout et session ;
- protéger toutes les routes d'écriture côté serveur ;
- ajouter création, modification et suppression ;
- ajouter création contrôlée de références ;
- ajouter confirmations, validations et messages d'erreur ;
- mettre en place le bootstrap du premier administrateur.

**Sortie attendue :** les opérations CRUD fonctionnent pour l'administrateur et sont refusées pour un visiteur.

## Phase 7 — Images et PDF

**Objectif :** enrichir les fiches sans fragiliser le catalogue.

- implémenter l'upload image Cloudinary dans le dossier `poetry`, avec une limite de 10 Mo et une transformation HD adaptée ;
- tester remplacement et retrait d'une image ;
- définir et implémenter le stockage PDF ;
- limiter MIME, taille et extensions côté client et serveur ;
- afficher l'image dans les cartes et fiches ;
- afficher le PDF intégré par défaut et conserver un lien de téléchargement public ;
- traiter proprement l'absence ou l'échec d'un média.

**Sortie attendue :** une fiche peut être enrichie depuis ordinateur ou mobile sans exposer de secret.

## Phase 8 — Qualité, sécurité et accessibilité

**Objectif :** valider le produit avant production.

- typecheck et build ;
- tests directs des routes publiques et protégées ;
- tests des validations, sessions expirées et uploads invalides ;
- tests de non-régression sur recherche, filtres et pagination ;
- revue clavier, focus, contrastes, textes alternatifs et mobile ;
- vérifier les logs et l'absence de secrets ;
- vérifier qu'aucun HTML non fiable n'est injecté depuis les poèmes.

**Sortie attendue :** checklist V1 complète, anomalies bloquantes corrigées.

## Phase 9 — Préproduction et déploiement

**Objectif :** mettre en production sans reproduire l'incident de double binding D1.

- créer la base D1 de production ;
- configurer les variables et secrets Cloudflare Production ;
- construire et inspecter `.output/server/wrangler.json` ;
- vérifier qu'un seul binding D1 est généré ;
- appliquer les migrations distantes ;
- importer les données initiales ;
- déployer avec `npx wrangler deploy --dry-run`, puis `npx wrangler deploy` ;
- créer l'administrateur ;
- supprimer `NUXT_BOOTSTRAP_SECRET` et redéployer ;
- tester le site public, l'administration, les médias et la persistance de session.

**Sortie attendue :** URL de production fonctionnelle et fiche de déploiement renseignée.

## Phase 10 — Stabilisation et évolutions

**Objectif :** consolider le fonctionnement après mise en ligne.

- surveiller erreurs et temps de réponse ;
- corriger les problèmes éditoriaux issus de l'import ;
- documenter sauvegarde, migration et retour arrière ;
- ajouter éventuellement des slugs, favoris ou statistiques ;
- étudier l'intégration des nouvelles et textes PDF comme `contentType` distinct ;
- étudier une gestion plus fine des médias et des collections.

**Sortie attendue :** backlog priorisé à partir de l'usage réel, sans élargir la V1 prématurément.

## Jalons de validation

| Jalon | Condition de passage |
| --- | --- |
| J1 — Décisions | `questions.md` renseigné et modèle confirmé |
| J2 — Données | import local complet et rapport approuvé |
| J3 — Prototype | recherche, filtres et fiche lisibles |
| J4 — Administration | CRUD et autorisations testés |
| J5 — Médias | image et PDF testés sur fichiers valides/invalides |
| J6 — Préproduction | migrations, build et dry-run réussis |
| J7 — Production | parcours public et admin vérifiés, bootstrap supprimé |

## Ordre de priorité en cas de réduction du périmètre

1. lecture publique des poèmes et qualité de l'import ;
2. recherche, filtres et fiche détaillée ;
3. authentification et CRUD administrateur ;
4. images ;
5. PDF consultable ;
6. enrichissements éditoriaux et fonctionnalités secondaires.
