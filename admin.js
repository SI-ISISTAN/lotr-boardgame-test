define(['https://code.jquery.com/jquery-1.8.3.js'], function(jquery){

	var defaultConfig  = null;
	var configs = {};
	var currentConfig = "";
	var configurationChanged = false;
	var newconfig = {};

	$("#config-select").on('change', function(){
		var name = $("#config-select").val();
		var found = false;
		var i=0;
		while (!found && i<configs.length){
			if (configs[i].configName == name){
				found=true;
				currentConfig = name;
				$("#json-area").val(JSON.stringify(configs[i],null, 4));
			}
			i++;
		}
		if (!found){
		}
	});

	$("#default-select").on('change', function(){
		var name = $("#default-select").val();
		$("#default-change-button").prop("disabled",false);
	});

	$("#config-change-button").on('click', function(){
		var json = null;
		var valid = true;
		var reason = "";
		try{
			json = JSON.parse($("#json-area").val());
		}
		catch(err){
			valid=false;
			alert("La configuración tiene un formato inválido. Chequear el formato del documento.")
		}
		//chequeos de validez
		if (valid){
			if (json.sauronPosition < 0 || json.sauronPosition > 15){
				valid = false;
				reason = "La posición inicial de Sauron debe estar entre 0 y 15.";
			}
			if (json.hobbitPosition < 0 || json.hobbitPosition > 15){
				valid = false;
				reason = "La posición inicial de los Hobbits debe estar entre 0 y 15.";
			}
			if (json.hobbitPosition >= json.sauronPosition){
				valid = false;
				reason = "La posición inicial de los Hobbits debe ser menor o igual a la de Sauron";
			}
			if (valid){
				$.post( "/changeconfig", {'config' : currentConfig, 'data': json}, function( data ) {
					if (data.success){
						alert("Configuracion modificada con éxito.");
						location.reload();
					}
				});
			}
			else{
				alert(reason);
			}
		}
	});

	$("#default-change-button").on('click', function(){
		$.post( "/changedefault", {'default' : $("#default-select").val()}, function( data ) {
					if (data.success){
						alert("Configuracion por defecto cambiada con éxito.");
						location.reload();
					}
		});
	});

	$("#new-config-button").on('click', function(){
		currentConfig="newconfig";
		$("#config-select").append('<option value= "newconfig">newconfig</option>');
		$("#config-select").val("newconfig");
		newconfig = {
            "configName" : "newconfig",
            "isTutorial" : false,
            "sauronPosition" : 15,
            "hobbitPosition" : 0,
            "gandalfCards" : [],
            "storyTiles" : [],
            "hobbitCards" : [],
            "locations" : []
        };
        $("#json-area").val(JSON.stringify(newconfig,null, 4));

	});

	$(document).ready(function(){
		$.get( "/getconfigs", function( data ) {
			configs = data.configs;
			defaultConfig = data.default;
	     	 currentConfig = data.configs[0].configName;
	     	 for (i in configs){
	     	 	$("#default-select").append('<option value='+configs[i].configName+'>'+configs[i].configName+'</option>');
	     	 	$("#config-select").append('<option value='+configs[i].configName+'>'+configs[i].configName+'</option>');
	     	}
	     	$("#default-select").val(defaultConfig);
	      	$("#json-area").text(JSON.stringify(configs[0],null, 4));
	    });

	});

});