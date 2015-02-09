define(['../classes/client-side/Popup', './activities'], function (Popup, activities) {

	var exports = { //Lo que retorna el módulo

		"Ring Influence" : {
			apply : function(client){
				client.socket.emit('update game', {'action' : 'MovePlayer', 'alias' : data.player, 'amount' : 1});
			}
		}


	};

	return exports;
});