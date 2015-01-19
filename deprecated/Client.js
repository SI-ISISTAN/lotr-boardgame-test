//Clase Cliente, potencialmente ampliable
define(['./Game'], function (Game) {
	
	function Client (){
		this.id = null;
		this.alias=null;
		this.currentGame = null;
		this.player = null;
		this.connected = false;
		console.log("Created client");
		//Escuchar y responde ra los mensajes del servidor

	}

	Client.prototype.listen = function(socket){
		////////////////////////////// MANEJO DE MENSAJES //////////////////////////////

		//Me conecto
		if (!this.connected){
			socket.emit('connect user', {});
		}

		//Se conecta un nuevo usuario
	    socket.on('send connection data', function(res){
	    		this.connected=true;
	    		this.alias = res.alias;
	    		this.id = res.id;
	    		$("#username-header").append("Welcome, "+this.alias+"!");
	            $("#connected-list").append("<li class='client-list-item-highlighted'> <span class='client-list-name'> <b>"+this.alias+"</b> </span> <span class='client-list-state'> (Esperando) </span> </li>");
	            socket.emit('find game',{'alias' : this.alias, 'id':this.id});
      	});

      	socket.on('game found', function(res){
      		
      		this.currentGame = new Game();
      		this.currentGame.setupGame(res.game);

      		console.log("Recibi el game: ");
      		console.log(this.currentGame);
      		for (i in this.currentGame.players){
	              if (this.currentGame.players[i].alias != this.alias){

	              	var state = "Esperando";							//Si está listo o esperando
	              	if (this.currentGame.players[i].ready){
	              		state="¡Listo!";
	              	}

	                $("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+this.currentGame.players[i].alias+"</b> </span> <span class='client-list-state'>("+state+") "+" </span> </li>");
	              }
	              else{
	              	this.player = this.currentGame.players[i];	//Me asigno elplayer
	              }
	        }
      	});

	    //Se conecta un nuevo usuario
	    socket.on('user connected', function(res){
	    		$("#connected-list").append("<li class='client-list-item'> <span class='client-list-name'> <b>"+res.player.alias+"</b> </span> <span class='client-list-state'>(Esperando)  </span> </li>");
	    		this.currentGame.addPlayer(res.player);
      	});


	    //Se desconecta un usuario (no éste, otro que haya estado conectado)
	    socket.on('user disconnect', function(res){
		        console.log("Se desconecto un fulano, "+res.alias);
			    $( ".client-list-name:contains('"+res.alias+"')" ).parent().remove();
	    });

	    //Comienza un juego
	    socket.on('start game', function(res){

	    		this.currentGame.isActive = true;

	    		this.currentGame.start();
	    		this.currentGame.buildGame(res.game);

	    		//Dibujo el juego  
		        $("#main-lobby-div").remove();
		        $("#main-game-div").appendTo('body').show('slow');

		        //Inserto el apartado de cada jugador
		        for (i in this.currentGame.players){
		        	var panel = $("<div class='player-state-div'> <b>"+this.currentGame.players[i].alias+"</b> <img src='./assets/img/ripped/"+ this.currentGame.players[i].character.image +".jpg' alt='Tablero maestro' class='player-hobbit-img img-responsive'> <br><br><img src='./assets/img/ripped/heart-mini.png' class='img-responsive player-stat-img'> "+ this.currentGame.players[i].lifeTokens +" <img src='./assets/img/ripped/sun-mini.png' class='img-responsive player-stat-img'> "+ this.currentGame.players[i].sunTokens +" <br> <img src='./assets/img/ripped/ring-mini.png' class='img-responsive player-stat-img'> "+ this.currentGame.players[i].ringTokens +"<img src='./assets/img/ripped/cards-mini.png' class='img-responsive player-stat-img'> "+ this.currentGame.players[i].hand.length +" </div>");
		        	if (this.currentGame.players[i].turn){
		        		panel.addClass("is-active");
		        	}
		        	$("#player-list-div").append(panel); 
		        	$("#master-board-img-container").append('<img src="./assets/img/ripped/'+this.currentGame.players[i].character.image+'.jpg" class="hobbit-chip" style="left: '+0.5+'vw; top: '+(17 + (i*1))+'vh; z-index:'+(i+1)*1+';">');	
		        }
		        $("#player-cards-container").append('<img src="./assets/img/ripped/'+this.player.character.image +'.jpg"  class="player-hobbit-img img-responsive" title="'+this.player.character.name+'">');
		        
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/cono_de_dunshire.png" class="cone-chip" style="left: 1.4vw; top: 6.0vh;">');
		        $("#master-board-img-container").append('<img src="./assets/img/ripped/suaron.png" class="sauron-chip" style="left: 37vw; top: 14.0vh;">');
		        $("#dialog").dialog({dialogClass : 'no-close'});
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
	    		var player =  this.currentGame.getPlayerByID(res.emmiter);
	        	var update_event = this.currentGame.update(res.data, player).event;
	        	console.log(this.currentGame);
	        	update_event.draw(this);	//actualizar la interfaz     	

	    });

	};


	return Client;
});