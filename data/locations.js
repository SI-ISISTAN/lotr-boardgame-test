define(['../classes/Activity'], function (Activity) {
	
	var exports = {}; //Lo que retorna el módulo

	/////////////////////////////////////////////////////// Bag End //////////////////////////////////////////////////////////////////////////////

	exports.BagEnd = {
		"name" : "Bag End",
		"image" : "BagEndBoard",
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : [],
		"featureCards" : [],
		"validTracks" : []
	};

	//Actividad principal que contiene a las demás
	
	exports.BagEnd.activities.push({
		name: 'Bag End',
		draw : null,
		subactivities : [ {'action' : "Gandalf"}, {'action': "Preparations"}, {'action': "Nazgul Appears"} ]
	});

	/////////////////////////////////////////////////////// Tutorial //////////////////////////////////////////////////////////////////////////////

	exports.Tutorial = {
		"name" : "Tutorial",
		"image" : "BagEndBoard",
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : [],
		"featureCards" : [],
		"validTracks" : []
	};

	//Actividad principal que contiene a las demás
	
	exports.Tutorial.activities.push({
		name: 'Tutorial',
		draw : null,
		subactivities : [ {'action' : "ShowMessage", 'msg': "¡Bienvenido! A continuación te detallaremos los componentes y reglas del juego."},
						{'action' : "ShowMessage", 'msg': "En este juego, cada jugador maneja a un aventurero en un grupo cuya misión es destruir un artefacto mágico: el Anillo de Poder. A través de ĺa colaboración, los aventureros deben recorrer todos los escenarios del juego hasta llegar al último y destruir el Anillo para lograr la victoria, ayudándose entre sí para evitar el peligro."},
						{'action' : "ShowMessage", 'msg': "En el tablero superior, puedes ver una ficha cónica blanca, que marca en qué escenario te encuentras en este momento. Hay dos tipos de escenarios: Safe Havens (donde los jugadores deberán resolver eventos) y Conflictos (donde deberán avanzar por distintas Líneas de Actividad para llegar al final)."},
						{'action' : "ShowMessage", 'msg': "También puedes ver la Línea de Corrupción: en un extremo comienzan los aventureros y en el otro el Malvado, el villano del juego. A lo largo del juego los eventos harán que los aventureros y el Malvado se aproximen. Si alguno de los aventureros queda en la misma casilla que el Malvado, morirá y será eliminado del juego. ¡Debes evitarlo!"},
						{'action' : "ShowMessage", 'msg': "En cualquier momento uno de los aventureros estaŕa llevando el Anillo. A lo largo del juego los jugadores el Anillo cambiará de mano entre los aventureros. Si el Malvado encuentra al Portador del Anillo en la Línea de Corrupción, ¡todos los jugadores perderán el juego!"},
						{'action' : "ShowMessage", 'msg': "A tu izquierda verás el estado de cada uno de los aventureros, con su nombre y una serie de contadores. Cada contador está asociado a un tipo de ficha que los aventureros irán obteniendo durante el juego."},
						{'action' : "ShowMessage", 'msg': "Hay cuatro tipos de fichas: de Vida, de Sol, de Anillo y de Escudo. Estas fichas son importantes para el desempeño de los jugadores (ya veremos como). También hay un contador que indica cuantas cartas tiene el jugador en su mano, y una ficha adicional que indica si el jugador está llevando el Anillo."},
						{'action' : "ShowMessage", 'msg': "A tu derecha hay una consola que indica los eventos que ocurren en el juego. También sirve para chatear con tus compañeros para ponerse de acuerdo sobre las decisiones. Simplemente tipea el mensaje y pulsa Enter, y este se enviará a los demás jugadores. "},
						{'action' : "ShowMessage", 'msg': "La ubicación actual es un Safe Haven (Bag End). En estos escenarios, el Portador del Anillo (quienquiera que sea) debe resolver varios eventos, a veces con ayuda de los demás jugadores. Los eventos se presentan como Popups con acciones y decisiones, igual que este mensaje. ¡Resuelve el primer evento de Bag End! "},
						{'action' : "Gandalf"},
						{'action' : "ShowMessage", 'msg': "Al resolver ese evento, has dado 6 cartas a cada jugador. Las cartas sirven para resolver eventos del juego que exigen descartes, o para avanzar en las Líneas de Actividad de los Conflictos (ya veremos cómo)."},
						{'action' : "ShowMessage", 'msg': "Las cartas tienen un color (blanco, gris, o rojo), y un símbolo. El símbolo puede ser: Amistad (dos manos), Esconderse (un árbol), Luchar (hacha y espada), Viajar (dos pies caminando), y Comodín (un rombo). También habrá algunas cartas amarillas, llamadas Especiales, con efectos diferentes."},
						{'action' : "ShowMessage", 'msg': "¡No todos los eventos son tan fáciles! En el siguiente podrás elegir tirar o no el Dado de Corrupción, y si lo tiras obtendrás un beneficio posterior. Este es un dado de 6 caras que puede hacer que los aventureros se acerquen al Malvado (1,2 o 3 posiciones), que el Malvado se mueva 1 lugar hacia los aventureros, que el jugador activo descarte 2 cartas, o que nada ocurra."},
						{'action': "Preparations"},
						{'action' : "ShowMessage", 'msg': "En varios casos, como el evento anterior, el jugador activo debe tomar decisiones difíciles. ¡Consulta siempre a tus compañeros para tomar decisiones! Las malas decisiones pueden acercarte a las garras del Malvado."},
						{'action' : "ShowMessage", 'msg': "Durante el juego, los jugadores se irán turnando para resolver eventos y actuar en Conflictos. Dependiendo del tipo de escenario, de si eres el jugador activo y del contexto, los botones a la izquierda del escenario se activarán para permitirte más acciones."},
						{'action' : "ShowMessage", 'msg': "También dependiendo de si es momento de descartar o jugar cartas, éstas se activarán y podrás cliquearlas para jugarlas o descartarlas."},
						{'action' : "ShowMessage", 'msg': "Ahora simularemos que se han resuelto todos los eventos de este escenario. Cuando esto ocurre en un Safe Haven, se pasa simplemente al siguiente escenario. El proximo escenario será de tipo Conflicto; ahí aprenderás cómo es el flujo del juego durante este tipo de escenarios."},
						{'action' : 'AdvanceLocation'}]
	});

	exports.Tutorial2 = {
		"name" : "Tutorial2",
		"image" : "MoriaBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 180,
				startY : 116,
				isMain : true,
				spaces :  [{x: 35, y:-12, reward : "shield"}, {x: 40, y:10, reward : "shield"}, {x: 38, y:8, reward : "ring"}, {x: 37, y:8, reward : "shield"}, {x: 42, y:13, reward : "shield"}, {x: 37, y:-1, reward : "ring"}, {x: 34, y:-7, reward : "die"}, {x: 22, y:-32, reward : "shield"}, {x: 13, y:-28, reward : "die"}, {x: 7, y:-35, reward : "big-shield"}]
			},
			"Hiding" : {
				position : 0,
				startX : 110,
				startY : 192,
				isMain : false,
				spaces :  [{reward : "Card", name:"Belt"}, {reward : "ring"}, {reward : "life"}, {reward : "ring"}, {reward : "life"},{reward : "ring"}, {reward : "life"} ]
			},
			"Travelling" : {
				position : 0,
				startX : 378,
				startY : 190,
				isMain : false,
				spaces : [{reward : "shield"}, {reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"}]
			},
			"Friendship" : null
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Hiding", text:"Esconderse"}],
		"events" : [{'name' : "SpeakFriend"}, {'name' : "WaterWatcher"},{'name' : "WellStone"},{'name' : "Trapped"},{'name' : "OrcsAttack"},{'name' : "FlyFools"}],
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	//Actividad principal que contiene a las demás
	
	exports.Tutorial2.activities.push({
		name: 'Tutorial2',
		draw : null,
		subactivities : [ {'action' : "ShowMessage", 'msg': "Este es el primer escenario de conflicto del juego, Moria. Puedes ver que el tablero ha cambiado: esto ocurrirá cada vez que avances hasta el siguiente escenario."},
						{'action' : "ShowMessage", 'msg': "(¡Recuerda que puedes desplazar estos mensajes, arrastrándolos para ver lo que hay detrás!)"},
						{'action' : "ShowMessage", 'msg': "Podrás ver también que en este escenario hay  una serie de espacios a la izquierda, conformando una pista hacia abajo. También verás que a la derecha hay tres pistas de actividad, cada una un camino conformado por símbolos."},
						{'action' : "ShowMessage", 'msg': "La pista de la izquierda es la Pista de Eventos. Las acciones de los jugadores durante la resolución de un escenario de Conflicto harán que se avance sobre esta pista. En cada espacio, los jugadores deberán resolver el evento, normalmente descartando cartas o fichas o lanzando el Dado de Corrupción."},
						{'action' : "ShowMessage", 'msg': "Si el grupo avanza hasta el final de una pista de Eventos, el escenario terminará y se pasará al siguiente."},
						{'action' : "ShowMessage", 'msg': "Las pistas de la derecha son las pistas de Actividad. Los aventureros, jugando cartas y con otros eventos del juego, irán moviendo la ficha de cada pista de Actividad y recogiendo las fichas recompensa mostradas en cada espacio, o activando eventos (por ejemplo, al caer sobre un espacio con un cuadrado negro, el jugador activo deberá tirar el Dado)."},
						{'action' : "ShowMessage", 'msg': "La pista que ocupa el centro del tablero (en este cargo, con símbolo de Lucha) es la Pista Principal. Si la ficha de movimiento llega al final de esta pista, los jugadores pasan al siguiente escenario (igual que si llegaran al final de la pista de Eventos)."},
						{'action' : "ShowMessage", 'msg': "A la izquierda del tablero hay un botón que permite sacar los Tiles de Eventos. Cuando el tunro de un jugador comienza, debe sacar tiles de eventos y resolverlos hasta obtener uno que le permita moverse por una pista de Actividad."},
						{'action' : "ShowMessage", 'msg': "Luego, el jugador debe elegir entre jugar cartas, sacar cartas o 'curarse' (retroceder en la Línea de Corrupción). El jugar cartas permite a un jugador moverse por als pistas de Actividad."},
						{'action' : "ShowMessage", 'msg': "Ahora, jugarás un turno para ver como funcionan las acciones del juego."},
						{'action' : 'StartConflict'} ]
	});

	exports.Tutorial3 = {
		"name" : "Tutorial3",
		"image" : "MoriaBoard",
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : [],
		"featureCards" : [],
		"validTracks" : []
	};

	//Actividad principal que contiene a las demás
	
	exports.Tutorial3.activities.push({
		name: 'Tutorial',
		draw : null,
		subactivities : [ {'action' : "ShowMessage", 'msg': "Terminado tu turno se pasará al jugador siguiente, y así en ronda hasta temrinar el escenario. Como este es un tutorial individual, no hay otro jugador; pero la idea es que vayan jugando en ronda."},
						{'action' : "ShowMessage", 'msg':"Como habrás visto, la primera parte del turno consiste en sacar un Tile de Evento. Estos pueden contener varias acciones: avanzar por una pista, tirar el dado, ejecutar el siguiente evento, y muchos más."},
						{'action' : "ShowMessage", 'msg':"Durante el juego, recibirás ciertas cartas amarillas, o Cartas Especiales. Si el momento del juego es adecuado, se habilitará el botón 'Jugar Cartas Especiales', para que puedas ejecutar sus eventos."},
						{'action' : "ShowMessage", 'msg':"También, a cambio de 5 fichas de Escudo, el jugador activo puede llamar al Mago. Éste tiene varios hechizos que te sacarás de un momento complicado."},
						{'action' : "ShowMessage", 'msg':"Por último, el Portador del Anillo puede utilizarlo una vez por escenario. Usar el Anillo le permitirá avanzar algunos espacios en una Pista de Actividad seleccionada, pero primero deberá tirar el Dado y afrontar las consecuencias."},
						{'action' : "ShowMessage", 'msg':"¡Eso es todo por este tutorial! Para ver en acción todas las posibilidades del juego, ve al lobby y únete a una partida activa. ¡Suerte!"},
						{'action' : 'AbortGame'}]
	});

	/////////////////////////////////////////////////////// Rivendell //////////////////////////////////////////////////////////////////////////////
	exports.Rivendell = {
		"name" : "Rivendell",
		"image" : "RivendellBoard",
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"validTracks" : [],
		"activities" : [],
		"featureCards" : []
	};

	//Actividad principal que contiene a las demás
	exports.Rivendell.activities.push({
		name: 'Rivendell',
		draw : null,
		subactivities : [ {'action' : "Elrond"}, {'action': "Council", 'player' : 'first'},{'action': "Fellowship", 'player' : 'first'}]
		});

	//Cargar las feature cards
	exports.Rivendell.featureCards.push({symbol : "Hiding", color : "White", amount : 2, image:"hiding_card_white_2"});
	exports.Rivendell.featureCards.push({symbol : "Friendship", color : "White", amount : 2, image:"friend_card_white_2"});
	exports.Rivendell.featureCards.push({symbol : "Hiding", color : "Gray", amount : 2, image:"hiding_card_gray_2"})
	exports.Rivendell.featureCards.push({symbol : "Joker", color : "None", amount : 2, image:"joker_card_2"});
	exports.Rivendell.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_gray_2"});
	exports.Rivendell.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_gray_2"});
	exports.Rivendell.featureCards.push({symbol : "Travelling", color : "Gray", amount : 2, image:"travel_card_gray_2"});
	exports.Rivendell.featureCards.push({symbol : "Travelling", color : "White", amount : 2, image:"travel_card_white_2"});
	exports.Rivendell.featureCards.push({symbol : "Joker", color : "None", amount : 2, image:"joker_card_2"});
	exports.Rivendell.featureCards.push({symbol : "Joker", color : "White", amount : 3, image:"joker_card_3_white"});
	exports.Rivendell.featureCards.push({type: "Special", name:'Miruvor', symbol : "None", color : "Yellow", amount : 1, image:"miruvor_card"});
	exports.Rivendell.featureCards.push({type: "Special", name: 'Staff',symbol : "None", color : "Yellow", amount : 1, image:"staff_card"});
	//Todas las q vienen son de testing
	exports.Rivendell.featureCards.push({type: "Special", name: 'Phial',symbol : "None", color : "Yellow", amount : 1, image:"phial_card"});

	/////////////////////////////////////////////////////// Moria //////////////////////////////////////////////////////////////////////////////
	exports.Moria = {

		"name" : "Moria",
		"image" : "MoriaBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 180,
				startY : 116,
				isMain : true,
				spaces :  [{x: 35, y:-12, reward : "shield"}, {x: 40, y:10, reward : "shield"}, {x: 38, y:8, reward : "ring"}, {x: 37, y:8, reward : "shield"}, {x: 42, y:13, reward : "shield"}, {x: 37, y:-1, reward : "ring"}, {x: 34, y:-7, reward : "die"}, {x: 22, y:-32, reward : "shield"}, {x: 13, y:-28, reward : "die"}, {x: 7, y:-35, reward : "big-shield"}]
			},
			"Hiding" : {
				position : 0,
				startX : 110,
				startY : 192,
				isMain : false,
				spaces :  [{reward : "Card", name:"Belt"}, {reward : "ring"}, {reward : "life"}, {reward : "ring"}, {reward : "life"},{reward : "ring"}, {reward : "life"} ]
			},
			"Travelling" : {
				position : 0,
				startX : 378,
				startY : 190,
				isMain : false,
				spaces : [{reward : "shield"}, {reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"}]
			},
			"Friendship" : null
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Hiding", text:"Esconderse"}],
		"events" : [{'name' : "SpeakFriend"}, {'name' : "WaterWatcher"},{'name' : "WellStone"},{'name' : "Trapped"},{'name' : "OrcsAttack"},{'name' : "FlyFools"}],
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	exports.Moria.featureCards.push({type: "Special", name: 'Belt',symbol : "None", color : "Yellow", amount : 1, image:"belt_card"});

	exports.Lothlorien = {
		"name" : "Lothlorien",
		"image" : "LothlorienBoard",
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"validTracks" : [],
		"activities" : [],
		"featureCards" : []
	};

	//Actividad principal que contiene a las demás
	exports.Lothlorien.activities.push({
		name: 'Lothlorien',
		draw : null,
		subactivities : [ {'action' : "Galardiel"}, {'action' : "Recovery", 'player': 'RingBearer'}, {'action': "GalardielTest", 'player': 'RingBearer'}]
		});

	//Cargar las feature cards
	exports.Lothlorien.featureCards.push({symbol : "Joker", color : "Gray", amount : 2, image:"joker_card_2_gray"});
	exports.Lothlorien.featureCards.push({symbol : "Joker", color : "Gray", amount : 2, image:"joker_card_2_gray"});
	exports.Lothlorien.featureCards.push({symbol : "Joker", color : "Gray", amount : 1, image:"joker_card_gray"});
	exports.Lothlorien.featureCards.push({symbol : "Hiding", color : "Gray", amount : 2, image:"hiding_card_gray_2"});
	exports.Lothlorien.featureCards.push({symbol : "Friendship", color : "Gray", amount : 1, image:"friend_card_gray"});
	exports.Lothlorien.featureCards.push({symbol : "Travelling", color : "Gray", amount : 2, image:"travel_card_gray_2"});
	exports.Lothlorien.featureCards.push({symbol : "Travelling", color : "Gray", amount : 1, image:"travel_card_gray"});
	exports.Lothlorien.featureCards.push({symbol : "Fighting", color : "Gray", amount : 1, image:"fight_card_gray"});
	exports.Lothlorien.featureCards.push({type: "Special", name:'Athelas', symbol : "None", color : "Yellow", amount : 1, image:"athelas_card"});
	exports.Lothlorien.featureCards.push({type: "Special", name: 'Lembas',symbol : "None", color : "Yellow", amount : 1, image:"lembas_card"});
	exports.Lothlorien.featureCards.push({type: "Special", name:'Elessar', symbol : "None", color : "Yellow", amount : 1, image:"elessar_card"});

	exports.Helm = {

		"name" : "Helms Deep",
		"image" : "HelmsDeepBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 132,
				startY : 20,
				isMain : true,
				spaces :  [{x: 24, y:16, reward : "shield"}, {x: 28, y:16, reward : "shield"}, {x: 32, y:16, reward : "ring"}, {x: 32, y:12, reward : "shield"}, {x: 30, y:10, reward : "shield"}, {x: 35, y:12, reward : "ring"}, {x: 36, y:2, reward : "shield"}, {x: 36, y:4, reward : "shield"}, {x: 32, y:3, reward : "shield"}, {x: 36, y:0, reward : "big-shield"} ]
			},
			"Friendship" : {
				position : 0,
				startX : 88,
				startY : 190,
				isMain : false,
				spaces :  [{reward : "die"},{reward : "Card", name:"Theoden"}, {reward : "Card", name:"Shadowfax"}, {reward : "ring"}, {reward : "Card", name:"Eomer"}, {reward : "ring"},{reward : "Card", name:"RohanRiders"}, {reward : "ring"} ]
			},
			"Travelling" : {
				position : 0,
				startX : 300,
				startY : 190,
				isMain : false,
				spaces : [{reward : "shield"}, {reward : "life"},{reward : "life"},{reward : "life"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"}]
			},
			"Hiding" : null
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Friendship", text:"Amistad"}],
		"events" : [{'name' : "Wormtongue"},{'name' : "RohanMen"},{'name' : "OrcsGate"},{'name' : "OrthancFire"},{'name' : "StormForward"},{'name' : "OrcsConquer"}],
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	exports.Helm.featureCards.push({name: 'Theoden',symbol : "Friendship", color : "White", amount : 2, image:"friend_card_white_2"});
	exports.Helm.featureCards.push({name: 'Shadowfax',symbol : "Travelling", color : "White", amount : 2, image:"travel_card_white_2"});
	exports.Helm.featureCards.push({name: 'Eomer',symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_gray_2"});
	exports.Helm.featureCards.push({name: 'RohanRiders',symbol : "Joker", color : "White", amount : 2, image:"joker_card_3_white"});

	exports.Shelob = {

		"name" : "Shelobs Lair",
		"image" : "ShelobsLairBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 152,
				startY : 118,
				isMain : true,
				spaces :  [{x: 24, y:-24, reward : "shield"}, {x: 34, y:-12, reward : "shield"}, {x: 34, y:4, reward : "shield"}, {x: 32, y:12, reward : "shield"}, {x: 28, y:6, reward : "shield"}, {x: 36, y:11, reward : "die"}, {x: 34, y:11, reward : "die"}, {x: 34, y:0, reward : "big-shield"}, {x: 29, y:-10, reward : "ring"}, {x: 22, y:-32, reward : "ring"} ]
			},
			"Hiding" : {
				position : 0,
				startX : 88,
				startY : 190,
				isMain : false,
				spaces :  [{reward : "Card", name: "Mithril"}, {reward : "ring"}, {reward : "life"},{reward : "ring"},{reward : "life"}, {reward : "ring"},{reward : "life"}]
			},
			"Travelling" : {
				position : 0,
				startX : 303,
				startY : 190,
				isMain : false,
				spaces : [{reward : "shield"}, {reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "heal"},{reward : "shield"},{reward : "sun"}]
			},
			"Friendship" : null
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Hiding", text:"Esconderse"}],
		"events" : [{'name' : "Gollum"},{'name' : "ShelobAttack"},{'name' : "DeadFaces"},{'name' : "ForbiddenPool"},{'name' : "NazgulRing"},{'name' : "ShelobAppear"}],
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	exports.Shelob.featureCards.push({type: "Special", name:'Mithril', symbol : "None", color : "Yellow", amount : 1, image:"mithril_card"});
	exports.Shelob.featureCards.push({name: 'Gollum',symbol : "Joker", color : "White", amount : 3, image:"gollum_card"});

	exports.Mordor = {

		"name" : "Mordor",
		"image" : "MordorBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 80,
				startY : 190,
				isMain : false,
				spaces :  [{reward : "shield"},{reward : "life"},{reward : "shield"},{reward : "life"},{reward : "shield"},{reward : "life"},{reward : "heal"}]
			},
			"Hiding" : {
				position : 0,
				startX : 375,
				startY : 190,
				isMain : false,
				spaces :  [{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"},{reward : "shield"},{reward : "sun"},{reward : "heal"}]
			},
			"Travelling" : {
				position : 0,
				startX : 126,
				startY : 102,
				isMain : true,
				spaces : [{x: 32, y:-12, reward : "shield"},{x: 28, y:-8, reward : "shield"},{x: 32, y:0, reward : "shield"},{x: 32, y:8, reward : "shield"},{x: 30, y:4, reward : "shield"},{x: 32, y:7, reward : "die"},{x: 30, y:7, reward : "shield"},{x: 36, y:8, reward : "shield"},{x: 32, y:0, reward : "shield"},{x: 32, y:-9, reward : "shield"},{x: 26, y:-17, reward : "die"},{x: 4, y:-32, reward : "shield"},{x: -25, y:-16, reward : "die"},{x: -70, y:-74, reward : "die"}]
			},
			"Friendship" : {
				position : 0,
				startX : 112,
				startY : -10,
				isMain : false,
				spaces : [{reward : "shield"}, {reward : "Card", name:"Asylum"}, {reward : "shield"},{reward : "Card", name:"Wollys"},{reward : "shield"}, {reward : "Card", name:"DyerMaker"},{reward : "heal"}]
			}
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Hiding", text:"Esconderse"},{name: "Friendship", text:"Amistad"}],
		"events" : [{name : 'SamSaveFrodo'}, {name: 'LordAttack'},{name: 'PelennorFields'},{name: 'SauronMouth'},{name: 'Sorrounded'},{name: "RingIsMine"}],
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	return exports;

});