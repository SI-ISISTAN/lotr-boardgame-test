
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

	exports.hobbitCards = [];
	for (var i=0; i<7; i++){
		exports.hobbitCards.push({symbol : "Fighting", color : "White", image:"fight_card_white"});
		exports.hobbitCards.push({symbol : "Friendship", color : "White", image:"friend_card_white"});
		exports.hobbitCards.push({symbol : "Hiding", color : "White", image:"hiding_card_white"});
		exports.hobbitCards.push({symbol : "Travelling", color : "White", image:"travel_card_white"});
	}
	for (var i=0; i<5; i++){
		exports.hobbitCards.push({symbol : "Fighting", color : "Gray", image:"fight_card_gray"});
		exports.hobbitCards.push({symbol : "Friendship", color : "Gray", image:"friend_card_gray"});
		exports.hobbitCards.push({symbol : "Hiding", color : "Gray", image:"hiding_card_gray"});
		exports.hobbitCards.push({symbol : "Travelling", color : "Gray", image:"travel_card_gray"});
	}
	for (var i=0; i<12; i++){
		exports.hobbitCards.push({symbol : "Joker", color : "None", image:"joker_card"});
	}

	return exports;
});