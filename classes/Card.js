define(['../data/cards'], function (cards) { 

	function Card(card){
		if (typeof card.name != 'undefined'){
			this.name = card.name;
		}
		else{
			this.name="Generic";
		}
		if (typeof card.type != 'undefined'){
			this.type = card.type;
		}
		else{
			this.type="Generic";
		}
		this.color = card.color;
		this.symbol = card.symbol;
		this.amount = card.amount;
		this.image = card.image;
		this.phases = [];
		this.id = null;
		//cargo la descripcion
		if (typeof card.description != 'undefined'){
			this.description = card.description;
		}
		else{
			this.description = "Carta de ";
				if (this.symbol == "Fighting"){
					this.description += "Luchar";
				}
				else if (this.symbol == "Travelling"){
					this.description += "Viajar";
				}
				else if (this.symbol == "Hiding"){
					this.description += "Esconderse";
				}
				else if (this.symbol == "Friendship"){
					this.description += "Amistad";
				}
				else if (this.symbol == "Joker"){
					this.description += "Comodín";
				}
		}
		//Busco la carta en cards, primero por tipo, dps por nombre
		if (this.type == "Special"){
			if (cards[this.name] != null){
				this.draw = cards[this.name].draw;
				this.apply = cards[this.name].apply;
				this.description = cards[this.name].description;
				for (p in cards[this.name].phases){
					this.phases.push(cards[this.name].phases[p]);
				}
			}
		}
		else{
			if (cards[this.type] != null){
				this.draw = cards[this.type].draw;
				this.apply = cards[this.type].apply;
				for (p in cards[this.type].phases){
					this.phases.push(cards[this.type].phases[p]);
				}
			}
		}
	}

	Card.prototype.getGameName = function(){
		if (this.type!="Special"){
			if (this.symbol == "Fighting"){
				return "Luchar";
			}
			else if (this.symbol == "Travelling"){
				return "Viajar";
			}
			else if (this.symbol == "Hiding"){
				return "Esconderse";
			}
			else if (this.symbol == "Friendship"){
				return "Amistad";
			}
			else if (this.symbol == "Joker"){
				return "Comodín";
			}
		}
		else{
			return this.name;
		}
	}


	return Card;

});