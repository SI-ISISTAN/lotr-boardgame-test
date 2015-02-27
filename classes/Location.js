define(['./Track','./Card'], function (Track, Card) {

	function Location(location){
		this.name = location.name;
		this.image = location.image;
		this.tracks={};
		this.events=[];
		this.isConflict = location.isConflict;
		this.activities = location.activities;
		this.currentActivity = location.activities[0];
		this.currentEvent = 0;
		this.featureCards = [];
		this.validTracks = [];
		for (i in location.featureCards){
			var card = new Card(location.featureCards[i]);
			this.featureCards.push(card);
		}
		this.shuffleArray(this.featureCards);
		for (i in location.validTracks){
			this.validTracks.push(location.validTracks[i]);
		}
		//Cargar los event tiles
		for (var key in location.tracks) {
			if (location.tracks[key] != null){
	 	 		this.tracks[key] = new Track(location.tracks[key]);
			}
			else{
				this.tracks[key] = null; 
			}
		}
		for (i in location.events){
			this.events.push(location.events[i]);
		}
	}

	Location.prototype.isTrackComplete = function(track){
		if (this.tracks[track].position == this.tracks[track].spaces.length){
			return true;
		}
		else{
			return false;
		}
	}

	Location.prototype.shuffleArray = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex ;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}

	return Location;

});