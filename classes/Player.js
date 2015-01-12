define([], function () {
	
	function Player (client){
		console.log("Created player");
		this.id = client.id;
		this.alias = client.alias;
		this.character = null;
		this.chat_color = null;
	};

	return Player;
});