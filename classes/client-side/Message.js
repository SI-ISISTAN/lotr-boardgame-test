define(['./Popup'], function (Popup) { 

	//crear e instanciar popup
	function Message(data){
		data.buttons =[{name : "Ok", id:"ok"}];
		data.id = "msg";
		this.popup = new Popup(data);
	}

	Message.prototype.draw = function(client){
		var pp = this.popup;
		pp.draw(client);
		pp.addListener("ok", function(){
			client.socket.emit('resolve activity');
			pp.close();
			$(pp).remove(); 
		});
	}

	return Message;
});