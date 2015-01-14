//Clase Game, una instancia creada por cada juego en curso

define(['./Player', '../data/data','../data/events'], function (Player, gameData, events) {
	
	function Game (){
		console.log("Se ha creado un nuevo juego.");
		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.events = events;
		this.players = [];
		this.isActive = false;
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
		var p = new Player(client,this.players.length);		//Create Player object
		p.chat_color = gameData.chatColors[this.players.length];
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

	//setear las variables de un juego usando otro
	Game.prototype.setupGame= function(game){
		this.gameID = game.gameID;
		this.players = game.players;
	}

	//Chequeo si estan dadas las condiciones minimas para que arranque un juego
	Game.prototype.canGameStart= function(game){
		var start = true;
		if (this.players.length < gameData.constants.PLAYER_MINIMUM){
			start = false;
		}
		else{
			for (i in this.players){
				if (!this.players[i].ready){
						start=false;
				}
			}
		}
		return start;
	}

	Game.prototype.update = function(data, emmiter){
		var update_event = null;

		switch (data.action){
			case "toggleReady":
				update_event = new this.events.ToggleReady(this, emmiter);
			break;

		}

		update_event.apply();
		console.log(this);
		return {"success" : true, "event" : update_event};
	}

	return Game;
});