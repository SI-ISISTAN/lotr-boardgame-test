define(['./Popup'], function (Popup) { 

	//crear e instanciar popup
	function Poll(data){
		data.buttons =[{name : "Aceptar propuesta", id:"accept"}, {name : "Denegar propuesta", id:"deny"}];
		data.id = "poll";
		this.popup = new Popup(data);
		this.popup.visibility = "rest";
	}

	Poll.prototype.draw = function(client){
		var pp = this.popup;
		pp.draw(client);
		pp.addListener("accept", function(){
			client.socket.emit('poll vote', {'agree' : true});
			pp.close();
			$(pp).remove(); 
		});
		pp.addListener("deny", function(){
			client.socket.emit('poll vote', {'agree' : false});
			pp.close();
			$(pp).remove(); 
		});
	}

	return Poll;
});