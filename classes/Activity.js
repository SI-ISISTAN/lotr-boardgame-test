define(['../data/activities'], function (activities) {

	function Activity(data, subactivities, parent){

		this.name = data.action;
		this.data = data;
		this.parent = null;
		this.subactivities = [];
		this.draw = null;
		this.apply = null;
		this.currentSubActivity = 0;
		this.description=null;
		this.title = null;
		for (i in subactivities){
			this.subactivities.push(new Activity (subactivities[i], subactivities[i].subactivities, this));
		}
		//Busco la actividad con este nombre en activities, eventTiles
		if (activities[this.name] != null){
			this.draw = activities[this.name].draw;
			this.apply = activities[this.name].apply;
			if (typeof activities[this.name].description != 'undefined'){
				this.description = activities[this.name].description;
			}
			if (typeof activities[this.name].title != 'undefined'){
				this.title = activities[this.name].title;
			}
		}
		if (parent!=null){
			this.parent = parent;
		}

	}

	//agregar parámetros
	Activity.prototype.setData = function(data){
		this.data = data;
	}

	//agregar subactividad
	Activity.prototype.addSubActivity = function(subactivity){
		this.subactivities.push(subactivity);
	}

	Activity.prototype.setParent = function(parent){
		this.parent = parent;
	}

	//completar la siguiente subactividad
	Activity.prototype.next = function(){
		//console.log("La actividad "+this.name+" retorna una subactividad");
		if (this.currentSubActivity < this.subactivities.length){	//si quedan sub-actividades
			var ret = this.subactivities[this.currentSubActivity];
			this.currentSubActivity++;
			//console.log("Retorno la subactividad: "+ this.subactivities[this.currentSubActivity-1].name + ", numero "+(this.currentSubActivity-1));
			return ret
		}
		else{
			if (this.parent!=null){
				//console.log("Retorno el padre, que es "+this.parent.name);
				return this.parent.next();
			}

			else {
				return null;}
		}
	}

	Activity.prototype.end = function(client){
		if (client.isActivePlayer()){
			//client.socket.emit('update game', {'action' : 'ResolveActivity', 'name' : this.name});	//si no, emito que la termine
			client.socket.emit('update game', {'action' : 'ResolveActivity', 'name' : this.name});	//si no, emito que la termine
		}
	};

	Activity.prototype.newActivity = function(data, subactivities, parent){	//"contructor" ayuda para evitar dependencias circulares
		return new Activity(data, subactivities, parent);
	}

	Activity.prototype.logEventInfo = function(game,player){
		game.io.to(player.room).emit('log message', {'msg' : "El jugador activo debe resolver el evento: '"+this.title+"'.", 'mode':'alert'});
		game.io.to(player.room).emit('log message', {'msg' : this.description, 'mode':'info'});
	}

	return Activity;

});