define(['../classes/client-side/Popup','../classes/Card'], function (Popup, Card) { 
	
	var exports = {
	//////////////// Actividades genéricas ////////////////

    //Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealHobbitCards" : {
		apply : function (game, player, data){
			//llevo un registro interno de que cartas le doy a cada uno para poder dibujarlo en "draw"
			var given = [];
			var em = false;
			var i=0;
			while (i<data.amount){
				if (data.player == null){			//si me pasan nulo le reparto a todos
					for (j in game.players){
						var card = game.hobbitCards[game.hobbitCards.length-1];
						game.getPlayerByID(game.players[j].id).addCard(card);
						game.hobbitCards.splice(game.hobbitCards.length-1);
						given.push({'card' : card, 'player' : game.players[j].alias, 'number' : game.getPlayerByID(game.players[j].id).hand.length-1});	
					}
					
				}
				else{
					var card = game.hobbitCards[game.hobbitCards.length-1];
					game.getPlayerByAlias(data.player).addCard(card);
					game.hobbitCards.splice(game.hobbitCards.length-1);
					given.push({'card' : card, 'player' : data.player});
					em=true;
				}
				i++;
			}
			if (em){
				game.io.to(player.room).emit('log message', {'msg' : "Se reparten "+data.amount+" cartas a  "+data.player+".", 'mode':'info'});
			}
			data['given'] = given;
			if (data.player == null){
				game.io.to(player.room).emit('log message', {'msg' : "Se reparten "+data.amount+" cartas a cada jugador. ", 'mode':'info'});
			}
			
			game.io.to(player.room).emit('update game', data);	//enviar siguiente actividad

		},
		draw : function(client, data){
			for (j in data.given){	//arreglare

				if (data.given[j].player == client.player.alias){
					$("<img src='./assets/img/ripped/"+data.given[j].card.image+".png' class='player-card-img img-responsive' style='display : none'>").data("card",data.given[j].card).data("selected",false).appendTo("#player-cards-container").show('slow');
				}
			}
			for (i in data.given){
				var span = $("#"+data.given[i].player+"-state-div").find("#cards-span");
				var currentValue = parseInt(span.text());
				span.text(currentValue+1);
			}

			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}


		}
	},

	//Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealFeatureCards" : {
		apply : function (game, player, data){
			//llevo un registro interno de que cartas le doy a cada uno para poder dibujarlo en "draw"
			var given = [];

			var turn=0;
			var len=game.currentLocation.featureCards.length;
			for (var j=0; j<len;j++){
				var card = game.currentLocation.featureCards[game.currentLocation.featureCards.length-1];
				game.players[turn].addCard(card);
				game.currentLocation.featureCards.splice(game.currentLocation.featureCards.length-1,1);
				given.push({'card' : card, 'player' : game.players[turn].alias, 'number' : game.players[turn].hand.length-1});
				if (turn < game.players.length-1){
					turn++;
				}
				else{
					turn=0;
				}
			}

			data['given'] = given;
			game.io.to(player.room).emit('update game', data);	//enviar siguiente actividad

		},
		draw : function(client, data){
			for (j in data.given){	//arreglare

				if (data.given[j].player == client.player.alias){
					$("<img src='./assets/img/ripped/"+data.given[j].card.image+".png' class='player-card-img img-responsive' style='display : none'>").data("card",data.given[j].card).data("selected",false).appendTo("#player-cards-container").show('slow');
				}
			}
			for (i in data.given){
				var span = $("#"+data.given[i].player+"-state-div").find("#cards-span");
				var currentValue = parseInt(span.text());
				span.text(currentValue+1);
			}

			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}

		}
	},

	//Accion de juego de tirar el dado
	"RollDie" :  {
		apply : function(game,player,data){
			if (typeof data.player == 'undefined'){
				data.player = player.alias;
			}
			game.io.to(player.room).emit('update game', {'action' : 'RollDie', 'value' : game.rollDie(), 'player': data.player});	
		},
		draw : function(client, data){
			client.rollDie(data);			
		}
		
	},

	//Un jugador se descarta
	"PlayerDiscard" : {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.player).discardByID(data.discard);
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			
			//dibujar el descarte
			$(".player-card-img.highlighted-image").remove();
			var span = $("#"+data.player+"-state-div").find("#cards-span");
			var currentValue = parseInt(span.text());
			span.text(currentValue-data.discard.length);
			if (client.alias == data.player){
				client.socket.emit('resolve activity');
			}
		}
	},

	//Un jugador debe, forzosamente, elegir algunas cartas de su mano para descartarse
	"ForceDiscard" :  {
		apply: function(game,player,data){
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			var discarded = [];
			//Elijo el titulo segun la cantidad y tipo de cartas que deba descartar
			var texto = "";
			if (data.cards == null){
				if (data.to==null){
					texto = "Debes descartar un total de "+data.amount+" cartas de tu mano, con símbolos cualesquiera.";
				}
				else{
					texto = "Escoge "+data.amount+" cartas para dar a otro jugador.";
				}
			}
			else{
				texto = "Debes descartar cartas de tu mano, por un valor equivalente a los siguientes símbolos: ";
				for (i in data.cards){
						if (data.cards[i].amount<=1 || typeof(data.cards[i].amount) == 'undefined'){
							texto+= "una carta "
						}
						else{
							texto+= data.cards[i].amount+ " cartas "
						}
						if (data.cards[i].color!=null){
							if (data.cards[i].color=="White") texto+="blanca "
							else texto+="gris "
						}
						if (data.cards[i].symbol!=null){
							if (data.cards[i].symbol=="Fighting") texto+="de símbolo Luchar"
							else if (data.cards[i].symbol=="Hiding") texto+="de símbolo Esconderse"
							else if (data.cards[i].symbol=="Travelling") texto+="de símbolo Viajar"
							else if (data.cards[i].symbol=="Friendship") texto+="de símbolo Amistad"
							else texto+="de Comodín"
						}
						if (data.cards[i].color==null && data.cards[i].symbol==null){
							texto+= "de cualquier símbolo"
						}
						if (i<data.cards.length-1){
							texto+=", "
						}
						else{
							texto+=". ";
						}
					
				}
			}
			//calculo la verdadera cantidad de cartas a descartar
			var original_amount = data.amount;
			var aux_am = 0;
			for (l in data.cards){
				if (typeof(data.cards[i].amount) == 'undefined'){
					aux_am+=1;
				}
				else{
					aux_am+=data.cards[l].amount;
				}
			}
			data.amount = aux_am;
			//Dibujo una alerta indicandome
			var popup = new Popup({title: "Descartar", text: texto, buttons : [{name : "Ok", id:"ok"}] , visibility : data.alias});
			popup.addListener("ok", function(){
				//ordenar el descarte
				//getear el numero de cartas seleccionadas
				var discard = [];
				var to_give = [];
				var hand = $(".player-card-img");
				$(".player-card-img").each(function(){
					if ($(this).hasClass("highlighted-image")){
						discard.push($(this).data("card"));
						to_give.push($(this).data("card"));
					}
				});
				$(".player-card-img").off('click');
				//Si el "to" es null las cartas se descartan, si no se las dan al compañero indicado
				if (data.to==null){
					client.socket.emit('add activity', {'action' : 'PlayerDiscard', 'player' : client.alias, 'discard' : discard});	
					client.socket.emit('resolve activity');
				}
				else{
					client.socket.emit('add activity', {'action' : 'PlayerGiveCards', 'from' : client.alias, 'to':data.to, 'cards' : to_give});	
					client.socket.emit('resolve activity');
				}
				
				popup.close();
			});
			popup.draw(client);
			popup.disableButton("ok", true);

			if (client.alias == data.alias){
				if (data.cards == null){
					client.discardAny(data,original_amount, popup);	//chequeo que el descarte sea correcto
				}
				else{
					client.discard(data, popup);	//chequeo que el descarte sea correcto
				}
			}
		}
		
	},

	//Accion de juego de tirar el dado
	'MovePlayer' :  {
		apply : function(game, player,data){
			if (data.alias=="RingBearer"){
				data.alias = game.ringBearer.alias;
			}
			game.getPlayerByAlias(data.alias).move(data.amount);
			if (data.amount>0){
				game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se mueve "+data.amount+" lugares hacia el peligro!", 'mode':'danger'});
			}
			else{
				game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se aleja "+(-data.amount)+" espacios del peligro!", 'mode':'danger'});
			}
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			$("#"+data.alias+"-chip").animate({
				'left' : "+="+41*data.amount+"px" //moves right
			},800);
			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}

		}
		
	},

	//Accion de juego de tirar el dado
	'MoveSauron' :  {
		apply : function(game, player,data){
			game.moveSauron(data.amount);
			game.io.to(player.room).emit('log message', {'msg' : "¡Battion se mueve "+data.amount+" lugares hacia los aventureros!", 'mode':'danger'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			$(".sauron-chip").animate({
				'left' : "-="+41*data.amount+"px" //moves right
			},800);
			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}
		}
		
	},

	//Se sacan algunas cartas y el jugador activo las reparte como desea
	"PlayerDealCards" : {
		apply : function(game, player,data){
			data.cards = [];
			for (var i=0; i<data.amount; i++){
				data.cards.push(game.hobbitCards[game.hobbitCards.length-1-i]);
			}
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			var popup = new Popup({title: "Repartir cartas", text: "Distribuye las cartas como desees. ",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
			//pongo los elementos de reparto de cada carta
			var div = $("<div>  </div>");


			for (i in data.cards){
				var el = $("<div id='deal-card-div'>  </div> ");
				el.append("<img src='./assets/img/ripped/"+data.cards[i].image+".png' class='player-card-img img-responsive'>");

				var listbox = $("<select class='card-to-selector'> </select>");
				for (j in client.players){
					$(listbox).append("<option value='"+client.players[j].alias+"'> "+client.players[j].alias+"</option>");
				}
				listbox.data("id",i);
				$(el).append($(listbox));

				div.append(el);	
			}

			popup.append(div);

			//cuando me dan ok envio cada carta al jugador correspondiente
			popup.addListener("ok", function(){
					$(".card-to-selector").each(function(){
						var to = $(this).val();
						client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 1, 'player' : to});	//voy dando las cartas de a una
					});
				$(".card-to-selector").remove();
				popup.close(); 
				if (client.isActivePlayer()){
					client.socket.emit('resolve activity');
				}
			});

			popup.draw(client);

		}
	},

	//Se pasa a la siguiente locacion
	"AdvanceLocation" : {
		apply : function(game, player,data){
			game.advanceLocation(data);
			data['tracks'] = game.currentLocation.tracks;
			data['isConflict'] = game.currentLocation.isConflict;
			data['events'] = game.currentLocation.events;
			data['image'] = game.currentLocation.image;
			game.io.to(player.room).emit('log message', {'msg' : "¡Los aventureros avanzan hacia la siguiente locación! ", 'mode':'good'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (data.isConflict){
			$("#location-board-img-container").children().remove();

			$("#location-board-img-container").append('<img src="./assets/img/ripped/'+data.image+'.jpg" alt="Tablero maestro" class="location-board-img">');
			
				if (data.tracks.Fighting != null){
					$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Fighting-chip" class="cone-chip" style="left: '+data.tracks.Fighting.startX+'px; top: '+data.tracks.Fighting.startY+'px;">');
				}
				if (data.tracks.Travelling != null){
					$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Travelling-chip" class="cone-chip" style="left: '+data.tracks.Travelling.startX+'px; top: '+data.tracks.Travelling.startY+'px;">');
				}
				if (data.tracks.Friendship != null){
					$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Friendship-chip" class="cone-chip" style="left: '+data.tracks.Friendship.startX+'px; top: '+data.tracks.Friendship.startY+'px;">');
				}
				if (data.tracks.Hiding != null){
					$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Hiding-chip" class="cone-chip" style="left: '+data.tracks.Hiding.startX+'px; top: '+data.tracks.Hiding.startY+'px;">');
				}
				$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Event-chip" class="cone-chip" style="left: 0px; top: -45px;">');

			}
			$("#world-chip").animate({
						'left' : "+="+data.mov.x+"px",
						'top' : "+="+data.mov.y+"px",
					},1300);
			if (client.isActivePlayer()){
				client.socket.emit('change location');	
			}


		}
	},

	//Un jugador selecciona y da cartas a otro
	"PlayerGiveCards" : {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.from).giveCards(data.cards, game.getPlayerByAlias(data.to));
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			//Dibujar lo comun a todos
			for (i in data.cards){
				var span = $("#"+data.to+"-state-div").find("#cards-span");
				var currentValue = parseInt(span.text());
				span.text(currentValue+1);

				var span2 = $("#"+data.from+"-state-div").find("#cards-span");
				var currentValue = parseInt(span.text());
				span.text(currentValue-1);
			}
			//dibujar el descarte en el que dio
			if (client.alias == data.from){
				$(".player-card-img.highlighted-image").remove();			
			}
			//Dibujar las cartas recibidas en el receptor
			if (client.alias == data.to){
				for (j in data.cards){	//arreglare
					$("<img src='./assets/img/ripped/"+data.cards[j].image+".png' class='player-card-img img-responsive' style='display : none'>").data("card",data.cards[j]).data("selected",false).appendTo("#player-cards-container").show('slow');
				}
			}
			if (client.alias == data.from ){
				client.socket.emit('resolve activity');
			}
		}
	},

	//Un jugador selecciona y da cartas a otro
	"DrawTile" : {
		apply : function(game, player,data){
			game.drawTile(data);
			data['phase'] = game.turnPhase;
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.drawTile(data);
		}
	},

	//Accion de juego de tirar el dado
	'MoveTrack' :  {
		apply : function(game, player,data){
			
			if (game.currentLocation.tracks[data.trackName]!=null){
					
					data['track'] = game.currentLocation.tracks[data.trackName];
					if (game.currentLocation.tracks[data.trackName].position < game.currentLocation.tracks[data.trackName].spaces.length){
						game.currentLocation.tracks[data.trackName].position++;
						data['reward'] = game.currentLocation.tracks[data.trackName].spaces[game.currentLocation.tracks[data.trackName].position-1];
						if (game.currentLocation.tracks[data.trackName].position == game.currentLocation.tracks[data.trackName].spaces.length){
							if (game.currentLocation.tracks[data.trackName].isMain){	
								data['endScenario'] = true;
							}
							else{
								data['endScenario'] = false;
							}
						}
						data['isFinished']=false;
					}
					else{
						data['isFinished']=true;
					}

			}
			//si no existo el track envio lso tracks que si existen, para la seleccion
			else{
				data['track'] = null;
				data['valid'] = game.currentLocation.validTracks;
			}
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador

		},
		draw : function(client, data){
			//mover la ficha como corresponda
			//si no es la min track se mueve la ficha de forma constante
			if (data.track!=null && !data.isFinished){
				if (!data.track.isMain){
					$("#"+data.trackName+"-chip").animate({
						'left' : "+="+31*data.amount+"px" //moves right
					},800, function(){
						//si es el ultimo espacio de la main track cambio de escenario
						if (client.isActivePlayer()){
							client.socket.emit('add activity', {'action' : 'ClaimReward', 'reward' : data.reward});
							if (data.endScenario){	
								client.socket.emit('add activity', {'action' : 'EndScenario'});				
							}
							client.socket.emit('resolve activity');
						}
					});
				}
				//es la main track, hay que moverlo de forma especial
				else{
					$("#"+data.trackName+"-chip").animate({
						'left' : "+="+data.track.spaces[data.track.position-1].x+"px",
						'top' : "+="+data.track.spaces[data.track.position-1].y+"px"
					},800, function(){
						//si es el ultimo espacio de la main track cambio de escenario
						if (client.isActivePlayer()){
							client.socket.emit('add activity', {'action' : 'ClaimReward', 'reward' : data.reward});
							if (data.endScenario){	
								client.socket.emit('add activity', {'action' : 'EndScenario'});				
							}
							client.socket.emit('resolve activity');
						}
					});
				}
			}


			//Si el track no existe en el escenario, se le da al usuario la opcion de moverse en el track que quiera
			if (client.isActivePlayer()){
				if (data.track==null){
					var popup = new Popup({title: "Avanzar en una pista", text: "Como la pista de la actividad que has sacado no existe, puedes elegir una en la cual avanzar un espacio.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
						//pongo los elementos de reparto de cada carta
						var div = $("<div>  </div>");
						var el = $("<div id='advance-div'>  </div> ");
						var listbox = $("<select id='move-track-selector'> </select>");
						//Agrego los tracks por los que puedo avanzar
						for (i in data.valid){
							$(listbox).append("<option value='"+data.valid[i].name+"'> "+data.valid[i].text+"</option>");
						}			
						$(el).append($(listbox));
						div.append(el);	
						popup.append(div);
						//cuando me dan ok envio cada carta al jugador correspondiente
						popup.addListener("ok", function(){
								$("#move-track-selector").each(function(){
									var to = $(this).val();
									console.log($(this).val());
									client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : to , 'amount' : 1 });
									client.socket.emit('resolve activity');
								});
						$("#move-track-selector").remove();
						popup.close(); 
						});

					popup.draw(client);
				}
			}
		}
		
	},

	//Accion de juego de tirar el dado
	'CommonDiscard' :  {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.commonDiscard(data);
		}
		
	},

	//Accion de agregar o quitar tokens
	'ChangeTokens' :  {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.alias).addToken(data.token, data.amount);
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var span = $("#"+data.alias+"-state-div").find("#"+data.token+"-span");
			var currentValue = parseInt(span.text());
			span.text(currentValue+data.amount);
			if (client.alias == data.alias){
				client.socket.emit('resolve activity');
			}
		}
		
	},

	//Chequear si el descarte es correcto; si no, ejecutar la accion por defecto pasada por parámetro
	'CheckDiscard' :  {
		apply : function(game, player,data){
			var isValid = true;
			var i = 0;
			var discarded = [];
			//armar "paquetes" con discards
			var bundles = [];
			var out = 0;
			for (o in data.discards){
				data.discards[o]['out'] = false;
			}
			while (out < data.discards.length){
				var f=0;
				while (f < data.discards.length){
					if (data.discards[f].out == false){
						data.discards[f].out=true;
						out++;
						for (temp in data.discards){
							if (data.discards[temp].alias == data.discards[f].alias && data.discards[temp].discard.element == data.discards[f].discard.element){
								if (data.discards[temp].discard.element  == 'card'){
									if (data.discards[temp].discard.symbol == data.discards[f].discard.symbol && data.discards[temp].discard.color == data.discards[f].discard.color){
										if (!data.discards[temp].out){
											data.discards[f].discard.amount++;
											data.discards[temp].out=true;
											out++;
										}
									}
								}
								else if (data.discards[temp].discard.element  == 'token'){
									if (data.discards[temp].discard.token == data.discards[f].discard.token){
										if (!data.discards[temp].out){
											data.discards[f].discard.amount++;
											data.discards[temp].out=true;
											out++;
										}
									}
								}
							}
						}
						bundles.push(data.discards[f]);
					}
					f++;
				}
			}
			console.log("los bundles q arme: ");
			console.log(bundles);
			data.discards = bundles;
			//voy borrando los elementos a medida que chequeo para chequear sobre un mismo usuario que tenga que hacer varios descartes
			//ej: si quiero chequear que un mismo usuario descarte una carta y luego otra igual, tengo que removerla la primera vez
			//para que ese chequeo sea real. al final, repongo lo que removi
			while (i<data.discards.length && isValid){
				if (data.discards[i].discard.element == 'card'){	//si debo descartar una carta
					if (game.getPlayerByAlias(data.discards[i].alias).hasCards2([data.discards[i].discard])){	//se chequea que el jugador indicado la tenga
						discarded.push({'alias' : data.discards[i].alias, 'type': data.discards[i].discard.element,'element' : game.getPlayerByAlias(data.discards[i].alias).discardFirstMatch(data.discards[i].discard)});
					}else{
						isValid=false;
					}
				}
				else if (data.discards[i].discard.element == 'token'){	//lo mismo pero con los tokens
					if (game.getPlayerByAlias(data.discards[i].alias).hasTokens(data.discards[i].discard.token,data.discards[i].discard.amount)){
						game.getPlayerByAlias(data.discards[i].alias).addToken(data.discards[i].discard.token, -data.discards[i].discard.amount);
					}
					else{
						isValid=false;
					}
				}
				i++;
			};
			//Repongo lo que descarte
			for (j in discarded){
				if (discarded[j].type == 'card'){
					game.getPlayerByAlias(discarded[j].alias).replenishCard(discarded[j].element);
				}
				else if (discarded[j].type == 'token'){
					game.getPlayerByAlias(discarded[j].alias).addToken(discarded[j].element.token, discarded[j].element.amount);
				}
			}
			data['isValid'] = isValid;
			if (!isValid){
				game.io.to(player.room).emit('log message', {'msg' : "¡El descarte elegido es inválido!", 'mode':'danger'});
			}
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador			
		},
		draw : function(client, data){
			//si todos los descartes fueron validos
			if (data.isValid){
				//agrupo los descartes por usuario. primero construyo la lista de usuarios
				var names = [];
				for (l in data.discards){
					var already = false;
					var f=0;
					while (f<names.length){
						if (names[f] == data.discards[l].alias){
							already=true;
						}
						f++;
					}
					if (already==false){
						names.push(data.discards[l].alias);
					}
				}
				for (j in names){
						//agrupo por usuario
						var name = names[j];
						var cards = [];
						var i=0;
						while (i < data.discards.length){
							if (name == data.discards[i].alias){
								if (data.discards[i].discard.element == 'card'){
									cards.push(data.discards[i].discard);		
								}
								else if (data.discards[i].discard.element == 'token'){
									client.socket.emit('add activity', {'action' : 'ChangeTokens', 'alias' :data.discards[i].alias, 'token':data.discards[i].discard.token, 'amount':-data.discards[i].discard.amount});
									//data.discards.splice(i,1);
								}
							}
						i++;
						}
					if (cards.length>0){
						client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : cards.length, 'alias' : name, 'cards': cards, 'to':null});
					}
				}
				if (typeof data.discardActions != 'undefined'){
					for (b in data.discardActions){
						client.socket.emit('add activity', data.discardActions[b]);
					}
				}
			}	
			else{
				client.socket.emit('add activity', data.defaultAction);
			}
			client.socket.emit('resolve activity');
		}
		
	},

	//Reclamar la recompensa por haber avanzado
	"ClaimReward" : {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (typeof data.reward != 'undefined'){
				if (data.reward.reward == 'life' || data.reward.reward == 'sun' ||data.reward.reward == 'ring' ||data.reward.reward == 'shield'){
					client.socket.emit('add activity', {'action' : 'ChangeTokens', 'alias' :client.alias, 'token': data.reward.reward, 'amount':1});
				}
				else if (data.reward.reward == 'die'){
					client.socket.emit('add activity', {'action' : 'RollDie'});
				}
				else if (data.reward.reward == 'big-shield'){
					client.socket.emit('add activity', {'action' : 'ChangeTokens', 'alias' :client.alias, 'token': 'shield', 'amount':5});
				}
				else if (data.reward.reward == 'heal'){
					client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : -1});
				}
				else if (data.reward.reward == 'Card'){
					if (typeof data.reward.name != 'undefined'){
						client.socket.emit('add activity', {'action' : 'DealFeatureCardByName', 'card' :data.reward.name, 'player' : client.alias});
					}
						
				}
			}
		client.socket.emit('resolve activity');
		}
	},

	//Pasar a la siguiente fase del turno
	"NextPhase" : {
		apply : function(game, player,data){
			game.nextPhase(data);
			console.log(game.turnPhase);
			data['phase'] = game.turnPhase;
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (client.isActivePlayer()){
					if (data.phase == 'playCards'){
						$("#draw-tile-button").prop('disabled', true);
						client.socket.emit('add activity', {'action' : 'CardsPhase'});
						client.socket.emit('add activity', {'action' : 'NextTurn'});
					}
					client.socket.emit('resolve activity');
			}
		}
	},

	//Pasar a la siguiente fase del turno
	"NextTurn" : {
		apply : function(game, player,data){
			game.nextTurn(data);
			game.io.to(player.room).emit('log message', {'msg' : "Es el turno de " +game.activePlayer.alias+". ", 'mode':'alert'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.players = data.players;
			$(".is-active").removeClass("is-active");
			$("#"+data.activePlayer.alias+"-state-div").addClass("is-active");
			if (client.alias == data.activePlayer.alias){
				client.player.turn=true;
				$("#draw-tile-button").prop('disabled', false);
			}
			else{
				client.player.turn=false;
			}
		}
	},

	//Habilitar el boton de draw tile
	"EnableTile" : {
		apply : function(game, player,data){
			game.io.to(game.activePlayer.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
				$("#draw-tile-button").prop('disabled', false);
				client.socket.emit('resolve activity');
			}
		},

	//Ejecutar el siguiente evento de un conflicto
	"NextEvent" : {
		apply : function(game, player,data){
			if (game.currentLocation.currentEvent < game.currentLocation.events.length){
				data['newEvent'] = game.currentLocation.events[game.currentLocation.currentEvent];
				game.currentLocation.currentEvent++;
				if (game.currentLocation.currentEvent == game.currentLocation.events.length){
					data['end'] = true;
				}
				else{
					data['end'] = false;
				}
			}

			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
				$("#Event-chip").animate({
					'top' : "+="+50+"px"
				},1000, function(){
					if (client.isActivePlayer()){
						client.socket.emit('add activity', {'action' : data.newEvent.name});
						if (data.end){
							client.socket.emit('add activity', {'action' : 'EndScenario'});		
						}
						client.socket.emit('resolve activity');
					}
				});	
		}
	},

	//Pasar a la siguiente fase del turno
	"CardsPhase" : {
		apply : function(game, player,data){
			//puede curarse?
			if (game.getPlayerByAlias(player.alias).corruption > 0){
				data['canHeal'] = true;
			}
			else{
				data['canHeal'] = false;
			}
			//puede jugar?
			if (game.getPlayerByAlias(player.alias).hand.length > 0){
				data['canPlay'] = true;
			}
			else{
				data['canPlay'] = false;
			}
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		
		},
		draw : function(client, data){
			var popup = new Popup({title: "Jugar cartas", text: "En esta fase de tu turno, puedes elegir entre: jugar hasta 2 cartas, 'curar' a tu aventurero (retroceder un paso en la Línea de Corrupción), o sacar 2 cartas del mazo.",buttons : [{name : "Jugar cartas", id:"playcards"}, {name : "Curarse", id:"heal"},{name : "Sacar cartas", id:"draw"}], visibility : "active"});
			popup.addListener("playcards", function(){
				client.socket.emit('add activity', {'action' : 'PlayCards'});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("heal", function(){
				client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : -1});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("draw", function(){
				client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 2, 'player' : client.alias});	
				popup.close();
				client.socket.emit('resolve activity');
			});

			popup.draw(client);

			if (!data.canPlay){
				popup.disableButton("playcards", true);
			}

			if (!data.canHeal){
				popup.disableButton("heal", true);
			}
		}
	},

	//Elegir cartas para jugar
	"PlayCards" : {
		apply : function(game, player,data){
			
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		
		},
		draw : function(client, data){
			var popup = new Popup({title: "Jugar cartas", text: "Puedes jugar hasta 2 cartas, como máximo una blanca y una gris (los comodines no cuentan hacia este límite).",buttons : [{name : "Listo", id:"ok"}], visibility : "active"});
			
			popup.addListener("ok", function(){
				$(".player-card-img").off('click');
				var played = [];
				$(".player-card-img").each(function(){
					if ($(this).hasClass("playing-card")){
						played.push($(this).data("card"));
					}
				});
				var i=0;
				while (i < played.length){
					client.socket.emit('add activity',{'action': 'PlayCard', 'played': played[i]});		
					i++;
				}
				//client.socket.emit('add activity',{'action': 'NextPhase'});	
				popup.close();
				client.socket.emit('resolve activity');
			});

			popup.draw(client);
			popup.disableButton("ok", true);

			client.playCards(popup);

		}
	},

	//Elegir cartas para jugar
	"PlayCard" : {
		apply : function(game, player,data){
			data['card'] = game.getPlayerByAlias(player.alias).hand[game.getPlayerByAlias(player.alias).findCardByID(data.played.id)];
			data.card.apply(game, player,data);
			game.getPlayerByAlias(player.alias).discardByID([data.card]);
			data['alias'] = player.alias;
			game.io.to(player.room).emit('log message', {'msg' : game.activePlayer.alias+" ha jugado una carta de "+data.card.getGameName()+", de "+data.card.amount+" símbolos.", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		
		},
		draw : function(client, data){
			if (client.isActivePlayer()){
				var card = new Card(data.card);
				card.draw(client,data);
				$(".playing-card").remove();
			}
			var span = $("#"+data.alias+"-state-div").find("#cards-span");
			var currentValue = parseInt(span.text());
			span.text(currentValue-1);
		}
	},

		//Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealFeatureCardByName" : {
		apply : function (game, player, data){
			var found =false;
			var i=0;
			while (i<game.currentLocation.featureCards.length & !found){
				if (data.card == game.currentLocation.featureCards[i].name){
					found=true;
				}
				else{
					i++;
				}				
			}
			if (found){
				console.log(game.currentLocation.featureCards[i]);
				data['dealt'] = game.currentLocation.featureCards[i];
				game.getPlayerByAlias(data.player).addCard(game.currentLocation.featureCards[i]);
				game.currentLocation.featureCards.splice(i,1);
			}
			else{
				data['dealt'] = null;
			}
			game.io.to(player.room).emit('log message', {'msg' : data.player+" recibe como recompensa una Carta Especial.", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	//enviar siguiente actividad

		},
		draw : function(client, data){
			if (data.dealt!=null){
				if (data.player == client.player.alias){
					$("<img src='./assets/img/ripped/"+data.dealt.image+".png' class='player-card-img img-responsive' style='display : none'>").data("card",data.dealt).data("selected",false).appendTo("#player-cards-container").show('slow');
				}

				var span = $("#"+data.player+"-state-div").find("#cards-span");
				var currentValue = parseInt(span.text());
				span.text(currentValue+1);
			}
			if (data.player == client.player.alias){
				client.socket.emit('resolve activity');
			}

		}
	},

	"DiscardFeatureCards" : {
		apply : function (game, player, data){
			game.currentLocation.featureCards=[];
			game.io.to(player.room).emit('update game', data);	//enviar siguiente actividad

		},
		draw : function(client, data){
			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}
		}
	},

	//Un jugador selecciona y da cartas a otro
	"EndScenario" : {
		apply : function(game, player,data){
			game.io.to(player.room).emit('log message', {'msg' : "¡Se ha completado el escenario!", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Se evaluará que cada jugador tenga los tokens correspondientes. Luego se eligirá al nuevo Portador (aquel que mas tokens de Vida tenga o, de haber empate, el jugador que sigue al Portador actual en la lista) y el nuevo Portador recibe 2 cartas del mazo.", 'mode':'info'});
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			//chequeo tokens faltantes y aplico las sanciones correspondientes
			client.socket.emit('add activity',{'action' : 'ChangeRingBearer'});
			client.socket.emit('add activity',{'action' : 'TokenCheck'});
			client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
			client.socket.emit('resolve activity');
		}
	},

	"TokenCheck" : {
		apply : function(game, player,data){
			var people = game.getAlivePlayers();
			data['moves'] = [];
			for (i in people){
				var actual = people[i];
				var am=0;
				var text = "¡El jugador "+actual.alias+" no tiene suficientes fichas de: ";
				if (actual.lifeTokens < 1){
					text+="Vida"
					am++;
				}
				if (actual.sunTokens < 1){
					if (am>0){
						text+=", "
					}
					text+="Sol"
					am++;	
				}
				if (actual.ringTokens < 1){
					if (am>0){
						text+=", y "
					}
					text+="Anillo"
					am++;
				}
				if (am>0){
					text+="! Por lo tanto, deberá avanzar "+am+" espacios hacia el Malvado."
					game.io.to(player.room).emit('log message', {'msg' : text, 'mode':'info'});
				}
					
				data.moves.push({'alias' : actual.alias, 'amount': am})
				
			}
			
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			for (i in data.moves){	

				if (client.alias == data.moves[i].alias){
					if (data.moves[i].amount>0){
						client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : data.moves[i].amount});
					}
					if (client.isActivePlayer()){
						client.socket.emit('resolve activity');
					}
				}
			}	
			
		}
	},

	//Se selecciona un nuevo Portador y se resetean los tokens de cada jugador
	"ChangeRingBearer" : {
		apply : function(game, player,data){
			game.ringBearer = game.changeRingBearer();
			data['ringBearer'] = game.ringBearer.alias;

			//Reset tokens
			var people = game.getAlivePlayers();
			for (i in people){
				game.getPlayerByAlias(people[i].alias).resetTokens();
			}
			data['players'] = game.players;

			game.io.to(player.room).emit('log message', {'msg' : "¡El nuevo Portador es: "+game.ringBearer.alias+"!", 'mode':'alert'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.players = data.players;
			console.log(client.players);
			for (i in client.players){
				var span = $("#"+client.players[i].alias+"-state-div").find("#life-span");
				span.text("0");
				var span = $("#"+client.players[i].alias+"-state-div").find("#sun-span");
				span.text("0");
				var span = $("#"+client.players[i].alias+"-state-div").find("#ring-span");
				span.text("0");	
			}

			$(".ring-bearer-img").remove();
			$("#"+data.ringBearer+"-state-div").append("<img src='./assets/img/ripped/ring-mini.png' class='img-responsive player-stat-img ring-bearer-img'>");
			if (client.isActivePlayer()){
				client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 2, 'player' : data.ringBearer});	
				client.socket.emit('resolve activity');
			}
		}
	},

	};

	return exports;
});