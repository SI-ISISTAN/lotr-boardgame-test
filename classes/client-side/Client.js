define([], function () { 

	function Client(){
		this.id = null,
		this.alias = null,
		this.currentGame = null,
		this.player = null,
		this.connected = false,
		this.socket = null
	}

	Client.prototype.isActivePlayer = function(){
		if (this.id == this.currentGame.activePlayer.id){
			return true;
		}
		else{
			return false;
		}
	}

	return Client;

});