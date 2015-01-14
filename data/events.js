define([], function () {
	
	var exports = {}; //Lo que retorna el módulo

	//Cada objeto evento consta de un método
	//"apply" que modifica la lógica y de un
	//método "draw" que actualiza la interfaz

	//////////////// Cambia el estado de ready de un jugador ////////////////

	exports.ToggleReady = function (game, player){
		this.game =game;
		this.player = player;
		this.log_msg = null;
	}

	exports.ToggleReady.prototype.apply = function(){
			var player = this.player;
			if (player!=null){
				if (player.ready){
					player.ready = false;
				}
				else{
					player.ready = true;
				}
				this.log_msg = "El jugador "+player.alias+" ha cambiado su estado de listo a "+player.ready;
			}
	}

	exports.ToggleReady.prototype.draw = function(){
			var alias = this.player.alias;
			var text = "(Esperando)";
			if (this.player.ready){
				var text = "(¡Listo!)";
			}
			$( ".client-list-name:contains('"+alias+"')" ).parent().find(".client-list-state").text(text);
	}


	

	return exports;
	
});