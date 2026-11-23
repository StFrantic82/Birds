// Tutoriel guidé de Birds : une vraie partie contre une IA, commentée par la Mouette.
(function(){
'use strict';
const LG=()=>window.I18N?I18N.lang:'fr';
const T=(fr,en,it)=>LG()==='en'?en:LG()==='it'?it:fr;
const $=s=>document.querySelector(s);
let UI=null, on=false, cur=0, box=null, spot=null, block=null, timer=null, tipQ=[], tip=null, seen={}, humanName='';

// ----- reconnaissance des questions posées par le moteur -----
const A={
  personal:q=>!!q.personal, main:q=>!!q.main,
  pick:q=>/^Choisissez une carte adjacente/.test(q.title), dest:q=>/^Où va votre Nuée/.test(q.title), action:q=>/^Action en /.test(q.title),
  end:q=>!!q.endTurn, play:q=>/^Jouer une carte/.test(q.title)&&!!q.cards, mid:q=>/^Entre deux cartes/.test(q.title), work:q=>/^Atelier : défausser/.test(q.title)
};
const kindIs=(o,k)=>o.value&&typeof o.value==='object'&&o.value.kind===k;
const onlyKind=k=>(q,o)=>q.options.some(x=>kindIs(x,k))?!kindIs(o,k):false;
const mainOnly=v=>(q,o)=>o.value!==v;
// ----- le scénario -----
const S=[
 {id:'intro',btn:true,txt:()=>T("Salut ! Moi, c'est la Mouette, et je vais te guider pendant ta première partie de Birds.<br><br><b>Le but :</b> être le premier à gagner <b>6 Étoiles</b>. Dès qu'un joueur en a 6, on termine la manche en cours et la partie s'arrête.<br><br>On y va ?",
   "Hi! I'm the Seagull, and I'll guide you through your first game of Birds.<br><br><b>The goal:</b> be the first to earn <b>6 Stars</b>. As soon as a player has 6, the current round is finished and the game ends.<br><br>Ready?",
   "Ciao! Io sono il Gabbiano e ti guiderò nella tua prima partita a Birds.<br><br><b>Lo scopo:</b> essere il primo a ottenere <b>6 Stelle</b>. Appena un giocatore ne ha 6, si termina il round in corso e la partita finisce.<br><br>Pronto?"),ok:()=>T("C'est parti !","Let's go!","Andiamo!")},
 {id:'perso',ask:A.personal,adv:true,sel:'#pchoice .pcbox',txt:()=>T("Choisis d'abord ton <b>objectif personnel</b>. Il compte deux tags (les symboles en haut des cartes) : quand le total de ces deux tags sur tes cartes en jeu atteint <b>5</b>, tu gagnes 1 Étoile, puis une autre à <b>9</b>.<br>Les ressources en bas de la carte te sont données tout de suite. Clique celui qui te plaît.",
   "First, choose your <b>personal objective</b>. It counts two tags (the symbols at the top of the cards): when the total of these two tags on your cards in play reaches <b>5</b>, you earn 1 Star, then another at <b>9</b>.<br>The resources at the bottom of the card are given right away. Click the one you like.",
   "Per prima cosa scegli il tuo <b>obiettivo personale</b>. Conta due tag (i simboli in alto sulle carte): quando il totale di questi due tag sulle tue carte in gioco arriva a <b>5</b>, ottieni 1 Stella, poi un'altra a <b>9</b>.<br>Le risorse in basso sulla carta le ricevi subito. Clicca quello che preferisci.")},
 {id:'board',btn:true,sel:'#boardwrap',txt:()=>T("Voici le plateau et ses <b>6 îles</b>. Ton pion <b>Nuée</b> (à ta couleur) est sur ton île de départ, avec un Poussin.<br>Les <b>6 cartes</b> posées autour forment la rivière : c'est là que ta Nuée prend des cartes. Les îles grisées sont hors de portée ce tour-ci.",
   "Here is the board and its <b>6 islands</b>. Your <b>Flock</b> pawn (in your colour) is on your starting island, with one Chick.<br>The <b>6 cards</b> around it form the river: that's where your Flock takes cards. Greyed-out islands are out of reach this turn.",
   "Ecco il tabellone con le sue <b>6 isole</b>. La tua pedina <b>Stormo</b> (del tuo colore) è sulla tua isola di partenza, con un Pulcino.<br>Le <b>6 carte</b> intorno formano il fiume: è lì che il tuo Stormo prende le carte. Le isole in grigio sono fuori portata in questo turno.")},
 {id:'pres',btn:true,sel:'#boardwrap',txt:()=>T("Sous chaque île, les pastilles de couleur montrent la <b>présence</b> de chaque joueur : <b>1 par Poussin, 2 par bâtiment</b>.<br>Le premier à atteindre <b>6 de présence</b> sur une île y fonde une <b>Colonie</b> et gagne l'Étoile dorée de l'île. Le 2e sur l'île pioche des cartes en compensation.",
   "Under each island, the coloured dots show each player's <b>presence</b>: <b>1 per Chick, 2 per building</b>.<br>The first to reach <b>6 presence</b> on an island founds a <b>Settlement</b> there and earns the island's golden Star. The runner-up on that island draws cards as compensation.",
   "Sotto ogni isola, i dischetti colorati mostrano la <b>presenza</b> di ogni giocatore: <b>1 per Pulcino, 2 per edificio</b>.<br>Il primo che arriva a <b>6 di presenza</b> su un'isola vi fonda una <b>Colonia</b> e ottiene la Stella dorata dell'isola. Il secondo su quell'isola pesca carte come compenso.")},
 {id:'panel',btn:true,sel:'#players',txt:()=>T("À droite, le résumé de chaque joueur : <b>nourritures</b> (vers, graines, fruits), <b>Poussins</b> disponibles, <b>Œufs</b>, Étoiles, tags…<br>Sous le plateau, tu retrouves tes cartes en jeu et ton plateau joueur, et en bas ta main.",
   "On the right, each player's summary: <b>food</b> (worms, seeds, fruits), available <b>Chicks</b>, <b>Eggs</b>, Stars, tags…<br>Below the board you'll find your cards in play and your player board, and your hand at the bottom.",
   "A destra, il riepilogo di ogni giocatore: <b>cibo</b> (vermi, semi, frutti), <b>Pulcini</b> disponibili, <b>Uova</b>, Stelle, tag…<br>Sotto il tabellone trovi le tue carte in gioco e la tua plancia, e in basso la tua mano.")},
 {id:'objs',btn:true,sel:'#objs',txt:()=>T("Les objectifs <b style='color:#c0392b'>rouge</b> et <b style='color:#2f6fb5'>bleu</b> sont communs à tous : les premiers à atteindre le seuil indiqué gagnent 1 Étoile. Il y a peu de places, alors ne traîne pas !",
   "The <b style='color:#c0392b'>red</b> and <b style='color:#2f6fb5'>blue</b> objectives are shared by everyone: the first players to reach the threshold earn 1 Star. Places are limited, so don't dawdle!",
   "Gli obiettivi <b style='color:#c0392b'>rosso</b> e <b style='color:#2f6fb5'>blu</b> sono comuni a tutti: i primi che raggiungono la soglia indicata ottengono 1 Stella. I posti sono pochi, quindi non perdere tempo!")},
 {id:'move1',ask:A.main,blk:1,off:mainOnly('move'),sel:'#prompt',txt:()=>T("À toi de jouer ! À chaque tour, tu fais <b>une seule action</b> parmi trois.<br>Commençons par <b>« Déplacer la Nuée puis agir »</b> : clique dessus.",
   "Your turn! Each turn, you take <b>one action</b> out of three.<br>Let's start with <b>“Move Flock then act”</b>: click it.",
   "Tocca a te! A ogni turno fai <b>una sola azione</b> fra tre.<br>Cominciamo con <b>«Muovi lo Stormo poi agisci»</b>: cliccala.")},
 {id:'pick1',ask:A.pick,blk:1,sel:'#boardwrap',txt:()=>T("Choisis une carte de la rivière <b>à côté de ta Nuée</b> (en surbrillance). Elle va dans ta main, et <b>son coût indique jusqu'où ta Nuée peut voler</b>.",
   "Pick a river card <b>next to your Flock</b> (highlighted). It goes into your hand, and <b>its cost tells how far your Flock can fly</b>.",
   "Scegli una carta del fiume <b>accanto al tuo Stormo</b> (evidenziata). Va nella tua mano, e <b>il suo costo indica fin dove può volare il tuo Stormo</b>.")},
 {id:'dest1',ask:A.dest,blk:1,sel:'#boardwrap',txt:()=>T("Choisis maintenant l'île où atterrit ta Nuée (les îles en surbrillance sont à portée).",
   "Now choose the island where your Flock lands (highlighted islands are in reach).",
   "Ora scegli l'isola dove atterra il tuo Stormo (le isole evidenziate sono raggiungibili).")},
 {id:'expand',ask:A.action,blk:1,off:onlyKind('expand'),sel:'#boardwrap',txt:()=>T("Sur l'île d'arrivée, tu fais une action. Essaie <b>« S'étendre »</b> : tu poses un Poussin sur une région vide <b>voisine d'un arbre</b>, tu y plantes un arbre et tu gagnes les <b>bonus</b> indiqués.<br>Clique une région en surbrillance.",
   "On the island where you land, you take an action. Try <b>“Expand”</b>: you place a Chick on an empty region <b>next to a tree</b>, plant a tree there and gain the <b>bonuses</b> shown.<br>Click a highlighted region.",
   "Sull'isola di arrivo fai un'azione. Prova <b>«Espandersi»</b>: metti un Pulcino in una regione vuota <b>vicina a un albero</b>, ci pianti un albero e ottieni i <b>bonus</b> indicati.<br>Clicca una regione evidenziata.")},
 {id:'end1',ask:A.end,adv:true,sel:'#prompt',txt:()=>T("Bien joué ! Avant de finir, tu peux encore utiliser certaines capacités, ou cliquer <b>« ↶ Annuler »</b> si tu t'es trompé (Ctrl+Z marche aussi).<br>Clique <b>« Finir le tour »</b>.",
   "Well done! Before ending, you can still use some abilities, or click <b>“↶ Undo”</b> if you made a mistake (Ctrl+Z works too).<br>Click <b>“End turn”</b>.",
   "Ben fatto! Prima di finire puoi ancora usare alcune abilità, o cliccare <b>«↶ Annulla»</b> se hai sbagliato (funziona anche Ctrl+Z).<br>Clicca <b>«Fine turno»</b>.")},
 {id:'ai1',wait:true,sel:'#log',txt:()=>T("C'est au tour de l'IA. Tout ce qu'elle fait s'affiche dans le <b>journal</b>, ici.","It's the AI's turn. Everything it does appears in the <b>log</b>, here.","Tocca all'IA. Tutto quello che fa appare nel <b>registro</b>, qui.")},
 {id:'move2',ask:A.main,blk:2,off:mainOnly('move'),sel:'#prompt',txt:()=>T("Nouveau tour ! Reprends <b>« Déplacer la Nuée puis agir »</b> : cette fois, on va <b>Récolter</b> de la nourriture.",
   "New turn! Choose <b>“Move Flock then act”</b> again: this time we'll <b>Gather</b> food.",
   "Nuovo turno! Scegli di nuovo <b>«Muovi lo Stormo poi agisci»</b>: questa volta <b>Raccogliamo</b> cibo.")},
 {id:'pick2',ask:A.pick,blk:2,sel:'#boardwrap',txt:()=>T("Prends une carte de la rivière à côté de ta Nuée…","Take a river card next to your Flock…","Prendi una carta del fiume accanto al tuo Stormo…")},
 {id:'dest2',ask:A.dest,blk:2,sel:'#boardwrap',txt:()=>T("…puis choisis une île, de préférence avec des arbres.","…then choose an island, preferably one with trees.","…poi scegli un'isola, meglio se con degli alberi.")},
 {id:'gather',ask:A.action,blk:2,off:onlyKind('gather'),sel:'#boardwrap',txt:()=>T("<b>« Récolter »</b> : pose un Poussin sur une région <b>qui a un arbre</b>. Tu gagnes <b>2 nourritures</b> du type de cet arbre (gris = vers, jaune = graines, vert = fruits), <b>+1 par autre arbre</b> de l'île.",
   "<b>“Gather”</b>: place a Chick on a region <b>with a tree</b>. You gain <b>2 food</b> of that tree's type (grey = worms, yellow = seeds, green = fruits), <b>+1 per other tree</b> on the island.",
   "<b>«Raccogliere»</b>: metti un Pulcino in una regione <b>con un albero</b>. Ottieni <b>2 cibi</b> del tipo di quell'albero (grigio = vermi, giallo = semi, verde = frutti), <b>+1 per ogni altro albero</b> dell'isola.")},
 {id:'end2',ask:A.end,adv:true,sel:'#prompt',txt:()=>T("Parfait. Clique <b>« Finir le tour »</b>.","Perfect. Click <b>“End turn”</b>.","Perfetto. Clicca <b>«Fine turno»</b>.")},
 {id:'ai2',wait:true,sel:'#log',txt:()=>T("L'IA joue…","The AI is playing…","L'IA sta giocando…")},
 {id:'play',ask:A.main,blk:3,off:(q,o)=>{const p=q.options.find(x=>x.value==='play'); return p&&!p.disabled?o.value!=='play':o.value!=='move';},sel:'#prompt',
   txt:q=>{const p=q&&q.options.find(x=>x.value==='play'); return p&&p.disabled?T("Aucune carte de ta main n'est encore payable. Pas grave : refais <b>« Déplacer la Nuée puis agir »</b> pour récolter ou t'étendre, on posera des cartes plus tard.","None of your cards is affordable yet. No problem: take <b>“Move Flock then act”</b> again to gather or expand, we'll play cards later.","Nessuna carta della tua mano è ancora pagabile. Nessun problema: rifai <b>«Muovi lo Stormo poi agisci»</b> per raccogliere o espanderti, giocheremo le carte più tardi."):
     T("Avec ta nourriture, tu peux poser des cartes : choisis <b>« Jouer jusqu'à 2 cartes »</b>.","With your food you can play cards: choose <b>“Play up to 2 cards”</b>.","Con il tuo cibo puoi giocare carte: scegli <b>«Gioca fino a 2 carte»</b>.");}},
 {id:'playc',ask:A.play,blk:3,sel:'#myhand',txt:()=>T("Clique une carte en surbrillance dans ta main. Le <b>coût</b> est en haut à gauche, et le bas de la carte indique les nourritures acceptées.<br><b>Oiseaux</b> : posés devant toi. <b>Reliques</b> : rangées dans un Sanctuaire. <b>Alliés</b> : ont des conditions. Les tags des cartes posées font avancer tes objectifs.",
   "Click a highlighted card in your hand. The <b>cost</b> is at the top left, and the bottom of the card shows which food is accepted.<br><b>Birds</b>: placed in front of you. <b>Relics</b>: stored in a Shrine. <b>Allies</b>: have conditions. The tags of the cards you play advance your objectives.",
   "Clicca una carta evidenziata nella tua mano. Il <b>costo</b> è in alto a sinistra, e il fondo della carta indica i cibi accettati.<br><b>Uccelli</b>: messi davanti a te. <b>Reliquie</b>: riposte in un Santuario. <b>Alleati</b>: hanno condizioni. I tag delle carte giocate fanno avanzare i tuoi obiettivi.")},
 {id:'mid',ask:A.mid,blk:3,sel:'#prompt',txt:()=>T("Entre deux cartes, tu peux utiliser une capacité Écaille, jouer la carte suivante ou t'arrêter.","Between two cards, you can use a Dragonscale ability, play the next card or stop.","Tra due carte puoi usare un'abilità Scaglia, giocare la carta successiva o fermarti.")},
 {id:'end3',ask:A.end,adv:true,sel:'#prompt',txt:()=>T("Clique <b>« Finir le tour »</b>.","Click <b>“End turn”</b>.","Clicca <b>«Fine turno»</b>.")},
 {id:'ai3',wait:true,sel:'#log',txt:()=>T("L'IA joue…","The AI is playing…","L'IA sta giocando…")},
 {id:'brood',ask:A.main,blk:4,off:mainOnly('brood'),sel:'#prompt',txt:()=>T("Tu commences à manquer de Poussins ? C'est le moment de la <b>Couvée</b>. Tes Œufs éclosent en Poussins, chaque Nid pond 1 Œuf, tu peux défausser 1 carte pour avancer sur le Chemin des Anciens (et déclencher tes Ateliers), puis tes Mouettes et les cartes avec <b>↻</b> s'activent.<br>Pense à la faire quand tu n'as plus beaucoup de Poussins !",
   "Running low on Chicks? Time for a <b>Brood</b>. Your Eggs hatch into Chicks, each Nest lays 1 Egg, you may discard 1 card to advance on the Elders' Path (and trigger your Workshops), then your Seagulls and cards with <b>↻</b> activate.<br>Do it when you're running low on Chicks!",
   "Ti mancano Pulcini? È il momento della <b>Covata</b>. Le tue Uova si schiudono in Pulcini, ogni Nido depone 1 Uovo, puoi scartare 1 carta per avanzare sul Sentiero degli Antichi (e attivare i tuoi Laboratori), poi si attivano i tuoi Gabbiani e le carte con <b>↻</b>.<br>Falla quando ti restano pochi Pulcini!")},
 {id:'work',ask:A.work,blk:4,sel:'#prompt',txt:()=>T("Pendant la Couvée, tu peux <b>défausser 1 carte</b> (réponds « Oui », puis clique la carte dans ta main) : tu avances d'1 case sur le Chemin des Anciens, et <b>chaque Atelier construit</b> déclenche son effet, de gauche à droite : piocher 1 carte, 1 Écaille, +1 case sur le Chemin, 1 Poussin sur une ruine.","During the Brood, you may <b>discard 1 card</b> (answer “Yes”, then click the card in your hand): you move 1 space on the Elders' Path, and <b>each Workshop you built</b> triggers its effect, from left to right: draw 1 card, 1 Dragonscale, +1 space on the Path, 1 Chick on a ruin.","Durante la Covata puoi <b>scartare 1 carta</b> (rispondi «Sì», poi clicca la carta nella tua mano): avanzi di 1 casella sul Sentiero degli Antichi e <b>ogni Laboratorio costruito</b> attiva il suo effetto, da sinistra a destra: pescare 1 carta, 1 Scaglia, +1 casella sul Sentiero, 1 Pulcino su una rovina.")},
 {id:'end5',ask:A.end,adv:true,sel:'#prompt',txt:()=>T("Clique <b>« Finir le tour »</b>.","Click <b>“End turn”</b>.","Clicca <b>«Fine turno»</b>.")},
 {id:'ai4',wait:true,sel:'#log',txt:()=>T("L'IA joue…","The AI is playing…","L'IA sta giocando…")},
 {id:'build',ask:A.main,blk:5,off:mainOnly('move'),sel:'#prompt',txt:q=>(q&&(q.options.find(o=>o.value==='move')||{}).disabled?T("Tu n'as plus de Poussin disponible pour déplacer ta Nuée : fais plutôt une <b>Couvée</b> (ou joue des cartes), on construira au tour suivant.<br><br>","You have no Chick left to move your Flock: do a <b>Brood</b> instead (or play cards), we'll build next turn.<br><br>","Non hai più Pulcini per muovere lo Stormo: fai piuttosto una <b>Covata</b> (o gioca carte), costruiremo al prossimo turno.<br><br>"):'')+T("Dernière action à découvrir : <b>construire</b> ! Choisis <b>« Déplacer la Nuée puis agir »</b>.","Last action to discover: <b>build</b>! Choose <b>“Move Flock then act”</b>.","Ultima azione da scoprire: <b>costruire</b>! Scegli <b>«Muovi lo Stormo poi agisci»</b>.")},
 {id:'pick4',ask:A.pick,blk:5,sel:'#boardwrap',txt:()=>T("Une carte de la rivière…","A river card…","Una carta del fiume…")},
 {id:'dest4',ask:A.dest,blk:5,sel:'#boardwrap',txt:()=>T("…et une île où tu as des Poussins (construire coûte moins cher à côté d'eux).","…and an island where you have Chicks (building is cheaper next to them).","…e un'isola dove hai dei Pulcini (costruire costa meno vicino a loro).")},
 {id:'buildact',ask:A.action,blk:5,off:onlyKind('build'),sel:'#boardwrap',txt:q=>(q&&!q.options.some(o=>kindIs(o,'build'))?T("Pas de bâtiment possible ici (il faut des Poussins et parfois de la nourriture) : fais une autre action, tu construiras plus tard.<br><br>","No building possible here (you need Chicks and sometimes food): take another action, you'll build later.<br><br>","Qui non puoi costruire (servono Pulcini e a volte cibo): fai un'altra azione, costruirai più tardi.<br><br>"):'')+
   T("<b>Construire</b> se fait sur un emplacement rond voisin d'un arbre. Ça coûte des Poussins (−1 par Poussin voisin, minimum 1) et parfois de la nourriture.<br><b>Nid</b> : +2 places d'Œufs. <b>Sanctuaire</b> : accueille tes Reliques. <b>Atelier</b> : se déclenche pendant ta Couvée. Chaque bâtiment compte <b>2 de présence</b>.",
   "<b>Building</b> happens on a round spot next to a tree. It costs Chicks (−1 per adjacent Chick, minimum 1) and sometimes food.<br><b>Nest</b>: +2 Egg spaces. <b>Shrine</b>: holds your Relics. <b>Workshop</b>: triggers during your Brood. Each building counts as <b>2 presence</b>.",
   "Si <b>costruisce</b> su uno spazio rotondo vicino a un albero. Costa Pulcini (−1 per ogni Pulcino vicino, minimo 1) e a volte cibo.<br><b>Nido</b>: +2 posti per le Uova. <b>Santuario</b>: accoglie le tue Reliquie. <b>Laboratorio</b>: si attiva durante la tua Covata. Ogni edificio vale <b>2 di presenza</b>.")},
 {id:'end4',ask:A.end,adv:true,sel:'#prompt',txt:()=>T("Tu connais maintenant les 3 actions ! Clique <b>« Finir le tour »</b>, je t'explique encore quelques petites choses.","You now know all 3 actions! Click <b>“End turn”</b>, I'll explain a few more things.","Ora conosci le 3 azioni! Clicca <b>«Fine turno»</b>, ti spiego ancora qualche cosa.")},
 {id:'elders',btn:true,sel:'#elders',txt:()=>T("Le <b>Chemin des Anciens</b> : 12 cases. Les cases 3, 5, 7 et 9 donnent un bonus (nourriture, Mouette, Rune, Poussin ou 2 Écailles), et <b>boucler le tour rapporte 1 Étoile</b>. On y avance avec la Couvée, des bonus et des cartes.",
   "The <b>Elders' Path</b>: 12 spaces. Spaces 3, 5, 7 and 9 give a bonus (food, Seagull, Rune, Chick or 2 Dragonscales), and <b>completing a lap earns 1 Star</b>. You move along it with the Brood, bonuses and cards.",
   "Il <b>Sentiero degli Antichi</b>: 12 caselle. Le caselle 3, 5, 7 e 9 danno un bonus (cibo, Gabbiano, Runa, Pulcino o 2 Scaglie), e <b>completare il giro fa ottenere 1 Stella</b>. Si avanza con la Covata, i bonus e le carte.")},
 {id:'gulls',btn:true,sel:'#hand',txt:()=>T("Les <b>Mouettes</b> sont des cartes spéciales : à chaque Couvée elles pondent un Œuf, dès le niveau 2 elles font avancer sur le Chemin, et au niveau 3 elles servent de tag joker. Tu peux les améliorer jusqu'au niveau 4.<br>Les <b>Runes</b> (5 emplacements sur ton plateau) donnent chacune un avantage permanent.",
   "<b>Seagulls</b> are special cards: at each Brood they lay an Egg, from level 2 they move you along the Path, and at level 3 they act as a wild tag. You can upgrade them up to level 4.<br><b>Runes</b> (5 spaces on your board) each give a permanent advantage.",
   "I <b>Gabbiani</b> sono carte speciali: a ogni Covata depongono un Uovo, dal livello 2 fanno avanzare sul Sentiero e al livello 3 valgono come tag jolly. Puoi migliorarli fino al livello 4.<br>Le <b>Rune</b> (5 spazi sulla tua plancia) danno ciascuna un vantaggio permanente.")},
 {id:'scales',btn:true,sel:'#hand',txt:()=>T("Certaines cartes portent le symbole <b>◈</b> suivi d'un nombre : ce sont les <b>Écailles</b>. Quand la carte en porte assez, tu peux utiliser sa capacité (<b>une fois par tour</b>), au début de ton tour, entre deux cartes ou à la fin.<br>Et certaines Reliques ou Alliés rapportent aussi une <b>Étoile</b> quand leur condition est remplie.",
   "Some cards show the <b>◈</b> symbol followed by a number: these are <b>Dragonscales</b>. When the card holds enough of them, you can use its ability (<b>once per turn</b>), at the start of your turn, between two cards or at the end.<br>And some Relics or Allies also earn a <b>Star</b> when their condition is met.",
   "Alcune carte hanno il simbolo <b>◈</b> seguito da un numero: sono le <b>Scaglie</b>. Quando la carta ne ha abbastanza, puoi usare la sua abilità (<b>una volta per turno</b>), all'inizio del turno, tra due carte o alla fine.<br>E alcune Reliquie o Alleati fanno ottenere anche una <b>Stella</b> quando la loro condizione è soddisfatta.")},
 {id:'endg',btn:true,txt:()=>T("<b>Fin de partie</b> : dès qu'un joueur a 6 Étoiles, on termine la manche. Le plus d'Étoiles gagne ; en cas d'égalité, le plus de Poussins, puis d'Œufs.<br>Les Étoiles viennent des Colonies, des objectifs (personnel, rouge, bleu), du Chemin des Anciens et de certaines cartes : mélange-les !",
   "<b>End of the game</b>: as soon as a player has 6 Stars, the round is finished. Most Stars wins; ties go to most Chicks, then Eggs.<br>Stars come from Settlements, objectives (personal, red, blue), the Elders' Path and some cards: mix them!",
   "<b>Fine partita</b>: appena un giocatore ha 6 Stelle, si termina il round. Vince chi ha più Stelle; in caso di parità, chi ha più Pulcini, poi più Uova.<br>Le Stelle arrivano da Colonie, obiettivi (personale, rosso, blu), Sentiero degli Antichi e alcune carte: combinale!")},
 {id:'tools',btn:true,sel:'#topbtns',txt:()=>T("En haut : <b>🏠 Accueil</b>, <b>Aide de jeu</b> (le résumé des règles) et <b>📊 Statistiques</b>. Survole une carte pour la zoomer.",
   "At the top: <b>🏠 Home</b>, <b>Player aid</b> (the rules summary) and <b>📊 Statistics</b>. Hover over a card to zoom in.",
   "In alto: <b>🏠 Home</b>, <b>Aiuto di gioco</b> (il riassunto delle regole) e <b>📊 Statistiche</b>. Passa sopra una carta per ingrandirla.")},
 {id:'free',btn:true,last:true,txt:()=>T("Tu sais tout ! Termine la partie à ton rythme. Je reviendrai te donner un conseil quand quelque chose de nouveau arrivera. Bon vol !","You know everything! Finish the game at your own pace. I'll be back with a tip when something new happens. Fly well!","Ora sai tutto! Finisci la partita con calma. Tornerò a darti un consiglio quando succede qualcosa di nuovo. Buon volo!"),ok:()=>T('Merci, Mouette !','Thanks, Seagull!','Grazie, Gabbiano!')}
];
// conseils ponctuels (une fois chacun)
const TIPS={
  star:()=>T("Bravo, une Étoile ! Regarde ton plateau joueur : elle y est rangée.","Well done, a Star! Look at your player board: it's placed there.","Bravo, una Stella! Guarda la tua plancia: è lì."),
  colony:()=>T("Colonie fondée ! Le joueur 2e sur l'île pioche des cartes en compensation.","Settlement founded! The runner-up on the island draws cards as compensation.","Colonia fondata! Il secondo sull'isola pesca carte come compenso."),
  ds:()=>T("Une <b>capacité Écaille</b> est prête : le bouton avec la carte te permet de l'utiliser maintenant.","A <b>Dragonscale ability</b> is ready: the button with the card lets you use it now.","Un'<b>abilità Scaglia</b> è pronta: il pulsante con la carta ti permette di usarla ora."),
  endtrig:()=>T("Quelqu'un a 6 Étoiles : c'est la <b>dernière manche</b> !","Someone has 6 Stars: this is the <b>last round</b>!","Qualcuno ha 6 Stelle: è l'<b>ultimo round</b>!"),
  hand:()=>T("Tu as plus de 6 cartes : défausse-en jusqu'à 6.","You have more than 6 cards: discard down to 6.","Hai più di 6 carte: scartane fino ad averne 6."),
  gull:()=>T("Une <b>Mouette</b> ! Tu la trouves avec tes cartes en jeu, sous le plateau.","A <b>Seagull</b>! You'll find it with your cards in play, below the board.","Un <b>Gabbiano</b>! Lo trovi con le tue carte in gioco, sotto il tabellone."),
  rune:()=>T("Une <b>Rune</b> ! Son effet est permanent : survole-la sur ton plateau joueur pour le relire.","A <b>Rune</b>! Its effect is permanent: hover over it on your player board to read it again.","Una <b>Runa</b>! Il suo effetto è permanente: passaci sopra sulla tua plancia per rileggerlo.")
};

// zoom sur une zone du plateau joueur (pboard.png 1704×723) : x,y,w,h en pixels
const ZOOM=(x,y,w,h,ht)=>`<div class="tzoom" style="height:${ht||110}px;aspect-ratio:${w}/${h};background-image:url(pboard.png);background-size:${(1704/w*100).toFixed(1)}% auto;background-position:${(x/(1704-w)*100).toFixed(1)}% ${(y/(723-h)*100).toFixed(1)}%"></div>`;
const VIS={
  work:()=>ZOOM(240,240,790,265,112),
  brood:()=>ZOOM(680,128,292,112,70),
  gulls:()=>`<div class="tvis">${[1,2,3,4].map(l=>`<img class="tcard" src="cards/S${l}.jpg" alt="">`).join('')}</div>`,
  scales:()=>`<div class="tvis"><div class="tscale"><img class="tcard" src="cards/OG6.jpg" alt=""><div class="ds"><img src="icons/scale.png"><b>2</b></div></div><div class="tsx">→</div><div class="tscale"><img class="tcard" src="cards/OG6.jpg" alt=""><div class="ds"><img src="icons/scale.png"><b>4</b></div></div></div>`
};
function step(){return S[cur];}
function pend(){return UI&&UI.pending&&UI.pending.p&&!UI.pending.p.ai?UI.pending:null;}
function blockStart(i){const b=S[i].blk; if(!b) return i; let j=i; while(j>0&&S[j-1].blk===b) j--; return j;}
// suivre la question en cours : avancer (ou revenir au début du bloc si le joueur a fait « Retour »)
function sync(){ const P=pend(); if(!P||step().btn) return; const q=P.q; if(step().ask&&step().ask(q)) return;
  for(let i=cur+1;i<Math.min(S.length,cur+7);i++){ if(S[i].btn) break; if(S[i].ask&&S[i].ask(q)){ cur=i; return; } }
  for(let i=blockStart(cur);i<cur;i++){ if(S[i].ask&&S[i].ask(q)){ cur=i; return; } } }
const API={
  get on(){return on;},
  // option bloquée par le tutoriel ?
  off(q,o){ if(!on||tip) return false; sync(); const s=step(); if(s.btn) return true; if(!s.ask||!s.ask(q)||!s.off) return false;
    if(!q.options.some(x=>!x.disabled&&!s.off(q,x))) return false; // rien d'autorisé de possible : on laisse tout
    return !!s.off(q,o); },
  answered(q){ if(!on) return; const s=step(); if(s.ask&&s.ask(q)&&s.adv){ cur=Math.min(cur+1,S.length-1); } },
  log(m){ if(!on&&!seen._free) return; const me=humanName;
    if(m.startsWith('★ '+me+' gagne')) addTip('star'); else if(m.startsWith(me+' établit une Colonie')) addTip('colony');
    else if(/la fin de partie est déclenchée/.test(m)) addTip('endtrig'); else if(m.startsWith(me+' gagne une Mouette')) addTip('gull'); else if(m.startsWith(me+' gagne une Rune')) addTip('rune'); },
  start(ui){ UI=ui; on=true; cur=0; seen={}; tipQ=[]; tip=null; humanName=UI.G.players[0].name; draw(); if(!timer) timer=setInterval(place,300); },
  draw
};
function addTip(k){ if(seen[k]) return; seen[k]=1; tipQ.push(k); }
function stop(){ on=false; seen._free=1; clearBlock(); if(box){box.remove(); box=null;} if(spot){spot.remove(); spot=null;} UI&&UI.render(); }
function clearBlock(){ if(block){block.remove(); block=null;} }
function next(){ const s=step(); if(s.last){ on=false; seen._free=1; clearBlock(); if(box){box.remove();box=null;} if(spot){spot.remove();spot=null;} UI.render(); return; } cur=Math.min(cur+1,S.length-1); UI.render(); }
function ensureBox(){ if(box) return box; box=document.createElement('div'); box.className='tuto notr'; document.body.appendChild(box);
  spot=document.createElement('div'); spot.className='tspot'; document.body.appendChild(spot); return box; }
function draw(){ if(!UI) return;
  // conseils hors scénario
  const P=pend();
  if(P&&P.q.main&&P.q.options.some(o=>o.value&&o.value.ds)) addTip('ds'); if(P&&/^Limite de main/.test(P.q.title)) addTip('hand');
  if(!tip&&tipQ.length&&(!on||!step().btn)) tip=tipQ.shift();
  if(!on&&!tip){ if(box){box.remove();box=null;} if(spot){spot.remove();spot=null;} clearBlock(); return; }
  ensureBox();
  if(tip){ box.innerHTML=`<div class="tg"><img src="icons/seagull.png" alt=""><div class="tt">${TIPS[tip]()}</div></div><div class="tb"><button class="ob tok">OK</button></div>`;
    box.querySelector('.tok').onclick=()=>{tip=null; draw(); UI.render();}; box.dataset.sel=''; clearBlock(); place(); return; }
  sync(); const s=step(); const q=P?P.q:null;
  // question hors scénario (bonus, paiement, carte…) : on laisse répondre librement
  const other=!s.btn&&P&&!(s.ask&&s.ask(q))&&!P.q.personal;
  const txt=other?T("Réponds d'abord à cette question (elle vient d'un bonus, d'une carte ou d'un paiement), puis on continue.","First answer this question (it comes from a bonus, a card or a payment), then we'll carry on.","Prima rispondi a questa domanda (viene da un bonus, da una carta o da un pagamento), poi continuiamo."):s.txt(q);
  const vis=!other&&VIS[s.id]?VIS[s.id]():'';
  box.innerHTML=`<div class="tg"><img src="icons/seagull.png" alt=""><div class="tt">${txt}${vis}</div></div><div class="tb">${s.btn?`<button class="ob tnext">${s.ok?s.ok():T('Suivant','Next','Avanti')} →</button>`:''}<button class="ob ghost tquit">${T('Quitter le tutoriel','Leave the tutorial','Esci dal tutorial')}</button><span class="tstep">${cur+1}/${S.length}</span></div>`;
  const nb=box.querySelector('.tnext'); if(nb) nb.onclick=next; box.querySelector('.tquit').onclick=stop;
  box.dataset.sel=other?'#prompt':(s.sel||'');
  if(s.btn){ if(!block){ block=document.createElement('div'); block.className='tblock'; document.body.appendChild(block);} } else clearBlock();
  const t=s.sel&&document.querySelector(s.sel); if(t&&box.dataset.last!==s.id){ box.dataset.last=s.id; try{ t.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} }
  place(); }
function rectOf(sel){ const e=sel&&document.querySelector(sel); if(!e||e.offsetParent===null) return null; const r=e.getBoundingClientRect(); return r.width&&r.height?r:null; }
function place(){ if(!box) return; const sel=box.dataset.sel; const W=innerWidth, H=innerHeight; const bw=Math.min(390,W-20); box.style.width=bw+'px';
  const bh=box.offsetHeight||170; const r=rectOf(sel);
  if(r){ spot.style.display='block'; spot.style.left=r.left+'px'; spot.style.top=r.top+'px'; spot.style.width=r.width+'px'; spot.style.height=r.height+'px'; spot.classList.toggle('dim',!!block); }
  else if(spot) spot.style.display='none';
  if(block) block.style.background=r?'transparent':'#0005';
  // zones à ne pas couvrir : la cible, et pendant une question les zones cliquables (choix, main, plateau)
  const avoid=[r]; if(!block&&!tip&&pend()) ['#prompt','#myhand','#boardwrap'].forEach(q=>avoid.push(rectOf(q)));
  const A=avoid.filter(Boolean), m=10;
  const C=[[W-bw-m,H-bh-m],[W-bw-m,m]];
  if(r){ C.push([r.right+12,r.top],[r.left-12-bw,r.top],[r.left,r.top-12-bh],[r.left,r.bottom+12]); }
  C.push([m,H-bh-m],[m,m],[(W-bw)/2,(H-bh)/2]);
  let best=null,bs=1e18;
  C.forEach(([x,y])=>{ x=Math.max(m,Math.min(W-bw-m,x)); y=Math.max(m,Math.min(H-bh-m,y));
    let ov=0; A.forEach((a,i)=>{ const w=Math.max(0,Math.min(x+bw,a.right)-Math.max(x,a.left)), h=Math.max(0,Math.min(y+bh,a.bottom)-Math.max(y,a.top)); ov+=w*h*(i===0?3:1); });
    if(ov<bs-1){bs=ov; best=[x,y];} });
  box.style.left=best[0]+'px'; box.style.top=best[1]+'px'; }
addEventListener('resize',place);
window.BirdsTuto=API;
})();
