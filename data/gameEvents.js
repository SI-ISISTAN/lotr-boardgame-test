define(['../classes/client-side/Popup'], function (Popup) { 
	
	var exports = {
		//////////////// Actividades que se cargan en el juego ////////////////

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

	"Elrond" : {
		apply: function(game,player,data){
			game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver la actividad: Elorond.", 'mode':'alert'});
			game.io.to(player.room).emit('log message', {'msg' : "LAs cartas de locación de Rivendell se reparten entre los jugadores.", 'mode':'info'});
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
	}

	};

	return exports;

});