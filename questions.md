# Questions de cadrage — Yowaki Poetry

Ce fichier rassemble les décisions à prendre avant ou pendant la réalisation. Les réponses peuvent être écrites directement sous chaque question. Une réponse vide signifie que le choix reste à faire.

## Identité éditoriale

### 1. Nom public du site et du recueil

Réponse : Yowaki - créations diverses

### 2. Quel texte doit apparaître sur la page d'accueil ?

Réponse : Quelques créations au fil du criterium

### 3. Existe-t-il un logo, une palette, une police ou une image de couverture à utiliser ?

Réponse : non pas encore mais je vais créer un bandeau, tu peux laisser une place dans l'interface.

### 4. Le texte d'accueil doit-il être modifiable depuis l'administration ou peut-il rester dans le code ?

Réponse : Tu peux le laisser en dur ce n'est qu'un sous-titre

## Modèle des contenus

### 5. Le terme `Série` du CSV doit-il être affiché comme `collection`, `série`, ou les deux selon le contexte ?

Réponse : je préfère collection

### 6. Un poème peut-il appartenir à plusieurs séries ou collections ?

Réponse : non une seule collection par texte

### 7. Un poème peut-il avoir plusieurs formes, métriques ou langues ?

Réponse : plusieurs langues oui, pour la forme et la métrique on essaiera de rester sur une par texte, en conservant la plus évidente. Le calligramme peut avoir une métrique par contre.

### 8. Quels thèmes faut-il retenir pour les 152 poèmes ?

Réponse : Il n'y a pas 152 poèmes mais plus de 500, les thèmes seront ajoutés ensuite si tu ne peux les déterminer, la vraie base complète des poèmes est le fichier poemes.md

### 9. Les caractéristiques saisies dans le CSV sont-elles des informations éditoriales validées ou doivent-elles être présentées comme indicatives ?

Réponse : elles sont valides pour l'instant, mais resteront modifiables dans les fiches au besoin.

### 10. Faut-il afficher les notes et commentaires d'analyse au public, à l'administrateur seulement, ou pas du tout ?

Réponse : pour l'instant on garde notes affichées (et modifiable par admin) les commentaires on verra si on s'en sert pour interaction avec les utilisateurs ou pas dans un autre temps

### 11. Faut-il distinguer les calligrammes dans une page ou un filtre dédié ?

Réponse : les caligrammes sont particuliers ils doivent être repérables en effet

## Import du corpus

### 12. Le texte complet de référence est-il uniquement dans `poemes.md` ou existe-t-il une source Google Docs exportable plus récente ?

Réponse : le fichier poemes.md était une source de NotebookLM à jour du google docs correspondant

### 13. En cas de différence entre le CSV et le Markdown, quelle source est prioritaire pour le titre, le texte et les caractéristiques ?

Réponse : le markdown est à jour pour titre et texte.

### 14. Les identifiants du CSV doivent-ils être conservés visibles dans l'administration ou seulement en traçabilité technique ?

Réponse : un identifiant doit être créé, dans l'ordre du document markdown pour respecter l'ancienneté. Tu dois aussi ajouter un champ date, vide pour l'instant pour les ajouts futurs et que je pourrais remplir pour les anciens textes aussi.

### 15. Faut-il importer les éléments actuellement identifiés comme nouvelles dès la V1, ou seulement préparer le modèle ?

Réponse : les nouvelles ne seront pas dans le V1 on se concentre sur les poèmes

## Images et PDF

### 16. Les images existantes sont-elles toutes disponibles localement, ou faut-il prévoir une récupération depuis Google Drive/autre source ?

Réponse : les images seront importées à l'unité par l'administration du site

### 17. Quelles tailles et quels formats maximum autoriser pour une image ?

Réponse : 10Mo maximum, en HD. tu peux aussi utiliser l'import cloudinary pour réduire la taille des images

### 18. Les PDF sont-ils des textes complets, des illustrations de calligrammes, ou les deux ?

Réponse : ce peut être une illustration simple, un calligramme, ou une mise en image d'un poème

### 19. Pour un PDF, faut-il privilégier la lecture intégrée, le téléchargement, ou les deux ?

Réponse : lecture intégrée par défaut

### 20. Les PDF peuvent-ils contenir des informations confidentielles ou doivent-ils être publics comme les poèmes ?

Réponse : ils peuvent êtte publics

### 21. Faut-il autoriser plusieurs images ou PDF par poème dans la première version ?

Réponse : non cela viendra avec les nouvelles

## Administration et sécurité

### 22. Quelle adresse e-mail doit être utilisée pour le premier administrateur ?

Réponse : julien.colombeau@gmail.com

### 23. Souhaitez-vous prévoir un mécanisme de récupération ou de changement de mot de passe dès la V1 ?

Réponse : non

### 24. L'administrateur unique doit-il pouvoir supprimer définitivement une fiche, ou faut-il une corbeille/archivage ?

Réponse : suppression définitive

### 25. Faut-il conserver un historique des modifications éditoriales ?

Réponse : non

## Déploiement

### 26. Quel nom de dépôt GitHub et quel nom de projet Cloudflare souhaitez-vous utiliser ?

Réponse : yowaki-poetry

### 27. Un domaine personnalisé est-il prévu pour la mise en ligne ?

Réponse : non

### 28. Cloudinary est-il déjà le compte cible pour ce projet, ou faut-il créer un espace distinct de Juno-Matos ?

Réponse : c'est déjà le compte cible, si tu peux créer un dossier "poetry" pour éviter de mélanger les projets

### 29. Souhaitez-vous une préproduction séparée avant la base D1 de production ?

Réponse : je veux bien une préproduction locale avant déploiement pour tester toutes les fonctionnalités

### 30. Qui valide la checklist finale et le contenu importé avant publication ?

Réponse : moi

## État après mise en production

La V1 a été déployée sur Cloudflare Workers et validée avec le catalogue public, l'administration et la base D1. Les décisions suivantes restent ouvertes pour les évolutions :

### 31. Les nouvelles doivent-elles apparaître dans le même catalogue que les poèmes ?

Réponse à décider avant l'évolution `contentType` `news` ou `short-story`.

### 32. Quels champs sont nécessaires pour une nouvelle ?

Proposition à confirmer : titre, résumé, texte long, date, image éventuelle, PDF éventuel, notes publiques et statut brouillon/publié.

### 33. Les nouvelles doivent-elles être publiées immédiatement ou passer par un brouillon ?

Réponse à décider. Le brouillon est recommandé avant d'ajouter des contenus éditoriaux longs.

### 34. Faut-il créer une page publique dédiée aux nouvelles ?

Réponse à décider. Une page dédiée est recommandée si les nouvelles ne doivent pas être mélangées aux poèmes.

## Décisions proposées par défaut

En l'absence de réponse explicite, la roadmap suppose :

- une consultation publique sans compte ;
- un seul administrateur ;
- un import initial du CSV et des textes Markdown ;
- `legacyId` conservé uniquement pour la traçabilité ;
- une image principale et un PDF principal maximum par fiche en V1 ;
- Cloudinary pour les images ;
- téléchargement PDF obligatoire et affichage intégré tenté lorsque compatible ;
- Nuxt 4, Vuetify, NuxtHub, D1, Drizzle, `nuxt-auth-utils` et Wrangler ;
- les nouvelles reportées à une évolution `contentType` ultérieure, avec validation éditoriale préalable ;
- aucune suppression automatique de média sans validation de la stratégie de nettoyage.
