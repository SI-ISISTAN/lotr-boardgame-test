define(['../classes/Activity'], function (Activity) {
	
	var exports = {}; //Lo que retorna el módulo

	//Bag End, primer escenario
	exports.BagEnd = {
		"name" : "Bag End",
		"image" : null,
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : [],
		"featureCards" : []
	};

	//Actividad principal que contiene a las demás
	
	exports.BagEnd.activities.push({
		name: 'Bag End',
		draw : null,
		subactivities : [ {'action' : "Gandalf"}, {'action': "Preparations"}, {'action': "Nazgul Appears"}]
	});

	

	//Rivendell, segundo escenario
	exports.Rivendell = {
		"name" : "Rivendell",
		"image" : null,
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : [],
		"featureCards" : []
	};

	//Actividad principal que contiene a las demás
	exports.Rivendell.activities.push({
		name: 'Rivendell',
		draw : null,
		subactivities : [ {'action' : "Elrond"}, {'action' : "Council"}]
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


	return exports;

});