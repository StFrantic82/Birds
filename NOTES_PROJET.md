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
| `i18n.js` | Traduction FR → EN appliquée à l'affichage, et moteur de traduction commun |
| `i18n_it.js` | Traduction FR → IT (mêmes motifs que l'anglais) |
| `train-worker.js` | Entraînement de l'IA en arrière-plan (Web Worker), lancé depuis Statistiques |
| `peerdb.js` | Jeu en ligne hors de claude.ai : imite l'API « db » au-dessus d'une connexion directe PeerJS |
| `cards/`, `obj/`, `perso/`, `icons/` | Images des 160 cartes (+ `S1`–`S4` : Mouettes niveaux 1 à 4), tuiles d'objectifs, objectifs personnels, icônes et pions |

## Vocabulaire (FR / EN / IT)

**Nuée / Flock / Stormo** (ancien nom FR : Vol), Couvée / Brood, S'étendre / Expand, Récolter / Gather, Construire / Build, Nid / Nest, Sanctuaire / Shrine (ancien nom : House), Atelier / Workshop (ancien nom : Outpost), Chemin des Anciens / Elders' Path, **Rune / Amulet** (jetons, ancien nom : Rune), **Relique / Relic** (cartes rangées dans les Sanctuaires), Écaille de dragon / Dragonscale, Colonie / **Settlement**, Ruine = Lac (Lake), Discover = Expand.
Italien : Poussin / Pulcino, Œuf / Uovo, Nid / Nido, Sanctuaire / Santuario, Atelier / Laboratorio, Chemin des Anciens / Sentiero degli Antichi, Couvée / Covata, Mouette / Gabbiano, Écaille / Scaglia, Colonie / Colonia.

## Règles validées avec l'autrice

- **Mise en place** : 25 marqueurs Œuf/Poussin par joueur (2 Œufs, 3 Poussins, 1 Poussin sur l'île de départ, 19 en réserve). 4 tuiles de départ : Marais, Jungle, Désert, Toundra. **À 2 joueurs** : 1 Poussin neutre dans la région de départ de la Montagne et 1 dans celle de la Prairie. Rien de spécial à 3-4 joueurs.
- **Objectif personnel** : 2 cartes proposées, 1 gardée. 1 Étoile quand le total des deux tags atteint 5, une autre à 9 (tags joker compris). Les ressources du bas de la carte sont gagnées tout de suite.
- **Objectifs communs** : 1 tuile rouge et 1 bleue, avec les seuils du bas des tuiles. Chaque seuil est pris dans l'ordre, 1 Étoile par joueur et par tuile. Les objectifs de coût comptent toutes les cartes en jeu et les Mouettes (coût = niveau). Experienced Watchers = **total** de Poussins dans des régions avec Ruine.
- **Bâtiments** : construction **dans n'importe quel ordre**. Les effets « build your cheapest… » gardent le moins cher. Chaque bâtiment touche 2 régions. Nid 1 = 3 poussins + 1 graine, Nid 2 = + 2 graines, Nid 3 = + 3 graines (corriger l'annexe des règles, qui dit 2).
- **Nids** : 2 Œufs chacun, 3 avec l'Rune Nid. Le surplus d'Œufs pondus est perdu. La Couvée fait éclore tous les Œufs, puis pond.
- **Sanctuaires** : capacité 2 / 3 / 4 / 5 en **taille** (somme des coûts des Reliques), +1 avec l'Rune. Poser une Relique est gratuit.
- **Reliques à Étoile** : l'Étoile est posée sur la carte, puis rejoint le plateau quand la condition est remplie.
- **Mouettes** : 4 niveaux. Niv. 1 : Couvée = 1 Œuf. Niv. 2 : + 1 case Anciens. Niv. 3 : + tag joker. Niv. 4 : en l'atteignant (une seule fois), retirer de son plateau le bâtiment le moins cher **du type de son choix**. Gagner une Mouette = en prendre une nouvelle au niveau 1 **ou** en améliorer une. Une Mouette compte comme un Oiseau de coût égal à son niveau.
- **Chemin des Anciens** : 12 cases, piste infinie. Case 3 : nourriture au choix. Case 5 : gagner ou améliorer une Mouette. Case 7 : Rune. Case 9 : 1 Poussin ou jusqu'à 2 Écailles. Case 12 : Étoile. L'affichage commence à 0, la case de départ devient 12 après un tour.
- **Sacrifier** = détruire une de ses cartes en jeu (une Mouette compte). **Défausser** = depuis la main.
- **Search the next X cards** : garder 1 carte, défausser les autres. Archivist = deux recherches de 3.
- **Supply Crate** : pour chaque Oiseau joué, on peut dépenser 1 graine ou 1 fruit pour réduire son coût de 2.
- **Étoile éclair** = « lorsque vous gagnez une Étoile ». Les cartes Feather Pouch, Messenger Pouch et Shadow Cloak ont été corrigées dans ce sens (fichiers fournis).

## Ce que fait l'application

- 2 à 4 joueurs humains ou IA sur le même écran (2 joueurs par défaut), choix de la couleur (rouge, bleu, blanc, violet), FR / EN / IT. IA toujours au niveau le plus fort et sans temps d'attente.
- **Jeu en ligne** (uniquement dans l'artefact sur claude.ai, pas sur GitHub Pages) : l'hôte crée une partie et obtient un code de 4 caractères, les amis rejoignent avec ce code ; places vides complétables par des IA. L'appareil de l'hôte fait tourner le moteur et les IA ; l'état est partagé par la base de l'artefact (`games/<code>`, `joins/<id>`, `acts/<id>`). Les amis doivent avoir l'artefact partagé en Contributeur ou Éditeur. Si l'hôte ferme la page, la partie s'arrête.
- **Ergonomie** : zone d'action et main toujours visibles en bas de l'écran ; onglets par joueur (cartes en jeu, Mouettes en cartes, plateau joueur) ; choix des cartes directement dans la main ; icônes des bâtiments à la couleur du joueur ; Poussins du plateau perso en grille ; bouton Accueil (double clic).
- **Annuler** : « ↶ Annuler mon dernier choix » (Ctrl+Z) jusqu'au début de son tour ; le tour se termine par « Finir le tour » (Entrée). Fonctionne par instantané de l'état + rejeu des choix (`Game.takeTurnUndoable`).
- **Écailles** : utilisables avant l'action, entre deux cartes jouées et en fin de tour.
- **Statistiques partagées** (artefact claude.ai) : les autres joueurs peuvent envoyer leurs parties (bouton en fin de partie, ou « Envoyer mes parties à l'auteur » dans Statistiques) ; elles arrivent dans la base (`sharedstats/<id de partie>`) et le propriétaire les voit avec le filtre « Reçues des joueurs ». En ligne, chaque invité reçoit aussi l'enregistrement de la partie.
- **Entraînement de l'IA** (Statistiques) : à chaque génération, un challenger aux réglages légèrement modifiés affronte l'IA actuelle ; adopté s'il gagne nettement plus que sa part attendue (seuil : +4 pts et 1,6 écart-type), option « parties rapides ». Les réglages adoptés sont enregistrés dans le navigateur (`birds_aiw`) et, sur claude.ai, partagés avec tous les joueurs (`ai/best` dans la base) ; bouton pour revenir aux réglages d'origine. Les poids passent par `window.AIW` (lu par `W(p)`).
- **Statistiques** : résumé par tag (icônes) = moyenne des écarts de victoire des cartes du tag, pondérée par le nombre de parties ; ligne « Sans tag » (Alliés et Reliques sans tag). Page des statistiques en FR / EN / IT.
- Plateau avec pions en bois, ombre sur les îles hors de portée du Vol, présence par île, parchemin avec les tuiles et les Étoiles.
- Plateau joueur complet : bâtiments, Œufs dans les Nids, Poussins, Runes, Étoiles, Reliques glissées sous les Sanctuaires, objectif personnel glissé au-dessus.
- Boutons d'action avec icônes, sous le Chemin des Anciens. Aide de jeu.
- **Statistiques** : parties enregistrées dans le navigateur, simulations IA, Étoiles par source, objectifs, bâtiments, Runes, Colonies, cartes (taux de victoire, aperçu au survol), export JSON et image.

## IA (réglages dans `engine.js` : `AIW_CLASSIC`, `AIW_TRAINED`, fonction `W(p)`)

Depuis novembre 2026 : poids appris par auto-apprentissage (parties IA contre IA, `AIW_TRAINED`) + **anticipation** : avant chaque action principale, elle simule 3 fins de partie pour ses 6 meilleurs choix (mains adverses et pioche redistribuées au hasard) et garde le plus gagnant (`aiMainLookahead`, `rollout`). Résultat à 2 joueurs : 6 Étoiles vers la manche 21,7 (contre 26 avant), 85 % de victoires contre l'ancienne IA, environ 0,25 s de réflexion par tour.


Vise les Colonies, récolte ce qui débloque les cartes de sa main, saisit les Étoiles immédiates (« tempo »), couve surtout sans Poussins (double Couvée en fin de partie si elle rapporte une Étoile). Elle choisit ses Runes selon le contexte (joker en priorité) et ses Mouettes aussi (améliorer par défaut, gagner selon les objectifs, les Œufs ou les sacrifices). Elle sacrifie l'élément qui lui coûte le moins, construit de grands Sanctuaires quand les Reliques comptent, et poursuit ses objectifs (personnel, rouge, bleu, Reliques à Étoile).
Durée moyenne entre IA : environ 23 manches à 2 joueurs, 21,3 à 3, 20,8 à 4. Les parties humaines durent environ 20 manches.

## Ressources de départ des objectifs personnels : deux jeux au choix

Sur l'accueil, « Objectifs personnels : Classiques / Recommandés » (Recommandés par défaut, choix mémorisé). Classiques = ressources de la règle d'origine, images `perso/`. Recommandés = tableau ci-dessous, images `perso2/` (fournies par l'auteur). Dans `engine.js`, chaque objectif a `res` (classique) et `resNew` (recommandé) ; option de partie `persoSet`. Les statistiques enregistrent le jeu utilisé (`pset`) et ont un filtre « Objectifs perso ».

Recommandés — tous les joueurs commencent avec 2 Œufs et 3 Poussins ; l'objectif choisi ajoute (ou retire) :

| Objectif | Tags | Départ |
|---|---|---|
| Robins | Academy + Legion | +1 Poussin, 1 Ancien, 2 vers, 1 fruit |
| Swans | Academy + Court | Mouette, −1 Poussin, 1 ver |
| Storks | Academy + Guild | −1 Poussin, 2 graines, 1 Ancien, 1 ver, 1 Rune |
| Ravens | Academy + Circle | 1 graine, 1 ver, 1 fruit, 1 Rune |
| Eagles | Legion + Court | Mouette, −1 Poussin, 1 fruit, 1 ver |
| Kingfishers | Legion + Guild | 1 Ancien, 2 vers, 1 graine, 1 fruit |
| Falcons | Legion + Circle | +1 Poussin, 1 graine, 1 ver, 1 Rune |
| Woodpeckers | Court + Guild | 2 Anciens, 2 vers, 1 fruit |
| Owls | Court + Circle | 2 vers, 1 graine, 1 fruit |
| Magpies | Guild + Circle | +1 Poussin, 1 Ancien, 3 vers (sans Mouette) |

Contraintes : autant de graines que de fruits (6 et 6), 3 objectifs à Rune et 2 à Mouette au plus, combinaisons toutes différentes. Total : 39 éléments (32 dans la règle d'origine) ; l'écart vient surtout de Magpies, dont la Mouette (1 élément mais environ 4 nourritures de valeur) est remplacée par plusieurs éléments. Totaux : 16 vers, 6 graines, 6 fruits, 2 Mouettes, 6 Anciens, 3 Runes, Poussins +3 / −3. Les 10 combinaisons sont toutes différentes. Magpies a perdu sa Mouette (une Mouette vaut environ 4 nourritures, surtout grâce à ses améliorations : +12,1 pts, contre +5,4 pts si elle reste bloquée au niveau 1).
Résultat (14 000 parties IA contre IA à 2 joueurs, version finale) : chaque objectif gagne entre 47,8 % et 51,8 % quand il est choisi (objectifs classiques : 42 % à 62 %). L'écran de choix affiche aussi la ligne « Départ ».

Valeur mesurée d'une ressource ajoutée au départ (gain de victoire, 2 joueurs) : Mouette +12,5 pts ; graine +4,2 ; +1 Poussin +4,1 ; case des Anciens +3,5 ; ver +2,2 ; fruit +2,1 ; Rune +1,7 ; −1 Poussin −4,9. Ces valeurs ne s'additionnent qu'approximativement : l'équilibre final a été réglé par simulations successives. Outils : `train/` (non versionné) — `extra.js` (valeur d'une ressource), `pv_run.sh` (équilibre des objectifs).

## Points ouverts

1. **Ressources de départ des objectifs personnels** : la Mouette de départ vaut à elle seule environ 12 à 15 points de victoire (Magpies 44 %, Swans 42 %, Storks 26 %). La meilleure variante testée, sans Mouette et avec 1 ver + 1 nourriture par famille (graine pour l'Academy et la Court, ver pour la Legion et le Circle, fruit pour la Guild), ramène les victoires entre 29 et 37 %. **À faire** : proposer et simuler une variante qui garde des cases du Chemin des Anciens au départ (demande de l'autrice). Rien n'est encore appliqué dans le jeu.
2. **Experienced Watchers** : trop facile (toutes les Étoiles prises, vers la manche 10). Seuils suggérés : 7 / 8 / 8 / 9 en 3-4 joueurs, environ 6 / 7 à 2 joueurs. Non appliqué.
3. **Prairie** : île la moins colonisée (grande île, pas une île de départ, bonus peu attractifs).
4. **Jeu en ligne entre amis** : fait, sur claude.ai (base de l'artefact) **et** sur GitHub Pages (connexion directe entre navigateurs, WebRTC via PeerJS chargé depuis unpkg.com, `peerdb.js` ; le code de partie sert d'adresse `birds-v1-CODE` ; aucun compte ni serveur à gérer). Sur GitHub, une partie se joue entre joueurs passant tous par GitHub ; certains réseaux très fermés (entreprise, certains mobiles) peuvent bloquer la connexion directe. L'envoi des statistiques à l'auteur reste réservé à claude.ai.
5. **Choix des cartes par l'IA** : c'est son point faible.
6. **Icône officielle « Déplacer la Nuée »** : en attente, le pion Nuée sert à la place.
7. **Tutoriel** : prévu (partie guidée avec bulles, FR / EN / IT), pas encore fait.

## Méthode de travail

À chaque changement : tests (simulations Node, partie en cliquant au hasard dans le navigateur, scan des versions anglaise et italienne), puis **les deux en même temps** : publication de l'artefact **et** commit + push sur `main` de ce dépôt, avec les mêmes fichiers. Ne jamais publier l'un sans l'autre.

### Critère d'adoption de l'entraînement (objectif : finir vite)
Le challenger est adopté s'il gagne nettement plus que sa part attendue (> attendu + max(4 %, 1,6 σ)), OU s'il est aussi fort (≥ attendu − 2 %) et atteint ses 6 étoiles au moins 1/3 de manche plus tôt que l'IA actuelle dans les mêmes parties (6 étoiles non atteintes = fin de partie + 3). Pas d'option « Parties rapides » : la vitesse fait toujours partie du critère. Le journal affiche « 6 étoiles : challenger / actuelle ».

### Statistiques : durée, rythme, boule de neige, ouverture, économie
- Durée des parties : histogramme des manches, % ≤ 18 manches (jaune), médiane/min/max.
- Rythme des étoiles : manche moyenne de la k-ième étoile (tous/gagnants/perdants), écart avec la précédente, % qui l'atteignent.
- Effet boule de neige : leader unique à mi-partie (étoiles au round floor(manches/2)) → % victoire, % remontées, % sans leader ; écart final 1er-2e.
- Ouverture : vitesse des étoiles par objectif personnel (1re/3e/6e étoile) ; 1re action et 2 premières actions (p.acts.seq, codes E/G/B/N/P/C) avec % victoires et manche de la 6e étoile.
- Économie : p.eco {start, harvest, gain, spent} + left (nourriture restante), chicks, supply (réserve), eggs.

### IA : étoiles des cartes (poids `cgoal`, 2 par défaut dans AIW_TRAINED)
`condGap(p,id)` mesure l'écart à la condition des Reliques à étoile (OB6, OB7, OG7, OP6, OR6, OR7, OY6, OY7) ; `cgB(p,id,d)` donne un bonus aux actions qui rapprochent de l'étoile (constructions, Mouettes, Runes via S'étendre, Alliés, coût des Oiseaux, tags), fort quand l'action la complète. `starCardValue` valorise la pose d'une carte à étoile selon sa faisabilité (Reliques conditionnelles, Soul Reliquary, Provision Cache, Black Codex, Guild Treasury, Ant). Écailles placées en priorité sur Guild Treasury ; besoin de nourriture pour Provision Cache. cgoal:0 = ancien comportement.
Mesure (IA rapide, 2 j) : étoiles de cartes 0,14 → 0,23 par joueur ; en duel contre l'ancienne IA 52,1 % (2 000 parties, 2 j), 34,6 % à 3 j. Restent difficiles : Master's Diploma (4 Nids), Alliance Charter (4 Alliés), Command Insignia (Mouettes niveau total 6), Soul Reliquary (rarement payable).
