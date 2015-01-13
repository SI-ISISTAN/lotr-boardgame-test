//Clase Game, una instancia creada por cada juego en curso

define(['./Player', '../data/data'], function (Player, gameData) {
	
	function Game (client){
		console.log("Created new game.");

		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.players = [];
			
		var p = new Player(client,0);		//Add first player
		p.chat_color = gameData.chatColors[0];
		this.players.push(p);

	};

	//obtener el objeto player proveyendo un id de cliente
	Game.prototype.getPlayerByID= function(client_id){
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

	Game.prototype.addPlayer = function(client){
		var p = new Player(client,this.players.length-1);		//Create Player object
		p.chat_color = gameData.chatColors[this.players.length-1];
		this.players.push(p);
	};

	Game.prototype.removePlayer = function(client_id){
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
			this.players.splice(i,1);
		}
	}


	return Game;
});