
   ////////////////////////////////////////// FUNCIONES VARIAS /////////////////////////////////////////////////////

require(['./data/activities','./data/gameActions','./classes/client-side/Client','https://code.jquery.com/jquery-1.8.3.js','https://cdn.socket.io/socket.io-1.2.0.js', 'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js','./classes/Activity'], function(activities, gameActions, Client, jquery, io, jqueryui, Activity){

    var socket = io();  //habilito el socketo
    var client = new Client();
    client.socket = socket;
    var userID = "";

	////////////////////////////// MANEJO DE MENSAJES ////////////////////////////// 

	function message_listen(){	

        //Me conecto
		if (!client.connected){
			socket.emit('connect user', {'userID' : userID});
			
		}

		//Se conecta un nuevo usuario
	    socket.on('send connection data', function(res){
	    	console.log(res.connected);
	    		client.connected=true;
	    		client.alias = res.alias;
	    		client.id = res.id;
	    		$("#username-header").append("Se te ha asignado el alias: "+client.alias+"");
	            $("#connected-list").append("<li class='client-list-item-highlighted'> <span class='client-list-name'> <b>"+client.alias+"</b> </span> </li>");
	            for (i in res.connected){
	            	if (res.connected[i].alias != client.alias){
	            		$("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.connected[i].alias+"</b> </span> </li>");
					}	            
	            }
	            for (j in res.games){
	            	var item = $("<li class='games-list-item'> <span class='game-list-name'> <b>"+res.games[j].gameID+"</b> </span> </li>");
	            	//agrego un listener para que me de los datos del game
					$(item).data('id',res.games[j].gameID);
					$(item).on('click', function(){
					    if ($( ".client-list-name:contains('"+client.alias+"')" ).length > 0){
							$(".game-list-item-highlighted").removeClass("game-list-item-highlighted");
							$(this).addClass("game-list-item-highlighted");
				    		socket.emit('refresh game info', {'gameID' : $(this).data('id')});
						}
					});
					$("#games-list").append(item);
	            }
	            socket.emit('user connected');
      	});

      	socket.on('game found', function(res){
      		
      		client.currentGame = res.game.gameID;
      		console.log("Recibi el game: ");

      		for (i in res.game.players){

	              if (res.game.players[i].alias != client.alias){

	              	var state = "Esperando";							//Si está listo o esperando
	              	if (res.game.players[i].ready){
	              		state="¡Listo!";
	              	}

	                $("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.game.players[i].alias+"</b> </span> <span class='client-list-state'>("+state+") "+" </span> </li>");
	              }
	              else{
	              	client.player = res.game.players[i];	//Me asigno elplayer
	              }
	        }
      	});

      	//He creado un juego
	    socket.on('new game', function(res){
	    	if (res.creator==client.alias){
	    		$(".game-list-item-highlighted").removeClass("game-list-item-highlighted");
	    	}
			$( ".client-list-name:contains('"+res.creator+"')" ).parent().remove();
			var item = null;
			if (res.creator != client.alias){
				item = $("<li class='games-list-item'> <span class='game-list-name'> <b>"+res.gameID+"</b> </span> </li>");
			}
			else{
				socket.emit('refresh game info', {'gameID' : res.gameID});
				item = $("<li class='games-list-item game-list-item-highlighted'> <span class='game-list-name'> <b>"+res.gameID+"</b> </span> </li>");
				$("#join-button").prop('disabled',true);
	    		$("#newgame-button").prop('disabled',true);
	    		$("#ready-button").prop('disabled',false);
	    		$("#quit-button").prop('disabled',false);
			}
			//agrego un listener para que me de los datos del game
			$(item).data('id',res.gameID);
			$(item).on('click', function(){
				if ($( ".client-list-name:contains('"+client.alias+"')" ).length > 0){
					$(".game-list-item-highlighted").removeClass("game-list-item-highlighted");
					$(this).addClass("game-list-item-highlighted");
				    socket.emit('refresh game info', {'gameID' : $(this).data('id')});
				}
			});
			$("#games-list").append(item);

      	});

      	//Me envian informacion sobre un juego seleccionado
	    socket.on('refresh game info', function(res){
	    	if (res.success){
		    	$("#joined-list").children().remove();
		    	for (i in res.players){
		    		var state="";
		    		if (!res.players[i].ready){
		    			state="Esperando";
		    		}else{
		    			state="¡Listo!";
		    		}
		    		if (res.players[i].alias != client.alias){
		    			$("#joined-list").append("<li class='joined-list-item'> <span class='joined-list-name'> <b>"+res.players[i].alias+"</b> </span>  <span class='joined-list-state'>("+state+")  </span></li>");
		    		}
		    		else{
		    			$("#joined-list").append("<li class='client-list-item-highlighted joined-list-item'> <span class='joined-list-name'> <b>"+res.players[i].alias+"</b> </span> <span class='joined-list-state'>("+state+")  </span> </li>");
		    		}
		    	}
		    	if (res.players.length < 5 && $( ".client-list-name:contains('"+client.alias+"')" ).length > 0){
		    		$("#join-button").prop('disabled',false);
		    	}
		    	else{
		    		$("#join-button").prop('disabled',true);
		    	}
	    	}
	    	else{
	    		$("#joined-list").children().remove();
	    	}

	    });

	    //Se conecta un nuevo usuario
	    socket.on('join game', function(res){
	    	$( ".client-list-name:contains('"+res.alias+"')" ).parent().remove();
	    	socket.emit('refresh game info', {'gameID' : $(".game-list-item-highlighted").data('id')});
	    	if (res.alias==client.alias){
		    	$("#join-button").prop('disabled',true);
		    	$("#newgame-button").prop('disabled',true);
		    	$("#ready-button").prop('disabled',false);
		    	$("#quit-button").prop('disabled',false);
		    }
      	});

      	//Se conecta un nuevo usuario
	    socket.on('quit game', function(res){
	    	var item = $("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.alias+"</b> </span> </li>");
	    	if (res.alias == client.alias){
	    		$("#newgame-button").prop('disabled',false);
	    		$("#ready-button").prop('disabled',true);
		    	$("#quit-button").prop('disabled',true);
	    		item.addClass("client-list-item-highlighted");
	    	}
	    	$("#connected-list").append(item);
	    	socket.emit('refresh game info', {'gameID' : $(".game-list-item-highlighted").data('id')});
      	});

	    //Se conecta un nuevo usuario
	    socket.on('user connected', function(res){
	    		$("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.alias+"</b> </span> </li>");
      	});


	    //Se desconecta un usuario (no éste, otro que haya estado conectado)
	    socket.on('user disconnect', function(res){
			    $( ".client-list-name:contains('"+res.alias+"')" ).parent().remove();
	    });

	    //Por x o por y se elimina una partida
	    socket.on('game finished', function(res){
			 $( ".game-list-name:contains('"+res.gameID+"')" ).parent().remove();
	    });

	    socket.on('ready to start', function(res){
			 socket.emit('ready to start', {});
	    });

	    //Comienza un juego
	    socket.on('start game', function(res){

	    		//Dibujo el juego  
		        $("#main-lobby-div").remove();
		        $("#main-game-div").appendTo('body').show('slow');

		        //Inserto el apartado de cada jugador
		        for (i in res.game.players){
		        	var panel = $("<div class='player-state-div' id='"+res.game.players[i].alias+"-state-div'> <b>"+res.game.players[i].alias+"</b> <img src='./assets/img/ripped/"+ res.game.players[i].character.image +".jpg' alt='Tablero maestro' class='player-hobbit-img img-responsive'> <br><br><img src='./assets/img/ripped/heart-mini.png' class='img-responsive player-stat-img'> <span id ='life-span'>"+ res.game.players[i].lifeTokens +" </span> <img src='./assets/img/ripped/sun-mini.png' class='img-responsive player-stat-img'> <span id ='sun-span'>"+ res.game.players[i].sunTokens +"</span> <br> <img src='./assets/img/ripped/ring-mini.png' class='img-responsive player-stat-img'> <span id ='ring-span'>"+ res.game.players[i].ringTokens +" </span> <img src='./assets/img/ripped/shield-mini.png' class='img-responsive player-stat-img'> <span id ='shield-span'>"+ res.game.players[i].shields +" </span> <img src='./assets/img/ripped/cards-mini.png' class='img-responsive player-stat-img'> <span id ='cards-span'>"+ res.game.players[i].hand.length +" </span>  </div>");
		        	if (res.game.players[i].turn){
		        		panel.addClass("is-active");
		        		panel.append("<img src='./assets/img/ripped/ring-mini.png' class='img-responsive player-stat-img ring-bearer-img'>");
		        	}
		        	$("#player-list-div").append(panel); 
		        	$("#master-board-img-container").append('<img src="./assets/img/ripped/'+res.game.players[i].character.image+'.jpg" id= "'+res.game.players[i].alias+'-chip" class="hobbit-chip" style="left: '+(7+(37*res.game.players[i].corruption))+'px; top: '+(126 + (i*8))+'px; z-index:'+(i+1)*1+';">');	
		        }

		        	
		       for (i in res.game.players){
		       		client.players.push({'id':res.game.players[i].id, 'alias': res.game.players[i].alias, 'dead':res.game.players[i].dead});

		       } 

		       var found = false;
		       var i = 0;
		       while (!found && i<res.game.players.length){
		       		if (res.game.players[i].id == client.id){
		       			client.player = res.game.players[i];
		       			found = true;
		       		}
		       		else{
		       			i++;
		       		}
		       }

		        $("#player-cards-container").append('<img src="./assets/img/ripped/'+client.player.character.image +'.jpg"  class="player-hobbit-img img-responsive" title="'+client.player.character.name+'">');
		         $("#master-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id="world-chip" class="cone-chip" style="left: 18px; top: 30px;">');
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/suaron.png" class="sauron-chip" style="left:'+(532-(37*(15-res.game.sauronPosition)))+'px; top: 72px;">');
		       

		        if (client.player.turn){

		        	socket.emit('change location');	//repetir el evento a los otros clientes
		        }
		        
	    });

	    //mensaje (test) (habria que reformatearlo a client)
	    socket.on('recieve message', function(res){
	    		var d = $('#chat-msg-div');	
	        	d.append('<p class="chat-message"> <b style= "color: '+res.player.chat_color+';"> '+ res.player.alias +': </b>'+ res.msg+' </p>');
	        	d.scrollTop(d.prop("scrollHeight"));
	    });

	    //mensaje de log
	    socket.on('log message', function(res){
	    	if (res.mode=='alert'){
	        	$("#chat-msg-div").append('<p class="chat-message"> <b style= "color: #BDBDBD;"> '+ res.msg+' </b> </p>');
	    	}
	    	else if (res.mode=='info'){
	    		$("#chat-msg-div").append('<p style= "color: #BDBDBD" class="chat-message"> '+ res.msg+' </p>');
	    	}
	    	else if (res.mode=='danger'){
	    		$("#chat-msg-div").append('<p class="chat-message"> <b style= "color: #FE9A2E;"> '+ res.msg+' </b> </p>');
	    	}
	    	else if (res.mode=='good'){
	    		$("#chat-msg-div").append('<p class="chat-message"> <b style= "color: #D8F781;"> '+ res.msg+' </b> </p>');
	    	}
	    	else if (res.mode=='tip'){
	    		$("#chat-msg-div").append('<p style= "color: #58D3F7" class="chat-message"> '+ res.msg+' </p>');
	    	}
	    	else if (res.mode=='death'){
	    		$("#chat-msg-div").append('<p class="chat-message"> <b style= "color: #FF0000;"> '+ res.msg+' </p>');
	    	}
	    	$('#chat-msg-div').scrollTop($('#chat-msg-div').prop("scrollHeight"));
	    });

	    socket.on('toggle ready', function(res){
			//cambios graficos
	    	var alias = res.player.alias;
			var text = "(Esperando)";
			if (res.player.ready){
				var text = "(¡Listo!)";
			}
			$( ".joined-list-name:contains('"+alias+"')" ).parent().find(".joined-list-state").text(text);
	    });

	    //Pasar al siguiente escenario
	    socket.on('next activity', function(res){
	    	socket.emit('resolve activity', {'unblockable' : true});	//repetir el evento a los otros clientes
	    });

	    //Aplicar un update del lado de cliente
	    socket.on('update game', function(res){
	    		//getear el player que realizo la actualizacion
	    		if (activities[res.action] != null && typeof activities[res.action] != 'undefined'){
	    			
	        		activities[res.action].draw(client, res);									//actualizar la interfaz     			
	    			client.updateActivity(res.action);
	    		}  		
	    });

	    //Resolver una actividad
	    socket.on('resolve activity', function(res){
	    	socket.emit('update game', res);	//repetir el evento a los otros clientes
	    });

	    //Turno siguiente
	    socket.on('next turn', function(res){
	    	//Turnar al client apropiado
	    	console.log("Alis del turnado "+res.activePlayer);
	    	if (client.alias == res.activePlayer){
	    		client.turn=true;
	    		$("#draw-tile-button").prop('disabled', false);
	    	}
	    	else{
	    		client.turn=false;
	    	}
	    	
	    });

	}

    ////////////////////////////// MANEJO DE INPUT ////////////////////////////// 

	function input_listen(){
			    $(document).keypress(function (e){
			    	if  (!($("#chat-input").is(":focus"))){
			    		$("#chat-input").select();
			    	}
			    });

			    //Al apretar enter con el chat activado
			    $('#chat-input').bind("enterKey",function(e){
				        if ($('#chat-input').val() != ""){
				            	socket.emit('send message', {'msg' : $('#chat-input').val() });
				            	$('#chat-input').val(null);
				        }
			    });

			    //función de binding
			    $('#chat-input').keyup(function(e){
				        if(e.keyCode == 13){
				            $(this).trigger("enterKey");
				        }
			    });

			    //clicqueo el boton de listo
			    $('#ready-button').on('click', function(){
			    	socket.emit('toggle ready',{});
			    });

			    //clicqueo en un juego par obtener la info
			    

			    //Crear nueva partida
			    $('#newgame-button').on('click', function(){
			    	socket.emit('new game',{'alias' : client.alias, 'id':client.id});
			    	$(this).prop('disabled', true);
			    });

			    //Crear nueva partida
			    $('#join-button').on('click', function(){
			    	socket.emit('join game', {'gameID' : $(".game-list-item-highlighted").data('id')});
			    });

			    //Salir de una partida y volver a la lista de clientes
			    $('#quit-button').on('click', function(){
			    	console.log("game id "+$(".game-list-item-highlighted").data('id'));
			    	socket.emit('quit game', {'gameID' : $(".game-list-item-highlighted").data('id')});
			    });

			    //Botón de sacar tile
			    $("#draw-tile-button").on('click', function(){
			    	$(".popup-dialog").dialog('close'); //cierro el popup informativo
			    	$("#draw-tile-button").prop('disabled', true);
			    	client.disableInput();
			    	if (client.turnPhase == "drawTiles"){
			    		client.socket.emit('update game', {'action' : "NextPhase"});
			    	}
			    	client.socket.emit('update game', {'action' : 'DrawTile', 'value': null, 'player':client.alias});
			    });

			    //Botón de llamar a Gandalf
			    $("#call-gandalf-button").on('click', function(){
			    	$("#call-gandalf-button").prop('disabled', true);
			    	client.socket.emit('update game', {'action' : 'CallGandalf'});
			    });

			    //Boton de lanzar dado
			    $("#roll-dice-button").on('click', function(){
			    	$(".popup-dialog").dialog('close'); //cierro el popup informativo
					$("#roll-dice-button").prop('disabled',true);
					$("#special-card-button").prop('disabled',true);
					client.socket.emit('update game', {'action' : 'DieRoll'});

				});

			    //Botón de carta especial
			    $("#special-card-button").on('click', function(){
			    	client.saveAsync();
			    	$("#roll-dice-button").prop('disabled',true);
			    	client.disableInput();
					client.socket.emit('update game', {'action' : 'PlaySpecialCard'});
					
				});			
	}

	function showGameInfo(){
		
	}
  
	    
        $(document).ready(function(){	
        	userID = $("body").data("user");
        	console.log("JQuery Init");
        	//tooltip (title fachero)
        	$(document).tooltip();
        	//MAIN LOOP DEL CLIENTE (no es un loop porque esta todo implementado con listeners)
        	message_listen();
        	input_listen();
	    });
  });