# Rapport d?audit du corpus `poemes.md`

## 1. R?sum?

L?audit repose sur les titres Markdown de niveau 1 et sur les lignes de donn?es de `base-de-donnees-poemes-csv.md`. Le titre `# Poemes` est trait? comme le titre du document et exclu du corpus. Les s?parateurs verticaux pr?sents dans certains textes sont compt?s comme des retours ? la ligne logiques, sans modifier le fichier source.

| Indicateur | Valeur |
| --- | ---: |
| Lignes dans `poemes.md` | 8044 |
| Titres Markdown d?tect?s | 495 |
| Titres de document exclus | 1 |
| Textes d?tect?s dans le corpus | 494 |
| Lignes de donn?es CSV | 152 |
| Correspondances CSV exactes | 97 |
| Correspondances CSV apr?s normalisation des suffixes | 152 |
| Textes Markdown sans ligne CSV apr?s normalisation | 337 |
| Lignes CSV sans texte Markdown apr?s normalisation | 0 |
| Groupes de titres dupliqu?s dans Markdown | 10 |
| Groupes de titres dupliqu?s dans CSV | 2 |
| Textes sans corps | 0 |
| S?parateurs verticaux ? convertir en retours ? la ligne | 30 |
| Textes contenant ces s?parateurs | 2 |
| Titres marqu?s comme calligrammes | 22 |
| Nombre moyen de lignes logiques par texte | 15.27 |
| Nombre moyen de caract?res par texte | 575.11 |

## 2. Conclusions

- Le corpus actuel contient **494 textes** d?tect?s, num?rotables de `documentOrder = 1` ? `494`.
- Le CSV ne couvre qu?une partie du corpus : il sert de source de m?tadonn?es historiques, pas de liste exhaustive des textes.
- Apr?s retrait des suffixes de collection, de jeunesse, de jeu et de calligramme, les 152 lignes CSV trouvent une correspondance par titre de base.
- Les doublons de titre doivent ?tre conserv?s comme textes distincts et identifi?s par `documentOrder`, jamais fusionn?s automatiquement.
- 30 s?parateurs verticaux (`U+000B`) r?partis dans 2 texte(s) doivent ?tre convertis en retours ? la ligne lors de l?import pour restituer les strophes.

## 3. Doublons de titres apr?s normalisation

- `automne` : Automne - jeunesse (ordre 3), Automne – Une année de sonnets (ordre 57), Automne (ordre 374)
- `musique` : Musique (ordre 20), Musique – jeunesse (ordre 164)
- `hiver` : Hiver - jeunesse (ordre 38), Hiver – Une année de sonnets (ordre 58), Hiver – jeunesse (ordre 140)
- `printemps` : Printemps – Une année de sonnets (ordre 59), Printemps – jeunesse (ordre 255)
- `sapin` : Sapin - calligramme (ordre 88), Sapin – Calligramme (ordre 307)
- `promenade` : Promenade (ordre 131), Promenade (ordre 271), Promenade (ordre 426)
- `ecrire` : Écrire (ordre 133), Ecrire (ordre 207)
- `noel` : Noël (ordre 149), Noël – jeunesse (ordre 200)
- `un instant` : Un instant (ordre 222), Un instant (ordre 303)
- `matin` : Matin (ordre 275), Matin (ordre 334), Matin (ordre 434)

## 4. ?carts r?siduels apr?s rapprochement par titre de base

### Textes Markdown sans ligne CSV

- ordre 128 ? **Émergence** (ligne 1993)
- ordre 129 ? **Locomotion** (ligne 2008)
- ordre 130 ? **Émoi** (ligne 2025)
- ordre 131 ? **Promenade** (ligne 2042)
- ordre 132 ? **Explosion douteuse** (ligne 2059)
- ordre 133 ? **Écrire** (ligne 2072)
- ordre 134 ? **J’ai peur** (ligne 2087)
- ordre 135 ? **Délit** (ligne 2112)
- ordre 136 ? **Je vais essayer de parler de moi** (ligne 2145)
- ordre 137 ? **Lecture** (ligne 2188)
- ordre 138 ? **Octobre – jeunesse** (ligne 2205)
- ordre 139 ? **Halloween – jeunesse** (ligne 2222)
- ordre 141 ? **Musique naturelle** (ligne 2248)
- ordre 142 ? **Absurde** (ligne 2263)
- ordre 143 ? **Pierre aux sacrifices** (ligne 2276)
- ordre 145 ? **Escapade** (ligne 2300)
- ordre 146 ? **Qui sommes-nous ?** (ligne 2321)
- ordre 147 ? **Comment** (ligne 2340)
- ordre 148 ? **Salle d’attente** (ligne 2357)
- ordre 149 ? **Noël** (ligne 2378)
- ordre 150 ? **Étoiles** (ligne 2395)
- ordre 151 ? **Champignons – jeunesse** (ligne 2416)
- ordre 152 ? **Loco-émotive** (ligne 2435)
- ordre 153 ? **Qu’y a-t-il** (ligne 2452)
- ordre 154 ? **Charlot** (ligne 2469)
- ordre 155 ? **Le cirque** (ligne 2486)
- ordre 156 ? **Assis** (ligne 2515)
- ordre 157 ? **CHU-te** (ligne 2532)
- ordre 159 ? **Camion - jeunesse** (ligne 2582)
- ordre 160 ? **Voiture - jeunesse** (ligne 2595)
- ordre 165 ? **Télévision -  jeunesse** (ligne 2665)
- ordre 166 ? **Les décors** (ligne 2680)
- ordre 167 ? **Les costumes** (ligne 2701)
- ordre 168 ? **Ecrans** (ligne 2722)
- ordre 169 ? **Je voudrais être un homme heureux** (ligne 2739)
- ordre 170 ? **Cellule** (ligne 2761)
- ordre 171 ? **Le jardinier** (ligne 2774)
- ordre 172 ? **Les accessoires** (ligne 2791)
- ordre 173 ? **C – calligramme** (ligne 2812)
- ordre 174 ? **Est-ce que la vie est un jeu** (ligne 2825)
- ordre 175 ? **Peine, chagrin, et cætera** (ligne 2862)
- ordre 177 ? **Destin** (ligne 2894)
- ordre 178 ? **Sécurité, régie, accueil** (ligne 2911)
- ordre 179 ? **Acteurs** (ligne 2930)
- ordre 180 ? **Boulet** (ligne 2951)
- ordre 181 ? **Laissez-moi** (ligne 2970)
- ordre 182 ? **Bonne année 2013** (ligne 2983)
- ordre 183 ? **Le secret** (ligne 2996)
- ordre 184 ? **Déclaration** (ligne 3009)
- ordre 185 ? **Boutique de jouets** (ligne 3022)
- ordre 186 ? **L’écureuil – jeunesse** (ligne 3061)
- ordre 187 ? **Dame tortue – jeunesse** (ligne 3070)
- ordre 188 ? **Dragon affamé – jeunesse** (ligne 3079)
- ordre 189 ? **Météo - jeunesse** (ligne 3092)
- ordre 190 ? **Faisons-le à la main – jeunesse** (ligne 3101)
- ordre 191 ? **Petite graine – jeunesse** (ligne 3110)
- ordre 192 ? **Chat fou-jeunesse** (ligne 3131)
- ordre 193 ? **Journée ordinaire** (ligne 3144)
- ordre 194 ? **Exceptionnel** (ligne 3187)
- ordre 196 ? **Une étoile à la fenêtre** (ligne 3218)
- ordre 197 ? **Fantasy** (ligne 3235)
- ordre 198 ? **Les mots** (ligne 3292)
- ordre 199 ? **S’échapper** (ligne 3307)
- ordre 200 ? **Noël – jeunesse** (ligne 3324)
- ordre 201 ? **Oppressant** (ligne 3341)
- ordre 202 ? **Il approche** (ligne 3354)
- ordre 203 ? **J’aimerais** (ligne 3375)
- ordre 204 ? **Carrés noirs** (ligne 3392)
- ordre 205 ? **Une petite mouche - jeunesse** (ligne 3409)
- ordre 206 ? **Le singe - jeunesse** (ligne 3422)
- ordre 207 ? **Ecrire** (ligne 3433)
- ordre 208 ? **Le monstre souterrain** (ligne 3450)
- ordre 210 ? **Acupuncteur** (ligne 3485)
- ordre 211 ? **La peur** (ligne 3502)
- ordre 212 ? **Crapaud pas beau – jeunesse** (ligne 3519)
- ordre 213 ? **Le rouge-gorge – jeunesse** (ligne 3528)
- ordre 214 ? **D – calligramme** (ligne 3537)
- ordre 215 ? **E – calligramme** (ligne 3550)
- ordre 217 ? **Lire** (ligne 3578)
- ordre 218 ? **Cannelés** (ligne 3595)
- ordre 220 ? **Je me suis perdu** (ligne 3629)
- ordre 221 ? **Symptômes** (ligne 3648)
- ordre 222 ? **Un instant** (ligne 3665)
- ordre 223 ? **Elle écrit** (ligne 3680)
- ordre 225 ? **Porte close** (ligne 3710)
- ordre 226 ? **Le contrat** (ligne 3723)
- ordre 227 ? **Un escargot au marché - jeunesse** (ligne 3748)
- ordre 228 ? **Posthume** (ligne 3759)
- ordre 229 ? **Chocolat** (ligne 3774)
- ordre 230 ? **Bulles et pépiements - jeunesse** (ligne 3785)
- ordre 231 ? **Aujourd’hui** (ligne 3798)
- ordre 232 ? **Intempéries** (ligne 3815)
- ordre 233 ? **Lueur vague** (ligne 3834)
- ordre 235 ? **Une fée s’est posée** (ligne 3862)
- ordre 236 ? **Labyrinthe** (ligne 3877)
- ordre 237 ? **Ecrire c’est une histoire** (ligne 3894)
- ordre 238 ? **Ecrivain** (ligne 3911)
- ordre 239 ? **Ce soir** (ligne 3926)
- ordre 240 ? **Le compte est bon** (ligne 3945)
- ordre 241 ? **Montée** (ligne 3955)
- ordre 242 ? **1, 2, 3** (ligne 3968)
- ordre 243 ? **Quand la musique** (ligne 3973)
- ordre 245 ? **Une nuit, une promenade** (ligne 4001)
- ordre 246 ? **Ombre d’hiver** (ligne 4014)
- ordre 247 ? **Entre deux** (ligne 4029)
- ordre 248 ? **Rien** (ligne 4044)
- ordre 249 ? **Récit de nuit** (ligne 4059)
- ordre 250 ? **Le poème est là** (ligne 4076)
- ordre 251 ? **Abandon** (ligne 4091)
- ordre 252 ? **Une nuit secrète** (ligne 4112)
- ordre 253 ? **Quatre pour un** (ligne 4129)
- ordre 254 ? **Mégalithes** (ligne 4144)
- ordre 256 ? **Effroi** (ligne 4178)
- ordre 257 ? **Une rue ensoleillée** (ligne 4197)
- ordre 258 ? **Musicale** (ligne 4214)
- ordre 259 ? **Giboulées** (ligne 4227)
- ordre 260 ? **Instruments** (ligne 4242)
- ordre 261 ? **Parking de nuit** (ligne 4259)
- ordre 262 ? **Au bout du conte** (ligne 4278)
- ordre 263 ? **En retard** (ligne 4297)
- ordre 264 ? **La plage** (ligne 4320)
- ordre 265 ? **Bazar** (ligne 4339)
- ordre 266 ? **Muse** (ligne 4355)
- ordre 267 ? **Nuages** (ligne 4372)
- ordre 268 ? **Astre nocturne** (ligne 4385)
- ordre 269 ? **Un réveil ordinaire** (ligne 4398)
- ordre 270 ? **Déménagement** (ligne 4415)
- ordre 271 ? **Promenade** (ligne 4434)
- ordre 272 ? **Clef** (ligne 4449)
- ordre 273 ? **Méli-mélo de mots** (ligne 4470)
- ordre 274 ? **Déambulation** (ligne 4487)
- ordre 275 ? **Matin** (ligne 4516)
- ordre 276 ? **Un monde sans toi** (ligne 4531)
- ordre 277 ? **C’est juste** (ligne 4550)
- ordre 278 ? **Attente** (ligne 4571)
- ordre 279 ? **Idée noire** (ligne 4608)
- ordre 280 ? **Type texte** (ligne 4621)
- ordre 281 ? **Ruisselant** (ligne 4638)
- ordre 282 ? **A la tombée** (ligne 4653)
- ordre 283 ? **Paris-calligramme** (ligne 4666)
- ordre 284 ? **Rand’automne** (ligne 4683)
- ordre 285 ? **Nuit déserte** (ligne 4698)
- ordre 286 ? **Le poème nouveau** (ligne 4715)
- ordre 287 ? **Vingt-cinq** (ligne 4730)
- ordre 288 ? **Soirée d’hiver** (ligne 4747)
- ordre 289 ? **Tourment** (ligne 4760)
- ordre 290 ? **Suspendus** (ligne 4775)
- ordre 291 ? **Foudre** (ligne 4788)
- ordre 292 ? **Guten tag** (ligne 4801)
- ordre 293 ? **Gravure** (ligne 4814)
- ordre 294 ? **Errance** (ligne 4827)
- ordre 295 ? **Rêveries** (ligne 4844)
- ordre 296 ? **XXXVI** (ligne 4861)
- ordre 297 ? **Arc-en-ciel annuel** (ligne 4898)
- ordre 298 ? **« Soiret »** (ligne 4913)
- ordre 299 ? **Premières fois** (ligne 4928)
- ordre 300 ? **Entre ici et là-bas** (ligne 4943)
- ordre 301 ? **Horaires des repas** (ligne 4958)
- ordre 302 ? **Détour et retour** (ligne 4971)
- ordre 303 ? **Un instant** (ligne 4988)
- ordre 304 ? **Un poème** (ligne 5001)
- ordre 306 ? **Surprise au réveil** (ligne 5031)
- ordre 308 ? **Évasion en lignes** (ligne 5063)
- ordre 309 ? **Nature cachée** (ligne 5082)
- ordre 310 ? **Centre des mémoires** (ligne 5095)
- ordre 311 ? **Regrets hors délai** (ligne 5110)
- ordre 313 ? **Pour faire un parent…** (ligne 5138)
- ordre 314 ? **Pi** (ligne 5148)
- ordre 315 ? **Antinomie** (ligne 5161)
- ordre 316 ? **A côté** (ligne 5178)
- ordre 317 ? **Eléphant** (ligne 5193)
- ordre 318 ? **En train de l’écrit** (ligne 5202)
- ordre 319 ? **Croisée des amants** (ligne 5219)
- ordre 320 ? **Une ville** (ligne 5248)
- ordre 321 ? **Éolienne** (ligne 5268)
- ordre 322 ? **Des sens cachés** (ligne 5279)
- ordre 323 ? **Progrès** (ligne 5292)
- ordre 324 ? **Octobre rose** (ligne 5319)
- ordre 325 ? **Noël au poupon** (ligne 5334)
- ordre 326 ? **Le matin** (ligne 5347)
- ordre 327 ? **Prendre le temps** (ligne 5362)
- ordre 328 ? **Le temps s’enfuit** (ligne 5377)
- ordre 329 ? **Un p’tit coin de parapluie** (ligne 5392)
- ordre 330 ? **Marché(s) de Noël** (ligne 5405)
- ordre 331 ? **Émoi du pourquoi** (ligne 5420)
- ordre 332 ? **Au matin** (ligne 5433)
- ordre 333 ? **Juste quelques mots** (ligne 5454)
- ordre 334 ? **Matin** (ligne 5481)
- ordre 335 ? **Au bout** (ligne 5494)
- ordre 336 ? **Deux** (ligne 5527)
- ordre 337 ? **C’est comme** (ligne 5548)
- ordre 338 ? **Clair de lune** (ligne 5565)
- ordre 339 ? **L’attente** (ligne 5580)
- ordre 340 ? **Sur le départ** (ligne 5595)
- ordre 341 ? **Bagage** (ligne 5610)
- ordre 342 ? **Effet de fée** (ligne 5631)
- ordre 343 ? **Où** (ligne 5646)
- ordre 344 ? **Après la pluie…** (ligne 5661)
- ordre 346 ? **A quoi** (ligne 5694)
- ordre 347 ? **Une crique** (ligne 5709)
- ordre 348 ? **Nébuleux** (ligne 5738)
- ordre 349 ? **Attendre** (ligne 5755)
- ordre 350 ? **Jalouse** (ligne 5770)
- ordre 351 ? **Jeux de plume** (ligne 5785)
- ordre 352 ? **Un jour en juin** (ligne 5797)
- ordre 353 ? **L’été s’en vient** (ligne 5812)
- ordre 354 ? **Le loup sonne trois fois** (ligne 5827)
- ordre 355 ? **Détail** (ligne 5842)
- ordre 356 ? **Aux heures dorées** (ligne 5857)
- ordre 357 ? **Gare à l’aléa** (ligne 5874)
- ordre 358 ? **Les autres** (ligne 5889)
- ordre 359 ? **Rentrée litté-rail** (ligne 5904)
- ordre 360 ? **Sonnet ! et entrez** (ligne 5921)
- ordre 361 ? **Tournant** (ligne 5936)
- ordre 362 ? **Au-dessus des rails** (ligne 5953)
- ordre 363 ? **Petit peuple ?** (ligne 5968)
- ordre 364 ? **La folie des chars et des gens** (ligne 5983)
- ordre 365 ? **Un banc** (ligne 5998)
- ordre 366 ? **Soir** (ligne 6013)
- ordre 367 ? **Intra-cité** (ligne 6023)
- ordre 368 ? **Ville endormie** (ligne 6040)
- ordre 369 ? **Paysage** (ligne 6055)
- ordre 370 ? **Crime au cœur fondant** (ligne 6070)
- ordre 371 ? **Réverbère** (ligne 6085)
- ordre 372 ? **Ru** (ligne 6098)
- ordre 373 ? **Capter** (ligne 6113)
- ordre 375 ? **Un tour de cadran** (ligne 6143)
- ordre 376 ? **Famille** (ligne 6158)
- ordre 377 ? **Lycée** (ligne 6173)
- ordre 378 ? **Toi sans moi** (ligne 6188)
- ordre 379 ? **Hou** (ligne 6205)
- ordre 380 ? **L’agneau et le loup** (ligne 6224)
- ordre 381 ? **Dix-cussions et plus** (ligne 6237)
- ordre 382 ? **Juste un grain…** (ligne 6252)
- ordre 383 ? **De l’autre côté** (ligne 6267)
- ordre 384 ? **Un petit banc** (ligne 6282)
- ordre 385 ? **Rêver de vivre, vivre et rêver** (ligne 6297)
- ordre 386 ? **Magie de Noël** (ligne 6312)
- ordre 387 ? **Trébucher** (ligne 6327)
- ordre 388 ? **Oreille** (ligne 6342)
- ordre 389 ? **Conjuguer plaire** (ligne 6355)
- ordre 390 ? **Verbe sans verbe** (ligne 6370)
- ordre 391 ? **C’est** (ligne 6385)
- ordre 392 ? **Ploc** (ligne 6398)
- ordre 393 ? **Un flocon** (ligne 6411)
- ordre 394 ? **Neige** (ligne 6427)
- ordre 395 ? **Questions existantes en bleu ciel** (ligne 6440)
- ordre 396 ? **Mer-mots** (ligne 6453)
- ordre 397 ? **Lourd** (ligne 6468)
- ordre 398 ? **Juste à côté** (ligne 6483)
- ordre 399 ? **Courbe droite** (ligne 6498)
- ordre 400 ? **Résonnante** (ligne 6529)
- ordre 401 ? **Menthe** (ligne 6542)
- ordre 402 ? **Escape** (ligne 6563)
- ordre 403 ? **L’instant d’après** (ligne 6578)
- ordre 404 ? **Un soir d’été** (ligne 6593)
- ordre 405 ? **Quand les pensées déraillent** (ligne 6608)
- ordre 407 ? **Survol** (ligne 6639)
- ordre 408 ? **Dessous** (ligne 6654)
- ordre 409 ? **Couleurs changées** (ligne 6669)
- ordre 410 ? **Le silence du frigo** (ligne 6682)
- ordre 411 ? **Retour ce soir** (ligne 6697)
- ordre 412 ? **Il est temps** (ligne 6710)
- ordre 413 ? **Appareil photo – calligramme** (ligne 6725)
- ordre 414 ? **The lonely house** (ligne 6739)
- ordre 415 ? **Bande originale** (ligne 6754)
- ordre 416 ? **Fêtes** (ligne 6769)
- ordre 417 ? **Liberté** (ligne 6783)
- ordre 418 ? **Liberty** (ligne 6798)
- ordre 419 ? **Passé, présent, futur** (ligne 6821)
- ordre 420 ? **Sommeil imprudent** (ligne 6840)
- ordre 421 ? **Non écrit** (ligne 6874)
- ordre 422 ? **Le nez en l’air** (ligne 6887)
- ordre 423 ? **Run over and overrun** (ligne 6900)
- ordre 424 ? **Sourire** (ligne 6915)
- ordre 425 ? **Coquillages et crustacés** (ligne 6952)
- ordre 426 ? **Promenade** (ligne 6967)
- ordre 427 ? **Jouer la vie** (ligne 6982)
- ordre 428 ? **Nature envie** (ligne 6992)
- ordre 429 ? **Au fil du vent** (ligne 7007)
- ordre 430 ? **Semblable à la vie** (ligne 7017)
- ordre 431 ? **Capitaine** (ligne 7033)
- ordre 432 ? **Le sel de la vie** (ligne 7048)
- ordre 433 ? **Au bout du quai** (ligne 7063)
- ordre 434 ? **Matin** (ligne 7078)
- ordre 435 ? **Danse d’étoiles** (ligne 7093)
- ordre 436 ? **D’eau chaude et d’amitié** (ligne 7106)
- ordre 437 ? **Distiques de fées** (ligne 7121)
- ordre 438 ? **La chaise** (ligne 7138)
- ordre 439 ? **Étincelles** (ligne 7154)
- ordre 440 ? **Ce jour là de fête** (ligne 7169)
- ordre 441 ? **Fable en larme** (ligne 7184)
- ordre 442 ? **Coulée verte (et autres couleurs)** (ligne 7199)
- ordre 443 ? ****Emmêlé**·e·s** (ligne 7220)
- ordre 444 ? **Souvenir(s)** (ligne 7235)
- ordre 445 ? **La vie buissonnière** (ligne 7250)
- ordre 446 ? **Battons-nous en retraite !** (ligne 7265)
- ordre 447 ? **Entre hier et demain** (ligne 7280)
- ordre 448 ? **Eden** (ligne 7295)
- ordre 449 ? **L’être à faire** (ligne 7310)
- ordre 450 ? **Auto-lib’** (ligne 7325)
- ordre 451 ? **Moon** (ligne 7340)
- ordre 452 ? **Tempête** (ligne 7355)
- ordre 453 ? **Livre** (ligne 7370)
- ordre 454 ? **Nature assise** (ligne 7385)
- ordre 455 ? **Tourne** (ligne 7400)
- ordre 456 ? **JL** (ligne 7415)
- ordre 457 ? **Ils sont deux** (ligne 7430)
- ordre 458 ? **Disque d’une nuit** (ligne 7447)
- ordre 459 ? **À ça je n’y crois pas** (ligne 7462)
- ordre 460 ? **Colorée** (ligne 7479)
- ordre 461 ? **Musicalité** (ligne 7492)
- ordre 462 ? **Le temps s’arrête** (ligne 7507)
- ordre 463 ? **« Mais je l’aime »** (ligne 7522)
- ordre 464 ? **Histoire de pierres** (ligne 7537)
- ordre 465 ? **Ding-dong** (ligne 7552)
- ordre 466 ? **La laisse** (ligne 7567)
- ordre 467 ? **Planches** (ligne 7582)
- ordre 468 ? **Façades** (ligne 7595)
- ordre 469 ? **Données** (ligne 7612)
- ordre 470 ? **jaune** (ligne 7627)
- ordre 471 ? **C’est pour rire** (ligne 7646)
- ordre 472 ? **Inné-galité** (ligne 7663)
- ordre 473 ? **Image-i-nation** (ligne 7678)
- ordre 474 ? **Son corps, Son choix** (ligne 7693)
- ordre 477 ? **Scrutin sans fin** (ligne 7736)
- ordre 483 ? **Hasard de l'aérogare** (ligne 7826)
- ordre 484 ? **Actes manqués** (ligne 7845)
- ordre 485 ? **Retour en mots** (ligne 7870)
- ordre 486 ? **Tant qu’il y aura** (ligne 7883)
- ordre 487 ? **Ton invitation** (ligne 7896)
- ordre 488 ? **Non** (ligne 7926)
- ordre 490 ? **La première fois** (ligne 7958)
- ordre 491 ? **Résister** (ligne 7974)
- ordre 492 ? **Une feuille** (ligne 7990)
- ordre 493 ? **Pois** (ligne 8012)
- ordre 494 ? **Combien d’histoires ?** (ligne 8030)

Aucune ligne CSV sans correspondance Markdown apr?s normalisation.

## 5. Doublons c?t? CSV

- `automne` : Automne (CSV 3), Automne (CSV 57)
- `hiver` : Hiver (CSV 38), Hiver (CSV 58)

## 6. V?rifications ?ditoriales recommand?es

Cette liste ne remplace pas la validation de l?auteur.
- ordre 3 ? **Automne - jeunesse** : type de contenu ? confirmer
- ordre 4 ? **La rentrée - jeunesse** : type de contenu ? confirmer
- ordre 8 ? **Samedi soir sur l’herbe - jeunesse** : type de contenu ? confirmer
- ordre 29 ? **L’hiver est là - jeunesse** : type de contenu ? confirmer
- ordre 31 ? **Gustave - jeunesse** : type de contenu ? confirmer
- ordre 38 ? **Hiver - jeunesse** : type de contenu ? confirmer
- ordre 43 ? **6 qui prend - Jeu** : type de contenu ? confirmer
- ordre 46 ? **Carnaval - jeunesse** : type de contenu ? confirmer
- ordre 56 ? **Le Printemps - jeunesse** : type de contenu ? confirmer
- ordre 75 ? **La chenille - jeunesse** : type de contenu ? confirmer
- ordre 77 ? **Pâques - jeunesse** : type de contenu ? confirmer
- ordre 78 ? **Magicien - jeunesse** : type de contenu ? confirmer
- ordre 79 ? **Toutou - jeunesse** : type de contenu ? confirmer
- ordre 85 ? **Munchkin - Jeu** : type de contenu ? confirmer
- ordre 86 ? **Cri - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 87 ? **Aux chandelles - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 88 ? **Sapin - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 89 ? **Corde - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 90 ? **Sax - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 91 ? **Temps - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 92 ? **Thé - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 102 ? **Zombies - Jeu** : type de contenu ? confirmer
- ordre 104 ? **Enceinte - calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 119 ? **Compagnon - jeunesse** : type de contenu ? confirmer
- ordre 138 ? **Octobre – jeunesse** : type de contenu ? confirmer
- ordre 139 ? **Halloween – jeunesse** : type de contenu ? confirmer
- ordre 140 ? **Hiver – jeunesse** : type de contenu ? confirmer
- ordre 144 ? **Cerf-volant – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 151 ? **Champignons – jeunesse** : type de contenu ? confirmer
- ordre 158 ? **A – Calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 159 ? **Camion - jeunesse** : type de contenu ? confirmer
- ordre 160 ? **Voiture - jeunesse** : type de contenu ? confirmer
- ordre 161 ? **B – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 162 ? **Locomotive – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 163 ? **Révolver – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 164 ? **Musique – jeunesse** : type de contenu ? confirmer
- ordre 165 ? **Télévision -  jeunesse** : type de contenu ? confirmer
- ordre 173 ? **C – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 174 ? **Est-ce que la vie est un jeu** : type de contenu ? confirmer
- ordre 186 ? **L’écureuil – jeunesse** : type de contenu ? confirmer
- ordre 187 ? **Dame tortue – jeunesse** : type de contenu ? confirmer
- ordre 188 ? **Dragon affamé – jeunesse** : type de contenu ? confirmer
- ordre 189 ? **Météo - jeunesse** : type de contenu ? confirmer
- ordre 190 ? **Faisons-le à la main – jeunesse** : type de contenu ? confirmer
- ordre 191 ? **Petite graine – jeunesse** : type de contenu ? confirmer
- ordre 192 ? **Chat fou-jeunesse** : type de contenu ? confirmer
- ordre 200 ? **Noël – jeunesse** : type de contenu ? confirmer
- ordre 205 ? **Une petite mouche - jeunesse** : type de contenu ? confirmer
- ordre 206 ? **Le singe - jeunesse** : type de contenu ? confirmer
- ordre 209 ? **Ours – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 212 ? **Crapaud pas beau – jeunesse** : type de contenu ? confirmer
- ordre 213 ? **Le rouge-gorge – jeunesse** : type de contenu ? confirmer
- ordre 214 ? **D – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 215 ? **E – calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 219 ? **F – Calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 227 ? **Un escargot au marché - jeunesse** : type de contenu ? confirmer
- ordre 230 ? **Bulles et pépiements - jeunesse** : type de contenu ? confirmer
- ordre 255 ? **Printemps – jeunesse** : type de contenu ? confirmer
- ordre 283 ? **Paris-calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 305 ? **Téléphone – Calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 307 ? **Sapin – Calligramme** : calligramme ? v?rifier pour pr?server la mise en page
- ordre 351 ? **Jeux de plume** : type de contenu ? confirmer
- ordre 413 ? **Appareil photo – calligramme** : calligramme ? v?rifier pour pr?server la mise en page


### Textes contenant des s?parateurs verticaux

- ordre 1 ? **Tristesse**
- ordre 84 ? **Premier mai**

## 7. D?cision pour l?import

1. Lire `poemes.md` comme source prioritaire du titre, du texte et de l?ordre.
2. Convertir `U+000B` en `\n` pendant l?import, sans modifier la source originale.
3. Attribuer `documentOrder` selon l?ordre du Markdown.
4. Rapprocher les m?tadonn?es CSV avec le titre de base, puis conserver le titre Markdown exact.
5. Conserver `legacyId` lorsque plusieurs lignes CSV correspondent ? des textes distincts ; signaler les collisions pour validation.
6. Laisser la date vide pour tous les textes dont la date de cr?ation est inconnue.
