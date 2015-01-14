define([], function () {
	
	function Player (client, number){
		this.id = client.id;
		this.alias = client.alias;
		this.character = null;
		this.chat_color = null;
		this.number=number;
		this.ready=false;
	};

	return Player;
});