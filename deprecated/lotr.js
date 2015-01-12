   var socket = io();  //habilito el socketo

  $(document).ready(function(){ 

      console.log("JQuery Init");

      var quest_deck = [1,2,3,4,5,6,7,8,9,3,3,,4,,4,5,3,3,54,3,2,2,3,3,2,2,2,2,2,2,2,2,2,2,6,3,5,3,5,23,5,2];
      var cartas = ["hola", "chu", "pala", "wacha"];
      var mensajes = [{user: 'Rolfi Montenegro', color:'D61616', text: "Bienvenido a lotr!"},{user: 'Pencogol', color:'0D4AD8', text: "Está andando!!!!"}, {user: 'Juguete Pisano', color:'EBF831', text: "ohhhh seeee!"}];

      for (i in cartas){
      	$("#player-cards-container").append("<img src='./assets/img/images2/CARD H INV BACK.png' alt='Tablero maestro' class='player-card-img img-responsive'>")
      }

      for (i in mensajes){
      	$(".chat-messages-div").append('<p class="chat-message"> <b style= "color: #'+mensajes[i].color+';"> '+ mensajes[i].user +': </b>'+ mensajes[i].text+' </p>');
      }

      
      $(".player-state-div").first().addClass("is-active");

	
  });