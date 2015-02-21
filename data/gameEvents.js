define(['../classes/client-side/Popup'], function (Popup) { 
	
	var exports = {
	//////////////// Actividades que se cargan en el juego ////////////////

	/////////////////////////////////////////////////// EVENT TILES  ////////////////////////////////////////////////////

	'SauronWill' :  {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			//Si el track no existe en el escenario, se le da al usuario la opcion de moverse en el track que quiera
					var popup = new Popup({title: "Voluntad de Battion", text: "Los jugadores deben acordar y elegir a un jugador para que avance dos espacios hacia el peligro, o Battion avanzará un espacio hacia los aventureros.",buttons : [{name : "Este jugador avanzará", id:"advance"}, {name : "Ningún jugador avanzará", id:"stay"}], visibility : "active"});
						//pongo los elementos de reparto de cada carta
						var div = $("<div>  </div>");
						var el = $("<div id='advance-div'>  </div> ");
						var listbox = $("<select class='player-selector'> </select>");
						//Agrego los tracks por los que puedo avanzar
						for (i in client.players){
							$(listbox).append("<option value='"+client.players[i].alias+"'> "+client.players[i].alias+"</option>");
						}			
						$(el).append($(listbox));
						div.append(el);	
						popup.append(div);
						//cuando me dan ok envio cada carta al jugador correspondiente
						popup.addListener("advance", function(){
								$(".player-selector").each(function(){
									var to = $(this).val();
									client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : to, 'amount' : 2});
								});
								client.socket.emit('resolve activity');
								popup.close(); 
						});
						popup.addListener("stay", function(){
								client.socket.emit('add activity', {'action' : 'MoveSauron', 'amount' : 1});
								client.socket.emit('resolve activity');
								popup.close(); 
						});

					popup.draw(client);
		}
		
	},

	'OutOfOptions' :  {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.socket.emit('add activity',{'action' : 'CommonDiscard', 'elements' : [{element : 'card', symbol: null, color:null, amount: 1},{element : 'card', symbol: null, color:null, amount: 1},{element : 'card', symbol: null, color:null, amount: 1}], 'defaultAction' : {'action' : 'NextEvent'}});
			client.socket.emit('resolve activity');
		}
		
	},

	'LosingGround' :  {
		apply : function(game, player,data){
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			client.socket.emit('add activity',{'action' : 'CommonDiscard', 'elements' : [{element : 'card', symbol: null, color:null, amount: 1},{element : 'token', token: 'life', amount: 1},{element : 'token', token: 'shield', amount: 1}], 'defaultAction' : {'action' : 'NextEvent'}});
			client.socket.emit('resolve activity');
		}
		
	},

	/////////////////////////////////////////////////// ACCIONES DE BAG END ////////////////////////////////////////////////////

	//Primera accion del juego
	"Gandalf" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Gandalf.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Debe repartirse a cada jugador 6 cartas del mazo.", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){

			var popup = new Popup({title: "Gandalf", text: "Se reparte a cada jugador 6 cartas de Hobbit del mazo.", buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
			popup.addListener("ok", function(){
				popup.close();
				client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 6, 'player' : null});	
				client.socket.emit('resolve activity');
			});

			popup.draw(client);
			
		}
	},

	//Accion de juego Preparations
	"Preparations" : {
		apply : function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Preparaciones.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Puede elegir entre pasar a la actividad siguiente o tirar el Dado de Corrupción para luego sacar 4 cartas del mazo y repartirlas como desee entre todos los jugadores.", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			var popup = new Popup({
				title: "Preparaciones", 
				text: "Puedes prepararte para el viaje. Si deseas hacerlo, tirarás el Dado de Corrupción, pero luego podrás sacar 4 cartas y distribuirlas como desees.", 
				buttons : [{name : "Prepararse", id:"prepare"},  {name : "No prepararse", id:"dont-prepare"}] 
			});
			popup.addListener("prepare", function(){
				client.socket.emit('add activity', {'action' : 'RollDie'});	

				client.socket.emit('add activity', {'action' : 'PlayerDealCards', 'amount' : 4});	
				client.socket.emit('resolve activity');
				popup.close();	
			});
			popup.addListener("dont-prepare", function(){

				client.socket.emit('resolve activity');
				popup.close();	
			});
			popup.draw(client);
		}
		
	},

	//Accion de juego Nazgul Appears
	"Nazgul Appears" : {
		apply : function(game,player,data){
			var candidates = [];
			var cards = [{symbol: 'Hiding', color: null}, {symbol: 'Hiding', color: null}]; //son dos cartas de Esconderse
			for (v in game.players){
				if (game.players[v].hasCards(cards)){
					candidates.push(game.players[v].alias);
				}
			}
			data['candidates'] = candidates;
			data['cards'] = cards;

			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Un Sah'mid Aparece.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Algún jugador debe descartar dos símbolos de Esconderse (o comodines en su lugar). Deben decidir por medio del chat quién lo hará, y en último termino el jugador activo lo señalará. Si ningún jugador quiere o puede hacerlo, Battión avanza un espacio hacia los aventureros.", 'mode':'info'});

			game.io.to(player.room).emit('update game', data);	
		},

		draw : function(client, data){
			var popup = new Popup({
				title: "Un Sah'mid Aparece", 
				text: "Algún jugador debe descartar dos símbolos de Esconderse (o comodines en su lugar). Deben decidir por medio del chat quién lo hará, y en último termino el jugador activo lo señalará. Si ningún jugador quiere o puede hacerlo, Battión avanza un espacio hacia los aventureros. Cuando estés listo, elige un jugador de la siguiente lista, que contiene sólo a quienes pueden hacer este descarte:", 
				buttons : [ {name : "Este jugador descartará", id:"discard"}, {name : "No descartar", id:"dont-discard"}] 
			});
			popup.addListener("discard", function(){
				client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : data.cards.length, 'alias' : $(".discard-to-selector").val(),'cards': data.cards, 'to':null});
				client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
				client.socket.emit('resolve activity');
				popup.close();	
			});
			popup.addListener("dont-discard", function(){
				client.socket.emit('add activity', {'action' : 'MoveSauron', 'amount' : 1});
				client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
				client.socket.emit('resolve activity');
				popup.close();	
			});

			var listbox = $("<select class='discard-to-selector'> </select>");
			for (j in data.candidates){
				$(listbox).append("<option value='"+data.candidates[j]+"'> "+data.candidates[j]+"</option>");
			}
			popup.append($(listbox));
			popup.draw(client);
			if (data.candidates.length == 0){
				popup.disableButton("discard", true);
			}
		}
		
	},

	/////////////////////////////////////////////////// ACCIONES DE RIVENDELL ////////////////////////////////////////////////////

	"Elrond" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Elorond.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Las cartas de locación de Rivendell se reparten entre los jugadores.", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){

			var popup = new Popup({title: "Elrond", text: "Se reparten las cartas de locación entre los jugadores.", buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
			popup.addListener("ok", function(){
				popup.close();
				client.socket.emit('add activity', {'action' : 'DealFeatureCards'});	
				client.socket.emit('resolve activity');
			});

			popup.draw(client);
			
		}
	},

	"Council" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Consejo.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Cada jugador, comenzando por el Portador y siguiendo hasta el último, debe elegir una carta para pasársela al jugador siguiente (el últino le pasa al primero).", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){

			var popup = new Popup({title: "Elrond", text: "Cada jugador, comenzando por el Portador y siguiendo hasta el último, debe elegir una carta para pasársela al jugador siguiente.", buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
			popup.addListener("ok", function(){
				popup.close();
				for (var i=0; i < client.players.length; i++){
					if (i<client.players.length-1){
						client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : 1, 'alias' : client.players[i].alias, 'cards': null, 'to':client.players[i+1].alias});	
					}
					else{
						client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : 1, 'alias' : client.players[i].alias, 'cards': null, 'to':client.players[0].alias});
					}
				}
				client.socket.emit('resolve activity');
			});

			popup.draw(client);
			
		}
	},

	"Fellowship" : {
		apply: function(game,player,data){
			if (data.player =='first'){
				data['player']=game.players[0].alias;
				game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Comunidad.", 'mode':'alert'});
				game.io.to(player.room).emit('log message', {'msg' : "Cada jugador, comenzando por el Portador y siguiendo hasta el último, debe elegir entre descartar una carta de símbolo Comodín o, de no poder o no querer hacerlo, tirar el Dado de Corrupción.", 'mode':'info'});
			}
			if (game.getPlayerByAlias(data.player).hasCards([{color:null, symbol:"Joker"}])){
				data['canDiscard']=true;
			}
			else{
				data['canDiscard']=false;
			}
			game.io.to(player.room).emit('update game', data);
		},
		draw : function(client, data){

			var popup = new Popup({title: "Comunidad", text: "Cada jugador, comenzando por el Portador y siguiendo hasta el último, debe elegir entre descartar una carta de símbolo Comodín o, de no poder o no querer hacerlo, tirar el Dado de Corrupción.", buttons : [{name : "Descartar", id:"discard"},  {name : "Tirar el Dado", id:"rolldie"}] , visibility : data.player});
			popup.addListener("discard", function(){
				client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : 1, 'alias' : client.alias, 'cards': [{color:null, symbol:"Joker"}], 'to': null});
				if (client.isActivePlayer()){
					for (var i=1; i < client.players.length; i++){
						if (i<client.players.length){
							client.socket.emit('add activity', {'action' : "Fellowship", 'player' : client.players[i].alias});	
						}
					}
				client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
				}
				client.socket.emit('resolve activity');
				popup.close();
			});
			popup.addListener("rolldie", function(){
				client.socket.emit('add activity', {'action' : 'RollDie'});	
				if (client.isActivePlayer()){
					for (var i=1; i < client.players.length; i++){
						if (i<client.players.length){
							client.socket.emit('add activity', {'action' : "Fellowship", 'player' : client.players[i].alias});
						}
					}
					client.socket.emit('add activity', {'action' : 'AdvanceLocation'});
				}
				client.socket.emit('resolve activity');

				popup.close();
			});
			popup.draw(client);
			if (!data.canDiscard){
				popup.disableButton("discard",true);
			}
			
		}
	},

	/////////////////////////////////////////////////// ACCIONES DE MORIA ////////////////////////////////////////////////////

	'SpeakFriend' :  {
		apply : function(game, player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: 'Habla, Amigo'", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "El grupo debe descartar un símbolo de Amistad y uno de Comodín. De no poder o no querer hacerlo, Battion se mueve un espacio hacia los aventureros.", 'mode':'info'});
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Evento: La Entrada", text: "El grupo debe descartar un símbolo de Amistad y uno de Comodín. De no poder o no querer hacerlo, Battion se mueve un espacio hacia los aventureros.", buttons : [{name : "Descartar", id:"discard"},  {name : "No descartar", id:"rolldie"}] , visibility : data.player});

			popup.addListener("discard", function(){
				client.socket.emit('add activity',{'action' : 'CommonDiscard', 'elements' : [{element : 'card', symbol: "Friendship", color:null, amount: 1},{element : 'card', symbol: "Joker", color:null, amount: 1}], 'defaultAction' : {'action' : 'MoveSauron', 'amount' : 1}});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("rolldie", function(){
				client.socket.emit('add activity',{'action' : 'MoveSauron', 'amount' : 1}); 
				popup.close();
				client.socket.emit('resolve activity');
			});
			
			popup.draw(client);
		}
		
	},

	'WaterWatcher' :  {
		apply : function(game, player,data){
			if (typeof data.player == 'undefined'){
				data['player']=game.players[0].alias;
				game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: 'Vigilante en el Agua'", 'mode':'alert'});
				game.io.to(player.room).emit('log message', {'msg' : "Cada jugador, uno a la vez, debe elegir entre descartar un símbolo de Esconderse (o un Comodín) o, de no poder o querer hacerlo, tirar el Dado.", 'mode':'info'});
			}
			if (game.getPlayerByAlias(data.player).hasCards([{color:null, symbol:"Hiding"}])){
				data['canDiscard']=true;
			}
			else{
				data['canDiscard']=false;
			}
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){

			var popup = new Popup({title: "Evento: Vigilante en el Agua", text: "Cada jugador, uno a la vez, debe elegir entre descartar un símbolo de Esconderse (o un Comodín) o, de no poder o querer hacerlo, tirar el Dado.", buttons : [{name : "Descartar", id:"discard"},  {name : "Tirar el Dado", id:"rolldie"}] , visibility : data.player});
			popup.addListener("discard", function(){
				client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : 1, 'alias' : client.alias, 'cards': [{color:null, symbol:"Hiding"}], 'to': null});
				if (client.isActivePlayer()){
					for (var i=1; i < client.players.length; i++){
						if (i<client.players.length){
							client.socket.emit('add activity', {'action' : "WaterWatcher", 'player' : client.players[i].alias});	
						}
					}
				}
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("rolldie", function(){
				client.socket.emit('add activity',{'action' : 'RollDie'});
				if (client.isActivePlayer()){
					for (var i=1; i < client.players.length; i++){
						if (i<client.players.length){
							client.socket.emit('add activity', {'action' : "WaterWatcher", 'player' : client.players[i].alias});	
						}
					}
				} 
				popup.close();
				client.socket.emit('resolve activity');
			});
			
			popup.draw(client);

			if (!data.canDiscard){
				popup.disableButton("discard",true);
			}
		}
		
	},

	'WellStone' :  {
		apply : function(game, player,data){
			data['card'] = {color: null, symbol: game.hobbitCards[game.hobbitCards.length-1].symbol, image:game.hobbitCards[game.hobbitCards.length-1].image};
			game.hobbitCards.splice(game.hobbitCards.length-1);
			if (game.getPlayerByAlias(game.activePlayer.alias).hasCards([data.card,data.card])){
				data['canDiscard']=true;
			}
			else{
				data['canDiscard']=false;
			}
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: 'Piedra del Pozo'", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe sacar una carta del mazo y descartar dos símbolos coincidentes con el de la carta que saca (o Comodines).", 'mode':'info'});
			game.io.to(player.room).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Evento: Vigilante en el Agua", text: "El jugador activo debe sacar una carta del mazo y descartar dos símbolos coincidentes con el de la carta que saca (o Comodines).", buttons : [{name : "Descartar", id:"discard"},  {name : "No descartar", id:"dont-discard"}] });

			var div = $("<div>  </div>");
			div.append($("<p> La carta sacada es: </p>"));
			div.append($("<img src='./assets/img/ripped/"+data.card.image+".png' class='player-card-img img-responsive'>"));


			popup.addListener("discard", function(){
				client.socket.emit('add activity', {'action' : 'ForceDiscard', 'amount' : 2, 'alias' : client.alias, 'cards': [data.card, data.card], 'to': null});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("dont-discard", function(){
				client.socket.emit('add activity',{'action' : 'MoveSauron', 'amount' : 1});
				popup.close();
				client.socket.emit('resolve activity');
			});
			
			popup.append(div);
			popup.draw(client);

			if (!data.canDiscard){
				popup.disableButton("discard",true);
			}
		}
		
	},

	'Trapped' :  {
		apply : function(game, player,data){
			if (game.currentLocation.isTrackComplete("Travelling") && game.currentLocation.isTrackComplete("Hiding")){
				data['complete'] = true;
			}
			else{
				data['complete']=false;
			}
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: 'Atrapados'", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "Si las pistas de Esconderse y Viajar del escenario no han sido completas, Battion se mueve dos espacios hacia los aventureros y el Portador del Anillo debe lanzar el dado.", 'mode':'info'});
			game.io.to(game.ringBearer.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			if (!data.complete){
					client.socket.emit('add activity',{'action' : 'MoveSauron', 'amount' : 2});
					client.socket.emit('add activity', {'action' : 'RollDie'});	
			}
			client.socket.emit('resolve activity');
		}
		
	},

	'OrcsAttack' :  {
		apply : function(game, player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: '¡Al Ataque!'", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "El grupo debe descartar 5 símbolos de Lucha. De no poder o no querer hacerlo, Battion se mueve dos espacios hacia los aventureros.", 'mode':'info'});
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Evento: '¡Al Ataque!'", text: "El grupo debe descartar 5 símbolos de Lucha. De no poder o no querer hacerlo, Battion se mueve dos espacios hacia los aventureros.", buttons : [{name : "Descartar", id:"discard"},  {name : "No descartar", id:"move-sauron"}] , visibility : data.player});

			popup.addListener("discard", function(){
				client.socket.emit('add activity',{'action' : 'CommonDiscard', 'elements' : [{element : 'card', symbol: "Fighting", color:null, amount: 1},{element : 'card', symbol: "Fighting", color:null, amount: 1},{element : 'card', symbol: "Fighting", color:null, amount: 1},{element : 'card', symbol: "Fighting", color:null, amount: 1},{element : 'card', symbol: "Fighting", color:null, amount: 1}], 'defaultAction' : {'action' : 'MoveSauron', 'amount' : 2}});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("move-sauron", function(){
				client.socket.emit('add activity',{'action' : 'MoveSauron', 'amount' : 2}); 
				popup.close();
				client.socket.emit('resolve activity');
			});
			
			popup.draw(client);
		}
		
	},

	'FlyFools' :  {
		apply : function(game, player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: '¡Huyan, tontos!'", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "El grupo debe seleccionar a un jugador para adelantarse 3 espacios hacia el peligro. De no querer o no ponerse de acuerdo, cada uno, en orden, debe tirar el Dado y hacerse cargo de las consecuencias.", 'mode':'info'});
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			var popup = new Popup({title: "Evento: '¡Huyan, tontos!'", text: "El grupo debe seleccionar a un jugador para adelantarse 3 espacios hacia el peligro. De no querer o no ponerse de acuerdo, cada uno, en orden, debe tirar el Dado y hacerse cargo de las consecuencias.", buttons : [{name : "Este jugador avanzará", id:"advance"},  {name : "Lanzar el dado", id:"rolldie"}] , visibility : data.player});
			
			var listbox = $("<select class='advance-selector'> </select>");
			for (j in client.players){
				$(listbox).append("<option value='"+client.players[j].alias+"'> "+client.players[j].alias+"</option>");
			}
			popup.append($(listbox));

			popup.addListener("advance", function(){
				client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : $(listbox).val(), 'amount' : 3});
				popup.close();
				client.socket.emit('resolve activity');
			});
			popup.addListener("rolldie", function(){
				for (t in client.players){
					client.socket.emit('add activity', {'action' : 'RollDie', 'player':client.players[t].alias});	
				}
				popup.close();
				client.socket.emit('resolve activity');
			});
			
			popup.draw(client);
		}
		
	}

	};

	return exports;

});