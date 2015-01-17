//Clase Game, una instancia creada por cada juego en curso

define(['./Player', '../data/data','../data/events'], function (Player, gameData, events) {
	
	function Game (){
		console.log("Se ha creado un nuevo juego.");
		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.events = events;
		this.players = [];
		this.isActive = false;
		this.ringBearer = null;
		this.activePlayer = null;
		this.storyTiles = [];
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

	//setear las variables de un juego usando otro, al principio de la partida
	//setear las variables de un juego usando otro
	Game.prototype.setupGame= function(game){
		this.gameID = game.gameID;
		this.players = game.players;
	}

	//Recibe el estado de juego ante algun cambio grande
	Game.prototype.buildGame= function(game){
		this.storyTiles = game.storyTiles;
	}

	//Chequeo si estan dadas las condiciones minimas para que arranque un juego
	Game.prototype.canGameStart= function(){
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

	Game.prototype.shuffleArray = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex ;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}

	//iniciar juego
	Game.prototype.start = function(){
		//asigno a cada player un personaje
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].character = gameData.characters[i];
		};
		this.ringBearer = this.players[0];
		this.activePlayer = this.ringBearer;
		this.ringBearer.turn = true;

		this.storyTiles = this.shuffleArray(gameData.storyTiles); //Mezclo los tiles
	}

	//aplico una actualizacion al juego
	Game.prototype.update = function(data, emmiter){
		var update_event = null;

		switch (data.action){
			case "toggleReady":
				update_event = new this.events.ToggleReady(this, emmiter);
			break;

		}

		update_event.apply();
		return {"success" : true, "event" : update_event};
	}

	return Game;
});