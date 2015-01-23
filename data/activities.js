define(['../classes/client-side/Popup'], function (Popup) {
	
	var exports = { //Lo que retorna el módulo

	//////////////// Actividades genéricas ////////////////

	//Accion que hace todo lo necesario tras resolver una actividad para pasar a la siguiente
	"ResolveActivity" : {
		name: 'Resolver actividad',
		apply : function (game, data, player){
			var new_act = game.currentLocation.currentActivity.next();
			if (new_act != null){
				game.currentLocation.currentActivity = new_act;
			}
		},
		draw : function(client){
			if (client.currentGame.currentLocation.currentActivity.draw != null){
				if (client.id == client.currentGame.activePlayer.id)
					client.socket.emit('update game2', {'action' : client.currentGame.currentLocation.currentActivity.name});	//si no, emito que la termine
			}
		}
	},

    //Reparte cartas a uno/varios jugadores segun parámetros (cantidad y jugador/es a quien repartir)
	"DealHobbitCards" : {
		name: 'Dar cartas de hobbit',
		apply : function (game, data, player){
			var i=0;
			while (i<data.amount){
				if (data.player == null){			//si me pasan nulo le reparto a todos
					for (j in game.players){
						game.getPlayerByID(game.players[j].id).hand.push(game.hobbitCards[game.hobbitCards.length-1]);
						game.hobbitCards.splice(game.hobbitCards.length-1);
					}
				}
				else{
					game.getPlayerByID(player.id).hand.push(game.hobbitCards[game.hobbitCards.length-1]);
					game.hobbitCards.splice(game.hobbitCards.length-1);
				}
				i++;
			}
		},
		draw : function(client){
			for (i in client.player.hand){	//arreglare
				$("<img src='./assets/img/ripped/"+client.player.hand[i].image+".png' class='player-card-img img-responsive'>").appendTo("#player-cards-container").show('slow');
			}
			this.end(client);
		}
	},

	//Accion de juego de tirar el dado
	"ChangeLocation" :  {
		name: 'Cambiar locacion',
		apply : function (game, data, player){
			game.currentLocation.currentActivity = this.newActivity(game.currentLocation.currentActivity.name, game.currentLocation.currentActivity.subactivities, null);
		},
		draw : function(client){
			var self = this;

			if (!client.currentGame.currentLocation.isConflict){
				if (client.currentGame.activePlayer.id == client.id){
		        	client.socket.emit('update game2', {'action' : client.currentGame.currentLocation.currentActivity.next().name});	//si no, emito que la termine
				}
			}
		}
	},

	//Accion de juego de tirar el dado
	"DieRoll" :  {
		name: 'Lanzar dado',
		apply : function(game, data, player){
			var value = game.rollDie();
			console.log("lanze el puto dado oligarca y obtuve: "+value);
			switch (value){
				case 1:
					console.log("Roll blank");
				break;
				case 2:
					console.log("Move Sauron");
					//this.addSubActivity(this.newActivity("Move Sauron"), [], this);
				break;
				case 3:
					console.log("Move Hobbit 1");
					//this.addSubActivity(this.newActivity("Move Hobbit"), [], this);
				break;
				case 4:
					console.log("Move Hobbit 2");
					//this.addSubActivity(this.newActivity("Move Hobbit"), [], this);
				break;
				case 5:
					console.log("Move Hobbit 3");
					//this.addSubActivity(this.newActivity("Move Hobbit"), [], this);
				break;
				case 6:
					console.log("Discard");
					//this.addSubActivity(this.newActivity("Discard"), [], this);
				break;
			}
		},
		draw : function(client){
			var self = this;

			var popup = new Popup({title: "Tirar dado", id:"die-div", text: "El jugador "+client.player.alias+" lanza el dado y obtiene...", buttons : [{name : "Ok"}] });
			popup.addListener("Ok", function(){ 
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

			var popup = new Popup({title: "Gandalf", text: "Se reparte a cada jugador 6 cartas de Hobbit del mazo.", buttons : [{name : "Ok"}] });
			popup.addListener("Ok", function(){
				popup.close();
				client.socket.emit('update game2', {'action' : 'DealHobbitCards', 'amount' : 6, 'player' : null});	//repetir el evento a los otros clientes
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
				self.end(client); //siguiente subactividad
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