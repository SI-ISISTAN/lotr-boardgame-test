define (['./Client','./Game','../data/data'],function(Client,Game,loadedData) {
	
	var socket_io = require('socket.io');
	var io;


	//Clase que maneja los jugadores conectados en el lobby
	function ClientManager (){
		this.waitingClients = [];
		this.activeGames = [];
		this.loadedData = loadedData;
		console.log("Created client manager");
	};

	//Agregar cliente nuevo, se desagregan automáticamente por desconexión
	ClientManager.prototype.addClient = function(socket){
		var name = this.getNewAlias();
		this.waitingClients.push({'id' : socket.id, 'alias' : name});
		console.log(this.waitingClients);
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
		while (!found && i<this.waitingClients.length){
			if (this.waitingClients[i].id == id){
				found=true;
			}
			else{
				i++;
			}
		}
		if (found){	
			var alias = this.waitingClients[i].client.alias;
			this.loadedData.names.push(alias);
			this.waitingClients.splice(i,1);
			console.log(this.waitingClients);
			return {'alias' : alias};
		}
		else{
			return {'alias' : null};
		}
	};

	//Crear una nueva partida
	ClientManager.prototype.createNewGame = function(io,client){
			var game = new Game(this.waitingClients);
			var i=0;
			this.waitingClients=[];
			this.activeGames[game.gameID] = game;
			return {'game' : game};
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
				io.to(client.id).emit('send connection data', {'alias': client.alias, 'clientList':self.waitingClients });	//avisar a los demás clientes
			});


			//Se conecto un usuario
			client.in(client.room).broadcast.emit('user connected', {'client': client.alias});	//avisar a los demás clientes

			//Se crea un jugo nuevo
			if (self.waitingClients.length==5){
				var newGame = self.createNewGame(io,client).game;
				io.to('waiting').emit('game created',{'game' : newGame});	//avisar a los demás clientes

			}

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
				client.in(client.room).broadcast.emit('user disconnect',{ 'alias' : disconnectedAlias});
			});

		});
	} 

	return ClientManager;

});