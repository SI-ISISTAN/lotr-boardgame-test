
define([], function () {

	var exports = {};
	
	exports.names = ["Maradona", "Zidane", "Ruggeri", "Passarella", "Ronaldo", "Rivaldo","Cafú", "Kempes", "Burruchaga", "Bertoni", "Tostao", "Sócrates", "Beckenbauer", "Maldini", "Kluivert", "Roberto Carlos","Cantona","Baresi","Pirlo","Valderrama","Higuita"];

	exports.chatColors = ["#24FC2F", "#E09AFF", "#7BD6FF", "#FF2B7C", "#FF9543"]; 

	exports.consoleColor = "#FCF34B";

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

	exports.storyTiles = ["Hiding","Hiding","Hiding","Friendship","Friendship","Friendship","Travelling","Travelling","Travelling","Fighting","Fighting","Fighting","Next Event","Next Event","Next Event","Next Event","Next Event","Next Event","Ring Influence","Ring Influence","Sauron Will","Out Of Options","Losing Ground"];

	return exports;
});