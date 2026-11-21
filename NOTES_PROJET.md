# Birds — note de reprise du projet

À donner en début de nouvelle conversation pour reprendre le travail.

## Où se trouve le jeu

- **Dépôt GitHub** : https://github.com/StFrantic82/Birds (branche `main`)
- **Jeu en ligne** : https://stfrantic82.github.io/Birds/ (GitHub Pages, branche `main`, dossier racine)
- **Artefact Claude** : https://claude.ai/artifact/DuE9tPBLhZZetNwvwLpwaQ (mêmes fichiers que le dépôt)
- Les auteurs du jeu, affichés sur l'accueil : Renato Ciervo & Andrea Robbiani

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page, styles, écran d'accueil. Les scripts sont chargés avec `?v=…` pour éviter le cache : changer ce numéro à chaque mise à jour. |
| `data.js` | Plateaux 2p / 3-4p (régions, emplacements Poussin, Ruines, arbres et bonus, emplacements de bâtiment, cases de Vol, cartes, parchemin), ombres des îles, 80 Oiseaux |
| `content.js` | 32 Alliés et 48 Reliques (données et effets), Reliques à Étoile (`COND_STARS`) |
| `cards.js` | Effets des 80 Oiseaux |
| `engine.js` | Règles, objectifs, IA (réglages dans `W(p)`), enregistrement des statistiques |
| `ui.js` | Affichage : plateau, plateau joueur, actions, accueil |
| `stats.js` | Onglet Statistiques (localStorage), simulations IA, export JSON et image |
| `i18n.js` | Traduction FR → EN appliquée à l'affichage |
| `cards/`, `obj/`, `perso/`, `icons/` | Images des 160 cartes, tuiles d'objectifs, objectifs personnels, icônes et pions |

## Vocabulaire (FR / EN)

Vol / Flock, Couvée / Brood, S'étendre / Expand, Récolter / Gather, Construire / Build, Nid / Nest, Sanctuaire / Shrine (ancien nom : House), Atelier / Workshop (ancien nom : Outpost), Chemin des Anciens / Elders' Path, **Amulette / Amulet** (jetons, ancien nom : Rune), **Relique / Relic** (cartes rangées dans les Sanctuaires), Écaille de dragon / Dragonscale, Colonie / **Settlement**, Ruine = Lac (Lake), Discover = Expand.

## Règles validées avec l'autrice

- **Mise en place** : 25 marqueurs Œuf/Poussin par joueur (2 Œufs, 3 Poussins, 1 Poussin sur l'île de départ, 19 en réserve). 4 tuiles de départ : Marais, Jungle, Désert, Toundra. **À 2 joueurs** : 1 Poussin neutre dans la région de départ de la Montagne et 1 dans celle de la Prairie. Rien de spécial à 3-4 joueurs.
- **Objectif personnel** : 2 cartes proposées, 1 gardée. 1 Étoile quand le total des deux tags atteint 5, une autre à 9 (tags joker compris). Les ressources du bas de la carte sont gagnées tout de suite.
- **Objectifs communs** : 1 tuile rouge et 1 bleue, avec les seuils du bas des tuiles. Chaque seuil est pris dans l'ordre, 1 Étoile par joueur et par tuile. Les objectifs de coût comptent toutes les cartes en jeu et les Mouettes (coût = niveau). Experienced Watchers = **total** de Poussins dans des régions avec Ruine.
- **Bâtiments** : construction **dans n'importe quel ordre**. Les effets « build your cheapest… » gardent le moins cher. Chaque bâtiment touche 2 régions. Nid 1 = 3 poussins + 1 graine, Nid 2 = + 2 graines, Nid 3 = + 3 graines (corriger l'annexe des règles, qui dit 2).
- **Nids** : 2 Œufs chacun, 3 avec l'Amulette Nid. Le surplus d'Œufs pondus est perdu. La Couvée fait éclore tous les Œufs, puis pond.
- **Sanctuaires** : capacité 2 / 3 / 4 / 5 en **taille** (somme des coûts des Reliques), +1 avec l'Amulette. Poser une Relique est gratuit.
- **Reliques à Étoile** : l'Étoile est posée sur la carte, puis rejoint le plateau quand la condition est remplie.
- **Mouettes** : 4 niveaux. Niv. 1 : Couvée = 1 Œuf. Niv. 2 : + 1 case Anciens. Niv. 3 : + tag joker. Niv. 4 : en l'atteignant (une seule fois), retirer de son plateau le bâtiment le moins cher **du type de son choix**. Gagner une Mouette = en prendre une nouvelle au niveau 1 **ou** en améliorer une. Une Mouette compte comme un Oiseau de coût égal à son niveau.
- **Chemin des Anciens** : 12 cases, piste infinie. Case 3 : nourriture au choix. Case 5 : gagner ou améliorer une Mouette. Case 7 : Amulette. Case 9 : 1 Poussin ou jusqu'à 2 Écailles. Case 12 : Étoile. L'affichage commence à 0, la case de départ devient 12 après un tour.
- **Sacrifier** = détruire une de ses cartes en jeu (une Mouette compte). **Défausser** = depuis la main.
- **Search the next X cards** : garder 1 carte, défausser les autres. Archivist = deux recherches de 3.
- **Supply Crate** : pour chaque Oiseau joué, on peut dépenser 1 graine ou 1 fruit pour réduire son coût de 2.
- **Étoile éclair** = « lorsque vous gagnez une Étoile ». Les cartes Feather Pouch, Messenger Pouch et Shadow Cloak ont été corrigées dans ce sens (fichiers fournis).

## Ce que fait l'application

- 2 à 4 joueurs humains ou IA sur le même écran, choix de la couleur (rouge, bleu, blanc, violet), FR / EN, vitesse des IA.
- Plateau avec pions en bois, ombre sur les îles hors de portée du Vol, présence par île, parchemin avec les tuiles et les Étoiles.
- Plateau joueur complet : bâtiments, Œufs dans les Nids, Poussins, Amulettes, Étoiles, Reliques glissées sous les Sanctuaires, objectif personnel glissé au-dessus.
- Boutons d'action avec icônes, sous le Chemin des Anciens. Aide de jeu.
- **Statistiques** : parties enregistrées dans le navigateur, simulations IA, Étoiles par source, objectifs, bâtiments, Amulettes, Colonies, cartes (taux de victoire, aperçu au survol), export JSON et image.

## IA (réglages dans `engine.js`, fonction `W(p)`)

Vise les Colonies, récolte ce qui débloque les cartes de sa main, saisit les Étoiles immédiates (« tempo »), couve surtout sans Poussins (double Couvée en fin de partie si elle rapporte une Étoile). Elle choisit ses Amulettes selon le contexte (joker en priorité) et ses Mouettes aussi (améliorer par défaut, gagner selon les objectifs, les Œufs ou les sacrifices). Elle sacrifie l'élément qui lui coûte le moins, construit de grands Sanctuaires quand les Reliques comptent, et poursuit ses objectifs (personnel, rouge, bleu, Reliques à Étoile).
Durée moyenne entre IA : environ 23 manches à 2 joueurs, 21,3 à 3, 20,8 à 4. Les parties humaines durent environ 20 manches.

## Points ouverts

1. **Ressources de départ des objectifs personnels** : la Mouette de départ vaut à elle seule environ 12 à 15 points de victoire (Magpies 44 %, Swans 42 %, Storks 26 %). La meilleure variante testée, sans Mouette et avec 1 ver + 1 nourriture par famille (graine pour l'Academy et la Court, ver pour la Legion et le Circle, fruit pour la Guild), ramène les victoires entre 29 et 37 %. **À faire** : proposer et simuler une variante qui garde des cases du Chemin des Anciens au départ (demande de l'autrice). Rien n'est encore appliqué dans le jeu.
2. **Experienced Watchers** : trop facile (toutes les Étoiles prises, vers la manche 10). Seuils suggérés : 7 / 8 / 8 / 9 en 3-4 joueurs, environ 6 / 7 à 2 joueurs. Non appliqué.
3. **Prairie** : île la moins colonisée (grande île, pas une île de départ, bonus peu attractifs).
4. **Jeu en ligne entre amis** : pas encore fait. GitHub Pages n'héberge que des fichiers, il faudra un service de synchronisation.
5. **Choix des cartes par l'IA** : c'est son point faible.
6. **Icône officielle « Déplacer le Vol »** : en attente, le pion Vol sert à la place.

## Méthode de travail

À chaque changement : tests (simulations Node, partie en cliquant au hasard dans le navigateur, scan de la version anglaise), puis envoi sur GitHub et mise à jour de l'artefact.
