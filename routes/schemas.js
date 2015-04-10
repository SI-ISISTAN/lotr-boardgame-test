var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
//Ejemplo ser eliminado de forma impiadosa

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'sfsdfdsohidfs' });
console.log("aloha");
kitty.save(function (err) {
	
  	if (err){
  		console.log('meow');
	}else{
		console.log("chu chu wa");
	}
});