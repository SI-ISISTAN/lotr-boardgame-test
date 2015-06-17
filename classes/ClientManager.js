

define (['./Game','../data/data', './Activity'],function(Game,loadedData, Activity) {
	
	var socket_io = require('socket.io');
	var io;
	

	//Clase que maneja los jugadores conectados en el lobby
	function ClientManager (schemas){
		this.connectedClients = [];
		this.clientsInGame = [];
		this.activeGames = [];
		this.loadedData = loadedData;
		this.gameSchema = schemas.gameSchema;
		this.userSchema = schemas.userSchema;
		this.chatSchema = schemas.chatSchema;
		this.adviceSchema =schemas.adviceSchema;
		this.configSchema = schemas.configSchema;
		console.log("Creado manager de clientes.");
	};

	//Agregar cliente nuevo, se desagregan automáticamente por desconexión
	ClientManager.prototype.addClient = function(socket){
		var name = this.getNewAlias();
		this.connectedClients.push({'id' : socket.id, 'alias' : name});
		console.log("Cliente agregado.")
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
			console.log("Cliente desconectado.");
			return {'alias' : alias};
		}
		else{
			return {'alias' : null};
		}
	};

	//Agregar a juego
	ClientManager.prototype.addClientToGame = function(id){
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
			this.connectedClients.splice(i,1);
			this.clientsInGame.push(this.connectedClients[i]);
			return {'alias' : alias};
		}
		else{
			return {'alias' : null};
		}
	};

	//Crear una nueva partida
	ClientManager.prototype.createNewGame = function(client){
			var game = new Game(io);
			game.addPlayer(client);
			var i=0;
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
				//Recorro el array de juegos activos
				client.userID = data.userID;
				client.surveyData = data.surveyData;
				var activeGames = [];
				Object.keys(self.activeGames).forEach(function(key, index) {
						if (!this[key].isActive){	//si no esta ya jugandose
					  		activeGames.push({'gameID': this[key].gameID, 'players': this[key].players})
						}
				}, self.activeGames);

				io.to(client.id).emit('send connection data', {'alias': client.alias, 'id' : client.id, 'connected': self.connectedClients, 'games':activeGames});	//avisar a los demás clientes
			});


			//El cliente crea una partida nueva
			client.on('new game', function (data){
					var client_obj = {'id' : data.id, 'alias': data.alias, 'userID':client.userID,  'surveyData':client.surveyData};
					var game_to_join = self.createNewGame(client_obj).id;
					self.addClientToGame(client.id);
					io.to('waiting').emit('new game',{'gameID' : game_to_join, 'creator':data.alias});				
					//client.leave('waiting');	//Dejar la lista de espera
					client.room = game_to_join;	//Setear la room del juego
					client.player = self.activeGames[client.room].getPlayerByID(client.id);		
					//client.join(client.room);	//Unirse a la room del juego		
			});

			//Me piden la informacion de una partida
			client.on('refresh game info', function (data){
				if (typeof(self.activeGames[data.gameID])!='undefined'){
					io.to(client.id).emit('refresh game info',{'players' : self.activeGames[data.gameID].players, 'success':true});					
				}
				else{
					io.to(client.id).emit('refresh game info',{'success':false});
				}
			});

			//El cliente pide unirse a una partida
			client.on('join game', function (data){
				if (typeof(data.gameID)!='undefined'){
					var client_obj = {'id' : client.id, 'alias': client.alias, 'userID':client.userID, 'surveyData':client.surveyData};
					self.activeGames[data.gameID].addPlayer(client_obj);			
					self.addClientToGame(client.id);
					io.to('waiting').emit('join game',{'gameID' : data.gameID, 'alias':client.alias});				
					client.room = data.gameID;	//Setear la room del juego
					client.player = self.activeGames[data.gameID].getPlayerByID(client.id);		
				}		
			});

			//El cliente pide unirse a una partida
			client.on('quit game', function (data){
				if (typeof(data.gameID) != 'undefined'){
						self.activeGames[data.gameID].removePlayer(client.id);
						self.connectedClients.push({'id' : client.id, 'alias' : client.alias});
						if (self.activeGames[client.room].players.length == 0){	//si no quedo nadie destruyo el juego
							io.to('waiting').emit('game finished',{ 'gameID' :self.activeGames[client.room].gameID });
							delete self.activeGames[client.room];
						}
						client.room = 'waiting';	//Setear la room del juego
						client.player = null;
						io.to('waiting').emit('quit game',{'gameID' : data.gameID, 'alias':client.alias});	
				}								
			});

			//El cliente pide que lo ubique en un juego
			client.on('find game', function (data){
				
					var game_found = false;
					var game_to_join = null;
					var client_obj = {'id' : data.id, 'alias': data.alias, 'surveyData':client.surveyData};
					
					//Recorro el array de juegos activos
					Object.keys(self.activeGames).forEach(function(key, index) {
					  	if (!game_found){
							  if (this[key].players.length < 5 && !this[key].isActive){
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

					io.to(client.id).emit('game found',{'game' : {'players' : self.activeGames[client.room].players}});	//si hay espacio en un juego me uno

					//Se conecto un usuario
					client.in(client.room).broadcast.emit('user connected', {'player': client.player});	//avisar a los demás clientes
			});

			//Envio de mensaje
			client.on('send message', function (data){
				io.to(client.room).emit('recieve message', {'player': client.player, 'msg' : data.msg});	//avisar a los demás clientes
				//guardar en la DB
				self.chatSchema.findOne({'gameID' : client.room}, function(err, chat){
					if (err){
						return err;
					}
					if (chat){
						var newmsg = {};
						newmsg.from = client.alias;
						newmsg.time = new Date();
						newmsg.text = data.msg;
						chat.chats.push(newmsg);

						chat.save(function(err) {
                            if (err){
                                throw err;
                            }
                    	});
					}
				});

			});


			//Envio de mensaje
			client.on('user connected', function (data){
				client.in(client.room).broadcast.emit('user connected', {'alias' : client.alias, 'id': client.id});	
			});

			//Comenzar el juego cuando haya los jugadores minimos y todos esten listos
			client.on('toggle ready', function (data){
				var player = self.activeGames[client.room].getPlayerByID(client.id);
				if (player!=null){
					if (player.ready){
						player.ready = false;
					}
					else{
						player.ready = true;
					}
				}
				io.to('waiting').emit('toggle ready', {'player': client.player });	

				if (self.activeGames[client.room].canGameStart()){
					self.activeGames[client.room].isActive = true;
					//encuentro el esquema de juego en la DB y lo cargo al juego
					var currentConfig = {};
					self.configSchema.findOne({}, function(err, config){
						if (err){
							return err;

						}
						if (config){
								//evitar el guardado de informacion redundante (lista de players, etc)
									var configs = config.configs;
									var found = false;
									var i=0;
									while (!found && i<configs.length){
										if (configs[i].configName == config.currentConfig){	
											found = true;			
										}
										else{
											i++;
										}
									}
									if (found){
										self.activeGames[client.room].start(configs[i]);	
										var players = self.activeGames[client.room].players;
										//meto en el juego las recomendaciones a usar (si la config usa consejos)
										if (configs[i].showAdvice){
											self.adviceSchema.find({}, function(err, result){
												if (err){
													console.log("Error");
												}
												else{
													for (p in result){
														if (result[p].type=="Location"){
															self.activeGames[client.room].advices["Location"].push(result[p]);
														}
														if (result[p].type=="Card"){
															self.activeGames[client.room].advices["Card"].push(result[p]);
														}
														if (result[p].type=="Activity"){
															self.activeGames[client.room].advices["Activity"].push(result[p]);
														}
													}			
												}
											});
										}
										for (i in players){
								
											io.to(players[i].id).emit('ready to start');
										}
									}
						}
					});
				}
			});
	
			client.on('ready to start', function (data){

				client.leave('waiting');	//Dejar la lista de espera	
				client.join(client.room);	//Unirse a la room del juego
				self.activeGames[client.room].getPlayerByID(client.id).playing = true;
				if (self.activeGames[client.room].isReady()){
					if (!self.activeGames[client.room].isTutorial){
						//creo el nuevo juego en la db
						var newGame =  new self.gameSchema();
						newGame.gameID = self.activeGames[client.room].gameID;
						newGame.created = new Date();
						newGame.complete = false;
						var playersList = self.activeGames[client.room].players;
						for (i in playersList){
							newGame.players.push({playerID: playersList[i].id , alias: playersList[i].alias , character: playersList[i].character, userID: playersList[i].userID });
						}

						
						
						newGame.save(function(err) {
	                            if (err){
	                                throw err;
	                            }
	                    });

	                    //creo el chat en la db
	                    var newChat =  new self.chatSchema();
						newChat.gameID = self.activeGames[client.room].gameID;
						newChat.save(function(err) {
	                            if (err){
	                                throw err;
	                            }
	                    });
	                }

					//emito los mensajes correspondientes
									
					io.to('waiting').emit('game finished',{'gameID' : client.room});
					io.to(client.room).emit('start game',{'game' : {'sauronPosition': self.activeGames[client.room].sauronPosition, 'players' : self.activeGames[client.room].players}});		
					io.to(client.room).emit('log message', {'msg' : "¡El juego ha comenzado!", 'mode':'alert'});
					io.to(client.room).emit('log message', {'msg' : "Es el turno de " +self.activeGames[client.room].activePlayer.alias+". ", 'mode':'alert'});
				}
			});

			//Cambiar el escernario e inicializarlo (act. especial)
			client.on('change location', function (data){ 			
				if (!self.activeGames[client.room].currentLocation.isConflict){
					self.activeGames[client.room].currentLocation.currentActivity = self.activeGames[client.room].currentLocation.activities[0];
					self.activeGames[client.room].currentLocation.currentActivity = new Activity({'action' : self.activeGames[client.room].currentLocation.currentActivity.name}, self.activeGames[client.room].currentLocation.currentActivity.subactivities, null);
					self.activeGames[client.room].blockResolve=true;
					io.to(client.id).emit('next activity');	//enviar siguiente actividad
				}
				else{
					if (self.activeGames[client.room].currentLocation.activities.length == 0){
						io.to(client.room).emit('update game', {'action' : "StartConflict"});
					}
					else{
						self.activeGames[client.room].currentLocation.currentActivity = self.activeGames[client.room].currentLocation.activities[0];
						self.activeGames[client.room].currentLocation.currentActivity = new Activity({'action' : self.activeGames[client.room].currentLocation.currentActivity.name}, self.activeGames[client.room].currentLocation.currentActivity.subactivities, null);
						self.activeGames[client.room].blockResolve=true;
						io.to(client.id).emit('next activity');	//enviar siguiente actividad
					}
				}

			});

			//Updatear juego con activity
			client.on('update game', function (data){
				console.log("Llego a client manager un update de actividad: "+data.action);
				if (!self.activeGames[client.room].ended){
					var update = new Activity(data,[],self.activeGames[client.room].currentLocation.currentActivity);
					if (update.name!="ChangeLocation"){
						self.activeGames[client.room].currentLocation.currentActivity = update;
					}
					self.activeGames[client.room].update(update, client, data);
					
					//muestro tips de actividad
						for (p in self.activeGames[client.room].players){
							var advices = self.activeGames[client.room].getAdvices("Activity",data.action, self.activeGames[client.room].players[p]);
							for (j in advices){
								io.to(self.activeGames[client.room].players[p].id).emit('log message', {'msg' : "Tip para la actividad "+advices[j].name+": "+advices[j].text, 'mode':'tip'});
								//game.io.to(game.players[p].id).emit('show tip', {'advice' : advices[j]});
							}
						}

					//guardo la acicon en la DB
					self.gameSchema.findOne({ 'gameID' : client.room }, function(err, game){
						if (err){
							return err;
						}
						if (game){
								//evitar el guardado de informacion redundante (lista de players, etc)
								var newData = {};
								Object.keys(data).forEach(function(key, index) {
							  	if (key != "players" && key != "spaces"){
									  newData[key] = this[key];
								}
								}, data);
								game.gameActions.push({'player' : client.alias, 'action': data.action, 'data' : newData});
								//si la accion es "end game" hago un guardado especial: el del resultado del juego
								if (data.action=="EndGame"){
									game.complete = true;
									game.result.victory = data.success;
									game.result.reason = data.reason;
									game.result.score = data.score;
								}
								game.save(function(err) {
		                            if (err){
		                                throw err;
		                            }
		                    	});
						}
					});
				}
				
			});

			//Updatea que no respeta la estructura (evento súbito, como la desconexion de un jugador)
			client.on('sudden update', function (data){
				console.log("Sudden update: "+data.action);	
				if (!self.activeGames[client.room].asyncAck || data.action=="KillPlayer"){
					self.activeGames[client.room].asyncAck = true;
					var update = new Activity(data,[],self.activeGames[client.room].currentLocation.currentActivity);
					self.activeGames[client.room].update(update, client, data);
					//guardo la acicon en la DB
					self.gameSchema.findOne({ 'gameID' : client.room }, function(err, game){
						if (err){
							return err;
						}
						if (game){
								//evitar el guardado de informacion redundante (lista de players, etc)
								var newData = {};
								Object.keys(data).forEach(function(key, index) {
							  	if (key != "players" && key != "spaces"){
									  newData[key] = this[key];
								}
								}, data);
								game.gameActions.push({'player' : client.alias, 'action': data.action, 'data' : newData});
								//si la accion es "end game" hago un guardado especial: el del resultado del juego
								if (data.action=="EndGame"){
									game.result.victory = data.success;
									game.result.reason = data.reason;
									game.result.score = data.score;
								}
								game.save(function(err) {
		                            if (err){
		                                throw err;
		                            }
		                    	});
						}
					});
				}
			});

			//e agrega una subactividad a la actividad que está en curso en ese momento, que se ejecutará cuando se resuelva la actividad en curso
			client.on('add activity', function (data){
				var new_act = new Activity(data,[],self.activeGames[client.room].currentLocation.currentActivity);
				if (typeof self.activeGames[client.room].currentLocation.currentActivity != 'undefined'){
					self.activeGames[client.room].currentLocation.currentActivity.addSubActivity(new_act);
				}
			});

			//e agrega una subactividad a la actividad que está en curso en ese momento, que se ejecutará cuando se resuelva la actividad en curso
			client.on('add activity first', function (data){
				var new_act = new Activity(data,[],self.activeGames[client.room].currentLocation.currentActivity);
				if (typeof self.activeGames[client.room].currentLocation.currentActivity != 'undefined'){
					self.activeGames[client.room].currentLocation.currentActivity.addSubActivityFirst(new_act);
				}
			});

			client.on('cancel scheduled', function (data){
				self.activeGames[client.room].currentLocation.currentActivity.subactivities = [];
				self.activeGames[client.room].currentLocation.currentActivity.currentSubactivity = 0;
			});

			//Se resuleve una actividad
			client.on('resolve activity', function (data){
				if (!self.activeGames[client.room].blockResolve || (typeof(data)!= 'undefined' && typeof(data.unblockable)!= 'undefined' && data.unblockable)){
					self.activeGames[client.room].resolveActivity(client);
				}

			});

			client.on('repeat activity', function (data){
					self.activeGames[client.room].repeatActivity(client);
			});

			//Se resuleve una actividad
			client.on('log message', function (data){		
				io.to(client.room).emit('log message', {'msg' : data.msg, 'mode':data.mode});
			});

			client.on('user connected', function (data){
				client.in(client.room).broadcast.emit('user connected', {'alias' : client.alias, 'id': client.id});	
			});

			//Llenar encuesta
			client.on('fill survey', function (data){		
				self.userSchema.findOne({ 'local.userID' : client.userID }, function(err, user){
					if (err){
						return err;
					}
					if (user){
						//guardar resultado de la encuesta
						user.survey.complete = true;
						user.survey.result.up_down = data.result[0];
						user.survey.result.positive_negative =data.result[1];
						user.survey.result.forward_backward= data.result[2];

						user.save(function(err) {
	                            if (err){
	                                throw err;
	                            }
	                    });
					}
				});
			});


			//jugar el tuto
			client.on('play tutorial', function (data){
					var client_obj = {'id' : data.id, 'alias': data.alias, 'userID':client.userID};
					var game_to_join = self.createNewGame(client_obj).id;
					self.disconnectClient(client.id);
					//io.to('waiting').emit('new game',{'gameID' : game_to_join, 'creator':data.alias});				
					//client.leave('waiting');	//Dejar la lista de espera
					client.room = game_to_join;	//Setear la room del juego
					client.player = self.activeGames[client.room].getPlayerByID(client.id);
					self.activeGames[client.room].isActive = true;
					//encuentro el esquema de juego en la DB y lo cargo al juego
					var currentConfig = {};
					for (i in self.activeGames[client.room].players){
						self.activeGames[client.room].players[i].ready = true;
						self.activeGames[client.room].players[i].playing = true;
					}
					self.configSchema.findOne({}, function(err, config){
						if (err){
							return err;

						}
						if (config){
								//evitar el guardado de informacion redundante (lista de players, etc)
									var configs = config.configs;
									var found = false;
									var i=0;
									while (!found && i<configs.length){
										if (configs[i].configName == "tutorial"){	//hardcodeo test "tutorial" = config.currentConfig
											found = true;			
										}
										else{
											i++;
										}
									}
									if (found){
										self.activeGames[client.room].start(configs[i]);	
										var players = self.activeGames[client.room].players;
										for (i in players){
											io.to(players[i].id).emit('ready to start');
										}
									}
						}
					});

					client.in('waiting').broadcast.emit('user disconnect',{ 'alias' : client.alias});

			});

			//Mensajes de poll
			client.on('new poll', function (data){
				io.to(client.room).emit('log message', {'msg' : client.alias+" ha elaborado una propuesta para la decisión común.", 'mode':'alert'});
				self.activeGames[client.room].currentPoll.votes = [];
				self.activeGames[client.room].currentPoll.actions = data.actions;
				self.activeGames[client.room].currentPoll.poller = client.alias;
				if (self.activeGames[client.room].getAlivePlayers().length>1){
					self.activeGames[client.room].currentPoll.votes.push({'alias': client.alias, 'agree': true});
					var alive = self.activeGames[client.room].getAlivePlayers();
					for (i in alive){
						io.to(alive[i].id).emit('new poll',data);
					}
					
				}
				else{
					io.to(self.activeGames[client.room].activePlayer.id).emit('emit and resolve', {'actions': self.activeGames[client.room].currentPoll.actions});
				}

			});	

			//Mensajes de poll
			client.on('poll vote', function (data){
				self.activeGames[client.room].currentPoll.votes.push({'alias': client.alias, 'agree': data.agree});
				if (data.agree){
					io.to(client.room).emit('log message', {'msg' : client.alias+" ha votado positivo a la propuesta de "+self.activeGames[client.room].currentPoll.poller+". ", 'mode':'upvote'});
				}
				else{
					io.to(client.room).emit('log message', {'msg' : client.alias+" ha votado negativo a la propuesta de "+self.activeGames[client.room].currentPoll.poller+". ", 'mode':'downvote'});
				}
				
				//Si ya se recabaron todos los votos, se ve que se hace
				if (self.activeGames[client.room].currentPoll.votes.length == self.activeGames[client.room].getAlivePlayers().length){
					var votes = self.activeGames[client.room].currentPoll.votes;
					var yays = 0;
					var nays = 0; 
					var agreement =false;
					for (i in votes){
						if (votes[i].agree){
							yays++;
						}
						else{
							nays++;
						}
					}
					if (yays >= Math.ceil(self.activeGames[client.room].agreementFactor*votes.length)){
						agreement = true;
						io.to(client.room).emit('log message', {'msg' : "La propuesta de "+self.activeGames[client.room].currentPoll.poller+" ha sido aprobada, por "+yays+" votos positivos contra "+nays+" negativos.", 'mode':'alert'});
						io.to(self.activeGames[client.room].activePlayer.id).emit('emit and resolve', {'actions': self.activeGames[client.room].currentPoll.actions});
					}
					else{
						io.to(client.room).emit('log message', {'msg' : "La propuesta de "+self.activeGames[client.room].currentPoll.poller+" no ha sido aprobada, por "+yays+" votos positivos contra "+nays+" negativos. Deberá elaborar otra propuesta. ", 'mode':'alert'});
						io.to(self.activeGames[client.room].activePlayer.id).emit('repeat activity');
					}

				//guardo la poll en al accion en la db
					self.gameSchema.findOne({ 'gameID' : client.room }, function(err, game){
						if (err){
							return err;
						}
						if (game){
								//guardo la poll en la actividad
								var item = game.gameActions[game.gameActions.length-1];
								game.gameActions.splice(game.gameActions.length-1,1);
								item['poll'] = {
									'poller' : self.activeGames[client.room].currentPoll.poller,
									'votes' : self.activeGames[client.room].currentPoll.votes,
									'agreement' : agreement
								};

								game.gameActions.push(item);
								game.save(function(err) {
		                            if (err){
		                                throw err;
		                            }
		                    	});
						}
					});
				}
			});	



			//Se desconecto un usuario
			client.on('disconnect', function (){
				var disconnectedAlias = self.disconnectClient(client.id).alias;
				if (client.room!="waiting"){
					if (!self.activeGames[client.room].ended){
					//reveer todo esto
						if (self.activeGames[client.room].activePlayer != null && self.activeGames[client.room].activePlayer.alias == client.alias){
							client.in(client.room).broadcast.emit('player disconnect', { 'update' : {'action' : 'EndGame', 'success':false, 'reason': "¡El jugador activo se ha desconectado!"}});
							self.activeGames[client.room].asyncAck = false;
						}
						else if(self.activeGames[client.room].ringBearer != null && self.activeGames[client.room].ringBearer.alias == client.alias){
							client.in(client.room).broadcast.emit('player disconnect',{ 'update' : {'action' : 'EndGame', 'success':false, 'reason': "¡El portador del Anillo se ha desconectado!"}});
							self.activeGames[client.room].asyncAck = false;
						}
						else if (self.activeGames[client.room].activePlayer != null && typeof(self.activeGames[client.room].currentLocation.currentActivity)!= "undefined" && self.activeGames[client.room].currentLocation.currentActivity.data.player == client.alias){
							io.to(self.activeGames[client.room].activePlayer.id).emit('player disconnect',{ 'update' : {'action' : 'KillPlayer', 'alias':client.alias, 'reason': "¡Se ha desconectado de la partida!"}});
							io.to(self.activeGames[client.room].activePlayer.id).emit('force resolve');
							self.activeGames[client.room].asyncAck = false;
						}
						else{
							io.to(self.activeGames[client.room].activePlayer.id).emit('player disconnect',{ 'update' : {'action' : 'KillPlayer', 'alias':client.alias, 'reason': "¡Se ha desconectado de la partida!"}});
							self.activeGames[client.room].asyncAck = false;
						}
					}
				}
				else{
					client.in(client.room).broadcast.emit('user disconnect',{ 'alias' : client.alias});
				}
			});

		});
	} 

	return ClientManager;

});