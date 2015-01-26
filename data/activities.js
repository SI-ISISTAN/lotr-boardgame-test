define(['../classes/client-side/Popup','../classes/client-side/Alert'], function (Popup, Alert) {
	
	var exports = { //Lo que retorna el módulo

	//////////////// Actividades genéricas ////////////////

	//Accion que hace todo lo necesario tras resolver una actividad para pasar a la siguiente
	"ResolveActivity" : {
		name: 'Resolver actividad',
		apply : function (game, player){
			var new_act = game.currentLocation.currentActivity.next();
			if (new_act != null){
				game.currentLocation.currentActivity = new_act;
			}
		},
		draw : function(client){
			if (client.currentGame.currentLocation.currentActivity.draw != null){
				if (client.isActivePlayer())
					client.socket.emit('update game', {'action' : client.currentGame.currentLocation.currentActivity.name});	//si no, emito que la termine
			}
		}
	},

    //Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealHobbitCards" : {
		name: 'Dar cartas de hobbit',
		apply : function (game, player){
			//llevo un registro interno de que cartas le doy a cada uno para poder dibujarlo en "draw"
			this.given = [];

			var i=0;
			while (i<this.data.amount){
				if (this.data.player == null){			//si me pasan nulo le reparto a todos
					for (j in game.players){
						var card = game.hobbitCards[game.hobbitCards.length-1];
						game.getPlayerByID(game.players[j].id).hand.push(card);
						game.hobbitCards.splice(game.hobbitCards.length-1);
						this.given.push({'card' : card, 'player' : game.players[j].alias});
					}
				}
				else{
					console.log("le doy una tacar a "+this.data.player);
					var card = game.hobbitCards[game.hobbitCards.length-1];
					game.getPlayerByAlias(this.data.player).hand.push(card);
					game.hobbitCards.splice(game.hobbitCards.length-1);
					this.given.push({'card' : card, 'player' : this.data.player});
				}
				i++;
			}
			console.log(this.given);
		},
		draw : function(client){
			console.log(this.given);
			for (j in this.given){	//arreglare

				if (this.given[j].player == client.player.alias){
					$("<img src='./assets/img/ripped/"+this.given[j].card.image+".png' class='player-card-img img-responsive' style='display : none'>").appendTo("#player-cards-container").show('slow');
				}
			}
			for (i in client.currentGame.players){
				$("#"+client.currentGame.players[i].alias+"-state-div").find("#cards-span").text(client.currentGame.players[i].hand.length);
			}
			this.end(client);
		}
	},

	//Accion de juego de tirar el dado
	"ChangeLocation" :  {
		name: 'Cambiar locacion',
		apply : function (game, player){
			game.currentLocation.currentActivity = this.newActivity(game.currentLocation.currentActivity.name, game.currentLocation.currentActivity.subactivities, null);
			game.currentLocation.currentActivity.setData(this.data);
		},
		draw : function(client){
			var self = this;

			if (!client.currentGame.currentLocation.isConflict){
				if (client.currentGame.activePlayer.id == client.id){
		        	client.socket.emit('update game', {'action' : client.currentGame.currentLocation.currentActivity.next().name});	//si no, emito que la termine
				}
			}
		}
	},

	//Accion de juego de tirar el dado
	"RollDie" :  {
		name: 'Lanzar dado',
		draw : function(client){
			var self = this;
			var div = $("<div style = 'display : none'>  </div>")
			var popup = new Popup({title: "Tirar dado", id:"die-div", text: "El jugador "+client.player.alias+" lanza el dado y obtiene...", buttons : [] , isPublic : true});
			var action = null;
			switch (this.data.value){
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

					action = {'action' : 'MovePlayer', 'alias' : client.player.alias, 'amount' : 1};
					
				break;
				case 4:

					div.append($('<img src="./assets/img/ripped/die3.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe moverse dos espacios en la línea de corrupción. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : client.player.alias, 'amount' : 2 };
					
				break;
				case 5:

					div.append($('<img src="./assets/img/ripped/die4.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe moverse tres espacios en la línea de corrupción. </p>"));
					action = {'action' : 'MovePlayer', 'alias' : client.player.alias, 'amount' : 3};
				break;
				case 6:
					div.append($('<img src="./assets/img/ripped/die5.png" alt="Dado de amenaza" class="img-responsive token-img" ><br><br>'));
					div.append($("<p> Debe descartar dos cartas. </p>"));
					action = {'action' : 'ForceDiscard', 'alias' : client.player.alias, 'amount' : 2};
				break;
			}
			popup.append(div);
			popup.draw(client);
				
				div.fadeIn(4000, function(){
					if (client.isActivePlayer()){
						if (action!= null){
							client.socket.emit('update game', action);
						}
					}
						popup.close();
						if (client.isActivePlayer()){
							client.socket.emit('update game', {'action' : 'PlayerDealCards', 'amount' : 4, 'cards' : []});	//repetir el evento a los otros clientes
						}
						self.end(client); //siguiente subactividad	
				});
			
			
		}
		
	},

	//Un jugador se descarta
	"PlayerDiscard" : {
		name : "Descartar",
		apply : function(game, player){
			game.getPlayerByID(this.data.playerID).discard(this.data.discard);
		},
		draw : function(client){
			var self=this;
			
			//dibujar el descarte
			$(".player-card-img.highlighted-image").remove();
			$("#"+client.player.alias+"-state-div").find("#cards-span").text(client.player.hand.length);	//que ondis???
		}
	},

	//Un jugador debe, forzosamente, elegir algunas cartas de su mano para descartarse
	"ForceDiscard" :  {
		name: 'Descartar',
		draw : function(client){
			var self=this;
			var discarded = [];
			//Dibujo una alerta indicandome
			var popup = new Popup({title: "Descartar", text: "Debes descartar "+self.data.amount+" cartas de tu mano.", buttons : [{name : "Ok"}] , isPublic : false});
			popup.addListener("Ok", function(){
				//ordenar el descarte
				//getear el numero de cartas seleccionadas
				var discard = [];
				var hand = $(".player-card-img");
				$(".highlighted-image").each(function(){
					discard.push(client.player.hand[$(this).data("number")].id);	//pushear el id de la carta
				});

				client.socket.emit('update game', {'action' : 'PlayerDiscard', 'playerID' : client.id, 'discard' : discard});	//si no, emito que la termine
				popup.close();
				self.end(client);
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
					if (discarded != self.data.amount){
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
		name: 'Mover personaje',
		apply : function(game, player){
			game.getPlayerByAlias(this.data.alias).move(this.data.amount);
		},
		draw : function(client){

			$("#"+this.data.alias+"-chip").animate({
				'left' : "+="+2.4*this.data.amount+"vw" //moves right
			},800);
			
		}
		
	},

	//Accion de juego de tirar el dado
	'MoveSauron' :  {
		name: 'Mover a Battion',
		apply : function(game, player){
			game.moveSauron(this.data.amount);
		},
		draw : function(client){
			$(".sauron-chip").animate({
				'left' : "-="+2.4*this.data.amount+"vw" //moves right
			},800);
			
		}
		
	},

	//Se sacan algunas cartas y el jugador activo las reparte como desea
	"PlayerDealCards" : {
		name : "Distribuir cartas",
		apply : function(game, player){
			this.data.cards = [];
			for (var i=0; i<this.data.amount; i++){
				this.data.cards.push(game.hobbitCards[game.hobbitCards.length-1-i]);
			}
			console.log(game);
		},
		draw : function(client){
			var self=this;

			var popup = new Popup({title: "Repartir cartas", text: "Distribuye las cartas como desees. ",buttons : [{name : "Ok"}],isPublic : false});
			//pongo los elementos de reparto de cada carta
			var div = $("<div>  </div>");

			console.log(this.data.cards);

			for (i in this.data.cards){
				var el = $("<div id='deal-card-div'>  </div> ");
				el.append("<img src='./assets/img/ripped/"+this.data.cards[i].image+".png' class='player-card-img img-responsive'>");

				var listbox = $("<select class='card-to-selector'> </select>");
				for (j in client.currentGame.players){
					$(listbox).append("<option value='"+client.currentGame.players[j].alias+"'> "+client.currentGame.players[j].alias+"</option>");
				}
				listbox.data("id",i);
				$(el).append($(listbox));

				div.append(el);	
			}

			popup.append(div);

			//cuando me dan ok envio cada carta al jugador correspondiente
			popup.addListener("Ok", function(){
					$(".card-to-selector").each(function(){
						var to = $(this).val();
						console.log(to);
						client.socket.emit('update game', {'action' : 'DealHobbitCards', 'amount' : 1, 'player' : to});	//voy dando las cartas de a una
					})
					
				popup.close();
				self.end(client); //siguiente subactividad
			});

			popup.draw(client);

		}
	},

	//////////////// Actividades que se cargan en el juego ////////////////

	//Primera accion del juego
	"Gandalf" : {
		name: 'Gandalf',
		draw : function(client){
			var self = this;

			var popup = new Popup({title: "Gandalf", text: "Se reparte a cada jugador 6 cartas de Hobbit del mazo.", buttons : [{name : "Ok"}], isPublic : false});
			popup.addListener("Ok", function(){
				popup.close();
				client.socket.emit('update game', {'action' : 'DealHobbitCards', 'amount' : 6, 'player' : null});	//repetir el evento a los otros clientes
				self.end(client); //siguiente subactividad
			});
			
			popup.draw(client);
			
		}
	},

	//Accion de juego Preparations
	"Preparations" : {
		name : 'Preparación',
		draw : function(client){
			var self = this;

			var popup = new Popup({
				title: "Preparaciones", 
				text: "Puedes prepararte para el viaje. Si deseas hacerlo, tirarás el Dado de Corrupción, pero luego podrás sacar 4 cartas y distribuirlas como desees.", 
				buttons : [{name : "Prepararse"},  {name : "No prepararse"}] 
			});
			popup.addListener("Prepararse", function(){
				client.currentGame.rollDie(client);
				popup.close();
			});
			popup.addListener("No prepararse", function(){
				self.end(client); //siguiente subactividad
				popup.close();
			});
			popup.draw(client);
		}
		
	}


	};

	return exports;
	
});