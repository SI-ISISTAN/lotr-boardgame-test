define([], function () {

	function Track(track){
		this.position = track.position;
		this.startX = track.startX;
		this.startY = track.startY;
		this.isMain = track.isMain;
		this.spaces = track.spaces;
	};

	return Track;

});