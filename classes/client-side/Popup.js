define([], function () {

	//crear e instanciar popup
	function Popup(data){
		this.title = data.title;
		this.text=data.text;
		if (typeof data.isPublic != 'undefined'){
			this.isPublic = data.isPublic;
		}
		else{
			this.isPublic = false;
		}
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
							'html': '<div id= "main-popup-div"> <p>'+data.text+'</p> </div>'
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
				//this.popup.find(name).off('click');
				this.popup.find(name).on('click', function (){
					callback();		//si se cliquea llamar al callback							
				});
			}
			else{
				i++;
			}
		}
	}	

	//agregarle un elemento desde "afuera"
	Popup.prototype.append = function(element){
		this.popup.find("#main-popup-div").append(element);
	}

	//Activar/desactivar botones
	Popup.prototype.disableButton = function(name, state){
		this.popup.find("#"+name).prop('disabled', state);
	}

	//mostrar el popup
	Popup.prototype.draw = function(client){
		if (this.isPublic || client.isActivePlayer()){
			this.popup.dialog({
				dialogClass : 'no-close',
				show : {
					effect: "bounce",
					duration: 300
				},
				hide: {
					effect: "explode",
					duration: 1000
				}
			});
		}
		
	}


	//cerrar el popup, eliminar los listeners
	Popup.prototype.close = function(){
		for (i in this.buttons){
			var name = "#"+this.buttons[i].name;
			$(name).off('click');
		}
		this.popup.dialog('close');
	}

	return Popup;
});