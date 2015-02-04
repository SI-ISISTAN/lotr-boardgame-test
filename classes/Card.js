define([], function () { 

	function Card(card){
		if (typeof card.name != 'undefined'){
			this.name = card.name;
		}
		else{
			this.name="Generic";
		}
		this.color = card.color;
		this.symbol = card.symbol;
		this.amount = card.amount;
		this.image = card.image;
		this.id = null;
		Card.prototype.play = function(){};
	}

	//Card.prototype.play = function(){

	//}

	return Card;

});