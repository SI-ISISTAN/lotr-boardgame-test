define(['../classes/client-side/Popup'], function (Popup) {

	var exports = {

		//Cartas genéricas, con un simbolo que permite avanzar en una pista
		"Generic" : {
			phase : "playCards",
			apply : function (game,player,data){
				data['valid'] = game.currentLocation.validTracks;
				if (game.currentLocation.tracks[this.symbol] == null){
					data['canMove']=false;
				}
				else {
					data['canMove']=true;
				}
			},
			draw : function(client, data){
				var self=this;
				if (this.symbol=="Hiding" || this.symbol=="Friendship" || this.symbol=="Fighting" || this.symbol=="Travelling"){
					var i=0;
					while (i<this.amount){
						//Me fijo si la pista existe
						if (data.canMove){
							client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : this.symbol, 'amount' : 1 });
						}
						i++;
					}
					client.socket.emit('resolve activity');
				}
				else if (this.symbol=="Joker"){
					var popup = new Popup({title: "Avanzar en una pista", text: "La carta jugada es un comodín, por lo cual debes elegir una pista en la cual avanzar tantos espacios como símbolos haya en la carta.",buttons : [{name : "Ok", id:"ok"}], visibility : "active"});
							//pongo los elementos de reparto de cada carta
							var div = $("<div>  </div>");
							var el = $("<div id='advance-div'>  </div> ");
							var listbox = $("<select id='move-track-selector'> </select>");
							//Agrego los tracks por los que puedo avanzar
							for (i in data.valid){
								$(listbox).append("<option value='"+data.valid[i].name+"'> "+data.valid[i].text+"</option>");
							}			
							$(el).append($(listbox));
							div.append(el);	
							popup.append(div);
							//cuando me dan ok envio cada carta al jugador correspondiente
							popup.addListener("ok", function(){
									$("#move-track-selector").each(function(){
										var to = $(this).val();
										var j=0;
										while (j<self.amount){
											client.socket.emit('add activity', {'action' : 'MoveTrack', 'trackName' : to, 'amount' : 1 });

											j++;
										}
										client.socket.emit('resolve activity');
									});
							$("#move-track-selector").remove();
							popup.close();
							});

						popup.draw(client);
				}
			
			}
		}

	};

	return exports;

});