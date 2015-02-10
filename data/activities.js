define(['./gameActions', './gameEvents', './eventTiles'], function (gameActions, gameEvents, eventTiles) {
	
	var exports = {};

	//Cargar las acciones comunes
	for (var key in gameActions) {
 	 exports[key] = gameActions[key];
	}

	//Cargar las actividades de Safe Havens y eventos de los conflictos
	for (var key in gameEvents) {
 	 exports[key] = gameEvents[key];
	}

	//Cargar los event tiles
	for (var key in eventTiles) {
 	 exports[key] = eventTiles[key];
	}

	return exports;
	
});