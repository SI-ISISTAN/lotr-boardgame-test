//Clase Game, una instancia creada por cada juego en curso

define(['./Player','./Card', '../data/data', '../data/locations','./Location','./Activity'], function (Player, Card, gameData, locations, Location, Activity) {
	
	function Game (io){
		console.log("Se ha creado un nuevo juego.");
		this.gameID = Math.random().toString(36).substring(7);	//Nombre random
		this.io = io;
		this.players = [];
		this.isActive = false;
		this.ringBearer = null;
		this.activePlayer = null;
		this.turnPhase = null;
		this.storyTiles = [];
		this.hobbitCards = [];
		this.locations = [];
		this.currentLocation = null;
		this.locationNumber = 0;
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
			var card = new Card(gameData.hobbitCards[i]);
			card.id = i;
			this.hobbitCards.push(card);
		}
		this.hobbitCards = this.shuffleArray(this.hobbitCards);

		//Cargo escenarios
		
		this.locations.push(locations.BagEnd);
		this.locations.push(locations.Moria);
		this.locations.push(locations.Rivendell);
		
		//inicio en la 1º location
		this.currentLocation = new Location(this.locations[this.locationNumber]);
		console.log(this.storyTiles);

	}

	Game.prototype.rollDie = function(){
		//retorna n random entre 1 y 6
		var n = Math.floor((Math.random() * 6) + 1);
		return n; 
	}

	Game.prototype.moveSauron = function(amount){
		this.sauronPosition+=amount;
	}

	Game.prototype.resolveActivity = function(client){
		var new_act = this.currentLocation.currentActivity.next();
		if (new_act != null){
				this.currentLocation.currentActivity = new_act;
				this.io.to(client.id).emit('resolve activity', this.currentLocation.currentActivity.data);	//si no, emito que la termine
		}
		else{
			console.log("No mas actividades!");
		}
		
	}

	//Paso a la location siguiente
	Game.prototype.advanceLocation = function(){
		this.locationNumber++;
		this.currentLocation = new Location(this.locations[this.locationNumber]);

	}

	Game.prototype.startConflict = function(){

	}

	//Cuando finalizo un conflicto hago los chequeos y las acciones correspondientes
	Game.prototype.endConflict = function(){

	}

	//Recibe el estado de juego ante algun cambio grande
	Game.prototype.drawTile= function(data){
		data.value = this.storyTiles[this.storyTiles.length-1];
		this.storyTiles.splice(this.storyTiles.length-1,1);
	}

	//aplico una actualizacion al juego
	Game.prototype.update = function(update, emmiter, data){
		//aplico y retorno el evento, si existe
		if (update.apply != null){		

			update.apply(this, emmiter, data);
		}
		else{
			
		}
	}

	return Game;
});