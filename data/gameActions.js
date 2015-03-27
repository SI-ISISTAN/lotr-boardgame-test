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
					var people = game.getAlivePlayers();
					for (j in people){
						var card = game.hobbitCards[game.hobbitCards.length-1];
						game.getPlayerByID(people[j].id).addCard(card);
						game.hobbitCards.splice(game.hobbitCards.length-1);
						given.push({'card' : card, 'player' : people[j].alias, 'number' : game.getPlayerByID(people[j].id).hand.length-1});	
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
					client.addCard(data.given[j].card);
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
				var people = game.getAlivePlayers();
				people[turn].addCard(card);
				game.currentLocation.featureCards.splice(game.currentLocation.featureCards.length-1,1);
				given.push({'card' : card, 'player' : people[turn].alias, 'number' : people[turn].hand.length-1});
				if (turn < people.length-1){
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
					client.addCard(data.given[j].card);
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
			game.io.to(player.id).emit('update game', data);	//enviar siguiente actividad
		},
		draw : function(client, data){
			var popup = new Popup({title: "Lanzar dado", text: "Debes lanzar el dado, haciendo click en el botón correspondiente.", buttons : [], id: "dice-info", visibility : client.alias});
			popup.draw(client);
			$("#roll-dice-button").prop('disabled',false);
			if (client.isActivePlayer()){
				$("#special-card-button").prop('disabled',false);
			}
			//Especial: si alguna carta previene de tirar el dado, se activa
			
		}
		
	},

	//Accion de juego de tirar el dado
	"DieRoll" :  {
		apply : function(game,player,data){
			if (typeof data.player == 'undefined'){
				data.player = player.alias;
			}
			var val = 0;
			if (typeof data.value != 'undefined'){
				val = data.value;
			}
			else{
				val = game.rollDie();
			}
			game.io.to(player.room).emit('update game', {'action' : 'DieRoll', 'value' : val, 'player': data.player});	
		},
		draw : function(client, data){
			client.rollDie(data);			
		}
		
	},

	//Accion de usar el anillo
	"UseRing" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "¡"+player.alias+" usa el Anillo!", 'mode':'good'});
			game.ringUsed = true;
			data['value'] = game.rollDie();
			data['amount'] = 0;
			switch (data.value){
				case 1:
					data.amount =4;
				break;
				case 2:
					data.amount =3;
				break;
				case 3:
					data.amount =3;
				break;
				case 4:
					data.amount =2;
				break;
				case 5:
					data.amount =1;
				break;
				case 6:
					data.amount =2;
				break;
			}
			data['valid'] = game.currentLocation.validTracks;
			game.io.to(player.id).emit('update game', data);	//enviar siguiente actividad
		},
		draw : function(client, data){
			client.ringUsed=true;
			$("#use-ring-button").prop('disabled', true);
			client.socket.emit('add activity', {'action' : 'DieRoll', 'value' : data.value});
			client.selectTrackMovement(data, "Avanzar en una pista",  "¡Has activado el Poder del Anillo. Selecciona una pista en la cual moverte y luego deberás tirar el dado; una vez asumidas las consecuencias de la tirada, te moverás en la pista elegida un total de 4 espacios menos la cantidad de símbolos en la cara del dado.",true);
			
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
			//chequeo que, si tengo que hacer un descarte que no puedo hacer por falta de numero de cartas, se mate al personaje
			if (game.getPlayerByAlias(data.alias).hand.length < data.amount){
				data['dead']=true;
			}
			else{
				data['dead']=false;
			}
			game.io.to(player.room).emit('update game', data);
		},
		draw : function(client, data){
			//si debo matar la personaje por no tener las cartas minimas
			if (data.dead){
				if (client.alias == data.alias){
					client.socket.emit('add activity', {'action' : 'KillPlayer', 'alias':data.alias, 'reason': "No tenía suficientes cartas para hacer un descarte obligatorio."});
					client.socket.emit('resolve activity');
				}
			}else{
				var discarded = [];
				//Elijo el titulo segun la cantidad y tipo de cartas que deba descartar
				var texto = "";
				if (data.cards == null){
					if (data.to==null){
						texto = "Debes descartar un total de "+data.amount+" cartas de tu mano, con símbolos cualesquiera.";
					}else{
						texto = "Escoge "+data.amount+" cartas para dar a otro jugador.";
					}
				}else{
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
				var popup = new Popup({title: "Descartar", text: texto, buttons : [{name : "Ok", id:"ok"}] , visibility : data.alias, modal:false});

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
					$(".player-card-img").addClass("grayed-out-card");
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
					$(".player-card-img").removeClass("grayed-out-card");
					if (data.cards == null){
						client.discardAny(data,original_amount, popup);	//chequeo que el descarte sea correcto
					}
					else{
						client.discard(data, popup);	//chequeo que el descarte sea correcto
					}
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
			if (game.getPlayerByAlias(data.alias).corruption+data.amount > 0){
				data['valid'] = true;
				game.getPlayerByAlias(data.alias).move(data.amount);
				if (data.amount>0){
					game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se mueve "+data.amount+" lugares hacia el peligro!", 'mode':'danger'});
					//chequo si choca con Sauron
					if (game.sauronPosition <= game.getPlayerByAlias(data.alias).corruption){
						data['dead'] =true;
					}
					else{
						data['dead'] =false;
					}
				}
				else{
					game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se aleja "+(-data.amount)+" espacios del peligro!", 'mode':'danger'});
				}
			}
			else{
				data['valid'] = false;
			}
				game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			if (data.valid){
				$("#"+data.alias+"-chip").animate({
					'left' : "+="+37*data.amount+"px" //moves right
				},800, function(){
					if (client.isActivePlayer()){
						if (data.dead){
							client.socket.emit('add activity', {'action' : 'KillPlayer', 'alias':data.alias, 'reason': "Se encontró con el Malvado en la Línea de Corrupción."});	
							}	
						}
				});
			}
			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}

		}
		
	},

	//Accion de juego de tirar el dado
	'MoveSauron' :  {
		apply : function(game, player,data){
			game.moveSauron(data.amount);
			//chequeo si no mato a andie en el movimiento
			var people = game.getAlivePlayers();
			data['dead']=[];
			for (i in people){
				if (game.sauronPosition <= game.getPlayerByAlias(people[i].alias).corruption){
					data.dead.push(people[i].alias);
				}
			}
			game.io.to(player.room).emit('log message', {'msg' : "¡Battion se mueve "+data.amount+" lugares hacia los aventureros!", 'mode':'danger'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			$(".sauron-chip").animate({
				'left' : "-="+37*data.amount+"px" //moves right
			},800, function(){
				if (client.isActivePlayer()){
					for (i in data.dead){
						client.socket.emit('add activity', {'action' : 'KillPlayer', 'alias':data.dead[i], 'reason': "Se encontró con el Malvado en la Línea de Corrupción."});	
					}
					client.socket.emit('resolve activity');
				}
			});
			
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

			var people = client.getAlivePlayers();
			for (i in data.cards){
				var el = $("<div id='deal-card-div'>  </div> ");
				el.append("<img src='./assets/img/ripped/"+data.cards[i].image+".png' class='player-card-img img-responsive'>");

				var listbox = $("<select class='card-to-selector'> </select>");
				
				for (j in people){
					$(listbox).append("<option value='"+people[j].alias+"'> "+people[j].alias+"</option>");
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
			if (game.locationNumber == game.locations.length){
				data['victory'] = true;
			}
			else{
				data['tracks'] = game.currentLocation.tracks;
				data['isConflict'] = game.currentLocation.isConflict;
				data['events'] = game.currentLocation.events;
				data['image'] = game.currentLocation.image;
				game.io.to(player.room).emit('log message', {'msg' : "¡Los aventureros avanzan hacia la siguiente locación! ", 'mode':'good'});
				data['victory'] = false;
			}
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (!data.victory){
				if (data.isConflict){
					client.ringUsed=false;
					$("#location-board-img-container").children().remove();
					$("#ring-bearer-div").remove();
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
						$("#location-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id ="Event-chip" class="cone-chip" style="left: 0px; top: -55px;">');

						//Agregar el div del anillo
						if (client.isActivePlayer()){
							client.turnPhase = "drawTiles";	
							client.buttonCheck({phase: client.turnPhase});
							$("#buttons-col").append('<br><div class="board-element-div" id="ring-bearer-div"><img src="./assets/img/ripped/ring.png" class="img-responsive token-img" title="Anillo"><br><button type="button" class="btn btn-success async-input" id="use-ring-button" style="font-size: 1.6vm; font-size: 1.6vmin">Usar el Anillo</button></div>').show('slow');
				        	
				        	//debo agregar el chobi este acá
				        	$("#use-ring-button").on('click', function(){
						    	
						    	client.socket.emit('update game', {'action' : 'UseRing'});

					    	});
						}
				}
				$("#world-chip").animate({
							'left' : "+="+data.mov.x+"px",
							'top' : "+="+data.mov.y+"px",
						},1300);
				if (client.isActivePlayer()){
					client.socket.emit('change location');	
				}
			}
			else{
				if (client.isActivePlayer()){
					client.socket.emit('update game', {'action' : 'EndGame', 'success':true, 'reason': ""});	
				}
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
					client.addCard(data.cards[j]);
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
						if (game.currentLocation.tracks[data.trackName].isMain){
							game.score++;
						}
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
						'left' : "+="+26*data.amount+"px" //moves right
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
					if (typeof (data.origin) == 'undefined'){
						client.selectTrackMovement(data, "Avanzar en una pista",  "Como la pista de la actividad que has sacado no existe, puedes elegir una en la cual avanzar un espacio.");
					}
					else{ 
						if (data.origin == 'gandalf'){ 
							client.selectTrackMovement(data, "Avanzar en una pista",  "Elige una pista para avanzar 2 espacios.");
						}
					}
				}
				if (data.isFinished){
					client.socket.emit('resolve activity');
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

			//tengo que especificar que reward recibe

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
			if (typeof(data.phase) == 'undefined'){
				data['phase'] = game.turnPhase;
			}
			else{
				game.turnPhase = data.phase;
			}
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (client.isActivePlayer()){
				client.turnPhase = data.phase;
				//activo y desactivo los botones de las cartas de acuerdo a en que fase del turno estoy
				client.buttonCheck(data);
					if (data.phase == 'playCards'){
						$("#draw-tile-button").prop('disabled', true);
						client.socket.emit('add activity', {'action' : 'CardsPhase'});
						client.socket.emit('add activity', {'action' : 'NextPhase'});
					}
					else if (data.phase == 'cleanUp'){
						client.socket.emit('add activity', {'action' : 'CleanUpPhase'});
						
					}
					client.socket.emit('resolve activity');
			}
		}
	},

	//Pasar a la siguiente fase del turno
	"NextTurn" : {
		apply : function(game, player,data){
			game.nextTurn(data);
			game.io.to(player.room).emit('log message', {'msg' : "Es el turno de " +game.activePlayer.alias+". ", 'mode':'good'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.players = data.players;
			$(".is-active").removeClass("is-active");
			$("#"+data.activePlayer.alias+"-state-div").addClass("is-active");

			if (client.alias == data.activePlayer.alias){
				client.player.turn=true;
				client.turnPhase = "drawTiles";
				$("#draw-tile-button").prop('disabled', false);
			}
			else{
				client.player.turn=false;
				client.turnPhase = "inactive";

				$("#use-ring-button").prop('disabled', true);
			}
			client.buttonCheck({phase : 'drawTiles'});
		}
	},

	//Retomar el flujo de turno despues de una interupcion
	"ResumeTurn" : {
		apply : function(game, player,data){
			data['phase'] = game.turnPhase;
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (data.phase == "playCards"){
				$("#play-cards-dialog").dialog();
			}
			else if (data.phase == "cleanUp"){
				$("#cleanup-dialog").dialog();
			}
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
				//si no esta en accion un efecto especial que invaldia el siguiente evento
				if (game.hasSpecialEvent("PreventEvent") != null){ 
					data['prevent'] = true;
					game.deleteSpecialEvent("PreventEvent");
					game.io.to(player.room).emit('log message', {'msg' : "¡Hay un efecto de Evitar Evento activado! Se ignorará este evento.", 'mode':'good'});
				}
				else{ 
					data['prevent'] = false;
				}
			}

			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
				$("#Event-chip").animate({
					'top' : "+="+41+"px"
				},1000, function(){
					if (client.isActivePlayer()){
						
						if (!data.prevent){
							client.socket.emit('add activity', {'action' : data.newEvent.name});
						}
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
			var popup = new Popup({title: "Jugar cartas", id: "play-cards-dialog", text: "En esta fase de tu turno, puedes elegir entre: jugar hasta 2 cartas, 'curar' a tu aventurero (retroceder un paso en la Línea de Corrupción), o sacar 2 cartas del mazo.",buttons : [{name : "Jugar cartas de movimiento", id:"playcards"}, {name : "Curarse", id:"heal"},{name : "Sacar cartas", id:"draw"}], visibility : "active"});
			popup.addListener("playcards", function(){
				
				client.socket.emit('add activity', {'action' : 'PlayCards'});
				client.socket.emit('add activity', {'action' : 'NextPhase'});
				
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("heal", function(){
				//client.socket.emit('add activity', {'action' : 'NextPhase'});
				client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : -1});
				client.socket.emit('add activity', {'action' : 'NextPhase'});
				
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("draw", function(){
				//client.socket.emit('add activity', {'action' : 'NextPhase'});
				client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 2, 'player' : client.alias});
				client.socket.emit('add activity', {'action' : 'NextPhase'});
					
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

	//Pasar a la siguiente fase del turno
	"CleanUpPhase" : {
		apply : function(game, player,data){	
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Fin del turno", id:"cleanup-dialog", text: "Es el fin del turno. Antes de darlo por terminado puedes jugar alguna carta especial válida, o, de ser el Portador, utilizar el Anillo.",buttons : [{name : "Terminar turno", id:"ok"}], visibility : "active"});

			popup.addListener("ok", function(){	
				popup.close();
				client.socket.emit('add activity', {'action' : 'NextTurn'});
				client.socket.emit('resolve activity');
			});
			popup.draw(client);
		}
	},

	//Elegir cartas para jugar
	"PlayCards" : {
		apply : function(game, player,data){
			
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		
		},
		draw : function(client, data){
			var popup = new Popup({title: "Jugar cartas", text: "Puedes jugar hasta 2 cartas, como máximo una blanca y una gris (los comodines rojos no cuentan hacia este límite).",buttons : [{name : "Listo", id:"ok"}], visibility : "active", modal:false});
			
			popup.addListener("ok", function(){
				$(".player-card-img").off('click');
				$(".player-card-img").addClass("grayed-out-card");
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
			$(".player-card-img").each(function(){
				if (typeof($(this).data("card"))!='undefined' && $(this).data("card").type!="Special"){
					$(this).removeClass("grayed-out-card");
				}
			})
			client.playCards(popup);

		}
	},

	//Elegir cartas para jugar
	"PlayCard" : {
		apply : function(game, player,data){
			console.log("Como llega la info");
			console.log(data.played);
			console.log(game.getPlayerByAlias(player.alias).hand);
			data['card'] = game.getPlayerByAlias(player.alias).hand[game.getPlayerByAlias(player.alias).findCardByID(data.played.id)];
			console.log("Carta jugada");
			console.log(data.card);
			data.card.apply(game, player,data);
			game.getPlayerByAlias(player.alias).discardByID([data.card]);
			data['alias'] = player.alias;
			if (typeof(data.card)!='undefined' && data.card.type!="Special"){
				game.io.to(player.room).emit('log message', {'msg' : game.activePlayer.alias+" ha jugado una carta de "+data.card.getGameName()+", de "+data.card.amount+" símbolos.", 'mode':'info'});
			}
			else{
				game.io.to(player.room).emit('log message', {'msg' : "¡"+game.activePlayer.alias+" ha jugado una carta Especial!", 'mode':'alert'});
				game.io.to(player.room).emit('log message', {'msg' : data.card.description, 'mode':'info'});

			}
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
			client.buttonCheck({phase:client.turnPhase});
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
					client.addCard(data.dealt);
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
			client.socket.emit('add activity',{'action' : 'TokenCheck'});
			client.socket.emit('add activity',{'action' : 'ChangeRingBearer'});
			client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
			client.socket.emit('resolve activity');
		}
	},

	"TokenCheck" : {
		apply : function(game, player,data){
			var people = game.getAlivePlayers();
			data['moves'] = [];
			for (i in people){
				if (game.hasSpecialEvent("PreventAdvance")!=null && game.hasSpecialEvent("PreventAdvance").player == people[i].alias){
					game.io.to(player.room).emit('log message', {'msg' : "El jugador "+people[i].alias+" está protegido de avanzar en la Línea de Corrupción por efecto de una carta especial.", 'mode':'info'});
					data.moves.push({'alias' : people[i].alias, 'amount': 0})
				}
				else{
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
			data['players'] = game.getAlivePlayers();

			game.io.to(player.room).emit('log message', {'msg' : "¡El nuevo Portador es: "+game.ringBearer.alias+"!", 'mode':'alert'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.players = data.players;
			var people = client.getAlivePlayers();
			for (i in people){
				var span = $("#"+people[i].alias+"-state-div").find("#life-span");
				span.text("0");
				var span = $("#"+people[i].alias+"-state-div").find("#sun-span");
				span.text("0");
				var span = $("#"+people[i].alias+"-state-div").find("#ring-span");
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

	//Llamar a Gandlf (mostrar posibles jugadas)
	"CallGandalf" : {
		apply : function(game, player,data){
			data['options'] = [];
			for (i in game.gandalfCards){ 
				var act = game.gandalfCards[i];
				var valid = true;
				if (act.name == "Sanación"){
					if (game.getPlayerByAlias(player.alias).corruption < 2){ 
						valid = false;
					}
				}
				else if (act.name == "Previsión"){ 
					if (game.storyTiles.length < 3){ 
						valid = false;
					}
				}
				else if (act.name == "Persistencia"){ 
					if (game.hobbitCards.length < 4){ 
						valid = false;
					}
				}
				data.options.push({'name' : act.name, 'description':act.description, 'valid' : valid});
			}
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Llamar al Mago", text: "A cambio de descartar 5 fichas de Escudo, puedes llamar al Mago para auxiliar, eligiendo una efecto válido de la lista. ",buttons : [{name : "Ok", id:"ok"}, {name : "Cancelar", id:"cancel"}], visibility : "active"});
			//pongo los elementos de reparto de cada carta
							var div = $("<div>  </div>");
							var el = $("<div id='advance-div'>  </div> ");
							var listbox = $("<select id='gandalf-selector'> </select>");
							//Agrego los tracks por los que puedo avanzar
							for (i in data.options){
								var option = $("<option value='"+data.options[i].name+"'> "+data.options[i].name+"</option>");
								$(listbox).append(option);
							}			
							$(el).append($(listbox));
							div.append(el);
							var desc = $("<br> <div id='description-div'> <span id='description-span'> </span>  </div> ");
							div.append(desc);
							popup.append(div);
							var selected = data.options[0];
							if (!selected.valid){ 
									popup.disableButton("ok", true);
								}
								else{
									popup.disableButton("ok", false); 
								}
							desc.text(selected.description);

							//Mostrar la descripcion del selecto
							listbox.on('change', function(){ 
								for (j in data.options){ 
									if (data.options[j].name == $("#gandalf-selector").val()){ 
										selected = data.options[j];
									}
								}
								desc.text(selected.description);
								if (!selected.valid){ 
									popup.disableButton("ok", true);
								}
								else{
									popup.disableButton("ok", false); 
								}
							});
							
							
							//cuando me dan ok envio cada carta al jugador correspondiente
							popup.addListener("ok", function(){
								$("#gandalf-selector").each(function(){
									client.socket.emit('add activity', {'action' : 'PlayGandalfCard', 'card': $("#gandalf-selector").val(), 'description' : selected.description});
								});
							
								$("#gandalf-selector").remove();
								client.socket.emit('add activity', {'action' : 'ChangeTokens', 'alias' :client.alias, 'token':'shield', 'amount':-5});
								client.socket.emit('resolve activity');
								popup.close();
							});

							popup.addListener("cancel", function(){		
								$("#gandalf-selector").remove();
								$("#call-gandalf-button").prop('disabled', false);
								popup.close();
							});

				popup.draw(client);

				if (data.options.length == 0){ 
					popup.disableButton("ok", true);
				}
		}
	},

	"PlayGandalfCard" : {
		apply : function(game, player,data){
			var pos = 0;
			for (j in game.gandalfCards){ 
				if (data.card == game.gandalfCards[j].name){ 
					pos=j;
				}
			}
			game.gandalfCards.splice(pos,1);
			game.io.to(player.room).emit('log message', {'msg' : "¡"+player.alias+" descarta 5 escudos y llama al Mago! Elige usar la carta: "+data.card+".", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : data.description, 'mode':'info'});
			data['card'] = new Card({name: data.card, type: 'GandalfCard', color:null, symbol:null, amount:null, image:null}); //crear una nueva instancia de la carta
			data.card.apply(game,player,data);

			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var card = new Card(data.card);
			card.draw(client, data);
			client.socket.emit('resolve activity');
		}
	},

	"RearrangeTiles" : {
		apply : function(game, player,data){
			var tiles = [];
			var i=0;
			while (i<3){ 
				tiles.push(game.storyTiles[game.storyTiles.length-i-1]);
				game.storyTiles.splice(game.storyTiles.length-i-1,1);
				i++;
			}
			data['tiles'] = tiles;
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.rearrangeTiles(data);
		}
	},

	"PutTiles" : {
		apply : function(game, player,data){
			var i = 3;
			while (i > 0){ 
				for (j in data.tiles){ 
					if (data.tiles[j].number == i){ 
						game.storyTiles.push(data.tiles[j].tile);
					}
				}
				i--;
			}
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.socket.emit('resolve activity');
		}
	},

	"PlaySpecialCard" : {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			
			var popup = new Popup({title: "Jugar cartas", id:"play-special-popup", text: "Haz click en una carta especial habilitada para jugarla.",buttons : [{name : "Cancelar", id:"cancel"}], visibility : "active"});
			$(".player-card-img").each(function(){
				if (typeof($(this).data("card"))!=="undefined" && $(this).data("card").type=="Special"){
						var card = $(this).data("card");
						//busco si el momento de juego es adecuado para activar la carta
						var found = false;
						var i=0;
						while (!found && i<card.phases.length){
							if (card.phases[i] == client.turnPhase){
								found = true;
							}
							else{
								i++;
							}
						}
						//busco en activities
						if (!found){
							var found2 = false;
							var j=0;
								while (!found2 && j<card.activities.length){
									if (card.activities[j] == client.currentActivity){
										found2 = true;
									}
									else{
										j++;
									}
								}
						}
						if (found || found2 ){	
							$(this).removeClass("grayed-out-card");
							$(this).on('click', function(){
									$(this).remove();
									$(this).addClass("grayed-out-card");
									$(".player-card-img").off('click');
									popup.close();
									client.socket.emit('update game',{'action': 'PlayCard', 'played': card});

							});
						}
						else{
							$(this).addClass("grayed-out-card");
							$(this).off('click');
						}
				}
			});
			popup.addListener("cancel", function(){
				$(".player-card-img").off('click');
				$(".player-card-img").addClass("grayed-out-card");
				client.restoreAsync();
				popup.close();
			});

			popup.draw(client);
		}
	},

	//Acciones a realizar cuando un aventurero muere
	"KillPlayer" : {
		apply : function(game, player,data){
			var dead_player = game.getPlayerByAlias(data.alias);
			dead_player.dead=true;
			dead_player.lifeTokens = 0;
			dead_player.sunTokens = 0;
			dead_player.ringTokens = 0;
			data['dead_player'] = dead_player;
			//si el muerto es el ring bearer temrina el juego
			if (dead_player.alias == game.ringBearer.alias){
				data['lose']=true;
			}
			else{
				data['lose']=false;
			}
			game.io.to(player.room).emit('log message', {'msg' : "¡El jugador "+data.alias+" ha muerto! Su aventurero será eliminado del juego.", 'mode':'death'});
			game.io.to(player.room).emit('log message', {'msg' : "La muerte del jugador fue debido a: "+data.reason, 'mode':'death'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.players[data.dead_player.number] = data.dead_player;
			//si el usuario era el ring bearer, el juego está automaticamente perdido
			
				$("#"+data.dead_player.alias+"-chip").remove();
				$("#"+data.dead_player.alias+"-state-div").append("<div class='dead-player-overlay'> </div>");
				if (client.alias == data.alias){
					client.player.dead = true;
					if (!data.lose){
						client.socket.emit('resolve activity');
					}
					else{
						client.socket.emit('update game', {'action' : 'EndGame', 'success':false, 'reason': "El Portador del Anillo encontró al Malvado en la Línea de Corrupción."});
					}
					
				}
		}
	},

	//El juego termina, sea derrota o victoria y por cualquier razón
	"EndGame" : {
		apply : function(game, player,data){
			if (data.success){
				for (i in game.players){
					game.score+=game.players[i].shields;
				}				
			}
			data['score'] = game.score;
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			$("#main-game-div").fadeOut(300, function(){ $(this).remove();})
			$("#end-game-div").appendTo('body').show('slow');
			if (data.success){
				$("#outcome-header").append("<span style='color: #2ECCFA;'> ¡Victoria! Los aventureros han completado el úlitmo escenario y triunfado sobre el Mal. </span>")
			}
			else{
				$("#outcome-header").append( "<span style='color: #FF0000;'>¡Derrota! Los aventureros han caido en las garras del Malvado.<span style='color: #2ECCFA;'>")
				$("#reason-header").append("La derrota se debió a: "+data.reason);
			}
			$("#score-header").append("El puntaje final de los aventureros es: "+data.score);
		}
	}
	
	}

	return exports;
});