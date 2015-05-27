
define([], function () {

	var exports = {};
	
	exports.names = ["Platón","Sócrates","Aristóteles","Parménides","Pirrón","Hume","Locke","Descartes","Berkeley","Aquino","Adorno","Hegel","Kant","Marx","Mill","Heidegger","Kirkegaard","Feuerbach","Nietzsche","Leibniz","Hobbes","Rosseau","Wittgenstein","Arendt","Rand","Sartre"];

	exports.chatColors = ["#24FC2F", "#E09AFF", "#7BD6FF", "#FF2B7C", "#FF9543"]; 

	exports.consoleColor = "#FCF34B";

	//muy probablemente haya que pasarlo a un archivo de configuracion
	exports.constants = {
		"PLAYER_MINIMUM" : 2
	};

	exports.characters = [{
			name: "Gorch",
			image: "frodo",
			//aca tendria que ir su habilidad especial
		},
		{
			name: "Murch",
			image: "sam",
			//aca tendria que ir su habilidad especial
		},
		{
			name: "Tronch",
			image: "merry",
			//aca tendria que ir su habilidad especial
		},
		{
			name: "Litch",
			image: "pippin",
			//aca tendria que ir su habilidad especial
		},
		{
			name: "Furch",
			image: "fatty",
			//aca tendria que ir su habilidad especial
		}];
		
	exports.worldPositions=[{x:110, y:0},{x:93, y:-38},{x:93, y:0},{x:70, y:28},{x:70, y:-38},{x:60, y:40}];

	exports.storyTiles = ["Friendship","Friendship","Friendship","Travelling","Travelling","Travelling","Hiding","Hiding","Hiding","Fighting","Fighting","Fighting","Next Event","Next Event","Next Event","Next Event","Next Event","Next Event","Ring Influence","Ring Influence","Sauron Will"];


	//en la DB

	/*
	"storyTiles" : [ 
                "Friendship", 
                "Friendship", 
                "Friendship", 
                "Travelling", 
                "Travelling", 
                "Travelling", 
                "Hiding", 
                "Hiding", 
                "Hiding", 
                "Fighting", 
                "Fighting", 
                "Fighting", 
                "Next Event", 
                "Next Event", 
                "Next Event", 
                "Next Event", 
                "Next Event", 
                "Next Event", 
                "Ring Influence", 
                "Ring Influence", 
                "Sauron Will", 
                "Out Of Options", 
                "Losing Ground"
            ],
	*/
	exports.hobbitCards = [];

	for (var i=0; i<7; i++){
		exports.hobbitCards.push({symbol : "Fighting", color : "White", image:"fight_card_white", amount:1});
		exports.hobbitCards.push({symbol : "Friendship", color : "White", image:"friend_card_white", amount:1});
		exports.hobbitCards.push({symbol : "Hiding", color : "White", image:"hiding_card_white", amount:1});
		exports.hobbitCards.push({symbol : "Travelling", color : "White", image:"travel_card_white", amount:1});
	}
	for (var i=0; i<5; i++){
		exports.hobbitCards.push({symbol : "Fighting", color : "Gray", image:"fight_card_gray", amount:1});
		exports.hobbitCards.push({symbol : "Friendship", color : "Gray", image:"friend_card_gray", amount:1});
		exports.hobbitCards.push({symbol : "Hiding", color : "Gray", image:"hiding_card_gray", amount:1});
		exports.hobbitCards.push({symbol : "Travelling", color : "Gray", image:"travel_card_gray", amount:1});
	}
	for (var i=0; i<12; i++){
		exports.hobbitCards.push({symbol : "Joker", color : "None", image:"joker_card", amount:1});
	}

	exports.gandalfCards = [{name: "Previsión", description: "El jugador activo puede ver los 3 eventos del tope de la pila y reordenarlos como desee."}, {name: "Guía", description: "El jugador activo puede mover dos espacios en la pista que desee."}, {name: "Sanación", description:"El jugador activo puede mover a su aventurero dos espacios hacia atrás en la Línea de Corrupción."}, {name: "Magia", description: "El jugador activo puede evitar la ejecución del próximo evento, sea quien sea que lo active."}, {name: "Persistencia", description: "El jugador activo puede sacar 4 cartas del mazo."}];

	return exports;
});