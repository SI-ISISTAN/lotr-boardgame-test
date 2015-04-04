define([], function () {
	
	

	function Player (client, number){

		this.id = client.id;
		this.alias = client.alias;
		this.character = null;
		this.chat_color = null;
		this.number=number;
		this.ready=false;
		this.playing = false;
		this.turn = false;
		this.lifeTokens = 0;
		this.sunTokens = 0;
		this.ringTokens = 0;
		this.shields = 5;
		this.hand = [];
		this.corruption = 0;
		this.dead= false;
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

	Player.prototype.resetTokens = function(){
		this.lifeTokens=0;
		this.sunTokens=0;
		this.ringTokens=0;
	}

	//Segunda version que arma bundles de cartas iguales
	Player.prototype.hasCards2= function(cards){
		var aux = []; //creo una mano auxiliar para ver si puedo hacer el descarte
		var j=0;
		var objetivo = 0;
		for (t in cards){
			objetivo+=cards[t].amount;
		}

		while (j < this.hand.length){
			var carr = this.hand[j];
			aux.push(carr);
			j++;
		}
		var amount = 0;
		for (i in cards){
			var t = 0;
			var found = 0;
			while (t<aux.length && found<cards[i].amount){

				if ( ( (cards[i].symbol==null ||  cards[i].symbol== aux[t].symbol ) && (cards[i].color==null ||  cards[i].color==aux[t].color )) ||  aux[t].symbol == "Joker"){
					var am = aux[t].amount;
					found+=am;
					aux.splice(t,1);
					amount+=am;
				}
				else {
					t++;
				}

			}
		}
		if (amount >= objetivo){
			return true;
		}
		else{
			return false;
		}
	}

	//Me fijo si el jugador posee una o varias carrtas de un tipo o tipso determinados
	Player.prototype.hasCards= function(cards){
		var aux = []; //creo una mano auxiliar para ver si puedo hacer el descarte
		var j=0;

		while (j < this.hand.length){
			var carr = this.hand[j];
			aux.push(carr);
			j++;
		}
		var amount = 0;
		for (i in cards){
			var t = 0;
			var found = false;
			while (t<aux.length && !found){

				if ( ( (cards[i].symbol==null ||  cards[i].symbol== aux[t].symbol ) && (cards[i].color==null ||  cards[i].color==aux[t].color )) ||  aux[t].symbol == "Joker"){
					var am = aux[t].amount;
					found = true;
					aux.splice(t,1);
					amount+=am;
				}
				else {
					t++;
				}
			}	
		}
		if (amount >= cards.length){
			return true;
		}
		else{
			return false;
		}
	}

	//Descartar cartas basadas en su ID
	Player.prototype.discardByID= function(discard){
		for (i in discard){
			this.hand.splice(this.findCardByID(discard[i].id),1);
		}
	}

	//Descartar cartas basadas en su index en la mano
	Player.prototype.discardByIndex= function(discard){
		var newhand=[];
		var l=0;
		while (l < this.hand.length){
			var out = false;
			for (v in discard){
				if (discard[v] == l){
					out = true;
				}
			}
			if (!out){
				newhand.push(this.hand[l]);
			}
			l++;
		}
		this.hand = newhand;
	}

	//Descartar cartas basada en el primer match encontrado
	Player.prototype.discardFirstMatch= function(card){
			var t = 0;
			var found = false;
			var disc = null;
			while (t<this.hand.length && !found){
				if ( ( (card.symbol==null ||  card.symbol== this.hand[t].symbol ) && (card.color==null ||  card.color==this.hand[t].color )) ||  this.hand[t].symbol == "Joker"){
					found = true;
					disc = this.hand[t];
					this.hand.splice(t,1);
				}
				else {
					t++;
				}
			}
			return disc;	
	}

	Player.prototype.addToken= function(token, amount){
		switch (token){
			case 'ring':
				this.ringTokens+=amount;
			break;
			case 'life':
				this.lifeTokens+=amount;
			break;
			case 'sun':
				this.sunTokens+=amount;
			break;
			case 'shield':
				this.shields+=amount;
			break;
		}
	};

	Player.prototype.replenishCard = function(card){
		this.hand.push(card);
	}

	Player.prototype.addCard = function(card){
		if (typeof(card.id)=='undefined' || card.id==null){
			card["id"] = Math.random().toString(36).substring(7);	//Nombre random
		}
		this.hand.push(card);
	}

	//Chequea si el jugador tiene la cantidad indicada de determinado token
	Player.prototype.hasTokens= function(token, amount){
		var has = false;
		switch (token){
			case 'ring':
				if (this.ringTokens >= amount){
					has=true;
				}
			break;
			case 'life':
				if (this.lifeTokens >= amount){
					has=true;
				}
			break;
			case 'sun':
				if (this.sunTokens >= amount){
					has=true;
				}
			break;
			case 'shield':
				if (this.shields >= amount){
					has=true;
				}
			break;
		}
		return has;
	};

	//Dar cartas a otro jugador
	Player.prototype.giveCards= function(discard, to){
		for (i in discard){
			var card = this.hand[this.findCardByID(discard[i].id)];
			this.hand.splice(this.findCardByID(discard[i].id),1);
			to.addCard(card);
		}
	}

	Player.prototype.move = function(amount){
		this.corruption+=amount;
	}

	return Player;
});