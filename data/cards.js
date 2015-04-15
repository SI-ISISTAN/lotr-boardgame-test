define(['../classes/client-side/Popup'], function (Popup) {

	var exports = {

		//Cartas genéricas, con un simbolo que permite avanzar en una pista
		"Generic" : {
			phases : [],
			apply : function (game,player,data){
				data['valid'] = game.currentLocation.validTracks;
				if (game.currentLocation.tracks[this.symbol] == null){
					data['canMove']=false;
				}
				else {
					data['canMove']=true;
				}
			},
			draw : function(client, data){
				var self=this;
				if (this.symbol=="Hiding" || this.symbol=="Friendship" || this.symbol=="Fighting" || this.symbol=="Travelling"){
					var i=0;
					while (i<this.amount){
						//Me fijo si la pista existe
						if (data.canMove){
							client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : this.symbol, 'amount' : 1 });
						}
						i++;
					}
					client.socket.emit('resolve activity');
				}
				else if (this.symbol=="Joker"){
					var popup = new Popup({title: "Avanzar en una pista", text: "La carta jugada es un comodín, por lo cual debes elegir una pista en la cual avanzar tantos espacios como símbolos haya en la carta.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
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
										var j=0;
										while (j<self.amount){
											client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : to, 'amount' : 1 });

											j++;
										}
										client.socket.emit('resolve activity');
									});
							$("#move-track-selector").remove();
							popup.close();
							});

						popup.draw(client);
				}
			
			}
		},

		"GandalfCard" : {
			phases : [],
			apply : function (game,player,data){
				if (this.name == "Magia"){
					game.specialEvents.push({'event' : "PreventEvent"});
				}
			},
			draw : function(client, data){
				var self=this;
				switch (this.name){ 
					case "Previsión":
						client.socket.emit('add activity', {'action' : 'RearrangeTiles'});
					break;
					case "Guía":
						client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : null, 'amount' : 2, origin:'gandalf' });
					break;
					case "Sanación":
						client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : -2});
					break;
					case "Persistencia":
						client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 4, 'player' : client.alias});
					break;

				};
			client.socket.emit('resolve activity');	
			}
		},

		"Miruvor" : {
			phases : ["drawTiles","playCards","cleanUp"],
			description : "Sabor del Encuentro: El jugador activo puede pasar una carta a otro jugador.",
			activities : [],
			apply : function (game,player,data){

			},
			draw : function(client, data){
				var popup = new Popup({title: "Sabor del Encuentro", text: "Elige el jugador a quien pasarle la carta.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
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
						popup.addListener("ok", function(){
								$(".player-selector").each(function(){
									var to = $(this).val();
									client.socket.emit('update game', {'action' : 'ForceDiscard', 'amount' : 1, 'alias' : client.alias, 'cards': null, 'to':to});
								});
								client.socket.emit('resolve activity');
								popup.close(); 
						});

					popup.draw(client);
				
			}
		},

		"Staff" : {
			phases : ["drawTiles","playCards","cleanUp"],
			activities : [],
			description : "Bastón: El próximo evento que deba afrontarse en este escenario quedará sin efecto.",
			apply : function (game,player,data){
				game.specialEvents.push({'event' : "PreventEvent"});
			},
			draw : function(client, data){
				
			}
		},

		"Athelas" : {
			phases : ["drawTiles","playCards","cleanUp"],
			activities : [],
			description : "Hierbabuena: Previene a un aventurero de moverse en la Línea de Corrupción si le faltan fichas al final del escenario.",
			apply : function (game,player,data){
				game.specialEvents.push({'event' : "PreventAdvance", 'player':player.alias});
				console.log(game.specialEvents);
			},
			draw : function(client, data){
				
			}
		},

		"Elessar" : {
			phases : ["drawTiles","playCards","cleanUp"],
			activities : [],
			description : "Amuleto: El aventurero se aleja un espacio del peligro en la Línea de Corrupción.",
			apply : function (game,player,data){
				
			},
			draw : function(client, data){
				client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : client.alias, 'amount' : -1});
				client.socket.emit('resolve activity');
			}
		},

		"Lembas" : {
			phases : ["drawTiles","playCards","cleanUp"],
			activities : [],
			description : "Alimento: El jugador activo recibe tantas cartas como le falten para llegar a 6 cartas en su mano.",
			apply : function (game,player,data){
				data['amount'] = game.getPlayerByAlias(player.alias).hand.length;
			},
			draw : function(client, data){
				if (data.amount<=6){
					client.socket.emit('add activity', {'action' : 'DealHobbitCards', 'amount' : 6-data.amount+1, 'player' : client.alias});
					client.socket.emit('resolve activity');
				}
				
			}
		},

		"Mithril" : {
			phases : [],
			activities : ["RollDie"],
			description : "Armadura: El jugador ignora los eventos resultantes de una tirada del Dado.",
			apply : function (game,player,data){
			},
			draw : function(client, data){
				client.socket.emit('resolve activity');
			}
		},

		"Phial" : {
			phases : ["drawTiles","playCards","cleanUp"],
			activities : [],
			description : "Vial: El próximo evento que deba afrontarse en este escenario quedará sin efecto.",
			apply : function (game,player,data){
				game.specialEvents.push({'event' : "PreventEvent"});
			},
			draw : function(client, data){
				
			}
		},

		"Belt" : {
			phases : [],
			activities : ["RollDie"],
			description : "Cinturón Mágico: El jugador ignora los eventos resultantes de una tirada del Dado.",
			apply : function (game,player,data){
			},
			draw : function(client, data){
				client.socket.emit('resolve activity');
			}
		},



	};

	return exports;

});