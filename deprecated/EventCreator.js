define(['../data/events'], function (events) {

	//Factory de eventos
	function EventCreator (){
	}

	EventCreator.prototype.getEvent = function (game, data, emmiter){	//Se debe agregar el nombre del evento aqui para crearlo
		var update_event = null;
		switch (data.action){
			case "toggleReady":
				update_event = new events.ToggleReady(game, data, emmiter);
			break;
			case "dealHobbitCards":
				update_event = new events.dealHobbitCards(game, data, emmiter);
			break;
			case "changeLocation":
				update_event = new events.changeLocation(game, data, emmiter);
			break;
			case "resolveActivity":
				update_event = new events.resolveActivity(game, data, emmiter);
			break;
		}
		if (update_event != null){	//retorno el evento, si existe en events.js
			return update_event;
		}
		else{
			return null;
		}
	}


	return EventCreator;

});