define(['../classes/client-side/Popup'], function (Popup) { 
	
	var exports = {
	//////////////// Actividades genéricas ////////////////

    //Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealHobbitCards" : {
		apply : function (game, player, data){
			//llevo un registro interno de que cartas le doy a cada uno para poder dibujarlo en "draw"
			var given = [];

			var i=0;
			while (i<data.amount){
				if (data.player == null){			//si me pasan nulo le reparto a todos
					for (j in game.players){
						var card = game.hobbitCards[game.hobbitCards.length-1];
						game.getPlayerByID(game.players[j].id).hand.push(card);
						game.hobbitCards.splice(game.hobbitCards.length-1);
						given.push({'card' : card, 'player' : game.players[j].alias});	
					}
					
				}
				else{
					var card = game.hobbitCards[game.hobbitCards.length-1];
					game.getPlayerByAlias(data.player).hand.push(card);
					game.hobbitCards.splice(game.hobbitCards.length-1);
					given.push({'card' : card, 'player' : data.player});
					game.io.to(player.room).emit('log message', {'msg' : "Se reparten "+data.amount+" cartas a  "+data.player+".", 'mode':'info'});
				}
				i++;
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
				console.log("len de feature: "+game.currentLocation.featureCards.length);
				console.log("Give card to: "+game.players[turn].alias);
				var card = game.currentLocation.featureCards[game.currentLocation.featureCards.length-1];
				game.players[turn].hand.push(card);
				game.currentLocation.featureCards.splice(game.currentLocation.featureCards.length-1,1);
				given.push({'card' : card, 'player' : game.players[turn].alias});
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

			if (client.isActivePlayer())
				client.socket.emit('resolve activity');

		}
	},

	//Accion de juego de tirar el dado
	"RollDie" :  {
		apply : function(game,player,data){
			game.io.to(player.room).emit('update game', {'action' : 'RollDie', 'value' : game.rollDie(), 'player': player.alias});	
		},
		draw : function(client, data){
			client.rollDie(data);			
		}
		
	},

	//Un jugador se descarta
	"PlayerDiscard" : {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.player).discard(data.discard);
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
					texto = "Debes descartar "+data.amount+" cartas cualesquiera de tu mano.";
				}
				else{
					texto = "Escoge "+data.amount+" cartas para dar a otro jugador.";
				}
			}
			else{
				texto = "Debes descartar las siguientes cartas: ";
				for (i in data.cards){
					texto+= "una carta "
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
					if (i<data.cards.length-1){
						texto+=", "
					}
					else{
						texto+=". ";
					}
				}
			}
			//Dibujo una alerta indicandome
			var popup = new Popup({title: "Descartar", text: texto, buttons : [{name : "Ok", id:"ok"}] , visibility : data.alias});
			popup.addListener("ok", function(){
				//ordenar el descarte
				//getear el numero de cartas seleccionadas
				var discard = [];
				var hand = $(".player-card-img");
				$(".highlighted-image").each(function(){
					discard.push($(this).data("card"));	//pushear el id de la carta
				});
				$(".player-card-img").off('click');
				//Si el "to" es null las cartas se descartan, si no se las dan al compañero indicado
				if (data.to==null){
					client.socket.emit('add activity', {'action' : 'PlayerDiscard', 'player' : client.alias, 'discard' : discard});	
					client.socket.emit('resolve activity');
				}
				else{
					client.socket.emit('add activity', {'action' : 'PlayerGiveCards', 'from' : client.alias, 'to':data.to, 'cards' : discard});	
					client.socket.emit('resolve activity');
				}
				
				popup.close();
			});
			popup.draw(client);
			popup.disableButton("ok", true);

			if (client.alias == data.alias){
				if (data.cards == null){
					client.discardAny(data, popup);	//chequeo que el descarte sea correcto
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
			game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se mueve "+data.amount+" lugares hacia el peligro!", 'mode':'danger'});
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

			console.log(data.cards);

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
					})
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
			game.advanceLocation();
			data['tracks'] = game.currentLocation.tracks;
			data['isConflict'] = game.currentLocation.isConflict;
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (data.isConflict){
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
				$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Event-chip" class="cone-chip" style="left: 0px; top: -50px;">');

			}
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
				game.currentLocation.tracks[data.trackName].position++;
				//claim reward
				data['track'] = game.currentLocation.tracks[data.trackName];
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
			if (data.track!=null){
				if (!data.track.isMain){
					$("#"+data.trackName+"-chip").animate({
						'left' : "+="+31*data.amount+"px" //moves right
					},800);
				}
				//es la main track, hay que moverlo de forma especial
				else{
					$("#"+data.trackName+"-chip").animate({
						'left' : "+="+data.track.spaces[data.track.position-1].x+"px",
						'top' : "+="+data.track.spaces[data.track.position-1].y+"px"
					},800);
				}
			}
			//Si el track no existe en el escenario, se le da al usuario la opcion de moverse en el track que quiera
			if (client.isActivePlayer()){
				if (data.track==null){
					var popup = new Popup({title: "Avanzar en una pista", text: "Como la pista de la actividad que has sacado no existe, puedes elegir una en la cual avanzar un espacio.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
						//pongo los elementos de reparto de cada carta
						var div = $("<div>  </div>");
						var el = $("<div id='advance-div'>  </div> ");
						var listbox = $("<select class='advance-selector'> </select>");
						//Agrego los tracks por los que puedo avanzar
						for (i in data.valid){
							$(listbox).append("<option value='"+data.valid[i].name+"'> "+data.valid[i].text+"</option>");
						}			
						$(el).append($(listbox));
						div.append(el);	
						popup.append(div);
						//cuando me dan ok envio cada carta al jugador correspondiente
						popup.addListener("ok", function(){
								$(".advance-selector").each(function(){
									var to = $(this).val();
									console.log($(this).val());
									client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : to , 'amount' : 1 });

								});
						client.socket.emit('resolve activity');
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
				var popup = new Popup({title: "Avanzar en una pista", text: "Como la pista de la actividad que has sacado no existe, puedes elegir una en la cual avanzar un espacio.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
				//pongo los elementos de reparto de cada carta
				var div = $("<div>  </div>");
				var el = $("<div id='advance-div'>  </div> ");
				var listbox = $("<select class='advance-selector'> </select>");
				//Agrego los tracks por los que puedo avanzar
				for (i in data.valid){
						$(listbox).append("<option value='"+data.valid[i].name+"'> "+data.valid[i].text+"</option>");
				}			
				$(el).append($(listbox));
				div.append(el);	
				popup.append(div);
				//cuando me dan ok envio cada carta al jugador correspondiente
				popup.addListener("ok", function(){
							$(".advance-selector").each(function(){
								var to = $(this).val();
								console.log($(this).val());
								client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : to , 'amount' : 1 });
							});
					client.socket.emit('resolve activity');
					popup.close(); 
				});

				popup.draw(client);
				
		}
		
	}

	};

	return exports;
});