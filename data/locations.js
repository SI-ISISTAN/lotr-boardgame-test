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