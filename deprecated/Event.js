define([], function () {

	//Factory de eventos
	function Event (game,player,data){
		this.game =game;
		this.player = player;
		this.data = data;
	}

	Event.prototype.apply = function (){

	}

	

	return Event;

});

