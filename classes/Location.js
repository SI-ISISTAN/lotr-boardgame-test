define(['./Track'], function (Track) {

	function Location(location){
		this.name = location.name;
		this.image = location.image;
		this.tracks={};
		this.events=location.events;
		this.isConflict = location.isConflict;
		this.activities = location.activities;
		this.currentActivity = location.activities[0];
		this.featureCards = [];
		this.validTracks = [];
		for (i in location.featureCards){
			this.featureCards.push(location.featureCards[i]);
		}
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
	}

	return Location;

});