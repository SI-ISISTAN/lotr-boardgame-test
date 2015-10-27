define(['https://code.jquery.com/jquery-1.8.3.js'], function(jquery){

	var defaultConfig  = null;
	var configs = {};
	var currentConfig = "";
	var configurationChanged = false;
	var newconfig =  {
            "configName": "newConfig",
            "isTutorial": false,
            "sauronPosition": 15,
            "hobbitPosition": 0,
            "showAdvice": true,
            "gandalfCards": [],
            "storyTiles": [],
            "hobbitCards": [],
            "locations": []
    };
	var advices = [];
	var users = [];

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

	$("#new-config-button").on('click', function(){
		
		$("#json-area").text(JSON.stringify({
            "configName": "newConfig",
            "isTutorial": false,
            "sauronPosition": 15,
            "hobbitPosition": 0,
            "showAdvice": true,
            "gandalfCards": [],
            "storyTiles": [],
            "hobbitCards": [],
            "locations": []},null, 4));
    	$("#config-select").append('<option value='+newconfig.configName+'>'+newconfig.configName+'</option>');
    	$("#config-select").val(newconfig.configName);
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
				$.post( "/changeconfig", {'config' : json.configName, 'data': json}, function( data ) {
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

	$("#advice-change-button").on('click', function(){
		var json = null;
		var valid = true;
		var reason = "";
		try{
			json = JSON.parse($("#advice-area").val());
		}
		catch(err){
			valid=false;
			alert("La recomendación tiene un formato inválido. Chequear el formato del documento.")
		}
		//chequeos de validez
		if (valid){
			//ver cuales son los datos que hay que pasarle si o si al advice
			$.post( "/changeadvice", {'id' : json._id, 'data': json}, function( data ) {
				if (data.success){
					alert("Configuracion modificada con éxito.");
					location.reload();
				}
			});
		}
		else{
			alert(reason);
		}

	});

	$("#users-change-button").on('click', function(){
		var json = null;
		var valid = true;
		var reason = "";
		try{
			json = JSON.parse($("#users-area").val());
		}
		catch(err){
			valid=false;
			alert("La recomendación tiene un formato inválido. Chequear el formato del documento.")
		}
		//chequeos de validez
		if (valid){
			//ver cuales son los datos que hay que pasarle si o si al advice
			$.post( "/changeuserjson", {'id' : json._id, 'data': json}, function( data ) {
				if (data.success){
					alert("Usuario modificado con éxito.");
					location.reload();
				}
			});
		}
		else{
			alert(reason);
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

	$("#save-advice-button").on('click', function(){
		var up_down = {
			comparison : "ignore",
			value: 0
		};
		var positive_negative = {
			comparison : "ignore",
			value: 0
		};
		var forward_backward = {
			comparison : "ignore",
			value: 0
		};
		//chequear si los checkboxes estan activados o no
		if ($("#forward-backward-check").prop('checked')){
			if (!isNaN(parseInt($("#forward-backward-value").val()))){
				forward_backward.comparison = $("#forward-backward-comparison").val();		
				forward_backward.value = $("#forward-backward-value").val();
			}			
		}
		if ($("#up-down-check").prop('checked')){
			if (!isNaN(parseInt($("#up-down-value").val()))){
				up_down.comparison = $("#up-down-comparison").val();
				up_down.value = $("#up-down-value").val();
			}	
			
		}
		if ($("#positive-negative-check").prop('checked')){
			if (!isNaN(parseInt($("#positive-negative-value").val()))){
				positive_negative.comparison = $("#positive-negative-comparison").val();
				positive_negative.value = $("#positive-negative-value").val();
			}
				
		}
		var conditions = {
			'up_down' : up_down,
			'positive_negative' : positive_negative,
			'forward_backward' : forward_backward
		};
		$.post( "/saveadvice", {'type' : $("#type-select").val(), 'name': $("#name-select").val() , 'text': $("#advice_text").val(), 'explicit': true, 'conditions' : conditions }, function( data ) {
					if (data.success){
						alert("Nueva recomendacion agregada con éxito.");
						location.reload();
					}
		});
	});

	$("#edit-select").on('change', function(){
		if ($("#edit-select").val() == "configs"){
			$("#auth-row").show();
			$("#advice-row").hide();
			$("#users-row").hide();
		}
		else if ($("#edit-select").val() == "advices"){
			$("#auth-row").hide();
			$("#advice-row").show();
			$("#users-row").hide();
		}
		else if ($("#edit-select").val() == "users"){
			$("#auth-row").hide();
			$("#advice-row").hide();
			$("#users-row").show();
		}
	});

	$("#type-select").on('change', function(){
		if ($("#type-select").val() == "Location"){
			$('#name-select').find('option').remove();
			$('#name-select').append('<option value = "Bag End"> Bag End </option><option value = "Rivendell"> Rivendell </option><option value = "Moria"> Moria </option><option value = "Lothlorien"> Lothlorien </option><option value = "Helms Deep"> Helms Deep </option><option value = "Shelobs Lair">Shelobs Lair </option><option value = "Mordor">Mordor </option>');
		}
		else if ($("#type-select").val() == "Card"){
			$('#name-select').find('option').remove();
			$('#name-select').append('<option value = "Miruvor"> Sabor del Encuentro </option><option value = "Staff"> Bastón </option><option value = "Athelas"> Hierbabuena </option><option value = "Elessar"> Amuleto </option><option value = "Lembas"> Alimento </option><option value = "Mithril">Armadura </option><option value = "Phial"> Vial </option> <option value = "Belt"> Cinturón </option>');
		}
		else if ($("#type-select").val() == "Activity"){
			$('#name-select').find('option').remove();
			$('#name-select').append('<option value = "Gandalf"> Gandalf </option><option value = "Preparations"> Preparations </option><option value = "Nazgul Appears"> Monstruo Aparece </option><option value = "Elrond"> Elrond </option><option value = "Council"> Consejo </option><option value = "Fellowship">Comunidad </option><option value = "SpeakFriend"> Habla, Amigo </option> <option value = "WaterWatcher"> Vigilante en el Agua </option> <option value = "WellStone"> Pidra del Pozo </option><option value = "Trapped"> Atrapados </option><option value = "OrcsAttack"> Bestias Atacan </option><option value = "FlyFools"> ¡Huyan, tontos! </option><option value = "Galardiel"> Visita de la Dama </option><option value = "Recovery"> Recuperación </option><option value = "GalardielTest"> Prueba de la Dama </option> <option value = "WormTongue"> Traiciones </option> <option value = "RohanMen"> Tiranos Tembal </option><option value = "OrcsGate"> Las Bestias Atacan </option><option value = "OrthancFire"> Incendio en la Torre </option><option value = "StormForward"> La Carga de las Bestias </option><option value = "OrcsConquer"> Las Bestias Triunfan </option><option value = "Gollum">Sin Defensa </option><option value = "DeadFaces"> Caras de los Muertos </option> <option value = "ForbiddenPool"> Prueba de lo Prohibido </option> <option value = "NazgulRing"> Esbirro Busca el Anillo </option><option value = "ShelobAppear"> Aparece el Monstruo </option><option value = "ShelobAttack"> El Monstruo Ataca </option><option value = "SamSaveFrodo"> Salvación </option><option value = "LordAttack"> La Carga del Enemigo </option><option value = "PelennorFields"> Batalla Final </option><option value = "SauronMouth"> La Entrada Oscura </option> <option value = "Sorrounded"> Acorralados </option><option value = "RingIsMine"> La Muerte </option>');
		}
		else if ($("#type-select").val() == "User"){
			$('#name-select').find('option').remove();
			$('#name-select').append('<option value = "Todos"> Todos los usuarios que cumplan con las condiciones </option>');
		}
	});

	$("#advice-selector").on('change', function(){
		$("#advice-area").val(JSON.stringify(advices[parseInt($("#advice-selector").val())],null, 4));
	});

	$("#users-selector").on('change', function(){
		$("#users-area").val(JSON.stringify(users[parseInt($("#users-selector").val())],null, 4));
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
	    $.get( "/getadvices", function( data ) {
			advices = data.advices;
			var j=0;
			while (j < advices.length){
				$("#advice-selector").append('<option value='+j+'>'+j+'</option>')
				j++;
			}
			if (advices.length>0){
				$("#advice-area").val(JSON.stringify(advices[0],null, 4));
			}
	    });
	    $.get( "/getallusers", function( data ) {
			users = data.users;
			var j=0;
			while (j < users.length){
				$("#users-selector").append('<option value='+j+'>'+j+'</option>')
				j++;
			}
			if (users.length>0){
				$("#users-area").val(JSON.stringify(users[0],null, 4));
			}
	    });

	});

});