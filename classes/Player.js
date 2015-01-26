define([], function () {
	
	

	function Player (client, number){
		this.CARD_STATE ={
			PLAY : "Play",
			DISCARD: "Discard",
			NONE : "None"
		}

		this.id = client.id;
		this.alias = client.alias;
		this.character = null;
		this.chat_color = null;
		this.number=number;
		this.ready=false;
		this.turn = false;
		this.lifeTokens = 0;
		this.sunTokens = 0;
		this.ringTokens = 0;
		this.hand = [];
		this.corruption = 0;
		this.cardState = this.CARD_STATE.NONE;
	};

	//Buscar una carta en la mano del jugador
	Player.prototype.findCardByID = function(id){
		var found = false;
		var i=0;
		while (i<this.hand.length && !found){
			if (this.hand[i].id != id){
				i++;
			}
			else{
				found=true;
			}
		}
		if (found){
			return i;	//retornar posicion
		}
		else{
			return null;
		}
	}

	//Descartar cartas basadas en su ID
	Player.prototype.discard= function(discard){
		for (i in discard){
			this.hand.splice(this.findCardByID(discard[i]),1);
		}
	}

	Player.prototype.move = function(amount){
		this.corruption+=amount;
	}

	return Player;
});