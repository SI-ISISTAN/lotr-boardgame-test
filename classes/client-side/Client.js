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

	// cuando intento descartar, este método asegura que el descarte sea válido
	Client.prototype.discard = function(data, popup){
				var discarded = 0;
				$(".player-card-img").on('click', function(){
						
						if (! $(this).data("selected")){	//si no estaba seleccionada
							
							var valid = false;				//validar si la carta que se intenta descartar es valida segun lo que se exije descartar
							if (data.card == null){
								valid = true;
							}
							else{
								if ( ( (data.card.symbol==null ||  data.card.symbol== ($(this).data("card").symbol) ) && (data.card.color==null ||  data.card.color==($(this).data("card").color) )) ||  ($(this).data("card").symbol) == "Joker")
								{

									valid = true;
								}
							}
							if (valid){											//reemplazar por una funcion "valid discard" de la clase Client
								$(this).addClass("highlighted-image");
								$(this).data("selected", true);
								$(this).data("number", $(this).index()-1);
								discarded++;
							}
							else{

							}
						}					
						else{								//si esta estaba seleccionada, deselecciono
								$(this).removeClass("highlighted-image");
								$(this).data("selected", false);
								discarded--;

						}
						if (discarded != data.amount){
							popup.disableButton("ok", true);
						}
						else{
							popup.disableButton("ok", false);
						}
					
				});		
	}

	return Client;

});