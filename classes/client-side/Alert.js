define([], function () {

//crear e instanciar popup
	function Alert(text){
		var popup = $('<div/>', {
						    'class': "alert-dialog",
							'html': '<p>'+text+'</p> ',
							dialogClass : 'alert-dialog' 
						});
		    
		popup.dialog({
				dialogClass : 'no-close',
				hide: {
					effect: "explode",
					duration: 1000
				}
		});
		$(".ui-dialog-titlebar").hide(); 

		//$("#.ui-dialog").css('background-color','orange');
	}

	return Alert;

});