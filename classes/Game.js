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
		this.turnedPlayer=null;
		this.turnPhase = null;
		this.storyTiles = [];
		this.hobbitCards = [];
		this.locations = [];
		this.gandalfCards = [];
		this.currentLocation = null;
		this.locationNumber = 0;
		this.sauronPosition = 15;		//Cargar de un file
		this.ringUsed = false;
		this.specialEvents=[];
		this.score = 0;
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
		this.turnedPlayer=0;
		this.ringBearer = this.players[this.turnedPlayer];
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

		//Cargo cartas de Gandalf
		for (i in gameData.gandalfCards){
			this.gandalfCards.push(gameData.gandalfCards[i]); 
		}

		//Cargo escenarios
		
		this.locations.push(locations.BagEnd);
		this.locations.push(locations.Rivendell);
		this.locations.push(locations.Moria);
		this.locations.push(locations.Lothlorien);
		this.locations.push(locations.Helm);
		this.locations.push(locations.Shelob);
		this.locations.push(locations.Mordor);

		//inicio en la 1º location
		this.currentLocation = new Location(this.locations[this.locationNumber]);
	}

	Game.prototype.rollDie = function(){
		//retorna n random entre 1 y 6
		var n = Math.floor((Math.random() * 6) + 1);
		return n; 
	}

	Game.prototype.moveSauron = function(amount){
		this.sauronPosition-=amount;
	}

	Game.prototype.resolveActivity = function(client){
		if (typeof(this.currentLocation.currentActivity)!='undefined'){
			var new_act = this.currentLocation.currentActivity.next();
			if (new_act != null){
					this.currentLocation.currentActivity = new_act;
					this.io.to(client.id).emit('resolve activity', this.currentLocation.currentActivity.data);	//si no, emito que la termine
			}
			else{
				console.log("No mas actividades!");
			}
		}
		
	}

	//Paso a la location siguiente
	Game.prototype.advanceLocation = function(data){
		this.locationNumber++;
		if (this.locationNumber<this.locations.length){
			this.currentLocation = new Location(this.locations[this.locationNumber]);
			data['mov']=gameData.worldPositions[this.locationNumber-1];
			this.turnPhase = 'drawTiles';
			this.ringUsed = false;
		}
	}

	//Paso a la location siguiente
	Game.prototype.nextPhase = function(data){
		if (this.turnPhase=="drawTiles"){
			this.turnPhase="tileDrawn";
		}
		else if (this.turnPhase=="tileDrawn"){
			this.turnPhase="playCards";
		}
		else if (this.turnPhase=="playCards"){
			this.turnPhase="cardPlayed";
		}
		else if (this.turnPhase=="cardPlayed"){
			this.turnPhase="cleanUp";
		}
	}

	//Retorno los jugadores vivos
	Game.prototype.getAlivePlayers = function(){
		var alive = [];
		for (i in this.players){
			if (!this.players[i].dead){
				alive.push(this.players[i]);
			}
		}
		return alive;
	}

	//Elijo al nuevo ring bearer
	Game.prototype.changeRingBearer = function(){
		var most = -1;
		var neu = null;
		var candidates = this.getAlivePlayers();
		var i=0;
		var playerNumber = this.ringBearer.number;
		if (playerNumber<candidates.length-1){
					i = playerNumber+1;
		}
		while (candidates[i].alias != this.ringBearer.alias){
				if (candidates[i].lifeTokens > most){
					most=candidates[i].lifeTokens;
					neu = candidates[i];
				}
				if (i<candidates.length-1){
					i++;
				}
				else{
					i=0;
				}
		}

		return neu;
	}

	Game.prototype.nextTurn = function(data){
		this.activePlayer.turn=false;
		var alive =false;
		while (!alive){
			if (this.turnedPlayer < this.players.length-1){
				this.turnedPlayer++;
			}
			else{
				this.turnedPlayer=0;
			}
			if (!this.players[this.turnedPlayer].dead){
				this.activePlayer=this.players[this.turnedPlayer];
				this.activePlayer.turn=true;
				data['players'] = this.players;
				data['activePlayer'] = this.activePlayer;
				this.turnPhase="drawTiles";
				alive=true;
			}
		}
	}


	//Recibe el estado de juego ante algun cambio grande
	Game.prototype.drawTile= function(data){
		data.value = this.storyTiles[this.storyTiles.length-1];
		this.storyTiles.splice(this.storyTiles.length-1,1);
	}

	//Chequeo un evento especial
	Game.prototype.hasSpecialEvent= function(event){
		var found = false;
		var j=0;
		while (!found && j < this.specialEvents.length){	
			if (this.specialEvents[j].event == event){ 
				found = true;
			}
			else { 
				j++;
			}
		}
		if (found){
			return this.specialEvents[j];
		}
		else{
			return null;
		}
		
	}

	Game.prototype.deleteSpecialEvent= function(event){
		var found = false;
		var j=0;
		while (!found && j < this.specialEvents.length){	
			if (this.specialEvents[j].event == event){ 
				found = true;
			}
			else { 
				j++;
			}
		}
		if (found){ 
			this.specialEvents.splice(j,1);
		}
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