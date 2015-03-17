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
		if (typeof card.description != 'undefined'){
			this.description = card.description;
		}
		else{
			this.description="Carta genérica";
		}
		this.color = card.color;
		this.symbol = card.symbol;
		this.amount = card.amount;
		this.image = card.image;
		this.phases = [];
		this.id = null;
		//Busco la carta en cards, primero por tipo, dps por nombre
		if (this.type == "Special"){
			if (cards[this.name] != null){
				this.draw = cards[this.name].draw;
				this.apply = cards[this.name].apply;
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


	return Card;

});