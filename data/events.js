define(['../classes/Activity','../classes/Event'], function (Activity,Event) {
	
	var exports = {}; //Lo que retorna el módulo

	//Cada objeto evento consta de un método
	//"apply" que modifica la lógica y de un
	//método "draw" que actualiza la interfaz

	//////////////// Cambia el estado de ready de un jugador ////////////////

	exports.ToggleReady = function (game, data, player){
		this.game =game;
		this.player = player;
		this.data = data;
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

	exports.ToggleReady.prototype.draw = function(client){
			var alias = this.player.alias;
			var text = "(Esperando)";
			if (this.player.ready){
				var text = "(¡Listo!)";
			}
			$( ".client-list-name:contains('"+alias+"')" ).parent().find(".client-list-state").text(text);
	}

	

	//////////////// Da cartas del mazo de hobbit cards ////////////////
	
	exports.dealHobbitCards = function (game, data, player){
		this.game =game;
		this.player = player;
		this.data = data;
	}
	exports.dealHobbitCards.prototype.apply = function(){
			var i=0;
			while (i<this.data.amount){
				if (this.data.player == null){			//si me pasan nulo le reparto a todos
					for (j in this.game.players){
						this.game.getPlayerByID(this.game.players[j].id).hand.push(this.game.hobbitCards[this.game.hobbitCards.length-1]);
						this.game.hobbitCards.splice(this.game.hobbitCards.length-1);
					}
				}
				else{
					this.game.getPlayerByID(this.player.id).hand.push(this.game.hobbitCards[this.game.hobbitCards.length-1]);
					this.game.hobbitCards.splice(this.game.hobbitCards.length-1);
				}
				i++;
			}
			this.log_msg = "Cada jugador ha recibido "+this.data.amount + " cartas de Hobbit.";
	}
	exports.dealHobbitCards.prototype.draw = function(client){
			for (i in client.player.hand){
				$("<img src='./assets/img/ripped/"+client.player.hand[i].image+".png' class='player-card-img img-responsive'>").appendTo("#player-cards-container").show('slow');
			}
	}

	//////////////// Se cambia de tablero ////////////////

	exports.changeLocation= function (game, data, player){
		this.game =game;
		this.player=player;
		this.data = data;
	}

	exports.changeLocation.prototype.apply = function(){
		this.game.currentLocation.currentActivity = new Activity(this.game.currentLocation.currentActivity.name, this.game.currentLocation.currentActivity.subactivities, null);
		this.log_msg = "Se avanza hacia el siguiente escenario: Baguet.";
	}

	exports.changeLocation.prototype.draw = function(client){
			if (!this.game.currentLocation.isConflict){
		        this.game.currentLocation.currentActivity.next().draw(client);
			}
	}

	//////////////// Se resuelve una actividad ////////////////

	exports.resolveActivity= function (game, data, player){
		this.game =game;
		this.player=player;
		this.data = data;
	}

	exports.resolveActivity.prototype.apply = function(){
		console.log(this.game.currentLocation.currentActivity);
		var new_act = this.game.currentLocation.currentActivity.next();
		if (new_act != null){
			this.game.currentLocation.currentActivity = new_act;
		}
		
		
		this.log_msg = "El jugador "+ this.player.alias+ " ha resuelto la actividad: "+this.data.name+".";


	}
	exports.resolveActivity.prototype.draw = function(client){
			this.game.currentLocation.currentActivity.draw(client);
	}

	//////////////// Lanzar el dado de corrupcion ////////////////

	exports.RollDice= function (game, data, player, callback){
		this.game =game;
		this.player=player;
		this.data = data;
	}

	exports.RollDice.prototype.apply = function(){
		
		this.log_msg = "El jugador "+ this.player.alias+ " ha lanzado el dado de corrupción";


	}
	exports.RollDice.prototype.draw = function(client){
			if (!this.game.currentLocation.currentActivity < this.game.currentLocation.activities.length ){	//si quedan actividades
				var act = new Activity(client.currentGame.currentLocation.activities[client.currentGame.currentLocation.currentActivity].name);
		        act.draw(client);
			}
	}


	return exports;
	
});