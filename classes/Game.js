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
		this.sauronPosition = 15;		//Valores por defecto
		this.ringUsed = false;
		this.specialEvents=[];
		this.configName="";
		this.configObj=null;
		this.blockResolve = false;
		this.isTutorial = false;	//todos los juegos son asi, salvo que se juegue el tutorial
		this.asyncAck = true; //flag para controlar la recepcion de respuestas ante eventos asíncronos
		this.currentPoll = {
			poller : null,
			votes : [], 	//arreglo que guardan los votos de la poll actual
			actions : []		//accion a tomar si la poll es positiva
		};	
		this.agreementFactor = 0.65;
		//cosas que se cargan desde la Config en la DB
		this.score = 0;
		this.ended = false;
		this.advices = {
			"Location" : [],
			"Card" : [],
			"Activity" : []
		};
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

	//Chequeo si estan dadas las condiciones minimas para que arranque un juego
	Game.prototype.isReady= function(){
		var start = true;
		for (i in this.players){
			if (!this.players[i].playing){
				start=false;
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

	//iniciar juego. se le cargan los valores definidos en la configuracion elegida
	Game.prototype.start = function(config){
		this.configName=config.configName;
		this.configObj=config;
		this.sauronPosition = config.sauronPosition;
		if (config.isTutorial){
			this.isTutorial = true;
		}

		//asigno a cada player un personaje
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].corruption = config.hobbitPosition;
			//asgino tokens
			if (typeof(config.shieldTokens)!="undefined"){
				this.players[i].shields=config.shieldTokens;
			}
			if (typeof(config.lifeTokens)!="undefined"){
				this.players[i].lifeTokens=config.lifeTokens;
			}
			if (typeof(config.sunTokens)!="undefined"){
				this.players[i].sunTokens=config.sunTokens;
			}
			if (typeof(config.ringTokens)!="undefined"){
				this.players[i].ringTokens=config.ringTokens;
			}
			//asigno personajes
			this.players[i].character = gameData.characters[i];
		};
		this.turnedPlayer=0;
		this.ringBearer = this.players[this.turnedPlayer];
		this.activePlayer = this.ringBearer;
		this.ringBearer.turn = true;

		//Cargo cartas y tiles y mezclo cada pilon
		var p=0;

		while (p<config.storyTiles.length){
			this.storyTiles.push(config.storyTiles[p]);
			p++;
		}
		this.storyTiles = this.shuffleArray(this.storyTiles);

		for (j in config.hobbitCards){
			var count = 0;
			while (count<config.hobbitCards[j].amount){
				var card = new Card(config.hobbitCards[j].card);
				this.hobbitCards.push(card);
				count++;
			}
		}
		this.hobbitCards = this.shuffleArray(this.hobbitCards);

		//Cargo cartas de Gandalf
		var f = 0;
		while (f < config.gandalfCards.length){
			this.gandalfCards.push(config.gandalfCards[f]); 
			f++;
		}

		//Cargo escenarios
		var x=0;
		while (x < config.locations.length){
			this.locations.push(locations[config.locations[x]]);
			x++;
		}

		//this.locations.push(locations.Mordor);

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
			if (this.blockResolve){
				this.blockResolve=false;
			}
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

	Game.prototype.repeatActivity = function(client){
		this.io.to(client.id).emit('resolve activity', this.currentLocation.currentActivity.data);	//si no, emito que la termine
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
		var most = -100;	
		var candidates = this.getAlivePlayers();
		//aseguroi que si falla el ring vaya a un jugador vivo
		var neu = candidates[0];
		for (i in candidates){
					if (candidates[i].alias!=this.ringBearer.alias && candidates[i].lifeTokens > most){
						most=candidates[i].lifeTokens;
						neu = candidates[i];
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
		if (this.storyTiles.length > 0){
			data.value = this.storyTiles[this.storyTiles.length-1];
			this.storyTiles.splice(this.storyTiles.length-1,1);
		}
		else{
			//repongo los tiles
			for (i in gameData.storyTiles){
				this.storyTiles.push(gameData.storyTiles[i]);
			}
			this.storyTiles = this.shuffleArray(this.storyTiles);
			data.value = this.storyTiles[this.storyTiles.length-1];
		}
	}

	Game.prototype.replenishTiles = function(){
		//repongo los tiles
			for (i in gameData.storyTiles){
				this.storyTiles.push(gameData.storyTiles[i]);
			}
			this.storyTiles = this.shuffleArray(this.storyTiles);
	}

	Game.prototype.dealHobbitCard= function(position){
		var card = {};
		if (this.hobbitCards.length > 0 && typeof(this.hobbitCards[position]) != 'undefined' ){
			card = this.hobbitCards.splice(position,1);
		}
		else{
			//vuelvo a dar cartas (pero no reinstancio las especiales)
			for (i in gameData.hobbitCards){
				if (typeof(gameData.hobbitCards[i].type)=="undefined"){
					var card = new Card(gameData.hobbitCards[i]);
					this.hobbitCards.push(card);
				}
			}
			this.hobbitCards = this.shuffleArray(this.hobbitCards);
			card = this.hobbitCards.splice(position,1);
		}

		return card[0];
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

	//encuentro si hay recomendaciones de un tipo y nombre determinados (multiuso)
	Game.prototype.getAdvices = function(type,name,player){
		var found = [];
		var advices = this.advices[type];
		console.log(this.advices[type]);
		if (typeof(advices)!="undefined"){
			for (i in advices){
				if (advices[i].type == type && advices[i].name == name){
					if (player.surveyData!=null){
						var eval_up_down = true;
						var eval_positive_negative = true;
						var eval_forward_backward = true;
						if (advices[i].conditions.up_down.comparison != "ignore"){
							eval_up_down = eval(player.surveyData.result.up_down+advices[i].conditions.up_down.comparison+advices[i].conditions.up_down.value);
						}
						if (advices[i].conditions.forward_backward.comparison != "ignore"){
							eval_forward_backward = eval(player.surveyData.result.forward_backward+advices[i].conditions.forward_backward.comparison+advices[i].conditions.forward_backward.value);
						}
						if (advices[i].conditions.positive_negative.comparison != "ignore"){
							eval_positive_negative= eval(player.surveyData.result.positive_negative+advices[i].conditions.positive_negative.comparison+advices[i].conditions.positive_negative.value)
						}
						if ( eval_up_down && eval_forward_backward && eval_positive_negative ){
							found.push(advices[i]);
						}
					}
				}
			}
		}
		return found;
	}

	return Game;
});