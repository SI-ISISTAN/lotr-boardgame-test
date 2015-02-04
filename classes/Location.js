define([], function () {

	function Location(location){
		this.name = location.name;
		this.image = location.image;
		this.tracks=location.tracks;
		this.events=location.events;
		this.isConflict = location.isConflict;
		this.activities = location.activities;
		this.currentActivity = location.activities[0];
		this.featureCards = [];
		for (i in location.featureCards){
			this.featureCards.push(location.featureCards[i]);
		}
	}

	return Location;

});