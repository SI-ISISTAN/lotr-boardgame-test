
define([], function () {
	
	var names = ["Maradona", "Zidane", "Ruggeri", "Passarella", "Ronaldo", "Rivaldo","Cafú", "Kempes", "Burruchaga", "Bertoni", "Toastao", "Sócrates", "Beckenbauer", "Maldini", "Kluivert", "Roberto Carlos","Cantona","Baresi","Pirlo","Valderrama","Higuita"];

	var chatColors = ["#24FC2F", "#AD24FC", "#7BD6FF", "#FF2B7C", "#FF9543"]; 

	var consoleColor = "#FCF34B";

	var constants = {
		"PLAYER_MINIMUM" : 2
	};

	return {
		'names': names,
		'chatColors': chatColors,
		'constants' : constants
	};
});