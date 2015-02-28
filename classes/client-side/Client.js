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

	//Metodo auxiliar. encuentra la carta en un array y devuelve su posicion
	Client.prototype.findCardInArray = function(card, array){
		var t=0;
		var found=false;
		while (t<array.length && !found){
				if ( ( (card.symbol==null ||  card.symbol== array[t].symbol ) && (card.color==null ||  card.color==array[t].color )) ||  array[t].symbol == "Joker"){
					found = true;
				}
				else {
					t++;
				}
		}
		if (found){
			return t;
		}
		else{
			return -1; //no esta
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
								if ((discarded + $(this).data("card").amount) > data.amount){
									$(this).data("put", (data.amount - discarded));
									discarded= data.amount;
								}
								else{
									discarded+= $(this).data("card").amount;
									$(this).data("put", ($(this).data("card").amount));
								}
							}
							else{
								console.log("Carta invalida");
							}
						}					
						else{								//si esta estaba seleccionada, deselecciono
								$(this).removeClass("highlighted-image");
								$(this).data("selected", false);
								cards.push($(this).data("discarded"));
								$(this).data("discarded", null);
								discarded-= $(this).data("put");

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
					action = {'action' : 'NextEvent'};
				break;
				case "Ring Influence":
					div.append($('<img src="./assets/img/ripped/T1T1.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> El Portador del Anillo se mueve un espacio hacia Battion. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : 'RingBearer', 'amount' : 1 };
				break;
				case "Sauron Will":
					div.append($('<img src="./assets/img/ripped/T1T2.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Un jugador debe voluntariarse para avanzar dos espacio hacia Sauron, o éste avanza un espacio hacia los aventureros. </p>"));
					action = {'action' : 'SauronWill'};
				break;
				case "Out Of Options":
					div.append($('<img src="./assets/img/ripped/T1T4.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Los jugadores deben descartar 3 cartas entre todos, o ejecutar el próximo Evento. </p>"));
					action = {'action' : 'OutOfOptions'};
				break;
				case "Losing Ground":
					div.append($('<img src="./assets/img/ripped/T1T5.png" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Los jugadores deben descartar 1 carta, 1 ficha de Vida y 1 Escudo entre todos, o ejecutar el próximo Evento. </p>"));
					action = {'action' : 'LosingGround'};
				break;

			}
			popup.append(div);
			popup.draw(this);
				
				div.fadeIn(3000, function(){
					var next=false;
					if (self.isActivePlayer()){
						if (action!= null){
							self.socket.emit('add activity', action);
							if (data.value=="Friendship" || data.value=="Fighting" || data.value=="Travelling" || data.value=="Hiding"){
								self.socket.emit('add activity', {'action' : "NextPhase"});
							}
							else{
								self.socket.emit('add activity', {'action' : "EnableTile"});
							}	
						}
						
						self.socket.emit('resolve activity');			
					}
					
					popup.close();
				});
	}

	Client.prototype.commonDiscard = function(data){
		var self = this;
		console.log(data.elements);
		var popup = new Popup({
					title: "Descarte común", 
					text: "Debes elegir a los jugadores que harán los descartes.", 
					buttons : [ {name : "Descartar", id:"discard"}, {name : "No descartar", id:"dont-discard"}] 
				});

				var div = $("<div>  </div>");
				for (i in data.elements){
					var el = $("<div id='deal-card-div'>  </div> ");

					var texto = "";
					//aca instanciar segun el contenido
					if (data.elements[i].element == 'card'){
							texto+="Una carta ";
							if (data.elements[i].color!=null){
							if (data.elements[i].color=="White") texto+="blanca "
							else texto+="gris "
						}
						if (data.elements[i].symbol!=null){
							if (data.elements[i].symbol=="Fighting") texto+="de símbolo Luchar"
							else if (data.elements[i].symbol=="Hiding") texto+="de símbolo Esconderse"
							else if (data.elements[i].symbol=="Travelling") texto+="de símbolo Viajar"
							else if (data.elements[i].symbol=="Friendship") texto+="de símbolo Amistad"
							else texto+="de Comodín"
						}
						if (data.elements[i].color==null && data.elements[i].symbol==null){
							texto+= "cualquiera"
						}
					}
					else if (data.elements[i].element == 'token'){
						texto+="Una ficha ";
						if (data.elements[i].token == 'life') texto+="de Vida";
						else if (data.elements[i].token == 'ring') texto+="de Anillo";
						else if (data.elements[i].token == 'shield') texto+="de Escudo";
						else if (data.elements[i].token == 'sun') texto+="de Sol";

					}

					//Fin de la instanciacion or contenido
					el.append("<p>"+texto+"</p>");
					var listbox = $("<select class='discard-selector'> </select>");
					listbox.data("element", data.elements[i]);
					for (j in self.players){
						var sel = $("<option id='option-"+self.players[j].alias+"' value='"+self.players[j].alias+"'> "+self.players[j].alias+"</option>");
						sel.data("element", data.elements[i]);			
						$(listbox).append(sel);
					}
					el.append($(listbox));

					div.append(el);	
				}

				popup.append(div);

				popup.addListener("discard", function(){
					var discards = [];
					$(".discard-selector").each(function(){
						var name = $(this).val();
						discards.push({'alias' : name, 'discard' : $(this).data("element")});
						console.log($(this).data("element"));
					});
					
					self.socket.emit('add activity', {'action' : 'CheckDiscard', 'discards' : discards, 'defaultAction' : data.defaultAction, 'discardActions' : data.discardActions});	//voy dando las cartas de a una
					self.socket.emit('resolve activity');
					$(".discard-selector").remove();	
					popup.close();	
				});
				popup.addListener("dont-discard", function(){
					//hay que ejecutar el siguiente evento. pajita
					self.socket.emit('add activity', data.defaultAction);	//
					self.socket.emit('resolve activity');	
					popup.close();	
				});

				popup.draw(self);
	}

	//Metodo auxuliar para determinar si ya se jugo una carta con ese color
	Client.prototype.arrayHasColoredCard = function(array, color){
		var found=false;
		var i=0;
		if (color!="None"){
			while (i<array.length && !found){
				if (array[i].color == color){
					found=true;
				}
				else{
					i++;
				}
			}
		}
		if (found){
			return true;
		}
		else return false;
	}

	Client.prototype.playCards = function(popup){
		var played = [];
		var self=this;
		$(".player-card-img").on('click', function(){
				if (! $(this).data("selected")){	//si no estaba seleccionada
					if (!self.arrayHasColoredCard(played, $(this).data("card").color)){		
						$(this).addClass("playing-card");
						$(this).data("selected", true);
						$(this).data("order", played.length);
						$(this).data("number", $(this).index()-1);
						played.push($(this).data("card"));
					}
				}					
				else{								//si esta estaba seleccionada, deselecciono
					
					$(this).removeClass("playing-card");
					$(this).data("selected", false);
					played.splice($(this).data("order"),1);
					$(this).data("order", null);

				}
				if (played.length>0 && played.length<3){
					popup.disableButton("ok", false);
				}
				else{
					popup.disableButton("ok", true);
				}
					
		});
	}

		//Retransmitir un evento en ronda desde el jugador activo hacia los demas
	Client.prototype.roundTransmission = function(action, playerNumber){
		var act = action;
		
		if (this.isActivePlayer()){
					//envio la tarea a todos los players
					var i=0;
					if (playerNumber<this.players.length-1){
						i = playerNumber+1;
					}
					while (this.players[i].alias != this.alias){
						console.log("ROUND TRANSMISSION DEL EVENTO: "+act.action+" a " +this.players[i].alias);
						action['player'] = this.players[i].alias;
						this.socket.emit('add activity', action);
						if (i<this.players.length-1){
							i++;
						}
						else{
							i=0;
						}
					}
			}
	};

	return Client;

});