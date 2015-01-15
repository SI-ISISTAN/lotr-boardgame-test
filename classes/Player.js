define([], function () {
	
	function Player (client, number){
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
	};

	return Player;
});