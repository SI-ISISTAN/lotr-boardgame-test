define([], function () {

	//crear e instanciar popup
	function Popup(data){
		this.title = data.title;
		this.text=data.text;
		if (typeof data.visibility != 'undefined'){
			this.visibility = data.visibility;
		}
		else{
			this.visibility = "active";
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
				this.popup.append('<br>');
				this.popup.append($('<button/>', {
									'id':this.buttons[i].id,
									'html': this.buttons[i].name
				}));
				this.popup.append('<br>');
		}
	}

	//agregar listener a un boton, que ejecutará la función callback pasada por parámetro
	Popup.prototype.addListener = function(button, callback){
		var found = false;
		var i=0;
		while (!found && i<this.buttons.length){
			if (this.buttons[i].id == button){
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
		this.popup.find("#main-popup-div").append("<br>");
		this.popup.find("#main-popup-div").append(element);
	}

	//Activar/desactivar botones
	Popup.prototype.disableButton = function(name, state){
		this.popup.find("#"+name).prop('disabled', state);
	}

	//mostrar el popup
	Popup.prototype.draw = function(client){
		if ( (this.visibility == "all" ) || (this.visibility == "active" && client.isActivePlayer())  || (this.visibility == "rest" && !client.isActivePlayer()) || (this.visibility == client.alias) ){
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
			var name = "#"+this.buttons[i].id;
			$(name).off('click');
		}
		this.popup.dialog('close');
	}

	return Popup;
});