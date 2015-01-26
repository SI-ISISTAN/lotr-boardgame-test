define(['../data/activities'], function (activities) {

	function Activity(name, subactivities, parent){
		this.name = name;
		this.parent = null;
		this.subactivities = [];
		this.draw = null;
		this.apply = null;
		this.data = {};
		this.currentSubActivity = 0;
		for (i in subactivities){
			this.subactivities.push(new Activity (subactivities[i], subactivities[i].subactivities, this));
		}
		if (activities[this.name] != null){
			this.draw = activities[this.name].draw;
			this.apply = activities[this.name].apply;
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

	//completar la siguiente subactividad
	Activity.prototype.next = function(){

		if (this.currentSubActivity < this.subactivities.length){	//si quedan sub-actividades
			this.currentSubActivity++;
			return this.subactivities[this.currentSubActivity-1];
		}
		else{
			if (this.parent!=null){
				console.log("Retorno el padre de la actividad: "+ this.name);
				return this.parent;
			}
		}
	}

	Activity.prototype.end = function(client){
		if (client.isActivePlayer()){
			client.socket.emit('update game', {'action' : 'ResolveActivity', 'name' : this.name});	//si no, emito que la termine
		}
	};

	Activity.prototype.newActivity = function(name, subactivities, parent){	//"contructor" ayuda para evitar dependencias circulares
		return new Activity(name, subactivities, parent);
	}

	return Activity;

});