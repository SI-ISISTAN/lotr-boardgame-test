define(['../classes/client-side/Popup'], function (Popup) {

	var exports = { //Lo que retorna el módulo

			//Accion de juego de tirar el dado
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
									client.socket.emit('add activity', {'action' : 'MovePlayer', 'alias' : to, 'amount' : 1});
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


	};

	return exports;
});