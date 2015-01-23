define([], function () {

	//crear e instanciar popup
	function Popup(data){
		this.title = data.title;
		this.text=data.text;
		if (data.id != null){
			this.id = data.id;
		}
		else{
			this.id = 'dialog';
		}
		this.buttons = data.buttons;
		this.popup = $('<div/>', {
						    'id':this.id,
						    'title':'Actividad: '+this.title,
							'html': '<p>'+data.text+'</p>'
						});
		for (i in this.buttons){
				this.popup.append($('<button/>', {
									'id':this.buttons[i].name,
									'html': this.buttons[i].name
				}));
		}
	}

	//agregar listener a un boton, que ejecutará la función callback pasada por parámetro
	Popup.prototype.addListener = function(button, callback){
		var found = false;
		var i=0;
		while (!found && i<this.buttons.length){
			if (this.buttons[i].name == button){
				found = true;
				var name = "#"+button;
				this.popup.find(name).on('click', function (){
					callback();		//si se cliquea llamar al callback							
				});
			}
			else{
				i++;
			}
		}
	}	

	//mostrar el popup
	Popup.prototype.draw = function(client){
		if (client.id == client.currentGame.activePlayer.id){
			this.popup.dialog({
				dialogClass : 'no-close',
				show : {
					effect: "puff",
					duration: 1000
				},
				hide: {
					effect: "explode",
					duration: 1000
				}
			});
		}
	}


	//cerrar el popup
	Popup.prototype.close = function(){
		this.popup.dialog('close');
	}

	return Popup;

});