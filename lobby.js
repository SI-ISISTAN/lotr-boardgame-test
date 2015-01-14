
   ////////////////////////////////////////// FUNCIONES VARIAS /////////////////////////////////////////////////////

require(['./classes/Client'], function(Client){

    var socket = io();  //habilito el socketo

    $(document).ready(function(){ 

        console.log("JQuery Init");
            //Mensaje de bienvenida con parámetros inciales
        socket.on('hello message', function(res){
              var c = new Client();
              c.listen(socket);      
          	});

      });

  });