define(['../classes/Activity'], function (Activity) {
	
	var exports = {}; //Lo que retorna el módulo

	//Bag End, primer escenario
	exports.BagEnd = {
		"name" : "Bag End",
		"image" : null,
		"tracks" : null,
		"events" : null,
		"isConflict" : false,
		"activities" : []
	};

	var main_activity = {
		name: 'Bag End',
		draw : null,
		subactivities : [{'action' : "Gandalf"}, {'action': "Preparations"}, {'action' : "Gandalf"},{'action': "Preparations"}]
	};


	exports.BagEnd.activities.push(main_activity);


	return exports;

});