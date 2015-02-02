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

	//método para descartar cualquier carta hasta cierto numero
	Client.prototype.discardAny = function(data, popup){
		var discarded = 0;
		$(".player-card-img").on('click', function(){
				if (! $(this).data("selected")){	//si no estaba seleccionada		
					$(this).addClass("highlighted-image");
					$(this).data("selected", true);
					$(this).data("number", $(this).index()-1);
					discarded++;
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

	// cuando intento descartar, este método asegura que el descarte sea válido
	Client.prototype.discard = function(data, popup){
				var discarded = 0;
				$(".player-card-img").on('click', function(){
						var cards = data.cards;
						if (! $(this).data("selected")){	//si no estaba seleccionada
							var valid = false;				//validar si la carta que se intenta descartar es valida segun lo que se exije descartar
							var j=0;
							while (j<cards.length && !valid){
								if ( ( (cards[j].symbol==null ||  cards[j].symbol== ($(this).data("card").symbol) ) && (cards[j].color==null ||  cards[j].color==($(this).data("card").color) )) ||  ($(this).data("card").symbol) == "Joker")
								{
									valid = true;
									$(this).data("discarded", cards[j]);
									console.log("Me estoy deshaciendo de la carta: ");
									console.log(cards[j]);
									cards.splice(j,1);

								}
								else j++;
							}			
							if (valid){											
								$(this).addClass("highlighted-image");
								$(this).data("selected", true);
								$(this).data("number", $(this).index()-1);
								discarded+= $(this).data("card").amount;
							}
							else{

							}
						}					
						else{								//si esta estaba seleccionada, deselecciono
								$(this).removeClass("highlighted-image");
								$(this).data("selected", false);
								cards.push($(this).data("discarded"));
								$(this).data("discarded", null);
								discarded-= $(this).data("card").amount;

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