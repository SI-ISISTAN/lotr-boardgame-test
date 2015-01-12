//Clase Game, una instancia creada por cada juego en curso

define(['./Player', '../data/data'], function (Player, gameData) {
	
	function Game (clients){
		console.log("Created new game.");

		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.players = [];

		for (var i=0; i<clients.length; i++){
			var p = new Player(clients[i]);		//Create Player object
			p.chat_color = gameData.chatColors[i];
			this.players[p.id] = p;
		}
	};

	//obtener el objeto player proveyendo un id de cliente
	Game.prototype.getPlayer2 = function(client_id){
		var found = false;
		var i=0;
		while (i<this.players.length && !found){
			if (this.players[i].id != client_id){
				i++;
			}
			else{
				found=true;
			}
		}
		if (found){
			return this.players[i];
		}
		else{
			return null;
		}
	}

	//obtener el objeto player proveyendo un id de cliente
	Game.prototype.getPlayer = function(client_id){
		return this.players[client_id];
	}


	return Game;
});