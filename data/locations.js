define(['../classes/Activity'], function (Activity) {
	
	var exports = {}; //Lo que retorna el módulo

	/////////////////////////////////////////////////////// Bag End //////////////////////////////////////////////////////////////////////////////

	exports.BagEnd = {
		"name" : "Bag End",
		"image" : null,
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
		"image" : null,
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
		subactivities : [ {'action' : "Elrond"}, {'action' : "Council"}, {'action': "Fellowship", 'player' : 'first'}]
		});

	//Cargar las feature cards
	exports.Rivendell.featureCards.push({symbol : "Hiding", color : "White", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Friendship", color : "White", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Joker", color : "White", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Travelling", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({symbol : "Joker", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.Rivendell.featureCards.push({name: "Gollum", symbol : "Joker", color : "White", amount : 3, image:"fight_card_white"});


	/////////////////////////////////////////////////////// Moria //////////////////////////////////////////////////////////////////////////////
	exports.Moria = {

		"name" : "Moria",
		"image" : "MoriaBoard",
		"tracks" : {
			"Fighting" : {
				position : 0,
				startX : 230,
				startY : 160,
				isMain : true,
				spaces :  [{x: 40, y:-15, reward : "Shield"}, {x: 45, y:12, reward : "Shield"}, {x: 45, y:12, reward : "Ring"}, {x: 45, y:12, reward : "Shield"}, {x: 45, y:15, reward : "Shield"}, {x: 45, y:-5, reward : "Ring"}, {x: 42, y:-10, reward : "Die"}, {x: 30, y:-40, reward : "Shield"}, {x: 20, y:-35, reward : "Die"}, {x: 10, y:-45, reward : "BigShield"} ]
			},
			"Hiding" : {
				position : 0,
				startX : 145,
				startY : 255,
				isMain : false,
				spaces :  [{reward : "Card"}, {reward : "Ring"}, {reward : "Heart"}, {reward : "Ring"}, {reward : "Heart"},{reward : "Ring"}, {reward : "Heart"} ]
			},
			"Travelling" : {
				position : 0,
				startX : 470,
				startY : 255,
				isMain : false,
				spaces : [{reward : "Shield"}, {reward : "Shield"},{reward : "Sun"},{reward : "Shield"},{reward : "Sun"},{reward : "Shield"},{reward : "Sun"}]
			},
			"Friendship" : null
		},
		"validTracks" : [{name : "Fighting", text: "Luchar"},{name: "Travelling", text:"Viajar"},{name: "Hiding", text:"Esconderse"}],
		"events" : null,
		"isConflict" : true,
		"activities" : [],
		"featureCards" : []
	};

	return exports;

});