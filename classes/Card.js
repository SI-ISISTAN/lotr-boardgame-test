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
		this.id = null;
		if (cards[this.type] != null){
			this.draw = cards[this.type].draw;
			this.apply = cards[this.type].apply;
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