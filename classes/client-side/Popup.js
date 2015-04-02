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
		if (typeof data.modal != 'undefined'){
			this.modal= data.modal;
		}
		else{
			this.modal=false;
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
						    'title':this.title,
							'html': '<div id= "main-popup-div"> <p>'+data.text+'</p> </div>',
							'class': "popup-dialog"
						});
		for (i in this.buttons){
				this.popup.append('<br>');
				this.popup.append($('<button/>', {
									'id':this.buttons[i].id,
									'class' : "btn btn-default",
									'html': this.buttons[i].name
				}));
				this.popup.append('<br>');
		}
	}

	//var estática popups abiertos
	Popup.openPopups = 0;

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
			var drag = true;
			if(Popup.openPopups > 0){
				$( ".popup-dialog" ).hide();
			}
			Popup.openPopups++;
			this.popup.dialog({
				dialogClass : 'no-close',
				modal:this.modal,
				show : {
					effect: "bounce",
					duration: 300
				},
				hide: {
					effect: "explode",
					duration: 1000
				},
				draggable:drag,
			});
		}
		
	}


	//cerrar el popup, eliminar los listeners
	Popup.prototype.close = function(){
		Popup.openPopups--;
		for (i in this.buttons){
			var name = "#"+this.buttons[i].id;
			$(name).off('click');
		}
		this.popup.dialog('close', function(){
			$(this).remove();
		});
		$( ".popup-dialog" ).show();

	}

	return Popup;
});