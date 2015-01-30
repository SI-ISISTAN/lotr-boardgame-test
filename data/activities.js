define(['../classes/client-side/Popup','../classes/client-side/Alert'], function (Popup, Alert) {
	
	var exports = { //Lo que retorna el módulo

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
				}
				i++;
			}
			data['given'] = given;
			game.io.to(player.room).emit('update game', data);	//enviar siguiente actividad

		},
		draw : function(client, data){
			for (j in data.given){	//arreglare

				if (data.given[j].player == client.player.alias){
					$("<img src='./assets/img/ripped/"+data.given[j].card.image+".png' class='player-card-img img-responsive' style='display : none'>").data("id",data.given[j].card).appendTo("#player-cards-container").show('slow');
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
			var div = $("<div style = 'display : none'>  </div>")
			var popup = new Popup({title: "Tirar dado", id:"die-div", text: "El jugador "+data.player+" lanza el dado y obtiene...", buttons : [] , isPublic : true});
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
					action = {'action' : 'ForceDiscard', 'alias' : data.player, 'amount' : 2};
				break;
			}
			popup.append(div);
			popup.draw(client);
				
				div.fadeIn(4000, function(){
					if (client.isActivePlayer()){
						if (action!= null){
							client.socket.emit('add activity', action);
						}
						client.socket.emit('resolve activity');
					}
					
					popup.close();
				});
			
			
		}
		
	},

	//Un jugador se descarta
	"PlayerDiscard" : {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.player).discard(data.discard);
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			
			//dibujar el descarte
			$(".player-card-img.highlighted-image").remove();
			var span = $("#"+data.player+"-state-div").find("#cards-span");
			var currentValue = parseInt(span.text());
			span.text(currentValue-data.discard.length);
			if (client.isActivePlayer()){
				client.socket.emit('resolve activity');
			}
		}
	},

	//Un jugador debe, forzosamente, elegir algunas cartas de su mano para descartarse
	"ForceDiscard" :  {
		apply: function(game,player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			var discarded = [];
			//Dibujo una alerta indicandome
			var popup = new Popup({title: "Descartar", text: "Debes descartar "+data.amount+" cartas de tu mano.", buttons : [{name : "Ok"}] , isPublic : false});
			popup.addListener("Ok", function(){
				//ordenar el descarte
				//getear el numero de cartas seleccionadas
				var discard = [];
				var hand = $(".player-card-img");
				$(".highlighted-image").each(function(){
					discard.push($(this).data("id"));	//pushear el id de la carta
				});

				client.socket.emit('add activity', {'action' : 'PlayerDiscard', 'player' : client.alias, 'discard' : discard});	//si no, emito que la termine
				client.socket.emit('resolve activity');
				popup.close();
			});
			popup.draw(client);
			popup.disableButton("Ok", true);

			//Proceso el descarte (pasar a una clase de input handler??)
			if (client.isActivePlayer()){
				var discarded = 0;
				//como coño hago el descarte?
				$(".player-card-img").on('click', function(){
					if (! $(this).data("selected")){	//si ya estaba seleccionada
						//var index = $(this).index();
						$(this).addClass("highlighted-image");
						$(this).data("selected", true);
						$(this).data("number", $(this).index()-1);
						discarded++;

					}
					else{								//si no estaba seleccionada
						$(this).removeClass("highlighted-image");
						$(this).data("selected", false);
						discarded--;

					}
					if (discarded != data.amount){
						popup.disableButton("Ok", true);
					}
					else{
						popup.disableButton("Ok", false);
					}
				});
			}
		}
		
	},

	//Accion de juego de tirar el dado
	'MovePlayer' :  {
		apply : function(game, player,data){
			game.getPlayerByAlias(data.alias).move(data.amount);
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			$("#"+data.alias+"-chip").animate({
				'left' : "+="+2.38*data.amount+"vw" //moves right
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
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			$(".sauron-chip").animate({
				'left' : "-="+2.38*data.amount+"vw" //moves right
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
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			var popup = new Popup({title: "Repartir cartas", text: "Distribuye las cartas como desees. ",buttons : [{name : "Ok"}],isPublic : false});
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
			popup.addListener("Ok", function(){
					console.log("Voy a emitir los eventos");
					$(".card-to-selector").each(function(){
						console.log("cumabiabama");
						var to = $(this).val();
						console.log(to);
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

	//////////////// Actividades que se cargan en el juego ////////////////

	//Primera accion del juego
	"Gandalf" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){

			var popup = new Popup({title: "Gandalf", text: "Se reparte a cada jugador 6 cartas de Hobbit del mazo.", buttons : [{name : "Ok"}], isPublic : false});
			popup.addListener("Ok", function(){
				popup.close();
				client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 6, 'player' : null});	//repetir el evento a los otros clientes
				console.log("you");
				client.socket.emit('resolve activity');
			});

			popup.draw(client);
			
		}
	},

	//Accion de juego Preparations
	"Preparations" : {
		apply : function(game,player,data){
			game.io.to(player.room).emit('update game', data);	//repetir el evento a los usuarios
		},
		draw : function(client, data){
			var popup = new Popup({
				title: "Preparaciones", 
				text: "Puedes prepararte para el viaje. Si deseas hacerlo, tirarás el Dado de Corrupción, pero luego podrás sacar 4 cartas y distribuirlas como desees.", 
				buttons : [{name : "Prepararse"},  {name : "No prepararse"}] 
			});
			popup.addListener("Prepararse", function(){
				client.socket.emit('add activity', {'action' : 'RollDie'});	//repetir el evento a los otros clientes
				client.socket.emit('add activity', {'action' : 'PlayerDealCards', 'amount' : 4});	//repetir el evento a los otros clientes
				client.socket.emit('resolve activity');
				popup.close();	
			});
			popup.addListener("No prepararse", function(){
				client.socket.emit('resolve activity');
				popup.close();	
			});
			popup.draw(client);
		}
		
	}


	};

	return exports;
	
});