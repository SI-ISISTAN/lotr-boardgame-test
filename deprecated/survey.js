	var schemas = require('./routes/schemas.js');

	$(document).ready(function(){

			$("input:radio").on('click', function(){
				if (!$('div.question-div:not(:has(:radio:checked))').length) {
				    $("#send-survey-button").prop('disabled',false);
				}
			});

			$("#send-survey-button").on('click', function(){
				var result = [0,0,0];
				$('input:checked').each(function(){
						var val = JSON.parse($(this).val());
						var i=0;
						while (i < 3){
							result[i] += val[i];
							i++;
						}
				});
				console.log(result);
			});
	});

