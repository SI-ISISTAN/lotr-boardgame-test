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
			console.log("alias: "+data.alias);
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
					console.log("cuchaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
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
			game.getPlayerByAlias(data.alias).move(data.amount);
			game.io.to(player.room).emit('log message', {'msg' : "¡"+data.alias+" se mueve "+data.amount+" lugares hacia el peligro!", 'mode':'danger'});
			game.io.to(player.room).emit('update game', data);	
		},
		draw : function(client, data){
			$("#"+data.alias+"-chip").animate({
				'left' : "+="+2.39*data.amount+"vw" //moves right
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
			game.io.to(player.id).emit('update game', data);	//repetir el evento al jugador
		},
		draw : function(client, data){
			console.log("watch me expoooooooooooooole");
			client.socket.emit('change location');	
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

		//Accion de juego Preparations
	"Nazgul Appears" : {
		apply : function(game,player,data){
			var candidates = [];
			var cards = [{symbol: 'Hiding', color: null}, {symbol: 'Hiding', color: null}]; //son dos cartas de Esconderse
			for (v in game.players){
				if (game.players[v].hasCards(cards)){
					candidates.push(game.players[v].alias);
					console.log("uno que vale: "+game.players[v].alias);
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


	};

	return exports;
	
});