define([], function () { 

	function Client(){
		this.id = null,
		this.alias = null,
		this.player = null,
		this.connected = false,
		this.isMyTurn = false,
		this.gameID = null,
		this.socket = null
		this.players = [];
	}

	Client.prototype.isActivePlayer = function(){
		if (this.player.turn){
			return true;
		}
		else{
			return false;
		}
	}

	return Client;

});