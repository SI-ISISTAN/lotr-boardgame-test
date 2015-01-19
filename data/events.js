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
	exports.ToggleReady.prototype.draw = function(client){
			var alias = this.player.alias;
			var text = "(Esperando)";
			if (this.player.ready){
				var text = "(¡Listo!)";
			}
			$( ".client-list-name:contains('"+alias+"')" ).parent().find(".client-list-state").text(text);
	}

	//////////////// Da cartas del mazo de hobbit cards ////////////////
	
	exports.dealHobbitCards = function (game, amount,player){
		this.game =game;
		this.player = player;
		this.amount = amount;
	}
	exports.dealHobbitCards.prototype.apply = function(){
			var i=0;
			while (i<this.amount){
				if (this.player == null){			//si me pasan nulo le reparto a todos
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
			this.log_msg = "Cada jugador ha recibido "+this.amount + " cartas de Hobbit.";
	}
	exports.dealHobbitCards.prototype.draw = function(client){
			for (i in client.player.hand){
				$("<img src='./assets/img/ripped/"+client.player.hand[i].image+".png' class='player-card-img img-responsive'>").appendTo("#player-cards-container").show('slow');
			}
	}



	return exports;
	
});