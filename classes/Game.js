//Clase Game, una instancia creada por cada juego en curso

define(['./Player', '../data/data', '../data/locations','./Location','./Activity'], function (Player, gameData, locations, Location, Activity) {
	
	function Game (){
		console.log("Se ha creado un nuevo juego.");
		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.players = [];
		this.isActive = false;
		this.ringBearer = null;
		this.activePlayer = null;
		this.storyTiles = [];
		this.hobbitCards = [];
		this.currentLocation = null;
		this.sauronPosition = 15;		//Cargar de un file
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

	//obtener el objeto player proveyendo un id de cliente
	Game.prototype.getPlayerByAlias= function(alias){
		var found = false;
		var i=0;
		while (i<this.players.length && !found){
			if (this.players[i].alias != alias){
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
		for (i in game.players){
			this.addPlayer({'id': game.players[i].id, 'alias':game.players[i].alias});
		}
	}

	//Recibe el estado de juego ante algun cambio grande
	Game.prototype.buildGame= function(game){
		this.storyTiles = game.storyTiles;
		this.hobbitCards = game.hobbitCards;

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

		//Cargo cartas y tiles y mezclo cada pilon
		for (i in gameData.storyTiles){
			this.storyTiles.push(gameData.storyTiles[i]);
		}
		this.storyTiles = this.shuffleArray(this.storyTiles);

		for (i in gameData.hobbitCards){
			var card = gameData.hobbitCards[i];
			card.id = i;
			this.hobbitCards.push(card);
		}
		this.hobbitCards = this.shuffleArray(this.hobbitCards);
		this.currentLocation = new Location(locations.BagEnd);

	}

	Game.prototype.rollDie = function(client){
		//retorna n random entre 1 y 6
		var n = Math.floor((Math.random() * 6) + 1);
		client.socket.emit('update game', {'action' : 'RollDie', 'value' : n});	//repetir el evento a los otros clientes 
	}

	Game.prototype.moveSauron = function(amount){
		this.sauronPosition+=amount;
	}

	//aplico una actualizacion al juego
	Game.prototype.update = function(update, emmiter){
		console.log("Update de juego con actividad: "+update.name);
		//aplico y retorno el evento, si existe
		if (update.apply != null){			
			update.apply(this, emmiter);
			return {"success" : true};
		}
		else{
			return {"success" : false};
		}
	}

	return Game;
});