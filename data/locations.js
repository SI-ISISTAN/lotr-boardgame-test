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
	var main_activity = {
		name: 'Bag End',
		draw : null,
		subactivities : [ {'action' : "Gandalf"}, {'action': "Preparations"}, {'action': "Nazgul Appears"}]
	};
	exports.BagEnd.activities.push(main_activity);

	//Cargar las feature cards
	exports.BagEnd.featureCards.push({symbol : "Hiding", color : "White", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Friendship", color : "White", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Joker", color : "White", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Fighting", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Travelling", color : "Gray", amount : 2, image:"fight_card_white"});
	exports.BagEnd.featureCards.push({symbol : "Joker", color : "Gray", amount : 2, image:"fight_card_white"});


	return exports;

});