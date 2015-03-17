
   ////////////////////////////////////////// FUNCIONES VARIAS /////////////////////////////////////////////////////

require(['./data/activities','./data/gameActions','./classes/client-side/Client','http://code.jquery.com/jquery-1.8.3.js','https://cdn.socket.io/socket.io-1.2.0.js', 'http://code.jquery.com/ui/1.11.2/jquery-ui.min.js','./classes/Activity'], function(activities, gameActions, Client, jquery, io, jqueryui, Activity){

    var socket = io();  //habilito el socketo
    var client = new Client();
    client.socket = socket;

	////////////////////////////// MANEJO DE MENSAJES ////////////////////////////// 

	function message_listen(){	

        //Me conecto
		if (!client.connected){
			socket.emit('connect user', {});
		}

		//Se conecta un nuevo usuario
	    socket.on('send connection data', function(res){
	    		client.connected=true;
	    		client.alias = res.alias;
	    		client.id = res.id;
	    		$("#username-header").append("Welcome, "+client.alias+"!");
	            $("#connected-list").append("<li class='client-list-item-highlighted'> <span class='client-list-name'> <b>"+client.alias+"</b> </span> <span class='client-list-state'> (Esperando) </span> </li>");
	            socket.emit('find game',{'alias' : client.alias, 'id':client.id});
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

	    //Se conecta un nuevo usuario
	    socket.on('user connected', function(res){
	    		$("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.player.alias+"</b> </span> <span class='client-list-state'>(Esperando)  </span> </li>");
      	});


	    //Se desconecta un usuario (no éste, otro que haya estado conectado)
	    socket.on('user disconnect', function(res){
		        console.log("Se desconecto un fulano, "+res.alias);
			    $( ".client-list-name:contains('"+res.alias+"')" ).parent().remove();
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
		        	$("#master-board-img-container").append('<img src="./assets/img/ripped/'+res.game.players[i].character.image+'.jpg" id= "'+res.game.players[i].alias+'-chip" class="hobbit-chip" style="left: 18px; top: '+(140 + (i*8))+'px; z-index:'+(i+1)*1+';">');	
		        }

		        	
		       for (i in res.game.players){
		       		client.players.push({'id':res.game.players[i].id, 'alias': res.game.players[i].alias});
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
		        
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" id="world-chip" class="cone-chip" style="left: 30px; top: 34px;">');
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/suaron.png" class="sauron-chip" style="left: 625px; top: 90px;">');


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
	    	$('#chat-msg-div').scrollTop($('#chat-msg-div').prop("scrollHeight"));
	    });

	    socket.on('toggle ready', function(res){
			//cambios graficos
	    	var alias = res.player.alias;
			var text = "(Esperando)";
			if (res.player.ready){
				var text = "(¡Listo!)";
			}

			$( ".client-list-name:contains('"+alias+"')" ).parent().find(".client-list-state").text(text);
	    });

	    //Pasar al siguiente escenario
	    socket.on('next activity', function(res){
	    	socket.emit('resolve activity');	//repetir el evento a los otros clientes
	    });

	    //Aplicar un update del lado de cliente
	    socket.on('update game', function(res){
	    		//getear el player que realizo la actualizacion
	    		if (activities[res.action] != null && typeof activities[res.action] != 'undefined'){
	    			client.updateActivity(res.action);
	        		activities[res.action].draw(client, res);									//actualizar la interfaz     			
	    		}  		
	    });

	    //Resolver una actividad
	    socket.on('resolve activity', function(res){
	    	console.log("resolve act de cliente");
	    	console.log(res);
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

			    $("#draw-tile-button").on('click', function(){
			    	$("#draw-tile-button").prop('disabled', true);
			    	if (client.turnPhase == "drawTiles"){
			    		client.socket.emit('update game', {'action' : "NextPhase"});
			    	}
			    	client.socket.emit('update game', {'action' : 'DrawTile', 'value': null, 'player':client.alias});
			    });

			    $("#call-gandalf-button").on('click', function(){
			    	$("#call-gandalf-button").prop('disabled', true);
			    	client.socket.emit('update game', {'action' : 'CallGandalf'});
			    });

			    $("#roll-dice-button").on('click', function(){
					client.socket.emit('update game', {'action' : 'DieRoll'});
					$("#roll-dice-button").prop('disabled',true);
				});
				
	}
  
	    
        $(document).ready(function(){	

        	console.log("JQuery Init");
        	//tooltip (title fachero)
        	$(document).tooltip();
        	//MAIN LOOP DEL CLIENTE (no es un loop porque esta todo implementado con listeners)
        	message_listen();
        	input_listen();
	       
		   

	    
	    });
  });