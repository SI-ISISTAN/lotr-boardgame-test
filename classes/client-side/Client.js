define(['./Popup','./Alert'], function (Popup, Alert) { 

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

	//Tirar el dado
	Client.prototype.rollDie = function(data){
			var self=this;
			var div = $("<div style = 'display : none'>  </div>")
			var popup = new Popup({title: "Tirar dado", id:"die-div", text: "El jugador "+data.player+" lanza el dado y obtiene...", buttons : [] , visibility : "all"});
			var action = null;
			switch (data.value){
				case 1:
					div.append($('<img src="./assets/img/ripped/die0.png" alt="Dado de amenaza" class="img-responsive token-img"><br>'));
					div.append($("<p> No hay consecuencias.</p>"));
				break;
				case 2:

					div.append($('<img src="./assets/img/ripped/die1.png" alt="Dado de amenaza" class="img-responsive token-img"><br><br>'));
					div.append($("<p> Battión se mueve un espacio hacia los aventureros. </p>"));
					action = {'action' : 'MoveSauron', 'amount' : 1};

				break;
				case 3:

					div.append($('<img src="./assets/img/ripped/die2.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe moverse un espacio en la línea de corrupción. </p>"));

					action = {'action' : 'MovePlayer', 'alias' : data.player, 'amount' : 1};
					
				break;
				case 4:

					div.append($('<img src="./assets/img/ripped/die3.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe moverse dos espacios en la línea de corrupción. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : data.player, 'amount' : 2 };
					
				break;
				case 5:

					div.append($('<img src="./assets/img/ripped/die4.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe moverse tres espacios en la línea de corrupción. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : data.player, 'amount' : 3};
				break;
				case 6:
					div.append($('<img src="./assets/img/ripped/die5.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe descartar dos cartas. </p>"));
					action = {'action' : 'ForceDiscard', 'alias' : data.player, 'amount' : 2, 'card' : null, 'to':null };
				break;
			}
			popup.append(div);
			popup.draw(this);
				
				div.fadeIn(4000, function(){
					if (self.isActivePlayer()){
						if (action!= null){
							self.socket.emit('add activity', action);
						}
						self.socket.emit('resolve activity');
					}
					
					popup.close();
				});
	}

	//Tirar el dado
	Client.prototype.drawTile = function(data){
			var self=this;
			var div = $("<div style = 'display : none'>  </div>")
			var popup = new Popup({title: "Ficha de evento", id:"die-div", text: "El jugador "+data.player+" saca el evento...", buttons : [] , visibility : "all"});
			var action = null;
			switch (data.value){
				case "Hiding":
					div.append($('<img src="./assets/img/ripped/T2T3.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Se mueve un espacio en la pista de Esconderse. </p>"));
					action = {'action' : 'MoveTrack', 'trackName' : 'Hiding', 'amount' : 1 };
				break;
				case "Friendship":
					div.append($('<img src="./assets/img/ripped/T2T1.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Se mueve un espacio en la pista de Amistad. </p>"));
					action = {'action' : 'MoveTrack', 'trackName' : 'Friendship', 'amount' : 1 };
				break;
				case "Travelling":
					div.append($('<img src="./assets/img/ripped/T2T2.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Se mueve un espacio en la pista de Viaje. </p>"));
					action = {'action' : 'MoveTrack', 'trackName' : 'Travelling', 'amount' : 1 };
				break;
				case "Fighting":
					div.append($('<img src="./assets/img/ripped/T2T4.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Se mueve un espacio en la pista de Lucha. </p>"));
					action = {'action' : 'MoveTrack', 'trackName' : 'Fighting', 'amount' : 1 };
				break;
				case "Next Event":
					div.append($('<img src="./assets/img/ripped/T1T3.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe ejecutarse el siguiente evento. </p>"));
				break;
				case "Ring Influence":
					div.append($('<img src="./assets/img/ripped/T1T1.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> El Portador del Anillo se mueve un espacio hacia Battion. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : 'RingBearer', 'amount' : 1 };
				break;
				case "Sauron Will":
					div.append($('<img src="./assets/img/ripped/T1T2.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Un jugador debe voluntariarse para avanzar dos espacio hacia Sauron, o éste avanza un espacio hacia los aventureros. </p>"));
				break;
				case "Out of Options":
					div.append($('<img src="./assets/img/ripped/T1T4.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Los jugadores deben descartar 3 cartas entre todos, o ejecutar el próximo Evento. </p>"));
				break;
				case "Losing Ground":
					div.append($('<img src="./assets/img/ripped/T1T5.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Los jugadores deben descartar 1 carta, 1 ficha de Vida y 1 Escudo entre todos, o ejecutar el próximo Evento. </p>"));
				break;

			}
			popup.append(div);
			popup.draw(this);
				
				div.fadeIn(3000, function(){
					if (self.isActivePlayer()){
						if (action!= null){
							self.socket.emit('add activity', action);
						};
						$("#draw-tile-button").prop('disabled', false);				
					}
					self.socket.emit('resolve activity');
					popup.close();
				});
	}

	return Client;

});