define(['./gameActions', './gameEvents', './cards'], function (gameActions, gameEvents, cards) {
	
	var exports = {};

	//Cargar las acciones comunes
	for (var key in gameActions) {
 	 exports[key] = gameActions[key];
	}

	//Cargar las actividades de Safe Havens y eventos de los conflictos, y event tiles
	for (var key in gameEvents) {
 	 exports[key] = gameEvents[key];
	}

	//Cargar las cartas
	for (var key in cards) {
 	 exports[key] = cards[key];
	}

	return exports;
	
});