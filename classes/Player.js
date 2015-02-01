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

	//Me fijo si el jugador posee una o varias carrtas de un tipo o tipso determinados
	Player.prototype.hasCards= function(cards){
		var aux = []; //creo una mano auxiliar para ver si puedo hacer el descarte
		for (j in this.hand){
			aux.push(this.hand[j]);
		}
		var amount = 0;
		for (i in cards){
			var t = 0;
			var found = false;
			while (t<aux.length && !found){
				if ( ( (cards[i].symbol==null ||  cards[i].symbol== aux[t].symbol ) && (cards[i].color==null ||  cards[i].color==aux[t].color )) ||  aux[t].symbol == "Joker"){
					found = true;
					aux.splice(t,1);
					amount++;
				}
				else {
					t++;
				}
			}	
		}
		if (amount == cards.length){
			return true;
		}
		else{
			return false;
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