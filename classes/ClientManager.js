define (['./Client','./Game','../data/data'],function(Client,Game,loadedData) {
	
	var socket_io = require('socket.io');
	var io;


	//Clase que maneja los jugadores conectados en el lobby
	function ClientManager (){
		this.connectedClients = [];
		this.activeGames = [];
		this.loadedData = loadedData;
		console.log("Created client manager");
	};

	//Agregar cliente nuevo, se desagregan automáticamente por desconexión
	ClientManager.prototype.addClient = function(socket){
		var name = this.getNewAlias();
		this.connectedClients.push({'id' : socket.id, 'alias' : name});
		console.log(this.connectedClients);
		return {'id' : socket.id, 'alias' : name};
	}
	
	//Recibir un nuevo "alias" de una lista de pregenerados
	ClientManager.prototype.getNewAlias = function(){
		var name="";
		if (this.loadedData.names.length > 0){
			var rand = Math.floor((Math.random() * this.loadedData.names.length));	//numero e/0 y length-1
			name = this.loadedData.names[rand];
			this.loadedData.names.splice(rand,1);
		}
		else{
			name =Math.random().toString(36).substring(7);	//Nombre random
		}
		return name;  
	}

	//Desconectar cliente
	ClientManager.prototype.disconnectClient = function(id){
		var found = false;
		var i=0;
		while (!found && i<this.connectedClients.length){
			if (this.connectedClients[i].id == id){
				found=true;
			}
			else{
				i++;
			}
		}
		if (found){	
			var alias = this.connectedClients[i].alias;
			this.loadedData.names.push(alias);
			this.connectedClients.splice(i,1);
			console.log(this.connectedClients);
			return {'alias' : alias};
		}
		else{
			return {'alias' : null};
		}
	};

	//Crear una nueva partida
	ClientManager.prototype.createNewGame = function(client){
			var game = new Game(client);
			var i=0;
			this.connectedClients=[];
			this.activeGames[game.gameID] = game;
			return {'id' : game.gameID};
	};

	//Inicializar el client manager para que escuche los eventos
	ClientManager.prototype.listen = function(server){
		var self=this;					//identificarse a si mismo en el namespace de la clase
		io = socket_io.listen(server);	//lo ponemos a escuchar en server

		/////// MANEJO DE MENSAJES ////////

		io.on('connection', function(client){
	
			//al conectarse por primera vez
			client.alias = self.addClient(client).alias;	//Se lo agrega al arreglo de clientes
			client.room='waiting';		//Se lo asigna a la room de espera
			client.join(client.room);	//Unirse a la room de espera


			//Mensaje de bienvenida
			io.to(client.id).emit('hello message', {'connected' : true});	//mensaje de bienvenida

			//Envio de mensaje
			client.on('connect user', function (data){
				io.to(client.id).emit('send connection data', {'alias': client.alias, 'id' : client.id});	//avisar a los demás clientes
			});

			//Se conecto un usuario
			client.in(client.room).broadcast.emit('user connected', {'alias': client.alias});	//avisar a los demás clientes

			client.on('find game', function (data){
				//Recorro el array de juegos activos
					var game_found = false;
					var game_to_join = null;
					var client_obj = {'id' : data.id, 'alias': data.alias};
					console.log("client object!");
					console.log(client_obj);

					Object.keys(self.activeGames).forEach(function(key, index) {
					  	if (!game_found){
							  if (Object.keys(this[key].players).length < 5){
							  		this[key].addPlayer(client_obj);
							  		game_to_join = key;
							  		game_found = true;
							  }
						}
					}, self.activeGames);

					if (!game_found){
						game_to_join = self.createNewGame(client_obj).id;
					}


					
					client.leave('waiting');	//Dejar la lista de espera
					client.room = game_to_join;	//Setear la room del juego
					client.player = self.activeGames[client.room].getPlayerByID(client.id);		
					client.join(client.room);	//Unirse a la room del juego

					io.to(client.id).emit('game found',{'game' : self.activeGames[client.room]});	//si hay espacio en un juego me uno

					//Se conecto un usuario
					client.in(client.room).broadcast.emit('user connected', {'alias': client.alias});	//avisar a los demás clientes
			});

			//Llega una petición para unirse a un juego nuevo
			client.on('join game', function (data){
				client.leave('waiting');	//Dejar la lista de espera
				client.room = data.gameID;	//Setear la room del juego
				client.player = self.activeGames[client.room].getPlayer(client.id);

				console.log("El player es:");
				console.log(client.player);


				client.join(data.gameID);	//Unirse a la room del juego
				io.to(client.id).emit('start game',{'gameID' : data.gameID});		//le paso el ID de nuevo solo para la asignacion interna
				io.to(client.id).emit('log message', {'msg' : "¡El juego ha comenzado!"});		//le paso el ID de nuevo solo para la asignacion interna
			});

			//Envio de mensaje
			client.on('send message', function (data){
				io.to(client.room).emit('recieve message', {'player': client.player, 'msg' : data.msg});	//avisar a los demás clientes
			});


			//Se desconecto un usuario
			client.on('disconnect', function (){
				var disconnectedAlias = self.disconnectClient(client.id).alias;
				if (client.room!="waiting"){
					self.activeGames[client.room].removePlayer(client.id);
					client.in(client.room).broadcast.emit('user disconnect',{ 'alias' : client.alias});
				}
			});

		});
	} 

	return ClientManager;

});