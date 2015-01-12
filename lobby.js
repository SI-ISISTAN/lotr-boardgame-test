  var socket = io();  //habilito el socketo
   ////////////////////////////////////////// FUNCIONES VARIAS /////////////////////////////////////////////////////

  $(document).ready(function(){ 

      console.log("JQuery Init");

      ////////////////////////////////////////// MANEJO DE MENSAJES /////////////////////////////////////////////////////
  		
      require(['./classes/Client'], function(Client){

          //Mensaje de bienvenida con parámetros inciales
        	socket.on('hello message', function(res){
            var c = new Client();
            c.listen(socket);      
        	});

      });




  });