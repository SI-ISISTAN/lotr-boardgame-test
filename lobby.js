
   ////////////////////////////////////////// FUNCIONES VARIAS /////////////////////////////////////////////////////

require(['./classes/Game','http://code.jquery.com/jquery-1.8.3.js','https://cdn.socket.io/socket.io-1.2.0.js', 'http://code.jquery.com/ui/1.11.2/jquery-ui.min.js'], function(Game, jquery, io, jqueryui){

    var socket = io();  //habilito el socketo
    var client = {
    	'id' : null,
		'alias' : null,
		'currentGame' : null,
		'player' : null,
		'connected' : false
	};


            //Mensaje de bienvenida con parámetros inciales
        socket.on('hello message', function(res){
              //client = new Client();
              //client.listen(socket);      
        });

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
      		
      		client.currentGame = new Game();
      		client.currentGame.setupGame(res.game);

      		console.log("Recibi el game: ");
      		console.log(client.currentGame);
      		for (i in client.currentGame.players){
	              if (client.currentGame.players[i].alias != client.alias){

	              	var state = "Esperando";							//Si está listo o esperando
	              	if (client.currentGame.players[i].ready){
	              		state="¡Listo!";
	              	}

	                $("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+client.currentGame.players[i].alias+"</b> </span> <span class='client-list-state'>("+state+") "+" </span> </li>");
	              }
	              else{
	              	client.player = client.currentGame.players[i];	//Me asigno elplayer
	              }
	        }
      	});

	    //Se conecta un nuevo usuario
	    socket.on('user connected', function(res){
	    		$("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.player.alias+"</b> </span> <span class='client-list-state'>(Esperando)  </span> </li>");
	    		client.currentGame.addPlayer(res.player);
      	});


	    //Se desconecta un usuario (no éste, otro que haya estado conectado)
	    socket.on('user disconnect', function(res){
		        console.log("Se desconecto un fulano, "+res.alias);
			    $( ".client-list-name:contains('"+res.alias+"')" ).parent().remove();
	    });

	    //Comienza un juego
	    socket.on('start game', function(res){

	    		client.currentGame.isActive = true;

	    		client.currentGame.start();
	    		client.currentGame.buildGame(res.game);

	    		//Dibujo el juego  
		        $("#main-lobby-div").remove();
		        $("#main-game-div").appendTo('body').show('slow');

		        //Inserto el apartado de cada jugador
		        for (i in client.currentGame.players){
		        	var panel = $("<div class='player-state-div'> <b>"+client.currentGame.players[i].alias+"</b> <img src='./assets/img/ripped/"+ client.currentGame.players[i].character.image +".jpg' alt='Tablero maestro' class='player-hobbit-img img-responsive'> <br><br><img src='./assets/img/ripped/heart-mini.png' class='img-responsive player-stat-img'> "+ client.currentGame.players[i].lifeTokens +" <img src='./assets/img/ripped/sun-mini.png' class='img-responsive player-stat-img'> "+ client.currentGame.players[i].sunTokens +" <br> <img src='./assets/img/ripped/ring-mini.png' class='img-responsive player-stat-img'> "+ client.currentGame.players[i].ringTokens +"<img src='./assets/img/ripped/cards-mini.png' class='img-responsive player-stat-img'> "+ client.currentGame.players[i].hand.length +" </div>");
		        	if (client.currentGame.players[i].turn){
		        		panel.addClass("is-active");
		        	}
		        	$("#player-list-div").append(panel); 
		        	$("#master-board-img-container").append('<img src="./assets/img/ripped/'+client.currentGame.players[i].character.image+'.jpg" class="hobbit-chip" style="left: '+0.5+'vw; top: '+(17 + (i*1))+'vh; z-index:'+(i+1)*1+';">');	
		        }
		        $("#player-cards-container").append('<img src="./assets/img/ripped/'+client.player.character.image +'.jpg"  class="player-hobbit-img img-responsive" title="'+client.player.character.name+'">');
		        
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" class="cone-chip" style="left: 1.4vw; top: 6.0vh;">');
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/suaron.png" class="sauron-chip" style="left: 37vw; top: 14.0vh;">');
		        if (client.id == client.currentGame.activePlayer.id){
		        	$("#dialog").dialog({dialogClass : 'no-close'});
		        }
	    });

	    //mensaje (test)
	    socket.on('recieve message', function(res){
	    		var d = $('#chat-msg-div');	
	        	d.append('<p class="chat-message"> <b style= "color: '+res.player.chat_color+';"> '+ res.player.alias +': </b>'+ res.msg+' </p>');
	        	d.scrollTop(d.prop("scrollHeight"));
	    });

	    //mensaje (test)
	    socket.on('log message', function(res){
	        	$("#chat-msg-div").append('<p class="chat-message"> <b style= "color: #FCF34B;"> '+ res.msg+' </b> </p>');
	    });

	    //mensaje (test)
	    socket.on('update game', function(res){
	    		//getear el player que realizo la actualizacion
	    		var player =  client.currentGame.getPlayerByID(res.emmiter);
	        	var update_event = client.currentGame.update(res.data, player).event;
	        	console.log(client.currentGame);
	        	update_event.draw(client);	//actualizar la interfaz     	

	    });

        ////////////////////////////// MANEJO DE INPUT //////////////////////////////
	    
        $(document).ready(function(){

        console.log("JQuery Init");

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
		    	socket.emit('toggle ready', { action: "toggleReady" });
		    })
			

		    //click en el boton ok de un popup
		    $('#popup-ok-button').on('click', function(e){
		    	$(this).parent().dialog('close');
		    	socket.emit('update game', {'action' : 'dealHobbitCards', 'amount' : 6, 'player' : null});	//repetir el evento a los otros clientes
		    	console.log(client.currentGame);
		    });

	    });
  });