//Clase Cliente, potencialmente ampliable

define([], function () {
	
	function Client (){
		this.alias=null;
		this.currentGame = null;
		console.log("Created client");
	};


	//Escuchar y responde ra los mensajes del servidor
	Client.prototype.listen = function(socket){

		////////////////////////////// MANEJO DE MENSAJES //////////////////////////////

		//Me conecto
		socket.emit('connect user', {});

		//Se conecta un nuevo usuario
	    socket.on('send connection data', function(res){
	    		this.alias = res.alias;
	    		$("#username-header").append("Welcome, "+this.alias+"!");
	            console.log(res.clientList);
	            for (i in res.clientList){
	              if (res.clientList[i].alias == this.alias){
	                $("#connected-list").append("<li class='client-list-item-highlighted'>"+res.clientList[i].alias+"</li>");
	              }
	              else{
	                $("#connected-list").append("<li class='client-list-item'>"+res.clientList[i].alias+"</li>");
	              }
	            } 
      	});

	    //Se conecta un nuevo usuario
	    socket.on('user connected', function(res){
	    		$("#connected-list").append("<li class='client-list-item'>"+res.client.alias+"</li>");
      	});


	    //Se desconecta un usuario (no éste, otro que haya estado conectado)
	    socket.on('user disconnect', function(res){
		        console.log("alias recibido "+res.alias);
			    var clientList = $("#connected-list").find("li");
			    clientList.each( function (index,item){
					        if ($(item).text() == res.alias){
					            $(item).remove();
					        }
		        });
	    });

	    //Recibo notifacion de un nuevo juego creado
	    socket.on('game created', function(res){  
		        console.log("Envío petición para unirme a un juego nuevo. El "+res.game.gameID);
		        this.currentGame = res.game;
		        socket.emit('join game', {'gameID' : res.game.gameID});
	    });

	    //Comienza un juego
	    socket.on('start game', function(res){  
		        $("#main-lobby-div").remove();
		        $("#main-game-div").appendTo('body').show('slow');
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


	    ////////////////////////////// MANEJO DE INPUT //////////////////////////////

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

	}

	return Client;
});