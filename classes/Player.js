define([], function () {
	
	function Player (client, number){
		console.log("Created player");
		this.id = client.id;
		this.alias = client.alias;
		this.character = null;
		this.chat_color = null;
		this.number=number;
	};

	return Player;
});